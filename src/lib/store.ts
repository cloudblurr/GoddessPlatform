/**
 * xAna persistent store — file-backed JSON, seeded from static content.
 * Uses os.tmpdir() so it works on both Windows (dev) and Vercel (prod).
 * If Supabase is configured, feed/vault state is persisted in Postgres.
 */
import fs from "fs";
import path from "path";
import os from "os";
import { feedItems, vaultItems } from "./content";

export type MoodTag = "Exclusive" | "BTS" | "Personal" | "PPV" | "Drop" | "Live";
export type AccessMode = "subscription" | "ppv" | "one-time";
export type MediaStatus = "listed" | "unlisted" | "scheduled" | "stored";
export type MediaType = "video" | "audio" | "photo" | "bundle" | "text";

export type DivinePreview = {
  id: string;
  title: string;
  mediaUrl: string;
  mediaType: "image" | "video";
};

export type EntryPageSettings = {
  heroTitle: string;
  heroSubtitle: string;
  revealHeadline: string;
  previews: DivinePreview[];
};

export type StoredPost = {
  id: string;
  title: string;
  description: string;
  mood: MoodTag;
  access: AccessMode;
  priceCents?: number;
  thumb: [string, string];
  likes: number;
  comments: number;
  postedAt: string;
  pinned?: boolean;
  videoUrl?: string;
  storageKey?: string;
  type?: MediaType;
};

export type StoredVaultItem = {
  id: string;
  title: string;
  description: string;
  mood: MoodTag;
  access: AccessMode;
  priceCents?: number;
  thumb: [string, string];
  likes: number;
  comments: number;
  videoUrl?: string;
  type?: MediaType;
  // Bunny Storage Zone
  storageKey?: string;         // Path in Bunny Storage Zone, e.g. "vault/item-id/video.mp4"
  // Creator-side metadata
  status: MediaStatus;
  fileSize?: string;
  uploadedAt?: string;
  scheduledFor?: string;
  views: number;
  purchases: number;
};

export type AppStore = {
  feedPosts: StoredPost[];
  vaultItems: StoredVaultItem[];
  entrySettings?: EntryPageSettings;
};

const STORE_PATH = path.join(os.tmpdir(), "xana-store-v4.json");

function isStoreLike(value: unknown): value is AppStore {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return Array.isArray(v.feedPosts) && Array.isArray(v.vaultItems);
}

function defaultStore(): AppStore {
  return {
    feedPosts: feedItems.map((i) => ({
      id: i.id,
      title: i.title,
      description: i.description,
      mood: i.mood as MoodTag,
      access: i.access as AccessMode,
      priceCents: i.priceCents,
      thumb: i.thumb,
      likes: i.likes ?? 0,
      comments: i.comments ?? 0,
      postedAt: i.postedAt ?? "Recently",
      pinned: i.pinned,
      videoUrl: i.videoUrl,
      type: i.type as MediaType | undefined,
    })),
    vaultItems: vaultItems.map((i) => ({
      id: i.id,
      title: i.title,
      description: i.description,
      mood: i.mood as MoodTag,
      access: i.access as AccessMode,
      priceCents: i.priceCents,
      thumb: i.thumb,
      likes: i.likes ?? 0,
      comments: i.comments ?? 0,
      videoUrl: i.videoUrl,
      type: i.type as MediaType | undefined,
      status: "listed" as MediaStatus,
      views: 0,
      purchases: 0,
    })),
    entrySettings: {
      heroTitle: "Goddess Annalesse",
      heroSubtitle: "A delicate touch of luxury from the Queen of your feed.",
      revealHeadline: "Want to go to Heaven? This is inside.",
      previews: [
        { id: "p1", title: "Platinum Dripped Aura", mediaUrl: "/logo-2.png", mediaType: "image" },
        { id: "p2", title: "Eternal Grace", mediaUrl: "/logo-1.png", mediaType: "image" },
        { id: "p3", title: "Midnight Routine", mediaUrl: "https://files.catbox.moe/97ukl2.mp4", mediaType: "video" },
        { id: "p4", title: "Sanctum Secrets", mediaUrl: "https://files.catbox.moe/3lohl1.mp4", mediaType: "video" }
      ]
    }
  };
}

function readFileStore(): AppStore {
  try {
    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (isStoreLike(parsed)) {
      if (!parsed.entrySettings || parsed.entrySettings.previews.length < 4) {
        parsed.entrySettings = defaultStore().entrySettings;
      }
      return parsed;
    }
    return defaultStore();
  } catch {
    return defaultStore();
  }
}

function writeFileStore(data: AppStore): void {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("[xana-store] write error:", err);
  }
}

export async function readStore(): Promise<AppStore> {
  return readFileStore();
}

export async function writeStore(data: AppStore): Promise<void> {
  writeFileStore(data);
}
