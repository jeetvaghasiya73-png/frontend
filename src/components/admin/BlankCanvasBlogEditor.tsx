"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  FileText,
  Eye,
  Check,
  Upload,
  Copy,
  Plus,
  Heading,
  Image as ImageIcon,
  Table as TableIcon,
  BarChart2,
  Quote,
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
  Smartphone,
  Monitor,
  X,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Columns
} from "lucide-react";
import { API, authFetch } from "@/lib/authFetch";
import {
  parseTaggedBlog,
  convertHtmlToTaggedText,
  ParsedBlog
} from "@/lib/blogTagParser";

interface BlankCanvasBlogEditorProps {
  initialBlog?: any;
  onSave: (payload: any) => Promise<void>;
  onCancel: () => void;
}

export default function BlankCanvasBlogEditor({
  initialBlog,
  onSave,
  onCancel
}: BlankCanvasBlogEditorProps) {
  // Canvas raw tagged text state
  const [canvasText, setCanvasText] = useState<string>("");
  const [viewMode, setViewMode] = useState<"canvas" | "preview" | "split">("split");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [published, setPublished] = useState(initialBlog?.published || false);
  const [saving, setSaving] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Link Dialog Modal State
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkText, setLinkText] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkNewTab, setLinkNewTab] = useState(true);
  const [linkRel, setLinkRel] = useState<"follow" | "nofollow">("follow");

  // Image Inserter Modal State
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [imgAlt, setImgAlt] = useState("");
  const [imgCaption, setImgCaption] = useState("");
  const [imgHeadline, setImgHeadline] = useState("");
  const [imgText, setImgText] = useState("");
  const [imgWidth, setImgWidth] = useState("");
  const [imgLayout, setImgLayout] = useState<string>("full");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Starter template text (all features matching whatsapp-crm-bots)
  const starterTemplate = `[TITLE] Building 24/7 Autonomous WhatsApp AI Bots with Evolution API [/TITLE]
[SLUG] whatsapp-crm-bots [/SLUG]
[CATEGORY] AUTOMATION & AI CRM [/CATEGORY]
[READ_TIME] 5 min read [/READ_TIME]
[AUTHOR] Tech Infinix Automation Labs [/AUTHOR]
[SUMMARY] Deploying high-reliability, stateful WhatsApp conversational engines that qualify inbound leads, sync to enterprise CRMs, and answer customer queries in real-time. [/SUMMARY]
[COVER_IMAGE src="/images/blogs/ai-human-hero.jpg" alt="Autonomous 24/7 WhatsApp AI Bot Architecture and CRM Integration" /]
[INCLUDE_FORM: true]

[HIGHLIGHT badge="🚀 Core Insight"]
[HEADLINE] Speed-to-lead is the single highest predictor of digital sales conversion. [/HEADLINE]
Studies show that contacting an inbound lead within 60 seconds increases conversion likelihood by over 391%. By coupling Evolution API with asynchronous FastAPI webhooks and intelligent LLM debouncing, enterprises can qualify buyers 24/7 before competitors even open an email.
[/HIGHLIGHT]

[SECTION id="inbound-challenge" title="1. The Inbound Speed-to-Lead Challenge"]
Modern B2B and direct-to-consumer businesses lose up to 45% of potential revenue due to delayed response times. When a prospect reaches out on WhatsApp after business hours, sending a generic away message results in immediate drop-off.
[/SECTION]

[STAT_GRID]
  [STAT num="<3s" label="Average AI Lead Response Latency" /]
  [STAT num="99.8%" label="Message Delivery & Webhook Reliability" /]
  [STAT num="10x" label="Higher Lead Qualification Throughput" /]
[/STAT_GRID]

[SECTION id="architecture-pipeline" title="2. The Technical Pipeline: Evolution API + FastAPI"]
At Tech Infinix, our autonomous WhatsApp conversational architecture isolates webhook ingestion, natural language classification, and state persistence into dedicated stages:
[/SECTION]

[IMAGE src="/images/blogs/centaur-ai-worker.jpg" alt="Multi-stage WhatsApp Bot decision trees and CRM event synchronization" caption="Event-driven Baileys session management with asynchronous state debouncing." layout="full" /]

[SUBSECTION title="A. Stateful Token Debouncing"]
Customers frequently send multiple rapid messages. Our Redis debouncer aggregates consecutive messages into a single prompt, preventing redundant LLM token expenditures.
[/SUBSECTION]

[SUBSECTION title="B. Human Handoff Sentinel"]
When complex procurement negotiations or sensitive questions emerge, the bot flags the lead for human takeover without interrupting user trust.
[/SUBSECTION]

[SECTION id="performance-comparison" title="3. Comparative Breakdown: Manual Triage vs. Autonomous Bot"]
Here is how an autonomous agent fleet compares against standard manual sales handling:
[/SECTION]

[TABLE]
| Operational Metric | Manual Sales Rep 👤 | Autonomous WhatsApp AI 🤖 |
| Response Time | 2 to 8 hours delayed | Sub-second immediate reply |
| Availability | 8 hours/day, weekdays only | 24 hours / 365 days non-stop |
| Data Accuracy | Prone to manual CRM entry errors | Direct schema validation & instant sync |
| Concurrent Chats | 3 to 5 simultaneous conversations | 1,000+ simultaneous conversations |
[/TABLE]

[CALLOUT type="info"]
[HEADLINE] Pro-Tip on WhatsApp Sockets [/HEADLINE]
Always enable Redis session persistence to preserve WhatsApp socket connections across container redeployments without forcing QR code re-scans.
[/CALLOUT]

[CODE lang="python"]
@router.post("/webhook")
async def handle_whatsapp_event(payload: WebhookPayload):
    # Ingest event asynchronously with Redis debouncing
    return await conversation_service.process_event(payload)
[/CODE]

[SECTION id="enterprise-best-practices" title="4. Engineering Best Practices for High Conversion"]
To maximize return on investment, ensure your deployment follows these three architectural axioms:
- Never ask for known data when outreach intelligence already exists.
- Preserve instant WhatsApp CTA buttons for quick routing.
- Trigger real-time email alerts to executive sales reps when high-intent leads emerge.
[/SECTION]

[QUOTE author="Tech Infinix Systems Architecture"]
"The best sales system is not the one with the biggest pitch—it is the one that responds first with absolute clarity."
[/QUOTE]

[CALLOUT type="success"]
[HEADLINE] Ready to Scale Your Outbound? [/HEADLINE]
Explore our [LINK href="https://techinfinix.com/services" title="Enterprise Automation Architecture" target="_blank" rel="follow"]custom AI & workflow engineering[/LINK] to automate customer qualification for your enterprise.
[/CALLOUT]
`;

  // Initialize canvas text
  useEffect(() => {
    if (initialBlog) {
      setCanvasText(convertHtmlToTaggedText(initialBlog));
    } else {
      setCanvasText(starterTemplate);
    }
  }, [initialBlog]);

  // Real-time Parser execution
  const parsedBlog: ParsedBlog = useMemo(() => {
    return parseTaggedBlog(canvasText);
  }, [canvasText]);

  // Insert tag snippet at cursor position in canvas textarea
  const insertSnippet = (snippet: string) => {
    if (!textareaRef.current) {
      setCanvasText((prev) => `${prev}\n\n${snippet}`);
      return;
    }

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;

    const updated = current.substring(0, start) + snippet + current.substring(end);
    setCanvasText(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 0);
  };

  // Image upload handler
  const handleUploadImageFile = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await authFetch(`${API}/api/v1/blogs/upload-image`, {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || "Image upload failed");
        return;
      }

      const data = await res.json();
      const filenameClean = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      const snippet = `\n[IMAGE src="${data.url}" alt="${filenameClean}" caption="Technical diagram and operational metrics." layout="full" /]\n`;
      insertSnippet(snippet);
    } catch (err: any) {
      console.error(err);
      alert("Failed to upload image: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Canvas Drag & Drop Image Interceptor
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        handleUploadImageFile(file);
      }
    }
  };

  // Copy Starter Template to Clipboard
  const handleCopyStarterTemplate = () => {
    navigator.clipboard.writeText(starterTemplate);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  // Submit Link Inserter Modal
  const handleInsertLinkModal = () => {
    if (!linkUrl) return;
    const target = linkNewTab ? '_blank' : '_self';
    const titleAttr = linkTitle ? ` title="${linkTitle.replace(/"/g, '')}"` : "";
    const displayText = linkText || linkUrl;
    const snippet = `[LINK href="${linkUrl}"${titleAttr} target="${target}" rel="${linkRel}"]${displayText}[/LINK]`;
    insertSnippet(snippet);
    setLinkModalOpen(false);
    setLinkUrl("https://");
    setLinkText("");
    setLinkTitle("");
  };

  // Submit Image Inserter Modal
  const handleInsertImageModal = () => {
    if (!imgSrc) return;
    const altAttr = imgAlt ? ` alt="${imgAlt.replace(/"/g, '')}"` : "";
    const capAttr = imgCaption ? ` caption="${imgCaption.replace(/"/g, '')}"` : "";
    const headAttr = imgHeadline ? ` headline="${imgHeadline.replace(/"/g, '')}"` : "";
    const textAttr = imgText ? ` text="${imgText.replace(/"/g, '')}"` : "";
    const widthAttr = imgWidth ? ` width="${imgWidth}"` : "";
    const snippet = `\n[IMAGE src="${imgSrc}"${altAttr}${headAttr}${textAttr}${capAttr} layout="${imgLayout}"${widthAttr} /]\n`;
    insertSnippet(snippet);
    setImageModalOpen(false);
    setImgSrc("");
    setImgAlt("");
    setImgCaption("");
    setImgHeadline("");
    setImgText("");
    setImgWidth("");
  };

  // Form Checkbox Toggle Handler (keeps tag in sync)
  const handleToggleForm = (checked: boolean) => {
    if (canvasText.includes("[INCLUDE_FORM:")) {
      setCanvasText((prev) =>
        prev.replace(/\[INCLUDE_FORM:\s*(true|false)\]/gi, `[INCLUDE_FORM: ${checked}]`)
      );
    } else {
      setCanvasText((prev) => `[INCLUDE_FORM: ${checked}]\n${prev}`);
    }
  };

  // Save & Publish Handler
  const handleSave = async () => {
    if (!parsedBlog.title.trim()) {
      alert("Please ensure your tagged text contains a [TITLE] ... [/TITLE] tag.");
      return;
    }

    setSaving(true);
    try {
      const contentWithSource = `<!-- TECH_INFINIX_TAGGED_SOURCE_START\n${canvasText}\nTECH_INFINIX_TAGGED_SOURCE_END -->\n${parsedBlog.compiledHtml}`;

      const payload = {
        title: parsedBlog.title,
        slug: parsedBlog.slug || "blog-article",
        category: parsedBlog.category,
        readTime: parsedBlog.readTime,
        author: parsedBlog.author,
        summary: parsedBlog.summary,
        cover_image: parsedBlog.coverImage || null,
        content: contentWithSource,
        published: published,
        seo_title: parsedBlog.title,
        seo_description: parsedBlog.summary || parsedBlog.title,
        include_contact_form: parsedBlog.includeContactForm
      };

      await onSave(payload);
    } catch (err: any) {
      console.error(err);
      alert("Error saving blog: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* ═══════ TOP COMMAND BAR ═══════ */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border-custom px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-[3px] overflow-hidden border border-border-custom bg-black dark:bg-white flex items-center justify-center shrink-0">
            <img src="/favicon.png" alt="Tech Infinix Logo" className="w-full h-full object-cover dark:invert" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-foreground truncate">
              {parsedBlog.title || "Blank Canvas (Paste Tagged Text)"}
            </h1>
            <div className="flex items-center gap-2 text-[10.5px] font-mono text-secondary-custom">
              <span className="truncate">slug: /{parsedBlog.slug || "untitled"}</span>
              <span>•</span>
              <span className="text-accent-custom font-semibold">{parsedBlog.category}</span>
              <span>•</span>
              <span className={published ? "text-emerald-500 font-semibold" : "text-amber-500"}>
                {published ? "Published" : "Draft"}
              </span>
            </div>
          </div>
        </div>

        {/* Center Viewport Switcher */}
        <div className="flex items-center bg-background border border-border-custom rounded-[3px] p-0.5">
          <button
            onClick={() => setViewMode("canvas")}
            className={`px-3 py-1.5 rounded-[2px] text-xs font-mono font-medium flex items-center gap-1.5 transition-all ${
              viewMode === "canvas"
                ? "bg-accent-custom text-white shadow-xs"
                : "text-secondary-custom hover:text-foreground"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Canvas</span>
          </button>
          <button
            onClick={() => setViewMode("split")}
            className={`hidden md:flex px-3 py-1.5 rounded-[2px] text-xs font-mono font-medium items-center gap-1.5 transition-all ${
              viewMode === "split"
                ? "bg-accent-custom text-white shadow-xs"
                : "text-secondary-custom hover:text-foreground"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>
          <button
            onClick={() => setViewMode("preview")}
            className={`px-3 py-1.5 rounded-[2px] text-xs font-mono font-medium flex items-center gap-1.5 transition-all ${
              viewMode === "preview"
                ? "bg-accent-custom text-white shadow-xs"
                : "text-secondary-custom hover:text-foreground"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Publish Toggle */}
          <label className="hidden sm:inline-flex items-center gap-2 text-xs font-mono cursor-pointer mr-2 select-none">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded accent-accent-custom w-3.5 h-3.5"
            />
            <span className="text-secondary-custom">Publish</span>
          </label>

          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-[3px] bg-surface border border-border-custom hover:bg-background text-secondary-custom text-xs font-mono transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 rounded-[3px] bg-accent-custom hover:opacity-95 text-white text-xs font-mono font-semibold flex items-center gap-1.5 shadow-sm shadow-accent-custom/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{published ? "Publish to Site" : "Save Draft"}</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ═══════ FLOATING INSERTER TOOLBAR (QUICK-INSERT TAGS) ═══════ */}
      <div className="bg-surface/80 border-b border-border-custom px-4 sm:px-6 py-2 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider text-secondary-custom mr-1 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5 text-accent-custom" />
            <span>Insert Tag:</span>
          </span>

          <button
            type="button"
            onClick={() => insertSnippet(`\n[SECTION id="new-section" title="1. Section Title"]\nParagraph text goes here...\n[/SECTION]\n`)}
            className="px-2 py-1 rounded-[2px] bg-background border border-border-custom hover:border-accent-custom hover:text-accent-custom flex items-center gap-1 transition-colors"
            title="Insert Chapter Section Heading (H2)"
          >
            <Heading className="w-3 h-3 text-accent-custom" />
            <span>Section</span>
          </button>

          <button
            type="button"
            onClick={() => insertSnippet(`\n[STAT_GRID]\n  [STAT num="99.9%" label="Availability" /]\n  [STAT num="<3s" label="Latency" /]\n  [STAT num="10x" label="Throughput" /]\n[/STAT_GRID]\n`)}
            className="px-2 py-1 rounded-[2px] bg-background border border-border-custom hover:border-accent-custom hover:text-accent-custom flex items-center gap-1 transition-colors"
            title="Insert KPI Stat Cards Grid"
          >
            <BarChart2 className="w-3 h-3 text-amber-500" />
            <span>Stat Grid</span>
          </button>

          <button
            type="button"
            onClick={() =>
              insertSnippet(
                `\n[SPLIT ratio="50-50"]\n  [COL]\n    [SUBSECTION title="Side-by-Side Content"]\n    Write descriptive analysis here with zero empty space. Perfect for balancing technical explanations with architectural diagrams.\n    - Seamless alignment\n    - Auto-scales on mobile\n  [/COL]\n  [COL]\n    [IMAGE src="/images/blogs/centaur-ai-worker.jpg" alt="Autonomous AI Agent Pipelines" layout="card" headline="Pipeline Telemetry" text="Real-time execution traces." /]\n  [/COL]\n[/SPLIT]\n`
              )
            }
            className="px-2 py-1 rounded-[2px] bg-background border border-border-custom hover:border-accent-custom hover:text-accent-custom flex items-center gap-1 transition-colors"
            title="Insert Side-by-Side Split Section (Eliminates empty spacing)"
          >
            <Columns className="w-3 h-3 text-cyan-500" />
            <span>Split Section</span>
          </button>

          <button
            type="button"
            onClick={() => setImageModalOpen(true)}
            className="px-2 py-1 rounded-[2px] bg-background border border-border-custom hover:border-accent-custom hover:text-accent-custom flex items-center gap-1 transition-colors"
            title="Insert Responsive Image (Auto-Adjust & Alt)"
          >
            <ImageIcon className="w-3 h-3 text-emerald-500" />
            <span>Image</span>
          </button>

          <button
            type="button"
            onClick={() =>
              insertSnippet(
                `\n[TABLE]\n| Metric | Manual Rep 👤 | Autonomous Bot 🤖 |\n| Response Time | 4 hours delayed | Instant sub-second reply |\n| Availability | 8 hrs/day | 24/7 non-stop |\n[/TABLE]\n`
              )
            }
            className="px-2 py-1 rounded-[2px] bg-background border border-border-custom hover:border-accent-custom hover:text-accent-custom flex items-center gap-1 transition-colors"
            title="Insert Matrix Table (Auto-converts to mobile cards)"
          >
            <TableIcon className="w-3 h-3 text-purple-500" />
            <span>Table</span>
          </button>

          <button
            type="button"
            onClick={() =>
              insertSnippet(
                `\n[HIGHLIGHT badge="🚀 Core Insight"]\n[HEADLINE] Speed-to-lead is the single highest predictor of digital sales conversion. [/HEADLINE]\nKey takeaway text goes here...\n[/HIGHLIGHT]\n`
              )
            }
            className="px-2 py-1 rounded-[2px] bg-background border border-border-custom hover:border-accent-custom hover:text-accent-custom flex items-center gap-1 transition-colors"
            title="Insert Highlight Box"
          >
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>Highlight</span>
          </button>

          <button
            type="button"
            onClick={() =>
              insertSnippet(
                `\n[QUOTE author="Tech Infinix Engineering Principles"]\n"Technology replaces friction, not people."\n[/QUOTE]\n`
              )
            }
            className="px-2 py-1 rounded-[2px] bg-background border border-border-custom hover:border-accent-custom hover:text-accent-custom flex items-center gap-1 transition-colors"
            title="Insert Engineering Quote Box"
          >
            <Quote className="w-3 h-3 text-cyan-500" />
            <span>Quote</span>
          </button>

          <button
            type="button"
            onClick={() => setLinkModalOpen(true)}
            className="px-2 py-1 rounded-[2px] bg-background border border-border-custom hover:border-accent-custom hover:text-accent-custom flex items-center gap-1 transition-colors"
            title="Insert SEO Hyperlink"
          >
            <LinkIcon className="w-3 h-3 text-blue-500" />
            <span>SEO Link</span>
          </button>
        </div>

        {/* Right Help / Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Image File Upload Button */}
          <label className="px-2.5 py-1 rounded-[2px] bg-accent-custom/10 text-accent-custom border border-accent-custom/20 hover:bg-accent-custom/20 flex items-center gap-1.5 cursor-pointer transition-colors">
            {uploadingImage ? (
              <span className="w-3 h-3 rounded-full border-2 border-accent-custom border-t-transparent animate-spin" />
            ) : (
              <Upload className="w-3 h-3" />
            )}
            <span>Upload Image File</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUploadImageFile(f);
              }}
            />
          </label>

          <button
            type="button"
            onClick={handleCopyStarterTemplate}
            className="px-2.5 py-1 rounded-[2px] bg-background border border-border-custom hover:text-foreground text-secondary-custom flex items-center gap-1 transition-colors"
            title="Copy Starter Template with all market tags into clipboard"
          >
            <Copy className="w-3 h-3" />
            <span>{copiedTemplate ? "Copied!" : "Copy tags.md Template"}</span>
          </button>
        </div>
      </div>

      {/* ═══════ MAIN WORKSPACE (CANVAS + PREVIEW) ═══════ */}
      <div className="flex-1 flex overflow-hidden">
        {/* ──────────────── LEFT CANVAS COLUMN ──────────────── */}
        {(viewMode === "canvas" || viewMode === "split") && (
          <div
            className={`flex-1 flex flex-col border-r border-border-custom bg-background/50 ${
              viewMode === "split" ? "w-1/2" : "w-full"
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {/* Canvas Header Bar */}
            <div className="p-3 bg-surface/40 border-b border-border-custom flex items-center justify-between text-xs font-mono text-secondary-custom">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-accent-custom" />
                <span>Blank Document Canvas (Drag & Drop images or paste tagged text)</span>
              </span>
              <span className="text-[10px]">
                {canvasText.length} chars • {canvasText.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            {/* Direct Textarea Canvas */}
            <textarea
              ref={textareaRef}
              value={canvasText}
              onChange={(e) => setCanvasText(e.target.value)}
              placeholder="Paste your tagged blog draft here or use the toolbar above..."
              className="flex-1 w-full p-5 font-mono text-xs sm:text-[13px] leading-relaxed bg-background text-foreground focus:outline-none resize-none selection:bg-accent-custom/25"
              spellCheck={false}
            />

            {/* Canvas Bottom Settings Bar */}
            <div className="p-3 bg-surface border-t border-border-custom flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={parsedBlog.includeContactForm}
                  onChange={(e) => handleToggleForm(e.target.checked)}
                  className="rounded accent-accent-custom w-4 h-4 cursor-pointer"
                />
                <span className="text-foreground font-semibold">
                  Display Consultation Form above Footer ([INCLUDE_FORM: {parsedBlog.includeContactForm ? "true" : "false"}])
                </span>
              </label>

              <span className="text-[11px] text-secondary-custom">
                Auto-scroll on initial load is permanently disabled.
              </span>
            </div>
          </div>
        )}

        {/* ──────────────── RIGHT LIVE PREVIEW COLUMN ──────────────── */}
        {(viewMode === "preview" || viewMode === "split") && (
          <div
            className={`flex-1 flex flex-col bg-background overflow-y-auto ${
              viewMode === "split" ? "w-1/2" : "w-full"
            }`}
          >
            {/* Preview Toolbar */}
            <div className="sticky top-0 z-20 p-2.5 bg-surface/90 backdrop-blur-md border-b border-border-custom flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="font-bold text-accent-custom uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Real-Time Public Preview</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`px-2 py-1 rounded-[2px] flex items-center gap-1 transition-colors ${
                    previewDevice === "desktop"
                      ? "bg-accent-custom text-white"
                      : "text-secondary-custom hover:text-foreground"
                  }`}
                  title="Desktop 100% View"
                >
                  <Monitor className="w-3 h-3" />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`px-2 py-1 rounded-[2px] flex items-center gap-1 transition-colors ${
                    previewDevice === "mobile"
                      ? "bg-accent-custom text-white"
                      : "text-secondary-custom hover:text-foreground"
                  }`}
                  title="Mobile 390px View (Stacked Cards & Horizontal Swipe)"
                >
                  <Smartphone className="w-3 h-3" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            {/* Preview Canvas Content */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
              <div
                className={`mx-auto bg-background transition-all duration-300 ${
                  previewDevice === "mobile"
                    ? "max-w-[390px] border border-border-custom rounded-[6px] p-4 shadow-2xl"
                    : "max-w-4xl"
                }`}
              >
                {/* Simulated Article Header */}
                <div className="space-y-3 pb-6 border-b border-border-custom/60">
                  <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
                    <span className="px-2 py-0.5 rounded-[2px] bg-accent-custom/10 text-accent-custom border border-accent-custom/20 text-[10px] font-bold">
                      {parsedBlog.category || "TECH & AI FUTURE"}
                    </span>
                    <span className="text-secondary-custom text-[11px]">
                      {parsedBlog.readTime || "5 min read"}
                    </span>
                  </div>

                  <h1 className="text-xl sm:text-2xl lg:text-[26px] font-bold tracking-tight text-foreground leading-[1.3]">
                    {parsedBlog.title || "Article Title Appears Here"}
                  </h1>

                  <div className="flex items-center gap-2 text-[11px] font-mono text-secondary-custom">
                    <span className="text-foreground font-semibold">
                      {parsedBlog.author || "Tech Infinix Team"}
                    </span>
                    <span>•</span>
                    <span>IST Date (Auto)</span>
                  </div>

                  {parsedBlog.summary && (
                    <p className="text-xs text-secondary-custom/90 leading-relaxed font-normal pt-1 border-l-2 border-accent-custom pl-3 italic bg-surface/20 rounded-r-[2px] py-1">
                      "{parsedBlog.summary}"
                    </p>
                  )}
                </div>

                {/* Cover Image in Preview */}
                {parsedBlog.coverImage && (
                  <div className="my-6 rounded-[3px] overflow-hidden border border-border-custom shadow-xl shadow-black/5 dark:shadow-black/40">
                    <img
                      src={parsedBlog.coverImage}
                      alt={parsedBlog.coverImageAlt || parsedBlog.title}
                      className="w-full h-auto aspect-[16/9] object-cover"
                    />
                  </div>
                )}

                {/* Compiled HTML Content */}
                <div
                  className="blog-content max-w-none text-foreground pt-4"
                  dangerouslySetInnerHTML={{ __html: parsedBlog.compiledHtml }}
                />

                {/* Form Checkbox Indicator */}
                {parsedBlog.includeContactForm ? (
                  <div className="mt-12 p-6 rounded-[3px] bg-surface/60 border border-dashed border-accent-custom/40 text-center space-y-2">
                    <div className="inline-flex items-center gap-1.5 text-accent-custom text-xs font-mono font-bold">
                      <Check className="w-3.5 h-3.5" />
                      <span>Lead Consultation Form Component Enabled (Above Footer)</span>
                    </div>
                    <p className="text-[11px] text-secondary-custom">
                      Upon publishing, the full interactive contact form will be rendered directly above the footer. Page begins at the top on load.
                    </p>
                  </div>
                ) : (
                  <div className="mt-12 p-4 rounded-[3px] bg-surface/30 border border-border-custom/40 text-center text-xs font-mono text-secondary-custom">
                    Bottom contact form is disabled for this article.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══════ MODAL 1: SEO HYPERLINK INSERTER ═══════ */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface border border-border-custom rounded-[3px] shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border-custom">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-accent-custom" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                  Insert SEO Hyperlink Tag
                </h3>
              </div>
              <button onClick={() => setLinkModalOpen(false)} className="text-secondary-custom hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-mono text-[11px] text-secondary-custom">Destination URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://techinfinix.com/services"
                  className="w-full px-3 py-1.5 font-mono bg-background border border-border-custom rounded-[2px] focus:outline-none focus:border-accent-custom"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[11px] text-secondary-custom">Anchor Word / Text</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="e.g. autonomous agent pipelines"
                  className="w-full px-3 py-1.5 bg-background border border-border-custom rounded-[2px] focus:outline-none focus:border-accent-custom"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[11px] text-secondary-custom">SEO Title (Tooltip / Crawl context)</label>
                <input
                  type="text"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="e.g. Explore Tech Infinix Autonomous Solutions"
                  className="w-full px-3 py-1.5 bg-background border border-border-custom rounded-[2px] focus:outline-none focus:border-accent-custom"
                />
              </div>

              <div className="pt-2 flex items-center justify-between font-mono">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={linkNewTab}
                    onChange={(e) => setLinkNewTab(e.target.checked)}
                    className="rounded accent-accent-custom"
                  />
                  <span>Open in new tab</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-secondary-custom text-[11px]">Rel:</span>
                  <select
                    value={linkRel}
                    onChange={(e: any) => setLinkRel(e.target.value)}
                    className="px-2 py-1 rounded-[2px] bg-background border border-border-custom text-xs font-mono"
                  >
                    <option value="follow">DoFollow</option>
                    <option value="nofollow">NoFollow</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border-custom flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="px-3 py-1.5 rounded-[2px] bg-background border border-border-custom text-xs font-mono text-secondary-custom hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertLinkModal}
                className="px-4 py-1.5 rounded-[2px] bg-accent-custom text-white text-xs font-mono font-semibold hover:opacity-95"
              >
                Insert [LINK] Tag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ MODAL 2: IMAGE INSERTER MODAL ═══════ */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-surface border border-border-custom rounded-[4px] shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-border-custom">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                  Insert Smart [IMAGE] Tag
                </h3>
              </div>
              <button onClick={() => setImageModalOpen(false)} className="text-secondary-custom hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Image Source Input & Live Preview */}
              <div className="space-y-1">
                <label className="font-mono text-[11px] text-secondary-custom flex items-center justify-between">
                  <span>Image Source URL (Local path, uploaded URL, or external HTTPS)</span>
                </label>
                <input
                  type="text"
                  value={imgSrc}
                  onChange={(e) => setImgSrc(e.target.value)}
                  placeholder="/images/blogs/centaur-ai-worker.jpg or https://..."
                  className="w-full px-3 py-1.5 font-mono bg-background border border-border-custom rounded-[2px] focus:outline-none focus:border-accent-custom"
                />
              </div>

              {/* Live URL Image Preview */}
              {imgSrc && (
                <div className="p-2.5 rounded-[3px] bg-background border border-border-custom flex items-center gap-3">
                  <div className="w-16 h-12 rounded-[2px] overflow-hidden bg-surface shrink-0 border border-border-custom flex items-center justify-center relative">
                    <img
                      src={imgSrc}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e: any) => {
                        e.target.style.display = "none";
                        if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div className="hidden text-[8.5px] text-amber-500 font-mono text-center p-1 leading-tight flex-col items-center justify-center w-full h-full bg-amber-500/10">
                      Unverified
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 text-[11px] font-mono text-secondary-custom">
                    <span className="text-foreground font-semibold block truncate">{imgSrc}</span>
                    <span className="text-[10px] text-emerald-500">Live URL preview connected</span>
                  </div>
                </div>
              )}

              {/* Custom SEO Alt */}
              <div className="space-y-1">
                <label className="font-mono text-[11px] text-accent-custom font-bold">
                  Custom SEO `alt` Attribute (Mandatory for Google/AEO)
                </label>
                <input
                  type="text"
                  value={imgAlt}
                  onChange={(e) => setImgAlt(e.target.value)}
                  placeholder="e.g. Multi-stage WhatsApp Bot decision trees and CRM event sync"
                  className="w-full px-3 py-1.5 bg-background border border-border-custom rounded-[2px] focus:outline-none focus:border-accent-custom"
                />
              </div>

              {/* Layout Mode Selection */}
              <div className="space-y-1 font-mono">
                <label className="text-[11px] text-secondary-custom">Layout Mode</label>
                <select
                  value={imgLayout}
                  onChange={(e: any) => setImgLayout(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-[2px] bg-background border border-border-custom text-xs font-mono"
                >
                  <option value="full">Full-Width Banner (16:9 Cinema)</option>
                  <option value="centered">Centered Inset (Charts/Screenshots)</option>
                  <option value="split-left">Side-by-Side (Image Left, Rich Content Right)</option>
                  <option value="split-right">Side-by-Side (Rich Content Left, Image Right)</option>
                  <option value="card">Media Card (Image with Header & Content)</option>
                  <option value="inline-left">Inline Floated Left (Text wraps around)</option>
                  <option value="inline-right">Inline Floated Right (Text wraps around)</option>
                </select>
              </div>

              {/* Accompanying Content Fields (shown for split or card modes to prevent empty spacing) */}
              {(imgLayout === "split-left" || imgLayout === "split-right" || imgLayout === "card") && (
                <div className="p-3 rounded-[3px] bg-surface/50 border border-accent-custom/30 space-y-2.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent-custom block">
                    Accompanying Content (Fills Side Column — Zero Empty Spacing)
                  </span>

                  <div className="space-y-1">
                    <label className="font-mono text-[11px] text-secondary-custom">Section Sub-headline</label>
                    <input
                      type="text"
                      value={imgHeadline}
                      onChange={(e) => setImgHeadline(e.target.value)}
                      placeholder="e.g. Real-Time Lead Escalation & Context Preservation"
                      className="w-full px-3 py-1.5 bg-background border border-border-custom rounded-[2px] focus:outline-none focus:border-accent-custom"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[11px] text-secondary-custom">Side Column Descriptive Text</label>
                    <textarea
                      rows={3}
                      value={imgText}
                      onChange={(e) => setImgText(e.target.value)}
                      placeholder="Write descriptive paragraphs or technical explanation that aligns directly beside the image..."
                      className="w-full px-3 py-1.5 bg-background border border-border-custom rounded-[2px] focus:outline-none focus:border-accent-custom resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Technical Caption */}
              <div className="space-y-1">
                <label className="font-mono text-[11px] text-secondary-custom">Technical Monospace Caption</label>
                <input
                  type="text"
                  value={imgCaption}
                  onChange={(e) => setImgCaption(e.target.value)}
                  placeholder="e.g. Event-driven Baileys session management with debouncing."
                  className="w-full px-3 py-1.5 font-mono bg-background border border-border-custom rounded-[2px] focus:outline-none focus:border-accent-custom"
                />
              </div>

              {/* Custom Width Selector */}
              <div className="space-y-1 font-mono">
                <label className="text-[11px] text-secondary-custom">Max Width Restriction (Optional)</label>
                <select
                  value={imgWidth}
                  onChange={(e: any) => setImgWidth(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-[2px] bg-background border border-border-custom text-xs font-mono"
                >
                  <option value="">Default (100% of container)</option>
                  <option value="80%">80% Width</option>
                  <option value="60%">60% Width</option>
                  <option value="500px">Compact 500px</option>
                  <option value="400px">Thumbnail 400px</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-border-custom flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                className="px-3 py-1.5 rounded-[2px] bg-background border border-border-custom text-xs font-mono text-secondary-custom hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertImageModal}
                className="px-4 py-1.5 rounded-[2px] bg-emerald-600 text-white text-xs font-mono font-semibold hover:opacity-95"
              >
                Insert [IMAGE] Tag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
