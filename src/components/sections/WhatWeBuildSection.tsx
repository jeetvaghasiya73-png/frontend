"use client";

import React, { useRef, useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import {
  TrendingUp,
  Globe,
  Database,
  Bot,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitText from "@/components/animations/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ServiceCardData {
  num: string;
  title: string;
  badge: string;
  category: "seo" | "web" | "scraping" | "automation";
  icon: any;
  desc: string;
  features: string[];
  keyOutcomes: string[];
  borderHover: string;
  ctaText: string;
}

export default function WhatWeBuildSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // 4 Primary Pillars defined per user specifications - No tech stack mentions
  const corePillars: ServiceCardData[] = [
    {
      num: "01",
      title: "Google Maps & Local SEO Dominance",
      badge: "Local SEO & 3-Pack",
      category: "seo",
      icon: TrendingUp,
      desc: "We rank local businesses in the Google Maps Top 3 Pack to capture daily high-intent local searchers, divert competitor calls, and automate verified customer reviews.",
      features: [
        "Google Business Profile Audit & Overhaul",
        "Competitor Keyword & Search Analysis",
        "Automated 5-Star Customer Review Collection",
        "Local Citation Sync & Geo-Grid Coverage"
      ],
      keyOutcomes: ["Maps Top 3 Placement", "Direct Inbound Calls", "Review Growth"],
      borderHover: "hover:border-emerald-500/50",
      ctaText: "Inquire on Local SEO"
    },
    {
      num: "02",
      title: "High-Performance Web Development",
      badge: "Modern Web Platform",
      category: "web",
      icon: Globe,
      desc: "Mobile-first, ultra-fast business websites engineered to showcase your brand, establish immediate credibility, and turn visitors into booked consultations.",
      features: [
        "Mobile-First Responsive Layout & Clean Design",
        "Sub-Second Page Load Optimization",
        "High-Conversion Inbound Lead & Booking Forms",
        "Complete Search Engine Structure & Metadata"
      ],
      keyOutcomes: ["Instant Page Speed", "Mobile Friendly", "Lead Capture Flow"],
      borderHover: "hover:border-sky-500/50",
      ctaText: "Inquire on Web Development"
    },
    {
      num: "03",
      title: "High-Volume Web Scraping & Data",
      badge: "Automated Data Extraction",
      category: "scraping",
      icon: Database,
      desc: "Custom data extraction pipelines that collect verified business contact records from public web directories, Google Maps, and industry listings without manual effort.",
      features: [
        "Automated Public Directory & Maps Scraping",
        "Phone, Email & Business Address Verification",
        "Data Deduplication & Structured Formatting",
        "Direct Export to Spreadsheet or CRM"
      ],
      keyOutcomes: ["Automated Lists", "Zero Manual Copying", "Clean Spreadsheets"],
      borderHover: "hover:border-amber-500/50",
      ctaText: "Inquire on Web Scraping"
    },
    {
      num: "04",
      title: "24/7 WhatsApp & Workflow Automations",
      badge: "Autonomous Pipelines",
      category: "automation",
      icon: Bot,
      desc: "24/7 intelligent WhatsApp auto-responders and workflow integrations that greet prospects within seconds, qualify requirements, and alert you instantly.",
      features: [
        "Instant WhatsApp Reply to Inbound Prospects",
        "Automated Lead Qualification Questions",
        "Instant Team Alerts via SMS & Email",
        "Centralized Dashboard to Monitor All Inquiries"
      ],
      keyOutcomes: ["Instant 24/7 Response", "Zero Dropped Inquiries", "Automatic Alerts"],
      borderHover: "hover:border-indigo-500/50",
      ctaText: "Inquire on Automations"
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".build-card",
        { opacity: 0, y: 35, willChange: "transform, opacity" },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleNavigateToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = "/contact";
  };

  return (
    <section
      ref={containerRef}
      id="services"
      className="py-24 bg-background relative overflow-hidden text-left"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-8 border-b border-border-custom pb-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 border border-border-custom bg-surface px-3 py-1 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-foreground">
                [01] &bull; Core Service Offerings
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 text-foreground">
              <SplitText text="Clear Services. Real Business Outcomes." type="words" />
            </h2>
            <p className="text-xs sm:text-sm text-secondary-custom leading-relaxed">
              We specialize in four focused growth services. Every project is built from scratch with dedicated personal execution.
            </p>
          </div>

          <a
            href="/contact"
            onClick={handleNavigateToContact}
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-mono font-bold text-foreground hover:underline self-start md:self-end shrink-0"
          >
            <span>Request Architecture Quote</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 4 Pillars Grid - Clean 1px Borders, Zero Tech Jargon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {corePillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className={`build-card border border-border-custom bg-surface p-6 sm:p-8 rounded-md flex flex-col justify-between transition-all duration-200 group ${pillar.borderHover}`}
              >
                <div>
                  {/* Top Bar with Number & Badge */}
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <span className="font-mono text-xl font-bold text-secondary-custom/60 group-hover:text-foreground transition-colors">
                      {pillar.num}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase tracking-wider border border-border-custom bg-background text-foreground">
                      {pillar.badge}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-sm bg-background border border-border-custom flex items-center justify-center text-foreground shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground group-hover:text-indigo-400 transition-colors">
                      {pillar.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-secondary-custom leading-relaxed mb-5">
                    {pillar.desc}
                  </p>

                  {/* Feature Checklist */}
                  <div className="space-y-2 mb-6 border-t border-border-custom pt-4">
                    {pillar.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-foreground font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-foreground/70 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Outcomes & Action */}
                <div className="border-t border-border-custom pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {pillar.keyOutcomes.map((outcome, oIdx) => (
                      <span
                        key={oIdx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-background border border-border-custom text-secondary-custom"
                      >
                        {outcome}
                      </span>
                    ))}
                  </div>

                  <a
                    href="/contact"
                    onClick={handleNavigateToContact}
                    className="inline-flex items-center gap-1 text-xs font-mono font-bold uppercase tracking-wider text-foreground hover:text-indigo-400 transition-colors self-start sm:self-auto shrink-0"
                  >
                    <span>{pillar.ctaText}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
