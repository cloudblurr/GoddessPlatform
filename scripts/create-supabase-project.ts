#!/usr/bin/env tsx
/**
 * Creates a Supabase project via the Management API.
 * Requires SUPABASE_ACCESS_TOKEN in env or passed as arg.
 * Get your token at: https://supabase.com/dashboard/account/tokens
 */
import * as https from "https";
import * as fs from "fs";
import * as path from "path";

const ENV_PATH = path.join(__dirname, "..", ".env");

// Load env
fs.readFileSync(ENV_PATH, "utf-8").split("\n").forEach(l => {
  const m = l.match(/^([^#=\s]+)\s*=\s*"?([^"]*)"?/);
  if (m) process.env[m[1]] = m[2];
});

const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || process.argv[2];

function sbReq(method: string, p: string, body?: any, token?: string): Promise<any> {
  return new Promise((resolve) => {
    const bodyStr = body ? JSON.stringify(body) : undefined;
    const opts: any = {
      hostname: "api.supabase.com", port: 443, path: p, method,
      headers: {
        Authorization: `Bearer ${token || ACCESS_TOKEN}`,
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
  let content = fs.readFileSync(ENV_PATH, "utf-8");
  const regex = new RegExp(`^${key}=.*$`, "m");
  const line = `${key}="${value}"`;
  content = regex.test(content) ? content.replace(regex, line) : content.trimEnd() + `\n${line}\n`;
  fs.writeFileSync(ENV_PATH, content);
  console.log(`  ✅ .env: ${key}`);
}

async function main() {
  if (!ACCESS_TOKEN) {
    console.log("❌ No SUPABASE_ACCESS_TOKEN found.");
    console.log("   1. Go to https://supabase.com/dashboard/account/tokens");
    console.log("   2. Create a token named 'goddess-platform'");
    console.log("   3. Add to .env: SUPABASE_ACCESS_TOKEN=sbp_...");
    console.log("   4. Re-run: npx tsx scripts/create-supabase-project.ts");
    process.exit(1);
  }

  console.log("🔍 Checking existing Supabase projects...");
  const projects = await sbReq("GET", "/v1/projects");
  if (Array.isArray(projects)) {
    console.log(`  Found ${projects.length} project(s):`);
    for (const p of projects) {
      console.log(`    ${p.id} | ${p.name} | ${p.region} | ${p.status}`);
    }

    // Check if xanna project already exists
    const existing = projects.find((p: any) =>
      p.name?.toLowerCase().includes("xanna") || p.name?.toLowerCase().includes("goddess")
    );
    if (existing) {
      console.log(`\n  ✅ Found existing project: ${existing.name} (${existing.id})`);
      await saveProjectKeys(existing.id);
      return;
    }
  } else {
    console.log("  Response:", JSON.stringify(projects).slice(0, 300));
  }

  // Get organizations
  console.log("\n🏢 Getting organizations...");
  const orgs = await sbReq("GET", "/v1/organizations");
  let orgId = "";
  if (Array.isArray(orgs) && orgs.length > 0) {
    orgId = orgs[0].id;
    console.log(`  Using org: ${orgs[0].name} (${orgId})`);
  } else {
    console.log("  Orgs response:", JSON.stringify(orgs).slice(0, 300));
    console.log("  ⚠️  Could not get org ID, trying without...");
  }

  // Create project
  console.log("\n🚀 Creating xanna-platform Supabase project...");
  const dbPass = `xAnna_${Math.random().toString(36).slice(2, 10)}_${Math.random().toString(36).slice(2, 6)}!`;
  const createBody: any = {
    name: "xanna-platform",
    db_pass: dbPass,
    region: "us-east-1",
    plan: "free",
  };
  if (orgId) createBody.organization_id = orgId;

  const created = await sbReq("POST", "/v1/projects", createBody);
  console.log("  Create response:", JSON.stringify(created).slice(0, 500));

  if (created.id) {
    console.log(`\n  ✅ Project created: ${created.name} (${created.id})`);
    setEnv("SUPABASE_DB_PASSWORD", dbPass);
    // Wait for project to be ready
    console.log("  ⏳ Waiting for project to initialize (30s)...");
    await new Promise(r => setTimeout(r, 30000));
    await saveProjectKeys(created.id);
  } else {
    console.log("  ❌ Project creation failed:", JSON.stringify(created).slice(0, 400));
  }
}

async function saveProjectKeys(projectId: string) {
  console.log(`\n🔑 Getting API keys for project ${projectId}...`);
  const keys = await sbReq("GET", `/v1/projects/${projectId}/api-keys`);
  console.log("  Keys response:", JSON.stringify(keys).slice(0, 500));

  if (Array.isArray(keys)) {
    const anon = keys.find((k: any) => k.name === "anon" || k.name === "anon key");
    const service = keys.find((k: any) => k.name === "service_role" || k.name === "service role");
    if (anon) setEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", anon.api_key);
    if (service) setEnv("SUPABASE_SERVICE_ROLE_KEY", service.api_key);
  }

  // Get project URL
  const project = await sbReq("GET", `/v1/projects/${projectId}`);
  if (project.id) {
    const url = `https://${project.id}.supabase.co`;
    setEnv("NEXT_PUBLIC_SUPABASE_URL", url);
    setEnv("SUPABASE_PROJECT_ID", project.id);
    console.log(`\n  ✅ Supabase URL: ${url}`);
  }
}

main().catch(console.error);
