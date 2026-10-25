"use client";

import React from "react";
import Image from "next/image";
import {
  ArrowRight,
  Sparkles,
  Zap,
  PhoneCall,
  CheckCircle2,
  ShieldCheck,
  Bot,
  Users,
  Compass,
} from "lucide-react";

export default function WhatsAppHero({
  onOpenLightbox,
}: {
  onOpenLightbox: (index: number) => void;
}) {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative pt-32 md:pt-40 pb-20 md:pb-28 overflow-hidden">
      {/* Ambient background glows */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[900px] h-[400px] md:h-[500px] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-accent-glow rounded-full blur-[100px] pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header & Copy */}
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-medium tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold uppercase tracking-wider text-[11px]">Coming Soon</span>
            <span className="text-foreground/30">•</span>
            <span>Early Access Opening for LeadFlow</span>
          </div>

          {/* Primary H1 Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.12]">
            Turn WhatsApp Leads Into{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-500">
              Conversations Your Team Can Close
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl text-secondary-custom max-w-3xl mx-auto leading-relaxed">
            A centralized dashboard connecting WhatsApp outreach, omni-channel conversation management, interested prospect detection, and a dedicated sales calling desk. Move from cold prospects to live phone calls without switching tools.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => scrollToSection("early-access")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all duration-200 active:scale-[0.98] cursor-pointer"
            >
              <span>Get Early Access</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => scrollToSection("how-it-works")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-border-custom bg-surface hover:bg-surface/80 text-foreground font-medium text-sm transition-all duration-200 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Explore Live Workflows</span>
            </button>
          </div>

          {/* Micro trust indicators */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-secondary-custom">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Built on Real Interface Evidence</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Safe Sending Pacing & Anti-Spam</span>
            </div>
            <div className="flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Dedicated Telecaller Call Desk</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Visual: Product Dashboard Mockup */}
        <div className="mt-12 sm:mt-16 relative max-w-6xl mx-auto">
          {/* Glowing framing container */}
          <div className="relative rounded-2xl md:rounded-3xl border border-border-custom bg-surface/90 shadow-2xl shadow-emerald-500/5 backdrop-blur-xl overflow-hidden p-2 sm:p-3">
            {/* Window title bar */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-border-custom bg-surface/50 text-xs text-secondary-custom mb-2 rounded-t-xl">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 font-mono text-[11px] hidden sm:inline text-secondary-custom/80">
                  LeadFlow CRM • Enterprise Workspace
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-background border border-border-custom font-mono text-[11px]">
                <span className="text-emerald-500">●</span>
                <span className="truncate max-w-[200px] sm:max-w-none">app.leadflow.internal/dashboard/lead-management</span>
              </div>
              <button
                onClick={() => onOpenLightbox(0)}
                className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer hidden sm:inline-flex items-center gap-1"
              >
                <span>Enlarge View</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Dashboard Visual Container */}
            <div
              onClick={() => onOpenLightbox(0)}
              className="relative rounded-xl overflow-hidden cursor-zoom-in group border border-border-custom/80 aspect-[16/9] sm:aspect-[16/10] bg-background"
            >
              <Image
                src="/screenshots/whatsapp-automation/lead-management-pipeline.png"
                alt="LeadFlow Lead Management Dashboard showing pipeline stages and outreach metrics"
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.015]"
              />

              {/* Hover Overlay Hint */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                <span className="px-4 py-2 rounded-lg bg-surface/90 text-foreground text-xs font-semibold shadow-lg backdrop-blur-md flex items-center gap-2 border border-border-custom">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  Click to inspect full resolution screenshot
                </span>
              </div>

              {/* Floating feature pills highlighting real UI details */}
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 hidden sm:flex items-center gap-2 bg-surface/95 dark:bg-surface/90 border border-border-custom px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-md text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-foreground">1,093 Total Prospects</span>
                <span className="text-secondary-custom">•</span>
                <span className="text-secondary-custom">6 Pipeline Stages</span>
              </div>

              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 hidden sm:flex items-center gap-2 bg-surface/95 dark:bg-surface/90 border border-border-custom px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-md text-xs">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-medium text-foreground">Live Telecalling Queue + WhatsApp Hub</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
