"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, TrendingUp, Code2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/layout/Navbar";
import FooterSection from "@/components/layout/FooterSection";

gsap.registerPlugin(ScrollTrigger);

// ─── Leadership & Capabilities ────────────────────────────────────────────────
const leadershipPillars = [
  {
    pillar: "01",
    tag: "Growth & Visibility",
    title: "Marketing & Growth Strategy",
    headline: "Engineered Acquisition Systems",
    description:
      "We design data-driven organic acquisition systems, programmatic SEO architectures, and conversion-optimized funnels that drive sustained, measurable business expansion.",
    capabilities: [
      "Technical & Local SEO Architecture",
      "Programmatic Keyword Dominance",
      "Conversion Rate Optimization (CRO)",
      "High-Intent Pipeline Generation",
    ],
    metric: "Search Dominance & Organic Reach",
    linkText: "Explore Growth Systems",
    linkHref: "/services/seo",
    icon: TrendingUp,
  },
  {
    pillar: "02",
    tag: "Architecture & Scale",
    title: "Engineering & Technical Architecture",
    headline: "High-Performance Digital Platforms",
    description:
      "We build production-ready Next.js web applications, resilient API infrastructures, and sub-second web platforms engineered for speed, security, and effortless scaling.",
    capabilities: [
      "Full-Stack Web App Development",
      "Sub-Second Core Web Vitals",
      "Custom APIs & Scalable Backends",
      "Robust Cloud & Data Workflows",
    ],
    metric: "Sub-Second Latency & 99.9% Resiliency",
    linkText: "Explore Engineering Services",
    linkHref: "/services",
    icon: Code2,
  },
  {
    pillar: "03",
    tag: "Execution & Quality",
    title: "Operations & Delivery Governance",
    headline: "Flawless Execution & Automation",
    description:
      "We ensure structured agile delivery, uncompromising QA standards, intelligent workflow automation, and proactive client partnership for predictable, zero-friction launches.",
    capabilities: [
      "Agile Governance & Milestone Tracking",
      "Intelligent Workflow Automation",
      "Enterprise QA & Rigorous Testing",
      "Proactive Lifecycle & SLA Support",
    ],
    metric: "100% On-Schedule Project Execution",
    linkText: "Explore Automation Solutions",
    linkHref: "/services/automation",
    icon: ShieldCheck,
  },
];

