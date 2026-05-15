"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Cloud, Folder, Image as ImageIcon, Music, RefreshCcw, Video } from "lucide-react";
import { creatorStudioPublish } from "@/app/actions";
import FuturisticPlayer from "@/components/media/FuturisticPlayer";
import ContentPreview from "@/components/creator/ContentPreview";
import type { ComposerContentKind, MediaType, StoredPost, StoredVaultItem, MoodTag, AccessMode } from "@/lib/store";

type R2LibraryItem = {
  key: string;
  name: string;
  folder: string;
  isFolder: boolean;
  size: number;
  url: string;
  contentType?: string;
  lastModified?: string;
};

const DEFAULT_R2_PREFIX = "";

const kindOptions: Array<{ value: ComposerContentKind; label: string; subtitle: string }> = [
  { value: "feed", label: "Feed Post", subtitle: "Standard subscriber timeline content" },
  { value: "store", label: "Store Item", subtitle: "One-time purchasable drop" },
  { value: "unlockable", label: "Unlockable Post", subtitle: "PPV gated vault content" },
  { value: "poll", label: "Poll", subtitle: "Interactive voting post" },
  { value: "announcement", label: "Announcement", subtitle: "Pinned-style update" },
  { value: "livestream", label: "Livestream", subtitle: "Live room entry + replay card" },
];

function formatBytes(value: number) {
  if (!value) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const power = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const size = value / Math.pow(1024, power);
  return `${size.toFixed(power === 0 ? 0 : 1)} ${units[power]}`;
}

function mediaTypeFromMime(name?: string, contentType?: string): MediaType {
  const ext = name?.split(".").pop()?.toLowerCase() ?? "";
  const mimeType = contentType ?? "";
  if (mimeType.startsWith("video") || ["mp4", "mov", "webm", "mkv"].includes(ext)) return "video";
  if (mimeType.startsWith("audio") || ["mp3", "wav", "ogg", "m4a"].includes(ext)) return "audio";
  if (mimeType.startsWith("image") || ["jpg", "jpeg", "png", "gif", "webp", "avif"].includes(ext)) return "photo";
  return "bundle";
}

function toPlayerType(type: MediaType): "video" | "audio" | "image" {
  if (type === "audio") return "audio";
  if (type === "photo") return "image";
  return "video";
}

function mediaUrlForKey(key: string) {
  return `/api/media/${encodeURIComponent(key)}?mode=redirect`;
}

function defaultPriceFor(kind: ComposerContentKind, access: AccessMode) {
  return kind === "store" || kind === "unlockable" || access !== "subscription" ? 9.99 : 0;
}

