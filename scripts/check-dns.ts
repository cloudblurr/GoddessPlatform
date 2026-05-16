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
const zoneId = '60c0f4249ea04c6ca67b176f5b391fda';
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
  console.log('🔍 Listing all DNS A records...\n');
  
  const list = await cfReq('GET', `/client/v4/zones/${zoneId}/dns_records?type=A&per_page=100`);
  
  if (list.success) {
    console.log('Current DNS records:');
    list.result.forEach((r: any) => {
      console.log(`  ${r.name} → ${r.content} (proxied: ${r.proxied}) [id: ${r.id}]`);
    });
    
    console.log(`\n🔧 Updating all A records to new IP: ${NEW_IP}...`);
    
    for (const record of list.result) {
      if (record.name === 'blurr.cloud' || record.name === 'stx.blurr.cloud') {
        const update = await cfReq('PUT', `/client/v4/zones/${zoneId}/dns_records/${record.id}`, {
          type: 'A',
          name: record.name === 'blurr.cloud' ? 'blurr.cloud' : 'stx',
          content: NEW_IP,
          ttl: 300,
          proxied: record.proxied
        });
        
        if (update.success) {
          console.log(`✅ Updated: ${record.name} → ${NEW_IP}`);
        } else {
          console.log(`❌ Failed ${record.name}: ${JSON.stringify(update.errors)}`);
        }
      }
    }
  } else {
    console.log('❌ Failed to list records:', JSON.stringify(list.errors));
  }
}

main().catch(console.error);