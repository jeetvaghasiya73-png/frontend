"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { API_URL } from "@/lib/config";
import Navbar from "@/components/layout/Navbar";
import FooterSection from "@/components/layout/FooterSection";
import ContactSection from "@/components/sections/ContactSection";
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
  FileQuestion,
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
  const [countdown, setCountdown] = useState(5);
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

  const fallbackBlogs: Record<string, any> = {
    "will-ai-replace-humans": {
      title: "Will AI Replace Humans? The Truth Behind Autonomous Agents & the Future of Work",
      category: "TECH & AI FUTURE",
      summary: "Will artificial intelligence render human workers obsolete? Explore the realistic frontier between automated task execution and irreplaceable human intuition, creativity, and strategic judgment in the era of autonomous agent swarms.",
      cover_image: "/images/blogs/ai-human-hero.jpg",
      content: `<div class="my-6 rounded-[3px] overflow-hidden border border-border-custom shadow-xl shadow-black/5 dark:shadow-black/40">
  <img src="/images/blogs/ai-human-hero.jpg" alt="Human intelligence collaborating with Autonomous AI Agents" class="w-full h-auto aspect-[16/9] object-cover" />
  <div class="p-2.5 bg-surface text-center border-t border-border-custom/50 text-[11px] text-secondary-custom font-mono">
    Human ingenuity directing autonomous multi-agent pipelines at Tech Infinix.
  </div>
</div>

<div class="blog-highlight-box">
  <div class="blog-badge mb-2.5">🔥 Executive Summary</div>
  <p class="font-semibold text-foreground text-base sm:text-[17px] mb-2 leading-snug">The Short Answer: AI will not replace humans—but humans who master AI will inevitably replace those who don't.</p>
  <p class="text-xs sm:text-[13.5px] text-secondary-custom leading-relaxed m-0">The narrative that artificial intelligence will create a jobless future misunderstands the fundamental nature of technology. Every industrial revolution automates cognitive or physical friction while unlocking higher-order human ingenuity. Here is an evidence-based roadmap of what is changing, what remains strictly human, and how to thrive.</p>
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
<ul class="space-y-2 my-3">
  <li>When the <strong>printing press</strong> arrived in the 15th century, scribes protested that human memory and scholarship would degrade into ruin. Instead, it catalyzed the Renaissance and the Scientific Revolution.</li>
  <li>When the <strong>steam engine and spinning jenny</strong> emerged in the 18th century, the Luddite movement feared universal unemployment. In reality, global productivity and living standards skyrocketed by orders of magnitude.</li>
  <li>When <strong>spreadsheets (VisiCalc, Lotus 1-2-3, Excel)</strong> debuted in the 1980s, analysts predicted the death of the accounting industry. Instead, demand for financial analysts, business consultants, and planners grew by over 400%.</li>
</ul>
<p>Large Language Models (LLMs), neural multimodal networks, and autonomous multi-agent swarms follow this identical historical arc: <strong>they commoditize execution speed while exponentially elevating strategic decision-making.</strong></p>

<h2 id="friction-economy">2. What AI Is Truly Replacing: The "Friction Economy"</h2>
<p>To understand what is vulnerable, we must dissect the type of work computers excel at. AI thrives in domains characterized by <strong>high volume, explicit patterns, and low contextual ambiguity</strong>:</p>

<div class="blog-callout">
  <h3 class="text-foreground font-semibold text-sm mb-2.5">⚡ Tasks Already Handed Over to Autonomous AI:</h3>
  <ul class="text-xs sm:text-[13.5px] space-y-2 text-secondary-custom/90">
    <li><strong>Boilerplate Code &amp; Unit Tests:</strong> Generating repetitive CRUD endpoints, migrations, and standard API boilerplate.</li>
    <li><strong>Data Extraction &amp; Web Scraping:</strong> Parsing thousands of unstructured directories, Google Maps business leads, and cataloging records without manual copy-pasting.</li>
    <li><strong>Level-1 Customer &amp; Prospect Triage:</strong> 24/7 intelligent WhatsApp/Chatbot assistants answering recurring FAQs and qualifying inbound inquiries.</li>
    <li><strong>Content Summarization &amp; Syntax Translation:</strong> Converting legal clauses, documentation, or transcribing multilingual meetings into structured bullet points.</li>
  </ul>
</div>

<p>Notice what all these tasks share: they are <em>friction</em>. They are the repetitive toll fees human professionals were forced to pay every workday before they could do their actual creative, high-impact thinking.</p>

<div class="my-6 rounded-[3px] overflow-hidden border border-border-custom shadow-xl shadow-black/5 dark:shadow-black/40">
  <img src="/images/blogs/centaur-ai-worker.jpg" alt="Autonomous AI Agent Pipelines and Workflow Orchestration" class="w-full h-auto aspect-[16/9] object-cover" />
  <div class="p-2.5 bg-surface text-center border-t border-border-custom/50 text-[11px] text-secondary-custom font-mono">
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
        <td class="domain-cell"><strong>Speed &amp; Scale</strong></td>
        <td data-label="AI Capabilities 🤖">Processes billions of tokens in milliseconds</td>
        <td data-label="Human Superpower 🧠">Discerns which questions are worth asking</td>
      </tr>
      <tr>
        <td class="domain-cell"><strong>Pattern Recognition</strong></td>
        <td data-label="AI Capabilities 🤖">Detects subtle statistical correlations across gigabytes of telemetry</td>
        <td data-label="Human Superpower 🧠">Identifies "black swan" outliers and novel cultural contexts</td>
      </tr>
      <tr>
        <td class="domain-cell"><strong>Content Generation</strong></td>
        <td data-label="AI Capabilities 🤖">Drafts boilerplate articles, summaries, and code</td>
        <td data-label="Human Superpower 🧠">Infuses authentic lived experience, emotional resonance, and contrarian perspectives</td>
      </tr>
      <tr>
        <td class="domain-cell"><strong>Strategic Decision</strong></td>
        <td data-label="AI Capabilities 🤖">Simulates scenarios and probabilistic game trees</td>
        <td data-label="Human Superpower 🧠">Takes ethical accountability and commits capital under true uncertainty</td>
      </tr>
      <tr>
        <td class="domain-cell"><strong>Relationship Building</strong></td>
        <td data-label="AI Capabilities 🤖">Executes round-the-clock transactional conversations</td>
        <td data-label="Human Superpower 🧠">Forges long-term loyalty, shared values, and interpersonal trust</td>
      </tr>
    </tbody>
  </table>
</div>

<h2 id="centaur-worker">5. The Rise of the "Centaur Worker" (10x Human + AI)</h2>
<p>The professionals who will dominate the next decade are neither AI purists nor Luddites. They are <strong>Centaurs</strong>: individuals who blend human strategic intuition with algorithmic horse-power.</p>

<p>Consider how modern high-performance software engineering works today at Tech Infinix:</p>
<ul class="space-y-1.5 my-2.5">
  <li>A senior engineer conceptualizes the data model, defines system boundaries, and anticipates edge-case security risks.</li>
  <li>They prompt an autonomous agent fleet (like LangGraph or Claude) to scaffold the FastAPI endpoints, database schemas, and unit test suites in 45 seconds.</li>
  <li>The engineer reviews, refactors, and deploys. A task that previously took 4 days now concludes before lunch.</li>
</ul>

<div class="blog-quote-box">
  <p class="italic text-foreground font-medium text-xs sm:text-[13px] mb-1 leading-relaxed">"Technology does not replace people. It replaces tasks. Those who let go of low-leverage tasks first will command the future."</p>
  <span class="text-[10px] font-mono text-secondary-custom uppercase tracking-wider">— Tech Infinix Engineering Principles</span>
</div>

<h2 id="future-proof-steps">6. How to Future-Proof Your Career & Enterprise</h2>
<p>To thrive alongside autonomous systems, implement these four strategic shifts today:</p>
<ol class="space-y-2 my-2.5">
  <li><strong>Master System Architecture over Syntax:</strong> Stop spending hours memorizing commands or syntax. Instead, learn how systems interact, how APIs exchange data, and how security models govern access.</li>
  <li><strong>Build a High-Trust Personal Brand:</strong> Algorithms are commodities; reputation is scarce. Cultivate verified domain expertise, case studies, and transparent client partnerships.</li>
  <li><strong>Deploy Autonomous Agents for Repetitive Overhead:</strong> Automate data entry, outbound outreach, and inbound lead qualification so your core team can focus on closing deals and product innovation.</li>
  <li><strong>Double Down on Uniquely Human EQ:</strong> Strengthen negotiation, storytelling, team culture, and customer relationship building.</li>
</ol>`,
      author: "Tech Infinix Research Team",
      created_at: new Date().toISOString(),
      readTime: "5 min read",
      custom_css: `
.blog-content {
  font-family: 'Poppins', var(--font-poppins), sans-serif;
  font-size: 0.8125rem !important;
  line-height: 1.68 !important;
  letter-spacing: -0.005em;
}
.blog-content h2 {
  font-family: 'Poppins', var(--font-poppins), sans-serif;
  font-size: 1.05rem !important;
  font-weight: 700 !important;
  margin-top: 1.6rem !important;
  margin-bottom: 0.45rem !important;
  color: var(--foreground) !important;
  letter-spacing: -0.015em;
  line-height: 1.35 !important;
}
.blog-content h3 {
  font-family: 'Poppins', var(--font-poppins), sans-serif;
  font-size: 0.9rem !important;
  font-weight: 600 !important;
  margin-top: 1.2rem !important;
  margin-bottom: 0.35rem !important;
  color: var(--foreground) !important;
  letter-spacing: -0.01em;
  line-height: 1.4 !important;
}
.blog-content p {
  font-family: 'Poppins', var(--font-poppins), sans-serif;
  font-size: 0.8125rem !important;
  margin-bottom: 0.95rem !important;
  color: var(--foreground) !important;
  opacity: 0.88;
  line-height: 1.68 !important;
}
.blog-content ul, .blog-content ol {
  font-family: 'Poppins', var(--font-poppins), sans-serif;
  font-size: 0.8125rem !important;
  line-height: 1.65 !important;
  color: var(--foreground) !important;
  opacity: 0.88;
}
.blog-content li {
  font-size: 0.8125rem !important;
  line-height: 1.65 !important;
}
.blog-callout {
  padding: 1.15rem 1.25rem;
  border-radius: 3px;
  margin: 1.5rem 0;
  background: var(--surface);
  border: 1px solid var(--border-custom);
  border-left: 3px solid var(--accent-custom);
  box-shadow: 0 1px 6px -1px rgba(0, 0, 0, 0.02);
}
.blog-highlight-box {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.07) 0%, rgba(41, 98, 255, 0.03) 100%);
  border: 1px solid rgba(99, 102, 241, 0.20);
  border-left: 3px solid var(--accent-custom);
  border-radius: 3px;
  padding: 1.15rem 1.25rem;
  margin: 1.5rem 0;
}
.blog-table-wrapper {
  overflow-x: auto;
  margin: 1.5rem 0;
  border-radius: 3px;
  border: 1px solid var(--border-custom);
  background: var(--surface);
}
.blog-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.775rem;
  text-align: left;
}
.blog-table th {
  background: var(--surface);
  padding: 0.65rem 0.75rem;
  font-weight: 600;
  font-size: 0.72rem;
  border-bottom: 1px solid var(--border-custom);
  color: var(--foreground);
  font-family: 'Poppins', var(--font-poppins), sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.blog-table td {
  padding: 0.65rem 0.75rem;
  border-bottom: 1px solid var(--border-custom);
  color: var(--foreground);
  font-size: 0.775rem;
  line-height: 1.5;
}
.blog-table tr:last-child td {
  border-bottom: none;
}
.blog-table tr:nth-child(even) td {
  background: rgba(125, 125, 125, 0.02);
}

/* Responsive Card Layout on Mobile (< 640px) */
@media (max-width: 640px) {
  .blog-table-wrapper {
    border: none !important;
    background: transparent !important;
    overflow: visible !important;
    margin: 1rem 0 !important;
  }
  .blog-table {
    display: block !important;
    width: 100% !important;
  }
  .blog-table thead {
    display: none !important;
  }
  .blog-table tbody {
    display: flex !important;
    flex-direction: column !important;
    gap: 0.75rem !important;
    width: 100% !important;
  }
  .blog-table tr {
    display: block !important;
    width: 100% !important;
    background: var(--surface) !important;
    border: 1px solid var(--border-custom) !important;
    border-radius: 3px !important;
    padding: 0.75rem 0.85rem !important;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02) !important;
  }
  .blog-table td {
    display: block !important;
    width: 100% !important;
    padding: 0.35rem 0 !important;
    border-bottom: 1px solid var(--border-custom) !important;
    font-size: 0.75rem !important;
    line-height: 1.45 !important;
  }
  .blog-table td:last-child {
    border-bottom: none !important;
    padding-bottom: 0 !important;
  }
  .blog-table td.domain-cell,
  .blog-table td:first-child {
    padding-top: 0 !important;
    padding-bottom: 0.35rem !important;
    font-size: 0.8rem !important;
    color: var(--accent-custom) !important;
    font-weight: 700 !important;
    border-bottom: 1px solid var(--border-custom) !important;
  }
  .blog-table td[data-label]::before {
    content: attr(data-label);
    display: block;
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--secondary-custom);
    margin-bottom: 0.15rem;
  }
}

.blog-stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin: 1.5rem 0;
}
.blog-stat-card {
  padding: 0.9rem 0.75rem;
  border-radius: 3px;
  background: var(--surface);
  border: 1px solid var(--border-custom);
  text-align: center;
  box-shadow: 0 1px 5px -1px rgba(0,0,0,0.02);
}
.blog-stat-number {
  font-size: 1.4rem;
  font-weight: 700;
  background: linear-gradient(135deg, #2962FF 0%, #6366F1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
  font-family: 'Poppins', var(--font-poppins), sans-serif;
}
.blog-stat-label {
  font-size: 0.68rem;
  font-weight: 500;
  color: var(--secondary-custom);
  margin-top: 0.25rem;
  line-height: 1.35;
}
.blog-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.55rem;
  border-radius: 2px;
  font-size: 0.65rem;
  font-weight: 600;
  background: rgba(99, 102, 241, 0.10);
  color: #6366F1;
  border: 1px solid rgba(99, 102, 241, 0.20);
  font-family: 'Poppins', var(--font-poppins), sans-serif;
}
.blog-quote-box {
  padding: 1.15rem 1.25rem;
  border-left: 3px solid var(--accent-custom);
  background: var(--surface);
  margin: 1.5rem 0;
  border-radius: 3px;
}`
    },
    "whatsapp-crm-bots": {
      title: "Building 24/7 Autonomous WhatsApp AI Bots with Evolution API",
      category: "AUTOMATION & AI CRM",
      summary: "Deploying high-reliability, stateful WhatsApp conversational engines that qualify inbound leads, sync to enterprise CRMs, and answer customer queries in real-time.",
      cover_image: "/images/blogs/ai-human-hero.jpg",
      author: "Tech Infinix Automation Labs",
      created_at: new Date().toISOString(),
      readTime: "5 min read",
      content: `<div class="my-6 rounded-[3px] overflow-hidden border border-border-custom shadow-xl shadow-black/5 dark:shadow-black/40">
  <img src="/images/blogs/ai-human-hero.jpg" alt="Autonomous 24/7 WhatsApp AI Bot Architecture and CRM Integration" class="w-full h-auto aspect-[16/9] object-cover" />
  <div class="p-2.5 bg-surface text-center border-t border-border-custom/50 text-[11px] text-secondary-custom font-mono">
    High-concurrency stateful WhatsApp conversational pipeline powered by Evolution API & FastAPI.
  </div>
</div>

<div class="blog-highlight-box">
  <div class="blog-badge mb-2.5">🚀 Core Insight</div>
  <p class="font-semibold text-foreground text-base sm:text-[17px] mb-2 leading-snug">Speed-to-lead is the single highest predictor of digital sales conversion.</p>
  <p class="text-xs sm:text-[13.5px] text-secondary-custom leading-relaxed m-0">Studies show that contacting an inbound lead within 60 seconds increases conversion likelihood by over 391%. By coupling Evolution API with asynchronous FastAPI webhooks and intelligent LLM debouncing, enterprises can qualify buyers 24/7 before competitors even open an email.</p>
</div>

<h2 id="autonomous-inbound">1. The Inbound Speed-to-Lead Challenge</h2>
<p>Modern B2B and direct-to-consumer businesses lose up to 45% of potential revenue due to delayed response times. When a prospect reaches out on WhatsApp after business hours, sending a generic "We are currently away" notice results in immediate customer drop-off.</p>

<div class="blog-stat-grid">
  <div class="blog-stat-card">
    <div class="blog-stat-number">&lt;3s</div>
    <div class="blog-stat-label">Average AI Lead Response Latency</div>
  </div>
  <div class="blog-stat-card">
    <div class="blog-stat-number">99.8%</div>
    <div class="blog-stat-label">Message Delivery &amp; Webhook Reliability</div>
  </div>
  <div class="blog-stat-card">
    <div class="blog-stat-number">10x</div>
    <div class="blog-stat-label">Higher Qualification Throughput</div>
  </div>
</div>

<h2 id="architecture-pipeline">2. The Technical Pipeline: Evolution API + FastAPI</h2>
<p>At Tech Infinix, our autonomous WhatsApp conversational architecture isolates webhook ingestion, natural language classification, and state persistence into dedicated stages:</p>

<div class="my-6 rounded-[3px] overflow-hidden border border-border-custom shadow-xl shadow-black/5 dark:shadow-black/40">
  <img src="/images/blogs/centaur-ai-worker.jpg" alt="Multi-stage WhatsApp Bot decision trees and CRM event synchronization" class="w-full h-auto aspect-[16/9] object-cover" />
  <div class="p-2.5 bg-surface text-center border-t border-border-custom/50 text-[11px] text-secondary-custom font-mono">
    Event-driven Baileys session management with asynchronous state debouncing.
  </div>
</div>

<ul class="space-y-1.5 my-2.5">
  <li><strong>Webhook Ingestion:</strong> Evolution API dispatches raw Baileys events (message upsert, presence updates, and read receipts) to FastAPI endpoints with zero dropped frames.</li>
  <li><strong>Stateful Token Debouncer:</strong> Customers frequently send multiple rapid messages ("Hi", "I want to ask", "about your service"). Our Redis debouncer aggregates consecutive messages into a single prompt, preventing redundant LLM token expenditures.</li>
  <li><strong>Human Handoff Sentinel:</strong> When complex procurement negotiations or sensitive questions emerge, the bot flags the lead for human takeover without interrupting user trust.</li>
</ul>

<h2 id="performance-comparison">3. Comparative Breakdown: Manual Triage vs. Autonomous Bot</h2>
<div class="blog-table-wrapper">
  <table class="blog-table">
    <thead>
      <tr>
        <th>Operational Metric</th>
        <th>Manual Sales Rep 👤</th>
        <th>Autonomous WhatsApp AI 🤖</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="domain-cell"><strong>Response Time</strong></td>
        <td data-label="Manual Sales Rep 👤">2 to 8 hours delayed</td>
        <td data-label="Autonomous WhatsApp AI 🤖">Sub-second immediate reply</td>
      </tr>
      <tr>
        <td class="domain-cell"><strong>Availability</strong></td>
        <td data-label="Manual Sales Rep 👤">8 hours/day, weekdays only</td>
        <td data-label="Autonomous WhatsApp AI 🤖">24 hours / 365 days non-stop</td>
      </tr>
      <tr>
        <td class="domain-cell"><strong>Data Accuracy</strong></td>
        <td data-label="Manual Sales Rep 👤">Prone to manual CRM entry errors</td>
        <td data-label="Autonomous WhatsApp AI 🤖">Direct schema validation &amp; instant sync</td>
      </tr>
      <tr>
        <td class="domain-cell"><strong>Concurrent Chats</strong></td>
        <td data-label="Manual Sales Rep 👤">3 to 5 simultaneous conversations</td>
        <td data-label="Autonomous WhatsApp AI 🤖">1,000+ simultaneous conversations</td>
      </tr>
    </tbody>
  </table>
</div>

<h2 id="enterprise-best-practices">4. Engineering Best Practices for High Conversion</h2>
<p>To maximize return on investment, ensure your deployment follows these three architectural axioms:</p>

<ol class="space-y-2 my-2.5">
  <li><strong>Never Ask for Known Data:</strong> If outreach originated from existing directory intelligence, greet the user by company name and present tailored proposals immediately.</li>
  <li><strong>Preserve Instant WhatsApp CTAs:</strong> Always provide interactive buttons for quick routing ('[ Interested ]', '[ Visit Website ]', '[ Call Us ]').</li>
  <li><strong>Trigger Real-Time Sales Alerts:</strong> When a hot lead confirms interest, immediately dispatch structured email notifications to executive sales reps with summarized token telemetry.</li>
</ol>

<div class="blog-quote-box">
  <p class="italic text-foreground font-medium text-xs sm:text-[13px] mb-1 leading-relaxed">"The best sales system is not the one with the biggest pitch—it is the one that responds first with absolute clarity."</p>
  <span class="text-[10px] font-mono text-secondary-custom uppercase tracking-wider">— Tech Infinix Systems Architecture</span>
</div>`,
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
          response = await fetch(`${API_URL}/api/v1/blogs/slug/${slug}`);
        }
        if (response.ok) {
          const data = await response.json();
          setBlog(data);
        } else if (fallbackBlogs[slug]) {
          // Standard reference blogs
          setBlog(fallbackBlogs[slug]);
        } else {
          // Blog was deleted or not found
          setNotFound(true);
        }
      } catch (err) {
        console.error("Fetch blog failed, checking fallback", err);
        if (fallbackBlogs[slug]) {
          setBlog(fallbackBlogs[slug]);
        } else {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  // Automatic countdown and redirect back to /blogs if article is deleted / unavailable
  useEffect(() => {
    if (!notFound) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = "/blogs";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [notFound]);

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
    return (
      <div className={`${poppins.className} font-sans min-h-screen bg-background text-foreground antialiased flex flex-col justify-between`}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-32 pb-20 px-4">
          <div className="max-w-xl w-full text-center space-y-6 p-8 sm:p-10 rounded-[4px] border border-border-custom bg-surface shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 shadow-inner">
              <FileQuestion className="w-8 h-8" />
            </div>

            <div className="space-y-2.5">
              <span className="inline-block px-2.5 py-0.5 rounded-[2px] bg-red-500/10 text-red-500 border border-red-500/20 text-[10.5px] font-mono uppercase font-bold tracking-wider">
                Article Unavailable or Removed
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                This Article Is No Longer Published
              </h1>
              <p className="text-xs sm:text-sm text-secondary-custom font-mono leading-relaxed max-w-md mx-auto">
                The article at <code className="text-accent-custom px-1.5 py-0.5 bg-background border border-border-custom rounded-[2px]">/blogs/{slug}</code> has been deleted, unpublished, or moved by our editorial team.
              </p>
            </div>

            <div className="p-3.5 rounded-[3px] bg-background border border-border-custom text-xs font-mono text-secondary-custom flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-custom animate-ping" />
              <span>Redirecting to all articles in <strong className="text-foreground font-bold">{countdown}s</strong>...</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/blogs"
                className="w-full sm:w-auto px-5 py-2.5 rounded-[3px] bg-accent-custom text-white hover:opacity-95 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm shadow-accent-custom/20 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to All Articles Now</span>
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-5 py-2.5 rounded-[3px] bg-background border border-border-custom hover:border-accent-custom hover:text-accent-custom text-secondary-custom text-xs font-mono font-medium transition-all"
              >
                Contact Team
              </Link>
            </div>
          </div>
        </main>
        <FooterSection />
      </div>
    );
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
                <div className="w-5 h-5 rounded-[2px] bg-accent-custom/15 border border-accent-custom/30 text-accent-custom font-bold text-[10px] flex items-center justify-center">
                  TI
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
                <div className="w-12 h-12 rounded-[2px] bg-gradient-to-tr from-accent-custom to-indigo-500 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-sm shadow-accent-custom/20">
                  TI
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
