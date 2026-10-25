"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  Download,
  X,
  Smartphone,
  Laptop,
  Sparkles,
  Share,
  CheckCircle2,
  Zap,
  Bell,
  PhoneCall,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function AdminPwaDownloadPopup() {
  const [mounted, setMounted] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState<"auto" | "android" | "ios" | "desktop">("auto");
  const [copiedLink, setCopiedLink] = useState(false);
  const [detectedPlatform, setDetectedPlatform] = useState<"android" | "ios" | "desktop">("desktop");

  useEffect(() => {
    setMounted(true);

    if (typeof window === "undefined") return;

    // 1. Detect if running inside installed standalone PWA app
    const isApp =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    setIsStandalone(isApp);

    // 2. Detect platform
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
    const isAndroidDevice = /android/.test(ua);
    const platform = isIOSDevice ? "ios" : isAndroidDevice ? "android" : "desktop";
    setDetectedPlatform(platform);
    setActiveTab(platform);

    // 3. Capture native beforeinstallprompt (Android / Chrome / Edge)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setTimeout(() => setIsOpen(false), 2000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    // 4. Global Event: allow ANY button (Navbar, Sidebar, Profile Menu) to trigger popup on demand
    const handleManualOpen = () => {
      setIsOpen(true);
    };
    window.addEventListener("open-pwa-install", handleManualOpen);

    // 5. Auto-prompt gentle trigger for new web visitors if not standalone
    if (!isApp) {
      const dismissedTime = localStorage.getItem("ti_pwa_dismissed_at");
      const hasDismissedRecently = dismissedTime && Date.now() - Number(dismissedTime) < 12 * 60 * 60 * 1000;
      if (!hasDismissedRecently) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 3200);
        return () => {
          clearTimeout(timer);
          window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
          window.removeEventListener("appinstalled", handleAppInstalled);
          window.removeEventListener("open-pwa-install", handleManualOpen);
        };
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("open-pwa-install", handleManualOpen);
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
          setTimeout(() => setIsOpen(false), 2000);
        }
      } catch (err) {
        console.error("Install prompt error:", err);
      } finally {
        setInstalling(false);
        setDeferredPrompt(null);
      }
    } else {
      // If native prompt not available, auto-switch to detected platform tab to show exact instructions
      setActiveTab(detectedPlatform);
    }
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem("ti_pwa_dismissed_at", String(Date.now()));
    } catch {}
    setIsOpen(false);
  };

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    const url = window.location.origin + "/admin/dashboard";
    navigator.clipboard?.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  if (!mounted || !isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      onClick={handleDismiss}
      className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fadeIn"
      style={{ WebkitBackdropFilter: "blur(12px)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl sm:rounded-3xl bg-[#090d16] text-white border border-indigo-500/30 p-5 sm:p-6 shadow-2xl shadow-indigo-950/80 animate-scaleIn max-h-[92vh] overflow-y-auto crm-scrollbar select-none"
      >
        {/* Glowing Ambient Lights */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer z-20"
          aria-label="Close"
          title="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header App Identity */}
        <div className="flex items-start gap-4 pr-8">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-500 p-0.5 shadow-xl shadow-indigo-500/30 flex items-center justify-center">
              <div className="w-full h-full bg-[#050811] rounded-[14px] flex items-center justify-center overflow-hidden p-1">
                <Image
                  src="/favicon.png"
                  alt="Tech Infinix App"
                  width={48}
                  height={48}
                  className="w-10 h-10 object-contain drop-shadow-[0_2px_12px_rgba(99,102,241,0.5)]"
                />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 items-center justify-center text-[9px] text-black font-black">✓</span>
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 inline-flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-indigo-300" /> Enterprise App
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                0.8 MB • Fast
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white mt-1 tracking-tight flex items-center gap-1.5">
              <span>Tech Infinix CRM App</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Install the lightweight enterprise app for 1-tap call desk access, live WhatsApp alerts, and instant desktop &amp; mobile notifications.
            </p>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-white/10 text-[11px] text-slate-300">
          <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <PhoneCall className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="font-bold text-[10px] text-white">1-Tap Dialing</span>
            <span className="text-[9px] text-slate-400 leading-tight">Instant Lead Calls</span>
          </div>
          <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <Bell className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-bold text-[10px] text-white">Live Alerts</span>
            <span className="text-[9px] text-slate-400 leading-tight">Instant Inbound Push</span>
          </div>
          <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold text-[10px] text-white">Zero Lag</span>
            <span className="text-[9px] text-slate-400 leading-tight">Offline Auto-Sync</span>
          </div>
        </div>

        {/* Primary Action Button (If 1-Click Native Prompt Available) */}
        {deferredPrompt && !installed && (
          <div className="mt-4 pt-3 border-t border-white/10">
            <button
              onClick={handleInstallClick}
              disabled={installing}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>{installing ? "Installing Tech Infinix App..." : "Download & Install Now (1-Click)"}</span>
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-2">
              Works directly on Android, Chrome, and Windows/Mac Edge without Play Store.
            </p>
          </div>
        )}

        {/* Installed State */}
        {installed && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>App Installed Successfully! Open from your home screen or app launcher.</span>
          </div>
        )}

        {/* Platform Selection Tabs (Always available for re-download or alternative devices) */}
        <div className="mt-4 pt-3.5 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-slate-300">
              {deferredPrompt ? "Or install manually / on other devices:" : "How to install on your device:"}
            </span>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
              title="Copy App URL"
            >
              {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedLink ? "Link Copied!" : "Copy App Link"}</span>
            </button>
          </div>

          {/* Platform Switcher Buttons */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/5 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab("android")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === "android"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android</span>
            </button>
            <button
              onClick={() => setActiveTab("ios")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === "ios"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Share className="w-3.5 h-3.5" />
              <span>iPhone/iPad</span>
            </button>
            <button
              onClick={() => setActiveTab("desktop")}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === "desktop"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>PC / Laptop</span>
            </button>
          </div>

          {/* Platform Step-by-Step Instructions */}
          <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 text-xs text-slate-200">
            {activeTab === "android" && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-indigo-300 text-[11px]">
                  <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Install on Android (Chrome / Edge / Samsung Internet):</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">1</span>
                    <span>Tap the <strong>three dots (⋮)</strong> at the top-right or bottom-right of your browser.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">2</span>
                    <span>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">3</span>
                    <span>Confirm <strong>"Install"</strong> — the app icon will appear on your home screen immediately!</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "ios" && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-indigo-300 text-[11px]">
                  <Share className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Install on iPhone / iPad (Safari):</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">1</span>
                    <span>Open in <strong>Safari</strong> and tap the <strong>Share</strong> button (<Share className="w-3 h-3 inline mx-0.5 text-indigo-400" /> box with upward arrow) at the bottom toolbar.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">2</span>
                    <span>Scroll down the menu and tap <strong>"Add to Home Screen"</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">3</span>
                    <span>Tap <strong>"Add"</strong> in the top-right corner. The app will launch standalone without browser bars!</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "desktop" && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-indigo-300 text-[11px]">
                  <Laptop className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Install on Desktop / Laptop (Windows &amp; Mac):</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">1</span>
                    <span>In Chrome or Edge, look at the right end of the <strong>URL address bar</strong> for the <strong>Install icon (⊕ or computer with arrow)</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">2</span>
                    <span>Or click browser menu <strong>(⋮)</strong> &rarr; <strong>"Save and share"</strong> &rarr; <strong>"Install Tech Infinix"</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">3</span>
                    <span>Click <strong>"Install"</strong> to launch as a standalone desktop desktop window with start menu shortcut.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-white/10">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure 256-bit encrypted</span>
          </div>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
          >
            Later
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
