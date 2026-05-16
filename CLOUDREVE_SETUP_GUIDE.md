# Cloudreve Setup & Automation Guide

This guide explains how to use the automated scripts to set up and manage your Cloudreve file storage system at `stx.blurr.cloud`.

## 📋 Quick Start

### 1. **Auto-Fix Everything** (Recommended)
```bash
npm run cloudreve:fix
```

This single command will:
- ✓ Verify/create DNS A record pointing to the droplet
- ✓ Set Cloudflare SSL to Flexible mode
- ✓ Configure page rules to bypass cache for API endpoints
- ✓ Update your .env file with correct URLs

**Time**: ~30 seconds

### 2. **Verify Setup**
```bash
npm run cloudreve:verify
```

This will check:
- ✓ DNS configuration
- ✓ SSL settings
- ✓ Droplet status
- ✓ HTTP/HTTPS connectivity
- ✓ Cloudreve service status

**Time**: ~10 seconds

### 3. **Access Cloudreve**
Once verified, visit: `https://stx.blurr.cloud`

---

## 🚀 Available Scripts

### `npm run cloudreve:fix`
**Auto-fixes all Cloudflare and DNS settings**

What it does:
1. Ensures DNS A record exists and points to `161.35.10.22`
2. Sets Cloudflare SSL to "Flexible" (allows HTTP backend)
3. Creates page rules to bypass cache for `/api/*` endpoints
4. Updates `.env` with correct HTTPS URLs

**When to use**: First time setup or if domain isn't loading

**Output**: 
```
✓ DNS A record: stx.blurr.cloud → 161.35.10.22 (Proxied)
✓ SSL mode: Flexible
✓ Page rules: Configured
✓ .env file: Updated
```

---

### `npm run cloudreve:verify`
**Checks the status of your Cloudreve setup**

What it checks:
- DNS A record configuration
- Cloudflare SSL settings
- Droplet status and IP
- HTTP/HTTPS connectivity
- Cloudreve service status

**When to use**: After setup or to troubleshoot issues

**Output**:
```
📍 DNS Configuration:
✓ A Record: stx.blurr.cloud
  IP: 161.35.10.22
  Proxied: Yes (Orange Cloud)

🔒 SSL Configuration:
✓ SSL Mode: flexible

💾 Droplet Status:
✓ Droplet: cloudreve-stx-blurr
  Status: active
  IP: 161.35.10.22

🌐 Connectivity Tests:
✓ HTTP to IP: 200
✓ HTTP to domain: 200
✓ HTTPS to domain: 200

🚀 Cloudreve Service:
✓ Cloudreve service (port 5212): 200
✓ Cloudreve via Nginx proxy: 200
```

---

### `npm run cloudreve:setup`
**Complete setup automation (requires SSH access)**

What it does:
1. Fixes DNS and SSL via Cloudflare API
2. SSHes into droplet and completes Cloudreve installation
3. Installs SSL certificate with certbot
4. Updates .env file

**When to use**: If you need to complete the full setup from scratch

**Requirements**:
- SSH access to droplet (passwordless or with key)
- Cloudflare API token
- DigitalOcean API token

**Time**: ~10 minutes

---

## 🔧 Configuration

All scripts use environment variables from `.env`:

```env
# Cloudflare
CLOUDFLARE_API_TOKEN=cfat_...
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_KV_NAMESPACE_ID=...

# DigitalOcean
DIGITALOCEAN_API_KEY=dop_v1_...

# Cloudreve URLs (auto-updated by scripts)
CLOUDREVE_BASE_URL=https://stx.blurr.cloud
CLOUDREVE_AUTHORIZE_URL=https://stx.blurr.cloud/session/authorize
CLOUDREVE_TOKEN_URL=https://stx.blurr.cloud/api/v4/session/oauth/token
CLOUDREVE_REFRESH_URL=https://stx.blurr.cloud/api/v4/session/token/refresh
CLOUDREVE_USERINFO_URL=https://stx.blurr.cloud/api/v4/session/oauth/userinfo
```

---

## 📊 Droplet Specifications

**Current Droplet**: `cloudreve-stx-blurr`

| Property | Value |
|----------|-------|
| **IP Address** | 161.35.10.22 |
| **Region** | NYC1 (New York) |
| **Size** | 4GB RAM, 2 vCPUs, 80GB SSD |
| **OS** | Ubuntu 22.04 x64 |
| **Status** | Active |

