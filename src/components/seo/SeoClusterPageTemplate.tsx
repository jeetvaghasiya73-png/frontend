"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import FooterSection from "@/components/layout/FooterSection";
import ContactSection from "@/components/sections/ContactSection";
import SplitText from "@/components/animations/SplitText";
import { SeoPageData } from "@/app/services/seo/seo-cluster-data";
import "@/app/services/seo/seo-cluster.css";
import {
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Layers,
  ShieldCheck,
  TrendingUp,
  Search,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Clock,
  Award,
  Zap,
  Target
} from "lucide-react";

interface SeoClusterPageTemplateProps {
  pageData: SeoPageData;
}

export default function SeoClusterPageTemplate({ pageData }: SeoClusterPageTemplateProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const currentUrl = `https://www.techinfinix.com/services/seo/${pageData.slug}`;

  // Structured Data (JSON-LD) for the individual cluster page
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${currentUrl}#service`,
        name: pageData.h1,
        serviceType: pageData.primaryKeyword,
        description: pageData.metaDescription,
        provider: {
          "@type": "Organization",
          name: "Tech Infinix",
          url: "https://www.techinfinix.com",
          logo: "https://www.techinfinix.com/icon.png",
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+91-79907-38939",
            contactType: "customer service",
            areaServed: "Worldwide",
            availableLanguage: ["English", "Hindi", "Gujarati"]
          }
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: `${pageData.primaryKeyword} Capabilities`,
          itemListElement: pageData.coreFocusAreas.map((area, idx) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: area.title,
              description: area.description
            }
          }))
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${currentUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.techinfinix.com"
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Services",
            item: "https://www.techinfinix.com/services"
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "SEO Services",
            item: "https://www.techinfinix.com/services/seo"
          },
          {
            "@type": "ListItem",
            position: 4,
            name: pageData.title,
            item: currentUrl
          }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": `${currentUrl}#faq`,
        mainEntity: pageData.faqs.map(faq => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a
          }
        }))
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="seo-cluster-page flex-1 pt-28 sm:pt-32 pb-24 text-left overflow-hidden">
        
        {/* BREADCRUMB NAVIGATION */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full pt-4 pb-6">
          <nav aria-label="Breadcrumb" className="seo-breadcrumb-nav">
            <Link href="/" className="seo-breadcrumb-link">Home</Link>
            <span className="seo-breadcrumb-separator">/</span>
            <Link href="/services" className="seo-breadcrumb-link">Services</Link>
            <span className="seo-breadcrumb-separator">/</span>
            <Link href="/services/seo" className="seo-breadcrumb-link hover:text-emerald-500">
              SEO Services
            </Link>
            <span className="seo-breadcrumb-separator">/</span>
            <span className="seo-breadcrumb-current">{pageData.groupTitle}</span>
            <span className="seo-breadcrumb-separator">/</span>
            <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">
              {pageData.primaryKeyword}
            </span>
          </nav>
        </div>

        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full relative mb-16 md:mb-24">
          <div className="seo-hero-badge mb-6">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>{pageData.heroBadge}</span>
          </div>

          <h1 className="seo-hero-title mb-6 max-w-4xl">
            <SplitText text={pageData.h1} type="words" />
          </h1>

          <p className="seo-hero-subtitle mb-8">
            {pageData.heroSubtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-12">
            <Link
              href="/contact?service=seo"
              className="bg-foreground hover:opacity-90 text-background px-7 py-4 rounded-xl text-sm font-semibold tracking-wide flex items-center gap-2.5 transition-all shadow-lg cursor-pointer"
            >
              Discuss Your SEO Strategy
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#deep-dive"
              className="border border-border-custom bg-surface/40 hover:bg-surface/70 text-foreground px-6 py-4 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              Explore Strategic Details
              <ChevronDown className="w-4 h-4 text-secondary-custom" />
            </a>
          </div>

          {/* Trust Highlights Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-border-custom/60">
            <div className="flex items-center gap-2.5 text-xs text-secondary-custom font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Google Search Essentials</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-secondary-custom font-mono">
              <Target className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Search Intent Precision</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-secondary-custom font-mono">
              <Zap className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Full-Stack Engineering</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-secondary-custom font-mono">
              <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Transparent Attribution</span>
            </div>
          </div>
        </section>

        {/* INTRODUCTION & CONTEXT SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-20 md:mb-28">
          <div className="bg-surface/20 border border-border-custom rounded-2xl p-6 sm:p-10 lg:p-12">
            <div className="max-w-3xl">
              <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-500 uppercase block mb-3">
                Overview & Search Intent
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-6">
                Understanding the Mechanics of {pageData.primaryKeyword}
              </h2>
              <p className="text-base sm:text-lg font-medium text-foreground/90 leading-relaxed mb-6">
                {pageData.introduction.lead}
              </p>
              {pageData.introduction.paragraphs.map((para, idx) => (
                <p key={idx} className="text-sm sm:text-base text-secondary-custom leading-relaxed mb-4 last:mb-6">
                  {para}
                </p>
              ))}

              <div className="pt-4 border-t border-border-custom/50 flex flex-wrap items-center gap-2 text-xs text-secondary-custom">
                <span>Part of our comprehensive</span>
                <Link href="/services/seo" className="text-emerald-500 font-semibold hover:underline inline-flex items-center gap-1">
                  Search Engine Optimization Services
                  <ExternalLink className="w-3 h-3" />
                </Link>
                <span>cluster at Tech Infinix.</span>
              </div>
            </div>
          </div>
        </section>

        {/* CORE FOCUS AREAS / CAPABILITIES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-20 md:mb-28">
          <div className="mb-12">
            <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-500 uppercase block mb-2">
              Key Capabilities
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-4">
              Core Pillars of Our {pageData.primaryKeyword} Approach
            </h2>
            <p className="text-sm sm:text-base text-secondary-custom leading-relaxed max-w-3xl">
              We apply an engineering-first, data-backed approach to ensure every technical requirement, content asset, and authority signal is optimized for long-term growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pageData.coreFocusAreas.map((area, idx) => (
              <div key={idx} className="seo-card">
                <div className="seo-card-icon">
                  <Layers className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="seo-card-title">{area.title}</h3>
                <p className="seo-card-desc mb-6">{area.description}</p>
                <ul className="space-y-2.5 mt-auto pt-4 border-t border-border-custom/40">
                  {area.points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2.5 text-xs text-foreground/90">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* DEEP DIVE SECTION (Checklist, Comparison Table, or Strategic Matrix) */}
        <section id="deep-dive" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-20 md:mb-28">
          <div className="seo-matrix-box">
            <div className="mb-10">
              <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-500 uppercase block mb-2">
                Technical & Strategic Deep-Dive
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-3">
                {pageData.deepDive.title}
              </h2>
              <p className="text-sm sm:text-base text-secondary-custom leading-relaxed max-w-3xl">
                {pageData.deepDive.subtitle}
              </p>
            </div>

            {/* Checklist or Feature Cards */}
            {pageData.deepDive.cards && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {pageData.deepDive.cards.map((card, idx) => (
                  <div key={idx} className="p-5 rounded-xl border border-border-custom bg-surface/30 hover:border-emerald-500/30 transition-colors">
                    {card.tag && (
                      <span className="inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 mb-2.5">
                        {card.tag}
                      </span>
                    )}
                    <h4 className="text-base font-bold text-foreground mb-2">{card.title}</h4>
                    <p className="text-xs sm:text-sm text-secondary-custom leading-relaxed">{card.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Comparison Table */}
            {pageData.deepDive.type === "table" && pageData.deepDive.headers && pageData.deepDive.rows && (
              <div className="seo-table-container">
                <table className="seo-table">
                  <thead>
                    <tr>
                      {pageData.deepDive.headers.map((h, hIdx) => (
                        <th key={hIdx}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.deepDive.rows.map((row, rIdx) => (
                      <tr key={rIdx}>
                        <td className="font-semibold text-foreground">{row.col1}</td>
                        <td>{row.col2}</td>
                        <td>{row.col3}</td>
                        {row.col4 && <td>{row.col4}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* METHODOLOGY & STRUCTURED PROCESS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-20 md:mb-28">
          <div className="mb-12 text-center max-w-3xl mx-auto">
            <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-500 uppercase block mb-2">
              Our Methodology
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-4">
              Structured Execution for {pageData.primaryKeyword}
            </h2>
            <p className="text-sm sm:text-base text-secondary-custom leading-relaxed">
              Every phase is executed with clear milestones, verification checkpoints, and actionable deliverables.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6">
            {pageData.methodology.map((step, idx) => (
              <div key={idx} className="seo-timeline-step">
                <div className="seo-timeline-num">{step.step}</div>
                <h3 className="text-base font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-xs text-secondary-custom leading-relaxed mb-4">{step.description}</p>
                <div className="mt-auto pt-3 border-t border-border-custom/50 text-[11px] font-mono text-emerald-500">
                  <span className="font-semibold text-secondary-custom block text-[10px] uppercase">Deliverable:</span>
                  {step.deliverable}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AUDIENCE FIT / PRACTICAL USE CASES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-20 md:mb-28">
          <div className="border-t border-b border-border-custom/50 py-16">
            <div className="flex flex-col lg:flex-row gap-10 items-start">
              <div className="lg:w-1/3">
                <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-500 uppercase block mb-2">
                  Target Audiences
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-4">
                  Who Benefits Most From This Service?
                </h2>
                <p className="text-sm text-secondary-custom leading-relaxed">
                  Different business models face unique search bottlenecks. We adapt our strategies to your specific operational constraints and market realities.
                </p>
              </div>

              <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-5 w-full">
                {pageData.audienceFit.map((aud, idx) => (
                  <div key={idx} className="p-5 rounded-xl border border-border-custom bg-surface/20 flex flex-col">
                    <h3 className="text-sm font-bold text-foreground mb-2">{aud.title}</h3>
                    <div className="text-[11px] text-secondary-custom mb-3 flex-1">
                      <span className="font-semibold text-foreground/80 block mb-0.5">Challenge:</span>
                      {aud.challenge}
                    </div>
                    <div className="pt-2 border-t border-border-custom/40 text-[11px] text-emerald-500/90">
                      <span className="font-semibold text-foreground/80 block mb-0.5">Solution:</span>
                      {aud.solution}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* RELATED SERVICES & CLUSTER INTERNAL LINKS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-20 md:mb-28">
          <div className="mb-10">
            <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-500 uppercase block mb-2">
              Explore Related SEO Services
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-3">
              Connected Solutions in Our SEO Ecosystem
            </h2>
            <p className="text-sm text-secondary-custom">
              Discover complementary search services that amplify and support {pageData.primaryKeyword.toLowerCase()}.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pageData.relatedPages.map((rel, idx) => (
              <Link
                key={idx}
                href={`/services/seo/${rel.slug}`}
                className="seo-related-card group"
              >
                <div className="seo-related-title">
                  <span>{rel.title}</span>
                  <ChevronRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="seo-related-desc mb-3">{rel.relationship}</p>
                <span className="text-[11px] font-mono text-emerald-500 group-hover:underline">
                  Explore {rel.anchorText} →
                </span>
              </Link>
            ))}
          </div>

          {/* Direct link back to parent SEO Hub */}
          <div className="mt-8 text-center sm:text-left">
            <Link
              href="/services/seo"
              className="inline-flex items-center gap-2 text-xs font-mono text-secondary-custom hover:text-emerald-500 transition-colors"
            >
              <span>← Return to Parent SEO Services Overview (/services/seo)</span>
            </Link>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 w-full mb-20 md:mb-28">
          <div className="text-center mb-10">
            <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-500 uppercase block mb-2">
              FAQ
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Frequently Asked Questions About {pageData.primaryKeyword}
            </h2>
            <p className="text-sm text-secondary-custom">
              Clear, transparent answers to common questions about strategy, implementation, and expectations.
            </p>
          </div>

          <div className="space-y-3">
            {pageData.faqs.map((faq, index) => (
              <div key={index} className="seo-faq-item">
                <button
                  onClick={() => toggleFaq(index)}
                  className="seo-faq-btn"
                  aria-expanded={openFaqIndex === index}
                >
                  <span className="pr-4">{faq.q}</span>
                  <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center bg-surface border border-border-custom transition-transform duration-300 ${openFaqIndex === index ? "rotate-180 bg-foreground text-background" : "text-secondary-custom"}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaqIndex === index ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="seo-faq-content">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CALL TO ACTION */}
        <ContactSection />

      </main>
      <FooterSection />
    </>
  );
}
