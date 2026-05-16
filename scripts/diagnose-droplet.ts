#!/usr/bin/env tsx
/**
 * Diagnose droplet connectivity issues
 */

import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

const INFO_PATH = path.join(__dirname, '..', 'cloudreve-droplet-info.json');

function httpRequest(url: string): Promise<number> {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
      resolve(res.statusCode || 0);
    });
    
    req.on('error', () => resolve(0));
    req.on('timeout', () => {
      req.destroy();
      resolve(0);
    });
    
    req.end();
  });
}

async function main() {
  console.log('🔍 Diagnosing Cloudreve Droplet...\n');

  if (!fs.existsSync(INFO_PATH)) {
    console.error('❌ No droplet info found.');
    process.exit(1);
  }

  const info = JSON.parse(fs.readFileSync(INFO_PATH, 'utf-8'));
  const ip = info.public_ip;
  const domain = info.subdomain;

  console.log(`Droplet IP: ${ip}`);
  console.log(`Domain: ${domain}\n`);
  console.log('━'.repeat(60));

  // Test direct IP access
  console.log('\n1️⃣  Testing direct IP access (HTTP)...');
  const ipStatus = await httpRequest(`http://${ip}`);
  if (ipStatus > 0) {
    console.log(`✓ HTTP on IP responding: ${ipStatus}`);
  } else {
    console.log('❌ No response from IP (Nginx might not be running)');
  }

  // Test domain access
  console.log('\n2️⃣  Testing domain access (HTTP)...');
  const httpStatus = await httpRequest(`http://${domain}`);
  if (httpStatus > 0) {
    console.log(`✓ HTTP on domain responding: ${httpStatus}`);
  } else {
    console.log('❌ No response from domain (DNS or Nginx issue)');
  }

  // Test HTTPS
  console.log('\n3️⃣  Testing HTTPS...');
  const httpsStatus = await httpRequest(`https://${domain}`);
  if (httpsStatus > 0) {
    console.log(`✓ HTTPS responding: ${httpsStatus}`);
  } else {
    console.log('❌ HTTPS not responding (SSL not installed yet)');
  }

  console.log('\n━'.repeat(60));
  console.log('\n📋 Diagnosis:\n');

  if (ipStatus === 0) {
    console.log('❌ PROBLEM: Droplet not responding');
    console.log('   Possible causes:');
    console.log('   - Cloud-init still running (wait 5-10 minutes)');
    console.log('   - Nginx not installed or not running');
    console.log('   - Cloudreve not running');
    console.log('\n   FIX: SSH into droplet and run:');
    console.log(`   ssh root@${ip}`);
    console.log('   Then copy and run the fix script (see below)');
  } else if (httpStatus === 0) {
    console.log('❌ PROBLEM: DNS not configured correctly');
    console.log('   FIX: Check your DNS settings in Cloudflare');
    console.log(`   Should have: stx.blurr.cloud → ${ip}`);
  } else if (httpsStatus === 0) {
    console.log('⚠️  HTTP working, but HTTPS not configured');
    console.log('   This is normal before SSL installation');
    console.log('\n   NEXT STEP: Install SSL certificate');
    console.log(`   ssh root@${ip}`);
    console.log('   certbot --nginx -d stx.blurr.cloud');
  } else {
    console.log('✅ Everything looks good!');
    console.log(`   Access Cloudreve at: https://${domain}`);
  }

  console.log('\n━'.repeat(60));
  console.log('\n🔧 Fix Script:\n');
  console.log('1. SSH into your droplet:');
  console.log(`   ssh root@${ip}\n`);
  console.log('2. Download and run the fix script:');
  console.log('   wget https://raw.githubusercontent.com/your-repo/fix-cloudreve-deployment.sh');
  console.log('   bash fix-cloudreve-deployment.sh\n');
  console.log('   OR manually run these commands:\n');
  console.log('   # Check cloud-init status');
  console.log('   cloud-init status\n');
  console.log('   # Check Cloudreve status');
  console.log('   systemctl status cloudreve\n');
  console.log('   # Check Nginx status');
  console.log('   systemctl status nginx\n');
  console.log('   # View Cloudreve logs');
  console.log('   journalctl -u cloudreve -n 50\n');

  console.log('\n💡 Cloudflare 521 Error Fix:\n');
  console.log('If you see error 521 in Cloudflare:');
  console.log('1. Go to SSL/TLS settings in Cloudflare');
  console.log('2. Set encryption mode to "Flexible" temporarily');
  console.log('3. After certbot installs SSL, change to "Full (strict)"\n');
}

main().catch(console.error);
