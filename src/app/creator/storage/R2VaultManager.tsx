"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  FileText,
  HardDrive,
  Image as ImageIcon,
  Layers3,
  Link2,
  Loader2,
  Music,
  Pencil,
  RefreshCcw,
  Search,
  Trash2,
  UploadCloud,
  Video,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
};

type FilterTab = "all" | "video" | "image" | "audio" | "other";

const tabs: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "video", label: "Video" },
  { id: "image", label: "Images" },
  { id: "audio", label: "Audio" },
  { id: "other", label: "Files" },
];

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
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

function mediaUrlForKey(key: string) {
  return `/api/media/${encodeURIComponent(key)}?mode=redirect`;
}

function FileIcon({ file, size = 16 }: { file: Pick<R2File, "name" | "contentType">; size?: number }) {
  const cat = fileCategory(file.name, file.contentType);
  if (cat === "video") return <Video size={size} className="text-[var(--rose)]" />;
  if (cat === "image") return <ImageIcon size={size} className="text-[var(--accent)]" />;
  if (cat === "audio") return <Music size={size} className="text-[var(--emerald)]" />;
  return <FileText size={size} className="text-[var(--ink-faint)]" />;
}

export default function R2VaultManager({ configured }: { configured: boolean }) {
  const [files, setFiles] = useState<R2File[]>([]);
  const [loading, setLoading] = useState(false);
  const [prefix, setPrefix] = useState("");
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [query, setQuery] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [previewFile, setPreviewFile] = useState<R2File | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renaming, setRenaming] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const loadFiles = useCallback(async (p = prefix) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/r2/files?prefix=${encodeURIComponent(p)}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load vault");
      setFiles(data.items ?? []);
      setPrefix(data.prefix ?? p);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Load failed", "err");
    } finally {
      setLoading(false);
    }
  }, [prefix, showToast]);

  useEffect(() => {
    if (configured) void loadFiles("");
  }, [configured]); // eslint-disable-line react-hooks/exhaustive-deps

  const uploadFile = useCallback(async (file: File) => {
    const id = crypto.randomUUID();
    setUploads((prev) => [{ id, file, progress: 0, status: "pending" }, ...prev]);

    try {
      setUploads((prev) => prev.map((u) => u.id === id ? { ...u, status: "uploading", progress: 8 } : u));
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "uploads");

      const xhr = new XMLHttpRequest();
      await new Promise<void>((resolve, reject) => {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const pct = Math.round(8 + (event.loaded / event.total) * 88);
            setUploads((prev) => prev.map((u) => u.id === id ? { ...u, progress: pct } : u));
          }
        };
        xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: HTTP ${xhr.status}`));
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.open("POST", "/api/r2/upload");
        xhr.send(formData);
      });

      const result = JSON.parse(xhr.responseText);
      if (!result.key) throw new Error("No key returned from upload");
      setUploads((prev) => prev.map((u) => u.id === id ? { ...u, status: "done", progress: 100 } : u));
      showToast(`${file.name} is now in your vault`);
      await loadFiles("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setUploads((prev) => prev.map((u) => u.id === id ? { ...u, status: "error", error: msg } : u));
      showToast(msg, "err");
    }
  }, [loadFiles, showToast]);

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    Array.from(fileList).forEach(uploadFile);
  }, [uploadFile]);

  const openPreview = (file: R2File) => {
    setPreviewFile(file);
    setRenameValue(file.name);
  };

  const deleteFile = async (file: R2File) => {
    if (!confirm(`Delete "${file.name}" from the vault? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/r2/files/${encodeURIComponent(file.key)}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      setFiles((prev) => prev.filter((item) => item.key !== file.key));
      if (previewFile?.key === file.key) setPreviewFile(null);
      showToast(`${file.name} deleted`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete failed", "err");
    }
  };

  const renameFile = async () => {
    if (!previewFile || !renameValue.trim() || renameValue.trim() === previewFile.name) return;
    setRenaming(true);
    try {
      const res = await fetch(`/api/r2/files/${encodeURIComponent(previewFile.key)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: renameValue.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Rename failed");
      showToast("File renamed");
      await loadFiles(prefix);
      setPreviewFile(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Rename failed", "err");
    } finally {
      setRenaming(false);
    }
  };

  const copyUrl = async (file: R2File) => {
    try {
      const res = await fetch(`/api/r2/files/${encodeURIComponent(file.key)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Copy failed");
      await navigator.clipboard.writeText(data.url ?? mediaUrlForKey(file.key));
      showToast("Secure URL copied");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Copy failed", "err");
    }
  };

  const filtered = useMemo(() => {
    return files.filter((file) => {
      if (file.isFolder) return true;
      if (filter !== "all" && fileCategory(file.name, file.contentType) !== filter) return false;
      if (query && !file.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [files, filter, query]);

  const fileItems = files.filter((file) => !file.isFolder);
  const totalSize = fileItems.reduce((sum, file) => sum + file.size, 0);
  const videoCount = fileItems.filter((file) => fileCategory(file.name, file.contentType) === "video").length;
  const imageCount = fileItems.filter((file) => fileCategory(file.name, file.contentType) === "image").length;

  if (!configured) {
    return (
      <div className="glass-card p-6">
        <div className="flex gap-4">
          <AlertCircle className="mt-0.5 size-5 text-amber-400 shrink-0" />
          <div>
            <h2 className="text-lg font-bold">R2 Credentials Required</h2>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">Add Cloudflare R2 credentials to enable storage.</p>
            <pre className="mt-4 overflow-auto rounded-lg border border-[var(--glass-border)] bg-[var(--bg-raised)] p-3 text-xs text-[var(--ink-muted)]">
{`R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=xanna-media
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com`}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={cn("fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium backdrop-blur shadow-xl", toast.type === "ok" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-red-500/30 bg-red-500/10 text-red-300")}>
          {toast.type === "ok" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          {toast.msg}
        </div>
      )}

      {/* Header + stats */}
      <header className="flex items-end justify-between border-b border-[var(--glass-border)] pb-5">
        <div>
          <p className="eyebrow mb-1">Cloud Storage</p>
          <h1 className="text-3xl font-bold tracking-tight">R2 Vault</h1>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Files", value: fileItems.length.toLocaleString(), icon: Layers3 },
          { label: "Stored", value: formatBytes(totalSize), icon: HardDrive },
          { label: "Video", value: videoCount.toLocaleString(), icon: Video },
          { label: "Images", value: imageCount.toLocaleString(), icon: ImageIcon },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="glass-card p-4">
            <Icon size={16} className="text-[var(--accent)] mb-2" />
            <p className="text-xl font-bold">{value}</p>
            <p className="text-[10px] text-[var(--ink-faint)] uppercase tracking-wider font-semibold">{label}</p>
          </div>
        ))}
      </div>

      {/* Upload zone */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          handleFiles(event.dataTransfer.files);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        className={cn("w-full grid place-items-center rounded-xl border-2 border-dashed p-10 text-center transition-colors", dragActive ? "border-[var(--accent)] bg-[var(--accent-dim)]" : "border-[var(--glass-border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/30")}
      >
        <input ref={fileInputRef} type="file" multiple hidden onChange={(event) => handleFiles(event.target.files)} />
        <UploadCloud size={32} className="text-[var(--accent)] mb-3" />
        <p className="text-sm font-semibold">Drop files here or click to upload</p>
        <p className="text-xs text-[var(--ink-muted)] mt-1">Video, images, audio, and documents</p>
      </button>

      {uploads.length > 0 && (
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Upload Queue</h3>
            <button type="button" onClick={() => setUploads((prev) => prev.filter((u) => u.status === "uploading" || u.status === "pending"))} className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors">Clear done</button>
          </div>
          {uploads.map((upload) => (
            <div key={upload.id} className="rounded-lg border border-[var(--glass-border)] bg-[var(--bg-raised)] p-3">
              <div className="flex items-center gap-2.5">
                <FileIcon file={{ name: upload.file.name }} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{upload.file.name}</p>
                  <p className="text-[10px] text-[var(--ink-faint)]">{formatBytes(upload.file.size)}</p>
                </div>
                {upload.status === "uploading" && <Loader2 size={14} className="animate-spin text-[var(--accent)]" />}
                {upload.status === "done" && <CheckCircle2 size={14} className="text-[var(--emerald)]" />}
                {upload.status === "error" && <AlertCircle size={14} className="text-red-400" />}
                <button type="button" onClick={() => setUploads((prev) => prev.filter((u) => u.id !== upload.id))} className="p-1 rounded hover:bg-white/5"><X size={12} /></button>
              </div>
              <div className="mt-2 h-1 rounded-full bg-[var(--bg-base)] overflow-hidden">
                <div className="h-full bg-[var(--accent)] transition-all duration-200" style={{ width: `${upload.progress}%` }} />
              </div>
              {upload.error && <p className="mt-1 text-[10px] text-red-400">{upload.error}</p>}
            </div>
          ))}
        </div>
      )}

      {/* File browser */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold">Uploaded Content</h2>
            <p className="text-xs text-[var(--ink-muted)]">Files persist in R2 until deleted.</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-faint)]" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search…" className="rounded-lg border border-[var(--glass-border)] bg-[var(--bg-raised)] pl-8 pr-3 py-1.5 text-xs w-52 focus:outline-none focus:border-[var(--accent)]/40 transition-colors" />
            </div>
            <button type="button" onClick={() => void loadFiles(prefix)} disabled={loading} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--glass-border)] px-3 py-1.5 text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors">
              <RefreshCcw size={12} className={cn(loading && "animate-spin")} /> Refresh
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={cn("rounded-full border px-3 py-1 text-xs font-semibold transition-colors", filter === tab.id ? "bg-[var(--accent)] text-[var(--bg-base)] border-[var(--accent)]" : "border-[var(--glass-border)] text-[var(--ink-muted)] hover:text-[var(--ink)]")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((file) => {
            const category = fileCategory(file.name, file.contentType);
            return (
              <div key={file.key} className="group overflow-hidden rounded-lg border border-[var(--glass-border)] bg-[var(--bg-raised)]">
                <button type="button" onClick={() => openPreview(file)} className="relative block h-40 w-full overflow-hidden bg-[var(--bg-surface)] text-left">
                  {category === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrlForKey(file.key)} alt={file.name} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                  ) : category === "video" ? (
                    <video src={mediaUrlForKey(file.key)} className="w-full h-full object-cover opacity-80" muted playsInline />
                  ) : (
                    <div className="grid h-full place-items-center">
                      <FileIcon file={file} size={36} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute top-2 left-2 rounded-full bg-black/50 backdrop-blur px-2 py-0.5 text-[10px] font-semibold">{category}</span>
                  <span className="absolute bottom-2 left-2 right-2 truncate text-xs font-medium">{file.name}</span>
                </button>
                <div className="p-3">
                  <div className="flex items-center justify-between text-[10px] text-[var(--ink-faint)]">
                    <span>{formatBytes(file.size)}</span>
                    <span>{new Date(file.lastModified).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-1.5">
                    {[
                      { icon: Eye, label: "Preview", action: () => openPreview(file) },
                      { icon: Copy, label: "Copy URL", action: () => void copyUrl(file) },
                      { icon: Download, label: "Download", action: () => window.open(mediaUrlForKey(file.key), "_blank") },
                      { icon: Trash2, label: "Delete", action: () => void deleteFile(file), destructive: true },
                    ].map(({ icon: Ic, label, action, destructive }) => (
                      <button key={label} type="button" aria-label={label} onClick={action} className={cn("p-2 rounded-md flex items-center justify-center transition-colors", destructive ? "hover:bg-red-500/10 text-[var(--ink-faint)] hover:text-red-400" : "hover:bg-white/5 text-[var(--ink-faint)] hover:text-[var(--ink)]")}>
                        <Ic size={14} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Layers3 size={28} className="text-[var(--ink-faint)] mb-3" />
            <p className="text-sm font-medium">No content found</p>
            <p className="text-xs text-[var(--ink-muted)] mt-1">Upload files or adjust your filters.</p>
          </div>
        )}
      </div>

      {/* Preview modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-xl border border-[var(--glass-border)] bg-[var(--bg-base)] shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--glass-border)] p-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{previewFile.name}</p>
                <p className="text-[10px] text-[var(--ink-faint)] truncate">{previewFile.key}</p>
              </div>
              <button type="button" onClick={() => setPreviewFile(null)} className="p-1.5 rounded-md hover:bg-white/5 transition-colors"><X size={16} /></button>
            </div>
            <div className="grid gap-0 lg:grid-cols-[1fr_280px]">
              <div className="grid min-h-[360px] place-items-center bg-black">
                {fileCategory(previewFile.name, previewFile.contentType) === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrlForKey(previewFile.key)} alt={previewFile.name} className="max-h-[65vh] w-full object-contain" />
                ) : fileCategory(previewFile.name, previewFile.contentType) === "video" ? (
                  <video src={mediaUrlForKey(previewFile.key)} className="max-h-[65vh] w-full" controls />
                ) : fileCategory(previewFile.name, previewFile.contentType) === "audio" ? (
                  <audio src={mediaUrlForKey(previewFile.key)} controls className="w-4/5" />
                ) : (
                  <FileIcon file={previewFile} size={56} />
                )}
              </div>
              <aside className="space-y-3 p-4 border-l border-[var(--glass-border)]">
                <p className="eyebrow">Inspector</p>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">Rename</label>
                  <div className="mt-1 flex gap-1.5">
                    <input value={renameValue} onChange={(event) => setRenameValue(event.target.value)} className="flex-1 rounded-md border border-[var(--glass-border)] bg-[var(--bg-raised)] px-2 py-1 text-xs focus:outline-none focus:border-[var(--accent)]/40" />
                    <button type="button" disabled={renaming} onClick={() => void renameFile()} className="p-1.5 rounded-md border border-[var(--glass-border)] hover:bg-white/5 transition-colors disabled:opacity-50">
                      {renaming ? <Loader2 size={12} className="animate-spin" /> : <Pencil size={12} />}
                    </button>
                  </div>
                </div>
                <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--bg-raised)] p-3 text-xs text-[var(--ink-muted)] space-y-1">
                  <p><span className="text-[var(--ink)]">Size:</span> {formatBytes(previewFile.size)}</p>
                  <p><span className="text-[var(--ink)]">Type:</span> {previewFile.contentType ?? fileCategory(previewFile.name)}</p>
                  <p><span className="text-[var(--ink)]">Modified:</span> {new Date(previewFile.lastModified).toLocaleString()}</p>
                </div>
                <div className="grid gap-1.5">
                  {[
                    { icon: Link2, label: "Copy secure URL", action: () => void copyUrl(previewFile) },
                    { icon: Download, label: "Open / download", action: () => window.open(mediaUrlForKey(previewFile.key), "_blank") },
                    { icon: Trash2, label: "Delete from R2", action: () => void deleteFile(previewFile), destructive: true },
                  ].map(({ icon: Ic, label, action, destructive }) => (
                    <button key={label} type="button" onClick={action} className={cn("flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition-colors", destructive ? "border-red-500/20 text-red-400 hover:bg-red-500/10" : "border-[var(--glass-border)] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-white/5")}>
                      <Ic size={13} /> {label}
                    </button>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
