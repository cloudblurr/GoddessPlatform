import { requireCreator } from "@/lib/guards";
import { User, Bell, Lock, CreditCard, Key } from "lucide-react";

export default async function SettingsPage() {
  await requireCreator();

  const items = [
    { icon: User, title: "Account", sub: "Profile, email, personal info", label: "Edit Account" },
    { icon: Lock, title: "Privacy & Security", sub: "Password, 2FA, privacy controls", label: "Manage Security" },
    { icon: Bell, title: "Notifications", sub: "Email and push notifications", label: "Edit Preferences" },
    { icon: CreditCard, title: "Payment Methods", sub: "Payout accounts and tax info", label: "Manage Payments" },
    { icon: Key, title: "API Keys", sub: "Generate and manage tokens", label: "View API Keys" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="border-b border-[var(--glass-border)] pb-5">
        <p className="eyebrow mb-1">Configuration</p>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
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
    </div>
  );
}
