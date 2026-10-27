"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";

export default function AdminMobileStarterScreen() {
  const [shouldRender, setShouldRender] = useState(false);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(25);

  const triggerSplash = useCallback(() => {
    setShouldRender(true);
    setFading(false);
    setProgress(30);

    const t1 = setTimeout(() => setProgress(75), 200);
    const t2 = setTimeout(() => setProgress(100), 550);

    const t3 = setTimeout(() => {
      setFading(true);
    }, 750);

    const t4 = setTimeout(() => {
      setShouldRender(false);
      try {
        sessionStorage.setItem("ti_app_last_active", String(Date.now()));
      } catch {}
    }, 1150);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isMobileOrPwa =
      window.innerWidth < 768 ||
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (!isMobileOrPwa) return;

    // Check if cold boot or returning after being away for more than 2 minutes
    const lastActive = parseInt(sessionStorage.getItem("ti_app_last_active") || "0", 10);
    const now = Date.now();
    const isColdBoot = !lastActive;
    const isReturningAfterPause = now - lastActive > 120000;

    let cleanupTimers: (() => void) | undefined;

    if (isColdBoot || isReturningAfterPause) {
      cleanupTimers = triggerSplash();
    } else {
      sessionStorage.setItem("ti_app_last_active", String(now));
    }

    // Also handle visibility changes when resuming from mobile app switcher
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const last = parseInt(sessionStorage.getItem("ti_app_last_active") || "0", 10);
        const cur = Date.now();
        if (cur - last > 180000) {
          triggerSplash();
        }
        sessionStorage.setItem("ti_app_last_active", String(cur));
      } else {
        sessionStorage.setItem("ti_app_last_active", String(Date.now()));
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (cleanupTimers) cleanupTimers();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [triggerSplash]);

  if (!shouldRender) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] bg-[#000000] flex flex-col items-center justify-center select-none pointer-events-none transition-all duration-500 ease-out ${
        fading ? "opacity-0 scale-[1.05]" : "opacity-100 scale-100"
      }`}
    >
      {/* Ambient background glow pulse */}
      <div className="absolute w-80 h-80 rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none animate-pulse" />

      {/* Tech Infinix Brand Center */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Tech Infinix Emblem */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute -inset-4 rounded-3xl bg-emerald-500/20 blur-xl animate-pulse opacity-50" />
          <div className="relative w-24 h-24 rounded-2xl bg-[#000000] p-2 shadow-2xl border border-white/10 ring-1 ring-emerald-500/30 flex items-center justify-center overflow-hidden">
            <Image
              src="/favicon.png"
              alt="Tech Infinix Logo"
              width={96}
              height={96}
              priority
              className="w-20 h-20 object-contain drop-shadow-[0_4px_20px_rgba(16,185,129,0.45)]"
            />
          </div>
        </div>

        {/* Clean, Premium Tech Infinix Branding Typography */}
        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
            <span>Tech Infinix</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
          </h1>
          <p className="text-[10px] font-semibold tracking-[0.28em] text-white/50 uppercase mt-1.5">
            Enterprise Solutions &amp; CRM
          </p>
        </div>

        {/* Minimal Silk Progress Line */}
        <div className="w-44 h-[2.5px] bg-white/10 rounded-full mt-8 overflow-hidden p-0 relative shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(16,185,129,0.9)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Footer watermark */}
      <div className="absolute bottom-8 text-[10px] font-medium tracking-[0.25em] text-white/30 uppercase">
        Tech Infinix • Enterprise Console
      </div>
    </div>
  );
}