export default function StudioComposer({
  initialFeedPosts,
  initialVaultItems,
  published,
  error,
}: {
  initialFeedPosts: StoredPost[];
  initialVaultItems: StoredVaultItem[];
  published: boolean;
  error?: string;
}) {
  const [contentKind, setContentKind] = useState<ComposerContentKind>("feed");
  const [access, setAccess] = useState<"subscription" | "ppv" | "one-time">("subscription");
  const [r2Configured, setR2Configured] = useState(true);
  const [r2Loading, setR2Loading] = useState(false);
  const [r2Error, setR2Error] = useState<string | null>(null);
  const [r2Prefix, setR2Prefix] = useState(DEFAULT_R2_PREFIX);
  const [r2Items, setR2Items] = useState<R2LibraryItem[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<R2LibraryItem | null>(null);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState("");
  
  // Form state for live preview
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formMood, setFormMood] = useState<MoodTag>("Personal");
  const [formPrice, setFormPrice] = useState(0);
  const [formPollOptions, setFormPollOptions] = useState("");

  const selectedMediaType = useMemo(() => mediaTypeFromMime(selectedAsset?.name, selectedAsset?.contentType), [selectedAsset?.name, selectedAsset?.contentType]);
  const isVaultType = contentKind === "store" || contentKind === "unlockable";
  const effectiveAccess = isVaultType ? (contentKind === "store" ? "one-time" : "ppv") : access;

  const loadR2Files = useCallback(async (prefix: string = DEFAULT_R2_PREFIX) => {
    setR2Loading(true);
    setR2Error(null);
    try {
      const res = await fetch(`/api/r2/files?prefix=${encodeURIComponent(prefix)}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "R2 list failed");
      setR2Configured(data.configured !== false);
      setR2Prefix(data.prefix || prefix);
      setR2Items(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "R2 list failed";
      setR2Error(message);
    } finally {
      setR2Loading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadR2Files(DEFAULT_R2_PREFIX);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadR2Files]);

  const chooseAsset = (item: R2LibraryItem) => {
    if (item.isFolder) {
      void loadR2Files(item.key);
      return;
    }

    setSelectedAsset(item);
    setSelectedMediaUrl(mediaUrlForKey(item.key));
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h2 className="text-sm font-mono tracking-[0.2em] text-[#C9A84C] uppercase mb-2">Creator Studio</h2>
          <h1 className="text-4xl font-heading font-medium tracking-tight">Compose & Deliver</h1>
        </div>
      </header>

      {published && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 flex items-center gap-2">
          <CheckCircle2 size={16} /> Published successfully.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error === "poll-options" ? "Poll posts require at least two options." : "Title and description are required."}
        </div>
      )}

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#C9A84C]">R2 Media Library</p>
            <p className="text-sm text-white/60 mt-1">Choose an uploaded file from Storage, then attach it into the composer.</p>
          </div>

          <button
            type="button"
            onClick={() => loadR2Files(r2Prefix || DEFAULT_R2_PREFIX)}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
          >
            <RefreshCcw size={14} className={r2Loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        <p className="text-xs text-white/50">Prefix: {r2Prefix || "creator root"}</p>
        {r2Error && <p className="text-sm text-red-300">{r2Error}</p>}

        {!r2Configured ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
            R2 is not configured yet. Add credentials on the Storage page before attaching files.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-[320px] overflow-auto pr-1">
            {r2Loading ? (
              <div className="text-sm text-white/60">Loading files...</div>
            ) : r2Items.length === 0 ? (
              <div className="text-sm text-white/60">No files in this folder yet. Upload in Storage, then refresh.</div>
            ) : (
              r2Items.map((item) => (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => {
                    chooseAsset(item);
                  }}
                  className={`text-left rounded-xl border px-3 py-2 transition ${
                    selectedAsset?.key === item.key
                      ? "border-[#C9A84C]/60 bg-[#C9A84C]/10"
                      : "border-white/10 bg-black/20 hover:border-white/25"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                      {!item.isFolder && mediaTypeFromMime(item.name, item.contentType) === "photo" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={mediaUrlForKey(item.key)} alt={item.name} className="w-full h-full object-cover" />
                      ) : item.isFolder ? (
                        <Folder size={18} className="text-[#C9A84C]" />
                      ) : mediaTypeFromMime(item.name, item.contentType) === "video" ? (
                        <Video size={18} className="text-white/70" />
                      ) : mediaTypeFromMime(item.name, item.contentType) === "audio" ? (
                        <Music size={18} className="text-white/70" />
                      ) : (
                        <ImageIcon size={18} className="text-white/70" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-white/50 truncate">{item.isFolder ? item.key : formatBytes(item.size)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-black/20 p-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-medium">Content Composer</h3>
          {selectedAsset && (
            <span className="inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/40 bg-[#C9A84C]/10 px-3 py-1 text-xs text-[#C9A84C]">
              <Cloud size={14} /> Linked: {selectedAsset.name}
            </span>
          )}
        </div>

        {selectedAsset && selectedMediaUrl && (
          <div className="grid lg:grid-cols-[280px_1fr] gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div>
              <FuturisticPlayer
                type={toPlayerType(selectedMediaType)}
                src={selectedMediaUrl}
                isLocked={false}
                title={selectedAsset.name}
              />
            </div>
            <div className="text-sm text-white/70 space-y-2">
              <p><span className="text-white/40">Asset:</span> {selectedAsset.name}</p>
              <p><span className="text-white/40">Storage key:</span> {selectedAsset.key}</p>
              <p><span className="text-white/40">Type:</span> {selectedMediaType}</p>
              <p className="text-xs text-white/45">This authenticated media URL is attached to your post and can be delivered to FanFront or vault-only destinations.</p>
            </div>
          </div>
        )}

        {/* Live Preview */}
        {(formTitle || formDescription || selectedMediaUrl) && (
          <ContentPreview
            title={formTitle}
            description={formDescription}
            mood={formMood}
            access={effectiveAccess}
            priceCents={formPrice > 0 ? Math.round(formPrice * 100) : undefined}
            mediaUrl={selectedMediaUrl}
            thumbnailUrl={selectedMediaType === "photo" ? selectedMediaUrl : undefined}
            mediaType={selectedAsset ? selectedMediaType : "text"}
            contentKind={contentKind}
            pollOptions={contentKind === "poll" ? formPollOptions.split(/\r?\n/g).map(l => l.trim()).filter(Boolean) : undefined}
          />
        )}

        <form action={creatorStudioPublish} className="space-y-4">
          <input type="hidden" name="mediaUrl" value={selectedMediaUrl} />
          <input type="hidden" name="mediaType" value={selectedAsset ? selectedMediaType : "text"} />
          <input type="hidden" name="storageKey" value={selectedAsset?.key || ""} />
          <input type="hidden" name="thumbnailUrl" value={selectedMediaType === "photo" ? selectedMediaUrl : ""} />

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Content Type</label>
              <select
                name="contentKind"
                value={contentKind}
                onChange={(e) => {
                  const nextKind = e.target.value as ComposerContentKind;
                  setContentKind(nextKind);
                  if (nextKind === "poll" || nextKind === "announcement" || nextKind === "livestream") {
                    setAccess("subscription");
                    setFormPrice(defaultPriceFor(nextKind, "subscription"));
                  } else {
                    const nextAccess = nextKind === "store" ? "one-time" : nextKind === "unlockable" ? "ppv" : access;
                    setFormPrice(defaultPriceFor(nextKind, nextAccess));
                  }
                }}
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm"
              >
                {kindOptions.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-white/45">{kindOptions.find((k) => k.value === contentKind)?.subtitle}</p>
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Delivery Target</label>
              <select
                name="deliveryTarget"
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm"
                defaultValue="fanfront"
              >
                <option value="fanfront">FanFront (subscriber-facing)</option>
                <option value="vault-only">Vault Only (stored/scheduled)</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Title</label>
              <input 
                name="title" 
                required 
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm" 
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Mood</label>
              <select 
                name="mood" 
                value={formMood}
                onChange={(e) => setFormMood(e.target.value as MoodTag)}
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm"
              >
                <option value="Exclusive">Exclusive</option>
                <option value="BTS">BTS</option>
                <option value="Personal">Personal</option>
                <option value="PPV">PPV</option>
                <option value="Drop">Drop</option>
                <option value="Live">Live</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-white/50">Description</label>
            <textarea
              name="description"
              rows={3}
              required={contentKind !== "poll"}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Access</label>
              <select
                name="access"
                value={effectiveAccess}
                onChange={(e) => {
                  const nextAccess = e.target.value as "subscription" | "ppv" | "one-time";
                  setAccess(nextAccess);
                  setFormPrice(defaultPriceFor(contentKind, nextAccess));
                }}
                disabled={isVaultType}
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm disabled:opacity-60"
              >
                <option value="subscription">Subscription</option>
                <option value="ppv">PPV</option>
                <option value="one-time">One-time</option>
              </select>
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Price (USD)</label>
              <input
                name="price"
                type="number"
                min={0}
                step="0.01"
                value={formPrice}
                onChange={(e) => setFormPrice(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Schedule (optional)</label>
              <input
                type="datetime-local"
                name="scheduledFor"
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm"
              />
            </div>
          </div>

          {contentKind === "poll" && (
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Poll Options (one per line)</label>
              <textarea
                name="pollOptions"
                rows={4}
                placeholder={"Option A\nOption B\nOption C"}
                value={formPollOptions}
                onChange={(e) => setFormPollOptions(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm"
              />
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="rounded-full border border-[#C9A84C]/50 bg-[#C9A84C]/20 px-5 py-2.5 text-sm font-medium text-[#E7D19B] hover:bg-[#C9A84C]/30"
            >
              Publish from Studio
            </button>
            <p className="mt-2 text-xs text-white/45">Scheduled items attempt enqueue to your Cloudflare Worker when `CLOUDFLARE_WORKER_SCHEDULER_URL` is configured.</p>
          </div>
        </form>
      </section>

      <section className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <h4 className="text-sm uppercase tracking-[0.2em] text-[#C9A84C] mb-3">Recent Feed Posts</h4>
          <div className="space-y-3">
            {initialFeedPosts.length === 0 ? (
              <p className="text-sm text-white/60">No feed posts yet.</p>
            ) : (
              initialFeedPosts.map((post) => (
                <article key={post.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-sm font-medium">{post.title}</p>
                  <p className="mt-1 text-xs text-white/55 line-clamp-2">{post.description}</p>
                  <p className="mt-2 text-[11px] text-white/45">{post.contentKind || "feed"} · {post.deliveryTarget || "fanfront"}</p>
                </article>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <h4 className="text-sm uppercase tracking-[0.2em] text-[#C9A84C] mb-3">Recent Vault Items</h4>
          <div className="space-y-3">
            {initialVaultItems.length === 0 ? (
              <p className="text-sm text-white/60">No vault items yet.</p>
            ) : (
              initialVaultItems.map((item) => (
                <article key={item.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-1 text-xs text-white/55 line-clamp-2">{item.description}</p>
                  <p className="mt-2 text-[11px] text-white/45">{item.contentKind || "store"} · {item.status} · {item.deliveryTarget || "fanfront"}</p>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
