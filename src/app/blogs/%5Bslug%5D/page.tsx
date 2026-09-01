"use client";

import React, { use, useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import Navbar from "@/components/layout/Navbar";
import FooterSection from "@/components/layout/FooterSection";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fallbackBlogs: Record<string, any> = {
    "scaling-outbound-lead-pipelines": {
      title: "Scaling Outbound Lead Pipelines with LangGraph Agents",
      summary: "Explore how we design autonomous agents that coordinate tasks, validate lead profiles, and reduce duplicate entry latency.",
      content: `## Introduction
In modern outbound operations, sales teams spent significant hours clean-filtering, deduplicating, and uploading lists into CRM structures. This manual delay impacts lead response times. By architecting agentic networks, we can delegate tasks to autonomous LLM workers.

## The Agentic Core (LangGraph)
Using LangGraph, we define stateful multi-agent workflows. The coordination is split into distinct nodes:
- **Scraper Node**: Retrieves outbound profiles dynamically.
- **De-duplication Node**: Checks database records to ensure no repeats exist.
- **Validation Node**: Employs GPT-4o models to verify email configurations.
- **CRM Sync Node**: Calls API hooks to sync clean data to Salesforce.

## Results & Optimization
By shifting from manual processing loops to autonomous agent pipelines, we reduce ticket latency from hours to seconds and ensure 100% data compliance.`,
      author: "Nexora Team",
      created_at: new Date().toISOString()
    },
    "shift-to-edge-computing-databases": {
      title: "The Shift to Edge-Computing Databases for AI Workflows",
      summary: "Analyzing performance benchmarks of distributed databases like SQLite and Pinecone for RAG retrieval latency.",
      content: `## The Architecture
AI applications require low-latency indexing channels to query document databases (vector databases) dynamically. Performing heavy cloud database lookups introduces network latency.

## Edge SQLite & Pinecone
Deploying edge SQLite instances alongside regional vector nodes like Pinecone minimizes geographical latency. Our benchmarks show:
- Document lookup latency decreased by 40%.
- Vector retrieval times stabilized at 12ms.
- Local SQLite caching cut API cost parameters by 30%.

## Best Practices
We recommend setting up database caches close to the uvicorn API nodes to avoid cold starts and connection drops during operations spikes.`,
      author: "Engineering Lead",
      created_at: new Date().toISOString()
    }
  };

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/blogs/`);
        if (response.ok) {
          const data = await response.json();
          const found = data.find((b: any) => b.slug === slug);
          if (found) {
            setBlog(found);
          } else {
            setBlog(fallbackBlogs[slug] || fallbackBlogs["scaling-outbound-lead-pipelines"]);
          }
        } else {
          setBlog(fallbackBlogs[slug] || fallbackBlogs["scaling-outbound-lead-pipelines"]);
        }
      } catch (err) {
        console.error("Fetch failed, using fallback blog details", err);
        setBlog(fallbackBlogs[slug] || fallbackBlogs["scaling-outbound-lead-pipelines"]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  // A lightweight parser translating headers, bullet lists, and paragraphs
  const renderParsedContent = (text: string) => {
    if (!text) return null;
    const blocks = text.split("\n\n");
    return blocks.map((block, idx) => {
      const trimmed = block.trim();
      if (trimmed.startsWith("##")) {
        return (
          <h3 key={idx} className="text-xl font-bold text-white mt-8 mb-4">
            {trimmed.replace(/^##\s*/, "")}
          </h3>
        );
      } else if (trimmed.startsWith("#")) {
        return (
          <h2 key={idx} className="text-2xl font-bold text-white mt-10 mb-6 border-b border-border-custom pb-2">
            {trimmed.replace(/^#\s*/, "")}
          </h2>
        );
      } else if (trimmed.startsWith("-")) {
        const items = trimmed.split("\n").map(li => li.replace(/^-\s*/, ""));
        return (
          <ul key={idx} className="list-disc list-inside space-y-2.5 my-4 pl-4 text-xs md:text-sm text-secondary-custom font-medium">
            {items.map((item, liIdx) => (
              <li key={liIdx}>{item}</li>
            ))}
          </ul>
        );
      } else {
        return (
          <p key={idx} className="text-xs md:text-sm text-secondary-custom leading-relaxed my-4 font-medium">
            {trimmed}
          </p>
        );
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center flex-col gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-accent-custom border-t-transparent animate-spin" />
        <span className="font-mono text-xs text-[#B0B0B0]">Loading article...</span>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background pt-32 pb-24 text-left">
        <div className="max-w-4xl mx-auto px-6 md:px-12 w-full">
          
          {/* Back button */}
          <a
            href="/blogs"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-secondary-custom hover:text-accent-custom transition-colors mb-12"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Articles
          </a>

          {/* Article Header */}
          <article className="space-y-6">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              {blog.title}
            </h1>

            {/* Meta bar */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-secondary-custom border-y border-border-custom/50 py-4 font-mono">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-accent-custom" />
                <span>By {blog.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent-custom" />
                <span>Published: {new Date(blog.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent-custom" />
                <span>Read time: 4 min read</span>
              </div>
            </div>

            {/* Summary */}
            <p className="text-sm md:text-base italic text-secondary-custom/90 leading-relaxed font-medium pt-4">
              "{blog.summary}"
            </p>

            {/* Main parsed content */}
            <div className="pt-6 prose prose-invert max-w-none">
              {renderParsedContent(blog.content)}
            </div>

          </article>
        </div>
      </main>
      <FooterSection />
    </>
  );
}
