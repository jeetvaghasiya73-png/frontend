"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Database,
  Send,
  MessageSquare,
  Heart,
  PhoneCall,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  QrCode,
  Sliders,
} from "lucide-react";

interface StepData {
  number: string;
  stepTag: string;
  title: string;
  benefit: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  galleryIndex: number;
  uiCallouts: { label: string; detail: string }[];
}

const steps: StepData[] = [
  {
    number: "01",
    stepTag: "Lead Ingestion",
    title: "Import & Centralize Prospects from Multiple Channels",
    benefit: "Eliminates disjointed spreadsheets by unifying inbound inquiries and scraped prospect lists in one database.",
    description:
      "Bring lead data directly into the Leads Database. The interface provides built-in categorization for outbound prospects (including verified Google Maps scraping pools) and inbound website inquiries, with status tracking, scoring, and CSV export/import controls.",
    imageSrc: "/screenshots/whatsapp-automation/leads-database-sources.png",
    imageAlt: "LeadFlow Leads Database interface showing Google Maps outbound scraped pool and web form inquiries",
    galleryIndex: 2,
    uiCallouts: [
      { label: "Google Maps Outbound Badge", detail: "Segment and manage scraped prospect records" },
      { label: "Web Forms Inbound Badge", detail: "Capture website inquiries into the same pipeline" },
      { label: "Import & Export Controls", detail: "Clean CSV data exchange with 1-click export" },
    ],
  },
  {
    number: "02",
    stepTag: "Automated Outreach",
    title: "Initiate WhatsApp Outreach with Account Safety Controls",
    benefit: "Protects business phone numbers with built-in daily pacing allowances, QR device pairing, and background workers.",
    description:
      "Connect your WhatsApp account using direct QR pairing ('Pair QR'). Configure outreach with safe message limits (such as a 20-message daily allowance to prevent spam flags), preview messages in Test Mode, send test dispatches, and trigger background worker execution ('▷ Start Worker').",
    imageSrc: "/screenshots/whatsapp-automation/whatsapp-outreach-engine.png",
    imageAlt: "WhatsApp Outreach & Performance dashboard showing Pair QR, safety limits, test mode, and worker controls",
    galleryIndex: 7,
    uiCallouts: [
      { label: "Pair QR Device Pairing", detail: "Fast phone link without complex API approvals" },
      { label: "Safety Quota Limits (0/20)", detail: "Daily pacing controller prevents spam triggers" },
      { label: "Background Worker ('▷ Start Worker')", detail: "Autonomous execution of queued outreach batches" },
      { label: "Test Mode & Test Send", detail: "Verify message formatting before live broadcast" },
    ],
  },
  {
    number: "03",
    stepTag: "Unified Inbox",
    title: "Manage Conversations Across WhatsApp, Web & Email",
    benefit: "Consolidates all prospect replies into a single split-pane conversation view so your team never misses an inquiry.",
    description:
      "When prospects respond to outreach messages, incoming chats appear in the Unified Message Center. Filter seamlessly between All Channels, WhatsApp, Website Inquiries, and Email Replies. Status tags allow reps to filter for Replied, Interested, Combined, or AI-triaged conversations.",
    imageSrc: "/screenshots/whatsapp-automation/unified-message-center.png",
    imageAlt: "LeadFlow Unified Message Center with WhatsApp, Web Inquiries, and Email filter pills",
    galleryIndex: 4,
    uiCallouts: [
      { label: "Omni-Channel Filter Pills", detail: "Switch between WhatsApp, Web, and Email instantly" },
      { label: "Conversation Status Triage", detail: "Filter by Replied, Interested, Combined, or AI" },
      { label: "Split-Pane View", detail: "Browse message list on left, inspect full thread on right" },
    ],
  },
  {
    number: "04",
    stepTag: "Intent Prioritization",
    title: "Automatically Isolate High-Intent Interested Prospects",
    benefit: "Saves hours of manual chat review by identifying warm leads and filtering them into a dedicated priority view.",
    description:
      "Instead of forcing sales representatives to open hundreds of silent chats, LeadFlow highlights prospects who express genuine interest. The Interested Leads dashboard provides a dedicated view where reps can search by phone, business, city, or category, and jump straight into follow-up action.",
    imageSrc: "/screenshots/whatsapp-automation/interested-leads-filter.png",
    imageAlt: "Interested Leads filtered status view isolating high-intent prospects",
    galleryIndex: 3,
    uiCallouts: [
      { label: "Interested Leads Status View", detail: "Zeroes in on warm replies needing human attention" },
      { label: "Multi-Field Search", detail: "Find leads by phone number, company, city, or category" },
      { label: "Direct Call Queue Link", detail: "One click jumps directly to the Sales Call Queue" },
    ],
  },
  {
    number: "05",
    stepTag: "Telecalling Desk",
    title: "Dispatch Follow-Up Calls Through the Calling Queue",
    benefit: "Closes the loop from WhatsApp message to live phone conversation with structured call queues and shift tracking.",
    description:
      "Turn verified interest into completed sales calls. The Sales Calling workspace and Telecaller Desk allow managers to generate calling queues, assign them to individual reps or the entire team, monitor dial progress, track callbacks, and review audit trails.",
    imageSrc: "/screenshots/whatsapp-automation/team-telecaller-desk.png",
    imageAlt: "Team Overview All Telecallers live desk with queue generation and progress tracking",
    galleryIndex: 1,
    uiCallouts: [
      { label: "Queue Dispatch Engine", detail: "Generate and distribute call batches with '+ Generate Queue'" },
      { label: "Shift Progress Tracker (0/0)", detail: "Real-time visibility into completed dials and pending leads" },
      { label: "Telecaller Audit Trails", detail: "Review individual caller activity and executive reports" },
    ],
  },
];

