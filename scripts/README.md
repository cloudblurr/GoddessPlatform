# Automation Scripts

## Cloudreve Droplet Provisioning

### Overview
Automated script to create and configure a DigitalOcean Droplet with Cloudreve for the Goddess Platform file storage backend.

### Droplet Specifications
- **Image**: Ubuntu 22.04 LTS x64
- **Size**: `s-2vcpu-4gb` (4GB RAM, 2 vCPUs, 80GB SSD)
- **Region**: NYC1 (New York)
- **Domain**: stx.blurr.cloud
- **Purpose**: Cloudreve file management system for content uploads and storage

### What Gets Installed
1. **Cloudreve** - Latest version from GitHub releases
2. **Nginx** - Reverse proxy with optimized upload settings
3. **Systemd Service** - Auto-start Cloudreve on boot
4. **Firewall (UFW)** - Configured for SSH and HTTP/HTTPS
5. **Certbot** - Ready for SSL certificate installation

### Prerequisites
1. DigitalOcean API key set in `.env` as `DIGITALOCEAN_API_KEY`
2. Node.js/npm installed locally
3. `tsx` package (will be installed if missing)

### Usage

```bash
# Install tsx if not already installed
npm install -D tsx

# Run the provisioning script
npx tsx scripts/provision-cloudreve-droplet.ts
```

### What Happens During Provisioning

1. **Droplet Creation** (~30 seconds)
   - Creates droplet with specified configuration
   - Applies cloud-init script for automated setup

2. **System Setup** (~5-10 minutes, automated)
   - Updates Ubuntu packages
   - Installs Nginx, wget, curl, ufw
   - Configures firewall rules
   - Downloads and installs Cloudreve
   - Creates systemd service
   - Configures Nginx reverse proxy
   - Starts Cloudreve service

3. **Output Generation**
   - Saves droplet info to `cloudreve-droplet-info.json`
   - Displays next steps and credentials location

### Post-Provisioning Steps

#### 1. Configure DNS (Immediate)
Point your DNS A record to the droplet IP:
```
Type: A
Name: stx
Value: <droplet-ip>
TTL: 300
```

#### 2. SSH into Droplet
```bash
ssh root@<droplet-ip>
```

#### 3. Get Initial Admin Credentials
```bash
cat /root/cloudreve-setup.txt
```

This file contains:
- Droplet IP address
- Initial Cloudreve admin username and password
- Next steps checklist

#### 4. Install SSL Certificate (After DNS Propagates)
Wait 5-10 minutes for DNS to propagate, then:
```bash
certbot --nginx -d stx.blurr.cloud
```

#### 5. Configure Cloudreve Admin Panel
1. Access: `https://stx.blurr.cloud`
2. Login with initial admin credentials
3. Change admin password
4. Navigate to **Settings → OAuth2 Applications**
5. Create new OAuth2 application:
   - **Name**: Goddess Platform
   - **Redirect URI**: `https://blurr.cloud/api/cloudreve/oauth/callback`
   - **Scopes**: Select all required scopes (UserInfo, Files, Shares, etc.)
6. Save the **Client ID** and **Client Secret**

#### 6. Update Environment Variables
Update your `.env` file with the new Cloudreve instance:

```env
# Update these values
CLOUDREVE_BASE_URL="https://stx.blurr.cloud"
CLOUDREVE_CLIENT_ID="<your-new-client-id>"
CLOUDREVE_CLIENT_SECRET="<your-new-client-secret>"
CLOUDREVE_REDIRECT_URI="https://blurr.cloud/api/cloudreve/oauth/callback"
CLOUDREVE_AUTHORIZE_URL="https://stx.blurr.cloud/session/authorize"
CLOUDREVE_TOKEN_URL="https://stx.blurr.cloud/api/v4/session/oauth/token"
CLOUDREVE_REFRESH_URL="https://stx.blurr.cloud/api/v4/session/token/refresh"
CLOUDREVE_USERINFO_URL="https://stx.blurr.cloud/api/v4/session/oauth/userinfo"
```

### Monitoring and Maintenance

#### Check Cloudreve Status
```bash
systemctl status cloudreve
```

#### View Cloudreve Logs
```bash
journalctl -u cloudreve -f
```

#### Restart Cloudreve
```bash
systemctl restart cloudreve
```

#### Check Nginx Status
```bash
systemctl status nginx
nginx -t  # Test configuration
```

### Troubleshooting

#### Cloudreve Not Starting
```bash
# Check logs
journalctl -u cloudreve -n 50

# Check if port 5212 is in use
netstat -tulpn | grep 5212

# Restart service
systemctl restart cloudreve
```

#### Nginx Errors
```bash
# Test configuration
nginx -t

# Check error logs
tail -f /var/log/nginx/error.log
```

#### SSL Certificate Issues
```bash
# Verify DNS is pointing correctly
dig stx.blurr.cloud

# Test certbot in dry-run mode
certbot --nginx -d stx.blurr.cloud --dry-run
```

### Cost Estimate
- **Droplet**: ~$24/month (4GB RAM, 2 vCPUs, 80GB SSD)
- **Bandwidth**: 4TB included, $0.01/GB overage
- **Backups**: Optional, +20% of droplet cost

### Security Considerations
1. Change default admin password immediately
2. Enable 2FA in Cloudreve admin panel
3. Configure storage policies with appropriate permissions
4. Regularly update Cloudreve and system packages
5. Monitor access logs for suspicious activity
6. Consider enabling DigitalOcean backups

### Scaling Considerations
If you need more resources:
- **8GB RAM**: `s-4vcpu-8gb` (~$48/month)
- **16GB RAM**: `s-8vcpu-16gb` (~$96/month)
- **Block Storage**: Add volumes for additional storage
- **Load Balancer**: For high-availability setups

### Support
- Cloudreve Docs: https://docs.cloudreve.org
- DigitalOcean API: https://docs.digitalocean.com/reference/api/
- Issues: Check `/root/cloudreve-setup.txt` on droplet
