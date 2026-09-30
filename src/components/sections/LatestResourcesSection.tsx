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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Blogs
        const blogsRes = await fetch(`${API_URL}/api/v1/blogs/`);
        let fetchedBlogs: any[] = [];
        let fetchedResearch: any[] = [];

        if (blogsRes.ok) {
          const data = await blogsRes.json();
          const active = Array.isArray(data) ? data.filter((b: any) => b.published).reverse() : [];
          
          const researchItems = active.filter((b: any) => b.category?.toUpperCase().includes("RESEARCH"));
          const blogItems = active.filter((b: any) => !b.category?.toUpperCase().includes("RESEARCH"));

          fetchedBlogs = blogItems.slice(0, 6).map((b: any) => ({
            id: String(b.id || b.slug),
            title: b.title,
            slug: b.slug,
            cover: b.cover_image || b.image || "/images/blogs/ai-human-hero.jpg",
            category: b.category || "ENGINEERING",
            date: b.created_at || new Date().toISOString(),
            readTime: b.readTime || "5 min read",
            summary: b.summary || b.title,
            link: `/blogs/${b.slug}`
          }));

          fetchedResearch = researchItems.slice(0, 6).map((b: any) => ({
            id: String(b.id || b.slug),
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
          if (Array.isArray(data)) {
            fetchedCaseStudies = data.slice(0, 6).map((p: any) => ({
              id: String(p.id || p.slug),
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
        }

        setBlogs(fetchedBlogs);
        setCaseStudies(fetchedCaseStudies);
        setResearch(fetchedResearch);

      } catch (err) {
        console.error("Failed to fetch resources:", err);
        setBlogs([]);
        setCaseStudies([]);
        setResearch([]);
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
    <section className="py-16 sm:py-24 md:py-28 bg-background relative overflow-hidden border-t border-border-custom">
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8 sm:mb-14">
          <div className="inline-flex items-center gap-2 border border-border-custom bg-surface px-3 py-1 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-foreground">
              Insights & Knowledge
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-3 text-foreground">
            <SplitText text="Latest Resources & Reports" type="words" />
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-secondary-custom leading-relaxed max-w-2xl px-2">
            Explore our most recent technical blogs, in-depth client case studies, and proprietary research reports on IT outsourcing and modern engineering.
          </p>
        </div>

        {/* Responsive Category Tabs */}
        <div className="flex justify-start sm:justify-center mb-8 overflow-x-auto no-scrollbar w-full px-1">
          <div className="inline-flex items-center gap-1.5 p-1 border border-border-custom bg-surface rounded-full shrink-0 mx-auto max-w-full">
            {(["blogs", "case_studies", "research"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-mono font-semibold uppercase tracking-wider rounded-full transition-all duration-300 shrink-0 whitespace-nowrap cursor-pointer ${
                  activeTab === tab
                    ? "bg-foreground text-background shadow-md font-bold"
                    : "text-secondary-custom hover:text-foreground"
                }`}
              >
                {getTabLabel(tab)}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Cards: Horizontal Snap Scroll on Mobile, Grid on Tablet/Desktop */}
        <div className="flex overflow-x-auto pb-4 gap-4 sm:gap-6 snap-x snap-mandatory no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible md:pb-0">
          {loading ? (
            // Skeletons
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="border border-border-custom bg-surface rounded-[3px] overflow-hidden flex flex-col h-[380px] animate-pulse w-[84vw] max-w-[340px] shrink-0 snap-center md:w-auto md:max-w-none md:shrink">
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
          ) : getActiveData().length === 0 ? (
            <div className="w-full col-span-3 text-center py-16 border border-dashed border-border-custom rounded-[3px] bg-surface/30 px-4">
              <p className="text-xs sm:text-sm font-mono text-secondary-custom">
                No published {getTabLabel(activeTab).toLowerCase()} available at the moment.
              </p>
            </div>
          ) : (
            getActiveData().map((item) => (
              <Link
                href={item.link}
                key={item.id}
                className="group flex flex-col rounded-[3px] bg-surface border border-border-custom overflow-hidden hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300 h-[380px] w-[84vw] max-w-[340px] shrink-0 snap-center md:w-auto md:max-w-none md:shrink"
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
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
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

                    <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-emerald-500 transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-[12px] sm:text-[13px] text-secondary-custom line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border-custom/30 flex items-center justify-between text-[11px] font-mono font-bold text-secondary-custom group-hover:text-foreground transition-colors">
                    <span className="uppercase tracking-widest">
                      Read {activeTab === "case_studies" ? "Case Study" : "Full Article"}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
        
        {/* View All Button */}
        {getActiveData().length > 0 && (
          <div className="mt-8 sm:mt-12 flex justify-center">
            <Link
              href={activeTab === "case_studies" ? "/portfolio" : "/blogs"}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 rounded-full border border-border-custom bg-surface hover:bg-surface/80 text-foreground text-xs font-mono uppercase tracking-wider font-semibold transition duration-200 group shadow-xs cursor-pointer"
            >
              <span>View All {getTabLabel(activeTab)}</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}
