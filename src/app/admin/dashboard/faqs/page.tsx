"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/authStore";
import { Loader2, Plus, Edit2, Trash2, X, Check } from "lucide-react";
import { authFetch, API } from "@/lib/authFetch";

export default function FaqsManager() {
  const { accessToken } = useAuthStore();
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("General");
  const [orderIndex, setOrderIndex] = useState(0);
  const [formError, setFormError] = useState("");

  const fetchFaqs = async () => {
    try {
      const response = await authFetch(`${API}/api/v1/faqs/`);
      if (response.ok) {
        const data = await response.json();
        setFaqs(data);
      }
    } catch (err) {
      console.error(err);
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

  const handleEditClick = (faq: any) => {
    setEditingId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategory(faq.category);
    setOrderIndex(faq.order_index);
    setFormError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const payload = { question, answer, category, order_index: Number(orderIndex) };

    try {
      if (editingId) {
        // Update
        const response = await authFetch(`${API}/api/v1/faqs/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const updated = await response.json();
          setFaqs(faqs.map(f => f.id === editingId ? updated : f));
          resetForm();
        } else {
          const errData = await response.json().catch(() => ({}));
          setFormError(JSON.stringify(errData.detail || "Failed to save"));
        }
      } else {
        // Create
        const response = await authFetch(`${API}/api/v1/faqs/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const created = await response.json();
          setFaqs([...faqs, created]);
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

  const handleDelete = async (faqId: number) => {
    if (!confirm("Delete this FAQ item?")) return;
    try {
      const response = await authFetch(`${API}/api/v1/faqs/${faqId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setFaqs(faqs.filter(f => f.id !== faqId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center flex-col gap-3">
        <Loader2 className="w-8 h-8 text-accent-custom animate-spin" />
        <span className="font-mono text-xs text-gray-500 dark:text-[#B0B0B0]">Loading FAQ list...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 text-left">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            FAQ Panels
          </h1>
          <p className="text-xs text-gray-500 dark:text-[#B0B0B0] mt-1.5 font-mono">
            Manage landing page accordions and categories.
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-accent-custom hover:text-white dark:hover:bg-accent-custom dark:hover:text-white px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New FAQ
          </button>
        )}
      </div>

      {/* Accordion Form Panel */}
      {showForm && (
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl p-6 lg:p-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {editingId ? "Edit FAQ Panel" : "Create New FAQ"}
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
            <div className="flex flex-col items-start">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0] mb-2">
                Question Text *
              </label>
              <input
                type="text"
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What is your delivery timeline?"
                className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col items-start">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0] mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom transition-all"
                >
                  <option value="General">General</option>
                  <option value="Security">Security</option>
                  <option value="Process">Process</option>
                  <option value="Pricing">Pricing</option>
                </select>
              </div>

              <div className="flex flex-col items-start">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0] mb-2">
                  Sorting Order Index
                </label>
                <input
                  type="number"
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(Number(e.target.value))}
                  className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col items-start">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0] mb-2">
                Detailed Answer *
              </label>
              <textarea
                rows={4}
                required
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Our standard delivery is..."
                className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom transition-all resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                className="bg-accent-custom hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-lg text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-md"
              >
                <Check className="w-4 h-4" />
                {editingId ? "Save Changes" : "Create FAQ"}
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
        {faqs.map((faq) => (
          <div key={faq.id} className="p-6 flex items-start justify-between gap-6 hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-all">
            <div className="text-left space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono font-bold bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2 py-0.5 rounded text-gray-600 dark:text-[#B0B0B0]">
                  {faq.category}
                </span>
                <span className="text-[10px] font-mono text-gray-500 dark:text-[#666666]">
                  Order: {faq.order_index}
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">{faq.question}</h3>
              <p className="text-xs text-gray-600 dark:text-[#B0B0B0] leading-relaxed max-w-2xl">{faq.answer}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleEditClick(faq)}
                className="w-8 h-8 rounded border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-[#B0B0B0] hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer transition-all"
                aria-label="Edit FAQ"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(faq.id)}
                className="w-8 h-8 rounded border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-[#B0B0B0] hover:bg-red-50 hover:border-red-200 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:border-red-500/20 dark:hover:text-red-400 cursor-pointer transition-all"
                aria-label="Delete FAQ"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
