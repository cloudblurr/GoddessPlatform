"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  AUTH_COOKIE_NAME,
  type AppSession,
  getSessionFromCookies,
  signSessionToken,
} from "@/lib/auth";
import { feedItems, vaultItems } from "@/lib/content";
import { readStore, writeStore } from "@/lib/store";
import type {
  MoodTag,
  AccessMode,
  MediaStatus,
  MediaType,
  ComposerContentKind,
  DeliveryTarget,
} from "@/lib/store";
import { enqueueCloudflareDelivery } from "@/lib/cloudflare-scheduler";

const THIRTY_DAYS = 60 * 60 * 24 * 30;
const CREATOR_STUDIO_KINDS: ComposerContentKind[] = [
  "feed",
  "store",
  "unlockable",
  "poll",
  "announcement",
  "livestream",
];

function defaultOwnedContent() {
  return feedItems
    .filter((i) => i.access === "subscription")
    .map((i) => i.id);
}

async function writeSession(session: AppSession) {
  const token = await signSessionToken(session);
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    partitioned: true,
    path: "/",
    maxAge: THIRTY_DAYS,
  });
}

export async function subscribeAndEnter(formData: FormData) {
  const plan = (formData.get("plan") as "monthly" | "quarterly" | "yearly") ?? "monthly";

  const session: AppSession = {
    userId: crypto.randomUUID(),
    role: "subscriber",
    plan,
    ownedContent: defaultOwnedContent(),
    loyaltyPoints: plan === "yearly" ? 200 : plan === "quarterly" ? 80 : 0,
    fanSince: Date.now(),
    issuedAt: Date.now(),
    expiresAt: Date.now() + THIRTY_DAYS * 1000,
  };

  await writeSession(session);
  redirect("/app/welcome");
}

export async function creatorLogin(formData: FormData) {
  const email = String(formData.get("email") ?? formData.get("username") ?? "").trim().toLowerCase().replace(/\.+$/, "");
  const password = String(formData.get("password") ?? "").trim();

  // Very loose email check to help the user get in
  const isEmailValid = 
    email.includes("xanall") || 
    email.includes("xannale") || 
    email.includes("annalee");

  // Allow both zero and capital O, and handle potential casing
  const isPasswordValid = 
    password === "Xanna0" || 
    password === "XannaO" ||
    password.toLowerCase() === "xanna0" ||
    password.toLowerCase() === "xannao";

  if (!isEmailValid || !isPasswordValid) {
    redirect("/entry?error=bad-creator-login");
  }

  const session: AppSession = {
    userId: "creator",
    role: "creator",
    plan: "creator",
    ownedContent: [...feedItems, ...vaultItems].map((item) => item.id),
    loyaltyPoints: 0,
    fanSince: Date.now(),
    issuedAt: Date.now(),
    expiresAt: Date.now() + THIRTY_DAYS * 1000,
  };

  await writeSession(session);
  redirect("/creator");
}

export async function incognitoCreatorAccess() {
  const session: AppSession = {
    userId: "creator",
    role: "creator",
    plan: "creator",
    ownedContent: [...feedItems, ...vaultItems].map((item) => item.id),
    loyaltyPoints: 0,
    fanSince: Date.now(),
    issuedAt: Date.now(),
    expiresAt: Date.now() + THIRTY_DAYS * 1000,
  };

  await writeSession(session);
  redirect("/creator");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    partitioned: true,
    path: "/",
    maxAge: 0,
  });

  redirect("/entry");
}

export async function unlockContent(formData: FormData) {
  const contentId = String(formData.get("contentId") ?? "");
  const nextPath = String(formData.get("nextPath") ?? "/app");

  const session = await getSessionFromCookies();

  if (!session) {
    redirect("/entry");
  }

  if (!contentId) {
    redirect(nextPath);
  }

  if (!session.ownedContent.includes(contentId)) {
    session.ownedContent.push(contentId);
  }

  await writeSession({
    ...session,
    loyaltyPoints: session.loyaltyPoints + 10,
    issuedAt: Date.now(),
    expiresAt: Date.now() + THIRTY_DAYS * 1000,
  });

  redirect(nextPath);
}

