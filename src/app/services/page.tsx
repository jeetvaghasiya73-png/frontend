"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import FooterSection from "@/components/layout/FooterSection";
import SplitText from "@/components/animations/SplitText";
import {
  TrendingUp,
  Globe,
  Bot,
  Database,
  Layers,
  Code,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Activity,
  MessageCircle,
  FileCheck,
  Clock,
  Compass,
  Headphones,
  Search,
  ExternalLink,
  ChevronRight,
  Send,
  Building2,
  BarChart3,
} from "lucide-react";

interface ServicePillar {
  id: string;
  category: "all" | "seo" | "web" | "automation" | "scraping" | "systems";
  categoryLabel: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  features: string[];
  outcomes: string[];
  ctaText: string;
  ctaLink: string;
  isExternalLink?: boolean;
}

const SERVICES_DATA: ServicePillar[] = [
  {
    id: "seo",
    category: "seo",
    categoryLabel: "Search Authority",
    title: "Search Engine Optimization (SEO) & Google Rankings",
    subtitle: "Dominate Google search results and capture high-intent commercial inquiries",
    description: "We engineer sustainable organic search authority that turns searchers into paying clients. From technical on-page audits and Google Maps 3-Pack optimization to high-authority backlink acquisition and geo-targeted landing page networks across target cities.",
    icon: TrendingUp,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    features: [
      "Google Business Profile (GBP) & Local 3-Pack Rankings",
      "Technical On-Page Audits & Core Web Vitals Optimization",
      "Competitor Gap Analysis & Commercial-Intent Keyword Clusters",
      "High-Authority White-Hat Backlink Building & Digital PR",
      "Regional & Multi-City Landing Page Topical Networks",
    ],
    outcomes: [
      "Top 3 Google Maps Placement",
      "Sustainable Inbound Organic Traffic",
      "Zero Reliance on Continuous Ad Spend",
    ],
    ctaText: "Explore SEO Directory",
    ctaLink: "/services/seo",
  },
  {
    id: "web",
    category: "web",
    categoryLabel: "Web Engineering",
    title: "Custom Web Application & Software Development",
    subtitle: "High-speed, scalable digital platforms designed to convert visitors into clients",
    description: "We develop custom web applications and business websites built for maximum performance. Ultra-fast load times, clean modern design, and robust backend architectures tailored to your company's workflows, lead capture processes, and operational scale.",
    icon: Globe,
    iconColor: "text-sky-400",
    iconBg: "bg-sky-500/10 border-sky-500/20",
    features: [
      "Next.js App Router, React & Modern TypeScript Architectures",
      "Sub-Second Page Load Speeds (95+ Mobile Google PageSpeed)",
      "Custom Client Ingestion Portals & Admin Management Consoles",
      "Mobile-First Responsive Layouts Crafted for Conversions",
      "Secure Database Architecture, APIs & Enterprise Data Protection",
    ],
    outcomes: [
      "Dramatically Lower Bounce Rates",
      "Higher Lead Capture & Inquiries",
      "100% Code & Architecture Ownership",
    ],
    ctaText: "Discuss Web Project",
    ctaLink: "/contact",
  },
  {
    id: "automation",
    category: "automation",
    categoryLabel: "24/7 Operations",
    title: "WhatsApp Business & CRM Workflow Automation",
    subtitle: "Engage, qualify, and capture inbound leads 24/7 with zero response delay",
    description: "Never lose a high-value customer because of delayed replies. We build 24/7 automated WhatsApp messaging flows, interactive lead qualification questionnaires, and bi-directional synchronizations connecting your website, CRM, and team communication channels.",
    icon: Bot,
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-500/10 border-indigo-500/20",
    features: [
      "24/7 Automated Welcome & Lead Intake Questionnaire Flows",
      "Multi-Step Lead Qualification with Interactive WhatsApp Menus",
      "Webhook Pipelines Syncing WhatsApp, CRMs, Sheets & Slack",
      "Multi-Agent Shared Team Inbox with Smart Routing",
      "Real-Time Push & Notification Alerts on High-Intent Inquiries",
    ],
    outcomes: [
      "Sub-30-Second Average Response Time",
      "24/7 Lead Capture After Hours",
      "Zero Manual Data Re-Entry Between Tools",
    ],
    ctaText: "Explore Automation Hub",
    ctaLink: "/services/automation",
  },
  {
    id: "scraping",
    category: "scraping",
    categoryLabel: "Data Intelligence",
    title: "Web Scraping & Verified B2B Lead Extraction",
    subtitle: "Targeted, verified business contact databases delivered directly to your CRM",
    description: "Accelerate your outbound sales pipeline with automated data extraction. We extract verified business details, Google Maps listings, direct phone numbers, and emails from public directories with deep deduplication and formatting ready for your sales team.",
    icon: Database,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10 border-amber-500/20",
    features: [
      "Targeted Google Maps & Business Directory Scraping",
      "Automated Phone Number Normalization & Verification",
      "Deep Multi-Field Deduplication & City-Wise Categorization",
      "Structured Output in Excel, CSV, or Direct CRM Import",
      "Scheduled Recurring Extraction Pipelines for Fresh Records",
    ],
    outcomes: [
      "100% Verified, Actionable Prospect Lists",
      "Eliminates Weeks of Tedious Manual Research",
      "Feeds Directly into Calling & Outreach Queues",
    ],
    ctaText: "Inquire on Data Scraping",
    ctaLink: "/contact",
  },
  {
    id: "design",
    category: "web",
    categoryLabel: "Visual Identity",
    title: "UI/UX Product Design & Digital Brand Experience",
    subtitle: "Modern, high-converting interfaces that communicate authority and trust",
    description: "Great software and services deserve interfaces that impress at first glance. We design modern visual identities, wireframes, and design systems with seamless dark/light modes, micro-animations, and conversion-focused user journeys that drive action.",
    icon: Layers,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/10 border-purple-500/20",
    features: [
      "Modern, Minimalist Interface Design for Tech & B2B Brands",
      "Interactive Wireframes, Prototypes & User Journey Mapping",
      "Adaptive Dark and Light Mode Design System Implementations",
      "Subtle Micro-Interactions that Increase Visitor Engagement",
      "Clean Component Libraries Ready for Direct Frontend Handoff",
    ],
    outcomes: [
      "Immediate Visual Trust & Credibility",
      "Frictionless User Navigation Flows",
      "Consistent Brand Across All Devices",
    ],
    ctaText: "Inquire on UI/UX Design",
    ctaLink: "/contact",
  },
  {
    id: "systems",
    category: "systems",
    categoryLabel: "System Architecture",
    title: "Custom Software & Cloud API Integrations",
    subtitle: "Connect disparate business tools into one unified, automated ecosystem",
    description: "Eliminate silos between your business tools. We build custom backend microservices, real-time WebSocket communication channels, payment gateway connectors (Stripe, Razorpay), and automated synchronization scripts tailored to your company's proprietary workflow.",
    icon: Code,
    iconColor: "text-rose-400",
    iconBg: "bg-rose-500/10 border-rose-500/20",
    features: [
      "Custom RESTful APIs & Real-Time WebSocket Infrastructure",
      "Payment Processing & Automated Invoice Billing Systems",
      "Secure Role-Based Access Control (RBAC) & Authentication",
      "Database Optimization (PostgreSQL, MySQL) & Caching",
      "Cloud Infrastructure Deployment & Continuous Health Monitoring",
    ],
    outcomes: [
      "Unified Company Data Across All Tools",
      "Enterprise-Grade Reliability & Security",
      "Built Exactly to Your Specific Business Logic",
    ],
    ctaText: "Inquire on Custom Systems",
    ctaLink: "/contact",
  },
];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Strategic Discovery & Analysis",
    description: "We deep-dive into your operational workflows, target client profiles, competitors, and technical bottlenecks to establish clear, measurable objectives.",
    icon: Compass,
  },
  {
    step: "02",
    title: "Technical Architecture & Blueprint",
    description: "We map out system specifications, data models, UX wireframes, and milestone roadmaps before writing a single line of production code.",
    icon: FileCheck,
  },
  {
    step: "03",
    title: "Agile Engineering & Rigorous QA",
    description: "Sprint-based development with regular staging demos. Every deliverable undergoes speed benchmarking, responsiveness checks, and functional testing.",
    icon: Activity,
  },
  {
    step: "04",
    title: "Deployment, Training & Scaling",
    description: "Seamless production launch, staff onboarding on custom dashboards, and continuous monitoring to ensure maximum stability and business ROI.",
    icon: Zap,
  },
];

