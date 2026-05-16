import type { AppSession } from "@/lib/auth";

/* ── Access & mood types ─────────────────────────────── */

export type AccessMode = "subscription" | "ppv" | "one-time";
export type MoodTag = "Exclusive" | "BTS" | "Personal" | "PPV" | "Drop" | "Live";

export type ContentItem = {
  id: string;
  title: string;
  description: string;
  mood: MoodTag;
  access: AccessMode;
  priceCents?: number;
  pinned?: boolean;
  /** gradient placeholder colours for thumbnails */
  thumb: [string, string];
  /** fake engagement numbers */
  likes?: number;
  comments?: number;
  postedAt?: string;
  /** Direct video/audio URL (external or CDN) */
  videoUrl?: string;
  /** Media type hint */
  type?: "video" | "audio" | "photo" | "bundle" | "text";
};

export type ScrollThread = {
  id: string;
  subject: string;
  preview: string;
  timestamp: string;
  ppv?: boolean;
  priceCents?: number;
  voice?: boolean;
};

/* ── Creator identity ─────────────────────────────────── */

export const creatorProfile = {
  name: "Xanna",
  tagline: "Exclusive content. Direct connection. Your backstage pass to the creator experience.",
  memberCount: "4,200",
  bio: "Behind-the-scenes access, exclusive content, and direct connection with me. This is where the real content lives — unfiltered, authentic, and made just for my subscribers.",
  teaserLines: [
    "Daily exclusive posts and updates",
    "Behind-the-scenes content and b-roll",
    "Direct messaging and Q&A sessions",
    "Early access to new releases and drops",
  ],
  collageQuotes: [
    { text: "This is where I share everything I don't post anywhere else.", label: "Philosophy" },
    { text: "Built this platform to give my subscribers the real, unfiltered experience.", label: "Mission" },
    { text: "Authentic content, direct connection, no gatekeepers.", label: "Approach" },
    { text: "Creating daily. Sharing exclusively. Connecting directly.", label: "About" },
    { text: "The best content is reserved for those who are truly here.", label: "Mood" },
  ],
};

/* ── Single-tier pricing ──────────────────────────────── */

export const pricingPlans = [
  {
    id: "monthly" as const,
    label: "Creator Access",
    subtitle: "Monthly Membership",
    price: "$15.99",
    period: "/mo",
    perks: ["Full content feed access", "Direct messaging with creator", "Exclusive media vault", "Behind-the-scenes content", "Early access to releases"],
    highlight: true,
  },
];

/* ── Feed posts ─────────────────────────────── */

export const feedItems: ContentItem[] = [
  {
    id: "feed-golden-hour",
    title: "Behind the Scenes: Studio Session",
    description: "Exclusive look at today's studio session. See how the content gets made.",
    mood: "BTS",
    access: "subscription",
    pinned: true,
    thumb: ["#8b5e3c", "#3d2a1e"],
    likes: 342,
    comments: 28,
    postedAt: "2 hours ago",
  },
  {
    id: "feed-bts-courtyard",
    title: "Content Creation Process",
    description: "How I plan and create content for the platform. A peek behind the curtain.",
    mood: "BTS",
    access: "subscription",
    thumb: ["#6b4423", "#2e1e15"],
    likes: 218,
    comments: 15,
    postedAt: "Yesterday",
    type: "video",
  },
  {
    id: "feed-velvet-night",
    title: "Exclusive Extended Cut",
    description: "The full uncut version of today's premium content. Available to subscribers.",
    mood: "Exclusive",
    access: "subscription",
    thumb: ["#5c2e1a", "#1a0f0a"],
    likes: 189,
    comments: 42,
    postedAt: "2 days ago",
    type: "video",
  },
  {
    id: "feed-blossom-reel",
    title: "New Content Drop Preview",
    description: "First look at upcoming content dropping this week. Subscribers get early access.",
    mood: "Exclusive",
    access: "subscription",
    thumb: ["#a0522d", "#3d2a1e"],
    likes: 456,
    comments: 37,
    postedAt: "3 days ago",
    type: "video",
  },
  {
    id: "feed-personal-letter",
    title: "Creator Update",
    description: "Personal update on what's coming next, new features, and a thank-you to subscribers.",
    mood: "Personal",
    access: "subscription",
    thumb: ["#704214", "#241710"],
    likes: 523,
    comments: 61,
    postedAt: "4 days ago",
  },
];

