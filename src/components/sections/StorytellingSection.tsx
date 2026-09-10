"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitText from "@/components/animations/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const sections = [
  {
    slug: "enterprise-automation",
    number: "01",
    theme: "from-slate-950 via-blue-950 to-slate-900",
    label: "Enterprise AI Automation",
    headline: "Automate Business Operations",
    description:
      "Build a smarter operation engine with AI workflows, dynamic alerts, and data-driven orchestration.",
    features: [
      "Intelligent workflow orchestration",
      "Automated decision triggers",
      "Real-time business monitoring",
    ],
    accent: "bg-gradient-to-br from-sky-400 to-indigo-500/80",
  },
  {
    slug: "lead-generation",
    number: "02",
    theme: "from-violet-950 via-purple-950 to-fuchsia-950",
    label: "Lead Generation",
    headline: "Generate Qualified Leads Automatically",
    description:
      "Convert the right buyers with AI-qualified lead funnels, predictive scoring, and revenue-ready outreach.",
    features: [
      "Smart lead scoring",
      "CRM workflow sync",
      "Personalized follow-up automation",
    ],
    accent: "bg-gradient-to-br from-fuchsia-500 to-violet-500/80",
  },
  {
    slug: "website-development",
    number: "03",
    theme: "from-slate-900 via-slate-950 to-sky-950",
    label: "Website Development",
    headline: "Websites Designed To Convert",
    description:
      "Premium digital experiences that guide visitors, surface value, and grow conversion momentum.",
    features: [
      "Modern conversion design",
      "Performance-first architecture",
      "SEO-ready web experiences",
    ],
    accent: "bg-gradient-to-br from-cyan-400 to-blue-500/90",
  },
  {
    slug: "web-scraping",
    number: "04",
    theme: "from-orange-950 via-amber-950 to-slate-900",
    label: "Web Scraping",
    headline: "Extract Business Data At Scale",
    description:
      "Collect, normalize, and enrich enterprise datasets so your teams can act faster on real intelligence.",
    features: [
      "Scale-friendly extraction",
      "Cross-source normalization",
      "Automated delivery pipelines",
    ],
    accent: "bg-gradient-to-br from-orange-400 to-amber-500/90",
  },
  {
    slug: "ai-agents",
    number: "05",
    theme: "from-emerald-950 via-emerald-900 to-slate-950",
    label: "AI Agents",
    headline: "AI Employees Working 24/7",
    description:
      "Deploy autonomous agents that manage outreach, operations, and support with trust, speed, and continuity.",
    features: [
      "Autonomous task execution",
      "Agent collaboration flows",
      "Adaptive performance tuning",
    ],
    accent: "bg-gradient-to-br from-emerald-400 to-lime-500/80",
  },
  {
    slug: "seo",
    number: "06",
    theme: "from-violet-950 via-purple-950 to-slate-950",
    label: "SEO",
    headline: "Rank Higher. Grow Faster.",
    description:
      "Optimize your presence with intelligent SEO strategy, content signals, and growth-focused search systems.",
    features: [
      "Search performance diagnostics",
      "Content intent modeling",
      "Traffic velocity monitoring",
    ],
    accent: "bg-gradient-to-br from-violet-500 to-fuchsia-500/90",
  },
];

