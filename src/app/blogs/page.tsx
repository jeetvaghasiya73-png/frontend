"use client";

import React, { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import Navbar from "@/components/layout/Navbar";
import FooterSection from "@/components/layout/FooterSection";
import SplitText from "@/components/animations/SplitText";
import { ArrowRight, Search, Loader2 } from "lucide-react";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fallbackBlogs = [
    {
      id: 1,
      title: "Scaling Outbound Lead Pipelines with LangGraph Agents",
      summary: "Explore how we design autonomous agents that coordinate tasks, validate lead profiles, and reduce duplicate entry latency.",
      author: "Nexora Team",
      created_at: new Date().toISOString(),
      slug: "scaling-outbound-lead-pipelines",
      published: true
    },
    {
      id: 2,
      title: "The Shift to Edge-Computing Databases for AI Workflows",
      summary: "Analyzing performance benchmarks of distributed databases like SQLite and Pinecone for RAG retrieval latency.",
      author: "Engineering Lead",
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
          // Filter published blogs
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

  const filtered = blogs.filter(b =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background pt-32 pb-24 text-left">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          
          {/* Header */}
          <section className="relative mb-16">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-accent-glow blur-[100px] pointer-events-none opacity-20" />
            
            <span className="text-[10px] font-mono font-bold tracking-widest text-accent-custom uppercase block mb-4">
              Our Insights
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
              <SplitText text="The Nexora Ledger" type="words" />
            </h1>
            <p className="text-sm md:text-base text-secondary-custom max-w-xl leading-relaxed">
              Technical findings, engineering breakthroughs, and operations blueprints
              developed by the Nexora automation laboratory.
            </p>
          </section>

          {/* Search bar */}
          <div className="max-w-md relative mb-12 flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-[#666666]" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface/50 border border-border-custom rounded-xl pl-11 pr-4 py-3 text-xs text-white focus:outline-none focus:border-accent-custom transition-all"
            />
          </div>

          {/* Grid List */}
          {loading ? (
            <div className="min-h-[30vh] flex items-center justify-center flex-col gap-3">
              <Loader2 className="w-8 h-8 text-accent-custom animate-spin" />
              <span className="font-mono text-xs text-[#B0B0B0]">Loading articles...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filtered.length === 0 ? (
                <div className="col-span-2 text-center text-xs font-mono text-[#666666] py-12">
                  No articles matched your parameters.
                </div>
              ) : (
                filtered.map((blog) => (
                  <a
                    href={`/blogs/${blog.slug}`}
                    key={blog.id}
                    className="border border-border-custom bg-surface/30 backdrop-blur-md rounded-2xl p-6 hover:border-accent-custom/50 hover:shadow-[0_0_20px_var(--accent-glow)] transition-all duration-500 text-left flex flex-col justify-between h-[220px]"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-[10px] font-mono text-secondary-custom">
                        <span>By {blog.author}</span>
                        <span>&bull;</span>
                        <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-accent-custom line-clamp-2">
                        {blog.title}
                      </h3>
                      <p className="text-xs text-[#B0B0B0] line-clamp-2 leading-relaxed font-medium">
                        {blog.summary}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-accent-custom mt-4 pt-4 border-t border-border-custom/30">
                      <span className="uppercase tracking-wider font-mono text-[10px]">
                        Read Full Article
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </a>
                ))
              )}
            </div>
          )}

        </div>
      </main>
      <FooterSection />
    </>
  );
}
