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
  Search,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowUpDown,
  BookOpen
} from "lucide-react";
import { authFetch, API } from "@/lib/authFetch";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  order_index: number;
}

const CATEGORIES = [
  "General",
  "Local SEO & Google Maps",
  "Web Development",
  "Web Scraping & APIs",
  "Workflow & WhatsApp Automations",
  "Pricing & Delivery"
];

export default function FaqsManager() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  // Form Modal State
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("General");
  const [orderIndex, setOrderIndex] = useState(0);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchFaqs = async () => {
    try {
      const response = await authFetch(`${API}/api/v1/faqs/`);
      if (response.ok) {
        const data = await response.json();
        setFaqs(data);
      }
    } catch (err) {
      console.error("Error fetching FAQs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const resetForm = () => {
    setQuestion("");
    setAnswer("");
    setCategory("General");
    setOrderIndex(0);
    setFormError("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditClick = (faq: FAQItem) => {
    setEditingId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategory(faq.category || "General");
    setOrderIndex(faq.order_index || 0);
    setFormError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    const payload = { question, answer, category, order_index: Number(orderIndex) };

    try {
      if (editingId) {
        const response = await authFetch(`${API}/api/v1/faqs/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const updated = await response.json();
          setFaqs(prev => prev.map(f => f.id === editingId ? updated : f));
          resetForm();
        } else {
          const errData = await response.json().catch(() => ({}));
          setFormError(errData.detail || "Failed to update FAQ.");
        }
      } else {
        const response = await authFetch(`${API}/api/v1/faqs/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const created = await response.json();
          setFaqs(prev => [...prev, created]);
          resetForm();
        } else {
          const errData = await response.json().catch(() => ({}));
          setFormError(errData.detail || "Failed to create FAQ.");
        }
      }
    } catch (err) {
      console.error(err);
      setFormError("Network error saving FAQ.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (faqId: number) => {
    if (!confirm("Delete this FAQ item permanently?")) return;
    try {
      const response = await authFetch(`${API}/api/v1/faqs/${faqId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setFaqs(prev => prev.filter(f => f.id !== faqId));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  // Category badge styling - enterprise disciplined palette
  const getCategoryBadgeClass = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes("seo") || c.includes("google") || c.includes("rank")) {
      return "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5";
    }
    if (c.includes("web") || c.includes("next") || c.includes("dev")) {
      return "border-sky-500/30 text-sky-600 dark:text-sky-400 bg-sky-500/5";
    }
    if (c.includes("scrap") || c.includes("api") || c.includes("data")) {
      return "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5";
    }
    if (c.includes("auto") || c.includes("bot") || c.includes("workflow")) {
      return "border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/5";
    }
    return "border-[var(--dash-border)] text-[var(--dash-text-muted)] bg-[var(--dash-bg)]";
  };

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return faqs
      .filter(f => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch = !q ||
          f.question?.toLowerCase().includes(q) ||
          f.answer?.toLowerCase().includes(q) ||
          f.category?.toLowerCase().includes(q);

        if (selectedCategory === "all") return matchesSearch;
        return matchesSearch && f.category?.toLowerCase().includes(selectedCategory.toLowerCase());
      })
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  }, [faqs, searchQuery, selectedCategory]);

  const uniqueCategoriesCount = useMemo(() => {
    return new Set(faqs.map(f => f.category?.trim()).filter(Boolean)).size;
  }, [faqs]);

  if (loading) {
    return (
      <div className="min-h-[55vh] flex items-center justify-center flex-col gap-3">
        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
        <span className="font-mono text-xs text-[var(--dash-text-muted)] tracking-wider">LOADING KNOWLEDGE BASE...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--dash-border)] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-sm bg-[var(--dash-bg)] text-[var(--dash-text)] border border-[var(--dash-border)]">
              <HelpCircle className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--dash-text)]">
              FAQ & Knowledge Base
            </h1>
          </div>
          <p className="text-xs text-[var(--dash-text-muted)] font-mono">
            MANAGE PUBLIC QUESTIONS, PILLAR EXPLANATIONS, AND TECHNICAL POLICIES.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-3.5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Question</span>
        </button>
      </div>

      {/* KPI Stats Bar - Crisp Rectangular Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-md p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-[var(--dash-text-muted)] tracking-wider font-mono">Total Questions</div>
            <div className="text-2xl font-bold text-[var(--dash-text)] mt-1 font-mono">{faqs.length}</div>
          </div>
          <div className="p-2 rounded-sm bg-[var(--dash-bg)] text-[var(--dash-text-muted)] border border-[var(--dash-border)]">
            <BookOpen className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-md p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-[var(--dash-text-muted)] tracking-wider font-mono">Active Categories</div>
            <div className="text-2xl font-bold text-[var(--dash-text)] mt-1 font-mono">{uniqueCategoriesCount}</div>
          </div>
          <div className="p-2 rounded-sm bg-[var(--dash-bg)] text-[var(--dash-text-muted)] border border-[var(--dash-border)]">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-md p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-[var(--dash-text-muted)] tracking-wider font-mono">Sequence Index</div>
            <div className="text-2xl font-bold text-[var(--dash-text)] mt-1 font-mono">0 &rarr; {Math.max(0, faqs.length - 1)}</div>
          </div>
          <div className="p-2 rounded-sm bg-[var(--dash-bg)] text-[var(--dash-text-muted)] border border-[var(--dash-border)]">
            <ArrowUpDown className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-md p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-[var(--dash-text-muted)] tracking-wider font-mono">Service Pillars</div>
            <div className="text-2xl font-bold text-[var(--dash-text)] mt-1 font-mono">4 Services</div>
          </div>
          <div className="p-2 rounded-sm bg-[var(--dash-bg)] text-[var(--dash-text-muted)] border border-[var(--dash-border)]">
            <HelpCircle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-md p-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-[var(--dash-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or terms..."
            className="w-full pl-8.5 pr-3 py-1.5 rounded-md bg-[var(--dash-bg)] border border-[var(--dash-border)] text-xs text-[var(--dash-text)] placeholder:text-[var(--dash-text-muted)] focus:outline-hidden focus:border-indigo-500 transition font-mono"
          />
        </div>

        <div className="flex items-center gap-1 w-full md:w-auto overflow-x-auto scrollbar-none">
          {[
            { id: "all", label: "All Topics" },
            { id: "seo", label: "Local SEO" },
            { id: "web", label: "Web Dev" },
            { id: "scrap", label: "Scraping" },
            { id: "auto", label: "Automations" },
            { id: "pricing", label: "Pricing" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === tab.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-transparent text-[var(--dash-text-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-bg)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* FAQs List */}
      {filteredFaqs.length === 0 ? (
        <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-md p-14 text-center space-y-3">
          <HelpCircle className="w-10 h-10 text-[var(--dash-text-muted)] opacity-30 mx-auto" />
          <h3 className="text-sm font-bold text-[var(--dash-text)]">No FAQ items found</h3>
          <p className="text-xs text-[var(--dash-text-muted)] max-w-sm mx-auto">
            {searchQuery ? "No questions match your current query." : "No FAQs created yet. Click 'New Question' to add one."}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-2 px-3.5 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
          >
            Create First Question
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-md p-4 hover:border-indigo-500/40 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 cursor-pointer" onClick={() => toggleExpand(faq.id)}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-sm border ${getCategoryBadgeClass(faq.category)}`}>
                        {faq.category}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--dash-text-muted)] bg-[var(--dash-bg)] px-1.5 py-0.5 rounded-sm border border-[var(--dash-border)]">
                        #{faq.order_index}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[var(--dash-text)] flex items-center gap-2">
                      <span>{faq.question}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-[var(--dash-text-muted)] shrink-0" />
                      )}
                    </h3>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEditClick(faq)}
                      className="w-7 h-7 rounded-md border border-[var(--dash-border)] bg-[var(--dash-bg)] flex items-center justify-center text-[var(--dash-text-muted)] hover:text-indigo-500 hover:border-indigo-500/40 cursor-pointer transition"
                      title="Edit question"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="w-7 h-7 rounded-md border border-[var(--dash-border)] bg-[var(--dash-bg)] flex items-center justify-center text-[var(--dash-text-muted)] hover:text-red-500 hover:border-red-500/40 cursor-pointer transition"
                      title="Delete question"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Collapsible Answer */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-[var(--dash-border)] text-xs text-[var(--dash-text-muted)] leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Portalized FAQ Modal */}
      {mounted && showForm && createPortal(
        <div className="fixed inset-0 z-[10005] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-md max-w-xl w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[var(--dash-border)] pb-3.5">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-sm bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  <HelpCircle className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold text-[var(--dash-text)]">
                  {editingId ? "Edit FAQ Item" : "Register New FAQ"}
                </h2>
              </div>
              <button
                onClick={resetForm}
                className="w-7 h-7 rounded-md hover:bg-[var(--dash-bg)] text-[var(--dash-text-muted)] hover:text-[var(--dash-text)] flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2">
                <span className="px-1.5 py-0.2 rounded-sm bg-red-500 text-white font-mono text-[9px] uppercase">Error</span>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-[var(--dash-text-muted)] uppercase tracking-wider">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="How does your 24/7 WhatsApp AI automation work?"
                  className="w-full px-3 py-2 rounded-md bg-[var(--dash-bg)] border border-[var(--dash-border)] text-xs text-[var(--dash-text)] placeholder:text-[var(--dash-text-muted)] focus:outline-hidden focus:border-indigo-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-[var(--dash-text-muted)] uppercase tracking-wider">
                    Service Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[var(--dash-bg)] border border-[var(--dash-border)] text-xs text-[var(--dash-text)] focus:outline-hidden focus:border-indigo-500 transition cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-[var(--dash-text-muted)] uppercase tracking-wider">
                    Order Index *
                  </label>
                  <input
                    type="number"
                    required
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-md bg-[var(--dash-bg)] border border-[var(--dash-border)] text-xs text-[var(--dash-text)] focus:outline-hidden focus:border-indigo-500 transition font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-[var(--dash-text-muted)] uppercase tracking-wider">
                  Answer *
                </label>
                <textarea
                  rows={4}
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Our system integrates with your CRM and messaging engine to provide automated responses..."
                  className="w-full px-3 py-2 rounded-md bg-[var(--dash-bg)] border border-[var(--dash-border)] text-xs text-[var(--dash-text)] placeholder:text-[var(--dash-text-muted)] focus:outline-hidden focus:border-indigo-500 transition resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--dash-border)]">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3.5 py-1.5 rounded-md border border-[var(--dash-border)] bg-[var(--dash-bg)] text-xs font-semibold text-[var(--dash-text-muted)] hover:text-[var(--dash-text)] cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{editingId ? "Save Changes" : "Create FAQ"}</span>
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
