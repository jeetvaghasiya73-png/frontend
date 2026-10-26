"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, X } from "lucide-react";

export default function AnnouncementBanner() {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("techinfinix_leadflow_banner_dismissed") === "true") {
        setDismissed(true);
      }
    } catch {
      // In case sessionStorage is restricted in strict privacy mode
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
      className="w-full relative z-[60] bg-gradient-to-r from-emerald-950 via-[#061d15] to-emerald-950 dark:from-[#03150e] dark:via-[#061d15] dark:to-[#03150e] text-white border-b border-emerald-500/25 shadow-[0_2px_12px_rgba(16,185,129,0.15)] backdrop-blur-xl transition-all duration-300 pointer-events-auto overflow-hidden"
      role="region"
      aria-label="Product Announcement"
    >
      {/* Top subtle highlight shimmer */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 md:px-6 py-1.5 sm:py-2 flex items-center justify-between gap-1.5 sm:gap-3 text-xs sm:text-[13px] min-w-0">
        {/* Symmetrical Left Spacer for desktop centering */}
        <div className="hidden lg:block w-7 shrink-0" aria-hidden="true" />

        {/* Center: Main Interactive Announcement Link */}
        <Link
          href="https://www.techinfinix.com/whatsapp-automation"
          className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2.5 md:gap-3 min-w-0 text-center cursor-pointer group py-0.5"
        >
          {/* Animated Pulsing Beacon + Badge */}
          <div className="inline-flex items-center gap-1 sm:gap-1.5 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-[0_0_8px_rgba(16,185,129,0.25)] whitespace-nowrap">
              COMING SOON
            </span>
          </div>

          {/* Headline Text with progressive responsive disclosure */}
          <div className="flex items-center gap-1.5 min-w-0 overflow-hidden text-emerald-50/95 font-medium">
            <span className="hidden xl:inline text-emerald-200/70 font-normal shrink-0">
              Introducing
            </span>

            {/* Truncated on mobile, full on tablet/desktop */}
            <span className="truncate font-semibold text-white tracking-tight text-[11px] sm:text-xs md:text-sm">
              <span className="sm:hidden">LeadFlow WhatsApp CRM</span>
              <span className="hidden sm:inline">LeadFlow WhatsApp Automation &amp; CRM</span>
            </span>

            {/* Desktop feature descriptor */}
            <span className="hidden md:inline text-emerald-200/70 truncate">
              — Multi-agent outreach &amp; calling desk.
            </span>
          </div>

          {/* SaaS CTA Action Trigger */}
          <div className="shrink-0 inline-flex items-center font-semibold text-emerald-400 group-hover:text-emerald-300 transition-colors">
            {/* Desktop / Tablet Pill Button */}
            <span className="hidden sm:inline-flex items-center gap-1 pl-2.5 pr-2 py-0.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#03150e] font-semibold text-[11px] md:text-xs transition-all duration-200 shadow-[0_0_12px_rgba(16,185,129,0.35)] group-hover:shadow-[0_0_18px_rgba(16,185,129,0.55)] whitespace-nowrap">
              <span>Explore Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>

            {/* Mobile Compact Badge with Arrow */}
            <span className="sm:hidden inline-flex items-center gap-0.5 pl-2 pr-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-400/30 whitespace-nowrap">
              <span>Access</span>
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>

        {/* Right: Touch-Accessible Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="w-7 h-7 sm:w-6 sm:h-6 -mr-0.5 sm:-mr-1 flex items-center justify-center rounded-full text-emerald-300/80 hover:text-white hover:bg-emerald-500/20 active:bg-emerald-500/30 transition-colors shrink-0 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-emerald-400 active:scale-90"
          title="Dismiss announcement"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom glowing highlight border */}
      <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent pointer-events-none" />
    </aside>
  );
}
