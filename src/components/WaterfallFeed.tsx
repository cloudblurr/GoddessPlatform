"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Heart, MessageCircle, Bookmark, Lock, Megaphone, Radio,
  Vote, Gift, ShoppingBag, Play, Crown, BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

type FeedPost = {
  id: string;
  type: "post" | "locked" | "status" | "poll" | "announcement" | "campaign" | "freebie" | "store";
  title: string;
  body: string;
  image?: string;
  price?: string;
  tag: string;
  meta: string;
  time: string;
};

const feedData: FeedPost[] = [
  {
    id: "1",
    type: "status",
    title: "Back from set — tonight's previews are sorting now",
    body: "The first free preview stays open for everyone until midnight. Campaign holders get the full chapter first.",
    tag: "Update",
    meta: "Creator update",
    time: "8:42 PM",
  },
  {
    id: "2",
    type: "locked",
    title: "Neon Afterglow: private gallery",
    body: "38 stills, two voice notes, and a director cut hidden behind the shimmer.",
    image: "/SteamyUI.jpg",
    price: "$18",
    tag: "PPV",
    meta: "1.8K unlocks",
    time: "8:06 PM",
  },
  {
    id: "3",
    type: "announcement",
    title: "Live room opens at 10 PM",
    body: "VIPs enter first, top 20 supporters choose prompts, and the replay lands in your library.",
    image: "/StarlightUI.jpg",
    tag: "Live",
    meta: "4h remaining",
    time: "7:25 PM",
  },
  {
    id: "4",
    type: "freebie",
    title: "Free: Behind the scenes reel",
    body: "A quick look at how today's content got made. Enjoy this one on the house.",
    image: "/anna2.jpg",
    tag: "Free",
    meta: "Public",
    time: "6:50 PM",
  },
  {
    id: "5",
    type: "poll",
    title: "Vote: tomorrow's private room theme",
    body: "Chrome noir, soft hotel, or after-hours studio — your call.",
    image: "/BossyUI.jpg",
    tag: "Poll",
    meta: "2.4K votes",
    time: "5:38 PM",
  },
  {
    id: "6",
    type: "store",
    title: "Midnight Replay Pack",
    body: "A replay bundle with creator commentary, two locked scenes, and gallery extras.",
    image: "/StarlightUI.jpg",
    price: "$36",
    tag: "Store",
    meta: "58 min",
    time: "3:44 PM",
  },
  {
    id: "7",
    type: "campaign",
    title: "Aurora Week: Episode Room",
    body: "The full chapter catalog with locked and unlocked content side-by-side.",
    image: "/GloryUI.jpg",
    price: "$79 pass",
    tag: "Campaign",
    meta: "12 chapters",
    time: "Yesterday",
  },
  {
    id: "8",
    type: "post",
    title: "Soft Archive Volume II",
    body: "A polished throwback bundle with unlocked previews, discounted extras, and a limited tip goal.",
    image: "/LavendarUI.jpg",
    price: "$34",
    tag: "Bundle",
    meta: "32% off",
    time: "Yesterday",
  },
  {
    id: "9",
    type: "locked",
    title: "Polaroid Desk Drop",
    body: "Limited photo set with four unlockable variations and a private thank-you card.",
    image: "/LavendarUI.jpg",
    price: "$22",
    tag: "PPV",
    meta: "34 pics",
    time: "Mon",
  },
  {
    id: "10",
    type: "freebie",
    title: "Creator Q&A answers",
    body: "Answering the top 5 questions from last week's poll. Thanks for voting!",
    tag: "Free",
    meta: "Public",
    time: "Mon",
  },
];

type FilterKey = "all" | "post" | "locked" | "status" | "poll" | "announcement" | "campaign" | "freebie" | "store";

const filters: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "post", label: "Posts" },
  { key: "locked", label: "Locked" },
  { key: "poll", label: "Polls" },
  { key: "announcement", label: "Live" },
  { key: "campaign", label: "Campaigns" },
  { key: "freebie", label: "Free" },
  { key: "store", label: "Store" },
];

const typeIcon: Record<FeedPost["type"], React.ComponentType<{ size?: number; className?: string }>> = {
  post: Play,
  locked: Lock,
  status: Megaphone,
  poll: Vote,
  announcement: Radio,
  campaign: Crown,
  freebie: Gift,
  store: ShoppingBag,
};

const typeColor: Record<FeedPost["type"], string> = {
  post: "text-[var(--accent)]",
  locked: "text-[var(--rose)]",
  status: "text-[var(--amber)]",
  poll: "text-blue-400",
  announcement: "text-red-400",
  campaign: "text-[var(--accent)]",
  freebie: "text-[var(--emerald)]",
  store: "text-orange-400",
};

