"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import ContactSection from "@/components/sections/ContactSection";

const POPUP_DELAY = 15000;

export default function LeadPopup() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only display on public website, never on admin or dashboard routes
  const isAdminOrDashboardRoute =
    pathname?.startsWith("/admin") ||
    pathname?.includes("dashboard") ||
    pathname?.includes("techinfinix-console");

  useEffect(() => {
    setMounted(true);

    if (isAdminOrDashboardRoute) {
      setIsOpen(false);
      return;
    }

    // Frequency check
    const hasBeenShown = sessionStorage.getItem("techinfinix_popup_shown");
    const hasSubmitted = localStorage.getItem("techinfinix_submitted_lead");

    if (hasBeenShown || hasSubmitted) return;

    // Timer logic
    const timer = setTimeout(() => {
      setIsOpen(true);
      sessionStorage.setItem("techinfinix_popup_shown", "true");
    }, POPUP_DELAY);

    return () => clearTimeout(timer);
  }, [isAdminOrDashboardRoute]);

  // Keyboard navigation & body lock
  useEffect(() => {
    if (!isOpen || isAdminOrDashboardRoute) {
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
  }, [isOpen, isAdminOrDashboardRoute]);

  if (!mounted || !isOpen || isAdminOrDashboardRoute) return null;

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-popup-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px] transition-opacity duration-500 animate-in fade-in"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Modal */}
      <div 
        className="relative w-full max-w-[580px] max-h-[90vh] overflow-y-auto overflow-x-hidden overscroll-contain bg-surface border border-border-custom shadow-2xl rounded-xl transition-all duration-500 animate-in fade-in zoom-in-95 slide-in-from-bottom-4"
        style={{ animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full border border-border-custom bg-background hover:bg-surface/80 flex items-center justify-center text-foreground transition-all cursor-pointer shadow-sm"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="px-6 pt-8 pb-2 text-center border-b border-border-custom/50">
          <span className="inline-block text-[10px] uppercase tracking-widest font-mono font-bold text-secondary-custom mb-2">
            Priority Access
          </span>
          <h2 id="lead-popup-title" className="text-2xl font-bold tracking-tight text-foreground mb-1">
            Request a Free Project Audit
          </h2>
          <p className="text-xs text-secondary-custom max-w-md mx-auto">
            Share your goals below and our founder will review your project within 24 hours. No obligations.
          </p>
        </div>

        <div className="p-4 sm:p-5 pb-8 sm:pb-10">
          <ContactSection isPopup={true} />
        </div>
      </div>
    </div>
  );
}
