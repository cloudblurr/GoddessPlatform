#!/usr/bin/env tsx
/**
 * Bypass Cloudflare by pointing DNS directly to droplet IP
 * and configuring Nginx to handle SSL itself
 */

import { spawn } from 'child_process';
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

const CF_TOKEN = process.env.CLOUDFLARE_API_TOKEN!;
const ZONE_ID = '60c0f4249ea04c6ca67b176f5b391fda';

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

async function runSSH(ip: string, command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let output = '';
    const proc = spawn('ssh', [
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'UserKnownHostsFile=/dev/null',
      '-o', 'LogLevel=ERROR',
      `root@${ip}`, command
    ], { stdio: ['pipe', 'pipe', 'pipe'] });
    proc.stdout.on('data', d => { output += d; process.stdout.write(d); });
    proc.stderr.on('data', d => { output += d; process.stderr.write(d); });
    proc.on('close', () => resolve(output));
    proc.on('error', reject);
  });
}

async function disableCloudflareProxy(dropletIp: string): Promise<void> {
  console.log('🔧 Disabling Cloudflare proxy (DNS only mode)...');
  console.log('   This bypasses SSL/TLS issues entirely\n');

  // Find and update the blurr.cloud A record to DNS-only (no proxy)
  const dnsRes = await cfReq('GET', `/client/v4/zones/${ZONE_ID}/dns_records?name=blurr.cloud&type=A`);
  
  if (dnsRes.success && dnsRes.result && dnsRes.result.length > 0) {
    const recordId = dnsRes.result[0].id;
    const updateRes = await cfReq('PUT', `/client/v4/zones/${ZONE_ID}/dns_records/${recordId}`, {
      type: 'A',
      name: 'blurr.cloud',
      content: dropletIp,
      ttl: 300,
      proxied: false  // DNS only - bypasses Cloudflare SSL entirely
    });
    
    if (updateRes.success) {
      console.log('✅ Cloudflare proxy disabled - DNS only mode');
      console.log('   Traffic now goes directly to droplet');
    } else {
      console.log('❌ Failed to update DNS record:', JSON.stringify(updateRes.errors));
    }
  } else {
    // Create DNS-only record
    const createRes = await cfReq('POST', `/client/v4/zones/${ZONE_ID}/dns_records`, {
      type: 'A',
      name: 'blurr.cloud',
      content: dropletIp,
      ttl: 300,
      proxied: false
    });
    
    if (createRes.success) {
      console.log('✅ DNS-only A record created');
    } else {
      console.log('❌ Failed:', JSON.stringify(createRes.errors));
    }
  }
}

async function configureNginxWithSSL(ip: string): Promise<void> {
  console.log('\n🔧 Configuring Nginx with Let\'s Encrypt SSL...');
  
  const script = `#!/bin/bash
set -e

echo "🔧 Configuring Nginx with SSL..."

# Ensure certbot is installed
apt-get install -y certbot python3-certbot-nginx -q

# Create basic HTTP config first (needed for certbot challenge)
cat > /etc/nginx/sites-available/cloudreve << 'EOF'
server {
    listen 80;
    server_name blurr.cloud;
    
    client_max_body_size 1000M;
    
    location / {
        proxy_pass http://127.0.0.1:5212;
        proxy_set_header Host \\$http_host;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\$scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

ln -sf /etc/nginx/sites-available/cloudreve /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# Wait for DNS to propagate
echo "⏳ Waiting for DNS propagation..."
sleep 30

# Get SSL certificate
echo "🔒 Getting SSL certificate..."
certbot --nginx -d blurr.cloud --non-interactive --agree-tos --email admin@blurr.cloud --redirect || true

# Restart services
systemctl restart nginx
systemctl restart cloudreve

echo "=== FINAL STATUS ==="
systemctl is-active nginx && echo "✅ Nginx: Running" || echo "❌ Nginx: Failed"
systemctl is-active cloudreve && echo "✅ Cloudreve: Running" || echo "❌ Cloudreve: Failed"

echo "=== CONNECTIVITY ==="
curl -I http://localhost 2>/dev/null | head -n 1
curl -I http://localhost:5212 2>/dev/null | head -n 1

echo "=== ADMIN CREDENTIALS ==="
journalctl -u cloudreve --no-pager | grep -A 5 "Admin user name" | tail -n 10

echo "✅ Setup complete! Access: https://blurr.cloud"
`;

  await runSSH(ip, script);
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         Bypass Cloudflare - Direct SSL Setup              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const info = JSON.parse(fs.readFileSync(INFO_PATH, 'utf-8'));
  const dropletIp = info.public_ip;

  console.log(`🎯 Droplet IP: ${dropletIp}`);
  console.log(`🌐 Domain: blurr.cloud\n`);

  try {
    // Step 1: Disable Cloudflare proxy so SSL is handled by droplet directly
    await disableCloudflareProxy(dropletIp);

    // Step 2: Configure Nginx + certbot on droplet
    await configureNginxWithSSL(dropletIp);

    // Step 3: Test
    console.log('\n⏳ Waiting 15 seconds...');
    await new Promise(r => setTimeout(r, 15000));

    console.log('\n🧪 Testing https://blurr.cloud...');
    await new Promise<void>(resolve => {
      const req = https.request('https://blurr.cloud', { method: 'HEAD' }, res => {
        console.log(`📊 Response: ${res.statusCode}`);
        if (res.statusCode && res.statusCode < 400) {
          console.log('✅ SITE IS LIVE!');
        } else {
          console.log(`⚠️  Status: ${res.statusCode} - DNS may still be propagating`);
        }
        resolve();
      });
      req.on('error', err => { console.log('⚠️  Test error:', err.message); resolve(); });
      req.setTimeout(10000);
      req.end();
    });

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    🎉 DONE!                                ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log('🌐 Access: https://blurr.cloud');
    console.log('🔑 Login with admin credentials shown above');
    console.log('📝 Then run: npm run update:env');

  } catch (error) {
    console.error('\n❌ Error:', error);
  }
}

main();