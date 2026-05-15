"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Crown,
  Flame,
  Gem,
  Gift,
  Heart,
  Home,
  Lock,
  Megaphone,
  MessageCircle,
  Package,
  Play,
  Radio,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Trophy,
  User,
  Vote,
  Wallet,
  WandSparkles,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  { label: "Bundles", value: "4 active", icon: Package },
  { label: "Deals", value: "32% flash", icon: Gift },
  { label: "Announcements", value: "Live tonight", icon: Megaphone },
  { label: "Campaigns", value: "Aurora Week", icon: Radio },
  { label: "Polls", value: "2 open", icon: Vote },
  { label: "Wishlist", value: "$420 goal", icon: Gem },
];

const storeItems = [
  {
    title: "Aurora Week All-Access Pass",
    copy: "Every campaign post, locked replay, behind-the-scenes gallery, and VIP comment priority.",
    image: "/GloryUI.jpg",
    price: "$79",
    tag: "Campaign pass",
    metric: "Best value",
  },
  {
    title: "Custom Voice Note",
    copy: "A personalized 90-second note delivered to your library with optional private prompt.",
    image: "/anna4.jpg",
    price: "$45",
    tag: "Custom",
    metric: "24h delivery",
  },
  {
    title: "Velvet Vault Bundle",
    copy: "Seven premium posts that never had to hit the feed. Unlock, tip, save, and replay anytime.",
    image: "/BossyUI.jpg",
    price: "$29",
    tag: "Bundle",
    metric: "7 items",
  },
  {
    title: "Tip the Studio Goal",
    copy: "Support the next concept shoot and claim a sponsor badge on the leaderboard.",
    image: "/xanamain.jpg",
    price: "$10+",
    tag: "Tip goal",
    metric: "68% funded",
  },
];

