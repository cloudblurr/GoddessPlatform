import { requireCreator } from "@/lib/guards";
import { Settings as SettingsIcon, User, Bell, Lock, CreditCard, Key } from "lucide-react";

export default async function SettingsPage() {
  await requireCreator();

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      <header className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h2 className="text-sm font-mono tracking-[0.2em] text-[#C9A84C] uppercase mb-2">Configuration</h2>
          <h1 className="text-4xl font-heading font-medium tracking-tight">Settings</h1>
          <p className="text-white/60 mt-2">Manage your account and preferences</p>
        </div>
      </header>

      {/* Settings Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-white/10 bg-[#ffffff05]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[#C9A84C]/10">
              <User size={20} className="text-[#C9A84C]" />
            </div>
            <h3 className="font-medium">Account Settings</h3>
          </div>
          <p className="text-sm text-white/60 mb-4">
            Update your profile, email, and personal information
          </p>
          <button className="px-4 py-2 rounded-lg bg-[#C9A84C]/10 text-[#C9A84C] text-sm hover:bg-[#C9A84C]/20 transition-all">
            Edit Account
          </button>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-[#ffffff05]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[#C9A84C]/10">
              <Lock size={20} className="text-[#C9A84C]" />
            </div>
            <h3 className="font-medium">Privacy & Security</h3>
          </div>
          <p className="text-sm text-white/60 mb-4">
            Password, 2FA, and privacy controls
          </p>
          <button className="px-4 py-2 rounded-lg bg-[#C9A84C]/10 text-[#C9A84C] text-sm hover:bg-[#C9A84C]/20 transition-all">
            Manage Security
          </button>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-[#ffffff05]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[#C9A84C]/10">
              <Bell size={20} className="text-[#C9A84C]" />
            </div>
            <h3 className="font-medium">Notifications</h3>
          </div>
          <p className="text-sm text-white/60 mb-4">
            Configure email and push notifications
          </p>
          <button className="px-4 py-2 rounded-lg bg-[#C9A84C]/10 text-[#C9A84C] text-sm hover:bg-[#C9A84C]/20 transition-all">
            Edit Preferences
          </button>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-[#ffffff05]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[#C9A84C]/10">
              <CreditCard size={20} className="text-[#C9A84C]" />
            </div>
            <h3 className="font-medium">Payment Methods</h3>
          </div>
          <p className="text-sm text-white/60 mb-4">
            Manage payout accounts and tax information
          </p>
          <button className="px-4 py-2 rounded-lg bg-[#C9A84C]/10 text-[#C9A84C] text-sm hover:bg-[#C9A84C]/20 transition-all">
            Manage Payments
          </button>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-[#ffffff05]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[#C9A84C]/10">
              <Key size={20} className="text-[#C9A84C]" />
            </div>
            <h3 className="font-medium">API Keys</h3>
          </div>
          <p className="text-sm text-white/60 mb-4">
            Generate and manage API access tokens
          </p>
          <button className="px-4 py-2 rounded-lg bg-[#C9A84C]/10 text-[#C9A84C] text-sm hover:bg-[#C9A84C]/20 transition-all">
            View API Keys
          </button>
        </div>
      </div>

    </div>
  );
}
