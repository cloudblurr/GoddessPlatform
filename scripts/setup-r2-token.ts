#!/usr/bin/env tsx
/**
 * Creates an R2 API token (S3-compatible credentials) for the xanna-media bucket.
 * The correct CF endpoint is /accounts/{id}/r2/api-tokens (POST with specific schema).
 */
import * as https from "https";
import * as fs from "fs";
import * as path from "path";

const CF = "cfat_Fkc32uqVBfPXgm4p7H6ThfFoFjhb3BvmCqCaMb2y8700e4b9";
const CF_ACCOUNT = "c08ec4594091cc1873b26470316f876c";
const BUCKET = "xanna-media";
const ENV_PATH = path.join(__dirname, "..", ".env");

function cfReq(method: string, p: string, body?: any): Promise<any> {
  return new Promise((resolve) => {
    const bodyStr = body ? JSON.stringify(body) : undefined;
    const opts: any = {
      hostname: "api.cloudflare.com", port: 443,
      path: `/client/v4${p}`, method,
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
  console.log(`  ✅ .env: ${key}`);
}

async function main() {
  console.log("🔑 Creating R2 S3-compatible API token for xanna-media...\n");

  // The correct endpoint for R2 API tokens uses the user-level token API
  // with specific permission groups for R2
  const res = await cfReq("POST", `/accounts/${CF_ACCOUNT}/r2/api-tokens`, {
    bucketName: BUCKET,
    permission: "object-read-write",
  });
  console.log("Attempt 1:", JSON.stringify(res).slice(0, 400));

  // Try the correct schema per CF docs
  const res2 = await cfReq("POST", `/accounts/${CF_ACCOUNT}/r2/api-tokens`, {
    bucket: BUCKET,
    permissions: ["read", "write"],
  });
  console.log("Attempt 2:", JSON.stringify(res2).slice(0, 400));

  // Try listing existing R2 tokens
  const list = await cfReq("GET", `/accounts/${CF_ACCOUNT}/r2/api-tokens`);
  console.log("\nExisting R2 tokens:", JSON.stringify(list).slice(0, 600));

  // Try the user-level token creation with R2 permission groups
  // Permission group IDs from CF docs for R2
  const res3 = await cfReq("POST", `/user/api-tokens`, {
    name: `xanna-r2-${Date.now()}`,
    policies: [
      {
        effect: "allow",
        resources: {
          [`com.cloudflare.api.account.${CF_ACCOUNT}`]: "*",
        },
        permission_groups: [
          { id: "4755a26aeef041a5b4ac5b4e89f0e1a7" }, // Workers R2 Storage Write
          { id: "3030687196b94b638145a3953da2b699" }, // Workers R2 Storage Read
        ],
      },
    ],
  });
  console.log("\nUser token attempt:", JSON.stringify(res3).slice(0, 600));

  // Check what permission groups are available
  const perms = await cfReq("GET", `/accounts/${CF_ACCOUNT}/iam/permission-groups?feature=r2`);
  console.log("\nR2 permission groups:", JSON.stringify(perms).slice(0, 800));
}

main().catch(console.error);
