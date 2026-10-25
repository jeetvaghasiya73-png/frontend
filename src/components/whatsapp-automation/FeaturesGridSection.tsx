"use client";

import React from "react";
import {
  Send,
  MessageSquare,
  Database,
  PhoneCall,
  BarChart3,
  ShieldCheck,
  QrCode,
  Sliders,
  CheckCircle,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Send,
    title: "Safe WhatsApp Outreach Engine",
    subtitle: "Pacing Controls & QR Pairing",
    desc: "Connect devices seamlessly via 'Pair QR' without tedious platform approvals. Features a built-in daily pacing quota (such as 20 messages/day) and a background execution worker ('▷ Start Worker') to safeguard numbers against spam flags.",
    badges: ["Pair QR", "Quota Limits", "Background Worker", "Test Mode"],
  },
  {
    icon: MessageSquare,
    title: "Unified Omni-Channel Inbox",
    subtitle: "WhatsApp, Web Forms & Email",
    desc: "Consolidates all prospect replies into a single two-pane workspace. Filter by channel (WhatsApp, Website Inquiries, Email Replies) and segment conversations by status: Replied, Interested, Combined, or AI-tagged.",
    badges: ["Multi-Channel", "Split Pane", "Status Triage", "AI-Tagged"],
  },
  {
    icon: Database,
    title: "Multi-Source Lead Database",
    subtitle: "Google Maps Scraped + Inbound Web Inquiries",
    desc: "Ingests prospects from multiple origins with verified tags for Google Maps scraped lead batches and website contact forms. Includes search by name/city, lead scoring, and clean CSV import/export.",
    badges: ["Google Maps Pool", "Web Form Leads", "CSV Import/Export", "6-Stage Pipeline"],
  },
  {
    icon: PhoneCall,
    title: "Integrated Telecaller Call Desk",
    subtitle: "Queue Generation & Shift Progress",
    desc: "Bridges WhatsApp interest directly into live phone calls. Managers can generate queues across all telecallers or assign individual agents, monitor shift progress percentages, and track scheduled callbacks.",
    badges: ["Call Desk", "Shift Tracker", "Callback Scheduling", "Queue Dispatch"],
  },
  {
    icon: BarChart3,
    title: "Executive Reports & Audit Trails",
    subtitle: "Human & Bot Activity Telemetry",
    desc: "Full transparency over team productivity. Access the Caller Performance Leaderboard, daily activity breakdowns, and an activity audit trail with dual-actor filtering: 'All Actors (Team & Bot)'.",
    badges: ["Leaderboard", "Daily Breakdowns", "Team & Bot Audits", "CSV Export"],
  },
  {
    icon: ShieldCheck,
    title: "Anti-Spam & Health Telemetry",
    subtitle: "Built-In Account Protection",
    desc: "Avoid sudden WhatsApp suspensions. The system tracks spam and block reports in real time (blocked vs reported), monitors delivery response rates, and enforces sensible sending limits.",
    badges: ["Spam Reports (0/0)", "Delivery Health", "Paced Dispatch", "Safe Testing Mode"],
  },
];

export default function FeaturesGridSection() {
  return (
    <section className="py-20 md:py-28 border-t border-border-custom bg-background relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>Verified Capabilities</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Built for High-Velocity Lead Qualification:{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
              6 Core Engines
            </span>
          </h2>
          <p className="text-secondary-custom text-base sm:text-lg leading-relaxed">
            Every feature highlighted below is based on working screens inside the LeadFlow Enterprise CRM dashboard.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-border-custom bg-surface p-6 sm:p-7 transition-all duration-300 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform duration-200 border border-emerald-500/20">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold block mb-1">
                      {feat.subtitle}
                    </span>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {feat.title}
                    </h3>
                  </div>
                  <p className="text-secondary-custom text-xs sm:text-sm leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-border-custom">
                  <div className="flex flex-wrap gap-1.5">
                    {feat.badges.map((b, bIdx) => (
                      <span
                        key={bIdx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-background border border-border-custom text-secondary-custom"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
