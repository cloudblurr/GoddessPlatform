import { requireCreator } from "@/lib/guards";
import { Bot, Sparkles, MessageSquare, TrendingUp } from "lucide-react";

export default async function AIAgentPage() {
  await requireCreator();

  const features = [
    { icon: Sparkles, title: "Content Ideas", sub: "AI-generated suggestions" },
    { icon: MessageSquare, title: "Auto Captions", sub: "Smart text generation" },
    { icon: TrendingUp, title: "Analytics Insights", sub: "Performance tips" },
    { icon: Bot, title: "Auto Moderation", sub: "Content filtering" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="border-b border-[var(--glass-border)] pb-5">
        <p className="eyebrow mb-1">Intelligence</p>
        <h1 className="text-3xl font-bold tracking-tight">AI Agent</h1>
        <p className="text-xs text-[var(--ink-muted)] mt-1">Your intelligent content assistant</p>
      </header>

      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--accent-dim)] flex items-center justify-center mb-5">
          <Bot size={28} className="text-[var(--accent)]" />
        </div>
        <h2 className="text-xl font-bold mb-2">Coming Soon</h2>
        <p className="text-sm text-[var(--ink-muted)] max-w-sm mb-8">AI-powered content creation, scheduling, captions, and moderation.</p>
        <div className="grid grid-cols-2 gap-3 max-w-md w-full text-left">
          {features.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="glass-card p-3">
              <Icon size={16} className="text-[var(--accent)] mb-2" />
              <p className="text-xs font-semibold">{title}</p>
              <p className="text-[10px] text-[var(--ink-faint)]">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
