"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function AdminMobileStarterScreen() {
  const [shouldRender, setShouldRender] = useState(false);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(20);

  useEffect(() => {
    // Only show on mobile viewport (< 768px) and once per browser session
    if (typeof window === "undefined") return;

    const isMobile = window.innerWidth < 768;
    const alreadySeen = sessionStorage.getItem("leadflow_mobile_starter_shown");

    if (isMobile && !alreadySeen) {
      setShouldRender(true);

      // Fast, silky progress line transition like Uber / Rapido app launch
      const t1 = setTimeout(() => setProgress(70), 200);
      const t2 = setTimeout(() => setProgress(100), 650);

      // Silky smooth fade out into dashboard
      const t3 = setTimeout(() => {
        setFading(true);
      }, 950);

      // Clean up DOM after fade-out transition completes
      const t4 = setTimeout(() => {
        setShouldRender(false);
        try {
          sessionStorage.setItem("leadflow_mobile_starter_shown", "true");
        } catch {}
      }, 1400);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] bg-[#111315] flex flex-col items-center justify-center select-none pointer-events-none transition-all duration-500 ease-out ${
        fading ? "opacity-0 scale-[1.03]" : "opacity-100 scale-100"
      }`}
    >
      {/* Subtle ambient central emerald glow */}
      <div className="absolute w-72 h-72 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none animate-pulse" />

      {/* Center Brand Identity (Uber / Rapido Minimal Lockup) */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Brand Logo Emblem */}
        <div className="relative mb-5 flex items-center justify-center">
          {/* Subtle soft pulse ring */}
          <div className="absolute -inset-2.5 rounded-3xl bg-emerald-500/20 blur-md animate-ping opacity-30" />
          
          <div className="relative w-20 h-20 rounded-2xl bg-[#16191D] p-1 shadow-2xl border border-white/10 ring-1 ring-emerald-500/30 flex items-center justify-center overflow-hidden">
            <Image
              src="/notification-icon.png"
              alt="LeadFlow Brand"
              width={80}
              height={80}
              priority
              className="w-16 h-16 object-contain drop-shadow-[0_4px_16px_rgba(16,185,129,0.35)]"
            />
          </div>
        </div>

        {/* Clean Minimal Typography */}
        <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1">
          <span>LeadFlow</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
        </h1>
        <p className="text-[10px] font-semibold tracking-[0.25em] text-white/40 uppercase mt-1">
          Enterprise Sales OS
        </p>

        {/* Minimal Silk Progress Line (Like Uber / Rapido) */}
        <div className="w-36 h-[2.5px] bg-white/10 rounded-full mt-7 overflow-hidden p-0 relative">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(16,185,129,0.7)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Minimal bottom security watermark */}
      <div className="absolute bottom-8 text-[10px] font-medium tracking-wider text-white/20 uppercase">
        Secured • High Performance
      </div>
    </div>
  );
}
