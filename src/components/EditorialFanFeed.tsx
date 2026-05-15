"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Cake,
  Crown,
  Flame,
  Grid2X2,
  KeyRound,
  Play,
  Quote,
  Sparkles,
  Star,
  Timer,
  Users,
  Video,
  Volume2,
  VolumeX,
} from "lucide-react";

type FeedType = "video" | "photo" | "audio" | "post" | "story" | "announcement" | "livestream";
type FeedTab = "latest" | "locked" | "stories" | "throwbacks" | "announcements";
type CardSize = "hero" | "standard" | "compact";
type MilestoneGate = "streak" | "points" | "anniversary" | "referral" | "tier";

type FeedItem = {
  id: string;
  type: FeedType;
  size: CardSize;
  title: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  isLocked: boolean;
  price?: string;
  tier?: string;
  series?: string;
  seriesProgress?: { unlocked: number; total: number };
  milestoneGate?: MilestoneGate;
  streakRequired?: number;
  pointsRequired?: number;
  anniversaryUnlocksInDays?: number;
  viewCount: number;
  reactionCounts: { fire: number; heart: number; gem: number };
  createdAt: string;
  expiresAt?: string;
  duration?: string;
  photoCount?: number;
  teaserText: string;
  engagementPotential: number;
  rankReason?: string;
  pinned?: boolean;
};

type UserState = {
  tier: "Member" | "Pro" | "VIP";
  streakDays: number;
  points: number;
  unlockedIds: string[];
  viewedIds: string[];
  partialProgressIds: string[];
  resumeIds: string[];
  referrals: number;
};

const creator = {
  name: "Xanna",
  avatarUrl: "/xanamain.jpg",
};

const userState: UserState = {
  tier: "Member",
  streakDays: 6,
  points: 850,
  unlockedIds: ["velvet-brief", "audio-afterlight", "arrival-note", "archive-polaroid"],
  viewedIds: ["arrival-note", "archive-polaroid"],
  partialProgressIds: ["violet-room", "rose-sequence"],
  resumeIds: ["velvet-brief"],
  referrals: 0,
};

