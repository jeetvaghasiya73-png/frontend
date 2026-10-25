"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Sparkles, X } from "lucide-react";

export default function AnnouncementBanner() {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("techinfinix_leadflow_banner_dismissed") === "true") {
        setDismissed(true);
      }
    } catch {
      // In case sessionStorage is blocked by security policy
    }
  }, []);

  // Do not show on admin or login routes
  const isAdmin =
    pathname?.startsWith("/admin") ||
    pathname?.includes("dashboard") ||
    pathname?.includes("console") ||
    pathname?.includes("login");

  if (dismissed || isAdmin) {
    return null;
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDismissed(true);
    try {
      sessionStorage.setItem("techinfinix_leadflow_banner_dismissed", "true");
    } catch {
      // Ignore
    }
  };

  return (
    <aside
      className="w-full relative z-[60] bg-gradient-to-r from-emerald-950/95 via-[#061712]/95 to-emerald-950/95 dark:from-[#03150e]/95 dark:via-[#071913]/95 dark:to-[#03150e]/95 text-white border-b border-emerald-500/25 shadow-[0_2px_15px_rgba(16,185,129,0.12)] backdrop-blur-xl transition-all duration-300 pointer-events-auto"
      role="region"
      aria-label="Product Announcement"
    >
      {/* Subtle top highlight gradient border */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2.5 text-xs sm:text-[13px]">
        {/* Left Spacer for symmetrical centering on desktop */}
        <div className="hidden md:block w-7 shrink-0" aria-hidden="true" />

        {/* Center: Main Interactive Announcement Link */}
        <Link
          href="https://www.techinfinix.com/whatsapp-automation"
          className="flex-1 flex items-center justify-center gap-2 sm:gap-3 group min-w-0 text-center cursor-pointer"
        >
          {/* Animated Pulsing Beacon + Badge */}
          <div className="inline-flex items-center gap-1.5 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-[0_0_8px_rgba(16,185,129,0.25)]">
              COMING SOON
            </span>
          </div>

          {/* Headline Text */}
          <div className="flex items-center gap-1.5 truncate sm:whitespace-normal text-emerald-50/95">
            <span className="hidden lg:inline text-emerald-200/70 font-normal">
              Introducing
            </span>
            <span className="font-semibold text-white tracking-tight">
              LeadFlow WhatsApp Automation &amp; CRM
            </span>
            <span className="hidden md:inline text-emerald-200/70">
              — Multi-agent outreach, live chats &amp; telecalling desk.
            </span>
          </div>

          {/* SaaS CTA Pill Button */}
          <div className="shrink-0 inline-flex items-center gap-1 pl-2.5 pr-2 py-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#03150e] font-semibold text-[11px] sm:text-xs transition-all duration-200 shadow-[0_0_12px_rgba(16,185,129,0.35)] group-hover:shadow-[0_0_18px_rgba(16,185,129,0.55)]">
            <span>Explore Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </div>
        </Link>

        {/* Right: Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="p-1 rounded-full text-emerald-300/80 hover:text-white hover:bg-emerald-500/20 transition-colors shrink-0 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-emerald-400"
          title="Dismiss announcement"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Subtle bottom glow highlight */}
      <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
    </aside>
  );
}
