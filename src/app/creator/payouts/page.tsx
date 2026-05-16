import { requireCreator } from "@/lib/guards";
import { Wallet, TrendingUp, Clock, CheckCircle, AlertCircle, DollarSign } from "lucide-react";

export default async function PayoutsPage() {
  await requireCreator();

  const walletData = { availableBalance: 0, pendingBalance: 0, totalEarnings: 0, lastPayout: null };
  const recentTransactions: any[] = [];

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="border-b border-[var(--glass-border)] pb-5">
        <p className="eyebrow mb-1">Earnings</p>
        <h1 className="text-3xl font-bold tracking-tight">Payouts</h1>
      </header>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 border-[var(--accent)]/15">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={15} className="text-[var(--accent)]" />
            <span className="text-xs text-[var(--ink-muted)]">Available</span>
          </div>
          <p className="text-3xl font-bold text-[var(--accent)] font-mono">${walletData.availableBalance.toFixed(2)}</p>
          <button className="mt-3 w-full rounded-lg bg-[var(--accent)] text-[var(--bg-base)] py-2 text-xs font-semibold hover:brightness-110 transition-all">Request Payout</button>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--ink-muted)]">Pending</span>
            <Clock size={14} className="text-orange-400" />
          </div>
          <p className="text-2xl font-bold">${walletData.pendingBalance.toFixed(2)}</p>
          <p className="text-[10px] text-[var(--ink-faint)] mt-1">Processing</p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--ink-muted)]">Total Earnings</span>
            <TrendingUp size={14} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold">${walletData.totalEarnings.toFixed(2)}</p>
          <p className="text-[10px] text-[var(--ink-faint)] mt-1">All time</p>
        </div>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-[var(--ink-muted)] uppercase tracking-wider mb-3">Payout Method</h2>
        <div className="glass-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--accent-dim)] flex items-center justify-center"><DollarSign size={16} className="text-[var(--accent)]" /></div>
            <div>
              <p className="text-sm font-semibold">Rampex Escrow</p>
              <p className="text-[10px] text-[var(--ink-muted)]">Secure cryptocurrency payments</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 text-[10px] font-semibold">Connected</span>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-[var(--ink-muted)] uppercase tracking-wider mb-3">Transactions</h2>
        {recentTransactions.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <Wallet size={24} className="text-[var(--ink-faint)] mx-auto mb-3" />
            <p className="text-sm font-medium">No transactions yet</p>
            <p className="text-xs text-[var(--ink-muted)] mt-1">Earnings and payouts will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((tx: any, i: number) => (
              <div key={i} className="glass-card p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.status === "completed" ? "bg-emerald-500/10" : tx.status === "pending" ? "bg-orange-500/10" : "bg-red-500/10"}`}>
                    {tx.status === "completed" ? <CheckCircle size={14} className="text-emerald-400" /> : tx.status === "pending" ? <Clock size={14} className="text-orange-400" /> : <AlertCircle size={14} className="text-red-400" />}
                  </div>
                  <div>
                    <p className="text-xs font-medium">{tx.description}</p>
                    <p className="text-[10px] text-[var(--ink-faint)]">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">${tx.amount}</p>
                  <p className={`text-[10px] font-semibold ${tx.status === "completed" ? "text-emerald-400" : tx.status === "pending" ? "text-orange-400" : "text-red-400"}`}>{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="glass-card p-4 border-blue-500/20 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0"><AlertCircle size={15} className="text-blue-400" /></div>
        <div>
          <p className="text-sm font-semibold text-blue-400">Payment Integration Required</p>
          <p className="text-xs text-[var(--ink-muted)] mt-0.5">Connect Rampex to start receiving payments. Min payout: $50.</p>
        </div>
      </div>
    </div>
  );
}
