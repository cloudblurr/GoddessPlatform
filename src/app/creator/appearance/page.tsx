import { updateAppearanceSettings } from "@/app/actions";
import { readStore } from "@/lib/store";
import { CheckCircle2, Save } from "lucide-react";

const inputCls = "w-full rounded-lg border border-[var(--glass-border)] bg-[var(--bg-raised)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]/40 transition-colors";
const labelCls = "block text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-faint)] mb-1.5";

export default async function CreatorAppearancePage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const store = await readStore();
  const settings = store.entrySettings || {
    heroTitle: "Goddess Annalesse",
    heroSubtitle: "A delicate touch of luxury from the Queen of your feed.",
    revealHeadline: "Want to go to Heaven? This is inside.",
    previews: [
      { id: "p1", title: "Platinum Dripped Aura", mediaUrl: "/logo-2.png", mediaType: "image" as const },
      { id: "p2", title: "Eternal Grace", mediaUrl: "/logo-1.png", mediaType: "image" as const },
      { id: "p3", title: "Midnight Routine", mediaUrl: "https://files.catbox.moe/97ukl2.mp4", mediaType: "video" as const },
      { id: "p4", title: "Sanctum Secrets", mediaUrl: "https://files.catbox.moe/3lohl1.mp4", mediaType: "video" as const }
    ]
  };

  const previews = [
    { n: 1, prefix: "p1", defaults: settings.previews[0] },
    { n: 2, prefix: "p2", defaults: settings.previews[1] },
    { n: 3, prefix: "p3", defaults: settings.previews[2] },
    { n: 4, prefix: "p4", defaults: settings.previews[3] },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <header className="border-b border-[var(--glass-border)] pb-5">
        <p className="eyebrow mb-1">Branding</p>
        <h1 className="text-3xl font-bold tracking-tight">Appearance</h1>
        <p className="text-xs text-[var(--ink-muted)] mt-1">Customize the entry page hero and teasers.</p>
      </header>

      {saved && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm font-medium text-emerald-400">
          <CheckCircle2 size={15} /> Settings saved
        </div>
      )}

      <form action={updateAppearanceSettings} className="glass-card p-5 space-y-6">
        <div className="max-w-2xl space-y-5">
          <section>
            <h3 className="text-sm font-semibold border-b border-[var(--glass-border)] pb-2 mb-4">Hero Section</h3>
            <div className="space-y-3">
              <div><label className={labelCls}>Display Name</label><input type="text" name="heroTitle" required defaultValue={settings.heroTitle} className={inputCls} /></div>
              <div><label className={labelCls}>Tagline</label><input type="text" name="heroSubtitle" required defaultValue={settings.heroSubtitle} className={inputCls} /></div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold border-b border-[var(--glass-border)] pb-2 mb-4">Teaser Previews</h3>
            <div className="mb-4"><label className={labelCls}>Section Headline</label><input type="text" name="revealHeadline" required defaultValue={settings.revealHeadline} className={inputCls} /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              {previews.map(({ n, prefix, defaults }) => (
                <div key={n} className="rounded-lg border border-[var(--glass-border)] bg-[var(--bg-surface)] p-3 space-y-2">
                  <p className="text-[10px] font-semibold text-[var(--ink-faint)] uppercase tracking-wider">Preview {n}</p>
                  <input type="text" name={`${prefix}Title`} placeholder="Title" defaultValue={defaults?.title} required className={inputCls} />
                  <input type="text" name={`${prefix}Url`} placeholder="Media URL" defaultValue={defaults?.mediaUrl} required className={inputCls} />
                  <select name={`${prefix}Type`} defaultValue={defaults?.mediaType} className={inputCls}>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="flex justify-end pt-4 border-t border-[var(--glass-border)]">
          <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] text-[var(--bg-base)] px-5 py-2.5 text-xs font-semibold hover:brightness-110 transition-all">
            <Save size={14} /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
