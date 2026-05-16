import { NextRequest, NextResponse } from "next/server";
import { createPresignedDownload, r2IsConfigured } from "@/lib/r2";
import { getSessionFromCookies } from "@/lib/auth";

/**
 * GET /api/media/[id]
 * Returns a presigned R2 download URL for a given object key.
 * The [id] param is the base64url-encoded R2 key.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromCookies();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const key = decodeURIComponent(id);

  if (!r2IsConfigured()) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  try {
    const url = await createPresignedDownload(key, 3600);
    const mode = req.nextUrl.searchParams.get("mode");
    if (mode === "redirect") {
      return NextResponse.redirect(url);
    }
    return NextResponse.json({ url, key });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
