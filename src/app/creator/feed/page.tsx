"use client";

import { useState } from "react";
import { Send, Image as ImageIcon, Video, Lock } from "lucide-react";
import FuturisticPlayer from "@/components/media/FuturisticPlayer";

export default function BroadcastPage() {
  const [content, setContent] = useState("");
  const [posts] = useState([
    { id: "1", text: "New drop in the vault. Locked tight.", media: "/image_1.png", mediaType: "image" as const, isLocked: true, likes: 340 }
  ]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h2 className="text-sm font-mono tracking-[0.2em] text-[#C9A84C] uppercase mb-2">Network Control</h2>
          <h1 className="text-4xl font-heading font-medium tracking-tight">Broadcast Feed</h1>
        </div>
      </header>

      {/* Composer */}
      <div className="p-6 rounded-2xl bg-[#ffffff05] border border-white/10 flex flex-col gap-4 relative overflow-hidden group focus-within:border-[#C9A84C] transition-colors">
        <textarea 
          placeholder="Transmit a message to the grid..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="bg-transparent border-none outline-none resize-none min-h-[100px] text-lg text-white/90 placeholder-white/30"
        />
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex gap-2">
            <button className="p-2 rounded-lg hover:bg-white/10 text-[#C9A84C] transition-colors">
              <ImageIcon size={20} />
            </button>
            <button className="p-2 rounded-lg hover:bg-white/10 text-[#C9A84C] transition-colors">
              <Video size={20} />
            </button>
            <button className="p-2 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors ml-4 flex items-center gap-2 px-4 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
              <Lock size={16} /> <span className="text-xs font-mono font-bold">GATE</span>
            </button>
          </div>
          <button className="bg-[#C9A84C] text-black px-6 py-2 rounded-full font-bold uppercase tracking-wider text-sm flex items-center gap-2 hover:bg-white transition-colors shadow-[0_0_20px_rgba(201,168,76,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
            <Send size={16} /> Broadcast
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="flex flex-col gap-8 mt-6">
        {posts.map(post => (
          <div key={post.id} className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/5 flex flex-col gap-4">
            <p className="text-lg text-white/90 leading-relaxed font-serif italic">{post.text}</p>
            {post.media && (
              <div className="mt-2 max-w-2xl">
                <FuturisticPlayer 
                  type={post.mediaType} 
                  src={post.media} 
                  isLocked={post.isLocked} 
                />
              </div>
            )}
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5 text-white/40 font-mono text-sm">
              <span>{post.likes} LIKES</span>
              {post.isLocked && <span className="text-red-500">GATED</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
