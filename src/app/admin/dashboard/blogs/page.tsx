"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/authStore";
import { Loader2, Plus, Edit2, Trash2, Eye, ExternalLink, Sparkles } from "lucide-react";
import { authFetch, API } from "@/lib/authFetch";
import BlankCanvasBlogEditor from "@/components/admin/BlankCanvasBlogEditor";

export default function BlogsManager() {
  const { accessToken } = useAuthStore();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Blank Canvas Tag Editor State
  const [showEditor, setShowEditor] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);

  const fetchBlogs = async () => {
    try {
      const response = await authFetch(`${API}/api/v1/blogs/`);
      if (response.ok) {
        const data = await response.json();
        setBlogs(data);
      }
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleCreateNew = () => {
    setEditingBlog(null);
    setShowEditor(true);
  };

  const handleEditClick = (blog: any) => {
    setEditingBlog(blog);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setEditingBlog(null);
    setShowEditor(false);
  };

  const handleSaveBlog = async (payload: any) => {
    try {
      if (editingBlog?.id) {
        const response = await authFetch(`${API}/api/v1/blogs/${editingBlog.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          handleCloseEditor();
          fetchBlogs();
        } else {
          const err = await response.json();
          alert(err.detail || "Failed to update article");
        }
      } else {
        const response = await authFetch(`${API}/api/v1/blogs/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const created = await response.json();
          setBlogs([created, ...blogs]);
          handleCloseEditor();
        } else {
          const err = await response.json();
          alert(err.detail || "Failed to create article");
        }
      }
    } catch (err: any) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (blog: any) => {
    const target = blog.id || blog.slug;
    if (!confirm(`Are you sure you want to delete "${blog.title}"?`)) return;
    try {
      const response = await authFetch(`${API}/api/v1/blogs/${target}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setBlogs((prev) => prev.filter((b) => b.id !== blog.id && b.slug !== blog.slug));
      } else {
        const err = await response.json().catch(() => ({}));
        alert(err.detail || "Failed to delete article");
      }
    } catch (err: any) {
      console.error("Failed to delete blog:", err);
      alert("Delete failed: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center flex-col gap-3 font-mono">
        <Loader2 className="w-8 h-8 text-accent-custom animate-spin" />
        <span className="text-xs text-secondary-custom">Loading blog articles...</span>
      </div>
    );
  }

  // If in Blank Canvas Tag Editor mode, render full-screen canvas
  if (showEditor) {
    return (
      <BlankCanvasBlogEditor
        initialBlog={editingBlog}
        onSave={handleSaveBlog}
        onCancel={handleCloseEditor}
      />
    );
  }

  return (
    <div className="space-y-8 text-left font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-custom">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <span>Blog Articles & Content Engine</span>
            <span className="px-2 py-0.5 rounded-[2px] bg-accent-custom/10 text-accent-custom text-[11px] font-mono font-bold border border-accent-custom/20">
              Blank Canvas & tags.md Engine
            </span>
          </h1>
          <p className="text-xs text-secondary-custom mt-1 font-mono">
            Paste or compose raw tagged text using tags.md reference. Instant compilation with dynamic tables, stat grids, and media layouts.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="bg-accent-custom hover:opacity-95 text-white px-4 py-2.5 rounded-[3px] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm shadow-accent-custom/20 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Article</span>
        </button>
      </div>

      {/* Articles List */}
      <div className="border border-border-custom bg-surface shadow-xs rounded-[3px] divide-y divide-border-custom">
        {blogs.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-secondary-custom space-y-3">
            <p>No articles drafted yet.</p>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 rounded-[2px] bg-accent-custom/10 text-accent-custom border border-accent-custom/20 font-semibold hover:bg-accent-custom/20 transition-colors cursor-pointer"
            >
              Launch Blank Canvas Editor
            </button>
          </div>
        ) : (
          blogs.map((blog) => (
            <div
              key={blog.id}
              className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-6 hover:bg-background/40 transition-all"
            >
              <div className="text-left space-y-2 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`text-[9.5px] uppercase font-bold font-mono px-2 py-0.5 rounded-[2px] border ${
                      blog.published
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    }`}
                  >
                    {blog.published ? "Published" : "Draft"}
                  </span>
                  {blog.include_contact_form !== false && (
                    <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-[2px] bg-accent-custom/10 text-accent-custom border border-accent-custom/20">
                      Bottom Form On
                    </span>
                  )}
                  <span className="text-[10.5px] font-mono text-secondary-custom">
                    By {blog.author} &bull; {new Date(blog.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  <a
                    href={`/blogs/${blog.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent-custom transition-colors flex items-center gap-1.5"
                  >
                    <span>{blog.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-secondary-custom hover:text-accent-custom" />
                  </a>
                </h3>

                <p className="text-xs text-secondary-custom leading-relaxed line-clamp-2 max-w-3xl">
                  {blog.summary}
                </p>

                <div className="text-[11px] font-mono text-secondary-custom flex items-center gap-1.5 pt-0.5">
                  <span className="text-accent-custom font-semibold">Live Route:</span>
                  <a
                    href={`/blogs/${blog.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-foreground"
                  >
                    /blogs/{blog.slug}
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <a
                  href={`/blogs/${blog.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-[2px] border border-border-custom bg-background flex items-center justify-center text-secondary-custom hover:text-accent-custom hover:border-accent-custom transition-all"
                  title="View Public Article"
                >
                  <Eye className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => handleEditClick(blog)}
                  className="w-8 h-8 rounded-[2px] border border-border-custom bg-background flex items-center justify-center text-secondary-custom hover:text-foreground hover:bg-surface cursor-pointer transition-all"
                  title="Edit with Visual Block Editor"
                  aria-label="Edit blog"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDelete(blog)}
                  className="w-8 h-8 rounded-[2px] border border-border-custom bg-background flex items-center justify-center text-secondary-custom hover:text-red-500 hover:border-red-500/30 cursor-pointer transition-all"
                  title="Delete Article"
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
