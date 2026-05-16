#!/usr/bin/env tsx
/**
 * setup-infrastructure.ts
 * Creates the xanna-media R2 bucket, R2 API token, and wires everything.
 * Run: npx tsx scripts/setup-infrastructure.ts
 */
import * as https from "https";
import * as fs from "fs";
import * as path from "path";

const CF  = process.env.CLOUDFLARE_API_TOKEN!;
const CF_ACCOUNT = "c08ec4594091cc1873b26470316f876c";
const ENV_PATH = path.join(__dirname, "..", ".env");

function cfReq(method: string, path: string, body?: any): Promise<any> {
  return new Promise((resolve) => {
    const bodyStr = body ? JSON.stringify(body) : undefined;
    const opts: any = {
      hostname: "api.cloudflare.com", port: 443,
      path: `/client/v4${path}`, method,
      headers: {
        Authorization: `Bearer ${CF}`,
        "Content-Type": "application/json",
        ...(bodyStr ? { "Content-Length": Buffer.byteLength(bodyStr) } : {}),
      },
    };
    const r = https.request(opts, res => {
      let b = ""; res.on("data", d => b += d);
      res.on("end", () => { try { resolve(JSON.parse(b)); } catch { resolve({ _raw: b }); } });
    });
    r.on("error", e => resolve({ error: e.message }));
    if (bodyStr) r.write(bodyStr);
    r.end();
  });
}

function setEnv(key: string, value: string) {
  let content = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, "utf-8") : "";
  const regex = new RegExp(`^${key}=.*$`, "m");
  const line = `${key}="${value}"`;
  content = regex.test(content) ? content.replace(regex, line) : content.trimEnd() + `\n${line}\n`;
  fs.writeFileSync(ENV_PATH, content);
  console.log(`  ✅ .env: ${key} set`);
}

async function main() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║   xAnna Infrastructure Setup — R2 + Cloudreve       ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  // ── 1. Create xanna-media R2 bucket ──────────────────────────
  console.log("📦 Step 1: Creating xanna-media R2 bucket...");
  const bucketName = "xanna-media";
  const existing = await cfReq("GET", `/accounts/${CF_ACCOUNT}/r2/buckets/${bucketName}`);
  if (existing.success) {
    console.log(`  ✅ Bucket '${bucketName}' already exists`);
  } else {
    const create = await cfReq("PUT", `/accounts/${CF_ACCOUNT}/r2/buckets/${bucketName}`, {
      name: bucketName,
      locationHint: "wnam",
    });
    if (create.success) {
      console.log(`  ✅ Bucket '${bucketName}' created (WNAM)`);
    } else {
      console.log(`  ⚠️  Bucket create response: ${JSON.stringify(create).slice(0, 300)}`);
    }
  }

  // ── 2. Create R2 API token for S3-compatible access ──────────
  console.log("\n🔑 Step 2: Creating R2 API token...");
  const tokenRes = await cfReq("POST", `/accounts/${CF_ACCOUNT}/r2/api-tokens`, {
    bucketName: bucketName,
    permission: "object-read-write",
    ttlSeconds: 0, // no expiry
  });
  console.log("  R2 token response:", JSON.stringify(tokenRes).slice(0, 500));

  let r2AccessKey = "";
  let r2SecretKey = "";
  let r2Endpoint = `https://${CF_ACCOUNT}.r2.cloudflarestorage.com`;

  if (tokenRes.result) {
    r2AccessKey = tokenRes.result.accessKeyId ?? tokenRes.result.access_key_id ?? "";
    r2SecretKey = tokenRes.result.secretAccessKey ?? tokenRes.result.secret_access_key ?? "";
  }

  if (r2AccessKey && r2SecretKey) {
    console.log(`  ✅ R2 credentials created`);
    setEnv("R2_ACCESS_KEY_ID", r2AccessKey);
    setEnv("R2_SECRET_ACCESS_KEY", r2SecretKey);
  } else {
    console.log("  ⚠️  Could not auto-create R2 token via API (may need dashboard)");
    console.log("  📋 Manual step: Go to Cloudflare Dashboard → R2 → Manage R2 API Tokens");
    console.log(`     Create token with Read+Write on bucket '${bucketName}'`);
    console.log("     Then add R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY to .env");
  }

  // ── 3. Set R2 bucket/endpoint env vars ───────────────────────
  console.log("\n📝 Step 3: Writing R2 config to .env...");
  setEnv("R2_BUCKET_NAME", bucketName);
  setEnv("R2_ENDPOINT", r2Endpoint);
  setEnv("R2_PUBLIC_URL", `https://pub-${CF_ACCOUNT}.r2.dev`); // placeholder, update after enabling public access
  setEnv("CLOUDFLARE_ACCOUNT_ID", CF_ACCOUNT);

  // ── 4. Wire Cloudreve base URL ────────────────────────────────
  console.log("\n🔗 Step 4: Setting Cloudreve base URL to sirhx.space...");
  setEnv("CLOUDREVE_BASE_URL", "https://sirhx.space");
  setEnv("CLOUDREVE_AUTHORIZE_URL", "https://sirhx.space/session/authorize");
  setEnv("CLOUDREVE_TOKEN_URL", "https://sirhx.space/api/v4/session/oauth/token");
  setEnv("CLOUDREVE_REFRESH_URL", "https://sirhx.space/api/v4/session/token/refresh");
  setEnv("CLOUDREVE_USERINFO_URL", "https://sirhx.space/api/v4/session/oauth/userinfo");

  // ── 5. Check R2 bucket CORS (needed for direct uploads) ──────
  console.log("\n🌐 Step 5: Configuring R2 bucket CORS...");
  const cors = await cfReq("PUT", `/accounts/${CF_ACCOUNT}/r2/buckets/${bucketName}/cors`, {
    rules: [
      {
        allowedOrigins: ["*"],
        allowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
        allowedHeaders: ["*"],
        exposeHeaders: ["ETag"],
        maxAgeSeconds: 3600,
      },
    ],
  });
  if (cors.success) {
    console.log("  ✅ CORS configured on R2 bucket");
  } else {
    console.log("  ⚠️  CORS response:", JSON.stringify(cors).slice(0, 300));
  }

  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║   ✅ Infrastructure setup complete                   ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");
  console.log(`  R2 Bucket:   ${bucketName}`);
  console.log(`  R2 Endpoint: ${r2Endpoint}`);
  console.log(`  Cloudreve:   https://sirhx.space`);
  console.log(`  Droplet IP:  142.93.69.25`);
  console.log("\n  ⚠️  If R2 credentials were not auto-created, create them manually");
  console.log("     in the Cloudflare dashboard and add to .env");
}

main().catch(console.error);
