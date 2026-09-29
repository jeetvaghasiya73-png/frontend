"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Heading,
  AlignLeft,
  Image as ImageIcon,
  Table as TableIcon,
  BarChart2,
  Quote,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Copy,
  Link as LinkIcon,
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Eye,
  Edit3,
  Check,
  Upload,
  ExternalLink,
  Sparkles,
  Info,
  Smartphone,
  Monitor,
  X,
  FileText,
  Sliders,
  ChevronDown
} from "lucide-react";
import { API, authFetch } from "@/lib/authFetch";

export interface Block {
  id: string;
  type: "heading" | "content" | "image" | "table" | "stat_grid" | "callout" | "quote";
  data: any;
}

interface BlogVisualEditorProps {
  initialBlog?: any;
  onSave: (blogData: any) => Promise<void>;
  onCancel: () => void;
}

export default function BlogVisualEditor({
  initialBlog,
  onSave,
  onCancel
}: BlogVisualEditorProps) {
  // Metadata state
  const [title, setTitle] = useState(initialBlog?.title || "");
  const [slug, setSlug] = useState(initialBlog?.slug || "");
  const [summary, setSummary] = useState(initialBlog?.summary || "");
  const [coverImage, setCoverImage] = useState(initialBlog?.cover_image || "");
  const [coverImageAlt, setCoverImageAlt] = useState(initialBlog?.cover_image_alt || "");
  const [category, setCategory] = useState(initialBlog?.category || "TECH & AI FUTURE");
  const [readTime, setReadTime] = useState(initialBlog?.readTime || "5 min read");
  const [author, setAuthor] = useState(initialBlog?.author || "Tech Infinix Research Team");
  const [published, setPublished] = useState(initialBlog?.published || false);
  const [seoTitle, setSeoTitle] = useState(initialBlog?.seo_title || "");
  const [seoDescription, setSeoDescription] = useState(initialBlog?.seo_description || "");
  const [includeContactForm, setIncludeContactForm] = useState(
    initialBlog?.include_contact_form !== false
  );

  // Blocks state
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [activeTab, setActiveTab] = useState<"editor" | "preview" | "settings">("editor");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [saving, setSaving] = useState(false);
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);

  // Link Dialog Modal State
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [activeBlockIdForLink, setActiveBlockIdForLink] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkText, setLinkText] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkNewTab, setLinkNewTab] = useState(true);
  const [linkRel, setLinkRel] = useState<"follow" | "nofollow">("follow");

  // Generate unique block ID
  const generateId = () => `b_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  // Auto-slug generator from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .trim();
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!initialBlog?.slug || initialBlog?.slug === slug) {
      setSlug(generateSlug(val));
    }
  };

  // Convert HTML string to Block array
  const parseHtmlToBlocks = (html: string): Block[] => {
    if (!html || typeof window === "undefined") {
      return [
        {
          id: generateId(),
          type: "heading",
          data: { level: "h2", text: "1. Introduction", anchorId: "introduction" }
        },
        {
          id: generateId(),
          type: "content",
          data: { html: "<p>Start writing your in-depth article content here...</p>" }
        }
      ];
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const parsedBlocks: Block[] = [];
      const children = Array.from(doc.body.children);

      if (children.length === 0 && html.trim()) {
        parsedBlocks.push({
          id: generateId(),
          type: "content",
          data: { html: `<p>${html.trim()}</p>` }
        });
        return parsedBlocks;
      }

      children.forEach((el) => {
        const tagName = el.tagName.toLowerCase();

        // Heading block
        if (tagName === "h2" || tagName === "h3") {
          const text = el.textContent || "";
          const anchorId = el.getAttribute("id") || generateSlug(text);
          parsedBlocks.push({
            id: generateId(),
            type: "heading",
            data: { level: tagName, text, anchorId }
          });
        }
        // Stat Grid block
        else if (el.classList.contains("blog-stat-grid")) {
          const cards: { number: string; label: string }[] = [];
          el.querySelectorAll(".blog-stat-card").forEach((card) => {
            const num = card.querySelector(".blog-stat-number")?.textContent || "";
            const lbl = card.querySelector(".blog-stat-label")?.textContent || "";
            cards.push({ number: num, label: lbl });
          });
          parsedBlocks.push({
            id: generateId(),
            type: "stat_grid",
            data: { cards: cards.length > 0 ? cards : [{ number: "99.9%", label: "Uptime" }] }
          });
        }
        // Quote box
        else if (el.classList.contains("blog-quote-box")) {
          const quoteText = el.querySelector("p")?.textContent || el.textContent || "";
          const attribution = el.querySelector("span")?.textContent || "";
          parsedBlocks.push({
            id: generateId(),
            type: "quote",
            data: { quote: quoteText.replace(/^"|"$/g, ""), author: attribution.replace(/^—\s*/, "") }
          });
        }
        // Highlight Callout box
        else if (el.classList.contains("blog-highlight-box") || el.classList.contains("blog-callout")) {
          parsedBlocks.push({
            id: generateId(),
            type: "callout",
            data: {
              html: el.innerHTML,
              isHighlight: el.classList.contains("blog-highlight-box")
            }
          });
        }
        // Table block
        else if (el.classList.contains("blog-table-wrapper") || tagName === "table") {
          const tableEl = el.querySelector("table") || (tagName === "table" ? el : null);
          if (tableEl) {
            const headers: string[] = [];
            tableEl.querySelectorAll("thead th").forEach((th) => headers.push(th.textContent || ""));

            const rows: string[][] = [];
            tableEl.querySelectorAll("tbody tr").forEach((tr) => {
              const cells: string[] = [];
              tr.querySelectorAll("td").forEach((td) => cells.push(td.textContent || ""));
              if (cells.length > 0) rows.push(cells);
            });

            parsedBlocks.push({
              id: generateId(),
              type: "table",
              data: {
                headers: headers.length > 0 ? headers : ["Feature", "Description"],
                rows: rows.length > 0 ? rows : [["Sample", "Details"]]
              }
            });
          }
        }
        // Image box
        else if (el.querySelector("img")) {
          const img = el.querySelector("img")!;
          const caption = el.querySelector(".font-mono, figcaption")?.textContent || "";
          parsedBlocks.push({
            id: generateId(),
            type: "image",
            data: {
              url: img.getAttribute("src") || "",
              alt: img.getAttribute("alt") || "",
              caption: caption.trim(),
              layout: "full"
            }
          });
        }
        // Generic content block
        else {
          parsedBlocks.push({
            id: generateId(),
            type: "content",
            data: { html: el.outerHTML }
          });
        }
      });

      return parsedBlocks.length > 0
        ? parsedBlocks
        : [
            {
              id: generateId(),
              type: "heading",
              data: { level: "h2", text: "1. Overview", anchorId: "overview" }
            },
            {
              id: generateId(),
              type: "content",
              data: { html: "<p>Write your content here...</p>" }
            }
          ];
    } catch (e) {
      console.warn("Could not parse HTML into blocks, using fallback", e);
      return [
        {
          id: generateId(),
          type: "content",
          data: { html: html }
        }
      ];
    }
  };

  // Compile Block array to HTML
  const compileBlocksToHtml = (currentBlocks: Block[]): string => {
    return currentBlocks
      .map((block) => {
        switch (block.type) {
          case "heading": {
            const tag = block.data.level || "h2";
            const id = block.data.anchorId || generateSlug(block.data.text || "");
            return `<${tag} id="${id}">${block.data.text || ""}</${tag}>`;
          }

          case "content": {
            return block.data.html || "<p></p>";
          }

          case "image": {
            const { url, alt, caption, layout } = block.data;
            if (!url) return "";

            const cleanAlt = alt ? alt.replace(/"/g, "&quot;") : "Tech Infinix Architecture";
            const captionHtml = caption
              ? `<div class="p-2.5 bg-surface text-center border-t border-border-custom/50 text-[11px] text-secondary-custom font-mono">${caption}</div>`
              : "";

            if (layout === "centered") {
              return `
