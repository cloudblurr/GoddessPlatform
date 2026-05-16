#!/usr/bin/env tsx
/**
 * Setup SSH key authentication on the droplet
 * After this, all SSH commands will work without password prompts
 */

import { execSync, spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const INFO_PATH = path.join(__dirname, '..', 'cloudreve-droplet-info.json');
const KEY_PATH = path.join(process.env.USERPROFILE || 'C:/Users/Administrator', '.ssh', 'id_rsa_cloudreve');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (q: string) => new Promise<string>(r => rl.question(q, r));

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║              Setup SSH Key Authentication                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const info = JSON.parse(fs.readFileSync(INFO_PATH, 'utf-8'));
  const ip = info.public_ip;

  console.log(`🎯 Droplet IP: ${ip}\n`);

  // Generate SSH key if it doesn't exist
  if (!fs.existsSync(KEY_PATH)) {
    console.log('🔑 Generating SSH key...');
    execSync(`ssh-keygen -t rsa -b 4096 -f "${KEY_PATH}" -N "" -q`);
    console.log(`✅ SSH key generated: ${KEY_PATH}`);
  } else {
    console.log(`✅ SSH key already exists: ${KEY_PATH}`);
  }

  const pubKey = fs.readFileSync(`${KEY_PATH}.pub`, 'utf-8').trim();
  console.log(`\n📋 Public key: ${pubKey.substring(0, 50)}...`);

  // Get password from user
  const password = await question('\n🔑 Enter droplet root password (from email): ');
  rl.close();

  console.log('\n🔧 Installing SSH key on droplet...');

  // Use sshpass if available, otherwise use expect
  const installCmd = `echo "${pubKey}" | ssh -o StrictHostKeyChecking=no root@${ip} "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo 'SSH key installed'"`;
  
  // Write a PowerShell script to handle the password
  const psScript = `
$password = '${password}'
$ip = '${ip}'
$pubKey = '${pubKey}'

# Use plink if available (PuTTY)
if (Get-Command plink -ErrorAction SilentlyContinue) {
    echo y | plink -ssh -pw $password root@$ip "mkdir -p ~/.ssh && echo '$pubKey' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo 'SSH key installed'"
} else {
    Write-Host "Please run this command manually:"
    Write-Host "ssh-copy-id -i ${KEY_PATH}.pub root@$ip"
    Write-Host ""
    Write-Host "Or paste this into your SSH session:"
    Write-Host "echo '$pubKey' >> ~/.ssh/authorized_keys"
}
`;

  const psPath = path.join(__dirname, '..', 'temp-ssh-setup.ps1');
  fs.writeFileSync(psPath, psScript);

  const result = spawnSync('powershell', ['-ExecutionPolicy', 'Bypass', '-File', psPath], {
    stdio: 'inherit',
    timeout: 30000
  });

  fs.unlinkSync(psPath);

  if (result.status === 0) {
    console.log('\n✅ SSH key installed!');
    console.log('\n🎯 Now run all automation without password prompts:');
    console.log('   npm run fix:droplet');
  } else {
    console.log('\n⚠️  Automatic key installation failed.');
    console.log('\n📋 Manual steps:');
    console.log(`1. SSH into droplet: ssh root@${ip}`);
    console.log(`2. Run: echo "${pubKey}" >> ~/.ssh/authorized_keys`);
    console.log(`3. Run: chmod 600 ~/.ssh/authorized_keys`);
    console.log('4. Then all automation scripts will work without passwords');
  }
}

main().catch(console.error);