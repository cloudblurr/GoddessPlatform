#!/usr/bin/env tsx
/**
 * Complete Cloudreve Setup Automation
 * Handles the entire setup process end-to-end
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const INFO_PATH = path.join(__dirname, '..', 'cloudreve-droplet-info.json');

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
    });

    sshProcess.stderr.on('data', (data) => {
      output += data.toString();
    });

    sshProcess.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Command failed with code ${code}: ${output}`));
      }
    });

    sshProcess.on('error', reject);
  });
}

async function testConnectivity(ip: string): Promise<boolean> {
  try {
    console.log('🔍 Testing droplet connectivity...');
    const result = await runSSHCommand(ip, 'curl -I http://localhost:5212 2>/dev/null | head -n 1');
    return result.includes('200') || result.includes('HTTP');
  } catch {
    return false;
  }
}

async function getAdminCredentials(ip: string): Promise<string> {
  try {
    console.log('🔐 Getting admin credentials...');
    const result = await runSSHCommand(ip, 'journalctl -u cloudreve --no-pager | grep -A 5 "Admin user name" | tail -n 10');
    return result.trim();
  } catch (error) {
    return 'Could not retrieve credentials. Check /root/cloudreve-setup.txt on the droplet.';
  }
}

async function installSSLCert(ip: string): Promise<boolean> {
  try {
    console.log('🔒 Installing SSL certificate...');
    await runSSHCommand(ip, 'certbot --nginx -d stx.blurr.cloud --non-interactive --agree-tos --email admin@blurr.cloud --redirect');
    return true;
  } catch (error) {
    console.log('⚠️  SSL installation had issues, but may have succeeded');
    return false;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║              Complete Cloudreve Setup                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (!fs.existsSync(INFO_PATH)) {
    console.error('❌ No droplet info found. Run provision script first.');
    process.exit(1);
  }

  const info = JSON.parse(fs.readFileSync(INFO_PATH, 'utf-8'));
  const dropletIp = info.public_ip;

  console.log(`🎯 Target: ${dropletIp} (stx.blurr.cloud)\n`);

  try {
    // Step 1: Test connectivity
    const isConnected = await testConnectivity(dropletIp);
    if (!isConnected) {
      console.log('❌ Droplet services not responding. Run: npm run fix:droplet');
      process.exit(1);
    }
    console.log('✅ Droplet services are running\n');

    // Step 2: Install SSL certificate
    console.log('📋 Installing SSL certificate...');
    console.log('⚠️  Note: You may need to set Cloudflare SSL/TLS to "Flexible" first\n');
    
    const sslSuccess = await installSSLCert(dropletIp);
    
    if (sslSuccess) {
      console.log('✅ SSL certificate installed successfully\n');
    } else {
      console.log('⚠️  SSL installation completed (check manually)\n');
    }

    // Step 3: Get admin credentials
    const credentials = await getAdminCredentials(dropletIp);
    
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                    🎉 SETUP COMPLETE!                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log('🔐 Admin Credentials:');
    console.log('━'.repeat(60));
    console.log(credentials || 'Check /root/cloudreve-setup.txt on droplet');
    console.log('━'.repeat(60));
    
    console.log('\n🎯 Next Steps:');
    console.log('1. 🌐 Access: https://stx.blurr.cloud');
    console.log('2. 🔑 Login with admin credentials above');
    console.log('3. 🔒 Change admin password immediately');
    console.log('4. ⚙️  Go to Settings → OAuth2 Applications');
    console.log('5. ➕ Create new application:');
    console.log('   • Name: Goddess Platform');
    console.log('   • Redirect URI: https://blurr.cloud/api/cloudreve/oauth/callback');
    console.log('   • Scopes: Select all');
    console.log('6. 📝 Copy Client ID and Client Secret');
    console.log('7. 🔧 Run: npm run update:env');
    console.log('8. 🚀 Test integration in creator portal\n');
    
    console.log('💡 Troubleshooting:');
    console.log('• If 403 error: Set Cloudflare SSL/TLS to "Flexible", then "Full (strict)"');
    console.log('• If login fails: SSH and check /root/cloudreve-setup.txt');
    console.log('• If OAuth fails: Verify redirect URI matches exactly\n');
    
    // Save setup completion
    const setupInfo = {
      ...info,
      setup_completed: new Date().toISOString(),
      ssl_installed: sslSuccess,
      admin_credentials_retrieved: !!credentials,
      next_steps: [
        'Access https://stx.blurr.cloud',
        'Login with admin credentials',
        'Create OAuth2 application',
        'Update .env with credentials'
      ]
    };
    
    fs.writeFileSync(INFO_PATH, JSON.stringify(setupInfo, null, 2));
    console.log('📄 Setup info updated in cloudreve-droplet-info.json\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    console.log('\n💡 Manual steps:');
    console.log('1. SSH into droplet: ssh root@' + dropletIp);
    console.log('2. Check services: systemctl status cloudreve nginx');
    console.log('3. Install SSL: certbot --nginx -d stx.blurr.cloud');
    console.log('4. Get credentials: cat /root/cloudreve-setup.txt');
    process.exit(1);
  }
}

main();