"use client";

import React, { use, useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import Navbar from "@/components/layout/Navbar";
import FooterSection from "@/components/layout/FooterSection";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";
import { formatISTDate } from "@/lib/formatters";

import ContactSection from "@/components/sections/ContactSection";

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fallbackBlogs: Record<string, any> = {
    "will-ai-replace-humans": {
      title: "Will AI Replace Humans? The Truth Behind Autonomous Agents & the Future of Work",
      summary: "Will artificial intelligence render human workers obsolete? Explore the realistic frontier between automated task execution and irreplaceable human intuition, creativity, and strategic judgment in the era of autonomous agent swarms.",
      content: `<div class="blog-highlight-box">
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

<h2>1. The Panic vs. The Historical Reality</h2>
<p>Every transformative breakthrough in human history sparked an existential panic about the obsolescence of human labor:</p>
<ul>
  <li>When the <strong>printing press</strong> arrived in the 15th century, scribes protested that human memory and scholarship would degrade into ruin. Instead, it catalyzed the Renaissance and the Scientific Revolution.</li>
  <li>When the <strong>steam engine and spinning jenny</strong> emerged in the 18th century, the Luddite movement feared universal unemployment. In reality, global productivity and living standards skyrocketed by orders of magnitude.</li>
  <li>When <strong>spreadsheets (VisiCalc, Lotus 1-2-3, Excel)</strong> debuted in the 1980s, analysts predicted the death of the accounting industry. Instead, demand for financial analysts, business consultants, and planners grew by over 400%.</li>
</ul>
<p>Large Language Models (LLMs), neural multimodal networks, and autonomous multi-agent swarms follow this identical historical arc: <strong>they commoditize execution speed while exponentially elevating strategic decision-making.</strong></p>

<h2>2. What AI Is Truly Replacing: The "Friction Economy"</h2>
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

<h2>3. The Irreplaceable Human Moats: What AI Cannot Replicate</h2>
<p>While AI can mimic language, synthesize imagery, and calculate statistical probabilities with superhuman speed, it operates within mathematically bounded limits. The following 4 pillars remain fundamentally and permanently human:</p>

<h3>A. Contextual Judgment & Moral Accountability</h3>
<p>An autonomous algorithm can propose 5 different marketing strategies or calculate the risk of a lawsuit, but it cannot shoulder legal liability or moral responsibility. When a critical decision impacts stakeholders, brand trust, or ethical boundaries, human leadership is mandatory. You cannot take an algorithm to court; accountability belongs exclusively to humans.</p>

<h3>B. Genuine Empathy & Emotional Trust (EQ)</h3>
<p>Human beings do not purchase million-dollar enterprise contracts, seek psychiatric therapy, or choose business partners based purely on cold logic. Trust is an emotional, neurochemical bond built on shared vulnerability, non-verbal cues, and lived human experiences. AI can simulate conversational warmth, but genuine empathy requires a conscious being.</p>

<h3>C. First-Principles Thinking & Paradigm Shifts</h3>
<p>Modern machine learning models are fundamentally prediction engines trained on historical corpora. They predict the most probable next token or pattern based on what humanity has <em>already</em> done. True breakthroughs—like Einstein's Theory of Relativity, Steve Jobs conceptualizing the iPhone, or radical new architectural paradigms—stem from defying precedent, not mimicking it.</p>

<h3>D. Physical World Integration & Multi-Domain Intuition</h3>
<p>A human technician can listen to the sound of an engine or assess a client's hesitation across a conference room table and synthesize decades of instinctive life wisdom. Synthesizing cross-disciplinary intuition across unstructured real-world ambiguity remains decades beyond pure machine intelligence.</p>

<h2>4. Side-by-Side Breakdown: AI vs. Human Superpowers</h2>
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

<h2>5. The Rise of the "Centaur Worker": The 10x Human</h2>
<p>In chess, there is a legendary concept known as <em>Centaur Chess</em> (or Advanced Chess): a human grandmaster paired with a chess engine. In competitive tournaments, a Centaur team consistently outperforms both the world's best human grandmaster alone AND the world's most powerful supercomputer alone.</p>
<p>This is the exact future of professional work. The winners of the next decade will not be purely organic purists, nor will they be autonomous machines running without human oversight. The winners will be <strong>Centaurs</strong>—engineers, designers, marketers, and founders who wield autonomous AI swarms as an exoskeleton for their minds.</p>

<div class="blog-callout border-indigo-500/30 bg-indigo-500/5">
  <h3 class="text-indigo-400 font-bold text-base mb-1">💡 Real-World Example at Tech Infinix:</h3>
  <p class="text-sm text-foreground m-0">In our engineering lab, a single software architect armed with autonomous AI pipelines, specialized code generation models, and real-time scrapers can design, test, build, and deploy an enterprise-grade web application in <strong>48 hours</strong>—a milestone that previously demanded a 6-person agency team working for 3 months. The human's value did not decrease; their leverage increased tenfold.</p>
</div>

<h2>6. 4 Steps to Future-Proof Yourself Today</h2>
<p>If you want to ensure your skills and business remain indispensable in the AI era, adopt these 4 strategic imperatives:</p>
<ol>
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
      include_contact_form: true,
      custom_css: `/* Theme-Adaptive High-End Editorial Styling */
.blog-content {
  font-size: 1.05rem;
  line-height: 1.85;
  color: var(--foreground);
}
.blog-content h2 {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin-top: 2.75rem;
  margin-bottom: 1rem;
  color: var(--foreground);
  border-bottom: 1px solid var(--border-custom);
  padding-bottom: 0.5rem;
}
.blog-content h3 {
  font-size: 1.3rem;
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
      summary: "Explore how we design autonomous agents that coordinate tasks, validate lead profiles, and reduce duplicate entry latency.",
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
      include_contact_form: true
    },
    "shift-to-edge-computing-databases": {
      title: "The Shift to Edge-Computing Databases for AI Workflows",
      summary: "Analyzing performance benchmarks of distributed databases like SQLite and Pinecone for RAG retrieval latency.",
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
      include_contact_form: true
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
            setBlog(found || fallbackBlogs[slug] || fallbackBlogs["scaling-outbound-lead-pipelines"]);
          } else {
            setBlog(fallbackBlogs[slug] || fallbackBlogs["scaling-outbound-lead-pipelines"]);
          }
        } else {
          setBlog(fallbackBlogs[slug] || fallbackBlogs["scaling-outbound-lead-pipelines"]);
        }
      } catch {
        setBlog(fallbackBlogs[slug] || fallbackBlogs["scaling-outbound-lead-pipelines"]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  const isHtml = (str: string) => {
    if (!str) return false;
    return /<[a-z][\s\S]*>/i.test(str);
  };

  const renderParsedContent = (text: string) => {
    if (!text) return null;
    if (isHtml(text)) {
      return (
        <div
          className="blog-content prose dark:prose-invert max-w-none text-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      );
    }
    const blocks = text.split("\n\n");
    return (
      <div className="blog-content prose dark:prose-invert max-w-none">
        {blocks.map((block, idx) => {
          const trimmed = block.trim();
          if (trimmed.startsWith("##")) {
            return (
              <h3 key={idx} className="text-xl font-bold text-foreground mt-8 mb-4">
                {trimmed.replace(/^##\s*/, "")}
              </h3>
            );
          } else if (trimmed.startsWith("#")) {
            return (
              <h2 key={idx} className="text-2xl font-bold text-foreground mt-10 mb-6 border-b border-border-custom pb-2">
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
        })}
      </div>
    );
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
      {blog.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: blog.custom_css }} />
      )}
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
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
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
                <span>Published: {formatISTDate(blog.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent-custom" />
                <span>Read time: 4 min read</span>
              </div>
            </div>

            {/* Summary */}
            {blog.summary && (
              <p className="text-sm md:text-base italic text-secondary-custom/90 leading-relaxed font-medium pt-4">
                "{blog.summary}"
              </p>
            )}

            {/* Main content */}
            <div className="pt-6">
              {renderParsedContent(blog.content)}
            </div>

            {/* Conditionally embedded contact form */}
            {blog.include_contact_form !== false && (
              <div className="mt-20 pt-16 border-t border-border-custom/60">
                <div className="mb-6 text-left">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 font-semibold">
                    Let's Build Together
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mt-2">
                    Request a Quote & Technical Consultation
                  </h3>
                  <p className="text-sm text-secondary-custom mt-1.5">
                    Have questions regarding these architectures or ready to launch your custom project? Send an inquiry below.
                  </p>
                </div>
                <ContactSection />
              </div>
            )}

          </article>
        </div>
      </main>
      <FooterSection />
    </>
  );
}
