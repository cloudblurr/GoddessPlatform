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
    <div className="space-y-6 animate-fade-in">
      <header className="flex items-end justify-between border-b border-[var(--glass-border)] pb-5">
        <div>
          <p className="eyebrow mb-1">Security</p>
          <h1 className="text-3xl font-bold tracking-tight">Access Control</h1>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-semibold text-red-400">
          <AlertTriangle size={11} /> Admin Active
        </span>
      </header>

      <div className="flex items-center gap-3 rounded-lg border border-[var(--glass-border)] bg-[var(--bg-raised)] px-3 py-2 focus-within:border-[var(--accent)]/40 transition-colors">
        <Search size={15} className="text-[var(--ink-faint)]" />
        <input type="text" placeholder="Search users…" className="bg-transparent border-none outline-none flex-1 text-sm placeholder:text-[var(--ink-faint)]" />
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--glass-border)]">
            <tr>
              <th className="py-3 px-4 text-[var(--ink-muted)] font-medium text-xs">User</th>
              <th className="py-3 px-4 text-[var(--ink-muted)] font-medium text-xs">Status</th>
              <th className="py-3 px-4 text-[var(--ink-muted)] font-medium text-xs">Flags</th>
              <th className="py-3 px-4 text-[var(--ink-muted)] font-medium text-xs text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--glass-border)]">
            {mockUsers.map((u) => (
              <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-4">
                  <p className="font-medium text-sm">{u.handle}</p>
                  <p className="text-[10px] text-[var(--ink-faint)] font-mono">{u.id}</p>
                </td>
                <td className="py-3 px-4">
                  {u.status === "ACTIVE" ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full text-[10px] font-semibold"><CheckCircle2 size={10} /> OK</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full text-[10px] font-semibold"><Ban size={10} /> Banned</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className={`text-xs ${u.violations > 0 ? "text-amber-400" : "text-[var(--ink-faint)]"}`}>{u.violations} incidents</span>
                </td>
                <td className="py-3 px-4 text-right">
                  {u.status === "ACTIVE" ? (
                    <button className="px-3 py-1.5 rounded-md border border-red-500/30 text-red-400 hover:bg-red-500/10 text-[10px] font-semibold uppercase tracking-wider transition-colors">Ban</button>
                  ) : (
                    <button className="px-3 py-1.5 rounded-md border border-[var(--glass-border)] text-[var(--ink-muted)] hover:text-[var(--ink)] text-[10px] font-semibold uppercase tracking-wider transition-colors">Revoke</button>
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
