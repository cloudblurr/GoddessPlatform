"use client";

import { useState } from "react";
import { Eye, Smartphone, Monitor, Tablet } from "lucide-react";
import FuturisticPlayer from "@/components/media/FuturisticPlayer";
import type { MediaType, MoodTag, AccessMode } from "@/lib/store";

type PreviewDevice = "desktop" | "tablet" | "mobile";

type ContentPreviewProps = {
  title: string;
  description: string;
  mood: MoodTag;
  access: AccessMode;
  priceCents?: number;
  mediaUrl?: string;
  thumbnailUrl?: string;
  mediaType: MediaType;
  contentKind: string;
  pollOptions?: string[];
};

export default function ContentPreview({
  title,
  description,
  mood,
  access,
  priceCents,
  mediaUrl,
  thumbnailUrl,
  mediaType,
  contentKind,
  pollOptions,
}: ContentPreviewProps) {
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [viewMode, setViewMode] = useState<"feed" | "store">(
    contentKind === "store" || contentKind === "unlockable" ? "store" : "feed"
  );

  const deviceClasses = {
    desktop: "max-w-4xl",
    tablet: "max-w-2xl",
    mobile: "max-w-sm",
  };

  const priceLabel = priceCents
    ? `$${(priceCents / 100).toFixed(2)}`
    : access === "subscription"
    ? "Included"
    : "Free";

  const toPlayerType = (type: MediaType): "video" | "audio" | "image" => {
    if (type === "audio") return "audio";
    if (type === "photo") return "image";
    return "video";
  };

  return (
    <div className="rounded-2xl border border-[#C9A84C]/30 bg-gradient-to-br from-[#C9A84C]/5 to-transparent p-6 space-y-4">
      {/* Preview Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye size={18} className="text-[#C9A84C]" />
          <h3 className="text-lg font-medium text-white">Live Preview</h3>
          <span className="text-xs text-white/50">How fans will see this</span>
        </div>

        {/* Device Selector */}
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 p-1">
          <button
            type="button"
            onClick={() => setDevice("desktop")}
            className={`rounded p-1.5 transition-colors ${
              device === "desktop" ? "bg-[#C9A84C] text-black" : "text-white/50 hover:text-white"
            }`}
            title="Desktop view"
          >
            <Monitor size={16} />
          </button>
          <button
            type="button"
            onClick={() => setDevice("tablet")}
            className={`rounded p-1.5 transition-colors ${
              device === "tablet" ? "bg-[#C9A84C] text-black" : "text-white/50 hover:text-white"
            }`}
            title="Tablet view"
          >
            <Tablet size={16} />
          </button>
          <button
            type="button"
            onClick={() => setDevice("mobile")}
            className={`rounded p-1.5 transition-colors ${
              device === "mobile" ? "bg-[#C9A84C] text-black" : "text-white/50 hover:text-white"
            }`}
            title="Mobile view"
          >
            <Smartphone size={16} />
          </button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setViewMode("feed")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            viewMode === "feed"
              ? "bg-[#C9A84C] text-black"
              : "bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          Feed View
        </button>
        <button
          type="button"
          onClick={() => setViewMode("store")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            viewMode === "store"
              ? "bg-[#C9A84C] text-black"
              : "bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          Store View
        </button>
      </div>

      {/* Preview Container */}
      <div className="flex justify-center">
        <div
          className={`${deviceClasses[device]} w-full transition-all duration-300 rounded-xl border border-white/10 bg-[#0a0a0a] p-4 shadow-2xl`}
        >
          {viewMode === "feed" ? (
            // Feed Post Preview
            <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-medium text-white">{title || "Untitled Post"}</h2>
                <span className="rounded-full border border-[#C9A84C]/40 px-2.5 py-1 text-xs text-[#C9A84C] whitespace-nowrap">
                  {priceLabel}
                </span>
              </div>

              <p className="text-sm text-white/70">{description || "No description provided."}</p>

              {contentKind === "poll" && pollOptions && pollOptions.length > 0 ? (
                <div className="space-y-2">
                  {pollOptions.map((option, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-sm text-white/80"
                    >
                      {option}
                    </div>
                  ))}
                </div>
              ) : mediaUrl ? (
                <div className="mt-3">
                  {mediaType === "photo" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumbnailUrl || mediaUrl}
                      alt={title}
                      className="aspect-video w-full rounded-xl border border-white/10 bg-black object-cover"
                    />
                  ) : mediaType === "audio" ? (
                    <audio src={mediaUrl} controls preload="metadata" className="w-full" />
                  ) : (
                    <video
                      src={mediaUrl}
                      controls
                      preload="metadata"
                      poster={thumbnailUrl}
                      className="aspect-video w-full rounded-xl border border-white/10 bg-black"
                    />
                  )}
                </div>
              ) : (
                <div className="mt-3 aspect-video w-full rounded-xl border border-dashed border-white/20 bg-black/50 flex items-center justify-center">
                  <p className="text-sm text-white/40">No media attached</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-xs text-white/50">{mood}</span>
                <span className="text-xs text-white/50">Just now</span>
              </div>
            </article>
          ) : (
            // Store Item Preview
            <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
              <h2 className="text-lg font-medium text-white">{title || "Untitled Item"}</h2>
              <p className="text-sm text-white/65">{description || "No description provided."}</p>
              <p className="text-sm text-[#C9A84C] font-medium">{priceLabel}</p>

              {mediaUrl ? (
                <div className="mt-3">
                  <FuturisticPlayer
                    type={toPlayerType(mediaType)}
                    src={mediaType === "photo" ? thumbnailUrl || mediaUrl : mediaUrl}
                    title={title}
                    isLocked={access !== "subscription"}
                  />
                </div>
              ) : (
                <div className="mt-3 aspect-video w-full rounded-xl border border-dashed border-white/20 bg-black/50 flex items-center justify-center">
                  <p className="text-sm text-white/40">No media attached</p>
                </div>
              )}

              <button
                type="button"
                disabled
                className="w-full rounded-lg bg-[#C9A84C] px-4 py-2 text-sm font-medium text-black opacity-50 cursor-not-allowed"
              >
                {access === "subscription" ? "Included in Subscription" : "Unlock Now"}
              </button>
            </article>
          )}
        </div>
      </div>

      <p className="text-xs text-center text-white/40">
        This is a live preview. Changes to the form will update this view in real-time.
      </p>
    </div>
  );
}
