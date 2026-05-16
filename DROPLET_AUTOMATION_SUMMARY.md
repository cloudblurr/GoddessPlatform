# Droplet + Cloudreve Automation Summary

## 🎯 Overview

Automated provisioning system for creating a dedicated Cloudreve file storage backend at **stx.blurr.cloud** for the Goddess Platform marketplace.

---

## 📦 What Was Created

### 1. Provisioning Script
**File**: `scripts/provision-cloudreve-droplet.ts`

Fully automated TypeScript script that:
- Creates DigitalOcean Droplet via API
- Installs Cloudreve + dependencies via cloud-init
- Configures Nginx reverse proxy
- Sets up systemd service
- Prepares SSL certificate installation
- Generates setup documentation

### 2. DNS Verification Helper
**File**: `scripts/verify-dns.ts`

Quick utility to check if DNS is properly configured and propagated.

### 3. Documentation
- `CLOUDREVE_QUICKSTART.md` - Step-by-step guide
- `scripts/README.md` - Detailed technical documentation
- `docs/CLOUDREVE_DEPLOYMENT.md` - Original manual deployment guide (kept for reference)

### 4. NPM Scripts
Added to `package.json`:
```json
{
  "provision:cloudreve": "tsx scripts/provision-cloudreve-droplet.ts",
  "verify:dns": "tsx scripts/verify-dns.ts"
}
```

---

## 🖥️ Droplet Specifications

| Specification | Value | Notes |
|--------------|-------|-------|
| **Name** | cloudreve-stx-blurr | Auto-generated |
| **Region** | NYC1 | New York datacenter |
| **Size** | s-2vcpu-4gb | 4GB RAM, 2 vCPUs |
| **Storage** | 80GB SSD | Included |
| **Bandwidth** | 4TB/month | Included |
| **OS** | Ubuntu 22.04 LTS | Latest stable |
| **Cost** | ~$24/month | DigitalOcean pricing |
| **Domain** | stx.blurr.cloud | Subdomain of blurr.cloud |

### Why These Specs?

**4GB RAM, 2 vCPUs** is the recommended minimum for:
- ✅ Media file processing (images, videos)
- ✅ Concurrent uploads from multiple creators
- ✅ OAuth authentication overhead
- ✅ Nginx reverse proxy buffering
- ✅ Future growth headroom

**80GB SSD** provides:
- ✅ Fast I/O for file operations
- ✅ Space for Cloudreve database and temp files
- ✅ Room for local caching
- ✅ Can be expanded with block storage volumes

**NYC1 Region**:
- ✅ Low latency for US-based users
- ✅ Close to your main application
- ✅ Reliable datacenter with good uptime

---

## 🚀 Usage

### Step 1: Provision Droplet
```bash
npm run provision:cloudreve
```

**What happens:**
1. Validates DigitalOcean API key from `.env`
2. Creates droplet with specified configuration
3. Waits for droplet to become active (~30 seconds)
4. Cloud-init installs Cloudreve (~5-10 minutes)
5. Saves droplet info to `cloudreve-droplet-info.json`
6. Displays next steps with IP address

**Output:**
- Droplet ID and IP address
- SSH connection command
- DNS configuration instructions
- Path to setup credentials

### Step 2: Configure DNS
Point `stx.blurr.cloud` to the droplet IP:
```
Type: A
Name: stx
Domain: blurr.cloud
Value: <droplet-ip-from-step-1>
TTL: 300
```

### Step 3: Verify DNS (Optional)
```bash
npm run verify:dns
```

Checks if DNS is properly configured and propagated.

### Step 4: SSH and Get Credentials
```bash
ssh root@<droplet-ip>
cat /root/cloudreve-setup.txt
```

### Step 5: Install SSL
```bash
certbot --nginx -d stx.blurr.cloud
```

### Step 6: Configure OAuth
1. Access `https://stx.blurr.cloud`
2. Login with initial credentials
3. Create OAuth2 application
4. Update `.env` with new credentials

---

## 🔧 What Gets Installed on Droplet

### Software Stack
```
Ubuntu 22.04 LTS
├── Cloudreve (latest)
│   ├── Binary: /opt/cloudreve/cloudreve
│   ├── Config: /opt/cloudreve/conf.ini
│   ├── Database: /opt/cloudreve/cloudreve.db
│   └── Uploads: /opt/cloudreve/uploads
├── Nginx
│   ├── Config: /etc/nginx/sites-available/cloudreve
│   ├── Reverse proxy on port 80/443
│   └── Max upload: 1000MB
├── Systemd Service
│   ├── Service: /etc/systemd/system/cloudreve.service
│   ├── Auto-start: enabled
│   └── User: cloudreve
├── Certbot
│   └── Ready for SSL installation
└── UFW Firewall
    ├── SSH: allowed
    └── HTTP/HTTPS: allowed
```

### Network Configuration
```
Port 80 (HTTP)  → Nginx → Port 5212 (Cloudreve)
Port 443 (HTTPS) → Nginx → Port 5212 (Cloudreve)
Port 22 (SSH)    → Direct access
```

---

## 🔐 Security Features

### Implemented
- ✅ UFW firewall with minimal open ports
- ✅ Cloudreve runs as non-root user
- ✅ Nginx reverse proxy (hides internal port)
- ✅ Ready for SSL/TLS encryption
- ✅ OAuth2 authentication integration
- ✅ Systemd service isolation

### Post-Setup Required
- ⚠️ Change default admin password
- ⚠️ Enable 2FA in Cloudreve
- ⚠️ Configure storage policies
- ⚠️ Set up regular backups
- ⚠️ Monitor access logs

