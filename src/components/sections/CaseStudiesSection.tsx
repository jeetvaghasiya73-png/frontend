"use client";

import React, { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import SplitText from "@/components/animations/SplitText";

const SPAN_PATTERN = [
  "lg:col-span-8", "lg:col-span-4",
  "lg:col-span-4", "lg:col-span-8",
];

export default function CaseStudiesSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Honest, realistic service blueprints without claiming fake past clients
  const blueprints = [
    {
      blueprintNum: "01",
      title: "Google Maps Top 3 Pack Ranking Blueprint",
      targetIndustry: "Local Medical Clinics & Service Businesses",
      type: "Local SEO System",
      description:
        "Engineered to dominate local map searches. Incorporates comprehensive Google Business Profile keyword alignment, local citation distribution, and an automated 5-star customer review funnel.",
      servicesList: ["Google Maps 3-Pack", "Competitor Geo-Grid", "Review Funnels"],
    },
    {
      blueprintNum: "02",
      title: "High-Performance Business Web Platform",
      targetIndustry: "Modern Service Providers & Agencies",
      type: "Web Development",
      description:
        "A lightning-fast, mobile-first business website built to establish authority and convert visitors into qualified consultation requests through streamlined booking forms.",
      servicesList: ["Mobile-First UX", "Sub-Second Speed", "Conversion Flows"],
    },
    {
      blueprintNum: "03",
      title: "Automated Directory & Lead Scraper",
      targetIndustry: "B2B Sales & Outreach Operations",
      type: "Data Extraction",
      description:
        "Automated data crawler pipeline that extracts thousands of verified local business records (phone numbers, addresses, and websites) from public web directories into clean spreadsheets.",
      servicesList: ["Directory Scraping", "Phone Verification", "Clean CSV Exports"],
    },
    {
      blueprintNum: "04",
      title: "24/7 WhatsApp Inquiry & Auto-Qualification Bot",
      targetIndustry: "High-Inquiry Service Businesses",
      type: "Workflow Automation",
      description:
        "Autonomous WhatsApp messaging pipeline that answers inbound customer questions 24/7, qualifies their requirements, and sends instant alert notifications directly to your team.",
      servicesList: ["WhatsApp Bot", "Instant Auto-Reply", "Team Notification Alerts"],
    }
  ];

  const handleNavigateToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = "/contact";
  };

  return (
    <section
      id="work"
      ref={containerRef}
      className="py-24 bg-background relative overflow-hidden text-left"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-8 border-b border-border-custom pb-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 border border-border-custom bg-surface px-3 py-1 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-foreground">
                [03] &bull; Architecture Blueprints & Concepts
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 text-foreground">
              <SplitText text="Verified Blueprints Ready for Deployment." type="words" />
            </h2>
            <p className="text-xs sm:text-sm text-secondary-custom leading-relaxed">
              We design every system from scratch. Here are the core production blueprints ready to be customized and launched for your business.
            </p>
          </div>

          <a
            href="/contact"
            onClick={handleNavigateToContact}
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-mono font-bold text-foreground hover:underline self-start md:self-end shrink-0"
          >
            <span>Deploy a Blueprint</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Blueprint Grid - Strict Geometric Rectangles */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {blueprints.map((proj, idx) => (
            <div
              key={idx}
              className={`${SPAN_PATTERN[idx % SPAN_PATTERN.length]} border border-border-custom bg-surface p-6 sm:p-8 rounded-md flex flex-col justify-between relative overflow-hidden min-h-[300px] group hover:border-foreground/40 transition-all duration-200 text-left`}
            >
              {/* Top Meta Info */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-secondary-custom block">
                    BLUEPRINT [{proj.blueprintNum}] &bull; {proj.type}
                  </span>
                  <span className="text-xs font-mono font-medium text-foreground mt-0.5 block">
                    Target: {proj.targetIndustry}
                  </span>
                </div>

                <div className="w-8 h-8 rounded-sm border border-border-custom bg-background flex items-center justify-center text-foreground group-hover:border-foreground transition-colors shrink-0">
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-3 mt-8">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground group-hover:text-indigo-400 transition-colors">
                  {proj.title}
                </h3>

                <p className="text-xs text-secondary-custom leading-relaxed">
                  {proj.description}
                </p>

                {/* Service pills */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {proj.servicesList.map((srv: string, sIdx: number) => (
                    <span
                      key={sIdx}
                      className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-xs border border-border-custom bg-background text-secondary-custom"
                    >
                      {srv}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
