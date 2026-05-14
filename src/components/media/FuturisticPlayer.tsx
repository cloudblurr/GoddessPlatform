"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Maximize, FileImage, Lock } from "lucide-react";
import Image from "next/image";

type MediaType = "video" | "audio" | "image";

export default function FuturisticPlayer({
  src,
  type,
  title,
  poster,
  isLocked
}: {
  src: string;
  type: MediaType;
  title?: string;
  poster?: string;
  isLocked?: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(false);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);

  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;

    const updateProgress = () => {
      setProgress((el.currentTime / el.duration) * 100);
    };

    el.addEventListener("timeupdate", updateProgress);
    return () => el.removeEventListener("timeupdate", updateProgress);
  }, []);

  const togglePlay = () => {
    if (mediaRef.current) {
      if (isPlaying) mediaRef.current.pause();
      else mediaRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setProgress(val);
    if (mediaRef.current) {
      mediaRef.current.currentTime = (mediaRef.current.duration * val) / 100;
    }
  };

  if (isLocked) {
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-red-500/30 bg-black flex items-center justify-center flex-col gap-4">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }} 
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Lock size={48} className="text-red-500/80 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
        </motion.div>
        <span className="text-red-500 font-mono uppercase tracking-[0.2em] text-sm">xAnna0-god Gated Area</span>
        <button className="px-6 py-2 rounded-full bg-red-500/10 border border-red-500 text-red-100 font-medium hover:bg-red-500/20 transition-all text-sm tracking-wider uppercase">
          Unlock via Rampex
        </button>
        <div className="absolute inset-0 pointer-events-none bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--gold)]/30 bg-black group shadow-[0_0_40px_rgba(201,168,76,0.15)] transition-all hover:border-[var(--gold)]/60">
      
      {/* Glitz overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-black via-transparent to-[var(--gold)]/5 mix-blend-screen z-10"></div>
      
      {/* Media Type Handling */}
      {type === "video" && (
        <video 
          ref={mediaRef as any}
          src={src} 
          poster={poster}
          className="w-full h-full object-cover" 
          muted={muted}
        />
      )}
      
      {type === "audio" && (
        <div className="w-full h-64 flex items-center justify-center bg-[#0a0a0a]">
          <audio ref={mediaRef as any} src={src} muted={muted} />
          <motion.div
            animate={{ scale: isPlaying ? [1, 1.2, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <div className="w-24 h-24 rounded-full border-2 border-[var(--gold)]/30 flex items-center justify-center shadow-[0_0_30px_rgba(201,168,76,0.2)]">
              <Play size={32} className="text-[var(--gold)] ml-2" />
            </div>
          </motion.div>
        </div>
      )}

      {type === "image" && (
        <div className="relative w-full aspect-[4/5] sm:aspect-video">
          <Image src={src} alt={title || "Media"} fill className="object-cover" />
        </div>
      )}

      {/* Futuristic Controls (Hidden on Images) */}
      {type !== "image" && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20 flex flex-col gap-2">
          
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={progress} 
            onChange={handleSeek}
            className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[var(--gold)] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_var(--gold)]"
          />

          <div className="flex items-center justify-between text-white/80 mt-1">
            <div className="flex gap-4">
              <button onClick={togglePlay} className="hover:text-[var(--gold)] transition-colors">
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button onClick={() => setMuted(!muted)} className="hover:text-[var(--gold)] transition-colors">
                {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </div>
            
            <span className="text-xs font-mono tracking-widest uppercase text-[var(--gold)] truncate mx-4">
              xAnna // {title || "Encrypted Stream"}
            </span>

            <button className="hover:text-[var(--gold)] transition-colors">
              <Maximize size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
