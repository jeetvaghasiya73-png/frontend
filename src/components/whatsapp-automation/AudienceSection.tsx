"use client";

import React from "react";
import {
  Briefcase,
  Users,
  Building,
  Target,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const audiences = [
  {
    icon: Target,
    title: "Lead Generation & Outreach Agencies",
    desc: "Run client outreach campaigns, track delivery and response metrics, isolate interested leads, and hand clean call batches to clients or account executives.",
    highlights: ["Multi-client pipeline tracking", "Daily pacing controls", "CSV export for reports"],
  },
  {
    icon: Users,
    title: "Inside Sales & Telecalling Teams",
    desc: "Equip callers with a dedicated 'My Call Desk' where every lead comes with prior WhatsApp context, organized into pending and callback queues.",
    highlights: ["Individual & team queues", "Shift progress percentage", "Audit trail visibility"],
  },
  {
    icon: Building,
    title: "High-Ticket Service Businesses",
    desc: "Real estate brokers, clinic consultants, coaching academies, and financial advisors who need fast speed-to-lead on inbound and outbound inquiries.",
    highlights: ["Fast speed-to-lead", "Omni-channel message triage", "Interested prospect alerts"],
  },
  {
    icon: Briefcase,
    title: "Growing SMBs Scaling WhatsApp Sales",
    desc: "Businesses upgrading from personal phones and chaotic group chats to a professional CRM workspace built specifically for WhatsApp workflows.",
    highlights: ["Fast QR device pairing", "Anti-spam telemetry", "Clean centralized records"],
  },
];

export default function AudienceSection() {
  return (
    <section className="py-20 md:py-28 border-t border-border-custom bg-background relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Target Audiences</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Who Benefits Most from{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
              LeadFlow CRM?
            </span>
          </h2>
          <p className="text-secondary-custom text-base sm:text-lg leading-relaxed">
            Designed for businesses where WhatsApp messaging and phone calls are central to closing high-value deals.
          </p>
        </div>

        {/* 4 Audience Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {audiences.map((aud, idx) => {
            const Icon = aud.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl border border-border-custom bg-surface p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:border-emerald-500/30 hover:shadow-xl group"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    {aud.title}
                  </h3>
                  <p className="text-secondary-custom text-sm leading-relaxed">
                    {aud.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-border-custom">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-secondary-custom font-semibold block mb-2">
                    Key Advantages:
                  </span>
                  <div className="space-y-1.5">
                    {aud.highlights.map((h, hIdx) => (
                      <div key={hIdx} className="flex items-center gap-2 text-xs text-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{h}</span>
                      </div>
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