/* ── Media Vault items ──────────────────────────── */

export const vaultItems: ContentItem[] = [
  {
    id: "vault-velvet-night",
    title: "Extended Cut: Studio Session",
    description: "Extended cut with commentary and behind-the-scenes footage.",
    mood: "Exclusive",
    access: "subscription",
    thumb: ["#5c2e1a", "#1a0f0a"],
    likes: 189,
    comments: 42,
    type: "video",
  },
  {
    id: "vault-hacienda-prints",
    title: "Exclusive Photo Collection",
    description: "High-res printable stills from recent content shoots.",
    mood: "Exclusive",
    access: "subscription",
    thumb: ["#8b4513", "#3d1c02"],
    likes: 134,
    comments: 19,
  },
  {
    id: "vault-siesta-pack",
    title: "Content Bundle Pack",
    description: "Mini-film, photo pack, and bonus content all in one.",
    mood: "Exclusive",
    access: "subscription",
    thumb: ["#704214", "#2e1e15"],
    likes: 267,
    comments: 33,
    type: "video",
  },
  {
    id: "vault-moonlit-garden",
    title: "Night Session Recording",
    description: "Exclusive recording from the late-night studio session.",
    mood: "Exclusive",
    access: "subscription",
    thumb: ["#3d2a1e", "#1a0f0a"],
    likes: 198,
    comments: 24,
    type: "video",
  },
  {
    id: "vault-terraza-replay",
    title: "Live Session Replay",
    description: "Full replay of the 2-hour live Q&A session.",
    mood: "Live",
    access: "subscription",
    thumb: ["#6b3410", "#1a0d01"],
    likes: 312,
    comments: 56,
    type: "video",
  },
  {
    id: "vault-blossom-collection",
    title: "Premium Photo Set",
    description: "Curated photo set from recent content creation sessions.",
    mood: "Exclusive",
    access: "subscription",
    thumb: ["#a0522d", "#5c3a2a"],
    likes: 245,
    comments: 29,
  },
];

/* ── Direct Message threads ─────────────────────────────── */

export const scrollThreads: ScrollThread[] = [
  {
    id: "dm-welcome",
    subject: "Welcome to the platform",
    preview: "Thanks for subscribing. Your first exclusive content is unlocked.",
    timestamp: "Today, 3:42 PM",
  },
  {
    id: "dm-ppv-teaser",
    subject: "New content waiting in your vault",
    preview: "Exclusive preview — just for subscribers…",
    timestamp: "Yesterday, 11:18 PM",
  },
  {
    id: "dm-voice-note",
    subject: "Voice note from the creator",
    preview: "▓▓▓░░░░░░░ 0:42",
    timestamp: "Mar 21, 8:30 PM",
    voice: true,
  },
  {
    id: "dm-update",
    subject: "Live Q&A session this Saturday",
    preview: "Mark your calendar — the live session starts at 9 PM.",
    timestamp: "Mar 20, 2:15 PM",
  },
];

/* ── Tip tiers for Support ──────────────────────── */

export const tipTiers = [
  { id: "tip-small", label: "Support", amountCents: 500, emoji: "💫" },
  { id: "tip-medium", label: "Premium", amountCents: 1500, emoji: "⭐" },
  { id: "tip-large", label: "VIP", amountCents: 5000, emoji: "�" },
];

/* ── Helpers ──────────────────────────────────────────── */

export function priceLabel(priceCents?: number) {
  if (!priceCents) return "Included";
  return `$${(priceCents / 100).toFixed(2)}`;
}

export function canAccessContent(session: AppSession | null, item: ContentItem) {
  if (!session) return false;
  if (session.role === "creator") return true;
  if (item.access === "subscription") return true;
  return session.ownedContent.includes(item.id);
}

export function tierBadge(plan: string) {
  if (plan === "yearly") return "⭐ VIP Access";
  if (plan === "quarterly") return "🔥 Premium Access";
  return "✨ Standard Access";
}
