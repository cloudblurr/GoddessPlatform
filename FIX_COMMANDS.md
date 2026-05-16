# Cloudreve Droplet Fix Commands

## SSH into droplet first:
```bash
ssh root@134.209.125.45
```

## Then run these commands one by one:

### 1. Check if cloud-init is still running
```bash
cloud-init status
```
If it says "running", wait a few minutes and check again.

### 2. Install missing packages
```bash
apt-get update
apt-get install -y nginx certbot python3-certbot-nginx wget curl
```

### 3. Download and install Cloudreve
```bash
cd /opt
wget https://github.com/cloudreve/Cloudreve/releases/latest/download/cloudreve_linux_amd64.tar.gz
mkdir -p cloudreve
tar -xzf cloudreve_linux_amd64.tar.gz -C cloudreve
cd cloudreve
chmod +x cloudreve
```

### 4. Create cloudreve user
```bash
useradd -r -s /bin/false cloudreve || true
chown -R cloudreve:cloudreve /opt/cloudreve
```

### 5. Create systemd service
```bash
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
```

### 6. Start Cloudreve
```bash
systemctl daemon-reload
systemctl enable cloudreve
systemctl start cloudreve
systemctl status cloudreve
```

### 7. Configure Nginx
```bash
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
        
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
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
systemctl restart nginx
```

### 8. Configure firewall
```bash
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw --force enable
```

### 9. Get admin credentials
```bash
journalctl -u cloudreve | grep -A 5 "Admin user name"
```

### 10. Test if it's working
```bash
curl -I http://localhost:5212
curl -I http://stx.blurr.cloud
```

### 11. Install SSL certificate (after confirming HTTP works)
```bash
certbot --nginx -d stx.blurr.cloud
```

---

## Quick All-in-One Script

Or just copy and paste this entire block:

```bash
# Wait for cloud-init
cloud-init status --wait

# Install packages
apt-get update
apt-get install -y nginx certbot python3-certbot-nginx wget curl

# Install Cloudreve
cd /opt
wget https://github.com/cloudreve/Cloudreve/releases/latest/download/cloudreve_linux_amd64.tar.gz
mkdir -p cloudreve
tar -xzf cloudreve_linux_amd64.tar.gz -C cloudreve
cd cloudreve
chmod +x cloudreve
useradd -r -s /bin/false cloudreve || true
chown -R cloudreve:cloudreve /opt/cloudreve

# Create systemd service
cat > /etc/systemd/system/cloudreve.service << 'EOFSERVICE'
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
EOFSERVICE

# Start Cloudreve
systemctl daemon-reload
systemctl enable cloudreve
systemctl start cloudreve
sleep 5

# Configure Nginx
cat > /etc/nginx/sites-available/cloudreve << 'EOFNGINX'
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
        
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
EOFNGINX

ln -sf /etc/nginx/sites-available/cloudreve /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# Configure firewall
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw --force enable

# Show status
echo ""
echo "=== STATUS ==="
systemctl status cloudreve --no-pager
echo ""
systemctl status nginx --no-pager
echo ""
echo "=== ADMIN CREDENTIALS ==="
journalctl -u cloudreve | grep -A 5 "Admin user name"
echo ""
echo "=== TEST ==="
curl -I http://localhost:5212
```

---

## Cloudflare Settings

While the server is being fixed, also check your Cloudflare settings:

1. Go to Cloudflare Dashboard → stx.blurr.cloud
2. **SSL/TLS** → Set to **"Flexible"** (temporarily)
3. **DNS** → Make sure you have:
   - Type: A
   - Name: stx
   - Content: 134.209.125.45
   - Proxy status: Proxied (orange cloud)

After SSL is installed with certbot, change SSL/TLS to **"Full (strict)"**
