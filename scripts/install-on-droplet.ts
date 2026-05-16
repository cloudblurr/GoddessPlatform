#!/usr/bin/env tsx
/**
 * Install Cloudreve on existing droplet using SSH key auth
 * Waits for dpkg lock to clear before installing
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const INFO_PATH = path.join(__dirname, '..', 'cloudreve-droplet-info.json');
const KEY_PATH = path.join(process.env.USERPROFILE || 'C:/Users/Administrator', '.ssh', 'cloudreve_key');

const INSTALL_SCRIPT = `#!/bin/bash
export DEBIAN_FRONTEND=noninteractive

echo "⏳ Waiting for dpkg lock to clear..."
timeout=300
while fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1 || fuser /var/lib/dpkg/lock >/dev/null 2>&1; do
  sleep 5
  timeout=$((timeout-5))
  if [ $timeout -le 0 ]; then
    echo "Force clearing lock..."
    rm -f /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock /var/cache/apt/archives/lock
    dpkg --configure -a 2>/dev/null || true
    break
  fi
done
echo "✅ Lock cleared"

echo "📦 Installing dependencies..."
apt-get update -q 2>/dev/null
apt-get install -y -q nginx certbot python3-certbot-nginx wget curl ufw 2>/dev/null

echo "🔒 Configuring firewall..."
ufw allow OpenSSH 2>/dev/null || true
ufw allow 'Nginx Full' 2>/dev/null || true
ufw --force enable 2>/dev/null || true

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

sleep 15

echo ""
echo "=== FINAL STATUS ==="
systemctl is-active nginx && echo "✅ Nginx: Running" || echo "❌ Nginx: Failed"
systemctl is-active cloudreve && echo "✅ Cloudreve: Running" || echo "❌ Cloudreve: Failed"

echo ""
echo "=== CONNECTIVITY ==="
curl -s -o /dev/null -w "HTTP Status: %{http_code}" http://localhost && echo ""
curl -s -o /dev/null -w "Cloudreve Status: %{http_code}" http://localhost:5212 && echo ""

echo ""
echo "=== ADMIN CREDENTIALS ==="
journalctl -u cloudreve --no-pager | grep -A 5 "Admin user name" | tail -n 10

echo ""
echo "✅ INSTALLATION COMPLETE"
echo "Access: http://$(curl -s ifconfig.me)"
`;

function runSSH(ip: string, command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn('ssh', [
      '-i', KEY_PATH,
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'UserKnownHostsFile=/dev/null',
      '-o', 'LogLevel=ERROR',
      '-o', 'PasswordAuthentication=no',
      '-o', 'ServerAliveInterval=30',
      '-o', 'ServerAliveCountMax=10',
      `root@${ip}`, command
    ], { stdio: 'inherit' });

    proc.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`SSH exited with code ${code}`));
    });
    proc.on('error', reject);
  });
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║           Install Cloudreve on Droplet                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const info = JSON.parse(fs.readFileSync(INFO_PATH, 'utf-8'));
  const ip = info.public_ip;

  console.log(`🎯 Target: ${ip}`);
  console.log(`🔑 SSH Key: ${KEY_PATH}\n`);
  console.log('⏳ This will take 3-5 minutes...\n');

  try {
    await runSSH(ip, INSTALL_SCRIPT);

    // Update .env
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

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    🎉 CLOUDREVE IS LIVE!                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log(`🌐 Access: http://${ip}`);
    console.log('🔑 Login with admin credentials shown above');
    console.log('\n📝 Next steps:');
    console.log('1. Login to Cloudreve at the URL above');
    console.log('2. Change admin password');
    console.log('3. Create OAuth2 app in Settings');
    console.log('4. Run: npm run update:env');

  } catch (error) {
    console.error('\n❌ Installation failed:', error);
    console.log(`\n💡 SSH manually: ssh -i "${KEY_PATH}" root@${ip}`);
  }
}

main();