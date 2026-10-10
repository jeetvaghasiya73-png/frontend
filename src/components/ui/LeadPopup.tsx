"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import ContactSection from "@/components/sections/ContactSection";

// Show popup after user spends 7 seconds (5-10s window) on the website
const POPUP_DELAY = 7000;

export default function LeadPopup() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Strict check: ONLY show on public website pages, NEVER on admin or dashboard routes
  const checkIsAdminOrDashboard = useCallback(() => {
    const nextPath = (pathname || "").toLowerCase();
    const winPath = typeof window !== "undefined" ? window.location.pathname.toLowerCase() : "";
    const winHash = typeof window !== "undefined" ? window.location.hash.toLowerCase() : "";

    const forbiddenTokens = [
      "/admin",
      "dashboard",
      "techinfinix-console",
      "console",
      "/login",
    ];

    const isNextForbidden = forbiddenTokens.some((t) => nextPath.includes(t));
    const isWinForbidden = forbiddenTokens.some((t) => winPath.includes(t) || winHash.includes(t));

    return isNextForbidden || isWinForbidden;
  }, [pathname]);

  const isAdminOrDashboard = checkIsAdminOrDashboard();

  useEffect(() => {
    setMounted(true);

    // If on admin or dashboard, keep closed and cancel any pending triggers
    if (isAdminOrDashboard) {
      setIsOpen(false);
      return;
    }

    // Frequency check: once per session, and never if lead already submitted
    const hasBeenShown = sessionStorage.getItem("techinfinix_popup_shown");
    const hasSubmitted = localStorage.getItem("techinfinix_submitted_lead");

    if (hasBeenShown || hasSubmitted) return;

    // Trigger popup after 5-10s engagement (7 seconds)
    const timer = setTimeout(() => {
      // Re-verify route before opening in case user navigated during delay
      if (!checkIsAdminOrDashboard()) {
        setIsOpen(true);
        sessionStorage.setItem("techinfinix_popup_shown", "true");
      }
    }, POPUP_DELAY);

    return () => clearTimeout(timer);
  }, [isAdminOrDashboard, checkIsAdminOrDashboard]);

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    if (!isOpen || isAdminOrDashboard) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, isAdminOrDashboard]);

  // If unmounted, closed, or on any admin/dashboard route, render nothing
  if (!mounted || !isOpen || isAdminOrDashboard) return null;

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
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Responsive Modal Container */}
      <div
        className="relative w-full max-w-[560px] max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden bg-surface border border-border-custom shadow-2xl rounded-2xl transition-all duration-300 animate-in fade-in zoom-in-95 slide-in-from-bottom-3"
        style={{ animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {/* Close Button - elevated touch target */}
        <button
          onClick={() => setIsOpen(false)}
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

        {/* Scrollable Form Body with clean scrollbar */}
        <div className="p-3.5 sm:p-5 pb-6 sm:pb-8 overflow-y-auto overscroll-contain flex-1">
          <ContactSection isPopup={true} />
        </div>
      </div>
    </div>
  );
}
