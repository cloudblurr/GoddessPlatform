#!/usr/bin/env tsx
/**
 * Get droplet access information
 */

import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env file
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

const DO_API_TOKEN = process.env.DIGITALOCEAN_API_KEY;
const INFO_PATH = path.join(__dirname, '..', 'cloudreve-droplet-info.json');

function doRequest(method: string, endpoint: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.digitalocean.com',
      port: 443,
      path: endpoint,
      method: method,
      headers: {
        'Content-Type': 'application/json',
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

async function main() {
  console.log('🔍 Checking droplet access information...\n');

  if (!fs.existsSync(INFO_PATH)) {
    console.error('❌ No droplet info found. Run provision script first.');
    process.exit(1);
  }

  const info = JSON.parse(fs.readFileSync(INFO_PATH, 'utf-8'));
  const dropletId = info.droplet_id;
  const dropletIp = info.public_ip;

  console.log(`Droplet ID: ${dropletId}`);
  console.log(`Droplet IP: ${dropletIp}\n`);

  // Get droplet details
  const droplet = await doRequest('GET', `/v2/droplets/${dropletId}`);
  
  console.log('📋 Access Information:\n');
  console.log('━'.repeat(60));
  
  console.log('\n🔐 SSH Access Options:\n');
  console.log('Option 1: Password Authentication');
  console.log('  DigitalOcean sends the root password to your email');
  console.log('  Check your email for: "Your New Droplet"');
  console.log('  Subject line contains the droplet name\n');
  
  console.log('Option 2: DigitalOcean Console (No password needed!)');
  console.log('  1. Go to: https://cloud.digitalocean.com/droplets');
  console.log(`  2. Click on: ${info.droplet_name}`);
  console.log('  3. Click "Console" button (top right)');
  console.log('  4. This opens a web-based terminal\n');
  
  console.log('Option 3: Reset Root Password');
  console.log('  1. Go to: https://cloud.digitalocean.com/droplets');
  console.log(`  2. Click on: ${info.droplet_name}`);
  console.log('  3. Click "Access" tab');
  console.log('  4. Click "Reset Root Password"');
  console.log('  5. New password will be emailed to you\n');

  console.log('━'.repeat(60));
  console.log('\n💡 Recommended: Use DigitalOcean Console (Option 2)');
  console.log('   It\'s the fastest way to access your droplet!\n');
  
  console.log('Once logged in, run:');
  console.log('  cat /root/cloudreve-setup.txt\n');
}

main().catch(console.error);
