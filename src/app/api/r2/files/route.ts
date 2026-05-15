import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { listR2Files, r2IsConfigured } from "@/lib/r2";

export async function GET(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "creator") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!r2IsConfigured()) {
    return NextResponse.json({ configured: false, items: [] });
  }

  const creatorRoot = `creators/${session.userId}/uploads/`;
  const requestedPrefix = req.nextUrl.searchParams.get("prefix") ?? creatorRoot;
  const prefix = requestedPrefix.startsWith(creatorRoot) ? requestedPrefix : creatorRoot;

  try {
    const items = await listR2Files(prefix, 500);
    return NextResponse.json({ configured: true, prefix, items });
  } catch (err) {
    const message = err instanceof Error ? err.message : "List failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