const campaignItems = [
  { title: "Episode 01: Signal", locked: false, kind: "Video", progress: 100 },
  { title: "Gallery: Chrome Bloom", locked: true, kind: "Photo set", progress: 38 },
  { title: "Voice Note: Before the Drop", locked: false, kind: "Audio", progress: 100 },
  { title: "VIP Replay: Afterlight", locked: true, kind: "Replay", progress: 12 },
  { title: "Poll: Choose the Finale", locked: false, kind: "Poll", progress: 100 },
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
  { id: "library", label: "Library", icon: BookOpen },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
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
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
        <SectionShell className="pt-6 sm:pt-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CreatorAvatar creator={creator} size={56} />
              <div>
                <p className="text-sm text-white/55">{creator.handle}</p>
                <h2 className="text-xl font-semibold tracking-normal">{creator.name}</h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="luxury" size="pill">
                <Bell className="size-4" />
                Notify
              </Button>
              <Button variant="neon" size="pill">
                <Crown className="size-4" />
                Subscribe
              </Button>
            </div>
          </div>
        </SectionShell>

        <SectionShell className="pt-6">
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
                  and climb the leaderboard as campaigns unfold.
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
                  onClick={() => item.label === "Campaigns" ? setMode("campaign") : item.label === "Bundles" || item.label === "Deals" ? setMode("store") : setMode("feed")}
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
          {mode === "feed" && (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-5">
                {feedPosts.map((post, index) => {
                  const Icon = post.icon;
                  return (
                    <motion.article
                      key={post.title}
                      initial={{ y: 28, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.08 }}
                      className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.055] shadow-[0_24px_80px_rgba(0,0,0,.3)] backdrop-blur-xl"
                    >
                      <div className="relative min-h-[360px]">
                        <Image src={post.image} alt={post.title} fill sizes="(min-width:1024px) 760px, 100vw" className={cn("object-cover", post.state === "Locked" && "blur-sm")} />
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
                          <h3 className="mt-4 text-3xl font-bold tracking-normal sm:text-4xl">{post.title}</h3>
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
            </div>
          )}

          {mode === "store" && <StoreFront setMode={setMode} />}
          {mode === "campaign" && <CampaignFront creatorId={creatorId} />}
          {mode === "library" && <SimplePanel title="My Library" icon={BookOpen} copy="Unlocked drops, purchased customs, campaign passes, and replay access are organized here." />}
          {mode === "wallet" && <SimplePanel title="Wallet" icon={Wallet} copy="Track credits, tips, unlock history, subscriptions, and campaign contributions." />}
          {mode === "profile" && <SimplePanel title="Fan Profile" icon={User} copy="Your fan badges, leaderboard streak, private preferences, and saved creator worlds live here." />}
          {mode === "settings" && <SimplePanel title="Settings" icon={Settings} copy="Notification cadence, privacy, billing, accessibility, and display settings." />}
        </SectionShell>
      </div>

      <nav className="fixed inset-x-0 bottom-4 z-40 px-3">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-1 rounded-full border border-white/15 bg-black/72 p-1.5 shadow-[0_18px_70px_rgba(0,0,0,.48)] backdrop-blur-xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = mode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-full px-2 py-2 text-[10px] font-semibold text-white/50 transition sm:flex-row sm:justify-center sm:gap-2 sm:text-xs",
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

function StoreFront({ setMode }: { setMode: (mode: FanFrontMode) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="neon">Open creator store</Badge>
          <h2 className="mt-3 text-4xl font-bold tracking-normal sm:text-5xl">Shop without waiting for the feed.</h2>
          <p className="mt-2 max-w-2xl text-white/62">
            Creators can list products directly here: unlocks, bundles, customs, tip goals, passes, and private drops.
          </p>
        </div>
        <Button variant="luxury" size="pill" onClick={() => setMode("campaign")}>
          Visit CampaignFront <ChevronRight className="size-4" />
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {storeItems.map((item) => (
          <LuxuryCard key={item.title} className="overflow-hidden">
            <div className="relative h-56">
              <Image src={item.image} alt={item.title} fill sizes="(min-width:1280px) 25vw, 50vw" className="object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(5,7,17,.9))]" />
              <Badge variant="gold" className="absolute left-3 top-3">{item.tag}</Badge>
              <Badge variant="luxury" className="absolute right-3 top-3">{item.metric}</Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="text-xl font-semibold tracking-normal">{item.title}</h3>
              <p className="mt-2 min-h-16 text-sm leading-6 text-white/60">{item.copy}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-2xl font-bold">{item.price}</span>
                <div className="flex gap-2">
                  <Button variant="luxury" size="icon" aria-label="Save item"><Heart className="size-4" /></Button>
                  <Button variant="neon" size="sm">{item.tag === "Tip goal" ? "Tip" : "Buy"}</Button>
                </div>
              </div>
            </CardContent>
          </LuxuryCard>
        ))}
      </div>
    </div>
  );
}

function CampaignFront({ creatorId }: { creatorId: string }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
      <div className="relative min-h-[520px] overflow-hidden rounded-lg border border-white/10 bg-black">
        <Image src="/GloryUI.jpg" alt="Aurora Week campaign" fill sizes="(min-width:1024px) 40vw, 100vw" className="object-cover opacity-75" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,17,.12),rgba(5,7,17,.94))]" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <Badge variant="gold">CampaignFront</Badge>
          <h2 className="mt-4 text-5xl font-bold leading-none tracking-normal">Aurora Week</h2>
          <p className="mt-3 text-white/65">
            A campaign hub where fans can see every asset in the story, whether unlocked, locked, live, replayed, or vote-driven.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {["12 drops", "5 locked", "2 live"].map((stat) => (
              <div key={stat} className="rounded-lg border border-white/10 bg-white/10 p-3 text-center text-sm font-semibold">{stat}</div>
            ))}
          </div>
          <Link href={`/demo/${creatorId}/feed`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-100">
            Open public feed <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {campaignItems.map((item, index) => (
          <LuxuryCard key={item.title}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={cn("grid size-12 place-items-center rounded-lg", item.locked ? "bg-fuchsia-300/12 text-fuchsia-100" : "bg-cyan-300/12 text-cyan-100")}>
                {item.locked ? <Lock className="size-5" /> : <Play className="size-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={item.locked ? "luxury" : "neon"}>{item.kind}</Badge>
                  {index === 0 && <Badge variant="gold">Featured</Badge>}
                </div>
                <h3 className="mt-2 text-lg font-semibold tracking-normal">{item.title}</h3>
                <Progress value={item.progress} className="mt-3" />
              </div>
              <Button variant={item.locked ? "neon" : "luxury"} size="sm">
                {item.locked ? "Unlock" : "Open"}
              </Button>
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
              <p className="mt-2 font-semibold">Creator merch tie-in</p>
              <p className="text-sm text-white/55">Campaign passes, customs, and bundles connect to Store.</p>
            </div>
          </CardContent>
        </LuxuryCard>
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
