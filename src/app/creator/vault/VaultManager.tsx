"use client";

import { useState } from "react";
import { UploadCloud, File as FileIcon, Trash2, Video, Image as ImageIcon, Music, Calendar, Clock, Globe } from "lucide-react";
import FuturisticPlayer from "@/components/media/FuturisticPlayer";
import { creatorPublishVaultItem, creatorDeleteVaultItem } from "@/app/actions";
import type { StoredVaultItem, MediaType } from "@/lib/store";

export default function VaultManager({ initialItems }: { initialItems: StoredVaultItem[] }) {
  const [filter, setFilter] = useState<"all" | MediaType>("all");
  const [uploading, setUploading] = useState(false);
  const [draft, setDraft] = useState<{ srcUrl: string; type: MediaType; storageKey: string; name: string } | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/vault/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }
      
      const data = await res.json();
      
      const typeStr = file.type.startsWith("video") ? "video" : file.type.startsWith("audio") ? "audio" : "image";
      setDraft({
        srcUrl: URL.createObjectURL(file), // Provide immediate preview. Real URL would be mapped later.
        type: typeStr as MediaType,
        storageKey: data.storageKey || "mock-key-123",
        name: file.name
      });

    } catch (err) {
      console.error(err);
      alert("Upload failed. Ensure Cloudreve config is correct.");
    } finally {
      setUploading(false);
    }
  };

  const filteredItems = initialItems.filter(item => filter === "all" || item.type === filter);

  return (
    <div className="flex flex-col gap-8">
      
      {/* File Type Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-4">
        {[
          { id: "all", label: "All Content", icon: Globe },
          { id: "video", label: "Runtime", icon: Video },
          { id: "image", label: "Stills", icon: ImageIcon },
          { id: "audio", label: "Vox", icon: Music }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === tab.id 
                ? "bg-[#C9A84C] text-black" 
                : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Upload Zone / Draft Mode */}
      {!draft ? (
        <div className="w-full relative group">
          <div className="absolute inset-[-2px] bg-gradient-to-r from-[#C9A84C]/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-md"></div>
          <div className="relative border-2 border-dashed border-[#ffffff20] hover:border-[#C9A84C] bg-[#ffffff02] rounded-2xl p-12 flex flex-col items-center justify-center transition-all">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              onChange={handleUpload}
              disabled={uploading}
            />
            <div className="flex flex-col items-center gap-4 text-white/50 group-hover:text-white transition-colors pointer-events-none">
              {uploading ? (
                <div className="animate-spin w-10 h-10 border-2 border-[#C9A84C] border-t-transparent rounded-full" />
              ) : (
                <UploadCloud size={48} className="text-[#C9A84C]" />
              )}
              <p className="font-mono uppercase text-sm tracking-widest text-center">
                {uploading ? "Encrypting & Transporting to Cloudreve..." : "Drop media to Vault"}
              </p>
              <p className="text-xs text-center opacity-50 max-w-sm">Files are automatically synced to Cloudreve via sirhx.space securely.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#050505] border border-[#C9A84C] p-6 rounded-2xl grid md:grid-cols-2 gap-8 shadow-[0_0_30px_rgba(201,168,76,0.1)]">
          <div>
            <h3 className="text-lg font-heading text-gold mb-4">Draft Encrypted: {draft.name}</h3>
            <FuturisticPlayer type={draft.type as any} src={draft.srcUrl} isLocked={false} />
          </div>
          <form action={creatorPublishVaultItem} className="flex flex-col gap-4">
            <input type="hidden" name="storageKey" value={draft.storageKey} />
            <input type="hidden" name="mediaType" value={draft.type} />
            <input type="hidden" name="videoUrl" value={draft.srcUrl} /> {/* For mock playback */}
            
            <div>
              <label className="text-xs font-mono uppercase text-white/50 mb-1 block">Title</label>
              <input type="text" name="title" required placeholder="Midnight Secrets" className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2 focus:border-gold outline-none" />
            </div>
            
            <div>
              <label className="text-xs font-mono uppercase text-white/50 mb-1 block">Description</label>
              <textarea name="description" rows={2} required className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2 focus:border-gold outline-none"></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono uppercase text-white/50 mb-1 block">Unlock Price (USD)</label>
                <input type="number" name="price" defaultValue={10} min={0} className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2 focus:border-gold outline-none" />
              </div>
              <div>
                <label className="text-xs font-mono uppercase text-white/50 mb-1 block">Post Status</label>
                <select name="status" className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2 focus:border-gold outline-none">
                  <option value="listed">Publish Now</option>
                  <option value="scheduled">Schedule</option>
                  <option value="stored">Hidden/Stored</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-white/50 mb-1 flex items-center gap-2"><Clock size={14}/> Publish Schedule (Optional)</label>
              <input type="datetime-local" name="scheduledFor" className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2 text-white/80 focus:border-gold outline-none" />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setDraft(null)} className="px-4 py-2 rounded-lg hover:bg-white/5 text-white/50 transition-colors">Cancel</button>
              <button type="submit" className="bg-[#C9A84C] text-black font-semibold rounded-lg px-6 py-2 shadow-[0_0_15px_rgba(201,168,76,0.3)] hover:bg-white transition-colors">Publish to Vault</button>
            </div>
          </form>
        </div>
      )}

      {/* Vault Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="flex flex-col gap-4 relative group">
            {item.status === 'scheduled' && (
              <div className="absolute top-2 left-2 z-30 bg-blue-500/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-blue-400 flex items-center gap-1">
                <Calendar size={12} /> {new Date(item.scheduledFor || "").toLocaleDateString()}
              </div>
            )}
            <FuturisticPlayer 
              type={item.type as any || "video"}
              src={item.videoUrl || "/image_1.png"}
              title={item.title}
              isLocked={false}
            />
            {/* Meta panel */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-[#ffffff02]">
              <div className="flex items-center gap-3">
                <FileIcon size={16} className="text-white/50" />
                <span className="text-sm font-medium truncate w-32">{item.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-2 py-1 rounded bg-black/50 border border-white/10 text-xs text-[#C9A84C] font-mono">
                  ${(item.priceCents || 0) / 100}
                </div>
                <form action={creatorDeleteVaultItem}>
                  <input type="hidden" name="itemId" value={item.id} />
                  <button type="submit" className="text-white/40 hover:text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
