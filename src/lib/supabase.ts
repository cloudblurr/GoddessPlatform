import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

// Public client (anon key) — safe to use in browser
let _anonClient: SupabaseClient | null = null;
export function getSupabaseClient(): SupabaseClient {
  if (!_anonClient) {
    _anonClient = createClient(
      supabaseUrl || "https://placeholder.supabase.co",
      supabaseAnonKey || "placeholder"
    );
  }
  return _anonClient;
}

// Server-only client (service role key) — never expose to browser
let _serviceClient: SupabaseClient | null = null;
export function getSupabaseServiceClient(): SupabaseClient {
  if (!_serviceClient) {
    _serviceClient = createClient(
      supabaseUrl || "https://placeholder.supabase.co",
      supabaseServiceKey || supabaseAnonKey || "placeholder"
    );
  }
  return _serviceClient;
}

// Legacy export for existing code
export const supabase = getSupabaseServiceClient();

// ─── Auth helpers ─────────────────────────────────────────────────────────────
export async function getUser(userId: string) {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase.from("users").select("*").eq("id", userId).single();
  return data;
}

export async function checkMediaAccess(userId: string, mediaId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { data } = await supabase
    .from("media_access")
    .select("id")
    .eq("user_id", userId)
    .eq("media_id", mediaId)
    .single();
  return Boolean(data);
}

export async function grantMediaAccess(userId: string, mediaId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await supabase.from("media_access").upsert({ user_id: userId, media_id: mediaId });
}

export async function banUser(userId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await supabase.from("users").update({ status: "BANNED" }).eq("id", userId);
}
