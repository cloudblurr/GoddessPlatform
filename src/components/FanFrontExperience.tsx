"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bell,
  BookOpen,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  Clock,
  Crown,
  Flame,
  Gem,
  Gift,
  Heart,
  Home,
  Library,
  Lock,
  Megaphone,
  MessageCircle,
  Package,
  Play,
  Quote,
  Radio,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Trophy,
  User,
  Video,
  Vote,
  Wallet,
  WandSparkles,
} from "lucide-react";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { DemoCreator } from "@/lib/demo-mode";

type FanFrontMode = "feed" | "store" | "campaign" | "library" | "wallet" | "profile" | "settings";

type FanFrontExperienceProps = {
  creator: DemoCreator;
  creatorId: string;
  initialMode?: FanFrontMode;
  isCreatorPreview?: boolean;
};

const feedPosts = [
  {
    type: "Creator drop",
    title: "Neon Afterglow: private gallery transmission",
    copy: "38 stills, two voice notes, and a director cut hidden behind the shimmer.",
    image: "/SteamyUI.jpg",
    price: "$18",
    state: "Locked",
    meta: "1.8K unlocks today",
    icon: Lock,
  },
  {
    type: "Announcement",
    title: "Tonight's live room opens at 10",
    copy: "VIPs enter first, top 20 supporters choose prompts, and the replay lands in your library.",
    image: "/StarlightUI.jpg",
    price: "Included",
    state: "Live soon",
    meta: "4h remaining",
    icon: Radio,
  },
  {
    type: "Bundle",
    title: "Soft Archive Volume II",
    copy: "A polished throwback bundle with unlocked previews, discounted extras, and a limited tip goal.",
    image: "/LavendarUI.jpg",
    price: "$34",
    state: "Deal",
    meta: "32% off",
    icon: Package,
  },
];

const rails = [
  { label: "Bundles", value: "4 active", mode: "store" as FanFrontMode, icon: Package },
  { label: "Deals", value: "32% flash", mode: "store" as FanFrontMode, icon: Gift },
  { label: "Announcements", value: "Live tonight", mode: "feed" as FanFrontMode, icon: Megaphone },
  { label: "Campaigns", value: "Aurora Week", mode: "campaign" as FanFrontMode, icon: Radio },
  { label: "Polls", value: "2 open", mode: "feed" as FanFrontMode, icon: Vote },
  { label: "Wishlist", value: "$420 goal", mode: "feed" as FanFrontMode, icon: Gem },
];

const quickCollections = [
  { title: "New drops", count: "8 fresh", image: "/SteamyUI.jpg", mode: "feed" as FanFrontMode },
  { title: "Unlockables", count: "21 items", image: "/BossyUI.jpg", mode: "store" as FanFrontMode },
  { title: "Campaign room", count: "12 episodes", image: "/GloryUI.jpg", mode: "campaign" as FanFrontMode },
  { title: "Creator wishlist", count: "$311 funded", image: "/xanamain.jpg", mode: "feed" as FanFrontMode },
];

const feedShortcuts = [
  { label: "Latest", detail: "3 posts", icon: Clock },
  { label: "Locked", detail: "5 previews", icon: Lock },
  { label: "Deals", detail: "32% off", icon: Gift },
  { label: "Polls", detail: "Vote now", icon: Vote },
  { label: "Live", detail: "Tonight", icon: Radio },
];

