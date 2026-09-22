"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Star,
  Search,
  Building,
  SlidersHorizontal,
  ChevronDown
} from "lucide-react";
import { authFetch, API } from "@/lib/authFetch";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  image?: string;
  created_at?: string;
}

export default function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "name">("newest");
  const [mounted, setMounted] = useState(false);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await authFetch(`${API}/api/v1/testimonials/`);
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data);
      }
    } catch (err) {
      console.error("Error fetching testimonials:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const resetForm = () => {
    setName("");
    setRole("");
    setCompany("");
    setContent("");
    setRating(5);
    setFormError("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditClick = (test: Testimonial) => {
    setEditingId(test.id);
    setName(test.name);
    setRole(test.role);
    setCompany(test.company);
    setContent(test.content);
    setRating(test.rating || 5);
    setFormError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    const payload = { name, role, company, content, rating: Number(rating) };

    try {
      if (editingId) {
        const response = await authFetch(`${API}/api/v1/testimonials/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const updated = await response.json();
          setTestimonials(prev => prev.map(t => t.id === editingId ? updated : t));
          resetForm();
        } else {
          const errData = await response.json().catch(() => ({}));
          setFormError(errData.detail || "Failed to update testimonial");
        }
      } else {
        const response = await authFetch(`${API}/api/v1/testimonials/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const created = await response.json();
          setTestimonials(prev => [...prev, created]);
          resetForm();
        } else {
          const errData = await response.json().catch(() => ({}));
          setFormError(errData.detail || "Failed to create testimonial");
        }
      }
    } catch (err) {
      console.error(err);
      setFormError("Network communication error.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (testId: number) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      const response = await authFetch(`${API}/api/v1/testimonials/${testId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setTestimonials(prev => prev.filter(t => t.id !== testId));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Filter & Sort
  const processedTestimonials = useMemo(() => {
    let list = testimonials.filter(t => {
      const matchesRating = ratingFilter === "all" || t.rating === ratingFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        t.name?.toLowerCase().includes(q) ||
        t.company?.toLowerCase().includes(q) ||
        t.role?.toLowerCase().includes(q) ||
        t.content?.toLowerCase().includes(q);
      return matchesRating && matchesSearch;
    });

    return list.sort((a, b) => {
      if (sortBy === "highest") return (b.rating || 5) - (a.rating || 5);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return b.id - a.id;
    });
  }, [testimonials, searchQuery, ratingFilter, sortBy]);

  // Metrics
  const avgRating = useMemo(() => {
    if (testimonials.length === 0) return "5.0";
    const total = testimonials.reduce((acc, curr) => acc + (curr.rating || 5), 0);
    return (total / testimonials.length).toFixed(1);
  }, [testimonials]);

  const fiveStarPercent = useMemo(() => {
    if (testimonials.length === 0) return "100%";
    const fiveCount = testimonials.filter(t => t.rating === 5).length;
    return `${Math.round((fiveCount / testimonials.length) * 100)}%`;
  }, [testimonials]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center flex-col gap-2">
        <Loader2 className="w-6 h-6 text-[var(--dash-text-muted)] animate-spin" />
        <span className="font-mono text-xs text-[var(--dash-text-muted)]">Loading testimonials...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--dash-border)] pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--dash-text)]">
            Testimonials
          </h1>
          <p className="text-xs text-[var(--dash-text-muted)] mt-1 font-normal">
            Manage public agency client reviews, ratings, and social proof.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[var(--dash-primary)] hover:bg-[var(--dash-primary-hover)] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* Structured Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 border border-[var(--dash-border)] rounded-md bg-[var(--dash-card-bg)] divide-y md:divide-y-0 md:divide-x divide-[var(--dash-border)]">
        <div className="p-4">
          <div className="text-[11px] font-mono text-[var(--dash-text-muted)] uppercase tracking-wider">Total Reviews</div>
          <div className="text-2xl font-bold text-[var(--dash-text)] font-mono mt-1">{testimonials.length}</div>
        </div>

        <div className="p-4">
          <div className="text-[11px] font-mono text-[var(--dash-text-muted)] uppercase tracking-wider">Average Rating</div>
          <div className="text-2xl font-bold text-[var(--dash-text)] font-mono mt-1 flex items-center gap-1.5">
            <span>{avgRating}</span>
            <span className="text-amber-500 text-base">★</span>
          </div>
        </div>

        <div className="p-4">
          <div className="text-[11px] font-mono text-[var(--dash-text-muted)] uppercase tracking-wider">5-Star Ratio</div>
          <div className="text-2xl font-bold text-[var(--dash-text)] font-mono mt-1">{fiveStarPercent}</div>
        </div>

        <div className="p-4">
          <div className="text-[11px] font-mono text-[var(--dash-text-muted)] uppercase tracking-wider">Client Organizations</div>
          <div className="text-2xl font-bold text-[var(--dash-text)] font-mono mt-1">
            {new Set(testimonials.map(t => t.company?.trim()).filter(Boolean)).size}
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-2.5 rounded-md border border-[var(--dash-border)] bg-[var(--dash-card-bg)]">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-[var(--dash-text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, company, content..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-md text-[var(--dash-text)] placeholder:text-[var(--dash-text-muted)] focus:outline-hidden focus:border-[var(--dash-primary)] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Segmented Filter */}
          <div className="inline-flex rounded-md border border-[var(--dash-border)] bg-[var(--dash-bg)] p-0.5 text-xs">
            {(["all", 5, 4] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRatingFilter(r)}
                className={`px-3 py-1 rounded-sm text-[11px] font-medium transition-colors cursor-pointer ${
                  ratingFilter === r
                    ? "bg-[var(--dash-surface)] text-[var(--dash-text)] font-semibold shadow-xs"
                    : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
                }`}
              >
                {r === "all" ? "All" : `${r} Stars`}
              </button>
            ))}
          </div>

          {/* Sort Menu */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-md text-[var(--dash-text)] focus:outline-hidden cursor-pointer"
          >
            <option value="newest">Sort: Newest</option>
            <option value="highest">Sort: Highest Rating</option>
            <option value="name">Sort: Client Name</option>
          </select>
        </div>
      </div>

      {/* Grid of Testimonial Cards */}
      {processedTestimonials.length === 0 ? (
        <div className="border border-dashed border-[var(--dash-border)] rounded-md p-12 text-center bg-[var(--dash-card-bg)]">
          <p className="text-xs text-[var(--dash-text-muted)] font-mono">No testimonials match your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {processedTestimonials.map((test) => (
            <div
              key={test.id}
              className="border border-[var(--dash-border)] rounded-md bg-[var(--dash-card-bg)] p-5 flex flex-col justify-between hover:border-[var(--dash-border-subtle)] transition-colors relative"
            >
              <div>
                {/* Header: Rating & Quick Actions */}
                <div className="flex items-center justify-between pb-3 border-b border-[var(--dash-border)] mb-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, rIdx) => (
                      <Star
                        key={rIdx}
                        className={`w-3.5 h-3.5 ${
                          rIdx < (test.rating || 5)
                            ? "text-amber-500 fill-amber-500"
                            : "text-[var(--dash-border)]"
                        }`}
                      />
                    ))}
                    <span className="text-[11px] font-mono text-[var(--dash-text-muted)] ml-1.5">
                      {test.rating || 5}.0
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditClick(test)}
                      className="p-1.5 rounded-md text-[var(--dash-text-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-bg)] transition-colors cursor-pointer"
                      title="Edit testimonial"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(test.id)}
                      className="p-1.5 rounded-md text-[var(--dash-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete testimonial"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quote Content */}
                <p className="text-xs text-[var(--dash-text)] leading-relaxed font-normal mb-5">
                  "{test.content}"
                </p>
              </div>

              {/* Author Details Footer */}
              <div className="pt-3 border-t border-[var(--dash-border)] flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-[var(--dash-surface-alt)] border border-[var(--dash-border)] flex items-center justify-center font-mono font-bold text-xs text-[var(--dash-text)] shrink-0">
                  {test.name ? test.name.charAt(0).toUpperCase() : "C"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[var(--dash-text)] truncate">{test.name}</div>
                  <div className="text-[11px] text-[var(--dash-text-muted)] truncate mt-0.5">
                    {test.role} &bull; <span className="font-medium text-[var(--dash-text)]">{test.company}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clean Modal Form (Enterprise dialog) */}
      {mounted && showForm && createPortal(
        <div className="fixed inset-0 z-[10005] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="border border-[var(--dash-border)] rounded-md bg-[var(--dash-card-bg)] max-w-lg w-full p-6 space-y-5 shadow-xl animate-in fade-in zoom-in-98 duration-150">
            <div className="flex items-center justify-between border-b border-[var(--dash-border)] pb-3">
              <h2 className="text-sm font-bold text-[var(--dash-text)]">
                {editingId ? "Edit Testimonial" : "New Testimonial"}
              </h2>
              <button
                onClick={resetForm}
                className="p-1 text-[var(--dash-text-muted)] hover:text-[var(--dash-text)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[var(--dash-text-muted)] uppercase">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sarah Jenkins"
                    className="w-full px-3 py-2 text-xs rounded-md bg-[var(--dash-bg)] border border-[var(--dash-border)] text-[var(--dash-text)] focus:outline-hidden focus:border-[var(--dash-primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[var(--dash-text-muted)] uppercase">Role / Title *</label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="VP of Operations"
                    className="w-full px-3 py-2 text-xs rounded-md bg-[var(--dash-bg)] border border-[var(--dash-border)] text-[var(--dash-text)] focus:outline-hidden focus:border-[var(--dash-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[var(--dash-text-muted)] uppercase">Company *</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Vortex Analytics"
                    className="w-full px-3 py-2 text-xs rounded-md bg-[var(--dash-bg)] border border-[var(--dash-border)] text-[var(--dash-text)] focus:outline-hidden focus:border-[var(--dash-primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[var(--dash-text-muted)] uppercase">Rating *</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-md bg-[var(--dash-bg)] border border-[var(--dash-border)] text-[var(--dash-text)] focus:outline-hidden cursor-pointer"
                  >
                    <option value="5">5 Stars (Excellent)</option>
                    <option value="4">4 Stars (Great)</option>
                    <option value="3">3 Stars (Average)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[var(--dash-text-muted)] uppercase">Testimonial Quote *</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tech Infinix engineered our data pipelines..."
                  className="w-full px-3 py-2 text-xs rounded-md bg-[var(--dash-bg)] border border-[var(--dash-border)] text-[var(--dash-text)] focus:outline-hidden focus:border-[var(--dash-primary)] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--dash-border)]">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3.5 py-1.5 text-xs rounded-md border border-[var(--dash-border)] text-[var(--dash-text-muted)] hover:text-[var(--dash-text)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 text-xs rounded-md bg-[var(--dash-primary)] hover:bg-[var(--dash-primary-hover)] text-white font-medium transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingId ? "Save Changes" : "Create Testimonial"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
