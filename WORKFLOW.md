# Cloudreve Droplet Provisioning Workflow

## 🔄 Complete Automation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    START: Run Provisioning                      │
│                  npm run provision:cloudreve                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 1: Validate Environment                                   │
│  ✓ Check DIGITALOCEAN_API_KEY in .env                          │
│  ✓ Verify API connectivity                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 2: Create Droplet via DigitalOcean API                   │
│  • Name: cloudreve-stx-blurr                                    │
│  • Region: NYC1                                                  │
│  • Size: s-2vcpu-4gb (4GB RAM, 2 vCPUs)                        │
│  • Image: Ubuntu 22.04 LTS                                      │
│  • Cloud-init: Embedded installation script                     │
│  ⏱️  Duration: ~30 seconds                                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 3: Wait for Droplet Active Status                        │
│  • Poll API every 5 seconds                                     │
│  • Max wait: 5 minutes                                          │
│  ⏱️  Duration: ~30-60 seconds                                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 4: Cloud-Init Installation (Automated on Droplet)        │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 4a. System Update                                         │ │
│  │     apt-get update && apt-get upgrade                     │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │ 4b. Install Dependencies                                  │ │
│  │     • Nginx (reverse proxy)                               │ │
│  │     • wget, curl, tar (utilities)                         │ │
│  │     • ufw (firewall)                                      │ │
│  │     • certbot (SSL certificates)                          │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │ 4c. Configure Firewall                                    │ │
│  │     • Allow SSH (port 22)                                 │ │
│  │     • Allow HTTP/HTTPS (ports 80/443)                     │ │
│  │     • Enable UFW                                          │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │ 4d. Download & Install Cloudreve                          │ │
│  │     • Download latest release from GitHub                 │ │
│  │     • Extract to /opt/cloudreve                           │ │
│  │     • Set permissions                                     │ │
│  │     • Create cloudreve user                               │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │ 4e. Create Systemd Service                                │ │
│  │     • Service file: /etc/systemd/system/cloudreve.service│ │
│  │     • Enable auto-start on boot                           │ │
│  │     • Start service                                       │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │ 4f. Configure Nginx                                       │ │
│  │     • Reverse proxy config                                │ │
│  │     • Max upload: 1000MB                                  │ │
│  │     • WebSocket support                                   │ │
│  │     • Enable site                                         │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │ 4g. Generate Setup Documentation                          │ │
│  │     • Save admin credentials                              │ │
│  │     • Create /root/cloudreve-setup.txt                    │ │
│  └───────────────────────────────────────────────────────────┘ │
│  ⏱️  Duration: ~5-10 minutes                                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 5: Save Droplet Information                               │
│  • Create cloudreve-droplet-info.json                          │
│  • Include: IP, region, size, next steps                       │
│  • Display summary to console                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUTOMATION COMPLETE                          │
│              Droplet is ready for configuration                 │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MANUAL STEPS BEGIN                           │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Manual Step 1: Configure DNS                                   │
│  • Add A record: stx.blurr.cloud → <droplet-ip>                │
│  • TTL: 300 seconds                                             │
│  ⏱️  Duration: Immediate (propagation: 5-10 min)                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Manual Step 2: Verify DNS (Optional)                          │
│  npm run verify:dns                                             │
│  • Checks if DNS resolves correctly                             │
│  • Compares with expected droplet IP                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Manual Step 3: SSH into Droplet                               │
│  ssh root@<droplet-ip>                                          │
│  • View setup file: cat /root/cloudreve-setup.txt              │
│  • Note admin credentials                                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Manual Step 4: Install SSL Certificate                        │
│  certbot --nginx -d stx.blurr.cloud                             │
│  • Enter email address                                          │
│  • Agree to terms                                               │
│  • Auto-configures Nginx for HTTPS                             │
│  ⏱️  Duration: ~2 minutes                                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Manual Step 5: Access Cloudreve Admin Panel                   │
│  https://stx.blurr.cloud                                        │
│  • Login with credentials from setup.txt                        │
│  • Change admin password immediately                            │
│  • Enable 2FA (recommended)                                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Manual Step 6: Create OAuth2 Application                      │
│  Settings → OAuth2 Applications → Create New                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Name: Goddess Platform                                    │ │
│  │ Redirect URI: https://blurr.cloud/api/cloudreve/oauth/... │ │
│  │ Scopes: [Select All]                                      │ │
│  │   ✓ openid, email, profile, offline_access               │ │
│  │   ✓ UserInfo.Read, UserSecurityInfo.Read                 │ │
│  │   ✓ Files.Read, Shares.Read                               │ │
│  │   ✓ Workflow.Read, Finance.Read                           │ │
│  │   ✓ DavAccount.Read, Admin.Read                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│  • Save and copy Client ID & Client Secret                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Manual Step 7: Update .env File                               │
│  npm run update:env                                             │
│  • Interactive prompt for Client ID & Secret                    │
│  • Automatically updates all Cloudreve URLs                     │
│  • Preserves other environment variables                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Manual Step 8: Test Integration                               │
│  • Restart app: npm run dev                                     │
│  • Login to creator portal                                      │
│  • Navigate to Storage section                                  │
│  • Test OAuth flow                                              │
│  • Upload a test file                                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         ✅ COMPLETE!                            │
│         Cloudreve is fully integrated with your platform        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Time Breakdown

