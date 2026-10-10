"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import ContactSection from "@/components/sections/ContactSection";

// Show popup after user spends 6 seconds (5 to 10s timeframe) on the website
const POPUP_DELAY = 6000;

export default function LeadPopup() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if current route is an admin, dashboard, or console route
  const isDashboardRoute = () => {
    const currentPath = (pathname || "").toLowerCase();
    const winPath = typeof window !== "undefined" ? window.location.pathname.toLowerCase() : "";
    const winHash = typeof window !== "undefined" ? window.location.hash.toLowerCase() : "";

    const forbidden = ["/admin", "dashboard", "techinfinix-console", "console", "/login"];
    return forbidden.some(
      (f) => currentPath.includes(f) || winPath.includes(f) || winHash.includes(f)
    );
  };

  const isAdmin = isDashboardRoute();

  useEffect(() => {
    setMounted(true);

    // If on admin or dashboard, immediately hide and clear any timer
    if (isAdmin) {
      setIsOpen(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    // If user already closed the popup in this current page view, do not re-open
    if (dismissed) return;

    // Clear previous timer if any
    if (timerRef.current) clearTimeout(timerRef.current);

    // Start 6-second timer for users on the website
    timerRef.current = setTimeout(() => {
      if (!isDashboardRoute() && !dismissed) {
        setIsOpen(true);
      }
    }, POPUP_DELAY);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname, isAdmin, dismissed]);

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    if (!isOpen || isAdmin) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setDismissed(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, isAdmin]);

  const handleClose = () => {
    setIsOpen(false);
    setDismissed(true);
  };

  // Never render on admin or dashboard routes, or when not open
  if (!mounted || !isOpen || isAdmin) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-2.5 sm:p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-popup-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[3px] transition-opacity duration-300 animate-in fade-in cursor-pointer"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Responsive Modal Container */}
      <div
        className="relative w-full max-w-[560px] max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden bg-surface border border-border-custom shadow-2xl rounded-2xl transition-all duration-300 animate-in fade-in zoom-in-95 slide-in-from-bottom-3"
        style={{ animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full border border-border-custom bg-background/90 hover:bg-surface flex items-center justify-center text-foreground transition-all cursor-pointer shadow-sm active:scale-95"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="px-5 sm:px-6 pt-6 sm:pt-7 pb-2.5 text-center border-b border-border-custom/50 shrink-0">
          <span className="inline-block text-[10px] uppercase tracking-widest font-mono font-bold text-secondary-custom mb-1.5">
            Priority Access
          </span>
          <h2
            id="lead-popup-title"
            className="text-lg sm:text-2xl font-bold tracking-tight text-foreground mb-1 leading-snug"
          >
            Request a Free Project Audit
          </h2>
          <p className="text-[11px] sm:text-xs text-secondary-custom max-w-md mx-auto leading-relaxed">
            Share your goals below and our founder will review your project within 24 hours. No obligations.
          </p>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-3.5 sm:p-5 pb-6 sm:pb-8 overflow-y-auto overscroll-contain flex-1">
          <ContactSection isPopup={true} />
        </div>
      </div>
    </div>
  );
}
