#!/usr/bin/env tsx
/**
 * Checks existing R2 API tokens and bucket status via Cloudflare API.
 */
import * as https from "https";
import * as fs from "fs";
import * as path from "path";

const envPath = path.join(__dirname, "..", ".env");
// Parse .env — last value wins for duplicates
const envVars: Record<string, string> = {};
fs.readFileSync(envPath, "utf-8").split("\n").forEach(l => {
  const m = l.match(/^([^#=\s]+)\s*=\s*"?([^"#]*)"?\s*$/);
  if (m) envVars[m[1].trim()] = m[2].trim();
});

const CF_TOKEN = envVars.CLOUDFLARE_API_TOKEN;
const CF_ACCOUNT = envVars.CLOUDFLARE_ACCOUNT_ID;

function cfGet(p: string): Promise<any> {
  return new Promise((resolve) => {
    const opts: any = {
      hostname: "api.cloudflare.com", port: 443,
      path: `/client/v4${p}`, method: "GET",
      headers: { Authorization: `Bearer ${CF_TOKEN}`, "Content-Type": "application/json" },
    };
    const r = https.request(opts, res => {
      let b = ""; res.on("data", d => b += d);
      res.on("end", () => { try { resolve(JSON.parse(b)); } catch { resolve({ _raw: b }); } });
    });
    r.on("error", e => resolve({ error: e.message }));
    r.end();
  });
}

async function main() {
  console.log("CF Account:", CF_ACCOUNT);
  console.log("CF Token (first 20):", CF_TOKEN?.slice(0, 20) + "...\n");

  // Check R2 bucket exists
  console.log("=== R2 Bucket xanna-media ===");
  const bucket = await cfGet(`/accounts/${CF_ACCOUNT}/r2/buckets/xanna-media`);
  console.log(JSON.stringify(bucket, null, 2).slice(0, 400));

  // Check what the current R2_ACCESS_KEY_ID looks like
  console.log("\n=== Current .env R2 values ===");
  console.log("R2_ACCESS_KEY_ID:", envVars.R2_ACCESS_KEY_ID?.slice(0, 20) + "...");
  console.log("R2_SECRET_ACCESS_KEY:", envVars.R2_SECRET_ACCESS_KEY?.slice(0, 20) + "...");
  console.log("R2_ENDPOINT:", envVars.R2_ENDPOINT);

  // R2 S3 Access Key IDs are typically 32-char hex strings
  // Cloudflare Account IDs are also 32-char hex — check if they match
  const keyId = envVars.R2_ACCESS_KEY_ID;
  const accountId = envVars.CLOUDFLARE_ACCOUNT_ID;
  if (keyId === accountId) {
    console.log("\n⚠️  R2_ACCESS_KEY_ID matches CLOUDFLARE_ACCOUNT_ID — this is WRONG.");
    console.log("   R2 S3 credentials are different from your account ID.");
    console.log("   They look like: 32-char hex for key ID, longer string for secret.");
  }

  // Check if the secret looks like a CF API token (starts with cfat_)
  const secret = envVars.R2_SECRET_ACCESS_KEY;
  if (secret?.startsWith("cfat_")) {
    console.log("\n⚠️  R2_SECRET_ACCESS_KEY looks like a CF API token (starts with cfat_).");
    console.log("   R2 S3 secrets are different — they're generated when you create an R2 API token.");
  }

  console.log("\n📋 How to get correct R2 S3 credentials:");
  console.log("   1. Go to https://dash.cloudflare.com");
  console.log("   2. Click R2 in the left sidebar");
  console.log("   3. Click 'Manage R2 API Tokens' (top right)");
  console.log("   4. Click 'Create API Token'");
  console.log("   5. Set: Permissions = Object Read & Write");
  console.log("   6. Set: Specify bucket = xanna-media");
  console.log("   7. Click Create API Token");
  console.log("   8. Copy the 'Access Key ID' (32-char hex, NOT your account ID)");
  console.log("   9. Copy the 'Secret Access Key' (longer string, NOT a cfat_ token)");
  console.log("  10. Update .env with these two values");
}

main().catch(console.error);
