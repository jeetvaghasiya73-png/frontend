"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import FooterSection from "@/components/layout/FooterSection";
import ContactSection from "@/components/sections/ContactSection";
import SplitText from "@/components/animations/SplitText";
import { SeoCityData } from "@/app/services/seo/seo-cities-data";
import "@/app/services/seo/seo-cluster.css";
import {
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Sparkles,
  MapPin,
  ShieldCheck,
  TrendingUp,
  Search,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Clock,
  Award,
  Zap,
  Target,
  Building2,
  Compass,
  Layers,
  BarChart3,
  Globe2,
  AlertCircle
} from "lucide-react";

interface SeoCityPageTemplateProps {
  pageData: SeoCityData;
}

export default function SeoCityPageTemplate({ pageData }: SeoCityPageTemplateProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const currentUrl = `https://www.techinfinix.com/services/seo/${pageData.slug}`;

  // Structured Data (JSON-LD)
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
            areaServed: ["India", pageData.city],
            availableLanguage: ["English", "Hindi", "Gujarati"]
          }
        },
        areaServed: {
          "@type": "City",
          name: pageData.city
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: `${pageData.primaryKeyword} Capabilities`,
          itemListElement: pageData.industryOpportunities.map((opp) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: `${opp.industry} SEO in ${pageData.city}`,
              description: opp.description
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
            name: `${pageData.city} SEO`,
            item: currentUrl
          }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": `${currentUrl}#faq`,
        mainEntity: pageData.faqs.map((faq) => ({
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
        
        {/* SECTION 1: BREADCRUMB */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full pt-4 pb-6">
          <nav aria-label="Breadcrumb" className="seo-breadcrumb-nav">
            <Link href="/" className="seo-breadcrumb-link">Home</Link>
            <span className="seo-breadcrumb-separator">/</span>
            <Link href="/services" className="seo-breadcrumb-link">Services</Link>
            <span className="seo-breadcrumb-separator">/</span>
            <Link href="/services/seo" className="seo-breadcrumb-link hover:text-foreground">
              SEO Services
            </Link>
            <span className="seo-breadcrumb-separator">/</span>
            <span className="seo-breadcrumb-current">{pageData.region}</span>
            <span className="seo-breadcrumb-separator">/</span>
            <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">
              {pageData.city}
            </span>
          </nav>
        </div>

        {/* SECTION 2: HERO */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full relative mb-16 md:mb-24">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="seo-hero-badge">
              <Sparkles className="w-3.5 h-3.5 text-foreground" />
              <span>{pageData.heroBadge}</span>
            </div>
            <div className="seo-city-region-badge">
              <MapPin className="w-3.5 h-3.5 text-foreground" />
              <span>{pageData.city}, {pageData.state} ({pageData.region})</span>
            </div>
          </div>

          <h1 className="seo-hero-title mb-6 max-w-4xl">
            <SplitText text={pageData.h1} type="words" />
          </h1>

          <p className="seo-hero-subtitle mb-8">
            {pageData.heroSubtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-12">
            <Link
              href={`/contact?service=seo&location=${encodeURIComponent(pageData.city)}`}
              className="bg-foreground hover:opacity-90 text-background px-7 py-4 rounded-xl text-sm font-semibold tracking-wide flex items-center gap-2.5 transition-all shadow-lg cursor-pointer"
            >
              Discuss Your {pageData.city} SEO Strategy
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#local-context"
              className="border border-border-custom bg-surface/40 hover:bg-surface/70 text-foreground px-6 py-4 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              Explore {pageData.city} Search Dynamics
              <ChevronDown className="w-4 h-4 text-secondary-custom" />
            </a>
          </div>

          {/* Trust Highlights Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-border-custom/60">
            <div className="flex items-center gap-2.5 text-xs text-secondary-custom font-mono">
              <ShieldCheck className="w-4 h-4 text-foreground shrink-0" />
              <span>Google Local Search Essentials</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-secondary-custom font-mono">
              <Target className="w-4 h-4 text-foreground shrink-0" />
              <span>Commercial Intent Mapping</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-secondary-custom font-mono">
              <Zap className="w-4 h-4 text-foreground shrink-0" />
              <span>Full-Stack SEO Engineering</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-secondary-custom font-mono">
              <TrendingUp className="w-4 h-4 text-foreground shrink-0" />
              <span>Transparent Organic Growth</span>
            </div>
          </div>
        </section>

        {/* SECTION 3: INTRODUCTION & LOCAL BUSINESS CONTEXT */}
        <section id="local-context" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-20 md:mb-28">
          <div className="bg-surface/20 border border-border-custom rounded-2xl p-6 sm:p-10 lg:p-12">
            <div className="max-w-3xl">
              <span className="text-[11px] font-mono font-bold tracking-widest text-foreground uppercase block mb-3">
                Local Business Landscape & Market Context
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-6">
                Understanding Search Dynamics for Businesses in {pageData.city}
              </h2>
              <p className="text-base sm:text-lg font-medium text-foreground/90 leading-relaxed mb-6">
                {pageData.localContext.lead}
              </p>
              {pageData.localContext.paragraphs.map((para, idx) => (
                <p key={idx} className="text-sm sm:text-base text-secondary-custom leading-relaxed mb-4 last:mb-6">
                  {para}
                </p>
              ))}

              {/* Commercial Hubs */}
              <div className="pt-4 mb-6">
                <span className="text-xs font-mono font-semibold text-foreground/80 uppercase block mb-3">
                  Key Commercial Corridors & Business Districts:
                </span>
                <div className="flex flex-wrap gap-2">
                  {pageData.localContext.commercialHubs.map((hub, idx) => (
                    <span key={idx} className="seo-city-hub-tag">
                      {hub}
                    </span>
                  ))}
                </div>
              </div>

              {/* Transparent Delivery Note */}
              <div className="seo-city-disclosure-box mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-foreground shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-secondary-custom leading-relaxed">
                    <strong className="text-foreground block mb-1">
                      Transparent Service Delivery:
                    </strong>
                    {pageData.localSeoStrategy.remoteDeliveryClarification}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border-custom/50 flex flex-wrap items-center gap-2 text-xs text-secondary-custom">
                <span>Looking for broader strategic frameworks? Explore our comprehensive</span>
                <Link href="/services/seo" className="text-foreground font-semibold hover:underline inline-flex items-center gap-1">
                  Search Engine Optimization Services
                  <ExternalLink className="w-3 h-3" />
                </Link>
                <span>hub.</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: FULL-STACK SEO SERVICES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-20 md:mb-28">
          <div className="mb-12">
            <span className="text-[11px] font-mono font-bold tracking-widest text-foreground uppercase block mb-2">
              Capabilities & Execution
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-4">
              Comprehensive SEO Services for {pageData.city} Companies
            </h2>
            <p className="text-sm sm:text-base text-secondary-custom leading-relaxed max-w-3xl">
              From technical site architecture to localized map ranking, we deploy tested organic strategies designed to attract qualified buyers and generate measurable revenue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="seo-card">
              <div className="seo-card-icon">
                <Target className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="seo-card-title">Local SEO & Google Maps</h3>
              <p className="seo-card-desc mb-4">
                Optimize your Google Business Profile, capture high-intent local map pack rankings, and build location-verified citations to win nearby customers.
              </p>
              <Link href="/services/seo/local-seo-services" className="text-xs font-mono font-semibold text-foreground hover:underline inline-flex items-center gap-1 mt-auto">
                Explore Local SEO Services <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="seo-card">
              <div className="seo-card-icon">
                <Zap className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="seo-card-title">Technical SEO & Core Web Vitals</h3>
              <p className="seo-card-desc mb-4">
                Eliminate crawl bottlenecks, optimize mobile render latency, implement structured JSON-LD schemas, and build lightning-fast web experiences.
              </p>
              <Link href="/services/seo/seo-audit-services" className="text-xs font-mono font-semibold text-foreground hover:underline inline-flex items-center gap-1 mt-auto">
                Explore SEO Audit Services <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="seo-card">
              <div className="seo-card-icon">
                <Layers className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="seo-card-title">On-Page & Intent Architecture</h3>
              <p className="seo-card-desc mb-4">
                Structure commercial landing pages to directly fulfill search intent, optimize internal link pathways, and improve organic conversion rates.
              </p>
              <Link href="/services/seo/on-page-seo-services" className="text-xs font-mono font-semibold text-foreground hover:underline inline-flex items-center gap-1 mt-auto">
                Explore On-Page SEO <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="seo-card">
              <div className="seo-card-icon">
                <TrendingUp className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="seo-card-title">E-Commerce Search Optimization</h3>
              <p className="seo-card-desc mb-4">
                Scale organic transaction volume for Shopify, WooCommerce, and custom web stores with faceted navigation cleanup and product schema markup.
              </p>
              <Link href="/services/seo/ecommerce-seo-services" className="text-xs font-mono font-semibold text-foreground hover:underline inline-flex items-center gap-1 mt-auto">
                Explore E-Commerce SEO <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="seo-card">
              <div className="seo-card-icon">
                <ShieldCheck className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="seo-card-title">White-Hat Authority & Digital PR</h3>
              <p className="seo-card-desc mb-4">
                Acquire authentic editorial backlinks and brand mentions from recognized industry publications without risking algorithmic penalties.
              </p>
              <Link href="/services/seo/backlinks-in-seo" className="text-xs font-mono font-semibold text-foreground hover:underline inline-flex items-center gap-1 mt-auto">
                Explore Link Building <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="seo-card">
              <div className="seo-card-icon">
                <BarChart3 className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="seo-card-title">Analytics & Revenue Attribution</h3>
              <p className="seo-card-desc mb-4">
                Track real business metrics—qualified pipeline leads, customer inquiries, and conversion events—with verified Google Search Console and GA4 data.
              </p>
              <Link href="/services/seo/search-engine-marketing-analysis" className="text-xs font-mono font-semibold text-foreground hover:underline inline-flex items-center gap-1 mt-auto">
                Explore SEM Analysis <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 5: INDUSTRY-SPECIFIC SEO OPPORTUNITIES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-20 md:mb-28">
          <div className="mb-12">
            <span className="text-[11px] font-mono font-bold tracking-widest text-foreground uppercase block mb-2">
              Sector Specialization
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-4">
              Industry-Specific SEO Opportunities in {pageData.city}
            </h2>
            <p className="text-sm sm:text-base text-secondary-custom leading-relaxed max-w-3xl">
              Different sectors require tailored search strategies. Here is how key commercial industries in {pageData.city} leverage organic search to capture buyer intent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pageData.industryOpportunities.map((opp, idx) => (
              <div key={idx} className="seo-city-industry-card">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
                      {opp.industry}
                    </span>
                    <Building2 className="w-4 h-4 text-secondary-custom" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {opp.tagline}
                  </h3>
                  <p className="text-sm text-secondary-custom leading-relaxed mb-4">
                    {opp.description}
                  </p>
                </div>
                <div className="pt-4 border-t border-border-custom/40">
                  <span className="text-[11px] font-mono text-secondary-custom block mb-1">
                    Representative Search Pattern:
                  </span>
                  <div className="seo-city-query-pill">
                    <Search className="w-3 h-3 shrink-0" />
                    <span>&ldquo;{opp.searchExample}&rdquo;</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: LOCAL SEO STRATEGY */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-20 md:mb-28">
          <div className="border border-border-custom bg-surface/30 rounded-2xl p-6 sm:p-10 lg:p-12">
            <div className="mb-10 max-w-3xl">
              <span className="text-[11px] font-mono font-bold tracking-widest text-foreground uppercase block mb-2">
                Hyperlocal Execution
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-4">
                Local SEO Playbook for Winning Customers in {pageData.city}
              </h2>
              <p className="text-sm sm:text-base text-secondary-custom leading-relaxed">
                {pageData.localSeoStrategy.overview}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-background/60 border border-border-custom rounded-xl p-5">
                <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center text-foreground mb-4 font-mono font-bold text-sm">
                  01
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">
                  Google Business Profile
                </h3>
                <p className="text-xs sm:text-sm text-secondary-custom leading-relaxed">
                  {pageData.localSeoStrategy.gbpStrategy}
                </p>
              </div>

              <div className="bg-background/60 border border-border-custom rounded-xl p-5">
                <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center text-foreground mb-4 font-mono font-bold text-sm">
                  02
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">
                  Geo-Targeted Architecture
                </h3>
                <p className="text-xs sm:text-sm text-secondary-custom leading-relaxed">
                  {pageData.localSeoStrategy.geoLandingStrategy}
                </p>
              </div>

              <div className="bg-background/60 border border-border-custom rounded-xl p-5">
                <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center text-foreground mb-4 font-mono font-bold text-sm">
                  03
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">
                  Verified Local Citations
                </h3>
                <p className="text-xs sm:text-sm text-secondary-custom leading-relaxed">
                  {pageData.localSeoStrategy.citationStrategy}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-border-custom/50 text-xs sm:text-sm">
              <span className="text-secondary-custom">
                Need specialized assistance with multi-location or local store presence?
              </span>
              <Link href="/services/seo/local-seo-services" className="text-foreground font-semibold hover:underline inline-flex items-center gap-1">
                Learn more about our dedicated Local SEO Services
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 7: WHY BUSINESSES MAY NEED SEO */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-20 md:mb-28">
          <div className="mb-12">
            <span className="text-[11px] font-mono font-bold tracking-widest text-foreground uppercase block mb-2">
              Search Obstacles & Solutions
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-4">
              Common Search Roadblocks Facing {pageData.city} Websites
            </h2>
            <p className="text-sm sm:text-base text-secondary-custom leading-relaxed max-w-3xl">
              Many companies invest in websites that fail to attract commercial searchers. Here are the core obstacles we solve to restore organic growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pageData.whyBusinessesNeedSeo.map((challenge, idx) => (
              <div key={idx} className="seo-card flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-foreground uppercase block mb-2">
                    Challenge {idx + 1}
                  </span>
                  <h3 className="text-lg font-bold text-foreground mb-3">
                    {challenge.title}
                  </h3>
                  <div className="mb-4">
                    <span className="text-[11px] font-mono text-secondary-custom/80 uppercase block mb-1">
                      The Symptom:
                    </span>
                    <p className="text-xs sm:text-sm text-secondary-custom leading-relaxed">
                      {challenge.problem}
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-border-custom/50 bg-surface/30 -mx-7 -mb-7 p-4 rounded-b-xl">
                  <span className="text-[11px] font-mono text-foreground uppercase font-semibold block mb-1">
                    Engineering Solution:
                  </span>
                  <p className="text-xs text-foreground/90 leading-relaxed">
                    {challenge.solution}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 8: SEO PROCESS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-20 md:mb-28">
          <div className="mb-12">
            <span className="text-[11px] font-mono font-bold tracking-widest text-foreground uppercase block mb-2">
              Engineering-First Methodology
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-4">
              Our 6-Step SEO Delivery Process for {pageData.city}
            </h2>
            <p className="text-sm sm:text-base text-secondary-custom leading-relaxed max-w-3xl">
              Sustainable rankings are the byproduct of disciplined execution. We follow an iterative technical roadmap built on empirical Google Search Essentials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageData.processSteps.map((step, idx) => (
              <div key={idx} className="seo-timeline-step">
                <div className="seo-timeline-num">{step.number}</div>
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-secondary-custom leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 9: RELATED SEO SERVICES & REGIONAL HUBS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-20 md:mb-28">
          <div className="mb-12">
            <span className="text-[11px] font-mono font-bold tracking-widest text-foreground uppercase block mb-2">
              Connected Capabilities & Regional Networks
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-4">
              Core SEO Specializations & Nearby Commercial Hubs
            </h2>
            <p className="text-sm sm:text-base text-secondary-custom leading-relaxed max-w-3xl">
              Explore interconnected organic search disciplines and sibling commercial markets across {pageData.region}.
            </p>
          </div>

          {/* Core Services Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {pageData.coreServiceLinks.map((service, idx) => (
              <Link
                key={idx}
                href={service.url}
                className="seo-related-card group flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono font-bold text-foreground uppercase tracking-wider block mb-2">
                    {service.badge}
                  </span>
                  <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-foreground transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-secondary-custom leading-relaxed">
                    {service.description}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-mono font-semibold text-foreground mt-4">
                  <span>View Details</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          {/* Sibling City Links */}
          <div className="border border-border-custom bg-surface/20 rounded-xl p-6">
            <span className="text-xs font-mono font-semibold text-foreground uppercase tracking-wider block mb-3">
              Explore Commercial SEO Services in Neighboring {pageData.region} Hubs:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {pageData.siblingCities.map((sibling, idx) => (
                <Link
                  key={idx}
                  href={sibling.url}
                  className="seo-sibling-city-pill group"
                >
                  <div>
                    <span className="font-semibold text-foreground group-hover:text-foreground transition-colors block">
                      {sibling.name}
                    </span>
                    <span className="text-[11px] text-secondary-custom font-mono">
                      {sibling.relation}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-secondary-custom group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 10: FAQ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-20 md:mb-28">
          <div className="mb-12">
            <span className="text-[11px] font-mono font-bold tracking-widest text-foreground uppercase block mb-2">
              Common Questions
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-4">
              Frequently Asked Questions About SEO in {pageData.city}
            </h2>
            <p className="text-sm sm:text-base text-secondary-custom leading-relaxed max-w-3xl">
              Transparent answers regarding timelines, local search intent, remote execution, and ranking factors for businesses targeting {pageData.city}.
            </p>
          </div>

          <div className="max-w-3xl space-y-4">
            {pageData.faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="seo-faq-item">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="seo-faq-btn"
                    aria-expanded={isOpen}
                  >
                    <span className="text-left font-semibold text-foreground pr-4">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-secondary-custom shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-foreground" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="seo-faq-answer">
                      <p className="text-sm text-secondary-custom leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 11: FINAL CTA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-16">
          <div className="border border-border-custom bg-surface/40 rounded-3xl p-8 sm:p-14 relative overflow-hidden text-center max-w-5xl mx-auto">
            <span className="text-xs font-mono font-bold text-foreground tracking-widest uppercase block mb-3">
              Ready to Expand Your {pageData.city} Search Footprint?
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-4 max-w-2xl mx-auto">
              Discuss Your {pageData.city} SEO Requirements with Our Technical Team
            </h2>
            <p className="text-sm sm:text-base text-secondary-custom max-w-2xl mx-auto mb-8 leading-relaxed">
              We analyze your domain&apos;s current technical health, crawl barriers, and competitor keyword gaps to build an actionable organic growth plan tailored for your market.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href={`/contact?service=seo&location=${encodeURIComponent(pageData.city)}`}
                className="bg-foreground hover:opacity-90 text-background px-8 py-4 rounded-xl text-sm font-semibold tracking-wide flex items-center gap-2.5 transition-all shadow-xl cursor-pointer"
              >
                Schedule an SEO Consultation
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/services/seo"
                className="border border-border-custom bg-surface/60 hover:bg-surface text-foreground px-6 py-4 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
              >
                Browse All SEO Services
              </Link>
            </div>
          </div>
        </section>

        <ContactSection />
      </main>
      <FooterSection />
    </>
  );
}
