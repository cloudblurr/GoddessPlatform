import { updateAppearanceSettings } from "@/app/actions";
import { readStore } from "@/lib/store";
import { CheckCircle2, Save } from "lucide-react";

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

  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-end border-b border-[#ffffff10] pb-6">
        <div>
          <h2 className="text-3xl font-heading text-white">Appearance Settings</h2>
          <p className="text-[#ffffff80] mt-1 text-sm max-w-xl">
            Customize the unauthenticated entry page. Change your hero messaging and teasers.
          </p>
        </div>
      </header>

      {saved && (
        <div className="bg-[#10b98110] border border-[#10b98130] text-[#10b981] p-4 rounded-xl flex items-center justify-center gap-3">
          <CheckCircle2 size={18} />
          <span className="font-medium text-sm">Appearance settings saved successfully.</span>
        </div>
      )}

      <form action={updateAppearanceSettings} className="space-y-8 bg-[#0a0a0a] border border-[#ffffff10] p-8 rounded-2xl relative shadow-2xl">
        <div className="space-y-6 max-w-3xl">
          <div>
            <h3 className="text-xl font-heading text-gold mb-4 relative z-10 border-b border-[#ffffff10] pb-2">Hero Section</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#ffffff60] uppercase tracking-wider mb-2">Display Name</label>
                <input
                  type="text"
                  name="heroTitle"
                  required
                  defaultValue={settings.heroTitle}
                  className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#ffffff60] uppercase tracking-wider mb-2">Tagline Subtitle</label>
                <input
                  type="text"
                  name="heroSubtitle"
                  required
                  defaultValue={settings.heroSubtitle}
                  className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <h3 className="text-xl font-heading text-gold mb-4 relative z-10 border-b border-[#ffffff10] pb-2">Teaser Previews</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#ffffff60] uppercase tracking-wider mb-2">Teaser Section Main Headline</label>
                <input
                  type="text"
                  name="revealHeadline"
                  required
                  defaultValue={settings.revealHeadline}
                  className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Preview 1 */}
              <div className="p-4 border border-[#333] rounded-xl bg-[#050505]">
                <h4 className="font-mono text-sm text-[#ffffff80] mb-3">Preview 1</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    name="p1Title"
                    placeholder="Title (e.g. Platinum Dripped Aura)"
                    defaultValue={settings.previews[0]?.title}
                    required
                    className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                  <input
                    type="text"
                    name="p1Url"
                    placeholder="Media URL (e.g. /logo-1.png)"
                    defaultValue={settings.previews[0]?.mediaUrl}
                    required
                    className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                  <select name="p1Type" defaultValue={settings.previews[0]?.mediaType} className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gold">
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              </div>

              {/* Preview 2 */}
              <div className="p-4 border border-[#333] rounded-xl bg-[#050505]">
                <h4 className="font-mono text-sm text-[#ffffff80] mb-3">Preview 2</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    name="p2Title"
                    placeholder="Title (e.g. Eternal Grace)"
                    defaultValue={settings.previews[1]?.title}
                    required
                    className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                  <input
                    type="text"
                    name="p2Url"
                    placeholder="Media URL (e.g. /logo-2.png)"
                    defaultValue={settings.previews[1]?.mediaUrl}
                    required
                    className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                  <select name="p2Type" defaultValue={settings.previews[1]?.mediaType} className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gold">
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              </div>

              {/* Preview 3 */}
              <div className="p-4 border border-[#333] rounded-xl bg-[#050505]">
                <h4 className="font-mono text-sm text-[#ffffff80] mb-3">Preview 3</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    name="p3Title"
                    placeholder="Title"
                    defaultValue={settings.previews[2]?.title}
                    required
                    className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                  <input
                    type="text"
                    name="p3Url"
                    placeholder="Media URL"
                    defaultValue={settings.previews[2]?.mediaUrl}
                    required
                    className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                  <select name="p3Type" defaultValue={settings.previews[2]?.mediaType} className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gold">
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              </div>

              {/* Preview 4 */}
              <div className="p-4 border border-[#333] rounded-xl bg-[#050505]">
                <h4 className="font-mono text-sm text-[#ffffff80] mb-3">Preview 4</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    name="p4Title"
                    placeholder="Title"
                    defaultValue={settings.previews[3]?.title}
                    required
                    className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                  <input
                    type="text"
                    name="p4Url"
                    placeholder="Media URL"
                    defaultValue={settings.previews[3]?.mediaUrl}
                    required
                    className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                  />
                  <select name="p4Type" defaultValue={settings.previews[3]?.mediaType} className="w-full bg-[#111] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gold">
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-[#ffffff10]">
          <button type="submit" className="bg-[#C9A84C] hover:bg-white text-black font-semibold rounded-lg px-6 py-3 flex items-center gap-2 transition-colors shadow-[0_0_20px_rgba(201,168,76,0.3)]">
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
