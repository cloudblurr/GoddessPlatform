import { requireCreator } from "@/lib/guards";
import { Wallet, TrendingUp, Clock, CheckCircle, AlertCircle, DollarSign } from "lucide-react";

export default async function PayoutsPage() {
  await requireCreator();

  // TODO: Fetch real data from Supabase/Rampex
  const walletData = {
    availableBalance: 0,
    pendingBalance: 0,
    totalEarnings: 0,
    lastPayout: null,
  };

  const recentTransactions: any[] = [];

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      <header className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h2 className="text-sm font-mono tracking-[0.2em] text-[#C9A84C] uppercase mb-2">Earnings</h2>
          <h1 className="text-4xl font-heading font-medium tracking-tight">Payouts</h1>
          <p className="text-white/60 mt-2">Manage your earnings and withdrawal requests</p>
        </div>
      </header>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-2xl bg-gradient-to-br from-[#C9A84C]/10 to-transparent border border-[#C9A84C]/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A84C] opacity-[0.1] blur-[60px]"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={20} className="text-[#C9A84C]" />
              <span className="text-white/60 text-sm">Available Balance</span>
            </div>
            <div className="text-5xl font-bold font-mono text-[#C9A84C] mb-4">
              ${walletData.availableBalance.toFixed(2)}
            </div>
            <button className="w-full px-6 py-3 rounded-xl bg-[#C9A84C] text-black font-semibold hover:bg-white transition-all shadow-[0_0_20px_rgba(201,168,76,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
              Request Payout
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#ffffff05] border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/60 text-sm">Pending Balance</span>
            <Clock size={20} className="text-orange-400" />
          </div>
          <div className="text-3xl font-medium mb-2">
            ${walletData.pendingBalance.toFixed(2)}
          </div>
          <p className="text-xs text-white/40">Processing transactions</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#ffffff05] border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/60 text-sm">Total Earnings</span>
            <TrendingUp size={20} className="text-green-400" />
          </div>
          <div className="text-3xl font-medium mb-2">
            ${walletData.totalEarnings.toFixed(2)}
          </div>
          <p className="text-xs text-white/40">All time</p>
        </div>
      </div>

      {/* Payout Methods */}
      <section className="mt-4">
        <h3 className="text-lg font-medium text-white/80 mb-4">Payout Methods</h3>
        <div className="p-6 rounded-2xl border border-white/10 bg-[#ffffff05]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#C9A84C]/10">
                <DollarSign size={24} className="text-[#C9A84C]" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Rampex Escrow</h4>
                <p className="text-sm text-white/50">Secure cryptocurrency payments</p>
              </div>
            </div>
            <div className="px-4 py-2 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">
              Connected
            </div>
          </div>
        </div>
      </section>

      {/* Transaction History */}
      <section className="mt-4">
        <h3 className="text-lg font-medium text-white/80 mb-4">Transaction History</h3>
        {recentTransactions.length === 0 ? (
          <div className="p-12 rounded-2xl border border-white/10 bg-[#ffffff05] text-center">
            <div className="inline-flex p-4 rounded-full bg-white/5 mb-4">
              <Wallet size={32} className="text-white/40" />
            </div>
            <h4 className="text-lg font-medium mb-2">No transactions yet</h4>
            <p className="text-sm text-white/50">
              Your earnings and payout history will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-white/10 bg-[#ffffff05] flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    transaction.status === 'completed' ? 'bg-green-500/10' :
                    transaction.status === 'pending' ? 'bg-orange-500/10' :
                    'bg-red-500/10'
                  }`}>
                    {transaction.status === 'completed' ? (
                      <CheckCircle size={20} className="text-green-400" />
                    ) : transaction.status === 'pending' ? (
                      <Clock size={20} className="text-orange-400" />
                    ) : (
                      <AlertCircle size={20} className="text-red-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-white/50">{transaction.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-lg">${transaction.amount}</div>
                  <div className={`text-xs ${
                    transaction.status === 'completed' ? 'text-green-400' :
                    transaction.status === 'pending' ? 'text-orange-400' :
                    'text-red-400'
                  }`}>
                    {transaction.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Setup Notice */}
      <div className="mt-4 p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <AlertCircle size={20} className="text-blue-400" />
          </div>
          <div>
            <h4 className="font-medium text-blue-400 mb-1">Payment Integration Required</h4>
            <p className="text-sm text-white/60">
              Connect your Rampex account to start receiving payments. Minimum payout threshold is $50.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