export async function sendTip(formData: FormData) {
  const session = await getSessionFromCookies();
  if (!session) redirect("/entry");

  const amountCents = Number(formData.get("amountCents") ?? 0);
  const points = Math.floor(amountCents / 100) * 5;

  await writeSession({
    ...session!,
    loyaltyPoints: session!.loyaltyPoints + points,
    issuedAt: Date.now(),
    expiresAt: Date.now() + THIRTY_DAYS * 1000,
  });

  redirect("/app/offering?sent=1");
}

function toStudioKind(raw: string): ComposerContentKind {
  if (CREATOR_STUDIO_KINDS.includes(raw as ComposerContentKind)) {
    return raw as ComposerContentKind;
  }
  return "feed";
}

function toDeliveryTarget(raw: string): DeliveryTarget {
  return raw === "vault-only" ? "vault-only" : "fanfront";
}

function toMediaType(raw: string): MediaType {
  if (raw === "video" || raw === "audio" || raw === "photo" || raw === "bundle" || raw === "text") {
    return raw;
  }
  return "text";
}

function parsePollOptions(raw: string) {
  return raw
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function thumbForKind(kind: ComposerContentKind): [string, string] {
  if (kind === "store") return ["#5c2e1a", "#1a0f0a"];
  if (kind === "unlockable") return ["#5a2147", "#14060f"];
  if (kind === "poll") return ["#21485a", "#081018"];
  if (kind === "announcement") return ["#6a4b1f", "#221307"];
  if (kind === "livestream") return ["#254224", "#081208"];
  return ["#8b5e3c", "#241710"];
}

export async function creatorStudioPublish(formData: FormData) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "creator") redirect("/entry");

  const contentKind = toStudioKind(String(formData.get("contentKind") ?? "feed"));
  const deliveryTarget = toDeliveryTarget(String(formData.get("deliveryTarget") ?? "fanfront"));
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const mood = String(formData.get("mood") ?? "Personal") as MoodTag;
  const accessInput = String(formData.get("access") ?? "subscription") as AccessMode;
  const mediaType = toMediaType(String(formData.get("mediaType") ?? "text"));
  const mediaUrl = String(formData.get("mediaUrl") ?? "").trim() || undefined;
  const thumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim() || undefined;
  const storageKey = String(formData.get("storageKey") ?? "").trim() || undefined;
  const scheduledFor = String(formData.get("scheduledFor") ?? "").trim() || undefined;
  const pollOptions = parsePollOptions(String(formData.get("pollOptions") ?? ""));
  const priceDollars = Number(formData.get("price") ?? 0);
  const priceCents = Number.isFinite(priceDollars) && priceDollars > 0 ? Math.round(priceDollars * 100) : undefined;

  if (!title) redirect("/creator/feed?error=empty");
  if (!description && contentKind !== "poll") redirect("/creator/feed?error=empty");
  if (contentKind === "poll" && pollOptions.length < 2) redirect("/creator/feed?error=poll-options");

  const store = await readStore();
  const postId = `${contentKind}-${Date.now()}`;
  const thumb = thumbForKind(contentKind);

  if (contentKind === "store" || contentKind === "unlockable") {
    const vaultAccess: AccessMode = contentKind === "store" ? "one-time" : "ppv";

    store.vaultItems.unshift({
      id: `vault-${postId}`,
      title,
      description,
      mood,
      access: vaultAccess,
      priceCents,
      thumb,
      likes: 0,
      comments: 0,
      videoUrl: mediaUrl,
      thumbnailUrl,
      type: mediaType,
      storageKey,
      status: scheduledFor ? "scheduled" : "listed",
      contentKind,
      deliveryTarget,
      scheduledFor,
      views: 0,
      purchases: 0,
      uploadedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    });
  } else {
    store.feedPosts.unshift({
      id: `feed-${postId}`,
      title,
      description: description || "New interactive poll",
      mood,
      access: accessInput,
      priceCents: accessInput === "subscription" ? undefined : priceCents,
      thumb,
      likes: 0,
      comments: 0,
      postedAt: "Just now",
      pinned: false,
      videoUrl: mediaUrl,
      thumbnailUrl,
      storageKey,
      type: mediaType,
      pollOptions: contentKind === "poll" ? pollOptions : undefined,
      scheduledFor,
      contentKind,
      deliveryTarget,
    });
  }

  await writeStore(store);

  if (scheduledFor) {
    const queueResult = await enqueueCloudflareDelivery({
      id: postId,
      contentKind,
      title,
      scheduledFor,
      deployTarget: deliveryTarget,
      mediaUrl,
      storageKey,
    });

    if (!queueResult.queued) {
      console.error("Cloudflare worker enqueue skipped", queueResult.reason);
    }
  }

  revalidatePath("/app");
  revalidatePath("/app/store");
  revalidatePath("/creator/feed");
  revalidatePath("/creator/vault");
  redirect("/creator/feed?published=1");
}

