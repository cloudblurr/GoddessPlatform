import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard, Cloud, Clapperboard, Store as StoreIcon,
  Bot, Wallet, ShieldAlert, Users, DoorOpen, Radio,
  Settings, HelpCircle, LogOut,
} from "lucide-react";
import { requireCreator } from "@/lib/guards";
import { logoutAction } from "@/app/actions";

const mainLinks = [
  { href: "/creator", label: "Dashboard", icon: LayoutDashboard },
  { href: "/creator/storage", label: "Cloud Storage", icon: Cloud },
  { href: "/creator/studio", label: "Studio", icon: Clapperboard },
  { href: "/creator/store", label: "Store", icon: StoreIcon },
  { href: "/creator/ai-agent", label: "AI Agent", icon: Bot },
  { href: "/creator/payouts", label: "Payouts", icon: Wallet },
];

const secondaryLinks = [
  { href: "/creator/admin", label: "Admin", icon: ShieldAlert },
  { href: "/creator/fanfront", label: "FanFront", icon: Users },
  { href: "/creator/entryway", label: "Entry Way", icon: DoorOpen },
  { href: "/creator/live", label: "Go Live", icon: Radio },
];

const utilLinks = [
  { href: "/creator/settings", label: "Settings", icon: Settings },
  { href: "/creator/support", label: "Support", icon: HelpCircle },
];

function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--bg-raised)] transition-colors group"
    >
      <Icon size={16} className="shrink-0 group-hover:text-[var(--accent)] transition-colors" />
      <span className="font-medium">{label}</span>
    </Link>
  );
}

export default async function CreatorLayout({ children }: { children: ReactNode }) {
  await requireCreator();

  return (
    <div className="flex h-screen bg-[var(--bg-base)] text-[var(--ink)] overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 lg:w-60 flex-col border-r border-[var(--glass-border)] bg-[var(--bg-surface)] shrink-0">
        {/* Brand */}
        <div className="h-14 flex items-center gap-2.5 px-5 border-b border-[var(--glass-border)]">
          <Image src="/logo.jpg" alt="Creator" width={28} height={28} className="rounded-full" />
          <div className="leading-tight">
            <p className="text-sm font-semibold">Creator</p>
            <p className="text-[10px] text-[var(--accent)] font-medium">Portal</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {mainLinks.map((l) => <NavLink key={l.href} {...l} />)}
          <div className="h-px bg-[var(--glass-border)] my-2" />
          {secondaryLinks.map((l) => <NavLink key={l.href} {...l} />)}
          <div className="h-px bg-[var(--glass-border)] my-2" />
          {utilLinks.map((l) => <NavLink key={l.href} {...l} />)}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--glass-border)]">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--ink-faint)] hover:text-red-400 hover:bg-red-400/5 transition-colors"
            >
              <LogOut size={15} />
              <span className="font-medium">Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-10 max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
