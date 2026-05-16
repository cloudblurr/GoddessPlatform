import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { deleteR2File, createPresignedDownload, headR2File, r2IsConfigured } from "@/lib/r2";

type Params = { params: Promise<{ key: string }> };

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

  try {
    await deleteR2File(decodedKey);
    return NextResponse.json({ ok: true, key: decodedKey });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
