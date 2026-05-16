import { requireCreator } from "@/lib/guards";
import { DoorOpen, Image as ImageIcon, Type, Link as LinkIcon, Eye } from "lucide-react";

export default async function EntryWayPage() {
  await requireCreator();

  const items = [
    { icon: ImageIcon, title: "Profile Media", sub: "Upload photos, banners, previews", label: "Upload Media" },
    { icon: Type, title: "Bio & Description", sub: "Write your bio for fans", label: "Edit Bio" },
    { icon: DoorOpen, title: "Subscription Pricing", sub: "Set tiers and pricing", label: "Configure" },
    { icon: LinkIcon, title: "Social Links", sub: "Add social media links", label: "Add Links" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex items-end justify-between border-b border-[var(--glass-border)] pb-5">
        <div>
          <p className="eyebrow mb-1">Landing Page</p>
          <h1 className="text-3xl font-bold tracking-tight">Entry Way</h1>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--glass-border)] px-3 py-1.5 text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors">
          <Eye size={13} /> Preview
        </button>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        {items.map(({ icon: Icon, title, sub, label }) => (
          <div key={title} className="glass-card p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-dim)] flex items-center justify-center"><Icon size={15} className="text-[var(--accent)]" /></div>
              <h3 className="text-sm font-semibold">{title}</h3>
            </div>
            <p className="text-xs text-[var(--ink-muted)] mb-3">{sub}</p>
            <button className="px-3 py-1.5 rounded-md bg-[var(--accent-dim)] text-[var(--accent)] text-xs font-medium hover:bg-[var(--accent-glow)] transition-colors">{label}</button>
          </div>
        ))}
      </div>

      <div className="glass-card p-4 border-purple-500/20 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
          <DoorOpen size={15} className="text-purple-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-purple-400">Phase 3 Feature</p>
          <p className="text-xs text-[var(--ink-muted)] mt-0.5">Full entry portal customization coming in Phase 3.</p>
        </div>
      </div>
    </div>
  );
}