// ─── Principles ───────────────────────────────────────────────────────────────
const principles = [
  {
    num: "01",
    title: "Strategic Thinking First",
    body: "We start every engagement by understanding your business model, market position, and growth bottlenecks — not by jumping straight to execution. The right diagnosis saves months of misdirected effort.",
  },
  {
    num: "02",
    title: "Practical Technology",
    body: "We build with tools that solve real problems: web applications that load fast and convert, SEO systems that rank in your specific market, and automation that removes repetitive work from your team's day.",
  },
  {
    num: "03",
    title: "Measurable Business Outcomes",
    body: "Every project is tied to a business metric — more organic traffic, faster lead response, lower cost per acquisition, or time saved per week. We track results and report transparently.",
  },
];

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero fade-up
      gsap.fromTo(
        ".about-hero-item",
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.07,
          ease: "power2.out",
          delay: 0.05,
        }
      );

      // Scroll-triggered reveals
      gsap.utils.toArray<HTMLElement>(".about-reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col bg-background text-foreground text-left font-sans">

        {/* ═══════════════════════════════════════════════════════════════════
            HERO
        ═══════════════════════════════════════════════════════════════════ */}
        <section
          ref={heroRef}
          className="relative overflow-hidden border-b border-border-custom"
        >
          {/* Subtle grid background */}
          <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-28 pb-20 sm:pt-36 sm:pb-28 relative z-10">

            {/* Badge */}
            <div className="about-hero-item inline-flex items-center gap-2 border border-border-custom bg-surface px-3 py-1 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
              <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-foreground">
                About Tech Infinix
              </span>
            </div>

            {/* Headline */}
            <h1 className="about-hero-item text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.06] text-foreground max-w-4xl mb-6">
              Building Digital Experiences That Drive Growth.
            </h1>

            {/* Sub-copy */}
            <p className="about-hero-item text-sm sm:text-base text-secondary-custom leading-relaxed max-w-2xl mb-10">
              Tech Infinix is a full-service digital solutions company based in Ahmedabad. We help businesses grow through a deliberate combination of performance marketing, custom technology, and process automation — built around what actually moves the needle.
            </p>

            {/* CTA */}
            <div className="about-hero-item flex flex-col sm:flex-row gap-4 items-start">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-foreground text-background font-bold text-sm px-6 py-3 rounded-full hover:opacity-90 transition-all active:scale-[0.98]"
              >
                Let&apos;s Work Together
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                href="/#work"
                className="inline-flex items-center gap-2 border border-border-custom text-foreground font-semibold text-sm px-6 py-3 rounded-full hover:bg-surface transition-all"
              >
                View Our Work
              </Link>
            </div>

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            WHO WE ARE
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="border-b border-border-custom">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-20 sm:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

              {/* Label column */}
              <div className="lg:col-span-4 about-reveal">
                <div className="inline-flex items-center gap-2 border border-border-custom bg-surface px-3 py-1 rounded-full mb-4">
                  <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-foreground">
                    [01] · Who We Are
                  </span>
                </div>
                <div className="mt-2 w-10 h-px bg-foreground" />
              </div>

              {/* Content column */}
              <div className="lg:col-span-8 about-reveal">
                <p className="text-xl sm:text-2xl font-semibold text-foreground leading-snug tracking-tight mb-6">
                  We work with businesses that need reliable, technical partners — not agencies that overpromise and underdeliver.
                </p>
                <div className="space-y-4 text-sm sm:text-base text-secondary-custom leading-relaxed">
                  <p>
                    Founded in Ahmedabad, Tech Infinix was built to bridge the gap between strategic marketing and hands-on engineering. Most agencies specialize in one or the other. We do both — and we connect them deliberately.
                  </p>
                  <p>
                    Our work spans search engine optimization, web application development, data extraction pipelines, and WhatsApp automation systems. Each engagement is treated as a business problem to solve, not a deliverable to complete and invoice.
                  </p>
                  <p>
                    We operate with a lean, high-ownership team. This means faster decisions, more accountability, and consistent quality across every project we take on.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            CORE LEADERSHIP & CAPABILITIES
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="border-b border-border-custom bg-surface/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-20 sm:py-24">

            {/* Section header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14 pb-8 border-b border-border-custom">
              <div>
                <div className="inline-flex items-center gap-2 border border-border-custom bg-surface px-3 py-1 rounded-full mb-4 about-reveal">
                  <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-foreground">
                    [02] · Leadership & Capabilities
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground about-reveal">
                  Three specialized pillars.<br className="hidden sm:block" /> One unified standard.
                </h2>
              </div>
              <p className="text-sm text-secondary-custom max-w-xs leading-relaxed about-reveal">
                Our leadership is structured across three core domains — growth marketing, software engineering, and operational governance — ensuring every project delivers tangible business results.
              </p>
            </div>

            {/* Capabilities grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border-custom border border-border-custom rounded-lg overflow-hidden">
              {leadershipPillars.map((pillar, i) => {
                const IconComponent = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="bg-surface p-8 sm:p-10 flex flex-col justify-between gap-6 about-reveal group hover:bg-surface/80 transition-colors"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <div>
                      {/* Top Header Badge & Pillar ID */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-lg border border-border-custom bg-background flex items-center justify-center text-foreground group-hover:border-foreground/40 transition-colors">
                          <IconComponent className="w-5 h-5 text-foreground" />
                        </div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-secondary-custom border border-border-custom px-2.5 py-1 rounded-full bg-background">
                          Pillar {pillar.pillar}
                        </span>
                      </div>

                      {/* Tag & Title */}
                      <div className="mb-4">
                        <p className="text-xs uppercase tracking-widest font-mono text-secondary-custom mb-1">
                          {pillar.tag}
                        </p>
                        <h3 className="text-xl font-bold tracking-tight text-foreground mb-1">
                          {pillar.title}
                        </h3>
                        <p className="text-xs font-semibold text-foreground/80 font-mono">
                          {pillar.headline}
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-secondary-custom leading-relaxed mb-6">
                        {pillar.description}
                      </p>

                      {/* Capabilities List */}
                      <div className="space-y-2 mb-6 pt-4 border-t border-border-custom/50">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-secondary-custom font-semibold mb-2">
                          Core Focus Areas
                        </p>
                        {pillar.capabilities.map((cap) => (
                          <div key={cap} className="flex items-center gap-2 text-xs text-foreground/90">
                            <CheckCircle2 className="w-3.5 h-3.5 text-foreground/60 shrink-0" />
                            <span>{cap}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Metric & Link */}
                    <div className="pt-4 border-t border-border-custom flex flex-col gap-3">
                      <div className="flex items-center justify-between text-[11px] font-mono text-secondary-custom">
                        <span>Standard</span>
                        <span className="text-foreground font-semibold">{pillar.metric}</span>
                      </div>
                      <Link
                        href={pillar.linkHref}
                        className="inline-flex items-center justify-between text-xs font-semibold text-foreground border border-border-custom rounded-lg px-4 py-2.5 w-full hover:bg-foreground hover:text-background transition-all group/btn"
                      >
                        <span>{pillar.linkText}</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            OUR APPROACH
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="border-b border-border-custom">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-20 sm:py-24">

            {/* Section header */}
            <div className="mb-14 pb-8 border-b border-border-custom">
              <div className="inline-flex items-center gap-2 border border-border-custom bg-surface px-3 py-1 rounded-full mb-4 about-reveal">
                <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-foreground">
                  [03] · Our Approach
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground about-reveal max-w-xl">
                How we think about every project.
              </h2>
            </div>

            {/* Principles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
              {principles.map((p) => (
                <div key={p.num} className="about-reveal">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-[10px] font-mono font-bold text-secondary-custom border border-border-custom rounded-full px-2.5 py-1 shrink-0 mt-0.5">
                      {p.num}
                    </span>
                    <h3 className="text-base font-bold text-foreground tracking-tight">
                      {p.title}
                    </h3>
                  </div>
                  <p className="text-sm text-secondary-custom leading-relaxed pl-[3.25rem]">
                    {p.body}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            FINAL CTA
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-24 sm:py-32 relative z-10">
            <div className="max-w-3xl about-reveal">
              <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-secondary-custom block mb-6">
                [04] · Start a Project
              </span>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.06] mb-6">
                Let&apos;s Build What&apos;s Next.
              </h2>
              <p className="text-sm sm:text-base text-secondary-custom leading-relaxed mb-10 max-w-xl">
                Whether you need a stronger search presence, a custom web application, or smarter automation — we work as a direct extension of your team. Tell us what you&apos;re building and we&apos;ll take it from there.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-foreground text-background font-bold text-sm px-7 py-3.5 rounded-full hover:opacity-90 transition-all active:scale-[0.98]"
                >
                  Request a Free Quote
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="mailto:contact@techinfinix.com"
                  className="inline-flex items-center gap-2 border border-border-custom text-foreground font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-surface transition-all"
                >
                  contact@techinfinix.com
                </a>
              </div>
            </div>
          </div>

          {/* Decorative large text watermark */}
          <div
            aria-hidden="true"
            className="absolute right-0 bottom-0 text-[clamp(6rem,15vw,14rem)] font-black tracking-tighter text-foreground/[0.03] leading-none select-none pointer-events-none pr-6 pb-4"
          >
            TI
          </div>
        </section>

      </main>
      <FooterSection />
    </>
  );
}
