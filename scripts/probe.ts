#!/usr/bin/env tsx
import * as https from "https";

const DO  = "dop_v1_1cfa54209055768a3a82ae48b917c3a21ae3bb13b4eb8ffd12e0109d54ef7b25";
const CF  = "cfat_Fkc32uqVBfPXgm4p7H6ThfFoFjhb3BvmCqCaMb2y8700e4b9";
const CF_ACCOUNT = "c08ec4594091cc1873b26470316f876c";

function get(host: string, path: string, token: string): Promise<any> {
  return new Promise((resolve) => {
    const opts = {
      hostname: host, port: 443, path, method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    };
    const r = https.request(opts, res => {
      let b = ""; res.on("data", d => b += d);
      res.on("end", () => { try { resolve(JSON.parse(b)); } catch { resolve({ _raw: b.slice(0, 600) }); } });
    });
    r.on("error", e => resolve({ error: e.message }));
    r.end();
  });
}

async function main() {
  // --- DigitalOcean ---
  console.log("=== DO DROPLETS ===");
  const dr = await get("api.digitalocean.com", "/v2/droplets?per_page=20", DO);
  if (dr.droplets) {
    for (const d of dr.droplets) {
      const ip = d.networks?.v4?.find((n: any) => n.type === "public")?.ip_address;
      console.log(`  ${d.id} | ${d.name} | ${d.status} | ${ip} | ${d.region?.slug}`);
    }
  } else console.log(JSON.stringify(dr).slice(0, 400));

  // --- CF token verify ---
  console.log("\n=== CF TOKEN VERIFY ===");
  const tv = await get("api.cloudflare.com", "/client/v4/user/tokens/verify", CF);
  console.log(JSON.stringify(tv).slice(0, 400));

  // --- CF zones ---
  console.log("\n=== CF ZONES ===");
  const zones = await get("api.cloudflare.com", "/client/v4/zones?per_page=20", CF);
  if (zones.result) {
    for (const z of zones.result) console.log(`  ${z.id} | ${z.name} | ${z.status}`);
  } else console.log(JSON.stringify(zones).slice(0, 400));

  // --- CF R2 buckets ---
  console.log("\n=== CF R2 BUCKETS ===");
  const r2 = await get("api.cloudflare.com", `/client/v4/accounts/${CF_ACCOUNT}/r2/buckets`, CF);
  if (r2.result) {
    for (const b of r2.result) console.log(`  ${b.name} | ${b.location || "auto"}`);
    if (r2.result.length === 0) console.log("  (none yet)");
  } else console.log(JSON.stringify(r2).slice(0, 400));

  // --- CF DNS for sirhx.space ---
  console.log("\n=== CF DNS sirhx.space ===");
  const dnsZones = await get("api.cloudflare.com", "/client/v4/zones?name=sirhx.space", CF);
  if (dnsZones.result?.length) {
    const zid = dnsZones.result[0].id;
    console.log("  Zone ID:", zid);
    const recs = await get("api.cloudflare.com", `/client/v4/zones/${zid}/dns_records?per_page=20`, CF);
    if (recs.result) {
      for (const r of recs.result) console.log(`  ${r.type} ${r.name} -> ${r.content} proxied=${r.proxied}`);
    }
  } else {
    console.log("  sirhx.space not found in this CF account, checking blurr.cloud...");
    const bz = await get("api.cloudflare.com", "/client/v4/zones?name=blurr.cloud", CF);
    if (bz.result?.length) {
      const zid = bz.result[0].id;
      const recs = await get("api.cloudflare.com", `/client/v4/zones/${zid}/dns_records?per_page=50`, CF);
      if (recs.result) {
        for (const r of recs.result) console.log(`  ${r.type} ${r.name} -> ${r.content} proxied=${r.proxied}`);
      }
    }
  }

  // --- DO SSH keys ---
  console.log("\n=== DO SSH KEYS ===");
  const keys = await get("api.digitalocean.com", "/v2/account/keys", DO);
  if (keys.ssh_keys) {
    for (const k of keys.ssh_keys) console.log(`  ${k.id} | ${k.name} | ${k.fingerprint}`);
  }
}

main().catch(console.error);
