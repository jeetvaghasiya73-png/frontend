"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Poppins } from "next/font/google";
import { API_URL } from "@/lib/config";
import Navbar from "@/components/layout/Navbar";
import FooterSection from "@/components/layout/FooterSection";
import ContactSection from "@/components/sections/ContactSection";
import NotFound from "@/app/not-found";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Check,
  MessageCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Bookmark,
  ChevronDown,
  AlertCircle
} from "lucide-react";
import { formatISTDate } from "@/lib/formatters";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // Dynamic TOC Extraction and Heading ID Processing
  const { processedContent, dynamicToc } = React.useMemo(() => {
    if (!blog?.content) return { processedContent: "", dynamicToc: [] };

    const contentStr = String(blog.content).replace(/<!--[\s\S]*?-->/g, "").trim();
    const extracted: { id: string; label: string; level: number }[] = [];
    let headingCounter = 0;

    // Replace <h2> and <h3> with IDs if missing, and collect TOC items
    const modifiedContent = contentStr.replace(
      /<(h[23])(\s+[^>]*)?>(.*?)<\/\1>/gi,
      (match: string, tag: string, attrs: string = "", innerText: string) => {
        headingCounter++;
        const plainText = innerText.replace(/<[^>]+>/g, "").trim();
        if (!plainText) return match;

        // Extract or generate slug ID
        const idMatch = attrs.match(/id=["']([^"']+)["']/i);
        let id = idMatch ? idMatch[1] : "";
        if (!id) {
          id = plainText
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .trim() || `section-${headingCounter}`;
          attrs = `${attrs} id="${id}"`;
        }

        extracted.push({
          id,
          label: plainText,
          level: tag.toLowerCase() === "h2" ? 2 : 3
        });

        return `<${tag}${attrs}>${innerText}</${tag}>`;
      }
    );

    return {
      processedContent: modifiedContent,
      dynamicToc: extracted
    };
  }, [blog?.content]);

  const relatedArticles = [
    {
      slug: "scaling-outbound-lead-pipelines",
      title: "Scaling Outbound Lead Pipelines with LangGraph Agents",
      summary: "How autonomous multi-agent swarms coordinate data cleaning, validation, and zero-latency CRM uploads.",
      tag: "AGENTS",
      tagColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      image: "/images/blogs/lead-pipeline-thumb.jpg",
      readTime: "4 min read",
      date: new Date().toISOString()
    },
    {
      slug: "google-maps-3pack-seo",
      title: "Enterprise SEO: Dominating Organic Google Search",
      summary: "Automating authority signals, technical indexing, and keyword dominance for fast-growing enterprises.",
      tag: "SEO",
      tagColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      image: "/images/blogs/seo-maps-thumb.jpg",
      readTime: "5 min read",
      date: new Date().toISOString()
    },
    {
      slug: "shift-to-edge-computing-databases",
      title: "The Shift to Edge-Computing Databases for AI Workflows",
      summary: "Performance benchmarks of distributed edge SQLite and vector stores for sub-15ms AI query response times.",
      tag: "ARCHITECTURE",
      tagColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      image: "/images/blogs/centaur-ai-worker.jpg",
      readTime: "6 min read",
      date: new Date().toISOString()
    },
    {
      slug: "whatsapp-crm-bots",
      title: "Building 24/7 Autonomous WhatsApp AI Bots with Evolution API",
      summary: "Deploying high-reliability stateful WhatsApp conversational engines that qualify inbound leads in real-time.",
      tag: "AUTOMATION",
      tagColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      image: "/images/blogs/ai-human-hero.jpg",
      readTime: "5 min read",
      date: new Date().toISOString()
    }
  ];


  useEffect(() => {
    const fetchBlog = async () => {
      try {
        let response = await fetch(`${API_URL}/api/v1/blogs/${slug}`);
        if (!response.ok) {
          response = await fetch(`${API_URL}/api/v1/blogs/slug/${slug}`);
        }
        if (response.ok) {
          const data = await response.json();
          setBlog(data);
        } else {
          // Blog was deleted or does not exist in DB -> 404
          setNotFound(true);
        }
      } catch (err) {
        console.error("Fetch blog failed:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  // Guarantee user starts at top of article without auto-jumping to bottom form
  useEffect(() => {
    if (typeof window !== "undefined" && !window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [slug]);

  // Set initial active section when dynamic TOC loads
  useEffect(() => {
    if (dynamicToc.length > 0 && !activeSection) {
      setActiveSection(dynamicToc[0].id);
    }
  }, [dynamicToc]);

  // Scroll spy observer for reading progress and active TOC highlight
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setReadingProgress(Math.min(100, Math.max(0, progress)));
      }

      // Check section offsets for active TOC item
      if (dynamicToc.length > 0) {
        const scrollPos = window.scrollY + 240;
        for (let i = dynamicToc.length - 1; i >= 0; i--) {
          const el = document.getElementById(dynamicToc[i].id);
          if (el && el.offsetTop <= scrollPos) {
            setActiveSection(dynamicToc[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [dynamicToc]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const isHtml = (str: string) => {
    if (!str) return false;
    return /<[a-z][\s\S]*>/i.test(str);
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-background flex items-center justify-center flex-col gap-3 ${poppins.className}`}>
        <div className="w-8 h-8 rounded-[2px] border-2 border-accent-custom border-t-transparent animate-spin" />
        <span className="font-mono text-xs text-secondary-custom">Loading article...</span>
      </div>
    );
  }

  if (notFound) {
    return <NotFound />;
  }

  if (!blog) return null;

  const currentUrl = typeof window !== "undefined" ? window.location.href : `https://techinfinix.com/blogs/${slug}`;
  const shareTitle = encodeURIComponent(blog.title || "Will AI Replace Humans?");

  return (
    <div className={`${poppins.className} font-sans min-h-screen bg-background text-foreground antialiased`}>
      {/* Top Reading Progress Bar (Fixed at top of screen) */}
      <div
        className="fixed top-0 left-0 h-[3px] bg-accent-custom z-50 transition-all duration-150"
        style={{ width: `${readingProgress}%` }}
      />

      {blog.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: blog.custom_css }} />
      )}
      <Navbar />

      <main className="flex-1 bg-background pt-28 pb-20 text-left">
        {/* Top Breadcrumb / Category Header Banner */}
        <div className="border-b border-border-custom/60 bg-surface/40 backdrop-blur-sm py-4 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between flex-wrap gap-4 text-xs font-mono">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-1.5 text-secondary-custom hover:text-accent-custom font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Articles</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-[2px] bg-accent-custom/10 text-accent-custom text-[11px] font-semibold border border-accent-custom/20">
                {blog.category || "TECH & AI FUTURE"}
              </span>
              <span className="text-secondary-custom">•</span>
              <span className="text-secondary-custom">{blog.readTime || "5 min read"}</span>
            </div>
          </div>
        </div>

        {/* ═══════ ARTICLE TITLE & HERO METADATA (Full Spacious Width) ═══════ */}
        <div id="article-top" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="max-w-4xl space-y-2.5">
            <h1 className="text-lg sm:text-xl lg:text-[26px] font-bold tracking-tight text-foreground leading-[1.3]">
              {blog.title}
            </h1>

            {/* Author Meta Row */}
            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 pt-0.5 text-[11px] text-secondary-custom font-mono">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-[2px] overflow-hidden border border-border-custom bg-black flex items-center justify-center shrink-0">
                  <Image
                    src="/favicon.png"
                    alt="Tech Infinix"
                    width={20}
                    height={20}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-foreground font-semibold">{blog.author || "Tech Infinix Research Team"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-accent-custom" />
                <span>{formatISTDate(blog.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-accent-custom" />
                <span>{blog.readTime || "5 min read"}</span>
              </div>
            </div>

            {blog.summary && (
              <p className="text-[12px] sm:text-[13px] text-secondary-custom/90 leading-relaxed font-normal pt-1 border-l-2 border-accent-custom pl-3 italic bg-surface/20 rounded-r-[2px] py-1">
                "{blog.summary}"
              </p>
            )}
          </div>
        </div>

        {/* ═══════ 2-COLUMN ARTICLE + STICKY SIDEBAR (Never Cut-Off, Fits 100% On Screen) ═══════ */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* ─── LEFT: MAIN ARTICLE (8 Cols) ─── */}
            <article className="lg:col-span-8 min-w-0">
              
              {/* Mobile-Only Collapsible Table of Contents */}
              {dynamicToc.length > 0 && (
                <div className="lg:hidden mb-8 border border-border-custom bg-surface rounded-[3px] overflow-hidden shadow-xs">
                  <button
                    onClick={() => setMobileTocOpen(!mobileTocOpen)}
                    className="w-full p-3.5 flex items-center justify-between text-left text-xs font-mono font-bold text-foreground hover:bg-background/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-[1px] bg-accent-custom" />
                      <span>Table of Contents ({dynamicToc.length} sections)</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-secondary-custom transition-transform duration-200 ${
                        mobileTocOpen ? "rotate-180 text-accent-custom" : ""
                      }`}
                    />
                  </button>

                  {mobileTocOpen && (
                    <div className="p-3 pt-0 border-t border-border-custom/50 space-y-1">
                      {dynamicToc.map((item) => (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            const el = document.getElementById(item.id);
                            if (el) {
                              el.scrollIntoView({ behavior: "smooth", block: "start" });
                              setActiveSection(item.id);
                              setMobileTocOpen(false);
                            }
                          }}
                          className={`block py-1.5 px-2 rounded-[2px] text-xs font-medium ${
                            activeSection === item.id
                              ? "bg-accent-custom/10 text-accent-custom font-semibold border-l-2 border-accent-custom pl-2.5"
                              : "text-secondary-custom hover:text-foreground"
                          }`}
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Article Content */}
              <div className="blog-content max-w-none text-foreground">
                {isHtml(processedContent) ? (
                  <div dangerouslySetInnerHTML={{ __html: processedContent }} />
                ) : (
                  <p className="whitespace-pre-line">{processedContent}</p>
                )}
              </div>

              {/* Bottom Social Share Bar */}
              <div className="mt-12 pt-6 border-t border-border-custom flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-secondary-custom">
                  <Share2 className="w-4 h-4 text-accent-custom" />
                  <span>Share this article:</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${encodeURIComponent(currentUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-[2px] bg-surface border border-border-custom hover:border-accent-custom hover:text-accent-custom text-secondary-custom transition-all"
                    title="Share on X / Twitter"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 23.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-[2px] bg-surface border border-border-custom hover:border-accent-custom hover:text-accent-custom text-secondary-custom transition-all"
                    title="Share on LinkedIn"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2m1.4 9.74v-8.37H5.06v8.37h2.8z" />
                    </svg>
                  </a>
                  <a
                    href={`https://api.whatsapp.com/send?text=${shareTitle}%20${encodeURIComponent(currentUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-[2px] bg-surface border border-border-custom hover:border-emerald-500 hover:text-emerald-500 text-secondary-custom transition-all"
                    title="Share on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[2px] bg-surface border border-border-custom hover:border-accent-custom hover:text-accent-custom text-xs font-mono text-secondary-custom transition-all cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500 font-semibold">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Author Box */}
              <div className="mt-8 p-5 rounded-[3px] bg-surface border border-border-custom shadow-xs flex items-start sm:items-center gap-4 sm:gap-5 flex-col sm:flex-row">
                <div className="w-12 h-12 rounded-[2px] overflow-hidden border border-border-custom bg-black flex items-center justify-center shrink-0 shadow-sm shadow-accent-custom/20">
                  <Image
                    src="/favicon.png"
                    alt="Tech Infinix"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-foreground">
                      {blog.author || "Tech Infinix Research Team"}
                    </h4>
                    <span className="px-2 py-0.5 rounded-[2px] bg-accent-custom/10 text-accent-custom text-[10px] font-mono font-semibold">
                      Author
                    </span>
                  </div>
                  <p className="text-xs text-secondary-custom leading-relaxed">
                    Engineering autonomous AI multi-agent pipelines, 24/7 WhatsApp customer intelligence bots, and high-impact SEO search dominance for fast-growing businesses.
                  </p>
                </div>
              </div>

              {/* Mobile-Only Consultation Prompt */}
              <div className="lg:hidden mt-8 p-5 rounded-[3px] bg-surface border border-border-custom space-y-2.5">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-accent-custom/10 text-accent-custom border border-accent-custom/20 text-[10px] font-mono uppercase tracking-wider font-bold">
                  <Sparkles className="w-3 h-3 text-accent-custom" />
                  Free Strategy Audit
                </span>
                <h3 className="text-sm font-semibold leading-snug text-foreground">
                  Automate Your Workflows with Custom AI
                </h3>
                <p className="text-xs text-secondary-custom leading-relaxed">
                  Deploy autonomous agents, 24/7 WhatsApp CRM pipelines, and organic SEO strategies designed for your enterprise.
                </p>
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 w-full py-2 rounded-[2px] bg-accent-custom text-white hover:opacity-95 font-semibold text-xs transition-colors shadow-sm shadow-accent-custom/20"
                >
                  <span>Claim Free Proposal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

            </article>

            {/* ─── RIGHT: STICKY SIDEBAR (4 Cols - Compact with balanced top & bottom breathing room) ─── */}
            <aside className="hidden lg:block lg:col-span-4 self-start sticky top-[88px] pb-12 space-y-3">
              
              {/* Card 1: Table of Contents ("On This Page") with live active section indicator */}
              {dynamicToc.length > 0 && (
                <div className="p-3.5 rounded-[3px] bg-surface border border-border-custom shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-border-custom">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-[1px] bg-accent-custom animate-pulse" />
                      <span className="text-[10.5px] font-mono font-bold text-foreground uppercase tracking-wider">
                        On This Page
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-secondary-custom font-semibold">
                      {Math.round(readingProgress)}% read
                    </span>
                  </div>

                  {/* Reading Progress Line */}
                  <div className="w-full bg-border-custom/50 h-[2px] rounded-[1px] overflow-hidden">
                    <div
                      className="bg-accent-custom h-full transition-all duration-150"
                      style={{ width: `${readingProgress}%` }}
                    />
                  </div>

                  <nav className="space-y-0.5 text-xs pt-0.5">
                    {dynamicToc.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          const el = document.getElementById(item.id);
                          if (el) {
                            el.scrollIntoView({ behavior: "smooth", block: "start" });
                            setActiveSection(item.id);
                          }
                        }}
                        className={`block py-1 px-2 rounded-[2px] text-[11.5px] font-medium transition-all ${
                          activeSection === item.id
                            ? "bg-accent-custom/10 text-accent-custom font-semibold border-l-2 border-accent-custom pl-2"
                            : "text-secondary-custom hover:text-foreground hover:bg-background/60"
                        }`}
                      >
                        {item.label}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Card 2: High-Converting Enterprise Automation Proposal + WhatsApp Quick Chat */}
              <div className="p-3.5 rounded-[3px] bg-surface border border-border-custom hover:border-accent-custom/40 transition-colors shadow-xs relative overflow-hidden space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-[2px] bg-accent-custom/10 text-accent-custom border border-accent-custom/20 text-[9.5px] font-mono uppercase tracking-wider font-bold">
                    <Sparkles className="w-3 h-3 text-accent-custom" />
                    Custom AI &amp; SEO
                  </span>
                  <span className="text-[9.5px] font-mono text-emerald-500 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Available Now
                  </span>
                </div>

                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-foreground leading-snug">
                    Scale Workflows With Autonomous AI
                  </h3>
                  <p className="text-[10.5px] text-secondary-custom leading-relaxed">
                    Custom LangGraph agents, 24/7 WhatsApp bots, and organic SEO strategies designed for your enterprise.
                  </p>
                </div>

                <div className="pt-0.5 flex items-center gap-2">
                  <a
                    href={blog.include_contact_form !== false ? "#contact-section" : "/contact"}
                    onClick={(e) => {
                      if (blog.include_contact_form !== false) {
                        e.preventDefault();
                        const el = document.getElementById("contact-section");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className="flex-1 py-1.5 px-2.5 rounded-[2px] bg-accent-custom text-white hover:opacity-95 text-[11px] font-semibold font-mono flex items-center justify-center gap-1 shadow-sm shadow-accent-custom/20 transition-all text-center"
                  >
                    <span>Claim Proposal</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent("Hi Tech Infinix, I'd like to discuss custom AI automation & SEO for my business.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-2.5 rounded-[2px] bg-background border border-border-custom hover:border-emerald-500 hover:text-emerald-500 text-secondary-custom text-[11px] font-mono font-medium flex items-center justify-center gap-1 transition-all"
                    title="Direct WhatsApp"
                  >
                    <MessageCircle className="w-3 h-3 text-emerald-500" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Card 3: Social Share + Trending Reads (Combined into a sleek, compact card) */}
              <div className="p-3.5 rounded-[3px] bg-surface border border-border-custom shadow-xs space-y-2.5">
                {/* 1-Line Social Share Row */}
                <div className="flex items-center justify-between pb-2 border-b border-border-custom">
                  <span className="text-[9.5px] font-mono uppercase tracking-wider text-secondary-custom font-bold">
                    Share
                  </span>
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${encodeURIComponent(currentUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-[2px] bg-background border border-border-custom hover:border-accent-custom hover:text-accent-custom text-secondary-custom transition-all"
                      title="Share on X"
                    >
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 23.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-[2px] bg-background border border-border-custom hover:border-accent-custom hover:text-accent-custom text-secondary-custom transition-all"
                      title="Share on LinkedIn"
                    >
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2m1.4 9.74v-8.37H5.06v8.37h2.8z" />
                      </svg>
                    </a>
                    <a
                      href={`https://api.whatsapp.com/send?text=${shareTitle}%20${encodeURIComponent(currentUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-[2px] bg-background border border-border-custom hover:border-emerald-500 hover:text-emerald-500 text-secondary-custom transition-all"
                      title="Share on WhatsApp"
                    >
                      <MessageCircle className="w-3 h-3" />
                    </a>
                    <button
                      onClick={handleCopyLink}
                      className="p-1 rounded-[2px] bg-background border border-border-custom hover:border-accent-custom hover:text-accent-custom text-secondary-custom transition-all cursor-pointer"
                      title="Copy Link"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Bookmark className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Trending Articles Header */}
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] font-mono uppercase tracking-wider text-secondary-custom font-bold flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3 text-accent-custom" />
                    <span>Trending Articles</span>
                  </span>
                  <Link href="/blogs" className="text-[9.5px] font-mono text-accent-custom hover:underline">
                    View all
                  </Link>
                </div>

                {/* 2 Top Trending Articles */}
                <div className="space-y-2">
                  {relatedArticles.filter(a => a.slug !== slug).slice(0, 2).map((article, idx) => (
                    <Link
                      key={idx}
                      href={`/blogs/${article.slug}`}
                      className="group flex items-start gap-2.5 p-1 rounded-[2px] hover:bg-background transition-colors"
                    >
                      <div className="w-10 h-10 rounded-[2px] overflow-hidden border border-border-custom shrink-0 bg-surface">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <span className={`inline-block px-1 py-0.2 rounded-[2px] text-[7.5px] font-mono font-bold border ${article.tagColor}`}>
                          {article.tag}
                        </span>
                        <h4 className="text-[11px] font-bold text-foreground group-hover:text-accent-custom transition-colors line-clamp-1 leading-snug">
                          {article.title}
                        </h4>
                        <span className="block text-[8.5px] font-mono text-secondary-custom">
                          {article.readTime}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

            </aside>

          </div>
        </div>

        {/* ═══════ BOTTOM SECTION: "Read also..." (HORIZONTAL ON MOBILE / 4-COL ON DESKTOP) ═══════ */}
        <div id="related-articles-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-14 border-t border-border-custom">
          <div className="flex items-center justify-between mb-7">
            <div>
              <span className="text-[11px] font-mono text-accent-custom uppercase tracking-wider font-semibold">
                More Insights
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mt-0.5 tracking-tight">
                Read also...
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10.5px] font-mono text-secondary-custom sm:hidden">
                Swipe &rarr;
              </span>
              <Link
                href="/blogs"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-secondary-custom hover:text-accent-custom transition-colors"
              >
                <span>Explore all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Responsive: HORIZONTALLY scrollable row with snap points on mobile | 4-Column Grid on desktop */}
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 scrollbar-none snap-x snap-mandatory pl-3 sm:pl-0 pr-4 sm:pr-0">
            {relatedArticles.map((item, idx) => (
              <Link
                key={idx}
                href={`/blogs/${item.slug}`}
                className="w-[270px] sm:w-auto shrink-0 snap-start group flex flex-col rounded-[3px] bg-surface border border-border-custom overflow-hidden hover:border-accent-custom/60 hover:shadow-md transition-all duration-300"
              >
                <div className="aspect-[16/10] overflow-hidden bg-background relative border-b border-border-custom">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className={`px-2 py-0.5 rounded-[2px] text-[9.5px] font-mono font-bold border backdrop-blur-md ${item.tagColor}`}>
                      {item.tag}
                    </span>
                  </div>
                </div>
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-1.5">
                  <h4 className="text-[13px] font-semibold text-foreground group-hover:text-accent-custom transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-[11.5px] text-secondary-custom/90 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-[10.5px] font-mono text-secondary-custom border-t border-border-custom/40">
                    <span>{item.readTime}</span>
                    <span className="inline-flex items-center gap-1 text-accent-custom font-semibold group-hover:translate-x-0.5 transition-transform">
                      Read <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ═══════ REAL CONTACT COMPONENT (Integrated from /contact for API synchronization) ═══════ */}
        {blog.include_contact_form !== false && (
          <div id="contact-section" className="mt-24 border-t border-border-custom pt-8">
            <ContactSection />
          </div>
        )}
      </main>

      <FooterSection />
    </div>
  );
}
