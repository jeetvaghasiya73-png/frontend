"use client";

import React from "react";
import { XCircle, CheckCircle2, ArrowRight, ArrowDown } from "lucide-react";

const beforeSteps = [
  {
    step: "1. Scattered Lead Storage",
    desc: "Leads saved in random CSVs, Google Sheets, or web forms without consolidated tracking.",
  },
  {
    step: "2. Manual Copy-Pasting",
    desc: "Typing out WhatsApp intro texts one by one from personal phones or WhatsApp Web.",
  },
  {
    step: "3. Digging Through Chats",
    desc: "Scrolling through dozens of silent threads to spot which prospect replied with interest.",
  },
  {
    step: "4. Disconnected Phone Dialing",
    desc: "Manually typing phone numbers into a separate device with zero context on prior chat replies.",
  },
  {
    step: "5. Zero Team Accountability",
    desc: "No way to verify which telecaller dialed which lead, who followed up, or overall shift progress.",
  },
];

const afterSteps = [
  {
    step: "1. Centralized Ingestion",
    desc: "Scraped pools (Google Maps) and web inquiries automatically organized in the Leads Database.",
  },
  {
    step: "2. Paced WhatsApp Outreach",
    desc: "Automated batch messaging with safety quota limits (0/20 limit), QR pairing, and background workers.",
  },
  {
    step: "3. Instant Intent Filtering",
    desc: "Interested prospects surface automatically into the 'Interested Leads' workspace.",
  },
  {
    step: "4. 1-Click Telecaller Desk",
    desc: "Leads populate the calling queue with conversation history and 1-click dial actions.",
  },
  {
    step: "5. Complete Executive Audit",
    desc: "Management analytics track dial counts, daily breakdowns, and bot vs. human activity trails.",
  },
];

export default function WorkflowComparisonSection() {
  return (
    <section className="py-20 md:py-28 border-t border-border-custom bg-surface/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-custom bg-surface text-secondary-custom text-xs font-semibold uppercase tracking-wider">
            <span>Workflow Evolution</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            The Difference:{" "}
            <span className="text-secondary-custom font-normal">Manual Chaos vs.</span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
              LeadFlow Centralization
            </span>
          </h2>
          <p className="text-secondary-custom text-base sm:text-lg leading-relaxed">
            See how centralizing outreach, conversation tracking, and phone calls into a single dashboard transforms sales operations.
          </p>
        </div>

        {/* Comparison Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Before Column */}
          <div className="rounded-3xl border border-red-500/20 bg-surface p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-red-500 dark:text-red-400 font-bold text-sm tracking-wide uppercase">
                <XCircle className="w-5 h-5 shrink-0" />
                <span>The Traditional Fragmented Process</span>
              </div>
              <p className="text-xs sm:text-sm text-secondary-custom">
                Disconnected spreadsheets, phone screens, and unmonitored WhatsApp Web tabs.
              </p>

              <div className="space-y-4 pt-4 border-t border-border-custom">
                {beforeSteps.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-500/10 text-red-500 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                      ✕
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">
                        {item.step}
                      </h4>
                      <p className="text-xs text-secondary-custom mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 font-medium">
              Result: High friction, lost leads, delayed replies, and exhausted sales callers.
            </div>
          </div>

          {/* After Column */}
          <div className="rounded-3xl border border-emerald-500/40 bg-surface p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xl shadow-emerald-500/5">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-bold text-sm tracking-wide uppercase">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>The LeadFlow Centralized Workflow</span>
              </div>
              <p className="text-xs sm:text-sm text-secondary-custom">
                One integrated workspace connecting lead data, WhatsApp messaging, and telecalling.
              </p>

              <div className="space-y-4 pt-4 border-t border-border-custom">
                {afterSteps.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20">
                      ✓
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">
                        {item.step}
                      </h4>
                      <p className="text-xs text-secondary-custom mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Result: Faster speed-to-lead, warm prospects prioritized, and telecallers dialing with full context.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
