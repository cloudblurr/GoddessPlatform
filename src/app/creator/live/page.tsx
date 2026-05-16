import { requireCreator } from "@/lib/guards";
import { Radio, Video, Users, Settings } from "lucide-react";

export default async function GoLivePage() {
  await requireCreator();

  const features = [
    { icon: Video, title: "HD Streaming", sub: "1080p quality" },
    { icon: Users, title: "Live Chat", sub: "Real-time interaction" },
    { icon: Settings, title: "Stream Key", sub: "OBS integration" },
    { icon: Radio, title: "Recordings", sub: "Auto-save streams" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="border-b border-[var(--glass-border)] pb-5">
        <p className="eyebrow mb-1">Streaming</p>
        <h1 className="text-3xl font-bold tracking-tight">Go Live</h1>
        <p className="text-xs text-[var(--ink-muted)] mt-1">Live streaming and real-time engagement</p>
      </header>

      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--rose-dim)] flex items-center justify-center mb-5">
          <Radio size={28} className="text-[var(--rose)]" />
        </div>
        <h2 className="text-xl font-bold mb-2">Coming Soon</h2>
        <p className="text-sm text-[var(--ink-muted)] max-w-sm mb-8">Connect with fans through live video streaming.</p>
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
