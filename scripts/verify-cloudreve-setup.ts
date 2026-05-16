#!/usr/bin/env tsx
/**
 * Verify Cloudreve Setup Status
 * 
 * This script checks:
 * 1. Cloudflare DNS configuration
 * 2. Cloudflare SSL settings
 * 3. Droplet status and IP
 * 4. HTTP/HTTPS connectivity
 * 5. Cloudreve service status
 * 
 * Usage: npx tsx scripts/verify-cloudreve-setup.ts
 */

import * as https from 'https';
import * as http from 'http';
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

// Configuration
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const DO_API_TOKEN = process.env.DIGITALOCEAN_API_KEY;
const SUBDOMAIN = 'stx.blurr.cloud';
const MAIN_DOMAIN = 'blurr.cloud';
const ZONE_ID = 'c08ec4594091cc1873b26470316f876c';
const DROPLET_IP = '161.35.10.22';

/**
 * Make HTTPS request to Cloudflare API
 */
function cfRequest(method: string, endpoint: string, data?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      port: 443,
      path: `/client/v4${endpoint}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CF_API_TOKEN}`,
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
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

/**
 * Make HTTPS request to DigitalOcean API
 */
function doRequest(method: string, endpoint: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.digitalocean.com',
      port: 443,
      path: endpoint,
      method: method,
      headers: {
        'Authorization': `Bearer ${DO_API_TOKEN}`,
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
    req.end();
  });
}

/**
 * Test HTTP connectivity
 */