const feedItems: FeedItem[] = [
  {
    id: "violet-room",
    type: "video",
    size: "hero",
    title: "The Violet Room Opens Once",
    thumbnailUrl: "/SteamyUI.jpg",
    videoUrl: "https://files.catbox.moe/97ukl2.mp4",
    isLocked: true,
    price: "$14",
    series: "Violet Room",
    seriesProgress: { unlocked: 2, total: 5 },
    viewCount: 28400,
    reactionCounts: { fire: 542, heart: 388, gem: 91 },
    createdAt: "2026-05-16T01:30:00Z",
    duration: "0:15",
    teaserText: "A door left half-open, just long enough to make you wonder.",
    engagementPotential: 99,
  },
  {
    id: "midnight-stillness",
    type: "photo",
    size: "standard",
    title: "Midnight Stillness",
    thumbnailUrl: "/anna3.jpg",
    isLocked: false,
    photoCount: 12,
    viewCount: 19420,
    reactionCounts: { fire: 214, heart: 607, gem: 72 },
    createdAt: "2026-05-15T20:10:00Z",
    teaserText: "A quiet photo set in warm light, made for slow scrolling.",
    engagementPotential: 82,
  },
  {
    id: "rose-sequence",
    type: "video",
    size: "standard",
    title: "Rose Sequence, Part III",
    thumbnailUrl: "/GloryUI.jpg",
    videoUrl: "https://files.catbox.moe/3lohl1.mp4",
    isLocked: true,
    price: "$9",
    series: "Rose Sequence",
    seriesProgress: { unlocked: 1, total: 4 },
    viewCount: 32700,
    reactionCounts: { fire: 711, heart: 420, gem: 188 },
    createdAt: "2026-05-15T05:45:00Z",
    duration: "0:12",
    teaserText: "The third frame changes the whole story.",
    engagementPotential: 96,
  },
  {
    id: "story-gold-hour",
    type: "story",
    size: "standard",
    title: "Gold Hour Story",
    thumbnailUrl: "/StarlightUI.jpg",
    isLocked: false,
    viewCount: 8800,
    reactionCounts: { fire: 120, heart: 301, gem: 24 },
    createdAt: "2026-05-16T03:00:00Z",
    expiresAt: "2026-05-16T21:00:00Z",
    teaserText: "Only here until tonight.",
    engagementPotential: 78,
  },
  {
    id: "streak-door",
    type: "photo",
    size: "standard",
    title: "The Seventh Day Door",
    thumbnailUrl: "/BossyUI.jpg",
    isLocked: true,
    milestoneGate: "streak",
    streakRequired: 7,
    viewCount: 15600,
    reactionCounts: { fire: 311, heart: 246, gem: 86 },
    createdAt: "2026-05-14T22:40:00Z",
    teaserText: "Come back tomorrow and she opens this herself.",
    engagementPotential: 91,
  },
  {
    id: "audio-afterlight",
    type: "audio",
    size: "standard",
    title: "Afterlight Voice Note",
    thumbnailUrl: "/LavendarUI.jpg",
    isLocked: false,
    viewCount: 7200,
    reactionCounts: { fire: 89, heart: 198, gem: 42 },
    createdAt: "2026-05-14T18:00:00Z",
    duration: "2:41",
    teaserText: "A private note for the ones who stayed up.",
    engagementPotential: 62,
  },
  {
    id: "points-veil",
    type: "photo",
    size: "standard",
    title: "The Veil Reward",
    thumbnailUrl: "/anna4.jpg",
    isLocked: true,
    milestoneGate: "points",
    pointsRequired: 1000,
    viewCount: 17800,
    reactionCounts: { fire: 390, heart: 301, gem: 112 },
    createdAt: "2026-05-13T15:00:00Z",
    teaserText: "150 more points and this appears without asking.",
    engagementPotential: 89,
  },
  {
    id: "arrival-note",
    type: "announcement",
    size: "compact",
    title: "A note before tonight",
    isLocked: false,
    viewCount: 12400,
    reactionCounts: { fire: 102, heart: 550, gem: 30 },
    createdAt: "2026-05-13T10:00:00Z",
    teaserText: "I saved the best room for the people who keep showing up first.",
    engagementPotential: 50,
    pinned: true,
  },
  {
    id: "live-soon",
    type: "livestream",
    size: "standard",
    title: "Velvet Booth Live",
    thumbnailUrl: "/xanamain.jpg",
    isLocked: false,
    viewCount: 5600,
    reactionCounts: { fire: 210, heart: 101, gem: 19 },
    createdAt: "2026-05-16T08:00:00Z",
    expiresAt: "2026-05-17T02:00:00Z",
    teaserText: "Live soon. The first wave gets the softer answers.",
    engagementPotential: 84,
  },
  {
    id: "archive-polaroid",
    type: "photo",
    size: "standard",
    title: "Archive Polaroid No. 7",
    thumbnailUrl: "/anna2.jpg",
    isLocked: false,
    photoCount: 7,
    viewCount: 9700,
    reactionCounts: { fire: 110, heart: 275, gem: 43 },
    createdAt: "2026-02-02T09:00:00Z",
    teaserText: "She wants you to see this one again.",
    engagementPotential: 64,
  },
  {
    id: "anniversary-suite",
    type: "video",
    size: "standard",
    title: "Anniversary Suite",
    thumbnailUrl: "/SteamyUI.jpg",
    isLocked: true,
    milestoneGate: "anniversary",
    anniversaryUnlocksInDays: 3,
    viewCount: 23200,
    reactionCounts: { fire: 441, heart: 388, gem: 160 },
    createdAt: "2026-05-12T19:00:00Z",
    duration: "0:15",
    teaserText: "Your 1-year reward is waiting under glass.",
    engagementPotential: 88,
  },
  {
    id: "referral-letter",
    type: "post",
    size: "compact",
    title: "Bring one person through the door",
    isLocked: true,
    milestoneGate: "referral",
    viewCount: 4300,
    reactionCounts: { fire: 51, heart: 74, gem: 18 },
    createdAt: "2026-05-11T14:00:00Z",
    teaserText: "Invite 1 friend and this exclusive note unlocks.",
    engagementPotential: 72,
  },
  {
    id: "vip-contact-sheet",
    type: "photo",
    size: "standard",
    title: "VIP Contact Sheet",
    thumbnailUrl: "/GloryUI.jpg",
    isLocked: true,
    tier: "VIP",
    milestoneGate: "tier",
    photoCount: 16,
    viewCount: 29100,
    reactionCounts: { fire: 502, heart: 330, gem: 205 },
    createdAt: "2026-05-10T22:00:00Z",
    teaserText: "Upgrade to VIP to see the uncut contact sheet.",
    engagementPotential: 93,
  },
  {
    id: "criterion-morning",
    type: "video",
    size: "standard",
    title: "Criterion Morning",
    thumbnailUrl: "/StarlightUI.jpg",
    videoUrl: "https://files.catbox.moe/97ukl2.mp4",
    isLocked: false,
    viewCount: 18300,
    reactionCounts: { fire: 241, heart: 399, gem: 67 },
    createdAt: "2026-05-09T16:00:00Z",
    duration: "0:15",
    teaserText: "Soft grain, slow camera, no rush.",
    engagementPotential: 69,
  },
  {
    id: "milestone-news",
    type: "announcement",
    size: "compact",
    title: "10K members",
    isLocked: false,
    viewCount: 25100,
    reactionCounts: { fire: 782, heart: 811, gem: 144 },
    createdAt: "2026-05-08T12:30:00Z",
    teaserText: "We crossed 10K. Tonight's drop is bigger because of you.",
    engagementPotential: 71,
    pinned: true,
  },
  {
    id: "throwback-lavender",
    type: "photo",
    size: "standard",
    title: "Lavender Hour, Resurfaced",
    thumbnailUrl: "/LavendarUI.jpg",
    isLocked: true,
    price: "$7",
    photoCount: 10,
    viewCount: 14100,
    reactionCounts: { fire: 189, heart: 288, gem: 58 },
    createdAt: "2026-01-18T18:00:00Z",
    teaserText: "The archive opens when the timing is right.",
    engagementPotential: 77,
  },
  {
    id: "story-afterparty",
    type: "story",
    size: "standard",
    title: "Afterparty Story",
    thumbnailUrl: "/BossyUI.jpg",
    isLocked: true,
    price: "$4",
    viewCount: 10900,
    reactionCounts: { fire: 277, heart: 190, gem: 65 },
    createdAt: "2026-05-16T02:00:00Z",
    expiresAt: "2026-05-16T12:00:00Z",
    teaserText: "Gone by noon.",
    engagementPotential: 94,
  },
];