---

## 📊 Integration with Goddess Platform

### Current Integration Points

**OAuth Flow** (`/api/cloudreve/oauth/*`):
- Start: `/api/cloudreve/oauth/start`
- Callback: `/api/cloudreve/oauth/callback`
- Status: `/api/cloudreve/oauth/status`

**File Operations** (`/api/cloudreve/files/*`):
- List: `/api/cloudreve/files`
- Upload: `/api/cloudreve/files/upload`
- Download: `/api/cloudreve/files/[id]/download`
- Share: `/api/cloudreve/files/[id]/share`
- Delete: `/api/cloudreve/files/[id]`

**Media Proxy** (`/api/media/[id]`):
- Serves media files through platform
- Adds authentication layer
- Tracks access/analytics

### After Setup

Update `.env` to point to new instance:
```env
CLOUDREVE_BASE_URL="https://stx.blurr.cloud"
CLOUDREVE_CLIENT_ID="<from-oauth-app>"
CLOUDREVE_CLIENT_SECRET="<from-oauth-app>"
CLOUDREVE_REDIRECT_URI="https://blurr.cloud/api/cloudreve/oauth/callback"
CLOUDREVE_AUTHORIZE_URL="https://stx.blurr.cloud/session/authorize"
CLOUDREVE_TOKEN_URL="https://stx.blurr.cloud/api/v4/session/oauth/token"
CLOUDREVE_REFRESH_URL="https://stx.blurr.cloud/api/v4/session/token/refresh"
CLOUDREVE_USERINFO_URL="https://stx.blurr.cloud/api/v4/session/oauth/userinfo"
```

---

## 📈 Scaling Path

### Current Capacity
- **Concurrent Uploads**: ~10-20
- **Storage**: 80GB local
- **Bandwidth**: 4TB/month
- **Users**: ~100-500 active

### When to Scale

**Upgrade to 8GB RAM** when:
- CPU usage consistently >70%
- Memory usage >80%
- Upload queue delays >30 seconds

**Add Block Storage** when:
- Local storage >60GB used
- Need more than 80GB total

**Add Load Balancer** when:
- Need high availability
- Traffic >1000 concurrent users
- Multiple regions required

### Scaling Commands
```bash
# Resize droplet (requires downtime)
doctl compute droplet-action resize <droplet-id> --size s-4vcpu-8gb

# Add block storage volume
doctl compute volume create stx-storage --size 100GiB --region nyc1
```

---

## 🐛 Common Issues & Solutions

### Issue: DNS Not Resolving
**Solution**: Wait 5-10 minutes for propagation, verify with `npm run verify:dns`

### Issue: SSL Certificate Fails
**Solution**: Ensure DNS is resolving first, then retry certbot

### Issue: Cloudreve Not Starting
**Solution**: Check logs with `journalctl -u cloudreve -n 50`

### Issue: Upload Fails
**Solution**: Check Nginx upload limits and disk space

### Issue: OAuth Fails
**Solution**: Verify redirect URI matches exactly in both .env and Cloudreve OAuth app

---

## 💰 Cost Breakdown

### Monthly Costs
| Item | Cost | Notes |
|------|------|-------|
| Droplet (4GB) | $24.00 | Base cost |
| Bandwidth | $0.00 | 4TB included |
| Backups (optional) | $4.80 | 20% of droplet cost |
| **Total** | **$24-29/month** | |

### Annual Cost
- **Without backups**: $288/year
- **With backups**: $346/year

### Overage Costs
- **Bandwidth**: $0.01/GB over 4TB
- **Snapshots**: $0.05/GB/month

---

## ✅ Success Criteria

Your setup is complete when:
- ✅ Droplet is running and accessible
- ✅ DNS resolves to droplet IP
- ✅ SSL certificate installed
- ✅ Cloudreve admin panel accessible
- ✅ OAuth2 app created
- ✅ `.env` updated with new credentials
- ✅ Test upload succeeds from creator portal

---

## 📞 Support & Resources

### Documentation
- **Quick Start**: `CLOUDREVE_QUICKSTART.md`
- **Scripts README**: `scripts/README.md`
- **Manual Deployment**: `docs/CLOUDREVE_DEPLOYMENT.md`

### External Resources
- Cloudreve Docs: https://docs.cloudreve.org
- DigitalOcean API: https://docs.digitalocean.com/reference/api/
- Nginx Docs: https://nginx.org/en/docs/

### Monitoring
- DigitalOcean Dashboard: https://cloud.digitalocean.com/
- Droplet Metrics: CPU, RAM, Disk, Bandwidth
- Cloudreve Logs: `journalctl -u cloudreve -f`

---

## 🎉 What This Enables

With this automated setup, your Goddess Platform can:

1. **Content Management**
   - Upload photos, videos, documents
   - Organize in creator-specific folders
   - Generate shareable links

2. **Secure Access**
   - OAuth2 authentication
   - Per-user storage quotas
   - Access control policies

3. **Performance**
   - Chunked uploads for large files
   - Nginx caching and buffering
   - Direct download links

4. **Scalability**
   - Easy to resize droplet
   - Can add block storage
   - Load balancer ready

5. **Reliability**
   - Systemd auto-restart
   - Backup-ready
   - Monitoring enabled

---

**Ready to deploy?**

```bash
npm run provision:cloudreve
```

Then follow the post-provisioning checklist in `CLOUDREVE_QUICKSTART.md`!
