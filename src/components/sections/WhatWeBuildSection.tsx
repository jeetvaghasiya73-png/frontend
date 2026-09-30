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
      title: "SEO & Digital Marketing",
      badge: "Local SEO & Search",
      category: "seo",
      icon: TrendingUp,
      desc: "Whether you're looking to rank locally or dominate industry-wide, our SEO and digital marketing services are built around what your customers are actually searching for. We handle everything from technical fixes to content and backlinks.",
      features: [
        "Technical On-Page SEO & Site Structure Audit",
        "Local SEO & Google Business Profile Optimization",
        "Competitor Keyword Research & Content Strategy",
        "High-Authority Backlink Building & Monthly Reporting"
      ],
      keyOutcomes: ["Google Page #1 Rankings", "Local Search Visibility", "Organic Traffic Growth"],
      borderHover: "hover:border-emerald-500/50",
      ctaText: "Inquire on SEO"
    },
    {
      num: "02",
      title: "Web Application Development",
      badge: "Web Design & Development",
      category: "web",
      icon: Globe,
      desc: "We build custom web applications and business websites that actually perform. Fast load times, clean design, and a structure built to convert visitors into paying customers. PHP, React, Next.js — we work with what fits your project best.",
      features: [
        "Custom Web App & PHP Development",
        "Mobile-First Responsive Web Design",
        "Sub-Second Page Speeds & Core Web Vitals",
        "Lead Capture Forms, Booking Flows & CRM Integration"
      ],
      keyOutcomes: ["Fast, Scalable Web Apps", "Mobile-Friendly Design", "Higher Conversion Rates"],
      borderHover: "hover:border-sky-500/50",
      ctaText: "Inquire on Web Development"
    },
    {
      num: "03",
      title: "Web Scraping & Data Extraction",
      badge: "Web Data Extraction",
      category: "scraping",
      icon: Database,
      desc: "Need verified business data without spending weeks collecting it manually? Our web scraping service in India handles everything — from public directory extraction to website scraping and structured data exports ready for your CRM or spreadsheet.",
      features: [
        "Automated Website & Directory Scraping",
        "Phone, Email & Business Contact Verification",
        "Data Deduplication, Cleaning & Formatting",
        "Export to CSV, Excel or Direct CRM Upload"
      ],
      keyOutcomes: ["Verified Lead Lists", "Zero Manual Effort", "Clean, Structured Data"],
      borderHover: "hover:border-amber-500/50",
      ctaText: "Inquire on Web Scraping"
    },
    {
      num: "04",
      title: "WhatsApp & Workflow Automation",
      badge: "Automation Services",
      category: "automation",
      icon: Bot,
      desc: "Stop losing leads because you couldn't respond fast enough. Our WhatsApp automation software and workflow automation services keep your business running 24/7 — greeting prospects, qualifying requirements, and notifying your team instantly.",
      features: [
        "WhatsApp Auto-Reply for Inbound Inquiries",
        "Automated Lead Qualification Flows",
        "Instant Team Alerts via Email & SMS",
        "Custom Workflow Automation & CRM Sync"
      ],
      keyOutcomes: ["24/7 Auto-Response", "No Dropped Leads", "Fully Automated Workflows"],
      borderHover: "hover:border-indigo-500/50",
      ctaText: "Inquire on Automation"
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
                [01] &bull; IT Solutions & Services
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 text-foreground">
              <SplitText text="Four Services. One IT Partner. Real Results." type="words" />
            </h2>
            <p className="text-xs sm:text-sm text-secondary-custom leading-relaxed">
              As a trusted IT solutions provider, we focus on four core areas where businesses see the biggest return. Every project is built from scratch by our team — no templates, no outsourcing.
            </p>
          </div>

          <a
            href="/contact"
            onClick={handleNavigateToContact}
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-mono font-bold text-foreground hover:underline self-start md:self-end shrink-0"
          >
            <span>Get a Free IT Consultation</span>
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
