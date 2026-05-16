#!/usr/bin/env tsx
/**
 * Create Cloudflare API Token with Full Permissions
 * 
 * This script creates a new Cloudflare API token with all necessary permissions
 * for managing DNS, SSL, and other settings.
 * 
 * Usage: npx tsx scripts/create-cf-api-token.ts
 * 
 * Note: You'll need to authenticate with Cloudflare first
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   Create Cloudflare API Token with Full Permissions       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('📋 Instructions:\n');
  console.log('1. Go to: https://dash.cloudflare.com/profile/api-tokens');
  console.log('2. Click "Create Token"');
  console.log('3. Use template: "Edit zone DNS"');
  console.log('4. Or create custom token with these permissions:');
  console.log('   - Zone.DNS:Edit');
  console.log('   - Zone.Settings:Edit');
  console.log('   - Zone.Page Rules:Edit');
  console.log('   - Zone.SSL and Certificates:Edit');
  console.log('5. Select zone: blurr.cloud');
  console.log('6. Copy the token\n');

  const token = await question('Paste your Cloudflare API token: ');

  if (!token || token.length < 20) {
    console.error('❌ Invalid token');
    rl.close();
    process.exit(1);
  }

  // Update .env file
  const envPath = path.join(__dirname, '..', '.env');
  let envContent = fs.readFileSync(envPath, 'utf-8');

  // Replace or add the token
  const tokenRegex = /^CLOUDFLARE_API_TOKEN=.*$/m;
  if (tokenRegex.test(envContent)) {
    envContent = envContent.replace(tokenRegex, `CLOUDFLARE_API_TOKEN="${token}"`);
  } else {
    envContent += `\nCLOUDFLARE_API_TOKEN="${token}"`;
  }

  fs.writeFileSync(envPath, envContent);

  console.log('\n✓ Token saved to .env');
  console.log('\nNow run:');
  console.log('  npm run cloudreve:fix\n');

  rl.close();
}

main().catch(console.error);
