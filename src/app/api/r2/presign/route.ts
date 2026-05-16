import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { createPresignedUpload, r2IsConfigured } from "@/lib/r2";

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "creator") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!r2IsConfigured()) {
    return NextResponse.json(
      { error: "R2 not configured. Add R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY to .env" },
      { status: 503 }
    );
  }

  let body: { fileName?: string; contentType?: string; folder?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { fileName, contentType, folder } = body;
  if (!fileName) {
    return NextResponse.json({ error: "fileName is required" }, { status: 400 });
  }

  try {
    // Scope uploads under creator's user ID
    const creatorFolder = `creators/${session.userId}/${folder ?? "uploads"}`;
    const result = await createPresignedUpload(
      fileName,
      contentType ?? "application/octet-stream",
      creatorFolder,
      3600
    );
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Presign failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
