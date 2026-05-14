import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "mock_key";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Generic function to init/get user state
export async function getUser(userId: string) {
  const { data } = await supabase.from("users").select("*").eq("id", userId).single();
  return data;
}

// Media access 
export async function checkMediaAccess(userId: string, mediaId: string) {
  const { data } = await supabase.from("access").select("*").eq("user_id", userId).eq("media_id", mediaId).single();
  return !!data || false;
}

export async function grantMediaAccess(userId: string, mediaId: string) {
  await supabase.from("access").insert({ user_id: userId, media_id: mediaId });
}

export async function banUser(userId: string) {
  await supabase.from("users").update({ status: "BANNED" }).eq("id", userId);
}
