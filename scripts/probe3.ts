#!/usr/bin/env tsx
import * as https from "https";
import * as dns from "dns";
import { promisify } from "util";

const CF  = "cfat_Fkc32uqVBfPXgm4p7H6ThfFoFjhb3BvmCqCaMb2y8700e4b9";
const CF_ACCOUNT = "c08ec4594091cc1873b26470316f876c";

const resolve4 = promisify(dns.resolve4);

function cfGet(path: string): Promise<any> {
  return new Promise((resolve) => {
    const opts = {
      hostname: "api.cloudflare.com", port: 443, path: `/client/v4${path}`, method: "GET",
      headers: { Authorization: `Bearer ${CF}`, "Content-Type": "application/json" },
    };
    const r = https.request(opts, res => {
      let b = ""; res.on("data", d => b += d);
      res.on("end", () => { try { resolve(JSON.parse(b)); } catch { resolve({ _raw: b.slice(0, 800) }); } });
    });
    r.on("error", e => resolve({ error: e.message }));
    r.end();
  });
}

function cfPost(path: string, body: any): Promise<any> {
  return new Promise((resolve) => {
    const bodyStr = JSON.stringify(body);
    const opts: any = {
      hostname: "api.cloudflare.com", port: 443, path: `/client/v4${path}`, method: "POST",
      headers: { Authorization: `Bearer ${CF}`, "Content-Type": "application/json", "Content-Length": Buffer.byteLength(bodyStr) },
    };
    const r = https.request(opts, res => {
      let b = ""; res.on("data", d => b += d);
      res.on("end", () => { try { resolve(JSON.parse(b)); } catch { resolve({ _raw: b.slice(0, 800) }); } });
    });
    r.on("error", e => resolve({ error: e.message }));
    r.write(bodyStr);
    r.end();
  });
}

async function main() {
  // DNS lookup for sirhx.space
  console.log("=== DNS LOOKUP sirhx.space ===");
  try {
    const ips = await resolve4("sirhx.space");
    console.log("  A records:", ips);
  } catch (e: any) { console.log("  Error:", e.message); }

  // Check if sirhx.space is a zone in CF
  console.log("\n=== CF ZONE sirhx.space ===");
  const sz = await cfGet("/zones?name=sirhx.space");
  console.log(JSON.stringify(sz).slice(0, 400));

  // Try creating a new CF API token with full permissions
  console.log("\n=== CREATE NEW CF TOKEN (DNS+R2+Workers) ===");
  const newToken = await cfPost("/user/api-tokens", {
    name: "goddess-platform-full",
    policies: [
      {
        effect: "allow",
        resources: { "com.cloudflare.api.account.*": "*" },
        permission_groups: [
          { id: "c8fed203ed3043cba015a93ad1616fb1", name: "Zone Read" },
          { id: "82e64a83756745bbbb1c9c2701bf816b", name: "DNS Write" },
          { id: "4755a26aeef041a5b4ac5b4e89f0e1a7", name: "R2 Write" },
          { id: "3030687196b94b638145a3953da2b699", name: "Workers R2 Storage Write" },
          { id: "f7f0eda5697f41d8a6d0e9f01f7e6e6e", name: "Workers KV Storage Write" },
        ],
      },
    ],
    condition: {},
  });
  console.log(JSON.stringify(newToken, null, 2).slice(0, 800));

  // R2 bucket details
  console.log("\n=== R2 BUCKET blurr-drop-odin DETAILS ===");
  const bucket = await cfGet(`/accounts/${CF_ACCOUNT}/r2/buckets/blurr-drop-odin`);
  console.log(JSON.stringify(bucket, null, 2).slice(0, 400));
}

main().catch(console.error);
