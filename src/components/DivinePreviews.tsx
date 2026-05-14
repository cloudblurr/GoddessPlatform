"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Lock, Eye } from "lucide-react";
import type { EntryPageSettings } from "@/lib/store";

type LocalState = {
  date: string;
  revealsLeft: number;
};

export function DivinePreviews({ settings }: { settings: EntryPageSettings }) {
  const [revealsLeft, setRevealsLeft] = useState<number>(4);
  const [isRevealed, setIsRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const storageKey = "xanna_divine_reveals";
    
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as LocalState;
        if (parsed.date === today) {
          setRevealsLeft(parsed.revealsLeft);
        } else {
          // New day, reset
          localStorage.setItem(storageKey, JSON.stringify({ date: today, revealsLeft: 4 }));
          setRevealsLeft(4);
        }
      } else {
        localStorage.setItem(storageKey, JSON.stringify({ date: today, revealsLeft: 4 }));
      }
    } catch {}
  }, []);

  // Handle expiration tick
  useEffect(() => {
    if (isRevealed && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 100), 100);
      return () => clearTimeout(timer);
    } else if (isRevealed && timeLeft <= 0) {
      setIsRevealed(false);
    }
  }, [isRevealed, timeLeft]);

  const handleReveal = () => {
    if (revealsLeft > 0) {
      const today = new Date().toISOString().split("T")[0];
      const newReveals = revealsLeft - 1;
      setRevealsLeft(newReveals);
      localStorage.setItem("xanna_divine_reveals", JSON.stringify({ date: today, revealsLeft: newReveals }));
      setIsRevealed(true);
      setTimeLeft(32000); // 32 seconds
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 text-center">
      <div className="mb-8">
        <h2 className="text-3xl sm:text-4xl font-bebas tracking-wider mb-4 bg-clip-text text-transparent bg-gradient-to-r from-platinum to-gold break-words leading-tight" style={{ color: "var(--ink)" }}>
          {settings.revealHeadline}
        </h2>
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto"></div>
      </div>

      {!isRevealed ? (
        <div className="relative overflow-hidden rounded-2xl border border-glass-border bg-glass p-12 hover:border-gold/30 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-t from-bg-surface to-transparent opacity-80 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-navy border border-glass-border flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(251,191,36,0.15)]">
               <Lock className="text-gold w-6 h-6" />
            </div>
            <p className="text-ink-muted mb-8 italic max-w-md mx-auto">
              You are at the gates of divinity. You may peek through the veil {revealsLeft} more {revealsLeft === 1 ? "time" : "times"} today before the gates close.
            </p>
            
            <button 
              onClick={handleReveal}
              disabled={revealsLeft <= 0}
              className="primary-btn flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              <Eye className="w-4 h-4" />
              {revealsLeft > 0 ? `Reveal Teaser (${revealsLeft} Left)` : "Closed for Today"}
            </button>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in zoom-in duration-500">
          <div className="flex flex-col items-center mb-8 bg-black/40 p-4 rounded-xl border border-[#ffffff10]">
            <p className="text-gold font-bold uppercase tracking-widest text-sm mb-2">{Math.ceil(timeLeft / 1000)} Seconds Remaining</p>
            <div className="w-full max-w-sm h-1 bg-white/10 rounded-full overflow-hidden">
               <div className="h-full bg-gold transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(251,191,36,0.5)]" style={{ width: `${(timeLeft / 32000) * 100}%` }}></div>
            </div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-2">{revealsLeft} hints left today</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {settings.previews.map((preview) => (
              <div key={preview.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-glass-border group shadow-2xl">
                {preview.mediaType === "image" ? (
                  <Image src={preview.mediaUrl} alt={preview.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700 bg-bg-surface" />
                ) : (
                  <video src={preview.mediaUrl} autoPlay loop muted playsInline className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 bg-bg-surface" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                  <h3 className="text-gold font-bold text-lg leading-tight">{preview.title}</h3>
                  <p className="text-ink text-xs opacity-80 uppercase tracking-wider mt-1 font-mono">Heavenly Glimpse</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
