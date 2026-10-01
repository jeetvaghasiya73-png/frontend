"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

export default function BrandFilmPlayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  // Auto-hide floating navigation header on mouse inactivity or touch for full cinema mode
  const handleInteraction = () => {
    setControlsVisible(true);
    if (hideTimeout) clearTimeout(hideTimeout);
    const timeout = setTimeout(() => {
      setControlsVisible(false);
    }, 4000);
    setHideTimeout(timeout);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (hideTimeout) clearTimeout(hideTimeout);
    };
  }, [hideTimeout]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleInteraction}
      onTouchStart={handleInteraction}
      onClick={handleInteraction}
      className="relative w-full h-[100dvh] min-h-[100dvh] overflow-hidden bg-[#0b0c0e] select-none"
    >
      {/* Top Floating Cinema Bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 px-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] sm:p-6 flex items-center justify-between pointer-events-none transition-opacity duration-500 ${
          controlsVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Left: Back to Site */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full border border-white/20 bg-black/60 hover:bg-white/15 backdrop-blur-xl text-[11px] sm:text-xs font-mono text-white/90 hover:text-white transition duration-200 shadow-lg group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform shrink-0" />
            <span className="font-semibold whitespace-nowrap">
              Exit<span className="hidden sm:inline"> to Site</span>
            </span>
          </Link>

          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[11px] font-mono text-white/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sound & 3D Synced</span>
          </div>
        </div>

        {/* Center: Brand Identity Pill */}
        <div className="pointer-events-auto hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/15 bg-black/70 backdrop-blur-xl shadow-xl">
          <div className="w-5 h-5 rounded-full overflow-hidden bg-black flex items-center justify-center shrink-0 border border-white/30">
            <Image
              src="/favicon.png"
              alt="Tech Infinix"
              width={20}
              height={20}
              className="w-full h-full object-cover scale-110"
            />
          </div>
          <span className="text-xs font-semibold text-white tracking-wide">
            Tech Infinix
          </span>
          <span className="text-white/30">&bull;</span>
          <span className="text-[11px] font-mono text-amber-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            44s Brand Film
          </span>
        </div>

        {/* Right: Quick Action CTAs & Fullscreen Toggle */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-2.5">
          <Link
            href="/contact"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold uppercase tracking-wider transition duration-200 shadow-md shadow-amber-400/20 cursor-pointer"
          >
            <span>Get Quote</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/20 bg-black/60 hover:bg-white/15 backdrop-blur-xl text-white flex items-center justify-center transition cursor-pointer shadow-lg shrink-0"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>
        </div>
      </header>

      {/* Embedded 3D WebGL Brand Film Engine */}
      <iframe
        ref={iframeRef}
        src="/brand-film.html"
        title="Tech Infinix 3D Brand Film"
        className="w-full h-full border-0 absolute inset-0 z-10"
        allow="autoplay; fullscreen"
      />
    </div>
  );
}
