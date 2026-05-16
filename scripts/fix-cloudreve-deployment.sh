#!/bin/bash
# Fix Cloudreve Deployment Script
# Run this on the droplet: bash fix-cloudreve-deployment.sh

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║          Cloudreve Deployment Fix & Diagnostic            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if cloud-init is still running
echo "1️⃣  Checking cloud-init status..."
if systemctl is-active --quiet cloud-init; then
    echo "⚠️  Cloud-init is still running. Waiting for it to complete..."
    cloud-init status --wait
    echo "✓ Cloud-init completed"
else
    echo "✓ Cloud-init already completed"
fi

# Check if Cloudreve is installed
echo ""
echo "2️⃣  Checking Cloudreve installation..."
if [ -f "/opt/cloudreve/cloudreve" ]; then
    echo "✓ Cloudreve binary found"
else
    echo "❌ Cloudreve not found. Installing now..."
    cd /opt
    wget https://github.com/cloudreve/Cloudreve/releases/latest/download/cloudreve_linux_amd64.tar.gz
    mkdir -p cloudreve
    tar -xzf cloudreve_linux_amd64.tar.gz -C cloudreve
    rm cloudreve_linux_amd64.tar.gz
    cd cloudreve
    chmod +x cloudreve
    
    # Create cloudreve user if doesn't exist
    if ! id -u cloudreve > /dev/null 2>&1; then
        useradd -r -s /bin/false cloudreve
    fi
    
    chown -R cloudreve:cloudreve /opt/cloudreve
    echo "✓ Cloudreve installed"
fi

# Check systemd service
echo ""
echo "3️⃣  Checking Cloudreve systemd service..."
if [ ! -f "/etc/systemd/system/cloudreve.service" ]; then
    echo "Creating systemd service..."
    cat > /etc/systemd/system/cloudreve.service << 'EOF'
[Unit]
Description=Cloudreve File Management System
Documentation=https://docs.cloudreve.org
After=network.target
Wants=network.target

[Service]
Type=simple
User=cloudreve
Group=cloudreve
WorkingDirectory=/opt/cloudreve
ExecStart=/opt/cloudreve/cloudreve
Restart=on-failure
RestartSec=5s
KillMode=mixed

StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
    systemctl daemon-reload
    echo "✓ Systemd service created"
fi

# Start Cloudreve if not running
echo ""
echo "4️⃣  Starting Cloudreve service..."
systemctl enable cloudreve
systemctl restart cloudreve
sleep 5

if systemctl is-active --quiet cloudreve; then
    echo "✓ Cloudreve is running"
else
    echo "❌ Cloudreve failed to start. Checking logs..."
    journalctl -u cloudreve -n 20 --no-pager
    exit 1
fi

# Check if Nginx is installed
echo ""
echo "5️⃣  Checking Nginx installation..."
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    apt-get update
    apt-get install -y nginx
    echo "✓ Nginx installed"
else
    echo "✓ Nginx already installed"
fi

# Configure Nginx
echo ""
echo "6️⃣  Configuring Nginx..."
cat > /etc/nginx/sites-available/cloudreve << 'EOF'
server {
    listen 80;
    server_name stx.blurr.cloud;

    client_max_body_size 1000M;
    client_body_timeout 300s;

    location / {
        proxy_pass http://127.0.0.1:5212;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts for large uploads
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
EOF

ln -sf /etc/nginx/sites-available/cloudreve /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl restart nginx
echo "✓ Nginx configured and restarted"

# Check firewall
echo ""
echo "7️⃣  Checking firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 'Nginx Full'
    ufw allow OpenSSH
    ufw --force enable
    echo "✓ Firewall configured"
else
    echo "⚠️  UFW not installed, skipping firewall config"
fi

# Install certbot
echo ""
echo "8️⃣  Installing certbot..."
if ! command -v certbot &> /dev/null; then
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
    echo "✓ Certbot installed"
else
    echo "✓ Certbot already installed"
fi

# Check if Cloudreve is responding
echo ""
echo "9️⃣  Testing Cloudreve connectivity..."
sleep 2
if curl -s http://127.0.0.1:5212 > /dev/null; then
    echo "✓ Cloudreve is responding on port 5212"
else
    echo "❌ Cloudreve is not responding. Checking logs..."
    journalctl -u cloudreve -n 30 --no-pager
fi

# Get admin credentials
echo ""
echo "🔟 Getting admin credentials..."
if [ -f "/root/cloudreve-setup.txt" ]; then
    cat /root/cloudreve-setup.txt
else
    echo "Creating setup file..."
    ADMIN_CREDS=$(journalctl -u cloudreve --no-pager | grep -A 2 "Admin user name" || echo "Check logs: journalctl -u cloudreve | grep Admin")
    
    cat > /root/cloudreve-setup.txt << EOF
=== CLOUDREVE INITIAL SETUP ===
Droplet IP: $(curl -s ifconfig.me)
Domain: stx.blurr.cloud

Initial Admin Credentials:
$ADMIN_CREDS

Next Steps:
1. DNS should be pointing to this droplet's IP
2. Install SSL certificate: certbot --nginx -d stx.blurr.cloud
3. Login to Cloudreve admin panel and configure OAuth2 app
4. Update .env with new CLOUDREVE_BASE_URL, CLIENT_ID, CLIENT_SECRET
EOF
    cat /root/cloudreve-setup.txt
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    Diagnostic Summary                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Service Status:"
systemctl status cloudreve --no-pager -l | head -n 5
echo ""
systemctl status nginx --no-pager -l | head -n 5
echo ""
echo "Listening Ports:"
netstat -tlnp | grep -E ':(80|5212) '
echo ""
echo "Recent Cloudreve Logs:"
journalctl -u cloudreve -n 10 --no-pager
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    Next Steps                              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "1. Test HTTP access: curl -I http://stx.blurr.cloud"
echo "2. Install SSL: certbot --nginx -d stx.blurr.cloud"
echo "3. Access admin panel: https://stx.blurr.cloud"
echo ""
echo "If using Cloudflare:"
echo "  - Set SSL/TLS mode to 'Full' (not 'Full (strict)' yet)"
echo "  - After certbot, change to 'Full (strict)'"
echo ""
