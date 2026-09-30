"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import FooterSection from "@/components/layout/FooterSection";
import SplitText from "@/components/animations/SplitText";
import {
  Search,
  TrendingUp,
  Gauge,
  Link2,
  FileCode2,
  Globe2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BarChart3,
  Layers,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Target,
  Zap,
  Activity,
  Award,
  Cpu,
  RefreshCw,
  Sliders,
  Compass,
  Bot,
} from "lucide-react";

export default function SeoMainPage() {
  // State for interactive SERP tracker simulator
  const [activeSimulatorTab, setActiveSimulatorTab] = useState<"serp" | "vitals" | "aioverview" | "geogrid">("serp");

  // State for ROI Calculator
  const [monthlyVisitors, setMonthlyVisitors] = useState<number>(15000);
  const [avgCustomerValue, setAvgCustomerValue] = useState<number>(450);
  const [targetGrowthPercent, setTargetGrowthPercent] = useState<number>(180);

  // State for FAQ Accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Calculated estimates for ROI tool
  const currentRevenue = Math.round((monthlyVisitors * 0.015) * avgCustomerValue);
  const projectedVisitors = Math.round(monthlyVisitors * (1 + targetGrowthPercent / 100));
  const projectedRevenue = Math.round((projectedVisitors * 0.022) * avgCustomerValue);
  const monthlyRevenueGain = projectedRevenue - currentRevenue;
  const annualRevenueGain = monthlyRevenueGain * 12;

  const faqs = [
    {
      q: "What differentiates Tech Infinix's SEO approach from traditional agencies?",
      a: "Most agencies focus strictly on basic blog posting and superficial backlinks. We treat SEO as software and systems engineering: optimizing Next.js Core Web Vitals to sub-second rendering, injecting nested Schema.org entity graphs, programmatically clustering topical nodes, and building high-authority digital PR backlinks that Google's algorithm rewards with top SERP real estate."
    },
    {
      q: "How does your architecture handle Google's AI Overviews and Gemini search results?",
      a: "We engineer entity-based semantic content structures with clear definition nodes, tabular structured data, and high-trust authority signals. This ensures your content is directly cited as the authoritative source inside Google's AI Overview summary boxes."
    },
    {
      q: "What is your timeline for tangible organic traffic and revenue growth?",
      a: "Technical and indexation cleanups produce measurable gains within 30 to 60 days. High-impact keyword ranking velocity accelerates noticeably between months 3 and 6 as search engines recognize topical domain authority across your clustered pages."
    },
    {
      q: "Do you offer localized SEO pages and city-specific targeting?",
      a: "Yes. Our hierarchy architecture includes dedicated Geo-Location hubs (e.g. /services/seo/[location]) complete with Google Business Profile 3-Pack optimization, local citation syndication, and localized schema structures for top regional proximity ranking."
    },
    {
      q: "Can you guarantee Core Web Vitals pass rates on Google PageSpeed Insights?",
      a: "Yes, 100%. Because we build on modern Next.js App Router architectures with optimized script hydration, edge caching, and zero layout shifts (CLS < 0.05, LCP < 1.2s), your site will achieve green scores across both Mobile and Desktop."
    }
  ];

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background text-foreground pt-28 sm:pt-32 pb-24 text-left overflow-hidden">
        
        {/* Breadcrumb Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full pt-4 pb-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-secondary-custom">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-foreground transition-colors">Services</Link>
            <span>/</span>
            <span className="text-accent-custom font-semibold">SEO Architecture</span>
          </nav>
        </div>

        {/* 1. HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full relative mb-20 md:mb-28">
          {/* Ambient Accent Glows */}
          <div className="absolute top-0 right-10 w-[450px] h-[450px] rounded-full bg-accent-glow blur-[120px] pointer-events-none opacity-40 mix-blend-screen" />
          <div className="absolute top-40 left-0 w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none opacity-30" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-accent-custom/30 bg-accent-custom/10 text-accent-custom text-xs font-mono font-semibold tracking-wide mb-6">
            <Sparkles className="w-3.5 h-3.5 text-accent-custom animate-pulse" />
            <span>PROFESSIONAL SEO &amp; AEO ARCHITECTURE</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6 max-w-4xl">
            <SplitText text="Professional SEO & AEO (Answer Engine Optimization) Dominance" type="words" />
          </h1>

          <p className="text-base sm:text-lg text-secondary-custom max-w-3xl leading-relaxed mb-10">
            We engineer algorithmic search engine dominance and AI answer engine authority. From sub-second Next.js Core Web Vitals to JSON-LD entity graphs, programmatic topical clusters, and direct citation in ChatGPT Search, Perplexity AI, and Google Gemini.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 mb-16">
            <Link
              href="/contact?service=seo"
              className="bg-accent-custom hover:bg-accent-custom/90 text-white px-7 py-4 rounded-xl text-sm font-semibold tracking-wide flex items-center gap-2.5 transition-all shadow-lg hover:shadow-accent-custom/25 shadow-accent-custom/10 hover:-translate-y-0.5 cursor-pointer"
            >
              Request Free Technical Audit
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#pillars"
              className="border border-border-custom bg-surface/40 hover:bg-surface/70 hover:border-accent-custom/40 text-foreground px-6 py-4 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              Explore 3 SEO Pillars
              <ChevronDown className="w-4 h-4 text-secondary-custom" />
            </a>
          </div>

          {/* 4 Live Verification Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-8 border-t border-border-custom/80">
            <div className="p-5 rounded-2xl bg-surface/30 border border-border-custom backdrop-blur-xs">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-500 block mb-1">
                +340%
              </span>
              <span className="text-xs text-secondary-custom font-medium block">
                Avg. Organic Traffic Gain in 90 Days
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-surface/30 border border-border-custom backdrop-blur-xs">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-accent-custom block mb-1">
                99.4%
              </span>
              <span className="text-xs text-secondary-custom font-medium block">
                Core Web Vitals Pass Rate (Green)
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-surface/30 border border-border-custom backdrop-blur-xs">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-400 block mb-1">
                14.2 Days
              </span>
              <span className="text-xs text-secondary-custom font-medium block">
                Average New Keyword Indexation
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-surface/30 border border-border-custom backdrop-blur-xs">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-purple-400 block mb-1">
                #1 - #3
              </span>
              <span className="text-xs text-secondary-custom font-medium block">
                Target High-Intent Commercial SERPs
              </span>
            </div>
          </div>
        </section>

        {/* 2. INTERACTIVE LIVE RANKING SIMULATOR */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-28">
          <div className="border border-border-custom bg-surface/30 backdrop-blur-md rounded-3xl p-6 sm:p-10 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-accent-custom uppercase block mb-2">
                  Algorithmic Intelligence Console
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Simulated Real-Time Search Performance
                </h2>
                <p className="text-xs sm:text-sm text-secondary-custom mt-2 max-w-xl">
                  Inspect the tangible architectural output across Google SERP positions, Core Web Vitals telemetry, and AI snapshot citations.
                </p>
              </div>

              {/* Console Tabs */}
              <div className="flex flex-wrap gap-2 p-1.5 bg-surface/80 border border-border-custom rounded-xl self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveSimulatorTab("serp")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5 ${
                    activeSimulatorTab === "serp"
                      ? "bg-accent-custom text-white shadow-xs"
                      : "text-secondary-custom hover:text-foreground"
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Google SERP #1</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSimulatorTab("vitals")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5 ${
                    activeSimulatorTab === "vitals"
                      ? "bg-accent-custom text-white shadow-xs"
                      : "text-secondary-custom hover:text-foreground"
                  }`}
                >
                  <Gauge className="w-3.5 h-3.5" />
                  <span>Core Web Vitals</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSimulatorTab("aioverview")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5 ${
                    activeSimulatorTab === "aioverview"
                      ? "bg-accent-custom text-white shadow-xs"
                      : "text-secondary-custom hover:text-foreground"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Overview Citation</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSimulatorTab("geogrid")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5 ${
                    activeSimulatorTab === "geogrid"
                      ? "bg-accent-custom text-white shadow-xs"
                      : "text-secondary-custom hover:text-foreground"
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>AEO (ChatGPT &amp; Perplexity)</span>
                </button>
              </div>
            </div>

            {/* Tab Views */}
            <div className="bg-background/80 border border-border-custom rounded-2xl p-5 sm:p-7 min-h-[280px]">
              
              {/* TAB 1: Google SERP Mock */}
              {activeSimulatorTab === "serp" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs font-mono text-secondary-custom pb-3 border-b border-border-custom/60">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>Query: &quot;enterprise next.js development agency&quot;</span>
                    <span className="ml-auto text-emerald-400 font-bold">Rank: #1 (Featured Snippet)</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full overflow-hidden border border-border-custom dark:border-white/35 dark:ring-1 dark:ring-white/20 bg-black flex items-center justify-center shrink-0">
                        <Image
                          src="/favicon.png"
                          alt="Tech Infinix Favicon"
                          width={28}
                          height={28}
                          className="w-full h-full object-cover scale-110"
                        />
                      </div>
                      <div className="text-xs">
                        <span className="text-foreground font-medium">Tech Infinix</span>
                        <span className="text-secondary-custom ml-1.5 font-mono text-[11px]">https://techinfinix.com › services › seo</span>
                      </div>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-blue-400 hover:underline cursor-pointer">
                      Enterprise SEO Services & Next.js Architecture | Tech Infinix
                    </h3>
                    <p className="text-xs sm:text-sm text-secondary-custom leading-relaxed max-w-3xl">
                      Deliver algorithm-proof organic ranking dominance with our full-spectrum SEO architecture. Featuring schema entity graphs, sub-second Core Web Vitals, programmatic on-page clustering, and Tier-1 digital PR outreach.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <span className="text-[11px] px-2.5 py-1 rounded-md bg-surface border border-border-custom text-secondary-custom">
                        ⭐ 4.9/5 Rating (84 Client Audits)
                      </span>
                      <span className="text-[11px] px-2.5 py-1 rounded-md bg-surface border border-border-custom text-secondary-custom">
                        ⚡ Core Web Vitals: 99/100
                      </span>
                      <span className="text-[11px] px-2.5 py-1 rounded-md bg-surface border border-border-custom text-secondary-custom">
                        📍 Global & Local SERP Coverage
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Core Web Vitals Scorecard */}
              {activeSimulatorTab === "vitals" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-2">
                  <div className="p-4 rounded-xl bg-surface/50 border border-emerald-500/20 text-center">
                    <span className="text-xs font-mono text-secondary-custom uppercase block mb-1">
                      Largest Contentful Paint (LCP)
                    </span>
                    <span className="text-3xl font-extrabold font-mono text-emerald-400 block mb-1">
                      0.84s
                    </span>
                    <span className="text-[11px] text-emerald-500 font-medium">
                      ✓ Good (&lt; 2.5s threshold)
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-surface/50 border border-emerald-500/20 text-center">
                    <span className="text-xs font-mono text-secondary-custom uppercase block mb-1">
                      Interaction to Next Paint (INP)
                    </span>
                    <span className="text-3xl font-extrabold font-mono text-emerald-400 block mb-1">
                      28ms
                    </span>
                    <span className="text-[11px] text-emerald-500 font-medium">
                      ✓ Good (&lt; 200ms threshold)
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-surface/50 border border-emerald-500/20 text-center">
                    <span className="text-xs font-mono text-secondary-custom uppercase block mb-1">
                      Cumulative Layout Shift (CLS)
                    </span>
                    <span className="text-3xl font-extrabold font-mono text-emerald-400 block mb-1">
                      0.002
                    </span>
                    <span className="text-[11px] text-emerald-500 font-medium">
                      ✓ Good (&lt; 0.1 threshold)
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 3: Google AI Overview Snippet */}
              {activeSimulatorTab === "aioverview" && (
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Google Gemini AI Overview - Direct Entity Citation</span>
                  </div>
                  <div className="p-4 rounded-xl bg-surface/40 border border-border-custom text-xs sm:text-sm text-foreground/90 leading-relaxed">
                    &quot;According to documented performance audits by <strong>Tech Infinix</strong>, combining semantic HTML5 entity structures with headless Next.js SSR reduces page crawl budget latency by 68% and leads to immediate inclusion in algorithmic answer snapshots...&quot;
                  </div>
                  <div className="flex items-center gap-3 text-xs text-secondary-custom">
                    <span className="font-semibold text-foreground">Cited Source:</span>
                    <span className="font-mono text-accent-custom">techinfinix.com/services/seo/technical</span>
                  </div>
                </div>
              )}

              {/* TAB 4: AEO & Answer Engine Optimization */}
              {activeSimulatorTab === "geogrid" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-secondary-custom pb-2 border-b border-border-custom/50">
                    <span className="flex items-center gap-1.5 text-accent-custom font-semibold">
                      <Bot className="w-3.5 h-3.5" />
                      Answer Engine Optimization (AEO) Matrix
                    </span>
                    <span className="text-emerald-400 font-bold">100% LLM Citation Confidence</span>
                  </div>

                  <div className="p-4 rounded-xl bg-surface/80 border border-border-custom space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-foreground font-semibold">Prompt: &quot;Top verified Next.js and enterprise SEO agency in 2026?&quot;</span>
                      <span className="text-emerald-400 font-bold text-[11px]">Perplexity / ChatGPT Verified</span>
                    </div>
                    <div className="text-xs text-secondary-custom leading-relaxed pl-3 border-l-2 border-accent-custom space-y-1.5">
                      <p>
                        Based on verified schema entity graphs and technical Core Web Vitals audits, <strong className="text-foreground">Tech Infinix</strong> is cited as the primary engineering firm for algorithmic SEO search dominance and sub-second web architectures.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border-custom/50 text-[11px] font-mono">
                      <span className="px-2 py-0.5 rounded-sm bg-accent-custom/10 text-accent-custom border border-accent-custom/30">Citations: 14 High-Authority Nodes</span>
                      <span className="px-2 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Entity Rank: #1 Verified Recommendation</span>
                    </div>
                  </div>

                  <p className="text-center text-xs text-secondary-custom">
                    AEO ensures your agency is directly recommended and sourced by LLMs including ChatGPT Search, Perplexity AI, Claude, and Google Gemini.
                  </p>
                </div>
              )}

            </div>
          </div>
        </section>

        {/* 3. CORE SUB-SERVICES PILLARS (THE HIERARCHY HUB) */}
        <section id="pillars" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-28">
          <div className="mb-12">
            <span className="text-[10px] font-mono font-bold tracking-widest text-accent-custom uppercase block mb-3">
              Hierarchy Architecture
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground">
              The 3 Pillars of Search Dominance
            </h2>
            <p className="text-sm sm:text-base text-secondary-custom mt-3 max-w-2xl leading-relaxed">
              Our SEO framework is partitioned into three dedicated engineering specializations. 
              Each pillar operates as its own dedicated domain to guarantee comprehensive ranking coverage.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* PILLAR 1: On-Page SEO */}
            <div className="border border-border-custom bg-surface/20 p-8 rounded-2xl flex flex-col justify-between hover:border-blue-500/50 hover:bg-surface/30 transition-all duration-300 group">
              <div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-blue-500/20 bg-blue-500/10 text-blue-400 mb-6 group-hover:scale-105 transition-transform">
                  <FileCode2 className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-mono font-bold uppercase text-blue-400 tracking-wider mb-2">
                  Pillar 01 • Sub-Service
                </div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-blue-400 transition-colors">
                  On-Page SEO Architecture
                </h3>
                <p className="text-xs sm:text-sm text-secondary-custom mt-3 leading-relaxed">
                  Precision semantic structuring that guarantees search engines digest your topical depth with zero ambiguity.
                </p>

                <div className="border-t border-border-custom/50 pt-5 mt-6">
                  <h4 className="text-[10px] font-mono font-bold tracking-wider text-secondary-custom uppercase mb-3">
                    Deliverables & Focus
                  </h4>
                  <ul className="space-y-2.5">
                    <li className="flex items-start gap-2 text-xs text-foreground/90">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>Programmatic semantic HTML5 & entity heading trees</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-foreground/90">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>Topical keyword cluster mapping & silo linking</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-foreground/90">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>NLP entity optimization for AI search overviews</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-foreground/90">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>Dynamic meta title & OpenGraph automated generation</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-border-custom/50 pt-6 mt-8">
                <Link
                  href="/services/seo/on-page"
                  className="w-full inline-flex items-center justify-between text-xs font-semibold font-mono text-blue-400 hover:text-blue-300 group-hover:translate-x-1 transition-all"
                >
                  <span>Explore On-Page Sub-Page (/services/seo/on-page)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* PILLAR 2: Off-Page SEO */}
            <div className="border border-border-custom bg-surface/20 p-8 rounded-2xl flex flex-col justify-between hover:border-purple-500/50 hover:bg-surface/30 transition-all duration-300 group">
              <div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-purple-500/20 bg-purple-500/10 text-purple-400 mb-6 group-hover:scale-105 transition-transform">
                  <Link2 className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-mono font-bold uppercase text-purple-400 tracking-wider mb-2">
                  Pillar 02 • Sub-Service
                </div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-purple-400 transition-colors">
                  Off-Page SEO & Digital PR
                </h3>
                <p className="text-xs sm:text-sm text-secondary-custom mt-3 leading-relaxed">
                  High-authority backlink syndication and white-hat PR placements that elevate your domain authority score.
                </p>

                <div className="border-t border-border-custom/50 pt-5 mt-6">
                  <h4 className="text-[10px] font-mono font-bold tracking-wider text-secondary-custom uppercase mb-3">
                    Deliverables & Focus
                  </h4>
                  <ul className="space-y-2.5">
                    <li className="flex items-start gap-2 text-xs text-foreground/90">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span>Contextual editorial backlinks from DA 60+ publications</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-foreground/90">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span>Digital PR & brand citation syndication</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-foreground/90">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span>Toxic backlink disavow & algorithmic penalty recovery</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-foreground/90">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span>Topical tier-1 citation and directory synchronizer</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-border-custom/50 pt-6 mt-8">
                <Link
                  href="/services/seo/off-page"
                  className="w-full inline-flex items-center justify-between text-xs font-semibold font-mono text-purple-400 hover:text-purple-300 group-hover:translate-x-1 transition-all"
                >
                  <span>Explore Off-Page Sub-Page (/services/seo/off-page)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* PILLAR 3: Technical SEO */}
            <div className="border border-border-custom bg-surface/20 p-8 rounded-2xl flex flex-col justify-between hover:border-emerald-500/50 hover:bg-surface/30 transition-all duration-300 group">
              <div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 mb-6 group-hover:scale-105 transition-transform">
                  <Cpu className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-mono font-bold uppercase text-emerald-400 tracking-wider mb-2">
                  Pillar 03 • Sub-Service
                </div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-emerald-400 transition-colors">
                  Technical SEO & Core Web Vitals
                </h3>
                <p className="text-xs sm:text-sm text-secondary-custom mt-3 leading-relaxed">
                  Next.js App Router performance engineering, sub-second TTFB, and zero crawl waste architecture.
                </p>

                <div className="border-t border-border-custom/50 pt-5 mt-6">
                  <h4 className="text-[10px] font-mono font-bold tracking-wider text-secondary-custom uppercase mb-3">
                    Deliverables & Focus
                  </h4>
                  <ul className="space-y-2.5">
                    <li className="flex items-start gap-2 text-xs text-foreground/90">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Sub-second Core Web Vitals (LCP &lt; 1.0s, CLS 0)</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-foreground/90">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Dynamic XML Sitemaps & robots.txt budget routing</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-foreground/90">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Nested JSON-LD schema graphs (Breadcrumb, FAQ, Org)</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-foreground/90">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Server-Side Rendering (SSR) & Edge ISR caching</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-border-custom/50 pt-6 mt-8">
                <Link
                  href="/services/seo/technical"
                  className="w-full inline-flex items-center justify-between text-xs font-semibold font-mono text-emerald-400 hover:text-emerald-300 group-hover:translate-x-1 transition-all"
                >
                  <span>Explore Technical Sub-Page (/services/seo/technical)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* 4. STRATEGIC 4-PHASE SEO ENGINEERING FRAMEWORK */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-28">
          <div className="border border-border-custom bg-surface/20 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div className="mb-12">
              <span className="text-[10px] font-mono font-bold tracking-widest text-accent-custom uppercase block mb-3">
                Execution Framework
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                Our 4-Phase Search Engineering Roadmap
              </h2>
              <p className="text-xs sm:text-sm text-secondary-custom mt-2 max-w-xl">
                Every client deployment follows an empirical, milestone-driven protocol designed to minimize risk and maximize velocity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="p-6 rounded-2xl bg-surface/40 border border-border-custom relative">
                <div className="text-2xl font-black font-mono text-accent-custom mb-3">01</div>
                <h4 className="text-base font-bold text-foreground mb-2">Deep Crawl & Audit</h4>
                <p className="text-xs text-secondary-custom leading-relaxed">
                  Exhaustive telemetry run across every page: indexation issues, 404 dead ends, crawl budget waste, and keyword cannibalization.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-surface/40 border border-border-custom relative">
                <div className="text-2xl font-black font-mono text-accent-custom mb-3">02</div>
                <h4 className="text-base font-bold text-foreground mb-2">On-Page Architecture</h4>
                <p className="text-xs text-secondary-custom leading-relaxed">
                  Re-engineering semantic markup, heading structures, canonical hygiene, schema graphs, and internal silo linking.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-surface/40 border border-border-custom relative">
                <div className="text-2xl font-black font-mono text-accent-custom mb-3">03</div>
                <h4 className="text-base font-bold text-foreground mb-2">Authority Acceleration</h4>
                <p className="text-xs text-secondary-custom leading-relaxed">
                  Targeted editorial outreach securing contextual backlinks from industry-relevant publications with high domain trust.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-surface/40 border border-border-custom relative">
                <div className="text-2xl font-black font-mono text-accent-custom mb-3">04</div>
                <h4 className="text-base font-bold text-foreground mb-2">Conversion Scale</h4>
                <p className="text-xs text-secondary-custom leading-relaxed">
                  Continuous conversion-rate optimization (CRO), heat-mapping, keyword expansion, and competitive displacement.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* 5. INTERACTIVE ORGANIC REVENUE CALCULATOR */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-28">
          <div className="border border-border-custom bg-surface/30 backdrop-blur-md rounded-3xl p-6 sm:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-accent-glow blur-[100px] pointer-events-none opacity-20" />

            <div className="max-w-2xl mb-10">
              <span className="text-[10px] font-mono font-bold tracking-widest text-accent-custom uppercase block mb-3">
                Financial Impact Modeling
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                Organic Revenue & Growth Simulator
              </h2>
              <p className="text-xs sm:text-sm text-secondary-custom mt-2 leading-relaxed">
                Adjust your baseline metrics to calculate the projected annual financial opportunity unlocked by top-3 organic rankings.
              </p>
            </div>

            {/* Slider Controls */}
            <div className="space-y-6 mb-10">
              
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-secondary-custom">Current Monthly Organic Visitors:</span>
                  <span className="text-foreground font-bold">{monthlyVisitors.toLocaleString()} visits/mo</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="100000"
                  step="1000"
                  value={monthlyVisitors}
                  onChange={(e) => setMonthlyVisitors(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-surface border border-border-custom rounded-lg"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-secondary-custom">Average Customer Lifetime Value (LTV):</span>
                  <span className="text-foreground font-bold">${avgCustomerValue.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="5000"
                  step="50"
                  value={avgCustomerValue}
                  onChange={(e) => setAvgCustomerValue(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-surface border border-border-custom rounded-lg"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-secondary-custom">Target 6-Month Organic Traffic Growth:</span>
                  <span className="text-emerald-400 font-bold">+{targetGrowthPercent}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={targetGrowthPercent}
                  onChange={(e) => setTargetGrowthPercent(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-surface border border-border-custom rounded-lg"
                />
              </div>

            </div>

            {/* Projection Output */}
            <div className="border-t border-border-custom/60 pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-secondary-custom uppercase block">
                  Projected Monthly Visits
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground mt-1.5 block">
                  {projectedVisitors.toLocaleString()}
                </span>
                <span className="text-[11px] text-emerald-400 font-medium">
                  +{projectedVisitors - monthlyVisitors} new searchers/mo
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-secondary-custom uppercase block">
                  Est. Monthly Revenue Gain
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-accent-custom mt-1.5 block">
                  +${monthlyRevenueGain.toLocaleString()}
                </span>
                <span className="text-[11px] text-secondary-custom font-medium">
                  Based on conservative 2.2% conversion
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-secondary-custom uppercase block">
                  Annual Opportunity Run-Rate
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 mt-1.5 block">
                  +${annualRevenueGain.toLocaleString()}
                </span>
                <span className="text-[11px] text-emerald-500 font-medium">
                  Annualized compound organic value
                </span>
              </div>
            </div>

            <div className="mt-8 text-center sm:text-right">
              <Link
                href="/contact?service=seo"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-foreground text-background hover:bg-accent-custom hover:text-white px-6 py-3.5 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Claim This Organic Traffic Opportunity
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </section>

        {/* 6. GEO-LOCATION ARCHITECTURE MATRIX (PREVIEW) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-28">
          <div className="border border-border-custom bg-surface/20 rounded-3xl p-8 sm:p-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-accent-custom uppercase block mb-2">
                  Scalable Geo-Targeting Hierarchy
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  Global & Local Geo-Hub Architecture
                </h2>
                <p className="text-xs sm:text-sm text-secondary-custom mt-2 max-w-xl">
                  Our hierarchy structure supports dedicated city, state, and country landing pages (e.g. <code>/services/seo/[location]</code>) to dominate local 3-Pack and proximity-based searches worldwide.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full shrink-0">
                <Globe2 className="w-3.5 h-3.5" />
                <span>Multi-Region Ready</span>
              </div>
            </div>

            {/* City Hub Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { city: "New York", slug: "new-york", code: "US" },
                { city: "London", slug: "london", code: "UK" },
                { city: "Dubai", slug: "dubai", code: "UAE" },
                { city: "Toronto", slug: "toronto", code: "CA" },
                { city: "Singapore", slug: "singapore", code: "SG" },
                { city: "Sydney", slug: "sydney", code: "AU" },
                { city: "Mumbai", slug: "mumbai", code: "IN" },
                { city: "Ahmedabad", slug: "ahmedabad", code: "IN" },
                { city: "San Francisco", slug: "san-francisco", code: "US" },
                { city: "Berlin", slug: "berlin", code: "DE" },
                { city: "Austin", slug: "austin", code: "US" },
                { city: "Amsterdam", slug: "amsterdam", code: "NL" },
              ].map((loc) => (
                <div
                  key={loc.slug}
                  className="p-3.5 rounded-xl border border-border-custom bg-surface/40 hover:border-accent-custom/50 hover:bg-surface/70 transition-all text-left"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-secondary-custom mb-1">
                    <span>{loc.code}</span>
                    <span className="text-emerald-500">● 3-Pack</span>
                  </div>
                  <div className="text-xs font-bold text-foreground">{loc.city}</div>
                  <span className="text-[10px] font-mono text-secondary-custom block mt-1">
                    /seo/{loc.slug}
                  </span>
                </div>
              ))}
            </div>
            
            <p className="text-xs text-secondary-custom mt-6">
              * Whenever you are ready to expand regional dominance, simply instruct to generate location pages following <code>herarci.md</code>.
            </p>
          </div>
        </section>

        {/* 7. FREQUENTLY ASKED QUESTIONS (ACCORDION) */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-28">
          <div className="text-center mb-12">
            <span className="text-[10px] font-mono font-bold tracking-widest text-accent-custom uppercase block mb-3">
              Direct Answers
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-secondary-custom mt-2">
              Everything you need to know about our SEO architecture and ranking methodology.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-border-custom bg-surface/30 rounded-2xl overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-surface/50 transition-colors"
                  >
                    <span className="text-sm sm:text-base font-bold text-foreground">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-secondary-custom shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-accent-custom" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-secondary-custom leading-relaxed border-t border-border-custom/50 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 8. HIGH-CONVERSION BOTTOM CTA BANNER */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full">
          <div className="border border-border-custom bg-gradient-to-b from-surface/60 to-surface/20 rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-accent-glow blur-[120px] pointer-events-none opacity-30" />

            <span className="text-[10px] font-mono font-bold tracking-widest text-accent-custom uppercase block mb-3">
              Take the Top Position
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-4 max-w-2xl mx-auto">
              Ready to Capture Dominant Search Visibility?
            </h2>
            <p className="text-xs sm:text-base text-secondary-custom max-w-xl mx-auto mb-8 leading-relaxed">
              Schedule a technical consultation. We will audit your current organic visibility, 
              uncover crawl blockers, and deliver a tailored 90-day search engine roadmap.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact?service=seo"
                className="bg-accent-custom hover:bg-accent-custom/90 text-white px-8 py-4 rounded-xl text-sm font-semibold tracking-wide flex items-center gap-2 transition-all shadow-lg hover:shadow-accent-custom/25 cursor-pointer"
              >
                Schedule Technical Consultation
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="https://wa.me/917990738939"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-border-custom bg-surface/50 hover:bg-surface text-foreground px-6 py-4 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
              >
                Instant WhatsApp Chat
                <ExternalLink className="w-4 h-4 text-emerald-400" />
              </a>
            </div>
          </div>
        </section>

      </main>
      <FooterSection />
    </>
  );
}
