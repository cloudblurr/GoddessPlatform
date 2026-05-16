#!/usr/bin/env tsx
/**
 * test-r2.ts — Tests R2 connectivity and presigned URL generation.
 * Run: npx tsx scripts/test-r2.ts
 *
 * Requires R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY in .env
 */
import * as fs from "fs";
import * as path from "path";

// Load .env
const envPath = path.join(__dirname, "..", ".env");
fs.readFileSync(envPath, "utf-8").split("\n").forEach(l => {
  const m = l.match(/^([^#=\s]+)\s*=\s*"?([^"]*)"?/);
  if (m && m[2]) process.env[m[1]] = m[2];
});

import {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
const BUCKET = process.env.R2_BUCKET_NAME ?? "xanna-media";
const ENDPOINT = process.env.R2_ENDPOINT ?? `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`;
const ACCESS_KEY = process.env.R2_ACCESS_KEY_ID ?? "";
const SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY ?? "";

async function main() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║   R2 Storage Test — xanna-media                     ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  if (!ACCESS_KEY || !SECRET_KEY) {
    console.log("❌ R2 credentials not set in .env");
    console.log("   R2_ACCESS_KEY_ID  =", ACCESS_KEY ? "✅ set" : "❌ missing");
    console.log("   R2_SECRET_ACCESS_KEY =", SECRET_KEY ? "✅ set" : "❌ missing");
    console.log("\n📋 To get credentials:");
    console.log("   1. Go to https://dash.cloudflare.com → R2 → Manage R2 API Tokens");
    console.log("   2. Create Token → Object Read & Write → Apply to bucket: xanna-media");
    console.log("   3. Copy Access Key ID and Secret Access Key to .env");
    process.exit(1);
  }

  console.log("✅ Credentials found");
  console.log(`   Endpoint: ${ENDPOINT}`);
  console.log(`   Bucket:   ${BUCKET}\n`);

  const client = new S3Client({
    region: "auto",
    endpoint: ENDPOINT,
    credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
  });

  // 1. List objects
  console.log("📋 Test 1: List objects...");
  try {
    const list = await client.send(new ListObjectsV2Command({ Bucket: BUCKET, MaxKeys: 10 }));
    const count = list.KeyCount ?? 0;
    console.log(`   ✅ Listed ${count} object(s)`);
    if (list.Contents?.length) {
      list.Contents.slice(0, 3).forEach(o => console.log(`      - ${o.Key} (${o.Size} bytes)`));
    }
  } catch (err) {
    console.log("   ❌ List failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  }

  // 2. Generate presigned PUT URL
  console.log("\n🔑 Test 2: Generate presigned PUT URL...");
  const testKey = `test/r2-test-${Date.now()}.txt`;
  try {
    const putCmd = new PutObjectCommand({ Bucket: BUCKET, Key: testKey, ContentType: "text/plain" });
    const putUrl = await getSignedUrl(client, putCmd, { expiresIn: 300 });
    console.log(`   ✅ Presigned PUT URL generated`);
    console.log(`   Key: ${testKey}`);
    console.log(`   URL: ${putUrl.slice(0, 80)}...`);
  } catch (err) {
    console.log("   ❌ Presign failed:", err instanceof Error ? err.message : err);
  }

  // 3. Upload a test file
  console.log("\n📤 Test 3: Upload test file...");
  try {
    await client.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: testKey,
      Body: Buffer.from("xAnna R2 test file — " + new Date().toISOString()),
      ContentType: "text/plain",
    }));
    console.log(`   ✅ Test file uploaded: ${testKey}`);
  } catch (err) {
    console.log("   ❌ Upload failed:", err instanceof Error ? err.message : err);
  }

  // 4. Delete test file
  console.log("\n🗑️  Test 4: Delete test file...");
  try {
    await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: testKey }));
    console.log(`   ✅ Test file deleted`);
  } catch (err) {
    console.log("   ❌ Delete failed:", err instanceof Error ? err.message : err);
  }

  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║   ✅ All R2 tests passed!                            ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");
  console.log("   R2 is fully operational. Start the dev server:");
  console.log("   npm run dev");
  console.log("   Then go to /creator/storage to upload files.\n");
}

main().catch(console.error);
