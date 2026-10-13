"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Table as TableIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  Minus,
  Sparkles,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Upload,
  Check,
  X,
  ExternalLink,
  Eye,
  Edit3,
  Save,
  CheckCircle2,
  Loader2,
  FolderGit2,
  Calendar,
  Clock,
  Layers,
  Eraser
} from "lucide-react";
import { API, authFetch } from "@/lib/authFetch";
import { slugify } from "@/lib/blogTagParser";

interface WordStyleBlogEditorProps {
  initialBlog?: any;
  onSave: (payload: any) => Promise<void>;
  onCancel: () => void;
}

export default function BlankCanvasBlogEditor({
  initialBlog,
  onSave,
  onCancel
}: WordStyleBlogEditorProps) {
  // ─── METADATA FIELDS ───
  const [title, setTitle] = useState(initialBlog?.title || "");
  const [slug, setSlug] = useState(initialBlog?.slug || "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initialBlog?.slug);
  const [category, setCategory] = useState(initialBlog?.category || "AI & AUTOMATION");
  const [author, setAuthor] = useState(initialBlog?.author || "Tech Infinix Research Team");
  const [readTime, setReadTime] = useState(initialBlog?.readTime || initialBlog?.read_time || "5 min read");
  const [summary, setSummary] = useState(initialBlog?.summary || "");
  const [coverImage, setCoverImage] = useState(initialBlog?.cover_image || initialBlog?.image || "");
  const [published, setPublished] = useState(initialBlog?.published || false);
  const [includeForm, setIncludeForm] = useState(initialBlog?.include_contact_form !== false);

  // ─── EDITOR STATE ───
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // ─── MODALS ───
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkText, setLinkText] = useState("");
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [imgAlt, setImgAlt] = useState("");
  const [imgCaption, setImgCaption] = useState("");
  const [uploadingInlineImg, setUploadingInlineImg] = useState(false);

  const editorRef = useRef<HTMLDivElement | null>(null);

  // ─── AUTO GENERATE SLUG ───
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManuallyEdited) {
      setSlug(slugify(val));
    }
  };

  // ─── UPDATE WORD COUNT & READ TIME ───
  const calculateStats = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
    const minutes = Math.max(1, Math.ceil(words / 200));
    setReadTime(`${minutes} min read`);
  };

  // ─── LOAD INITIAL CONTENT (CLEAN HTML INTO VISUAL WORD CANVAS) ───
  useEffect(() => {
    if (editorRef.current) {
      if (initialBlog?.content) {
        let clean = initialBlog.content;
        // Strip legacy comment wrappers if any exist
        clean = clean.replace(/<!--[\s\S]*?-->/g, "").trim();
        editorRef.current.innerHTML = clean;
      } else {
        editorRef.current.innerHTML = "<p>Start typing or paste your content here...</p>";
      }
      calculateStats();
    }
  }, [initialBlog]);

  // ─── WORD-STYLE FORMATTING COMMANDS ───
  // Note: onMouseDown with e.preventDefault() prevents losing the selection range!
  const execCmd = (command: string, value: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    calculateStats();
  };

  const handleFormatBlock = (tag: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand("formatBlock", false, tag);
    calculateStats();
  };

  // ─── INSERT RICH COMPONENTS DIRECTLY INTO WORD CANVAS ───
  const insertHtmlAtCursor = (html: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const el = document.createElement("div");
      el.innerHTML = html;
      const frag = document.createDocumentFragment();
      let node: ChildNode | null;
      let lastNode: ChildNode | null = null;
      while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);
      if (lastNode) {
        const nextRange = range.cloneRange();
        nextRange.setStartAfter(lastNode);
        nextRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(nextRange);
      }
    } else {
      editorRef.current.innerHTML += html;
    }
    calculateStats();
  };

  const insertQuote = () => {
    const quoteHtml = `
      <blockquote class="my-6 border-l-[6px] border-l-accent-custom bg-surface/80 p-5 rounded-[2px] italic text-foreground text-sm shadow-xs">
        "Enter your quote or key takeaway message here..."
      </blockquote>
      <p><br></p>
    `;
    insertHtmlAtCursor(quoteHtml);
  };

  const insertCalloutBox = () => {
    const calloutHtml = `
      <div class="my-6 border border-border-custom border-l-[6px] border-l-accent-custom bg-accent-custom/5 p-5 rounded-[2px]">
        <div class="flex items-center gap-2 mb-1.5 text-accent-custom font-bold text-xs uppercase tracking-wider font-mono">
          <span>Key Insight</span>
        </div>
        <p class="text-xs text-foreground/90 m-0">Highlight an important actionable point, enterprise benefit, or strategic advice here.</p>
      </div>
      <p><br></p>
    `;
    insertHtmlAtCursor(calloutHtml);
  };

  const insertTable = () => {
    const tableHtml = `
      <div class="my-6 overflow-x-auto border border-border-custom rounded-[2px]">
        <table class="w-full border-collapse text-xs text-left">
          <thead>
            <tr class="bg-surface border-b border-border-custom">
              <th class="p-3 font-bold border-r border-border-custom text-foreground">Dimension / Feature</th>
              <th class="p-3 font-bold border-r border-border-custom text-foreground">Standard Approach</th>
              <th class="p-3 font-bold text-accent-custom">Automated Solution</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-border-custom/40">
              <td class="p-3 border-r border-border-custom text-foreground/90">Lead Response Time</td>
              <td class="p-3 border-r border-border-custom text-secondary-custom">4 to 12 Hours (Manual)</td>
              <td class="p-3 text-emerald-500 font-semibold">&lt; 30 Seconds Instant AI Hand-off</td>
            </tr>
            <tr class="border-b border-border-custom/40">
              <td class="p-3 border-r border-border-custom text-foreground/90">Follow-up Consistency</td>
              <td class="p-3 border-r border-border-custom text-secondary-custom">Often Forgotten</td>
              <td class="p-3 text-emerald-500 font-semibold">100% Guaranteed 7-Touch Automation</td>
            </tr>
            <tr>
              <td class="p-3 border-r border-border-custom text-foreground/90">Pipeline Conversion Rate</td>
              <td class="p-3 border-r border-border-custom text-secondary-custom">Baseline (2 - 4%)</td>
              <td class="p-3 text-emerald-500 font-semibold">3.8x Lift with Smart Routing</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p><br></p>
    `;
    insertHtmlAtCursor(tableHtml);
  };

  const insertHorizontalRule = () => {
    insertHtmlAtCursor(`<hr class="my-8 border-border-custom/60" /><p><br></p>`);
  };

  // ─── LINK MODAL HANDLER ───
  const openLinkModal = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      setSavedRange(sel.getRangeAt(0));
      setLinkText(sel.toString());
    }
    setLinkModalOpen(true);
  };

  const applyLink = () => {
    if (!linkUrl) {
      setLinkModalOpen(false);
      return;
    }
    if (savedRange && editorRef.current) {
      editorRef.current.focus();
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedRange);

      const text = linkText.trim() || linkUrl;
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="text-accent-custom underline font-medium hover:opacity-80">${text}</a>`;
      insertHtmlAtCursor(linkHtml);
    }
    setLinkModalOpen(false);
    setLinkUrl("https://");
    setLinkText("");
    setSavedRange(null);
  };

  // ─── INLINE IMAGE MODAL & UPLOAD ───
  const handleInlineImageUpload = async (file: File) => {
    setUploadingInlineImg(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await authFetch(`${API}/api/v1/blogs/upload-image`, {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        const uploadedUrl = data.url || data.image_url;
        setImgUrl(uploadedUrl);
      } else {
        alert("Image upload failed. Please try again or paste image URL.");
      }
    } catch (e: any) {
      alert("Upload failed: " + e.message);
    } finally {
      setUploadingInlineImg(false);
    }
  };

  const applyInlineImage = () => {
    if (!imgUrl) return;
    const figureHtml = `
      <figure class="my-8 text-center">
        <img src="${imgUrl}" alt="${imgAlt || title}" class="w-full max-h-[480px] object-cover rounded-[3px] border border-border-custom shadow-xs" />
        ${imgCaption ? `<figcaption class="text-xs text-secondary-custom font-mono mt-2 italic">${imgCaption}</figcaption>` : ""}
      </figure>
      <p><br></p>
    `;
    insertHtmlAtCursor(figureHtml);
    setImageModalOpen(false);
    setImgUrl("");
    setImgAlt("");
    setImgCaption("");
  };

  // ─── COVER IMAGE UPLOADER ───
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await authFetch(`${API}/api/v1/blogs/upload-image`, {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setCoverImage(data.url || data.image_url);
      } else {
        alert("Cover upload failed. Please try again or use direct URL.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setUploadingCover(false);
    }
  };

  // ─── FINAL SAVE HANDLER ───
  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please provide an article title.");
      return;
    }
    const finalSlug = slug.trim() || slugify(title);
    if (!finalSlug) {
      alert("Please provide a URL slug for the article.");
      return;
    }

    const htmlContent = editorRef.current ? editorRef.current.innerHTML.trim() : "";
    if (!htmlContent || htmlContent === "<p><br></p>") {
      alert("Article content cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        slug: finalSlug,
        category: category.trim() || "AI & AUTOMATION",
        author: author.trim() || "Tech Infinix Research Team",
        readTime: readTime || "5 min read",
        summary: summary.trim(),
        cover_image: coverImage.trim() || null,
        image: coverImage.trim() || null,
        published: published,
        include_contact_form: includeForm,
        content: htmlContent
      };
      await onSave(payload);
    } catch (e: any) {
      alert("Save failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background text-foreground flex flex-col overflow-hidden font-sans">
      
      {/* ═══════════════════════════════════════════════════════════════
          WORD-STYLE TOP COMMAND RIBBON
          ═══════════════════════════════════════════════════════════════ */}
      <header className="bg-surface border-b border-border-custom shrink-0 z-30 shadow-xs">
        
        {/* Top Header Row: Title, Article Status, Exit & Save */}
        <div className="px-4 py-2.5 flex items-center justify-between gap-4 border-b border-border-custom/60 flex-wrap">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={onCancel}
              className="px-2.5 py-1.5 rounded-[2px] border border-border-custom text-xs font-mono text-secondary-custom hover:text-foreground hover:bg-background transition-all"
              title="Close editor and discard changes"
            >
              &larr; Exit
            </button>
            
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Article Document Title (e.g. How Autonomous AI Agents Work)..."
                className="bg-transparent text-sm sm:text-base font-bold text-foreground placeholder:text-secondary-custom/50 focus:outline-none w-full border-b border-transparent focus:border-accent-custom transition-all"
              />
              <span className="text-[10px] font-mono text-secondary-custom whitespace-nowrap hidden md:inline-block bg-background px-2 py-0.5 rounded-[2px] border border-border-custom">
                /blogs/{slug || "slug-preview"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Metadata Settings Drawer Toggle */}
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`px-3 py-1.5 rounded-[2px] border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                isSettingsOpen
                  ? "bg-accent-custom/10 border-accent-custom text-accent-custom font-semibold"
                  : "border-border-custom text-secondary-custom hover:text-foreground hover:bg-background"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Document Meta</span>
            </button>

            {/* Mode Switch (Word Canvas vs Live View) */}
            <div className="flex items-center border border-border-custom rounded-[2px] bg-background p-0.5 text-xs font-mono">
              <button
                onClick={() => setMode("edit")}
                className={`px-2.5 py-1 rounded-[2px] transition-all cursor-pointer ${
                  mode === "edit"
                    ? "bg-accent-custom text-white font-bold"
                    : "text-secondary-custom hover:text-foreground"
                }`}
              >
                Editor
              </button>
              <button
                onClick={() => setMode("preview")}
                className={`px-2.5 py-1 rounded-[2px] transition-all cursor-pointer flex items-center gap-1 ${
                  mode === "preview"
                    ? "bg-accent-custom text-white font-bold"
                    : "text-secondary-custom hover:text-foreground"
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Live View</span>
              </button>
            </div>

            {/* Publish Toggle */}
            <button
              onClick={() => setPublished(!published)}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-mono font-bold border transition-all cursor-pointer ${
                published
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-500"
              }`}
            >
              {published ? "● Published" : "○ Draft Mode"}
            </button>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-accent-custom hover:opacity-95 text-white px-4 py-1.5 rounded-[3px] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-accent-custom/20 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Article</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ─── WORD FORMATTING TOOLBAR RIBBON (Active in Edit Mode) ─── */}
        {mode === "edit" && (
          <div className="px-4 py-1.5 flex items-center gap-1 overflow-x-auto text-xs select-none">
            
            {/* Undo / Redo */}
            <button
              onMouseDown={(e) => { e.preventDefault(); execCmd("undo"); }}
              className="p-1.5 rounded-[2px] text-secondary-custom hover:text-foreground hover:bg-background transition-colors cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); execCmd("redo"); }}
              className="p-1.5 rounded-[2px] text-secondary-custom hover:text-foreground hover:bg-background transition-colors cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-border-custom mx-1" />

            {/* Paragraph / Heading Format Dropdown */}
            <select
              onChange={(e) => handleFormatBlock(e.target.value)}
              defaultValue="<p>"
              className="bg-background text-foreground text-xs font-mono border border-border-custom rounded-[2px] px-2 py-1 focus:outline-none focus:border-accent-custom cursor-pointer"
              title="Select Paragraph Style"
            >
              <option value="<p>">Normal Text</option>
              <option value="<h2>">Heading 2 (Major Section)</option>
              <option value="<h3>">Heading 3 (Sub-Section)</option>
              <option value="<h4>">Heading 4 (Topic)</option>
            </select>

            <span className="w-px h-4 bg-border-custom mx-1" />

            {/* Bold, Italic, Underline, Strikethrough */}
            <button
              onMouseDown={(e) => { e.preventDefault(); execCmd("bold"); }}
              className="w-7 h-7 rounded-[2px] flex items-center justify-center font-bold text-secondary-custom hover:text-foreground hover:bg-background transition-colors cursor-pointer"
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); execCmd("italic"); }}
              className="w-7 h-7 rounded-[2px] flex items-center justify-center italic text-secondary-custom hover:text-foreground hover:bg-background transition-colors cursor-pointer"
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); execCmd("underline"); }}
              className="w-7 h-7 rounded-[2px] flex items-center justify-center underline text-secondary-custom hover:text-foreground hover:bg-background transition-colors cursor-pointer"
              title="Underline (Ctrl+U)"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); execCmd("strikeThrough"); }}
              className="w-7 h-7 rounded-[2px] flex items-center justify-center line-through text-secondary-custom hover:text-foreground hover:bg-background transition-colors cursor-pointer"
              title="Strikethrough"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-border-custom mx-1" />

            {/* Alignment */}
            <button
              onMouseDown={(e) => { e.preventDefault(); execCmd("justifyLeft"); }}
              className="w-7 h-7 rounded-[2px] flex items-center justify-center text-secondary-custom hover:text-foreground hover:bg-background transition-colors cursor-pointer"
              title="Align Left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); execCmd("justifyCenter"); }}
              className="w-7 h-7 rounded-[2px] flex items-center justify-center text-secondary-custom hover:text-foreground hover:bg-background transition-colors cursor-pointer"
              title="Align Center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); execCmd("justifyRight"); }}
              className="w-7 h-7 rounded-[2px] flex items-center justify-center text-secondary-custom hover:text-foreground hover:bg-background transition-colors cursor-pointer"
              title="Align Right"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-border-custom mx-1" />

            {/* Bullet & Numbered Lists */}
            <button
              onMouseDown={(e) => { e.preventDefault(); execCmd("insertUnorderedList"); }}
              className="w-7 h-7 rounded-[2px] flex items-center justify-center text-secondary-custom hover:text-foreground hover:bg-background transition-colors cursor-pointer"
              title="Bulleted List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); execCmd("insertOrderedList"); }}
              className="w-7 h-7 rounded-[2px] flex items-center justify-center text-secondary-custom hover:text-foreground hover:bg-background transition-colors cursor-pointer"
              title="Numbered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-border-custom mx-1" />

            {/* Quote & Callout */}
            <button
              onMouseDown={(e) => { e.preventDefault(); insertQuote(); }}
              className="px-2 py-1 rounded-[2px] flex items-center gap-1 font-mono text-[11px] text-secondary-custom hover:text-foreground hover:bg-background transition-colors cursor-pointer border border-transparent hover:border-border-custom"
              title="Insert Quote Box"
            >
              <Quote className="w-3 h-3 text-accent-custom" />
              <span>Quote</span>
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); insertCalloutBox(); }}
              className="px-2 py-1 rounded-[2px] flex items-center gap-1 font-mono text-[11px] text-secondary-custom hover:text-foreground hover:bg-background transition-colors cursor-pointer border border-transparent hover:border-border-custom"
              title="Insert Key Insight Box"
            >
              <Sparkles className="w-3 h-3 text-accent-custom" />
              <span>Insight Callout</span>
            </button>

            <span className="w-px h-4 bg-border-custom mx-1" />

            {/* Table, Image, Link, Divider */}
            <button
              onMouseDown={(e) => { e.preventDefault(); insertTable(); }}
              className="px-2 py-1 rounded-[2px] flex items-center gap-1 font-mono text-[11px] text-secondary-custom hover:text-foreground hover:bg-background transition-colors cursor-pointer border border-transparent hover:border-border-custom"
              title="Insert Comparison Table"
            >
              <TableIcon className="w-3 h-3 text-accent-custom" />
              <span>Table</span>
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); setImageModalOpen(true); }}
              className="px-2 py-1 rounded-[2px] flex items-center gap-1 font-mono text-[11px] text-secondary-custom hover:text-foreground hover:bg-background transition-colors cursor-pointer border border-transparent hover:border-border-custom"
              title="Insert Inline Image"
            >
              <ImageIcon className="w-3 h-3 text-accent-custom" />
              <span>Image</span>
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); openLinkModal(); }}
              className="px-2 py-1 rounded-[2px] flex items-center gap-1 font-mono text-[11px] text-secondary-custom hover:text-foreground hover:bg-background transition-colors cursor-pointer border border-transparent hover:border-border-custom"
              title="Insert Hyperlink"
            >
              <LinkIcon className="w-3 h-3 text-accent-custom" />
              <span>Link</span>
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); insertHorizontalRule(); }}
              className="px-2 py-1 rounded-[2px] flex items-center gap-1 font-mono text-[11px] text-secondary-custom hover:text-foreground hover:bg-background transition-colors cursor-pointer border border-transparent hover:border-border-custom"
              title="Horizontal Divider"
            >
              <Minus className="w-3 h-3" />
              <span>Divider</span>
            </button>

            {/* Clear Formatting */}
            <button
              onMouseDown={(e) => { e.preventDefault(); execCmd("removeFormat"); }}
              className="p-1.5 rounded-[2px] text-secondary-custom hover:text-foreground hover:bg-background transition-colors cursor-pointer ml-auto"
              title="Clear Formatting"
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════════════════════════
          DOCUMENT METADATA DRAWER (COLLAPSIBLE)
          ═══════════════════════════════════════════════════════════════ */}
      {isSettingsOpen && (
        <div className="bg-surface/95 border-b border-border-custom px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono animate-in slide-in-from-top-2 duration-150 shrink-0">
          <div>
            <label className="text-secondary-custom block mb-1">URL Route Slug:</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(slugify(e.target.value));
                setSlugManuallyEdited(true);
              }}
              className="w-full bg-background border border-border-custom rounded-[2px] px-2.5 py-1.5 text-foreground focus:outline-none focus:border-accent-custom"
              placeholder="e.g. how-ai-agents-work"
            />
          </div>

          <div>
            <label className="text-secondary-custom block mb-1">Category & Topic:</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-background border border-border-custom rounded-[2px] px-2.5 py-1.5 text-foreground focus:outline-none focus:border-accent-custom"
              placeholder="e.g. AI & AUTOMATION"
            />
          </div>

          <div>
            <label className="text-secondary-custom block mb-1">Author Name:</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full bg-background border border-border-custom rounded-[2px] px-2.5 py-1.5 text-foreground focus:outline-none focus:border-accent-custom"
              placeholder="e.g. Tech Infinix Research Team"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-secondary-custom block mb-1">Article Summary / Excerpt:</label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full bg-background border border-border-custom rounded-[2px] px-2.5 py-1.5 text-foreground focus:outline-none focus:border-accent-custom"
              placeholder="A concise summary of what the reader will learn..."
            />
          </div>

          {/* Cover Image Upload & Preview */}
          <div>
            <label className="text-secondary-custom block mb-1">Cover Image:</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="flex-1 bg-background border border-border-custom rounded-[2px] px-2.5 py-1.5 text-foreground focus:outline-none focus:border-accent-custom text-[11px]"
                placeholder="https://..."
              />
              <label className="bg-background border border-border-custom hover:border-accent-custom text-secondary-custom hover:text-foreground px-2.5 py-1.5 rounded-[2px] cursor-pointer flex items-center gap-1 transition-colors shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingCover ? "..." : "Upload"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MAIN CANVAS BODY: WORD DOCUMENT VIEW vs LIVE VIEW
          ═══════════════════════════════════════════════════════════════ */}
      <main className="flex-1 overflow-y-auto bg-background/50 p-4 sm:p-8 flex justify-center">
        
        {mode === "edit" ? (
          /* ─── MICROSOFT WORD STYLE DOCUMENT CANVAS ─── */
          <div className="w-full max-w-4xl bg-surface border border-border-custom rounded-[3px] shadow-sm my-2 flex flex-col min-h-[800px] border-l-[6px] border-l-accent-custom">
            
            {/* Document Header (Hero Cover Image & Title Preview Inside the Word Sheet) */}
            <div className="p-8 sm:p-12 pb-6 border-b border-border-custom/50">
              
              {/* Cover Image Banner if provided */}
              {coverImage ? (
                <div className="relative aspect-[16/9] w-full rounded-[2px] overflow-hidden border border-border-custom mb-6 bg-background group">
                  <img
                    src={coverImage}
                    alt={title || "Cover preview"}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setCoverImage("")}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-600 text-white rounded-[2px] text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove Cover Image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setIsSettingsOpen(true)}
                  className="mb-6 p-6 border-2 border-dashed border-border-custom hover:border-accent-custom rounded-[2px] text-center cursor-pointer bg-background/40 hover:bg-background transition-all group"
                >
                  <ImageIcon className="w-6 h-6 text-secondary-custom group-hover:text-accent-custom mx-auto mb-1.5" />
                  <span className="text-xs font-mono text-secondary-custom group-hover:text-foreground">
                    + Click to Add Featured Cover Image (or set in Document Meta)
                  </span>
                </div>
              )}

              {/* Category & Meta Banner */}
              <div className="flex items-center gap-3 text-xs font-mono text-secondary-custom mb-3">
                <span className="px-2 py-0.5 rounded-[2px] bg-accent-custom/10 text-accent-custom font-bold border border-accent-custom/20 uppercase">
                  {category || "ARTICLE"}
                </span>
                <span>&bull;</span>
                <span>By {author || "Tech Infinix"}</span>
                <span>&bull;</span>
                <span>{readTime}</span>
              </div>

              {/* Title Header */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground leading-tight">
                {title || "Untitled Article"}
              </h1>

              {summary && (
                <p className="mt-3 text-sm text-secondary-custom italic border-l-2 border-accent-custom pl-3 py-0.5">
                  "{summary}"
                </p>
              )}
            </div>

            {/* ─── PURE WORD WYSIWYG EDITABLE CANVAS ─── */}
            {/* The user types, pastes, and formats text visually here! No HTML tags ever visible! */}
            <div
              ref={editorRef}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onInput={calculateStats}
              onKeyUp={calculateStats}
              className="blog-content flex-1 p-8 sm:p-12 focus:outline-none text-foreground text-sm sm:text-base leading-relaxed select-text"
              style={{ minHeight: "600px" }}
            />

            {/* Word Document Footer Bar (Word Count & Reading Time) */}
            <div className="px-8 py-3 bg-surface/90 border-t border-border-custom/50 flex items-center justify-between text-xs font-mono text-secondary-custom">
              <div className="flex items-center gap-4">
                <span><strong>{wordCount.toLocaleString()}</strong> words</span>
                <span>&bull;</span>
                <span><strong>{readTime}</strong></span>
              </div>
              <span className="text-[11px] text-secondary-custom/70">
                Word WYSIWYG Mode &bull; Clean Visual Editing
              </span>
            </div>
          </div>
        ) : (
          /* ─── LIVE WEBSITE PREVIEW MODE ─── */
          <div className="w-full max-w-4xl bg-surface border border-border-custom rounded-[3px] p-8 sm:p-12 my-2 shadow-xs border-l-[8px] border-l-accent-custom">
            
            {coverImage && (
              <div className="aspect-[16/9] w-full rounded-[3px] overflow-hidden border border-border-custom mb-8">
                <img src={coverImage} alt={title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex items-center gap-3 text-xs font-mono text-secondary-custom mb-3">
              <span className="px-2 py-0.5 rounded-[2px] bg-accent-custom/10 text-accent-custom font-bold border border-accent-custom/20 uppercase">
                {category}
              </span>
              <span>&bull;</span>
              <span>By {author}</span>
              <span>&bull;</span>
              <span>{readTime}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight mb-4">
              {title}
            </h1>

            {summary && (
              <p className="text-sm text-secondary-custom italic border-l-2 border-accent-custom pl-3 py-1 mb-8">
                "{summary}"
              </p>
            )}

            <div
              className="blog-content text-foreground text-sm sm:text-base leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: editorRef.current ? editorRef.current.innerHTML : ""
              }}
            />
          </div>
        )}
      </main>

      {/* ═══════════════════════════════════════════════════════════════
          INSERT HYPERLINK MODAL
          ═══════════════════════════════════════════════════════════════ */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-surface border border-border-custom rounded-[3px] w-full max-w-md p-5 space-y-4 shadow-lg border-l-[6px] border-l-accent-custom">
            <h3 className="text-sm font-bold font-mono text-foreground uppercase tracking-wider flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-accent-custom" />
              <span>Insert Hyperlink</span>
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-secondary-custom block mb-1">Display Text:</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="e.g. Read Case Study"
                  className="w-full bg-background border border-border-custom rounded-[2px] px-3 py-2 text-foreground focus:outline-none focus:border-accent-custom"
                />
              </div>

              <div>
                <label className="text-secondary-custom block mb-1">Destination Web Address (URL):</label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://techinfinix.com/services"
                  className="w-full bg-background border border-border-custom rounded-[2px] px-3 py-2 text-foreground focus:outline-none focus:border-accent-custom"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-custom">
              <button
                onClick={() => setLinkModalOpen(false)}
                className="px-3 py-1.5 rounded-[2px] border border-border-custom text-xs font-mono text-secondary-custom hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={applyLink}
                className="px-4 py-1.5 rounded-[2px] bg-accent-custom text-white text-xs font-mono font-bold hover:opacity-90"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          INSERT INLINE IMAGE MODAL
          ═══════════════════════════════════════════════════════════════ */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-surface border border-border-custom rounded-[3px] w-full max-w-md p-5 space-y-4 shadow-lg border-l-[6px] border-l-accent-custom">
            <h3 className="text-sm font-bold font-mono text-foreground uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-accent-custom" />
              <span>Insert Inline Image</span>
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-secondary-custom block mb-1">Upload File:</label>
                <label className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border-custom hover:border-accent-custom rounded-[2px] cursor-pointer bg-background transition-colors">
                  <Upload className="w-4 h-4 text-accent-custom" />
                  <span className="text-secondary-custom hover:text-foreground">
                    {uploadingInlineImg ? "Uploading image..." : "Choose Image File from Computer"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleInlineImageUpload(file);
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="text-secondary-custom block mb-1">Or Image URL:</label>
                <input
                  type="text"
                  value={imgUrl}
                  onChange={(e) => setImgUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-background border border-border-custom rounded-[2px] px-3 py-2 text-foreground focus:outline-none focus:border-accent-custom"
                />
              </div>

              <div>
                <label className="text-secondary-custom block mb-1">Optional Caption:</label>
                <input
                  type="text"
                  value={imgCaption}
                  onChange={(e) => setImgCaption(e.target.value)}
                  placeholder="e.g. Figure 1: AI Agent Execution Workflow"
                  className="w-full bg-background border border-border-custom rounded-[2px] px-3 py-2 text-foreground focus:outline-none focus:border-accent-custom"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-custom">
              <button
                onClick={() => setImageModalOpen(false)}
                className="px-3 py-1.5 rounded-[2px] border border-border-custom text-xs font-mono text-secondary-custom hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={applyInlineImage}
                disabled={!imgUrl}
                className="px-4 py-1.5 rounded-[2px] bg-accent-custom text-white text-xs font-mono font-bold hover:opacity-90 disabled:opacity-40"
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
