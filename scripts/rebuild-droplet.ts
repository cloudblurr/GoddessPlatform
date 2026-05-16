#!/usr/bin/env tsx
/**
 * Rebuild Droplet - Delete broken droplet and create fresh one
 * Uses minimal cloud-init to avoid package conflicts
 */

import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

const INFO_PATH = path.join(__dirname, '..', 'cloudreve-droplet-info.json');

// Load env
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
});

const DO_TOKEN = process.env.DIGITALOCEAN_API_KEY!;
const CF_TOKEN = process.env.CLOUDFLARE_API_TOKEN!;
const ZONE_ID = '60c0f4249ea04c6ca67b176f5b391fda';

function doReq(method: string, endpoint: string, data?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.digitalocean.com',
      port: 443,
      path: endpoint,
      method,
      headers: { 'Authorization': `Bearer ${DO_TOKEN}`, 'Content-Type': 'application/json' },
    };
    const req = https.request(options, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch { resolve({}); }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

function cfReq(method: string, endpoint: string, data?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      port: 443,
      path: endpoint,
      method,
      headers: { 'Authorization': `Bearer ${CF_TOKEN}`, 'Content-Type': 'application/json' },
    };
    const req = https.request(options, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// Minimal cloud-init - just sets up SSH and basic tools
// We will install everything via our fix:droplet script after
const MINIMAL_CLOUD_INIT = `#!/bin/bash
# Minimal setup - just fix dpkg and prepare system
export DEBIAN_FRONTEND=noninteractive
dpkg --configure -a 2>/dev/null || true
apt-get update -q
apt-get install -f -y -q 2>/dev/null || true
echo "cloud-init-done" > /tmp/ready
`;

async function deleteOldDroplet(dropletId: number): Promise<void> {
  console.log(`🗑️  Deleting broken droplet (ID: ${dropletId})...`);
  await doReq('DELETE', `/v2/droplets/${dropletId}`);
  console.log('✅ Old droplet deleted');
  await sleep(5000);
}

async function createFreshDroplet(): Promise<any> {
  console.log('🚀 Creating fresh droplet...');
  
  const response = await doReq('POST', '/v2/droplets', {
    name: 'cloudreve-blurr',
    region: 'nyc1',
    size: 's-2vcpu-4gb',
    image: 'ubuntu-22-04-x64',
    user_data: MINIMAL_CLOUD_INIT,
    tags: ['cloudreve', 'goddess-platform'],
    monitoring: true,
  });

  const droplet = response.droplet;
  console.log(`✅ Droplet created! ID: ${droplet.id}`);
  return droplet;
}

async function waitForActive(dropletId: number): Promise<string> {
  console.log('⏳ Waiting for droplet to become active...');
  
  for (let i = 0; i < 60; i++) {
    const res = await doReq('GET', `/v2/droplets/${dropletId}`);
    const droplet = res.droplet;
    
    if (droplet.status === 'active' && droplet.networks.v4.length > 0) {
      const ip = droplet.networks.v4.find((n: any) => n.type === 'public')?.ip_address;
      if (ip) {
        console.log(`✅ Droplet active! IP: ${ip}`);
        return ip;
      }
    }
    process.stdout.write('.');
    await sleep(5000);
  }
  throw new Error('Timeout waiting for droplet');
}

async function updateDNS(ip: string): Promise<void> {
  console.log(`\n🔧 Updating DNS: blurr.cloud → ${ip}...`);
  
  // Check existing record
  const existing = await cfReq('GET', `/client/v4/zones/${ZONE_ID}/dns_records?name=blurr.cloud&type=A`);
  
  if (existing.success && existing.result?.length > 0) {
    const id = existing.result[0].id;
    const res = await cfReq('PUT', `/client/v4/zones/${ZONE_ID}/dns_records/${id}`, {
      type: 'A', name: 'blurr.cloud', content: ip, ttl: 300, proxied: false
    });
    console.log(res.success ? '✅ DNS updated (proxy OFF - direct connection)' : `❌ DNS update failed: ${JSON.stringify(res.errors)}`);
  } else {
    const res = await cfReq('POST', `/client/v4/zones/${ZONE_ID}/dns_records`, {
      type: 'A', name: 'blurr.cloud', content: ip, ttl: 300, proxied: false
    });
    console.log(res.success ? '✅ DNS created (proxy OFF - direct connection)' : `❌ DNS create failed: ${JSON.stringify(res.errors)}`);
  }

  // Also update stx subdomain
  const stxExisting = await cfReq('GET', `/client/v4/zones/${ZONE_ID}/dns_records?name=stx.blurr.cloud&type=A`);
  if (stxExisting.success && stxExisting.result?.length > 0) {
    const id = stxExisting.result[0].id;
    await cfReq('PUT', `/client/v4/zones/${ZONE_ID}/dns_records/${id}`, {
      type: 'A', name: 'stx', content: ip, ttl: 300, proxied: false
    });
    console.log('✅ stx.blurr.cloud DNS updated');
  }
}

async function saveInfo(dropletId: number, ip: string): Promise<void> {
  const info = {
    droplet_id: dropletId,
    droplet_name: 'cloudreve-blurr',
    public_ip: ip,
    region: 'nyc1',
    size: 's-2vcpu-4gb',
    subdomain: 'blurr.cloud',
    created_at: new Date().toISOString(),
    status: 'active',
    domain: 'blurr.cloud',
    access_url: `https://${ip}`,
    note: 'Cloudflare proxy is OFF - access via IP or direct domain'
  };
  
  fs.writeFileSync(INFO_PATH, JSON.stringify(info, null, 2));
  
  // Update .env
  const envPath = path.join(__dirname, '..', '.env');
  let env = fs.readFileSync(envPath, 'utf-8');
  
  const updates: Record<string, string> = {
    'CLOUDREVE_BASE_URL': `http://${ip}:5212`,
    'CLOUDREVE_AUTHORIZE_URL': `http://${ip}:5212/session/authorize`,
    'CLOUDREVE_TOKEN_URL': `http://${ip}:5212/api/v4/session/oauth/token`,
    'CLOUDREVE_REFRESH_URL': `http://${ip}:5212/api/v4/session/token/refresh`,
    'CLOUDREVE_USERINFO_URL': `http://${ip}:5212/api/v4/session/oauth/userinfo`,
  };
  
  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(env)) {
      env = env.replace(regex, `${key}="${value}"`);
    } else {
      env += `\n${key}="${value}"`;
    }
  }
  
  fs.writeFileSync(envPath, env);
  console.log('✅ .env updated with direct IP access');
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║              Rebuild Fresh Droplet                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const info = JSON.parse(fs.readFileSync(INFO_PATH, 'utf-8'));
  
  try {
    // Step 1: Delete broken droplet
    await deleteOldDroplet(info.droplet_id);
    
    // Step 2: Create fresh droplet
    const droplet = await createFreshDroplet();
    
    // Step 3: Wait for it to be active
    const ip = await waitForActive(droplet.id);
    
    // Step 4: Update DNS
    await updateDNS(ip);
    
    // Step 5: Save info
    await saveInfo(droplet.id, ip);
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ DROPLET READY!                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log(`🌐 New Droplet IP: ${ip}`);
    console.log(`📍 DNS: blurr.cloud → ${ip} (proxy OFF)`);
    console.log('\n⏳ Wait 2 minutes for cloud-init to finish, then run:');
    console.log('   npm run fix:droplet');
    console.log('\nThis will install Cloudreve + Nginx cleanly on the fresh droplet.');
    console.log(`\n🔑 SSH: ssh root@${ip}`);
    console.log('   (password from DigitalOcean email)');
    
  } catch (error) {
    console.error('\n❌ Error:', error);
  }
}

main();