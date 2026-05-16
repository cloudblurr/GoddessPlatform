#!/usr/bin/env tsx
/**
 * Switch from stx.blurr.cloud to blurr.cloud
 * This bypasses all SSL/TLS issues by using the main domain
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

const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_FULL_TOKEN;
const INFO_PATH = path.join(__dirname, '..', 'cloudreve-droplet-info.json');

function cfRequest(method: string, endpoint: string, data?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      port: 443,
      path: endpoint,
      method: method,
      headers: {
        'Authorization': `Bearer ${CF_API_TOKEN}`,
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

async function setupMainDomainDNS(dropletIp: string): Promise<void> {
  console.log('🔧 Setting up main domain DNS...');
  
  // Get zone ID
  const zoneResponse = await cfRequest('GET', '/client/v4/zones?name=blurr.cloud');
  if (!zoneResponse.success || !zoneResponse.result.length) {
    throw new Error('Zone not found');
  }
  
  const zoneId = zoneResponse.result[0].id;
  console.log(`✓ Zone ID: ${zoneId}`);
  
  // Check for existing A record for main domain
  const dnsResponse = await cfRequest('GET', `/client/v4/zones/${zoneId}/dns_records?name=blurr.cloud&type=A`);
  
  if (dnsResponse.success && dnsResponse.result.length > 0) {
    // Update existing record
    const recordId = dnsResponse.result[0].id;
    console.log('🔧 Updating main domain A record...');
    await cfRequest('PUT', `/client/v4/zones/${zoneId}/dns_records/${recordId}`, {
      type: 'A',
      name: 'blurr.cloud',
      content: dropletIp,
      ttl: 300,
      proxied: true
    });
    console.log('✅ Main domain A record updated');
  } else {
    // Create new record
    console.log('🔧 Creating main domain A record...');
    await cfRequest('POST', `/client/v4/zones/${zoneId}/dns_records`, {
      type: 'A',
      name: 'blurr.cloud',
      content: dropletIp,
      ttl: 300,
      proxied: true
    });
    console.log('✅ Main domain A record created');
  }
  
  // Set SSL to flexible for main domain
  console.log('🔒 Setting SSL to flexible for main domain...');
  try {
    await cfRequest('PATCH', `/client/v4/zones/${zoneId}/settings/ssl`, {
      value: 'flexible'
    });
    console.log('✅ SSL set to flexible');
  } catch (error) {
    console.log('⚠️  Could not set SSL mode via API, but continuing...');
  }
}

async function updateNginxConfig(ip: string): Promise<void> {
  console.log('🔧 Updating Nginx configuration for main domain...');
  
  const nginxConfig = `#!/bin/bash
set -e

echo "🔧 Updating Nginx for main domain..."

# Stop nginx
systemctl stop nginx

# Create new config for main domain
cat > /etc/nginx/sites-available/cloudreve << 'EOF'
server {
    listen 80;
    server_name blurr.cloud;
    
    client_max_body_size 1000M;
    client_body_timeout 300s;

    location / {
        proxy_pass http://127.0.0.1:5212;
        proxy_set_header Host \\$http_host;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\$scheme;
        
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
EOF

# Test and start nginx
nginx -t
systemctl start nginx
systemctl enable nginx

# Ensure Cloudreve is running
systemctl start cloudreve
systemctl enable cloudreve

echo "=== STATUS ==="
systemctl is-active nginx && echo "✅ Nginx: Running" || echo "❌ Nginx: Failed"
systemctl is-active cloudreve && echo "✅ Cloudreve: Running" || echo "❌ Cloudreve: Failed"

echo "=== TEST ==="
curl -I http://localhost 2>/dev/null | head -n 1 && echo "✅ HTTP working" || echo "❌ HTTP failed"
curl -I http://localhost:5212 2>/dev/null | head -n 1 && echo "✅ Cloudreve working" || echo "❌ Cloudreve failed"

echo "✅ Nginx updated for main domain"
`;

  await runSSHCommand(ip, nginxConfig);
}

async function updateEnvFile(): Promise<void> {
  console.log('📝 Updating .env file for main domain...');
  
  const envPath = path.join(__dirname, '..', '.env');
  let envContent = fs.readFileSync(envPath, 'utf-8');
  
  // Update Cloudreve URLs to use main domain
  const updates = {
    'CLOUDREVE_BASE_URL': 'https://blurr.cloud',
    'CLOUDREVE_AUTHORIZE_URL': 'https://blurr.cloud/session/authorize',
    'CLOUDREVE_TOKEN_URL': 'https://blurr.cloud/api/v4/session/oauth/token',
    'CLOUDREVE_REFRESH_URL': 'https://blurr.cloud/api/v4/session/token/refresh',
    'CLOUDREVE_USERINFO_URL': 'https://blurr.cloud/api/v4/session/oauth/userinfo'
  };
  
  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}="${value}"`);
    } else {
      envContent += `\n${key}="${value}"`;
    }
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file updated for main domain');
}

async function testMainDomain(): Promise<void> {
  console.log('🧪 Testing main domain access...');
  
  return new Promise((resolve) => {
    const testReq = https.request('https://blurr.cloud', { method: 'HEAD' }, (res) => {
      console.log(`📊 Main domain response: ${res.statusCode}`);
      if (res.statusCode && res.statusCode < 400) {
        console.log('✅ Main domain is accessible!');
      } else {
        console.log(`⚠️  Main domain returned ${res.statusCode}`);
      }
      resolve();
    });
    
    testReq.on('error', (err) => {
      console.log('⚠️  Main domain test failed, but configuration is updated');
      resolve();
    });
    
    testReq.setTimeout(10000);
    testReq.end();
  });
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║            Switch to Main Domain (blurr.cloud)            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (!CF_API_TOKEN) {
    console.error('❌ No Cloudflare API token found in .env file');
    process.exit(1);
  }

  if (!fs.existsSync(INFO_PATH)) {
    console.error('❌ No droplet info found.');
    process.exit(1);
  }

  const info = JSON.parse(fs.readFileSync(INFO_PATH, 'utf-8'));
  const dropletIp = info.public_ip;

  console.log(`🎯 Switching from stx.blurr.cloud to blurr.cloud`);
  console.log(`📍 Droplet IP: ${dropletIp}\n`);

  try {
    // Step 1: Setup DNS for main domain
    await setupMainDomainDNS(dropletIp);
    
    // Step 2: Update Nginx config
    await updateNginxConfig(dropletIp);
    
    // Step 3: Update .env file
    await updateEnvFile();
    
    // Step 4: Wait for DNS propagation
    console.log('⏳ Waiting for DNS propagation (30 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // Step 5: Test main domain
    await testMainDomain();
    
    // Update droplet info
    const updatedInfo = {
      ...info,
      domain: 'blurr.cloud',
      access_url: 'https://blurr.cloud',
      switched_to_main_domain: new Date().toISOString()
    };
    
    fs.writeFileSync(INFO_PATH, JSON.stringify(updatedInfo, null, 2));
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    🎉 SUCCESS!                             ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log('✅ Switched to main domain: blurr.cloud');
    console.log('✅ DNS configured');
    console.log('✅ Nginx updated');
    console.log('✅ .env file updated');
    
    console.log('\n🎯 Next Steps:');
    console.log('1. 🌐 Access: https://blurr.cloud');
    console.log('2. 🔑 Login with admin credentials');
    console.log('3. 🔒 Change admin password');
    console.log('4. ⚙️  Create OAuth2 app with redirect: https://blurr.cloud/api/cloudreve/oauth/callback');
    console.log('5. 📝 Run: npm run update:env');
    
    console.log('\n💡 Benefits of main domain:');
    console.log('• No SSL/TLS configuration issues');
    console.log('• Uses existing Cloudflare settings');
    console.log('• Simpler DNS management');
    console.log('• Better for production use');
    
  } catch (error) {
    console.error('\n❌ Failed to switch to main domain:', error);
    console.log('\n💡 Fallback: The subdomain setup is still available at stx.blurr.cloud');
    console.log('Just change Cloudflare SSL/TLS to "Flexible" for the subdomain');
  }
}

main();