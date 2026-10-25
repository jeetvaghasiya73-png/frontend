"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
  CheckCircle2,
} from "lucide-react";

export interface ScreenshotItem {
  id: string;
  title: string;
  category: "pipeline" | "whatsapp" | "telecalling";
  categoryLabel: string;
  badge: string;
  src: string;
  aspect: string;
  caption: string;
  visibleFeatures: string[];
}

export const screenshotsList: ScreenshotItem[] = [
  {
    id: "lead-management-pipeline",
    title: "Lead Management & Deals Pipeline Overview",
    category: "pipeline",
    categoryLabel: "Lead Pipeline",
    badge: "LIVE Pipeline",
    src: "/screenshots/whatsapp-automation/lead-management-pipeline.png",
    aspect: "aspect-[16/9]",
    caption:
      "The primary Lead Management workspace showcasing 1,093 Total Leads, MoM growth metrics, 6 deals pipeline stages (New, Contacted, Interested, Qualified, Converted, Lost), segment filters, and multi-field lead table.",
    visibleFeatures: [
      "Deals Pipeline Overview with 6 live stages",
      "Total Leads KPI (1,093 +12.5% MoM)",
      "Segment Tabs: Inbound Inquiries, Scraped Pool, Messages Sent",
      "Lead Actions: Call Desk, Hot Deals, WhatsApp, Chime",
    ],
  },
  {
    id: "team-telecaller-desk",
    title: "Team Overview (All Telecallers) & Desk Queue",
    category: "telecalling",
    categoryLabel: "Sales Calling",
    badge: "Live Desk",
    src: "/screenshots/whatsapp-automation/team-telecaller-desk.png",
    aspect: "aspect-[16/9]",
    caption:
      "Telecaller Desk Queue providing supervisor oversight. Manage individual and team queues, monitor dial progress, inspect shift completion percentages (0%), and generate fresh call batches.",
    visibleFeatures: [
      "Select Individual Telecaller vs Team Queue",
      "Pending to Dial, Contacted, and Converted Hot metrics",
      "Shift Progress tracker with ratio counter",
      "Generate New Call Queue action button",
    ],
  },
  {
    id: "leads-database-sources",
    title: "Leads Database & Ingestion Sources",
    category: "pipeline",
    categoryLabel: "Lead Pipeline",
    badge: "Multi-Source",
    src: "/screenshots/whatsapp-automation/leads-database-sources.png",
    aspect: "aspect-[16/8]",
    caption:
      "Central database separating outbound scraped pools (tagged with Google Maps badge) from inbound website inquiries (tagged with Web Forms badge), featuring lead scoring and CSV controls.",
    visibleFeatures: [
      "Outbound Scraped badge (Google Maps source)",
      "Inbound Inquiries badge (Web Forms source)",
      "Email capture quality indicators",
      "Search by name, email, city with status filters",
    ],
  },
  {
    id: "interested-leads-filter",
    title: "Interested Leads Filter & Intent Tracking",
    category: "pipeline",
    categoryLabel: "Lead Pipeline",
    badge: "High Intent",
    src: "/screenshots/whatsapp-automation/interested-leads-filter.png",
    aspect: "aspect-[16/8]",
    caption:
      "Filtered status view for prospects contacted via WhatsApp and Sales Calling who express genuine interest, allowing teams to bypass silent chats and focus exclusively on warm leads.",
    visibleFeatures: [
      "Interested Leads priority view (green heart badge)",
      "Search by phone, business, city, category",
      "Direct link to Sales Call Queue",
      "Quick status toggle: Contacted Leads & All Contacts",
    ],
  },
  {
    id: "unified-message-center",
    title: "Unified Message Center & Omni-Channel Inbox",
    category: "whatsapp",
    categoryLabel: "WhatsApp & Inbox",
    badge: "Omni-Channel",
    src: "/screenshots/whatsapp-automation/unified-message-center.png",
    aspect: "aspect-[16/9]",
    caption:
      "Two-pane conversation center managing WhatsApp chats, Website contact inquiries, and Email replies. Enables real-time chat sync, message thread inspection, and status filtering.",
    visibleFeatures: [
      "All Channels, WhatsApp, Web Inquiries, and Email Replies tabs",
      "Status Pills: All Statuses, Replied, Interested, Combined",
      "Thread viewer with full prospect conversation history",
      "Quick Sync and Clear History management actions",
    ],
  },
  {
    id: "telecalling-executive-reports",
    title: "Telecalling Executive Reports & Analytics",
    category: "telecalling",
    categoryLabel: "Sales Calling",
    badge: "Management",
    src: "/screenshots/whatsapp-automation/telecalling-executive-reports.png",
    aspect: "aspect-[16/9]",
    caption:
      "Deep executive analytics tracking calls logged, call clicks, WhatsApp clicks, interest conversion rates, active telecaller leaderboard, and an audit trail with 'All Actors (Team & Bot)' filtering.",
    visibleFeatures: [
      "Metrics: Calls Logged, Call Clicks, WA Clicks, Interested Won",
      "Caller Performance Leaderboard",
      "Daily Calling Activity Breakdown",
      "Activity Audit Trail with Team & Bot actor filter",
    ],
  },
  {
    id: "sales-calling-queue",
    title: "Sales Calling Queue & Direct Dial Desk",
    category: "telecalling",
    categoryLabel: "Sales Calling",
    badge: "Active Queue",
    src: "/screenshots/whatsapp-automation/sales-calling-queue.png",
    aspect: "aspect-[16/6]",
    caption:
      "Individual sales caller queue displaying Pending (New), Contacted, and Interested prospects with 1-click transitions to My Call Desk and phone numbers ready to dial.",
    visibleFeatures: [
      "Pending (New) queue filter",
      "Direct link to My Call Desk & Interested Page",
      "Search by phone, name, city, service",
      "Real-time empty queue indicator ('All Caught Up!')",
    ],
  },
  {
    id: "whatsapp-outreach-engine",
    title: "WhatsApp Outreach Engine & Performance Console",
    category: "whatsapp",
    categoryLabel: "WhatsApp & Inbox",
    badge: "Connected & Live",
    src: "/screenshots/whatsapp-automation/whatsapp-outreach-engine.png",
    aspect: "aspect-[16/9]",
    caption:
      "Outreach command center featuring instant QR device pairing ('Pair QR'), safe pacing limit controls (0/20 limit), test mode toggle, test send dispatch, anti-spam telemetry, and background worker runners.",
    visibleFeatures: [
      "Pair QR device linking button",
      "Safety Quota: 0/20 limit remaining today",
      "Test Mode toggle and Send Test dispatch button",
      "Background worker runner ('▷ Start Worker')",
      "WhatsApp Inbox with 🤖 AI triage pill",
      "Spam & Block Reports tracker (0 blocked • 0 reported)",
    ],
  },
  {
    id: "leadflow-navigation-sidebar",
    title: "LeadFlow Enterprise CRM Navigation Architecture",
    category: "whatsapp",
    categoryLabel: "WhatsApp & Inbox",
    badge: "Architecture",
    src: "/screenshots/whatsapp-automation/leadflow-navigation-sidebar.png",
    aspect: "aspect-[1/2]",
    caption:
      "The complete module tree of LeadFlow Enterprise CRM: Core CRM (Dashboard, My Call Desk, Leads Database, Interested Leads, Messages Inbox), Telecalling & Sales (Calling Reports, Sales Leads Pool), and Automation & Tools (WhatsApp Outreach).",
    visibleFeatures: [
      "LeadFlow Enterprise CRM brand & lightning badge",
      "Core CRM modules with Queue badges",
      "Telecalling & Sales modules with Admin badges",
      "WhatsApp Outreach automation module (Active)",
    ],
  },
];