const tabs: Array<{ id: FeedTab; label: string; dot?: boolean }> = [
  { id: "latest", label: "Latest", dot: true },
  { id: "locked", label: "Locked", dot: true },
  { id: "stories", label: "Stories", dot: true },
  { id: "throwbacks", label: "Throwbacks" },
  { id: "announcements", label: "Announcements", dot: true },
];

const filters: Array<{ id: "all" | FeedType; label: string }> = [
  { id: "all", label: "All" },
  { id: "photo", label: "Photos" },
  { id: "video", label: "Videos" },
  { id: "audio", label: "Audio" },
  { id: "post", label: "Posts" },
];

function hoursAgo(iso: string) {
  const diff = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 36e5));
  return diff < 24 ? `${diff}h ago` : `${Math.round(diff / 24)}d ago`;
}

function hoursUntil(iso?: string) {
  if (!iso) return null;
  const diff = Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 36e5));
  return diff;
}

function milestoneProgress(item: FeedItem, state: UserState) {
  if (item.milestoneGate === "streak" && item.streakRequired) {
    return Math.min(100, Math.round((state.streakDays / item.streakRequired) * 100));
  }
  if (item.milestoneGate === "points" && item.pointsRequired) {
    return Math.min(100, Math.round((state.points / item.pointsRequired) * 100));
  }
  if (item.milestoneGate === "referral") return state.referrals > 0 ? 100 : 0;
  if (item.milestoneGate === "tier") return state.tier === "VIP" ? 100 : 42;
  if (item.milestoneGate === "anniversary") return item.anniversaryUnlocksInDays === 0 ? 100 : 74;
  return 0;
}

