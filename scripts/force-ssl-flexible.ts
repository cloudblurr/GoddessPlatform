#!/usr/bin/env tsx
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

// Load env
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
});

const token = process.env.CLOUDFLARE_API_TOKEN!;
const zoneId = '60c0f4249ea04c6ca67b176f5b391fda';

function cfReq(method: string, endpoint: string, data?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      port: 443,
      path: endpoint,
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
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
  console.log('🔍 Checking current SSL mode...');
  const current = await cfReq('GET', `/client/v4/zones/${zoneId}/settings/ssl`);
  console.log('Current SSL mode:', current.success ? current.result.value : current.errors);

  console.log('\n🔧 Setting SSL to flexible...');
  const update = await cfReq('PATCH', `/client/v4/zones/${zoneId}/settings/ssl`, { value: 'flexible' });
  
  if (update.success) {
    console.log('✅ SSL mode set to: flexible');
  } else {
    console.log('❌ Failed:', JSON.stringify(update.errors));
    
    // Try with different permission approach - check what permissions we have
    console.log('\n🔍 Checking token permissions...');
    const verify = await cfReq('GET', '/client/v4/user/tokens/verify');
    console.log('Token status:', JSON.stringify(verify, null, 2));
  }

  console.log('\n⏳ Waiting 15 seconds for propagation...');
  await new Promise(r => setTimeout(r, 15000));

  // Test the site
  console.log('\n🧪 Testing https://blurr.cloud...');
  await new Promise<void>(resolve => {
    const req = https.request('https://blurr.cloud', { method: 'HEAD' }, res => {
      console.log(`Response: ${res.statusCode} ${res.statusMessage}`);
      if (res.statusCode && res.statusCode < 400) {
        console.log('✅ Site is LIVE!');
      } else {
        console.log(`⚠️  Status: ${res.statusCode}`);
      }
      resolve();
    });
    req.on('error', err => { console.log('Error:', err.message); resolve(); });
    req.setTimeout(10000);
    req.end();
  });
}

main().catch(console.error);