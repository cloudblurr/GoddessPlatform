import {
  DollarSign, Eye, Users, TrendingUp, FileText, Heart,
  Database, HardDrive, Clock, CheckCircle2, AlertCircle,
} from "lucide-react";
import { requireCreator } from "@/lib/guards";
import { listR2Files, r2IsConfigured } from "@/lib/r2";

export default async function CreatorDashboard() {
  const session = await requireCreator();

  let storageStats = { usedBytes: 0, fileCount: 0, configured: false };
  if (r2IsConfigured()) {
    try {
      const files = await listR2Files(`creators/${session.userId}/uploads/`, 500);
      const fileItems = files.filter((f) => !f.isFolder);
      storageStats = {
        usedBytes: fileItems.reduce((s, f) => s + f.size, 0),
        fileCount: fileItems.length,
        configured: true,
      };
    } catch {
      /* R2 not reachable */
    }
  }

  function formatBytes(bytes: number) {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <header className="flex items-end justify-between border-b border-[var(--glass-border)] pb-5">
        <div>
          <p className="eyebrow mb-1">Overview</p>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Online
        </span>
      </header>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Revenue" value="$0" icon={DollarSign} />
        <MetricCard label="Subscribers" value="0" icon={Users} />
        <MetricCard label="Posts" value="0" icon={FileText} />
        <MetricCard label="Engagement" value="0" icon={Heart} />
      </div>

      {/* Storage */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--ink-muted)] uppercase tracking-wider mb-3">Cloud Storage · R2</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[var(--ink-muted)]">Storage Used</span>
              <Database size={16} className="text-[var(--accent)]" />
            </div>
            <p className="text-2xl font-bold">{formatBytes(storageStats.usedBytes)}</p>
            {storageStats.configured ? (
              <p className="flex items-center gap-1 text-[10px] text-emerald-400 mt-1"><CheckCircle2 size={10} /> R2 Connected</p>
            ) : (
              <p className="flex items-center gap-1 text-[10px] text-amber-400 mt-1"><AlertCircle size={10} /> Add R2 credentials</p>
            )}
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[var(--ink-muted)]">Total Files</span>
              <HardDrive size={16} className="text-[var(--accent)]" />
            </div>
            <p className="text-2xl font-bold">{storageStats.fileCount.toLocaleString()}</p>
            <p className="text-[10px] text-[var(--ink-faint)] mt-1">Cloudflare R2</p>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[var(--ink-muted)]">Bucket</span>
              <Clock size={16} className="text-[var(--accent)]" />
            </div>
            <p className="text-lg font-bold font-mono">xanna-media</p>
            <p className="text-[10px] text-[var(--ink-faint)] mt-1">WNAM · Cloudflare R2</p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--ink-muted)] uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { href: "/creator/studio", icon: FileText, label: "Create Post", sub: "Share new content" },
            { href: "/creator/storage", icon: Database, label: "Upload Media", sub: "Add to R2 vault" },
            { href: "/creator/payouts", icon: DollarSign, label: "Request Payout", sub: "Withdraw earnings" },
            { href: "/demo", icon: Eye, label: "Demo Mode", sub: "Explore platform" },
          ].map(({ href, icon: Icon, label, sub }) => (
            <a
              key={href}
              href={href}
              className="glass-card p-4 flex items-center gap-3 hover:border-[var(--accent)]/20 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-[var(--accent-dim)] flex items-center justify-center shrink-0 group-hover:bg-[var(--accent-glow)] transition-colors">
                <Icon size={16} className="text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-[11px] text-[var(--ink-faint)]">{sub}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Info notice */}
      <div className="glass-card p-5 border-blue-500/20 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
          <TrendingUp size={15} className="text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-400">Analytics Coming Soon</p>
          <p className="text-xs text-[var(--ink-muted)] mt-0.5">Real-time analytics will be available once Supabase is connected.</p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ size?: number; className?: string }> }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[var(--ink-muted)] font-medium">{label}</span>
        <Icon size={16} className="text-[var(--accent)]" />
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}