export default function StorytellingSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const panels = gsap.utils.toArray<HTMLDivElement>(
      ".story-panel"
    );

    panels.forEach((panel, index) => {
      const nextPanel = panels[index + 1] as HTMLElement | undefined;
      const headline = panel.querySelector(
        ".story-headline"
      ) as HTMLElement;
      const copy = panel.querySelector(
        ".story-copy"
      ) as HTMLElement;
      const features = panel.querySelectorAll(
        ".story-feature"
      );
      const actions = panel.querySelector(
        ".story-actions"
      ) as HTMLElement;
      const visual = panel.querySelector(
        ".story-visual"
      ) as HTMLElement;
      const dimmer = panel.querySelector(
        ".section-dimmer"
      ) as HTMLElement;
      const panelCard = panel.querySelector(
        ".section-card"
      ) as HTMLElement;
      const nextCard = nextPanel?.querySelector(
        ".section-card"
      ) as HTMLElement | null;

      const duration = nextPanel ? "+=160%" : "+=120%";

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: panel,
          start: "top top",
          end: duration,
          scrub: true,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
        },
      });

      tl.fromTo(
        panelCard,
        {
          filter: "brightness(1)",
          scale: 1,
          transformOrigin: "center center",
        },
        {
          filter: "brightness(0.82)",
          scale: 0.98,
          duration: 1,
          ease: "none",
        },
        0
      )
        .fromTo(
          dimmer,
          { opacity: 0 },
          { opacity: 0.14, duration: 1, ease: "none" },
          0
        )
        .fromTo(
          visual,
          { opacity: 0, y: 70, scale: 1.16 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.05,
            ease: "power3.out",
          },
          0
        )
        .fromTo(
          headline,
          { opacity: 0, y: 45, filter: "blur(18px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "power3.out",
          },
          0.18
        )
        .fromTo(
          copy,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
          },
          0.34
        )
        .fromTo(
          features,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: "power3.out",
          },
          0.44
        )
        .fromTo(
          actions,
          { opacity: 0, scale: 0.92 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: "back.out(1.2)",
          },
          0.6
        );

      if (nextPanel && nextCard) {
        tl.fromTo(
          nextPanel,
          { yPercent: 18, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 1.2, ease: "power1.out" },
          0.2
        )
          .fromTo(
            nextCard,
            {
              borderRadius: "36px",
              boxShadow: "0px 0px 0px rgba(0,0,0,0)",
            },
            {
              borderRadius: "0px",
              boxShadow: "0 45px 130px rgba(15, 23, 42, 0.18)",
              duration: 1.2,
              ease: "power1.out",
            },
            0.2
          );
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        trigger.kill(true);
      });
    };
  }, []);

  return (
    <div ref={containerRef} className="story-section bg-background">
      {sections.map((section, index) => (
        <section
          key={section.slug}
          className="story-panel min-h-screen relative overflow-hidden flex items-center"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(8, 11, 29, 0.88) 0%, rgba(12, 14, 31, 0.95) 100%), radial-gradient(circle at top left, rgba(59, 130, 246, 0.14), transparent 30%), radial-gradient(circle at bottom right, rgba(168, 85, 247, 0.12), transparent 28%)`,
          }}
        >
          <div className="section-dimmer absolute inset-0 bg-slate-950/80 pointer-events-none" />
          <div className="section-card relative z-10 mx-auto w-full max-w-7xl px-6 md:px-12 py-20 rounded-[3rem] border border-white/10 shadow-[0_20px_80px_rgba(8,11,29,0.25)] overflow-hidden backdrop-blur-xl bg-slate-950/95">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -left-20 top-16 w-72 h-72 rounded-full blur-3xl opacity-40 bg-gradient-to-br from-white/10 via-sky-400/20 to-transparent animate-float-smooth" />
              <div className="absolute right-0 top-24 w-60 h-60 rounded-full blur-3xl opacity-35 bg-gradient-to-br from-fuchsia-500/20 via-purple-500/10 to-transparent animate-float-smooth" />
              <div className="absolute inset-x-0 bottom-0 h-64 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_55%)]" />
            </div>

            <div className="relative grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-10 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-slate-400 font-semibold">
                  <span className="text-sky-400">{section.number}</span>
                  <span>{section.label}</span>
                </div>
                <h2 className="story-headline text-4xl md:text-5xl xl:text-6xl font-semibold leading-tight tracking-tight text-white max-w-3xl">
                  <SplitText text={section.headline} type="chars" />
                </h2>
                <p className="story-copy text-base md:text-lg leading-8 text-slate-300 max-w-2xl">
                  {section.description}
                </p>

                <div className="grid gap-3 md:grid-cols-3">
                  {section.features.map((feature) => (
                    <div
                      key={feature}
                      className="story-feature rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-200 backdrop-blur-md shadow-[0_16px_45px_rgba(15,23,42,0.16)]"
                    >
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="story-actions flex flex-wrap gap-4 items-center pt-2">
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-full bg-white text-slate-950 font-semibold px-6 py-4 shadow-[0_14px_40px_rgba(255,255,255,0.12)] transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    Start a Project
                  </a>
                  <a
                    href="/services"
                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 text-white px-6 py-4 transition-all duration-300 hover:border-sky-400 hover:text-sky-200"
                  >
                    Explore Services
                  </a>
                </div>
              </div>

              <div className="story-visual relative rounded-[2rem] border border-white/10 bg-slate-900/90 overflow-hidden shadow-[inset_0_0_120px_rgba(31,41,55,0.32)] h-[520px] md:h-[560px] flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_32%)] pointer-events-none" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgba(15,23,42,0.48)_100%)]" />

                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="floating-object left-8 top-12 w-32 h-32 rounded-[2.5rem] bg-sky-400/15 border border-sky-400/20 shadow-[0_30px_100px_rgba(56,189,248,0.15)] animate-float-smooth" />
                  <div className="floating-object right-12 top-24 w-28 h-28 rounded-full bg-violet-500/20 border border-violet-500/20 shadow-[0_24px_70px_rgba(168,85,247,0.18)] animate-float-smooth" />
                  <div className="floating-object bottom-20 left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full border border-white/10 bg-gradient-to-tr from-sky-400/15 to-violet-500/10 blur-[2px] animate-spin-slow" />

                  <div className="relative z-10 flex items-center justify-center w-[260px] h-[260px] rounded-full border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_40px_120px_rgba(255,255,255,0.08)]">
                    <div className="w-[160px] h-[160px] rounded-full border border-white/10 bg-gradient-to-br from-sky-400/25 to-fuchsia-500/15 shadow-[0_0_60px_rgba(125,211,252,0.18)] animate-float-smooth flex items-center justify-center">
                      <div className="w-[82px] h-[82px] rounded-full bg-white/10 border border-white/15 shadow-[inset_0_0_40px_rgba(255,255,255,0.18)] flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-violet-500 shadow-[0_0_30px_rgba(56,189,248,0.35)]" />
                      </div>
                    </div>
                  </div>

                  <div className="absolute right-0 bottom-10 w-48 h-48 rounded-full bg-gradient-to-br from-cyan-400/15 to-transparent blur-3xl" />
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
