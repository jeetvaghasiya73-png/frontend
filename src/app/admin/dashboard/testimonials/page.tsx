"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/authStore";
import {  Loader2, Plus, Edit2, Trash2, X, Check, Star  } from "lucide-react";
import { authFetch, API } from "@/lib/authFetch";

export default function TestimonialsManager() {
  const { accessToken } = useAuthStore();
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [imageUrl, setImageUrl] = useState("");
  const [formError, setFormError] = useState("");

  const fetchTestimonials = async () => {
    try {
      const response = await authFetch(`${API}/api/v1/testimonials/`);
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data);
      }
    } catch (err) {
      console.error(err);
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
    setImageUrl("");
    setFormError("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditClick = (test: any) => {
    setEditingId(test.id);
    setName(test.name);
    setRole(test.role);
    setCompany(test.company);
    setContent(test.content);
    setRating(test.rating);
    setImageUrl(test.image || "");
    setFormError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const payload = { name, role, company, content, rating };

    try {
      if (editingId) {
        // Update
        const response = await authFetch(`${API}/api/v1/testimonials/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const updated = await response.json();
          setTestimonials(testimonials.map(t => t.id === editingId ? updated : t));
          resetForm();
        } else {
          const errData = await response.json().catch(() => ({}));
          setFormError(JSON.stringify(errData.detail || "Failed to save"));
        }
      } else {
        // Create
        const response = await authFetch(`${API}/api/v1/testimonials/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const created = await response.json();
          setTestimonials([...testimonials, created]);
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

  const handleDelete = async (testId: number) => {
    if (!confirm("Delete this client testimonial?")) return;
    try {
      const response = await authFetch(`${API}/api/v1/testimonials/${testId}`, {
        method: "DELETE",
        
      });
      if (response.ok) {
        setTestimonials(testimonials.filter(t => t.id !== testId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center flex-col gap-3">
        <Loader2 className="w-8 h-8 text-accent-custom animate-spin" />
        <span className="font-mono text-xs text-gray-500 dark:text-[#B0B0B0]">Loading testimonials...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 text-left">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            Testimonials
          </h1>
          <p className="text-xs text-gray-500 dark:text-[#B0B0B0] mt-1.5 font-mono">
            Manage public agency client reviews and ratings.
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-white dark:bg-white text-gray-900 dark:text-black border border-gray-200 dark:border-transparent hover:bg-accent-custom hover:text-white dark:hover:bg-accent-custom dark:hover:text-white px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Testimonial
          </button>
        )}
      </div>

      {/* Form Panel */}
      {showForm && (
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl p-6 lg:p-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {editingId ? "Edit Testimonial" : "Create New Testimonial"}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-start">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0] mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sarah Jenkins"
                  className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom transition-all"
                />
              </div>

              <div className="flex flex-col items-start">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0] mb-2">
                  Role / Position *
                </label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="VP of Operations"
                  className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom transition-all"
                />
              </div>

              <div className="flex flex-col items-start">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0] mb-2">
                  Company *
                </label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Vortex Analytics"
                  className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col items-start">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0] mb-2">
                Rating Stars
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom transition-all w-24"
              >
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
              </select>
            </div>

            <div className="flex flex-col items-start">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0] mb-2">
                Review Content *
              </label>
              <textarea
                rows={4}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nexora AI completely transformed..."
                className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom transition-all resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                className="bg-accent-custom hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-lg text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-md"
              >
                <Check className="w-4 h-4" />
                {editingId ? "Save Changes" : "Create Testimonial"}
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

      {/* List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((test) => (
          <div key={test.id} className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111111] shadow-sm rounded-xl p-6 flex flex-col justify-between hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-all relative">
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex gap-1 text-yellow-400">
                  {Array.from({ length: test.rating }).map((_, rIdx) => (
                    <Star key={rIdx} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditClick(test)}
                    className="w-8 h-8 rounded border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-[#B0B0B0] hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer transition-all"
                    aria-label="Edit testimonial"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(test.id)}
                    className="w-8 h-8 rounded border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-[#B0B0B0] hover:bg-red-50 hover:border-red-200 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:border-red-500/20 dark:hover:text-red-400 cursor-pointer transition-all"
                    aria-label="Delete testimonial"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs md:text-sm italic leading-relaxed text-gray-600 dark:text-[#B0B0B0] mb-6">
                "{test.content}"
              </p>
            </div>

            <div className="border-t border-gray-100 dark:border-white/5 pt-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent-custom/10 text-accent-custom flex items-center justify-center font-bold text-xs">
                {test.name.charAt(0)}
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">{test.name}</h4>
                <span className="text-[9px] uppercase tracking-wider text-gray-500 dark:text-[#666666] font-medium block mt-0.5">
                  {test.role} at <span className="text-accent-custom">{test.company}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
