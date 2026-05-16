#!/usr/bin/env tsx
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

const env = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf-8');
env.split('\n').forEach(l => {
  const m = l.match(/^([^#=]+)=(.*)/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
});

const token = process.env.CLOUDFLARE_API_TOKEN!;

function cfReq(method: string, endpoint: string): Promise<any> {
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
    req.end();
  });
}

async function main() {
  console.log('🔍 Checking what this token can access...\n');

  // Check token details
  const tokenInfo = await cfReq('GET', '/client/v4/user/tokens/verify');
  console.log('Token verify:', JSON.stringify(tokenInfo, null, 2));

  // Try listing zones (we know this works)
  const zones = await cfReq('GET', '/client/v4/zones?name=blurr.cloud');
  if (zones.success) {
    const zone = zones.result[0];
    console.log('\n✅ Zone access works');
    console.log('Zone permissions:', zone.permissions);
  }
}

main().catch(console.error);