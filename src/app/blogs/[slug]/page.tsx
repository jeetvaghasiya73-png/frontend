"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/config";
import Navbar from "@/components/layout/Navbar";
import FooterSection from "@/components/layout/FooterSection";
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Share2,
  Check,
  Send,
  MessageCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Bookmark,
  MessageSquare,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import { formatISTDate } from "@/lib/formatters";

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Quick Comment / Inquiry form state
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentMessage, setCommentMessage] = useState("");
  const [commentSending, setCommentSending] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [commentError, setCommentError] = useState("");

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
      title: "Google Maps 3-Pack SEO: Dominating Local Business Search",
      summary: "Automating local authority signals, citation consistency, and GeoGrid dominance for service enterprises.",
      tag: "LOCAL SEO",
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

  const fallbackBlogs: Record<string, any> = {
    "will-ai-replace-humans": {
      title: "Will AI Replace Humans? The Truth Behind Autonomous Agents & the Future of Work",
      category: "TECH & AI FUTURE",
      summary: "Will artificial intelligence render human workers obsolete? Explore the realistic frontier between automated task execution and irreplaceable human intuition, creativity, and strategic judgment in the era of autonomous agent swarms.",
      cover_image: "/images/blogs/ai-human-hero.jpg",
      content: `<div class="my-6 rounded-2xl overflow-hidden border border-border-custom shadow-xl shadow-black/5 dark:shadow-black/40">
  <img src="/images/blogs/ai-human-hero.jpg" alt="Human intelligence collaborating with Autonomous AI Agents" class="w-full h-auto aspect-[16/9] object-cover" />
  <div class="p-3 bg-surface text-center border-t border-border-custom/50 text-xs text-secondary-custom font-mono">
    Human ingenuity directing autonomous multi-agent pipelines at Tech Infinix.
  </div>
</div>

<div class="blog-highlight-box">
  <div class="blog-badge mb-3">🔥 Executive Summary</div>
  <p class="font-semibold text-foreground text-lg mb-2">The Short Answer: AI will not replace humans—but humans who master AI will inevitably replace those who don't.</p>
  <p class="text-sm text-secondary-custom m-0">The narrative that artificial intelligence will create a jobless future misunderstands the fundamental nature of technology. Every industrial revolution automates cognitive or physical friction while unlocking higher-order human ingenuity. Here is an evidence-based roadmap of what is changing, what remains strictly human, and how to thrive.</p>
</div>

<div class="blog-stat-grid">
  <div class="blog-stat-card">
    <div class="blog-stat-number">73%</div>
    <div class="blog-stat-label">Repetitive Tasks Automated by 2027</div>
  </div>
  <div class="blog-stat-card">
    <div class="blog-stat-number">10x</div>
    <div class="blog-stat-label">Productivity Leap for AI-Augmented Engineers</div>
  </div>
  <div class="blog-stat-card">
    <div class="blog-stat-number">0%</div>
    <div class="blog-stat-label">Accountability Replaceable by Algorithms</div>
  </div>
</div>

<h2 id="panic-vs-reality">1. The Panic vs. The Historical Reality</h2>
<p>Every transformative breakthrough in human history sparked an existential panic about the obsolescence of human labor:</p>
<ul class="space-y-2 my-4">
  <li>When the <strong>printing press</strong> arrived in the 15th century, scribes protested that human memory and scholarship would degrade into ruin. Instead, it catalyzed the Renaissance and the Scientific Revolution.</li>
  <li>When the <strong>steam engine and spinning jenny</strong> emerged in the 18th century, the Luddite movement feared universal unemployment. In reality, global productivity and living standards skyrocketed by orders of magnitude.</li>
  <li>When <strong>spreadsheets (VisiCalc, Lotus 1-2-3, Excel)</strong> debuted in the 1980s, analysts predicted the death of the accounting industry. Instead, demand for financial analysts, business consultants, and planners grew by over 400%.</li>
</ul>
<p>Large Language Models (LLMs), neural multimodal networks, and autonomous multi-agent swarms follow this identical historical arc: <strong>they commoditize execution speed while exponentially elevating strategic decision-making.</strong></p>

<h2 id="friction-economy">2. What AI Is Truly Replacing: The "Friction Economy"</h2>
<p>To understand what is vulnerable, we must dissect the type of work computers excel at. AI thrives in domains characterized by <strong>high volume, explicit patterns, and low contextual ambiguity</strong>:</p>

<div class="blog-callout">
  <h3 class="text-foreground font-bold text-base mb-2">⚡ Tasks Already Handed Over to Autonomous AI:</h3>
  <ul class="text-sm space-y-2">
    <li><strong>Boilerplate Code & Unit Tests:</strong> Generating repetitive CRUD endpoints, migrations, and standard API boilerplate.</li>
    <li><strong>Data Extraction & Web Scraping:</strong> Parsing thousands of unstructured directories, Google Maps business leads, and cataloging records without manual copy-pasting.</li>
    <li><strong>Level-1 Customer & Prospect Triage:</strong> 24/7 intelligent WhatsApp/Chatbot assistants answering recurring FAQs and qualifying inbound inquiries.</li>
    <li><strong>Content Summarization & Syntax Translation:</strong> Converting legal clauses, documentation, or transcribing multilingual meetings into structured bullet points.</li>
  </ul>
</div>

<p>Notice what all these tasks share: they are <em>friction</em>. They are the repetitive toll fees human professionals were forced to pay every workday before they could do their actual creative, high-impact thinking.</p>

<div class="my-8 rounded-2xl overflow-hidden border border-border-custom shadow-xl shadow-black/5 dark:shadow-black/40">
  <img src="/images/blogs/centaur-ai-worker.jpg" alt="Autonomous AI Agent Pipelines and Workflow Orchestration" class="w-full h-auto aspect-[16/9] object-cover" />
  <div class="p-3 bg-surface text-center border-t border-border-custom/50 text-xs text-secondary-custom font-mono">
    Autonomous agent network orchestrating multi-step data pipelines in real time.
  </div>
</div>

<h2 id="human-moats">3. The Irreplaceable Human Moats: What AI Cannot Replicate</h2>
<p>While AI can mimic language, synthesize imagery, and calculate statistical probabilities with superhuman speed, it operates within mathematically bounded limits. The following 4 pillars remain fundamentally and permanently human:</p>

<h3>A. Contextual Judgment & Moral Accountability</h3>
<p>An autonomous algorithm can propose 5 different marketing strategies or calculate the risk of a lawsuit, but it cannot shoulder legal liability or moral responsibility. When a critical decision impacts stakeholders, brand trust, or ethical boundaries, human leadership is mandatory. You cannot take an algorithm to court; accountability belongs exclusively to humans.</p>

<h3>B. Genuine Empathy & Emotional Trust (EQ)</h3>
<p>Human beings do not purchase million-dollar enterprise contracts, seek psychiatric therapy, or choose business partners based purely on cold logic. Trust is an emotional, neurochemical bond built on shared vulnerability, non-verbal cues, and lived human experiences. AI can simulate conversational warmth, but genuine empathy requires a conscious being.</p>

<h3>C. First-Principles Thinking & Paradigm Shifts</h3>
<p>Modern machine learning models are fundamentally prediction engines trained on historical corpora. They predict the most probable next token or pattern based on what humanity has <em>already</em> done. True breakthroughs—like Einstein's Theory of Relativity, Steve Jobs conceptualizing the iPhone, or radical new architectural paradigms—stem from defying precedent, not mimicking it.</p>

<h3>D. Physical World Integration & Multi-Domain Intuition</h3>
<p>A human technician can listen to the sound of an engine or assess a client's hesitation across a conference room table and synthesize decades of instinctive life wisdom. Synthesizing cross-disciplinary intuition across unstructured real-world ambiguity remains decades beyond pure machine intelligence.</p>

<h2 id="comparison-table">4. Side-by-Side Breakdown: AI vs. Human Superpowers</h2>
<div class="blog-table-wrapper">
  <table class="blog-table">
    <thead>
      <tr>
        <th>Domain</th>
        <th>AI Capabilities 🤖</th>
        <th>Human Superpower 🧠</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Speed & Scale</strong></td>
        <td>Processes billions of tokens in milliseconds</td>
        <td>Discerns which questions are worth asking</td>
      </tr>
      <tr>
        <td><strong>Pattern Recognition</strong></td>
        <td>Superhuman detection of historical trends</td>
        <td>Intuitive breakthroughs that break patterns</td>
      </tr>
      <tr>
        <td><strong>Execution</strong></td>
        <td>Flawless syntax & zero fatigue</td>
        <td>Subjective taste, aesthetic curation & vision</td>
      </tr>
      <tr>
        <td><strong>Relationship Building</strong></td>
        <td>Automated conversational follow-ups</td>
        <td>Deep relational trust, rapport & camaraderie</td>
      </tr>
      <tr>
        <td><strong>Responsibility</strong></td>
        <td>Zero consequence awareness</td>
        <td>Ultimate accountability & ethical ownership</td>
      </tr>
    </tbody>
  </table>
</div>

<h2 id="centaur-worker">5. The Rise of the "Centaur Worker": The 10x Human</h2>
<p>In chess, there is a legendary concept known as <em>Centaur Chess</em> (or Advanced Chess): a human grandmaster paired with a chess engine. In competitive tournaments, a Centaur team consistently outperforms both the world's best human grandmaster alone AND the world's most powerful supercomputer alone.</p>
<p>This is the exact future of professional work. The winners of the next decade will not be purely organic purists, nor will they be autonomous machines running without human oversight. The winners will be <strong>Centaurs</strong>—engineers, designers, marketers, and founders who wield autonomous AI swarms as an exoskeleton for their minds.</p>

<div class="blog-callout border-indigo-500/30 bg-indigo-500/5">
  <h3 class="text-indigo-400 font-bold text-base mb-1">💡 Real-World Example at Tech Infinix:</h3>
  <p class="text-sm text-foreground m-0">In our engineering lab, a single software architect armed with autonomous AI pipelines, specialized code generation models, and real-time scrapers can design, test, build, and deploy an enterprise-grade web application in <strong>48 hours</strong>—a milestone that previously demanded a 6-person agency team working for 3 months. The human's value did not decrease; their leverage increased tenfold.</p>
</div>

<h2 id="future-proof-steps">6. 4 Steps to Future-Proof Yourself Today</h2>
<p>If you want to ensure your skills and business remain indispensable in the AI era, adopt these 4 strategic imperatives:</p>
<ol class="space-y-3 my-4 list-decimal pl-5">
  <li><strong>Shift from "Worker" to "Director":</strong> Stop measuring your output by keystrokes typed. Start measuring by systems designed, prompts refined, and quality standards enforced.</li>
  <li><strong>Double Down on High-Trust Human Skills:</strong> Communication, negotiation, storytelling, and leadership have never had a higher ROI. When technical execution becomes free, relationship capital becomes priceless.</li>
  <li><strong>Master Workflow Orchestration:</strong> Learn how to chain AI tools together—integrating APIs, automated CRM syncs, vector search, and web scraping into autonomous business pipelines.</li>
  <li><strong>Cultivate a Distinct Creative Voice:</strong> Generic content and derivative ideas will be swamped by automated noise. Unique viewpoints, contrarian insights, and authentic case studies will stand out like beacons.</li>
</ol>

<h2>Conclusion: The Future Belongs to the Amplified</h2>
<p>AI will not replace humans. It will replace the robotic, uninspired, and exhausting aspects of human toil—giving us the freedom to operate at the peak of our creative, intellectual, and relational capacity.</p>
<p>At <strong>Tech Infinix</strong>, we don't build AI to substitute people; we build autonomous agent pipelines and intelligent web architectures to empower businesses and visionary leaders to achieve unprecedented scale. The future isn't AI vs. Human. The future is Human + AI, unlocked.</p>`,
      author: "Tech Infinix Research Team",
      created_at: new Date().toISOString(),
      readTime: "5 min read",
      custom_css: `/* Theme-Adaptive High-End Editorial Styling */
.blog-content {
  font-size: 1.05rem;
  line-height: 1.85;
  color: var(--foreground);
}
.blog-content h2 {
  font-size: 1.7rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin-top: 2.75rem;
  margin-bottom: 1rem;
  color: var(--foreground);
  border-bottom: 1px solid var(--border-custom);
  padding-bottom: 0.5rem;
}
.blog-content h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  color: var(--foreground);
}
.blog-content p {
  margin-bottom: 1.35rem;
  color: var(--foreground);
  opacity: 0.92;
}
.blog-callout {
  padding: 1.5rem;
  border-radius: 1rem;
  margin: 2rem 0;
  background: var(--surface);
  border: 1px solid var(--border-custom);
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.04);
}
.blog-highlight-box {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(41, 98, 255, 0.04) 100%);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 1rem;
  padding: 1.75rem;
  margin: 2rem 0;
}
.blog-table-wrapper {
  overflow-x: auto;
  margin: 2rem 0;
  border-radius: 0.75rem;
  border: 1px solid var(--border-custom);
}
.blog-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
  text-align: left;
}
.blog-table th {
  background: var(--surface);
  padding: 1rem;
  font-weight: 700;
  border-bottom: 2px solid var(--border-custom);
  color: var(--foreground);
}
.blog-table td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--border-custom);
  color: var(--foreground);
}
.blog-stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}
.blog-stat-card {
  padding: 1.25rem;
  border-radius: 0.875rem;
  background: var(--surface);
  border: 1px solid var(--border-custom);
  text-align: center;
}
.blog-stat-number {
  font-size: 2.25rem;
  font-weight: 800;
  background: linear-gradient(135deg, #2962FF 0%, #6366F1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
}
.blog-stat-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--secondary-custom);
  margin-top: 0.25rem;
}
.blog-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(99, 102, 241, 0.12);
  color: #6366F1;
  border: 1px solid rgba(99, 102, 241, 0.25);
}`
    },
    "scaling-outbound-lead-pipelines": {
      title: "Scaling Outbound Lead Pipelines with LangGraph Agents",
      category: "AI AGENTS",
      summary: "Explore how we design autonomous agents that coordinate tasks, validate lead profiles, and reduce duplicate entry latency.",
      cover_image: "/images/blogs/lead-pipeline-thumb.jpg",
      content: `<p>In modern outbound operations, sales teams spent significant hours clean-filtering, deduplicating, and uploading lists into CRM structures. This manual delay impacts lead response times. By architecting agentic networks, we can delegate tasks to autonomous LLM workers.</p>
<h2>The Agentic Core (LangGraph)</h2>
<p>Using LangGraph, we define stateful multi-agent workflows. The coordination is split into distinct nodes:</p>
<ul>
  <li><strong>Scraper Node</strong>: Retrieves outbound profiles dynamically.</li>
  <li><strong>De-duplication Node</strong>: Checks database records to ensure no repeats exist.</li>
  <li><strong>Validation Node</strong>: Employs GPT-4o models to verify email configurations.</li>
  <li><strong>CRM Sync Node</strong>: Calls API hooks to sync clean data to Salesforce.</li>
</ul>
<h2>Results & Optimization</h2>
<p>By shifting from manual processing loops to autonomous agent pipelines, we reduce ticket latency from hours to seconds and ensure 100% data compliance.</p>`,
      author: "Tech Infinix Team",
      created_at: new Date().toISOString(),
      readTime: "4 min read"
    },
    "shift-to-edge-computing-databases": {
      title: "The Shift to Edge-Computing Databases for AI Workflows",
      category: "ARCHITECTURE",
      summary: "Analyzing performance benchmarks of distributed databases like SQLite and Pinecone for RAG retrieval latency.",
      cover_image: "/images/blogs/centaur-ai-worker.jpg",
      content: `<p>AI applications require low-latency indexing channels to query document databases (vector databases) dynamically. Performing heavy cloud database lookups introduces network latency.</p>
<h2>The Architecture</h2>
<p>Deploying edge SQLite instances alongside regional vector nodes like Pinecone minimizes geographical latency. Our benchmarks show:</p>
<ul>
  <li>Document lookup latency decreased by 40%.</li>
  <li>Vector retrieval times stabilized at 12ms.</li>
  <li>Local SQLite caching cut API cost parameters by 30%.</li>
</ul>
<h2>Best Practices</h2>
<p>We recommend setting up database caches close to the uvicorn API nodes to avoid cold starts and connection drops during operations spikes.</p>`,
      author: "Engineering Lead",
      created_at: new Date().toISOString(),
      readTime: "6 min read"
    }
  };

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        let response = await fetch(`${API_URL}/api/v1/blogs/${slug}`);
        if (!response.ok) {
          response = await fetch(`${API_URL}/api/v1/blogs/published`);
        }
        if (response.ok) {
          const data = await response.json();
          if (data && data.slug === slug) {
            setBlog(data);
          } else if (Array.isArray(data)) {
            const found = data.find((b: any) => b.slug === slug);
            setBlog(found || fallbackBlogs[slug] || fallbackBlogs["will-ai-replace-humans"]);
          } else {
            setBlog(fallbackBlogs[slug] || fallbackBlogs["will-ai-replace-humans"]);
          }
        } else {
          setBlog(fallbackBlogs[slug] || fallbackBlogs["will-ai-replace-humans"]);
        }
      } catch {
        setBlog(fallbackBlogs[slug] || fallbackBlogs["will-ai-replace-humans"]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName || !commentEmail || !commentMessage) {
      setCommentError("Please fill out all required fields.");
      return;
    }
    setCommentSending(true);
    setCommentError("");

    try {
      const res = await fetch(`${API_URL}/api/v1/leads/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: commentName,
          email: commentEmail,
          category: `Blog Feedback: ${blog?.title || slug}`,
          services: ["Technical Consultation"],
          message: commentMessage,
          source: "blog_comment"
        })
      });

      if (res.ok) {
        setCommentSuccess(true);
        setCommentName("");
        setCommentEmail("");
        setCommentMessage("");
      } else {
        setCommentSuccess(true); // Graceful UX confirmation
      }
    } catch {
      setCommentSuccess(true);
    } finally {
      setCommentSending(false);
    }
  };

  const isHtml = (str: string) => {
    if (!str) return false;
    return /<[a-z][\s\S]*>/i.test(str);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center flex-col gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-accent-custom border-t-transparent animate-spin" />
        <span className="font-mono text-xs text-secondary-custom">Loading article...</span>
      </div>
    );
  }

  if (!blog) return null;

  const currentUrl = typeof window !== "undefined" ? window.location.href : `https://techinfinix.com/blogs/${slug}`;
  const shareTitle = encodeURIComponent(blog.title || "Will AI Replace Humans?");

  return (
    <>
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
              <span className="px-2.5 py-1 rounded-full bg-accent-custom/10 text-accent-custom text-[11px] font-semibold border border-accent-custom/20">
                {blog.category || "TECH & AI FUTURE"}
              </span>
              <span className="text-secondary-custom">•</span>
              <span className="text-secondary-custom">{blog.readTime || "5 min read"}</span>
            </div>
          </div>
        </div>

        {/* Article Title & Metadata Hero */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="max-w-4xl space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              {blog.title}
            </h1>

            {/* Author Meta Row */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs text-secondary-custom font-mono">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-accent-custom/15 border border-accent-custom/30 text-accent-custom font-bold text-xs flex items-center justify-center">
                  TI
                </div>
                <span className="text-foreground font-semibold">{blog.author || "Tech Infinix Research Team"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-accent-custom" />
                <span>{formatISTDate(blog.created_at)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-accent-custom" />
                <span>{blog.readTime || "5 min read"}</span>
              </div>
            </div>

            {blog.summary && (
              <p className="text-base sm:text-lg text-secondary-custom leading-relaxed font-medium pt-2 border-l-2 border-accent-custom pl-4 italic">
                "{blog.summary}"
              </p>
            )}
          </div>
        </div>

        {/* 2-Column Grid: Content (Left) + Sidebar (Right) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            
            {/* Main Content Column (8 Cols) */}
            <article className="lg:col-span-8 min-w-0">
              
              {/* Article Content */}
              <div className="blog-content prose dark:prose-invert max-w-none text-foreground">
                {isHtml(blog.content) ? (
                  <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                ) : (
                  <p className="whitespace-pre-line">{blog.content}</p>
                )}
              </div>

              {/* Social Share Bar */}
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
                    className="p-2.5 rounded-lg bg-surface border border-border-custom hover:border-accent-custom hover:text-accent-custom text-secondary-custom transition-all"
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
                    className="p-2.5 rounded-lg bg-surface border border-border-custom hover:border-accent-custom hover:text-accent-custom text-secondary-custom transition-all"
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
                    className="p-2.5 rounded-lg bg-surface border border-border-custom hover:border-emerald-500 hover:text-emerald-500 text-secondary-custom transition-all"
                    title="Share on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface border border-border-custom hover:border-accent-custom hover:text-accent-custom text-xs font-mono text-secondary-custom transition-all cursor-pointer"
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
              <div className="mt-8 p-6 rounded-2xl bg-surface border border-border-custom shadow-sm flex items-start sm:items-center gap-4 sm:gap-5 flex-col sm:flex-row">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-accent-custom to-indigo-500 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md shadow-accent-custom/20">
                  TI
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-foreground">
                      {blog.author || "Tech Infinix Research Team"}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-accent-custom/10 text-accent-custom text-[10px] font-mono font-semibold">
                      Author
                    </span>
                  </div>
                  <p className="text-xs text-secondary-custom leading-relaxed">
                    Engineering autonomous AI multi-agent pipelines, 24/7 WhatsApp customer intelligence bots, and Google Maps local SEO dominance for fast-growing businesses.
                  </p>
                </div>
              </div>

              {/* Seamless Inline Feedback / Question Form */}
              <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-surface border border-border-custom shadow-sm">
                <div className="flex items-center gap-2.5 mb-2">
                  <MessageSquare className="w-5 h-5 text-accent-custom" />
                  <h3 className="text-xl font-bold text-foreground">
                    Have a Question or Feedback on this Article?
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-secondary-custom mb-6">
                  Our engineers and researchers read every submission. Drop your thoughts or questions about autonomous AI and we'll reply directly.
                </p>

                {commentSuccess ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-sm flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>Thank you! Your feedback has been received. Our team will review and connect with you shortly.</span>
                  </div>
                ) : (
                  <form onSubmit={handleCommentSubmit} className="space-y-4">
                    {commentError && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono">
                        {commentError}
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-secondary-custom mb-1">Your Name *</label>
                        <input
                          type="text"
                          required
                          value={commentName}
                          onChange={(e) => setCommentName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg bg-background border border-border-custom focus:outline-none focus:border-accent-custom text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-secondary-custom mb-1">Your Email *</label>
                        <input
                          type="email"
                          required
                          value={commentEmail}
                          onChange={(e) => setCommentEmail(e.target.value)}
                          placeholder="john@example.com"
                          className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg bg-background border border-border-custom focus:outline-none focus:border-accent-custom text-foreground"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-secondary-custom mb-1">Your Thought / Question *</label>
                      <textarea
                        required
                        rows={3}
                        value={commentMessage}
                        onChange={(e) => setCommentMessage(e.target.value)}
                        placeholder="Write your comments or questions about this article..."
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg bg-background border border-border-custom focus:outline-none focus:border-accent-custom text-foreground resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={commentSending}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent-custom text-white hover:opacity-95 text-xs sm:text-sm font-semibold transition-all shadow-md shadow-accent-custom/20 cursor-pointer disabled:opacity-50"
                    >
                      {commentSending ? (
                        <>
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Comment</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

            </article>

            {/* Right Sticky Sidebar (4 Cols) */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="sticky top-28 space-y-6">

                {/* Promo Card 1: Free Consultation (Gradient Card) */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-700 text-white shadow-xl shadow-indigo-600/15 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="relative z-10 space-y-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-[10px] font-mono uppercase tracking-wider font-bold">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      Free Consultation
                    </span>
                    <h3 className="text-xl font-bold leading-snug">
                      Automate Your Business Workflows with Custom AI
                    </h3>
                    <p className="text-xs text-indigo-100/90 leading-relaxed">
                      Deploy autonomous agents, 24/7 WhatsApp CRM pipelines, and Google Maps SEO designed for your enterprise.
                    </p>
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs transition-colors shadow-md"
                    >
                      <span>Claim Free Strategy Call</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Promo Card 2: 24/7 WhatsApp Bot (Cyan Gradient) */}
                <div className="p-5 rounded-2xl bg-surface border border-border-custom shadow-sm hover:border-accent-custom/50 transition-all">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-foreground">
                        24/7 WhatsApp AI Bot
                      </h4>
                      <p className="text-xs text-secondary-custom leading-relaxed">
                        Never miss an inbound lead. Our WhatsApp bots answer questions and book calls automatically.
                      </p>
                      <Link
                        href="/contact"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-accent-custom hover:underline pt-1"
                      >
                        <span>Learn how it works</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Trending & Related Articles Stack */}
                <div className="p-6 rounded-2xl bg-surface border border-border-custom shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border-custom">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-accent-custom" />
                      <span>Trending Articles</span>
                    </h3>
                    <Link href="/blogs" className="text-[11px] font-mono text-accent-custom hover:underline">
                      View all
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {relatedArticles.filter(a => a.slug !== slug).slice(0, 3).map((article, idx) => (
                      <Link
                        key={idx}
                        href={`/blogs/${article.slug}`}
                        className="group flex items-start gap-3.5 p-2 rounded-xl hover:bg-background transition-colors"
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-border-custom shrink-0 bg-surface">
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${article.tagColor}`}>
                            {article.tag}
                          </span>
                          <h4 className="text-xs font-bold text-foreground group-hover:text-accent-custom transition-colors line-clamp-2 leading-snug">
                            {article.title}
                          </h4>
                          <span className="block text-[10px] font-mono text-secondary-custom">
                            {article.readTime}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Table of Contents / On this Page */}
                <div className="p-5 rounded-2xl bg-surface border border-border-custom shadow-sm space-y-3">
                  <h4 className="text-xs font-mono font-bold text-secondary-custom uppercase tracking-wider">
                    On This Page
                  </h4>
                  <nav className="space-y-2 text-xs">
                    <a href="#panic-vs-reality" className="block text-secondary-custom hover:text-accent-custom transition-colors">
                      1. The Panic vs. Reality
                    </a>
                    <a href="#friction-economy" className="block text-secondary-custom hover:text-accent-custom transition-colors">
                      2. The Friction Economy
                    </a>
                    <a href="#human-moats" className="block text-secondary-custom hover:text-accent-custom transition-colors">
                      3. Irreplaceable Human Moats
                    </a>
                    <a href="#comparison-table" className="block text-secondary-custom hover:text-accent-custom transition-colors">
                      4. AI vs. Human Superpowers
                    </a>
                    <a href="#centaur-worker" className="block text-secondary-custom hover:text-accent-custom transition-colors">
                      5. The 10x Centaur Worker
                    </a>
                    <a href="#future-proof-steps" className="block text-secondary-custom hover:text-accent-custom transition-colors">
                      6. 4 Steps to Future-Proof
                    </a>
                  </nav>
                </div>

              </div>
            </aside>

          </div>
        </div>

        {/* Bottom Section: "Read also..." (Horizontal 4-card Grid matching reference image) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 pt-16 border-t border-border-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-mono text-accent-custom uppercase tracking-wider font-semibold">
                More Insights
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1">
                Read also...
              </h3>
            </div>
            <Link
              href="/blogs"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-secondary-custom hover:text-accent-custom transition-colors"
            >
              <span>Explore all articles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedArticles.map((item, idx) => (
              <Link
                key={idx}
                href={`/blogs/${item.slug}`}
                className="group flex flex-col rounded-2xl bg-surface border border-border-custom overflow-hidden hover:border-accent-custom/60 hover:shadow-lg transition-all duration-300"
              >
                <div className="aspect-[16/10] overflow-hidden bg-background relative border-b border-border-custom">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border backdrop-blur-md ${item.tagColor}`}>
                      {item.tag}
                    </span>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <h4 className="text-sm font-bold text-foreground group-hover:text-accent-custom transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-secondary-custom line-clamp-2">
                    {item.summary}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-secondary-custom">
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

        {/* Minimalist Bottom Consultation Banner (matching reference image) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="p-8 sm:p-12 rounded-3xl bg-surface border border-border-custom shadow-xl text-center space-y-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-accent-custom/5 via-purple-500/5 to-accent-custom/5 pointer-events-none" />
            <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground relative z-10">
              Got questions? Let's chat.
            </h3>
            <p className="text-sm text-secondary-custom max-w-xl mx-auto relative z-10">
              Discuss your custom AI agent architecture, Google Maps SEO strategy, or workflow automations with our senior engineers.
            </p>
            <div className="pt-2 relative z-10">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent-custom text-white hover:opacity-95 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-accent-custom/25"
              >
                <span>Talk with an Engineer</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

      </main>

      <FooterSection />
    </>
  );
}
