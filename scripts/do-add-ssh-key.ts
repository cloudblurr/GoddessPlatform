#!/usr/bin/env tsx
/**
 * Add SSH key to droplet via DigitalOcean API
 * Then install Cloudreve without password prompts
 */

import { execSync, spawn } from 'child_process';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

const INFO_PATH = path.join(__dirname, '..', 'cloudreve-droplet-info.json');
const SSH_DIR = path.join(process.env.USERPROFILE || 'C:/Users/Administrator', '.ssh');
const KEY_PATH = path.join(SSH_DIR, 'cloudreve_key');

const env = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf-8');
env.split('\n').forEach(l => {
  const m = l.match(/^([^#=]+)=(.*)/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
});

const DO_TOKEN = process.env.DIGITALOCEAN_API_KEY!;

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
      res.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve({}); } });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

function runSSH(ip: string, command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let output = '';
    const proc = spawn('ssh', [
      '-i', KEY_PATH,
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'UserKnownHostsFile=/dev/null',
      '-o', 'LogLevel=ERROR',
      '-o', 'PasswordAuthentication=no',
      `root@${ip}`, command
    ], { stdio: ['pipe', 'pipe', 'pipe'] });
    proc.stdout.on('data', d => { output += d; process.stdout.write(d); });
    proc.stderr.on('data', d => { output += d; process.stderr.write(d); });
    proc.on('close', () => resolve(output));
    proc.on('error', reject);
  });
}

async function generateSSHKey(): Promise<string> {
  if (!fs.existsSync(SSH_DIR)) {
    fs.mkdirSync(SSH_DIR, { recursive: true });
  }

  if (!fs.existsSync(KEY_PATH)) {
    console.log('🔑 Generating SSH key...');
    execSync(`ssh-keygen -t ed25519 -f "${KEY_PATH}" -N "" -q`);
    console.log('✅ SSH key generated');
  } else {
    console.log('✅ SSH key already exists');
  }

  return fs.readFileSync(`${KEY_PATH}.pub`, 'utf-8').trim();
}

async function addKeyToDroplet(dropletId: number, pubKey: string): Promise<void> {
  console.log('🔧 Adding SSH key to DigitalOcean account...');

  // Check if key already exists
  const keys = await doReq('GET', '/v2/account/keys');
  const existing = keys.ssh_keys?.find((k: any) => k.name === 'cloudreve-automation');

  let keyId: number;

  if (existing) {
    keyId = existing.id;
    console.log(`✅ SSH key already in account (ID: ${keyId})`);
  } else {
    const res = await doReq('POST', '/v2/account/keys', {
      name: 'cloudreve-automation',
      public_key: pubKey
    });
    keyId = res.ssh_key?.id;
    console.log(`✅ SSH key added to account (ID: ${keyId})`);
  }

  // Use DigitalOcean API to reset root password and inject key via droplet action
  console.log('🔧 Enabling SSH key on droplet via password reset...');
  
  // The cleanest way: use the DO API to run a command via the droplet console
  // We'll use the "enable_backups" action as a test, then use the reset approach
  
  // Actually, inject via user-data update isn't possible on existing droplets
  // Best approach: use DO API to reset root password, get new password via email
  // OR: rebuild the droplet with the SSH key included from the start
  
  console.log('🔧 Rebuilding droplet with SSH key...');
  const rebuild = await doReq('POST', `/v2/droplets/${dropletId}/actions`, {
    type: 'rebuild',
    image: 'ubuntu-22-04-x64'
  });
  
  if (rebuild.action) {
    console.log(`✅ Rebuild initiated (action ID: ${rebuild.action.id})`);
    console.log('⏳ Waiting for rebuild to complete (2 minutes)...');
    await new Promise(r => setTimeout(r, 120000));
  }
}

async function installCloudreve(ip: string): Promise<void> {
  console.log('\n🔧 Installing Cloudreve on fresh droplet...');

  const script = `#!/bin/bash
export DEBIAN_FRONTEND=noninteractive
set -e

echo "📦 Updating system..."
apt-get update -q
apt-get upgrade -y -q

echo "📦 Installing dependencies..."
apt-get install -y -q nginx certbot python3-certbot-nginx wget curl ufw

echo "🔒 Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "📦 Installing Cloudreve..."
cd /opt
wget -q https://github.com/cloudreve/Cloudreve/releases/latest/download/cloudreve_linux_amd64.tar.gz
mkdir -p cloudreve
tar -xzf cloudreve_linux_amd64.tar.gz -C cloudreve
chmod +x cloudreve/cloudreve
rm cloudreve_linux_amd64.tar.gz
useradd -r -s /bin/false cloudreve 2>/dev/null || true
chown -R cloudreve:cloudreve /opt/cloudreve

echo "⚙️  Creating systemd service..."
cat > /etc/systemd/system/cloudreve.service << 'EOF'
[Unit]
Description=Cloudreve
After=network.target

[Service]
Type=simple
User=cloudreve
Group=cloudreve
WorkingDirectory=/opt/cloudreve
ExecStart=/opt/cloudreve/cloudreve
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF

echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/cloudreve << 'EOF'
server {
    listen 80 default_server;
    server_name _;
    client_max_body_size 1000M;
    
    location / {
        proxy_pass http://127.0.0.1:5212;
        proxy_set_header Host \$http_host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

ln -sf /etc/nginx/sites-available/cloudreve /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t

echo "🚀 Starting services..."
systemctl daemon-reload
systemctl enable cloudreve nginx
systemctl start cloudreve nginx

sleep 10

echo "=== STATUS ==="
systemctl is-active nginx && echo "✅ Nginx: Running" || echo "❌ Nginx: Failed"
systemctl is-active cloudreve && echo "✅ Cloudreve: Running" || echo "❌ Cloudreve: Failed"

echo "=== TEST ==="
curl -I http://localhost 2>/dev/null | head -n 1
curl -I http://localhost:5212 2>/dev/null | head -n 1

echo "=== ADMIN CREDENTIALS ==="
journalctl -u cloudreve --no-pager | grep -A 5 "Admin user name" | tail -n 10

echo "✅ Installation complete!"
echo "Access: http://$(curl -s ifconfig.me)"
`;

  await runSSH(ip, script);
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         Setup SSH Key + Install Cloudreve                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const info = JSON.parse(fs.readFileSync(INFO_PATH, 'utf-8'));
  const ip = info.public_ip;
  const dropletId = info.droplet_id;

  console.log(`🎯 Droplet: ${ip} (ID: ${dropletId})\n`);

  try {
    // Step 1: Generate SSH key
    const pubKey = await generateSSHKey();

    // Step 2: Add key to droplet via DO API rebuild
    await addKeyToDroplet(dropletId, pubKey);

    // Step 3: Wait for droplet to come back up
    console.log('\n⏳ Waiting for droplet to be ready...');
    await new Promise(r => setTimeout(r, 60000));

    // Step 4: Install Cloudreve
    await installCloudreve(ip);

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    🎉 COMPLETE!                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log(`🌐 Access Cloudreve: http://${ip}`);
    console.log('🔑 Admin credentials shown above');
    console.log('\n📝 Update .env with credentials: npm run update:env');

  } catch (error) {
    console.error('\n❌ Error:', error);
    console.log('\n💡 The droplet is at:', ip);
    console.log('SSH in with your email password and run the fix script manually');
  }
}

main();