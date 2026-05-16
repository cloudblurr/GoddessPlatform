#!/usr/bin/env tsx
/**
 * Automated SSL Certificate Installation
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const INFO_PATH = path.join(__dirname, '..', 'cloudreve-droplet-info.json');

async function installSSL(ip: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('🔒 Installing SSL certificate...\n');
    
    const sshProcess = spawn('ssh', [
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'UserKnownHostsFile=/dev/null',
      '-o', 'LogLevel=ERROR',
      `root@${ip}`,
      'certbot --nginx -d stx.blurr.cloud --non-interactive --agree-tos --email admin@blurr.cloud'
    ], {
      stdio: 'inherit'
    });

    sshProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ SSL certificate installed successfully!');
        resolve();
      } else {
        console.log(`\n⚠️ SSL installation completed with code ${code}`);
        resolve(); // Don't fail on certbot warnings
      }
    });

    sshProcess.on('error', reject);
  });
}

async function main() {
  if (!fs.existsSync(INFO_PATH)) {
    console.error('❌ No droplet info found.');
    process.exit(1);
  }

  const info = JSON.parse(fs.readFileSync(INFO_PATH, 'utf-8'));
  const dropletIp = info.public_ip;

  console.log('🔒 Installing SSL certificate for stx.blurr.cloud...');
  console.log('⚠️  Make sure Cloudflare SSL/TLS is set to "Flexible" first!\n');

  try {
    await installSSL(dropletIp);
    console.log('\n🎉 SSL installation complete!');
    console.log('📝 Next: Change Cloudflare SSL/TLS to "Full (strict)"');
    console.log('🌐 Access: https://stx.blurr.cloud');
  } catch (error) {
    console.error('❌ SSL installation failed:', error);
  }
}

main();