#!/usr/bin/env tsx
/**
 * Cloudflare SSL Management via API
 * Automatically configures SSL/TLS settings for stx.blurr.cloud
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

const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const DOMAIN = 'blurr.cloud';
const SUBDOMAIN = 'stx.blurr.cloud';

interface CloudflareResponse {
  success: boolean;
  errors: any[];
  messages: any[];
  result?: any;
}

function cfRequest(method: string, endpoint: string, data?: any): Promise<CloudflareResponse> {
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

async function getZoneId(): Promise<string> {
  console.log(`🔍 Finding zone ID for ${DOMAIN}...`);
  
  const response = await cfRequest('GET', `/client/v4/zones?name=${DOMAIN}`);
  
  if (!response.result || response.result.length === 0) {
    throw new Error(`Zone ${DOMAIN} not found`);
  }

  const zoneId = response.result[0].id;
  console.log(`✓ Zone ID: ${zoneId}`);
  return zoneId;
}

async function getCurrentSSLSetting(zoneId: string): Promise<string> {
  console.log('📊 Getting current SSL/TLS setting...');
  
  const response = await cfRequest('GET', `/client/v4/zones/${zoneId}/settings/ssl`);
  
  if (response.success && response.result) {
    const currentSetting = response.result.value;
    console.log(`✓ Current SSL/TLS mode: ${currentSetting}`);
    return currentSetting;
  } else {
    throw new Error('Failed to get SSL setting');
  }
}

async function setSSLMode(zoneId: string, mode: 'flexible' | 'full' | 'strict'): Promise<void> {
  console.log(`🔧 Setting SSL/TLS mode to: ${mode}...`);
  
  await cfRequest('PATCH', `/client/v4/zones/${zoneId}/settings/ssl`, {
    value: mode
  });
  
  console.log(`✅ SSL/TLS mode set to: ${mode}`);
}

async function checkDNSRecord(zoneId: string): Promise<boolean> {
  console.log(`🔍 Checking DNS record for ${SUBDOMAIN}...`);
  
  const response = await cfRequest('GET', `/client/v4/zones/${zoneId}/dns_records?name=${SUBDOMAIN}&type=A`);
  
  if (response.result && response.result.length > 0) {
    const record = response.result[0];
    console.log(`✓ DNS A record found: ${SUBDOMAIN} → ${record.content}`);
    console.log(`✓ Proxied: ${record.proxied ? 'Yes' : 'No'}`);
    return true;
  } else {
    console.log(`❌ No DNS A record found for ${SUBDOMAIN}`);
    return false;
  }
}

async function main() {
  const mode = process.argv[2] as 'flexible' | 'full' | 'strict' | 'status';
  
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║              Cloudflare SSL Manager                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (!CF_API_TOKEN) {
    console.error('❌ CLOUDFLARE_API_TOKEN not found in .env file');
    process.exit(1);
  }

  if (!mode || !['flexible', 'full', 'strict', 'status'].includes(mode)) {
    console.log('Usage:');
    console.log('  npm run cf:ssl flexible  # Set to Flexible (for initial setup)');
    console.log('  npm run cf:ssl strict    # Set to Full (strict) (after SSL cert)');
    console.log('  npm run cf:ssl status    # Check current settings');
    process.exit(1);
  }

  try {
    // Get zone ID
    const zoneId = await getZoneId();
    
    // Check DNS record
    await checkDNSRecord(zoneId);
    
    // Get current SSL setting
    const currentMode = await getCurrentSSLSetting(zoneId);
    
    if (mode === 'status') {
      console.log('\n📊 Current Status:');
      console.log(`   SSL/TLS Mode: ${currentMode}`);
      console.log(`   Domain: ${SUBDOMAIN}`);
      console.log(`   Zone: ${DOMAIN}`);
      return;
    }
    
    // Set new SSL mode if different
    if (currentMode !== mode) {
      await setSSLMode(zoneId, mode);
      
      console.log('\n⏳ Waiting for changes to propagate (30 seconds)...');
      await new Promise(resolve => setTimeout(resolve, 30000));
      
      // Verify the change
      const newMode = await getCurrentSSLSetting(zoneId);
      if (newMode === mode) {
        console.log(`✅ SSL/TLS mode successfully changed to: ${mode}`);
      } else {
        console.log(`⚠️  SSL/TLS mode is: ${newMode} (expected: ${mode})`);
      }
    } else {
      console.log(`✓ SSL/TLS mode is already set to: ${mode}`);
    }
    
    console.log('\n🎯 Next Steps:');
    if (mode === 'flexible') {
      console.log('1. Install SSL certificate: npm run install:ssl');
      console.log('2. Set to strict mode: npm run cf:ssl strict');
      console.log('3. Access: https://stx.blurr.cloud');
    } else if (mode === 'strict') {
      console.log('1. Access: https://stx.blurr.cloud');
      console.log('2. Login with admin credentials');
      console.log('3. Create OAuth2 app');
      console.log('4. Update .env: npm run update:env');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();