const tagBg: Record<FeedPost["type"], string> = {
  post: "bg-[var(--accent-dim)] text-[var(--accent-bright)]",
  locked: "bg-[var(--rose-dim)] text-[var(--rose)]",
  status: "bg-amber-500/10 text-amber-400",
  poll: "bg-blue-500/10 text-blue-400",
  announcement: "bg-red-500/10 text-red-400",
  campaign: "bg-[var(--accent-dim)] text-[var(--accent-bright)]",
  freebie: "bg-emerald-500/10 text-emerald-400",
  store: "bg-orange-500/10 text-orange-400",
};

export default function WaterfallFeed() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const items = filter === "all" ? feedData : feedData.filter((p) => p.type === filter);

  return (
    <div>
      {/* Filter row */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-3 pt-1 scrollbar-none">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors border",
              filter === f.key
                ? "bg-[var(--accent)] text-[var(--bg-base)] border-[var(--accent)]"
                : "bg-transparent text-[var(--ink-muted)] border-[var(--glass-border)] hover:text-[var(--ink)]",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Waterfall grid */}
      <div className="waterfall-grid mt-2">
        {items.map((post, i) => {
          const Icon = typeIcon[post.type];
          const hasImage = Boolean(post.image);
          return (
            <article
              key={post.id}
              className="glass-card overflow-hidden animate-slide-up group"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              {/* Image */}
              {hasImage && (
                <div className="relative aspect-[4/5] overflow-hidden bg-[var(--bg-surface)]">
                  <Image
                    src={post.image!}
                    alt={post.title}
                    fill
                    sizes="(min-width:1024px) 33vw, 50vw"
                    className={cn(
                      "object-cover transition-transform duration-500 group-hover:scale-105",
                      post.type === "locked" && "blur-[6px] brightness-50",
                    )}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Lock overlay */}
                  {post.type === "locked" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
                        <Lock size={12} /> {post.price}
                      </div>
                    </div>
                  )}

                  {/* Tag badge */}
                  <span className={cn("absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-semibold", tagBg[post.type])}>
                    {post.tag}
                  </span>
                </div>
              )}

              {/* Text-only header for imageless cards */}
              {!hasImage && (
                <div className="flex items-center gap-2 px-3 pt-3">
                  <div className={cn("w-7 h-7 rounded-full bg-[var(--bg-raised)] flex items-center justify-center", typeColor[post.type])}>
                    <Icon size={13} />
                  </div>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", tagBg[post.type])}>
                    {post.tag}
                  </span>
                  <span className="ml-auto text-[10px] text-[var(--ink-faint)]">{post.time}</span>
                </div>
              )}

              {/* Content */}
              <div className="p-3">
                {hasImage && (
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-[var(--ink-faint)]">{post.time}</span>
                    {post.price && post.type !== "locked" && (
                      <span className="text-[10px] font-semibold text-[var(--accent)]">{post.price}</span>
                    )}
                  </div>
                )}
                <h3 className="text-sm font-semibold leading-tight line-clamp-2">{post.title}</h3>
                <p className="text-xs text-[var(--ink-muted)] mt-1 line-clamp-2 leading-relaxed">{post.body}</p>
                <p className="text-[10px] text-[var(--ink-faint)] mt-1.5">{post.meta}</p>

                {/* Actions */}
                <div className="flex items-center gap-1 mt-2 pt-2 border-t border-[var(--glass-border)]">
                  <button
                    type="button"
                    onClick={() => setLiked((p) => ({ ...p, [post.id]: !p[post.id] }))}
                    className="p-1.5 rounded-md hover:bg-white/5 transition-colors"
                  >
                    <Heart size={14} className={cn("text-[var(--ink-faint)]", liked[post.id] && "fill-[var(--rose)] text-[var(--rose)]")} />
                  </button>
                  <button type="button" className="p-1.5 rounded-md hover:bg-white/5 transition-colors">
                    <MessageCircle size={14} className="text-[var(--ink-faint)]" />
                  </button>
                  <button type="button" className="p-1.5 rounded-md hover:bg-white/5 transition-colors ml-auto">
                    <Bookmark size={14} className="text-[var(--ink-faint)]" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <BarChart3 size={32} className="text-[var(--ink-faint)] mb-3" />
          <p className="text-sm text-[var(--ink-muted)]">No posts in this category yet.</p>
        </div>
      )}
    </div>
  );
}
