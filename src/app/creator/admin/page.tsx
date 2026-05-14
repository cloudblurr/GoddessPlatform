import { requireCreator } from "@/lib/guards";
import { Search, Ban, CheckCircle2, AlertTriangle } from "lucide-react";

export default async function AdminSecurityPage() {
  await requireCreator();

  const mockUsers = [
    { id: "usr_1", handle: "@nightowl", status: "ACTIVE", violations: 0 },
    { id: "usr_2", handle: "@sneaky_guy", status: "BANNED", violations: 3 },
    { id: "usr_3", handle: "@fan123", status: "ACTIVE", violations: 1 },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header className="flex items-end justify-between border-b border-red-500/20 pb-6">
        <div>
          <h2 className="text-sm font-mono tracking-[0.2em] text-red-500 uppercase mb-2">Security Override</h2>
          <h1 className="text-4xl font-heading font-medium tracking-tight text-white">Access & Ban Control</h1>
        </div>
        <div className="px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 font-mono text-xs flex items-center gap-2">
          <AlertTriangle size={14} />
          xAnna0-god Layer Active
        </div>
      </header>

      <div className="w-full flex items-center gap-4 bg-[#ffffff05] border border-white/10 rounded-xl p-2 px-4 focus-within:border-red-500/50 transition-colors">
        <Search size={20} className="text-white/40" />
        <input 
          type="text" 
          placeholder="Search handles, IDs to enforce action..." 
          className="bg-transparent border-none outline-none flex-1 py-2 text-white placeholder-white/30"
        />
      </div>

      <div className="border border-white/5 rounded-2xl overflow-hidden bg-[#050505]">
        <table className="w-full text-left font-sans">
          <thead className="bg-[#ffffff02] border-b border-white/5">
            <tr>
              <th className="py-4 px-6 text-white/50 font-medium text-sm">User Identity</th>
              <th className="py-4 px-6 text-white/50 font-medium text-sm">Status</th>
              <th className="py-4 px-6 text-white/50 font-medium text-sm">Flags</th>
              <th className="py-4 px-6 text-white/50 font-medium text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {mockUsers.map(u => (
              <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="py-4 px-6">
                  <div className="flex flex-col">
                    <span className="font-semibold text-white/90">{u.handle}</span>
                    <span className="font-mono text-xs text-white/30">{u.id}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  {u.status === "ACTIVE" ? (
                    <span className="inline-flex items-center gap-2 text-green-400 bg-green-400/10 px-3 py-1 rounded-full text-xs font-mono font-bold">
                      <CheckCircle2 size={12} /> OK
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-red-500 bg-red-500/10 px-3 py-1 rounded-full text-xs font-mono font-bold">
                      <Ban size={12} /> ENFORCED
                    </span>
                  )}
                </td>
                <td className="py-4 px-6">
                  <span className={`text-sm ${u.violations > 0 ? "text-yellow-500" : "text-white/30"}`}>
                    {u.violations} Incidents
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  {u.status === "ACTIVE" ? (
                    <button className="px-4 py-2 rounded border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-bold tracking-wider uppercase">
                      Ban User
                    </button>
                  ) : (
                    <button className="px-4 py-2 rounded border border-white/10 text-white/50 hover:text-white transition-all text-xs font-bold tracking-wider uppercase">
                      Revoke Ban
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
