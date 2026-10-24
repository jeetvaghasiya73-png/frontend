"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function AdminMobileStarterScreen() {
  const [shouldRender, setShouldRender] = useState(false);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(25);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Run on mobile/app viewports (< 768px) on app open once per browser session
    const isMobile = window.innerWidth < 768;
    const alreadySeen = sessionStorage.getItem("ti_app_open_animated");

    if (isMobile && !alreadySeen) {
      setShouldRender(true);

      // Smooth silk loading bar progression (like Uber / Rapido app launch)
      const t1 = setTimeout(() => setProgress(70), 220);
      const t2 = setTimeout(() => setProgress(100), 650);

      // Begin seamless zoom-dissolve into dashboard
      const t3 = setTimeout(() => {
        setFading(true);
      }, 900);

      // Cleanly unmount from DOM after exit transition
      const t4 = setTimeout(() => {
        setShouldRender(false);
        try {
          sessionStorage.setItem("ti_app_open_animated", "true");
        } catch {}
      }, 1450);

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
      className={`fixed inset-0 z-[99999] bg-[#000000] flex flex-col items-center justify-center select-none pointer-events-none transition-all duration-500 ease-out ${
        fading ? "opacity-0 scale-[1.05]" : "opacity-100 scale-100"
      }`}
    >
      {/* Subtle ambient backdrop pulse (synced with Tech Infinix orbit theme) */}
      <div className="absolute w-80 h-80 rounded-full bg-emerald-500/10 blur-[110px] pointer-events-none animate-pulse" />

      {/* Center Brand Identity (Uber / Rapido / Apple Minimal Style) */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Official Tech Infinix Logo with Soft Orbit Glow */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Subtle luminous halo */}
          <div className="absolute -inset-3 rounded-3xl bg-emerald-500/15 blur-lg animate-ping opacity-40" />

          {/* Official TI Logo Emblem */}
          <div className="relative w-24 h-24 rounded-2xl bg-[#000000] p-1.5 shadow-2xl border border-white/10 ring-1 ring-white/5 flex items-center justify-center overflow-hidden">
            <Image
              src="/favicon.png"
              alt="Tech Infinix Logo"
              width={96}
              height={96}
              priority
              className="w-20 h-20 object-contain drop-shadow-[0_4px_20px_rgba(16,185,129,0.35)]"
            />
          </div>
        </div>

        {/* Clean, Premium Tech Infinix Typography */}
        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
            <span>Tech Infinix</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </h1>
          <p className="text-[10px] font-semibold tracking-[0.28em] text-white/50 uppercase mt-1.5">
            Enterprise Solutions &amp; CRM
          </p>
        </div>

        {/* Ultra-Minimal Silk Progress Line */}
        <div className="w-40 h-[2.5px] bg-white/10 rounded-full mt-8 overflow-hidden p-0 relative shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(16,185,129,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Sleek bottom watermark */}
      <div className="absolute bottom-8 text-[10px] font-medium tracking-[0.2em] text-white/25 uppercase">
        Secured • Enterprise Ready
      </div>
    </div>
  );
}
