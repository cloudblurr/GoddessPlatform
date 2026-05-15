import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  LayoutDashboard, 
  Cloud, 
  Clapperboard, 
  Store as StoreIcon, 
  Bot, 
  Wallet, 
  ShieldAlert, 
  Users, 
  DoorOpen, 
  Radio, 
  Settings, 
  HelpCircle, 
  LogOut
} from "lucide-react";
import { requireCreator } from "@/lib/guards";
import { logoutAction } from "@/app/actions";

export default async function CreatorLayout({ children }: { children: ReactNode }) {
  await requireCreator();

  return (
    <div className="flex h-screen bg-[#04040a] text-white overflow-hidden font-sans">
      
      {/* Sleek Sidebar */}
      <aside className="w-64 flex flex-col border-r border-[#f6e05e1f] bg-[#07070d]/95 relative z-10 shadow-[18px_0_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_25%_0%,rgba(246,224,94,0.18),transparent_68%)]" />
        <div className="relative h-24 flex items-center px-6 border-b border-[#ffffff10] gap-3">
          <div className="rounded-full bg-gradient-to-br from-[#F6E05E] via-[#F687B3] to-[#76E4F7] p-[2px] shadow-[0_0_30px_rgba(246,224,94,0.22)]">
            <Image
              src="/logo.jpg"
              alt="Creator"
              width={40}
              height={40}
              className="rounded-full"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold font-heading tracking-wider text-[#F6E05E]">Creator</h1>
            <p className="text-xs text-white/45 font-mono">Luxury Control Room</p>
          </div>
        </div>
        
        <nav className="relative flex-1 py-6 px-4 flex flex-col gap-1 overflow-y-auto">
          <Link href="/creator" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#ffffff05] transition-all text-[#ffffff80] hover:text-[#C9A84C] group">
            <LayoutDashboard size={18} className="group-hover:drop-shadow-[0_0_8px_rgba(201,168,76,0.6)]" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          
          <Link href="/creator/storage" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#ffffff05] transition-all text-[#ffffff80] hover:text-[#C9A84C] group">
            <Cloud size={18} className="group-hover:drop-shadow-[0_0_8px_rgba(201,168,76,0.6)]" />
            <span className="text-sm font-medium">Cloud Storage</span>
          </Link>
          
          <Link href="/creator/studio" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#ffffff05] transition-all text-[#ffffff80] hover:text-[#C9A84C] group">
            <Clapperboard size={18} className="group-hover:drop-shadow-[0_0_8px_rgba(201,168,76,0.6)]" />
            <span className="text-sm font-medium">Studio</span>
          </Link>
          
          <Link href="/creator/store" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#ffffff05] transition-all text-[#ffffff80] hover:text-[#C9A84C] group">
            <StoreIcon size={18} className="group-hover:drop-shadow-[0_0_8px_rgba(201,168,76,0.6)]" />
            <span className="text-sm font-medium">Store</span>
          </Link>
          
          <Link href="/creator/ai-agent" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#ffffff05] transition-all text-[#ffffff80] hover:text-[#C9A84C] group">
            <Bot size={18} className="group-hover:drop-shadow-[0_0_8px_rgba(201,168,76,0.6)]" />
            <span className="text-sm font-medium">AI Agent</span>
          </Link>
          
          <Link href="/creator/payouts" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#ffffff05] transition-all text-[#ffffff80] hover:text-[#C9A84C] group">
            <Wallet size={18} className="group-hover:drop-shadow-[0_0_8px_rgba(201,168,76,0.6)]" />
            <span className="text-sm font-medium">Payouts</span>
          </Link>
          
          <div className="h-px bg-white/10 my-2"></div>
          
          <Link href="/creator/admin" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#ffffff05] transition-all text-[#ffffff80] hover:text-[#C9A84C] group">
            <ShieldAlert size={18} className="group-hover:drop-shadow-[0_0_8px_rgba(201,168,76,0.6)]" />
            <span className="text-sm font-medium">Admin Panel</span>
          </Link>
          
          <Link href="/creator/fanfront" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#ffffff05] transition-all text-[#ffffff80] hover:text-[#C9A84C] group">
            <Users size={18} className="group-hover:drop-shadow-[0_0_8px_rgba(201,168,76,0.6)]" />
            <span className="text-sm font-medium">FanFront</span>
          </Link>
          
          <Link href="/creator/entryway" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#ffffff05] transition-all text-[#ffffff80] hover:text-[#C9A84C] group">
            <DoorOpen size={18} className="group-hover:drop-shadow-[0_0_8px_rgba(201,168,76,0.6)]" />
            <span className="text-sm font-medium">Entry Way</span>
          </Link>
          
          <Link href="/creator/live" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#ffffff05] transition-all text-[#ffffff80] hover:text-[#C9A84C] group">
            <Radio size={18} className="group-hover:drop-shadow-[0_0_8px_rgba(201,168,76,0.6)]" />
            <span className="text-sm font-medium">Go Live</span>
          </Link>
          
          <div className="h-px bg-white/10 my-2"></div>
          
          <Link href="/creator/settings" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#ffffff05] transition-all text-[#ffffff80] hover:text-[#C9A84C] group">
            <Settings size={18} className="group-hover:drop-shadow-[0_0_8px_rgba(201,168,76,0.6)]" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
          
          <Link href="/creator/support" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#ffffff05] transition-all text-[#ffffff80] hover:text-[#C9A84C] group">
            <HelpCircle size={18} className="group-hover:drop-shadow-[0_0_8px_rgba(201,168,76,0.6)]" />
            <span className="text-sm font-medium">Support</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-[#ffffff10]">
          <div className="mb-4 rounded-2xl border border-[#F6E05E]/20 bg-[#F6E05E]/5 p-4">
            <p className="text-[0.65rem] font-mono uppercase tracking-[0.18em] text-[#F6E05E]">Vault Status</p>
            <p className="mt-1 text-sm text-white/70">R2 media library, store assets, and FanFront drops stay synced here.</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-white/50 transition-all hover:bg-white/5 hover:text-white"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 relative overflow-y-auto w-full">
        {/* Subtle background glow */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#C9A84C] opacity-[0.05] blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] h-[420px] w-[420px] rounded-full bg-cyan-400/5 blur-[140px] pointer-events-none"></div>
        
        <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

    </div>
  );
}
