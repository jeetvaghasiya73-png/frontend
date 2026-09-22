"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useAuthStore } from "@/lib/authStore";
import {
  Loader2,
  Trash2,
  Mail,
  Calendar,
  Sparkles,
  Search,
  Send,
  MessageSquare,
  X,
  Zap,
  Globe,
  Building2,
  Phone,
  RefreshCw,
  Clock,
  CheckCheck,
  Bot,
  UserCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Inbox,
  Filter,
  CheckCircle2,
  MessageCircle,
  FileText
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
      trimmed.includes("TECHINFINIX.COM OFFICIAL PARTNERSHIP INVITATION") ||
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

// Normalized Omni-Channel Message Interface
interface UnifiedMessage {
  id: string; // Unique composite key: "wa-123", "web-456", "email-789"
  channel: "whatsapp" | "website" | "email";
  sourceId: number;
  senderName: string;
  senderContact: string; // phone or email
  city?: string;
  category?: string;
  subject?: string;
  snippet: string;
  timestamp: string;
  status: string; // "interested" | "replied" | "pending" | "sent" | "unread"
  isInterested?: boolean;
  aiEnabled?: boolean;
  raw: any;
}

interface WhatsAppChatMessage {
  id: number;
  lead_id: number | null;
  direction: "inbound" | "outbound" | string;
  message_text: string;
  button_id: string | null;
  created_at: string;
}

export default function ContactMessagesManager() {
  const { accessToken } = useAuthStore();

  // Channels Tab: "all" | "whatsapp" | "website" | "email"
  const [channelTab, setChannelTab] = useState<"all" | "whatsapp" | "website" | "email">("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Raw data collections
  const [waConversations, setWaConversations] = useState<any[]>([]);
  const [websiteInquiries, setWebsiteInquiries] = useState<any[]>([]);
  const [emailConversations, setEmailConversations] = useState<any[]>([]);

  // Selected Message in CRM 2-pane view
  const [selectedMessage, setSelectedMessage] = useState<UnifiedMessage | null>(null);

  // WhatsApp Active Thread Messages
  const [waChatMessages, setWaChatMessages] = useState<WhatsAppChatMessage[]>([]);
  const [loadingWaChats, setLoadingWaChats] = useState(false);
  const [waReplyText, setWaReplyText] = useState("");
  const [sendingWaReply, setSendingWaReply] = useState(false);
  const [togglingWaAi, setTogglingWaAi] = useState(false);

  // Email / Website Manual Reply
  const [manualReplyText, setManualReplyText] = useState("");
  const [sendingManualReply, setSendingManualReply] = useState(false);
  const [expandedQuotes, setExpandedQuotes] = useState<Record<string, boolean>>({});

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "replied" | "interested">("all");

  // AI Meeting / Reply Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [sendingCustomReply, setSendingCustomReply] = useState(false);
  const [aiDraftData, setAiDraftData] = useState<{
    contact_id?: number;
    lead_id?: number;
    business_name: string;
    recipient_email: string;
    intent: string;
    scraped_city?: string;
    scraped_service?: string;
    subject: string;
    body: string;
    mode: "test" | "production";
    test_recipient?: string;
  } | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Concurrent Data Ingestion Across All Channels ──
  const fetchAllData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [waRes, contactRes, emailRes] = await Promise.allSettled([
        authFetch(`${API}/api/v1/whatsapp/conversations?limit=100`),
        authFetch(`${API}/api/v1/contacts/`),
        authFetch(`${API}/api/v1/email/conversations`)
      ]);

      let waData: any[] = [];
      let contData: any[] = [];
      let emData: any[] = [];

      if (waRes.status === "fulfilled" && waRes.value.ok) {
        const d = await waRes.value.json();
        waData = d.conversations || [];
        setWaConversations(waData);
      }

      if (contactRes.status === "fulfilled" && contactRes.value.ok) {
        const d = await contactRes.value.json();
        contData = Array.isArray(d) ? d : [];
        setWebsiteInquiries(contData);
      }

      if (emailRes.status === "fulfilled" && emailRes.value.ok) {
        const d = await emailRes.value.json();
        emData = Array.isArray(d) ? d : [];
        setEmailConversations(emData);
      }
    } catch (err) {
      console.error("Omni-channel inbox fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [accessToken, fetchAllData]);

  // Normalize all channels into a unified array
  const unifiedMessages: UnifiedMessage[] = useMemo(() => {
    const list: UnifiedMessage[] = [];

    // 1. WhatsApp conversations
    waConversations.forEach((wa) => {
      list.push({
        id: `wa-${wa.lead_id}`,
        channel: "whatsapp",
        sourceId: wa.lead_id,
        senderName: wa.bussiness_name || "WhatsApp Contact",
        senderContact: wa.phone_number || wa.clean_phone || "No Phone",
        city: wa.scraped_city,
        category: wa.category,
        subject: wa.category ? `WhatsApp Outreach: ${wa.category}` : "WhatsApp Chat",
        snippet: wa.latest_message || wa.last_reply || "No messages yet",
        timestamp: wa.latest_timestamp || wa.reply_at || new Date().toISOString(),
        status: wa.is_interested ? "interested" : (wa.whatsapp_status || "pending"),
        isInterested: wa.is_interested,
        aiEnabled: wa.whatsapp_ai_enabled,
        raw: wa
      });
    });

    // 2. Website contact inquiries
    websiteInquiries.forEach((cont) => {
      list.push({
        id: `web-${cont.id}`,
        channel: "website",
        sourceId: cont.id,
        senderName: cont.name || "Website Visitor",
        senderContact: cont.email || "No Email",
        city: cont.city || undefined,
        category: "Website Form",
        subject: cont.subject || "Website Inquiry",
        snippet: cont.message || "New website submission",
        timestamp: cont.created_at || new Date().toISOString(),
        status: cont.status || "unread",
        raw: cont
      });
    });

    // 3. Email outreach replies
    emailConversations.forEach((em) => {
      const thread = em.thread || [];
      const lastMsg = thread[thread.length - 1];
      const snippet = lastMsg ? cleanEmailBody(lastMsg.body).cleanText : "Email conversation";
      list.push({
        id: `email-${em.lead_id}`,
        channel: "email",
        sourceId: em.lead_id,
        senderName: em.business_name || "Email Prospect",
        senderContact: em.email || "No Email",
        city: em.city || undefined,
        category: "Email Outreach",
        subject: lastMsg?.subject || "Email Outreach Thread",
        snippet: snippet.slice(0, 160),
        timestamp: lastMsg?.received_at || em.created_at || new Date().toISOString(),
        status: em.intent || "replied",
        isInterested: em.intent === "interested",
        raw: em
      });
    });

    // Sort by timestamp descending (newest first)
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return list;
  }, [waConversations, websiteInquiries, emailConversations]);

  // Filter messages based on active channel tab, search query, and status
  const filteredMessages = useMemo(() => {
    return unifiedMessages.filter((msg) => {
      // Channel Tab filter
      if (channelTab !== "all" && msg.channel !== channelTab) {
        return false;
      }

      // Status filter
      if (statusFilter === "unread" && !["pending", "unread", "new"].includes(msg.status.toLowerCase())) {
        return false;
      }
      if (statusFilter === "replied" && !["replied", "sent", "read"].includes(msg.status.toLowerCase())) {
        return false;
      }
      if (statusFilter === "interested" && !msg.isInterested && msg.status.toLowerCase() !== "interested") {
        return false;
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = msg.senderName.toLowerCase().includes(q);
        const matchContact = msg.senderContact.toLowerCase().includes(q);
        const matchSnippet = msg.snippet.toLowerCase().includes(q);
        const matchSubject = msg.subject?.toLowerCase().includes(q);
        const matchCity = msg.city?.toLowerCase().includes(q);
        return matchName || matchContact || matchSnippet || matchSubject || matchCity;
      }

      return true;
    });
  }, [unifiedMessages, channelTab, statusFilter, searchQuery]);

  // Keep selected message in sync or auto-select first item
  useEffect(() => {
    if (!selectedMessage && filteredMessages.length > 0) {
      setSelectedMessage(filteredMessages[0]);
    } else if (selectedMessage) {
      const exists = filteredMessages.find((m) => m.id === selectedMessage.id);
      if (exists) {
        setSelectedMessage(exists);
      } else if (filteredMessages.length > 0) {
        setSelectedMessage(filteredMessages[0]);
      }
    }
  }, [filteredMessages, selectedMessage]);

  // Fetch WhatsApp chat thread when a WhatsApp item is selected
  useEffect(() => {
    if (selectedMessage && selectedMessage.channel === "whatsapp") {
      setLoadingWaChats(true);
      authFetch(`${API}/api/v1/whatsapp/chats/${selectedMessage.sourceId}`)
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            setWaChatMessages(data.chats || []);
          }
        })
        .catch((e) => console.error("Error loading WA chats:", e))
        .finally(() => setLoadingWaChats(false));
    }
  }, [selectedMessage?.id, selectedMessage?.channel, selectedMessage?.sourceId]);

  // Scroll to bottom of chat on load
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [waChatMessages]);

  // ── WhatsApp Actions ──
  const handleSendWaReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedMessage || selectedMessage.channel !== "whatsapp" || !waReplyText.trim()) return;

    setSendingWaReply(true);
    try {
      const res = await authFetch(`${API}/api/v1/whatsapp/chats/${selectedMessage.sourceId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message_text: waReplyText.trim() })
      });

      if (res.ok) {
        // Optimistic UI push
        const newMsg: WhatsAppChatMessage = {
          id: Date.now(),
          lead_id: selectedMessage.sourceId,
          direction: "outbound",
          message_text: waReplyText.trim(),
          button_id: null,
          created_at: new Date().toISOString()
        };
        setWaChatMessages((prev) => [...prev, newMsg]);
        setWaReplyText("");
        showToast("WhatsApp message sent successfully 🚀", "success");
        fetchAllData();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(`Failed to send WhatsApp: ${formatErrorDetail(err.detail)}`, "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error sending WhatsApp message.", "error");
    } finally {
      setSendingWaReply(false);
    }
  };

  const handleToggleWaAi = async () => {
    if (!selectedMessage || selectedMessage.channel !== "whatsapp") return;
    setTogglingWaAi(true);
    try {
      const res = await authFetch(`${API}/api/v1/whatsapp/chats/${selectedMessage.sourceId}/toggle-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const d = await res.json();
        showToast(
          d.ai_enabled ? "🤖 AI Auto-Pilot enabled for this lead." : "👤 Human Takeover active. AI Auto-Pilot paused.",
          "info"
        );
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
      showToast("Error updating AI status.", "error");
    } finally {
      setTogglingWaAi(false);
    }
  };

  // ── Website Contact Status & Delete Actions ──
  const handleUpdateContactStatus = async (status: string) => {
    if (!selectedMessage || selectedMessage.channel !== "website") return;
    try {
      const res = await authFetch(`${API}/api/v1/contacts/${selectedMessage.sourceId}/status?status=${status}`, {
        method: "PUT"
      });
      if (res.ok) {
        showToast(`Status updated to ${status}.`, "success");
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteContact = async () => {
    if (!selectedMessage || selectedMessage.channel !== "website") return;
    if (!confirm("Are you sure you want to delete this website inquiry?")) return;
    try {
      const res = await authFetch(`${API}/api/v1/contacts/${selectedMessage.sourceId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        showToast("Inquiry deleted.", "info");
        setSelectedMessage(null);
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ── Email / Contact Reply Handlers ──
  const handleSendManualReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage || !manualReplyText.trim()) return;
    setSendingManualReply(true);
    try {
      const endpoint =
        selectedMessage.channel === "website"
          ? `${API}/api/v1/contacts/${selectedMessage.sourceId}/send-custom`
          : `${API}/api/v1/email/conversations/${selectedMessage.sourceId}/send-custom`;

      const subject =
        selectedMessage.channel === "website"
          ? `Re: ${selectedMessage.subject || "Website Inquiry"}`
          : `Re: ${selectedMessage.subject || "Partnership Inquiry"}`;

      const res = await authFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          body: manualReplyText
        })
      });

      if (res.ok) {
        setManualReplyText("");
        showToast("Email reply sent successfully!", "success");
        fetchAllData();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(`Failed to send reply: ${formatErrorDetail(err.detail)}`, "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error sending reply.", "error");
    } finally {
      setSendingManualReply(false);
    }
  };

  // ── AI Draft Generators ──
  const handleGenerateMeetingDraft = async () => {
    if (!selectedMessage) return;
    setGeneratingDraft(true);
    try {
      const endpoint =
        selectedMessage.channel === "website"
          ? `${API}/api/v1/contacts/${selectedMessage.sourceId}/generate-meeting-draft`
          : `${API}/api/v1/email/conversations/${selectedMessage.sourceId}/generate-meeting-draft`;

      const res = await authFetch(endpoint, { method: "POST" });
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
      showToast("Error generating meeting draft.", "error");
    } finally {
      setGeneratingDraft(false);
    }
  };

  const handleGenerateCustomDraft = async () => {
    if (!selectedMessage) return;
    setGeneratingDraft(true);
    try {
      const endpoint =
        selectedMessage.channel === "website"
          ? `${API}/api/v1/contacts/${selectedMessage.sourceId}/generate-draft`
          : `${API}/api/v1/email/conversations/${selectedMessage.sourceId}/generate-draft`;

      const res = await authFetch(endpoint, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setAiDraftData(data);
        setAiModalOpen(true);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(`Failed to generate custom draft: ${formatErrorDetail(err.detail)}`, "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error generating custom draft.", "error");
    } finally {
      setGeneratingDraft(false);
    }
  };

  const handleSendCustomApprovedReply = async () => {
    if (!aiDraftData) return;
    setSendingCustomReply(true);
    try {
      const endpoint = aiDraftData.contact_id
        ? `${API}/api/v1/contacts/${aiDraftData.contact_id}/send-custom`
        : `${API}/api/v1/email/conversations/${aiDraftData.lead_id}/send-custom`;

      const res = await authFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: aiDraftData.subject,
          body: aiDraftData.body
        })
      });

      if (res.ok) {
        const result = await res.json();
        showToast(`Email dispatched to ${result.sent_to || "recipient"}!`, "success");
        setAiModalOpen(false);
        setAiDraftData(null);
        fetchAllData();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(`Failed to send email: ${formatErrorDetail(err.detail)}`, "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error dispatching email.", "error");
    } finally {
      setSendingCustomReply(false);
    }
  };

  // Channel Counters
  const counts = useMemo(() => {
    const wa = unifiedMessages.filter((m) => m.channel === "whatsapp").length;
    const web = unifiedMessages.filter((m) => m.channel === "website").length;
    const em = unifiedMessages.filter((m) => m.channel === "email").length;
    const interested = unifiedMessages.filter((m) => m.isInterested).length;
    return { all: unifiedMessages.length, wa, web, em, interested };
  }, [unifiedMessages]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center flex-col gap-4 text-[var(--dash-text-muted)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="font-mono text-xs font-semibold">Connecting Omni-Channel Message Center...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-left pb-16 animate-fadeIn font-sans antialiased">
      {/* ── Top Header & Channel Summary Bar ── */}
      <header className="crm-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-[var(--dash-text-primary)] tracking-tight">
                Unified Message Center
              </h1>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {counts.all} Total Conversations
              </span>
              {counts.interested > 0 && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  🔥 {counts.interested} Interested Leads
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--dash-text-muted)] mt-0.5">
              Omni-channel inbox managing WhatsApp chats, Website contact inquiries, and Email replies in one place
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAllData}
            disabled={refreshing}
            className="crm-btn-secondary text-xs flex items-center gap-1.5"
            title="Refresh inbox"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-indigo-500" : ""}`} />
            <span>Sync</span>
          </button>
        </div>
      </header>

      {/* ── Channel Navigation Tabs ── */}
      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto scrollbar-none shrink-0 pb-1 max-w-full">
        <button
          onClick={() => setChannelTab("all")}
          className={`px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold rounded-md transition cursor-pointer flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
            channelTab === "all"
              ? "bg-indigo-600 text-white shadow-sm"
              : "crm-btn-secondary text-[var(--dash-text-muted)]"
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>All Channels</span>
          <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-black/20 text-inherit">{counts.all}</span>
        </button>

        <button
          onClick={() => setChannelTab("whatsapp")}
          className={`px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold rounded-md transition cursor-pointer flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
            channelTab === "whatsapp"
              ? "bg-emerald-600 text-white shadow-sm"
              : "crm-btn-secondary text-[var(--dash-text-muted)]"
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
          <span>WhatsApp</span>
          <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold">
            {counts.wa}
          </span>
        </button>

        <button
          onClick={() => setChannelTab("website")}
          className={`px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold rounded-md transition cursor-pointer flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
            channelTab === "website"
              ? "bg-sky-600 text-white shadow-sm"
              : "crm-btn-secondary text-[var(--dash-text-muted)]"
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-sky-500" />
          <span>Website Inquiries</span>
          <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold">
            {counts.web}
          </span>
        </button>

        <button
          onClick={() => setChannelTab("email")}
          className={`px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold rounded-md transition cursor-pointer flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
            channelTab === "email"
              ? "bg-violet-600 text-white shadow-sm"
              : "crm-btn-secondary text-[var(--dash-text-muted)]"
          }`}
        >
          <Mail className="w-3.5 h-3.5 text-violet-500" />
          <span>Email Replies</span>
          <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-violet-500/20 text-violet-600 dark:text-violet-300 font-bold">
            {counts.em}
          </span>
        </button>
      </div>

      {/* ── Main 2-Pane CRM Inbox Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-auto lg:h-[760px] w-full">
        {/* ── Left Pane: Conversation Feed (4 Cols) ── */}
        <div className="lg:col-span-5 xl:col-span-4 crm-card flex flex-col overflow-hidden h-[600px] lg:h-full">
          {/* Search & Status Filter Deck */}
          <div className="p-3 border-b border-[var(--dash-border)] space-y-2.5 bg-[var(--dash-table-header)]">
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--dash-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search messages, phone, email, text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="crm-input w-full pl-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 text-[11px] overflow-x-auto no-scrollbar">
              {(["all", "unread", "replied", "interested"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md capitalize font-semibold transition cursor-pointer whitespace-nowrap ${
                    statusFilter === st
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-[var(--dash-card-bg)] border border-[var(--dash-border)] text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"
                  }`}
                >
                  {st === "all" ? "All Statuses" : st}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[var(--dash-border)]">
            {filteredMessages.map((item) => {
              const isSelected = selectedMessage?.id === item.id;
              const isWa = item.channel === "whatsapp";
              const isWeb = item.channel === "website";
              const isEm = item.channel === "email";

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedMessage(item);
                    setWaReplyText("");
                    setManualReplyText("");
                  }}
                  className={`p-3.5 transition cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? "bg-indigo-500/10 border-l-4 border-indigo-600"
                      : "hover:bg-[var(--dash-table-header)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Channel Icon Badge */}
                      <span
                        className={`p-1 rounded-md text-[10px] font-bold shrink-0 ${
                          isWa
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : isWeb
                            ? "bg-sky-500/15 text-sky-600 dark:text-sky-400"
                            : "bg-violet-500/15 text-violet-600 dark:text-violet-400"
                        }`}
                        title={item.channel.toUpperCase()}
                      >
                        {isWa ? <MessageSquare className="w-3.5 h-3.5" /> : isWeb ? <Globe className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                      </span>

                      <span className="font-bold text-xs text-[var(--dash-text-primary)] truncate">
                        {item.senderName}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded-md border shrink-0 ${
                        item.isInterested || item.status === "interested"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-extrabold"
                          : item.status === "unread" || item.status === "pending"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                          : "bg-slate-500/10 text-[var(--dash-text-muted)] border-slate-500/20"
                      }`}
                    >
                      {item.isInterested ? "🔥 INTERESTED" : item.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[var(--dash-text-muted)] font-mono">
                    <span className="truncate max-w-[180px]">{item.senderContact}</span>
                    <span className="text-[10px] shrink-0">
                      {new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>

                  <p className="text-[11px] text-[var(--dash-text-muted)] line-clamp-2 leading-relaxed">
                    {item.snippet}
                  </p>
                </div>
              );
            })}

            {filteredMessages.length === 0 && (
              <div className="text-center py-16 text-xs text-[var(--dash-text-muted)] font-mono">
                No messages found matching this filter.
              </div>
            )}
          </div>
        </div>

        {/* ── Right Pane: Active Thread & Channel Reply Desk (8 Cols) ── */}
        <div className="lg:col-span-7 xl:col-span-8 crm-card flex flex-col justify-between overflow-hidden h-[600px] lg:h-full">
          {selectedMessage ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-[var(--dash-border)] bg-[var(--dash-table-header)] flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-md flex items-center justify-center font-bold text-white text-base shadow-sm shrink-0 ${
                      selectedMessage.channel === "whatsapp"
                        ? "bg-emerald-600"
                        : selectedMessage.channel === "website"
                        ? "bg-sky-600"
                        : "bg-violet-600"
                    }`}
                  >
                    {selectedMessage.senderName.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-bold text-[var(--dash-text-primary)] truncate">
                        {selectedMessage.senderName}
                      </h3>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${
                          selectedMessage.channel === "whatsapp"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : selectedMessage.channel === "website"
                            ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
                            : "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20"
                        }`}
                      >
                        {selectedMessage.channel.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[var(--dash-text-muted)] font-mono mt-0.5">
                      <span>{selectedMessage.senderContact}</span>
                      {selectedMessage.city && <span>• {selectedMessage.city}</span>}
                    </div>
                  </div>
                </div>

                {/* Header Action Tools */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* WhatsApp Specific Actions */}
                  {selectedMessage.channel === "whatsapp" && (
                    <>
                      <button
                        onClick={handleToggleWaAi}
                        disabled={togglingWaAi}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md border transition cursor-pointer flex items-center gap-1.5 ${
                          selectedMessage.aiEnabled !== false
                            ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                        }`}
                        title="Toggle AI Auto-Pilot on/off for this contact"
                      >
                        {togglingWaAi ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : selectedMessage.aiEnabled !== false ? (
                          <Bot className="w-3.5 h-3.5" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5" />
                        )}
                        <span>{selectedMessage.aiEnabled !== false ? "AI Auto-Pilot ON" : "Human Takeover"}</span>
                      </button>

                      <a
                        href={`https://wa.me/${selectedMessage.senderContact.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs font-bold rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 flex items-center gap-1.5 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Web</span>
                      </a>
                    </>
                  )}

                  {/* Website Specific Actions */}
                  {selectedMessage.channel === "website" && (
                    <>
                      <select
                        value={selectedMessage.status}
                        onChange={(e) => handleUpdateContactStatus(e.target.value)}
                        className="crm-input text-xs py-1 px-2 font-semibold"
                      >
                        <option value="unread">Status: Unread</option>
                        <option value="read">Status: Read</option>
                        <option value="replied">Status: Replied</option>
                      </select>

                      <button
                        onClick={handleDeleteContact}
                        className="p-2 rounded-md border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Delete Inquiry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {/* Email Outreach AI Draft Buttons */}
                  {(selectedMessage.channel === "email" || selectedMessage.channel === "website") && (
                    <>
                      <button
                        onClick={handleGenerateMeetingDraft}
                        disabled={generatingDraft}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md shadow-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {generatingDraft ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Calendar className="w-3.5 h-3.5 text-amber-300" />
                        )}
                        <span>✨ AI Meeting Draft</span>
                      </button>

                      <button
                        onClick={handleGenerateCustomDraft}
                        disabled={generatingDraft}
                        className="crm-btn-secondary text-xs flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        <span>AI Custom</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* ── Middle: Conversation Viewer ── */}
              <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 bg-[var(--dash-bg)] min-h-[300px]">
                {/* 1. WHATSAPP LIVE BUBBLE CHAT */}
                {selectedMessage.channel === "whatsapp" && (
                  <>
                    {loadingWaChats ? (
                      <div className="py-20 flex flex-col items-center justify-center gap-2 text-[var(--dash-text-muted)]">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                        <span className="text-xs font-mono">Loading WhatsApp chat history...</span>
                      </div>
                    ) : waChatMessages.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[var(--dash-text-muted)] font-mono">
                        No previous chat messages recorded for this contact yet. Send an outreach reply below!
                      </div>
                    ) : (
                      waChatMessages.map((chat) => {
                        const isOutbound = chat.direction === "outbound";
                        return (
                          <div
                            key={chat.id}
                            className={`flex flex-col ${isOutbound ? "items-end" : "items-start"}`}
                          >
                            <div
                              className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-md text-xs leading-relaxed shadow-xs ${
                                isOutbound
                                  ? "bg-indigo-600 text-white"
                                  : "bg-[var(--dash-card-bg)] text-[var(--dash-text-primary)] border border-[var(--dash-border)]"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 font-mono mb-1">
                                <span className="font-bold">{isOutbound ? "Tech Infinix Team / AI" : selectedMessage.senderName}</span>
                                <span>{new Date(chat.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                              </div>
                              <p className="whitespace-pre-wrap font-sans">{chat.message_text}</p>
                              {chat.button_id && (
                                <div className="mt-2 pt-1 border-t border-white/20 text-[10px] font-mono">
                                  Clicked Button: <strong className="underline">{chat.button_id}</strong>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={chatEndRef} />
                  </>
                )}

                {/* 2. WEBSITE INQUIRY DETAIL CARD */}
                {selectedMessage.channel === "website" && (
                  <div className="space-y-4">
                    <div className="crm-card p-5 space-y-3">
                      <div className="flex items-center justify-between border-b border-[var(--dash-border)] pb-3">
                        <div>
                          <span className="text-xs font-bold text-[var(--dash-text-muted)] font-mono uppercase">
                            Website Contact Form Submission
                          </span>
                          <h2 className="text-base font-bold text-[var(--dash-text-primary)] mt-0.5">
                            {selectedMessage.subject || "General Inquiry"}
                          </h2>
                        </div>
                        <span className="text-xs text-[var(--dash-text-muted)] font-mono">
                          {new Date(selectedMessage.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[var(--dash-table-header)] p-3 rounded-md border border-[var(--dash-border)]">
                        <div>
                          <span className="text-[var(--dash-text-muted)] block">Visitor Name:</span>
                          <strong className="text-[var(--dash-text-primary)]">{selectedMessage.senderName}</strong>
                        </div>
                        <div>
                          <span className="text-[var(--dash-text-muted)] block">Email Address:</span>
                          <strong className="text-indigo-600 dark:text-indigo-400 break-all">{selectedMessage.senderContact}</strong>
                        </div>
                      </div>

                      <div className="pt-2">
                        <label className="text-[11px] font-bold text-[var(--dash-text-muted)] uppercase tracking-wider block mb-1.5">
                          Submitted Message Body
                        </label>
                        <div className="p-4 rounded-md bg-[var(--dash-table-header)] border border-[var(--dash-border)] text-xs text-[var(--dash-text-primary)] leading-relaxed whitespace-pre-wrap">
                          {selectedMessage.snippet}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. EMAIL THREAD VIEWER */}
                {selectedMessage.channel === "email" && (
                  <div className="space-y-4">
                    {((selectedMessage.raw?.thread as any[]) || []).map((msg: any, idx: number) => {
                      const cleaned = cleanEmailBody(msg.body);
                      const isExpanded = expandedQuotes[`${selectedMessage.id}-${idx}`] || false;
                      const isOutbound = msg.direction === "outbound";

                      return (
                        <div
                          key={idx}
                          className={`crm-card p-4 space-y-2 border-l-4 ${
                            isOutbound ? "border-l-indigo-600" : "border-l-emerald-500"
                          }`}
                        >
                          <div className="flex items-center justify-between border-b border-[var(--dash-border)] pb-2 text-xs">
                            <div>
                              <span className="font-bold text-[var(--dash-text-primary)]">
                                {isOutbound ? "Tech Infinix Outreach Team" : selectedMessage.senderName}
                              </span>
                              <span className="text-[var(--dash-text-muted)] ml-2 text-[11px] font-mono">
                                ({isOutbound ? "To: " + selectedMessage.senderContact : "From: " + selectedMessage.senderContact})
                              </span>
                            </div>
                            <span className="text-[10px] text-[var(--dash-text-muted)] font-mono">
                              {new Date(msg.received_at || selectedMessage.timestamp).toLocaleString()}
                            </span>
                          </div>

                          <div className="text-xs text-[var(--dash-text-primary)] leading-relaxed whitespace-pre-wrap">
                            {cleaned.cleanText}
                          </div>

                          {cleaned.quotedText && (
                            <div className="pt-2 border-t border-[var(--dash-border)]">
                              <button
                                onClick={() =>
                                  setExpandedQuotes((prev) => ({
                                    ...prev,
                                    [`${selectedMessage.id}-${idx}`]: !isExpanded
                                  }))
                                }
                                className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                              >
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                <span>{isExpanded ? "Hide quoted history" : "Show quoted email history"}</span>
                              </button>
                              {isExpanded && (
                                <div className="mt-2 p-3 bg-[var(--dash-table-header)] rounded-md text-[11px] text-[var(--dash-text-muted)] font-mono whitespace-pre-wrap">
                                  {cleaned.quotedText}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Bottom: Channel Reply Composer Desk ── */}
              <div className="p-4 border-t border-[var(--dash-border)] bg-[var(--dash-table-header)] shrink-0">
                {/* WhatsApp Reply Composer */}
                {selectedMessage.channel === "whatsapp" && (
                  <form onSubmit={handleSendWaReply} className="space-y-2">
                    {/* Quick Reply Presets */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[10px]">
                      {[
                        "Thanks for your reply! When is a good time for a quick 5-min call?",
                        "Here is our work portfolio: https://techinfinix.com",
                        "Would tomorrow at 3:00 PM work for an intro session?"
                      ].map((prompt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setWaReplyText(prompt)}
                          className="px-2.5 py-1 rounded-md bg-[var(--dash-card-bg)] border border-[var(--dash-border)] text-[var(--dash-text-muted)] hover:text-indigo-500 hover:border-indigo-500 transition cursor-pointer whitespace-nowrap"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Type a direct WhatsApp response..."
                        value={waReplyText}
                        onChange={(e) => setWaReplyText(e.target.value)}
                        className="crm-input flex-1 text-xs"
                      />
                      <button
                        type="submit"
                        disabled={sendingWaReply || !waReplyText.trim()}
                        className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        {sendingWaReply ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        <span>Send WhatsApp</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Email / Website Inquiry Composer */}
                {(selectedMessage.channel === "website" || selectedMessage.channel === "email") && (
                  <form onSubmit={handleSendManualReply} className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-[var(--dash-text-muted)]">
                      <span className="font-semibold">
                        Direct Email Response to: <strong>{selectedMessage.senderContact}</strong>
                      </span>
                    </div>

                    <textarea
                      rows={3}
                      placeholder={`Draft reply to ${selectedMessage.senderName}...`}
                      value={manualReplyText}
                      onChange={(e) => setManualReplyText(e.target.value)}
                      className="crm-input w-full text-xs font-sans"
                    />

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="submit"
                        disabled={sendingManualReply || !manualReplyText.trim()}
                        className="crm-btn-primary text-xs flex items-center gap-1.5"
                      >
                        {sendingManualReply ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>Dispatch Email Reply</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-[var(--dash-text-muted)] space-y-3">
              <div className="w-14 h-14 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Inbox className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[var(--dash-text-primary)]">No Conversation Selected</h3>
              <p className="text-xs max-w-sm">
                Select a message from the left inbox to view full chat history, prospect threads, and send replies.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── AI Draft Approval Popup Modal ── */}
      {aiModalOpen && aiDraftData && (
        <div
          onClick={() => setAiModalOpen(false)}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl crm-card p-6 space-y-4 cursor-default relative shadow-2xl text-left"
          >
            <div className="flex items-center justify-between border-b border-[var(--dash-border)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-md bg-emerald-600 text-white font-bold flex items-center justify-center shadow-md">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--dash-text-primary)]">
                    Review &amp; Approve AI Response Draft
                  </h3>
                  <p className="text-xs text-[var(--dash-text-muted)]">
                    Target: {aiDraftData.business_name} ({aiDraftData.recipient_email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAiModalOpen(false)}
                className="p-1.5 rounded-md text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div
                className={`p-3 rounded-md border flex items-center justify-between text-xs font-mono font-bold ${
                  aiDraftData.mode === "test"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                }`}
              >
                <span>{aiDraftData.mode === "test" ? "🧪 TEST MODE ACTIVE" : "🌐 PRODUCTION DISPATCH MODE"}</span>
                <span className="text-[10px] font-normal">
                  {aiDraftData.mode === "test"
                    ? `Dispatching to test mailbox (${aiDraftData.test_recipient || "configured test email"})`
                    : `Dispatching to ${aiDraftData.recipient_email}`}
                </span>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[var(--dash-text-muted)] font-mono uppercase tracking-wider block mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={aiDraftData.subject}
                  onChange={(e) => setAiDraftData({ ...aiDraftData, subject: e.target.value })}
                  className="crm-input w-full"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[var(--dash-text-muted)] font-mono uppercase tracking-wider block mb-1">
                  Email Response Body (Admin Editable)
                </label>
                <textarea
                  rows={8}
                  value={aiDraftData.body}
                  onChange={(e) => setAiDraftData({ ...aiDraftData, body: e.target.value })}
                  className="crm-input w-full font-sans leading-relaxed text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[var(--dash-border)] pt-3">
              <button
                onClick={handleGenerateMeetingDraft}
                disabled={generatingDraft}
                className="crm-btn-secondary text-xs flex items-center gap-1.5"
              >
                {generatingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>Regenerate</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAiModalOpen(false)}
                  className="crm-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendCustomApprovedReply}
                  disabled={sendingCustomReply}
                  className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  {sendingCustomReply ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Approve &amp; Dispatch</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification Banner ── */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[9999] animate-fadeIn font-mono">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-md border shadow-xl backdrop-blur-md transition-all ${
              toast.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : toast.type === "error"
                ? "bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400"
                : "bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400"
            }`}
          >
            <span className="flex-1 text-xs font-semibold tracking-wide">{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-inherit hover:opacity-75 text-sm font-bold ml-1.5">
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
