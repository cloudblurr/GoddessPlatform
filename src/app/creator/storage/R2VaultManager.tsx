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
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  Video,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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

function FileIcon({ file, size = 18 }: { file: Pick<R2File, "name" | "contentType">; size?: number }) {
  const cat = fileCategory(file.name, file.contentType);
  if (cat === "video") return <Video size={size} className="text-fuchsia-200" />;
  if (cat === "image") return <ImageIcon size={size} className="text-cyan-200" />;
  if (cat === "audio") return <Music size={size} className="text-emerald-200" />;
  return <FileText size={size} className="text-white/55" />;
}

function VaultCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={cn("border-white/10 bg-white/[0.055] shadow-[0_24px_80px_rgba(0,0,0,.32)] backdrop-blur-xl", className)}>
      {children}
    </Card>
  );
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
      <VaultCard>
        <CardContent className="p-6 md:p-8">
          <div className="flex gap-4">
            <AlertCircle className="mt-1 size-7 text-amber-200" />
            <div>
              <h2 className="text-2xl font-semibold tracking-normal">R2 Credentials Required</h2>
              <p className="mt-2 text-white/62">Add your Cloudflare R2 credentials to enable persistent creator storage.</p>
              <pre className="mt-5 overflow-auto rounded-lg border border-white/10 bg-black/45 p-4 text-sm text-white/70">
{`R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=xanna-media
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com`}
              </pre>
            </div>
          </div>
        </CardContent>
      </VaultCard>
    );
  }

  return (
    <div className="relative space-y-6">
      {toast && (
        <div className={cn("fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur", toast.type === "ok" ? "border-emerald-300/30 bg-emerald-950/90" : "border-red-300/30 bg-red-950/90")}>
          {toast.type === "ok" ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
          {toast.msg}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <VaultCard className="overflow-hidden">
          <CardContent className="relative p-6 md:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(246,211,101,.16),transparent_24rem),radial-gradient(circle_at_95%_20%,rgba(20,241,217,.14),transparent_24rem)]" />
            <div className="relative">
              <div className="flex flex-wrap gap-2">
                <Badge variant="gold">Cloudflare R2</Badge>
                <Badge variant="neon">Persistent until deleted</Badge>
                <Badge variant="luxury"><ShieldCheck className="size-3" />Creator scoped</Badge>
              </div>
              <h1 className="mt-5 max-w-3xl text-5xl font-bold leading-none tracking-normal md:text-7xl">Creator media vault</h1>
              <p className="mt-4 max-w-3xl text-white/65">
                Upload raw drops, store-only products, locked campaign assets, custom deliveries, preview masters,
                rename files, copy secure URLs, download originals, and delete content only when you choose.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Files", value: fileItems.length.toLocaleString(), icon: Layers3 },
                  { label: "Stored", value: formatBytes(totalSize), icon: HardDrive },
                  { label: "Video", value: videoCount.toLocaleString(), icon: Video },
                  { label: "Images", value: imageCount.toLocaleString(), icon: ImageIcon },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-lg border border-white/10 bg-black/30 p-4">
                    <Icon className="size-5 text-amber-100" />
                    <p className="mt-3 text-2xl font-bold">{value}</p>
                    <p className="text-xs font-semibold uppercase tracking-[.12em] text-white/45">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </VaultCard>

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
          className={cn("grid min-h-[340px] place-items-center rounded-lg border border-dashed p-6 text-center transition", dragActive ? "border-amber-200 bg-amber-200/10" : "border-white/20 bg-white/[0.045] hover:bg-white/[0.07]")}
        >
          <input ref={fileInputRef} type="file" multiple hidden onChange={(event) => handleFiles(event.target.files)} />
          <div className="max-w-md">
            <div className="mx-auto grid size-24 place-items-center rounded-full bg-[linear-gradient(135deg,#f6d365,#f43f8f)] text-black shadow-[0_0_46px_rgba(246,211,101,.28)]">
              <UploadCloud className="size-10" />
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-normal">Drop content into R2</h2>
            <p className="mt-2 text-white/60">Video, images, audio, product assets, custom deliveries, and campaign files.</p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-black">
              <Sparkles className="size-4" />
              Select files
            </span>
          </div>
        </button>
      </div>

      {uploads.length > 0 && (
        <VaultCard>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold tracking-normal">Upload queue</h2>
              <Button variant="luxury" size="sm" onClick={() => setUploads((prev) => prev.filter((item) => item.status === "uploading" || item.status === "pending"))}>
                Clear finished
              </Button>
            </div>
            <div className="mt-4 grid gap-3">
              {uploads.map((upload) => (
                <div key={upload.id} className="rounded-lg border border-white/10 bg-black/25 p-4">
                  <div className="flex items-center gap-3">
                    <FileIcon file={{ name: upload.file.name }} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{upload.file.name}</p>
                      <p className="text-xs text-white/45">{formatBytes(upload.file.size)}</p>
                    </div>
                    {upload.status === "uploading" && <Loader2 className="size-4 animate-spin text-amber-100" />}
                    {upload.status === "done" && <CheckCircle2 className="size-4 text-emerald-200" />}
                    {upload.status === "error" && <AlertCircle className="size-4 text-red-200" />}
                    <Button variant="ghost" size="icon" onClick={() => setUploads((prev) => prev.filter((item) => item.id !== upload.id))}>
                      <X className="size-4" />
                    </Button>
                  </div>
                  <Progress value={upload.progress} className="mt-3" />
                  {upload.error && <p className="mt-2 text-xs text-red-200">{upload.error}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </VaultCard>
      )}

      <VaultCard>
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-normal">Uploaded content</h2>
              <p className="text-sm text-white/52">Everything listed here persists in R2 until you delete it.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search vault" className="pl-9 sm:w-72" />
              </div>
              <Button variant="luxury" onClick={() => void loadFiles(prefix)} disabled={loading}>
                <RefreshCcw className={cn("size-4", loading && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={cn("rounded-full border px-4 py-2 text-sm font-semibold transition", filter === tab.id ? "border-white bg-white text-black" : "border-white/10 bg-white/[0.055] text-white/62 hover:text-white")}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((file) => {
              const category = fileCategory(file.name, file.contentType);
              return (
                <div key={file.key} className="group overflow-hidden rounded-lg border border-white/10 bg-black/24">
                  <button type="button" onClick={() => openPreview(file)} className="relative block h-48 w-full overflow-hidden bg-white/[0.045] text-left">
                    {category === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={mediaUrlForKey(file.key)} alt={file.name} className="size-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : category === "video" ? (
                      <video src={mediaUrlForKey(file.key)} className="size-full object-cover opacity-80" muted playsInline />
                    ) : (
                      <div className="grid size-full place-items-center">
                        <FileIcon file={file} size={42} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,.72))]" />
                    <Badge variant="luxury" className="absolute left-3 top-3">{category}</Badge>
                    <span className="absolute bottom-3 left-3 right-3 truncate text-sm font-semibold">{file.name}</span>
                  </button>
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-3 text-xs text-white/45">
                      <span>{formatBytes(file.size)}</span>
                      <span>{new Date(file.lastModified).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      <Button variant="luxury" size="icon" aria-label="Preview" onClick={() => openPreview(file)}><Eye className="size-4" /></Button>
                      <Button variant="luxury" size="icon" aria-label="Copy URL" onClick={() => void copyUrl(file)}><Copy className="size-4" /></Button>
                      <Button variant="luxury" size="icon" aria-label="Download" onClick={() => window.open(mediaUrlForKey(file.key), "_blank")}><Download className="size-4" /></Button>
                      <Button variant="destructive" size="icon" aria-label="Delete" onClick={() => void deleteFile(file)}><Trash2 className="size-4" /></Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="grid min-h-64 place-items-center text-center">
              <div>
                <Layers3 className="mx-auto size-10 text-white/30" />
                <p className="mt-4 font-semibold">No uploaded content found</p>
                <p className="mt-1 text-sm text-white/45">Upload files above or adjust your filters.</p>
              </div>
            </div>
          )}
        </CardContent>
      </VaultCard>

      {previewFile && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-lg border border-white/12 bg-[#080b16] shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 p-4">
              <div className="min-w-0">
                <p className="truncate font-semibold">{previewFile.name}</p>
                <p className="text-xs text-white/45">{previewFile.key}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setPreviewFile(null)}><X className="size-5" /></Button>
            </div>
            <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
              <div className="grid min-h-[420px] place-items-center bg-black">
                {fileCategory(previewFile.name, previewFile.contentType) === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrlForKey(previewFile.key)} alt={previewFile.name} className="max-h-[70vh] w-full object-contain" />
                ) : fileCategory(previewFile.name, previewFile.contentType) === "video" ? (
                  <video src={mediaUrlForKey(previewFile.key)} className="max-h-[70vh] w-full" controls />
                ) : fileCategory(previewFile.name, previewFile.contentType) === "audio" ? (
                  <audio src={mediaUrlForKey(previewFile.key)} controls className="w-4/5" />
                ) : (
                  <FileIcon file={previewFile} size={72} />
                )}
              </div>
              <aside className="space-y-4 p-5">
                <Badge variant="neon">Vault inspector</Badge>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[.14em] text-white/45">Rename file</label>
                  <div className="mt-2 flex gap-2">
                    <Input value={renameValue} onChange={(event) => setRenameValue(event.target.value)} />
                    <Button variant="neon" size="icon" disabled={renaming} onClick={() => void renameFile()}>
                      {renaming ? <Loader2 className="size-4 animate-spin" /> : <Pencil className="size-4" />}
                    </Button>
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4 text-sm text-white/60">
                  <p><span className="text-white">Size:</span> {formatBytes(previewFile.size)}</p>
                  <p><span className="text-white">Type:</span> {previewFile.contentType ?? fileCategory(previewFile.name)}</p>
                  <p><span className="text-white">Modified:</span> {new Date(previewFile.lastModified).toLocaleString()}</p>
                </div>
                <div className="grid gap-2">
                  <Button variant="luxury" onClick={() => void copyUrl(previewFile)}><Link2 className="size-4" />Copy secure URL</Button>
                  <Button variant="luxury" onClick={() => window.open(mediaUrlForKey(previewFile.key), "_blank")}><Download className="size-4" />Open / download</Button>
                  <Button variant="destructive" onClick={() => void deleteFile(previewFile)}><Trash2 className="size-4" />Delete from R2</Button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