function rankContent(items: FeedItem[], state: UserState) {
  return [...items]
    .map((item) => {
      const ageHours = (Date.now() - new Date(item.createdAt).getTime()) / 36e5;
      const expiresIn = hoursUntil(item.expiresAt);
      const isUnlocked = !item.isLocked || state.unlockedIds.includes(item.id);
      const progress = milestoneProgress(item, state);
      const hasSeriesProgress = item.seriesProgress && item.seriesProgress.unlocked > 0;
      let tier = 3;
      let reason = `${isUnlocked ? "New page" : "Premium"} · ${hoursAgo(item.createdAt)}`;

      if (item.isLocked && ageHours <= 48 && item.engagementPotential > 80) {
        tier = 1;
        reason = `New drop · ${hoursAgo(item.createdAt)}`;
      } else if (item.type === "story" && expiresIn !== null) {
        tier = 1;
        reason = `Expires in ${expiresIn}h`;
      } else if (state.resumeIds.includes(item.id)) {
        tier = 1;
        reason = "Resume where you left off";
      } else if (hasSeriesProgress) {
        tier = 2;
        reason = `${item.seriesProgress!.total - item.seriesProgress!.unlocked} more to complete the series`;
      } else if (item.type === "livestream" && expiresIn !== null && expiresIn <= 24) {
        tier = 2;
        reason = "Live room opens soon";
      } else if (item.milestoneGate && progress >= 80) {
        tier = 2;
        reason = "Almost unlocked";
      } else if (state.viewedIds.includes(item.id) && isUnlocked) {
        tier = 4;
        reason = "Previously viewed";
      } else if (item.isLocked && !hasSeriesProgress && !item.milestoneGate) {
        tier = 4;
        reason = "This is what you're missing";
      }

      return { ...item, rankReason: reason, rankTier: tier };
    })
    .sort((a, b) => {
      if (a.rankTier !== b.rankTier) return a.rankTier - b.rankTier;
      if (a.rankTier === 1 && a.type === "story" && b.type === "story") {
        return new Date(a.expiresAt || 0).getTime() - new Date(b.expiresAt || 0).getTime();
      }
      if (a.rankTier === 4) return b.engagementPotential - a.engagementPotential;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

function typeLabel(item: FeedItem) {
  if (item.type === "photo") return item.photoCount ? `${item.photoCount} photos` : "Photo set";
  if (item.type === "video") return "Video";
  if (item.type === "audio") return "Audio";
  if (item.type === "livestream") return "Live Soon";
  if (item.type === "story") return "Story";
  return "Post";
}

function MilestoneIcon({ gate }: { gate?: MilestoneGate }) {
  const props = { size: 22, strokeWidth: 1.8 };
  if (gate === "streak") return <Flame {...props} />;
  if (gate === "points") return <Star {...props} />;
  if (gate === "anniversary") return <Cake {...props} />;
  if (gate === "referral") return <Users {...props} />;
  if (gate === "tier") return <Crown {...props} />;
  return <KeyRound {...props} />;
}

function AudioWave() {
  return (
    <div className="editorial-wave" aria-hidden="true">
      {Array.from({ length: 22 }, (_, index) => <span key={index} style={{ "--i": index } as React.CSSProperties} />)}
    </div>
  );
}

function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const node = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting && entry.intersectionRatio >= 0.6),
      { threshold: [0, 0.6, 1] },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, visible] as const;
}

