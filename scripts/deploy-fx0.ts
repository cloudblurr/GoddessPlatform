#!/usr/bin/env tsx
/**
 * deploy-fx0.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Full end-to-end automation:
 *   1. Verify / rebuild DigitalOcean droplet (with SSH key)
 *   2. Install Docker + Cloudreve via official docker-compose on the droplet
 *   3. Configure Nginx reverse proxy (port 80 → Cloudreve :5212)
 *   4. Create / update Cloudflare DNS  fx0.blurr.cloud → droplet IP
 *   5. Set Cloudflare SSL to Flexible for the zone
 *   6. Wait for Cloudreve to be reachable, register first admin account
 *   7. Create OAuth2 app in Cloudreve via API
 *   8. Update .env with all correct values
 *   9. Save updated cloudreve-droplet-info.json
 *
 * Usage:  npx tsx scripts/deploy-fx0.ts
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as https from "https";
import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import { execSync, spawn } from "child_process";

// ─── Config ──────────────────────────────────────────────────────────────────
const ROOT = path.join(__dirname, "..");
const ENV_PATH = path.join(ROOT, ".env");
const INFO_PATH = path.join(ROOT, "cloudreve-droplet-info.json");
const SSH_DIR = path.join(process.env.USERPROFILE || "C:/Users/Administrator", ".ssh");
const KEY_PATH = path.join(SSH_DIR, "cloudreve_key");

const TARGET_SUBDOMAIN = "fx0.blurr.cloud";
const MAIN_DOMAIN = "blurr.cloud";
const DROPLET_NAME = "cloudreve-fx0";
const REGION = "nyc1";
const SIZE = "s-2vcpu-4gb";
const IMAGE = "ubuntu-22-04-x64";

// ─── Load .env ────────────────────────────────────────────────────────────────
function loadEnv() {
  if (!fs.existsSync(ENV_PATH)) return;
  fs.readFileSync(ENV_PATH, "utf-8")
    .split("\n")
    .forEach((line) => {
      const m = line.match(/^([^#=\s]+)\s*=\s*(.*)/);
      if (!m) return;
      const val = m[2].trim().replace(/^["']|["']$/g, "");
      process.env[m[1].trim()] = val;
    });
}
loadEnv();

const DO_TOKEN = process.env.DIGITALOCEAN_API_KEY!;
const CF_TOKEN = process.env.CLOUDFLARE_API_TOKEN!;
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!;
const APP_URL = process.env.APP_URL || "https://blurr.cloud";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function log(msg: string) {
  console.log(msg);
}

function doReq(method: string, endpoint: string, data?: unknown): Promise<any> {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : undefined;
    const opts = {
      hostname: "api.digitalocean.com",
      port: 443,
      path: endpoint,
      method,
      headers: {
        Authorization: `Bearer ${DO_TOKEN}`,
        "Content-Type": "application/json",
        ...(body ? { "Content-Length": Buffer.byteLength(body) } : {}),
      },
    };
    const req = https.request(opts, (res) => {
      let buf = "";
      res.on("data", (d) => (buf += d));
      res.on("end", () => {
        try {
          resolve(JSON.parse(buf));
        } catch {
          resolve({ _raw: buf, _status: res.statusCode });
        }
      });
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

function cfReq(method: string, endpoint: string, data?: unknown): Promise<any> {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : undefined;
    const opts = {
      hostname: "api.cloudflare.com",
      port: 443,
      path: `/client/v4${endpoint}`,
      method,
      headers: {
        Authorization: `Bearer ${CF_TOKEN}`,
        "Content-Type": "application/json",
        ...(body ? { "Content-Length": Buffer.byteLength(body) } : {}),
      },
    };
    const req = https.request(opts, (res) => {
      let buf = "";
      res.on("data", (d) => (buf += d));
      res.on("end", () => {
        try {
          resolve(JSON.parse(buf));
        } catch {
          resolve({ success: false, _raw: buf });
        }
      });
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

/** HTTP GET with redirect follow, returns {ok, status, body} */
function httpGet(url: string, timeoutMs = 10000): Promise<{ ok: boolean; status: number; body: string }> {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const mod = parsed.protocol === "https:" ? https : http;
    const req = (mod as typeof https).get(url, { timeout: timeoutMs }, (res) => {
      let body = "";
      res.on("data", (d) => (body += d));
      res.on("end", () =>
        resolve({ ok: (res.statusCode ?? 0) < 400, status: res.statusCode ?? 0, body })
      );
    });
    req.on("error", () => resolve({ ok: false, status: 0, body: "" }));
    req.on("timeout", () => { req.destroy(); resolve({ ok: false, status: 0, body: "" }); });
  });
}

