import Link from "next/link";
import { ReactNode } from "react";
import Image from "next/image";
import { logoutAction } from "@/app/actions";
import { tierBadge } from "@/lib/content";
import { requireSubscriber } from "@/lib/guards";

const navItems = [
  { href: "/app", label: "Feed" },
  { href: "/app/welcome", label: "Welcome" },
  { href: "/app/inbox", label: "Inbox" },
  { href: "/app/gallery", label: "Gallery" },
  { href: "/app/store", label: "Store" },
  { href: "/app/offering", label: "Offering" },
];

export default async function SubscriberLayout({ children }: { children: ReactNode }) {
  const session = await requireSubscriber();

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="Xanna"
              width={32}
              height={32}
              className="rounded-full"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#C9A84C]">Xanna Platform</p>
              <p className="text-sm text-white/70">{tierBadge(session.plan)}</p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/80 transition hover:border-[#C9A84C]/50 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-full border border-red-500/40 px-3 py-1.5 text-sm text-red-300 transition hover:bg-red-500/10"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
