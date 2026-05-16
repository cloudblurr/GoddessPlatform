/**
 * Demo Mode System
 * 
 * Provides realistic demo content for showcasing the platform without placeholders.
 * All demo content is clearly marked and can be toggled on/off.
 */

import type { StoredPost, StoredVaultItem, MoodTag, AccessMode, MediaType } from "./store";

export type DemoCreator = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  banner: string;
  bio: string;
  subscriberCount: number;
  postCount: number;
  monthlyPrice: number;
  quarterlyPrice: number;
  yearlyPrice: number;
};

export const DEMO_CREATORS: DemoCreator[] = [
  {
    id: "demo-goddess-anna",
    name: "Goddess Annalesse",
    handle: "@goddessanna",
    avatar: "/anna2.jpg",
    banner: "/xanamain.jpg",
    bio: "Luxury lifestyle & exclusive content. Your daily dose of elegance.",
    subscriberCount: 12847,
    postCount: 342,
    monthlyPrice: 19.99,
    quarterlyPrice: 49.99,
    yearlyPrice: 179.99,
  },
  {
    id: "demo-starlight",
    name: "Starlight Dreams",
    handle: "@starlightdreams",
    avatar: "/StarlightUI.jpg",
    banner: "/StarlightUI.jpg",
    bio: "Cosmic vibes and celestial content. Join my universe.",
    subscriberCount: 8234,
    postCount: 189,
    monthlyPrice: 14.99,
    quarterlyPrice: 39.99,
    yearlyPrice: 139.99,
  },
  {
    id: "demo-lavender",
    name: "Lavender Luxe",
    handle: "@lavenderluxe",
    avatar: "/LavendarUI.jpg",
    banner: "/LavendarUI.jpg",
    bio: "Soft aesthetics, hard work. Premium content daily.",
    subscriberCount: 15632,
    postCount: 456,
    monthlyPrice: 24.99,
    quarterlyPrice: 64.99,
    yearlyPrice: 229.99,
  },
  {
    id: "demo-glory",
    name: "Glory Reign",
    handle: "@gloryreign",
    avatar: "/GloryUI.jpg",
    banner: "/GloryUI.jpg",
    bio: "Empowerment through content. Building an empire together.",
    subscriberCount: 9876,
    postCount: 278,
    monthlyPrice: 17.99,
    quarterlyPrice: 44.99,
    yearlyPrice: 159.99,
  },
  {
    id: "demo-bossy",
    name: "Bossy Babe",
    handle: "@bossybabe",
    avatar: "/BossyUI.jpg",
    banner: "/BossyUI.jpg",
    bio: "Boss moves only. Exclusive behind-the-scenes access.",
    subscriberCount: 11234,
    postCount: 312,
    monthlyPrice: 21.99,
    quarterlyPrice: 57.99,
    yearlyPrice: 199.99,
  },
];

