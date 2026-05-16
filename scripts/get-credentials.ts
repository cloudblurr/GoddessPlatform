#!/usr/bin/env tsx
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const INFO_PATH = path.join(__dirname, '..', 'cloudreve-droplet-info.json');
const KEY_PATH = path.join(process.env.USERPROFILE || 'C:/Users/Administrator', '.ssh', 'cloudreve_key');

function runSSH(ip: string, command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn('ssh', [
      '-i', KEY_PATH,
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'UserKnownHostsFile=/dev/null',
      '-o', 'LogLevel=ERROR',
      '-o', 'PasswordAuthentication=no',
      `root@${ip}`, command
    ], { stdio: 'inherit' });
    proc.on('close', () => resolve());
    proc.on('error', reject);
  });
}

async function main() {
  const info = JSON.parse(fs.readFileSync(INFO_PATH, 'utf-8'));
  const ip = info.public_ip;
  
  console.log('🔐 Getting Cloudreve admin credentials...\n');
  
  await runSSH(ip, `
    echo "=== CLOUDREVE ADMIN CREDENTIALS ==="
    journalctl -u cloudreve --no-pager 2>/dev/null | grep -A 5 "Admin user name" | tail -n 10
    echo ""
    echo "=== ALTERNATIVE: Check log file ==="
    cat /opt/cloudreve/cloudreve.log 2>/dev/null | grep -A 5 "Admin" | tail -n 10 || true
    echo ""
    echo "=== RESTART AND CAPTURE ==="
    systemctl restart cloudreve
    sleep 8
    journalctl -u cloudreve --no-pager -n 50 | grep -i "admin\\|password\\|initial" | tail -n 10
    echo ""
    echo "=== SERVICE STATUS ==="
    systemctl status cloudreve --no-pager | head -n 10
    echo ""
    echo "Access: http://${ip}"
  `);
}

main().catch(console.error);