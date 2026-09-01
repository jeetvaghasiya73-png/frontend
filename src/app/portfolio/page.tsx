"use client";

import React, { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import Navbar from "@/components/layout/Navbar";
import FooterSection from "@/components/layout/FooterSection";
import SplitText from "@/components/animations/SplitText";
import { ArrowRight, Loader2, Star } from "lucide-react";

export default function PortfolioPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const fallbackProjects = [
    {
      id: 1,
      title: "Apex Lead Automator",
      client: "Apex Growth",
      description: "A custom outbound automated system generating over 50k monthly leads with OpenAI routing and custom scraping triggers.",
      image: "from-blue-600/30 to-purple-800/30",
      services_used: ["AI Automation", "OpenAI APIs", "Lead Generation"],
      year: 2025,
      slug: "apex-lead-automator",
      featured: true
    },
    {
      id: 2,
      title: "Vortex Agent Support Node",
      client: "Vortex Analytics",
      description: "An agentic helpdesk solution that queries secure databases using vector index lookups and coordinates appointments.",
      image: "from-purple-900/30 to-indigo-950/30",
      services_used: ["AI Agents", "LangGraph", "Vector Indexing"],
      year: 2026,
      slug: "vortex-agent-support-node",
      featured: true
    },
    {
      id: 3,
      title: "Scribe SEO Automation Hub",
      client: "Scribe Platforms",
      description: "An automated markdown article writing pipeline feeding into headless CMS hubs for scale SEO growth.",
      image: "from-cyan-900/30 to-blue-950/30",
      services_used: ["AI Automation", "Programmatic SEO", "SaaS Development"],
      year: 2025,
      slug: "scribe-seo-automation-hub",
      featured: false
    }
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/public/portfolio`);
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setProjects(data);
          } else {
            setProjects(fallbackProjects);
          }
        } else {
          setProjects(fallbackProjects);
        }
      } catch (err) {
        console.error("API fetch failed, falling back to mock projects", err);
        setProjects(fallbackProjects);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getFilteredProjects = () => {
    if (filter === "All") return projects;
    return projects.filter(p =>
      p.services_used?.some((s: string) => s.toLowerCase().includes(filter.toLowerCase()))
    );
  };

  const filtered = getFilteredProjects();

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background pt-32 pb-24 text-left">
        {/* Header */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 w-full relative mb-12">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-accent-glow blur-[100px] pointer-events-none opacity-20 mix-blend-screen scale-75" />
          
          <span className="text-[10px] font-mono font-bold tracking-widest text-accent-custom uppercase block mb-4">
            Our Work
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            <SplitText text="Case Studies & Deployments" type="words" />
          </h1>
          <p className="text-sm md:text-base text-secondary-custom max-w-xl leading-relaxed">
            Discover how we construct high-performance AI engines, database structures,
            and automations that transform enterprise workflow limits.
          </p>
        </section>

        {/* Filters */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 w-full mb-12 flex flex-wrap gap-2.5">
          {["All", "AI Automation", "AI Agents", "SaaS"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                filter === cat
                  ? "border-accent-custom bg-accent-custom/5 text-white"
                  : "border-border-custom bg-surface/50 text-[#B0B0B0] hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </section>

        {/* Grid List */}
        {loading ? (
          <div className="min-h-[30vh] flex items-center justify-center flex-col gap-3">
            <Loader2 className="w-8 h-8 text-accent-custom animate-spin" />
            <span className="font-mono text-xs text-[#B0B0B0]">Loading gallery...</span>
          </div>
        ) : (
          <section className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 md:grid-cols-2 gap-8">
            {filtered.map((proj) => (
              <a
                href={`/portfolio/${proj.slug}`}
                key={proj.id}
                className="border border-border-custom bg-surface/30 backdrop-blur-md rounded-2xl overflow-hidden group hover:border-accent-custom/50 hover:shadow-[0_0_20px_var(--accent-glow)] transition-all duration-500 text-left flex flex-col justify-between"
              >
                {/* Visual Cover Gradient */}
                <div className={`h-[240px] bg-gradient-to-tr ${proj.image} relative flex items-center justify-center`}>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                    <span className="bg-white text-black font-bold uppercase tracking-wider text-[10px] px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
                      View Case Study
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  
                  {/* Floating Client Badge */}
                  <span className="absolute top-4 left-4 text-[9px] font-mono font-bold tracking-widest bg-black/50 border border-white/10 px-2.5 py-1 rounded text-white backdrop-blur-md">
                    {proj.client}
                  </span>

                  {proj.featured && (
                    <span className="absolute top-4 right-4 text-[9px] font-mono font-bold tracking-widest bg-accent-custom/10 border border-accent-custom/20 text-accent-custom px-2.5 py-1 rounded backdrop-blur-md flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      Featured
                    </span>
                  )}
                </div>

                {/* Info Text */}
                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="text-[10px] font-mono text-secondary-custom">
                      Year: {proj.year}
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-accent-custom transition-colors duration-300">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-[#B0B0B0] leading-relaxed">
                      {proj.description}
                    </p>
                  </div>

                  {/* Services tags */}
                  <div className="flex flex-wrap gap-1 mt-4 pt-4 border-t border-border-custom/50">
                    {proj.services_used?.map((s: string, sIdx: number) => (
                      <span key={sIdx} className="text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded text-[#B0B0B0]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </a>
            ))}
          </section>
        )}
      </main>
      <FooterSection />
    </>
  );
}
