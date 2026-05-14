/**
 * POST /api/vault/upload
 *
 * Creator-only. Receives a file via multipart/form-data and proxies it
 * directly to Cloudreve.
 *
 * Edge Runtime — no Vercel body-size limit on serverless functions.
 *
 * Request (multipart/form-data):
 *   file        — the media file
 *
 * Response: { cloudreveInfo: any }
 */
export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { uploadToCloudreve } from "@/lib/cloudreve";

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "creator") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart body" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  try {
    const result = await uploadToCloudreve(file, "/xAnnaVault");
    return NextResponse.json({ storageKey: result, size: file.size });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