export function generateDemoFeedPosts(creatorId: string): StoredPost[] {
  const posts: StoredPost[] = [
    {
      id: `${creatorId}-feed-1`,
      title: "Morning Routine Reveal",
      description: "Starting the day right with my favorite rituals. Swipe to see the full routine!",
      mood: "Personal" as MoodTag,
      access: "subscription" as AccessMode,
      thumb: ["#8b5e3c", "#241710"],
      likes: 234,
      comments: 45,
      postedAt: "2 hours ago",
      videoUrl: "https://files.catbox.moe/97ukl2.mp4",
      type: "video" as MediaType,
      contentKind: "feed",
      deliveryTarget: "fanfront",
    },
    {
      id: `${creatorId}-feed-2`,
      title: "Exclusive BTS from Today's Shoot",
      description: "You asked for it! Here's what went down behind the camera today. 📸",
      mood: "BTS" as MoodTag,
      access: "subscription" as AccessMode,
      thumb: ["#8b5e3c", "#241710"],
      likes: 567,
      comments: 89,
      postedAt: "5 hours ago",
      thumbnailUrl: "/anna3.jpg",
      type: "photo" as MediaType,
      contentKind: "feed",
      deliveryTarget: "fanfront",
    },
    {
      id: `${creatorId}-feed-3`,
      title: "Weekend Plans Poll",
      description: "Help me decide what content to create this weekend!",
      mood: "Personal" as MoodTag,
      access: "subscription" as AccessMode,
      thumb: ["#21485a", "#081018"],
      likes: 123,
      comments: 67,
      postedAt: "1 day ago",
      pollOptions: ["Photoshoot at the beach", "Cozy home vlog", "Q&A session", "Surprise me!"],
      contentKind: "poll",
      deliveryTarget: "fanfront",
    },
    {
      id: `${creatorId}-feed-4`,
      title: "New PPV Drop Available",
      description: "My most exclusive content yet. Limited time offer for early supporters! 🔥",
      mood: "PPV" as MoodTag,
      access: "ppv" as AccessMode,
      priceCents: 1999,
      thumb: ["#5a2147", "#14060f"],
      likes: 891,
      comments: 156,
      postedAt: "2 days ago",
      videoUrl: "https://files.catbox.moe/3lohl1.mp4",
      thumbnailUrl: "/anna4.jpg",
      type: "video" as MediaType,
      contentKind: "unlockable",
      deliveryTarget: "fanfront",
    },
  ];

  return posts;
}

export function generateDemoVaultItems(creatorId: string): StoredVaultItem[] {
  const items: StoredVaultItem[] = [
    {
      id: `${creatorId}-vault-1`,
      title: "Platinum Collection Vol. 1",
      description: "My most exclusive content bundle. 10+ premium videos and photo sets.",
      mood: "Exclusive" as MoodTag,
      access: "one-time" as AccessMode,
      priceCents: 4999,
      thumb: ["#5c2e1a", "#1a0f0a"],
      likes: 456,
      comments: 78,
      videoUrl: "https://files.catbox.moe/97ukl2.mp4",
      thumbnailUrl: "/logo-2.png",
      type: "bundle" as MediaType,
      status: "listed",
      contentKind: "store",
      deliveryTarget: "fanfront",
      views: 1234,
      purchases: 89,
      uploadedAt: "Jan 15, 2026",
    },
    {
      id: `${creatorId}-vault-2`,
      title: "Midnight Secrets",
      description: "What happens after dark... Unlock to discover.",
      mood: "PPV" as MoodTag,
      access: "ppv" as AccessMode,
      priceCents: 2499,
      thumb: ["#5a2147", "#14060f"],
      likes: 789,
      comments: 134,
      videoUrl: "https://files.catbox.moe/3lohl1.mp4",
      thumbnailUrl: "/anna2.jpg",
      type: "video" as MediaType,
      status: "listed",
      contentKind: "unlockable",
      deliveryTarget: "fanfront",
      views: 2345,
      purchases: 156,
      uploadedAt: "Jan 10, 2026",
    },
    {
      id: `${creatorId}-vault-3`,
      title: "Golden Hour Photo Set",
      description: "50 high-resolution photos from my favorite shoot of the year.",
      mood: "Exclusive" as MoodTag,
      access: "one-time" as AccessMode,
      priceCents: 1999,
      thumb: ["#5c2e1a", "#1a0f0a"],
      likes: 345,
      comments: 56,
      thumbnailUrl: "/anna3.jpg",
      type: "photo" as MediaType,
      status: "listed",
      contentKind: "store",
      deliveryTarget: "fanfront",
      views: 987,
      purchases: 67,
      uploadedAt: "Jan 5, 2026",
    },
  ];

  return items;
}

export function isDemoMode(): boolean {
  // Check if demo mode is enabled via environment variable or localStorage
  if (typeof window !== "undefined") {
    return localStorage.getItem("demo-mode") === "enabled";
  }
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

export function enableDemoMode(): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("demo-mode", "enabled");
  }
}

export function disableDemoMode(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("demo-mode");
  }
}

export function getDemoCreator(creatorId: string): DemoCreator | undefined {
  return DEMO_CREATORS.find((c) => c.id === creatorId);
}
