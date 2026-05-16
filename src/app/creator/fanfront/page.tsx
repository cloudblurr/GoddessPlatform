import { requireCreator } from "@/lib/guards";
import { Users, Palette, Layout, Eye } from "lucide-react";

export default async function FanFrontPage() {
  await requireCreator();

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      <header className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h2 className="text-sm font-mono tracking-[0.2em] text-[#C9A84C] uppercase mb-2">Customization</h2>
          <h1 className="text-4xl font-heading font-medium tracking-tight">FanFront</h1>
          <p className="text-white/60 mt-2">Customize your fan-facing experience</p>
        </div>
        <button className="px-4 py-2 rounded-lg border border-white/20 text-sm hover:bg-white/5 transition-all flex items-center gap-2">
          <Eye size={16} />
          Preview
        </button>
      </header>

      {/* Customization Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-white/10 bg-[#ffffff05]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[#C9A84C]/10">
              <Palette size={20} className="text-[#C9A84C]" />
            </div>
            <h3 className="font-medium">Theme & Colors</h3>
          </div>
          <p className="text-sm text-white/60 mb-4">
            Customize colors, fonts, and visual style
          </p>
          <button className="px-4 py-2 rounded-lg bg-[#C9A84C]/10 text-[#C9A84C] text-sm hover:bg-[#C9A84C]/20 transition-all">
            Customize Theme
          </button>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-[#ffffff05]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[#C9A84C]/10">
              <Layout size={20} className="text-[#C9A84C]" />
            </div>
            <h3 className="font-medium">Layout & Navigation</h3>
          </div>
          <p className="text-sm text-white/60 mb-4">
            Configure menu items and page layout
          </p>
          <button className="px-4 py-2 rounded-lg bg-[#C9A84C]/10 text-[#C9A84C] text-sm hover:bg-[#C9A84C]/20 transition-all">
            Edit Layout
          </button>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-[#ffffff05]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[#C9A84C]/10">
              <Users size={20} className="text-[#C9A84C]" />
            </div>
            <h3 className="font-medium">Featured Content</h3>
          </div>
          <p className="text-sm text-white/60 mb-4">
            Highlight your best posts and media
          </p>
          <button className="px-4 py-2 rounded-lg bg-[#C9A84C]/10 text-[#C9A84C] text-sm hover:bg-[#C9A84C]/20 transition-all">
            Manage Featured
          </button>
        </div>

        <div className="p-6 rounded-2xl border border-white/10 bg-[#ffffff05]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[#C9A84C]/10">
              <Eye size={20} className="text-[#C9A84C]" />
            </div>
            <h3 className="font-medium">Welcome Message</h3>
          </div>
          <p className="text-sm text-white/60 mb-4">
            Greet new subscribers with a custom message
          </p>
          <button className="px-4 py-2 rounded-lg bg-[#C9A84C]/10 text-[#C9A84C] text-sm hover:bg-[#C9A84C]/20 transition-all">
            Edit Message
          </button>
        </div>
      </div>

      {/* Phase 3 Notice */}
      <div className="mt-4 p-6 rounded-2xl border border-purple-500/20 bg-purple-500/5">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Palette size={20} className="text-purple-400" />
          </div>
          <div>
            <h4 className="font-medium text-purple-400 mb-1">Phase 3 Feature</h4>
            <p className="text-sm text-white/60">
              Full customization tools will be available in Phase 3 of development.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