/* ═══════════════════════════════════════════════════════════
   CREATOR PUBLISHING ACTIONS
   ═══════════════════════════════════════════════════════════ */

export async function creatorPublishPost(formData: FormData) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "creator") redirect("/entry");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const mood = String(formData.get("mood") ?? "Personal") as MoodTag;
  const access = String(formData.get("access") ?? "subscription") as AccessMode;
  const videoUrl = String(formData.get("videoUrl") ?? "").trim() || undefined;
  const mediaType = String(formData.get("mediaType") ?? "text") as MediaType;
  const priceCents =
    access !== "subscription" && formData.get("priceCents")
      ? Math.round(Number(formData.get("priceCents")) * 100)
      : undefined;

  if (!title || !description) redirect("/creator/feed?error=empty");

  const store = await readStore();
  store.feedPosts.unshift({
    id: `feed-${Date.now()}`,
    title,
    description,
    mood,
    access,
    priceCents,
    thumb: ["#8b5e3c", "#241710"],
    likes: 0,
    comments: 0,
    postedAt: "Just now",
    pinned: false,
    videoUrl,
    type: mediaType,
  });
  await writeStore(store);
  revalidatePath("/app");
  revalidatePath("/creator/feed");
  redirect("/creator/feed?published=1");
}

export async function creatorDeletePost(formData: FormData) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "creator") redirect("/entry");

  const postId = String(formData.get("postId") ?? "");
  const store = await readStore();
  store.feedPosts = store.feedPosts.filter((p) => p.id !== postId);
  await writeStore(store);
  revalidatePath("/app");
  revalidatePath("/creator/feed");
  redirect("/creator/feed");
}

export async function creatorPublishVaultItem(formData: FormData) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "creator") redirect("/entry");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const mood = String(formData.get("mood") ?? "PPV") as MoodTag;
  const access = String(formData.get("access") ?? "ppv") as AccessMode;
  const priceDollars = Number(formData.get("price") ?? 0);
  const priceCents = Math.round(priceDollars * 100) || undefined;
  const videoUrl = String(formData.get("videoUrl") ?? "").trim() || undefined;
  const mediaType = String(formData.get("mediaType") ?? "video") as MediaType;
  const status = String(formData.get("status") ?? "listed") as MediaStatus;
  const scheduledFor = String(formData.get("scheduledFor") ?? "").trim() || undefined;
  const storageKey = String(formData.get("storageKey") ?? "").trim() || undefined;

  if (!title) redirect("/creator/vault?error=empty");

  const store = await readStore();
  store.vaultItems.unshift({
    id: `vault-${Date.now()}`,
    title,
    description,
    mood,
    access,
    priceCents,
    thumb: ["#5c2e1a", "#1a0f0a"],
    likes: 0,
    comments: 0,
    videoUrl,
    type: mediaType,
    storageKey,
    status,
    scheduledFor,
    views: 0,
    purchases: 0,
    uploadedAt: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  });
  await writeStore(store);
  revalidatePath("/app/vault");
  revalidatePath("/creator/vault");
  redirect("/creator/vault?published=1");
}

