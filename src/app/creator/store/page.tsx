import { requireCreator } from "@/lib/guards";
import { Package, Gift, Tag, CreditCard, MessageSquare, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function StorePage() {
  await requireCreator();

  const stats = [
    { label: "Revenue", value: "$0", sub: "All time", icon: TrendingUp },
    { label: "Products", value: "0", sub: "Listed", icon: Package },
    { label: "Subscribers", value: "0", sub: "Active", icon: CreditCard },
    { label: "Requests", value: "0", sub: "Pending", icon: MessageSquare },
  ];

  const categories = [
    { title: "Products", sub: "Digital goods, photos, videos", icon: Package, href: "/creator/store/products", count: 0 },
    { title: "Bundles", sub: "Package items at a discount", icon: Gift, href: "/creator/store/bundles", count: 0 },
    { title: "Deals", sub: "Limited-time promotions", icon: Tag, href: "/creator/store/deals", count: 0 },
    { title: "Subscriptions", sub: "Recurring tiers and benefits", icon: CreditCard, href: "/creator/store/subscriptions", count: 0 },
    { title: "Requests", sub: "Custom content from fans", icon: MessageSquare, href: "/creator/store/requests", count: 0 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="border-b border-[var(--glass-border)] pb-5">
        <p className="eyebrow mb-1">Monetization</p>
        <h1 className="text-3xl font-bold tracking-tight">Store</h1>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className="glass-card p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[var(--ink-muted)]">{label}</span>
              <Icon size={14} className="text-[var(--accent)]" />
            </div>
            <p className="text-xl font-bold">{value}</p>
            <p className="text-[10px] text-[var(--ink-faint)]">{sub}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-sm font-semibold text-[var(--ink-muted)] uppercase tracking-wider mb-3">Categories</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map(({ title, sub, icon: Icon, href, count }) => (
            <Link key={href} href={href} className="glass-card p-4 group hover:border-[var(--accent)]/20 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--accent-dim)] flex items-center justify-center group-hover:bg-[var(--accent-glow)] transition-colors">
                  <Icon size={16} className="text-[var(--accent)]" />
                </div>
                <span className="rounded-full bg-[var(--bg-raised)] px-2 py-0.5 text-[10px] text-[var(--ink-faint)]">{count} items</span>
              </div>
              <h3 className="text-sm font-semibold mb-0.5">{title}</h3>
              <p className="text-xs text-[var(--ink-muted)]">{sub}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="glass-card p-4 border-[var(--accent)]/15 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--accent-dim)] flex items-center justify-center shrink-0"><Package size={15} className="text-[var(--accent)]" /></div>
        <div>
          <p className="text-sm font-semibold text-[var(--accent)]">Start Monetizing</p>
          <p className="text-xs text-[var(--ink-muted)] mt-0.5 mb-3">Create your first product or subscription tier.</p>
          <div className="flex gap-2">
            <Link href="/creator/store/products" className="px-3 py-1.5 rounded-md bg-[var(--accent)] text-[var(--bg-base)] text-xs font-semibold hover:brightness-110 transition-all">Create Product</Link>
            <Link href="/creator/store/subscriptions" className="px-3 py-1.5 rounded-md border border-[var(--accent)]/30 text-[var(--accent)] text-xs font-medium hover:bg-[var(--accent-dim)] transition-colors">Setup Subscriptions</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
