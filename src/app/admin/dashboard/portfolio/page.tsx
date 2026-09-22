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
  ExternalLink,
  Layers,
  FolderGit2,
  Calendar,
  Globe2,
  ArrowUpRight,
  SlidersHorizontal
} from "lucide-react";
import { authFetch, API } from "@/lib/authFetch";

interface PortfolioItem {
  id: number;
  title: string;
  slug: string;
  client: string;
  description: string;
  image?: string;
  services_used: string[];
  url?: string;
  year: number;
  featured: boolean;
  created_at?: string;
}

export default function PortfolioManager() {
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [mounted, setMounted] = useState(false);

  // Form Modal State
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [servicesUsed, setServicesUsed] = useState("");
  const [url, setUrl] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [featured, setFeatured] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchPortfolios = async () => {
    try {
      const response = await authFetch(`${API}/api/v1/portfolio/`);
      if (response.ok) {
        const data = await response.json();
        setPortfolios(data);
      }
    } catch (err) {
      console.error("Error fetching portfolios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const resetForm = () => {
    setTitle("");
    setClient("");
    setDescription("");
    setImage("");
    setServicesUsed("");
    setUrl("");
    setYear(new Date().getFullYear());
    setFeatured(false);
    setFormError("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditClick = (port: PortfolioItem) => {
    setEditingId(port.id);
    setTitle(port.title);
    setClient(port.client);
    setDescription(port.description);
    setImage(port.image || "");
    setServicesUsed(Array.isArray(port.services_used) ? port.services_used.join(", ") : "");
    setUrl(port.url || "");
    setYear(port.year || new Date().getFullYear());
    setFeatured(Boolean(port.featured));
    setFormError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    const servicesList = servicesUsed
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title,
      client,
      description,
      image,
      services_used: servicesList,
      url: url || null,
      year: Number(year),
      featured,
      slug: title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").trim(),
    };

    try {
      if (editingId) {
        const response = await authFetch(`${API}/api/v1/portfolio/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          const updated = await response.json();
          setPortfolios((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
          resetForm();
        } else {
          const errData = await response.json().catch(() => ({}));
          setFormError(errData.detail || "Failed to update portfolio case study.");
        }
      } else {
        const response = await authFetch(`${API}/api/v1/portfolio/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          const created = await response.json();
          setPortfolios((prev) => [...prev, created]);
          resetForm();
        } else {
          const errData = await response.json().catch(() => ({}));
          setFormError(errData.detail || "Failed to create portfolio item.");
        }
      }
    } catch (err) {
      console.error(err);
      setFormError("Network error saving portfolio item.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (portId: number) => {
    if (!confirm("Permanently delete this project case study?")) return;
    try {
      const response = await authFetch(`${API}/api/v1/portfolio/${portId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setPortfolios((prev) => prev.filter((p) => p.id !== portId));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleToggleFeatured = async (port: PortfolioItem) => {
    try {
      const updatedFeatured = !port.featured;
      const response = await authFetch(`${API}/api/v1/portfolio/${port.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: updatedFeatured }),
      });
      if (response.ok) {
        setPortfolios((prev) =>
          prev.map((p) => (p.id === port.id ? { ...p, featured: updatedFeatured } : p))
        );
      }
    } catch (err) {
      console.error("Toggle featured error:", err);
    }
  };

  // Service tag color mapper - Enterprise subtle palette
  const getServiceBadgeClass = (srv: string) => {
    const s = srv.toLowerCase();
    if (s.includes("seo") || s.includes("google") || s.includes("rank")) {
      return "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5";
    }
    if (s.includes("web") || s.includes("next") || s.includes("saas") || s.includes("dev")) {
      return "border-sky-500/30 text-sky-600 dark:text-sky-400 bg-sky-500/5";
    }
    if (s.includes("scrap") || s.includes("lead") || s.includes("data") || s.includes("crawl")) {
      return "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5";
    }
    if (s.includes("auto") || s.includes("bot") || s.includes("agent") || s.includes("crm")) {
      return "border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/5";
    }
    return "border-[var(--dash-border)] text-[var(--dash-text-muted)] bg-[var(--dash-bg)]";
  };

  // Filtered list
  const filteredPortfolios = useMemo(() => {
    return portfolios.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title?.toLowerCase().includes(q) ||
        p.client?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.services_used?.some((s) => s.toLowerCase().includes(q));

      if (categoryFilter === "all") return matchesSearch;
      if (categoryFilter === "featured") return matchesSearch && p.featured;
      return matchesSearch && p.services_used?.some((s) => s.toLowerCase().includes(categoryFilter));
    });
  }, [portfolios, searchQuery, categoryFilter]);

  const featuredCount = useMemo(() => portfolios.filter((p) => p.featured).length, [portfolios]);

  if (loading) {
    return (
      <div className="min-h-[55vh] flex items-center justify-center flex-col gap-3">
        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
        <span className="font-mono text-xs text-[var(--dash-text-muted)] tracking-wider">
          LOADING PORTFOLIO REGISTRY...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto">
      {/* Top Header - Enterprise Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--dash-border)] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-sm bg-[var(--dash-bg)] text-[var(--dash-text)] border border-[var(--dash-border)]">
              <FolderGit2 className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--dash-text)]">
              Case Studies & Portfolio
            </h1>
          </div>
          <p className="text-xs text-[var(--dash-text-muted)] font-mono">
            MANAGE CLIENT SHOWCASES ACROSS SEO, WEB DEV, SCRAPING, AND AUTOMATIONS.
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
          <span>New Case Study</span>
        </button>
      </div>

      {/* KPI Stats Bar - Crisp Rectangular Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-md p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-[var(--dash-text-muted)] tracking-wider font-mono">
              Total Showcases
            </div>
            <div className="text-2xl font-bold text-[var(--dash-text)] mt-1 font-mono">{portfolios.length}</div>
          </div>
          <div className="p-2 rounded-sm bg-[var(--dash-bg)] text-[var(--dash-text-muted)] border border-[var(--dash-border)]">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-md p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-[var(--dash-text-muted)] tracking-wider font-mono">
              Featured Works
            </div>
            <div className="text-2xl font-bold text-[var(--dash-text)] mt-1 font-mono">{featuredCount}</div>
          </div>
          <div className="p-2 rounded-sm bg-[var(--dash-bg)] text-amber-500 border border-[var(--dash-border)]">
            <Star className="w-4 h-4 fill-current" />
          </div>
        </div>

        <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-md p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-[var(--dash-text-muted)] tracking-wider font-mono">
              Core Pillars
            </div>
            <div className="text-2xl font-bold text-[var(--dash-text)] mt-1 font-mono">4 Services</div>
          </div>
          <div className="p-2 rounded-sm bg-[var(--dash-bg)] text-[var(--dash-text-muted)] border border-[var(--dash-border)]">
            <Globe2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-md p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-[var(--dash-text-muted)] tracking-wider font-mono">
              Deployment Year
            </div>
            <div className="text-2xl font-bold text-[var(--dash-text)] mt-1 font-mono">2026</div>
          </div>
          <div className="p-2 rounded-sm bg-[var(--dash-bg)] text-[var(--dash-text-muted)] border border-[var(--dash-border)]">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Search & Segmented Filter - Enterprise Linear Style */}
      <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-md p-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-[var(--dash-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, clients, tech..."
            className="w-full pl-8.5 pr-3 py-1.5 rounded-md bg-[var(--dash-bg)] border border-[var(--dash-border)] text-xs text-[var(--dash-text)] placeholder:text-[var(--dash-text-muted)] focus:outline-hidden focus:border-indigo-500 transition font-mono"
          />
        </div>

        <div className="flex items-center gap-1 w-full md:w-auto overflow-x-auto scrollbar-none">
          {[
            { id: "all", label: "All Works" },
            { id: "featured", label: "Featured" },
            { id: "seo", label: "Local SEO" },
            { id: "web", label: "Web Dev" },
            { id: "scrap", label: "Scraping" },
            { id: "auto", label: "Automations" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                categoryFilter === tab.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-transparent text-[var(--dash-text-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-bg)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Portfolio Card Grid */}
      {filteredPortfolios.length === 0 ? (
        <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-md p-14 text-center space-y-3">
          <FolderGit2 className="w-10 h-10 text-[var(--dash-text-muted)] opacity-30 mx-auto" />
          <h3 className="text-sm font-bold text-[var(--dash-text)]">No case studies found</h3>
          <p className="text-xs text-[var(--dash-text-muted)] max-w-sm mx-auto">
            {searchQuery
              ? "No case studies match your active search criteria."
              : "No project showcases added yet. Click 'New Case Study' to register your first project."}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-2 px-3.5 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
          >
            Create First Showcase
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPortfolios.map((port) => (
            <div
              key={port.id}
              className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-md p-5 flex flex-col justify-between hover:border-indigo-500/40 transition group relative"
            >
              <div>
                {/* Header Tag Row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {port.featured ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        Featured
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono uppercase text-[var(--dash-text-muted)] bg-[var(--dash-bg)] px-1.5 py-0.5 rounded-sm border border-[var(--dash-border)]">
                        Standard
                      </span>
                    )}

                    <span className="text-[10px] font-mono text-[var(--dash-text-muted)]">
                      {port.year || 2026}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleFeatured(port)}
                      className={`w-7 h-7 rounded-md border flex items-center justify-center transition cursor-pointer ${
                        port.featured
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                          : "border-[var(--dash-border)] bg-[var(--dash-bg)] text-[var(--dash-text-muted)] hover:text-amber-500"
                      }`}
                      title={port.featured ? "Remove featured status" : "Mark as featured"}
                    >
                      <Star className={`w-3 h-3 ${port.featured ? "fill-current" : ""}`} />
                    </button>
                    <button
                      onClick={() => handleEditClick(port)}
                      className="w-7 h-7 rounded-md border border-[var(--dash-border)] bg-[var(--dash-bg)] flex items-center justify-center text-[var(--dash-text-muted)] hover:text-indigo-500 hover:border-indigo-500/40 cursor-pointer transition"
                      title="Edit project"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(port.id)}
                      className="w-7 h-7 rounded-md border border-[var(--dash-border)] bg-[var(--dash-bg)] flex items-center justify-center text-[var(--dash-text-muted)] hover:text-red-500 hover:border-red-500/40 cursor-pointer transition"
                      title="Delete project"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Project Title & Client */}
                <h3 className="text-sm font-bold text-[var(--dash-text)] group-hover:text-indigo-500 transition-colors flex items-center gap-1.5">
                  <span>{port.title}</span>
                  {port.url && (
                    <a
                      href={port.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--dash-text-muted)] hover:text-indigo-500"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </h3>

                <div className="text-[11px] font-mono font-medium text-indigo-500 dark:text-indigo-400 mt-1 mb-2.5">
                  Client: {port.client}
                </div>

                {/* Description */}
                <p className="text-xs text-[var(--dash-text-muted)] leading-relaxed line-clamp-3 mb-4">
                  {port.description}
                </p>
              </div>

              {/* Service Badges */}
              <div className="border-t border-[var(--dash-border)] pt-3 flex flex-wrap gap-1.5">
                {port.services_used?.map((srv, sIdx) => (
                  <span
                    key={sIdx}
                    className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-sm border ${getServiceBadgeClass(
                      srv
                    )}`}
                  >
                    {srv}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Portalized Project Modal - Strict Enterprise Dialog */}
      {mounted &&
        showForm &&
        createPortal(
          <div className="fixed inset-0 z-[10005] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-md max-w-xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[var(--dash-border)] pb-3.5">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-sm bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                    <FolderGit2 className="w-4 h-4" />
                  </span>
                  <h2 className="text-base font-bold text-[var(--dash-text)]">
                    {editingId ? "Edit Project Case Study" : "Register New Case Study"}
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
                  <span className="px-1.5 py-0.2 rounded-sm bg-red-500 text-white font-mono text-[9px] uppercase">
                    Error
                  </span>
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-[var(--dash-text-muted)] uppercase tracking-wider">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Google Maps Rank Accelerator"
                      className="w-full px-3 py-2 rounded-md bg-[var(--dash-bg)] border border-[var(--dash-border)] text-xs text-[var(--dash-text)] placeholder:text-[var(--dash-text-muted)] focus:outline-hidden focus:border-indigo-500 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-[var(--dash-text-muted)] uppercase tracking-wider">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={client}
                      onChange={(e) => setClient(e.target.value)}
                      placeholder="Apex Dental Clinic"
                      className="w-full px-3 py-2 rounded-md bg-[var(--dash-bg)] border border-[var(--dash-border)] text-xs text-[var(--dash-text)] placeholder:text-[var(--dash-text-muted)] focus:outline-hidden focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-[var(--dash-text-muted)] uppercase tracking-wider">
                      Completion Year *
                    </label>
                    <input
                      type="number"
                      required
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-md bg-[var(--dash-bg)] border border-[var(--dash-border)] text-xs text-[var(--dash-text)] focus:outline-hidden focus:border-indigo-500 transition font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-[var(--dash-text-muted)] uppercase tracking-wider">
                      Live URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://client-domain.com"
                      className="w-full px-3 py-2 rounded-md bg-[var(--dash-bg)] border border-[var(--dash-border)] text-xs text-[var(--dash-text)] placeholder:text-[var(--dash-text-muted)] focus:outline-hidden focus:border-indigo-500 transition font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-[var(--dash-text-muted)] uppercase tracking-wider">
                    Services Used (Comma separated) *
                  </label>
                  <input
                    type="text"
                    required
                    value={servicesUsed}
                    onChange={(e) => setServicesUsed(e.target.value)}
                    placeholder="Local SEO, Google Maps 3-Pack, Review Engine"
                    className="w-full px-3 py-2 rounded-md bg-[var(--dash-bg)] border border-[var(--dash-border)] text-xs text-[var(--dash-text)] placeholder:text-[var(--dash-text-muted)] focus:outline-hidden focus:border-indigo-500 transition font-mono"
                  />
                  <p className="text-[10px] text-[var(--dash-text-muted)] font-mono">
                    Keywords like 'SEO', 'Web', 'Scraping', or 'Automation' activate semantic styling.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-[var(--dash-text-muted)] uppercase tracking-wider">
                    Project Description *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Outlined the core architecture, optimized Google Business Profile ranking signals..."
                    className="w-full px-3 py-2 rounded-md bg-[var(--dash-bg)] border border-[var(--dash-border)] text-xs text-[var(--dash-text)] placeholder:text-[var(--dash-text-muted)] focus:outline-hidden focus:border-indigo-500 transition resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="featured-checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded-sm cursor-pointer"
                  />
                  <label
                    htmlFor="featured-checkbox"
                    className="text-xs font-semibold text-[var(--dash-text)] cursor-pointer"
                  >
                    Feature this showcase on public website homepage
                  </label>
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
                    {submitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>{editingId ? "Save Changes" : "Create Showcase"}</span>
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
