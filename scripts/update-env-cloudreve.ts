#!/usr/bin/env tsx
/**
 * Update .env with new Cloudreve credentials
 * Run this after creating the OAuth2 app in Cloudreve admin panel
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// Load environment variables from .env file
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

const ENV_PATH = path.join(__dirname, '..', '.env');
const INFO_PATH = path.join(__dirname, '..', 'cloudreve-droplet-info.json');

interface DropletInfo {
  public_ip: string;
  subdomain: string;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Update .env with Cloudreve OAuth Credentials          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Load droplet info
  let dropletInfo: DropletInfo | null = null;
  if (fs.existsSync(INFO_PATH)) {
    dropletInfo = JSON.parse(fs.readFileSync(INFO_PATH, 'utf-8'));
    console.log(`✓ Found droplet info: ${dropletInfo.subdomain}`);
  } else {
    console.log('⚠️  No droplet info found. Using manual input.');
  }

  const subdomain = dropletInfo?.subdomain || 'stx.blurr.cloud';
  const baseUrl = `https://${subdomain}`;

  console.log('\n📝 Please provide the OAuth2 credentials from Cloudreve admin panel:');
  console.log(`   (Settings → OAuth2 Applications → Your App)\n`);

  const clientId = await question('Client ID: ');
  const clientSecret = await question('Client Secret: ');

  if (!clientId || !clientSecret) {
    console.error('\n❌ Error: Client ID and Client Secret are required');
    rl.close();
    process.exit(1);
  }

  // Read current .env
  let envContent = '';
  if (fs.existsSync(ENV_PATH)) {
    envContent = fs.readFileSync(ENV_PATH, 'utf-8');
  }

  // Update or add Cloudreve configuration
  const updates = {
    CLOUDREVE_BASE_URL: baseUrl,
    CLOUDREVE_CLIENT_ID: clientId,
    CLOUDREVE_CLIENT_SECRET: clientSecret,
    CLOUDREVE_REDIRECT_URI: 'https://blurr.cloud/api/cloudreve/oauth/callback',
    CLOUDREVE_AUTHORIZE_URL: `${baseUrl}/session/authorize`,
    CLOUDREVE_TOKEN_URL: `${baseUrl}/api/v4/session/oauth/token`,
    CLOUDREVE_REFRESH_URL: `${baseUrl}/api/v4/session/token/refresh`,
    CLOUDREVE_USERINFO_URL: `${baseUrl}/api/v4/session/oauth/userinfo`,
    CLOUDREVE_SCOPES: 'openid email profile offline_access UserInfo.Read UserSecurityInfo.Read Files.Read Shares.Read Workflow.Read Finance.Read DavAccount.Read Admin.Read',
  };

  // Update each variable
  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(envContent)) {
      // Update existing
      envContent = envContent.replace(regex, `${key}="${value}"`);
    } else {
      // Add new
      envContent += `\n${key}="${value}"`;
    }
  }

  // Write back to .env
  fs.writeFileSync(ENV_PATH, envContent.trim() + '\n');

  console.log('\n✅ .env file updated successfully!\n');
  console.log('Updated variables:');
  for (const key of Object.keys(updates)) {
    console.log(`  ✓ ${key}`);
  }

  console.log('\n📋 Next steps:');
  console.log('  1. Restart your development server: npm run dev');
  console.log('  2. Test OAuth flow in creator portal → storage');
  console.log('  3. Try uploading a file\n');

  rl.close();
}

main().catch(err => {
  console.error('Error:', err);
  rl.close();
  process.exit(1);
});
