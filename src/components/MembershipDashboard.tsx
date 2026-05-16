"use client";

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  Coins,
  Flame,
  Gem,
  Headphones,
  Image as ImageIcon,
  Lock,
  MessageCircle,
  Play,
  Send,
  Sparkles,
  Video,
  Wallet,
  X,
} from "lucide-react";

type UserStatus = "new" | "active" | "lapsed";
type CreatorStatus = "live" | "online" | "away" | "offline";
type ContentType = "video" | "photo" | "audio" | "post";

type DashboardProps = {
  userStatus?: UserStatus;
  creatorStatus?: CreatorStatus;
};

type LockedItem = {
  id: string;
  title: string;
  price: string;
  image: string;
  vip?: boolean;
  teaser: string;
};

const mockUser = {
  firstName: "Maya",
  tier: "Member",
  streakDays: 14,
  points: 853,
  walletBalance: 4.25,
  lastVisit: "2026-05-15T18:20:00Z",
};

const mockCreator = {
  name: "Xanna",
  avatarUrl: "/xanamain.jpg",
  status: "online" as CreatorStatus,
  nextDropTime: Date.now() + 1000 * 60 * 48 + 1000 * 13,
  nextEventTime: Date.now() + 1000 * 60 * 60 * 26 + 1000 * 60 * 11,
};

const mockContent = {
  latest: {
    title: "Midnight Velvet Room",
    type: "video" as ContentType,
    timestamp: "Dropped 2h ago",
    teaser: "A low-lit after-hours set from the room she usually keeps private.",
    image: "/SteamyUI.jpg",
    unlocked: true,
    progress: 62,
    price: "$12",
  },
  locked: [
    {
      id: "rose-suite",
      title: "Rose Suite Polaroids",
      price: "$9",
      image: "/anna2.jpg",
      teaser: "Five frames, soft flash, and one note she wrote after midnight.",
    },
    {
      id: "voice-note",
      title: "For Members Only",
      price: "$5",
      image: "/BossyUI.jpg",
      teaser: "A private voice note for the fans who always show up first.",
    },
    {
      id: "vip-door",
      title: "VIP Dressing Room",
      price: "VIP",
      image: "/GloryUI.jpg",
      vip: true,
      teaser: "A backstage sequence reserved for the next tier.",
    },
    {
      id: "sunday",
      title: "Sunday Gold",
      price: "$15",
      image: "/StarlightUI.jpg",
      teaser: "Warm window light, gold jewelry, and a slower kind of reveal.",
    },
    {
      id: "lavender",
      title: "Lavender Hour",
      price: "$7",
      image: "/LavendarUI.jpg",
      teaser: "A dreamy photo set with one locked bonus clip.",
    },
  ] satisfies LockedItem[],
  unlocked: ["arrival-film", "mirror-note"],
  upcoming: [
    {
      id: "qa",
      title: "Velvet Booth Live Q&A",
      type: "Live Q&A",
      time: "Tomorrow, 9:00 PM",
      target: Date.now() + 1000 * 60 * 60 * 26 + 1000 * 60 * 11,
    },
    {
      id: "drop",
      title: "Gold Hour Photo Set",
      type: "Exclusive Drop",
      time: "Sunday, 12:00 AM",
      target: Date.now() + 1000 * 60 * 60 * 52,
    },
  ],
};

const mockMessages = {
  unreadCount: 2,
  lastMessage: "I saw your reply. Saved something extra for you tonight.",
  lastTimestamp: "8m ago",
};

const statusCopy: Record<CreatorStatus, { label: string; detail: string; className: string }> = {
  live: { label: "Live Now", detail: "Live Now", className: "is-live" },
  online: { label: "Online", detail: "Online · Responding fast", className: "is-online" },
  away: { label: "Away", detail: "Away · Back in ~2h", className: "is-away" },
  offline: { label: "Offline", detail: "Offline · Drops at midnight", className: "is-offline" },
};

