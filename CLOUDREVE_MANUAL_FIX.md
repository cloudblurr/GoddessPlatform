# Manual Cloudreve Setup Fix

Since the Cloudflare API token appears to be invalid, here's how to manually fix the setup:

## 🔧 Step 1: Create a New Cloudflare API Token

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Choose template: **"Edit zone DNS"** (or create custom)
4. If creating custom, add these permissions:
   - Zone.DNS:Edit
   - Zone.Settings:Edit
   - Zone.Page Rules:Edit
   - Zone.SSL and Certificates:Edit
5. Select zone: **blurr.cloud**
6. Click **"Continue to summary"** → **"Create Token"**
7. Copy the token

## 🌐 Step 2: Update .env File

Open `.env` and update:

```env
CLOUDFLARE_API_TOKEN="your_new_token_here"
```

## 🔧 Step 3: Run Auto-Fix

```bash
npm run cloudreve:fix
```

This will:
- ✓ Create/verify DNS A record: `stx.blurr.cloud` → `161.35.10.22`
- ✓ Set Cloudflare SSL to "Flexible"
- ✓ Configure page rules
- ✓ Update .env with correct URLs

## 📋 Alternative: Manual Cloudflare Configuration

If the script still fails, do this manually:

### DNS Configuration
1. Go to: https://dash.cloudflare.com/
2. Select zone: **blurr.cloud**
3. Go to **DNS** tab
4. Add/Update A record:
   - **Type**: A
   - **Name**: stx
   - **Content**: 161.35.10.22
   - **TTL**: 3600
   - **Proxy status**: Proxied (Orange Cloud)
5. Click **Save**

### SSL Configuration
1. Go to **SSL/TLS** tab
2. Set **SSL/TLS encryption mode** to: **Flexible**
   (This allows HTTP backend, Cloudflare handles HTTPS)

### Page Rules (Optional)
1. Go to **Rules** → **Page Rules**
2. Create rule:
   - **URL**: `stx.blurr.cloud/api/*`
   - **Action**: Cache Level → Bypass
3. Click **Save**

## ✅ Step 4: Verify Setup

```bash
npm run cloudreve:verify
```

Expected output:
```
✓ DNS A record: stx.blurr.cloud → 161.35.10.22 (Proxied)
✓ SSL Mode: Flexible
✓ Droplet Status: active
✓ HTTP to domain: 200
✓ HTTPS to domain: 200
✓ Cloudreve service: 200
```

## 🌐 Step 5: Access Cloudreve

Visit: https://stx.blurr.cloud

If you see a 521 error:
1. Wait 1-2 minutes for DNS propagation
2. Check that Cloudflare DNS is set to Proxied (orange cloud)
3. Check that SSL is set to Flexible
4. Run verification again: `npm run cloudreve:verify`

## 🔐 Step 6: Create OAuth2 Application

1. Login to Cloudreve: https://stx.blurr.cloud
   - Username/password from droplet logs (see below)
2. Go to: **Settings** → **OAuth2 Applications**
3. Click **Create Application**
4. Fill in:
   - **Name**: Goddess Platform
   - **Redirect URI**: https://blurr.cloud/api/cloudreve/oauth/callback
5. Copy **Client ID** and **Client Secret**
6. Update .env:
   ```env
   CLOUDREVE_CLIENT_ID="your_client_id"
   CLOUDREVE_CLIENT_SECRET="your_client_secret"
   ```

## 📝 Get Admin Credentials

SSH into droplet:
```bash
ssh root@161.35.10.22
```

View admin credentials:
```bash
journalctl -u cloudreve | grep -A 5 "Admin user name"
```

Or check the setup file:
```bash
cat /root/cloudreve-setup.txt
```

## 🆘 Troubleshooting

### Domain shows 521 error
- **Cause**: Cloudflare can't reach backend
- **Fix**: 
  1. Check DNS is Proxied (orange cloud)
  2. Check SSL is set to Flexible
  3. Wait 1-2 minutes for DNS propagation
  4. Run: `npm run cloudreve:verify`

### Can't login to Cloudreve
- **Cause**: Admin credentials not found
- **Fix**: SSH into droplet and check logs:
  ```bash
  ssh root@161.35.10.22
  journalctl -u cloudreve -f
  ```

### SSL certificate not installed
- **Cause**: DNS not propagated yet
- **Fix**: Wait 1-2 minutes, then SSH and run:
  ```bash
  ssh root@161.35.10.22
  certbot --nginx -d stx.blurr.cloud
  ```

## 📊 Current Setup

| Item | Value |
|------|-------|
| **Domain** | stx.blurr.cloud |
| **Droplet IP** | 161.35.10.22 |
| **Region** | NYC1 |
| **Size** | 4GB RAM, 2 vCPUs |
| **Status** | Active |

## 🚀 Next Steps

1. Create new Cloudflare API token
2. Update .env with token
3. Run: `npm run cloudreve:fix`
4. Verify: `npm run cloudreve:verify`
5. Access: https://stx.blurr.cloud
6. Create OAuth2 app
7. Update .env with credentials
8. Test: `npm run dev`

---

**Need help?** Check the logs:
```bash
ssh root@161.35.10.22
journalctl -u cloudreve -f
journalctl -u nginx -f
```