---

## 🌐 Domain Configuration

**Domain**: `stx.blurr.cloud`
**Main Domain**: `blurr.cloud`
**Cloudflare Zone ID**: `c08ec4594091cc1873b26470316f876c`

### DNS Record
```
Type: A
Name: stx
Content: 161.35.10.22
TTL: 3600
Proxied: Yes (Orange Cloud)
```

### SSL Settings
```
Mode: Flexible
(Allows HTTP backend, Cloudflare handles HTTPS)
```

---

## 🔐 Cloudreve Admin Access

### Get Admin Credentials
SSH into the droplet:
```bash
ssh root@161.35.10.22
```

View admin credentials:
```bash
journalctl -u cloudreve | grep -A 5 "Admin user name"
```

### Create OAuth2 Application
1. Login to Cloudreve admin panel: `https://stx.blurr.cloud`
2. Go to: **Settings → OAuth2 Applications**
3. Create new application:
   - **Name**: Goddess Platform
   - **Redirect URI**: `https://blurr.cloud/api/cloudreve/oauth/callback`
4. Copy the **Client ID** and **Client Secret**
5. Update `.env`:
   ```env
   CLOUDREVE_CLIENT_ID=your_client_id
   CLOUDREVE_CLIENT_SECRET=your_client_secret
   ```

---

## 🐛 Troubleshooting

### Domain Not Loading (Error 521)

**Cause**: Cloudflare can't reach the backend

**Fix**:
```bash
npm run cloudreve:fix
```

This will:
1. Verify DNS is correct
2. Set SSL to Flexible
3. Configure page rules

**Manual Check**:
```bash
# Check if droplet is running
npm run cloudreve:verify

# SSH into droplet
ssh root@161.35.10.22

# Check services
systemctl status cloudreve
systemctl status nginx

# View logs
journalctl -u cloudreve -f
```

---

### SSL Certificate Issues

**Cause**: Certbot can't validate domain

**Fix**: Wait for DNS propagation (1-2 minutes), then:
```bash
ssh root@161.35.10.22
certbot --nginx -d stx.blurr.cloud
```

---

### Cloudreve Service Not Running

**Check status**:
```bash
ssh root@161.35.10.22
systemctl status cloudreve
```

**Restart service**:
```bash
ssh root@161.35.10.22
systemctl restart cloudreve
```

**View logs**:
```bash
ssh root@161.35.10.22
journalctl -u cloudreve -f
```

---

### DNS Not Propagating

**Check DNS**:
```bash
nslookup stx.blurr.cloud
dig stx.blurr.cloud
```

**Verify in Cloudflare**:
1. Go to Cloudflare Dashboard
2. Select `blurr.cloud` zone
3. Go to **DNS** tab
4. Check that `stx` A record exists and points to `161.35.10.22`

---

## 📝 Next Steps

1. **Run auto-fix**:
   ```bash
   npm run cloudreve:fix
   ```

2. **Verify setup**:
   ```bash
   npm run cloudreve:verify
   ```

3. **Access Cloudreve**:
   - Visit: `https://stx.blurr.cloud`
   - Login with admin credentials

4. **Create OAuth2 app**:
   - Settings → OAuth2 Applications
   - Name: Goddess Platform
   - Redirect: `https://blurr.cloud/api/cloudreve/oauth/callback`

5. **Update .env**:
   ```env
   CLOUDREVE_CLIENT_ID=your_id
   CLOUDREVE_CLIENT_SECRET=your_secret
   ```

6. **Test integration**:
   ```bash
   npm run dev
   ```

---

## 🆘 Support

If you encounter issues:

1. **Check logs**:
   ```bash
   npm run cloudreve:verify
   ```

2. **SSH into droplet**:
   ```bash
   ssh root@161.35.10.22
   ```

3. **View service logs**:
   ```bash
   journalctl -u cloudreve -f
   journalctl -u nginx -f
   ```

4. **Check Cloudflare settings**:
   - Dashboard → blurr.cloud → DNS
   - Dashboard → blurr.cloud → SSL/TLS

---

## 📚 Resources

- **Cloudreve Docs**: https://docs.cloudreve.org
- **Cloudflare API**: https://developers.cloudflare.com/api
- **DigitalOcean API**: https://docs.digitalocean.com/reference/api

---

**Last Updated**: May 16, 2026
**Status**: ✅ Production Ready