export default function ScreenshotGallery({
  activeLightboxIndex,
  onOpenLightbox,
  onCloseLightbox,
}: {
  activeLightboxIndex: number | null;
  onOpenLightbox: (index: number) => void;
  onCloseLightbox: () => void;
}) {
  const [filter, setFilter] = useState<"all" | "pipeline" | "whatsapp" | "telecalling">("all");

  const filteredScreenshots =
    filter === "all"
      ? screenshotsList
      : screenshotsList.filter((s) => s.category === filter);

  // Keyboard navigation for lightbox
  React.useEffect(() => {
    if (activeLightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseLightbox();
      } else if (e.key === "ArrowRight") {
        onOpenLightbox((activeLightboxIndex + 1) % screenshotsList.length);
      } else if (e.key === "ArrowLeft") {
        onOpenLightbox((activeLightboxIndex - 1 + screenshotsList.length) % screenshotsList.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeLightboxIndex, onCloseLightbox, onOpenLightbox]);

  return (
    <section id="gallery" className="py-20 md:py-28 border-t border-border-custom bg-surface/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Interactive UI Gallery</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Explore the Real Dashboard:{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
              9 Verified Screens
            </span>
          </h2>
          <p className="text-secondary-custom text-base sm:text-lg leading-relaxed">
            No stock illustrations or concept mockups. Every image below captures working interfaces inside our production dashboard.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-12">
          {[
            { id: "all", label: "All Screenshots (9)" },
            { id: "pipeline", label: "Lead Pipeline & DB (3)" },
            { id: "whatsapp", label: "WhatsApp & Inbox (3)" },
            { id: "telecalling", label: "Sales Calling & Reports (3)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                filter === tab.id
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-surface border border-border-custom text-secondary-custom hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Screenshot Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredScreenshots.map((item) => {
            const originalIndex = screenshotsList.findIndex((s) => s.id === item.id);
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-border-custom bg-surface overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Screenshot Thumbnail with zoom trigger */}
                  <div
                    onClick={() => onOpenLightbox(originalIndex)}
                    className="relative bg-background overflow-hidden aspect-[16/10] cursor-zoom-in border-b border-border-custom"
                  >
                    <Image
                      src={item.src}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <span className="px-3 py-1.5 rounded-lg bg-surface/90 text-foreground text-xs font-semibold shadow-md backdrop-blur-md flex items-center gap-1.5 border border-border-custom">
                        <Maximize2 className="w-3.5 h-3.5 text-emerald-500" />
                        Click to Enlarge
                      </span>
                    </div>

                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-surface/90 border border-border-custom text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400 backdrop-blur-sm">
                      {item.badge}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-2.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-secondary-custom font-semibold">
                      {item.categoryLabel}
                    </span>
                    <h3 className="text-base font-bold text-foreground leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-secondary-custom line-clamp-3 leading-relaxed">
                      {item.caption}
                    </p>
                  </div>
                </div>

                {/* Card Footer Feature Highlights */}
                <div className="px-5 pb-5 pt-2 border-t border-border-custom/50">
                  <div className="text-[11px] text-foreground font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">{item.visibleFeatures[0]}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {activeLightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={onCloseLightbox}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-surface border border-border-custom overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-border-custom bg-surface text-foreground">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {screenshotsList[activeLightboxIndex].badge}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-foreground truncate max-w-[280px] sm:max-w-md">
                  {screenshotsList[activeLightboxIndex].title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-secondary-custom hidden sm:inline">
                  {activeLightboxIndex + 1} / {screenshotsList.length}
                </span>
                <button
                  onClick={onCloseLightbox}
                  className="p-1.5 rounded-lg border border-border-custom hover:bg-background text-secondary-custom hover:text-foreground transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Image Viewport */}
            <div className="relative flex-1 bg-background min-h-[300px] sm:min-h-[460px] overflow-auto flex items-center justify-center p-2 sm:p-4">
              <div className="relative w-full h-[50vh] sm:h-[60vh] max-h-[600px]">
                <Image
                  src={screenshotsList[activeLightboxIndex].src}
                  alt={screenshotsList[activeLightboxIndex].title}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </div>

              {/* Prev / Next Buttons */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenLightbox(
                    (activeLightboxIndex - 1 + screenshotsList.length) % screenshotsList.length
                  );
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-surface/90 border border-border-custom text-foreground hover:bg-surface shadow-lg transition-transform active:scale-95 cursor-pointer"
                aria-label="Previous screenshot"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenLightbox((activeLightboxIndex + 1) % screenshotsList.length);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-surface/90 border border-border-custom text-foreground hover:bg-surface shadow-lg transition-transform active:scale-95 cursor-pointer"
                aria-label="Next screenshot"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Caption & Details */}
            <div className="p-4 sm:p-6 border-t border-border-custom bg-surface space-y-3">
              <p className="text-xs sm:text-sm text-secondary-custom leading-relaxed">
                {screenshotsList[activeLightboxIndex].caption}
              </p>
              <div className="pt-2 border-t border-border-custom/50">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-foreground block mb-1.5">
                  Verified Features in this Screen:
                </span>
                <div className="flex flex-wrap gap-2">
                  {screenshotsList[activeLightboxIndex].visibleFeatures.map((f, fIdx) => (
                    <span
                      key={fIdx}
                      className="text-[11px] px-2.5 py-1 rounded-md bg-background border border-border-custom text-foreground flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{f}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
