import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { deleteR2File, createPresignedDownload, headR2File, renameR2File, r2IsConfigured } from "@/lib/r2";

type Params = { params: Promise<{ key: string }> };

function creatorUploadRoot(userId: string) {
  return `creators/${userId}/uploads/`;
}

function isCreatorOwnedKey(key: string, userId: string) {
  return key.startsWith(creatorUploadRoot(userId)) && !key.endsWith("/");
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._ -]/g, "_").trim().replace(/\s+/g, "_");
}

// GET /api/r2/files/[key] — get presigned download URL
export async function GET(req: NextRequest, { params }: Params) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "creator") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await params;
  const decodedKey = decodeURIComponent(key);

  if (!r2IsConfigured()) {
    return NextResponse.json({ error: "R2 not configured" }, { status: 503 });
  }

  if (!isCreatorOwnedKey(decodedKey, session.userId)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  try {
    const meta = await headR2File(decodedKey);
    if (!meta.exists) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const mode = req.nextUrl.searchParams.get("mode");
    const url = await createPresignedDownload(decodedKey, 3600);

    if (mode === "redirect") {
      return NextResponse.redirect(url);
    }

    return NextResponse.json({ url, key: decodedKey, ...meta });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/r2/files/[key] — delete a file
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "creator") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await params;
  const decodedKey = decodeURIComponent(key);

  if (!r2IsConfigured()) {
    return NextResponse.json({ error: "R2 not configured" }, { status: 503 });
  }

  if (!isCreatorOwnedKey(decodedKey, session.userId)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  try {
    await deleteR2File(decodedKey);
    return NextResponse.json({ ok: true, key: decodedKey });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/r2/files/[key] — rename a file within the creator vault
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "creator") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await params;
  const decodedKey = decodeURIComponent(key);

  if (!r2IsConfigured()) {
    return NextResponse.json({ error: "R2 not configured" }, { status: 503 });
  }

  if (!isCreatorOwnedKey(decodedKey, session.userId)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const nextName = sanitizeFileName(body.name ?? "");
  if (!nextName) {
    return NextResponse.json({ error: "A new file name is required" }, { status: 400 });
  }

  const folder = decodedKey.slice(0, decodedKey.lastIndexOf("/") + 1);
  const destinationKey = `${folder}${nextName}`;

  if (destinationKey === decodedKey) {
    return NextResponse.json({ ok: true, key: decodedKey, mediaUrl: `/api/media/${encodeURIComponent(decodedKey)}?mode=redirect` });
  }

  if (!destinationKey.startsWith(creatorUploadRoot(session.userId))) {
    return NextResponse.json({ error: "Invalid destination" }, { status: 400 });
  }

  try {
    const existing = await headR2File(destinationKey);
    if (existing.exists) {
      return NextResponse.json({ error: "A file with that name already exists" }, { status: 409 });
    }

    const result = await renameR2File(decodedKey, destinationKey);
    const meta = await headR2File(destinationKey);
    return NextResponse.json({ ok: true, ...result, ...meta });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Rename failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
