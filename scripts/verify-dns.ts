#!/usr/bin/env tsx
/**
 * DNS Verification Helper
 * Checks if stx.blurr.cloud is properly pointing to the droplet IP
 */

import * as dns from 'dns';
import * as fs from 'fs';
import * as path from 'path';

const SUBDOMAIN = 'stx.blurr.cloud';

async function checkDNS(): Promise<void> {
  console.log('🔍 Checking DNS configuration for', SUBDOMAIN);
  console.log('─'.repeat(60));

  // Load droplet info if available
  const infoPath = path.join(__dirname, '..', 'cloudreve-droplet-info.json');
  let expectedIP: string | null = null;

  if (fs.existsSync(infoPath)) {
    const info = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
    expectedIP = info.public_ip;
    console.log(`📍 Expected IP: ${expectedIP}`);
  }

  // Resolve DNS
  return new Promise((resolve, reject) => {
    dns.resolve4(SUBDOMAIN, (err, addresses) => {
      if (err) {
        console.log('\n❌ DNS Resolution Failed');
        console.log(`   Error: ${err.message}`);
        console.log('\n💡 This means:');
        console.log('   - DNS record not yet configured, OR');
        console.log('   - DNS hasn\'t propagated yet (wait 5-10 minutes)');
        
        if (expectedIP) {
          console.log('\n📝 Configure your DNS:');
          console.log(`   Type: A`);
          console.log(`   Name: stx`);
          console.log(`   Value: ${expectedIP}`);
          console.log(`   TTL: 300`);
        }
        
        process.exit(1);
      }

      console.log(`✅ DNS Resolved: ${addresses.join(', ')}`);

      if (expectedIP) {
        if (addresses.includes(expectedIP)) {
          console.log('✅ DNS is correctly pointing to your droplet!');
          console.log('\n🎉 You can now install SSL certificate:');
          console.log(`   ssh root@${expectedIP}`);
          console.log(`   certbot --nginx -d ${SUBDOMAIN}`);
        } else {
          console.log(`⚠️  DNS is pointing to ${addresses[0]}, but expected ${expectedIP}`);
          console.log('   Please update your DNS record.');
        }
      } else {
        console.log('✅ DNS is configured');
        console.log('   (No droplet info found to verify against)');
      }

      resolve();
    });
  });
}

checkDNS().catch(console.error);
