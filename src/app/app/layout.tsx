import Link from "next/link";
import { ReactNode } from "react";
import Image from "next/image";
import { logoutAction } from "@/app/actions";
import { tierBadge } from "@/lib/content";
import { requireSubscriber } from "@/lib/guards";
import {
  Home, ShoppingBag, MessageCircle, Image as ImageIcon, User,
} from "lucide-react";

const bottomNav = [
  { href: "/app", label: "Feed", icon: "Home" },
  { href: "/app/store", label: "Store", icon: "ShoppingBag" },
  { href: "/app/inbox", label: "Inbox", icon: "MessageCircle" },
  { href: "/app/gallery", label: "Gallery", icon: "ImageIcon" },
  { href: "/app/offering", label: "Profile", icon: "User" },
];

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Home,
  ShoppingBag,
  MessageCircle,
  ImageIcon,
  User,
};

export default async function SubscriberLayout({ children }: { children: ReactNode }) {
  const session = await requireSubscriber();

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--ink)]">
      {/* Top bar — minimal */}
      <header className="sticky top-0 z-30 border-b border-[var(--glass-border)] bg-[var(--bg-base)]/90 backdrop-blur-lg">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-2.5">
          <Link href="/app" className="flex items-center gap-2.5">
            <Image src="/logo.jpg" alt="Platform" width={28} height={28} className="rounded-full" />
            <div className="leading-tight">
              <p className="text-sm font-semibold">Xanna</p>
              <p className="text-[10px] text-[var(--accent)] font-medium">{tierBadge(session.plan)}</p>
            </div>
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-full px-3 py-1 text-xs text-[var(--ink-muted)] border border-[var(--glass-border)] hover:text-red-400 hover:border-red-400/30 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* Content area with bottom padding for nav */}
      <main className="mx-auto max-w-2xl px-0 pb-24 pt-4">{children}</main>

      {/* Bottom navigation bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--glass-border)] bg-[var(--bg-base)]/90 backdrop-blur-lg safe-area-bottom">
        <div className="mx-auto max-w-md grid grid-cols-5 py-2 px-2">
          {bottomNav.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 py-1 text-[var(--ink-muted)] hover:text-[var(--accent)] transition-colors"
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
