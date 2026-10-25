"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import FooterSection from "@/components/layout/FooterSection";
import ContactSection from "@/components/sections/ContactSection";
import {
  Search,
  Users,
  Target,
  Minus,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  BarChart3,
  Handshake,
  Building2,
  Store,
  LineChart,
  ArrowUpRight,
  MessageCircle,
} from "lucide-react";

// ── FAQ Data ──
const FAQ_ITEMS = [
  {
    q: "What do digital marketing services include?",
    a: "They can include SEO, social media marketing, paid advertising, and performance tracking. The exact deliverables depend on the agreed scope.",
  },
  {
    q: "How do I choose a digital marketing agency?",
    a: "Look for an agency that understands your business, explains its work clearly, and sets realistic expectations. Ask how progress will be measured and which costs are included.",
  },
  {
    q: "How long does digital marketing take to work?",
    a: "It depends on the channel and your starting point. Paid campaigns can provide early data after launch, while SEO usually requires consistent work over time. Results are not guaranteed.",
  },
  {
    q: "Can I start with just SEO?",
    a: "Yes. You can focus on SEO first if organic search visibility is your priority, then consider other channels based on your needs and results.",
  },
  {
    q: "How much do digital marketing services cost?",
    a: "The cost depends on the services you need, the amount of work involved, and whether you require ongoing support or paid campaigns. Advertising spend may be separate from service fees. Contact us with your goals for a tailored proposal.",
  },
];

// ── Service Pillar Data ──
const SERVICE_PILLARS = [
  {
    badge: "[01] SEO",
    title: "SEO Services",
    description:
      "When people search for services like yours, your website needs to be easy to find. Our SEO services focus on keyword research, on-page optimisation, technical SEO, and improving organic search visibility.",
    icon: Search,
    tags: ["Keyword Research", "On-Page Optimisation", "Technical SEO", "Organic Visibility"],
    ctaText: "Explore SEO Details",
    ctaLink: "/services/seo",
  },
  {
    badge: "[02] SOCIAL",
    title: "Social Media Marketing",
    description:
      "Posting regularly is not enough if your content does not reach the right people. Social media marketing helps businesses share useful content, communicate their services, and build a consistent presence on relevant platforms.",
    icon: Users,
    tags: ["Audience Reach", "Content Strategy", "Brand Consistency", "Platform Growth"],
    ctaText: "Discuss Social Strategy",
    ctaLink: "/contact",
  },
  {
    badge: "[03] PAID",
    title: "Performance Marketing",
    description:
      "Need to promote a service or reach a specific audience through paid campaigns? Performance marketing focuses on campaign planning, audience targeting, and measuring actions such as clicks and enquiries. Results depend on your offer, budget, targeting, and website experience.",
    icon: Target,
    tags: ["Campaign Planning", "Audience Targeting", "Conversion Tracking", "Paid Analytics"],
    ctaText: "Structure Paid Campaigns",
    ctaLink: "/contact",
  },
];

// ── Why Choose Us Data ──
const WHY_ITEMS = [
  {
    num: "01",
    title: "Collaborative Scoping",
    desc: "At Tech Infinix, we discuss your goals, identify suitable marketing activities, and define the scope before starting.",
    icon: Handshake,
  },
  {
    num: "02",
    title: "Integrated Tech Capability",
    desc: "We also provide technical services such as web development, which can be useful when your marketing project needs website improvements.",
    icon: ShieldCheck,
  },
  {
    num: "03",
    title: "Realistic, Data-Driven Expectations",
    desc: "We do not promise overnight rankings or guaranteed leads. The focus is on choosing relevant activities and improving them using available performance data.",
    icon: BarChart3,
  },
];

// ── Target Segments ──
const SEGMENTS = [
  { icon: Store, label: "Small Businesses" },
  { icon: Handshake, label: "Service Providers" },
  { icon: Building2, label: "B2B Companies" },
  { icon: LineChart, label: "Growing Brands" },
];

