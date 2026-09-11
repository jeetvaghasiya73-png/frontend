"use client";

import React, { useEffect, useState, useMemo } from "react";
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
  Filter,
  Inbox,
  RefreshCw,
  Globe,
  Building2,
  MapPin,
  Tag
} from "lucide-react";
import { authFetch, API } from "@/lib/authFetch";

// Helper to format any error object into a safe human-readable string
const formatErrorDetail = (detail: any): string => {
  if (!detail) return "An unexpected error occurred.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((err: any) => err.msg || err.detail || JSON.stringify(err)).join("; ");
  }
  if (typeof detail === "object") {
    return detail.message || detail.msg || JSON.stringify(detail);
  }
  return String(detail);
};

// Helper to clean email body content
function cleanEmailBody(body: string): { cleanText: string; quotedText: string } {
  if (!body) return { cleanText: "", quotedText: "" };

  let text = body;

  text = text
    .replace(/&nbsp;/gi, " ")
    .replace(/&bull;/gi, "•")
    .replace(/&middot;/gi, "·")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&copy;/gi, "©");

  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<li[^>]*>/gi, "\n- ");
  text = text.replace(/<tr[^>]*>/gi, "\n");
  text = text.replace(/<p[^>]*>/gi, "\n\n");
  text = text.replace(/<\/(p|div|h[1-6]|tr|ul|ol|li)>/gi, "\n");
  text = text.replace(/<\/td>/gi, "  ");
  text = text.replace(/<[^>]*>/g, "");

  while (text.includes("{") && text.includes("}")) {
    const prevText = text;
    text = text.replace(/[.#a-zA-Z0-9-_, :()@*>=!'"\n\r&;+%~]+\s*\{[^{}]*\}/g, "");
    text = text.replace(/\{[^{}]*\}/g, "");
    if (text === prevText) break;
  }

  text = text.replace(/\n{3,}/g, "\n\n");

  const lines = text.split("\n");
  const cleanLines: string[] = [];
  const quotedLines: string[] = [];
  let inQuoted = false;

  for (let line of lines) {
    const trimmed = line.trim();
    if (
      /^(on\s+.*wrote:)$/i.test(trimmed) ||
      /^(from:)/i.test(trimmed) ||
      trimmed.startsWith("---") ||
      trimmed.startsWith(">") ||
      (trimmed.startsWith("On ") && trimmed.includes("wrote:")) ||
      trimmed.includes("Partnership Opportunity —") ||
      trimmed.includes("NEXORA.AI OFFICIAL PARTNERSHIP INVITATION") ||
      trimmed.includes("PREPARED EXCLUSIVELY FOR")
    ) {
      inQuoted = true;
    }

    if (inQuoted) {
      quotedLines.push(line);
    } else {
      cleanLines.push(line);
    }
  }

  let cleanResult = cleanLines.join("\n").trim();
  let quotedResult = quotedLines.join("\n").trim();

  if (!cleanResult) {
    cleanResult = text.trim();
    quotedResult = "";
  }

  return { cleanText: cleanResult, quotedText: quotedResult };
}

function renderCleanText(text: string) {
  if (!text) return null;
  const parts = text.split("\n\n");
  return parts.map((part, index) => {
    const trimmedPart = part.trim();
    if (!trimmedPart) return null;
    return (
      <p key={index} className="leading-relaxed">
        {trimmedPart}
      </p>
    );
  });
}

export default function ContactMessagesManager() {
  const { accessToken } = useAuthStore();

  // Active Main Tab ("replies" | "contact_forms")
  const [activeTab, setActiveTab] = useState<"replies" | "contact_forms">("replies");
  const [loading, setLoading] = useState(true);

  // Replied Leads State
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [repliedSearch, setRepliedSearch] = useState("");
  const [expandedQuotes, setExpandedQuotes] = useState<Record<number, boolean>>({});
  const [manualReplyText, setManualReplyText] = useState("");
  const [sendingManualReply, setSendingManualReply] = useState(false);

  // AI Meeting / Reply Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [sendingCustomReply, setSendingCustomReply] = useState(false);
  const [aiDraftData, setAiDraftData] = useState<{
    lead_id: number;
    business_name: string;
    recipient_email: string;
    intent: string;
    scraped_city: string;
    scraped_service: string;
    subject: string;
    body: string;
    mode: "test" | "production";
    test_recipient?: string;
  } | null>(null);

  // Website Contact Form State
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [memoTitle, setMemoTitle] = useState("");
  const [memoCategory, setMemoCategory] = useState("General Note");
  const [memoMessage, setMemoMessage] = useState("");
  const [submittingMemo, setSubmittingMemo] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchRepliedLeads = async () => {
    try {
      const response = await authFetch(`${API}/api/v1/email/conversations`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
        if (data.length > 0 && !selectedLead) {
          setSelectedLead(data[0]);
        }
      }
    } catch (err) {
      console.error("Fetch conversations error:", err);
    }
  };

  const fetchContactMessages = async () => {
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
      console.error("Fetch contacts error:", err);
    }
  };

  const initData = async () => {
    setLoading(true);
    await Promise.all([fetchRepliedLeads(), fetchContactMessages()]);
    setLoading(false);
  };

  useEffect(() => {
    initData();
  }, [accessToken]);

  // AI Meeting Draft Generator ("Thank you for inquiry & arranging a meeting soon")
  const handleGenerateMeetingDraft = async () => {
    if (!selectedLead) return;
    setGeneratingDraft(true);
    try {
      const res = await authFetch(`${API}/api/v1/email/conversations/${selectedLead.lead_id}/generate-meeting-draft`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setAiDraftData(data);
        setAiModalOpen(true);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(`Failed to generate meeting draft: ${formatErrorDetail(err.detail)}`, "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error generating meeting draft.", "error");
    } finally {
      setGeneratingDraft(false);
    }
  };

  // AI Custom Reply Generator
  const handleGenerateCustomDraft = async () => {
    if (!selectedLead) return;
    setGeneratingDraft(true);
    try {
      const res = await authFetch(`${API}/api/v1/email/conversations/${selectedLead.lead_id}/generate-draft`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setAiDraftData(data);
        setAiModalOpen(true);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(`Failed to generate draft: ${formatErrorDetail(err.detail)}`, "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error generating custom draft.", "error");
    } finally {
      setGeneratingDraft(false);
    }
  };

  // Dispatch Approved Email (Supports Test Mode vs Production Mode)
  const handleSendCustomReply = async () => {
    if (!aiDraftData) return;
    if (!aiDraftData.subject.trim() || !aiDraftData.body.trim()) {
      showToast("Subject line and email body cannot be empty.", "error");
      return;
    }
    setSendingCustomReply(true);
    try {
      const res = await authFetch(`${API}/api/v1/email/conversations/${aiDraftData.lead_id}/send-custom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: aiDraftData.subject,
          body: aiDraftData.body
        })
      });
      if (res.ok) {
        const result = await res.json();
        const modeLabel = result.mode === "test" ? `[TEST MODE -> ${result.sent_to}]` : `[PRODUCTION MODE -> ${result.sent_to}]`;
        showToast(`Email approved & sent ${modeLabel}!`, "success");
        setAiModalOpen(false);
        setAiDraftData(null);
        await fetchRepliedLeads();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(`Failed to send email: ${formatErrorDetail(err.detail)}`, "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error sending email.", "error");
    } finally {
      setSendingCustomReply(false);
    }
  };

  // Manual reply form handler
  const handleSendManualReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !manualReplyText.trim()) return;
    setSendingManualReply(true);
    try {
      const thread = selectedLead.thread || [];
      const lastMsg = thread[thread.length - 1] || {};
      const res = await authFetch(`${API}/api/v1/email/conversations/${selectedLead.lead_id}/send-custom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: lastMsg.subject ? (lastMsg.subject.startsWith("Re:") ? lastMsg.subject : `Re: ${lastMsg.subject}`) : `Re: Inquiry from ${selectedLead.business_name}`,
          body: manualReplyText
        })
      });
      if (res.ok) {
        setManualReplyText("");
        showToast("Manual reply sent successfully!", "success");
        await fetchRepliedLeads();
      } else {
        showToast("Failed to send manual reply.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error sending reply.", "error");
    } finally {
      setSendingManualReply(false);
    }
  };

  // Filtered Replied Leads
  const filteredConversations = useMemo(() => {
    const s = repliedSearch.toLowerCase().trim();
    if (!s) return conversations;
    return conversations.filter(
      (c: any) =>
        c.business_name?.toLowerCase().includes(s) ||
        c.email?.toLowerCase().includes(s) ||
        c.intent?.toLowerCase().includes(s)
    );
  }, [conversations, repliedSearch]);

  // Filtered Website Contacts
  const filteredMessages = useMemo(() => {
    return messages.filter(m => {
      const matchesSearch =
        m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.message?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || m.status?.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [messages, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center flex-col gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-md bg-indigo-600/20 blur-xl animate-pulse" />
          <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin relative" />
        </div>
        <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">Loading Replied Leads Hub...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left pb-20 relative animate-fadeIn font-sans antialiased text-slate-800 dark:text-slate-200">
      
      {/* Top Navigation & Status Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-5 rounded-md border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Replied Leads &amp; Contacts Hub</h1>
              <span className="px-2.5 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono font-bold text-xs">
                {conversations.length} Active Lead Threads
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage prospect email replies, AI meeting invitation responses, and contact form submissions</p>
          </div>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-md border border-slate-200 dark:border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab("replies")}
            className={`px-3.5 py-2 text-xs font-bold rounded-sm transition cursor-pointer flex items-center gap-2 ${
              activeTab === "replies"
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Prospect Email Replies ({conversations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("contact_forms")}
            className={`px-3.5 py-2 text-xs font-bold rounded-sm transition cursor-pointer flex items-center gap-2 ${
              activeTab === "contact_forms"
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Website Inquiries ({messages.length})</span>
          </button>
        </div>
      </header>

      {/* TAB 1: PROSPECT EMAIL REPLIES & MEETING DESK */}
      {activeTab === "replies" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[720px] w-full max-w-full">
          
          {/* Left List Pane (4 Cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-[#0f172a] rounded-md border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
            
            <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search prospects by name, email, intent..."
                  value={repliedSearch}
                  onChange={(e) => setRepliedSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition"
                />
              </div>
            </div>

            {/* Scrollable Conversations List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-200/60 dark:divide-slate-800">
              {filteredConversations.map((conv) => {
                const isSelected = selectedLead?.lead_id === conv.lead_id;
                const lastMsg = conv.thread?.[conv.thread.length - 1];

                return (
                  <div
                    key={conv.lead_id}
                    onClick={() => {
                      setSelectedLead(conv);
                      setManualReplyText("");
                    }}
                    className={`p-4 transition cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? "bg-indigo-50/60 dark:bg-indigo-950/30 border-l-4 border-indigo-600"
                        : "hover:bg-slate-50/80 dark:hover:bg-slate-900/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {conv.business_name || "Unknown Prospect"}
                      </span>
                      <span className={`text-[8px] uppercase font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                        conv.intent === "interested" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        conv.intent === "unsubscribe" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                        conv.intent === "question" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                        "bg-slate-500/10 text-slate-500 border-slate-500/20"
                      }`}>
                        {conv.intent}
                      </span>
                    </div>

                    <div className="text-[10px] font-mono text-slate-400 truncate">{conv.email}</div>

                    {lastMsg && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                        {cleanEmailBody(lastMsg.body).cleanText}
                      </p>
                    )}
                  </div>
                );
              })}

              {filteredConversations.length === 0 && (
                <div className="text-center py-16 text-xs text-slate-400 font-mono">No replied leads found.</div>
              )}
            </div>
          </div>

          {/* Right Active Lead Thread Viewer (8 Cols) */}
          <div className="lg:col-span-8 bg-white dark:bg-[#0f172a] rounded-md border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between overflow-hidden">
            {selectedLead ? (
              <>
                {/* Active Lead Header */}
                <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-500" />
                      {selectedLead.business_name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">{selectedLead.email}</p>
                  </div>

                  {/* AI Response Generator Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] uppercase font-mono font-bold px-2 py-1 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                      INTENT: {selectedLead.intent}
                    </span>

                    {/* Step 1: Thank You & Meeting Invitation Template Generator */}
                    <button
                      onClick={handleGenerateMeetingDraft}
                      disabled={generatingDraft}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-mono font-bold text-[11px] rounded-md shadow-md transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {generatingDraft ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>DRAFTING...</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="w-3.5 h-3.5 text-amber-300" />
                          <span>✨ Generate Meeting Email</span>
                        </>
                      )}
                    </button>

                    {/* Step 2: Custom AI Reply Generator */}
                    <button
                      onClick={handleGenerateCustomDraft}
                      disabled={generatingDraft}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono font-bold text-[11px] rounded-md transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Custom AI</span>
                    </button>
                  </div>
                </div>

                {/* Message Bubble Thread Container */}
                <div className="p-6 flex-1 overflow-y-auto space-y-5 min-h-[450px] max-h-[540px]">
                  {selectedLead.thread?.map((m: any) => {
                    const isReply = m.type === "REPLY";
                    return (
                      <div key={m.id} className={`flex flex-col ${isReply ? "items-start" : "items-end"}`}>
                        <div className={`max-w-[90%] sm:max-w-[85%] rounded-md p-5 text-xs shadow-md leading-relaxed ${
                          isReply
                            ? "bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white rounded-tl-none border border-slate-200 dark:border-slate-700"
                            : "bg-indigo-600 text-white rounded-tr-none"
                        }`}>
                          <div className="flex items-center justify-between gap-4 font-mono text-[9px] opacity-70 mb-2 border-b border-slate-200/20 dark:border-white/10 pb-1.5">
                            <span className="font-bold uppercase tracking-wider">{isReply ? "Lead Response" : "AI Assistant / Admin Outreach"}</span>
                            <span>{new Date(m.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} &bull; {new Date(m.timestamp).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
                          </div>
                          {(() => {
                            const { cleanText, quotedText } = cleanEmailBody(m.body);
                            const isQuoteExpanded = !!expandedQuotes[m.id];
                            return (
                              <>
                                <div className="space-y-3 font-sans text-xs sm:text-sm leading-relaxed">{renderCleanText(cleanText)}</div>
                                {quotedText && (
                                  <div className="mt-3 pt-3 border-t border-slate-200/20 dark:border-white/10">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setExpandedQuotes(prev => ({ ...prev, [m.id]: !prev[m.id] }));
                                      }}
                                      className="text-[10px] text-slate-400 hover:text-indigo-400 flex items-center gap-1.5 cursor-pointer bg-transparent border-0 p-0 font-mono focus:outline-none font-bold"
                                    >
                                      <span>{isQuoteExpanded ? "▲ Hide original cold outreach message" : "▼ View original cold outreach message"}</span>
                                    </button>
                                    {isQuoteExpanded && (
                                      <div className="mt-2.5 whitespace-pre-line text-[10px] text-slate-400 font-mono bg-black/20 p-3.5 rounded-md border border-slate-700 max-h-[220px] overflow-y-auto leading-relaxed shadow-inner">
                                        {quotedText}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Manual Reply Form */}
                <form onSubmit={handleSendManualReply} className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex gap-2">
                  <textarea
                    placeholder="Type a manual response message to the prospect..."
                    value={manualReplyText}
                    onChange={(e) => setManualReplyText(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 min-h-[60px] max-h-[120px]"
                  />
                  <button
                    type="submit"
                    disabled={sendingManualReply || !manualReplyText.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 rounded-md flex items-center justify-center transition disabled:opacity-50 cursor-pointer text-xs shrink-0 self-end h-10"
                  >
                    {sendingManualReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                <Inbox className="w-12 h-12 mb-3 opacity-30" />
                <span className="text-xs font-mono">Select a replied lead thread to view details and generate meeting email responses.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: WEBSITE CONTACT FORM INQUIRIES */}
      {activeTab === "contact_forms" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[720px] w-full max-w-full">
          
          <div className="lg:col-span-5 bg-white dark:bg-[#0f172a] rounded-md border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
            <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search website contact submissions..."
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

                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-[11px] font-bold text-white shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Internal Memo</span>
                </button>
              </div>
            </div>

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
                <div className="text-center py-16 text-xs text-slate-400 font-mono">No matching contact messages found.</div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 bg-white dark:bg-[#0f172a] rounded-md border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
            {selectedMessage ? (
              <div className="flex-1 flex flex-col justify-between p-6">
                <div className="space-y-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-md bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                        {selectedMessage.name?.charAt(0)?.toUpperCase() || "M"}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedMessage.name}</h3>
                        <a href={`mailto:${selectedMessage.email}`} className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                          {selectedMessage.email}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">{selectedMessage.subject}</span>
                    <span>{new Date(selectedMessage.created_at || Date.now()).toLocaleString("en-US")}</span>
                  </div>
                </div>

                <div className="flex-1 py-6 overflow-y-auto">
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-md border border-slate-200/60 dark:border-slate-800/60 text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Direct reply via mail client</span>
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || "")}`}
                    className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition cursor-pointer flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Email</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-400 font-mono">
                Select a message to view.
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Draft Review & Approval Modal */}
      {aiModalOpen && aiDraftData && (
        <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn text-left">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-md w-full max-w-2xl overflow-hidden shadow-2xl space-y-0 font-sans">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono">AI Meeting Email Proposal (Admin Approval)</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Review &amp; approve before sending directly to the prospect</p>
                </div>
              </div>
              <button
                onClick={() => setAiModalOpen(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Mode Banner Indicator (Test Mode vs Production Mode) */}
              <div className={`p-3 rounded-md border flex items-center justify-between text-xs font-mono font-bold ${
                aiDraftData.mode === "test"
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              }`}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  <span>{aiDraftData.mode === "test" ? "🧪 TEST MODE ACTIVE" : "🌐 PRODUCTION DISPATCH MODE"}</span>
                </div>
                <span className="text-[10px] font-normal">
                  {aiDraftData.mode === "test"
                    ? `Dispatching to test mailbox (${aiDraftData.test_recipient || "configured test email"})`
                    : `Dispatching to actual lead address (${aiDraftData.recipient_email})`}
                </span>
              </div>

              {/* Lead Context Card */}
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-md p-3.5 space-y-1 font-mono text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-indigo-500">Target Lead Details</span>
                  <span className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 px-2 py-0.5 rounded text-[9px] font-bold">
                    INTENT: {aiDraftData.intent}
                  </span>
                </div>
                <div className="text-slate-900 dark:text-white font-bold text-xs">{aiDraftData.business_name}</div>
                <div className="text-slate-500 dark:text-slate-400 text-[10px] flex flex-wrap gap-x-3 gap-y-1">
                  <span>✉️ {aiDraftData.recipient_email}</span>
                  {aiDraftData.scraped_city && <span>📍 {aiDraftData.scraped_city}</span>}
                  {aiDraftData.scraped_service && <span>🏷️ {aiDraftData.scraped_service}</span>}
                </div>
              </div>

              {/* Subject Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={aiDraftData.subject}
                  onChange={(e) => setAiDraftData({ ...aiDraftData, subject: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              {/* Email Body Textarea */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block">
                  Email Response Body (Admin Editable)
                </label>
                <textarea
                  rows={8}
                  value={aiDraftData.body}
                  onChange={(e) => setAiDraftData({ ...aiDraftData, body: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md p-3.5 text-xs text-slate-800 dark:text-slate-200 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-3">
              <button
                onClick={handleGenerateMeetingDraft}
                disabled={generatingDraft}
                className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold text-[10px] rounded-md transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {generatingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                REGENERATE
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAiModalOpen(false)}
                  disabled={sendingCustomReply}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold text-[10px] rounded-md transition cursor-pointer disabled:opacity-50"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleSendCustomReply}
                  disabled={sendingCustomReply}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-[10px] rounded-md shadow-lg transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {sendingCustomReply ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      DISPATCHING...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      APPROVE &amp; SEND TO BUSINESS
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Internal Memo Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn text-left">
          <div className="w-full max-w-lg bg-white dark:bg-[#0f172a] rounded-md border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Internal Memo / Team Note</h3>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              setShowAddForm(false);
            }} className="space-y-4">
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
                  className="px-4 py-2 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/30"
                >
                  Save Memo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[9999] animate-fadeIn font-mono">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-md border shadow-xl backdrop-blur-md transition-all duration-300 ${
            toast.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-emerald-500/5" 
              : toast.type === "error"
              ? "bg-rose-500/10 border-rose-500/20 text-rose-500 shadow-rose-500/5"
              : "bg-blue-500/10 border-blue-500/20 text-blue-500 shadow-blue-500/5"
          }`}>
            <span className="flex-1 text-xs font-semibold tracking-wide">{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white transition cursor-pointer text-sm font-bold ml-1.5"
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
