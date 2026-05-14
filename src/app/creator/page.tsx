import { DollarSign, Eye, Users } from "lucide-react";
import { requireCreator } from "@/lib/guards";

export default async function CreatorDashboard() {
  await requireCreator();

  // Mock revenue metrics
  const metrics = [
    { label: "Total Rampex Revenue", value: "$42,500.00", icon: DollarSign, change: "+12.5%" },
    { label: "Vault Unlocks", value: "1,248", icon: Eye, change: "+5.2%" },
    { label: "Active Subscriptions", value: "342", icon: Users, change: "+2.1%" },
  ];

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      <header className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h2 className="text-sm font-mono tracking-[0.2em] text-[#C9A84C] uppercase mb-2">Command Center</h2>
          <h1 className="text-4xl font-heading font-medium tracking-tight">Overview</h1>
        </div>
        <div className="px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 font-mono text-xs shadow-[0_0_15px_rgba(34,197,94,0.15)] flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          SYSTEM_ONLINE
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((m, i) => (
          <div key={i} className="p-6 rounded-2xl bg-[#ffffff05] border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A84C] opacity-[0.02] blur-[40px] group-hover:opacity-[0.08] transition-opacity"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-white/60 text-sm font-medium">{m.label}</span>
              <m.icon size={20} className="text-[#C9A84C]" />
            </div>
            <div className="flex items-baseline gap-4 relative z-10">
              <span className="text-3xl font-medium tracking-tight">{m.value}</span>
              <span className="text-green-400 text-sm">{m.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Rampex Quick Actions */}
      <section className="mt-8">
        <h3 className="text-lg font-medium text-white/80 mb-4">Rampex Escrow & Payouts</h3>
        <div className="p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-[#ffffff05] to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-sm mb-1">Available for Payout</p>
              <h4 className="text-4xl font-bold font-mono text-[#C9A84C]">$12,450.00</h4>
            </div>
            <button className="px-8 py-3 rounded-full bg-[#C9A84C] text-black font-semibold hover:bg-white transition-all shadow-[0_0_20px_rgba(201,168,76,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
              Initiate Rampex Payout
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
