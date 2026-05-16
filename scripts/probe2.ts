#!/usr/bin/env tsx
import * as https from "https";

const DO  = process.env.DIGITALOCEAN_API_KEY!;
const CF  = process.env.CLOUDFLARE_API_TOKEN!;
const CF_ACCOUNT = "c08ec4594091cc1873b26470316f876c";

function get(host: string, path: string, token: string): Promise<any> {
  return new Promise((resolve) => {
    const opts = {
      hostname: host, port: 443, path, method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    };
    const r = https.request(opts, res => {
      let b = ""; res.on("data", d => b += d);
      res.on("end", () => { try { resolve(JSON.parse(b)); } catch { resolve({ _raw: b.slice(0, 800) }); } });
    });
    r.on("error", e => resolve({ error: e.message }));
    r.end();
  });
}

function post(host: string, path: string, token: string, body: any): Promise<any> {
  return new Promise((resolve) => {
    const bodyStr = JSON.stringify(body);
    const opts: any = {
      hostname: host, port: 443, path, method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(bodyStr),
      },
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
  // Full R2 response
  console.log("=== CF R2 FULL RESPONSE ===");
  const r2 = await get("api.cloudflare.com", `/client/v4/accounts/${CF_ACCOUNT}/r2/buckets`, CF);
  console.log(JSON.stringify(r2, null, 2).slice(0, 800));

  // Check sirhx.space - try DNS lookup via CF
  console.log("\n=== CF ZONES (all) ===");
  const zones = await get("api.cloudflare.com", "/client/v4/zones?per_page=50", CF);
  if (zones.result) {
    for (const z of zones.result) {
      console.log(`  ${z.id} | ${z.name} | ${z.status}`);
    }
  }

  // blurr.cloud DNS records - look for sirhx
  console.log("\n=== blurr.cloud DNS RECORDS ===");
  const bz = await get("api.cloudflare.com", "/client/v4/zones/60c0f4249ea04c6ca67b176f5b391fda/dns_records?per_page=50", CF);
  if (bz.result) {
    for (const r of bz.result) {
      console.log(`  ${r.type.padEnd(5)} ${r.name.padEnd(30)} -> ${r.content}  proxied=${r.proxied}`);
    }
  } else console.log(JSON.stringify(bz).slice(0, 400));

  // DO droplet details for cloudreve-blurr
  console.log("\n=== DO DROPLET 571028001 DETAIL ===");
  const d = await get("api.digitalocean.com", "/v2/droplets/571028001", DO);
  if (d.droplet) {
    const ip = d.droplet.networks?.v4?.find((n: any) => n.type === "public")?.ip_address;
    console.log(`  Name: ${d.droplet.name}`);
    console.log(`  IP:   ${ip}`);
    console.log(`  Size: ${d.droplet.size_slug}`);
    console.log(`  Status: ${d.droplet.status}`);
    console.log(`  Tags: ${d.droplet.tags?.join(", ")}`);
  }

  // CF account tokens list (to see what tokens exist)
  console.log("\n=== CF ACCOUNT TOKENS ===");
  const tokens = await get("api.cloudflare.com", "/client/v4/user/tokens", CF);
  console.log(JSON.stringify(tokens).slice(0, 600));
}

main().catch(console.error);
