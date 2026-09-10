"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/authStore";
import {
  Loader2,
  Trash2,
  Mail,
  Calendar,
  Eye,
  EyeOff,
  Plus,
  FileText,
  Sparkles,
  ShieldCheck,
  Search,
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  X,
  User,
  Zap,
  Filter
} from "lucide-react";
import { authFetch, API } from "@/lib/authFetch";

export default function ContactMessagesManager() {
  const { accessToken } = useAuthStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Internal Memo Modal State
  const [showAddForm, setShowAddForm] = useState(false);
  const [memoTitle, setMemoTitle] = useState("");
  const [memoCategory, setMemoCategory] = useState("General Note");
  const [memoMessage, setMemoMessage] = useState("");
  const [submittingMemo, setSubmittingMemo] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const fetchMessages = async () => {
    try {
      const response = await authFetch(`${API}/api/v1/contacts/`);
      if (response.ok) {
        const data = await response.json();
        const reversed = data.reverse();
        setMessages(reversed);
        if (reversed.length > 0 && !selectedMessage) {
          setSelectedMessage(reversed[0]);
        }
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setMessages(messages.map(msg => msg.id === messageId ? { ...msg, status: newStatus } : msg));
        if (selectedMessage?.id === messageId) {
          setSelectedMessage((prev: any) => prev ? { ...prev, status: newStatus } : null);
        }
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
        const remaining = messages.filter(msg => msg.id !== messageId);
        setMessages(remaining);
        setDeleteConfirmId(null);
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(remaining[0] || null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMessages = messages.filter(m => {
    const matchesSearch =
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.message?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || m.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center flex-col gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 blur-xl animate-pulse" />
          <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin relative" />
        </div>
        <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">Loading Messages Inbox...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left pb-20 relative animate-fadeIn font-sans antialiased text-slate-800 dark:text-slate-200">
      
      {/* Top Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Messages &amp; Inquiries Inbox</h1>
              <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white font-bold text-xs">
                {messages.length} Messages
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage customer inquiries, lead notes, and internal team memos</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Internal Memo</span>
        </button>
      </header>

      {/* Split Inbox View Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
        
        {/* Left List Pane (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
          
          {/* List Search & Filter Header */}
          <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800 space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
                {["all", "unread", "read", "replied"].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition cursor-pointer capitalize ${
                      statusFilter === status
                        ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scrollable Message List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-200/60 dark:divide-slate-800">
            {filteredMessages.map((msg) => {
              const isSelected = selectedMessage?.id === msg.id;
              const isInternal = msg.subject?.startsWith("[INTERNAL]");
              const isUnread = msg.status === "unread" || !msg.status;

              return (
                <div
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className={`p-4 transition cursor-pointer ${
                    isSelected
                      ? "bg-indigo-50/60 dark:bg-indigo-950/30 border-l-4 border-indigo-600"
                      : "hover:bg-slate-50/80 dark:hover:bg-slate-900/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isUnread && <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />}
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[180px]">
                        {msg.name}
                      </span>
                      {isInternal && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 border border-amber-200 dark:border-amber-800">
                          MEMO
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(msg.created_at || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1 truncate">
                    {msg.subject || "No Subject"}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                    {msg.message}
                  </p>
                </div>
              );
            })}

            {filteredMessages.length === 0 && (
              <div className="text-center py-16 text-xs text-slate-400 font-mono">No matching messages found.</div>
            )}
          </div>
        </div>

        {/* Right Active Message Detail Pane (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
          {selectedMessage ? (
            <div className="flex-1 flex flex-col justify-between p-6">
              
              {/* Message Header */}
              <div className="space-y-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                      {selectedMessage.name?.charAt(0)?.toUpperCase() || "M"}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedMessage.name}</h3>
                      <a href={`mailto:${selectedMessage.email}`} className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                        {selectedMessage.email}
                      </a>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedMessage.status || "unread"}
                      onChange={(e) => handleStatusChange(selectedMessage.id, selectedMessage.status, e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      <option value="unread">Unread</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                      <option value="archived">Archived</option>
                    </select>

                    {deleteConfirmId === selectedMessage.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(selectedMessage.id)}
                          className="px-2.5 py-1 rounded bg-rose-600 text-white text-xs font-bold"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(selectedMessage.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span className="font-semibold text-slate-900 dark:text-white text-sm">{selectedMessage.subject}</span>
                  <span>{new Date(selectedMessage.created_at || Date.now()).toLocaleString("en-US")}</span>
                </div>
              </div>

              {/* Message Body Content */}
              <div className="flex-1 py-6 overflow-y-auto">
                <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Quick Reply Bar */}
              <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Direct reply to client via mail client</span>
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || "")}`}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Reply</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400 font-mono">
              Select a message from the list to read.
            </div>
          )}
        </div>
      </div>

      {/* Internal Memo Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Internal Memo / Team Note</h3>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMemo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Title / Author</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sales Team Note"
                  value={memoTitle}
                  onChange={(e) => setMemoTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category Tag</label>
                <select
                  value={memoCategory}
                  onChange={(e) => setMemoCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                >
                  <option value="General Note">General Note</option>
                  <option value="Client Follow-up">Client Follow-up</option>
                  <option value="Urgent Notice">Urgent Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Memo Content</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write internal team updates or follow-up instructions..."
                  value={memoMessage}
                  onChange={(e) => setMemoMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingMemo}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/30"
                >
                  {submittingMemo ? "Saving..." : "Save Memo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