<div class="my-6 max-w-2xl mx-auto rounded-[3px] overflow-hidden border border-border-custom shadow-xl shadow-black/5 dark:shadow-black/40">
  <img src="${url}" alt="${cleanAlt}" class="w-full h-auto object-cover" loading="lazy" />
  ${captionHtml}
</div>`;
            } else if (layout === "side-left") {
              return `
<div class="my-6 grid grid-cols-1 md:grid-cols-2 gap-5 items-center rounded-[3px] border border-border-custom p-4 bg-surface">
  <div class="rounded-[2px] overflow-hidden border border-border-custom shadow-md">
    <img src="${url}" alt="${cleanAlt}" class="w-full h-auto object-cover aspect-[4/3]" loading="lazy" />
  </div>
  <div class="space-y-2 text-xs text-secondary-custom leading-relaxed">
    ${captionHtml ? `<p class="font-mono text-[11px] text-foreground font-semibold">${caption}</p>` : ""}
  </div>
</div>`;
            } else if (layout === "side-right") {
              return `
<div class="my-6 grid grid-cols-1 md:grid-cols-2 gap-5 items-center rounded-[3px] border border-border-custom p-4 bg-surface">
  <div class="space-y-2 text-xs text-secondary-custom leading-relaxed">
    ${captionHtml ? `<p class="font-mono text-[11px] text-foreground font-semibold">${caption}</p>` : ""}
  </div>
  <div class="rounded-[2px] overflow-hidden border border-border-custom shadow-md">
    <img src="${url}" alt="${cleanAlt}" class="w-full h-auto object-cover aspect-[4/3]" loading="lazy" />
  </div>
</div>`;
            } else {
              // Full 16:9 banner
              return `
<div class="my-6 rounded-[3px] overflow-hidden border border-border-custom shadow-xl shadow-black/5 dark:shadow-black/40">
  <img src="${url}" alt="${cleanAlt}" class="w-full h-auto aspect-[16/9] object-cover" loading="lazy" />
  ${captionHtml}
</div>`;
            }
          }

          case "table": {
            const { headers, rows } = block.data;
            if (!headers || headers.length === 0) return "";

            const theadHtml = `
    <thead>
      <tr>
        ${headers.map((h: string) => `<th>${h}</th>`).join("\n        ")}
      </tr>
    </thead>`;

            const tbodyHtml = `
    <tbody>
      ${rows
        .map(
          (row: string[]) => `
      <tr>
        ${row
          .map(
            (cell: string, idx: number) =>
              `<td ${idx === 0 ? 'class="domain-cell"' : ""} data-label="${headers[idx] || ""}">${cell}</td>`
          )
          .join("\n        ")}
      </tr>`
        )
        .join("")}
    </tbody>`;

            return `
<div class="blog-table-wrapper">
  <table class="blog-table">
    ${theadHtml}
    ${tbodyHtml}
  </table>
</div>`;
          }

          case "stat_grid": {
            const { cards } = block.data;
            if (!cards || cards.length === 0) return "";

            return `
<div class="blog-stat-grid">
  ${cards
    .map(
      (c: any) => `
  <div class="blog-stat-card">
    <div class="blog-stat-number">${c.number}</div>
    <div class="blog-stat-label">${c.label}</div>
  </div>`
    )
    .join("\n  ")}
</div>`;
          }

          case "quote": {
            const { quote, author: quoteAuthor } = block.data;
            return `
<div class="blog-quote-box">
  <p class="italic text-foreground font-medium text-xs sm:text-[13px] mb-1 leading-relaxed">"${quote}"</p>
  ${quoteAuthor ? `<span class="text-[10px] font-mono text-secondary-custom uppercase tracking-wider">— ${quoteAuthor}</span>` : ""}
</div>`;
          }

          case "callout": {
            const { html, isHighlight } = block.data;
            const cls = isHighlight ? "blog-highlight-box" : "blog-callout";
            return `
<div class="${cls}">
  ${html}
