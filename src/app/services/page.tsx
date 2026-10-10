"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import FooterSection from "@/components/layout/FooterSection";
import SplitText from "@/components/animations/SplitText";
import {
  TrendingUp,
  Globe,
  Bot,
  Database,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Zap,
  Clock,
} from "lucide-react";

interface MinimalService {
  id: string;
  badge: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  points: string[];
  ctaText: string;
  ctaLink: string;
}

const CORE_SERVICES: MinimalService[] = [
  {
    id: "seo",
    badge: "SEO & Growth",
    title: "Search Engine Optimization (SEO)",
    description: "Rank higher on Google search and Google Maps. Technical fixes, local keyword rankings, and real backlinks that bring organic customer calls and inquiries.",
    icon: TrendingUp,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    points: [
      "Google Maps 3-Pack & Local Area Ranking",
      "On-Page Technical SEO & Keyword Optimization",
      "High-Authority Backlinks & Monthly Ranking Reports",
    ],
    ctaText: "Explore SEO Details",
    ctaLink: "/services/seo",
  },
  {
    id: "scraping",
    badge: "Data & APIs",
    title: "Web & App Scraping & Scraper APIs",
    description: "Extract business data from websites, directories, Google Maps, and mobile apps. We deliver clean, verified leads and build custom automated scraper APIs.",
    icon: Database,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10 border-amber-500/20",
    points: [
      "Website, Google Maps & Mobile App Scraping",
      "Custom Scraper APIs & Scheduled Data Feeds",
      "Phone, Email & Business Data Cleaning (Excel / CSV)",
    ],
    ctaText: "Inquire on Scraping",
    ctaLink: "/contact",
  },
  {
    id: "web",
    badge: "Web Development",
    title: "Business Web Development",
    description: "Fast, clean, and mobile-friendly websites for regular businesses and agencies. No over-complicated SaaS bloat — just professional websites built to capture inquiries.",
    icon: Globe,
    iconColor: "text-sky-400",
    iconBg: "bg-sky-500/10 border-sky-500/20",
    points: [
      "Mobile-Friendly Business Websites & Landing Pages",
      "Fast Load Speeds & Clean Modern Design",
      "Lead Capture Forms, WhatsApp Button & Map Integration",
    ],
    ctaText: "Discuss Website Project",
    ctaLink: "/contact",
  },
  {
    id: "automation",
    badge: "Automation",
    title: "Day-to-Day Workflow Automation",
    description: "Practical automations that eliminate daily repetitive work. 24/7 WhatsApp auto-replies, instant lead notifications to your phone, and form-to-sheet sync.",
    icon: Bot,
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-500/10 border-indigo-500/20",
    points: [
      "24/7 WhatsApp Auto-Reply & Intake Flows",
      "Website Form Leads Auto-Saved to Google Sheets",
      "Instant WhatsApp & Email Alerts for New Inquiries",
    ],
    ctaText: "Explore Automation",
    ctaLink: "/services/automation",
  },
];

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background pt-28 sm:pt-32 pb-20 text-left selection:bg-accent-custom selection:text-white">
        
        {/* ── Minimal Header ── */}
        <section className="max-w-6xl mx-auto px-6 md:px-10 w-full mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-custom bg-surface/50 mb-4 text-[11px] font-mono tracking-wider uppercase text-secondary-custom">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Core Digital Services</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground max-w-3xl leading-[1.15] mb-4">
            <SplitText text="Our Core Services & Technical Solutions" type="words" />
          </h1>

          <p className="text-xs sm:text-sm text-secondary-custom max-w-2xl leading-relaxed">
            Straightforward technical execution tailored for everyday businesses: Google SEO rankings, web and mobile app scraping with custom APIs, fast business websites, and day-to-day workflow automations.
          </p>
        </section>

        {/* ── Compact 2x2 Minimal Services Grid (Reduced Height) ── */}
        <section className="max-w-6xl mx-auto px-6 md:px-10 w-full mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {CORE_SERVICES.map((srv) => {
              const Icon = srv.icon;
              return (
                <div
                  key={srv.id}
                  className="border border-border-custom bg-surface/40 hover:bg-surface/70 hover:border-accent-custom/50 rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 group shadow-xs"
                >
                  <div>
                    {/* Top Row: Icon & Badge */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${srv.iconBg} ${srv.iconColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono font-medium tracking-wide uppercase px-2 py-0.5 rounded-md bg-surface border border-border-custom text-secondary-custom">
                        {srv.badge}
                      </span>
                    </div>

                    {/* Title & Short Description */}
                    <h2 className="text-base sm:text-lg font-bold text-foreground group-hover:text-accent-custom transition-colors duration-200">
                      {srv.title}
                    </h2>
                    <p className="text-xs text-secondary-custom mt-2 leading-relaxed">
                      {srv.description}
                    </p>

                    {/* 3 Crisp Deliverable Points */}
                    <ul className="mt-4 pt-3 border-t border-border-custom/50 space-y-1.5">
                      {srv.points.map((pt, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-foreground/90">
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent-custom shrink-0" />
                          <span className="truncate">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Compact Bottom Link */}
                  <div className="mt-5 pt-3 border-t border-border-custom/50">
                    <Link
                      href={srv.ctaLink}
                      className="inline-flex items-center justify-between w-full text-xs font-semibold text-foreground hover:text-accent-custom transition-colors py-1 cursor-pointer"
                    >
                      <span>{srv.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-accent-custom group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Minimal 3-Point Guarantee Bar ── */}
        <section className="max-w-6xl mx-auto px-6 md:px-10 w-full mb-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border border-border-custom/80 bg-surface/30 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground">100% Code & Data Ownership</h3>
                <p className="text-[11px] text-secondary-custom">You own all your files, scrapers, and data.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground">Direct Technical Support</h3>
                <p className="text-[11px] text-secondary-custom">Speak directly with the developer handling your work.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground">Fast Turnaround</h3>
                <p className="text-[11px] text-secondary-custom">Clear milestones without unnecessary agency delays.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Compact CTA Banner (No Prices / No Quotation Box) ── */}
        <section className="max-w-6xl mx-auto px-6 md:px-10 w-full">
          <div className="border border-border-custom bg-surface/40 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl text-center md:text-left">
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1.5">
                Have a project or need custom data / automation?
              </h3>
              <p className="text-xs text-secondary-custom leading-relaxed">
                Contact our team for a quick technical discussion. We will review your requirements and outline the exact solution.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <Link
                href="/contact"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-foreground text-background hover:bg-accent-custom hover:text-white font-semibold text-xs transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <span>Contact Us</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href="https://wa.me/919173739080?text=Hello%20Tech%20Infinix,%20I%20would%20like%20to%20inquire%20about%20your%20services."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-surface border border-border-custom hover:border-emerald-500/50 hover:bg-emerald-500/5 text-foreground font-semibold text-xs transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </section>

      </main>
      <FooterSection />
    </>
  );
}
