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
      title: "Local SEO & Digital Marketing System",
      targetIndustry: "Service Businesses & Local Companies",
      type: "SEO System",
      description:
        "A comprehensive local SEO and digital marketing setup designed to get your business ranking on Google — and in front of customers who are ready to buy. Includes technical audits, Google Business Profile optimization, keyword targeting, and backlink strategy.",
      servicesList: ["Local SEO", "Google Business Profile", "Backlink Strategy"],
    },
    {
      blueprintNum: "02",
      title: "Custom Web Application Development",
      targetIndustry: "Startups, SMBs & Service Providers",
      type: "Web Development",
      description:
        "A fully custom web application or business website built with modern technology — fast, mobile-friendly, and designed to convert visitors. Whether you need PHP development or a React-based web app, we build it to fit your goals.",
      servicesList: ["Web App Development", "PHP Development", "Mobile-First UI"],
    },
    {
      blueprintNum: "03",
      title: "Web Scraping & Data Extraction Pipeline",
      targetIndustry: "B2B Sales Teams & Data-Driven Businesses",
      type: "Web Scraping",
      description:
        "A production-ready web scraping and website scraping system that pulls verified business contacts — phone numbers, emails, addresses — from public directories and exports them into clean, usable formats for your team or CRM.",
      servicesList: ["Website Scraping", "Web Data Extraction", "CSV Export"],
    },
    {
      blueprintNum: "04",
      title: "WhatsApp Automation & Workflow Setup",
      targetIndustry: "High-Inquiry Businesses & Service Companies",
      type: "Automation",
      description:
        "A complete WhatsApp automation software setup that handles inbound inquiries 24/7 — sending instant replies, qualifying leads, and alerting your team in real time. Includes full workflow automation integration so nothing slips through.",
      servicesList: ["WhatsApp Automation", "Workflow Automation", "Team Alerts"],
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
              <SplitText text="Real Solutions. Ready to Deploy for Your Business." type="words" />
            </h2>
            <p className="text-xs sm:text-sm text-secondary-custom leading-relaxed">
              We are an IT outsourcing company and IT consultancy service built around what actually moves the needle. Here are the four core systems we build and deploy for clients.
            </p>
          </div>

          <a
            href="/contact"
            onClick={handleNavigateToContact}
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-foreground hover:underline self-start md:self-end shrink-0"
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
