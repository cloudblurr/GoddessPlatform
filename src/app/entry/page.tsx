import { creatorProfile, pricingPlans } from "@/lib/content";
import { incognitoCreatorAccess, subscribeAndEnter } from "@/app/actions";
import Image from "next/image";
import {
  Star, Lock, CheckCircle, Users, Sparkles, Eye,
  Zap, Fingerprint, ShieldAlert, ChevronRight, Play,
} from "lucide-react";
import { readStore } from "@/lib/store";

type EntryPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function EntryPage({ searchParams }: EntryPageProps) {
  const { error } = await searchParams;
  const store = await readStore();
  const settings = store.entrySettings || {
    heroTitle: "Xanna",
    heroSubtitle: "Exclusive content. Direct connection. The creator experience you've been waiting for.",
    revealHeadline: "Unlock the full experience.",
    previews: [
      { id: "p1", title: "Behind the Scenes", mediaUrl: "/anna2.jpg", mediaType: "image" as const },
      { id: "p2", title: "Exclusive Content", mediaUrl: "/anna3.jpg", mediaType: "image" as const },
      { id: "p3", title: "Creator Life", mediaUrl: "/anna4.jpg", mediaType: "image" as const },
      { id: "p4", title: "Premium Access", mediaUrl: "/xanamain.jpg", mediaType: "image" as const },
    ],
  };

  const previewImages = settings.previews.filter((p) => p.mediaType === "image");

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--ink)]">
      {/* Error banner */}
      {error && (
        <div className="mx-4 mt-4 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 animate-slide-up">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>
            {error === "creator-only"
              ? "Creator access required."
              : error === "bad-creator-login"
                ? "Invalid creator credentials."
                : "Authentication error."}
          </span>
        </div>
      )}

      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="entry-hero-bg relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 min-h-[85vh] overflow-hidden">
        {/* Subtle glow */}
        <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--accent)] opacity-[0.04] blur-[120px]" />

        {/* Creator photo */}
        <div className="relative w-40 h-40 sm:w-52 sm:h-52 rounded-full overflow-hidden border-2 border-[var(--accent)]/30 shadow-[0_0_60px_rgba(167,139,250,0.15)] mb-8 animate-fade-in">
          <Image
            src="/xanamain.jpg"
            alt={settings.heroTitle}
            fill
            sizes="208px"
            className="object-cover"
            priority
          />
        </div>

        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] mb-4 animate-slide-up">
          {settings.heroTitle}
        </h1>
        <p className="max-w-lg text-[var(--ink-muted)] text-base sm:text-lg leading-relaxed mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          {settings.heroSubtitle}
        </p>

        {/* Stats pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <span className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-[var(--accent-dim)] text-[var(--accent-bright)] border border-[var(--accent)]/20">
            <Users size={14} /> {creatorProfile.memberCount} members
          </span>
          <span className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-[var(--rose-dim)] text-[var(--rose)] border border-[var(--rose)]/20">
            <Star size={14} /> Exclusive Content
          </span>
        </div>

        {/* CTA */}
        <a
          href="#pricing"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[var(--accent)] text-[var(--bg-base)] font-semibold text-sm hover:brightness-110 transition-all shadow-[0_4px_24px_rgba(167,139,250,0.3)] animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          Get Access <ChevronRight size={16} />
        </a>
      </section>

      {/* ─── Preview Carousel ─────────────────────────────── */}
      <section className="py-16 overflow-hidden border-t border-[var(--glass-border)]">
        <div className="max-w-5xl mx-auto px-6 mb-10 text-center">
          <p className="eyebrow mb-2">Content Preview</p>
          <h2 className="text-3xl sm:text-4xl font-bold">What&apos;s Inside</h2>
        </div>

        {/* Scrolling marquee */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[var(--bg-base)] to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[var(--bg-base)] to-transparent z-10" />
          <div className="flex gap-5 w-max animate-marquee">
            {[...previewImages, ...previewImages].map((p, i) => (
              <div key={`${p.id}-${i}`} className="relative w-64 h-80 rounded-2xl overflow-hidden border border-[var(--glass-border)] shrink-0 group">
                <Image src={p.mediaUrl} alt={p.title} fill sizes="256px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-sm font-semibold">{p.title}</p>
                </div>
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
                  <Lock size={12} className="text-white/70" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── What You Get ─────────────────────────────────── */}
      <section className="py-16 border-t border-[var(--glass-border)]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="eyebrow mb-2">Membership Perks</p>
            <h2 className="text-3xl sm:text-4xl font-bold">{settings.revealHeadline}</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Play, label: "Exclusive Posts", desc: "Daily content you won't find anywhere else" },
              { icon: Eye, label: "Behind the Scenes", desc: "Raw, unfiltered creator moments" },
              { icon: Zap, label: "Early Access", desc: "See new drops before anyone else" },
              { icon: Sparkles, label: "Direct Connection", desc: "Messaging, polls, and Q&A sessions" },
            ].map((item) => (
              <div
                key={item.label}
                className="glass-card p-5 flex items-start gap-4 hover:border-[var(--accent)]/20 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-dim)] flex items-center justify-center shrink-0">
                  <item.icon size={18} className="text-[var(--accent)]" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className="text-[var(--ink-muted)] text-sm mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Social Proof ─────────────────────────────────── */}
      <section className="py-10 border-t border-[var(--glass-border)] bg-[var(--bg-surface)]">
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center gap-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[var(--accent-dim)] text-[var(--accent-bright)]">
            <Sparkles size={12} /> {creatorProfile.memberCount} subscribers and counting
          </span>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-[var(--ink-muted)]">
            {[
              "\"Best creator platform experience\"",
              "\"Content I can't find anywhere else\"",
              "\"Worth every cent\"",
            ].map((q) => (
              <span key={q} className="flex items-center gap-1.5">
                <Star size={12} className="text-[var(--amber)]" /> {q}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ──────────────────────────────────────── */}
      <section id="pricing" className="py-20 border-t border-[var(--glass-border)]">
        <div className="max-w-lg mx-auto px-6 text-center">
          <p className="eyebrow mb-2">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-10">Choose Your Access</h2>

          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className="glass-card p-8 relative overflow-hidden border-[var(--accent)]/30 shadow-[0_0_60px_rgba(167,139,250,0.08)]"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" />

              <div className="flex items-center justify-center gap-2 mb-2">
                <Star size={14} className="text-[var(--accent)]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Premium</span>
              </div>
              <h3 className="text-xl font-bold mb-1">{plan.label}</h3>
              <p className="text-[var(--ink-muted)] text-sm mb-4">{plan.subtitle}</p>
              <p className="text-5xl font-bold mb-1">
                {plan.price}
                <span className="text-lg font-normal text-[var(--ink-muted)]">{plan.period}</span>
              </p>

              <ul className="text-sm text-[var(--ink-muted)] space-y-2 my-6 text-left">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-[var(--emerald)] shrink-0" /> {perk}
                  </li>
                ))}
              </ul>

              <form action={subscribeAndEnter}>
                <input type="hidden" name="plan" value={plan.id} />
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[var(--accent)] text-[var(--bg-base)] font-semibold text-sm hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(167,139,250,0.3)]"
                >
                  <Lock size={15} /> Get Access
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────── */}
      <footer className="py-8 border-t border-[var(--glass-border)]">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <p className="text-xs text-[var(--ink-faint)]">
            © {new Date().getFullYear()} {creatorProfile.name}. All rights reserved.
          </p>
          <form action={incognitoCreatorAccess}>
            <button
              type="submit"
              className="p-2 rounded-full text-[var(--ink-faint)] opacity-20 hover:opacity-100 hover:text-[var(--accent)] transition-all"
              title="Creator Access"
            >
              <Fingerprint size={18} />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}
