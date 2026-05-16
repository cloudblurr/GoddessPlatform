#!/usr/bin/env tsx
/**
 * Setup DNS A record for stx.blurr.cloud
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
const INFO_PATH = path.join(__dirname, '..', 'cloudreve-droplet-info.json');

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

async function getZoneId(): Promise<string> {
  console.log('🔍 Getting zone ID for blurr.cloud...');
  
  const response = await cfRequest('GET', '/client/v4/zones?name=blurr.cloud');
  
  if (response.success && response.result && response.result.length > 0) {
    const zoneId = response.result[0].id;
    console.log(`✓ Zone ID: ${zoneId}`);
    return zoneId;
  } else {
    throw new Error('Zone not found');
  }
}

async function checkExistingRecord(zoneId: string): Promise<string | null> {
  console.log('🔍 Checking for existing DNS record...');
  
  const response = await cfRequest('GET', `/client/v4/zones/${zoneId}/dns_records?name=stx.blurr.cloud&type=A`);
  
  if (response.success && response.result && response.result.length > 0) {
    const record = response.result[0];
    console.log(`✓ Found existing A record: ${record.content}`);
    return record.id;
  } else {
    console.log('ℹ️  No existing A record found');
    return null;
  }
}

async function createDNSRecord(zoneId: string, ip: string): Promise<void> {
  console.log(`🔧 Creating DNS A record: stx.blurr.cloud → ${ip}...`);
  
  const recordData = {
    type: 'A',
    name: 'stx',
    content: ip,
    ttl: 300,
    proxied: true
  };

  const response = await cfRequest('POST', `/client/v4/zones/${zoneId}/dns_records`, recordData);
  
  if (response.success) {
    console.log('✅ DNS A record created successfully');
  } else {
    throw new Error(`Failed to create DNS record: ${JSON.stringify(response.errors)}`);
  }
}

async function updateDNSRecord(zoneId: string, recordId: string, ip: string): Promise<void> {
  console.log(`🔧 Updating DNS A record: stx.blurr.cloud → ${ip}...`);
  
  const recordData = {
    type: 'A',
    name: 'stx',
    content: ip,
    ttl: 300,
    proxied: true
  };

  const response = await cfRequest('PUT', `/client/v4/zones/${zoneId}/dns_records/${recordId}`, recordData);
  
  if (response.success) {
    console.log('✅ DNS A record updated successfully');
  } else {
    throw new Error(`Failed to update DNS record: ${JSON.stringify(response.errors)}`);
  }
}

async function setSSLMode(zoneId: string, mode: 'flexible' | 'full' | 'strict'): Promise<void> {
  console.log(`🔒 Setting SSL/TLS mode to: ${mode}...`);
  
  const response = await cfRequest('PATCH', `/client/v4/zones/${zoneId}/settings/ssl`, {
    value: mode
  });
  
  if (response.success) {
    console.log(`✅ SSL/TLS mode set to: ${mode}`);
  } else {
    throw new Error(`Failed to set SSL mode: ${JSON.stringify(response.errors)}`);
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                Setup DNS & SSL                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (!CF_API_TOKEN) {
    console.error('❌ CLOUDFLARE_API_TOKEN not found in .env file');
    process.exit(1);
  }

  if (!fs.existsSync(INFO_PATH)) {
    console.error('❌ No droplet info found. Run provision script first.');
    process.exit(1);
  }

  const info = JSON.parse(fs.readFileSync(INFO_PATH, 'utf-8'));
  const dropletIp = info.public_ip;

  console.log(`🎯 Droplet IP: ${dropletIp}`);
  console.log(`🌐 Domain: stx.blurr.cloud\n`);

  try {
    // Get zone ID
    const zoneId = await getZoneId();
    
    // Check for existing DNS record
    const existingRecordId = await checkExistingRecord(zoneId);
    
    if (existingRecordId) {
      // Update existing record
      await updateDNSRecord(zoneId, existingRecordId, dropletIp);
    } else {
      // Create new record
      await createDNSRecord(zoneId, dropletIp);
    }
    
    // Set SSL to flexible for initial setup
    await setSSLMode(zoneId, 'flexible');
    
    console.log('\n⏳ Waiting for DNS propagation (30 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    console.log('\n✅ DNS and SSL setup complete!');
    console.log('\n🎯 Next steps:');
    console.log('1. Run: npm run setup:complete');
    console.log('2. After SSL cert installs, SSL will be set to "Full (strict)"');
    console.log('3. Access: https://stx.blurr.cloud');
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    console.log('\n💡 Manual steps:');
    console.log('1. Add DNS A record in Cloudflare: stx.blurr.cloud → ' + dropletIp);
    console.log('2. Set SSL/TLS to "Flexible"');
    console.log('3. Run: npm run setup:complete');
  }
}

main();