</div>`;
          }

          default:
            return "";
        }
      })
      .join("\n\n");
  };

  // Initialize blocks on mount
  useEffect(() => {
    if (initialBlog?.content) {
      setBlocks(parseHtmlToBlocks(initialBlog.content));
    } else {
      setBlocks([
        {
          id: generateId(),
          type: "heading",
          data: { level: "h2", text: "1. Executive Summary", anchorId: "executive-summary" }
        },
        {
          id: generateId(),
          type: "content",
          data: {
            html: "<p>Artificial intelligence and autonomous agent swarms are redefining enterprise engineering. In this deep dive, we break down actionable architectures and real-world benchmarks.</p>"
          }
        },
        {
          id: generateId(),
          type: "stat_grid",
          data: {
            cards: [
              { number: "10x", label: "Workflow Velocity" },
              { number: "99.4%", label: "Data Quality Score" },
              { number: "0ms", label: "Sync Latency" }
            ]
          }
        },
        {
          id: generateId(),
          type: "heading",
          data: { level: "h2", text: "2. The Technical Blueprint", anchorId: "technical-blueprint" }
        },
        {
          id: generateId(),
          type: "content",
          data: {
            html: "<p>Below is a comparative breakdown of autonomous execution against legacy manual workflows.</p>"
          }
        },
        {
          id: generateId(),
          type: "table",
          data: {
            headers: ["Domain", "Autonomous AI Agents 🤖", "Legacy Workflow ⚙️"],
            rows: [
              [
                "Response Time",
                "Instant sub-second automated reply",
                "4 to 8 hours delayed manual triage"
              ],
              [
                "Data Accuracy",
                "Schema validation with zero duplicate records",
                "Frequent copy-paste discrepancies"
              ],
              [
                "Scale Capacity",
                "10,000+ concurrent state machines",
                "Bottlenecked by staff availability"
              ]
            ]
          }
        }
      ]);
    }
  }, [initialBlog]);

  // Block Manipulations
  const addBlock = (type: Block["type"], atIndex?: number) => {
    let newBlockData: any = {};

    switch (type) {
      case "heading":
        newBlockData = { level: "h2", text: "New Section Title", anchorId: "new-section" };
        break;
      case "content":
        newBlockData = { html: "<p>Enter text here...</p>" };
        break;
      case "image":
        newBlockData = {
          url: "",
          alt: "Descriptive SEO image alternative text",
          caption: "System architectural diagram and operational telemetry.",
          layout: "full"
        };
        break;
      case "table":
        newBlockData = {
          headers: ["Capability", "Standard Spec", "Performance Outcome"],
          rows: [
            ["Data Ingestion", "Sub-50ms streaming pipeline", "Zero lag ingestion"],
            ["AI Qualification", "GPT-4o intent decision tree", "98% qualification accuracy"]
          ]
        };
        break;
      case "stat_grid":
        newBlockData = {
          cards: [
            { number: "99.9%", label: "System Availability" },
            { number: "100%", label: "Audit Compliance" }
          ]
        };
        break;
      case "quote":
        newBlockData = {
          quote: "Technology does not replace people. It replaces friction.",
          author: "Tech Infinix Engineering Principles"
        };
        break;
      case "callout":
        newBlockData = {
          html: "<p><strong>Important Note:</strong> Autonomous workflows strictly preserve human accountability at critical decision junctions.</p>",
          isHighlight: true
        };
        break;
    }

    const newBlock: Block = { id: generateId(), type, data: newBlockData };

    if (typeof atIndex === "number") {
      const updated = [...blocks];
      updated.splice(atIndex + 1, 0, newBlock);
      setBlocks(updated);
    } else {
      setBlocks([...blocks, newBlock]);
    }
  };

  const updateBlockData = (id: string, newData: any) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, data: { ...b.data, ...newData } } : b)));
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;
    const updated = [...blocks];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    setBlocks(updated);
  };

  const duplicateBlock = (index: number) => {
    const source = blocks[index];
    const cloned: Block = {
      id: generateId(),
      type: source.type,
      data: JSON.parse(JSON.stringify(source.data))
    };
    const updated = [...blocks];
    updated.splice(index + 1, 0, cloned);
    setBlocks(updated);
  };

  // Image Upload Handler
  const handleImageUpload = async (blockId: string, file: File) => {
    setUploadingImageId(blockId);
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
      if (blockId === "cover") {
        setCoverImage(data.url);
      } else {
        updateBlockData(blockId, { url: data.url });
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to upload image: " + err.message);
    } finally {
      setUploadingImageId(null);
    }
  };

  // Insert Link Modal Submit
  const handleInsertLinkSubmit = () => {
    if (!activeBlockIdForLink || !linkUrl) return;

    const targetAttr = linkNewTab ? 'target="_blank" rel="noopener noreferrer"' : "";
    const relAttr = linkRel === "nofollow" ? 'rel="nofollow noopener"' : targetAttr;
    const titleAttr = linkTitle ? `title="${linkTitle.replace(/"/g, "&quot;")}"` : "";
    const displayText = linkText || linkUrl;

    const linkHtml = `<a href="${linkUrl}" ${relAttr} ${titleAttr} class="text-accent-custom font-semibold underline underline-offset-2 hover:opacity-85 transition-opacity">${displayText}</a>`;

    const block = blocks.find((b) => b.id === activeBlockIdForLink);
    if (block) {
      const currentHtml = block.data.html || "";
      // Append or replace
      updateBlockData(activeBlockIdForLink, {
        html: currentHtml ? `${currentHtml} ${linkHtml}` : linkHtml
      });
    }

    setLinkModalOpen(false);
    setLinkUrl("https://");
    setLinkText("");
    setLinkTitle("");
    setActiveBlockIdForLink(null);
  };

  // Save Blog Handler
  const handleSaveBlog = async () => {
    if (!title.trim()) {
      alert("Please enter a title for the blog article.");
      return;
    }

    setSaving(true);
    try {
      const compiledHtml = compileBlocksToHtml(blocks);

      const payload = {
        title,
        slug: slug || generateSlug(title),
        summary: summary || title,
        content: compiledHtml,
        cover_image: coverImage || null,
        category,
        readTime,
        author,
        published,
        seo_title: seoTitle || title,
        seo_description: seoDescription || summary,
        include_contact_form: includeContactForm
      };

      await onSave(payload);
    } catch (err: any) {
      console.error(err);
      alert("Error saving blog: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Compiled HTML for real-time preview
  const previewHtml = compileBlocksToHtml(blocks);

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
              {title ? title : "Untitled Article"}
            </h1>
            <div className="flex items-center gap-2 text-[10.5px] font-mono text-secondary-custom">
              <span className="truncate">slug: /{slug || "untitled"}</span>
              <span>•</span>
              <span className={published ? "text-emerald-500 font-semibold" : "text-amber-500"}>
                {published ? "Published" : "Draft"}
              </span>
            </div>
          </div>
        </div>

        {/* Center Mode Switcher Tabs */}
        <div className="flex items-center bg-background border border-border-custom rounded-[3px] p-0.5">
          <button
            onClick={() => setActiveTab("editor")}
            className={`px-3 py-1.5 rounded-[2px] text-xs font-mono font-medium flex items-center gap-1.5 transition-all ${
              activeTab === "editor"
                ? "bg-accent-custom text-white shadow-xs"
                : "text-secondary-custom hover:text-foreground"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Visual Editor</span>
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1.5 rounded-[2px] text-xs font-mono font-medium flex items-center gap-1.5 transition-all ${
              activeTab === "preview"
                ? "bg-accent-custom text-white shadow-xs"
                : "text-secondary-custom hover:text-foreground"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-3 py-1.5 rounded-[2px] text-xs font-mono font-medium flex items-center gap-1.5 transition-all ${
              activeTab === "settings"
                ? "bg-accent-custom text-white shadow-xs"
                : "text-secondary-custom hover:text-foreground"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Article Settings</span>
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-[3px] bg-surface border border-border-custom hover:bg-background text-secondary-custom text-xs font-mono transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveBlog}
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
                <span>{published ? "Update & Publish" : "Save Draft"}</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ═══════ MAIN VIEW CONTAINER ═══════ */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* ──────────────── TAB 1: VISUAL BLOCK EDITOR ──────────────── */}
        {activeTab === "editor" && (
          <div className="space-y-6">
            {/* Top Quick Meta Strip */}
            <div className="p-4 rounded-[3px] bg-surface border border-border-custom shadow-xs space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8 space-y-1.5">
                  <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-secondary-custom">
                    Article Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Will AI Replace Humans? The Truth Behind Autonomous Agents"
                    className="w-full px-3 py-2 text-sm sm:text-base font-bold bg-background border border-border-custom rounded-[3px] focus:outline-none focus:border-accent-custom transition-colors"
                  />
                </div>
                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-secondary-custom">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. TECH & AI FUTURE"
                    className="w-full px-3 py-2 text-xs font-mono bg-background border border-border-custom rounded-[3px] focus:outline-none focus:border-accent-custom transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-secondary-custom">
                  Executive Summary / Subtitle (Appears beneath title & in meta preview)
                </label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Enter a compelling 1-2 sentence synopsis for readers and search engines..."
                  className="w-full px-3 py-2 text-xs bg-background border border-border-custom rounded-[3px] focus:outline-none focus:border-accent-custom transition-colors resize-none"
                />
              </div>

              {/* Cover Image Uploader Bar */}
              <div className="p-3 rounded-[3px] bg-background border border-border-custom flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  {coverImage ? (
                    <div className="w-12 h-12 rounded-[2px] overflow-hidden border border-border-custom shrink-0 bg-surface">
                      <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-[2px] bg-surface border border-dashed border-border-custom flex items-center justify-center text-secondary-custom shrink-0">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <span className="block text-xs font-bold text-foreground">
                      Cover Image Banner
                    </span>
                    <span className="block text-[10.5px] font-mono text-secondary-custom">
                      {coverImage ? coverImage : "No cover image set yet"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 rounded-[2px] bg-surface border border-border-custom hover:border-accent-custom text-xs font-mono font-medium text-foreground cursor-pointer flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-accent-custom" />
                    <span>Upload Cover Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload("cover", file);
                      }}
                    />
                  </label>
                  {coverImage && (
                    <button
                      onClick={() => setCoverImage("")}
                      className="p-1.5 rounded-[2px] text-secondary-custom hover:text-red-500 hover:bg-surface transition-colors"
                      title="Remove Cover"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ═══════ FLOATING ADD BLOCK TOOLBAR ═══════ */}
            <div className="flex items-center justify-between p-3 rounded-[3px] bg-surface border border-border-custom shadow-xs flex-wrap gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-secondary-custom flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-accent-custom" />
                <span>Add Content Block</span>
              </span>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => addBlock("heading")}
                  className="px-2.5 py-1.5 rounded-[2px] bg-background border border-border-custom hover:border-accent-custom hover:text-accent-custom text-xs font-mono flex items-center gap-1.5 transition-colors"
                  title="Add Section Heading (H2/H3)"
                >
                  <Heading className="w-3.5 h-3.5 text-accent-custom" />
                  <span>Heading</span>
                </button>

                <button
                  onClick={() => addBlock("content")}
                  className="px-2.5 py-1.5 rounded-[2px] bg-background border border-border-custom hover:border-accent-custom hover:text-accent-custom text-xs font-mono flex items-center gap-1.5 transition-colors"
                  title="Add Rich Paragraph"
                >
                  <AlignLeft className="w-3.5 h-3.5 text-blue-500" />
                  <span>Paragraph</span>
                </button>

                <button
                  onClick={() => addBlock("image")}
                  className="px-2.5 py-1.5 rounded-[2px] bg-background border border-border-custom hover:border-accent-custom hover:text-accent-custom text-xs font-mono flex items-center gap-1.5 transition-colors"
                  title="Add Smart Image (Auto-Adjust & Custom Alt)"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Image (Smart)</span>
                </button>

                <button
                  onClick={() => addBlock("table")}
                  className="px-2.5 py-1.5 rounded-[2px] bg-background border border-border-custom hover:border-accent-custom hover:text-accent-custom text-xs font-mono flex items-center gap-1.5 transition-colors"
                  title="Add Interactive Table (Mobile Cards Auto-Conversion)"
                >
                  <TableIcon className="w-3.5 h-3.5 text-purple-500" />
                  <span>Table Matrix</span>
                </button>

                <button
                  onClick={() => addBlock("stat_grid")}
                  className="px-2.5 py-1.5 rounded-[2px] bg-background border border-border-custom hover:border-accent-custom hover:text-accent-custom text-xs font-mono flex items-center gap-1.5 transition-colors"
                  title="Add KPI Stat Cards Grid"
                >
                  <BarChart2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Stat Grid</span>
                </button>

                <button
                  onClick={() => addBlock("quote")}
                  className="px-2.5 py-1.5 rounded-[2px] bg-background border border-border-custom hover:border-accent-custom hover:text-accent-custom text-xs font-mono flex items-center gap-1.5 transition-colors"
                  title="Add Engineering Quote Box"
                >
                  <Quote className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Quote</span>
                </button>

                <button
                  onClick={() => addBlock("callout")}
                  className="px-2.5 py-1.5 rounded-[2px] bg-background border border-border-custom hover:border-accent-custom hover:text-accent-custom text-xs font-mono flex items-center gap-1.5 transition-colors"
                  title="Add Highlight Callout Box"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Callout</span>
                </button>
              </div>
            </div>

            {/* ═══════ INTERACTIVE BLOCK CANVAS ═══════ */}
            <div className="space-y-4">
              {blocks.map((block, idx) => (
                <div
                  key={block.id}
                  className="p-4 rounded-[3px] bg-surface border border-border-custom hover:border-accent-custom/40 transition-all shadow-xs space-y-3 relative group"
                >
                  {/* Block Header Control Row */}
                  <div className="flex items-center justify-between pb-2 border-b border-border-custom/50 text-[11px] font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-[2px] bg-background border border-border-custom flex items-center justify-center font-bold text-[10px] text-accent-custom">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-foreground uppercase tracking-wider">
                        {block.type.replace("_", " ")} Block
                      </span>
                    </div>

                    {/* Block Action Icons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveBlock(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 rounded-[2px] text-secondary-custom hover:text-foreground hover:bg-background disabled:opacity-20 transition-colors"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveBlock(idx, "down")}
                        disabled={idx === blocks.length - 1}
                        className="p-1 rounded-[2px] text-secondary-custom hover:text-foreground hover:bg-background disabled:opacity-20 transition-colors"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => duplicateBlock(idx)}
                        className="p-1 rounded-[2px] text-secondary-custom hover:text-foreground hover:bg-background transition-colors"
                        title="Duplicate Block"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeBlock(block.id)}
                        className="p-1 rounded-[2px] text-secondary-custom hover:text-red-500 hover:bg-background transition-colors"
                        title="Delete Block"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* ──────────────── BLOCK TYPE 1: HEADING ──────────────── */}
                  {block.type === "heading" && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                      <div className="md:col-span-2">
                        <select
                          value={block.data.level || "h2"}
                          onChange={(e) => updateBlockData(block.id, { level: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-[2px] bg-background border border-border-custom text-xs font-mono font-bold text-accent-custom"
                        >
                          <option value="h2">H2 (Major Section)</option>
                          <option value="h3">H3 (Sub-pillar)</option>
                        </select>
                      </div>
                      <div className="md:col-span-6">
                        <input
                          type="text"
                          value={block.data.text || ""}
                          onChange={(e) => {
                            const newText = e.target.value;
                            updateBlockData(block.id, {
                              text: newText,
                              anchorId: block.data.anchorId || generateSlug(newText)
                            });
                          }}
                          placeholder="e.g. 1. The Friction Economy"
                          className="w-full px-3 py-1.5 rounded-[2px] bg-background border border-border-custom text-sm font-bold text-foreground focus:outline-none focus:border-accent-custom"
                        />
                      </div>
                      <div className="md:col-span-4 flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-secondary-custom shrink-0">
                          TOC Anchor: #
                        </span>
                        <input
                          type="text"
                          value={block.data.anchorId || ""}
                          onChange={(e) => updateBlockData(block.id, { anchorId: e.target.value })}
                          placeholder="anchor-id"
                          className="w-full px-2 py-1 rounded-[2px] bg-background border border-border-custom text-xs font-mono text-secondary-custom focus:outline-none focus:border-accent-custom"
                        />
                      </div>
                    </div>
                  )}

                  {/* ──────────────── BLOCK TYPE 2: CONTENT / PARAGRAPH ──────────────── */}
                  {block.type === "content" && (
                    <div className="space-y-2">
                      {/* Rich Format Bar */}
                      <div className="flex items-center gap-1.5 p-1 rounded-[2px] bg-background border border-border-custom flex-wrap text-xs font-mono">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveBlockIdForLink(block.id);
                            setLinkModalOpen(true);
                          }}
                          className="px-2 py-1 rounded-[2px] bg-surface hover:bg-accent-custom/10 hover:text-accent-custom border border-border-custom/80 flex items-center gap-1 text-[11px] font-semibold text-foreground transition-colors"
                          title="Convert word/selection to SEO Hyperlink"
                        >
                          <LinkIcon className="w-3 h-3 text-accent-custom" />
                          <span>Insert SEO Hyperlink</span>
                        </button>

                        <span className="h-4 w-[1px] bg-border-custom mx-1" />

                        <button
                          type="button"
                          onClick={() => {
                            updateBlockData(block.id, {
                              html: `${block.data.html || ""}<p><strong>Key takeaway:</strong> </p>`
                            });
                          }}
                          className="px-2 py-1 rounded-[2px] hover:bg-surface text-secondary-custom hover:text-foreground text-[11px] transition-colors"
                        >
                          <strong>Bold</strong>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            updateBlockData(block.id, {
                              html: `${block.data.html || ""}<p><em>Note:</em> </p>`
                            });
                          }}
                          className="px-2 py-1 rounded-[2px] hover:bg-surface text-secondary-custom hover:text-foreground text-[11px] transition-colors"
                        >
                          <em>Italic</em>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            updateBlockData(block.id, {
                              html: `${block.data.html || ""}<ul class="space-y-1.5 my-2.5">\n  <li>Point one</li>\n  <li>Point two</li>\n</ul>`
                            });
                          }}
                          className="px-2 py-1 rounded-[2px] hover:bg-surface text-secondary-custom hover:text-foreground text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <List className="w-3 h-3" />
                          <span>Bullets</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            updateBlockData(block.id, {
                              html: `${block.data.html || ""}<ol class="space-y-2 my-2.5">\n  <li>First step</li>\n  <li>Second step</li>\n</ol>`
                            });
                          }}
                          className="px-2 py-1 rounded-[2px] hover:bg-surface text-secondary-custom hover:text-foreground text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <ListOrdered className="w-3 h-3" />
                          <span>Numbered</span>
                        </button>
                      </div>

                      {/* Text Input / HTML Content */}
                      <textarea
                        rows={4}
                        value={block.data.html || ""}
                        onChange={(e) => updateBlockData(block.id, { html: e.target.value })}
                        placeholder="Write paragraphs or HTML formatted content here..."
                        className="w-full p-3 text-xs leading-relaxed font-sans bg-background border border-border-custom rounded-[2px] focus:outline-none focus:border-accent-custom transition-colors font-mono"
                      />
                    </div>
                  )}

                  {/* ──────────────── BLOCK TYPE 3: SMART IMAGE (AUTO-ADJUST & SEO ALT) ──────────────── */}
                  {block.type === "image" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                        <div className="md:col-span-8 flex items-center gap-2">
                          <input
                            type="text"
                            value={block.data.url || ""}
                            onChange={(e) => updateBlockData(block.id, { url: e.target.value })}
                            placeholder="Image URL (e.g. /images/blogs/centaur-ai-worker.jpg or external)"
                            className="flex-1 px-3 py-1.5 text-xs font-mono bg-background border border-border-custom rounded-[2px] focus:outline-none focus:border-accent-custom"
                          />
                          <label className="px-3 py-1.5 rounded-[2px] bg-accent-custom text-white hover:opacity-95 text-xs font-mono font-medium flex items-center gap-1.5 cursor-pointer shrink-0 transition-opacity">
                            {uploadingImageId === block.id ? (
                              <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                            ) : (
                              <Upload className="w-3.5 h-3.5" />
                            )}
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(block.id, file);
                              }}
                            />
                          </label>
                        </div>

                        {/* Layout Selector */}
                        <div className="md:col-span-4">
                          <select
                            value={block.data.layout || "full"}
                            onChange={(e) => updateBlockData(block.id, { layout: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-[2px] bg-background border border-border-custom text-xs font-mono font-semibold text-foreground"
                          >
                            <option value="full">Full-Width Banner (16:9)</option>
                            <option value="centered">Centered Inset (Charts/Screens)</option>
                            <option value="side-left">Side-by-Side (Image Left)</option>
                            <option value="side-right">Side-by-Side (Image Right)</option>
                          </select>
                        </div>
                      </div>

                      {/* Custom Alt (SEO) and Caption */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10.5px] font-mono font-bold text-accent-custom uppercase tracking-wider flex items-center gap-1">
                            <span>Custom SEO `alt` Attribute (Mandatory for Google/AEO):</span>
                          </label>
                          <input
                            type="text"
                            value={block.data.alt || ""}
                            onChange={(e) => updateBlockData(block.id, { alt: e.target.value })}
                            placeholder="e.g. Autonomous AI agent network orchestrating enterprise data pipelines"
                            className="w-full px-2.5 py-1.5 text-xs bg-background border border-border-custom rounded-[2px] focus:outline-none focus:border-accent-custom"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10.5px] font-mono font-semibold text-secondary-custom uppercase tracking-wider">
                            Monospace Tech Caption:
                          </label>
                          <input
                            type="text"
                            value={block.data.caption || ""}
                            onChange={(e) => updateBlockData(block.id, { caption: e.target.value })}
                            placeholder="e.g. Autonomous agent network orchestrating multi-step data pipelines in real time."
                            className="w-full px-2.5 py-1.5 text-xs font-mono bg-background border border-border-custom rounded-[2px] focus:outline-none focus:border-accent-custom"
                          />
                        </div>
                      </div>

                      {/* Image Preview Box */}
                      {block.data.url && (
                        <div className="p-2 rounded-[2px] bg-background border border-border-custom/60 flex items-center gap-3">
                          <div className="w-20 h-14 rounded-[2px] overflow-hidden border border-border-custom bg-surface shrink-0">
                            <img
                              src={block.data.url}
                              alt={block.data.alt || ""}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="text-[10.5px] font-mono text-secondary-custom min-w-0 space-y-0.5">
                            <span className="block truncate text-foreground font-semibold">
                              {block.data.url}
                            </span>
                            <span className="block">
                              Layout: <strong className="text-accent-custom">{block.data.layout}</strong> • Alt: "{block.data.alt}"
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ──────────────── BLOCK TYPE 4: TABLE MATRIX (RESPONSIVE CARDS) ──────────────── */}
                  {block.type === "table" && (
                    <div className="space-y-3">
                      {/* Table Controls */}
                      <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
                        <span className="text-[10.5px] text-secondary-custom">
                          Auto-adapts into responsive stacked cards on mobile screens (&lt;640px).
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const newHeaders = [...block.data.headers, `Column ${block.data.headers.length + 1}`];
                              const newRows = block.data.rows.map((r: string[]) => [...r, "Data"]);
                              updateBlockData(block.id, { headers: newHeaders, rows: newRows });
                            }}
                            className="px-2 py-1 rounded-[2px] bg-background border border-border-custom hover:border-accent-custom text-[11px] font-medium transition-colors"
                          >
                            + Add Column
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const newRows = [...block.data.rows, new Array(block.data.headers.length).fill("Data")];
                              updateBlockData(block.id, { rows: newRows });
                            }}
                            className="px-2 py-1 rounded-[2px] bg-background border border-border-custom hover:border-accent-custom text-[11px] font-medium transition-colors"
                          >
                            + Add Row
                          </button>
                        </div>
                      </div>

                      {/* Table Grid Inputs */}
                      <div className="overflow-x-auto border border-border-custom rounded-[2px]">
                        <table className="w-full border-collapse text-xs">
                          <thead>
                            <tr className="bg-background border-b border-border-custom">
                              {block.data.headers.map((hdr: string, colIdx: number) => (
                                <th key={colIdx} className="p-1.5 text-left border-r border-border-custom last:border-r-0">
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={hdr}
                                      onChange={(e) => {
                                        const updatedHeaders = [...block.data.headers];
                                        updatedHeaders[colIdx] = e.target.value;
                                        updateBlockData(block.id, { headers: updatedHeaders });
                                      }}
                                      className="w-full px-1.5 py-1 rounded-[2px] bg-surface border border-border-custom text-[11px] font-mono font-bold text-accent-custom"
                                    />
                                    {block.data.headers.length > 2 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newH = block.data.headers.filter((_: any, i: number) => i !== colIdx);
                                          const newR = block.data.rows.map((row: string[]) =>
                                            row.filter((_: any, i: number) => i !== colIdx)
                                          );
                                          updateBlockData(block.id, { headers: newH, rows: newR });
                                        }}
                                        className="text-secondary-custom hover:text-red-500 p-0.5"
                                        title="Delete column"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </th>
                              ))}
                              <th className="w-8 p-1.5"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {block.data.rows.map((row: string[], rowIdx: number) => (
                              <tr key={rowIdx} className="border-b border-border-custom/50 last:border-b-0">
                                {row.map((cell: string, cellIdx: number) => (
                                  <td key={cellIdx} className="p-1.5 border-r border-border-custom/50 last:border-r-0">
                                    <input
                                      type="text"
                                      value={cell}
                                      onChange={(e) => {
                                        const newRows = [...block.data.rows];
                                        newRows[rowIdx][cellIdx] = e.target.value;
                                        updateBlockData(block.id, { rows: newRows });
                                      }}
                                      className="w-full px-1.5 py-1 rounded-[2px] bg-background border border-border-custom text-xs"
                                    />
                                  </td>
                                ))}
                                <td className="p-1.5 text-center">
                                  {block.data.rows.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newRows = block.data.rows.filter((_: any, i: number) => i !== rowIdx);
                                        updateBlockData(block.id, { rows: newRows });
                                      }}
                                      className="text-secondary-custom hover:text-red-500 p-0.5"
                                      title="Delete row"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* ──────────────── BLOCK TYPE 5: STAT / KPI GRID ──────────────── */}
                  {block.type === "stat_grid" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-secondary-custom">
                          Stat Cards (renders gradient KPI numbers)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const newCards = [...block.data.cards, { number: "100%", label: "Metric Label" }];
                            updateBlockData(block.id, { cards: newCards });
                          }}
                          className="px-2 py-1 rounded-[2px] bg-background border border-border-custom hover:border-accent-custom text-[11px]"
                        >
                          + Add Card
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {block.data.cards.map((card: any, cardIdx: number) => (
                          <div key={cardIdx} className="p-2.5 rounded-[2px] bg-background border border-border-custom space-y-2 relative">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-secondary-custom uppercase">
                                Metric #{cardIdx + 1}
                              </span>
                              {block.data.cards.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newCards = block.data.cards.filter((_: any, i: number) => i !== cardIdx);
                                    updateBlockData(block.id, { cards: newCards });
                                  }}
                                  className="text-secondary-custom hover:text-red-500"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            <input
                              type="text"
                              value={card.number}
                              onChange={(e) => {
                                const newCards = [...block.data.cards];
                                newCards[cardIdx].number = e.target.value;
                                updateBlockData(block.id, { cards: newCards });
                              }}
                              placeholder="e.g. 99.4%"
                              className="w-full px-2 py-1 rounded-[2px] bg-surface border border-border-custom text-sm font-bold text-accent-custom"
                            />
                            <input
                              type="text"
                              value={card.label}
                              onChange={(e) => {
                                const newCards = [...block.data.cards];
                                newCards[cardIdx].label = e.target.value;
                                updateBlockData(block.id, { cards: newCards });
                              }}
                              placeholder="e.g. Data Accuracy"
                              className="w-full px-2 py-1 rounded-[2px] bg-surface border border-border-custom text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ──────────────── BLOCK TYPE 6: QUOTE BOX ──────────────── */}
                  {block.type === "quote" && (
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        value={block.data.quote || ""}
                        onChange={(e) => updateBlockData(block.id, { quote: e.target.value })}
                        placeholder="Enter the quotation text..."
                        className="w-full p-2.5 text-xs italic bg-background border border-border-custom rounded-[2px] focus:outline-none focus:border-accent-custom"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-secondary-custom shrink-0">
                          Attribution:
                        </span>
                        <input
                          type="text"
                          value={block.data.author || ""}
                          onChange={(e) => updateBlockData(block.id, { author: e.target.value })}
                          placeholder="e.g. Tech Infinix Engineering Principles"
                          className="w-full px-2.5 py-1 text-xs font-mono bg-background border border-border-custom rounded-[2px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* ──────────────── BLOCK TYPE 7: CALLOUT BOX ──────────────── */}
                  {block.type === "callout" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-mono text-secondary-custom">
                          Callout Content
                        </label>
                        <label className="inline-flex items-center gap-1.5 text-xs font-mono cursor-pointer">
                          <input
                            type="checkbox"
                            checked={block.data.isHighlight}
                            onChange={(e) => updateBlockData(block.id, { isHighlight: e.target.checked })}
                            className="rounded accent-accent-custom"
                          />
                          <span>Indigo Gradient Highlight</span>
                        </label>
                      </div>
                      <textarea
                        rows={3}
                        value={block.data.html || ""}
                        onChange={(e) => updateBlockData(block.id, { html: e.target.value })}
                        placeholder="Enter callout text or HTML..."
                        className="w-full p-2.5 text-xs bg-background border border-border-custom rounded-[2px] focus:outline-none focus:border-accent-custom font-mono"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom Add Block Trigger */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => addBlock("content")}
                className="px-4 py-2 rounded-[3px] bg-surface border border-dashed border-border-custom hover:border-accent-custom hover:text-accent-custom text-xs font-mono font-medium inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Next Content Block</span>
              </button>
            </div>
          </div>
        )}

        {/* ──────────────── TAB 2: LIVE PREVIEW ──────────────── */}
        {activeTab === "preview" && (
          <div className="space-y-6">
            {/* Device Switcher Bar */}
            <div className="flex items-center justify-between p-3 rounded-[3px] bg-surface border border-border-custom">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewDevice("desktop")}
                  className={`px-3 py-1 rounded-[2px] text-xs font-mono font-medium flex items-center gap-1.5 transition-colors ${
                    previewDevice === "desktop"
                      ? "bg-accent-custom text-white"
                      : "text-secondary-custom hover:text-foreground"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop View (100% width)</span>
                </button>
                <button
                  onClick={() => setPreviewDevice("mobile")}
                  className={`px-3 py-1 rounded-[2px] text-xs font-mono font-medium flex items-center gap-1.5 transition-colors ${
                    previewDevice === "mobile"
                      ? "bg-accent-custom text-white"
                      : "text-secondary-custom hover:text-foreground"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile View (390px - Stacked Cards & Snap)</span>
                </button>
              </div>

              <span className="text-[11px] font-mono text-secondary-custom">
                {previewDevice === "desktop" ? "Full 12-Column Responsive Layout" : "Simulated Smartphone Layout"}
              </span>
            </div>

            {/* Preview Viewport Canvas */}
            <div
              className={`mx-auto bg-background border border-border-custom rounded-[3px] p-6 transition-all duration-300 shadow-xl ${
                previewDevice === "mobile" ? "max-w-[420px]" : "max-w-5xl"
              }`}
            >
              {/* Article Top */}
              <div className="space-y-3 pb-6 border-b border-border-custom/60">
                <span className="inline-block px-2.5 py-0.5 rounded-[2px] bg-accent-custom/10 text-accent-custom border border-accent-custom/20 text-[10px] font-mono font-bold">
                  {category}
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
                  {title || "Untitled Article"}
                </h1>
                <div className="flex items-center gap-3 text-[11px] font-mono text-secondary-custom">
                  <span>{author}</span>
                  <span>•</span>
                  <span>{readTime}</span>
                </div>
                {summary && (
                  <p className="text-xs text-secondary-custom italic border-l-2 border-accent-custom pl-3 py-1 bg-surface/20">
                    "{summary}"
                  </p>
                )}
              </div>

              {/* Cover Image in Preview */}
              {coverImage && (
                <div className="my-6 rounded-[3px] overflow-hidden border border-border-custom shadow-md">
                  <img
                    src={coverImage}
                    alt={coverImageAlt || title}
                    className="w-full h-auto aspect-[16/9] object-cover"
                  />
                </div>
              )}

              {/* Compiled Content */}
              <div
                className="blog-content text-foreground pt-4"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />

              {/* Contact Form Preview Toggle Indicator */}
              {includeContactForm ? (
                <div className="mt-12 p-6 rounded-[3px] bg-surface/60 border border-dashed border-accent-custom/40 text-center space-y-2">
                  <div className="inline-flex items-center gap-1.5 text-accent-custom text-xs font-mono font-bold">
                    <Check className="w-3.5 h-3.5" />
                    <span>Lead Consultation Form Component Enabled (Above Footer)</span>
                  </div>
                  <p className="text-[11px] text-secondary-custom">
                    Upon publishing, the full interactive contact form will be seamlessly integrated above the footer. Auto-redirect on page load is disabled.
                  </p>
                </div>
              ) : (
                <div className="mt-12 p-4 rounded-[3px] bg-surface/30 border border-border-custom/40 text-center text-xs font-mono text-secondary-custom">
                  Bottom contact form is disabled for this article.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ──────────────── TAB 3: ARTICLE SETTINGS & SEO ──────────────── */}
        {activeTab === "settings" && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Publishing Status & Form Settings Card */}
            <div className="p-5 rounded-[3px] bg-surface border border-border-custom shadow-xs space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-accent-custom flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                <span>Publication & Engagement Settings</span>
              </h3>

              {/* Published Toggle */}
              <div className="flex items-center justify-between p-3 rounded-[2px] bg-background border border-border-custom">
                <div>
                  <span className="block text-xs font-bold text-foreground">Publish to Public Site</span>
                  <span className="block text-[11px] text-secondary-custom">
                    When active, this article is visible to all website visitors and search engines.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-border-custom peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-custom"></div>
                </label>
              </div>

              {/* Contact Form Checkbox (CRITICAL USER REQUIREMENT) */}
              <div className="flex items-start justify-between p-3 rounded-[2px] bg-background border border-border-custom gap-3">
                <div className="space-y-0.5">
                  <span className="block text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-accent-custom" />
                    <span>Display Lead Consultation Form Above Footer</span>
                  </span>
                  <span className="block text-[11px] text-secondary-custom leading-relaxed">
                    Adds the high-converting proposal & contact form directly before the footer. Visitors landing on the blog will start at the top and will <strong>not</strong> be auto-redirected or jumped to the bottom form.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={includeContactForm}
                  onChange={(e) => setIncludeContactForm(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-border-custom accent-accent-custom cursor-pointer"
                />
              </div>
            </div>

            {/* SEO & Meta Tag Control Card */}
            <div className="p-5 rounded-[3px] bg-surface border border-border-custom shadow-xs space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-accent-custom flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>SEO & Search Engine Optimization (AEO)</span>
              </h3>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-secondary-custom">
                  Custom SEO Title Tag (60 chars recommended)
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder={title || "SEO optimized title..."}
                  className="w-full px-3 py-2 text-xs bg-background border border-border-custom rounded-[2px] focus:outline-none focus:border-accent-custom font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-secondary-custom">
                  SEO Meta Description (155-160 chars recommended)
                </label>
                <textarea
                  rows={3}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder={summary || "Search engine snippet for Google and AI engines..."}
                  className="w-full px-3 py-2 text-xs bg-background border border-border-custom rounded-[2px] focus:outline-none focus:border-accent-custom font-mono resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-secondary-custom">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-background border border-border-custom rounded-[2px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-secondary-custom">
                    Estimated Read Time
                  </label>
                  <input
                    type="text"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-background border border-border-custom rounded-[2px]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══════ SEO HYPERLINK DIALOG MODAL ═══════ */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-surface border border-border-custom rounded-[3px] shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border-custom">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-accent-custom" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                  Insert SEO Hyperlink
                </h3>
              </div>
              <button
                onClick={() => setLinkModalOpen(false)}
                className="text-secondary-custom hover:text-foreground p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-secondary-custom font-semibold">
                  Destination URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com/feature or /services"
                  className="w-full px-3 py-1.5 text-xs font-mono bg-background border border-border-custom rounded-[2px] focus:outline-none focus:border-accent-custom"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-secondary-custom font-semibold">
                  Anchor Text / Link Word
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="e.g. autonomous agent pipelines"
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border-custom rounded-[2px] focus:outline-none focus:border-accent-custom"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-secondary-custom font-semibold">
                  SEO Title Attribute (Tooltip / Crawl Context)
                </label>
                <input
                  type="text"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="e.g. Learn more about Tech Infinix Autonomous Agent Pipelines"
                  className="w-full px-3 py-1.5 text-xs bg-background border border-border-custom rounded-[2px] focus:outline-none focus:border-accent-custom"
                />
              </div>

              <div className="pt-2 flex items-center justify-between text-xs font-mono">
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
                  <span className="text-[11px] text-secondary-custom">SEO Rel:</span>
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
                onClick={handleInsertLinkSubmit}
                className="px-4 py-1.5 rounded-[2px] bg-accent-custom text-white text-xs font-mono font-semibold hover:opacity-95"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
