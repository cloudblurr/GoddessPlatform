"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export function GlitchSplash() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Check if we should show the splash screen (1 in 4 chance)
    const shouldShow = Math.random() < 0.25;
    if (shouldShow) {
      setShowSplash(true);
      // Hide after 3.5 seconds
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
        >
          {/* Glittering background effect */}
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-rose-600/20 via-black to-red-900/40 opacity-50"
            animate={{ 
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Glitching Logo Container */}
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
            {/* The main logo */}
            <motion.div
              className="relative w-full h-full"
              initial={{ scale: 0.8, filter: "brightness(0.5) blur(10px)" }}
              animate={{ 
                scale: [0.8, 1.1, 1], 
                filter: ["brightness(0.5) blur(10px)", "brightness(1.5) blur(0px)", "brightness(1) blur(0px)"] 
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <Image 
                src="/logo-1.png" 
                alt="xAnna Logo" 
                fill 
                className="object-contain drop-shadow-[0_0_20px_rgba(255,51,102,0.8)]" 
                priority
              />
            </motion.div>

            {/* Glitch layers */}
            <motion.div
              className="absolute inset-0 w-full h-full mix-blend-screen opacity-50"
              animate={{
                x: [-5, 5, -5, 10, -10, 0],
                y: [5, -5, -10, 5, 0, 0],
                opacity: [0, 0.8, 0, 0.5, 0, 0.8],
              }}
              transition={{
                duration: 0.4,
                repeat: Infinity,
                repeatType: "mirror",
                repeatDelay: 1.2
              }}
            >
               <Image src="/logo-2.png" alt="xAnna Logo Alt" fill className="object-contain" priority />
            </motion.div>
            
            <motion.div
               className="absolute inset-0 w-full h-full mix-blend-color-dodge opacity-50 text-rose-500"
               animate={{
                 x: [5, -5, 5, -10, 10, 0],
                 opacity: [0, 1, 0, 0.7, 0, 1]
               }}
               transition={{
                 duration: 0.3,
                 repeat: Infinity,
                 repeatType: "mirror",
                 repeatDelay: 0.8
               }}
            >
               <Image src="/logo-1.png" alt="" fill className="object-contain filter hue-rotate-90 saturate-200" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
