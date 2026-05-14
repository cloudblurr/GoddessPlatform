import { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, Database, Activity, LogOut, ShieldAlert, Palette } from "lucide-react";
import { requireCreator } from "@/lib/guards";

export default async function CreatorLayout({ children }: { children: ReactNode }) {
  await requireCreator();

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans">
      
      {/* Sleek Sidebar */}
      <aside className="w-64 flex flex-col border-r border-[#ffffff10] bg-[#0a0a0a] relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        <div className="h-20 flex items-center px-8 border-b border-[#ffffff10]">
          <h1 className="text-xl font-bold font-heading tracking-widest text-[#C9A84C]">XANNA_<span className="text-white opacity-50 text-sm font-mono tracking-normal">GodMode</span></h1>
        </div>
        
        <nav className="flex-1 py-8 px-4 flex flex-col gap-2">
          <Link href="/creator" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#ffffff05] transition-all text-[#ffffff80] hover:text-[#C9A84C] group">
            <LayoutDashboard size={20} className="group-hover:drop-shadow-[0_0_8px_rgba(201,168,76,0.6)]" />
            <span className="text-sm font-medium tracking-wide">Overview</span>
          </Link>
          <Link href="/creator/vault" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#ffffff05] transition-all text-[#ffffff80] hover:text-[#C9A84C] group">
            <Database size={20} className="group-hover:drop-shadow-[0_0_8px_rgba(201,168,76,0.6)]" />
            <span className="text-sm font-medium tracking-wide">The Vault</span>
          </Link>
          <Link href="/creator/feed" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#ffffff05] transition-all text-[#ffffff80] hover:text-[#C9A84C] group">
            <Activity size={20} className="group-hover:drop-shadow-[0_0_8px_rgba(201,168,76,0.6)]" />
            <span className="text-sm font-medium tracking-wide">Broadcast</span>
          </Link>
          <Link href="/creator/appearance" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#ffffff05] transition-all text-[#ffffff80] hover:text-[#C9A84C] group">
            <Palette size={20} className="group-hover:drop-shadow-[0_0_8px_rgba(201,168,76,0.6)]" />
            <span className="text-sm font-medium tracking-wide">Appearance</span>
          </Link>
          <Link href="/creator/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#ffffff05] transition-all text-[#ffffff80] hover:text-red-500 group mt-12 bg-red-500/5 border border-red-500/10">
            <ShieldAlert size={20} className="group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
            <span className="text-sm font-medium tracking-wide">Security & Ban</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-[#ffffff10]">
           <Link href="/api/auth/logout" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-white/50 hover:text-white">
            <LogOut size={20} />
            <span className="text-sm font-medium tracking-wide">Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 relative overflow-y-auto w-full">
        {/* Subtle background glow */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#C9A84C] opacity-[0.03] blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="p-8 lg:p-12 max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>

    </div>
  );
}
