import { creatorProfile, pricingPlans } from "@/lib/content";
import { incognitoCreatorAccess, subscribeAndEnter } from "@/app/actions";
import Image from "next/image";
import { Star, Lock, CheckCircle, Users, Sparkles, MessageCircle, Eye, Zap, Fingerprint, ShieldAlert } from "lucide-react";
import { GatewayShell } from "@/components/GatewayShell";
import { GlitchSplash } from "@/components/GlitchSplash";
import { DivinePreviews } from "@/components/DivinePreviews";
import { readStore } from "@/lib/store";

type EntryPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function EntryPage({ searchParams }: EntryPageProps) {
  const { error } = await searchParams;
  const store = await readStore();
  const settings = store.entrySettings || {
    heroTitle: "Goddess Annalesse",
    heroSubtitle: "A delicate touch of luxury from the Queen of your feed.",
    revealHeadline: "Want to go to Heaven? This is inside.",
    previews: [
      { id: "p1", title: "Platinum Dripped Aura", mediaUrl: "/logo-2.png", mediaType: "image" as const },
      { id: "p2", title: "Eternal Grace", mediaUrl: "/logo-1.png", mediaType: "image" as const },
      { id: "p3", title: "Midnight Routine", mediaUrl: "https://files.catbox.moe/97ukl2.mp4", mediaType: "video" as const },
      { id: "p4", title: "Sanctum Secrets", mediaUrl: "https://files.catbox.moe/3lohl1.mp4", mediaType: "video" as const }
    ]
  };

  return (
    <GatewayShell>
      <GlitchSplash />
    <main className="gateway">
      {/* ── Error Messages ──────────────────────────────── */}
      {error && (
        <div className="gw-top-error">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>{error === "creator-only" ? "Creator access required." : error === "bad-creator-login" ? "Invalid creator credentials." : "Authentication error."}</span>
        </div>
      )}

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="gw-hero">
        <div className="gw-hero-overlay" />
        
        {/* Floating Accents */}
        <div className="gw-floating-accent gw-float-1"><Sparkles size={32} /></div>
        <div className="gw-floating-accent gw-float-2"><Star size={24} /></div>
        <div className="gw-floating-accent gw-float-3"><Star size={16} /></div>
        <div className="gw-floating-accent gw-float-4"><Sparkles size={40} /></div>

        <div className="gw-hero-content">
          <div className="gw-creator-photo">
            <div className="gw-creator-photo-glint"></div>
            <Image
              src="/XannaMain.png"
              alt={settings.heroTitle}
              width={480}
              height={640}
              className="gw-creator-img"
              priority
            />
          </div>

          <h1 className="gw-name">{settings.heroTitle}</h1>
          <p className="gw-tagline">&quot;{settings.heroSubtitle}&quot;</p>

          <div className="gw-hero-stats">
            <span className="gw-stat-pill"><Users size={14} /> {creatorProfile.memberCount} members</span>
            <span className="gw-stat-pill"><Star size={14} /> Exclusive</span>
          </div>
        </div>
      </section>

      {/* ── Central Focus: The Five Pillars (Animated Slideshow) ─ */}
      <section className="gw-pillars-section">
        <div className="gw-pillars-header">
          <h2 className="section-title">The Five Pillars</h2>
          <p className="gw-pillars-sub">The foundation of everything built within the hacienda.</p>
        </div>
        
        <div className="gw-slideshow-container">
          {/* Vertical Images Marquee */}
          <div className="gw-slideshow-vertical">
            <div className="gw-marquee-y">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="gw-slideshow-y-group">
                  <div className="gw-slide-y-item p-8">
                    <Image src="/logo-2.png" alt="Mood" fill className="gw-slide-img object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                    <div className="gw-slide-glaze"></div>
                  </div>
                  <div className="gw-slide-y-item p-8">
                    <Image src="/logo-1.png" alt="Vibe" fill className="gw-slide-img object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                    <div className="gw-slide-glaze"></div>
                  </div>
                  <div className="gw-slide-y-item p-8">
                    <Image src="/logo-2.png" alt="Style" fill className="gw-slide-img object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                    <div className="gw-slide-glaze"></div>
                  </div>
                  <div className="gw-slide-y-item p-8">
                    <Image src="/logo-1.png" alt="Aura" fill className="gw-slide-img object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                    <div className="gw-slide-glaze"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Horizontal Content Marquee */}
          <div className="gw-slideshow-horizontal">
            <div className="gw-marquee-x">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="gw-slideshow-x-group">
                  {creatorProfile.collageQuotes.map((q, idx) => (
                    <div key={idx} className="gw-pillar-card group">
                      <div className="gw-pillar-card-bg"></div>
                      <div className="gw-pillar-content">
                        <span className="gw-pillar-number">0{idx + 1}</span>
                        <h3 className="gw-pillar-label">{q.label}</h3>
                        <p className="gw-pillar-text">{q.text}</p>
                      </div>
                      <div className="gw-pillar-glow"></div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof ─────────────────────────────────── */}
      <div className="gw-proof">
        <span className="gw-proof-pill"><Sparkles size={14} /> {creatorProfile.memberCount} members inside</span>
        <div className="gw-ticker">
          <span><Zap size={12} /> &quot;This is unlike anything else&quot;</span>
          <span><Star size={12} /> &quot;Best subscription I own&quot;</span>
          <span><Eye size={12} /> &quot;Completely addictive content&quot;</span>
          <span><CheckCircle size={12} /> &quot;Worth every single cent&quot;</span>
          <span><MessageCircle size={12} /> &quot;Feels like a private world&quot;</span>
        </div>
      </div>

      {/* ── What awaits ──────────────────────────────────── */}
      <DivinePreviews settings={settings} />

      {/* ── Pricing with floating animation ──────────────── */}
      <section className="gw-pricing" id="pricing">
        <h2>Join Now</h2>
        <div className="gw-pricing-grid">
          {pricingPlans.map((plan) => (
            <article
              key={plan.id}
              className={`gw-price-card ${plan.highlight ? "gw-price-highlight" : ""}`}
            >
              <span className="gw-best-badge"><Star size={14} /> Premium</span>
              <h3>{plan.label}</h3>
              <p className="gw-price-subtitle">{plan.subtitle}</p>
              <p className="gw-price gw-price-float">
                {plan.price}
                <span>{plan.period}</span>
              </p>
              <ul>
                {plan.perks.map((perk) => (
                  <li key={perk}><CheckCircle size={14} /> {perk}</li>
                ))}
              </ul>
              <form action={subscribeAndEnter}>
                <input type="hidden" name="plan" value={plan.id} />
                <button type="submit" className="gw-enter-btn">
                  <Lock size={16} /> Subscribe Now
                </button>
              </form>
            </article>
          ))}
        </div>
      </section>

      {/* ── Footer with Incognito Access ─────────────────── */}
      <footer className="gw-footer">
        <div className="gw-footer-content">
          <p className="gw-copyright">© {new Date().getFullYear()} {creatorProfile.name}. All rights reserved.</p>
          <form action={incognitoCreatorAccess}>
            <button
              type="submit"
              className="gw-incognito-btn"
              title="Creator Access"
            >
              <Fingerprint size={20} />
            </button>
          </form>
        </div>
      </footer>
    </main>
    </GatewayShell>
  );
}