// ── FAQ Accordion ──
function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {FAQ_ITEMS.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className={`border border-border-custom bg-surface/40 rounded-md transition-all duration-200 ${
              isOpen ? "border-accent-custom/40" : "hover:border-foreground/20"
            }`}
          >
            <button
              className="w-full flex items-center justify-between gap-4 p-4 text-left cursor-pointer"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              aria-expanded={isOpen}
            >
              <span className="text-sm font-semibold text-foreground leading-snug">{item.q}</span>
              <span className="shrink-0 text-accent-custom">
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 border-t border-border-custom/50 pt-3">
                <p className="text-xs text-secondary-custom leading-relaxed">{item.a}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Page ──
export default function DigitalMarketingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://www.techinfinix.com/services/digital-marketing#webpage",
        url: "https://www.techinfinix.com/services/digital-marketing",
        name: "Digital Marketing Services | Tech Infinix",
        description:
          "Explore digital marketing services from Tech Infinix, including SEO, social media and performance marketing. Discuss your goals and request a proposal.",
        isPartOf: {
          "@type": "WebSite",
          "@id": "https://www.techinfinix.com/#website",
          name: "Tech Infinix",
          url: "https://www.techinfinix.com",
        },
      },
      {
        "@type": "Service",
        "@id": "https://www.techinfinix.com/services/digital-marketing#service",
        name: "Digital Marketing Services",
        serviceType: "Digital Marketing",
        provider: {
          "@type": "Organization",
          name: "Tech Infinix",
          url: "https://www.techinfinix.com",
        },
        description:
          "Explore digital marketing services from Tech Infinix, including SEO, social media and performance marketing. Discuss your goals and request a proposal.",
        url: "https://www.techinfinix.com/services/digital-marketing",
        areaServed: "IN",
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Digital Marketing Services",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Search Engine Optimisation (SEO)",
                description:
                  "Keyword research, on-page optimisation, technical SEO, and organic search visibility.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Social Media Marketing",
                description:
                  "Content strategy, audience reach, brand consistency, and platform growth.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Performance Marketing",
                description:
                  "Campaign planning, audience targeting, conversion tracking, and paid analytics.",
              },
            },
          ],
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.techinfinix.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Services",
            item: "https://www.techinfinix.com/services",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Digital Marketing",
            item: "https://www.techinfinix.com/services/digital-marketing",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="flex-1 bg-background pt-28 sm:pt-32 pb-20 text-left selection:bg-accent-custom selection:text-white">

        {/* ── 01. Breadcrumb & Hero ── */}
        <section className="max-w-6xl mx-auto px-6 md:px-10 w-full mb-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 mb-6" aria-label="Breadcrumb">
            <Link
              href="/"
              className="text-[11px] font-mono text-secondary-custom hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <span className="text-secondary-custom text-[11px] font-mono">/</span>
            <Link
              href="/services"
              className="text-[11px] font-mono text-secondary-custom hover:text-foreground transition-colors"
            >
              Services
            </Link>
            <span className="text-secondary-custom text-[11px] font-mono">/</span>
            <span className="text-[11px] font-mono text-foreground">Digital Marketing</span>
          </nav>

          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 border border-border-custom bg-surface/50 px-3 py-1 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-foreground">
              Digital Marketing Services
            </span>
          </div>

          {/* Hero Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground max-w-3xl leading-[1.15] mb-5">
            Digital Marketing Services for Your Business
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-secondary-custom max-w-2xl leading-relaxed mb-8">
            Looking to get more customers through your website and online channels? Tech Infinix
            provides digital marketing services to help businesses improve their online visibility,
            reach potential customers, and promote their services.
          </p>

          {/* Core Pillars Strip */}
          <div className="border border-border-custom bg-surface/30 rounded-md p-4 mb-8">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-secondary-custom">
                Core Growth Pillars
              </span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs border border-border-custom bg-background text-secondary-custom">
                Triad Model
              </span>
            </div>
            <p className="text-xs text-secondary-custom leading-relaxed mb-4">
              We focus on three key areas: SEO, social media marketing, and performance marketing.
              The right approach depends on your business, target audience, and budget.
            </p>
            <div className="grid grid-cols-3 gap-2 border-t border-border-custom/50 pt-3">
              {[
                { label: "SEO", num: "01", color: "text-emerald-400" },
                { label: "SOCIAL", num: "02", color: "text-sky-400" },
                { label: "PAID", num: "03", color: "text-amber-400" },
              ].map((p) => (
                <div
                  key={p.num}
                  className="flex flex-col items-center py-2 px-1 bg-surface/50 border border-border-custom/50 rounded-sm"
                >
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-secondary-custom mb-1">
                    {p.num}
                  </span>
                  <span className={`text-sm font-bold font-mono ${p.color}`}>{p.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-foreground text-background hover:opacity-90 text-xs font-mono uppercase tracking-wider font-bold transition duration-200 group shadow-xs cursor-pointer"
            >
              <span>Contact Tech Infinix</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
            <a
              href="https://wa.me/919173739080?text=Hello%20Tech%20Infinix,%20I%20would%20like%20to%20inquire%20about%20your%20digital%20marketing%20services."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-border-custom bg-surface hover:border-emerald-500/50 hover:bg-emerald-500/5 text-foreground text-xs font-mono uppercase tracking-wider font-semibold transition duration-200 group shadow-xs cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </section>

        {/* ── 02. Three Core Services ── */}
        <section className="max-w-6xl mx-auto px-6 md:px-10 w-full mb-16">
          <div className="flex flex-col items-start text-left mb-8">
            <div className="inline-flex items-center gap-2 border border-border-custom bg-surface px-3 py-1 rounded-full mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-custom" />
              <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-foreground">
                Tailored Digital Growth Frameworks
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
              Our Digital Marketing Services
            </h2>
            <p className="text-xs sm:text-sm text-secondary-custom max-w-2xl leading-relaxed">
              Each pillar is designed to address a specific stage of your online customer
              acquisition journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {SERVICE_PILLARS.map((srv) => {
              const Icon = srv.icon;
              return (
                <div
                  key={srv.badge}
                  className="border border-border-custom bg-surface/40 hover:bg-surface/70 hover:border-foreground/30 rounded-md p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 group shadow-xs"
                >
                  <div>
                    {/* Top Row */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div
                        className="w-9 h-9 rounded-sm flex items-center justify-center border border-border-custom bg-background text-foreground"
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs border border-border-custom bg-background text-secondary-custom">
                        {srv.badge}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-accent-custom transition-colors duration-200 mb-2">
                      {srv.title}
                    </h3>
                    <p className="text-xs text-secondary-custom leading-relaxed">
                      {srv.description}
                    </p>

                    {/* Feature Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-border-custom/50">
                      {srv.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider text-secondary-custom px-2 py-0.5 rounded-xs border border-border-custom bg-background"
                        >
                          <Minus className="w-2 h-2 text-foreground/50 shrink-0" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA Link */}
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

        {/* ── 03. Looking for a Digital Marketing Company ── */}
        <section className="max-w-6xl mx-auto px-6 md:px-10 w-full mb-16">
          <div className="flex flex-col items-start text-left mb-6">
            <div className="inline-flex items-center gap-2 border border-border-custom bg-surface px-3 py-1 rounded-full mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-custom" />
              <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-foreground">
                Choosing the Right Agency
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Looking for a Digital Marketing Company?
            </h2>
          </div>

          <div className="border border-border-custom bg-surface/30 rounded-md p-5 sm:p-6 space-y-4">
            <p className="text-xs sm:text-sm text-secondary-custom leading-relaxed">
              Choosing the right digital marketing company means finding a team that understands
              your business goals and target audience. Tech Infinix offers SEO, social media
              marketing, and performance marketing to help businesses strengthen their online
              presence.
            </p>
            <p className="text-xs sm:text-sm text-secondary-custom leading-relaxed">
              If you are searching for the best digital marketing agency for your business, start
              by discussing your goals, budget, and marketing priorities with our team. We can help
              you understand which services may suit your requirements.
            </p>
            <p className="text-xs sm:text-sm text-secondary-custom leading-relaxed">
              <Link
                href="/contact"
                className="text-foreground font-semibold underline underline-offset-2 hover:text-accent-custom transition-colors"
              >
                Contact Tech Infinix
              </Link>{" "}
              to discuss your project.
            </p>
          </div>
        </section>

        {/* ── 04. Why Choose Tech Infinix ── */}
        <section className="max-w-6xl mx-auto px-6 md:px-10 w-full mb-16">
          <div className="flex flex-col items-start text-left mb-8">
            <div className="inline-flex items-center gap-2 border border-border-custom bg-surface px-3 py-1 rounded-full mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-custom" />
              <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-foreground">
                Principles of Execution
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
              Why Choose Tech Infinix?
            </h2>
          </div>

          {/* Transparency Quote */}
          <div className="border border-border-custom bg-surface/30 rounded-md p-5 sm:p-6 mb-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-secondary-custom block mb-2">
              Transparency First
            </span>
            <p className="text-sm sm:text-base font-semibold text-foreground leading-snug">
              &ldquo;Before spending money on marketing, you should know what work is being done and
              how progress will be measured.&rdquo;
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {WHY_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.num}
                  className="border border-border-custom bg-surface/40 rounded-md p-5 flex flex-col gap-3 hover:border-foreground/20 transition-all duration-300 group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-sm flex items-center justify-center border border-border-custom bg-background text-foreground"
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-secondary-custom">
                      [{item.num}]
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-accent-custom transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-secondary-custom leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 04. Who Can Use Our Services ── */}
        <section className="max-w-6xl mx-auto px-6 md:px-10 w-full mb-16">
          <div className="flex flex-col items-start text-left mb-8">
            <div className="inline-flex items-center gap-2 border border-border-custom bg-surface px-3 py-1 rounded-full mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-custom" />
              <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-foreground">
                Target Segments
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
              Who Can Use Our Services?
            </h2>
            <p className="text-xs sm:text-sm text-secondary-custom max-w-2xl leading-relaxed">
              Our digital marketing services may suit small businesses, service providers, B2B
              companies, and growing brands that want to strengthen their online presence.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {SEGMENTS.map((seg) => {
              const Icon = seg.icon;
              return (
                <div
                  key={seg.label}
                  className="border border-border-custom bg-surface/40 hover:bg-surface/70 hover:border-accent-custom/30 rounded-md p-4 flex flex-col items-start gap-3 transition-all duration-200 group shadow-xs"
                >
                  <div className="w-8 h-8 rounded-sm bg-background border border-border-custom flex items-center justify-center text-foreground group-hover:border-accent-custom group-hover:text-accent-custom transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-foreground">
                    {seg.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Guidance Note */}
          <div className="border-l-2 border-accent-custom/60 bg-surface/30 rounded-r-md p-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-accent-custom font-bold block mb-1">
              Guidance Note
            </span>
            <p className="text-xs text-secondary-custom leading-relaxed">
              If you are unsure where to start, we can discuss your current website, target
              customers, and main business goals before deciding which services are relevant.
            </p>
          </div>
        </section>

        {/* ── 05. Investment / Pricing Transparency ── */}
        <section className="max-w-6xl mx-auto px-6 md:px-10 w-full mb-16">
          <div className="flex flex-col items-start text-left mb-8">
            <div className="inline-flex items-center gap-2 border border-border-custom bg-surface px-3 py-1 rounded-full mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-custom" />
              <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-foreground">
                Cost Structure
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
              How Much Do Digital Marketing Services Cost?
            </h2>
          </div>

          <div className="border border-border-custom bg-surface/30 rounded-md p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-xs sm:text-sm text-secondary-custom leading-relaxed mb-4">
                The cost depends on the services you need, the amount of work involved, and whether
                you require ongoing support or paid campaigns. Advertising spend may be separate
                from service fees.
              </p>
              <p className="text-xs text-secondary-custom leading-relaxed">
                Contact us with your website, business details, and goals to discuss a suitable
                scope and proposal.
              </p>
            </div>
            <div className="shrink-0 w-full md:w-auto">
              <Link
                href="/contact"
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-foreground text-background hover:bg-accent-custom hover:text-white font-semibold text-xs font-mono uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Request Custom Proposal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── 06. FAQ Section ── */}
        <section className="max-w-6xl mx-auto px-6 md:px-10 w-full mb-16">
          <div className="flex flex-col items-start text-left mb-8">
            <div className="inline-flex items-center gap-2 border border-border-custom bg-surface px-3 py-1 rounded-full mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-custom" />
              <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-foreground">
                Clarifications
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
              Frequently Asked Questions
            </h2>
          </div>
          <FaqAccordion />
        </section>

        {/* ── 07. Contact / Lead Conversion ── */}
        <ContactSection />
      </main>

      <FooterSection />
    </>
  );
}
