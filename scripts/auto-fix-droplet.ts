#!/usr/bin/env tsx
/**
 * Automated Droplet Fix Script
 * SSHs into the droplet and fixes all services automatically
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        value = value.replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

const INFO_PATH = path.join(__dirname, '..', 'cloudreve-droplet-info.json');

// The complete fix script to run on the droplet
const FIX_SCRIPT = `#!/bin/bash
set -e

echo "🔧 Starting automated droplet fix..."

# Check current status
echo "📊 Checking current status..."
systemctl is-active nginx || echo "Nginx not running"
systemctl is-active cloudreve || echo "Cloudreve not running"

# Install missing packages if needed
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    apt-get update
    apt-get install -y nginx certbot python3-certbot-nginx
fi

# Install Cloudreve if not present
if [ ! -f "/opt/cloudreve/cloudreve" ]; then
    echo "📦 Installing Cloudreve..."
    cd /opt
    wget -q https://github.com/cloudreve/Cloudreve/releases/latest/download/cloudreve_linux_amd64.tar.gz
    mkdir -p cloudreve
    tar -xzf cloudreve_linux_amd64.tar.gz -C cloudreve
    chmod +x cloudreve/cloudreve
    rm cloudreve_linux_amd64.tar.gz
    
    # Create user
    useradd -r -s /bin/false cloudreve 2>/dev/null || true
    chown -R cloudreve:cloudreve /opt/cloudreve
fi

# Create systemd service if missing
if [ ! -f "/etc/systemd/system/cloudreve.service" ]; then
    echo "⚙️ Creating Cloudreve service..."
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
    systemctl daemon-reload
fi

# Configure Nginx if needed
if [ ! -f "/etc/nginx/sites-available/cloudreve" ]; then
    echo "🌐 Configuring Nginx..."
    cat > /etc/nginx/sites-available/cloudreve << 'EOF'
server {
    listen 80;
    server_name stx.blurr.cloud;
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

    ln -sf /etc/nginx/sites-available/cloudreve /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t
fi

# Start and enable services
echo "🚀 Starting services..."
systemctl enable cloudreve
systemctl start cloudreve
systemctl enable nginx
systemctl restart nginx

# Configure firewall
echo "🔒 Configuring firewall..."
ufw allow 'Nginx Full' 2>/dev/null || true
ufw allow OpenSSH 2>/dev/null || true
ufw --force enable 2>/dev/null || true

# Wait for Cloudreve to start
echo "⏳ Waiting for Cloudreve to initialize..."
sleep 10

# Get status
echo ""
echo "📊 Final Status:"
echo "================"
systemctl status cloudreve --no-pager -l | head -n 5
echo ""
systemctl status nginx --no-pager -l | head -n 5
echo ""

# Test connectivity
echo "🌐 Testing connectivity:"
curl -I http://localhost:5212 2>/dev/null | head -n 1 || echo "❌ Cloudreve not responding"
curl -I http://localhost 2>/dev/null | head -n 1 || echo "❌ Nginx not responding"

# Get admin credentials
echo ""
echo "🔐 Admin Credentials:"
echo "===================="
journalctl -u cloudreve --no-pager | grep -A 5 "Admin user name" | tail -n 10 || echo "❌ No admin credentials found yet"

# Save setup info
cat > /root/cloudreve-setup.txt << EOF
=== CLOUDREVE SETUP COMPLETE ===
Droplet IP: \\$(curl -s ifconfig.me)
Domain: stx.blurr.cloud
Installation Date: \\$(date)

Admin Credentials:
\\$(journalctl -u cloudreve --no-pager | grep -A 5 "Admin user name" | tail -n 10)

Next Steps:
1. Set Cloudflare SSL/TLS to "Flexible"
2. Install SSL: certbot --nginx -d stx.blurr.cloud
3. Access: https://stx.blurr.cloud
4. Create OAuth2 app
5. Update .env with credentials

Services Status:
Cloudreve: \\$(systemctl is-active cloudreve)
Nginx: \\$(systemctl is-active nginx)
EOF

echo ""
echo "✅ Setup complete! Check /root/cloudreve-setup.txt for details"
echo "🌐 Try accessing: http://stx.blurr.cloud"
`;

async function runSSHCommand(ip: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('🔧 Connecting to droplet and running automated fix...\n');
    
    // Create temporary script file
    const scriptPath = '/tmp/fix-cloudreve.sh';
    
    // SSH command to upload and run the script
    const sshProcess = spawn('ssh', [
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'UserKnownHostsFile=/dev/null',
      '-o', 'LogLevel=ERROR',
      `root@${ip}`,
      `cat > ${scriptPath} << 'EOFSCRIPT'
${FIX_SCRIPT}
EOFSCRIPT
chmod +x ${scriptPath}
${scriptPath}
rm ${scriptPath}`
    ], {
      stdio: 'inherit'
    });

    sshProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Automated fix completed successfully!');
        resolve();
      } else {
        console.log(`\n❌ SSH process exited with code ${code}`);
        reject(new Error(`SSH failed with code ${code}`));
      }
    });

    sshProcess.on('error', (err) => {
      console.error('❌ SSH connection failed:', err.message);
      reject(err);
    });
  });
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║              Automated Droplet Fix                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (!fs.existsSync(INFO_PATH)) {
    console.error('❌ No droplet info found. Run provision script first.');
    process.exit(1);
  }

  const info = JSON.parse(fs.readFileSync(INFO_PATH, 'utf-8'));
  const dropletIp = info.public_ip;

  console.log(`🎯 Target: ${dropletIp} (stx.blurr.cloud)`);
  console.log('📝 This will automatically:');
  console.log('   • Install missing packages');
  console.log('   • Configure Cloudreve service');
  console.log('   • Setup Nginx reverse proxy');
  console.log('   • Start all services');
  console.log('   • Configure firewall');
  console.log('   • Get admin credentials\n');

  try {
    await runSSHCommand(dropletIp);
    
    console.log('\n🎉 Next steps:');
    console.log('1. Set Cloudflare SSL/TLS to "Flexible"');
    console.log('2. Run: npm run diagnose:droplet');
    console.log('3. If working, install SSL: ssh root@' + dropletIp + ' "certbot --nginx -d stx.blurr.cloud"');
    console.log('4. Access: https://stx.blurr.cloud');
    
  } catch (error) {
    console.error('\n❌ Automated fix failed:', error);
    console.log('\n💡 Fallback: SSH manually and run commands from FIX_COMMANDS.md');
    process.exit(1);
  }
}

main();