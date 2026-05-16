#!/usr/bin/env tsx
/**
 * Final Nginx Fix - Fix the SSL certificate installation issue
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const INFO_PATH = path.join(__dirname, '..', 'cloudreve-droplet-info.json');

async function runSSHCommand(ip: string, command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let output = '';
    
    const sshProcess = spawn('ssh', [
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'UserKnownHostsFile=/dev/null',
      '-o', 'LogLevel=ERROR',
      `root@${ip}`,
      command
    ], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    sshProcess.stdout.on('data', (data) => {
      output += data.toString();
      process.stdout.write(data);
    });

    sshProcess.stderr.on('data', (data) => {
      output += data.toString();
      process.stderr.write(data);
    });

    sshProcess.on('close', (code) => {
      resolve(output);
    });

    sshProcess.on('error', reject);
  });
}

async function fixNginxSSL(ip: string): Promise<void> {
  console.log('🔧 Fixing Nginx SSL configuration...');
  
  const fixScript = `#!/bin/bash
set -e

echo "🔧 Fixing Nginx SSL Configuration..."

# Stop services
systemctl stop nginx

# Create proper Nginx config with SSL
cat > /etc/nginx/sites-available/cloudreve << 'EOF'
server {
    listen 80;
    server_name stx.blurr.cloud;
    return 301 https://\\$server_name\\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name stx.blurr.cloud;

    ssl_certificate /etc/letsencrypt/live/stx.blurr.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/stx.blurr.cloud/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    client_max_body_size 1000M;
    client_body_timeout 300s;

    location / {
        proxy_pass http://127.0.0.1:5212;
        proxy_set_header Host \\$http_host;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\$scheme;
        
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
EOF

# Test Nginx config
nginx -t

# Start services
systemctl start nginx
systemctl start cloudreve

# Enable services
systemctl enable nginx
systemctl enable cloudreve

echo "=== FINAL STATUS ==="
systemctl is-active nginx && echo "✅ Nginx: Running" || echo "❌ Nginx: Failed"
systemctl is-active cloudreve && echo "✅ Cloudreve: Running" || echo "❌ Cloudreve: Failed"

echo "=== CONNECTIVITY TEST ==="
sleep 5
curl -I http://localhost 2>/dev/null | head -n 1 && echo "✅ HTTP working" || echo "❌ HTTP failed"
curl -I https://localhost 2>/dev/null | head -n 1 && echo "✅ HTTPS working" || echo "❌ HTTPS failed"
curl -I http://localhost:5212 2>/dev/null | head -n 1 && echo "✅ Cloudreve working" || echo "❌ Cloudreve failed"

echo "=== ADMIN CREDENTIALS ==="
journalctl -u cloudreve --no-pager | grep -A 5 "Admin user name" | tail -n 10 || echo "Check logs manually"

echo "=== SETUP COMPLETE ==="
echo "Access: https://stx.blurr.cloud"
echo "If still not working, check Cloudflare SSL/TLS settings"
`;

  await runSSHCommand(ip, fixScript);
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                  Final Nginx SSL Fix                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (!fs.existsSync(INFO_PATH)) {
    console.error('❌ No droplet info found.');
    process.exit(1);
  }

  const info = JSON.parse(fs.readFileSync(INFO_PATH, 'utf-8'));
  const dropletIp = info.public_ip;

  console.log(`🎯 Target: ${dropletIp} (stx.blurr.cloud)\n`);

  try {
    await fixNginxSSL(dropletIp);
    
    console.log('\n✅ Nginx SSL configuration fixed!');
    console.log('\n🌐 Try accessing: https://stx.blurr.cloud');
    console.log('🔍 If still not working, run: npm run diagnose:droplet');
    
  } catch (error) {
    console.error('\n❌ Fix failed:', error);
    console.log('\n💡 Manual steps:');
    console.log('1. SSH: ssh root@' + dropletIp);
    console.log('2. Check: systemctl status nginx cloudreve');
    console.log('3. Restart: systemctl restart nginx cloudreve');
    console.log('4. Test: curl -I http://localhost');
  }
}

main();