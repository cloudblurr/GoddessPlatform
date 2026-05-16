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

  const inputCls = "mt-1 w-full rounded-lg border border-[var(--glass-border)] bg-[var(--bg-raised)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-[var(--accent)]/40 transition-colors";
  const labelCls = "text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]";

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex items-end justify-between border-b border-[var(--glass-border)] pb-5">
        <div>
          <p className="eyebrow mb-1">Creator Studio</p>
          <h1 className="text-3xl font-bold tracking-tight">Post Engine</h1>
        </div>
      </header>

      {published && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 flex items-center gap-2">
          <CheckCircle2 size={15} /> Published successfully.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error === "poll-options" ? "Poll posts require at least two options." : "Title and description are required."}
        </div>
      )}

      {/* R2 Media Picker */}
      <section className="glass-card p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">R2 Media Library</p>
            <p className="text-xs text-[var(--ink-muted)] mt-1">Select media from Cloud Storage to attach.</p>
          </div>
          <button
            type="button"
            onClick={() => loadR2Files(r2Prefix || DEFAULT_R2_PREFIX)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] px-3 py-1.5 text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] hover:border-[var(--accent)]/30 transition-colors"
          >
            <RefreshCcw size={12} className={r2Loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        <p className="text-[10px] text-[var(--ink-faint)]">Prefix: {r2Prefix || "root"}</p>
        {r2Error && <p className="text-xs text-red-400">{r2Error}</p>}

        {!r2Configured ? (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300">
            R2 not configured. Add credentials on the Storage page first.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 max-h-64 overflow-auto">
            {r2Loading ? (
              <p className="text-xs text-[var(--ink-muted)]">Loading…</p>
            ) : r2Items.length === 0 ? (
              <p className="text-xs text-[var(--ink-muted)]">No files yet. Upload in Storage.</p>
            ) : (
              r2Items.map((item) => (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => chooseAsset(item)}
                  className={`text-left rounded-lg border px-3 py-2 transition-colors ${
                    selectedAsset?.key === item.key
                      ? "border-[var(--accent)]/50 bg-[var(--accent-dim)]"
                      : "border-[var(--glass-border)] bg-[var(--bg-raised)] hover:border-[var(--accent)]/20"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md border border-[var(--glass-border)] bg-[var(--bg-overlay)] flex items-center justify-center overflow-hidden shrink-0">
                      {!item.isFolder && mediaTypeFromMime(item.name, item.contentType) === "photo" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={mediaUrlForKey(item.key)} alt={item.name} className="w-full h-full object-cover" />
                      ) : item.isFolder ? (
                        <Folder size={14} className="text-[var(--accent)]" />
                      ) : mediaTypeFromMime(item.name, item.contentType) === "video" ? (
                        <Video size={14} className="text-[var(--ink-muted)]" />
                      ) : mediaTypeFromMime(item.name, item.contentType) === "audio" ? (
                        <Music size={14} className="text-[var(--ink-muted)]" />
                      ) : (
                        <ImageIcon size={14} className="text-[var(--ink-muted)]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{item.name}</p>
                      <p className="text-[10px] text-[var(--ink-faint)] truncate">{item.isFolder ? item.key : formatBytes(item.size)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </section>

      {/* Composer */}
      <section className="glass-card p-5 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">Content Composer</h3>
          {selectedAsset && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent-dim)] px-2.5 py-1 text-[10px] font-medium text-[var(--accent-bright)]">
              <Cloud size={12} /> {selectedAsset.name}
            </span>
          )}
        </div>

        {selectedAsset && selectedMediaUrl && (
          <div className="grid lg:grid-cols-[240px_1fr] gap-4 rounded-lg border border-[var(--glass-border)] bg-[var(--bg-raised)] p-3">
            <div>
              <FuturisticPlayer
                type={toPlayerType(selectedMediaType)}
                src={selectedMediaUrl}
                isLocked={false}
                title={selectedAsset.name}
              />
            </div>
            <div className="text-xs text-[var(--ink-muted)] space-y-1.5">
              <p><span className="text-[var(--ink-faint)]">Asset:</span> {selectedAsset.name}</p>
              <p><span className="text-[var(--ink-faint)]">Key:</span> {selectedAsset.key}</p>
              <p><span className="text-[var(--ink-faint)]">Type:</span> {selectedMediaType}</p>
            </div>
          </div>
        )}

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
              <label className={labelCls}>Content Type</label>
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
                className={inputCls}
              >
                {kindOptions.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
              <p className="mt-1 text-[10px] text-[var(--ink-faint)]">{kindOptions.find((k) => k.value === contentKind)?.subtitle}</p>
            </div>
            <div>
              <label className={labelCls}>Delivery Target</label>
              <select name="deliveryTarget" className={inputCls} defaultValue="fanfront">
                <option value="fanfront">FanFront (subscriber)</option>
                <option value="vault-only">Vault Only (stored)</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Title</label>
              <input name="title" required value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Mood</label>
              <select name="mood" value={formMood} onChange={(e) => setFormMood(e.target.value as MoodTag)} className={inputCls}>
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
            <label className={labelCls}>Description</label>
            <textarea name="description" rows={3} required={contentKind !== "poll"} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className={inputCls} />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Access</label>
              <select
                name="access"
                value={effectiveAccess}
                onChange={(e) => {
                  const nextAccess = e.target.value as "subscription" | "ppv" | "one-time";
                  setAccess(nextAccess);
                  setFormPrice(defaultPriceFor(contentKind, nextAccess));
                }}
                disabled={isVaultType}
                className={`${inputCls} disabled:opacity-50`}
              >
                <option value="subscription">Subscription</option>
                <option value="ppv">PPV</option>
                <option value="one-time">One-time</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Price (USD)</label>
              <input name="price" type="number" min={0} step="0.01" value={formPrice} onChange={(e) => setFormPrice(Number(e.target.value))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Schedule (optional)</label>
              <input type="datetime-local" name="scheduledFor" className={inputCls} />
            </div>
          </div>

          {contentKind === "poll" && (
            <div>
              <label className={labelCls}>Poll Options (one per line)</label>
              <textarea name="pollOptions" rows={4} placeholder={"Option A\nOption B\nOption C"} value={formPollOptions} onChange={(e) => setFormPollOptions(e.target.value)} className={inputCls} />
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] text-[var(--bg-base)] px-5 py-2.5 text-sm font-semibold hover:brightness-110 transition-all shadow-[0_2px_16px_rgba(167,139,250,0.2)]"
            >
              Publish from Studio
            </button>
            <p className="mt-2 text-[10px] text-[var(--ink-faint)]">Scheduled items enqueue to your Cloudflare Worker when configured.</p>
          </div>
        </form>
      </section>

      {/* Recent items */}
      <section className="grid lg:grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <h4 className="eyebrow mb-3">Recent Feed Posts</h4>
          <div className="space-y-2">
            {initialFeedPosts.length === 0 ? (
              <p className="text-xs text-[var(--ink-muted)]">No feed posts yet.</p>
            ) : (
              initialFeedPosts.map((post) => (
                <article key={post.id} className="rounded-lg border border-[var(--glass-border)] bg-[var(--bg-raised)] p-3">
                  <p className="text-sm font-medium">{post.title}</p>
                  <p className="mt-1 text-xs text-[var(--ink-muted)] line-clamp-2">{post.description}</p>
                  <p className="mt-1.5 text-[10px] text-[var(--ink-faint)]">{post.contentKind || "feed"} · {post.deliveryTarget || "fanfront"}</p>
                </article>
              ))
            )}
          </div>
        </div>
        <div className="glass-card p-4">
          <h4 className="eyebrow mb-3">Recent Vault Items</h4>
          <div className="space-y-2">
            {initialVaultItems.length === 0 ? (
              <p className="text-xs text-[var(--ink-muted)]">No vault items yet.</p>
            ) : (
              initialVaultItems.map((item) => (
                <article key={item.id} className="rounded-lg border border-[var(--glass-border)] bg-[var(--bg-raised)] p-3">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-1 text-xs text-[var(--ink-muted)] line-clamp-2">{item.description}</p>
                  <p className="mt-1.5 text-[10px] text-[var(--ink-faint)]">{item.contentKind || "store"} · {item.status} · {item.deliveryTarget || "fanfront"}</p>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
