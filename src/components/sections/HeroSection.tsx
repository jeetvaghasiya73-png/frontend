"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDown, TrendingUp, Globe, Database, Bot } from "lucide-react";
import { gsap } from "gsap";
import SplitText from "@/components/animations/SplitText";
import dynamic from "next/dynamic";

const ThreeHeroObject = dynamic(() => import("@/components/ui/ThreeHeroObject"), { ssr: false });

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const stats = [
    {
      num: "#1 Rank",
      label: "Google Maps 3-Pack",
      sparkline: "M0,22 Q20,6 40,18 T80,8 T120,24 T160,6 T200,16 T240,6",
      color: "stroke-emerald-500"
    },
    {
      num: "99.9%",
      label: "Next.js Web Uptime",
      sparkline: "M0,14 Q30,26 60,10 T120,22 T180,6 T240,14",
      color: "stroke-sky-500"
    },
    {
      num: "10M+",
      label: "Business Records Scraped",
      sparkline: "M0,24 Q25,8 50,18 T100,6 T150,22 T200,8 T240,18",
      color: "stroke-amber-500"
    },
    {
      num: "24/7",
      label: "WhatsApp CRM Pipelines",
      sparkline: "M0,10 Q35,4 70,18 T140,8 T210,22 T240,6",
      color: "stroke-indigo-500"
    }
  ];

  const servicePillars = [
    {
      id: "01",
      title: "Local SEO & Google Maps",
      desc: "Top 3 Pack dominance, local keywords & automated reviews.",
      icon: TrendingUp,
      badge: "Local SEO",
      borderAccent: "hover:border-emerald-500/40"
    },
    {
      id: "02",
      title: "Next.js Web Development",
      desc: "Mobile-first, lightning-fast high-conversion web apps.",
      icon: Globe,
      badge: "Web Dev",
      borderAccent: "hover:border-sky-500/40"
    },
    {
      id: "03",
      title: "High-Volume Web Scraping",
      desc: "Automated business directories & Playwright crawler nodes.",
      icon: Database,
      badge: "Scraping",
      borderAccent: "hover:border-amber-500/40"
    },
    {
      id: "04",
      title: "24/7 WhatsApp Automations",
      desc: "Evolution API Baileys bots, n8n workflows & CRM syncing.",
      icon: Bot,
      badge: "Automations",
      borderAccent: "hover:border-indigo-500/40"
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-smooth-reveal",
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.05,
          ease: "power2.out",
          delay: 0.05
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleScrollToServices = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("services");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative flex flex-col items-center overflow-hidden grid-bg pt-16 sm:pt-20"
    >
      {/* Top Diode Status Bar (MadeWithGSAP Style) */}
      <div className="w-full border-b border-border-custom bg-surface/30 backdrop-blur-md py-1.5 px-4 text-center z-20 overflow-hidden hidden sm:block">
        <p className="text-[10px] uppercase tracking-widest font-mono text-secondary-custom flex items-center justify-center gap-2 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          <span className="truncate">TECH INFINIX &bull; SYSTEMS ARCHITECTURE FOR SEO, MODERN WEB, SCRAPING & AUTOMATIONS</span>
          <Link
            href="/contact"
            className="text-foreground hover:underline inline-flex items-center gap-0.5 font-bold ml-1.5 shrink-0"
          >
            <span>Request Quote</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </p>
      </div>

      {/* Main Hero Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center pt-3 sm:pt-6 pb-6 sm:pb-12 z-10">
        
        {/* Left Column: Refined Balanced Typography */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          
          {/* Diode Pill Tag */}
          <div className="hero-smooth-reveal inline-flex items-center gap-2 border border-border-custom bg-surface px-3 py-1 rounded-full mb-4 sm:mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-foreground">
              Autonomous Agency & Growth Engine
            </span>
          </div>

          {/* Balanced Display Headline (Dual Opacity Contrast - MadeWithGSAP Style) */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold tracking-tight leading-[1.18] mb-4 sm:mb-5 text-foreground max-w-2xl">
            <span className="text-foreground block">
              <SplitText text="Engineered Systems for Growth." type="words" />
            </span>
            <span className="text-secondary-custom font-medium text-2xl sm:text-3xl md:text-4xl block mt-1">
              Local SEO, high-performance web, data scraping & 24/7 automations.
            </span>
          </h1>

          {/* Clean Description */}
          <p className="hero-smooth-reveal text-xs sm:text-sm text-secondary-custom max-w-lg mb-5 sm:mb-6 leading-relaxed">
            We build Google Maps Top 3 ranking machines, mobile-first Next.js web applications, high-volume directory scrapers, and autonomous WhatsApp CRM pipelines.
          </p>

          {/* Service Pillar Micro-Badges */}
          <div className="hero-smooth-reveal flex flex-wrap gap-1.5 mb-5 sm:mb-7">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-mono border border-border-custom bg-surface text-foreground">
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              Local SEO 3-Pack
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-mono border border-border-custom bg-surface text-foreground">
              <span className="w-1 h-1 rounded-full bg-sky-500" />
              Next.js Full-Stack
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-mono border border-border-custom bg-surface text-foreground">
              <span className="w-1 h-1 rounded-full bg-amber-500" />
              Data Scraping
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-mono border border-border-custom bg-surface text-foreground">
              <span className="w-1 h-1 rounded-full bg-indigo-500" />
              WhatsApp & AI Bot
            </span>
          </div>

          {/* Action Buttons (MadeWithGSAP Style) */}
          <div className="hero-smooth-reveal flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-foreground text-background hover:opacity-90 text-xs font-mono uppercase tracking-wider font-bold transition duration-200 group shadow-xs cursor-pointer text-center"
            >
              <span>Get Architecture Quote</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
            
            <a
              href="/#services"
              onClick={handleScrollToServices}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-border-custom bg-surface hover:bg-surface/80 text-foreground text-xs font-mono uppercase tracking-wider font-semibold transition duration-200 group shadow-xs cursor-pointer text-center"
            >
              <span>Explore 4 Pillars</span>
              <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
            </a>
          </div>

        </div>

        {/* Right Column: 3D Visual Mesh */}
        <div className="lg:col-span-5 w-full flex justify-center items-center relative mt-2 lg:mt-0">
          <ThreeHeroObject />
        </div>

      </div>

      {/* KPI Stats Strip (Geometric Rectangular Tiles) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 py-4 sm:py-8 z-10">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="hero-smooth-reveal border border-border-custom bg-surface p-4 sm:p-5 rounded-md flex flex-col justify-between relative overflow-hidden h-[110px] hover:border-foreground/30 transition group"
          >
            <div>
              <span className="text-[10px] uppercase font-bold font-mono tracking-wider text-secondary-custom block">
                {stat.label}
              </span>
              <span className="text-xl sm:text-2xl md:text-3xl font-bold font-mono mt-1.5 block text-foreground">
                {stat.num}
              </span>
            </div>

            {/* Subtle SVG Wave Sparkline */}
            <div className="absolute bottom-0 left-0 w-full h-[28px] pointer-events-none opacity-25 group-hover:opacity-60 transition-opacity duration-300">
              <svg className="w-full h-full" viewBox="0 0 240 35" fill="none" preserveAspectRatio="none">
                <path
                  d={stat.sparkline}
                  className={`fill-none stroke-2 ${stat.color} transition-all duration-300`}
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* 4 Pillars Strip (MadeWithGSAP Style Preview) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 py-4 sm:py-8 z-10 border-t border-border-custom">
        {servicePillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div
              key={pillar.id}
              className={`hero-smooth-reveal border border-border-custom bg-surface p-4 sm:p-5 rounded-md text-left flex flex-col justify-between min-h-[160px] ${pillar.borderAccent} transition group`}
            >
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-sm bg-background border border-border-custom flex items-center justify-center text-foreground">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-secondary-custom px-2 py-0.5 rounded-xs border border-border-custom bg-background">
                  [{pillar.id}] {pillar.badge}
                </span>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-indigo-400 transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-secondary-custom text-[11px] mt-1 leading-relaxed font-normal">
                  {pillar.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