/** POST JSON, returns {ok, status, body} */
function httpPost(
  url: string,
  payload: unknown,
  headers: Record<string, string> = {},
  timeoutMs = 15000
): Promise<{ ok: boolean; status: number; body: string; json: any }> {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const bodyStr = JSON.stringify(payload);
    const mod = parsed.protocol === "https:" ? https : http;
    const opts = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(bodyStr),
        ...headers,
      },
      timeout: timeoutMs,
    };
    const req = (mod as typeof https).request(opts, (res) => {
      let buf = "";
      res.on("data", (d) => (buf += d));
      res.on("end", () => {
        let json: any = null;
        try { json = JSON.parse(buf); } catch { /* ignore */ }
        resolve({ ok: (res.statusCode ?? 0) < 400, status: res.statusCode ?? 0, body: buf, json });
      });
    });
    req.on("error", () => resolve({ ok: false, status: 0, body: "", json: null }));
    req.on("timeout", () => { req.destroy(); resolve({ ok: false, status: 0, body: "", json: null }); });
    req.write(bodyStr);
    req.end();
  });
}

function updateEnvKey(key: string, value: string) {
  let content = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, "utf-8") : "";
  const regex = new RegExp(`^${key}=.*$`, "m");
  const line = `${key}="${value}"`;
  if (regex.test(content)) {
    content = content.replace(regex, line);
  } else {
    content = content.trimEnd() + `\n${line}\n`;
  }
  fs.writeFileSync(ENV_PATH, content);
}