| Phase | Duration | Type |
|-------|----------|------|
| Droplet Creation | ~30 seconds | Automated |
| Droplet Activation | ~30-60 seconds | Automated |
| Cloud-Init Installation | ~5-10 minutes | Automated |
| DNS Configuration | ~1 minute | Manual |
| DNS Propagation | ~5-10 minutes | Waiting |
| SSL Installation | ~2 minutes | Manual |
| Admin Setup | ~5 minutes | Manual |
| OAuth Configuration | ~3 minutes | Manual |
| .env Update | ~1 minute | Semi-automated |
| Testing | ~5 minutes | Manual |
| **Total** | **~25-40 minutes** | **Mixed** |

**Automated Time**: ~6-11 minutes  
**Manual Time**: ~17-22 minutes  
**Waiting Time**: ~5-10 minutes

---

## 🎯 Decision Points

### During Provisioning
- ✅ **Automatic**: Droplet size, region, configuration
- ✅ **Automatic**: Software installation and setup
- ✅ **Automatic**: Service configuration

### After Provisioning
- ⚠️ **Manual**: DNS configuration (requires domain access)
- ⚠️ **Manual**: SSL certificate (requires DNS to be ready)
- ⚠️ **Manual**: Admin password change (security requirement)
- ⚠️ **Manual**: OAuth app creation (requires admin access)

---

## 🔄 Rollback Procedure

If something goes wrong:

### 1. Delete Droplet
```bash
# Get droplet ID from cloudreve-droplet-info.json
doctl compute droplet delete <droplet-id>
```

### 2. Remove DNS Record
Remove the A record for `stx.blurr.cloud`

### 3. Clean Up Local Files
```bash
rm cloudreve-droplet-info.json
```

### 4. Revert .env Changes
Restore previous Cloudreve configuration in `.env`

### 5. Start Over
```bash
npm run provision:cloudreve
```

---

## 🚀 Quick Commands Reference

```bash
# Provision new droplet
npm run provision:cloudreve

# Verify DNS configuration
npm run verify:dns

# Update .env with OAuth credentials
npm run update:env

# SSH into droplet
ssh root@<ip-from-output>

# View setup credentials
cat /root/cloudreve-setup.txt

# Install SSL certificate
certbot --nginx -d stx.blurr.cloud

# Check Cloudreve status
systemctl status cloudreve

# View Cloudreve logs
journalctl -u cloudreve -f

# Restart Cloudreve
systemctl restart cloudreve
```

---

## 📋 Checklist

Use this checklist to track your progress:

- [ ] Run `npm run provision:cloudreve`
- [ ] Note droplet IP address from output
- [ ] Configure DNS A record
- [ ] Wait for DNS propagation (5-10 min)
- [ ] Run `npm run verify:dns` to confirm
- [ ] SSH into droplet
- [ ] View `/root/cloudreve-setup.txt`
- [ ] Run `certbot --nginx -d stx.blurr.cloud`
- [ ] Access `https://stx.blurr.cloud`
- [ ] Login with initial credentials
- [ ] Change admin password
- [ ] Enable 2FA (optional but recommended)
- [ ] Create OAuth2 application
- [ ] Copy Client ID and Client Secret
- [ ] Run `npm run update:env`
- [ ] Paste credentials when prompted
- [ ] Restart development server
- [ ] Test OAuth flow in creator portal
- [ ] Upload test file
- [ ] Verify file appears in Cloudreve
- [ ] ✅ Setup complete!

---

## 🎓 What You Learned

This automation demonstrates:

1. **Infrastructure as Code**: Droplet provisioning via API
2. **Cloud-Init**: Automated server configuration
3. **Reverse Proxy**: Nginx configuration for web apps
4. **SSL/TLS**: Certificate management with Certbot
5. **OAuth2**: Third-party authentication integration
6. **Systemd**: Service management on Linux
7. **DNS Management**: Domain configuration
8. **Security**: Firewall, user permissions, HTTPS

---

**Ready to start?**

```bash
npm run provision:cloudreve
```

Then follow the on-screen instructions! 🚀
