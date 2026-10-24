"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, ArrowRight, Share, CheckCircle2 } from "lucide-react";

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

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Check if already running in standalone / PWA mode
    const isApp = window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isApp);
    if (isApp) return;

    // 2. Check if user dismissed recently (24-hour snooze)
    const dismissedTime = localStorage.getItem("ti_pwa_prompt_dismissed");
    if (dismissedTime && Date.now() - Number(dismissedTime) < 24 * 60 * 60 * 1000) {
      return;
    }

    // 3. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // 4. Capture native beforeinstallprompt (Android / Chrome / Desktop)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPopup(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // For iOS users who don't fire beforeinstallprompt, display popup after 1.5s
    if (isAppleDevice) {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 1500);
      return () => clearTimeout(timer);
    }

    // Fallback: If not iOS and no beforeinstallprompt after 3s, show on mobile viewports
    const fallbackTimer = setTimeout(() => {
      if (window.innerWidth <= 768) {
        setShowPopup(true);
      }
    }, 2500);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setInstalled(true);
        setTimeout(() => setShowPopup(false), 2000);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("ti_pwa_prompt_dismissed", String(Date.now()));
    setShowPopup(false);
  };

  if (!showPopup || isStandalone) return null;

  return (
    <div className="fixed inset-x-3 bottom-4 sm:bottom-6 sm:right-6 sm:left-auto sm:max-w-md z-[9999] animate-slideInUp">
      <div className="bg-slate-900/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border border-indigo-500/40 p-5 rounded-2xl shadow-2xl shadow-indigo-950/60 text-white relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content Header */}
        <div className="flex items-start gap-3.5 pr-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-indigo-400 p-0.5 shadow-lg shadow-indigo-600/30 shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Mobile CRM App
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mt-1">
              Install Tech Infinix Admin App
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Access your calling desk, live leads, and WhatsApp chats in 1 tap directly from your phone’s home screen.
            </p>
          </div>
        </div>

        {/* Installation Instructions / Button */}
        <div className="mt-4 pt-3.5 border-t border-white/10">
          {installed ? (
            <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold py-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>App Installed Successfully!</span>
            </div>
          ) : isIOS ? (
            /* iOS Safari Instructions */
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-xs text-slate-200 space-y-1.5">
              <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                <span>To install on iPhone / iPad:</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-300">
                <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px]">1</span>
                <span>Tap the Safari <Share className="w-3.5 h-3.5 inline mx-1 text-indigo-400" /> Share button below</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-300">
                <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px]">2</span>
                <span>Scroll down and select <strong>"Add to Home Screen"</strong></span>
              </div>
            </div>
          ) : deferredPrompt ? (
            /* Android / Chrome 1-Click Install */
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleInstallClick}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition hover:scale-[1.02] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Install App Now</span>
              </button>
              <button
                onClick={handleDismiss}
                className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Maybe Later
              </button>
            </div>
          ) : (
            /* Fallback browser menu prompt */
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="text-[11px]">Tap your browser's menu (⋮) & select <strong>"Install App"</strong></span>
              <button
                onClick={handleDismiss}
                className="text-xs text-indigo-400 hover:underline font-bold ml-2"
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
