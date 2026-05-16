import { DollarSign, Eye, Users, TrendingUp, FileText, Heart, Database, HardDrive, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { requireCreator } from "@/lib/guards";
import { listR2Files, r2IsConfigured } from "@/lib/r2";

export default async function CreatorDashboard() {
  await requireCreator();

  // Real R2 storage stats
  let storageStats = { usedBytes: 0, fileCount: 0, configured: false };
  if (r2IsConfigured()) {
    try {
      const files = await listR2Files("", 500);
      const fileItems = files.filter(f => !f.isFolder);
      storageStats = {
        usedBytes: fileItems.reduce((s, f) => s + f.size, 0),
        fileCount: fileItems.length,
        configured: true,
      };
    } catch {
      // R2 not reachable yet
    }
  }

  function formatBytes(bytes: number) {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  }

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-6 duration-700">

      <header className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h2 className="text-sm font-mono tracking-[0.2em] text-[#C9A84C] uppercase mb-2">Analytics</h2>
          <h1 className="text-4xl font-heading font-medium tracking-tight">Dashboard</h1>
        </div>
        <div className="px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 font-mono text-xs flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          LIVE
        </div>
      </header>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Total Revenue" value="$0" icon={DollarSign} />
        <MetricCard label="Active Subscribers" value="0" icon={Users} />
        <MetricCard label="Total Posts" value="0" icon={FileText} />
        <MetricCard label="Total Engagement" value="0" icon={Heart} />
      </div>

      {/* Storage */}
      <section>
        <h3 className="text-lg font-medium text-white/80 mb-4">Cloud Storage · R2</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/60 text-sm">Storage Used</span>
              <Database size={20} className="text-[#C9A84C]" />
            </div>
            <div className="text-3xl font-medium tracking-tight mb-2">
              {formatBytes(storageStats.usedBytes)}
            </div>
            {storageStats.configured ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle2 size={12} /> R2 Connected · xanna-media
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-amber-400">
                <AlertCircle size={12} /> Add R2 credentials to .env
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/60 text-sm">Total Files</span>
              <HardDrive size={20} className="text-[#C9A84C]" />
            </div>
            <div className="text-3xl font-medium tracking-tight">
              {storageStats.fileCount.toLocaleString()}
            </div>
            <p className="text-xs text-white/40 mt-1">Stored in Cloudflare R2</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/60 text-sm">Bucket</span>
              <Clock size={20} className="text-[#C9A84C]" />
            </div>
            <div className="text-xl font-medium tracking-tight font-mono">xanna-media</div>
            <p className="text-xs text-white/40 mt-1">WNAM · Cloudflare R2</p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h3 className="text-lg font-medium text-white/80 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { href: "/creator/studio", icon: FileText, label: "Create Post", sub: "Share new content" },
            { href: "/creator/storage", icon: Database, label: "Upload Media", sub: "Add to R2 vault" },
            { href: "/creator/payouts", icon: DollarSign, label: "Request Payout", sub: "Withdraw earnings" },
            { href: "/demo", icon: Eye, label: "Demo Mode", sub: "Explore platform", accent: "purple" },
          ].map(({ href, icon: Icon, label, sub, accent }) => (
            <a
              key={href}
              href={href}
              className={`p-6 rounded-2xl border transition-all group
                ${accent === "purple"
                  ? "border-purple-500/30 bg-linear-to-br from-purple-500/10 to-transparent hover:border-purple-500/50"
                  : "border-white/10 bg-linear-to-br from-white/[0.03] to-transparent hover:border-[#C9A84C]/30"}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-all
                  ${accent === "purple"
                    ? "bg-purple-500/20 group-hover:bg-purple-500/30"
                    : "bg-[#C9A84C]/10 group-hover:bg-[#C9A84C]/20"}`}>
                  <Icon size={24} className={accent === "purple" ? "text-purple-400" : "text-[#C9A84C]"} />
                </div>
                <div>
                  <h4 className="font-medium mb-1">{label}</h4>
                  <p className="text-sm text-white/50">{sub}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Setup notice */}
      <div className="p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <TrendingUp size={20} className="text-blue-400" />
          </div>
          <div>
            <h4 className="font-medium text-blue-400 mb-1">Analytics Coming Soon</h4>
            <p className="text-sm text-white/60">
              Real-time analytics will be available once Supabase is connected and you start creating content.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

function MetricCard({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ size?: number; className?: string }> }) {
  return (
    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <span className="text-white/60 text-sm font-medium">{label}</span>
        <Icon size={20} className="text-[#C9A84C]" />
      </div>
      <span className="text-3xl font-medium tracking-tight">{value}</span>
    </div>
  );
}
