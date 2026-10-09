"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, ExternalLink } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/layout/Navbar";
import FooterSection from "@/components/layout/FooterSection";

gsap.registerPlugin(ScrollTrigger);

// ─── Founders ─────────────────────────────────────────────────────────────────
const founders = [
  {
    name: "Jagdish Bandhiya",
    role: "Marketing Head",
    focus: "Growth strategy, SEO systems, and client acquisition.",
    linkedin: "https://www.linkedin.com/in/jagdish-bandhiya-56a726333/",
    initials: "JB",
  },
  {
    name: "Meet Vaghasiya",
    role: "Technical Head",
    focus: "Architecture, engineering, and product delivery.",
    linkedin: "https://www.linkedin.com/in/meet-vaghasiya-3674923a5/",
    initials: "MV",
  },
  {
    name: "Mihir Dudhat",
    role: "Operations & Sales Head",
    focus: "Client relations, project management, and business development.",
    linkedin: "https://www.linkedin.com/in/mihir-dudhat/",
    initials: "MD",
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
            FOUNDERS
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="border-b border-border-custom bg-surface/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-20 sm:py-24">

            {/* Section header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14 pb-8 border-b border-border-custom">
              <div>
                <div className="inline-flex items-center gap-2 border border-border-custom bg-surface px-3 py-1 rounded-full mb-4 about-reveal">
                  <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-foreground">
                    [02] · Our Founders
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground about-reveal">
                  Three specialists.<br className="hidden sm:block" /> One shared mission.
                </h2>
              </div>
              <p className="text-sm text-secondary-custom max-w-xs leading-relaxed about-reveal">
                Each founder owns a distinct domain. Together, we cover marketing, engineering, and operations — the three pillars that determine whether a digital project succeeds or stalls.
              </p>
            </div>

            {/* Founders grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border-custom border border-border-custom rounded-lg overflow-hidden">
              {founders.map((f, i) => (
                <div
                  key={f.name}
                  className="bg-surface p-8 sm:p-10 flex flex-col gap-5 about-reveal group"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full border-2 border-border-custom bg-background flex items-center justify-center">
                    <span className="text-sm font-bold tracking-tight text-foreground font-mono">
                      {f.initials}
                    </span>
                  </div>

                  {/* Name & role */}
                  <div>
                    <p className="text-xs uppercase tracking-widest font-mono text-secondary-custom mb-1">
                      {f.role}
                    </p>
                    <h3 className="text-xl font-bold tracking-tight text-foreground">
                      {f.name}
                    </h3>
                  </div>

                  {/* Focus */}
                  <p className="text-sm text-secondary-custom leading-relaxed flex-1">
                    {f.focus}
                  </p>

                  {/* LinkedIn */}
                  <a
                    href={f.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${f.name} on LinkedIn`}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-foreground border border-border-custom rounded-full px-4 py-2 w-fit hover:bg-foreground hover:text-background transition-all"
                  >
                    LinkedIn
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
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