const ADVANTAGES = [
  {
    title: "Direct Engineer Collaboration",
    description: "Communicate directly with the technical specialists building your solution. No non-technical account managers or communication bottlenecks.",
    icon: Headphones,
  },
  {
    title: "Full Code & Data Ownership",
    description: "You retain 100% intellectual property, source code repositories, and database ownership. No proprietary locks or vendor traps.",
    icon: ShieldCheck,
  },
  {
    title: "Engineered for Measurable ROI",
    description: "We build for commercial impact — higher Google rankings, sub-second load times, hours of manual labor saved, and verified lead flow.",
    icon: BarChart3,
  },
  {
    title: "Transparent Milestone Delivery",
    description: "Stay in full control with regular progress demos, live staging links, and honest technical guidance on what best serves your business.",
    icon: Clock,
  },
];

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredServices = activeCategory === "all"
    ? SERVICES_DATA
    : SERVICES_DATA.filter((s) => s.category === activeCategory || (activeCategory === "systems" && (s.category === "systems" || s.category === "automation")));

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background pt-32 pb-24 text-left selection:bg-accent-custom selection:text-white">
        
        {/* ── Hero Section ── */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 w-full relative mb-16">
          <div className="absolute top-0 right-0 w-[350px] h-[350px] rounded-full bg-accent-glow blur-[120px] pointer-events-none opacity-40 mix-blend-screen scale-75" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-custom bg-surface/40 backdrop-blur-sm mb-5 text-[11px] font-mono tracking-wider uppercase text-secondary-custom">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Tech Infinix Core Capabilities</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-foreground max-w-4xl leading-[1.1] mb-6">
            <SplitText text="Engineering Digital Growth & Intelligent Systems" type="words" />
          </h1>

          <p className="text-sm md:text-base text-secondary-custom max-w-2xl leading-relaxed">
            We build sustainable Google SEO authority, high-speed custom web applications, 24/7 WhatsApp automations, and targeted data extraction pipelines engineered to drive measurable business revenue.
          </p>

          {/* Quick Filter Navigation Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-8 pt-4 border-t border-border-custom/50">
            {[
              { id: "all", label: "All Services" },
              { id: "seo", label: "SEO & Search" },
              { id: "web", label: "Web Engineering" },
              { id: "automation", label: "WhatsApp & Automation" },
              { id: "scraping", label: "Data Scraping" },
              { id: "systems", label: "Custom Systems" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                  activeCategory === tab.id
                    ? "bg-foreground text-background shadow-sm"
                    : "bg-surface border border-border-custom text-secondary-custom hover:text-foreground hover:border-foreground/30"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Core Services Grid ── */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 w-full mb-28">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredServices.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.id}
                  className="border border-border-custom bg-surface/30 backdrop-blur-sm p-7 sm:p-8 rounded-2xl flex flex-col justify-between hover:border-accent-custom/60 hover:bg-surface/50 transition-all duration-300 group shadow-xs hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/30"
                >
                  <div>
                    {/* Header: Icon & Category */}
                    <div className="flex items-center justify-between gap-3 mb-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${service.iconBg} ${service.iconColor} transition-transform group-hover:scale-105 duration-300`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-md bg-surface border border-border-custom text-secondary-custom">
                        {service.categoryLabel}
                      </span>
                    </div>

                    {/* Title & Subtitle */}
                    <h2 className="text-xl font-bold text-foreground group-hover:text-accent-custom transition-colors duration-200 leading-snug">
                      {service.title}
                    </h2>
                    <p className="text-xs font-semibold text-foreground/80 mt-1">
                      {service.subtitle}
                    </p>
                    <p className="text-xs text-secondary-custom mt-3 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Key Deliverables */}
                    <div className="border-t border-border-custom/60 pt-5 mt-6">
                      <h3 className="text-[10px] font-mono font-bold tracking-wider text-secondary-custom uppercase mb-3 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-accent-custom" />
                        <span>Key Deliverables</span>
                      </h3>
                      <ul className="space-y-2">
                        {service.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2.5 text-xs text-foreground/90 leading-relaxed">
                            <CheckCircle2 className="w-3.5 h-3.5 text-accent-custom shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Target Outcomes */}
                    <div className="border-t border-border-custom/60 pt-4 mt-5">
                      <h4 className="text-[10px] font-mono font-bold tracking-wider text-secondary-custom uppercase mb-2">
                        Target Outcomes
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {service.outcomes.map((out, oIdx) => (
                          <span
                            key={oIdx}
                            className="text-[10px] font-medium px-2 py-0.5 rounded bg-surface border border-border-custom/80 text-foreground/80"
                          >
                            {out}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Link Button */}
                  <div className="border-t border-border-custom/60 pt-6 mt-8">
                    <Link
                      href={service.ctaLink}
                      className="w-full inline-flex items-center justify-between p-3 rounded-xl bg-surface border border-border-custom hover:border-foreground/40 hover:bg-surface-alt text-foreground text-xs font-semibold transition-all duration-200 group-hover:border-accent-custom"
                    >
                      <span>{service.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-accent-custom group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 4-Phase Delivery Framework ── */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 w-full mb-28">
          <div className="border border-border-custom bg-surface/20 rounded-3xl p-8 md:p-14 relative overflow-hidden">
            <div className="max-w-2xl mb-12">
              <span className="text-[10px] font-mono font-bold tracking-widest text-accent-custom uppercase block mb-3">
                // Execution Standard
              </span>
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
                How We Deliver Every Project
              </h2>
              <p className="text-xs md:text-sm text-secondary-custom leading-relaxed">
                A structured, transparent engineering methodology designed to eliminate scope ambiguity, maintain strict timelines, and deliver measurable business outcomes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {PROCESS_STEPS.map((item) => {
                const StepIcon = item.icon;
                return (
                  <div
                    key={item.step}
                    className="p-6 rounded-2xl border border-border-custom/80 bg-surface/50 hover:border-border-custom transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-mono font-bold text-foreground/40">
                        {item.step}
                      </span>
                      <div className="p-2 rounded-lg bg-surface border border-border-custom text-accent-custom">
                        <StepIcon className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-secondary-custom leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Why Tech Infinix ── */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 w-full mb-28">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[10px] font-mono font-bold tracking-widest text-accent-custom uppercase block mb-3">
              // The Engineering Advantage
            </span>
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
              Why Businesses Partner With Tech Infinix
            </h2>
            <p className="text-xs md:text-sm text-secondary-custom leading-relaxed">
              We operate as your dedicated technical partners, combining deep engineering competence with commercial growth focus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ADVANTAGES.map((adv, idx) => {
              const AdvIcon = adv.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-border-custom bg-surface/30 hover:border-accent-custom/50 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent-custom/10 border border-accent-custom/20 text-accent-custom flex items-center justify-center mb-4">
                    <AdvIcon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-2">
                    {adv.title}
                  </h3>
                  <p className="text-xs text-secondary-custom leading-relaxed">
                    {adv.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Direct Consultation Call To Action (Replaces Old Quotation Box) ── */}
        <section className="max-w-5xl mx-auto px-6 md:px-12 w-full">
          <div className="border border-border-custom bg-surface/40 backdrop-blur-xl rounded-3xl p-8 sm:p-12 md:p-14 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-accent-glow blur-[120px] pointer-events-none opacity-30" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="text-[10px] font-mono font-bold tracking-widest text-accent-custom uppercase block mb-3">
                Start A Conversation
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
                Have a Project in Mind or Need to Scale Your Operations?
              </h2>
              <p className="text-xs sm:text-sm text-secondary-custom leading-relaxed mb-8">
                Whether you need to capture top Google rankings, build a modern web application, or automate your sales response pipelines, our technical team is ready to consult on your goals.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-8">
                <Link
                  href="/contact"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-foreground text-background hover:bg-accent-custom hover:text-white font-semibold text-xs tracking-wider uppercase transition-all duration-200 inline-flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <span>Schedule Technical Consultation</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="https://wa.me/919173739080?text=Hello%20Tech%20Infinix%20team,%20I%20would%20like%20to%20discuss%20your%20services."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-surface border border-border-custom hover:border-emerald-500/50 hover:bg-emerald-500/5 text-foreground font-semibold text-xs tracking-wider uppercase transition-all duration-200 inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-500" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

              {/* Reassurance Badges */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[11px] font-mono text-secondary-custom pt-4 border-t border-border-custom/50">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Free Technical Discovery
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-custom" />
                  Custom-Tailored Scope
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  Response Within 2 Hours
                </span>
              </div>
            </div>
          </div>
        </section>

      </main>
      <FooterSection />
    </>
  );
}
