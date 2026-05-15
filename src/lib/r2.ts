/**
 * r2.ts — Cloudflare R2 client (S3-compatible via AWS SDK)
 *
 * Required env vars:
 *   R2_ACCESS_KEY_ID       — R2 API token Access Key ID
 *   R2_SECRET_ACCESS_KEY   — R2 API token Secret Access Key
 *   R2_BUCKET_NAME         — bucket name (default: xanna-media)
 *   R2_ENDPOINT            — https://<account_id>.r2.cloudflarestorage.com
 *   R2_PUBLIC_URL          — public base URL for served files (optional)
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  type ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ─── Config ──────────────────────────────────────────────────────────────────
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
const BUCKET = process.env.R2_BUCKET_NAME ?? "xanna-media";
const ENDPOINT =
  process.env.R2_ENDPOINT ??
  `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`;
const PUBLIC_URL = process.env.R2_PUBLIC_URL ?? "";
const ACCESS_KEY = process.env.R2_ACCESS_KEY_ID ?? "";
const SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY ?? "";

// ─── Client (lazy singleton) ─────────────────────────────────────────────────
let _client: S3Client | null = null;

function getClient(): S3Client {
  if (_client) return _client;
  if (!ACCESS_KEY || !SECRET_KEY) {
    throw new Error(
      "R2 credentials not configured. Add R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY to .env"
    );
  }
  _client = new S3Client({
    region: "auto",
    endpoint: ENDPOINT,
    credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
  });
  return _client;
}

// ─── Types ───────────────────────────────────────────────────────────────────
export type R2FileItem = {
  key: string;
  name: string;
  size: number;
  lastModified: Date;
  contentType?: string;
  url: string;           // presigned GET or public URL
  folder: string;
  isFolder: boolean;
};

export type PresignedUpload = {
  uploadUrl: string;     // PUT to this URL directly from browser
  key: string;           // object key in R2
  publicUrl: string;     // URL to access after upload
  expiresIn: number;     // seconds
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function publicUrl(key: string): string {
  if (PUBLIC_URL) return `${PUBLIC_URL.replace(/\/$/, "")}/${key}`;
  return `${ENDPOINT}/${BUCKET}/${key}`;
}

export function appMediaUrl(key: string): string {
  return `/api/media/${encodeURIComponent(key)}?mode=redirect`;
}

function mimeFromKey(key: string): string {
  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    mp4: "video/mp4", mov: "video/quicktime", webm: "video/webm",
    mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", m4a: "audio/mp4",
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
    gif: "image/gif", webp: "image/webp", avif: "image/avif",
    pdf: "application/pdf", zip: "application/zip",
  };
  return map[ext] ?? "application/octet-stream";
}

// ─── Presigned PUT (upload) ───────────────────────────────────────────────────
export async function createPresignedUpload(
  fileName: string,
  contentType: string,
  folder: string = "uploads",
  expiresIn: number = 3600
): Promise<PresignedUpload> {
  const client = getClient();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${folder.replace(/^\/|\/$/g, "")}/${Date.now()}-${safeName}`;

  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType || mimeFromKey(key),
  });

  const uploadUrl = await getSignedUrl(client, cmd, { expiresIn });

  return {
    uploadUrl,
    key,
    publicUrl: publicUrl(key),
    expiresIn,
  };
}

// ─── Server-side file upload (no CORS) ───────────────────────────────────────
export async function uploadFileToR2(
  file: File,
  folder: string = "uploads"
): Promise<{ key: string; publicUrl: string; mediaUrl: string }> {
  const client = getClient();
  const buffer = await file.arrayBuffer();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${folder.replace(/^\/|\/$/g, "")}/${Date.now()}-${safeName}`;

  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: Buffer.from(buffer),
    ContentType: file.type || mimeFromKey(key),
  });

  await client.send(cmd);

  return {
    key,
    publicUrl: publicUrl(key),
    mediaUrl: appMediaUrl(key),
  };
}

// ─── Presigned GET (download / stream) ───────────────────────────────────────
export async function createPresignedDownload(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const client = getClient();
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(client, cmd, { expiresIn });
}

// ─── List files ──────────────────────────────────────────────────────────────
export async function listR2Files(
  prefix: string = "",
  maxKeys: number = 200
): Promise<R2FileItem[]> {
  const client = getClient();
  const cmd = new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: prefix || undefined,
    MaxKeys: maxKeys,
    Delimiter: "/",
  });

  const res: ListObjectsV2CommandOutput = await client.send(cmd);
  const items: R2FileItem[] = [];

  // Common prefixes = folders
  for (const cp of res.CommonPrefixes ?? []) {
    const folderKey = cp.Prefix ?? "";
    items.push({
      key: folderKey,
      name: folderKey.replace(prefix, "").replace(/\/$/, "") || folderKey,
      size: 0,
      lastModified: new Date(0),
      url: "",
      folder: prefix,
      isFolder: true,
    });
  }

  // Objects = files
  for (const obj of res.Contents ?? []) {
    const key = obj.Key ?? "";
    if (key.endsWith("/")) continue; // skip folder markers
    const name = key.split("/").pop() ?? key;
    items.push({
      key,
      name,
      size: obj.Size ?? 0,
      lastModified: obj.LastModified ?? new Date(0),
      url: appMediaUrl(key),
      folder: prefix,
      isFolder: false,
    });
  }

  return items;
}

// ─── Delete ──────────────────────────────────────────────────────────────────
export async function deleteR2File(key: string): Promise<void> {
  const client = getClient();
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export async function renameR2File(
  sourceKey: string,
  destinationKey: string
): Promise<{ key: string; publicUrl: string; mediaUrl: string }> {
  const client = getClient();
  const safeSource = sourceKey.replace(/^\/+/, "");
  const safeDestination = destinationKey.replace(/^\/+/, "");

  await client.send(new CopyObjectCommand({
    Bucket: BUCKET,
    CopySource: `${BUCKET}/${encodeURIComponent(safeSource).replace(/%2F/g, "/")}`,
    Key: safeDestination,
    MetadataDirective: "COPY",
  }));

  await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: safeSource }));

  return {
    key: safeDestination,
    publicUrl: publicUrl(safeDestination),
    mediaUrl: appMediaUrl(safeDestination),
  };
}

// ─── Head (check exists + get metadata) ──────────────────────────────────────
export async function headR2File(key: string) {
  const client = getClient();
  try {
    const res = await client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return { exists: true, size: res.ContentLength, contentType: res.ContentType, lastModified: res.LastModified };
  } catch {
    return { exists: false };
  }
}

// ─── Config check ────────────────────────────────────────────────────────────
export function r2IsConfigured(): boolean {
  return Boolean(ACCESS_KEY && SECRET_KEY && ACCOUNT_ID);
}

export { BUCKET, ENDPOINT, PUBLIC_URL };
