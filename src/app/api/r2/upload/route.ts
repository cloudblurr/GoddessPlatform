import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { uploadFileToR2, r2IsConfigured } from "@/lib/r2";

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "creator") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!r2IsConfigured()) {
    return NextResponse.json(
      { error: "R2 not configured" },
      { status: 503 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) ?? "uploads";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload server-side (no CORS issues)
    const result = await uploadFileToR2(
      file,
      `creators/${session.userId}/${folder}`
    );

    return NextResponse.json({
      ...result,
      url: result.mediaUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