export async function creatorUpdateVaultItem(formData: FormData) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "creator") redirect("/entry");

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceDollars = Number(formData.get("price") ?? 0);
  const status = String(formData.get("status") ?? "listed") as MediaStatus;
  const scheduledFor = String(formData.get("scheduledFor") ?? "").trim() || undefined;
  const videoUrl = String(formData.get("videoUrl") ?? "").trim() || undefined;
  const storageKey = String(formData.get("storageKey") ?? "").trim() || undefined;

  const store = await readStore();
  store.vaultItems = store.vaultItems.map((item) =>
    item.id === id
      ? {
          ...item,
          title: title || item.title,
          description: description !== "" ? description : item.description,
          priceCents: priceDollars > 0 ? Math.round(priceDollars * 100) : item.priceCents,
          status,
          scheduledFor: status === "scheduled" ? scheduledFor : undefined,
          videoUrl: videoUrl !== undefined ? videoUrl || item.videoUrl : item.videoUrl,
          storageKey: storageKey ?? item.storageKey,
        }
      : item
  );
  await writeStore(store);
  revalidatePath("/app/vault");
  revalidatePath("/creator/vault");
  redirect("/creator/vault?saved=1");
}

export async function creatorDeleteVaultItem(formData: FormData) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "creator") redirect("/entry");

  const itemId = String(formData.get("itemId") ?? "");
  const store = await readStore();
  store.vaultItems = store.vaultItems.filter((i) => i.id !== itemId);
  await writeStore(store);
  revalidatePath("/app/vault");
  revalidatePath("/creator/vault");
  redirect("/creator/vault");
}

/* ═══════════════════════════════════════════════════════════
   CREATOR APPEARANCE SETTINGS
   ═══════════════════════════════════════════════════════════ */

export async function updateAppearanceSettings(formData: FormData) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "creator") redirect("/entry");

  const heroTitle = String(formData.get("heroTitle") ?? "");
  const heroSubtitle = String(formData.get("heroSubtitle") ?? "");
  const revealHeadline = String(formData.get("revealHeadline") ?? "");

  const p1Title = String(formData.get("p1Title") ?? "");
  const p1Url = String(formData.get("p1Url") ?? "/logo-2.png");
  const p1Type = String(formData.get("p1Type") ?? "image") as "image" | "video";

  const p2Title = String(formData.get("p2Title") ?? "");
  const p2Url = String(formData.get("p2Url") ?? "/logo-1.png");
  const p2Type = String(formData.get("p2Type") ?? "image") as "image" | "video";

  const p3Title = String(formData.get("p3Title") ?? "");
  const p3Url = String(formData.get("p3Url") ?? "https://files.catbox.moe/97ukl2.mp4");
  const p3Type = String(formData.get("p3Type") ?? "video") as "image" | "video";

  const p4Title = String(formData.get("p4Title") ?? "");
  const p4Url = String(formData.get("p4Url") ?? "https://files.catbox.moe/3lohl1.mp4");
  const p4Type = String(formData.get("p4Type") ?? "video") as "image" | "video";

  const store = await readStore();
  store.entrySettings = {
    heroTitle,
    heroSubtitle,
    revealHeadline,
    previews: [
      { id: "p1", title: p1Title, mediaUrl: p1Url, mediaType: p1Type },
      { id: "p2", title: p2Title, mediaUrl: p2Url, mediaType: p2Type },
      { id: "p3", title: p3Title, mediaUrl: p3Url, mediaType: p3Type },
      { id: "p4", title: p4Title, mediaUrl: p4Url, mediaType: p4Type },
    ]
  };

  await writeStore(store);
  revalidatePath("/entry");
  revalidatePath("/creator/appearance");
  redirect("/creator/appearance?saved=1");
}