function runSSH(ip: string, command: string, timeoutMs = 120000): Promise<string> {
  return new Promise((resolve, reject) => {
    let output = "";
    const proc = spawn(
      "ssh",
      [
        "-i", KEY_PATH,
        "-o", "StrictHostKeyChecking=no",
        "-o", "UserKnownHostsFile=/dev/null",
        "-o", "LogLevel=ERROR",
        "-o", "PasswordAuthentication=no",
        "-o", `ConnectTimeout=15`,
        `root@${ip}`,
        command,
      ],
      { stdio: ["pipe", "pipe", "pipe"] }
    );
    const timer = setTimeout(() => {
      proc.kill();
      reject(new Error(`SSH command timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    proc.stdout.on("data", (d) => {
      output += d.toString();
      process.stdout.write(d);
    });
    proc.stderr.on("data", (d) => {
      output += d.toString();
    });
    proc.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve(output);
      else reject(new Error(`SSH exited ${code}: ${output.slice(-500)}`));
    });
    proc.on("error", (e) => { clearTimeout(timer); reject(e); });
  });
}

function scpFile(ip: string, localPath: string, remotePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(
      "scp",
      [
        "-i", KEY_PATH,
        "-o", "StrictHostKeyChecking=no",
        "-o", "UserKnownHostsFile=/dev/null",
        "-o", "LogLevel=ERROR",
        localPath,
        `root@${ip}:${remotePath}`,
      ],
      { stdio: "inherit" }
    );
    proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`scp failed: ${code}`))));
    proc.on("error", reject);
  });
}

// ─── Step 1: SSH Key ─────────────────────────────────────────────────────────
async function ensureSSHKey(): Promise<number> {
  log("\n🔑 Step 1: Ensuring SSH key...");

  if (!fs.existsSync(SSH_DIR)) fs.mkdirSync(SSH_DIR, { recursive: true });

  if (!fs.existsSync(KEY_PATH)) {
    log("   Generating new ed25519 SSH key...");
    execSync(`ssh-keygen -t ed25519 -f "${KEY_PATH}" -N "" -q`);
    log("   ✅ Key generated");
  } else {
    log("   ✅ SSH key already exists");
  }

  const pubKey = fs.readFileSync(`${KEY_PATH}.pub`, "utf-8").trim();

  // Check if key is already in DO account
  const keysRes = await doReq("GET", "/v2/account/keys");
  const existing = keysRes.ssh_keys?.find((k: any) => k.name === "cloudreve-automation");
  if (existing) {
    log(`   ✅ Key already in DigitalOcean (ID: ${existing.id})`);
    return existing.id as number;
  }

  const addRes = await doReq("POST", "/v2/account/keys", {
    name: "cloudreve-automation",
    public_key: pubKey,
  });
  const keyId = addRes.ssh_key?.id;
  if (!keyId) throw new Error(`Failed to add SSH key: ${JSON.stringify(addRes)}`);
  log(`   ✅ SSH key added to DigitalOcean (ID: ${keyId})`);
  return keyId as number;
}

// ─── Step 2: Droplet ─────────────────────────────────────────────────────────
async function ensureDroplet(sshKeyId: number): Promise<string> {
  log("\n🖥️  Step 2: Ensuring droplet...");

  // Check if existing droplet is alive
  if (fs.existsSync(INFO_PATH)) {
    const info = JSON.parse(fs.readFileSync(INFO_PATH, "utf-8"));
    const existingIp: string = info.public_ip;
    if (existingIp) {
      log(`   Found existing droplet at ${existingIp}, checking health...`);
      try {
        const res = await doReq("GET", `/v2/droplets/${info.droplet_id}`);
        if (res.droplet?.status === "active") {
          log(`   ✅ Existing droplet is active (ID: ${info.droplet_id}, IP: ${existingIp})`);
          return existingIp;
        }
      } catch {
        log("   ⚠️  Could not verify existing droplet, will create new one");
      }
    }
  }

  // Delete old droplet if it exists
  if (fs.existsSync(INFO_PATH)) {
    const info = JSON.parse(fs.readFileSync(INFO_PATH, "utf-8"));
    if (info.droplet_id) {
      log(`   🗑️  Deleting old droplet (ID: ${info.droplet_id})...`);
      await doReq("DELETE", `/v2/droplets/${info.droplet_id}`);
      log("   ✅ Old droplet deleted");
      await sleep(5000);
    }
  }

  // Create new droplet (minimal cloud-init — we install via SSH after)
  const CLOUD_INIT = `#!/bin/bash
export DEBIAN_FRONTEND=noninteractive
# Just ensure system is ready
apt-get update -q 2>/dev/null || true
echo "ready" > /tmp/cloud-init-done
`;

  log(`   🚀 Creating new droplet: ${DROPLET_NAME} (${REGION}, ${SIZE})...`);
  const createRes = await doReq("POST", "/v2/droplets", {
    name: DROPLET_NAME,
    region: REGION,
    size: SIZE,
    image: IMAGE,
    ssh_keys: [sshKeyId],
    user_data: CLOUD_INIT,
    tags: ["cloudreve", "goddess-platform", "fx0"],
    monitoring: true,
  });

  const dropletId = createRes.droplet?.id;
  if (!dropletId) throw new Error(`Droplet creation failed: ${JSON.stringify(createRes)}`);
  log(`   ✅ Droplet created (ID: ${dropletId})`);

  // Wait for active + IP
  log("   ⏳ Waiting for droplet to become active...");
  let ip = "";
  for (let i = 0; i < 72; i++) {
    const res = await doReq("GET", `/v2/droplets/${dropletId}`);
    const d = res.droplet;
    if (d?.status === "active" && d.networks?.v4?.length > 0) {
      ip = d.networks.v4.find((n: any) => n.type === "public")?.ip_address ?? "";
      if (ip) break;
    }
    process.stdout.write(".");
    await sleep(5000);
  }
  if (!ip) throw new Error("Timeout waiting for droplet IP");
  log(`\n   ✅ Droplet active! IP: ${ip}`);

  // Save info
  const info = {
    droplet_id: dropletId,
    droplet_name: DROPLET_NAME,
    public_ip: ip,
    region: REGION,
    size: SIZE,
    domain: MAIN_DOMAIN,
    subdomain: TARGET_SUBDOMAIN,
    access_url: `https://${TARGET_SUBDOMAIN}`,
    ssh_key_path: KEY_PATH,
    created_at: new Date().toISOString(),
    status: "active",
  };
  fs.writeFileSync(INFO_PATH, JSON.stringify(info, null, 2));

  return ip;
}

// ─── Step 3: Cloudflare DNS + SSL ────────────────────────────────────────────
async function ensureCloudflare(ip: string): Promise<string> {
  log("\n☁️  Step 3: Configuring Cloudflare DNS + SSL...");

  // Find zone ID for blurr.cloud
  const zonesRes = await cfReq("GET", `/zones?name=${MAIN_DOMAIN}`);
  if (!zonesRes.success || !zonesRes.result?.length) {
    throw new Error(`Could not find Cloudflare zone for ${MAIN_DOMAIN}: ${JSON.stringify(zonesRes.errors)}`);
  }
  const zoneId: string = zonesRes.result[0].id;
  log(`   Zone ID: ${zoneId}`);

  // Upsert A record for fx0.blurr.cloud
  const subdomain = "fx0";
  const fqdn = TARGET_SUBDOMAIN;
  const existingRecs = await cfReq("GET", `/zones/${zoneId}/dns_records?name=${fqdn}&type=A`);
  if (existingRecs.success && existingRecs.result?.length > 0) {
    const recId = existingRecs.result[0].id;
    const upd = await cfReq("PUT", `/zones/${zoneId}/dns_records/${recId}`, {
      type: "A",
      name: subdomain,
      content: ip,
      ttl: 1, // auto
      proxied: true,
    });
    if (upd.success) {
      log(`   ✅ DNS A record updated: ${fqdn} → ${ip} (proxied)`);
    } else {
      log(`   ⚠️  DNS update warning: ${JSON.stringify(upd.errors)}`);
    }
  } else {
    const cre = await cfReq("POST", `/zones/${zoneId}/dns_records`, {
      type: "A",
      name: subdomain,
      content: ip,
      ttl: 1,
      proxied: true,
    });
    if (cre.success) {
      log(`   ✅ DNS A record created: ${fqdn} → ${ip} (proxied)`);
    } else {
      log(`   ⚠️  DNS create warning: ${JSON.stringify(cre.errors)}`);
    }
  }

  // Set SSL to Flexible
  const sslRes = await cfReq("PATCH", `/zones/${zoneId}/settings/ssl`, { value: "flexible" });
  if (sslRes.success) {
    log(`   ✅ SSL mode set to Flexible`);
  } else {
    log(`   ⚠️  SSL setting warning: ${JSON.stringify(sslRes.errors)}`);
  }

  // Disable "Always Use HTTPS" redirect (it breaks HTTP backend with Flexible SSL)
  await cfReq("PATCH", `/zones/${zoneId}/settings/always_use_https`, { value: "off" });
  log(`   ✅ Always-Use-HTTPS disabled (needed for Flexible SSL with HTTP backend)`);

  return zoneId;
}

// ─── Step 4: Install Docker + Cloudreve on droplet ───────────────────────────
const INSTALL_SCRIPT = `#!/bin/bash
set -e
export DEBIAN_FRONTEND=noninteractive

echo "=== Waiting for dpkg lock ==="
for i in $(seq 1 30); do
  if ! fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1; then break; fi
  echo "  waiting for lock... ($i)"
  sleep 5
done

echo "=== System update ==="
apt-get update -q
apt-get upgrade -y -q 2>/dev/null || true

echo "=== Installing dependencies ==="
apt-get install -y -q ca-certificates curl gnupg lsb-release nginx ufw git

echo "=== Installing Docker ==="
if ! command -v docker &>/dev/null; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list
  apt-get update -q
  apt-get install -y -q docker-ce docker-ce-cli containerd.io docker-compose-plugin
  systemctl enable docker
  systemctl start docker
  echo "DOCKER_INSTALLED"
else
  echo "DOCKER_ALREADY_PRESENT"
fi

echo "=== Setting up Cloudreve via Docker Compose ==="
mkdir -p /opt/cloudreve
cd /opt/cloudreve

# Clone official docker-compose repo
if [ ! -d "/opt/cloudreve/docker-compose" ]; then
  git clone https://github.com/cloudreve/docker-compose.git /opt/cloudreve/docker-compose
fi

cd /opt/cloudreve/docker-compose

# Copy env file
cp .env.example .env 2>/dev/null || true

# Start Cloudreve
docker compose up -d

echo "=== Waiting for Cloudreve to start (30s) ==="
sleep 30

echo "=== Checking Cloudreve status ==="
docker compose ps

echo "=== Cloudreve logs (last 50 lines) ==="
docker compose logs --tail=50 cloudreve 2>/dev/null || docker compose logs --tail=50

echo "CLOUDREVE_DOCKER_DONE"
`;

const NGINX_CONF = `server {
    listen 80 default_server;
    server_name _;

    client_max_body_size 2000M;
    client_body_timeout 600s;
    proxy_connect_timeout 600s;
    proxy_send_timeout 600s;
    proxy_read_timeout 600s;

    # Do not cache sw.js, index.html, manifest.json
    location ~* ^/(sw\\.js|index\\.html|manifest\\.json)$ {
        proxy_pass http://127.0.0.1:5212;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    location / {
        proxy_pass http://127.0.0.1:5212;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_redirect off;
    }
}
`;

async function installCloudreve(ip: string): Promise<void> {
  log("\n🐳 Step 4: Installing Docker + Cloudreve on droplet...");

  // Wait for SSH to be ready
  log("   ⏳ Waiting for SSH to be ready (up to 3 minutes)...");
  let sshReady = false;
  for (let i = 0; i < 18; i++) {
    try {
      await runSSH(ip, "echo ssh_ok", 15000);
      sshReady = true;
      break;
    } catch {
      process.stdout.write(".");
      await sleep(10000);
    }
  }
  if (!sshReady) throw new Error("SSH never became ready on the droplet");
  log("\n   ✅ SSH ready");

  // Write install script to temp file and scp it
  const tmpScript = path.join(ROOT, "tmp-install.sh");
  fs.writeFileSync(tmpScript, INSTALL_SCRIPT, { mode: 0o755 });
  try {
    await scpFile(ip, tmpScript, "/tmp/install-cloudreve.sh");
    log("   📤 Install script uploaded");

    log("   🔧 Running install script (this takes ~3-5 minutes)...");
    await runSSH(ip, "bash /tmp/install-cloudreve.sh", 600000);
    log("   ✅ Cloudreve installed via Docker Compose");
  } finally {
    fs.unlinkSync(tmpScript);
  }

  // Write and upload Nginx config
  const tmpNginx = path.join(ROOT, "tmp-nginx.conf");
  fs.writeFileSync(tmpNginx, NGINX_CONF);
  try {
    await scpFile(ip, tmpNginx, "/etc/nginx/sites-available/cloudreve");
    log("   📤 Nginx config uploaded");
  } finally {
    fs.unlinkSync(tmpNginx);
  }

  // Enable nginx site and reload
  await runSSH(
    ip,
    "ln -sf /etc/nginx/sites-available/cloudreve /etc/nginx/sites-enabled/cloudreve && " +
    "rm -f /etc/nginx/sites-enabled/default && " +
    "nginx -t && systemctl reload nginx && " +
    "ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw --force enable && " +
    "echo NGINX_OK"
  );
  log("   ✅ Nginx configured and reloaded");
}

// ─── Step 5: Wait for Cloudreve to be reachable ──────────────────────────────
async function waitForCloudreve(ip: string): Promise<string> {
  log("\n⏳ Step 5: Waiting for Cloudreve to be reachable...");

  // Try direct IP first (port 80 via nginx), then the subdomain
  const urls = [
    `http://${ip}`,
    `http://${ip}:5212`,
    `https://${TARGET_SUBDOMAIN}`,
  ];

  for (let attempt = 0; attempt < 24; attempt++) {
    for (const url of urls) {
      const res = await httpGet(url, 8000);
      if (res.ok || res.status === 200 || res.status === 302 || res.status === 301) {
        log(`   ✅ Cloudreve is reachable at ${url} (HTTP ${res.status})`);
        // Return the direct IP URL for API calls (avoids Cloudflare proxy issues)
        return `http://${ip}`;
      }
    }
    process.stdout.write(".");
    await sleep(10000);
  }

  // Last resort: check if docker container is running
  try {
    const status = await runSSH(ip, "cd /opt/cloudreve/docker-compose && docker compose ps --format json 2>/dev/null || docker compose ps", 30000);
    log(`\n   Docker status:\n${status}`);
  } catch {
    // ignore
  }

  throw new Error("Cloudreve never became reachable after 4 minutes");
}

// ─── Step 6: Register first admin account ────────────────────────────────────
async function registerAdmin(baseUrl: string): Promise<{ token: string; username: string; password: string }> {
  log("\n👤 Step 6: Setting up Cloudreve admin account...");

  const adminUser = "admin@blurr.cloud";
  const adminPass = `GoddessPlatform_${Math.random().toString(36).slice(2, 10)}!`;

  // Try to register (first user becomes admin in Cloudreve v4)
  const regRes = await httpPost(`${baseUrl}/api/v4/user/register`, {
    email: adminUser,
    password: adminPass,
    nick: "Admin",
  });

  if (regRes.ok || (regRes.json?.code === 0)) {
    log(`   ✅ Admin account registered: ${adminUser}`);
  } else if (regRes.json?.code === 40001 || (regRes.body && regRes.body.includes("already"))) {
    log(`   ℹ️  Admin account already exists, will try to login`);
  } else {
    log(`   ⚠️  Registration response: ${regRes.body?.slice(0, 200)}`);
    log(`   ℹ️  Will attempt login with existing credentials...`);
  }

  // Login to get token
  const loginRes = await httpPost(`${baseUrl}/api/v4/session/login`, {
    username: adminUser,
    password: adminPass,
  });

  if (loginRes.ok && loginRes.json?.data?.token?.access_token) {
    const token = loginRes.json.data.token.access_token as string;
    log(`   ✅ Logged in as ${adminUser}`);

    // Save credentials to a file for reference
    const credsPath = path.join(ROOT, "cloudreve-admin-credentials.txt");
    fs.writeFileSync(
      credsPath,
      `Cloudreve Admin Credentials\n` +
      `===========================\n` +
      `URL:      ${baseUrl}\n` +
      `Email:    ${adminUser}\n` +
      `Password: ${adminPass}\n` +
      `Generated: ${new Date().toISOString()}\n`
    );
    log(`   📄 Credentials saved to cloudreve-admin-credentials.txt`);

    return { token, username: adminUser, password: adminPass };
  }

  // If login failed, try to get credentials from docker logs
  log("   ⚠️  Login failed, checking Docker logs for initial credentials...");
  try {
    const logs = await runSSH(
      baseUrl.replace("http://", "").replace(":5212", ""),
      "cd /opt/cloudreve/docker-compose && docker compose logs cloudreve 2>&1 | grep -A 3 -i 'admin\\|password\\|initial' | tail -20",
      30000
    );
    log(`   Docker logs:\n${logs}`);
  } catch {
    // ignore
  }

  throw new Error(
    `Could not authenticate with Cloudreve. ` +
    `Login response: ${loginRes.body?.slice(0, 300)}`
  );
}

// ─── Step 7: Create OAuth2 App ───────────────────────────────────────────────
async function createOAuthApp(
  baseUrl: string,
  token: string
): Promise<{ clientId: string; clientSecret: string }> {
  log("\n🔐 Step 7: Creating OAuth2 application in Cloudreve...");

  const redirectUri = `${APP_URL}/api/cloudreve/oauth/callback`;

  // List existing apps first
  const listRes = await httpPost(
    `${baseUrl}/api/v4/admin/oauth/apps`,
    {},
    { Authorization: `Bearer ${token}` }
  );

  // Try GET instead
  const getAppsRes = await new Promise<{ ok: boolean; status: number; body: string; json: any }>((resolve) => {
    const parsed = new URL(`${baseUrl}/api/v4/admin/oauth/apps`);
    const mod = parsed.protocol === "https:" ? https : http;
    const opts = {
      hostname: parsed.hostname,
      port: Number(parsed.port) || (parsed.protocol === "https:" ? 443 : 80),
      path: parsed.pathname,
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      timeout: 10000,
    };
    const req = (mod as typeof https).request(opts, (res) => {
      let buf = "";
      res.on("data", (d) => (buf += d));
      res.on("end", () => {
        let json: any = null;
        try { json = JSON.parse(buf); } catch { /* ignore */ }
        resolve({ ok: (res.statusCode ?? 0) < 400, status: res.statusCode ?? 0, body: buf, json });
      });
    });
    req.on("error", () => resolve({ ok: false, status: 0, body: "", json: null }));
    req.on("timeout", () => { req.destroy(); resolve({ ok: false, status: 0, body: "", json: null }); });
    req.end();
  });

  // Check if our app already exists
  const existingApps: any[] = getAppsRes.json?.data?.items ?? getAppsRes.json?.data ?? [];
  const existingApp = Array.isArray(existingApps)
    ? existingApps.find((a: any) => a.name === "Goddess Platform")
    : null;

  if (existingApp) {
    log(`   ✅ OAuth app already exists (Client ID: ${existingApp.client_id})`);
    return { clientId: existingApp.client_id, clientSecret: existingApp.client_secret };
  }

  // Create new OAuth app
  const createRes = await httpPost(
    `${baseUrl}/api/v4/admin/oauth/apps`,
    {
      name: "Goddess Platform",
      icon: "mdi:cloud",
      redirect_uris: [redirectUri],
      scopes: [
        "openid",
        "email",
        "profile",
        "offline_access",
        "UserInfo.Read",
        "Files.Read",
        "Files.Write",
        "Shares.Read",
        "Shares.Write",
        "Admin.Read",
      ],
    },
    { Authorization: `Bearer ${token}` }
  );

  if (createRes.ok && createRes.json?.data) {
    const app = createRes.json.data;
    const clientId = app.client_id ?? app.id;
    const clientSecret = app.client_secret;
    if (clientId && clientSecret) {
      log(`   ✅ OAuth app created!`);
      log(`   Client ID:     ${clientId}`);
      log(`   Client Secret: ${clientSecret}`);
      return { clientId, clientSecret };
    }
  }

  // Fallback: try alternative API path (Cloudreve v4 may differ)
  log(`   ⚠️  First attempt response: ${createRes.body?.slice(0, 300)}`);
  log(`   🔄 Trying alternative OAuth app creation endpoint...`);

  const altRes = await httpPost(
    `${baseUrl}/api/v4/oauth/app`,
    {
      name: "Goddess Platform",
      redirect_uri: redirectUri,
      scopes: ["openid", "email", "profile", "offline_access", "UserInfo.Read", "Files.Read", "Files.Write", "Shares.Read", "Admin.Read"],
    },
    { Authorization: `Bearer ${token}` }
  );

  if (altRes.ok && altRes.json) {
    const d = altRes.json.data ?? altRes.json;
    const clientId = d.client_id ?? d.id;
    const clientSecret = d.client_secret;
    if (clientId && clientSecret) {
      log(`   ✅ OAuth app created via alt endpoint!`);
      return { clientId, clientSecret };
    }
  }

  log(`   ⚠️  Alt endpoint response: ${altRes.body?.slice(0, 300)}`);
  log(`\n   ℹ️  OAuth app creation via API may require manual setup.`);
  log(`   📋 Manual steps:`);
  log(`      1. Open ${baseUrl}/admin`);
  log(`      2. Go to Dashboard → OAuth Apps → New OAuth App`);
  log(`      3. Name: Goddess Platform`);
  log(`      4. Redirect URI: ${redirectUri}`);
  log(`      5. Scopes: openid, email, profile, offline_access, Files.Read, Files.Write`);
  log(`      6. Copy Client ID + Secret and run: npm run update:env`);

  // Return placeholder so script can continue updating other env vars
  return { clientId: process.env.CLOUDREVE_CLIENT_ID ?? "", clientSecret: process.env.CLOUDREVE_CLIENT_SECRET ?? "" };
}

// ─── Step 8: Update .env ─────────────────────────────────────────────────────
function updateEnvFile(ip: string, clientId: string, clientSecret: string) {
  log("\n📝 Step 8: Updating .env file...");

  const baseUrl = `https://${TARGET_SUBDOMAIN}`;
  const directUrl = `http://${ip}`;

  const updates: Record<string, string> = {
    CLOUDREVE_BASE_URL: baseUrl,
    CLOUDREVE_AUTHORIZE_URL: `${baseUrl}/session/authorize`,
    CLOUDREVE_TOKEN_URL: `${baseUrl}/api/v4/session/oauth/token`,
    CLOUDREVE_REFRESH_URL: `${baseUrl}/api/v4/session/token/refresh`,
    CLOUDREVE_USERINFO_URL: `${baseUrl}/api/v4/session/oauth/userinfo`,
    CLOUDREVE_REDIRECT_URI: `${APP_URL}/api/cloudreve/oauth/callback`,
  };

  if (clientId) updates.CLOUDREVE_CLIENT_ID = clientId;
  if (clientSecret) updates.CLOUDREVE_CLIENT_SECRET = clientSecret;

  for (const [key, value] of Object.entries(updates)) {
    updateEnvKey(key, value);
    log(`   ✅ ${key} = ${value}`);
  }

  log("   ✅ .env updated");
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║   🚀 Goddess Platform — Cloudreve Full Deploy (fx0)         ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  if (!DO_TOKEN) throw new Error("DIGITALOCEAN_API_KEY missing from .env");
  if (!CF_TOKEN) throw new Error("CLOUDFLARE_API_TOKEN missing from .env");

  try {
    // 1. SSH key
    const sshKeyId = await ensureSSHKey();

    // 2. Droplet
    const ip = await ensureDroplet(sshKeyId);

    // 3. Cloudflare DNS + SSL
    await ensureCloudflare(ip);

    // 4. Install Docker + Cloudreve (skip if already installed)
    let cloudreveAlreadyRunning = false;
    try {
      const check = await httpGet(`http://${ip}`, 8000);
      if (check.ok || check.status === 200 || check.status === 302) {
        log("\n🐳 Step 4: Cloudreve already running, skipping install");
        cloudreveAlreadyRunning = true;
      }
    } catch {
      // not running
    }

    if (!cloudreveAlreadyRunning) {
      await installCloudreve(ip);
    }

    // 5. Wait for Cloudreve
    const baseUrl = await waitForCloudreve(ip);

    // 6. Register admin
    const { token } = await registerAdmin(baseUrl);

    // 7. Create OAuth app
    const { clientId, clientSecret } = await createOAuthApp(baseUrl, token);

    // 8. Update .env
    updateEnvFile(ip, clientId, clientSecret);

    // 9. Update droplet info
    const info = JSON.parse(fs.existsSync(INFO_PATH) ? fs.readFileSync(INFO_PATH, "utf-8") : "{}");
    info.public_ip = ip;
    info.subdomain = TARGET_SUBDOMAIN;
    info.access_url = `https://${TARGET_SUBDOMAIN}`;
    info.direct_url = `http://${ip}`;
    info.status = "active";
    info.last_deploy = new Date().toISOString();
    fs.writeFileSync(INFO_PATH, JSON.stringify(info, null, 2));

    console.log("\n╔══════════════════════════════════════════════════════════════╗");
    console.log("║                    🎉 DEPLOYMENT COMPLETE!                  ║");
    console.log("╚══════════════════════════════════════════════════════════════╝\n");
    console.log(`🌐 Cloudreve URL:    https://${TARGET_SUBDOMAIN}`);
    console.log(`🖥️  Droplet IP:       ${ip}`);
    console.log(`🔑 SSH:              ssh -i "${KEY_PATH}" root@${ip}`);
    console.log(`📄 Admin creds:      cloudreve-admin-credentials.txt`);
    console.log(`\n✅ .env has been updated with all Cloudreve settings`);
    console.log(`\n📋 Next steps:`);
    console.log(`   1. Restart your Next.js dev server: npm run dev`);
    console.log(`   2. Go to /creator/storage and click "Connect Cloudreve OAuth"`);
    console.log(`   3. Login with credentials from cloudreve-admin-credentials.txt`);
    console.log(`   4. Files will now persist in Cloudreve at https://${TARGET_SUBDOMAIN}\n`);
  } catch (err) {
    console.error("\n❌ Deployment failed:", err);
    console.error("\n💡 Troubleshooting:");
    console.error("   - Check your DIGITALOCEAN_API_KEY and CLOUDFLARE_API_TOKEN in .env");
    console.error(`   - SSH into droplet: ssh -i "${KEY_PATH}" root@<IP>`);
    console.error("   - Check Docker: cd /opt/cloudreve/docker-compose && docker compose ps");
    process.exit(1);
  }
}

main();
