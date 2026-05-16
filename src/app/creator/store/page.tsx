import { requireCreator } from "@/lib/guards";
import { Package, Gift, Tag, CreditCard, MessageSquare, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function StorePage() {
  await requireCreator();

  const storeCategories = [
    {
      title: "Products",
      description: "Digital goods, photos, videos, and custom content",
      icon: Package,
      href: "/creator/store/products",
      count: 0,
      color: "blue",
    },
    {
      title: "Bundles",
      description: "Package multiple items together at a discount",
      icon: Gift,
      href: "/creator/store/bundles",
      count: 0,
      color: "purple",
    },
    {
      title: "Deals",
      description: "Limited-time offers and promotions",
      icon: Tag,
      href: "/creator/store/deals",
      count: 0,
      color: "green",
    },
    {
      title: "Subscriptions",
      description: "Recurring membership tiers and benefits",
      icon: CreditCard,
      href: "/creator/store/subscriptions",
      count: 0,
      color: "gold",
    },
    {
      title: "Requests",
      description: "Custom content requests from fans",
      icon: MessageSquare,
      href: "/creator/store/requests",
      count: 0,
      color: "pink",
    },
  ];

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      <header className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h2 className="text-sm font-mono tracking-[0.2em] text-[#C9A84C] uppercase mb-2">Monetization</h2>
          <h1 className="text-4xl font-heading font-medium tracking-tight">Store</h1>
          <p className="text-white/60 mt-2">Manage your products, subscriptions, and offerings</p>
        </div>
      </header>

      {/* Store Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-[#ffffff05] border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Total Revenue</span>
            <TrendingUp size={18} className="text-[#C9A84C]" />
          </div>
          <div className="text-3xl font-medium">$0</div>
          <div className="text-xs text-white/40 mt-1">All time</div>
        </div>

        <div className="p-6 rounded-2xl bg-[#ffffff05] border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Active Products</span>
            <Package size={18} className="text-[#C9A84C]" />
          </div>
          <div className="text-3xl font-medium">0</div>
          <div className="text-xs text-white/40 mt-1">Listed items</div>
        </div>

        <div className="p-6 rounded-2xl bg-[#ffffff05] border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Subscribers</span>
            <CreditCard size={18} className="text-[#C9A84C]" />
          </div>
          <div className="text-3xl font-medium">0</div>
          <div className="text-xs text-white/40 mt-1">Active memberships</div>
        </div>

        <div className="p-6 rounded-2xl bg-[#ffffff05] border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Pending Requests</span>
            <MessageSquare size={18} className="text-[#C9A84C]" />
          </div>
          <div className="text-3xl font-medium">0</div>
          <div className="text-xs text-white/40 mt-1">Awaiting response</div>
        </div>
      </div>

      {/* Store Categories */}
      <section className="mt-4">
        <h3 className="text-lg font-medium text-white/80 mb-4">Store Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {storeCategories.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-[#ffffff05] to-transparent hover:border-[#C9A84C]/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${category.color}-500/10 group-hover:bg-${category.color}-500/20 transition-all`}>
                  <category.icon size={24} className="text-[#C9A84C]" />
                </div>
                <div className="px-3 py-1 rounded-full bg-white/5 text-xs text-white/60">
                  {category.count} items
                </div>
              </div>
              <h4 className="font-medium text-lg mb-2">{category.title}</h4>
              <p className="text-sm text-white/50">{category.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Getting Started */}
      <div className="mt-4 p-6 rounded-2xl border border-[#C9A84C]/20 bg-[#C9A84C]/5">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-[#C9A84C]/10">
            <Package size={20} className="text-[#C9A84C]" />
          </div>
          <div>
            <h4 className="font-medium text-[#C9A84C] mb-1">Start Monetizing</h4>
            <p className="text-sm text-white/60 mb-4">
              Create your first product or subscription tier to start earning from your content.
            </p>
            <div className="flex gap-3">
              <Link
                href="/creator/store/products"
                className="px-4 py-2 rounded-lg bg-[#C9A84C] text-black text-sm font-medium hover:bg-white transition-all"
              >
                Create Product
              </Link>
              <Link
                href="/creator/store/subscriptions"
                className="px-4 py-2 rounded-lg border border-[#C9A84C]/30 text-[#C9A84C] text-sm font-medium hover:bg-[#C9A84C]/10 transition-all"
              >
                Setup Subscriptions
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