function VideoTeaser({ item, muted }: { item: FeedItem; muted: boolean }) {
  const [ref, visible] = useInView<HTMLDivElement>();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (visible) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [visible]);

  return (
    <div className="editorial-media editorial-video" ref={ref}>
      {item.videoUrl && visible ? (
        <video ref={videoRef} src={item.videoUrl} muted={muted} loop playsInline preload="metadata" poster={item.thumbnailUrl} />
      ) : item.thumbnailUrl ? (
        <Image src={item.thumbnailUrl} alt="" fill sizes="(min-width: 768px) 48vw, 100vw" />
      ) : null}
      <span className="editorial-play-affordance"><Play size={14} fill="currentColor" /> Tap to watch</span>
    </div>
  );
}

function Reactions({ item }: { item: FeedItem }) {
  const [floats, setFloats] = useState<Array<{ id: number; emoji: string }>>([]);

  const react = (emoji: string) => {
    const id = Date.now();
    setFloats((current) => [...current, { id, emoji }]);
    window.setTimeout(() => setFloats((current) => current.filter((entry) => entry.id !== id)), 900);
  };

  return (
    <div className="editorial-reactions" aria-label="Reaction counts">
      <button type="button" onClick={() => react("🔥")}>🔥 {item.reactionCounts.fire}</button>
      <button type="button" onClick={() => react("❤️")}>❤️ {item.reactionCounts.heart}</button>
      <button type="button" onClick={() => react("💎")}>💎 {item.reactionCounts.gem}</button>
      {floats.map((entry) => <span className="editorial-float" key={entry.id}>{entry.emoji}</span>)}
    </div>
  );
}

function LockedOverlay({ item, state }: { item: FeedItem; state: UserState }) {
  const progress = milestoneProgress(item, state);
  const milestoneText =
    item.milestoneGate === "streak" && item.streakRequired
      ? `You're ${Math.max(0, item.streakRequired - state.streakDays)} day away`
      : item.milestoneGate === "points" && item.pointsRequired
        ? `${Math.max(0, item.pointsRequired - state.points)} more points`
        : item.milestoneGate === "anniversary"
          ? `Unlocks in ${item.anniversaryUnlocksInDays} days`
          : item.milestoneGate === "referral"
            ? "Invite 1 friend"
            : item.milestoneGate === "tier"
              ? "Upgrade to VIP"
              : item.price || item.tier || "VIP Only";

  return (
    <div className="editorial-lock-overlay" aria-label={`Locked content: ${milestoneText}`}>
      <div className="editorial-lock-mark"><MilestoneIcon gate={item.milestoneGate} /></div>
      <strong>{item.price ? `Unlock for ${item.price}` : milestoneText}</strong>
      <p>{item.teaserText}</p>
      {item.milestoneGate ? (
        <div className="editorial-milestone">
          <span><i style={{ width: `${progress}%` }} /></span>
          <small>{milestoneText}</small>
        </div>
      ) : null}
      {item.seriesProgress ? (
        <div className="editorial-series">
          <span>{item.seriesProgress.unlocked} of {item.seriesProgress.total} unlocked</span>
          <small>{item.series}</small>
        </div>
      ) : null}
      <button type="button">Unlock Now →</button>
      <a href="#preview">Preview 15s free</a>
      <em>{Math.round(item.engagementPotential * 1.7)} others unlocked this today</em>
    </div>
  );
}

