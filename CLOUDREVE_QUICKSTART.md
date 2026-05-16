# Cloudreve Droplet Quick Start Guide

## 🚀 One-Command Provisioning

```bash
npm run provision:cloudreve
```

This will automatically:
- ✅ Create a DigitalOcean Droplet (4GB RAM, 2 vCPUs, 80GB SSD)
- ✅ Install Cloudreve + Nginx + SSL tools
- ✅ Configure systemd service for auto-start
- ✅ Set up reverse proxy with upload optimization
- ✅ Generate initial admin credentials

**Time**: ~5-10 minutes total

---

## 📊 Droplet Specifications

| Spec | Value |
|------|-------|
| **Name** | cloudreve-stx-blurr |
| **Region** | NYC1 (New York) |
| **Size** | s-2vcpu-4gb |
| **RAM** | 4GB |
| **vCPUs** | 2 |
| **Storage** | 80GB SSD |
| **Bandwidth** | 4TB/month |
| **Cost** | ~$24/month |
| **Domain** | stx.blurr.cloud |

---

## 📝 Post-Provisioning Checklist

### 1️⃣ Configure DNS (Do This First!)
```
Type: A
Name: stx
Domain: blurr.cloud
Value: <droplet-ip-from-output>
TTL: 300
```

### 2️⃣ SSH into Droplet
```bash
ssh root@<droplet-ip>
```

### 3️⃣ Get Admin Credentials
```bash
cat /root/cloudreve-setup.txt
```

### 4️⃣ Wait for DNS (5-10 minutes)
```bash
# Test DNS propagation
nslookup stx.blurr.cloud
```

### 5️⃣ Install SSL Certificate
```bash
certbot --nginx -d stx.blurr.cloud
# Follow prompts, enter email, agree to terms
```

### 6️⃣ Access Cloudreve Admin
1. Open: `https://stx.blurr.cloud`
2. Login with credentials from step 3
3. **Change password immediately!**

### 7️⃣ Create OAuth2 Application
In Cloudreve Admin Panel:
1. Go to **Settings → OAuth2 Applications**
2. Click **Create New Application**
3. Fill in:
   - **Name**: `Goddess Platform`
   - **Redirect URI**: `https://blurr.cloud/api/cloudreve/oauth/callback`
   - **Scopes**: Select all (UserInfo, Files, Shares, Workflow, Finance, DavAccount, Admin)
4. Save and copy **Client ID** and **Client Secret**

### 8️⃣ Update .env File
```env
CLOUDREVE_BASE_URL="https://stx.blurr.cloud"
CLOUDREVE_CLIENT_ID="<paste-client-id-here>"
CLOUDREVE_CLIENT_SECRET="<paste-client-secret-here>"
CLOUDREVE_REDIRECT_URI="https://blurr.cloud/api/cloudreve/oauth/callback"
CLOUDREVE_AUTHORIZE_URL="https://stx.blurr.cloud/session/authorize"
CLOUDREVE_TOKEN_URL="https://stx.blurr.cloud/api/v4/session/oauth/token"
CLOUDREVE_REFRESH_URL="https://stx.blurr.cloud/api/v4/session/token/refresh"
CLOUDREVE_USERINFO_URL="https://stx.blurr.cloud/api/v4/session/oauth/userinfo"
```

### 9️⃣ Test Integration
```bash
# Restart your app
npm run dev

# Test OAuth flow
# Navigate to creator portal → storage section
```

---

## 🔧 Useful Commands

### Check Service Status
```bash
systemctl status cloudreve
systemctl status nginx
```

### View Logs
```bash
# Cloudreve logs
journalctl -u cloudreve -f

# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx error logs
tail -f /var/log/nginx/error.log
```

### Restart Services
```bash
systemctl restart cloudreve
systemctl restart nginx
```

### Update Cloudreve
```bash
cd /opt/cloudreve
systemctl stop cloudreve
wget https://github.com/cloudreve/Cloudreve/releases/latest/download/cloudreve_linux_amd64.tar.gz
tar -xzf cloudreve_linux_amd64.tar.gz
chmod +x cloudreve
chown cloudreve:cloudreve cloudreve
systemctl start cloudreve
```

---

## 🛡️ Security Best Practices

1. ✅ Change default admin password immediately
2. ✅ Enable 2FA in Cloudreve admin panel
3. ✅ Configure storage policies with least privilege
4. ✅ Regularly update system packages: `apt update && apt upgrade`
5. ✅ Monitor access logs for suspicious activity
6. ✅ Enable DigitalOcean backups (optional, +20% cost)
7. ✅ Set up monitoring alerts in DigitalOcean dashboard

---

## 📈 Scaling Options

If you need more resources later:

| Size | RAM | vCPUs | Storage | Cost/mo |
|------|-----|-------|---------|---------|
| Current | 4GB | 2 | 80GB | $24 |
| Medium | 8GB | 4 | 160GB | $48 |
| Large | 16GB | 8 | 320GB | $96 |

To resize:
1. DigitalOcean Dashboard → Droplets → cloudreve-stx-blurr
2. Click "Resize"
3. Choose new size
4. Power off → Resize → Power on

---

## 🐛 Troubleshooting

### Cloudreve Won't Start
```bash
# Check logs for errors
journalctl -u cloudreve -n 50

# Check if port is in use
netstat -tulpn | grep 5212

# Verify permissions
ls -la /opt/cloudreve
chown -R cloudreve:cloudreve /opt/cloudreve
```

### Can't Access via Domain
```bash
# Verify DNS
dig stx.blurr.cloud

# Check Nginx config
nginx -t

# Check firewall
ufw status
```

### SSL Certificate Fails
```bash
# Verify DNS first
nslookup stx.blurr.cloud

# Test in dry-run mode
certbot --nginx -d stx.blurr.cloud --dry-run

# Check Nginx is running
systemctl status nginx
```

### Upload Fails
```bash
# Check Nginx upload limits
grep client_max_body_size /etc/nginx/sites-available/cloudreve

# Check disk space
df -h

# Check Cloudreve logs
journalctl -u cloudreve -f
```

---

## 📞 Support Resources

- **Cloudreve Docs**: https://docs.cloudreve.org
- **DigitalOcean API**: https://docs.digitalocean.com/reference/api/
- **Nginx Docs**: https://nginx.org/en/docs/
- **Certbot Docs**: https://certbot.eff.org/

---

## 💡 Tips

1. **Backup Strategy**: Enable DigitalOcean automated backups or use Cloudreve's built-in backup features
2. **Monitoring**: Set up DigitalOcean monitoring alerts for CPU, RAM, and disk usage
3. **Storage Policies**: Configure Cloudreve storage policies to use S3-compatible storage for scalability
4. **CDN**: Consider adding Cloudflare in front for caching and DDoS protection
5. **Database**: For high-volume usage, consider migrating from SQLite to MySQL/PostgreSQL

---

## 🎯 What This Enables

With this Cloudreve instance, your Goddess Platform can:
- ✅ Upload and manage creator content (photos, videos, documents)
- ✅ Serve media files to subscribers
- ✅ Handle large file uploads (up to 1GB per file)
- ✅ Provide OAuth-based secure access
- ✅ Track storage usage and quotas
- ✅ Generate shareable links for content
- ✅ Support chunked uploads for reliability
- ✅ Integrate with your existing auth system

---

**Ready to go? Run:** `npm run provision:cloudreve`
