# 🚀 Quick Start - Goddess Platform

**Time to Complete**: 10 minutes  
**Status**: Ready to Deploy

---

## 📋 What You Need

1. SSH access to droplet (161.35.10.22)
2. Cloudreve admin credentials
3. 10 minutes of your time

---

## ⚡ 5-Step Setup

### Step 1: Get Cloudreve Admin Credentials (2 min)

SSH into the droplet:
```bash
ssh -i ~/.ssh/cloudreve_key root@161.35.10.22
```

Get the admin credentials:
```bash
journalctl -u cloudreve | grep -A 5 "Admin user name"
```

You'll see something like:
```
Admin user name: admin
Admin password: xxxxxxxxxxxxxxxx
```

**Save these credentials!**

### Step 2: Create OAuth2 App in Cloudreve (3 min)

1. Open browser: http://161.35.10.22
2. Login with admin credentials from Step 1
3. Go to: **Settings → OAuth2 Applications**
4. Click **Create New Application**
5. Fill in:
   - **Name**: Goddess Platform
   - **Redirect URI**: http://localhost:3044/api/cloudreve/oauth/callback
   - **Scopes**: Select all (or at minimum: openid, email, profile, offline_access, UserInfo.Read, Files.Read)
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

### Step 3: Update .env File (2 min)

Open `.env` and update these values:

```env
CLOUDREVE_CLIENT_ID="paste_client_id_here"
CLOUDREVE_CLIENT_SECRET="paste_client_secret_here"
CLOUDREVE_REDIRECT_URI="http://localhost:3044/api/cloudreve/oauth/callback"
CLOUDREVE_BASE_URL="http://161.35.10.22"
CLOUDREVE_AUTHORIZE_URL="http://161.35.10.22/session/authorize"
CLOUDREVE_TOKEN_URL="http://161.35.10.22/api/v4/session/oauth/token"
CLOUDREVE_REFRESH_URL="http://161.35.10.22/api/v4/session/token/refresh"
CLOUDREVE_USERINFO_URL="http://161.35.10.22/api/v4/session/oauth/userinfo"
```

### Step 4: Start Development Server (1 min)

```bash
npm run dev
```

You should see:
```
▲ Next.js 16.2.1
- Local:        http://localhost:3044
```

### Step 5: Test OAuth Flow (2 min)

1. Open: http://localhost:3044/creator/dashboard
2. You should see the creator dashboard
3. Look for a "Connect Cloudreve" button or similar
4. Click it and you should be redirected to Cloudreve login
5. Login with your Cloudreve credentials
6. You should be redirected back to the app

**✅ Done!**

---

## 🎯 What's Next?

### Immediate
- [ ] Complete the 5 steps above
- [ ] Test OAuth flow
- [ ] Verify creator dashboard loads

### Phase 2 (Studio Features)
- [ ] Post composer
- [ ] Content scheduling
- [ ] File management

### Phase 3 (Store Features)
- [ ] Product management
- [ ] Bundles & subscriptions
- [ ] Deals & promotions

### Phase 4 (Payments)
- [ ] Rampex integration
- [ ] Payout management
- [ ] Revenue analytics

---

## 🔧 Troubleshooting

### Can't SSH into droplet
```bash
# Check SSH key exists
ls -la ~/.ssh/cloudreve_key

# Try with verbose output
ssh -v -i ~/.ssh/cloudreve_key root@161.35.10.22
```

### Can't find admin credentials
```bash
# SSH into droplet
ssh -i ~/.ssh/cloudreve_key root@161.35.10.22

# Check Cloudreve is running
systemctl status cloudreve

# View all logs
journalctl -u cloudreve -n 100

# Or check if there's a setup file
cat /root/cloudreve-setup.txt
```

### OAuth redirect not working
1. Verify .env has correct `CLOUDREVE_REDIRECT_URI`
2. Check Cloudreve OAuth app has correct redirect URI
3. Clear browser cookies
4. Try again

### Can't access http://161.35.10.22
```bash
# SSH into droplet
ssh -i ~/.ssh/cloudreve_key root@161.35.10.22

# Check Nginx is running
systemctl status nginx

# Check Cloudreve is running
systemctl status cloudreve

# View Nginx logs
tail -f /var/log/nginx/error.log
```

---

## 📊 Infrastructure Status

| Component | Status | URL |
|-----------|--------|-----|
| Droplet | ✅ Running | 161.35.10.22 |
| Cloudreve | ✅ Running | http://161.35.10.22 |
| Nginx | ✅ Running | http://161.35.10.22 |
| Creator Portal | ✅ Ready | http://localhost:3044 |

---

## 📝 Environment Variables

After completing Step 3, your .env should have:

```env
# Cloudreve OAuth (from Step 2)
CLOUDREVE_CLIENT_ID="..."
CLOUDREVE_CLIENT_SECRET="..."

# Cloudreve URLs
CLOUDREVE_BASE_URL="http://161.35.10.22"
CLOUDREVE_AUTHORIZE_URL="http://161.35.10.22/session/authorize"
CLOUDREVE_TOKEN_URL="http://161.35.10.22/api/v4/session/oauth/token"
CLOUDREVE_REFRESH_URL="http://161.35.10.22/api/v4/session/token/refresh"
CLOUDREVE_USERINFO_URL="http://161.35.10.22/api/v4/session/oauth/userinfo"

# App Configuration
APP_URL="http://localhost:3044"
CLOUDREVE_REDIRECT_URI="http://localhost:3044/api/cloudreve/oauth/callback"
```

---

## 🎉 You're Ready!

Just follow the 5 steps above and you'll have the Goddess Platform running locally with OAuth2 authentication!

**Questions?** Check the troubleshooting section or read the full documentation in:
- `PROJECT_STATUS.md` - Complete project overview
- `OAUTH_SETUP_COMPLETE.md` - Detailed OAuth setup guide
- `CLOUDREVE_READY.md` - Cloudreve quick start

---

**Time to Complete**: ~10 minutes  
**Difficulty**: Easy  
**Status**: ✅ Ready to Deploy

