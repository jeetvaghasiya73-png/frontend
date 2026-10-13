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
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Sparkles,
  Link as LinkIcon,
  Image as ImageIcon,
  Columns,
  Code,
  Minus,
  LayoutGrid,
  Smartphone,
  Monitor,
  X,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Trash2,
  Save,
  CheckCircle2
} from "lucide-react";
import { API, authFetch } from "@/lib/authFetch";
import { slugify, parseTaggedBlog } from "@/lib/blogTagParser";

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
  // ─── METADATA FIELDS ───
  const [title, setTitle] = useState(initialBlog?.title || "");
  const [slug, setSlug] = useState(initialBlog?.slug || "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initialBlog?.slug);
  const [category, setCategory] = useState(initialBlog?.category || "AI & AUTOMATION");
  const [author, setAuthor] = useState(initialBlog?.author || "Tech Infinix Research Team");
  const [readTime, setReadTime] = useState(initialBlog?.readTime || initialBlog?.read_time || "5 min read");
  const [summary, setSummary] = useState(initialBlog?.summary || "");
  const [coverImage, setCoverImage] = useState(initialBlog?.cover_image || initialBlog?.image || "");
  const [includeForm, setIncludeForm] = useState(initialBlog?.include_contact_form !== false);
  const [published, setPublished] = useState(initialBlog?.published || false);

  // ─── CONTENT STATE ───
  const [content, setContent] = useState("");
  const [viewMode, setViewMode] = useState<"editor" | "split" | "preview">("split");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingBodyImg, setUploadingBodyImg] = useState(false);

  // Modals
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkText, setLinkText] = useState("");
  const [linkNewTab, setLinkNewTab] = useState(true);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [imgAlt, setImgAlt] = useState("");
  const [imgCaption, setImgCaption] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Load initialBlog or start completely fresh with clean empty fields
  useEffect(() => {
    if (initialBlog) {
      setTitle(initialBlog.title || "");
      setSlug(initialBlog.slug || "");
      setSlugManuallyEdited(true);
      setCategory(initialBlog.category || "AI & AUTOMATION");
      setAuthor(initialBlog.author || "Tech Infinix Research Team");
      setReadTime(initialBlog.readTime || initialBlog.read_time || "5 min read");
      setSummary(initialBlog.summary || "");
      setCoverImage(initialBlog.cover_image || initialBlog.image || "");
      setIncludeForm(initialBlog.include_contact_form !== false);
      setPublished(initialBlog.published || false);

      // Clean HTML or tags
      let rawContent = initialBlog.content || "";
      const sourceMatch = rawContent.match(/<!--\s*TECH_INFINIX_TAGGED_SOURCE_START\s*\n([\s\S]*?)\n\s*TECH_INFINIX_TAGGED_SOURCE_END\s*-->/);
      if (sourceMatch) {
        rawContent = sourceMatch[1].trim();
      } else {
        rawContent = rawContent.replace(/<!--[\s\S]*?-->/g, "").trim();
      }
      setContent(rawContent);
    } else {
      // Start completely clean - NO hardcoded demo blogs!
      setTitle("");
      setSlug("");
      setSlugManuallyEdited(false);
      setCategory("AI & AUTOMATION");
      setAuthor("Tech Infinix Research Team");
      setReadTime("5 min read");
      setSummary("");
      setCoverImage("");
      setIncludeForm(true);
      setPublished(false);
      setContent("");
    }
  }, [initialBlog]);

  // Auto-slugify when title changes (unless user manually customized slug)
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!slugManuallyEdited) {
      setSlug(slugify(newTitle));
    }
  };

  // Word count & read time helper
  const wordCount = useMemo(() => {
    const textOnly = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return textOnly ? textOnly.split(" ").length : 0;
  }, [content]);

  const handleAutoCalculateReadTime = () => {
    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    setReadTime(`${minutes} min read`);
  };

  // ─── SELECTION FORMATTING TOOLBAR HELPERS ───
  const applyFormatting = (before: string, after: string = "", defaultText: string = "") => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;
    const selected = current.substring(start, end);

    const replacement = selected ? `${before}${selected}${after}` : `${before}${defaultText}${after}`;
    const updated = current.substring(0, start) + replacement + current.substring(end);
    setContent(updated);

    setTimeout(() => {
      textarea.focus();
      const newCursor = start + replacement.length;
      textarea.setSelectionRange(newCursor, newCursor);
    }, 10);
  };

  const handleFormatBold = () => applyFormatting("<strong>", "</strong>", "bold text");
  const handleFormatItalic = () => applyFormatting("<em>", "</em>", "italic text");
  const handleFormatUnderline = () => applyFormatting("<u>", "</u>", "underlined text");
  const handleFormatStrike = () => applyFormatting("<s>", "</s>", "strikethrough text");

  const handleFormatHeading = (level: 1 | 2 | 3) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;
    const selected = current.substring(start, end) || `Section Heading ${level}`;

    let tag = `h${level}`;
    let classes = "";
    if (level === 1) classes = "text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground my-5";
    if (level === 2) classes = "text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-8 mb-3 pt-3 border-b border-border-custom/50";
    if (level === 3) classes = "text-lg font-semibold text-foreground mt-6 mb-2";

    const snippet = `\n<${tag} class="${classes}">${selected}</${tag}>\n`;
    const updated = current.substring(0, start) + snippet + current.substring(end);
    setContent(updated);
  };

  const handleFormatQuote = () => {
    applyFormatting(
      '\n<blockquote class="border-l-[6px] border-accent-custom pl-4 py-2 my-4 italic text-foreground/90 bg-surface/40 rounded-r-[2px]">\n',
      "\n</blockquote>\n",
      "Insert quote here..."
    );
  };

  const handleFormatCallout = () => {
    applyFormatting(
      '\n<div class="border border-border-custom border-l-[8px] border-l-accent-custom bg-surface p-5 my-6 rounded-[3px] shadow-xs">\n  <div class="font-bold text-accent-custom text-xs uppercase mb-1.5 flex items-center gap-1.5">\n    <span class="w-2 h-2 bg-accent-custom inline-block rounded-[1px]"></span>Key Takeaway\n  </div>\n  <p class="text-sm text-foreground/90 leading-relaxed">',
      "</p>\n</div>\n",
      "Highlight critical finding, strategy insight, or executive summary point here."
    );
  };

  const handleFormatBulletList = () => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;
    const selected = current.substring(start, end);

    if (selected) {
      const items = selected.split("\n").filter(Boolean).map(l => `  <li>${l.replace(/^[-*•]\s*/, "")}</li>`).join("\n");
      const listSnippet = `\n<ul class="list-disc pl-6 space-y-1.5 my-4 text-foreground/90">\n${items}\n</ul>\n`;
      const updated = current.substring(0, start) + listSnippet + current.substring(end);
      setContent(updated);
    } else {
      applyFormatting('\n<ul class="list-disc pl-6 space-y-1.5 my-4 text-foreground/90">\n  <li>First point</li>\n  <li>Second point</li>\n  <li>Third point</li>\n</ul>\n');
    }
  };

  const handleFormatNumberList = () => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;
    const selected = current.substring(start, end);

    if (selected) {
      const items = selected.split("\n").filter(Boolean).map(l => `  <li>${l.replace(/^\d+[\.\)]\s*/, "")}</li>`).join("\n");
      const listSnippet = `\n<ol class="list-decimal pl-6 space-y-1.5 my-4 text-foreground/90">\n${items}\n</ol>\n`;
      const updated = current.substring(0, start) + listSnippet + current.substring(end);
      setContent(updated);
    } else {
      applyFormatting('\n<ol class="list-decimal pl-6 space-y-1.5 my-4 text-foreground/90">\n  <li>Step one</li>\n  <li>Step two</li>\n  <li>Step three</li>\n</ol>\n');
    }
  };

  const handleFormatCodeBlock = () => {
    applyFormatting(
      '\n<pre class="bg-black/95 border border-border-custom p-4 rounded-[2px] font-mono text-xs text-emerald-400 overflow-x-auto my-4"><code>',
      "</code></pre>\n",
      "// write code or configuration here"
    );
  };

  const handleFormatDivider = () => {
    applyFormatting("\n<hr class=\"my-8 border-border-custom\" />\n");
  };

  const handleFormatStatsGrid = () => {
    applyFormatting(
      '\n<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">\n' +
      '  <div class="p-4 bg-surface border border-border-custom border-l-[6px] border-l-accent-custom rounded-[2px] text-center">\n' +
      '    <div class="text-2xl font-black text-accent-custom font-mono">99.8%</div>\n' +
      '    <div class="text-xs font-mono text-secondary-custom mt-1">Accuracy Score</div>\n' +
      '  </div>\n' +
      '  <div class="p-4 bg-surface border border-border-custom border-l-[6px] border-l-accent-custom rounded-[2px] text-center">\n' +
      '    <div class="text-2xl font-black text-accent-custom font-mono">&lt;3s</div>\n' +
      '    <div class="text-xs font-mono text-secondary-custom mt-1">Response Latency</div>\n' +
      '  </div>\n' +
      '  <div class="p-4 bg-surface border border-border-custom border-l-[6px] border-l-accent-custom rounded-[2px] text-center">\n' +
      '    <div class="text-2xl font-black text-accent-custom font-mono">10x</div>\n' +
      '    <div class="text-xs font-mono text-secondary-custom mt-1">Qualification ROI</div>\n' +
      '  </div>\n' +
      '</div>\n'
    );
  };

  // Submit Link modal
  const handleInsertLink = () => {
    if (!linkUrl) return;
    const target = linkNewTab ? ' target="_blank" rel="noopener noreferrer"' : "";
    const displayText = linkText || linkUrl;
    applyFormatting(`<a href="${linkUrl}"${target} class="text-accent-custom underline font-semibold hover:opacity-80">`, "</a>", displayText);
    setLinkModalOpen(false);
    setLinkUrl("https://");
    setLinkText("");
  };

  // Submit Image Modal
  const handleInsertImage = () => {
    if (!imgSrc) return;
    const figureHtml =
      `\n<figure class="my-6 border border-border-custom bg-surface rounded-[3px] border-l-[6px] border-l-accent-custom overflow-hidden">\n` +
      `  <img src="${imgSrc}" alt="${imgAlt || title}" class="w-full h-auto object-cover" />\n` +
      (imgCaption ? `  <figcaption class="p-2.5 bg-surface/90 text-xs font-mono text-secondary-custom text-center border-t border-border-custom/50">${imgCaption}</figcaption>\n` : "") +
      `</figure>\n`;
    applyFormatting(figureHtml);
    setImageModalOpen(false);
    setImgSrc("");
    setImgAlt("");
    setImgCaption("");
  };

  // Upload Image file to backend endpoint
  const handleUploadFile = async (file: File, target: "cover" | "body") => {
    const isCover = target === "cover";
    if (isCover) setUploadingCover(true);
    else setUploadingBodyImg(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await authFetch(`${API}/api/v1/blogs/upload-image`, {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.detail || "Image upload failed");
        return;
      }

      const data = await res.json();
      if (isCover) {
        setCoverImage(data.url);
      } else {
        setImgSrc(data.url);
        const filenameClean = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setImgAlt(filenameClean);
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to upload image: " + err.message);
    } finally {
      if (isCover) setUploadingCover(false);
      else setUploadingBodyImg(false);
    }
  };

  // Compile raw content into clean semantic HTML
  const compiledContent = useMemo(() => {
    if (!content.trim()) return "";

    // If content contains legacy tags, let parseTaggedBlog compile them cleanly
    if (content.includes("[SECTION") || content.includes("[HIGHLIGHT") || content.includes("[STAT_GRID") || content.includes("[TABLE]")) {
      const parsed = parseTaggedBlog(content);
      return parsed.compiledHtml;
    }

    // Process raw paragraphs if plain text was pasted
    const blocks = content.split(/\n\s*\n/);
    const htmlBlocks = blocks.map((b) => {
      const trimmed = b.trim();
      if (!trimmed) return "";
      // If block is already an HTML tag (<h1, <h2, <p, <div, <blockquote, <figure, <ul, <ol, <pre, <table, <hr), preserve it directly
      if (/^<(h[1-6]|p|div|blockquote|figure|ul|ol|pre|table|hr|section)/i.test(trimmed)) {
        return trimmed;
      }
      return `<p class="my-4 text-sm sm:text-base text-foreground/90 leading-relaxed">${trimmed.replace(/\n/g, "<br />")}</p>`;
    });

    return htmlBlocks.filter(Boolean).join("\n\n");
  }, [content]);

  // Save Blog Handler
  const handleSave = async (isPublishing: boolean) => {
    if (!title.trim()) {
      alert("Please provide a Title for the blog article.");
      return;
    }

    setSaving(true);
    try {
      const finalSlug = slug.trim() || slugify(title);
      const payload = {
        title: title.trim(),
        slug: finalSlug,
        category: category.trim() || "TECH & ENGINEERING",
        readTime: readTime.trim() || "5 min read",
        author: author.trim() || "Tech Infinix Research Team",
        summary: summary.trim(),
        cover_image: coverImage.trim() || null,
        content: compiledContent,
        published: isPublishing,
        seo_title: title.trim(),
        seo_description: summary.trim() || title.trim(),
        include_contact_form: includeForm
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
      {/* ═══════ TOP COMMAND HEADER ═══════ */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border-custom px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-[2px] bg-accent-custom/10 border border-accent-custom/30 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-accent-custom" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-foreground truncate">
              {title ? title : "New Blog Article"}
            </h1>
            <span className="text-[10px] font-mono text-secondary-custom block truncate">
              {slug ? `/blogs/${slug}` : "Draft article"}
            </span>
          </div>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* View Mode Pills (Thin border radius) */}
          <div className="hidden sm:flex items-center bg-background border border-border-custom rounded-[2px] p-0.5">
            <button
              onClick={() => setViewMode("editor")}
              className={`px-3 py-1 text-xs font-mono font-medium rounded-[2px] transition-colors ${
                viewMode === "editor" ? "bg-accent-custom text-white" : "text-secondary-custom hover:text-foreground"
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`px-3 py-1 text-xs font-mono font-medium rounded-[2px] transition-colors ${
                viewMode === "split" ? "bg-accent-custom text-white" : "text-secondary-custom hover:text-foreground"
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`px-3 py-1 text-xs font-mono font-medium rounded-[2px] transition-colors ${
                viewMode === "preview" ? "bg-accent-custom text-white" : "text-secondary-custom hover:text-foreground"
              }`}
            >
              Preview
            </button>
          </div>

          {/* Cancel */}
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-3 py-1.5 rounded-[2px] text-xs font-mono border border-border-custom text-secondary-custom hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {/* Save Draft */}
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-3 py-1.5 rounded-[2px] text-xs font-mono font-semibold bg-surface border border-border-custom hover:border-accent-custom text-foreground transition-colors cursor-pointer"
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>

          {/* Save & Publish */}
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-4 py-1.5 rounded-[2px] text-xs font-mono font-bold bg-accent-custom text-white hover:opacity-95 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? "Publishing..." : "Publish Article"}</span>
          </button>
        </div>
      </header>

      {/* ═══════ METADATA BAR (Architectural & Human-Focused) ═══════ */}
      <section className="bg-surface/50 border-b border-border-custom px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto space-y-4">
          
          {/* Row 1: Title & Slug */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8 space-y-1">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-secondary-custom flex items-center gap-1.5">
                <span>Article Title</span>
                <span className="text-accent-custom">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. How Autonomous AI Agents Are Redefining Modern Enterprise Workflows"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full bg-background border border-border-custom rounded-[2px] px-3.5 py-2 text-sm sm:text-base font-semibold text-foreground placeholder:text-secondary-custom/60 focus:outline-none focus:border-accent-custom transition-colors"
              />
            </div>

            <div className="lg:col-span-4 space-y-1">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-secondary-custom">
                URL Slug
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-secondary-custom hidden sm:inline">/blogs/</span>
                <input
                  type="text"
                  placeholder="autonomous-ai-agents"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugManuallyEdited(true);
                  }}
                  className="w-full bg-background border border-border-custom rounded-[2px] px-3 py-2 text-xs font-mono text-foreground placeholder:text-secondary-custom/60 focus:outline-none focus:border-accent-custom transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Category, Author, Read Time, Cover Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category */}
            <div className="space-y-1">
              <label className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-secondary-custom">
                Category
              </label>
              <input
                type="text"
                placeholder="AI & AUTOMATION"
                value={category}
                onChange={(e) => setCategory(e.target.value.toUpperCase())}
                className="w-full bg-background border border-border-custom rounded-[2px] px-3 py-1.5 text-xs font-mono font-bold text-accent-custom placeholder:text-secondary-custom/60 focus:outline-none focus:border-accent-custom transition-colors"
              />
            </div>

            {/* Author */}
            <div className="space-y-1">
              <label className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-secondary-custom">
                Author
              </label>
              <input
                type="text"
                placeholder="Tech Infinix Research Team"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-background border border-border-custom rounded-[2px] px-3 py-1.5 text-xs font-medium text-foreground placeholder:text-secondary-custom/60 focus:outline-none focus:border-accent-custom transition-colors"
              />
            </div>

            {/* Reading Time */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-secondary-custom">
                  Reading Time
                </label>
                <button
                  type="button"
                  onClick={handleAutoCalculateReadTime}
                  className="text-[9px] font-mono text-accent-custom hover:underline cursor-pointer"
                >
                  Auto ({wordCount} words)
                </button>
              </div>
              <input
                type="text"
                placeholder="5 min read"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                className="w-full bg-background border border-border-custom rounded-[2px] px-3 py-1.5 text-xs font-mono text-foreground placeholder:text-secondary-custom/60 focus:outline-none focus:border-accent-custom transition-colors"
              />
            </div>

            {/* Form Toggle & Status */}
            <div className="space-y-1">
              <label className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-secondary-custom">
                Consultation Form & Status
              </label>
              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-1.5 text-xs font-mono text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeForm}
                    onChange={(e) => setIncludeForm(e.target.checked)}
                    className="accent-accent-custom rounded-[1px]"
                  />
                  <span>Show Form</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs font-mono text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="accent-accent-custom rounded-[1px]"
                  />
                  <span className={published ? "text-emerald-500 font-bold" : "text-secondary-custom"}>
                    {published ? "Live / Published" : "Draft"}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Row 3: Cover Image Uploader + Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1 border-t border-border-custom/40">
            {/* Cover Image */}
            <div className="lg:col-span-5 space-y-2">
              <label className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-secondary-custom flex items-center justify-between">
                <span>Article Cover Image</span>
                {coverImage && (
                  <button
                    onClick={() => setCoverImage("")}
                    className="text-[9.5px] text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                )}
              </label>

              {/* Cover Preview / Upload Area (Strict 5-10px border & thin radius) */}
              <div className="border border-border-custom border-l-[6px] border-l-accent-custom bg-background rounded-[3px] p-3 flex items-center gap-3">
                {coverImage ? (
                  <div className="w-20 h-14 rounded-[2px] overflow-hidden border border-border-custom shrink-0 bg-surface">
                    <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-20 h-14 rounded-[2px] border border-dashed border-border-custom shrink-0 flex items-center justify-center bg-surface/30">
                    <ImageIcon className="w-5 h-5 text-secondary-custom/50" />
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-1.5">
                  <input
                    type="text"
                    placeholder="Paste image URL (or upload below)"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="w-full bg-surface border border-border-custom rounded-[2px] px-2.5 py-1 text-xs text-foreground placeholder:text-secondary-custom/50 focus:outline-none focus:border-accent-custom"
                  />
                  <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface border border-border-custom hover:border-accent-custom rounded-[2px] text-[10.5px] font-mono font-medium text-foreground cursor-pointer transition-colors">
                    <Upload className="w-3 h-3 text-accent-custom" />
                    <span>{uploadingCover ? "Uploading..." : "Upload Cover Image File"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleUploadFile(e.target.files[0], "cover");
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Summary / Excerpt */}
            <div className="lg:col-span-7 space-y-1">
              <label className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-secondary-custom">
                Article Summary / Executive Brief
              </label>
              <textarea
                rows={3}
                placeholder="1 to 2 sentence summary describing the core technical insight or business outcome..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full bg-background border border-border-custom rounded-[2px] px-3.5 py-2 text-xs text-foreground placeholder:text-secondary-custom/60 focus:outline-none focus:border-accent-custom transition-colors resize-none"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ═══════ VISUAL FORMATTING TOOLBAR (Sticky & Ergonomic) ═══════ */}
      <nav className="sticky top-[57px] z-30 bg-surface/95 backdrop-blur-md border-b border-border-custom px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          
          <div className="flex items-center gap-1 flex-wrap">
            {/* Inline Text Styles */}
            <div className="flex items-center bg-background border border-border-custom rounded-[2px] p-0.5">
              <button
                type="button"
                onClick={handleFormatBold}
                className="p-1.5 rounded-[2px] hover:bg-surface text-secondary-custom hover:text-foreground transition-colors cursor-pointer"
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleFormatItalic}
                className="p-1.5 rounded-[2px] hover:bg-surface text-secondary-custom hover:text-foreground transition-colors cursor-pointer"
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleFormatUnderline}
                className="p-1.5 rounded-[2px] hover:bg-surface text-secondary-custom hover:text-foreground transition-colors cursor-pointer"
                title="Underline (Ctrl+U)"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleFormatStrike}
                className="p-1.5 rounded-[2px] hover:bg-surface text-secondary-custom hover:text-foreground transition-colors cursor-pointer"
                title="Strikethrough"
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Headings */}
            <div className="flex items-center bg-background border border-border-custom rounded-[2px] p-0.5">
              <button
                type="button"
                onClick={() => handleFormatHeading(1)}
                className="px-2 py-1 rounded-[2px] text-[11px] font-mono font-bold hover:bg-surface text-secondary-custom hover:text-foreground transition-colors cursor-pointer"
                title="Heading 1"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => handleFormatHeading(2)}
                className="px-2 py-1 rounded-[2px] text-[11px] font-mono font-bold hover:bg-surface text-secondary-custom hover:text-foreground transition-colors cursor-pointer"
                title="Heading 2 (Main Section)"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => handleFormatHeading(3)}
                className="px-2 py-1 rounded-[2px] text-[11px] font-mono font-bold hover:bg-surface text-secondary-custom hover:text-foreground transition-colors cursor-pointer"
                title="Heading 3 (Subsection)"
              >
                H3
              </button>
            </div>

            {/* Lists */}
            <div className="flex items-center bg-background border border-border-custom rounded-[2px] p-0.5">
              <button
                type="button"
                onClick={handleFormatBulletList}
                className="p-1.5 rounded-[2px] hover:bg-surface text-secondary-custom hover:text-foreground transition-colors cursor-pointer"
                title="Bullet List"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleFormatNumberList}
                className="p-1.5 rounded-[2px] hover:bg-surface text-secondary-custom hover:text-foreground transition-colors cursor-pointer"
                title="Numbered List"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Special Blocks */}
            <div className="flex items-center bg-background border border-border-custom rounded-[2px] p-0.5">
              <button
                type="button"
                onClick={handleFormatQuote}
                className="p-1.5 rounded-[2px] hover:bg-surface text-secondary-custom hover:text-foreground transition-colors cursor-pointer"
                title="Blockquote"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleFormatCallout}
                className="p-1.5 rounded-[2px] hover:bg-surface text-secondary-custom hover:text-foreground transition-colors cursor-pointer"
                title="Key Takeaway / Callout Card"
              >
                <Sparkles className="w-3.5 h-3.5 text-accent-custom" />
              </button>
              <button
                type="button"
                onClick={handleFormatCodeBlock}
                className="p-1.5 rounded-[2px] hover:bg-surface text-secondary-custom hover:text-foreground transition-colors cursor-pointer"
                title="Code Block"
              >
                <Code className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleFormatStatsGrid}
                className="p-1.5 rounded-[2px] hover:bg-surface text-secondary-custom hover:text-foreground transition-colors cursor-pointer"
                title="3-Column Metric Stats Grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleFormatDivider}
                className="p-1.5 rounded-[2px] hover:bg-surface text-secondary-custom hover:text-foreground transition-colors cursor-pointer"
                title="Horizontal Divider"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Links & Media */}
            <div className="flex items-center bg-background border border-border-custom rounded-[2px] p-0.5">
              <button
                type="button"
                onClick={() => {
                  const textarea = textareaRef.current;
                  if (textarea) {
                    const sel = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
                    setLinkText(sel);
                  }
                  setLinkModalOpen(true);
                }}
                className="p-1.5 rounded-[2px] hover:bg-surface text-secondary-custom hover:text-foreground transition-colors cursor-pointer"
                title="Insert Link"
              >
                <LinkIcon className="w-3.5 h-3.5 text-accent-custom" />
              </button>

              <button
                type="button"
                onClick={() => setImageModalOpen(true)}
                className="p-1.5 rounded-[2px] hover:bg-surface text-secondary-custom hover:text-foreground transition-colors cursor-pointer"
                title="Insert Image into Content"
              >
                <ImageIcon className="w-3.5 h-3.5 text-accent-custom" />
              </button>
            </div>
          </div>

          {/* Quick Info & Hint */}
          <div className="text-[11px] font-mono text-secondary-custom hidden md:flex items-center gap-2">
            <span>Tip: Select any text and click formatting buttons above</span>
            <span>&bull;</span>
            <span>{wordCount} words</span>
          </div>

        </div>
      </nav>

      {/* ═══════ MAIN CONTENT WORKSPACE (Editor / Split / Preview) ═══════ */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full">

          {/* ─── LEFT: RAW CONTENT CANVAS (Visual Raw Text Pasting & Editing) ─── */}
          {(viewMode === "editor" || viewMode === "split") && (
            <div className={`${viewMode === "editor" ? "lg:col-span-12" : "lg:col-span-6"} flex flex-col space-y-2`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-secondary-custom flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent-custom rounded-[1px]" />
                  <span>Content Canvas (Paste raw text or formatted HTML)</span>
                </span>
                <span className="text-[10px] font-mono text-secondary-custom">
                  {content.length} characters
                </span>
              </div>

              <div className="border border-border-custom border-l-[6px] border-l-accent-custom rounded-[3px] bg-surface/30 focus-within:border-accent-custom transition-all shadow-xs">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`Paste your raw plain text or article here...

Select words or paragraphs to apply Bold, Italic, Headings (H1/H2/H3), Quotes, or Lists using the toolbar above.

All HTML tags are formatted cleanly in the background.`}
                  className="w-full h-[620px] bg-transparent p-4 text-xs sm:text-sm font-mono text-foreground placeholder:text-secondary-custom/50 focus:outline-none resize-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* ─── RIGHT: LIVE HUMAN-EDITORIAL PREVIEW (Desktop / Mobile Switcher) ─── */}
          {(viewMode === "preview" || viewMode === "split") && (
            <div className={`${viewMode === "preview" ? "lg:col-span-12" : "lg:col-span-6"} flex flex-col space-y-2`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-secondary-custom flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-accent-custom" />
                  <span>Live Editorial Preview</span>
                </span>

                {/* Device viewport switcher */}
                <div className="flex items-center bg-surface border border-border-custom rounded-[2px] p-0.5">
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-1 rounded-[2px] transition-colors ${previewDevice === "desktop" ? "bg-accent-custom text-white" : "text-secondary-custom"}`}
                    title="Desktop Preview"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className={`p-1 rounded-[2px] transition-colors ${previewDevice === "mobile" ? "bg-accent-custom text-white" : "text-secondary-custom"}`}
                    title="Mobile Viewport"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Rendered Preview Card (Architectural styling with 8px border spine) */}
              <div
                className={`border border-border-custom bg-background rounded-[3px] overflow-hidden shadow-sm h-[620px] overflow-y-auto ${
                  previewDevice === "mobile" ? "max-w-sm mx-auto" : "w-full"
                }`}
              >
                <div className="p-6 space-y-5 text-left">
                  
                  {/* Category & Read Time */}
                  <div className="flex items-center gap-2 text-[10.5px] font-mono">
                    <span className="px-2 py-0.5 rounded-[2px] bg-accent-custom/10 text-accent-custom font-bold border border-accent-custom/20 uppercase">
                      {category || "CATEGORY"}
                    </span>
                    <span className="text-secondary-custom">•</span>
                    <span className="text-secondary-custom font-medium">{readTime || "5 min read"}</span>
                  </div>

                  {/* Title */}
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground leading-tight">
                    {title ? title : "Your Article Title Will Appear Here"}
                  </h1>

                  {/* Author Meta */}
                  <div className="flex items-center gap-2 text-xs font-mono text-secondary-custom pb-2 border-b border-border-custom/40">
                    <span className="text-foreground font-semibold">{author || "Tech Infinix"}</span>
                    <span>&bull;</span>
                    <span>Today</span>
                  </div>

                  {/* Summary / Excerpt */}
                  {summary && (
                    <p className="text-xs sm:text-sm text-secondary-custom leading-relaxed italic border-l-[4px] border-accent-custom pl-3 py-1 bg-surface/30 rounded-r-[2px]">
                      "{summary}"
                    </p>
                  )}

                  {/* ─── PROMINENT COVER IMAGE ON DETAIL PAGE ─── */}
                  {coverImage && (
                    <div className="border border-border-custom bg-surface rounded-[3px] border-l-[8px] border-l-accent-custom overflow-hidden shadow-xs my-4">
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-background">
                        <img src={coverImage} alt={title} className="w-full h-full object-cover" />
                      </div>
                      <div className="px-3.5 py-2 bg-surface/90 border-t border-border-custom/50 flex items-center justify-between text-[10px] font-mono text-secondary-custom">
                        <span>Cover &bull; {category}</span>
                        <span>{author}</span>
                      </div>
                    </div>
                  )}

                  {/* Rendered Body Content */}
                  <div className="blog-content prose prose-invert max-w-none text-foreground text-xs sm:text-sm">
                    {compiledContent ? (
                      <div dangerouslySetInnerHTML={{ __html: compiledContent }} />
                    ) : (
                      <p className="text-secondary-custom italic text-xs py-8 text-center">
                        Your formatted article content will render live here as you write.
                      </p>
                    )}
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ═══════ MODAL: INSERT LINK ═══════ */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border-custom rounded-[3px] border-l-[8px] border-l-accent-custom p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border-custom">
              <h3 className="text-sm font-bold font-mono text-foreground flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-accent-custom" />
                <span>Insert Hyperlink</span>
              </h3>
              <button onClick={() => setLinkModalOpen(false)} className="text-secondary-custom hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-mono text-secondary-custom">Destination URL</label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-background border border-border-custom rounded-[2px] p-2 text-foreground focus:outline-none focus:border-accent-custom"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-secondary-custom">Display Text</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Link text"
                  className="w-full bg-background border border-border-custom rounded-[2px] p-2 text-foreground focus:outline-none focus:border-accent-custom"
                />
              </div>

              <label className="flex items-center gap-2 font-mono text-foreground cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={linkNewTab}
                  onChange={(e) => setLinkNewTab(e.target.checked)}
                  className="accent-accent-custom"
                />
                <span>Open in new tab</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-custom">
              <button
                onClick={() => setLinkModalOpen(false)}
                className="px-3 py-1.5 text-xs font-mono border border-border-custom rounded-[2px] text-secondary-custom"
              >
                Cancel
              </button>
              <button
                onClick={handleInsertLink}
                className="px-4 py-1.5 text-xs font-mono font-bold bg-accent-custom text-white rounded-[2px]"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ MODAL: INSERT IMAGE ═══════ */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border-custom rounded-[3px] border-l-[8px] border-l-accent-custom p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border-custom">
              <h3 className="text-sm font-bold font-mono text-foreground flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-accent-custom" />
                <span>Insert Article Image</span>
              </h3>
              <button onClick={() => setImageModalOpen(false)} className="text-secondary-custom hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-mono text-secondary-custom">Image URL or File Upload</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={imgSrc}
                    onChange={(e) => setImgSrc(e.target.value)}
                    placeholder="https://... or /images/..."
                    className="flex-1 bg-background border border-border-custom rounded-[2px] p-2 text-foreground focus:outline-none focus:border-accent-custom"
                  />
                  <label className="px-3 py-2 bg-background border border-border-custom rounded-[2px] font-mono text-accent-custom hover:border-accent-custom cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleUploadFile(e.target.files[0], "body");
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-mono text-secondary-custom">Alt Text (Accessibility & SEO)</label>
                <input
                  type="text"
                  value={imgAlt}
                  onChange={(e) => setImgAlt(e.target.value)}
                  placeholder="Descriptive alt text"
                  className="w-full bg-background border border-border-custom rounded-[2px] p-2 text-foreground focus:outline-none focus:border-accent-custom"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-secondary-custom">Caption (Optional)</label>
                <input
                  type="text"
                  value={imgCaption}
                  onChange={(e) => setImgCaption(e.target.value)}
                  placeholder="e.g. Architecture pipeline showing sub-50ms latency."
                  className="w-full bg-background border border-border-custom rounded-[2px] p-2 text-foreground focus:outline-none focus:border-accent-custom"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-custom">
              <button
                onClick={() => setImageModalOpen(false)}
                className="px-3 py-1.5 text-xs font-mono border border-border-custom rounded-[2px] text-secondary-custom"
              >
                Cancel
              </button>
              <button
                onClick={handleInsertImage}
                className="px-4 py-1.5 text-xs font-mono font-bold bg-accent-custom text-white rounded-[2px]"
              >
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