function FeedCard({
  item,
  state,
  onSelect,
  muted,
}: {
  item: FeedItem;
  state: UserState;
  onSelect: (item: FeedItem) => void;
  muted: boolean;
}) {
  const [ref, visible] = useInView<HTMLElement>();
  const isCompact = item.size === "compact" || item.type === "announcement" || item.type === "post";
  const isHero = item.size === "hero";
  const isLocked = item.isLocked && !state.unlockedIds.includes(item.id);
  const expiresIn = hoursUntil(item.expiresAt);

  return (
    <article
      ref={ref}
      className={[
        "editorial-card",
        isHero ? "is-hero" : "",
        isCompact ? "is-compact" : "is-standard",
        isLocked ? "is-locked" : "is-unlocked",
        visible ? "is-visible" : "",
      ].filter(Boolean).join(" ")}
      tabIndex={0}
      onClick={() => onSelect(item)}
      onKeyDown={(event) => {
        if (event.key === "Enter") onSelect(item);
      }}
    >
      <div className="editorial-rank">{item.rankReason}</div>

      {isCompact ? (
        <div className="editorial-compact-body">
          <Image src={creator.avatarUrl} alt="" width={42} height={42} />
          <div>
            <div className="editorial-byline">{creator.name} · {hoursAgo(item.createdAt)}</div>
            <h2>{item.title}</h2>
            <p><Quote size={16} /> {item.teaserText}</p>
            <Reactions item={item} />
          </div>
        </div>
      ) : (
        <>
          <div className="editorial-visual">
            {item.type === "audio" ? (
              <AudioWave />
            ) : item.type === "video" || item.type === "livestream" ? (
              <VideoTeaser item={item} muted={muted} />
            ) : item.thumbnailUrl ? (
              <Image src={item.thumbnailUrl} alt="" fill sizes={isHero ? "900px" : "(min-width: 768px) 44vw, 100vw"} loading={isHero ? "eager" : "lazy"} />
            ) : null}
            <div className="editorial-gradient" />
            <span className={`editorial-type ${item.type === "livestream" ? "is-live" : ""}`}>
              {item.type === "video" ? <Video size={14} /> : item.type === "photo" ? <Grid2X2 size={14} /> : item.type === "audio" ? <Volume2 size={14} /> : null}
              {typeLabel(item)}
            </span>
            {item.duration ? <span className="editorial-duration">{item.duration}</span> : null}
            {expiresIn !== null ? <span className="editorial-expiry"><Timer size={13} /> {expiresIn}h</span> : null}
          </div>
          <div className="editorial-copy">
            <div className="editorial-byline">{creator.name} · {hoursAgo(item.createdAt)}</div>
            <h2>{item.title}</h2>
            <p>{item.teaserText}</p>
            <div className="editorial-meta">
              <span>{item.viewCount.toLocaleString()} views</span>
              <Reactions item={item} />
            </div>
          </div>
          {isLocked ? <LockedOverlay item={item} state={state} /> : null}
        </>
      )}
    </article>
  );
}

function EmptyState({ tab }: { tab: FeedTab }) {
  const copy: Record<FeedTab, string> = {
    latest: "She's cooking something. Check back soon.",
    locked: "You own it all! Nothing locked here.",
    stories: "No active stories right now.",
    throwbacks: "Check back - the archives open soon.",
    announcements: "All quiet. She'll speak when the time is right.",
  };

  return (
    <div className="editorial-empty">
      <Image src={creator.avatarUrl} alt="" width={72} height={72} />
      <p>{copy[tab]}</p>
    </div>
  );
}