const tierLine: Record<UserStatus, string> = {
  new: "Welcome to the inner circle.",
  active: "You haven't missed a single drop. Respect.",
  lapsed: "She's been waiting for you.",
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function useCountUp(target: number) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const total = 28;
    const id = window.setInterval(() => {
      frame += 1;
      setValue(Math.round(target * (1 - Math.pow(1 - frame / total, 3))));
      if (frame >= total) window.clearInterval(id);
    }, 28);

    return () => window.clearInterval(id);
  }, [target]);

  return value;
}

function useCountdown(target: number) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setRemaining(Math.max(0, target - Date.now())), 250);
    return () => window.clearInterval(id);
  }, [target]);

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    display: `${String(hours + days * 24).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
  };
}

function FlipTime({ value }: { value: string }) {
  return (
    <span className="club-flip-time" aria-hidden="true">
      {value.split("").map((digit, index) => (
        <span className={digit === ":" ? "club-time-colon" : "club-flip-digit"} key={`${index}-${digit}`}>
          {digit}
        </span>
      ))}
    </span>
  );
}

function ContentIcon({ type }: { type: ContentType }) {
  const iconProps = { size: 16, strokeWidth: 1.8 };
  if (type === "photo") return <ImageIcon {...iconProps} />;
  if (type === "audio") return <Headphones {...iconProps} />;
  if (type === "post") return <Sparkles {...iconProps} />;
  return <Video {...iconProps} />;
}

function EmptyState({ icon, text, action }: { icon: ReactNode; text: string; action?: string }) {
  return (
    <div className="club-empty">
      <div className="club-empty-icon">{icon}</div>
      <p>{text}</p>
      {action ? <button type="button">{action}</button> : null}
    </div>
  );
}

function EventCard({
  event,
  reminded,
  onToggle,
}: {
  event: (typeof mockContent.upcoming)[number];
  reminded: boolean;
  onToggle: () => void;
}) {
  const eventCountdown = useCountdown(event.target);

  return (
    <article className="club-event">
      <span>{event.type}</span>
      <h3>{event.title}</h3>
      <p>{event.time}</p>
      <div className="club-event-actions">
        <strong>{eventCountdown.days}d {eventCountdown.hours}h</strong>
        <button
          type="button"
          className={reminded ? "is-on" : ""}
          onClick={onToggle}
          aria-pressed={reminded}
        >
          {reminded ? <Check size={15} /> : <Bell size={15} />}
          {reminded ? "Set" : "Remind Me"}
        </button>
      </div>
    </article>
  );
}

export default function MembershipDashboard({
  userStatus = "active",
  creatorStatus = mockCreator.status,
}: DashboardProps) {
  const latestRef = useRef<HTMLElement | null>(null);
  const [selectedUnlock, setSelectedUnlock] = useState<LockedItem | null>(null);
  const [messageOpen, setMessageOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [reminders, setReminders] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    const saved = window.localStorage.getItem("club-reminders");
    return saved ? JSON.parse(saved) : {};
  });
  const newDrops = useCountUp(3);
  const nextDrop = useCountdown(mockCreator.nextDropTime);
  const nextEvent = useCountdown(mockCreator.nextEventTime);
  const soonerTarget = mockCreator.nextDropTime <= mockCreator.nextEventTime ? "Next Drop In" : "Live Q&A In";
  const dockCountdown = mockCreator.nextDropTime <= mockCreator.nextEventTime ? nextDrop : nextEvent;
  const status = statusCopy[creatorStatus];

  useEffect(() => {
    window.localStorage.setItem("club-reminders", JSON.stringify(reminders));
  }, [reminders]);

  const latestCta = mockContent.latest.unlocked ? "Continue Watching" : `Unlock for ${mockContent.latest.price}`;
  const pointsToNext = 1000 - mockUser.points;
  const vipProgress = Math.min(100, Math.round((mockUser.points / 1000) * 100));
  const collectionProgress = Math.round((mockContent.unlocked.length / (mockContent.unlocked.length + mockContent.locked.length)) * 100);

  const streakDots = useMemo(
    () => Array.from({ length: 7 }, (_, index) => index < Math.min(7, mockUser.streakDays)),
    [],
  );

  return (
    <div className="club-dashboard">
      <div className="club-grain" aria-hidden="true" />
      <aside className="club-side-panel" aria-label="Creator quick actions">
        <button type="button" className="club-side-action" onClick={() => setMessageOpen(true)} aria-label="Open messages">
          <span className={`club-mini-avatar ${status.className}`}>
            <Image src={mockCreator.avatarUrl} alt="" width={40} height={40} />
          </span>
          <span>Chat</span>
        </button>
        <div className={`club-side-timer ${dockCountdown.totalSeconds < 3600 ? "is-urgent" : ""}`} role="timer" aria-label={`${soonerTarget} ${dockCountdown.display}`}>
          <span>{soonerTarget}</span>
          <FlipTime value={dockCountdown.display} />
        </div>
        <button
          type="button"
          className={`club-side-wallet ${mockUser.walletBalance < 5 ? "is-low" : ""}`}
          onClick={() => setWalletOpen(true)}
          aria-label={`Wallet balance ${mockUser.walletBalance.toFixed(2)} dollars`}
        >
          <Coins size={18} />
          <span>${mockUser.walletBalance.toFixed(2)}</span>
        </button>
      </aside>

      <main className="club-main">
        <section className="club-hero club-enter" style={{ "--delay": "0ms" } as CSSProperties}>
          <div className="club-greeting">
            <p className="club-eyebrow">Private member access</p>
            <h1>
              {getGreeting()}, {mockUser.firstName}
            </h1>
            <p>{tierLine[userStatus]}</p>
          </div>

          <div className="club-creator-status">
            <div className={`club-avatar-ring ${creatorStatus === "online" || creatorStatus === "live" ? "is-pulsing" : ""}`}>
              <Image src={mockCreator.avatarUrl} alt={`${mockCreator.name} avatar`} width={112} height={112} priority />
            </div>
            <div>
              <h2>{mockCreator.name}</h2>
              <span className={`club-status-badge ${status.className}`} aria-label={`Creator status: ${status.detail}`}>
                <i />
                {status.detail}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="club-new-drops"
            onClick={() => latestRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            aria-label="Scroll to latest drop"
          >
            {newDrops > 0 ? (
              <>
                <strong>{newDrops}</strong>
                <span>new drops since your last visit</span>
              </>
            ) : (
              <span>You&apos;re all caught up - for now.</span>
            )}
            <ChevronRight size={18} />
          </button>
        </section>

        <div className="club-module-grid">
          <section className="club-card club-premium-card club-latest club-enter" id="latest-drop" ref={latestRef} style={{ "--delay": "120ms" } as CSSProperties}>
            {mockContent.latest ? (
              <>
                <Image src={mockContent.latest.image} alt="" fill sizes="(min-width: 768px) 900px, 100vw" className="club-latest-bg" />
                <div className="club-latest-shade" />
                <div className="club-pill">New Drop</div>
                <div className="club-latest-copy">
                  <h2>{mockContent.latest.title}</h2>
                  <p className="club-meta">
                    <ContentIcon type={mockContent.latest.type} />
                    Video &middot; {mockContent.latest.timestamp}
                  </p>
                  <p>{mockContent.latest.teaser}</p>
                </div>
                {mockContent.latest.unlocked ? (
                  <div className="club-progress-wrap">
                    <div className="club-progress-track">
                      <span style={{ width: `${mockContent.latest.progress}%` }} />
                    </div>
                    <button type="button" className="club-gold-button">
                      <Play size={17} />
                      {latestCta}
                    </button>
                  </div>
                ) : (
                  <button type="button" className="club-gold-button">
                    {latestCta}
                    <ChevronRight size={17} />
                  </button>
                )}
              </>
            ) : (
              <EmptyState icon={<Sparkles />} text="She hasn't dropped anything here yet - but she will." />
            )}
          </section>

          <section className="club-card club-enter" style={{ "--delay": "240ms" } as CSSProperties}>
            <div className="club-card-heading">
              <div>
                <p className="club-eyebrow">Messages</p>
                <h2>Private Thread</h2>
              </div>
              {mockMessages.unreadCount ? <span className="club-unread">{mockMessages.unreadCount} unread</span> : null}
            </div>
            {mockMessages.lastMessage ? (
              <div className="club-message-row">
                <Image src={mockCreator.avatarUrl} alt="" width={44} height={44} />
                <div>
                  <p>{mockMessages.lastMessage}</p>
                  <span>{mockMessages.lastTimestamp}</span>
                </div>
                <button type="button" onClick={() => setMessageOpen(true)} aria-label="Reply to creator">
                  <Send size={16} />
                  Reply
                </button>
              </div>
            ) : (
              <EmptyState icon={<MessageCircle />} text="Send her a message - she reads every one." action="Start Thread" />
            )}
          </section>

          <section className="club-card club-enter" style={{ "--delay": "360ms" } as CSSProperties}>
            <div className="club-card-heading">
              <div>
                <p className="club-eyebrow">Your Collection</p>
                <h2>{mockContent.unlocked.length} of {mockContent.locked.length + mockContent.unlocked.length} unlocked</h2>
              </div>
              <Lock size={18} />
            </div>
            <div className="club-progress-track">
              <span style={{ width: `${collectionProgress}%` }} />
            </div>
            {mockContent.locked.length ? (
              <div className="club-unlock-row" aria-label="Locked exclusive content">
                {mockContent.locked.map((item) => (
                  <button type="button" className="club-unlock-tile" key={item.id} onClick={() => setSelectedUnlock(item)}>
                    <Image src={item.image} alt="" fill sizes="124px" />
                    <span><Lock size={14} /> {item.vip ? "VIP" : item.price}</span>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Gem />} text="Your collection is glowing. The next room opens soon." />
            )}
          </section>

          <section className="club-card club-enter" style={{ "--delay": "480ms" } as CSSProperties}>
            <div className="club-streak">
              <Flame className="club-flame" size={34} fill="currentColor" />
              <div>
                <h2>{mockUser.streakDays > 0 ? `${mockUser.streakDays}-day streak` : "Start a new streak today"}</h2>
                <p>{mockUser.streakDays > 0 ? "Visit daily to keep your streak alive" : "One visit today starts the ritual."}</p>
              </div>
            </div>
            <div className="club-calendar" aria-label="Last 7 days">
              {streakDots.map((filled, index) => (
                <span className={filled ? "is-filled" : ""} key={index}>{["M", "T", "W", "T", "F", "S", "S"][index]}</span>
              ))}
            </div>
            <div className="club-milestones">
              {[7, 14, 30].map((day) => (
                <span className={mockUser.streakDays >= day ? "is-hit" : ""} key={day}>Day {day}</span>
              ))}
            </div>
          </section>

          <section className="club-card club-enter" style={{ "--delay": "600ms" } as CSSProperties}>
            <div className="club-card-heading">
              <div>
                <p className="club-eyebrow">VIP Progress</p>
                <h2>{mockUser.tier}</h2>
              </div>
              <span className="club-tier-badge">Member</span>
            </div>
            <div className="club-tier-bar" aria-label={`${vipProgress}% progress to Super Fan`}>
              <span style={{ width: `${vipProgress}%` }} />
              <i style={{ left: "35%" }}>Super Fan</i>
              <i style={{ left: "68%" }}>VIP</i>
              <i style={{ left: "92%" }}>Obsessed</i>
            </div>
            <p className="club-progress-copy">{pointsToNext} pts to Super Fan status</p>
            <div className="club-points">
              <span>+120 from daily visits</span>
              <span>+210 from unlocks</span>
              <span>Next: RSVP to live Q&A</span>
            </div>
            <div className="club-benefits">
              <span>Priority replies</span>
              <span>Unlock at VIP</span>
            </div>
          </section>

          <section className="club-card club-enter" style={{ "--delay": "720ms" } as CSSProperties}>
            <div className="club-card-heading">
              <div>
                <p className="club-eyebrow">Upcoming</p>
                <h2>Events</h2>
              </div>
              <CalendarDays size={18} />
            </div>
            {mockContent.upcoming.length ? (
              <div className="club-events-row">
                {mockContent.upcoming.map((event) => (
                  <EventCard
                    event={event}
                    reminded={Boolean(reminders[event.id])}
                    onToggle={() => setReminders((current) => ({ ...current, [event.id]: !current[event.id] }))}
                    key={event.id}
                  />
                ))}
              </div>
            ) : (
              <EmptyState icon={<CalendarDays />} text="Nothing scheduled... yet. Stay tuned." />
            )}
          </section>
        </div>
      </main>

      <nav className="club-bottom-dock" aria-label="Member quick actions">
        <button type="button" onClick={() => setMessageOpen(true)} aria-label="Open chat">
          <span className={`club-mini-avatar ${status.className}`}>
            <Image src={mockCreator.avatarUrl} alt="" width={32} height={32} />
          </span>
          <span>Chat</span>
        </button>
        <div className={dockCountdown.totalSeconds < 3600 ? "is-urgent" : ""} role="timer" aria-label={`${soonerTarget} ${dockCountdown.display}`}>
          <small>{soonerTarget}</small>
          <FlipTime value={dockCountdown.display} />
        </div>
        <button
          type="button"
          className={mockUser.walletBalance < 5 ? "is-low" : ""}
          onClick={() => setWalletOpen(true)}
          aria-label={`Wallet balance ${mockUser.walletBalance.toFixed(2)} dollars`}
        >
          <Wallet size={18} />
          <span>${mockUser.walletBalance.toFixed(2)}</span>
        </button>
      </nav>

      {selectedUnlock ? (
        <div className="club-modal-backdrop" role="dialog" aria-modal="true" aria-label={`${selectedUnlock.title} preview`}>
          <div className="club-modal">
            <button type="button" className="club-close" onClick={() => setSelectedUnlock(null)} aria-label="Close preview">
              <X size={18} />
            </button>
            <Image src={selectedUnlock.image} alt="" width={340} height={220} />
            <span className="club-pill">{selectedUnlock.vip ? "VIP" : selectedUnlock.price}</span>
            <h2>{selectedUnlock.title}</h2>
            <p>{selectedUnlock.teaser}</p>
            <button type="button" className="club-gold-button">
              {selectedUnlock.vip ? "Reach VIP" : `Unlock for ${selectedUnlock.price}`}
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      ) : null}

      {(messageOpen || walletOpen) ? (
        <div className="club-sheet-backdrop" onClick={() => { setMessageOpen(false); setWalletOpen(false); }}>
          <div className="club-sheet" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="club-close" onClick={() => { setMessageOpen(false); setWalletOpen(false); }} aria-label="Close panel">
              <X size={18} />
            </button>
            {messageOpen ? (
              <>
                <h2>Private Thread</h2>
                <p>I saw your reply. Saved something extra for you tonight.</p>
                <button type="button" className="club-gold-button"><Send size={17} /> Reply Now</button>
              </>
            ) : (
              <>
                <h2>Wallet</h2>
                <p>Your balance is ${mockUser.walletBalance.toFixed(2)}. Add credits before the next drop opens.</p>
                <button type="button" className="club-gold-button"><Coins size={17} /> Top Up</button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
