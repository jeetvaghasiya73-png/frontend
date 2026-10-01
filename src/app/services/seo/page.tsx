"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import FooterSection from "@/components/layout/FooterSection";
import ContactSection from "@/components/sections/ContactSection";
import SplitText from "@/components/animations/SplitText";
import "@/app/services/seo/seo-cluster.css";
import {
  Search,
  Gauge,
  Link2,
  FileCode2,
  Globe2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Target,
  Zap,
  Activity,
  Bot,
  ShoppingCart,
  Building,
  Utensils,
  Stethoscope,
  Pill,
  HardHat,
  Briefcase,
  Wrench,
  Monitor,
  Smartphone,
  ChevronRight,
  ChevronUp,
  Layers,
  ExternalLink,
  MapPin
} from "lucide-react";
import { citiesByRegion } from "@/app/services/seo/seo-cities-data";

export default function SeoMainPage() {
  // State for interactive SERP tracker simulator (kept from original as it's highly effective)
  const [activeSimulatorTab, setActiveSimulatorTab] = useState<"serp" | "vitals" | "aioverview" | "geogrid">("serp");
  
  // States for expandable sections
  const [expandedIndustry, setExpandedIndustry] = useState<string | null>(null);
  const [activePlatform, setActivePlatform] = useState<string>("wordpress");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleIndustry = (industry: string) => {
    if (expandedIndustry === industry) {
      setExpandedIndustry(null);
    } else {
      setExpandedIndustry(industry);
    }
  };

  const toggleFaq = (index: number) => {
    if (openFaqIndex === index) {
      setOpenFaqIndex(null);
    } else {
      setOpenFaqIndex(index);
    }
  };

  const faqs = [
    {
      q: "What are search engine optimization services?",
      a: "Search engine optimization (SEO) services involve improving your website's visibility on search engines like Google. This includes optimizing technical performance, on-page content relevance, and off-page authority so potential customers can easily find your business organically."
    },
    {
      q: "How can SEO help my business?",
      a: "A sustainable SEO strategy helps businesses attract relevant, high-intent traffic without relying entirely on paid advertising. Over time, ranking for your primary keywords can generate qualified leads, improve brand authority, and reduce your overall customer acquisition costs."
    },
    {
      q: "What is included in on-page SEO services?",
      a: "Our on page SEO service includes comprehensive keyword research and mapping, search intent analysis, title tag and meta description optimization, heading structure improvements, internal linking, and image optimization to ensure search engines clearly understand your website's purpose."
    },
    {
      q: "What is the difference between on-page and off-page SEO?",
      a: "On-page SEO focuses entirely on optimizing elements within your website, such as your content structure and technical architecture. Off-page SEO services involve building authority and trust outside of your website, primarily through acquiring high-quality backlinks and digital PR placements."
    },
    {
      q: "How long does SEO take to show results?",
      a: "While technical improvements can show minor indexing benefits within a few weeks, sustainable organic search engine optimization services generally take 3 to 6 months to show significant ranking shifts and traffic increases as authority builds over time."
    },
    {
      q: "Can SEO guarantee first-page Google rankings?",
      a: "No professional SEO agency or Google ranking expert can guarantee a #1 ranking. Rankings depend on hundreds of dynamic algorithmic factors, competition, and search intent. However, following proven technical and content guidelines significantly improves your chances of dominating relevant search results."
    },
    {
      q: "Can you optimize Shopify stores?",
      a: "Absolutely. Our Shopify SEO process addresses platform-specific challenges like duplicate URL management, canonical tag configuration, collection page structuring, and technical speed optimization."
    },
    {
      q: "What are white-label SEO services?",
      a: "White label SEO services allow digital marketing agencies or consultants to outsource SEO execution to us. We handle the technical audits, content optimization, and link building, and provide reports that you can deliver to your clients under your own brand."
    },
    {
      q: "How can digital marketing agencies work with your team?",
      a: "Agencies can partner with us on a flexible, white-label basis. You share the project scope and client goals, and our backend team executes the technical and strategic SEO deliverables while you maintain the client relationship."
    },
    {
      q: "How do I get started with your SEO services?",
      a: "Simply reach out via our contact page to discuss your project. We'll start with an initial website analysis to understand your current search visibility and propose a clear, actionable SEO roadmap tailored to your business."
    }
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": "https://www.techinfinix.com/services/seo#service",
        name: "Search Engine Optimization (SEO) Services",
        serviceType: "Search Engine Optimization",
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
            availableLanguage: ["English", "Hindi", "Gujarati"],
          },
        },
        description:
          "Professional SEO services including on-page SEO, off-page SEO, technical SEO, e-commerce SEO, and white-label SEO services.",
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "SEO Services Overview",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "On-Page SEO Service",
                description: "Keyword mapping, title tag optimization, internal linking, and search intent alignment.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Off-Page SEO Services",
                description: "High-quality link acquisition, digital PR, and authority building.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Technical SEO",
                description: "Crawlability fixes, XML sitemaps, Core Web Vitals optimization, and structured data implementation.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "White Label SEO Services",
                description: "Reliable SEO fulfillment and delivery support for digital marketing agencies.",
              },
            }
          ],
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://www.techinfinix.com/services/seo#breadcrumb",
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
            name: "SEO Services",
            item: "https://www.techinfinix.com/services/seo",
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": "https://www.techinfinix.com/services/seo#faq",
        mainEntity: faqs.map(f => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.a
          }
        }))
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
      <main className="flex-1 bg-background text-foreground pt-28 sm:pt-32 pb-24 text-left overflow-hidden">
        
        {/* Breadcrumb Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full pt-4 pb-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-secondary-custom">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-foreground transition-colors">Services</Link>
            <span>/</span>
            <span className="text-emerald-500 font-semibold">SEO Services</span>
          </nav>
        </div>

        {/* SECTION 1: HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full relative mb-20 md:mb-28">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border-custom bg-surface text-secondary-custom text-xs font-mono font-semibold tracking-wide mb-6">
            <span>EXPERT SEO AGENCY</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6 max-w-4xl">
            <SplitText text="Search Engine Optimization Services That Help Your Business Grow" type="words" />
          </h1>

          <p className="text-base sm:text-lg text-secondary-custom max-w-3xl leading-relaxed mb-10">
            As the best search engine optimization agency partner for growing brands, Tech Infinix provides comprehensive strategies including technical SEO, on-page optimization, local SEO, and e-commerce SEO. We focus on relevant organic traffic, sustainable growth, and improved online visibility.
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-16">
            <Link
              href="/contact?service=seo"
              className="bg-foreground hover:opacity-90 text-background px-7 py-4 rounded-xl text-sm font-semibold tracking-wide flex items-center gap-2.5 transition-all shadow-lg cursor-pointer"
            >
              Discuss Your SEO Project
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#seo-solutions"
              className="border border-border-custom bg-surface/40 hover:bg-surface/70 text-foreground px-6 py-4 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              Explore Our SEO Solutions
              <ChevronDown className="w-4 h-4 text-secondary-custom" />
            </a>
          </div>
        </section>

        {/* SECTION 2: SEO SERVICES */}
        <section id="seo-services" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-28">
          <div className="mb-12 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
              Comprehensive SEO Services
            </h2>
            <p className="text-sm sm:text-base text-secondary-custom leading-relaxed">
              We provide an end-to-end suite of search engine optimization solutions to ensure your website is accessible, authoritative, and perfectly aligned with search intent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="border border-border-custom bg-surface/20 p-8 rounded-2xl flex flex-col hover:border-emerald-500/50 hover:bg-surface/30 transition-all duration-300">
              <FileCode2 className="w-8 h-8 text-emerald-500 mb-6" />
              <h3 className="text-xl font-bold text-foreground mb-3">On-Page SEO Service</h3>
              <p className="text-xs sm:text-sm text-secondary-custom leading-relaxed mb-6">
                Our on page SEO service ensures search engines understand your website's content and visitors find relevant information instantly. We focus on aligning your site architecture with actual user behavior.
              </p>
              <ul className="space-y-2 mb-6">
                {["Keyword research and mapping", "Search intent analysis", "Title tag & meta description optimization", "Heading structure & internal linking", "Content & image optimization", "URL structure refinement"].map(item => (
                  <li key={item} className="flex items-start gap-2 text-xs text-foreground/90">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link 
                href="/services/seo/on-page-seo-services" 
                className="mt-auto inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-500 hover:underline pt-4 border-t border-border-custom/50"
              >
                <span>Explore On-Page SEO Services</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="border border-border-custom bg-surface/20 p-8 rounded-2xl flex flex-col hover:border-emerald-500/50 hover:bg-surface/30 transition-all duration-300">
              <Link2 className="w-8 h-8 text-emerald-500 mb-6" />
              <h3 className="text-xl font-bold text-foreground mb-3">Off-Page SEO Services</h3>
              <p className="text-xs sm:text-sm text-secondary-custom leading-relaxed mb-6">
                Our off page SEO services help businesses build authority, trust, and external visibility. We rely strictly on ethical, high-quality placements rather than automated or spammy link schemes.
              </p>
              <ul className="space-y-2 mb-6">
                {["Quality link acquisition", "Digital PR & brand mentions", "Relevant industry placements", "Competitor backlink analysis", "Link profile monitoring", "Ethical authority-building strategies"].map(item => (
                  <li key={item} className="flex items-start gap-2 text-xs text-foreground/90">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-border-custom/50">
                <Link 
                  href="/services/seo/seo-link-building" 
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-500 hover:underline"
                >
                  <span>Explore SEO Link Building</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link 
                  href="/services/seo/backlinks-in-seo" 
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-secondary-custom hover:text-foreground"
                >
                  <span>Read Backlinks in SEO Guide →</span>
                </Link>
              </div>
            </div>

            <div className="border border-border-custom bg-surface/20 p-8 rounded-2xl flex flex-col hover:border-emerald-500/50 hover:bg-surface/30 transition-all duration-300">
              <Gauge className="w-8 h-8 text-emerald-500 mb-6" />
              <h3 className="text-xl font-bold text-foreground mb-3">Technical SEO</h3>
              <p className="text-xs sm:text-sm text-secondary-custom leading-relaxed mb-6">
                Technical SEO improves the accessibility, crawlability, and indexability of a website. We translate complex engineering concepts into smooth, easily navigable experiences for search engine bots.
              </p>
              <ul className="space-y-2 mb-6">
                {["Technical website audits", "Crawlability & indexability", "XML sitemaps & Robots.txt", "Canonical tags & broken links", "Core Web Vitals & mobile usability", "Structured data & architecture"].map(item => (
                  <li key={item} className="flex items-start gap-2 text-xs text-foreground/90">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link 
                href="/services/seo/seo-audit-services" 
                className="mt-auto inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-500 hover:underline pt-4 border-t border-border-custom/50"
              >
                <span>Explore Technical SEO Audits</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="border border-border-custom bg-surface/20 p-8 rounded-2xl flex flex-col hover:border-emerald-500/50 hover:bg-surface/30 transition-all duration-300">
              <Globe2 className="w-8 h-8 text-emerald-500 mb-6" />
              <h3 className="text-xl font-bold text-foreground mb-3">Organic SEO</h3>
              <p className="text-xs sm:text-sm text-secondary-custom leading-relaxed mb-6">
                Our organic search engine optimization services build sustainable strategies to attract relevant visitors. We focus on qualified leads and long-term visibility over short-term paid traffic bursts.
              </p>
              <Link 
                href="/services/seo/organic-seo-services" 
                className="mt-auto inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-500 hover:underline pt-4 border-t border-border-custom/50"
              >
                <span>Explore Organic SEO Services</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="border border-border-custom bg-surface/20 p-8 rounded-2xl flex flex-col hover:border-emerald-500/50 hover:bg-surface/30 transition-all duration-300">
              <Search className="w-8 h-8 text-emerald-500 mb-6" />
              <h3 className="text-xl font-bold text-foreground mb-3">Google SEO</h3>
              <p className="text-xs sm:text-sm text-secondary-custom leading-relaxed mb-6">
                Our Google search engine optimization approach strictly follows Google Search Central guidelines, optimizing for helpful content, page experience, and technical accessibility without outdated practices.
              </p>
              <Link 
                href="/services/seo/google-seo" 
                className="mt-auto inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-500 hover:underline pt-4 border-t border-border-custom/50"
              >
                <span>Explore Google SEO Compliance</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="border border-border-custom bg-surface/20 p-8 rounded-2xl flex flex-col hover:border-emerald-500/50 hover:bg-surface/30 transition-all duration-300">
              <Target className="w-8 h-8 text-emerald-500 mb-6" />
              <h3 className="text-xl font-bold text-foreground mb-3">Ranking Specialists</h3>
              <p className="text-xs sm:text-sm text-secondary-custom leading-relaxed mb-6">
                As a dedicated Google ranking expert team, we analyze ranking opportunities and implement strategic improvements. We set realistic expectations, as long-term rankings depend on consistent, quality work.
              </p>
              <Link 
                href="/services/seo/google-ranking-expert" 
                className="mt-auto inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-500 hover:underline pt-4 border-t border-border-custom/50"
              >
                <span>Consult a Google Ranking Expert</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </section>

        {/* SECTION 3: INDUSTRY-SPECIFIC SEO SERVICES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-28">
          <div className="mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-4">
              SEO Solutions for Different Industries
            </h2>
            <p className="text-sm sm:text-base text-secondary-custom leading-relaxed max-w-3xl">
              Businesses in different industries have different search behaviors, customer journeys, competition, and content requirements. We adapt our strategies to your specific market.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {[
              {
                id: "ecom",
                icon: <ShoppingCart className="w-5 h-5" />,
                title: "E-commerce SEO",
                keyword: "E-commerce SEO services",
                desc: "As a leading e-commerce SEO agency, we specialize in SEO in e-commerce, tackling complex store architectures.",
                details: "We handle product page optimization, category page structuring, product schema integration, faceted navigation issues, duplicate content, and deep product keyword research to drive organic discovery.",
                link: "/services/seo/ecommerce-seo-services",
                linkText: "Explore E-Commerce SEO Services"
              },
              {
                id: "realestate",
                icon: <Building className="w-5 h-5" />,
                title: "Real Estate SEO",
                desc: "Drive highly targeted local buyer and seller traffic to your brokerage or property portfolios.",
                details: "We optimize property listings, implement location-based keywords, build neighborhood landing pages, and optimize for local SEO to generate qualified real estate leads.",
                link: "/services/seo/real-estate-seo",
                linkText: "Explore Real Estate SEO Services"
              },
              {
                id: "restaurant",
                icon: <Utensils className="w-5 h-5" />,
                title: "Restaurant SEO",
                desc: "Improve local visibility so hungry customers in your proximity find your menu first.",
                details: "Our focus includes local SEO, Google Business Profile optimization, menu page structuring, and review reputation management to dominate local dining search visibility.",
                link: "/services/seo/local-seo-services",
                linkText: "Explore Local Search SEO Services"
              },
              {
                id: "dental",
                icon: <Stethoscope className="w-5 h-5" />,
                title: "Dental SEO",
                keyword: "Dental SEO services",
                desc: "Our dental SEO services target patient search intent for high-value procedures in your city.",
                details: "We build dedicated dental treatment pages, optimize dentist location hubs, and focus on appointment-driven content aligned with local dental search intent.",
                link: "/services/seo/dental-seo",
                linkText: "Explore Dental SEO Services"
              },
              {
                id: "pharma",
                icon: <Pill className="w-5 h-5" />,
                title: "Pharmaceutical SEO",
                desc: "Navigate regulatory complexities while ensuring accurate, discoverable medical content.",
                details: "We handle product category structuring, regulatory awareness compliance, technical SEO, and educational content accuracy tailored for strict pharma search intent.",
                link: "/services/seo/google-seo",
                linkText: "Explore Healthcare & Google SEO Guidelines"
              },
              {
                id: "architecture",
                icon: <HardHat className="w-5 h-5" />,
                title: "Architecture SEO",
                desc: "Showcase your portfolio to high-net-worth clients searching for local design firms.",
                details: "We focus on architecture portfolio optimization, specific project pages, image SEO, and location-based searches for specific architectural services.",
                link: "/services/seo/local-seo-services",
                linkText: "Explore Local Architecture Firm SEO"
              },
              {
                id: "healthcare",
                icon: <Activity className="w-5 h-5" />,
                title: "Healthcare SEO",
                desc: "Build authority and trust signals necessary for sensitive YMYL (Your Money or Your Life) queries.",
                details: "We optimize healthcare service pages, ensure medical content quality, implement technical trust signals, and improve local search visibility for clinics and hospitals.",
                link: "/services/seo/dental-seo",
                linkText: "Explore Medical & Clinical Practice SEO"
              },
              {
                id: "legal",
                icon: <Briefcase className="w-5 h-5" />,
                title: "Legal SEO",
                keyword: "Search engine optimization for lawyers",
                desc: "Search engine optimization for lawyers requires aggressive local and practice-area targeting.",
                details: "We develop comprehensive law firm service pages, optimize location-based legal keywords, and create structured contact conversion paths without promising guaranteed legal leads.",
                link: "/services/seo/seo-for-lawyers",
                linkText: "Explore Search Engine Optimization for Lawyers"
              },
              {
                id: "other",
                icon: <Globe2 className="w-5 h-5" />,
                title: "Other Industries",
                desc: "We adapt our proven SEO methodologies to any B2B or B2C market.",
                details: "Whether you're in manufacturing, SaaS, logistics, or education, our SEO strategies can be adapted to your industry depending on the website, competition, and business objectives.",
                link: "/services/seo/professional-seo-services",
                linkText: "Explore Professional SEO Solutions"
              }
            ].map((industry) => (
              <div 
                key={industry.id}
                className="border border-border-custom bg-surface/30 rounded-xl overflow-hidden transition-all duration-300 hover:border-emerald-500/30"
              >
                <div 
                  className="p-5 flex items-center justify-between cursor-pointer select-none"
                  onClick={() => toggleIndustry(industry.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-emerald-500">{industry.icon}</div>
                    <h3 className="font-bold text-foreground text-sm sm:text-base">{industry.title}</h3>
                  </div>
                  {expandedIndustry === industry.id ? (
                    <ChevronUp className="w-4 h-4 text-secondary-custom" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-secondary-custom" />
                  )}
                </div>
                
                <div 
                  className={`px-5 overflow-hidden transition-all duration-300 ease-in-out ${
                    expandedIndustry === industry.id ? "max-h-96 pb-5 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-xs sm:text-sm text-secondary-custom mb-3 font-medium">
                    {industry.desc}
                  </p>
                  <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed border-t border-border-custom/50 pt-3">
                    {industry.details}
                  </p>
                  {industry.link && (
                    <div className="pt-3 border-t border-border-custom/50 mt-3">
                      <Link
                        href={industry.link}
                        className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-500 hover:underline"
                      >
                        <span>{industry.linkText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: PLATFORM-SPECIFIC SEO SERVICES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-28">
          <div className="border border-border-custom bg-surface/10 rounded-3xl p-8 sm:p-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-4 text-center">
              SEO Services for Your Website Platform
            </h2>
            <p className="text-sm sm:text-base text-secondary-custom leading-relaxed max-w-3xl mx-auto text-center mb-10">
              Different website platforms have different SEO capabilities, technical limitations, and optimization requirements. We deploy tailored strategies based on your CMS architecture.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <button 
                onClick={() => setActivePlatform("wordpress")}
                className={`px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all ${
                  activePlatform === "wordpress" ? "bg-foreground text-background" : "bg-surface border border-border-custom text-secondary-custom hover:text-foreground"
                }`}
              >
                WordPress SEO
              </button>
              <button 
                onClick={() => setActivePlatform("shopify")}
                className={`px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all ${
                  activePlatform === "shopify" ? "bg-foreground text-background" : "bg-surface border border-border-custom text-secondary-custom hover:text-foreground"
                }`}
              >
                Shopify SEO
              </button>
              <button 
                onClick={() => setActivePlatform("other")}
                className={`px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all ${
                  activePlatform === "other" ? "bg-foreground text-background" : "bg-surface border border-border-custom text-secondary-custom hover:text-foreground"
                }`}
              >
                Custom & Other Platforms
              </button>
            </div>

            <div className="bg-surface/30 border border-border-custom p-6 sm:p-10 rounded-2xl">
              {activePlatform === "wordpress" && (
                <div className="animate-in fade-in zoom-in-95 duration-300">
                  <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                    <FileCode2 className="w-5 h-5 text-emerald-500" /> WordPress SEO
                  </h3>
                  <p className="text-sm text-secondary-custom leading-relaxed mb-6">
                    We navigate WordPress technical SEO to ensure your site stays fast and indexable. This includes structuring SEO-friendly URLs, extensive metadata optimization, configuring caching plugins for website speed, implementing XML sitemaps, structured data logic, and rigorous content optimization.
                  </p>
                  <Link
                    href="/services/seo/wordpress-seo"
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-500 hover:underline"
                  >
                    <span>Explore Dedicated WordPress SEO Services</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
              {activePlatform === "shopify" && (
                <div className="animate-in fade-in zoom-in-95 duration-300">
                  <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-emerald-500" /> Shopify SEO
                  </h3>
                  <p className="text-sm text-secondary-custom leading-relaxed mb-6">
                    Shopify stores require specific technical handling. We focus on Shopify product page optimization, collection page structuring, automated product schema, resolving native duplicate URL management issues, canonical tags, store architecture refinement, and page speed improvements.
                  </p>
                  <Link
                    href="/services/seo/shopify-seo"
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-500 hover:underline"
                  >
                    <span>Explore Dedicated Shopify SEO Agency Solutions</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
              {activePlatform === "other" && (
                <div className="animate-in fade-in zoom-in-95 duration-300">
                  <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-emerald-500" /> Custom-Built & Next.js SEO
                  </h3>
                  <p className="text-sm text-secondary-custom leading-relaxed mb-6">
                    For custom-built websites, Next.js applications, PHP websites, or other CMS platforms, the SEO strategy must adapt to the underlying architecture. We work directly with your codebase to implement server-side rendering optimizations, headless CMS metadata structuring, and custom technical requirements.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 5: WHITE-LABEL SEO SERVICES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-28">
          <div className="relative border border-emerald-500/30 bg-emerald-500/5 rounded-3xl p-8 sm:p-12 lg:p-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
            
            <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
              <div className="flex-1">
                <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-500 uppercase block mb-3">
                  Agency Partnerships
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-5">
                  White Label SEO Services for Agencies
                </h2>
                <p className="text-sm sm:text-base text-secondary-custom leading-relaxed mb-6">
                  Our white label SEO services are designed for digital marketing agencies, web development firms, and freelance consultants who need reliable SEO delivery support. 
                  Outsource your SEO execution to our team while maintaining complete control over your client relationships and brand identity.
                </p>
                <ul className="space-y-3 mb-8">
                  {["White-label keyword research & strategy", "On-page & Technical SEO audits", "Content optimization & execution", "Off-page SEO & link building", "Monthly unbranded reporting"].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-foreground/90 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="/services/seo/white-label-seo"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Explore White Label SEO
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/services/seo/white-label-link-building"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-border-custom bg-surface/50 text-foreground text-sm font-semibold rounded-xl hover:bg-surface/80 transition-colors"
                  >
                    White Label Link Building →
                  </Link>
                </div>
              </div>

              <div className="flex-1 bg-surface/50 border border-border-custom rounded-2xl p-6 sm:p-8 w-full">
                <h3 className="text-lg font-bold text-foreground mb-4">The Partnership Process</h3>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-3.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border-custom before:to-transparent">
                  {[
                    { title: "Share Requirements", desc: "Share your project requirements and client goals with us." },
                    { title: "Scope & Deliverables", desc: "We discuss the SEO scope, deliverables, and resource allocation." },
                    { title: "Workflow Agreement", desc: "Agree on the workflow, approval stages, and communication process." },
                    { title: "Execution & Reporting", desc: "We begin SEO execution and provide regular progress reports." }
                  ].map((step, idx) => (
                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full border-2 border-surface bg-emerald-500 text-background text-xs font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-md">
                        {idx + 1}
                      </div>
                      <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-xl border border-border-custom bg-background shadow-sm group-hover:border-emerald-500/40 transition-colors">
                        <h4 className="text-sm font-bold text-foreground mb-1">{step.title}</h4>
                        <p className="text-xs text-secondary-custom">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: OUR SEO PROCESS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-28">
          <div className="mb-12 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
              Our Approach to Search Engine Optimization
            </h2>
            <p className="text-sm sm:text-base text-secondary-custom leading-relaxed">
              We execute a clear, structured methodology for every SEO project. Our process ensures transparency and focuses on long-term organic stability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-6">
            {[
              { num: "01", title: "Website & Business Analysis", desc: "Understand the business, existing website infrastructure, audience, and overall objectives." },
              { num: "02", title: "Keyword & Search Intent", desc: "Identify relevant keywords, analyze user search intent, and uncover content gaps." },
              { num: "03", title: "Technical & On-Page", desc: "Identify and prioritize technical indexation improvements and on-page content alignment." },
              { num: "04", title: "Content & Authority", desc: "Improve relevant website content and develop appropriate external authority-building activities." },
              { num: "05", title: "Monitoring & Improvement", desc: "Monitor available search performance data and continually refine the strategy based on empirical results." }
            ].map((step) => (
              <div key={step.num} className="bg-surface/20 border border-border-custom rounded-xl p-5 hover:border-emerald-500/30 transition-colors">
                <span className="text-3xl font-black text-border-custom block mb-3">{step.num}</span>
                <h4 className="text-sm font-bold text-foreground mb-2">{step.title}</h4>
                <p className="text-[11px] sm:text-xs text-secondary-custom leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 7: WHY CHOOSE TECH INFINIX? */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-28">
          <div className="border-t border-b border-border-custom/50 py-16">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="lg:w-1/3">
                <h2 className="text-3xl font-extrabold text-foreground mb-4">
                  Why Choose Tech Infinix?
                </h2>
                <p className="text-sm text-secondary-custom leading-relaxed">
                  We base our SEO methodologies on practical, verifiable engineering and content strategies rather than generic marketing claims.
                </p>
              </div>
              <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { title: "Business-Focused SEO Strategy", desc: "We prioritize relevant traffic and qualified lead generation over superficial vanity metrics." },
                  { title: "Technical & Content Synergy", desc: "We combine deep technical website optimization with highly relevant content execution." },
                  { title: "Platform-Aware Implementation", desc: "We deploy methodologies specifically suited to the technical architecture of your CMS." },
                  { title: "Transparent Communication", desc: "We maintain clear, honest dialogue regarding SEO deliverables, timelines, and progress." }
                ].map(reason => (
                  <div key={reason.title} className="flex gap-4">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-1">{reason.title}</h4>
                      <p className="text-xs text-secondary-custom leading-relaxed">{reason.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7.5: EXPLORE OUR SEO SOLUTIONS (CLUSTER DIRECTORY) */}
        <section id="seo-solutions" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-28">
          <div className="mb-12 text-center max-w-3xl mx-auto">
            <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-500 uppercase block mb-3">
              Topical Authority Cluster
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground mb-4">
              Explore Our SEO Solutions
            </h2>
            <p className="text-sm sm:text-base text-secondary-custom leading-relaxed">
              Explore our specialized SEO services and resources to find the solutions that match your website architecture, industry vertical, and organic growth objectives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* GROUP 1: GENERAL SEO SERVICES */}
            <div className="seo-directory-group">
              <span className="seo-directory-badge">Group A</span>
              <h3 className="text-lg font-bold text-foreground mb-4">General SEO Services</h3>
              <div className="seo-directory-list">
                {[
                  { slug: "professional-seo-services", name: "Professional SEO Services", desc: "Structured, full-funnel search strategy" },
                  { slug: "seo-packages", name: "SEO Packages", desc: "Tiered scopes & clear deliverables" },
                  { slug: "seo-pricing", name: "SEO Pricing Guide", desc: "Cost drivers & transparent budgeting" },
                  { slug: "best-seo-agency", name: "Best SEO Agency Evaluation", desc: "Framework for selecting an agency partner" },
                  { slug: "google-ranking-expert", name: "Google Ranking Specialists", desc: "Intent, entities & ranking signals" },
                  { slug: "organic-seo-services", name: "Organic SEO Services", desc: "Compounding non-paid search traffic" },
                  { slug: "google-seo", name: "Google SEO Compliance", desc: "Google Search Central best practices" },
                  { slug: "search-engine-marketing-analysis", name: "SEM & Search Analysis", desc: "Market share & competitor search audit" },
                  { slug: "seo-audit-services", name: "Technical SEO Audits", desc: "Deep crawl, index & code diagnostics" },
                  { slug: "seo-for-small-businesses", name: "Small Business SEO", desc: "High-ROI local & niche optimization" },
                  { slug: "backlinks-in-seo", name: "Backlinks in SEO", desc: "Link equity, authority & safety guide" },
                ].map(item => (
                  <Link key={item.slug} href={`/services/seo/${item.slug}`} className="seo-directory-item group">
                    <ChevronRight className="w-3.5 h-3.5 seo-directory-item-bullet group-hover:translate-x-0.5 transition-transform" />
                    <div>
                      <div className="font-semibold group-hover:text-emerald-500 transition-colors leading-snug">{item.name}</div>
                      <div className="text-[11px] text-secondary-custom leading-tight">{item.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* GROUP 2: ON-PAGE AND LINK BUILDING */}
            <div className="seo-directory-group">
              <span className="seo-directory-badge">Group B</span>
              <h3 className="text-lg font-bold text-foreground mb-4">On-Page & Link Building</h3>
              <div className="seo-directory-list">
                {[
                  { slug: "on-page-seo-services", name: "On-Page SEO Services", desc: "Metadata, heading tags & internal links" },
                  { slug: "seo-link-building", name: "SEO Link Building Services", desc: "Ethical editorial outreach & digital PR" },
                  { slug: "white-label-link-building", name: "White Label Link Building", desc: "Unbranded fulfillment for agencies" },
                  { slug: "white-label-seo", name: "White Label SEO Services", desc: "End-to-end outsourced agency SEO" },
                ].map(item => (
                  <Link key={item.slug} href={`/services/seo/${item.slug}`} className="seo-directory-item group">
                    <ChevronRight className="w-3.5 h-3.5 seo-directory-item-bullet group-hover:translate-x-0.5 transition-transform" />
                    <div>
                      <div className="font-semibold group-hover:text-emerald-500 transition-colors leading-snug">{item.name}</div>
                      <div className="text-[11px] text-secondary-custom leading-tight">{item.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* GROUP 3: PLATFORM-SPECIFIC SEO */}
            <div className="seo-directory-group">
              <span className="seo-directory-badge">Group C</span>
              <h3 className="text-lg font-bold text-foreground mb-4">Platform-Specific SEO</h3>
              <div className="seo-directory-list">
                {[
                  { slug: "wordpress-seo", name: "WordPress SEO Services", desc: "Speed, taxonomy & WooCommerce fixes" },
                  { slug: "shopify-seo", name: "Shopify SEO Agency", desc: "Liquid templates & duplicate URL fixes" },
                  { slug: "ecommerce-seo-services", name: "E-Commerce SEO Services", desc: "Category architectures & product schema" },
                  { slug: "ecommerce-seo-agency", name: "E-Commerce SEO Agency", desc: "Specialist retail agency selection" },
                  { slug: "seo-for-ecommerce", name: "SEO in E-Commerce Guide", desc: "Catalog crawl budget & filter mechanics" },
                ].map(item => (
                  <Link key={item.slug} href={`/services/seo/${item.slug}`} className="seo-directory-item group">
                    <ChevronRight className="w-3.5 h-3.5 seo-directory-item-bullet group-hover:translate-x-0.5 transition-transform" />
                    <div>
                      <div className="font-semibold group-hover:text-emerald-500 transition-colors leading-snug">{item.name}</div>
                      <div className="text-[11px] text-secondary-custom leading-tight">{item.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* GROUP 4: INDUSTRY-SPECIFIC SEO */}
            <div className="seo-directory-group">
              <span className="seo-directory-badge">Group D</span>
              <h3 className="text-lg font-bold text-foreground mb-4">Industry-Specific SEO</h3>
              <div className="seo-directory-list">
                {[
                  { slug: "real-estate-seo", name: "Real Estate SEO Services", desc: "Neighborhood guides & IDX optimizations" },
                  { slug: "dental-seo", name: "Dental SEO Services", desc: "High-value procedure & patient acquisition" },
                  { slug: "seo-for-lawyers", name: "SEO for Lawyers", desc: "Practice area hubs & bar-compliant SEO" },
                  { slug: "local-seo-services", name: "Local Search SEO Services", desc: "Google Maps, local 3-pack & citations" },
                ].map(item => (
                  <Link key={item.slug} href={`/services/seo/${item.slug}`} className="seo-directory-item group">
                    <ChevronRight className="w-3.5 h-3.5 seo-directory-item-bullet group-hover:translate-x-0.5 transition-transform" />
                    <div>
                      <div className="font-semibold group-hover:text-emerald-500 transition-colors leading-snug">{item.name}</div>
                      <div className="text-[11px] text-secondary-custom leading-tight">{item.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 7.6: SEO SERVICES ACROSS MAJOR INDIAN CITIES */}
        <section id="indian-cities-directory" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-28">
          <div className="mb-12 text-center max-w-3xl mx-auto">
            <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-500 uppercase block mb-3">
              Regional Local Search Directory
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground mb-4">
              SEO Services Across Major Indian Cities
            </h2>
            <p className="text-sm sm:text-base text-secondary-custom leading-relaxed">
              Explore our city-specific SEO services tailored for 25 major commercial and industrial hubs across India. Each page details regional business ecosystems, local search dynamics, sector-specific opportunities, and data-backed organic strategies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* REGION 1: WEST INDIA */}
            <div className="seo-directory-group">
              <div className="flex items-center justify-between mb-4">
                <span className="seo-directory-badge">West India</span>
                <span className="text-xs font-mono text-secondary-custom">{citiesByRegion.westIndia.length} Cities</span>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-4">Commercial &amp; Trade Hubs</h3>
              <div className="seo-directory-list">
                {citiesByRegion.westIndia.map(city => (
                  <Link key={city.slug} href={`/services/seo/${city.slug}`} className="seo-directory-item group">
                    <ChevronRight className="w-3.5 h-3.5 seo-directory-item-bullet group-hover:translate-x-0.5 transition-transform" />
                    <div>
                      <div className="font-semibold group-hover:text-emerald-500 transition-colors leading-snug">
                        {city.primaryKeyword}
                      </div>
                      <div className="text-[11px] text-secondary-custom leading-tight">
                        {city.city}, {city.state}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* REGION 2: NORTH INDIA */}
            <div className="seo-directory-group">
              <div className="flex items-center justify-between mb-4">
                <span className="seo-directory-badge">North India</span>
                <span className="text-xs font-mono text-secondary-custom">{citiesByRegion.northIndia.length} Cities</span>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-4">NCR &amp; Northern Capitals</h3>
              <div className="seo-directory-list">
                {citiesByRegion.northIndia.map(city => (
                  <Link key={city.slug} href={`/services/seo/${city.slug}`} className="seo-directory-item group">
                    <ChevronRight className="w-3.5 h-3.5 seo-directory-item-bullet group-hover:translate-x-0.5 transition-transform" />
                    <div>
                      <div className="font-semibold group-hover:text-emerald-500 transition-colors leading-snug">
                        {city.primaryKeyword}
                      </div>
                      <div className="text-[11px] text-secondary-custom leading-tight">
                        {city.city}, {city.state}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* REGION 3: SOUTH INDIA */}
            <div className="seo-directory-group">
              <div className="flex items-center justify-between mb-4">
                <span className="seo-directory-badge">South India</span>
                <span className="text-xs font-mono text-secondary-custom">{citiesByRegion.southIndia.length} Cities</span>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-4">Tech &amp; Manufacturing Corridors</h3>
              <div className="seo-directory-list">
                {citiesByRegion.southIndia.map(city => (
                  <Link key={city.slug} href={`/services/seo/${city.slug}`} className="seo-directory-item group">
                    <ChevronRight className="w-3.5 h-3.5 seo-directory-item-bullet group-hover:translate-x-0.5 transition-transform" />
                    <div>
                      <div className="font-semibold group-hover:text-emerald-500 transition-colors leading-snug">
                        {city.primaryKeyword}
                      </div>
                      <div className="text-[11px] text-secondary-custom leading-tight">
                        {city.city}, {city.state}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* REGION 4: EAST & CENTRAL INDIA */}
            <div className="seo-directory-group">
              <div className="flex items-center justify-between mb-4">
                <span className="seo-directory-badge">East &amp; Central India</span>
                <span className="text-xs font-mono text-secondary-custom">{citiesByRegion.eastAndCentralIndia.length} Cities</span>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-4">Emerging Tech &amp; Logistics Hubs</h3>
              <div className="seo-directory-list">
                {citiesByRegion.eastAndCentralIndia.map(city => (
                  <Link key={city.slug} href={`/services/seo/${city.slug}`} className="seo-directory-item group">
                    <ChevronRight className="w-3.5 h-3.5 seo-directory-item-bullet group-hover:translate-x-0.5 transition-transform" />
                    <div>
                      <div className="font-semibold group-hover:text-emerald-500 transition-colors leading-snug">
                        {city.primaryKeyword}
                      </div>
                      <div className="text-[11px] text-secondary-custom leading-tight">
                        {city.city}, {city.state}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 8: FAQ */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 w-full mb-28">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-secondary-custom">
              Common questions about our SEO services and strategies.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="border border-border-custom bg-surface/30 rounded-xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-5 text-left bg-transparent"
                >
                  <span className="text-sm sm:text-base font-semibold text-foreground pr-4">
                    {faq.q}
                  </span>
                  <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center bg-surface border border-border-custom transition-transform duration-300 ${openFaqIndex === index ? "rotate-180 bg-foreground text-background" : "text-secondary-custom"}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaqIndex === index ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-5 pt-0 text-sm text-secondary-custom leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 9: FINAL CALL TO ACTION */}
        <ContactSection />

      </main>
      <FooterSection />
    </>
  );
}