function testHTTP(url: string): Promise<{ status: number; headers: any }> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { timeout: 5000 }, (res) => {
      resolve({ status: res.statusCode || 0, headers: res.headers });
      res.on('data', () => {}); // Drain response
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

/**
 * Check DNS configuration
 */
async function checkDNS(): Promise<void> {
  console.log('\n📍 DNS Configuration:');
  console.log('─'.repeat(50));

  try {
    const records = await cfRequest('GET', `/zones/${ZONE_ID}/dns_records?name=stx.${MAIN_DOMAIN}`);
    
    const aRecord = records.result.find((r: any) => r.name === SUBDOMAIN && r.type === 'A');

    if (aRecord) {
      console.log(`✓ A Record: ${aRecord.name}`);
      console.log(`  IP: ${aRecord.content}`);
      console.log(`  Proxied: ${aRecord.proxied ? 'Yes (Orange Cloud)' : 'No (Gray Cloud)'}`);
      console.log(`  TTL: ${aRecord.ttl}`);
      
      if (aRecord.content === DROPLET_IP) {
        console.log(`  ✓ IP matches droplet IP`);
      } else {
        console.log(`  ⚠️  IP mismatch! Expected: ${DROPLET_IP}, Got: ${aRecord.content}`);
      }
    } else {
      console.log(`❌ A Record not found for ${SUBDOMAIN}`);
    }
  } catch (error) {
    console.error(`❌ Error checking DNS:`, error);
  }
}

/**
 * Check SSL configuration
 */
async function checkSSL(): Promise<void> {
  console.log('\n🔒 SSL Configuration:');
  console.log('─'.repeat(50));

  try {
    const sslSettings = await cfRequest('GET', `/zones/${ZONE_ID}/settings/ssl`);
    console.log(`✓ SSL Mode: ${sslSettings.result.value}`);
    
    if (sslSettings.result.value === 'flexible') {
      console.log(`  ✓ Set to Flexible (allows HTTP backend)`);
    } else if (sslSettings.result.value === 'full') {
      console.log(`  ✓ Set to Full (requires valid SSL on backend)`);
    } else if (sslSettings.result.value === 'full_strict') {
      console.log(`  ✓ Set to Full Strict (requires valid SSL on backend)`);
    }
  } catch (error) {
    console.error(`❌ Error checking SSL:`, error);
  }
}

/**
 * Check droplet status
 */
async function checkDroplet(): Promise<void> {
  console.log('\n💾 Droplet Status:');
  console.log('─'.repeat(50));

  try {
    const droplets = await doRequest('GET', '/v2/droplets?name=cloudreve-stx-blurr');
    
    if (droplets.droplets && droplets.droplets.length > 0) {
      const droplet = droplets.droplets[0];
      console.log(`✓ Droplet: ${droplet.name}`);
      console.log(`  Status: ${droplet.status}`);
      console.log(`  Region: ${droplet.region.slug}`);
      console.log(`  Size: ${droplet.size.slug}`);
      
      const publicIP = droplet.networks.v4.find((n: any) => n.type === 'public')?.ip_address;
      console.log(`  IP: ${publicIP}`);
      
      if (publicIP === DROPLET_IP) {
        console.log(`  ✓ IP matches expected IP`);
      }
    } else {
      console.log(`❌ Droplet not found`);
    }
  } catch (error) {
    console.error(`❌ Error checking droplet:`, error);
  }
}

/**
 * Check HTTP connectivity
 */
async function checkConnectivity(): Promise<void> {
  console.log('\n🌐 Connectivity Tests:');
  console.log('─'.repeat(50));

  // Test HTTP to IP
  try {
    const result = await testHTTP(`http://${DROPLET_IP}`);
    console.log(`✓ HTTP to IP (${DROPLET_IP}): ${result.status}`);
  } catch (error) {
    console.log(`❌ HTTP to IP (${DROPLET_IP}): ${error}`);
  }

  // Test HTTP to domain
  try {
    const result = await testHTTP(`http://${SUBDOMAIN}`);
    console.log(`✓ HTTP to domain (${SUBDOMAIN}): ${result.status}`);
  } catch (error) {
    console.log(`❌ HTTP to domain (${SUBDOMAIN}): ${error}`);
  }

  // Test HTTPS to domain
  try {
    const result = await testHTTP(`https://${SUBDOMAIN}`);
    console.log(`✓ HTTPS to domain (${SUBDOMAIN}): ${result.status}`);
  } catch (error) {
    console.log(`❌ HTTPS to domain (${SUBDOMAIN}): ${error}`);
  }
}

/**
 * Check Cloudreve service
 */
async function checkCloudreve(): Promise<void> {
  console.log('\n🚀 Cloudreve Service:');
  console.log('─'.repeat(50));

  try {
    const result = await testHTTP(`http://${DROPLET_IP}:5212`);
    console.log(`✓ Cloudreve service (port 5212): ${result.status}`);
  } catch (error) {
    console.log(`❌ Cloudreve service (port 5212): ${error}`);
  }

  try {
    const result = await testHTTP(`http://${SUBDOMAIN}`);
    if (result.status === 200 || result.status === 301 || result.status === 302) {
      console.log(`✓ Cloudreve via Nginx proxy: ${result.status}`);
    }
  } catch (error) {
    console.log(`❌ Cloudreve via Nginx proxy: ${error}`);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        Cloudreve Setup Verification                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  if (!CF_API_TOKEN || !DO_API_TOKEN) {
    console.error('\n❌ Error: Missing API tokens in .env');
    console.error('   Required: CLOUDFLARE_API_TOKEN, DIGITALOCEAN_API_KEY');
    process.exit(1);
  }

  try {
    await checkDNS();
    await checkSSL();
    await checkDroplet();
    await checkConnectivity();
    await checkCloudreve();

    console.log('\n' + '═'.repeat(50));
    console.log('\n📋 Summary:');
    console.log(`   Domain: ${SUBDOMAIN}`);
    console.log(`   Droplet IP: ${DROPLET_IP}`);
    console.log(`   Zone ID: ${ZONE_ID}`);
    console.log('\n💡 If tests are failing:');
    console.log(`   1. Check DNS propagation: nslookup ${SUBDOMAIN}`);
    console.log(`   2. SSH into droplet: ssh root@${DROPLET_IP}`);
    console.log(`   3. Check services: systemctl status cloudreve nginx`);
    console.log(`   4. View logs: journalctl -u cloudreve -f`);
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Error during verification:');
    console.error(error);
    process.exit(1);
  }
}

main();
