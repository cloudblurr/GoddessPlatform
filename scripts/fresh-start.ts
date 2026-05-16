#!/usr/bin/env tsx
/**
 * Fresh Start - Delete old droplet, create new one WITH SSH key from the start
 * Then fully automate Cloudreve installation
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

// Full Cloudreve installation script
const INSTALL_SCRIPT = `#!/bin/bash
export DEBIAN_FRONTEND=noninteractive
set -e

echo "⏳ Waiting for cloud-init to release dpkg lock..."
while fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1; do
  sleep 5
  echo "  still waiting..."
done
echo "✅ Lock released"

echo "📦 Updating system..."
apt-get update -q
apt-get upgrade -y -q 2>/dev/null || true

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
systemctl is-active nginx && echo "NGINX_OK" || echo "NGINX_FAIL"
systemctl is-active cloudreve && echo "CLOUDREVE_OK" || echo "CLOUDREVE_FAIL"

echo "=== ADMIN CREDENTIALS ==="
journalctl -u cloudreve --no-pager | grep -A 5 "Admin user name" | tail -n 10

echo "INSTALL_COMPLETE"
`;

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
      '-o', 'ConnectTimeout=10',
      `root@${ip}`, command
    ], { stdio: ['pipe', 'pipe', 'pipe'] });
    proc.stdout.on('data', d => { output += d; process.stdout.write(d); });
    proc.stderr.on('data', d => { output += d; });
    proc.on('close', code => {
      if (code === 0) resolve(output);
      else reject(new Error(`SSH failed (code ${code}): ${output}`));
    });
    proc.on('error', reject);
  });
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         Fresh Droplet + Full Cloudreve Install            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Step 1: Generate SSH key
  if (!fs.existsSync(SSH_DIR)) fs.mkdirSync(SSH_DIR, { recursive: true });
  if (!fs.existsSync(KEY_PATH)) {
    console.log('🔑 Generating SSH key...');
    execSync(`ssh-keygen -t ed25519 -f "${KEY_PATH}" -N "" -q`);
  }
  const pubKey = fs.readFileSync(`${KEY_PATH}.pub`, 'utf-8').trim();
  console.log('✅ SSH key ready');

  // Step 2: Add key to DO account
  console.log('🔧 Adding SSH key to DigitalOcean...');
  const keys = await doReq('GET', '/v2/account/keys');
  let keyId: number;
  const existing = keys.ssh_keys?.find((k: any) => k.name === 'cloudreve-automation');
  if (existing) {
    keyId = existing.id;
    console.log(`✅ Key already in account (ID: ${keyId})`);
  } else {
    const res = await doReq('POST', '/v2/account/keys', { name: 'cloudreve-automation', public_key: pubKey });
    keyId = res.ssh_key.id;
    console.log(`✅ Key added (ID: ${keyId})`);
  }

  // Step 3: Delete old droplet
  const info = JSON.parse(fs.readFileSync(INFO_PATH, 'utf-8'));
  console.log(`🗑️  Deleting old droplet (ID: ${info.droplet_id})...`);
  await doReq('DELETE', `/v2/droplets/${info.droplet_id}`);
  console.log('✅ Old droplet deleted');
  await sleep(5000);

  // Step 4: Create new droplet WITH SSH key
  console.log('🚀 Creating new droplet with SSH key...');
  const newDroplet = await doReq('POST', '/v2/droplets', {
    name: 'cloudreve-blurr',
    region: 'nyc1',
    size: 's-2vcpu-4gb',
    image: 'ubuntu-22-04-x64',
    ssh_keys: [keyId],
    tags: ['cloudreve', 'goddess-platform'],
    monitoring: true,
  });

  const dropletId = newDroplet.droplet.id;
  console.log(`✅ Droplet created (ID: ${dropletId})`);

  // Step 5: Wait for active
  console.log('⏳ Waiting for droplet to be active...');
  let ip = '';
  for (let i = 0; i < 60; i++) {
    const res = await doReq('GET', `/v2/droplets/${dropletId}`);
    const d = res.droplet;
    if (d.status === 'active' && d.networks.v4.length > 0) {
      ip = d.networks.v4.find((n: any) => n.type === 'public')?.ip_address;
      if (ip) break;
    }
    process.stdout.write('.');
    await sleep(5000);
  }
  console.log(`\n✅ Droplet active! IP: ${ip}`);

  // Step 6: Wait for SSH to be ready
  console.log('⏳ Waiting for SSH to be ready (60 seconds)...');
  await sleep(60000);

  // Test SSH connection
  let sshReady = false;
  for (let i = 0; i < 12; i++) {
    try {
      await runSSH(ip, 'echo ready');
      sshReady = true;
      break;
    } catch {
      process.stdout.write('.');
      await sleep(10000);
    }
  }

  if (!sshReady) {
    console.log('\n❌ SSH not ready. Droplet may need more time.');
    console.log(`Try manually: ssh -i "${KEY_PATH}" root@${ip}`);
    return;
  }
  console.log('\n✅ SSH connection established!');

  // Step 7: Install Cloudreve
  console.log('\n🔧 Installing Cloudreve (this takes ~3 minutes)...');
  await runSSH(ip, INSTALL_SCRIPT);

  // Step 8: Save info
  const updatedInfo = {
    droplet_id: dropletId,
    droplet_name: 'cloudreve-blurr',
    public_ip: ip,
    region: 'nyc1',
    size: 's-2vcpu-4gb',
    domain: 'blurr.cloud',
    access_url: `http://${ip}`,
    ssh_key_path: KEY_PATH,
    created_at: new Date().toISOString(),
    status: 'active'
  };
  fs.writeFileSync(INFO_PATH, JSON.stringify(updatedInfo, null, 2));

  // Step 9: Update .env
  const envPath = path.join(__dirname, '..', '.env');
  let envFile = fs.readFileSync(envPath, 'utf-8');
  const updates: Record<string, string> = {
    'CLOUDREVE_BASE_URL': `http://${ip}`,
    'CLOUDREVE_AUTHORIZE_URL': `http://${ip}/session/authorize`,
    'CLOUDREVE_TOKEN_URL': `http://${ip}/api/v4/session/oauth/token`,
    'CLOUDREVE_REFRESH_URL': `http://${ip}/api/v4/session/token/refresh`,
    'CLOUDREVE_USERINFO_URL': `http://${ip}/api/v4/session/oauth/userinfo`,
  };
  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    envFile = regex.test(envFile) ? envFile.replace(regex, `${key}="${value}"`) : envFile + `\n${key}="${value}"`;
  }
  fs.writeFileSync(envPath, envFile);
  console.log('✅ .env updated');

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    🎉 CLOUDREVE IS LIVE!                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log(`🌐 Access: http://${ip}`);
  console.log(`🔑 SSH: ssh -i "${KEY_PATH}" root@${ip}`);
  console.log('\n📝 Next: Login to Cloudreve, create OAuth2 app, run: npm run update:env');
  console.log('\n💡 For HTTPS: Point blurr.cloud DNS to ' + ip + ' then run certbot');
}

main().catch(console.error);