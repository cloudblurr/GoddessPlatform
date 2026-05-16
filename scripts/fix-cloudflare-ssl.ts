#!/usr/bin/env tsx
/**
 * Fix Cloudflare SSL/TLS mode to make site work
 */

import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        value = value.replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_FULL_TOKEN;

function cfRequest(method: string, endpoint: string, data?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      port: 443,
      path: endpoint,
      method: method,
      headers: {
        'Authorization': `Bearer ${CF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function fixSSLMode(): Promise<void> {
  console.log('🔧 Fixing Cloudflare SSL/TLS mode...');
  
  // Get zone ID
  const zoneResponse = await cfRequest('GET', '/client/v4/zones?name=blurr.cloud');
  if (!zoneResponse.success || !zoneResponse.result.length) {
    throw new Error('Zone not found');
  }
  
  const zoneId = zoneResponse.result[0].id;
  console.log(`✓ Zone ID: ${zoneId}`);
  
  // Get current SSL setting
  const sslResponse = await cfRequest('GET', `/client/v4/zones/${zoneId}/settings/ssl`);
  if (sslResponse.success) {
    console.log(`📊 Current SSL mode: ${sslResponse.result.value}`);
  }
  
  // Set to flexible
  console.log('🔧 Setting SSL/TLS to Flexible...');
  const updateResponse = await cfRequest('PATCH', `/client/v4/zones/${zoneId}/settings/ssl`, {
    value: 'flexible'
  });
  
  if (updateResponse.success) {
    console.log('✅ SSL/TLS set to Flexible');
  } else {
    throw new Error(`Failed to update SSL: ${JSON.stringify(updateResponse.errors)}`);
  }
  
  // Wait for propagation
  console.log('⏳ Waiting for changes to propagate (30 seconds)...');
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  // Test the site
  console.log('🧪 Testing site access...');
  
  return new Promise((resolve, reject) => {
    const testReq = https.request('https://stx.blurr.cloud', { method: 'HEAD' }, (res) => {
      console.log(`📊 Site response: ${res.statusCode}`);
      if (res.statusCode && res.statusCode < 400) {
        console.log('✅ Site is now accessible!');
        resolve();
      } else {
        console.log(`⚠️  Site returned ${res.statusCode}, but SSL mode is fixed`);
        resolve();
      }
    });
    
    testReq.on('error', (err) => {
      console.log('⚠️  Site test failed, but SSL mode is set to Flexible');
      resolve();
    });
    
    testReq.end();
  });
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║              Fix Cloudflare SSL Mode                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (!CF_API_TOKEN) {
    console.error('❌ No Cloudflare API token found in .env file');
    process.exit(1);
  }

  try {
    await fixSSLMode();
    
    console.log('\n🎉 SSL mode fixed!');
    console.log('🌐 Try accessing: https://stx.blurr.cloud');
    console.log('🔍 If still not working, run: npm run diagnose:droplet');
    
  } catch (error) {
    console.error('\n❌ Failed to fix SSL mode:', error);
    console.log('\n💡 Manual fix:');
    console.log('1. Go to Cloudflare Dashboard → blurr.cloud');
    console.log('2. SSL/TLS → Overview');
    console.log('3. Set to "Flexible"');
    console.log('4. Wait 30 seconds');
    console.log('5. Try https://stx.blurr.cloud');
  }
}

main();