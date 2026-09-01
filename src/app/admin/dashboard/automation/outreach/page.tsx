"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useAuthStore } from "@/lib/authStore";
import { useTheme } from "next-themes";
import {
  Mail,
  Play,
  Pause,
  StopCircle,
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Send,
  MessageSquare,
  Users,
  Database,
  Search,
  ChevronDown,
  BarChart as BarChartIcon,
  Loader2,
  Calendar,
  Settings2,
  Sparkles,
  Inbox,
  Filter,
  Check,
  X,
  Cpu,
  Globe,
  Layers
} from "lucide-react";
import { authFetch, API } from "@/lib/authFetch";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from "recharts";

type TabType = "sender" | "queue" | "inbox" | "analytics";

// Helper to parse and clean email body content (removing HTML/CSS tags and splitting quoted text)
function cleanEmailBody(body: string): { cleanText: string; quotedText: string } {
  if (!body) return { cleanText: "", quotedText: "" };

  let text = body;

  // 1. Decode common HTML entities first (normalize spaces and tags before stripping)
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

  // 2. Remove style tag elements
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

  // 3. Replace HTML layout tags with spacing and markdown symbols to preserve format
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<li[^>]*>/gi, "\n- ");
  text = text.replace(/<tr[^>]*>/gi, "\n");
  text = text.replace(/<p[^>]*>/gi, "\n\n");
  text = text.replace(/<\/(p|div|h[1-6]|tr|ul|ol|li)>/gi, "\n");
  text = text.replace(/<\/td>/gi, "  ");

  // 4. Strip any leftover HTML tags
  text = text.replace(/<[^>]*>/g, ""); // Strip leftover tags

  // 5. Remove all CSS rule blocks (both top-level, nested rules, and leftover media blocks)
  while (text.includes("{") && text.includes("}")) {
    const prevText = text;
    text = text.replace(/[.#a-zA-Z0-9-_, :()@*>=!'"\n\r&;+%~]+\s*\{[^{}]*\}/g, "");
    text = text.replace(/\{[^{}]*\}/g, "");
    if (text === prevText) break;
  }

  // 6. Clean consecutive newlines to prevent huge blank blocks
  text = text.replace(/\n{3,}/g, "\n\n");

  // 7. Detect quoted email signature or reply history markers
  const lines = text.split("\n");
  const cleanLines: string[] = [];
  const quotedLines: string[] = [];
  let inQuoted = false;

  for (let line of lines) {
    const trimmed = line.trim();
    
    // Check for quoted history triggers
    if (
      /^(on\s+.*wrote:)$/i.test(trimmed) || 
      /^(from:)/i.test(trimmed) ||
      trimmed.startsWith("---") ||
      trimmed.startsWith(">") ||
      (trimmed.startsWith("On ") && trimmed.includes("wrote:"))
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

  // If we cleaned everything and ended up with nothing, return the text minus CSS
  if (!cleanResult) {
    cleanResult = text.trim();
    quotedResult = "";
  }

  return { cleanText: cleanResult, quotedText: quotedResult };
}

// Helper to render cleaned email body with structured paragraphs and bullet lists
function renderCleanText(text: string) {
  if (!text) return null;
  
  const parts = text.split("\n\n");
  
  return parts.map((part, index) => {
    const trimmedPart = part.trim();
    if (!trimmedPart) return null;
    
    // Check if this block is composed of bulleted/list lines
    const lines = trimmedPart.split("\n");
    const isBulletList = lines.every(line => {
      const t = line.trim();
      return !t || 
             t.startsWith("- ") || 
             t.startsWith("* ") || 
             t.startsWith("• ") || 
             t.startsWith("🔸 ") || 
             t.startsWith("🌟 ") || 
             t.startsWith("📍 ") || 
             t.startsWith("🌐 ") || 
             t.startsWith("🔍 ");
    }) && lines.some(line => line.trim().length > 0);

    if (isBulletList) {
      return (
        <ul key={index} className="list-none pl-1 space-y-1.5 my-2">
          {lines.map((line, lineIdx) => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return null;
            
            // Clean the bullet prefix symbol
            const cleanContent = trimmedLine.replace(/^[-*•🔸🌟📍🌐🔍]\s*/, "");
            return (
              <li key={lineIdx} className="leading-relaxed flex items-start gap-2">
                <span className="mt-1.5 shrink-0 text-accent-custom select-none text-[8px]">•</span>
                <span>{cleanContent}</span>
              </li>
            );
          })}
        </ul>
      );
    }
    
    // Default paragraph render
    return (
      <p key={index} className="leading-relaxed">
        {trimmedPart}
      </p>
    );
  });
}

export default function OutreachManager() {
  const { accessToken, isAuthenticated } = useAuthStore();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>("sender");
  const [loading, setLoading] = useState(true);

  // Data States
  const [queue, setQueue] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [expandedQuotes, setExpandedQuotes] = useState<Record<number, boolean>>({});

  // Auto-Sender Process State
  const [senderActive, setSenderActive] = useState(false);
  const [togglingSender, setTogglingSender] = useState(false);
  const [activity, setActivity] = useState<any>(null);

  // Terminal scroll references
  const outreachTerminalRef = useRef<HTMLDivElement>(null);
  const outreachTerminalEndRef = useRef<HTMLDivElement>(null);

  // Autoscroll outreach terminal
  useEffect(() => {
    const container = outreachTerminalRef.current;
    if (container) {
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
      if (isAtBottom) {
        outreachTerminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } else if (outreachTerminalEndRef.current) {
      outreachTerminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activity?.logs]);

  // Dialog / Detail States
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filters
  const [queueSearch, setQueueSearch] = useState("");
  const [inboxSearch, setInboxSearch] = useState("");

  // Follow-up settings states
  const [followupEnabled, setFollowupEnabled] = useState(true);
  const [followupInterval, setFollowupInterval] = useState(3);
  const [maxFollowups, setMaxFollowups] = useState(3);
  const [delayMin, setDelayMin] = useState(30);
  const [delayMax, setDelayMax] = useState(90);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [isEditingSettings, setIsEditingSettings] = useState(false);

  // Toast notifications state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      const res = await authFetch(`${API}/api/v1/email/sender/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followup_enabled: followupEnabled,
          followup_interval_days: followupInterval,
          max_followups: maxFollowups,
          delay_min: delayMin,
          delay_max: delayMax
        })
      });
      if (res.ok) {
        showToast("Outreach Settings updated successfully!", "success");
        setIsEditingSettings(false); // Close edit mode on success
      } else {
        showToast("Failed to save settings. Please try again.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error saving settings.", "error");
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleClearLogs = async () => {
    try {
      const res = await authFetch(`${API}/api/v1/email/sender/logs/clear`, {
        method: "POST"
      });
      if (res.ok) {
        showToast("Live terminal logs cleared successfully!", "info");
        // Clear local logs array in state
        if (activity) {
          setActivity({ ...activity, logs: [] });
        }
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to clear logs.", "error");
    }
  };

  const isDark = theme === "dark";

  const toggleSender = async () => {
    setTogglingSender(true);
    try {
      const res = await authFetch(`${API}/api/v1/email/sender/toggle`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setSenderActive(data.is_active);
      }
    } catch (e) {
      console.error("Failed to toggle sender status:", e);
    } finally {
      setTogglingSender(false);
    }
  };

  const lastFetchRef = useRef<number>(0);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingActivityRef = useRef<any>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateActivityThrottled = (data: any) => {
    pendingActivityRef.current = data;
    if (!updateTimeoutRef.current) {
      updateTimeoutRef.current = setTimeout(() => {
        updateTimeoutRef.current = null;
        if (pendingActivityRef.current) {
          setActivity(pendingActivityRef.current);
          setSenderActive(pendingActivityRef.current.is_active);
          pendingActivityRef.current = null;
        }
      }, 150); // Batch renders to run at most once every 150ms
    }
  };

  const fetchData = async (silent = false) => {
    if (silent) {
      const now = Date.now();
      // Throttle silent fetches to at most once every 3 seconds
      if (now - lastFetchRef.current < 3000) {
        if (fetchTimeoutRef.current) return;
        
        const delay = 3000 - (now - lastFetchRef.current);
        fetchTimeoutRef.current = setTimeout(() => {
          fetchTimeoutRef.current = null;
          fetchData(true);
        }, delay);
        return;
      }
    }
    
    lastFetchRef.current = Date.now();
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = null;
    }

    if (!silent) setLoading(true);
    try {
      // 1. Fetch settings on initial load (non-silent) regardless of tab
      if (!silent) {
        const settingsRes = await authFetch(`${API}/api/v1/email/sender/settings`);
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setFollowupEnabled(settingsData.followup_enabled);
          setFollowupInterval(settingsData.followup_interval_days);
          setMaxFollowups(settingsData.max_followups);
          setDelayMin(settingsData.delay_min !== undefined ? settingsData.delay_min : 30);
          setDelayMax(settingsData.delay_max !== undefined ? settingsData.delay_max : 90);
        }
      }

      // 2. Fetch only tab-specific datasets to eliminate dashboard lag
      if (activeTab === "sender" || activeTab === "analytics") {
        const analyticsRes = await authFetch(`${API}/api/v1/email/analytics`);
        if (analyticsRes.ok) {
          setAnalytics(await analyticsRes.json());
        }
      }

      if (activeTab === "queue") {
        const queueRes = await authFetch(`${API}/api/v1/email/queue`);
        if (queueRes.ok) {
          setQueue(await queueRes.json());
        }
        const msgRes = await authFetch(`${API}/api/v1/email/messages`);
        if (msgRes.ok) {
          setMessages(await msgRes.json());
        }
      }

      if (activeTab === "inbox") {
        const convRes = await authFetch(`${API}/api/v1/email/conversations`);
        if (convRes.ok) {
          setConversations(await convRes.json());
        }
      }
    } catch (error) {
      console.error("Failed to load email outreach datasets:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // 1. Fetch static datasets once authenticated or active tab changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, activeTab]);

  // 2. Set up WebSocket for real-time live activity stream (no HTTP polling to prevent lag)
  useEffect(() => {
    if (!isAuthenticated) return;

    const wsUrl = `${API.replace(/^http/, "ws")}/api/v1/email/sender/ws`;

    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;
    let isDestroyed = false;

    const connectWS = () => {
      if (isDestroyed) return;
      try {
        console.log("Connecting real-time outreach WebSocket...");
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log("Outreach WebSocket connected successfully.");
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            updateActivityThrottled(data);
            fetchData(true); // Silent real-time background data refresh (tab-aware & throttled)
          } catch (e) {
            console.error("Failed to parse WebSocket outreach payload:", e);
          }
        };

        ws.onclose = () => {
          if (isDestroyed) return;
          console.log("Outreach WebSocket disconnected. Reconnecting in 3s...");
          ws = null;
          reconnectTimeout = setTimeout(connectWS, 3000);
        };

        ws.onerror = (err) => {
          console.warn("Outreach WebSocket connection error:", err);
          ws?.close();
        };
      } catch (e) {
        console.warn("Outreach WebSocket constructor error:", e);
        reconnectTimeout = setTimeout(connectWS, 3000);
      }
    };

    connectWS();

    return () => {
      isDestroyed = true;
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }
    };
  }, [isAuthenticated]);




  // Retry Failed Message
  const handleRetryMessage = async (messageId: number) => {
    setActionLoading(`message-retry-${messageId}`);
    try {
      const response = await authFetch(`${API}/api/v1/email/messages/${messageId}/retry`, {
        method: "POST"
      });
      if (response.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // Approve Draft Message
  const handleApproveDraft = async (messageId: number) => {
    setActionLoading(`message-approve-${messageId}`);
    try {
      const response = await authFetch(`${API}/api/v1/email/messages/${messageId}/approve`, {
        method: "POST"
      });
      if (response.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // Send Manual Reply
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !replyText.trim()) return;
    setReplyLoading(true);
    try {
      // Find the last message in thread to check subject line format
      const thread = selectedConversation.thread || [];
      const lastMsg = thread[thread.length - 1] || {};
      const response = await authFetch(`${API}/api/v1/email/messages/${lastMsg.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Use manually typed content
        body: JSON.stringify({
          recipient_email: selectedConversation.email,
          subject: lastMsg.subject ? (lastMsg.subject.startsWith("Re:") ? lastMsg.subject : `Re: ${lastMsg.subject}`) : "Follow up from Nexora AI",
          body: replyText
        })
      });
      if (response.ok) {
        setReplyText("");
        // Reload conversations
        const convRes = await authFetch(`${API}/api/v1/email/conversations`);
        if (convRes.ok) {
          const freshConvs = await convRes.json();
          setConversations(freshConvs);
          const updated = freshConvs.find((c: any) => c.lead_id === selectedConversation.lead_id);
          setSelectedConversation(updated || null);
        }
      } else {
        alert("Failed to send manual reply message.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReplyLoading(false);
    }
  };

  // Filter queue & history list
  const filteredMessages = useMemo(() => {
    const s = queueSearch.toLowerCase().trim();
    if (!s) return messages;
    return messages.filter(
      (m: any) =>
        m.recipient_email?.toLowerCase().includes(s) ||
        m.subject?.toLowerCase().includes(s) ||
        m.status?.toLowerCase().includes(s) ||
        m.message_type?.toLowerCase().includes(s)
    );
  }, [messages, queueSearch]);

  // Filter Inbox conversation threads
  const filteredConversations = useMemo(() => {
    const s = inboxSearch.toLowerCase().trim();
    if (!s) return conversations;
    return conversations.filter(
      (c: any) =>
        c.business_name?.toLowerCase().includes(s) ||
        c.email?.toLowerCase().includes(s) ||
        c.intent?.toLowerCase().includes(s)
    );
  }, [conversations, inboxSearch]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center flex-col gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-accent-custom/20 blur-xl animate-pulse" />
          <Loader2 className="w-8 h-8 text-accent-custom animate-spin relative" />
        </div>
        <span className="font-mono text-xs text-gray-400">Loading Outreach Dashboard Console...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left pb-16 animate-fadeIn">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-accent-custom shrink-0" />
            AI Email Outreach
          </h1>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-[#B0B0B0] font-mono mt-1">
            Autonomous outreach agents, classification layers, and cold email pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData()}
            className="p-1.5 hover:bg-gray-150 dark:hover:bg-white/5 border border-gray-250 dark:border-white/10 rounded-lg text-gray-450 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards deck */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Sender Engine */}
          <div className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-300 bg-white dark:bg-[#0c0c0c] hover:shadow-md ${
            senderActive 
              ? "border-emerald-500/30 dark:border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.05)]" 
              : "border-gray-200 dark:border-white/10"
          }`}>
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block">Sender Engine</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`w-2 h-2 rounded-full ${senderActive ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-gray-400"}`} />
                <span className="text-xs font-bold font-mono text-gray-900 dark:text-white">
                  {senderActive ? "RUNNING" : "PAUSED"}
                </span>
              </div>
            </div>
            <div className={`p-2 rounded-lg ${senderActive ? "bg-emerald-500/10 text-emerald-500 animate-pulse" : "bg-gray-100 dark:bg-white/5 text-gray-400"}`}>
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          
          {/* Card 2: Outbound Sent */}
          <div className="p-4 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-between transition-all bg-white dark:bg-[#0c0c0c] hover:border-teal-500/20 hover:shadow-sm">
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block">Outbound Sent</span>
              <span className="text-2xl font-bold font-mono text-gray-900 dark:text-white block">
                {analytics.total_sent}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-500">
              <Send className="w-4 h-4" />
            </div>
          </div>
          
          {/* Card 3: Pending Queue */}
          <div className="p-4 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-between transition-all bg-white dark:bg-[#0c0c0c] hover:border-yellow-500/20 hover:shadow-sm">
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block">Pending Queue</span>
              <span className="text-2xl font-bold font-mono text-gray-900 dark:text-white block">
                {analytics ? analytics.total_queued : 0}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          {/* Card 4: Replies / Rate */}
          <div className="p-4 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-between transition-all bg-white dark:bg-[#0c0c0c] hover:border-emerald-500/20 hover:shadow-sm">
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block">Replies / Rate</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-bold font-mono text-gray-900 dark:text-white">
                  {analytics.total_replied}
                </span>
                <span className="text-[10px] text-emerald-500 font-semibold font-mono">
                  ({analytics.total_sent > 0 ? ((analytics.total_replied / analytics.total_sent) * 100).toFixed(1) : 0}%)
                </span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>

          {/* Card 5: Unsubscribed */}
          <div className="p-4 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-between transition-all bg-white dark:bg-[#0c0c0c] hover:border-purple-500/20 hover:shadow-sm">
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block">Unsubscribed</span>
              <span className="text-2xl font-bold font-mono text-gray-900 dark:text-white block">
                {analytics.total_unsubscribed}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-nowrap overflow-x-auto no-scrollbar border-b border-gray-200 dark:border-white/10 gap-1 sm:gap-4 w-full">
        {([
          { key: "sender", label: "Sender", fullLabel: "Auto-Sender Deck", icon: Settings2 },
          { key: "queue", label: "Queue", fullLabel: "Email Queue & Logs", icon: Clock },
          { key: "inbox", label: "Inbox", fullLabel: "Agent 2 Inboxes", icon: MessageSquare, badge: conversations.length.toString() },
          { key: "analytics", label: "Analytics", fullLabel: "Analytics Dashboard", icon: BarChartIcon }
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as TabType)}
            className={`py-3 px-2 sm:px-1 border-b-2 text-[11px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === t.key
                ? "border-accent-custom text-accent-custom font-bold"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/10"
            }`}
          >
            <t.icon className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{t.fullLabel}</span>
            <span className="sm:hidden">{t.label}</span>
            {t.badge && parseInt(t.badge) > 0 && (
              <span className="ml-0.5 sm:ml-1 bg-accent-custom text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold font-mono">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="mt-4">
        {activeTab === "sender" && (
          <div className="border border-gray-250 dark:border-white/10 rounded-2xl bg-white dark:bg-[#0c0c0c] p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-gray-150 dark:border-white/5">
              <div className="space-y-1 text-left">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-accent-custom" />
                  Autonomous Outreach Dispatcher
                </h2>
                <p className="text-xs text-gray-550 dark:text-[#B0B0B0] max-w-xl leading-relaxed font-sans">
                  Controls the background worker task that personalizes and transmits outreach emails. The dispatcher operates based on website presence criteria.
                </p>
              </div>

              <button
                onClick={toggleSender}
                disabled={togglingSender}
                className={`w-full md:w-auto flex items-center justify-center gap-2 font-mono font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 ${
                  senderActive 
                    ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/10 hover:shadow-[0_0_15px_rgba(217,119,6,0.2)]" 
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/10 hover:shadow-[0_0_15px_rgba(5,150,105,0.2)]"
                }`}
              >
                {togglingSender ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : senderActive ? (
                  <Pause className="w-4 h-4 fill-white" />
                ) : (
                  <Play className="w-4 h-4 fill-white animate-pulse" />
                )}
                {senderActive ? "PAUSE DISPATCHER" : "START DISPATCHER"}
              </button>
            </div>

            {/* Live Terminal Monitor and Logic Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Logic and descriptions */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-150 dark:border-white/5 bg-gray-50/20 dark:bg-white/1 rounded-xl p-5 space-y-3 text-left hover:border-accent-custom/20 hover:bg-white/2 transition-all duration-300">
                    <div className="flex items-center gap-2 text-accent-custom font-bold text-xs font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-custom animate-pulse" />
                      CASE 1: PROSPECT HAS WEBSITE
                    </div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Pitch Advanced Ops & Growth Scaling</h3>
                    <p className="text-xs text-gray-550 dark:text-[#A0A0A0] leading-relaxed font-sans">
                      If the scraper finds a business listing that contains an active website link, the AI personalization engine pitches:
                    </p>
                    <ul className="text-[11px] text-gray-600 dark:text-gray-400 space-y-2 font-mono list-none pl-1">
                      <li className="flex items-center gap-1.5"><span className="text-accent-custom text-xs font-bold">⚡</span> SEO & Ranking Optimization</li>
                      <li className="flex items-center gap-1.5"><span className="text-accent-custom text-xs font-bold">⚡</span> Modern Web Upgrades & Re-design</li>
                      <li className="flex items-center gap-1.5"><span className="text-accent-custom text-xs font-bold">⚡</span> WhatsApp Automation & Workflow Bots</li>
                      <li className="flex items-center gap-1.5"><span className="text-accent-custom text-xs font-bold">⚡</span> Web Scraping & Custom Scraper APIs</li>
                    </ul>
                  </div>

                  <div className="border border-gray-150 dark:border-white/5 bg-gray-50/20 dark:bg-white/1 rounded-xl p-5 space-y-3 text-left hover:border-emerald-500/20 hover:bg-white/2 transition-all duration-300">
                    <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      CASE 2: PROSPECT HAS NO WEBSITE
                    </div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Offer Web Design & Mockup Proposal</h3>
                    <p className="text-xs text-gray-555 dark:text-[#A0A0A0] leading-relaxed font-sans">
                      If the business does not have a website link registered on Justdial, the AI personalization engine pitches:
                    </p>
                    <ul className="text-[11px] text-gray-600 dark:text-gray-400 space-y-2 font-mono list-none pl-1">
                      <li className="flex items-center gap-1.5"><span className="text-emerald-500 text-xs font-bold">✦</span> Custom Web Development</li>
                      <li className="flex items-center gap-1.5"><span className="text-emerald-500 text-xs font-bold">✦</span> Establishing local online search presence</li>
                      <li className="flex items-center gap-1.5"><span className="text-emerald-500 text-xs font-bold">✦</span> Free homepage mockup draft offer</li>
                      <li className="flex items-center gap-1.5"><span className="text-emerald-500 text-xs font-bold">✦</span> Local SEO setup to capture organic leads</li>
                    </ul>
                  </div>
                </div>

                {/* Visual Execution Pipeline Stepper */}
                <div className="border border-gray-150 dark:border-white/5 bg-gray-50/10 dark:bg-white/1 rounded-xl p-5 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-xs uppercase tracking-wider font-mono">
                      <Layers className="w-3.5 h-3.5 text-accent-custom" />
                      Outreach Execution Pipeline
                    </div>
                    <span className="text-[9px] font-mono text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full border border-gray-200 dark:border-white/5">
                      Live Workflow Map
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-2 relative">
                    {/* Connection line background */}
                    <div className="absolute top-[18px] left-[10%] right-[10%] h-0.5 bg-gray-200 dark:bg-white/5 z-0" />
                    {senderActive && (
                      <div className="absolute top-[18px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-accent-custom via-emerald-500 to-teal-500 z-0 animate-pulse" />
                    )}

                    {/* Step 1: Leads */}
                    <div className="flex flex-col items-center text-center z-10">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 ${
                        analytics.total_leads > 0 
                          ? "bg-accent-custom/10 border-accent-custom text-accent-custom shadow-[0_0_8px_rgba(239,68,68,0.2)]" 
                          : "bg-white dark:bg-[#111] border-gray-200 dark:border-white/10 text-gray-400"
                      }`}>
                        <Database className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-900 dark:text-white mt-2">1. Scraped</span>
                      <span className="text-[9px] text-gray-400 font-mono mt-0.5">{analytics.total_leads} Leads</span>
                    </div>

                    {/* Step 2: Queue */}
                    <div className="flex flex-col items-center text-center z-10">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 ${
                        analytics && analytics.total_queued > 0 
                          ? "bg-yellow-500/10 border-yellow-500 text-yellow-500 shadow-[0_0_8px_rgba(245,158,11,0.2)]" 
                          : "bg-white dark:bg-[#111] border-gray-200 dark:border-white/10 text-gray-400"
                      }`}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-900 dark:text-white mt-2">2. Queued</span>
                      <span className="text-[9px] text-gray-400 font-mono mt-0.5">{(analytics ? analytics.total_queued : 0)} Pending</span>
                    </div>

                    {/* Step 3: AI Writer */}
                    <div className="flex flex-col items-center text-center z-10">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 ${
                        senderActive 
                          ? "bg-blue-500/10 border-blue-500 text-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.3)]" 
                          : "bg-white dark:bg-[#111] border-gray-200 dark:border-white/10 text-gray-400"
                      }`}>
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-900 dark:text-white mt-2">3. AI Agent</span>
                      <span className="text-[9px] text-gray-400 font-mono mt-0.5">{senderActive ? "Personalizing" : "Idle"}</span>
                    </div>

                    {/* Step 4: Dispatch */}
                    <div className="flex flex-col items-center text-center z-10">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 ${
                        analytics.total_sent > 0 
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)]" 
                          : "bg-white dark:bg-[#111] border-gray-200 dark:border-white/10 text-gray-400"
                      }`}>
                        <Send className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-900 dark:text-white mt-2">4. Dispatched</span>
                      <span className="text-[9px] text-gray-400 font-mono mt-0.5">{analytics.total_sent} Sent</span>
                    </div>

                    {/* Step 5: Classification */}
                    <div className="flex flex-col items-center text-center z-10">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 ${
                        analytics.total_replied > 0 
                          ? "bg-purple-500/10 border-purple-500 text-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.2)]" 
                          : "bg-white dark:bg-[#111] border-gray-200 dark:border-white/10 text-gray-400"
                      }`}>
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-900 dark:text-white mt-2">5. Replies</span>
                      <span className="text-[9px] text-gray-400 font-mono mt-0.5">{analytics.total_replied} Classified</span>
                    </div>
                  </div>
                </div>

                {/* Dynamic Campaign Progress Bar */}
                {analytics && (
                  <div className="border border-gray-150 dark:border-white/5 bg-gray-50/10 dark:bg-white/1 rounded-xl p-5 space-y-3">
                    <div className="flex justify-between items-center text-xs font-mono font-bold">
                      <span className="text-gray-500 uppercase tracking-wider">Outreach Progress</span>
                      <span className="text-accent-custom">{analytics.total_sent} / {analytics.total_leads} Sent ({analytics.total_leads > 0 ? Math.round((analytics.total_sent / analytics.total_leads) * 100) : 0}%)</span>
                    </div>
                    <div className="w-full bg-gray-250 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-accent-custom via-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${analytics.total_leads > 0 ? Math.min(100, (analytics.total_sent / analytics.total_leads) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Follow-Up Campaign Configurations */}
                <div className="border border-gray-150 dark:border-white/5 bg-gray-50/10 dark:bg-white/1 rounded-xl p-5 space-y-4 text-left">
                  <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/5 pb-3">
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-xs uppercase tracking-wider font-mono">
                      <Settings2 className="w-3.5 h-3.5 text-accent-custom" />
                      Drip Follow-Up & Cooldown Settings
                    </div>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border transition-all duration-300 ${
                      isEditingSettings
                        ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
                        : "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                    }`}>
                      {isEditingSettings ? "Editing Settings Config" : "Active Settings Config"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 items-center">
                    {/* Toggle */}
                    <div className="space-y-1 col-span-2 md:col-span-1 text-left">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Enable Follow-Ups</label>
                      <button
                        disabled={!isEditingSettings}
                        onClick={() => setFollowupEnabled(!followupEnabled)}
                        className={`mt-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-all duration-200 ${
                          !isEditingSettings
                            ? "cursor-not-allowed opacity-70"
                            : "cursor-pointer"
                        } ${
                          followupEnabled
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-gray-100 dark:bg-white/5 text-gray-400 border-gray-200 dark:border-white/5"
                        }`}
                      >
                        {followupEnabled ? "ENABLED" : "DISABLED"}
                      </button>
                    </div>

                    {/* Interval Days */}
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Follow-Up Delay</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          min="1"
                          max="30"
                          disabled={!isEditingSettings}
                          value={followupInterval}
                          onChange={(e) => setFollowupInterval(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-16 px-2 py-1 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-lg text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className="text-[10px] text-gray-400">days</span>
                      </div>
                    </div>

                    {/* Max Attempts */}
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Max Attempts</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          min="1"
                          max="10"
                          disabled={!isEditingSettings}
                          value={maxFollowups}
                          onChange={(e) => setMaxFollowups(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-16 px-2 py-1 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-lg text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className="text-[10px] text-gray-400">emails</span>
                      </div>
                    </div>

                    {/* Delay Min */}
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Cooldown Min</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          min="0"
                          max="300"
                          disabled={!isEditingSettings}
                          value={delayMin}
                          onChange={(e) => setDelayMin(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-16 px-2 py-1 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-lg text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className="text-[10px] text-gray-400">sec</span>
                      </div>
                    </div>

                    {/* Delay Max */}
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Cooldown Max</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          min="0"
                          max="600"
                          disabled={!isEditingSettings}
                          value={delayMax}
                          onChange={(e) => setDelayMax(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-16 px-2 py-1 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-lg text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className="text-[10px] text-gray-400">sec</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-gray-200 dark:border-white/5">
                    <p className="text-[10px] text-gray-400 leading-relaxed font-sans sm:max-w-[65%]">
                      Drip settings and randomized spacing cooldown range (in seconds) between sent emails to stay below spam flags and mimic organic writing behavior.
                    </p>
                    
                    <div className="flex items-center gap-2">
                      {isEditingSettings ? (
                        <>
                          <button
                            onClick={() => {
                              // Reset state by re-triggering fetchData
                              fetchData(true);
                              setIsEditingSettings(false);
                            }}
                            disabled={settingsSaving}
                            className="px-3 py-1.5 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 font-mono font-bold text-[10px] rounded-lg transition-all cursor-pointer disabled:opacity-50"
                          >
                            CANCEL
                          </button>
                          <button
                            onClick={handleSaveSettings}
                            disabled={settingsSaving}
                            className="px-4 py-1.5 bg-accent-custom hover:bg-accent-custom/95 text-white font-mono font-bold text-[10px] rounded-lg shadow transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {settingsSaving ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                SAVING...
                              </>
                            ) : (
                              "SAVE CONFIGS"
                            )}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setIsEditingSettings(true)}
                          className="px-4 py-1.5 bg-accent-custom/10 hover:bg-accent-custom/20 text-accent-custom border border-accent-custom/20 font-mono font-bold text-[10px] rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Settings2 className="w-3.5 h-3.5" />
                          EDIT SETTINGS
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Output Terminal */}
              <div className="bg-[#050505] text-emerald-400 font-mono p-4 rounded-xl border border-gray-200/10 dark:border-white/5 shadow-2xl flex flex-col h-[380px] text-left">
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3 shrink-0">
                  <div className="flex items-center gap-3">
                    {/* Colored Mac window dots */}
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/90 border border-rose-600/30" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/90 border border-amber-600/30" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/90 border border-emerald-600/30" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${senderActive ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500"}`} />
                      <span className="text-[9px] font-bold tracking-wider text-gray-455 uppercase font-mono">Live Output Terminal</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleClearLogs}
                      className="text-[8px] tracking-wider hover:text-rose-400 hover:border-rose-400/30 text-gray-500 font-bold border border-white/5 rounded px-1.5 py-0.5 transition-all cursor-pointer bg-white/5"
                    >
                      CLEAR
                    </button>
                    <span className="text-[9px] text-gray-600">Nexora OS v1.3</span>
                  </div>
                </div>

                {/* Active Lead Details */}
                {activity?.current_lead && (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 mb-3 text-[10px] space-y-1 shrink-0 text-white animate-fadeIn shadow-sm">
                    <div className="flex justify-between items-center text-accent-custom font-bold text-[9px] tracking-wider uppercase">
                      <span>PROCESSING PROSPECT</span>
                      <span className="text-gray-400 font-normal">ID: #{activity.current_lead.id}</span>
                    </div>
                    <div className="truncate">Name: <strong className="text-emerald-300">{activity.current_lead.name}</strong></div>
                    <div className="truncate">Email: <span className="text-blue-300 select-all">{activity.current_lead.email}</span></div>
                    <div className="truncate">Website: <span className="text-gray-300 select-all">{activity.current_lead.website}</span></div>
                    <div className="text-[9px] font-bold mt-1 text-gray-400">
                      Split Case:{" "}
                      <span className={activity.current_lead.has_website ? "text-accent-custom" : "text-emerald-400"}>
                        {activity.current_lead.has_website ? "Case 1: Has Website (SEO/Scraping/Bots)" : "Case 2: No Website (Web Dev)"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Log Lines Container */}
                <div ref={outreachTerminalRef} className="flex-1 overflow-y-auto text-[10px] space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {activity?.logs && activity.logs.length > 0 ? (
                    <>
                      {activity.logs.map((log: string, idx: number) => {
                        let color = "text-emerald-400";
                        if (log.includes("✓ Success")) color = "text-green-400 font-semibold";
                        if (log.includes("✗") || log.includes("failed") || log.includes("Failed")) color = "text-rose-400 font-semibold";
                        if (log.includes("Cooling down") || log.includes("Sleeping")) color = "text-yellow-455";
                        if (log.includes("manually started") || log.includes("started by") || log.includes("Dispatcher started")) color = "text-blue-400 font-semibold";
                        if (log.includes("manually paused") || log.includes("paused by")) color = "text-amber-500 font-semibold";
                        return (
                          <div key={idx} className={`${color} leading-relaxed break-words`}>
                            {log}
                          </div>
                        );
                      })}
                      {senderActive && (
                        <div className="text-emerald-400 animate-pulse font-bold flex items-center gap-1">
                          <span>nexora-os:~$ uvicorn worker running...</span>
                          <span className="w-1.5 h-3 bg-emerald-400 inline-block animate-pulse" />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-600 italic font-mono text-[10px] py-16">
                      <div className="text-left w-full pl-2">
                        <div>nexora-os:~$ systemctl status outreach-worker</div>
                        <div className="text-gray-505">● outreach-worker.service - Nexora Outreach Daemon</div>
                        <div className="text-gray-550">   Loaded: loaded (/etc/systemd/system/outreach-worker.service; enabled)</div>
                        <div className="text-gray-550">   Active: inactive (idle) since Sun 2026-08-23; terminal standby</div>
                        <div className="text-gray-550 mt-2">nexora-os:~$ _</div>
                      </div>
                    </div>
                  )}
                  <div ref={outreachTerminalEndRef} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "queue" && (
          <div className="space-y-4">
            {/* Filter bar */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search logs by recipient, subject, status..."
                value={queueSearch}
                onChange={(e) => setQueueSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom"
              />
            </div>

            {/* Logs Table — Desktop */}
            <div className="hidden md:block border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-[#0a0a0a]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-white/2 border-b border-gray-200 dark:border-white/10 text-gray-400 uppercase font-semibold font-mono text-[9px]">
                    <th className="p-3 pl-4">Lead Email</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Subject Line</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Error / Logs</th>
                    <th className="p-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 dark:divide-white/5 font-sans">
                  {filteredMessages.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-gray-400 font-mono">No outreach message logs found.</td>
                    </tr>
                  ) : (
                    filteredMessages.map((msg: any) => (
                      <tr key={msg.id} className="hover:bg-gray-50/50 dark:hover:bg-white/2">
                        <td className="p-3 pl-4 font-semibold truncate max-w-[180px]">{msg.recipient_email}</td>
                        <td className="p-3">
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-gray-50 dark:bg-white/5 text-gray-400">
                            {msg.message_type}
                          </span>
                        </td>
                        <td className="p-3 truncate max-w-[200px]">{msg.subject}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase ${
                            msg.status === "SENT" ? "text-emerald-500" :
                            msg.status === "FAILED" ? "text-red-500" :
                            msg.status === "DRAFT" ? "text-yellow-500" :
                            "text-gray-400"
                          }`}>
                            {msg.status === "SENT" && <CheckCircle className="w-3 h-3" />}
                            {msg.status === "FAILED" && <AlertCircle className="w-3 h-3" />}
                            {msg.status === "DRAFT" && <Clock className="w-3 h-3" />}
                            {msg.status}
                          </span>
                        </td>
                        <td className="p-3 text-gray-400 font-mono text-[10px] truncate max-w-[200px]">{msg.error_message || "No errors logged"}</td>
                        <td className="p-3 pr-4 text-right">
                          {msg.status === "FAILED" && (
                            <button
                              onClick={() => handleRetryMessage(msg.id)}
                              disabled={actionLoading !== null}
                              className="text-[10px] text-accent-custom hover:underline cursor-pointer flex items-center justify-end gap-1.5 ml-auto disabled:opacity-50"
                            >
                              <RefreshCw className="w-3 h-3" /> Retry
                            </button>
                          )}
                          {msg.status === "DRAFT" && (
                            <button
                              onClick={() => handleApproveDraft(msg.id)}
                              disabled={actionLoading !== null}
                              className="text-[10px] text-green-500 hover:underline cursor-pointer flex items-center justify-end gap-1.5 ml-auto disabled:opacity-50"
                            >
                              <Send className="w-3 h-3" /> Approve &amp; Send
                            </button>
                          )}
                          {msg.status === "SENT" && (
                            <span className="text-[10px] text-gray-400 font-mono">
                              {new Date(msg.sent_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Logs Cards — Mobile */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {filteredMessages.length === 0 ? (
                <div className="p-12 text-center text-gray-400 font-mono text-xs border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#0a0a0a]">No outreach message logs found.</div>
              ) : (
                filteredMessages.map((msg: any) => (
                  <div key={msg.id} className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-[#111111] space-y-2.5 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-gray-900 dark:text-white truncate">{msg.recipient_email}</span>
                      <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase shrink-0 px-1.5 py-0.5 rounded border ${
                        msg.status === "SENT" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" :
                        msg.status === "FAILED" ? "text-red-500 bg-red-500/10 border-red-500/20" :
                        msg.status === "DRAFT" ? "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" :
                        "text-gray-400 bg-gray-500/10 border-gray-500/20"
                      }`}>
                        {msg.status === "SENT" && <CheckCircle className="w-2.5 h-2.5" />}
                        {msg.status === "FAILED" && <AlertCircle className="w-2.5 h-2.5" />}
                        {msg.status === "DRAFT" && <Clock className="w-2.5 h-2.5" />}
                        {msg.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-gray-50 dark:bg-white/5 text-gray-400 mr-2">{msg.message_type}</span>
                      {msg.subject}
                    </div>
                    {msg.error_message && (
                      <div className="text-[10px] text-red-400 font-mono truncate">{msg.error_message}</div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5">
                      <span className="text-[9px] text-gray-400 font-mono">
                        {msg.sent_at ? new Date(msg.sent_at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "Pending"}
                      </span>
                      <div className="flex items-center gap-2">
                        {msg.status === "FAILED" && (
                          <button
                            onClick={() => handleRetryMessage(msg.id)}
                            disabled={actionLoading !== null}
                            className="text-[10px] text-accent-custom hover:underline cursor-pointer flex items-center gap-1 disabled:opacity-50"
                          >
                            <RefreshCw className="w-3 h-3" /> Retry
                          </button>
                        )}
                        {msg.status === "DRAFT" && (
                          <button
                            onClick={() => handleApproveDraft(msg.id)}
                            disabled={actionLoading !== null}
                            className="text-[10px] text-green-500 hover:underline cursor-pointer flex items-center gap-1 disabled:opacity-50"
                          >
                            <Send className="w-3 h-3" /> Send
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "inbox" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Conversation list */}
            <div className="lg:col-span-1 space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search prospects..."
                  value={inboxSearch}
                  onChange={(e) => setInboxSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-[#0a0a0a] divide-y divide-gray-150 dark:divide-white/5 max-h-[550px] overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-xs font-mono">No conversations found.</div>
                ) : (
                  filteredConversations.map((conv: any) => (
                    <button
                      key={conv.lead_id}
                      onClick={() => {
                        setSelectedConversation(conv);
                        setReplyText("");
                      }}
                      className={`w-full p-4 text-left transition-colors flex flex-col gap-2 cursor-pointer ${
                        selectedConversation?.lead_id === conv.lead_id
                          ? "bg-accent-custom/10 dark:bg-accent-custom/5"
                          : "hover:bg-gray-50 dark:hover:bg-white/2"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {conv.business_name || "Unknown Business"}
                        </span>
                        <span className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded font-mono ${
                          conv.intent === "interested" ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                          conv.intent === "unsubscribe" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                          conv.intent === "question" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                          "bg-gray-500/10 text-gray-550 border border-gray-500/20"
                        }`}>
                          {conv.intent}
                        </span>
                      </div>
                      
                      <span className="text-[10px] text-gray-400 font-mono truncate">{conv.email}</span>
                      
                      {conv.thread && conv.thread.length > 0 && (
                        <p className="text-[10px] text-gray-500 line-clamp-1">
                          {cleanEmailBody(conv.thread[conv.thread.length - 1].body).cleanText}
                        </p>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Conversation Thread viewer */}
            <div className="lg:col-span-2 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#0a0a0a] min-h-[500px] flex flex-col justify-between overflow-hidden shadow-sm">
              {selectedConversation ? (
                <>
                  {/* Active Header */}
                  <div className="p-4 border-b border-gray-150 dark:border-white/5 bg-gray-50 dark:bg-black/20 flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">{selectedConversation.business_name}</h3>
                      <p className="text-[10px] text-gray-400 font-mono">{selectedConversation.email}</p>
                    </div>
                    <span className="text-[9px] uppercase font-mono bg-accent-custom/10 text-accent-custom border border-accent-custom/25 px-2 py-0.5 rounded">
                      Intent: {selectedConversation.intent}
                    </span>
                  </div>

                  {/* Message bubble thread area */}
                  <div className="p-6 flex-1 overflow-y-auto space-y-4 max-h-[360px]">
                    {selectedConversation.thread?.map((m: any) => {
                      const isReply = m.type === "REPLY";
                      return (
                        <div key={m.id} className={`flex flex-col ${isReply ? "items-start" : "items-end"}`}>
                          <div className={`max-w-[80%] rounded-2xl p-4 text-xs shadow-sm leading-relaxed ${
                            isReply
                              ? "bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-tl-none"
                              : "bg-accent-custom text-white rounded-tr-none"
                          }`}>
                            <p className="font-mono text-[9px] opacity-60 mb-1">
                              {isReply ? "Lead Reply" : "AI Assistant Outreach"} &middot; {new Date(m.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                            {(() => {
                              const { cleanText, quotedText } = cleanEmailBody(m.body);
                              const isQuoteExpanded = !!expandedQuotes[m.id];
                              return (
                                <>
                                    <div className="space-y-2.5 font-sans leading-relaxed">{renderCleanText(cleanText)}</div>
                                  {quotedText && (
                                    <div className="mt-2 pt-2 border-t border-gray-200/20 dark:border-white/5">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setExpandedQuotes(prev => ({ ...prev, [m.id]: !prev[m.id] }));
                                        }}
                                        className="text-[9px] text-gray-400 dark:text-gray-500 hover:text-accent-custom flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0 font-mono focus:outline-none"
                                      >
                                        <span>{isQuoteExpanded ? "Hide quoted history" : "••• Show quoted history"}</span>
                                      </button>
                                      {isQuoteExpanded && (
                                        <p className="mt-2 whitespace-pre-line text-[9px] text-gray-400 dark:text-gray-500 font-mono bg-black/10 dark:bg-black/30 p-2.5 rounded-lg border border-gray-200/10 max-h-[150px] overflow-y-auto leading-normal">
                                          {quotedText}
                                        </p>
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

                  {/* Send reply form */}
                  <form onSubmit={handleSendReply} className="p-4 border-t border-gray-150 dark:border-white/5 bg-gray-50 dark:bg-black/20 flex gap-2">
                    <textarea
                      placeholder="Type a manual reply message to the prospect..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-lg p-2 text-xs text-gray-900 dark:text-white focus:outline-none min-h-[60px] max-h-[120px]"
                    />
                    <button
                      type="submit"
                      disabled={replyLoading || !replyText.trim()}
                      className="bg-accent-custom hover:bg-accent-custom/95 text-white font-bold px-4 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer text-xs shrink-0 self-end h-10"
                    >
                      {replyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                  <Inbox className="w-12 h-12 mb-3 opacity-30" />
                  <span className="text-xs font-mono">Select a conversation thread to view the details and reply.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "analytics" && analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily emails sent */}
              <div className="bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 p-5 rounded-2xl">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Emails Sent Timeline (Last 7 Days)</h3>
                <div className="w-full h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.sent_by_day.length > 0 ? analytics.sent_by_day : [{ day: "No Data", count: 0 }]} barSize={26}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"} />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={9} stroke={isDark ? "#555" : "#aaa"} dy={5} />
                      <YAxis axisLine={false} tickLine={false} fontSize={9} stroke={isDark ? "#555" : "#aaa"} width={20} />
                      <Tooltip cursor={{ fill: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }} />
                      <Bar dataKey="count" fill="#2962FF" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category performance */}
              <div className="bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 p-5 rounded-2xl">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Outreach performance by industry</h3>
                <div className="w-full h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.category_performance.length > 0 ? analytics.category_performance : [{ category: "No Data", sent: 0, replied: 0 }]} barSize={16}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"} />
                      <XAxis dataKey="category" axisLine={false} tickLine={false} fontSize={9} stroke={isDark ? "#555" : "#aaa"} dy={5} />
                      <YAxis axisLine={false} tickLine={false} fontSize={9} stroke={isDark ? "#555" : "#aaa"} width={20} />
                      <Tooltip cursor={{ fill: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }} />
                      <Bar dataKey="sent" fill="#00B0FF" radius={[3, 3, 0, 0]} name="Sent" />
                      <Bar dataKey="replied" fill="#00E676" radius={[3, 3, 0, 0]} name="Replied" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[9999] animate-fadeIn">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 ${
            toast.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-emerald-500/5" 
              : toast.type === "error"
              ? "bg-rose-500/10 border-rose-500/20 text-rose-500 shadow-rose-500/5"
              : "bg-blue-500/10 border-blue-500/20 text-blue-500 shadow-blue-500/5"
          }`}>
            <span className="flex-1 text-xs font-semibold font-mono tracking-wide">{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer text-sm font-bold ml-1.5"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
