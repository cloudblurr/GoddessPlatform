#!/usr/bin/env tsx
/**
 * Create Cloudflare API Token with Zone SSL permissions
 */

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
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;

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
          console.log('API Response:', JSON.stringify(parsed, null, 2));
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

async function getZoneId(): Promise<string> {
  console.log('🔍 Getting zone ID for blurr.cloud...');
  
  const response = await cfRequest('GET', '/client/v4/zones?name=blurr.cloud');
  
  if (response.success && response.result && response.result.length > 0) {
    const zoneId = response.result[0].id;
    console.log(`✓ Zone ID: ${zoneId}`);
    return zoneId;
  } else {
    throw new Error('Zone not found or API error');
  }
}

async function createZoneToken(zoneId: string): Promise<string> {
  console.log('🔧 Creating new API token with zone permissions...');
  
  const tokenData = {
    name: 'Goddess Platform - Zone SSL Management',
    policies: [
      {
        effect: 'allow',
        resources: {
          'com.cloudflare.api.zone.*': `*`,
          [`com.cloudflare.api.zone.${zoneId}`]: '*'
        },
        permission_groups: [
          {
            id: 'zone_settings_read',
            name: 'Zone Settings:Read'
          },
          {
            id: 'zone_settings_edit', 
            name: 'Zone Settings:Edit'
          },
          {
            id: 'dns_records_read',
            name: 'DNS Records:Read'
          }
        ]
      }
    ],
    condition: {
      request_ip: {
        in: [],
        not_in: []
      }
    }
  };

  const response = await cfRequest('POST', '/client/v4/user/tokens', tokenData);
  
  if (response.success && response.result) {
    const newToken = response.result.value;
    console.log(`✅ New token created: ${newToken.substring(0, 10)}...`);
    return newToken;
  } else {
    throw new Error('Failed to create token');
  }
}

async function testToken(token: string, zoneId: string): Promise<boolean> {
  console.log('🧪 Testing new token...');
  
  // Temporarily use new token
  const originalToken = process.env.CLOUDFLARE_API_TOKEN;
  process.env.CLOUDFLARE_API_TOKEN = token;
  
  try {
    const response = await cfRequest('GET', `/client/v4/zones/${zoneId}/settings/ssl`);
    
    if (response.success) {
      console.log(`✅ Token works! Current SSL mode: ${response.result.value}`);
      return true;
    } else {
      console.log('❌ Token test failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Token test error:', error);
    return false;
  } finally {
    // Restore original token
    process.env.CLOUDFLARE_API_TOKEN = originalToken;
  }
}

async function updateEnvFile(newToken: string): Promise<void> {
  console.log('📝 Updating .env file with new token...');
  
  const envPath = path.join(__dirname, '..', '.env');
  let envContent = fs.readFileSync(envPath, 'utf-8');
  
  // Add new token
  if (envContent.includes('CLOUDFLARE_ZONE_TOKEN=')) {
    envContent = envContent.replace(/CLOUDFLARE_ZONE_TOKEN=.*$/m, `CLOUDFLARE_ZONE_TOKEN="${newToken}"`);
  } else {
    envContent += `\nCLOUDFLARE_ZONE_TOKEN="${newToken}"\n`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file updated with CLOUDFLARE_ZONE_TOKEN');
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║            Create Cloudflare Zone Token                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (!CF_API_TOKEN) {
    console.error('❌ CLOUDFLARE_API_TOKEN not found in .env file');
    process.exit(1);
  }

  try {
    // Get zone ID
    const zoneId = await getZoneId();
    
    // Create new token with zone permissions
    const newToken = await createZoneToken(zoneId);
    
    // Test the new token
    const tokenWorks = await testToken(newToken, zoneId);
    
    if (tokenWorks) {
      // Update .env file
      await updateEnvFile(newToken);
      
      console.log('\n🎉 Success!');
      console.log('✅ New zone token created and saved to .env');
      console.log('✅ Token has permissions for SSL/TLS management');
      console.log('\n🎯 Now you can run:');
      console.log('   npm run cf:ssl status    # Check current SSL mode');
      console.log('   npm run cf:ssl flexible  # Set to Flexible');
      console.log('   npm run cf:ssl strict    # Set to Full (strict)');
      
    } else {
      console.log('\n❌ Token creation failed or has insufficient permissions');
      console.log('💡 You may need to manually set Cloudflare SSL/TLS to "Flexible"');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    console.log('\n💡 Fallback options:');
    console.log('1. Manually set Cloudflare SSL/TLS to "Flexible"');
    console.log('2. Run: npm run setup:complete');
    console.log('3. After SSL cert installs, set to "Full (strict)"');
  }
}

main();