export default function HowItWorksSection({
  onOpenLightbox,
}: {
  onOpenLightbox: (index: number) => void;
}) {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="how-it-works" className="py-20 md:py-28 border-t border-border-custom bg-surface/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5" />
            <span>End-to-End Workflow</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            How LeadFlow Works in Practice:{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
              5 Verified Steps
            </span>
          </h2>
          <p className="text-secondary-custom text-base sm:text-lg leading-relaxed">
            Every step is grounded directly in our production screenshots—guiding your team from raw lead ingestion to closed phone sales.
          </p>
        </div>

        {/* Step Navigation Pills for quick jump */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-12 scrollbar-none">
          {steps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                activeStep === idx
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-surface border border-border-custom text-secondary-custom hover:text-foreground"
              }`}
            >
              <span className="font-mono opacity-80">{step.number}</span>
              <span>{step.stepTag}</span>
            </button>
          ))}
        </div>

        {/* Active Step Feature Box */}
        <div className="rounded-3xl border border-border-custom bg-surface p-6 sm:p-8 lg:p-10 shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Step Details */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-lg flex items-center justify-center border border-emerald-500/20">
                  {steps[activeStep].number}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {steps[activeStep].stepTag}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
                {steps[activeStep].title}
              </h3>

              <p className="text-secondary-custom text-sm sm:text-base leading-relaxed">
                {steps[activeStep].description}
              </p>

              {/* Verified Practical Benefit */}
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Practical Business Value:</span>
                </div>
                <p className="text-xs text-secondary-custom">
                  {steps[activeStep].benefit}
                </p>
              </div>

              {/* UI Callouts List */}
              <div className="space-y-2.5 pt-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-foreground">
                  Verified Interface Features:
                </span>
                <ul className="space-y-2">
                  {steps[activeStep].uiCallouts.map((callout, cIdx) => (
                    <li key={cIdx} className="flex items-start gap-2 text-xs text-secondary-custom">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                      <span>
                        <strong className="text-foreground">{callout.label}:</strong> {callout.detail}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Navigation controls */}
              <div className="flex items-center gap-3 pt-4 border-t border-border-custom">
                <button
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded-lg border border-border-custom text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-background transition-colors cursor-pointer"
                >
                  Previous Step
                </button>
                <button
                  disabled={activeStep === steps.length - 1}
                  onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Step Screenshot Visual */}
            <div className="lg:col-span-7">
              <div
                onClick={() => onOpenLightbox(steps[activeStep].galleryIndex)}
                className="relative rounded-2xl border border-border-custom bg-background overflow-hidden shadow-md cursor-zoom-in group aspect-[16/10]"
              >
                <Image
                  src={steps[activeStep].imageSrc}
                  alt={steps[activeStep].imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 700px"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                  <span className="px-3.5 py-2 rounded-lg bg-surface/90 text-foreground text-xs font-semibold shadow-lg backdrop-blur-md flex items-center gap-2 border border-border-custom">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    Click to Inspect Full Screenshot
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-surface/90 text-[11px] font-mono text-secondary-custom border border-border-custom backdrop-blur-sm">
                  Step {steps[activeStep].number} of 05
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
