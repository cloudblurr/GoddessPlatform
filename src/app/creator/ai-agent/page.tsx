import { requireCreator } from "@/lib/guards";
import { Bot, Sparkles, MessageSquare, TrendingUp } from "lucide-react";

export default async function AIAgentPage() {
  await requireCreator();

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      <header className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h2 className="text-sm font-mono tracking-[0.2em] text-[#C9A84C] uppercase mb-2">Intelligence</h2>
          <h1 className="text-4xl font-heading font-medium tracking-tight">AI Agent</h1>
          <p className="text-white/60 mt-2">Your intelligent content assistant</p>
        </div>
      </header>

      {/* Coming Soon */}
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <div className="inline-flex p-6 rounded-full bg-[#C9A84C]/10 mb-6">
            <Bot size={48} className="text-[#C9A84C]" />
          </div>
          <h3 className="text-2xl font-medium mb-4">AI Agent Coming Soon</h3>
          <p className="text-white/60 mb-8">
            Get AI-powered assistance for content creation, scheduling optimization, 
            caption generation, and more.
          </p>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="p-4 rounded-xl bg-[#ffffff05] border border-white/10">
              <Sparkles size={20} className="text-[#C9A84C] mb-2" />
              <div className="text-sm font-medium mb-1">Content Ideas</div>
              <div className="text-xs text-white/50">AI-generated suggestions</div>
            </div>
            <div className="p-4 rounded-xl bg-[#ffffff05] border border-white/10">
              <MessageSquare size={20} className="text-[#C9A84C] mb-2" />
              <div className="text-sm font-medium mb-1">Auto Captions</div>
              <div className="text-xs text-white/50">Smart text generation</div>
            </div>
            <div className="p-4 rounded-xl bg-[#ffffff05] border border-white/10">
              <TrendingUp size={20} className="text-[#C9A84C] mb-2" />
              <div className="text-sm font-medium mb-1">Analytics Insights</div>
              <div className="text-xs text-white/50">Performance tips</div>
            </div>
            <div className="p-4 rounded-xl bg-[#ffffff05] border border-white/10">
              <Bot size={20} className="text-[#C9A84C] mb-2" />
              <div className="text-sm font-medium mb-1">Auto Moderation</div>
              <div className="text-xs text-white/50">Content filtering</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
