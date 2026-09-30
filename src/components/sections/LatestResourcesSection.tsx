"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/config";
import SplitText from "@/components/animations/SplitText";
import { Calendar, Clock, ArrowUpRight } from "lucide-react";
import { formatISTDate } from "@/lib/formatters";

type ResourceItem = {
  id: string;
  title: string;
  slug: string;
  cover: string;
  category: string;
  date: string;
  readTime: string;
  summary: string;
  link: string;
};

export default function LatestResourcesSection() {
  const [activeTab, setActiveTab] = useState<"blogs" | "case_studies" | "research">("blogs");
  const [blogs, setBlogs] = useState<ResourceItem[]>([]);
  const [caseStudies, setCaseStudies] = useState<ResourceItem[]>([]);
  const [research, setResearch] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fallbacks if API is empty
  const fallbackBlogs: ResourceItem[] = [
    {
      id: "b1",
      title: "The Future of Web Application Development in 2026",
      slug: "future-of-web-dev",
      cover: "/images/blogs/ai-human-hero.jpg",
      category: "Web Development",
      date: new Date().toISOString(),
      readTime: "5 min read",
      summary: "Exploring how modern IT solutions providers are shifting towards AI-driven architectures and edge computing.",
      link: "/blogs/future-of-web-dev"
    },
    {
      id: "b2",
      title: "How Local SEO is Changing for Service Businesses",
      slug: "local-seo-changes",
      cover: "/images/blogs/ai-human-hero.jpg",
      category: "SEO",
      date: new Date().toISOString(),
      readTime: "4 min read",
      summary: "Why traditional keyword stuffing is dead and what you need to do instead to rank on Google Maps effectively.",
      link: "/blogs/local-seo-changes"
    },
    {
      id: "b3",
      title: "WhatsApp Automation: The Ultimate Guide",
      slug: "whatsapp-automation-guide",
      cover: "/images/blogs/ai-human-hero.jpg",
      category: "Automation",
      date: new Date().toISOString(),
      readTime: "7 min read",
      summary: "Stop losing leads. Learn how to set up autonomous WhatsApp bots that qualify prospects 24/7 without manual work.",
      link: "/blogs/whatsapp-automation-guide"
    }
  ];

  const fallbackCaseStudies: ResourceItem[] = [
    {
      id: "c1",
      title: "Apex Lead Automator",
      slug: "apex-lead-automator",
      cover: "/images/blogs/ai-human-hero.jpg",
      category: "Lead Generation",
      date: new Date().toISOString(),
      readTime: "Case Study",
      summary: "A custom outbound automated system generating over 50k monthly leads with OpenAI routing and web scraping.",
      link: "/portfolio/apex-lead-automator"
    },
    {
      id: "c2",
      title: "Vortex Agent Support Node",
      slug: "vortex-agent-support-node",
      cover: "/images/blogs/ai-human-hero.jpg",
      category: "AI Agents",
      date: new Date().toISOString(),
      readTime: "Case Study",
      summary: "An agentic helpdesk solution that queries secure databases using vector index lookups to reduce response time.",
      link: "/portfolio/vortex-agent-support-node"
    },
    {
      id: "c3",
      title: "Scribe SEO Automation Hub",
      slug: "scribe-seo-automation-hub",
      cover: "/images/blogs/ai-human-hero.jpg",
      category: "SEO System",
      date: new Date().toISOString(),
      readTime: "Case Study",
      summary: "An automated markdown article writing pipeline feeding into headless CMS hubs for scale SEO growth.",
      link: "/portfolio/scribe-seo-automation-hub"
    }
  ];

  const fallbackResearch: ResourceItem[] = [
    {
      id: "r1",
      title: "State of Web Scraping in India (2026 Report)",
      slug: "web-scraping-india-2026",
      cover: "/images/blogs/ai-human-hero.jpg",
      category: "Data Extraction",
      date: new Date().toISOString(),
      readTime: "12 min read",
      summary: "An in-depth analysis of public directory structures, scraping methodologies, and data accuracy across Indian businesses.",
      link: "/blogs/web-scraping-india-2026"
    },
    {
      id: "r2",
      title: "IT Outsourcing Trends for Enterprise",
      slug: "it-outsourcing-trends",
      cover: "/images/blogs/ai-human-hero.jpg",
      category: "IT Consulting",
      date: new Date().toISOString(),
      readTime: "10 min read",
      summary: "Why companies are moving away from massive agencies and choosing dedicated IT solutions providers for focused execution.",
      link: "/blogs/it-outsourcing-trends"
    },
    {
      id: "r3",
      title: "Impact of Sub-Second Load Times on Conversions",
      slug: "speed-conversion-impact",
      cover: "/images/blogs/ai-human-hero.jpg",
      category: "Performance",
      date: new Date().toISOString(),
      readTime: "8 min read",
      summary: "Our internal study across 50+ Next.js applications showing direct correlation between load speed and inbound leads.",
      link: "/blogs/speed-conversion-impact"
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Blogs
        const blogsRes = await fetch(`${API_URL}/api/v1/blogs/`);
        let fetchedBlogs: any[] = [];
        let fetchedResearch: any[] = [];

        if (blogsRes.ok) {
          const data = await blogsRes.json();
          const active = data.filter((b: any) => b.published).reverse();
          
          const researchItems = active.filter((b: any) => b.category?.toUpperCase().includes("RESEARCH"));
          const blogItems = active.filter((b: any) => !b.category?.toUpperCase().includes("RESEARCH"));

          fetchedBlogs = blogItems.slice(0, 3).map((b: any) => ({
            id: b.id || b.slug,
            title: b.title,
            slug: b.slug,
            cover: b.cover_image || b.image || "/images/blogs/ai-human-hero.jpg",
            category: b.category || "ENGINEERING",
            date: b.created_at || new Date().toISOString(),
            readTime: b.readTime || "5 min read",
            summary: b.summary || b.title,
            link: `/blogs/${b.slug}`
          }));

          fetchedResearch = researchItems.slice(0, 3).map((b: any) => ({
            id: b.id || b.slug,
            title: b.title,
            slug: b.slug,
            cover: b.cover_image || b.image || "/images/blogs/ai-human-hero.jpg",
            category: b.category || "RESEARCH REPORT",
            date: b.created_at || new Date().toISOString(),
            readTime: b.readTime || "10 min read",
            summary: b.summary || b.title,
            link: `/blogs/${b.slug}`
          }));
        }

        // Fetch Portfolio
        const portRes = await fetch(`${API_URL}/api/v1/public/portfolio`);
        let fetchedCaseStudies: any[] = [];
        if (portRes.ok) {
          const data = await portRes.json();
          fetchedCaseStudies = data.slice(0, 3).map((p: any) => ({
            id: p.id || p.slug,
            title: p.title,
            slug: p.slug,
            cover: p.image?.includes("from-") ? "/images/blogs/ai-human-hero.jpg" : (p.image || "/images/blogs/ai-human-hero.jpg"),
            category: p.services_used?.[0] || "Case Study",
            date: p.year?.toString() || new Date().toISOString(),
            readTime: "Case Study",
            summary: p.description,
            link: `/portfolio/${p.slug}`
          }));
        }

        setBlogs(fetchedBlogs.length > 0 ? fetchedBlogs : fallbackBlogs);
        setCaseStudies(fetchedCaseStudies.length > 0 ? fetchedCaseStudies : fallbackCaseStudies);
        setResearch(fetchedResearch.length > 0 ? fetchedResearch : fallbackResearch);

      } catch (err) {
        console.error("Failed to fetch resources:", err);
        setBlogs(fallbackBlogs);
        setCaseStudies(fallbackCaseStudies);
        setResearch(fallbackResearch);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getActiveData = () => {
    switch (activeTab) {
      case "blogs": return blogs;
      case "case_studies": return caseStudies;
      case "research": return research;
      default: return blogs;
    }
  };

  const getTabLabel = (tab: string) => {
    switch(tab) {
      case "blogs": return "Latest Blogs";
      case "case_studies": return "Case Studies";
      case "research": return "Research Reports";
      default: return "";
    }
  };

  return (
    <section className="py-20 sm:py-28 bg-background relative overflow-hidden border-t border-border-custom">
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 border border-border-custom bg-surface px-3 py-1 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-foreground">
              Insights & Knowledge
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
            <SplitText text="Latest Resources & Reports" type="words" />
          </h2>
          <p className="text-sm md:text-base text-secondary-custom leading-relaxed max-w-2xl">
            Explore our most recent technical blogs, in-depth client case studies, and proprietary research reports on IT outsourcing and modern engineering.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex flex-wrap justify-center items-center p-1 border border-border-custom bg-surface rounded-full">
            {(["blogs", "case_studies", "research"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 text-xs font-mono font-semibold uppercase tracking-wider rounded-full transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-foreground text-background shadow-md"
                    : "text-secondary-custom hover:text-foreground"
                }`}
              >
                {getTabLabel(tab)}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Skeletons
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="border border-border-custom bg-surface rounded-[3px] overflow-hidden flex flex-col h-[380px] animate-pulse">
                <div className="aspect-[16/10] bg-secondary-custom/10 border-b border-border-custom" />
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-20 h-3 bg-secondary-custom/20 rounded-[2px]" />
                    <div className="w-full h-5 bg-secondary-custom/20 rounded-[2px]" />
                    <div className="w-full h-3 bg-secondary-custom/20 rounded-[2px]" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            getActiveData().map((item) => (
              <Link
                href={item.link}
                key={item.id}
                className="group flex flex-col rounded-[3px] bg-surface border border-border-custom overflow-hidden hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300 h-[380px]"
              >
                {/* Thumbnail Container */}
                <div className="aspect-[16/10] overflow-hidden bg-background relative border-b border-border-custom flex items-center justify-center">
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/blogs/ai-human-hero.jpg";
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-bold uppercase bg-surface/90 text-emerald-500 border border-border-custom backdrop-blur-md">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-[10px] font-mono text-secondary-custom">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-emerald-500" />
                        {activeTab === "case_studies" ? item.date : formatISTDate(item.date)}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-500" />
                        {item.readTime}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-foreground group-hover:text-emerald-500 transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-[13px] text-secondary-custom line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border-custom/30 flex items-center justify-between text-[11px] font-mono font-bold text-secondary-custom group-hover:text-foreground transition-colors">
                    <span className="uppercase tracking-widest">
                      Read {activeTab === "case_studies" ? "Case Study" : "Full Report"}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
        
        {/* View All Button */}
        <div className="mt-12 flex justify-center">
          <Link
            href={activeTab === "case_studies" ? "/portfolio" : "/blogs"}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-border-custom bg-surface hover:bg-surface/80 text-foreground text-xs font-mono uppercase tracking-wider font-semibold transition duration-200 group shadow-xs cursor-pointer"
          >
            <span>View All {getTabLabel(activeTab)}</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
}
