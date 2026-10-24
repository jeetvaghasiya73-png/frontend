"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Zap, ShieldCheck, Activity, ArrowRight, Sparkles } from "lucide-react";

export default function AdminMobileStarterScreen() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(15);
  const [statusIndex, setStatusIndex] = useState(0);

  const statuses = [
    { label: "Connecting encrypted workspace", icon: ShieldCheck },
    { label: "Syncing leads & live call desk", icon: Activity },
    { label: "Pipeline & AI engine ready", icon: Sparkles }
  ];

  useEffect(() => {
    setMounted(true);

    // Only display on mobile screen sizes (width < 768px) and once per session
    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth < 768;
      const alreadySeen = sessionStorage.getItem("leadflow_mobile_starter_shown");

      if (isMobile && !alreadySeen) {
        setVisible(true);

        // Progress bar step 1
        const t1 = setTimeout(() => {
          setProgress(55);
          setStatusIndex(1);
        }, 400);

        // Progress bar step 2
        const t2 = setTimeout(() => {
          setProgress(100);
          setStatusIndex(2);
        }, 900);

        // Auto dismiss with smooth fade
        const t3 = setTimeout(() => {
          dismissStarter();
        }, 1500);

        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
          clearTimeout(t3);
        };
      }
    }
  }, []);

  const dismissStarter = () => {
    setFading(true);
    setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem("leadflow_mobile_starter_shown", "true");
      } catch {}
    }, 450);
  };

  if (!mounted || !visible) return null;

  const CurrentStatusIcon = statuses[statusIndex].icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="LeadFlow Mobile Starter"
      className={`fixed inset-0 z-[9999] flex flex-col justify-between items-center px-6 py-10 bg-[#0B0D0E] text-white transition-opacity duration-500 select-none ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        paddingTop: "max(env(safe-area-inset-top, 24px), 28px)",
        paddingBottom: "max(env(safe-area-inset-bottom, 24px), 28px)"
      }}
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/15 rounded-full blur-[90px] animate-pulse" />
        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px]" />
      </div>

      {/* Top Header / Branding Pill */}
      <header className="relative z-10 w-full flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[11px] font-semibold tracking-wider text-emerald-400 uppercase">
            Live OS
          </span>
        </div>

        <button
          onClick={dismissStarter}
          className="text-xs font-medium text-white/50 hover:text-white transition-colors flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/5 active:scale-95"
        >
          Skip <ArrowRight className="w-3 h-3" />
        </button>
      </header>

      {/* Center Brand Identity Section */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-xs my-auto">
        {/* Glowing Logo Squircle */}
        <div className="relative mb-6">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-emerald-500/30 to-emerald-400/10 blur-xl opacity-75 animate-pulse" />
          
          <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-b from-[#1C2024] to-[#121517] p-0.5 shadow-2xl border border-white/10 ring-1 ring-emerald-500/30 flex items-center justify-center">
            <div className="w-full h-full rounded-[14px] bg-[#111315] flex items-center justify-center relative overflow-hidden">
              {/* Inner ambient shine */}
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-transparent to-white/10" />
              
              {/* Primary Icon */}
              <Image
                src="/notification-icon.png"
                alt="LeadFlow Logo"
                width={72}
                height={72}
                priority
                className="w-16 h-16 object-contain drop-shadow-[0_4px_12px_rgba(16,185,129,0.35)] relative z-10"
              />
            </div>
          </div>
        </div>

        {/* Title & Slogan */}
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
          <span>LeadFlow</span>
          <span className="text-emerald-500">.</span>
        </h1>
        <p className="text-[11px] font-bold tracking-[0.2em] text-emerald-400/90 uppercase mt-1">
          Enterprise Sales &amp; AI CRM
        </p>
        <p className="text-xs text-white/50 mt-2 leading-relaxed">
          Real-time calling queue, automated follow-ups &amp; deals pipeline.
        </p>

        {/* Dynamic Stepper Bar */}
        <div className="w-full mt-8 flex flex-col items-center">
          {/* Status Label with Icon */}
          <div className="flex items-center gap-2 text-xs font-medium text-white/80 mb-3 h-6">
            <CurrentStatusIcon className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
            <span className="transition-all duration-300">
              {statuses[statusIndex].label}
            </span>
          </div>

          {/* Smooth Progress Track */}
          <div className="w-56 h-1.5 bg-white/10 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Meta & Quick Action */}
      <footer className="relative z-10 w-full flex flex-col items-center gap-3">
        <button
          onClick={dismissStarter}
          className="w-full max-w-xs py-3.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-sm shadow-[0_4px_20px_rgba(16,185,129,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>Open Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-[11px] text-white/40">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/80" />
          <span>Encrypted Session • Version 2.4.0</span>
        </div>
      </footer>
    </div>
  );
}
