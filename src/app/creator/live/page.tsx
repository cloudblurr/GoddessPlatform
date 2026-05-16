import { requireCreator } from "@/lib/guards";
import { Radio, Video, Users, Settings } from "lucide-react";

export default async function GoLivePage() {
  await requireCreator();

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      <header className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h2 className="text-sm font-mono tracking-[0.2em] text-[#C9A84C] uppercase mb-2">Streaming</h2>
          <h1 className="text-4xl font-heading font-medium tracking-tight">Go Live</h1>
          <p className="text-white/60 mt-2">Live streaming and real-time engagement</p>
        </div>
      </header>

      {/* Coming Soon */}
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <div className="inline-flex p-6 rounded-full bg-[#C9A84C]/10 mb-6">
            <Radio size={48} className="text-[#C9A84C]" />
          </div>
          <h3 className="text-2xl font-medium mb-4">Live Streaming Coming Soon</h3>
          <p className="text-white/60 mb-8">
            Connect with your fans in real-time through live video streaming.
          </p>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="p-4 rounded-xl bg-[#ffffff05] border border-white/10">
              <Video size={20} className="text-[#C9A84C] mb-2" />
              <div className="text-sm font-medium mb-1">HD Streaming</div>
              <div className="text-xs text-white/50">1080p quality</div>
            </div>
            <div className="p-4 rounded-xl bg-[#ffffff05] border border-white/10">
              <Users size={20} className="text-[#C9A84C] mb-2" />
              <div className="text-sm font-medium mb-1">Live Chat</div>
              <div className="text-xs text-white/50">Real-time interaction</div>
            </div>
            <div className="p-4 rounded-xl bg-[#ffffff05] border border-white/10">
              <Settings size={20} className="text-[#C9A84C] mb-2" />
              <div className="text-sm font-medium mb-1">Stream Key</div>
              <div className="text-xs text-white/50">OBS integration</div>
            </div>
            <div className="p-4 rounded-xl bg-[#ffffff05] border border-white/10">
              <Radio size={20} className="text-[#C9A84C] mb-2" />
              <div className="text-sm font-medium mb-1">Recordings</div>
              <div className="text-xs text-white/50">Auto-save streams</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