const storeItems = [
  {
    title: "Aurora Week All-Access Pass",
    copy: "Every campaign post, locked replay, BTS gallery, and VIP comment priority.",
    image: "/GloryUI.jpg",
    price: "$79",
    tag: "Campaign pass",
    metric: "Best value",
    rating: "4.9",
    duration: "12 drops",
  },
  {
    title: "Custom Voice Note",
    copy: "A personalized 90-second note delivered to your library with optional private prompt.",
    image: "/anna4.jpg",
    price: "$45",
    tag: "Custom",
    metric: "24h delivery",
    rating: "5.0",
    duration: "Audio",
  },
  {
    title: "Velvet Vault Bundle",
    copy: "Seven premium posts that never had to hit the feed. Unlock, tip, save, and replay anytime.",
    image: "/BossyUI.jpg",
    price: "$29",
    tag: "Bundle",
    metric: "7 items",
    rating: "4.8",
    duration: "42 min",
  },
  {
    title: "Tip the Studio Goal",
    copy: "Support the next concept shoot and claim a sponsor badge on the leaderboard.",
    image: "/xanamain.jpg",
    price: "$10+",
    tag: "Tip goal",
    metric: "68% funded",
    rating: "Goal",
    duration: "Live",
  },
  {
    title: "Midnight Replay Pack",
    copy: "A cinematic replay bundle with two locked scenes, gallery extras, and creator commentary.",
    image: "/StarlightUI.jpg",
    price: "$36",
    tag: "Replay",
    metric: "Creator pick",
    rating: "4.9",
    duration: "58 min",
  },
  {
    title: "Polaroid Desk Drop",
    copy: "A limited photo set with four unlockable variations and a private thank-you card.",
    image: "/LavendarUI.jpg",
    price: "$22",
    tag: "Photo set",
    metric: "Limited",
    rating: "4.7",
    duration: "34 pics",
  },
];

const campaignEpisodes = [
  {
    title: "Episode 01: Signal",
    locked: false,
    kind: "Video",
    quote: "The first message arrives before the city wakes.",
    detail: "Opening scene, creator note, and two unlocked stills.",
    image: "/GloryUI.jpg",
    progress: 100,
  },
  {
    title: "Episode 02: Chrome Bloom",
    locked: true,
    kind: "Photo set",
    quote: "Every reflection tells a slightly different secret.",
    detail: "A locked gallery with 28 stills and alternate color grades.",
    image: "/SteamyUI.jpg",
    progress: 38,
  },
  {
    title: "Episode 03: Before the Drop",
    locked: false,
    kind: "Audio",
    quote: "A voice note from the green room, intimate and unpolished.",
    detail: "Unlocked audio plus context cards for the final act.",
    image: "/anna4.jpg",
    progress: 100,
  },
  {
    title: "Episode 04: Afterlight",
    locked: true,
    kind: "Replay",
    quote: "The room changes once the live stream ends.",
    detail: "VIP replay, behind-the-scenes fragments, and top fan callouts.",
    image: "/StarlightUI.jpg",
    progress: 12,
  },
  {
    title: "Finale Poll: Choose the Door",
    locked: false,
    kind: "Poll",
    quote: "Fans pick the ending, the creator performs the winning route.",
    detail: "Vote-driven finale with public results and supporter multipliers.",
    image: "/BossyUI.jpg",
    progress: 100,
  },
];

const leaderboard = [
  { name: "NovaKing", score: "14.8K", badge: "Crown" },
  { name: "VelvetRay", score: "11.2K", badge: "Streak" },
  { name: "MinaLux", score: "9.9K", badge: "Wishlist" },
  { name: "Afterglow", score: "8.7K", badge: "Tips" },
];

const navItems: Array<{ id: FanFrontMode; label: string; icon: typeof Home }> = [
  { id: "feed", label: "Feed", icon: Home },
  { id: "store", label: "Store", icon: ShoppingBag },
  { id: "campaign", label: "Campaigns", icon: Radio },
  { id: "library", label: "Library", icon: BookOpen },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "profile", label: "Profile", icon: User },
];

function CreatorAvatar({ creator, size = 72 }: { creator: DemoCreator; size?: number }) {
  return (
    <div
      className="relative shrink-0 rounded-full bg-[conic-gradient(from_180deg,#14f1d9,#f43f8f,#f6d365,#14f1d9)] p-[3px] shadow-[0_0_36px_rgba(20,241,217,.25)]"
      style={{ width: size, height: size }}
    >
      <div className="relative size-full overflow-hidden rounded-full bg-black">
        <Image src={creator.avatar} alt={creator.name} fill sizes={`${size}px`} className="object-cover" />
      </div>
    </div>
  );
}

function SectionShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</section>;
}

function LuxuryCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={cn("border-white/10 bg-white/[0.055] shadow-[0_24px_80px_rgba(0,0,0,.32)] backdrop-blur-xl", className)}>
      {children}
    </Card>
  );
}

export default function FanFrontExperience({
  creator,
  creatorId,
  initialMode = "feed",
  isCreatorPreview = false,
}: FanFrontExperienceProps) {
  const [mode, setMode] = useState<FanFrontMode>(initialMode);
  const [entered, setEntered] = useState(false);
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const statLine = useMemo(
    () => [
      `${creator.subscriberCount.toLocaleString()} fans`,
      `${creator.postCount} posts`,
      `$${creator.monthlyPrice}/mo`,
    ],
    [creator],
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050711] text-white">
      <motion.div
        aria-hidden
        className="fixed inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(20,241,217,.22),transparent_30rem),radial-gradient(circle_at_80%_20%,rgba(244,63,143,.20),transparent_28rem),radial-gradient(circle_at_50%_90%,rgba(246,211,101,.14),transparent_34rem),linear-gradient(180deg,#050711,#090711_45%,#03050b)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:44px_44px] opacity-30" />
      </motion.div>

      {!entered && (
        <motion.button
          type="button"
          onClick={() => setEntered(true)}
          className="fixed inset-0 z-50 grid place-items-center bg-[#03050b] p-6 text-left"
        >
          <motion.div
            className="absolute inset-y-0 left-0 w-1/2 bg-[linear-gradient(90deg,#050711,#10152b)]"
            animate={{ x: entered ? "-100%" : "0%" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            className="absolute inset-y-0 right-0 w-1/2 bg-[linear-gradient(270deg,#050711,#151024)]"
            animate={{ x: entered ? "100%" : "0%" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            className="relative z-10 flex max-w-xl flex-col items-center text-center"
            initial={{ y: 18, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
          >
            <CreatorAvatar creator={creator} size={118} />
            <Badge variant="neon" className="mt-6">FanFront online</Badge>
            <h1 className="mt-4 text-5xl font-bold tracking-normal sm:text-7xl">{creator.name}</h1>
            <p className="mt-4 max-w-lg text-base text-white/65">{creator.bio}</p>
            <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold">
              <Sparkles className="size-4 text-cyan-200" />
              Tap to enter the creator universe
            </span>
          </motion.div>
        </motion.button>
      )}

      <div className="relative z-10 pb-28">
        <HeaderNav creator={creator} mode={mode} setMode={setMode} />

        <SectionShell className="pt-4 md:pt-6">
          <div className="grid min-h-[430px] gap-6 lg:grid-cols-[1.25fr_.75fr]">
            <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black shadow-[0_30px_110px_rgba(0,0,0,.45)]">
              <Image src={creator.banner} alt={`${creator.name} banner`} fill priority sizes="(min-width:1024px) 60vw, 100vw" className="object-cover opacity-75" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,7,17,.94),rgba(5,7,17,.36),rgba(5,7,17,.88))]" />
              <div className="relative flex h-full min-h-[430px] flex-col justify-end p-6 sm:p-8 lg:p-10">
                <Badge variant="gold" className="w-fit">Premium creator portal</Badge>
                <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-[.95] tracking-normal sm:text-7xl">
                  A living feed, vault store, and campaign world for {creator.name}.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/68">
                  Unlock drops, shop customs without waiting for feed posts, tip studio goals, vote on the next scene,
                  and jump straight into the rooms that matter.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  {statLine.map((stat) => (
                    <span key={stat} className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm text-white/78">
                      {stat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <LeaderboardPanel />
          </div>
        </SectionShell>

        <SectionShell className="pt-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {rails.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setMode(item.mode)}
                  className="group rounded-lg border border-white/10 bg-white/[0.055] p-4 text-left backdrop-blur transition hover:-translate-y-0.5 hover:border-cyan-200/30 hover:bg-white/10"
                >
                  <Icon className="size-5 text-cyan-200" />
                  <p className="mt-4 text-sm font-semibold">{item.label}</p>
                  <p className="text-xs text-white/50">{item.value}</p>
                </button>
              );
            })}
          </div>
        </SectionShell>

        <SectionShell className="pt-6">
          {mode === "feed" && <FeedFront setMode={setMode} liked={liked} setLiked={setLiked} />}
          {mode === "store" && <StoreFront setMode={setMode} />}
          {mode === "campaign" && <CampaignFront creatorId={creatorId} />}
          {mode === "library" && <SimplePanel title="My Library" icon={Library} copy="Unlocked drops, purchased customs, campaign passes, and replay access are organized here." />}
          {mode === "wallet" && <SimplePanel title="Wallet" icon={Wallet} copy="Track credits, tips, unlock history, subscriptions, and campaign contributions." />}
          {mode === "profile" && <SimplePanel title="Fan Profile" icon={User} copy="Your fan badges, leaderboard streak, private preferences, and saved creator worlds live here." />}
          {mode === "settings" && <SimplePanel title="Settings" icon={Settings} copy="Notification cadence, privacy, billing, accessibility, and display settings." />}
        </SectionShell>
      </div>

      <BottomNav mode={mode} setMode={setMode} />

      {isCreatorPreview && (
        <Link
          href="/creator"
          className="fixed right-4 top-4 z-40 rounded-full border border-white/15 bg-black/70 px-4 py-2 text-sm font-semibold text-white backdrop-blur"
        >
          Creator preview
        </Link>
      )}
    </main>
  );
}

function HeaderNav({
  creator,
  mode,
  setMode,
}: {
  creator: DemoCreator;
  mode: FanFrontMode;
  setMode: (mode: FanFrontMode) => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050711]/78 backdrop-blur-xl">
      <SectionShell className="py-3">
        <div className="flex items-center gap-3">
          <CreatorAvatar creator={creator} size={44} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold">{creator.name}</p>
              <Badge variant="neon" className="hidden sm:inline-flex">Live world</Badge>
            </div>
            <p className="truncate text-xs text-white/45">{creator.handle}</p>
          </div>
          <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.055] p-1 md:flex">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const active = mode === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMode(item.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white/55 transition",
                    active && "bg-white text-black",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
          <Button variant="luxury" size="icon" aria-label="Notifications">
            <Bell className="size-4" />
          </Button>
          <Button variant="neon" size="pill" className="hidden sm:inline-flex">
            <Crown className="size-4" />
            Subscribe
          </Button>
        </div>
      </SectionShell>
    </header>
  );
}

