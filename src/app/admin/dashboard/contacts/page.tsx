"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/authStore";
import { Loader2, Trash2, Mail, Calendar, Eye, EyeOff, Plus, FileText, Sparkles, FolderKanban, ShieldCheck } from "lucide-react";
import { authFetch, API } from "@/lib/authFetch";

export default function ContactMessagesManager() {
  const { accessToken } = useAuthStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Add Internal Memo Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [memoTitle, setMemoTitle] = useState("");
  const [memoCategory, setMemoCategory] = useState("General Note");
  const [memoMessage, setMemoMessage] = useState("");
  const [submittingMemo, setSubmittingMemo] = useState(false);

  // State-based delete confirmations to avoid browser popups
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const fetchMessages = async () => {
    try {
      const response = await authFetch(`${API}/api/v1/contacts/`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.reverse()); // latest first
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [accessToken]);

  const handleStatusChange = async (messageId: number, currentStatus: string, newStatus: string) => {
    if (currentStatus === newStatus) return;
    setUpdatingId(messageId);
    try {
      const response = await authFetch(`${API}/api/v1/contacts/${messageId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setMessages(messages.map(msg => msg.id === messageId ? { ...msg, status: newStatus } : msg));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateMemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoTitle || !memoMessage) return;
    setSubmittingMemo(true);
    try {
      const response = await authFetch(`${API}/api/v1/contacts/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: memoTitle,
          email: "admin@nexora.ai",
          subject: `[INTERNAL] ${memoCategory}`,
          message: memoMessage
        })
      });
      if (response.ok) {
        setMemoTitle("");
        setMemoMessage("");
        setMemoCategory("General Note");
        setShowAddForm(false);
        await fetchMessages();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingMemo(false);
    }
  };

  const handleDelete = async (messageId: number) => {
    try {
      const response = await authFetch(`${API}/api/v1/contacts/${messageId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setMessages(messages.filter(msg => msg.id !== messageId));
        setDeleteConfirmId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center flex-col gap-3">
        <Loader2 className="w-8 h-8 text-accent-custom animate-spin" />
        <span className="font-mono text-xs text-gray-500 dark:text-[#B0B0B0]">Loading general queries...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left pb-16 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            Memos &amp; Inbound Messages
          </h1>
          <p className="text-xs text-gray-550 dark:text-[#B0B0B0] mt-1.5 font-mono">
            Manage public website inquiries and design dashboard-only admin notes.
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-custom hover:bg-accent-custom/90 text-white rounded-lg text-xs font-mono font-bold transition-all cursor-pointer shadow-sm animate-pulse"
        >
          <Plus className="w-3.5 h-3.5" />
          {showAddForm ? "Close Form" : "Create Internal Memo"}
        </button>
      </div>

      {/* Internal Memo Form Section */}
      {showAddForm && (
        <div className="bg-white dark:bg-[#0c0c0c] border border-gray-250 dark:border-white/10 rounded-2xl p-6 shadow-sm animate-fadeIn">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-2 mb-4">
            <FileText className="w-4 h-4 text-purple-500 animate-bounce" />
            New Internal Admin Memo
          </h3>
          <form onSubmit={handleCreateMemo} className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 block">Memo Title / Subject *</label>
                <input
                  type="text"
                  required
                  value={memoTitle}
                  onChange={(e) => setMemoTitle(e.target.value)}
                  placeholder="E.g. System maintenance notes"
                  className="w-full p-2 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded focus:outline-none focus:border-accent-custom text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 block">Category Label</label>
                <select
                  value={memoCategory}
                  onChange={(e) => setMemoCategory(e.target.value)}
                  className="w-full p-2 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded focus:outline-none focus:border-accent-custom text-gray-900 dark:text-white cursor-pointer"
                >
                  <option value="General Note">General Note</option>
                  <option value="Technical Setup">Technical Setup</option>
                  <option value="Outreach Strategy">Outreach Strategy</option>
                  <option value="Lead Pipeline">Lead Pipeline</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 block">Memo Content *</label>
              <textarea
                required
                rows={4}
                value={memoMessage}
                onChange={(e) => setMemoMessage(e.target.value)}
                placeholder="Write memo details here (this is stored inside the admin dashboard and never visible to public site users)..."
                className="w-full p-2 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded focus:outline-none focus:border-accent-custom text-gray-900 dark:text-white resize-none"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 rounded text-xs cursor-pointer font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingMemo}
                className="px-4 py-2 bg-accent-custom hover:bg-accent-custom/95 text-white rounded text-xs cursor-pointer font-bold flex items-center gap-1.5"
              >
                {submittingMemo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Memo"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Messages Listing */}
      {messages.length === 0 ? (
        <div className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111111] p-12 rounded-xl text-center shadow-sm">
          <p className="text-sm text-gray-500 dark:text-[#B0B0B0] font-mono">No contact queries logged.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {messages.map((msg) => {
            const isInternal = msg.subject?.startsWith("[INTERNAL]") || msg.email === "admin@nexora.ai";
            const subjectLabel = isInternal ? msg.subject?.replace("[INTERNAL] ", "") : msg.subject;

            return (
              <div
                key={msg.id}
                className={`border rounded-xl p-6 bg-white dark:bg-[#0c0c0c] shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md ${
                  isInternal
                    ? "border-purple-500/25 bg-purple-500/[0.005] hover:border-purple-500/40"
                    : msg.status === "unread"
                    ? "border-blue-500/30"
                    : "border-gray-200 dark:border-white/10"
                }`}
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-white/5">
                  <div>
                    <h3 className="text-base font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                      {msg.name}
                      {isInternal ? (
                        <span className="text-[8px] uppercase font-bold font-mono bg-purple-500/10 text-purple-500 dark:text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full animate-pulse">
                          Internal Memo
                        </span>
                      ) : msg.status === "unread" ? (
                        <span className="text-[8px] uppercase font-bold font-mono bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 px-2 py-0.5 rounded-full">
                          Unread
                        </span>
                      ) : (
                        <span className="text-[8px] uppercase font-bold font-mono bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400 border border-gray-200 dark:border-white/5 px-2 py-0.5 rounded-full">
                          Website Inquiry
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-[#B0B0B0] mt-1.5 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(msg.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                      <span>&bull;</span>
                      {isInternal ? (
                        <span className="flex items-center gap-1 text-purple-400">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Dashboard Only
                        </span>
                      ) : (
                        <a href={`mailto:${msg.email}`} className="flex items-center gap-1 text-gray-900 dark:text-white hover:text-accent-custom dark:hover:text-accent-custom transition-colors">
                          <Mail className="w-3.5 h-3.5" />
                          {msg.email}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 font-mono">
                    {updatingId === msg.id ? (
                      <Loader2 className="w-4 h-4 text-accent-custom animate-spin" />
                    ) : !isInternal && (
                      <button
                        onClick={() =>
                          handleStatusChange(
                            msg.id,
                            msg.status,
                            msg.status === "unread" ? "read" : "unread"
                          )
                        }
                        className="px-3 py-1.5 rounded border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-[10px] text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer flex items-center gap-1.5 transition-all"
                      >
                        {msg.status === "unread" ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            Mark Read
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            Mark Unread
                          </>
                        )}
                      </button>
                    )}

                    {/* GPU composited custom inline confirmation delete buttons to avoid alert/confirm dialogs */}
                    {deleteConfirmId === msg.id ? (
                      <div className="flex items-center gap-1.5 animate-fadeIn">
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="px-2.5 py-1.5 rounded bg-red-650 text-white font-bold text-[10px] hover:bg-red-700 cursor-pointer transition-colors"
                        >
                          Confirm?
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2.5 py-1.5 rounded border border-gray-200 dark:border-white/10 text-gray-555 text-[10px] hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(msg.id)}
                        className="w-8 h-8 rounded border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-555 dark:text-[#B0B0B0] hover:bg-red-50 hover:border-red-200 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:border-red-500/20 dark:hover:text-red-400 cursor-pointer transition-all"
                        aria-label="Delete message"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Subject */}
                {subjectLabel && (
                  <div className="pt-4 text-xs font-mono font-bold text-gray-900 dark:text-white flex items-center gap-1">
                    Subject: <span className="text-gray-550 dark:text-[#B0B0B0] font-normal">{subjectLabel}</span>
                  </div>
                )}

                {/* Message content */}
                <div className="pt-4 text-left">
                  <p className="text-xs md:text-sm text-gray-750 dark:text-foreground/80 leading-relaxed font-sans bg-gray-50 dark:bg-black/30 border border-gray-100 dark:border-white/5 p-4 rounded-lg">
                    {msg.message}
                  </p>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
