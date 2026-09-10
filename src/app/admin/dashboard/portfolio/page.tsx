"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/authStore";
import {  Loader2, Plus, Edit2, Trash2, X, Check, Star  } from "lucide-react";
import { authFetch, API } from "@/lib/authFetch";

export default function PortfolioManager() {
  const { accessToken } = useAuthStore();
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [servicesUsed, setServicesUsed] = useState(""); // comma separated in form, JSON list in DB
  const [url, setUrl] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [featured, setFeatured] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchPortfolios = async () => {
    try {
      const response = await authFetch(`${API}/api/v1/portfolio/`);
      if (response.ok) {
        const data = await response.json();
        setPortfolios(data);
      }
    } catch (err) {
      console.error(err);
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

  const handleEditClick = (port: any) => {
    setEditingId(port.id);
    setTitle(port.title);
    setClient(port.client);
    setDescription(port.description);
    setImage(port.image);
    setServicesUsed(Array.isArray(port.services_used) ? port.services_used.join(", ") : "");
    setUrl(port.url || "");
    setYear(port.year);
    setFeatured(port.featured);
    setFormError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const servicesList = servicesUsed
      .split(",")
      .map(s => s.trim())
      .filter(s => s !== "");

    const payload = {
      title,
      client,
      description,
      image,
      services_used: servicesList,
      url: url || null,
      year: Number(year),
      featured,
      slug: title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").trim()
    };

    try {
      if (editingId) {
        const response = await authFetch(`${API}/api/v1/portfolio/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          fetchPortfolios(); // reload list
          resetForm();
        } else {
          const errData = await response.json().catch(() => ({}));
          setFormError(JSON.stringify(errData.detail || "Failed to save"));
        }
      } else {
        const response = await authFetch(`${API}/api/v1/portfolio/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const created = await response.json();
          setPortfolios([...portfolios, created]);
          resetForm();
        } else {
          const errData = await response.json().catch(() => ({}));
          setFormError(JSON.stringify(errData.detail || "Failed to save"));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (portId: number) => {
    if (!confirm("Delete this portfolio item?")) return;
    try {
      const response = await authFetch(`${API}/api/v1/portfolio/${portId}`, {
        method: "DELETE",
        
      });
      if (response.ok) {
        setPortfolios(portfolios.filter(p => p.id !== portId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center flex-col gap-3">
        <Loader2 className="w-8 h-8 text-accent-custom animate-spin" />
        <span className="font-mono text-xs text-gray-500 dark:text-[#B0B0B0]">Loading case studies list...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 text-left">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            Portfolio Case Studies
          </h1>
          <p className="text-xs text-gray-500 dark:text-[#B0B0B0] mt-1.5 font-mono">
            Manage public projects, client items, and features.
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-accent-custom hover:text-white dark:hover:bg-accent-custom dark:hover:text-white px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </button>
        )}
      </div>

      {/* Form Panel */}
      {showForm && (
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl p-6 lg:p-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {editingId ? "Edit Case Study" : "Create New Case Study"}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {formError && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-semibold p-4 rounded-lg flex items-start gap-2">
              <div className="mt-0.5 font-bold uppercase text-[10px] tracking-wider bg-red-500 text-white px-1.5 py-0.5 rounded">ERROR</div>
              <div>{formError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col items-start">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0] mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Apex Outbound Automator"
                  className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom transition-all"
                />
              </div>

              <div className="flex flex-col items-start">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0] mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  required
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="Apex Growth"
                  className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-start">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0] mb-2">
                  Image Path / Gradient Type *
                </label>
                <input
                  type="text"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="from-blue-600/30 to-purple-800/30"
                  className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom transition-all"
                />
              </div>

              <div className="flex flex-col items-start">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0] mb-2">
                  Project Year *
                </label>
                <input
                  type="number"
                  required
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom transition-all"
                />
              </div>

              <div className="flex flex-col items-start">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0] mb-2">
                  Project Link URL
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://client-demo.com"
                  className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col items-start">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0] mb-2">
                  Services Utilized (Comma Separated) *
                </label>
                <input
                  type="text"
                  required
                  value={servicesUsed}
                  onChange={(e) => setServicesUsed(e.target.value)}
                  placeholder="AI Automation, Email Automation, SEO"
                  className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom transition-all"
                />
              </div>

              <div className="flex flex-col items-start justify-center pt-5">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4.5 h-4.5 rounded border border-gray-300 dark:border-white/10 bg-white dark:bg-black/50 text-accent-custom"
                  />
                  <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0] flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-accent-custom fill-current" />
                    Feature in landing highlights
                  </span>
                </label>
              </div>
            </div>

            <div className="flex flex-col items-start">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0] mb-2">
                Project Detailed Description *
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A custom outbound pipeline constructed with n8n..."
                className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom transition-all resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                className="bg-accent-custom hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-lg text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-md"
              >
                <Check className="w-4 h-4" />
                {editingId ? "Save Changes" : "Create Project"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white font-bold px-6 py-3 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111111] shadow-sm rounded-xl divide-y divide-gray-100 dark:divide-white/5">
        {portfolios.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-gray-500 dark:text-[#B0B0B0]">
            No projects added yet. Populate your portfolio list.
          </div>
        ) : (
          portfolios.map((port) => (
            <div key={port.id} className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-6 hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-all">
              <div className="text-left space-y-2">
                <div className="flex items-center gap-3">
                  {port.featured && (
                    <span className="text-[9px] uppercase font-bold font-mono bg-accent-custom/10 text-accent-custom border border-accent-custom/20 px-2 py-0.5 rounded flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      Featured
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-gray-500 dark:text-[#666666]">
                    Client: {port.client} &bull; Year: {port.year}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{port.title}</h3>
                <p className="text-xs text-gray-600 dark:text-[#B0B0B0] leading-relaxed max-w-2xl">{port.description}</p>
                
                {/* Services tags */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {port.services_used?.map((srv: string, sIdx: number) => (
                    <span key={sIdx} className="text-[9px] font-mono border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-2 py-0.5 rounded text-gray-500 dark:text-[#B0B0B0]">
                      {srv}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleEditClick(port)}
                  className="w-8 h-8 rounded border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-[#B0B0B0] hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer transition-all"
                  aria-label="Edit case study"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(port.id)}
                  className="w-8 h-8 rounded border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-[#B0B0B0] hover:bg-red-50 hover:border-red-200 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:border-red-500/20 dark:hover:text-red-400 cursor-pointer transition-all"
                  aria-label="Delete case study"
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
