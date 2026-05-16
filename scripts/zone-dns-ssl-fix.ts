#!/usr/bin/env tsx
/**
 * Fix DNS and SSL using zone-scoped API calls
 * Token has dns_records:edit and ssl:edit on zone level
 */

import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

const env = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf-8');
env.split('\n').forEach(l => {
  const m = l.match(/^([^#=]+)=(.*)/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
});

const token = process.env.CLOUDFLARE_API_TOKEN!;
const ZONE_ID = '60c0f4249ea04c6ca67b176f5b391fda';
const NEW_IP = '134.122.121.232';

function cfReq(method: string, endpoint: string, data?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      port: 443,
      path: endpoint,
      method,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
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

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║           Zone-Scoped DNS & SSL Fix                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log(`🎯 New IP: ${NEW_IP}\n`);

  // Step 1: List all DNS records using zone-scoped endpoint
  console.log('🔍 Listing DNS records...');
  const list = await cfReq('GET', `/client/v4/zones/${ZONE_ID}/dns_records?per_page=100`);
  
  if (!list.success) {
    console.log('❌ Cannot list DNS records:', JSON.stringify(list.errors));
    return;
  }

  console.log('Current records:');
  list.result.forEach((r: any) => {
    console.log(`  ${r.name} → ${r.content} (proxied: ${r.proxied}) [${r.id}]`);
  });

  // Step 2: Update/create A records for blurr.cloud and stx.blurr.cloud
  const targets = ['blurr.cloud', 'stx.blurr.cloud'];
  
  for (const target of targets) {
    const existing = list.result.find((r: any) => r.name === target && r.type === 'A');
    const shortName = target === 'blurr.cloud' ? '@' : 'stx';
    
    if (existing) {
      console.log(`\n🔧 Updating ${target}...`);
      const res = await cfReq('PUT', `/client/v4/zones/${ZONE_ID}/dns_records/${existing.id}`, {
        type: 'A',
        name: shortName,
        content: NEW_IP,
        ttl: 300,
        proxied: false  // DNS only - no Cloudflare proxy
      });
      console.log(res.success ? `✅ ${target} → ${NEW_IP} (proxy OFF)` : `❌ Failed: ${JSON.stringify(res.errors)}`);
    } else {
      console.log(`\n🔧 Creating ${target}...`);
      const res = await cfReq('POST', `/client/v4/zones/${ZONE_ID}/dns_records`, {
        type: 'A',
        name: shortName,
        content: NEW_IP,
        ttl: 300,
        proxied: false
      });
      console.log(res.success ? `✅ ${target} → ${NEW_IP} (proxy OFF)` : `❌ Failed: ${JSON.stringify(res.errors)}`);
    }
  }

  // Step 3: Set SSL to flexible using zone-scoped endpoint
  console.log('\n🔒 Setting SSL/TLS to flexible...');
  const sslRes = await cfReq('PATCH', `/client/v4/zones/${ZONE_ID}/settings/ssl`, { value: 'flexible' });
  console.log(sslRes.success ? '✅ SSL set to flexible' : `❌ SSL failed: ${JSON.stringify(sslRes.errors)}`);

  console.log('\n⏳ Waiting 30 seconds for DNS propagation...');
  await new Promise(r => setTimeout(r, 30000));

  // Step 4: Test direct IP access
  console.log('\n🧪 Testing direct IP access...');
  await new Promise<void>(resolve => {
    const req = https.request({ hostname: NEW_IP, port: 80, path: '/', method: 'HEAD' }, res => {
      console.log(`Direct IP response: ${res.statusCode}`);
      resolve();
    });
    req.on('error', err => { console.log('Direct IP error:', err.message); resolve(); });
    req.setTimeout(5000);
    req.end();
  });

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    NEXT STEP                               ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log('DNS is updated. Now run:');
  console.log('   npm run fix:droplet');
  console.log('\nThis will install Cloudreve + Nginx on the fresh droplet.');
  console.log(`\nDirect access (no DNS needed): http://${NEW_IP}:5212`);
}

main().catch(console.error);