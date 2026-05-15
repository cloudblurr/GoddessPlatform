"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  UploadCloud, Trash2, Video, Image as ImageIcon, Music,
  FileText, Folder, Link2, Download, RefreshCcw, AlertCircle,
  CheckCircle2, Loader2, X, Eye, Copy, ChevronRight, HardDrive,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type R2File = {
  key: string;
  name: string;
  size: number;
  lastModified: string;
  url: string;
  folder: string;
  isFolder: boolean;
  contentType?: string;
};

type UploadState = {
  id: string;
  file: File;
  progress: number; // 0-100
  status: "pending" | "uploading" | "done" | "error";
  key?: string;
  url?: string;
  error?: string;
};

type FilterTab = "all" | "video" | "image" | "audio" | "other";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function fileCategory(name: string, contentType?: string): FilterTab {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const mime = contentType ?? "";
  if (mime.startsWith("video") || ["mp4", "mov", "webm", "mkv", "avi"].includes(ext)) return "video";
  if (mime.startsWith("image") || ["jpg", "jpeg", "png", "gif", "webp", "avif"].includes(ext)) return "image";
  if (mime.startsWith("audio") || ["mp3", "wav", "ogg", "m4a", "flac"].includes(ext)) return "audio";
  return "other";
}

function FileIcon({ name, contentType, size = 18 }: { name: string; contentType?: string; size?: number }) {
  const cat = fileCategory(name, contentType);
  if (cat === "video") return <Video size={size} className="text-purple-400" />;
  if (cat === "image") return <ImageIcon size={size} className="text-blue-400" />;
  if (cat === "audio") return <Music size={size} className="text-green-400" />;
  return <FileText size={size} className="text-white/50" />;
}

function mediaUrlForKey(key: string) {
  return `/api/media/${encodeURIComponent(key)}?mode=redirect`;
}

const TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "video", label: "Video" },
  { id: "image", label: "Images" },
  { id: "audio", label: "Audio" },
  { id: "other", label: "Other" },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function R2VaultManager({ configured }: { configured: boolean }) {
  const [files, setFiles] = useState<R2File[]>([]);
  const [loading, setLoading] = useState(false);
  const [prefix, setPrefix] = useState("");
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [dragActive, setDragActive] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [previewFile, setPreviewFile] = useState<R2File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Load files ────────────────────────────────────────────────────────────
  const loadFiles = useCallback(async (p = prefix) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/r2/files?prefix=${encodeURIComponent(p)}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setFiles(data.items ?? []);
      setPrefix(data.prefix ?? p);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Load failed", "err");
    } finally {
      setLoading(false);
    }
  }, [prefix, showToast]);

  useEffect(() => {
    if (!configured) return;
    const timer = window.setTimeout(() => {
      void loadFiles("");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [configured]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Upload a single file via presigned PUT ────────────────────────────────
  const uploadFile = useCallback(async (file: File) => {
    const id = crypto.randomUUID();
    const uploadEntry: UploadState = { id, file, progress: 0, status: "pending" };
    setUploads(prev => [uploadEntry, ...prev]);

    try {
      // Upload via server endpoint (no CORS issues)
      setUploads(prev => prev.map(u => u.id === id ? { ...u, status: "uploading", progress: 10 } : u));
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "uploads");

      const xhr = new XMLHttpRequest();
      await new Promise<void>((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round(10 + (e.loaded / e.total) * 85);
            setUploads(prev => prev.map(u => u.id === id ? { ...u, progress: pct } : u));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed: HTTP ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.open("POST", "/api/r2/upload");
        xhr.send(formData);
      });

      const result = JSON.parse(xhr.responseText);
      if (!result.key) throw new Error("No key returned from upload");

      setUploads(prev => prev.map(u =>
        u.id === id ? { ...u, status: "done", progress: 100, key: result.key, url: result.url ?? result.mediaUrl } : u
      ));
      showToast(`${file.name} uploaded`);
      // Refresh file list
      await loadFiles(prefix);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setUploads(prev => prev.map(u => u.id === id ? { ...u, status: "error", error: msg } : u));
      showToast(msg, "err");
    }
  }, [prefix, loadFiles, showToast]);

  // ── Handle file input / drop ──────────────────────────────────────────────
  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    Array.from(fileList).forEach(uploadFile);
  }, [uploadFile]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragActive(true); };
  const onDragLeave = () => setDragActive(false);

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteFile = async (key: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/r2/files/${encodeURIComponent(key)}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      setFiles(prev => prev.filter(f => f.key !== key));
      showToast(`${name} deleted`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete failed", "err");
    }
  };

  // ── Copy URL ──────────────────────────────────────────────────────────────
  const copyUrl = async (file: R2File) => {
    try {
      // Get a fresh presigned URL
      const res = await fetch(`/api/r2/files/${encodeURIComponent(file.key)}`);
      const data = await res.json();
      const url = data.url ?? mediaUrlForKey(file.key);
      await navigator.clipboard.writeText(url);
      showToast("URL copied to clipboard");
    } catch {
      showToast("Copy failed", "err");
    }
  };

  // ── Download ──────────────────────────────────────────────────────────────
  const downloadFile = (key: string) => {
    window.open(mediaUrlForKey(key), "_blank", "noopener");
  };

  // ── Filtered files ────────────────────────────────────────────────────────
  const filtered = files.filter(f => {
    if (f.isFolder) return true;
    if (filter === "all") return true;
    return fileCategory(f.name, f.contentType) === filter;
  });

  // ── Storage stats ─────────────────────────────────────────────────────────
  const totalSize = files.filter(f => !f.isFolder).reduce((s, f) => s + f.size, 0);
  const fileCount = files.filter(f => !f.isFolder).length;

  // ─── Not configured banner ────────────────────────────────────────────────
  if (!configured) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-8 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <AlertCircle size={24} className="text-amber-400 shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-300">R2 Credentials Required</h3>
            <p className="text-sm text-white/60 mt-1">
              Add your Cloudflare R2 API credentials to <code className="text-amber-300">.env</code> to enable file storage.
            </p>
          </div>
        </div>
        <div className="rounded-xl bg-black/40 border border-white/10 p-4 font-mono text-xs text-white/70 space-y-1">
          <p className="text-white/40"># Add these to your .env file</p>
          <p>R2_ACCESS_KEY_ID=<span className="text-amber-300">your_access_key</span></p>
          <p>R2_SECRET_ACCESS_KEY=<span className="text-amber-300">your_secret_key</span></p>
          <p>R2_BUCKET_NAME=<span className="text-amber-300">xanna-media</span></p>
          <p>R2_ENDPOINT=<span className="text-amber-300">https://&lt;account_id&gt;.r2.cloudflarestorage.com</span></p>
        </div>
        <p className="text-xs text-white/40">
          Get credentials: Cloudflare Dashboard → R2 → Manage R2 API Tokens → Create Token (Object Read &amp; Write on xanna-media)
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-xl border transition-all
          ${toast.type === "ok"
            ? "bg-emerald-950 border-emerald-500/40 text-emerald-300"
            : "bg-red-950 border-red-500/40 text-red-300"}`}>
          {toast.type === "ok" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5">
          <HardDrive size={16} className="text-[#C9A84C]" />
          <span className="text-sm text-white/70">{fileCount} files · {formatBytes(totalSize)}</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-2.5">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span className="text-sm text-emerald-300">R2 Connected · xanna-media</span>
        </div>
        <button
          onClick={() => loadFiles(prefix)}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── Upload zone ───────────────────────────────────────────────────── */}
      <div
        className={`relative rounded-2xl border-2 border-dashed transition-all p-10 flex flex-col items-center gap-4 cursor-pointer
          ${dragActive ? "border-[#C9A84C] bg-[#C9A84C]/10" : "border-white/15 hover:border-[#C9A84C]/60 bg-white/[0.02]"}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="absolute inset-0 h-full w-full opacity-0 pointer-events-none"
          onChange={e => handleFiles(e.target.files)}
        />
        <UploadCloud size={40} className="text-[#C9A84C]" />
        <div className="text-center">
          <p className="font-mono uppercase text-sm tracking-widest text-white/70">
            Drop files or click to upload
          </p>
          <p className="text-xs text-white/40 mt-1">
            Video, images, audio — uploaded directly to Cloudflare R2
          </p>
        </div>
        <button
          type="button"
          className="mt-3 rounded-full border border-[#C9A84C]/50 bg-[#C9A84C]/10 px-4 py-2 text-sm font-medium text-[#C9A84C] transition hover:bg-[#C9A84C]/15"
          onClick={e => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          Select files
        </button>
      </div>

      {/* ── Active uploads ────────────────────────────────────────────────── */}
      {uploads.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono uppercase tracking-widest text-white/40">Uploads</p>
            <button
              onClick={() => setUploads(prev => prev.filter(u => u.status !== "done" && u.status !== "error"))}
              className="text-xs text-white/30 hover:text-white/60"
            >
              Clear done
            </button>
          </div>
          {uploads.map(u => (
            <div key={u.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <FileIcon name={u.file.name} size={16} />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{u.file.name}</p>
                <div className="mt-1.5 h-1 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300
                      ${u.status === "done" ? "bg-emerald-500" : u.status === "error" ? "bg-red-500" : "bg-[#C9A84C]"}`}
                    style={{ width: `${u.progress}%` }}
                  />
                </div>
                {u.error && <p className="text-xs text-red-400 mt-1">{u.error}</p>}
              </div>
              <div className="shrink-0 text-xs text-white/40">
                {u.status === "uploading" && <Loader2 size={14} className="animate-spin text-[#C9A84C]" />}
                {u.status === "done" && <CheckCircle2 size={14} className="text-emerald-400" />}
                {u.status === "error" && <AlertCircle size={14} className="text-red-400" />}
              </div>
              <button onClick={() => setUploads(prev => prev.filter(x => x.id !== u.id))} className="text-white/20 hover:text-white/60">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Filter tabs ───────────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
              ${filter === tab.id ? "bg-[#C9A84C] text-black" : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      {prefix && (
        <div className="flex items-center gap-1 text-xs text-white/40 font-mono">
          <button onClick={() => loadFiles("")} className="hover:text-white/70">root</button>
          {prefix.split("/").filter(Boolean).map((seg, i, arr) => (
            <span key={i} className="flex items-center gap-1">
              <ChevronRight size={12} />
              <button
                onClick={() => loadFiles(arr.slice(0, i + 1).join("/") + "/")}
                className="hover:text-white/70"
              >
                {seg}
              </button>
            </span>
          ))}
        </div>
      )}

      {/* ── File grid ─────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center gap-3 text-white/40 py-8">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading files…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <UploadCloud size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No files yet. Drop something above to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(file => (
            <div
              key={file.key}
              className="group flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-3 hover:border-white/20 transition-colors"
            >
              {/* Icon / thumbnail */}
              <div className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                {file.isFolder ? (
                  <Folder size={18} className="text-[#C9A84C]" />
                ) : fileCategory(file.name) === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrlForKey(file.key)} alt={file.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <FileIcon name={file.name} contentType={file.contentType} />
                )}
              </div>

              {/* Info */}
              <button
                className="flex-1 min-w-0 text-left rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A84C]"
                onClick={() => file.isFolder ? loadFiles(file.key) : setPreviewFile(file)}
              >
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-white/40 truncate">
                  {file.isFolder ? "Folder" : formatBytes(file.size)}
                  {!file.isFolder && file.lastModified && (
                    <> · {new Date(file.lastModified).toLocaleDateString()}</>
                  )}
                </p>
              </button>

              {/* Actions */}
              {!file.isFolder && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    title="Preview"
                    onClick={() => setPreviewFile(file)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white"
                  >
                    <Eye size={13} />
                  </button>
                  <button
                    title="Copy URL"
                    onClick={() => copyUrl(file)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white"
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    title="Download"
                    onClick={() => downloadFile(file.key)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white"
                  >
                    <Download size={13} />
                  </button>
                  <button
                    title="Delete"
                    onClick={() => deleteFile(file.key, file.name)}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Preview modal ─────────────────────────────────────────────────── */}
      {previewFile && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewFile(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X size={20} />
            </button>
            <h3 className="font-medium mb-4 pr-8 truncate">{previewFile.name}</h3>

            {fileCategory(previewFile.name) === "image" && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrlForKey(previewFile.key)} alt={previewFile.name} className="w-full rounded-xl" />
            )}
            {fileCategory(previewFile.name) === "video" && (
              <video src={mediaUrlForKey(previewFile.key)} controls preload="metadata" className="w-full rounded-xl" />
            )}
            {fileCategory(previewFile.name) === "audio" && (
              <audio src={mediaUrlForKey(previewFile.key)} controls preload="metadata" className="w-full" />
            )}

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-white/60">
              <div><span className="text-white/30">Size</span><br />{formatBytes(previewFile.size)}</div>
              <div><span className="text-white/30">Modified</span><br />{new Date(previewFile.lastModified).toLocaleString()}</div>
              <div className="col-span-2 break-all"><span className="text-white/30">Key</span><br /><code className="text-xs text-[#C9A84C]">{previewFile.key}</code></div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => copyUrl(previewFile)}
                className="flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm hover:bg-white/10"
              >
                <Link2 size={14} /> Copy URL
              </button>
              <button
                onClick={() => downloadFile(previewFile.key)}
                className="flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm hover:bg-white/10"
              >
                <Download size={14} /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
