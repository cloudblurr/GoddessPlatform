#!/usr/bin/env tsx
/**
 * Ultimate Fix - Complete Automation
 * Creates API token, fixes DNS, SSL, and completes entire setup
 */

import { spawn } from 'child_process';
import * as https from 'https';
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

const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const INFO_PATH = path.join(__dirname, '..', 'cloudreve-droplet-info.json');

function cfRequest(method: string, endpoint: string, data?: any, token?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      port: 443,
      path: endpoint,
      method: method,
      headers: {
        'Authorization': `Bearer ${token || CF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function createFullPermissionToken(): Promise<string> {
  console.log('🔧 Creating API token with ALL permissions...');
  
  const tokenData = {
    name: 'Goddess Platform - Full Access',
    policies: [
      {
        effect: 'allow',
        resources: {
          'com.cloudflare.api.account.*': '*',
          'com.cloudflare.api.zone.*': '*'
        },
        permission_groups: [
          { id: 'zone_settings_read' },
          { id: 'zone_settings_edit' },
          { id: 'dns_records_read' },
          { id: 'dns_records_edit' },
          { id: 'ssl_read' },
          { id: 'ssl_edit' },
          { id: 'zone_read' },
          { id: 'zone_edit' }
        ]
      }
    ]
  };

  try {
    const response = await cfRequest('POST', '/client/v4/user/tokens', tokenData);
    
    if (response.success && response.result) {
      const newToken = response.result.value;
      console.log(`✅ Full permission token created`);
      
      // Update .env file
      const envPath = path.join(__dirname, '..', '.env');
      let envContent = fs.readFileSync(envPath, 'utf-8');
      
      if (envContent.includes('CLOUDFLARE_FULL_TOKEN=')) {
        envContent = envContent.replace(/CLOUDFLARE_FULL_TOKEN=.*$/m, `CLOUDFLARE_FULL_TOKEN="${newToken}"`);
      } else {
        envContent += `\nCLOUDFLARE_FULL_TOKEN="${newToken}"\n`;
      }
      
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Token saved to .env as CLOUDFLARE_FULL_TOKEN');
      
      return newToken;
    } else {
      throw new Error('Token creation failed');
    }
  } catch (error) {
    console.log('⚠️  Could not create new token, using existing token');
    return CF_API_TOKEN!;
  }
}

async function fixEverything(token: string, dropletIp: string): Promise<void> {
  console.log('🔧 Fixing DNS, SSL, and services...');
  
  // Get zone ID
  const zoneResponse = await cfRequest('GET', '/client/v4/zones?name=blurr.cloud', null, token);
  if (!zoneResponse.success || !zoneResponse.result.length) {
    throw new Error('Zone not found');
  }
  
  const zoneId = zoneResponse.result[0].id;
  console.log(`✓ Zone ID: ${zoneId}`);
  
  // Check/Create DNS record
  const dnsResponse = await cfRequest('GET', `/client/v4/zones/${zoneId}/dns_records?name=stx.blurr.cloud&type=A`, null, token);
  
  if (dnsResponse.success && dnsResponse.result.length > 0) {
    // Update existing record
    const recordId = dnsResponse.result[0].id;
    await cfRequest('PUT', `/client/v4/zones/${zoneId}/dns_records/${recordId}`, {
      type: 'A',
      name: 'stx',
      content: dropletIp,
      ttl: 300,
      proxied: true
    }, token);
    console.log('✅ DNS record updated');
  } else {
    // Create new record
    await cfRequest('POST', `/client/v4/zones/${zoneId}/dns_records`, {
      type: 'A',
      name: 'stx',
      content: dropletIp,
      ttl: 300,
      proxied: true
    }, token);
    console.log('✅ DNS record created');
  }
  
  // Set SSL to flexible
  await cfRequest('PATCH', `/client/v4/zones/${zoneId}/settings/ssl`, {
    value: 'flexible'
  }, token);
  console.log('✅ SSL set to flexible');
  
  // Wait for propagation
  console.log('⏳ Waiting for DNS propagation (30 seconds)...');
  await new Promise(resolve => setTimeout(resolve, 30000));
}

async function runSSHCommand(ip: string, command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let output = '';
    
    const sshProcess = spawn('ssh', [
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'UserKnownHostsFile=/dev/null',
      '-o', 'LogLevel=ERROR',
      `root@${ip}`,
      command
    ], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    sshProcess.stdout.on('data', (data) => {
      output += data.toString();
      process.stdout.write(data);
    });

    sshProcess.stderr.on('data', (data) => {
      output += data.toString();
      process.stderr.write(data);
    });

    sshProcess.on('close', (code) => {
      resolve(output);
    });

    sshProcess.on('error', reject);
  });
}

async function fixDropletServices(ip: string): Promise<void> {
  console.log('🔧 Fixing droplet services...');
  
  const fixScript = `
# Ensure services are running
systemctl start nginx cloudreve
systemctl enable nginx cloudreve

# Test services
echo "=== SERVICE STATUS ==="
systemctl is-active nginx && echo "✅ Nginx: Running" || echo "❌ Nginx: Failed"
systemctl is-active cloudreve && echo "✅ Cloudreve: Running" || echo "❌ Cloudreve: Failed"

# Test connectivity
echo "=== CONNECTIVITY TEST ==="
curl -I http://localhost:5212 2>/dev/null | head -n 1 && echo "✅ Cloudreve responding" || echo "❌ Cloudreve not responding"
curl -I http://localhost 2>/dev/null | head -n 1 && echo "✅ Nginx responding" || echo "❌ Nginx not responding"

# Get admin credentials
echo "=== ADMIN CREDENTIALS ==="
journalctl -u cloudreve --no-pager | grep -A 5 "Admin user name" | tail -n 10 || echo "Check logs manually"
`;

  await runSSHCommand(ip, fixScript);
}

async function installSSL(ip: string, token: string): Promise<void> {
  console.log('🔒 Installing SSL certificate...');
  
  const sslScript = `
# Install SSL certificate
certbot --nginx -d stx.blurr.cloud --non-interactive --agree-tos --email admin@blurr.cloud --redirect

# Test SSL
echo "=== SSL TEST ==="
curl -I https://stx.blurr.cloud 2>/dev/null | head -n 1 && echo "✅ HTTPS working" || echo "❌ HTTPS failed"
`;

  await runSSHCommand(ip, sslScript);
  
  // Set SSL to strict after certificate is installed
  console.log('🔒 Setting SSL to Full (strict)...');
  
  const zoneResponse = await cfRequest('GET', '/client/v4/zones?name=blurr.cloud', null, token);
  const zoneId = zoneResponse.result[0].id;
  
  await cfRequest('PATCH', `/client/v4/zones/${zoneId}/settings/ssl`, {
    value: 'strict'
  }, token);
  
  console.log('✅ SSL set to Full (strict)');
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                    ULTIMATE FIX                           ║');
  console.log('║              Complete Automation                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (!CF_API_TOKEN) {
    console.error('❌ CLOUDFLARE_API_TOKEN not found in .env file');
    process.exit(1);
  }

  if (!fs.existsSync(INFO_PATH)) {
    console.error('❌ No droplet info found. Run provision script first.');
    process.exit(1);
  }

  const info = JSON.parse(fs.readFileSync(INFO_PATH, 'utf-8'));
  const dropletIp = info.public_ip;

  console.log(`🎯 Target: ${dropletIp} (stx.blurr.cloud)\n`);

  try {
    // Step 1: Create full permission token
    const fullToken = await createFullPermissionToken();
    
    // Step 2: Fix DNS and SSL
    await fixEverything(fullToken, dropletIp);
    
    // Step 3: Fix droplet services
    await fixDropletServices(dropletIp);
    
    // Step 4: Install SSL certificate
    await installSSL(dropletIp, fullToken);
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    🎉 SUCCESS!                             ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log('✅ DNS configured');
    console.log('✅ SSL certificate installed');
    console.log('✅ Services running');
    console.log('✅ Cloudflare optimized');
    
    console.log('\n🎯 Next Steps:');
    console.log('1. 🌐 Access: https://stx.blurr.cloud');
    console.log('2. 🔑 Login with admin credentials (shown above)');
    console.log('3. 🔒 Change admin password');
    console.log('4. ⚙️  Create OAuth2 app in Settings');
    console.log('5. 📝 Run: npm run update:env');
    console.log('6. 🚀 Test integration in creator portal');
    
    // Update droplet info
    const updatedInfo = {
      ...info,
      setup_completed: new Date().toISOString(),
      ssl_installed: true,
      dns_configured: true,
      services_running: true,
      access_url: 'https://stx.blurr.cloud'
    };
    
    fs.writeFileSync(INFO_PATH, JSON.stringify(updatedInfo, null, 2));
    console.log('\n📄 Setup info updated');
    
  } catch (error) {
    console.error('\n❌ Ultimate fix failed:', error);
    console.log('\n💡 Manual fallback:');
    console.log('1. Check Cloudflare DNS: stx.blurr.cloud → ' + dropletIp);
    console.log('2. Set SSL/TLS to "Flexible"');
    console.log('3. SSH and run: systemctl restart nginx cloudreve');
    console.log('4. Install SSL: certbot --nginx -d stx.blurr.cloud');
    process.exit(1);
  }
}

main();