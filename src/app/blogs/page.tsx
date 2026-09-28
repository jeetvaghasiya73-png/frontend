"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { API_URL } from "@/lib/config";
import Navbar from "@/components/layout/Navbar";
import FooterSection from "@/components/layout/FooterSection";
import SplitText from "@/components/animations/SplitText";
import { ArrowRight, Search, Clock, Calendar } from "lucide-react";
import { formatISTDate } from "@/lib/formatters";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const fallbackBlogs = [
    {
      id: 3,
      title: "Will AI Replace Humans? The Truth Behind Autonomous Agents & the Future of Work",
      summary: "Will artificial intelligence render human workers obsolete? Explore the realistic frontier between automated task execution and irreplaceable human intuition, creativity, and strategic judgment in the era of autonomous agent swarms.",
      author: "Tech Infinix Research Team",
      category: "TECH & AI FUTURE",
      image: "/images/blogs/ai-human-hero.jpg",
      cover_image: "/images/blogs/ai-human-hero.jpg",
      readTime: "5 min read",
      created_at: new Date().toISOString(),
      slug: "will-ai-replace-humans",
      published: true
    },
    {
      id: 1,
      title: "Scaling Outbound Lead Pipelines with LangGraph Agents",
      summary: "Explore how we design autonomous agents that coordinate tasks, validate lead profiles, and reduce duplicate entry latency.",
      author: "Tech Infinix Team",
      category: "AI AGENTS",
      image: "/images/blogs/lead-pipeline-thumb.jpg",
      cover_image: "/images/blogs/lead-pipeline-thumb.jpg",
      readTime: "4 min read",
      created_at: new Date().toISOString(),
      slug: "scaling-outbound-lead-pipelines",
      published: true
    },
    {
      id: 4,
      title: "Enterprise SEO: Dominating Organic Google Search",
      summary: "Automating authority signals, technical indexing, and keyword dominance for fast-growing enterprises.",
      author: "SEO Engineering",
      category: "SEO",
      image: "/images/blogs/seo-maps-thumb.jpg",
      cover_image: "/images/blogs/seo-maps-thumb.jpg",
      readTime: "5 min read",
      created_at: new Date().toISOString(),
      slug: "google-maps-3pack-seo",
      published: true
    },
    {
      id: 2,
      title: "The Shift to Edge-Computing Databases for AI Workflows",
      summary: "Analyzing performance benchmarks of distributed databases like SQLite and Pinecone for RAG retrieval latency.",
      author: "Engineering Lead",
      category: "ARCHITECTURE",
      image: "/images/blogs/centaur-ai-worker.jpg",
      cover_image: "/images/blogs/centaur-ai-worker.jpg",
      readTime: "6 min read",
      created_at: new Date().toISOString(),
      slug: "shift-to-edge-computing-databases",
      published: true
    }
  ];

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/blogs/`);
        if (response.ok) {
          const data = await response.json();
          const active = data.filter((b: any) => b.published);
          if (active.length > 0) {
            setBlogs(active);
          } else {
            setBlogs(fallbackBlogs);
          }
        } else {
          setBlogs(fallbackBlogs);
        }
      } catch (err) {
        console.error("Fetch failed, loading fallback blogs", err);
        setBlogs(fallbackBlogs);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const categories = ["ALL", "TECH & AI FUTURE", "AI AGENTS", "SEO", "ARCHITECTURE"];

  const filtered = blogs.filter((b) => {
    const matchesQuery =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "ALL" ||
      (b.category && b.category.toUpperCase() === selectedCategory);
    return matchesQuery && matchesCategory;
  });

  return (
    <div className={`${poppins.className} font-sans min-h-screen bg-background text-foreground antialiased`}>
      <Navbar />
      <main className="flex-1 bg-background pt-32 pb-24 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          
          {/* Header */}
          <section className="relative mb-12">
            <span className="text-[11px] font-mono font-bold tracking-widest text-accent-custom uppercase block mb-3">
              Engineering Insights &amp; Blueprints
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-4">
              <SplitText text="The Tech Infinix Ledger" type="words" />
            </h1>
            <p className="text-sm sm:text-base text-secondary-custom max-w-2xl leading-relaxed">
              Technical findings, engineering breakthroughs, and automation blueprints
              developed by the Tech Infinix engineering and research laboratories.
            </p>
          </section>

          {/* Controls: Search + Category Filters (Strict 2-3px border radius) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-border-custom">
            
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-[2px] transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-accent-custom text-white shadow-sm shadow-accent-custom/20"
                      : "bg-surface border border-border-custom text-secondary-custom hover:text-foreground hover:border-accent-custom/40"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-72 flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-secondary-custom" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-border-custom rounded-[2px] pl-10 pr-3.5 py-2 text-xs text-foreground placeholder:text-secondary-custom focus:outline-none focus:border-accent-custom transition-colors"
              />
            </div>

          </div>

          {/* Grid List */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="border border-border-custom bg-surface rounded-[3px] overflow-hidden flex flex-col justify-between h-[380px]"
                >
                  <div className="aspect-[16/10] bg-background/50 animate-pulse border-b border-border-custom" />
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="w-20 h-3 bg-secondary-custom/20 rounded-[2px] animate-pulse" />
                      <div className="w-4/5 h-5 bg-secondary-custom/20 rounded-[2px] animate-pulse" />
                      <div className="w-full h-3 bg-secondary-custom/20 rounded-[2px] animate-pulse" />
                      <div className="w-3/4 h-3 bg-secondary-custom/20 rounded-[2px] animate-pulse" />
                    </div>
                    <div className="pt-3 border-t border-border-custom/30 flex justify-between">
                      <div className="w-24 h-3 bg-secondary-custom/20 rounded-[2px] animate-pulse" />
                      <div className="w-12 h-3 bg-secondary-custom/20 rounded-[2px] animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.length === 0 ? (
                <div className="col-span-full text-center py-16 border border-dashed border-border-custom rounded-[3px] bg-surface/30">
                  <p className="text-sm font-mono text-secondary-custom mb-2">
                    No articles matched your parameters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("ALL");
                    }}
                    className="text-xs font-mono font-bold text-accent-custom hover:underline"
                  >
                    Clear search filters
                  </button>
                </div>
              ) : (
                filtered.map((blog) => {
                  const cover =
                    blog.cover_image ||
                    blog.image ||
                    "/images/blogs/ai-human-hero.jpg";

                  return (
                    <Link
                      href={`/blogs/${blog.slug}`}
                      key={blog.id || blog.slug}
                      className="group flex flex-col rounded-[3px] bg-surface border border-border-custom overflow-hidden hover:border-accent-custom/60 hover:shadow-lg transition-all duration-300"
                    >
                      {/* Thumbnail Container */}
                      <div className="aspect-[16/10] overflow-hidden bg-background relative border-b border-border-custom">
                        <img
                          src={cover}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-bold uppercase bg-surface/90 text-accent-custom border border-border-custom backdrop-blur-md">
                            {blog.category || "ENGINEERING"}
                          </span>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 text-[10px] font-mono text-secondary-custom">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-accent-custom" />
                              {formatISTDate(blog.created_at)}
                            </span>
                            <span>&bull;</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-accent-custom" />
                              {blog.readTime || "5 min read"}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-foreground group-hover:text-accent-custom transition-colors line-clamp-2 leading-snug">
                            {blog.title}
                          </h3>

                          <p className="text-xs text-secondary-custom line-clamp-3 leading-relaxed">
                            {blog.summary}
                          </p>
                        </div>

                        {/* Card Footer */}
                        <div className="pt-3 border-t border-border-custom/40 flex items-center justify-between text-xs font-semibold text-accent-custom">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-secondary-custom">
                            By {blog.author || "Tech Infinix"}
                          </span>
                          <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            <span>Read Article</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          )}

        </div>
      </main>
      <FooterSection />
    </div>
  );
}
