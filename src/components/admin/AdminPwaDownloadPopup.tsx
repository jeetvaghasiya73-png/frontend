"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, Sparkles, Share, CheckCircle2, Zap, Bell, PhoneCall } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function AdminPwaDownloadPopup() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Check if already running in standalone / PWA mode
    const isApp =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    setIsStandalone(isApp);
    if (isApp) return;

    // 2. Check if user dismissed recently (24-hour snooze)
    const dismissedTime = localStorage.getItem("ti_pwa_prompt_dismissed");
    if (dismissedTime && Date.now() - Number(dismissedTime) < 24 * 60 * 60 * 1000) {
      return;
    }

    // 3. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isAppleDevice);

    // 4. Capture native beforeinstallprompt (Android / Chrome / Desktop Edge)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPopup(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // For mobile iOS users who don't fire beforeinstallprompt, display popup after 1.5s
    if (isAppleDevice) {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 1500);
      return () => clearTimeout(timer);
    }

    // Fallback: If on mobile viewport, display after short delay even if event hasn't fired yet
    const fallbackTimer = setTimeout(() => {
      if (window.innerWidth <= 768) {
        setShowPopup(true);
      }
    }, 2000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      setInstalling(true);
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === "accepted") {
          setInstalled(true);
          setTimeout(() => setShowPopup(false), 2000);
        }
      } catch (err) {
        console.error("Install prompt error:", err);
      } finally {
        setInstalling(false);
        setDeferredPrompt(null);
      }
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("ti_pwa_prompt_dismissed", String(Date.now()));
    setShowPopup(false);
  };

  if (!showPopup || isStandalone) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 sm:bottom-6 sm:right-6 sm:left-auto sm:max-w-md z-[9999] animate-fadeInUp">
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/95 dark:bg-[#0b1120]/95 backdrop-blur-2xl border border-indigo-500/30 p-5 shadow-2xl shadow-indigo-950/80 text-white">
        {/* Glowing Ambient Background Elements */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-indigo-500/25 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          aria-label="Dismiss"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with App Identity */}
        <div className="flex items-start gap-3.5 pr-6">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-indigo-600/40 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            {/* Live Indicator Dot */}
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 inline-flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-indigo-300" /> Official App
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mt-1 tracking-tight">
              LeadFlow Mobile CRM
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Install the lightweight admin app for 1-tap calling desk access, live WhatsApp alerts, and instant lead notifications.
            </p>
          </div>
        </div>

        {/* Value Proposition Micro-badges */}
        <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-white/10 text-[10px] text-slate-300">
          <div className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1.5 border border-white/5">
            <PhoneCall className="w-3 h-3 text-indigo-400 shrink-0" />
            <span className="truncate">1-Tap Dialing</span>
          </div>
          <div className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1.5 border border-white/5">
            <Bell className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="truncate">Instant Alerts</span>
          </div>
          <div className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1.5 border border-white/5">
            <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">Auto Updates</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-4 pt-3 border-t border-white/10">
          {installed ? (
            <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
              <span>Installed Successfully! Launch from home screen.</span>
            </div>
          ) : isIOS ? (
            /* iOS Safari Step-by-Step Instructions */
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-xs text-slate-200 space-y-2">
              <div className="font-semibold text-indigo-300 flex items-center gap-1.5 text-[11px]">
                <Smartphone className="w-3.5 h-3.5" />
                <span>To install on iPhone / iPad:</span>
              </div>
              <div className="space-y-1 text-[11px] text-slate-300 pl-1">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px] shrink-0">1</span>
                  <span>Tap Safari’s <Share className="w-3.5 h-3.5 inline mx-1 text-indigo-400" /> Share button below</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px] shrink-0">2</span>
                  <span>Select <strong>"Add to Home Screen"</strong></span>
                </div>
              </div>
            </div>
          ) : deferredPrompt ? (
            /* Android / Desktop Chrome 1-Click Install */
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleInstallClick}
                disabled={installing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{installing ? "Installing..." : "Install App (1-Click)"}</span>
              </button>
              <button
                onClick={handleDismiss}
                className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                Later
              </button>
            </div>
          ) : (
            /* Generic Mobile Browser Menu Fallback */
            <div className="flex items-center justify-between gap-2 text-xs text-slate-300 bg-white/5 p-2.5 rounded-xl border border-white/10">
              <span className="text-[11px] leading-tight">
                Tap your browser menu (<strong>⋮</strong>) & select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
              </span>
              <button
                onClick={handleDismiss}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold whitespace-nowrap px-2 py-1 rounded hover:bg-white/5 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
