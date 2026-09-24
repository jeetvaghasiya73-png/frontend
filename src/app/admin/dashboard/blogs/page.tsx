"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/authStore";
import {  Loader2, Plus, Edit2, Trash2, X, Check, Eye  } from "lucide-react";
import { authFetch, API } from "@/lib/authFetch";

export default function BlogsManager() {
  const { accessToken } = useAuthStore();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [published, setPublished] = useState(false);
  const [author, setAuthor] = useState("Tech Infinix Team");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [cssPreset, setCssPreset] = useState("modern-cyber");
  const [customCss, setCustomCss] = useState("");
  const [includeContactForm, setIncludeContactForm] = useState(true);
  const [cssPresetsList, setCssPresetsList] = useState<any[]>([]);

  const fetchPresets = async () => {
    try {
      const res = await fetch(`${API}/api/v1/blogs/css-presets`);
      if (res.ok) {
        const data = await res.json();
        setCssPresetsList(data);
      }
    } catch (e) {
      console.warn("Could not fetch CSS presets:", e);
    }
  };

  const fetchBlogs = async () => {
    try {
      const response = await authFetch(`${API}/api/v1/blogs/`);
      if (response.ok) {
        const data = await response.json();
        setBlogs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
    fetchPresets();
  }, []);

  const resetForm = () => {
    setTitle("");
    setSummary("");
    setContent("");
    setCoverImage("");
    setPublished(false);
    setAuthor("Tech Infinix Team");
    setSeoTitle("");
    setSeoDescription("");
    setCssPreset("modern-cyber");
    setCustomCss("");
    setIncludeContactForm(true);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditClick = (blog: any) => {
    setEditingId(blog.id);
    setTitle(blog.title);
    setSummary(blog.summary);
    setContent(blog.content);
    setCoverImage(blog.cover_image || "");
    setPublished(blog.published);
    setAuthor(blog.author);
    setSeoTitle(blog.seo_title || "");
    setSeoDescription(blog.seo_description || "");
    setCssPreset(blog.css_preset || "modern-cyber");
    setCustomCss(blog.custom_css || "");
    setIncludeContactForm(blog.include_contact_form !== false);
    setShowForm(true);
  };

  const handlePresetChange = (presetId: string) => {
    setCssPreset(presetId);
    const found = cssPresetsList.find((p) => p.id === presetId);
    if (found && found.css) {
      setCustomCss(found.css);
    }
  };

  const handleCssFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomCss((event.target?.result as string) || "");
        setCssPreset("custom");
      };
      reader.readAsText(file);
    }
  };

  const handleHtmlFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawContent = (event.target?.result as string) || "";
        setContent(rawContent);

        // Auto-extract title if title field is empty
        if (!title.trim()) {
          const matchTitle = rawContent.match(/<title[^>]*>(.*?)<\/title>/i) || rawContent.match(/<h1[^>]*>(.*?)<\/h1>/i);
          if (matchTitle && matchTitle[1]) {
            const extracted = matchTitle[1].replace(/<[^>]+>/g, "").trim();
            if (extracted) setTitle(extracted);
          } else {
            const fname = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
            setTitle(fname.charAt(0).toUpperCase() + fname.slice(1));
          }
        }

        // Auto-extract embedded <style> tags into customCss if present
        const styleMatches = rawContent.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
        if (styleMatches && styleMatches.length > 0) {
          const extractedStyles = styleMatches.map(s => s.replace(/<\/?style[^>]*>/gi, "")).join("\n\n");
          if (extractedStyles.trim()) {
            setCustomCss(prev => prev ? `${prev}\n\n${extractedStyles}` : extractedStyles);
            setCssPreset("custom");
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = (title || "Untitled Article").trim();
    const finalSlug = finalTitle.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").trim() || "blog-post";

    const payload = {
      title: finalTitle,
      summary: summary || "",
      content: content || "<p>Article content goes here.</p>",
      cover_image: coverImage || null,
      published,
      author: author || "Tech Infinix Team",
      seo_title: seoTitle || null,
      seo_description: seoDescription || null,
      custom_css: customCss || null,
      css_preset: cssPreset || "modern",
      include_contact_form: includeContactForm,
      slug: finalSlug
    };

    try {
      if (editingId) {
        const response = await authFetch(`${API}/api/v1/blogs/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          resetForm();
          fetchBlogs();
        }
      } else {
        const response = await authFetch(`${API}/api/v1/blogs/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const created = await response.json();
          setBlogs([...blogs, created]);
          resetForm();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (blogId: number) => {
    if (!confirm("Delete this blog post?")) return;
    try {
      const response = await authFetch(`${API}/api/v1/blogs/${blogId}`, {
        method: "DELETE",
        
      });
      if (response.ok) {
        setBlogs(blogs.filter(b => b.id !== blogId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center flex-col gap-3">
        <Loader2 className="w-8 h-8 text-accent-custom animate-spin" />
        <span className="font-mono text-xs text-gray-500 dark:text-[#B0B0B0]">Loading blog articles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 text-left">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            Blog Articles
          </h1>
          <p className="text-xs text-gray-500 dark:text-[#B0B0B0] mt-1.5 font-mono">
            Write, edit, and publish programmatic SEO articles.
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-accent-custom hover:text-white dark:hover:bg-accent-custom dark:hover:text-white px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Write Post
          </button>
        )}
      </div>

      {/* Form Panel */}
      {showForm && (
        <div className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111111] p-6 md:p-8 rounded-md space-y-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/5">
            <h3 className="text-base font-bold font-mono uppercase tracking-widest text-gray-900 dark:text-white">
              {editingId ? "Edit Article" : "Write New Article"}
            </h3>
            <button onClick={resetForm} className="text-gray-500 dark:text-[#B0B0B0] hover:text-gray-900 dark:hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col items-start">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0] mb-2">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Scaling Outbound Operations with AI Agents"
                  className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-md px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom transition-all"
                />
              </div>

              <div className="flex flex-col items-start">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0] mb-2">
                  Author Name
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-md px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col items-start">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0] mb-2">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://example.com/cover.jpg"
                  className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-md px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom transition-all"
                />
              </div>

              <div className="flex flex-col items-start justify-center pt-5">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="w-4.5 h-4.5 rounded border border-gray-300 dark:border-white/10 bg-white dark:bg-black/50 text-accent-custom"
                  />
                  <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0]">
                    Publish immediately (public view)
                  </span>
                </label>
              </div>
            </div>

            {/* SEO Section */}
            <div className="border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-black/20 p-5 rounded-md space-y-4">
              <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-gray-500 dark:text-[#666666] block">
                Search Engine Optimization (Meta Parameters)
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col items-start">
                  <label className="text-[9px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0]">
                    SEO Title Tag
                  </label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Custom Browser title tag"
                    className="w-full bg-white dark:bg-white/[0.01] border border-gray-200 dark:border-white/10 rounded px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom mt-1.5"
                  />
                </div>
                <div className="flex flex-col items-start">
                  <label className="text-[9px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0]">
                    SEO Description
                  </label>
                  <input
                    type="text"
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Short description for Google snippets"
                    className="w-full bg-white dark:bg-white/[0.01] border border-gray-200 dark:border-white/10 rounded px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom mt-1.5"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0] mb-2">
                Article Summary / Abstract *
              </label>
              <textarea
                rows={2}
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="A high-level overview of scaling..."
                className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-md px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom transition-all resize-none"
              />
            </div>

            {/* HTML / Markdown Content Area with File Upload */}
            <div className="flex flex-col items-start space-y-2">
              <div className="flex items-center justify-between w-full">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0]">
                  Article Content (HTML or Markdown) *
                </label>
                <label className="cursor-pointer inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold px-2.5 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 transition-colors">
                  <span>Upload .html file</span>
                  <input
                    type="file"
                    accept=".html,.htm,.txt,.md"
                    className="hidden"
                    onChange={handleHtmlFileUpload}
                  />
                </label>
              </div>
              <textarea
                rows={10}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="<article>\n  <h2>Section Title</h2>\n  <p>Write or paste your custom HTML here...</p>\n</article>"
                className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-md px-4 py-3 text-sm text-gray-900 dark:text-white font-mono focus:outline-none focus:border-accent-custom transition-all resize-y"
              />
            </div>

            {/* CSS Styling & Presets Section */}
            <div className="border border-indigo-500/20 bg-indigo-500/[0.03] p-5 rounded-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold font-mono uppercase tracking-wider text-indigo-400 block">
                    Custom CSS & Stylesheet Library
                  </span>
                  <p className="text-[11px] text-gray-500 dark:text-[#A0A0A0] mt-0.5">
                    Select a curated preset from the library, upload your own .css file, or paste custom rules.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold px-2.5 py-1.5 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 transition-colors">
                    <span>Upload .css file</span>
                    <input
                      type="file"
                      accept=".css,.txt"
                      className="hidden"
                      onChange={handleCssFileUpload}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col items-start">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0] mb-1.5">
                    Choose Preset Theme
                  </label>
                  <select
                    value={cssPreset}
                    onChange={(e) => handlePresetChange(e.target.value)}
                    className="w-full bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom"
                  >
                    <option value="modern-cyber">Modern Cyber Dark (Neon & Monospace)</option>
                    <option value="clean-editorial">Clean Editorial Minimal (Serif Reading)</option>
                    <option value="enterprise-slate">Enterprise Slate Blue (B2B Tables & Callouts)</option>
                    <option value="vibrant-gradient">Vibrant Gradient Glow (High-impact Tech)</option>
                    <option value="custom">Custom (User CSS)</option>
                  </select>
                </div>

                <div className="flex items-center justify-start pt-5">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeContactForm}
                      onChange={(e) => setIncludeContactForm(e.target.checked)}
                      className="w-4.5 h-4.5 rounded border border-gray-300 dark:border-white/10 bg-white dark:bg-black/50 text-accent-custom"
                    />
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-[#D0D0D0]">
                      Embed Interactive Lead & Contact Form at bottom
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col items-start">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0] mb-1.5">
                  Raw CSS Rules (Scoped to this article)
                </label>
                <textarea
                  rows={4}
                  value={customCss}
                  onChange={(e) => {
                    setCustomCss(e.target.value);
                    setCssPreset("custom");
                  }}
                  placeholder="/* Custom CSS */ .blog-content h2 { color: #818CF8; }"
                  className="w-full bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-white/10 rounded px-3 py-2 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                className="bg-accent-custom hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-md text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-md"
              >
                <Check className="w-4 h-4" />
                {editingId ? "Save Changes" : "Create Post"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white font-bold px-6 py-3 rounded-md text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111111] shadow-sm rounded-md divide-y divide-gray-100 dark:divide-white/5">
        {blogs.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-gray-500 dark:text-[#B0B0B0]">
            No articles drafted yet. Write your first post.
          </div>
        ) : (
          blogs.map((blog) => (
            <div key={blog.id} className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-6 hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-all">
              <div className="text-left space-y-2">
                <div className="flex items-center gap-3">
                  <span className={`text-[9px] uppercase font-bold font-mono px-2 py-0.5 rounded border ${
                    blog.published
                      ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20"
                      : "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20"
                  }`}>
                    {blog.published ? "Published" : "Draft"}
                  </span>
                  <span className="text-[10px] font-mono text-gray-500 dark:text-[#666666]">
                    By {blog.author} &bull; {new Date(blog.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {blog.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-[#B0B0B0] leading-relaxed max-w-2xl">{blog.summary}</p>
                <div className="text-[10px] font-mono text-accent-custom">
                  slug: /{blog.slug}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleEditClick(blog)}
                  className="w-8 h-8 rounded border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-[#B0B0B0] hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer transition-all"
                  aria-label="Edit blog"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(blog.id)}
                  className="w-8 h-8 rounded border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-[#B0B0B0] hover:bg-red-50 hover:border-red-200 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:border-red-500/20 dark:hover:text-red-400 cursor-pointer transition-all"
                  aria-label="Delete blog"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