function BottomNav({ mode, setMode }: { mode: FanFrontMode; setMode: (mode: FanFrontMode) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-4 z-40 px-3 md:hidden">
      <div className="mx-auto grid w-full max-w-md grid-cols-5 gap-1 rounded-[1.6rem] border border-white/15 bg-black/78 p-1.5 shadow-[0_18px_70px_rgba(0,0,0,.48)] backdrop-blur-xl">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = mode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              className={cn(
                "flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-semibold text-white/50 transition",
                active && "bg-white text-black shadow-[0_0_28px_rgba(255,255,255,.22)]",
              )}
            >
              <Icon className="size-4" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function LeaderboardPanel() {
  return (
    <LuxuryCard>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <Badge variant="neon">Leaderboard</Badge>
          <Trophy className="size-5 text-amber-200" />
        </div>
        <div className="mt-5 space-y-3">
          {leaderboard.map((fan, index) => (
            <div key={fan.name} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.055] p-3">
              <span className="grid size-9 place-items-center rounded-full bg-white/10 text-sm font-bold">#{index + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{fan.name}</p>
                <p className="text-xs text-white/50">{fan.badge} supporter</p>
              </div>
              <Badge variant={index === 0 ? "gold" : "luxury"}>{fan.score}</Badge>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-lg border border-fuchsia-300/20 bg-fuchsia-300/10 p-4">
          <p className="text-sm font-semibold">Current campaign boost</p>
          <p className="mt-1 text-sm text-white/60">Tip, unlock, vote, or fulfill wishlist items to move up.</p>
          <Progress value={68} className="mt-4" />
        </div>
      </CardContent>
    </LuxuryCard>
  );
}

function FeedFront({
  setMode,
  liked,
  setLiked,
}: {
  setMode: (mode: FanFrontMode) => void;
  liked: Record<string, boolean>;
  setLiked: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <LuxuryCard>
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <Badge variant="neon">Discovery board</Badge>
                <h2 className="mt-3 text-3xl font-bold tracking-normal sm:text-4xl">Find the good stuff faster.</h2>
                <p className="mt-2 text-sm text-white/58">Jump by type, campaign, unlock status, deal, or creator moment.</p>
              </div>
              <div className="relative w-full lg:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
                <Input placeholder="Search drops, polls, deals" className="h-11 rounded-full border-white/10 bg-black/25 pl-9" />
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              {quickCollections.map((item) => (
                <button key={item.title} type="button" onClick={() => setMode(item.mode)} className="group relative min-h-40 overflow-hidden rounded-lg border border-white/10 bg-black text-left">
                  <Image src={item.image} alt={item.title} fill sizes="25vw" className="object-cover opacity-70 transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,.84))]" />
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-xs text-white/55">{item.count}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {feedShortcuts.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.label} type="button" className="flex min-w-36 items-center gap-3 rounded-full border border-white/10 bg-white/[0.055] px-4 py-3 text-left">
                    <Icon className="size-4 text-cyan-200" />
                    <span>
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className="block text-xs text-white/45">{item.detail}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </LuxuryCard>

        <LuxuryCard>
          <CardContent className="p-5">
            <Badge variant="gold">Today</Badge>
            <div className="mt-4 grid gap-3">
              {["Live room opens at 10", "Aurora pass 32% off", "Wishlist 74% funded"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.055] p-3">
                  <Sparkles className="size-4 text-amber-100" />
                  <p className="text-sm font-semibold">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </LuxuryCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4 xl:grid-cols-2">
          {feedPosts.map((post, index) => {
            const Icon = post.icon;
            return (
              <motion.article
                key={post.title}
                initial={{ y: 22, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.06 }}
                className={cn(
                  "overflow-hidden rounded-lg border border-white/10 bg-white/[0.055] shadow-[0_24px_80px_rgba(0,0,0,.3)] backdrop-blur-xl",
                  index === 0 && "xl:col-span-2",
                )}
              >
                <div className={cn("relative", index === 0 ? "min-h-[360px]" : "min-h-[280px]")}>
                  <Image src={post.image} alt={post.title} fill sizes="(min-width:1280px) 40vw, 100vw" className={cn("object-cover", post.state === "Locked" && "blur-sm")} />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,17,.1),rgba(5,7,17,.92))]" />
                  {post.state === "Locked" && (
                    <div className="absolute inset-0 grid place-items-center bg-black/25 p-6 text-center backdrop-blur-[2px]">
                      <div className="max-w-sm rounded-lg border border-white/15 bg-black/45 p-5">
                        <Lock className="mx-auto size-8 text-cyan-200" />
                        <p className="mt-3 font-semibold">Premium content locked</p>
                        <p className="mt-1 text-sm text-white/60">Unlock this post or grab the full bundle in Store.</p>
                        <Button className="mt-4 w-full" variant="neon" onClick={() => setMode("store")}>Unlock {post.price}</Button>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="luxury"><Icon className="size-3" />{post.type}</Badge>
                      <Badge variant={post.state === "Deal" ? "gold" : "neon"}>{post.state}</Badge>
                    </div>
                    <h3 className="mt-4 text-2xl font-bold tracking-normal sm:text-3xl">{post.title}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/66">{post.copy}</p>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                      <div className="flex items-center gap-3 text-sm text-white/55">
                        <span>{post.meta}</span>
                        <span>{post.price}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setLiked((prev) => ({ ...prev, [post.title]: !prev[post.title] }))}>
                          <Heart className={cn("size-4", liked[post.title] && "fill-fuchsia-300 text-fuchsia-300")} />
                          {liked[post.title] ? "Loved" : "Love"}
                        </Button>
                        <Button variant="ghost" size="sm"><MessageCircle className="size-4" />Comment</Button>
                        <Button variant="luxury" size="sm"><Wallet className="size-4" />Tip</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        <FeedSidebar />
      </div>
    </div>
  );
}

function FeedSidebar() {
  return (
    <aside className="space-y-4">
      <LuxuryCard>
        <CardContent className="p-5">
          <Badge variant="gold">Wishlist</Badge>
          <h3 className="mt-3 text-2xl font-semibold tracking-normal">Chrome Bloom set build</h3>
          <p className="mt-2 text-sm text-white/60">Creator wishlist item: reflective wall kit for the next studio scene.</p>
          <Progress value={74} className="mt-4" />
          <div className="mt-4 flex items-center justify-between text-sm text-white/55">
            <span>$420 goal</span>
            <span>$311 funded</span>
          </div>
          <Button variant="neon" className="mt-5 w-full"><Gem className="size-4" />Contribute</Button>
        </CardContent>
      </LuxuryCard>

      <LuxuryCard>
        <CardContent className="p-5">
          <Badge variant="neon">Polls</Badge>
          <h3 className="mt-3 text-xl font-semibold tracking-normal">Choose the finale tone</h3>
          <div className="mt-4 space-y-3">
            {["Cinematic neon", "Soft luxury", "Live chaos"].map((poll, index) => (
              <button key={poll} type="button" className="w-full rounded-lg border border-white/10 bg-white/[0.055] p-3 text-left text-sm hover:bg-white/10">
                <span className="flex items-center justify-between">
                  {poll}
                  <span className="text-white/45">{[48, 31, 21][index]}%</span>
                </span>
                <Progress value={[48, 31, 21][index]} className="mt-2 h-1.5" />
              </button>
            ))}
          </div>
        </CardContent>
      </LuxuryCard>
    </aside>
  );
}

function StoreFront({ setMode }: { setMode: (mode: FanFrontMode) => void }) {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black">
        <Image src="/BossyUI.jpg" alt="Creator store featured" fill sizes="100vw" className="object-cover opacity-55" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,7,17,.96),rgba(5,7,17,.62),rgba(5,7,17,.9))]" />
        <div className="relative grid min-h-[380px] gap-6 p-6 md:p-8 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <Badge variant="neon">Video gallery marketplace</Badge>
            <h2 className="mt-4 max-w-3xl text-5xl font-bold leading-none tracking-normal sm:text-6xl">
              Browse like streaming. Buy like premium commerce.
            </h2>
            <p className="mt-4 max-w-2xl text-white/64">
              Store-only products, unlocks, customs, bundles, tip goals, and campaign passes in one dense shopping surface.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Featured", "Videos", "Bundles", "Customs", "Under $30", "Campaign passes"].map((filter) => (
                <button key={filter} type="button" className="rounded-full border border-white/10 bg-white/[0.075] px-4 py-2 text-sm font-semibold text-white/72 hover:bg-white hover:text-black">
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <LuxuryCard>
            <CardContent className="p-4">
              <div className="relative h-56 overflow-hidden rounded-lg">
                <Image src="/GloryUI.jpg" alt="Aurora pass" fill sizes="420px" className="object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,.82))]" />
                <Badge variant="gold" className="absolute left-3 top-3">Deal of the day</Badge>
                <Button variant="neon" size="icon" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full">
                  <Play className="size-4" />
                </Button>
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-xl font-semibold">Aurora Week All-Access</p>
                  <p className="text-sm text-white/55">$79 • 12 drops • VIP replay</p>
                </div>
              </div>
            </CardContent>
          </LuxuryCard>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
          <Input placeholder="Search store products, customs, unlocks" className="h-11 rounded-full border-white/10 bg-black/25 pl-9" />
        </div>
        <Button variant="luxury" size="pill" onClick={() => setMode("campaign")}>
          Visit CampaignFront <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {storeItems.map((item) => (
          <LuxuryCard key={item.title} className="overflow-hidden">
            <div className="relative h-64">
              <Image src={item.image} alt={item.title} fill sizes="(min-width:1280px) 33vw, 50vw" className="object-cover transition duration-500 hover:scale-105" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.08),rgba(5,7,17,.92))]" />
              <Badge variant="gold" className="absolute left-3 top-3">{item.tag}</Badge>
              <Badge variant="luxury" className="absolute right-3 top-3"><Star className="size-3" />{item.rating}</Badge>
              <Button variant="luxury" size="icon" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full" aria-label={`Preview ${item.title}`}>
                {item.tag === "Custom" ? <MessageCircle className="size-4" /> : <Play className="size-4" />}
              </Button>
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xl font-semibold tracking-normal">{item.title}</p>
                  <span className="text-2xl font-bold">{item.price}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/60">{item.copy}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-white/55">
                    <Video className="size-3" />
                    {item.duration}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="luxury" size="icon" aria-label="Save item"><Bookmark className="size-4" /></Button>
                    <Button variant="neon" size="sm">{item.tag === "Tip goal" ? "Tip" : "Buy"}</Button>
                  </div>
                </div>
              </div>
            </div>
          </LuxuryCard>
        ))}
      </div>
    </div>
  );
}

function CampaignFront({ creatorId }: { creatorId: string }) {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black">
        <Image src="/GloryUI.jpg" alt="Aurora Week campaign" fill sizes="100vw" className="object-cover opacity-65" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,7,17,.96),rgba(5,7,17,.52),rgba(5,7,17,.92))]" />
        <div className="relative grid min-h-[520px] gap-6 p-6 md:p-8 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <Badge variant="gold">Campaign room</Badge>
            <h2 className="mt-4 max-w-4xl text-6xl font-bold leading-none tracking-normal sm:text-7xl">Aurora Week</h2>
            <p className="mt-4 max-w-2xl text-white/65">
              A storybook episode catalog for a single creator campaign: every chapter, quote, locked scene, unlocked scene,
              replay, poll, wishlist tie-in, and store pass lives in this room.
            </p>
            <div className="mt-6 grid max-w-2xl grid-cols-3 gap-2">
              {["12 drops", "5 locked", "2 live rooms"].map((stat) => (
                <div key={stat} className="rounded-lg border border-white/10 bg-white/10 p-3 text-center text-sm font-semibold">{stat}</div>
              ))}
            </div>
          </div>
          <LuxuryCard>
            <CardContent className="p-5">
              <Quote className="size-7 text-amber-100" />
              <p className="mt-4 text-2xl font-semibold leading-snug tracking-normal">
                "Every unlock is a page turn. Every fan action changes the final scene."
              </p>
              <p className="mt-4 text-sm text-white/50">Creator note • Chapter room</p>
              <Link href={`/demo/${creatorId}/feed`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-100">
                Open public feed <ChevronRight className="size-4" />
              </Link>
            </CardContent>
          </LuxuryCard>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <LuxuryCard className="h-fit lg:sticky lg:top-24">
          <CardContent className="p-5">
            <Badge variant="neon">Room index</Badge>
            <div className="mt-4 space-y-2">
              {campaignEpisodes.map((episode, index) => (
                <button key={episode.title} type="button" className="flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3 text-left hover:bg-white/10">
                  <span className="grid size-8 place-items-center rounded-full bg-white/10 text-xs font-bold">{index + 1}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{episode.title.replace("Episode ", "Ep ")}</span>
                    <span className="block text-xs text-white/45">{episode.kind}</span>
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </LuxuryCard>

        <div className="grid gap-4">
          {campaignEpisodes.map((episode, index) => (
            <LuxuryCard key={episode.title} className="overflow-hidden">
              <CardContent className="grid gap-0 p-0 md:grid-cols-[280px_1fr]">
                <div className="relative min-h-64 bg-black">
                  <Image src={episode.image} alt={episode.title} fill sizes="280px" className={cn("object-cover", episode.locked && "blur-sm")} />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,.84))]" />
                  <Badge variant={episode.locked ? "luxury" : "neon"} className="absolute left-3 top-3">{episode.locked ? "Locked" : "Unlocked"}</Badge>
                  <Button variant="luxury" size="icon" className="absolute left-3 bottom-3 rounded-full" aria-label={`Open ${episode.title}`}>
                    {episode.locked ? <Lock className="size-4" /> : <Play className="size-4" />}
                  </Button>
                </div>
                <div className="p-5 md:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="gold">Chapter {index + 1}</Badge>
                    <Badge variant="luxury">{episode.kind}</Badge>
                  </div>
                  <h3 className="mt-4 text-3xl font-bold tracking-normal">{episode.title}</h3>
                  <p className="mt-3 flex gap-3 text-lg font-semibold leading-snug text-white/82">
                    <Quote className="mt-1 size-5 shrink-0 text-amber-100" />
                    {episode.quote}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/58">{episode.detail}</p>
                  <Progress value={episode.progress} className="mt-5" />
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Button variant={episode.locked ? "neon" : "luxury"}>{episode.locked ? "Unlock chapter" : "Open chapter"}</Button>
                    <Button variant="ghost"><MessageCircle className="size-4" />Discuss</Button>
                    <Button variant="ghost"><Gift className="size-4" />Support scene</Button>
                  </div>
                </div>
              </CardContent>
            </LuxuryCard>
          ))}

          <LuxuryCard>
            <CardContent className="grid gap-4 p-5 md:grid-cols-3">
              <div>
                <Flame className="size-5 text-fuchsia-200" />
                <p className="mt-2 font-semibold">Streak rewards</p>
                <p className="text-sm text-white/55">Daily fan actions multiply campaign points.</p>
              </div>
              <div>
                <ShieldCheck className="size-5 text-cyan-200" />
                <p className="mt-2 font-semibold">Unlock clarity</p>
                <p className="text-sm text-white/55">Locked assets remain visible with price and access state.</p>
              </div>
              <div>
                <WandSparkles className="size-5 text-amber-200" />
                <p className="mt-2 font-semibold">Store tie-ins</p>
                <p className="text-sm text-white/55">Passes, customs, and bundles connect to Store.</p>
              </div>
            </CardContent>
          </LuxuryCard>
        </div>
      </div>
    </div>
  );
}

function SimplePanel({ title, copy, icon: Icon }: { title: string; copy: string; icon: typeof Home }) {
  return (
    <LuxuryCard>
      <CardContent className="grid min-h-[360px] place-items-center p-8 text-center">
        <div className="max-w-xl">
          <div className="mx-auto grid size-16 place-items-center rounded-full border border-white/15 bg-white/10">
            <Icon className="size-7 text-cyan-100" />
          </div>
          <h2 className="mt-5 text-4xl font-bold tracking-normal">{title}</h2>
          <p className="mt-3 text-white/62">{copy}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {["Recent", "Saved", "Premium"].map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/[0.055] p-4">
                <CheckCircle2 className="mx-auto size-5 text-cyan-200" />
                <p className="mt-2 text-sm font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </LuxuryCard>
  );
}
