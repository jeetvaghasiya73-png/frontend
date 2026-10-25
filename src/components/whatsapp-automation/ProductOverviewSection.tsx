"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  PhoneCall,
  Database,
  Heart,
  MessageSquare,
  BarChart2,
  Users,
  Send,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";

const navigationModules = [
  {
    category: "CORE CRM",
    items: [
      {
        icon: LayoutDashboard,
        name: "Dashboard",
        desc: "High-level lead pipeline overview across 6 distinct stages: New, Contacted, Interested, Qualified, Converted, and Lost.",
        tag: "Live Pipeline",
      },
      {
        icon: PhoneCall,
        name: "My Call Desk",
        desc: "Individual sales caller workspace with structured pending queues, shift progress tracking, and 1-click dial action.",
        tag: "Queue",
      },
      {
        icon: Database,
        name: "Leads Database",
        desc: "Central repository consolidating outbound scraped prospects (e.g. Google Maps) and inbound inquiries from web forms.",
        tag: "Multi-Source",
      },
      {
        icon: Heart,
        name: "Interested Leads",
        desc: "Filtered status view isolating high-intent prospects contacted via WhatsApp and phone calls for immediate sales focus.",
        tag: "High Intent",
      },
      {
        icon: MessageSquare,
        name: "Messages Inbox",
        desc: "Omni-channel inbox managing WhatsApp conversations, website inquiries, and email replies in a single split-pane interface.",
        tag: "Unified",
      },
    ],
  },
  {
    category: "TELECALLING & SALES",
    items: [
      {
        icon: BarChart2,
        name: "Calling Reports",
        desc: "Executive productivity analytics tracking caller dials, conversation rates, leaderboard rankings, and activity audit trails.",
        tag: "Admin",
      },
      {
        icon: Users,
        name: "Sales Leads Pool",
        desc: "Team queue distribution engine enabling managers to generate balanced call batches across all active telecallers.",
        tag: "Team Queue",
      },
    ],
  },
  {
    category: "AUTOMATION & TOOLS",
    items: [
      {
        icon: Send,
        name: "WhatsApp Outreach",
        desc: "Multi-channel automated outreach engine with QR code device pairing, safe daily quota pacing, test mode, and background workers.",
        tag: "Active Engine",
      },
    ],
  },
];

export default function ProductOverviewSection({
  onOpenLightbox,
}: {
  onOpenLightbox: (index: number) => void;
}) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="py-20 md:py-28 border-t border-border-custom bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Product Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            One Unified Workspace:{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
              LeadFlow Enterprise CRM
            </span>
          </h2>
          <p className="text-secondary-custom text-base sm:text-lg leading-relaxed">
            LeadFlow replaces disconnected spreadsheets and browser tabs with a purpose-built system designed to guide prospects from initial WhatsApp outreach directly into closed deals.
          </p>
        </div>

        {/* Content Layout: Real Sidebar & Module Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Real Sidebar Interface Screenshot */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-border-custom bg-surface p-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-custom text-xs font-medium text-secondary-custom">
                <span>Verified System Navigation</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">Real UI Asset</span>
              </div>
              <div
                onClick={() => onOpenLightbox(8)}
                className="relative rounded-xl overflow-hidden border border-border-custom bg-background aspect-[1/2] sm:aspect-[3/5] cursor-zoom-in group"
              >
                <Image
                  src="/screenshots/whatsapp-automation/leadflow-navigation-sidebar.png"
                  alt="LeadFlow Enterprise CRM navigation sidebar showing Core CRM, Telecalling & Sales, and Automation & Tools"
                  fill
                  sizes="(max-width: 1024px) 100vw, 400px"
                  className="object-contain object-top transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <span className="px-3 py-1.5 rounded-md bg-surface text-foreground text-xs font-medium border border-border-custom shadow-md">
                    Click to Zoom
                  </span>
                </div>
              </div>
              <p className="text-center text-xs text-secondary-custom mt-3">
                Source: LeadFlow navigation architecture as seen in product screenshot.
              </p>
            </div>
          </div>

          {/* Right: Module Deep-Dive Tabs & Verified Details */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border border-border-custom bg-surface p-6 sm:p-8 shadow-sm">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span>Three Core Workspaces Inside One Dashboard</span>
              </h3>

              <div className="space-y-8">
                {navigationModules.map((module, modIdx) => (
                  <div key={modIdx} className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border-b border-border-custom pb-2">
                      <span>{module.category}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {module.items.map((item, itemIdx) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={itemIdx}
                            className="p-4 rounded-xl border border-border-custom bg-background/50 hover:bg-background transition-all duration-200 space-y-2 group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <h4 className="font-semibold text-foreground text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                  {item.name}
                                </h4>
                              </div>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-border-custom bg-surface text-secondary-custom">
                                {item.tag}
                              </span>
                            </div>
                            <p className="text-xs text-secondary-custom leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