export default function EditorialFanFeed() {
  const [activeTab, setActiveTab] = useState<FeedTab>("latest");
  const [filter, setFilter] = useState<"all" | FeedType>("all");
  const [showLocked, setShowLocked] = useState(true);
  const [muted, setMuted] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem("editorial-audio-muted") !== "false";
  });
  const [visibleCount, setVisibleCount] = useState(12);
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [newBanner, setNewBanner] = useState(false);
  const [now] = useState(() => Date.now());
  const ranked = useMemo(() => rankContent(feedItems, userState), []);

  useEffect(() => {
    window.localStorage.setItem("editorial-audio-muted", String(muted));
  }, [muted]);

  const tabItems = useMemo(() => {
    let items = ranked;
    if (activeTab === "locked") items = ranked.filter((item) => item.isLocked && !userState.unlockedIds.includes(item.id)).sort((a, b) => b.engagementPotential - a.engagementPotential);
    if (activeTab === "stories") items = ranked.filter((item) => item.type === "story");
    if (activeTab === "throwbacks") items = ranked.filter((item) => new Date(item.createdAt).getTime() < now - 1000 * 60 * 60 * 24 * 45);
    if (activeTab === "announcements") items = ranked.filter((item) => item.type === "announcement" || item.type === "post").sort((a, b) => Number(b.pinned) - Number(a.pinned));
    if (activeTab === "latest") {
      items = items.filter((item) => (filter === "all" ? true : item.type === filter));
      if (!showLocked) items = items.filter((item) => !item.isLocked || userState.unlockedIds.includes(item.id));
    }
    return items;
  }, [activeTab, filter, now, ranked, showLocked]);

  const shownItems = tabItems.slice(0, visibleCount);
  const hero = shownItems.find((item) => item.size === "hero") || shownItems[0];
  const cards = shownItems.filter((item) => item.id !== hero?.id);

  const refresh = () => {
    setRefreshing(true);
    window.setTimeout(() => {
      setRefreshing(false);
      setNewBanner(true);
      window.setTimeout(() => setNewBanner(false), 2800);
    }, 800);
  };

  return (
    <div className="editorial-feed-shell">
      <div className="editorial-grain" aria-hidden="true" />
      <header className="editorial-header">
        <button type="button" className={`editorial-refresh ${refreshing ? "is-refreshing" : ""}`} onClick={refresh} aria-label="Refresh feed">
          <Image src={creator.avatarUrl} alt="" width={44} height={44} />
        </button>
        <div>
          <p>Private editorial feed</p>
          <h1>{creator.name}</h1>
        </div>
        <button type="button" className="editorial-audio" onClick={() => setMuted((value) => !value)} aria-label={muted ? "Enable teaser audio" : "Mute teaser audio"}>
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </header>

      <div className="editorial-layout">
        <nav className="editorial-tabs" aria-label="Feed tabs">
          {tabs.map((tab) => (
            <button type="button" className={activeTab === tab.id ? "is-active" : ""} onClick={() => { setActiveTab(tab.id); setVisibleCount(12); }} key={tab.id}>
              {tab.label}
              {tab.dot ? <span /> : null}
            </button>
          ))}
        </nav>

        <main className="editorial-main" aria-live="polite">
          {newBanner ? <div className="editorial-new-banner">3 new drops ↑</div> : null}

          {activeTab === "latest" ? (
            <div className="editorial-filters">
              {filters.map((item) => (
                <button type="button" className={filter === item.id ? "is-active" : ""} onClick={() => setFilter(item.id)} key={item.id}>
                  {item.label}
                </button>
              ))}
              <label>
                <input type="checkbox" checked={showLocked} onChange={(event) => setShowLocked(event.target.checked)} />
                Show Locked
              </label>
            </div>
          ) : null}

          {shownItems.length === 0 ? (
            <EmptyState tab={activeTab} />
          ) : (
            <div className="editorial-pane" key={activeTab}>
              {hero ? <FeedCard item={hero} state={userState} onSelect={setSelectedItem} muted={muted} /> : null}
              <div className="editorial-masonry">
                {cards.map((item) => (
                  <FeedCard item={item} state={userState} onSelect={setSelectedItem} muted={muted} key={item.id} />
                ))}
              </div>
              {tabItems.length > visibleCount ? (
                <button type="button" className="editorial-load-more" onClick={() => setVisibleCount((count) => count + 6)}>
                  Load More
                </button>
              ) : null}
            </div>
          )}
        </main>

        <aside className={`editorial-detail ${selectedItem ? "is-open" : ""}`} aria-label="Selected content detail">
          {selectedItem ? (
            <>
              <button type="button" onClick={() => setSelectedItem(null)}>Close</button>
              <p>{selectedItem.rankReason}</p>
              <h2>{selectedItem.title}</h2>
              <span>{typeLabel(selectedItem)} · {selectedItem.viewCount.toLocaleString()} views</span>
              <p>{selectedItem.teaserText}</p>
              {selectedItem.isLocked && !userState.unlockedIds.includes(selectedItem.id) ? (
                <button type="button">Unlock {selectedItem.price || selectedItem.tier || "Milestone"}</button>
              ) : (
                <button type="button"><Play size={16} fill="currentColor" /> Open Player</button>
              )}
            </>
          ) : (
            <>
              <Sparkles size={22} />
              <p>Select a page to inspect the detail without leaving the feed.</p>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
