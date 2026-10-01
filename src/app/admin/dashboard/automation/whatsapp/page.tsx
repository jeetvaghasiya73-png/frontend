"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  MessageSquare,
  Send,
  Sparkles,
  CheckCircle2,
  History,
  AlertCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Globe,
  Star,
  Users,
  ShieldCheck,
  Zap,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Mail,
  QrCode,
  Play,
  Square,
  ListOrdered,
  Bot,
  X,
  ChevronDown,
  MessageCircle,
  MapPin,
  Check,
  Eye,
  Calendar,
  SlidersHorizontal,
  UserCheck,
  KeyRound,
  EyeOff,
  PauseCircle,
  CheckCheck,
  Info,
  Paperclip,
  Smile,
  BarChart3,
  TrendingUp,
  Activity,
  Download,
  Phone,
  CheckCircle,
  ShieldAlert,
  Ban,
  Smartphone,
  PieChart as PieIcon,
  MoreVertical
} from "lucide-react";
import { authFetch, API } from "@/lib/authFetch";
import { isValidWebsite, formatWebsiteUrl, format10DigitPhone, formatDialerUrl, formatISTDate, formatISTTime, formatISTDateTime } from "@/lib/formatters";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";

interface WhatsAppStats {
  total_prospects: number;
  pending: number;
  sent: number;
  delivered: number;
  replied: number;
  interested: number;
  failed: number;
  blocked?: number;
  reported?: number;
  response_rate?: number;
  conversion_rate?: number;
  delivery_rate?: number;
  cta_click_rate?: number;
  total_cta_clicks?: number;
  cta_clicks?: {
    interested: number;
    website: number;
    call: number;
    agent: number;
  };
  sent_today?: number;
  daily_limit?: number;
  remaining_today?: number;
  main_number: string;
  test_mode: boolean;
  test_number: string;
  recent_interested: Array<{
    id: number;
    bussiness_name: string;
    bussiness_number: string;
    scraped_city: string;
    category: string;
    last_reply: string;
    reply_at: string;
  }>;
}

interface AnalyticsData {
  daily_breakdown: Array<{
    date: string;
    label?: string;
    sent: number;
    delivered?: number;
    replied: number;
    interested: number;
    blocked: number;
  }>;
  summary: {
    total_leads?: number;
    total_sent: number;
    total_delivered?: number;
    total_replied: number;
    total_interested: number;
    total_blocked?: number;
    total_reported?: number;
    total_blocked_reported?: number;
    response_rate: number;
    conversion_rate: number;
    delivery_rate?: number;
    cta_click_rate?: number;
    total_cta_clicks?: number;
    spam_block_rate?: number;
    sent_today?: number;
    daily_limit?: number;
    remaining_today?: number;
  };
  cta_breakdown?: {
    call_clicks: number;
    website_clicks: number;
    interested_clicks: number;
    agent_clicks: number;
    total_clicks: number;
    click_rate: number;
  };
  cta_chart_data?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  funnel_data?: Array<{
    stage: string;
    count: number;
    fill: string;
  }>;
  spam_and_blocks: Array<{
    id?: number;
    lead_id?: number;
    bussiness_name: string;
    phone_number: string;
    city?: string;
    scraped_city?: string;
    category: string;
    status?: string;
    whatsapp_status?: string;
    reason?: string;
    last_reply?: string;
    date?: string;
    reply_at?: string;
  }>;
}

interface QueueStatus {
  total: number;
  pending: number;
  sending: number;
  sent: number;
  failed: number;
  skipped: number;
  daily_limit?: number;
  sent_today?: number;
  remaining_today?: number;
  is_limit_reached?: boolean;
  is_running: boolean;
  progress_percent: number;
}

interface Lead {
  id: number;
  bussiness_name: string;
  bussiness_number: string;
  scraped_city: string;
  category: string;
  scraped_service: string;
  bussiness_website: string;
  bussiness_email: string;
  bussiness_address?: string;
  whatsapp_status: string;
  whatsapp_sent_at?: string;
  whatsapp_last_reply?: string;
  whatsapp_reply_at?: string;
  whatsapp_error?: string;
  whatsapp_ai_enabled?: boolean;
  is_interested?: boolean;
  rating?: string;
  created_at: string;
}

interface ConversationItem {
  lead_id: number | string;
  bussiness_name: string;
  phone_number: string;
  clean_phone: string;
  scraped_city: string;
  category: string;
  rating?: string;
  website?: string;
  email?: string;
  whatsapp_status: string;
  whatsapp_ai_enabled: boolean;
  is_interested: boolean;
  last_reply?: string;
  reply_at?: string;
  latest_message: string;
  latest_direction: "inbound" | "outbound";
  latest_timestamp?: string;
  cta_clicked?: string;
  notes?: string;
}

interface ChatMessage {
  id: number | string;
  lead_id: number | string | null;
  direction: string;
  message_text: string;
  button_id: string | null;
  created_at: string;
  msg_type?: "text" | "interactive_cta" | "voice_note" | "document";
  cta_buttons?: Array<{ id: string; label: string; action_type: "call" | "url" | "quick_reply"; payload: string }>;
  voice_duration?: string;
  doc_name?: string;
  doc_size?: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  sent: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  delivered: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  replied: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  interested: "bg-emerald-500/10 text-emerald-500 border-emerald-500/25 font-bold",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
  blocked: "bg-rose-500/10 text-rose-500 border-rose-500/25 font-bold",
  reported: "bg-purple-500/10 text-purple-500 border-purple-500/25 font-bold",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="w-3 h-3" />,
  sent: <Send className="w-3 h-3" />,
  delivered: <CheckCircle2 className="w-3 h-3" />,
  replied: <MessageCircle className="w-3 h-3" />,
  interested: <Star className="w-3 h-3 text-amber-500 fill-amber-500" />,
  failed: <AlertCircle className="w-3 h-3" />,
  blocked: <Ban className="w-3 h-3 text-rose-500" />,
  reported: <ShieldAlert className="w-3 h-3 text-purple-500" />,
};

const EMOJI_LIST = ["😊", "👍", "🔥", "📞", "📅", "🚀", "🎯", "⭐", "💬", "💼", "✨", "✅", "📍", "🎉", "🤝", "⚡"];

const ITEMS_PER_PAGE = 15;

export default function WhatsAppOutreachPage() {
  const [activeTab, setActiveTab] = useState<"chat" | "analytics" | "leads" | "logs">("chat");

  // Core stats & state
  const [stats, setStats] = useState<WhatsAppStats | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [dailyLimit, setDailyLimit] = useState<number>(20);
  const [sentToday, setSentToday] = useState<number>(0);
  const [isLimitReached, setIsLimitReached] = useState<boolean>(false);

  // Test Mode Toggle Password Modal State
  const [toggleModalOpen, setToggleModalOpen] = useState(false);
  const [targetTestMode, setTargetTestMode] = useState<boolean>(true);
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [togglingTestMode, setTogglingTestMode] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const handleConfirmToggleTestMode = async () => {
    if (!adminPassword.trim()) {
      setToggleError("Super Admin password is required.");
      return;
    }
    setTogglingTestMode(true);
    setToggleError(null);
    try {
      const res = await authFetch(`${API}/api/v1/settings/toggle-test-mode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: "whatsapp",
          enabled: targetTestMode,
          admin_password: adminPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showAlert("success", data.message || `WhatsApp Test mode updated to ${targetTestMode ? "ON" : "OFF"}.`);
        setToggleModalOpen(false);
        setAdminPassword("");
        fetchOverview();
      } else {
        setToggleError(data.detail || data.message || "Invalid Super Admin password.");
      }
    } catch (err: any) {
      setToggleError(err?.message || "Connection error verifying password.");
    } finally {
      setTogglingTestMode(false);
    }
  };

  // Conversations State (WhatsApp Chat Workspace)
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [totalConversations, setTotalConversations] = useState<number>(0);
  const [selectedConv, setSelectedConv] = useState<ConversationItem | null>(null);
  const [convMessages, setConvMessages] = useState<ChatMessage[]>([]);
  const [loadingConvMessages, setLoadingConvMessages] = useState(false);
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [totalMessageCount, setTotalMessageCount] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [manualMessageText, setManualMessageText] = useState("");
  const [sendingManualReply, setSendingManualReply] = useState(false);
  const [togglingAi, setTogglingAi] = useState(false);
  const [convSearch, setConvSearch] = useState("");
  const [convFilter, setConvFilter] = useState("all");

  // UI Drawer & Popovers
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showRightDrawer, setShowRightDrawer] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCtaMenu, setShowCtaMenu] = useState(false);
  const [generatingAiReply, setGeneratingAiReply] = useState(false);
  const [leadNoteInput, setLeadNoteInput] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showMobileMoreMenu, setShowMobileMoreMenu] = useState(false);

  // Mobile responsive view toggle
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  // Prospects Leads Table State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalLeadsCount, setTotalLeadsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Queue & Worker Actions
  const [generatingQueue, setGeneratingQueue] = useState(false);
  const [startingBot, setStartingBot] = useState(false);
  const [stoppingBot, setStoppingBot] = useState(false);

  // Modals
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);

  const [dailyLimitModalOpen, setDailyLimitModalOpen] = useState(false);
  const [newLimitInput, setNewLimitInput] = useState<number>(20);
  const [savingLimit, setSavingLimit] = useState(false);

  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testNumber, setTestNumber] = useState("7990738939");
  const [testMessage, setTestMessage] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  // Lead Details Modal
  const [selectedLeadModal, setSelectedLeadModal] = useState<Lead | null>(null);

  // Activity Log State
  const [logs, setLogs] = useState<string[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Action Alerts
  const [actionAlert, setActionAlert] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const ctaMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const showAlert = (type: "success" | "error", text: string) => {
    setActionAlert({ type, text });
    setTimeout(() => setActionAlert(null), 5000);
  };

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
      if (ctaMenuRef.current && !ctaMenuRef.current.contains(e.target as Node)) {
        setShowCtaMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setShowMobileMoreMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Screen-width and mount initialization
  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) {
        setShowRightDrawer(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── 1. Data Fetching ──
  const fetchOverview = useCallback(async () => {
    try {
      setRefreshing(true);
      const [statsRes, queueRes, limitRes] = await Promise.all([
        authFetch(`${API}/api/v1/whatsapp/stats`),
        authFetch(`${API}/api/v1/whatsapp/queue/status`),
        authFetch(`${API}/api/v1/whatsapp/daily-limit`)
      ]);

      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats(d);
        if (d.test_number) setTestNumber(d.test_number);
      }
      if (queueRes.ok) {
        const q = await queueRes.json();
        setQueueStatus(q);
        if (q.daily_limit !== undefined) setDailyLimit(q.daily_limit);
        if (q.sent_today !== undefined) setSentToday(q.sent_today);
        if (q.is_limit_reached !== undefined) setIsLimitReached(q.is_limit_reached);
      }
      if (limitRes.ok) {
        const lim = await limitRes.json();
        setDailyLimit(lim.daily_limit || 20);
        setSentToday(lim.sent_today || 0);
        setIsLimitReached(lim.is_limit_reached || false);
        setNewLimitInput(lim.daily_limit || 20);
      }
    } catch (err) {
      console.error("Fetch overview error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await authFetch(`${API}/api/v1/whatsapp/analytics`);
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      }
    } catch (e) {
      console.error("Fetch analytics error:", e);
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await authFetch(
        `${API}/api/v1/whatsapp/conversations?status_filter=${convFilter}&search=${encodeURIComponent(convSearch)}&page=1&limit=100`
      );
      if (res.ok) {
        const data = await res.json();
        const rawList: ConversationItem[] = data.conversations || [];
        const seen = new Set<string>();
        const deduped: ConversationItem[] = [];

        for (const c of rawList) {
          const digits = (c.clean_phone || c.phone_number || "").replace(/\D/g, "");
          const key = digits.length >= 10 ? digits.slice(-10) : (c.clean_phone || c.phone_number || String(c.lead_id));
          if (!seen.has(key)) {
            seen.add(key);
            deduped.push(c);
          }
        }

        setConversations(deduped);
        setTotalConversations(deduped.length);

        if (deduped.length > 0) {
          setSelectedConv((prev) => {
            if (!prev) return deduped[0];
            const prevDigits = (prev.clean_phone || prev.phone_number || "").replace(/\D/g, "");
            const prevKey = prevDigits.length >= 10 ? prevDigits.slice(-10) : String(prev.lead_id);
            const updated = deduped.find((c: ConversationItem) => {
              const cDigits = (c.clean_phone || c.phone_number || "").replace(/\D/g, "");
              const cKey = cDigits.length >= 10 ? cDigits.slice(-10) : String(c.lead_id);
              return cKey === prevKey || c.lead_id === prev.lead_id;
            });
            return updated || deduped[0];
          });
        }
      }
    } catch (e) {
      console.error("Fetch conversations error:", e);
    }
  }, [convFilter, convSearch]);

  const selectedConvRef = useRef(selectedConv);
  useEffect(() => {
    selectedConvRef.current = selectedConv;
  }, [selectedConv]);

  const fetchChatMessages = useCallback(async (leadId: number | string, loadAll: boolean = false, isBackground: boolean = false) => {
    if (!isBackground) {
      if (loadAll) setLoadingMoreMessages(true);
      else setLoadingConvMessages(true);
    }
    try {
      const activeConv = selectedConvRef.current;
      const url = `${API}/api/v1/whatsapp/chats/${leadId}${loadAll ? "" : "?limit=5"}`;
      const res = await authFetch(url);
      if (res.ok) {
        const data = await res.json();
        setTotalMessageCount(data.total_count ?? (data.chats || []).length);
        setHasMoreMessages(Boolean(data.has_more));

        const rawChats: ChatMessage[] = (data.chats || []).map((m: any) => {
          const hasCta = m.button_id || (m.message_text && (m.message_text.includes("Call") || m.message_text.includes("Website") || m.message_text.includes("Demo")));
          let ctaButtons: any[] = [];

          if (hasCta || m.direction === "outbound") {
            const hasValidSite = isValidWebsite(activeConv?.website);
            ctaButtons = [
              { id: "call_cta", label: "📞 Call Direct", action_type: "call", payload: activeConv?.phone_number || "" },
              ...(hasValidSite
                ? [{ id: "site_cta", label: "🌐 Visit Website", action_type: "url", payload: formatWebsiteUrl(activeConv?.website)! }]
                : []),
              { id: "demo_cta", label: "📅 Book Demo", action_type: "quick_reply", payload: "I want to schedule a live demo" },
              { id: "agent_cta", label: "💬 Speak to Agent", action_type: "quick_reply", payload: "Please connect me to an executive" }
            ];
          }

          return {
            ...m,
            msg_type: m.button_id ? "interactive_cta" : (m.message_text && m.message_text.includes("[AUDIO]") ? "voice_note" : "text"),
            cta_buttons: ctaButtons
          };
        });
        setConvMessages(rawChats);
      }
    } catch (e) {
      console.error("Fetch chat messages error:", e);
    } finally {
      setLoadingConvMessages(false);
      setLoadingMoreMessages(false);
    }
  }, []);

  const fetchLeadsTable = useCallback(async () => {
    try {
      const res = await authFetch(
        `${API}/api/v1/whatsapp/leads?status_filter=${statusFilter}&search=${encodeURIComponent(searchTerm)}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`
      );
      if (res.ok) {
        const d = await res.json();
        setLeads(d.leads || []);
        setTotalLeadsCount(d.total || 0);
      }
    } catch (e) {
      console.error("Fetch leads error:", e);
    }
  }, [statusFilter, searchTerm, currentPage]);

  const fetchActivityLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const res = await authFetch(`${API}/api/v1/whatsapp/activity-log?limit=150`);
      if (res.ok) {
        const d = await res.json();
        setLogs(d.lines || []);
      }
    } catch (e) {
      console.error("Fetch logs error:", e);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  // Initial mount: load overview metrics ONCE
  useEffect(() => {
    fetchOverview();
    fetchAnalytics();
  }, [fetchOverview, fetchAnalytics]);

  // Load conversations when convFilter or convSearch changes
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load leads table when statusFilter, searchTerm, or currentPage changes
  useEffect(() => {
    fetchLeadsTable();
  }, [fetchLeadsTable]);

  // When switching conversation, fetch chat history
  useEffect(() => {
    if (selectedConv?.lead_id) {
      setShowAllMessages(false);
      fetchChatMessages(selectedConv.lead_id, false);
    }
  }, [selectedConv?.lead_id, fetchChatMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [convMessages, isTyping]);

  // WebSocket connection for real-time updates (pure event-driven, zero polling)
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectDelay = 1000;
    let unmounted = false;

    const connect = () => {
      if (unmounted) return;
      try {
        const wsUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")
          .replace(/^http/, "ws") + "/api/v1/whatsapp/ws";
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          reconnectDelay = 1000;
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === "new_chat_message" && data.chat) {
              const currentLead = selectedConvRef.current;
              const matchesActive = currentLead && (
                currentLead.lead_id === data.chat.lead_id ||
                (data.chat.phone_number && currentLead.phone_number && data.chat.phone_number.includes(currentLead.phone_number.slice(-10)))
              );

              if (matchesActive) {
                const chatMsg: ChatMessage = {
                  id: data.chat.id,
                  lead_id: data.chat.lead_id,
                  direction: data.chat.direction,
                  message_text: data.chat.message_text,
                  button_id: data.chat.button_id,
                  created_at: data.chat.created_at,
                  msg_type: data.chat.button_id ? "interactive_cta" : "text",
                  cta_buttons: [
                    { id: "call_cta", label: "📞 Call Now", action_type: "call" as const, payload: "" },
                    ...(isValidWebsite(currentLead?.website)
                      ? [{ id: "site_cta", label: "🌐 Visit Website", action_type: "url" as const, payload: formatWebsiteUrl(currentLead?.website)! }]
                      : []),
                    { id: "demo_cta", label: "📅 Book Demo", action_type: "quick_reply" as const, payload: "Book Demo" }
                  ]
                };

                setConvMessages((prev) => {
                  if (prev.some((m) => m.id === chatMsg.id || (m.message_text === chatMsg.message_text && m.direction === chatMsg.direction && m.created_at === chatMsg.created_at))) return prev;
                  return [...prev, chatMsg];
                });
              }

              setConversations((prev) =>
                prev.map((c) =>
                  c.lead_id === data.chat.lead_id || (data.chat.phone_number && c.phone_number && data.chat.phone_number.includes(c.phone_number.slice(-10)))
                    ? {
                        ...c,
                        latest_message: data.chat.message_text,
                        latest_direction: data.chat.direction,
                        latest_timestamp: data.chat.created_at,
                      }
                    : c
                )
              );
            }

            if (data.type === "whatsapp_ai_toggled") {
              const updatedAi = data.whatsapp_ai_enabled;
              setConversations(prev =>
                prev.map(c => (c.lead_id === data.lead_id || (data.clean_10 && c.phone_number?.includes(data.clean_10))) ? { ...c, whatsapp_ai_enabled: updatedAi } : c)
              );
              if (selectedConvRef.current && (selectedConvRef.current.lead_id === data.lead_id || (data.clean_10 && selectedConvRef.current.phone_number?.includes(data.clean_10)))) {
                setSelectedConv(prev => prev ? { ...prev, whatsapp_ai_enabled: updatedAi } : null);
              }
            }

            if (
              (data.type === "whatsapp_update" && data.event === "inbound_message") ||
              data.type === "lead_updated" ||
              (data.type === "new_chat_message" && data.chat && (!selectedConvRef.current || !conversations.some(c => c.lead_id === data.chat?.lead_id)))
            ) {
              fetchConversations();
              fetchOverview();
              fetchAnalytics();
            }

            if (data.type === "queue_progress") {
              setQueueStatus((prev) => ({
                ...prev!,
                is_running: data.is_running ?? prev?.is_running ?? false,
              }));
              if (data.sent_today !== undefined) setSentToday(data.sent_today);
              if (data.daily_limit !== undefined) setDailyLimit(data.daily_limit);
              if (data.is_limit_reached !== undefined) setIsLimitReached(data.is_limit_reached);
            }
          } catch (err) {
            // ignore
          }
        };

        ws.onclose = () => {
          if (unmounted) return;
          reconnectTimer = setTimeout(() => {
            reconnectDelay = Math.min(reconnectDelay * 2, 30000);
            connect();
          }, reconnectDelay);
        };

        ws.onerror = () => {
          ws?.close();
        };
      } catch (e) {
        console.error("WS connection error:", e);
      }
    };

    connect();

    return () => {
      unmounted = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, [fetchOverview, fetchAnalytics, fetchConversations]);

  // ── 2. WhatsApp Actions ──

  const handleSendManualReply = async (textToSend?: string) => {
    const finalMsg = (textToSend || manualMessageText).trim();
    if (!selectedConv || !finalMsg) return;

    setSendingManualReply(true);
    setIsTyping(true);
    try {
      const res = await authFetch(`${API}/api/v1/whatsapp/chats/${selectedConv.lead_id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message_text: finalMsg })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setManualMessageText("");
        showAlert("success", `Message sent to ${selectedConv.bussiness_name}`);
      } else {
        showAlert("error", data.error || data.detail || "Failed to send message");
      }
    } catch (err) {
      showAlert("error", "Network error sending WhatsApp message");
    } finally {
      setSendingManualReply(false);
      setTimeout(() => setIsTyping(false), 800);
    }
  };

  const handleCtaClick = async (cta: { id: string; label: string; action_type: string; payload: string }) => {
    if (!selectedConv) return;

    if (cta.action_type === "call") {
      const rawNumber = selectedConv.clean_phone || selectedConv.phone_number || "";
      const dialerPhone = format10DigitPhone(rawNumber);
      window.open(formatDialerUrl(dialerPhone), "_self");
      showAlert("success", `Initiated Direct Call CTA to ${dialerPhone}`);
    } else if (cta.action_type === "url") {
      const rawUrl = cta.payload || selectedConv.website;
      if (isValidWebsite(rawUrl)) {
        const targetUrl = formatWebsiteUrl(rawUrl)!;
        window.open(targetUrl, "_blank");
        showAlert("success", `Opening URL: ${targetUrl}`);
      } else {
        showAlert("error", "This business does not have a registered website yet.");
      }
    } else {
      await handleSendManualReply(`[CTA Response]: ${cta.label}`);
    }
  };

  const handleGenerateAiSuggest = async () => {
    if (!selectedConv) return;
    setGeneratingAiReply(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      const aiSuggestions = [
        `Hi ${selectedConv.bussiness_name}, thanks for reaching out! We build premium web & AI solutions for businesses in ${selectedConv.scraped_city || "your city"}. Would you like to see a live demo?`,
        `Hello! We noticed ${selectedConv.bussiness_name} is scaling rapidly. Our AI automation platform handles inquiries & lead bookings 24/7. Can we set up a quick 5-min briefing?`,
        `Hi there! Are you looking for custom web development, CRM integration, or automated WhatsApp outreach for ${selectedConv.bussiness_name}? Reply 'DEMO' for live portfolio.`
      ];
      const randomSuggest = aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)];
      setManualMessageText(randomSuggest);
      showAlert("success", "✨ AI Smart Reply suggestion generated!");
    } catch (e) {
      showAlert("error", "Failed to generate AI suggestion");
    } finally {
      setGeneratingAiReply(false);
    }
  };

  const handleToggleAiAutoPilot = async (conv: ConversationItem) => {
    setTogglingAi(true);
    const targetState = !conv.whatsapp_ai_enabled;
    try {
      const res = await authFetch(`${API}/api/v1/whatsapp/chats/${conv.lead_id}/toggle-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: targetState })
      });
      const data = await res.json();
      if (res.ok) {
        const updatedState = data.whatsapp_ai_enabled !== undefined ? data.whatsapp_ai_enabled : targetState;
        showAlert("success", data.message || (updatedState ? "🤖 AI Auto-Pilot enabled" : "👤 Human Takeover active (AI silenced)"));
        setConversations(prev =>
          prev.map(c => c.lead_id === conv.lead_id ? { ...c, whatsapp_ai_enabled: updatedState } : c)
        );
        if (selectedConv?.lead_id === conv.lead_id) {
          setSelectedConv(prev => prev ? { ...prev, whatsapp_ai_enabled: updatedState } : null);
        }
      } else {
        showAlert("error", data.detail || "Failed to toggle AI Auto-Pilot");
      }
    } catch (err) {
      showAlert("error", "Failed to toggle AI Auto-Pilot");
    } finally {
      setTogglingAi(false);
    }
  };

  const handleToggleInterest = async (convOrId: ConversationItem | number | string) => {
    const leadId = typeof convOrId === "object" ? convOrId.lead_id : convOrId;
    const isCurrentlyInterested = typeof convOrId === "object" ? convOrId.is_interested : Boolean(selectedConv?.lead_id === leadId ? selectedConv?.is_interested : false);
    try {
      const res = await authFetch(`${API}/api/v1/whatsapp/chats/${leadId}/toggle-interest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_interested: !isCurrentlyInterested })
      });
      const data = await res.json();
      if (res.ok) {
        const newInterested = data.is_interested;
        const newStatus = data.whatsapp_status;
        showAlert("success", newInterested ? "⭐ Marked as Interested!" : "↩️ Unmarked from Interested.");
        setConversations(prev =>
          prev.map(c => c.lead_id === leadId ? { ...c, is_interested: newInterested, whatsapp_status: newStatus } : c)
        );
        if (selectedConv?.lead_id === leadId) {
          setSelectedConv(prev => prev ? { ...prev, is_interested: newInterested, whatsapp_status: newStatus } : null);
        }
        setLeads(prev =>
          prev.map(l => l.id === Number(leadId) ? { ...l, is_interested: newInterested, whatsapp_status: newStatus } : l)
        );
        fetchOverview();
        fetchAnalytics();
      } else {
        showAlert("error", data.detail || "Failed to update interest status.");
      }
    } catch (err) {
      showAlert("error", "Network error updating interest status.");
    }
  };

  const handleMarkInterested = async (leadId: number | string) => {
    await handleToggleInterest(leadId);
  };

  const handleExportChatLog = () => {
    if (!selectedConv || convMessages.length === 0) {
      showAlert("error", "No chat history to export.");
      return;
    }
    const header = `CRM WhatsApp Chat Transcript - ${selectedConv.bussiness_name} (${selectedConv.phone_number})\nDate: ${formatISTDateTime(new Date())}\n------------------------------------------------------------\n\n`;
    const body = convMessages
      .map((m) => `[${formatISTDateTime(m.created_at)}] ${m.direction.toUpperCase()}: ${m.message_text}`)
      .join("\n");

    const blob = new Blob([header + body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `WhatsApp_Chat_${selectedConv.bussiness_name.replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showAlert("success", "Chat log exported successfully!");
  };

  const handleSaveDailyLimit = async () => {
    setSavingLimit(true);
    try {
      const res = await authFetch(`${API}/api/v1/whatsapp/daily-limit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ daily_limit: Number(newLimitInput) })
      });
      const data = await res.json();
      if (res.ok) {
        setDailyLimit(data.daily_limit);
        setDailyLimitModalOpen(false);
        showAlert("success", `Daily limit updated to ${data.daily_limit} messages/day`);
      }
    } catch (e) {
      showAlert("error", "Failed to update daily limit");
    } finally {
      setSavingLimit(false);
    }
  };

  const handleGenerateQueue = async () => {
    setGeneratingQueue(true);
    try {
      const res = await authFetch(`${API}/api/v1/whatsapp/queue/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ max_count: 200 })
      });
      const data = await res.json();
      if (res.ok) {
        showAlert("success", data.message || "Outreach queue generated!");
      } else {
        showAlert("error", data.detail || "Failed to generate queue.");
      }
    } catch (err) {
      showAlert("error", "Network error generating queue.");
    } finally {
      setGeneratingQueue(false);
    }
  };

  const handleStartBot = async () => {
    setStartingBot(true);
    try {
      const res = await authFetch(`${API}/api/v1/whatsapp/queue/start`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        showAlert("success", "WhatsApp Bot Worker Started!");
        setQueueStatus(prev => prev ? { ...prev, is_running: true } : prev);
      } else {
        showAlert("error", data.detail || "Failed to start bot worker.");
      }
    } catch (err) {
      showAlert("error", "Network error starting bot worker.");
    } finally {
      setStartingBot(false);
    }
  };

  const handleStopBot = async () => {
    setStoppingBot(true);
    try {
      const res = await authFetch(`${API}/api/v1/whatsapp/queue/stop`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        showAlert("success", "WhatsApp Bot Worker Stop Signal Sent!");
        setQueueStatus(prev => prev ? { ...prev, is_running: false } : prev);
      }
    } catch (err) {
      showAlert("error", "Network error stopping bot.");
    } finally {
      setStoppingBot(false);
    }
  };

  const handleFetchQr = async () => {
    setLoadingQr(true);
    setQrModalOpen(true);
    try {
      const res = await authFetch(`${API}/api/v1/whatsapp/qr`);
      const data = await res.json();
      if (res.ok && data.base64) {
        setQrBase64(data.base64);
      } else {
        setQrBase64(null);
        showAlert("error", data.detail || data.error || "Failed to load QR code.");
      }
    } catch (err) {
      showAlert("error", "Network error loading QR code.");
    } finally {
      setLoadingQr(false);
    }
  };

  const handleSendTestMessage = async () => {
    setSendingTest(true);
    try {
      const res = await authFetch(`${API}/api/v1/whatsapp/test-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient_number: testNumber, custom_message: testMessage || undefined })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showAlert("success", `Test WhatsApp message sent to ${data.recipient}`);
        setTestModalOpen(false);
      } else {
        showAlert("error", data.detail || data.api_response?.message || "Failed to send test message.");
      }
    } catch (err) {
      showAlert("error", "Network error sending test message.");
    } finally {
      setSendingTest(false);
    }
  };

  // ── 3. Data for Charts & Analytics ──
  const ctaChartData = (analyticsData?.cta_chart_data && analyticsData.cta_chart_data.some((c) => c.value > 0))
    ? analyticsData.cta_chart_data
    : [
        { name: "📞 Call Us", value: analyticsData?.cta_breakdown?.call_clicks ?? stats?.cta_clicks?.call ?? 0, color: "#10b981" },
        { name: "🌐 Website Visit", value: analyticsData?.cta_breakdown?.website_clicks ?? stats?.cta_clicks?.website ?? 0, color: "#3b82f6" },
        { name: "↩️ Interested", value: analyticsData?.cta_breakdown?.interested_clicks ?? stats?.interested ?? 0, color: "#f59e0b" },
        { name: "💬 Speak to Agent", value: analyticsData?.cta_breakdown?.agent_clicks ?? stats?.cta_clicks?.agent ?? 0, color: "#8b5cf6" },
      ];

  const dailyOutreachChartData = analyticsData?.daily_breakdown && analyticsData.daily_breakdown.length > 0
    ? analyticsData.daily_breakdown.map((item) => ({
        day: item.label || (item.date && item.date.length > 5 ? item.date.slice(5) : item.date),
        sent: item.sent,
        replied: item.replied,
        interested: item.interested,
        blocked: item.blocked || 0,
      }))
    : [];

  const funnelData = analyticsData?.funnel_data || [
    { stage: "Scraped Leads", count: stats?.total_prospects || 0, fill: "#64748b" },
    { stage: "Queued", count: queueStatus?.pending || 0, fill: "#38bdf8" },
    { stage: "Delivered", count: stats?.delivered || stats?.sent || 0, fill: "#6366f1" },
    { stage: "Replied", count: stats?.replied || 0, fill: "#f59e0b" },
    { stage: "Interested ⭐", count: stats?.interested || 0, fill: "#10b981" }
  ];

  const spamAndBlocksList = analyticsData?.spam_and_blocks || [];

  return (
    <div className="space-y-5 min-h-screen text-[var(--dash-text)] pb-12">
      {/* ── Top Header Bar (CRM Header) ── */}
      <div className="crm-card p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-md bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500 font-bold shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-[var(--dash-text)]">WhatsApp Outreach & Performance</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Connected & Live</span>
              </span>
            </div>
            <p className="text-xs text-[var(--dash-text-muted)] mt-0.5">
              Multi-channel automated outreach, interactive CTA button analytics, live conversation management & spam protection
            </p>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setDailyLimitModalOpen(true)}
            className="crm-btn-secondary text-xs flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-500" />
            <span>Limit: <strong className="font-mono text-emerald-500">{sentToday}/{dailyLimit}</strong></span>
          </button>

          <button
            onClick={handleFetchQr}
            className="crm-btn-secondary text-xs flex items-center gap-1.5 text-emerald-500 border-emerald-500/30"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Pair QR</span>
          </button>

          {/* Test Mode Password Authorization Toggle Button */}
          <button
            onClick={() => {
              setTargetTestMode(!stats?.test_mode);
              setAdminPassword("");
              setToggleError(null);
              setToggleModalOpen(true);
            }}
            className={`crm-btn-secondary text-xs flex items-center gap-1.5 font-bold cursor-pointer border ${
              stats?.test_mode
                ? "text-emerald-500 border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20"
                : "text-amber-500 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20"
            }`}
            title="Toggle Test Mode (Requires Super Admin Password)"
          >
            {stats?.test_mode ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> : <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />}
            <span>{stats?.test_mode ? "Test Mode: ON" : "Test Mode: OFF"}</span>
          </button>

          <button
            onClick={() => setTestModalOpen(true)}
            className="crm-btn-secondary text-xs flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Send Test</span>
          </button>

          <button
            onClick={() => { fetchOverview(); fetchAnalytics(); fetchConversations(); fetchLeadsTable(); }}
            disabled={refreshing}
            className="crm-btn-secondary text-xs p-2"
            title="Refresh All Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Action Alert Banner ── */}
      {actionAlert && (
        <div className={`p-3.5 rounded-md border flex items-center justify-between transition-all ${
          actionAlert.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
            : "bg-red-500/10 border-red-500/25 text-red-400"
        }`}>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
            {actionAlert.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
            <span>{actionAlert.text}</span>
          </div>
          <button onClick={() => setActionAlert(null)} className="text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Daily Limit Reached Warning ── */}
      {isLimitReached && (
        <div className="p-3.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <PauseCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <p className="font-bold text-xs sm:text-sm">Daily Outreach Limit Reached ({sentToday}/{dailyLimit} sent today)</p>
              <p className="text-xs opacity-80 mt-0.5">Campaign worker is safely paused until tomorrow or until daily quota is adjusted.</p>
            </div>
          </div>
          <button
            onClick={() => setDailyLimitModalOpen(true)}
            className="crm-btn-secondary text-xs text-amber-500 border-amber-500/30 font-semibold"
          >
            Increase Limit
          </button>
        </div>
      )}

      {/* ── Top 5 KPI Metrics Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="crm-card p-4">
          <div className="flex items-center justify-between text-xs text-[var(--dash-text-muted)] font-medium">
            <span>Total Prospects</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold font-mono mt-2 text-[var(--dash-text)]">{stats?.total_prospects || 0}</div>
          <div className="text-[11px] text-[var(--dash-text-muted)] mt-1">Total leads database</div>
        </div>

        <div className="crm-card p-4">
          <div className="flex items-center justify-between text-xs text-[var(--dash-text-muted)] font-medium">
            <span>Sent Today</span>
            <SlidersHorizontal className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-bold font-mono text-emerald-500">{sentToday}</span>
            <span className="text-xs font-mono text-[var(--dash-text-muted)]">/ {dailyLimit} limit</span>
          </div>
          <div className="text-[11px] text-[var(--dash-text-muted)] mt-1">
            {Math.max(0, dailyLimit - sentToday)} messages allowance remaining
          </div>
        </div>

        <div className="crm-card p-4">
          <div className="flex items-center justify-between text-xs text-[var(--dash-text-muted)] font-medium">
            <span>Inbound Replies</span>
            <MessageCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono mt-2 text-amber-500">{stats?.replied || 0}</div>
          <div className="text-[11px] text-[var(--dash-text-muted)] mt-1">
            {stats?.response_rate !== undefined ? `${stats.response_rate}%` : "0.0%"} response rate
          </div>
        </div>

        <div className="crm-card p-4">
          <div className="flex items-center justify-between text-xs text-[var(--dash-text-muted)] font-medium">
            <span>Hot Leads ⭐</span>
            <Star className="w-4 h-4 text-emerald-500 fill-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono mt-2 text-emerald-500">{stats?.interested || 0}</div>
          <div className="text-[11px] text-emerald-500 font-semibold mt-1">
            {stats?.conversion_rate !== undefined ? `${stats.conversion_rate}%` : "0.0%"} qualified conversion
          </div>
        </div>

        <div className="crm-card p-4">
          <div className="flex items-center justify-between text-xs text-[var(--dash-text-muted)] font-medium">
            <span>Spam & Block Reports</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono mt-2 text-rose-500">
            {(stats?.blocked || 0) + (stats?.reported || 0)}
          </div>
          <div className="text-[11px] text-[var(--dash-text-muted)] mt-1">
            {stats?.blocked || 0} blocked • {stats?.reported || 0} reported
          </div>
        </div>
      </div>

      {/* ── Segmented Navigation Tabs & Worker Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--dash-border)] pb-3">
        <div className="flex items-center gap-1.5 p-1 rounded-md bg-[var(--dash-card-bg)] border border-[var(--dash-border)] overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-semibold text-xs transition-all cursor-pointer ${
              activeTab === "chat"
                ? "bg-[var(--dash-primary)] text-white shadow-sm"
                : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Live Chat Workspace</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-black/20 font-mono font-bold">
              {totalConversations}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab("analytics"); fetchAnalytics(); fetchOverview(); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-semibold text-xs transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "bg-[var(--dash-primary)] text-white shadow-sm"
                : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics & Spam Reports</span>
            {((stats?.blocked || 0) + (stats?.reported || 0)) > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-500/20 text-rose-400 font-mono font-bold">
                {(stats?.blocked || 0) + (stats?.reported || 0)}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("leads")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-semibold text-xs transition-all cursor-pointer ${
              activeTab === "leads"
                ? "bg-[var(--dash-primary)] text-white shadow-sm"
                : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Prospects Database</span>
          </button>

          <button
            onClick={() => { setActiveTab("logs"); fetchActivityLogs(); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-semibold text-xs transition-all cursor-pointer ${
              activeTab === "logs"
                ? "bg-[var(--dash-primary)] text-white shadow-sm"
                : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Activity Console</span>
          </button>
        </div>

        {/* Worker Control Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleGenerateQueue}
            disabled={generatingQueue}
            className="crm-btn-secondary text-xs flex items-center gap-1.5"
          >
            {generatingQueue ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ListOrdered className="w-3.5 h-3.5 text-blue-500" />}
            <span>Generate Queue</span>
          </button>

          {!queueStatus?.is_running ? (
            <button
              onClick={handleStartBot}
              disabled={startingBot || isLimitReached}
              className="crm-btn-primary text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              {startingBot ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>Start Worker</span>
            </button>
          ) : (
            <button
              onClick={handleStopBot}
              disabled={stoppingBot}
              className="crm-btn-secondary text-xs flex items-center gap-1.5 text-red-500 border-red-500/30"
            >
              {stoppingBot ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Square className="w-3.5 h-3.5" />}
              <span>Pause Worker</span>
            </button>
          )}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 1: LIVE CHAT WORKSPACE (CRM 3-PANE INTERFACE)
         ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 h-[760px] crm-card p-0 overflow-hidden border border-[var(--dash-border)] w-full">
          {/* Left Panel: Contact Threads (4 cols on desktop) */}
          <div className={`lg:col-span-4 border-r border-[var(--dash-border)] flex flex-col overflow-hidden bg-[var(--dash-card-bg)] ${
            mobileView === "chat" ? "hidden lg:flex" : "flex"
          }`}>
            {/* Sidebar Header */}
            <div className="p-3 border-b border-[var(--dash-border)] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-bold text-xs">
                  WA
                </div>
                <div>
                  <span className="font-bold text-xs text-[var(--dash-text)] block">WhatsApp Inbox</span>
                  <span className="text-[10px] text-emerald-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> All Active Chats
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[var(--dash-text-muted)]">
                <button onClick={handleFetchQr} title="Pair QR Code" className="p-1.5 hover:text-[var(--dash-text)] rounded-md cursor-pointer">
                  <QrCode className="w-4 h-4" />
                </button>
                <button onClick={() => setTestModalOpen(true)} title="Send Test Message" className="p-1.5 hover:text-[var(--dash-text)] rounded-md cursor-pointer">
                  <Zap className="w-4 h-4 text-amber-500" />
                </button>
              </div>
            </div>

            {/* Search & Filter Header */}
            <div className="p-2.5 space-y-2 border-b border-[var(--dash-border)]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--dash-text-muted)]" />
                <input
                  type="text"
                  placeholder="Search contact, number..."
                  value={convSearch}
                  onChange={(e) => setConvSearch(e.target.value)}
                  className="crm-input pl-8 py-1 text-xs w-full"
                />
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
                {[
                  { id: "all", label: "All Chats" },
                  { id: "replied", label: "💬 Replied" },
                  { id: "interested", label: "⭐ Interested" },
                  { id: "combined", label: "🔥 Combined" },
                  { id: "ai_active", label: "🤖 AI" },
                  { id: "human_takeover", label: "👤 Human" }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setConvFilter(f.id)}
                    className={`px-2 py-0.5 rounded-md font-medium shrink-0 transition-all cursor-pointer ${
                      convFilter === f.id
                        ? "bg-[var(--dash-primary)] text-white font-semibold"
                        : "bg-[var(--dash-bg)] text-[var(--dash-text-muted)] hover:text-[var(--dash-text)] border border-[var(--dash-border)]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversations Scrollable List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[var(--dash-border)]">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-[var(--dash-text-muted)] text-xs">
                  No conversations match this criteria.
                </div>
              ) : (
                conversations.map((c) => {
                  const isSelected = selectedConv?.lead_id === c.lead_id;
                  return (
                    <div
                      key={c.lead_id}
                      onClick={() => { setSelectedConv(c); setMobileView("chat"); }}
                      className={`p-3 cursor-pointer transition-all hover:bg-slate-500/5 ${
                        isSelected ? "bg-emerald-500/10 border-l-2 border-emerald-500" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-md bg-slate-500/10 border border-[var(--dash-border)] flex items-center justify-center text-[var(--dash-text)] font-bold text-xs shrink-0">
                            {c.bussiness_name ? c.bussiness_name.charAt(0).toUpperCase() : "#"}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-xs text-[var(--dash-text)] truncate max-w-[130px]">
                                {c.bussiness_name || format10DigitPhone(c.phone_number)}
                              </span>
                              {c.is_interested && (
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                              )}
                            </div>
                            <div className="text-[10px] text-[var(--dash-text-muted)] flex items-center gap-1 truncate font-mono mt-0.5">
                              <span>{format10DigitPhone(c.phone_number)}</span>
                              {c.scraped_city && <span>• {c.scraped_city}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Timestamp & Status Badge */}
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-[10px] text-[var(--dash-text-muted)] font-mono">
                            {c.latest_timestamp ? formatISTTime(c.latest_timestamp) : "Recent"}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase border ${
                            c.whatsapp_ai_enabled
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          }`}>
                            {c.whatsapp_ai_enabled ? "AI Bot" : "Human"}
                          </span>
                        </div>
                      </div>

                      {/* Latest message preview */}
                      <div className="flex items-center justify-between mt-1.5 pl-0.5">
                        <p className="text-xs text-[var(--dash-text-muted)] truncate max-w-[210px]">
                          {c.latest_message || "Direct outreach initiated..."}
                        </p>
                        <CheckCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Middle Panel: Active Live Chat Window */}
          <div className={`${showRightDrawer ? "lg:col-span-5 xl:col-span-5" : "lg:col-span-8"} flex flex-col overflow-hidden relative border-r border-[var(--dash-border)] bg-[var(--dash-bg)] ${
            mobileView === "list" ? "hidden lg:flex" : "flex"
          }`}>
            {selectedConv ? (
              <>
                {/* Active Chat Header */}
                <div className="p-2 sm:p-2.5 border-b border-[var(--dash-border)] bg-[var(--dash-card-bg)] flex items-center justify-between gap-1.5 sm:gap-2 shadow-sm min-w-0 relative z-20">
                  <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
                    <button
                      onClick={() => setMobileView("list")}
                      className="lg:hidden p-1 sm:p-1.5 rounded-md crm-btn-secondary text-xs shrink-0 cursor-pointer"
                      title="Back to conversation list"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center font-bold text-xs shrink-0">
                      {selectedConv.bussiness_name ? selectedConv.bussiness_name.charAt(0).toUpperCase() : "#"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <h2 className="font-bold text-xs sm:text-sm md:text-base text-[var(--dash-text)] truncate max-w-[130px] sm:max-w-[240px] md:max-w-none" title={selectedConv.bussiness_name}>
                          {selectedConv.bussiness_name || format10DigitPhone(selectedConv.phone_number)}
                        </h2>
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-[var(--dash-text-muted)] truncate flex items-center gap-1 font-mono">
                        <span>{format10DigitPhone(selectedConv.phone_number)}</span>
                        {selectedConv.scraped_city && (
                          <>
                            <span>•</span>
                            <span className="truncate">{selectedConv.scraped_city}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Header CTA Action Buttons */}
                  <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                    <button
                      onClick={() => handleToggleInterest(selectedConv)}
                      className={`text-[11px] p-1.5 sm:py-1 sm:px-2.5 rounded-md flex items-center gap-1 font-bold border transition cursor-pointer shrink-0 ${
                        selectedConv.is_interested
                          ? "bg-amber-500/15 border-amber-500/40 text-amber-500 hover:bg-amber-500/25"
                          : "bg-[var(--dash-card-bg)] border-[var(--dash-border)] text-[var(--dash-text-muted)] hover:text-amber-500 hover:border-amber-500/30"
                      }`}
                      title={selectedConv.is_interested ? "Click to unmark this contact as interested" : "Click to mark this contact as interested lead"}
                    >
                      <Star className={`w-3.5 h-3.5 ${selectedConv.is_interested ? "fill-amber-500 text-amber-500" : ""}`} />
                      <span className="hidden sm:inline whitespace-nowrap">{selectedConv.is_interested ? "Unmark ⭐" : "Mark Interested ⭐"}</span>
                    </button>

                    <button
                      onClick={() => handleCtaClick({ id: "call", label: "Call", action_type: "call", payload: "" })}
                      className="crm-btn-secondary text-[11px] p-1.5 sm:py-1 sm:px-2 text-emerald-500 flex items-center gap-1 shrink-0"
                      title="Direct Call CTA"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Call</span>
                    </button>

                    <button
                      onClick={() => handleToggleAiAutoPilot(selectedConv)}
                      disabled={togglingAi}
                      className={`crm-btn-secondary text-[11px] p-1.5 sm:py-1 sm:px-2.5 flex items-center gap-1 sm:gap-1.5 font-medium border transition shrink-0 ${
                        selectedConv.whatsapp_ai_enabled
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20"
                          : "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20"
                      }`}
                      title={
                        selectedConv.whatsapp_ai_enabled
                          ? "AI Auto-Pilot is active. Click to switch to Human Takeover."
                          : "Human Takeover is active (AI silenced). Click to re-enable AI Auto-Pilot."
                      }
                    >
                      {togglingAi ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : selectedConv.whatsapp_ai_enabled ? (
                        <Bot className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                      )}
                      <span className="hidden sm:inline font-semibold">
                        {selectedConv.whatsapp_ai_enabled ? "AI Bot" : "Human"}
                      </span>
                    </button>

                    {/* Desktop Actions */}
                    <div className="hidden sm:flex items-center gap-1 sm:gap-1.5">
                      {isValidWebsite(selectedConv.website) ? (
                        <a
                          href={formatWebsiteUrl(selectedConv.website)!}
                          target="_blank"
                          rel="noreferrer"
                          className="crm-btn-secondary text-[11px] py-1 px-2 text-blue-500 flex items-center gap-1"
                          title="Open Business Website"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">Site</span>
                        </a>
                      ) : (
                        <span
                          className="crm-btn-secondary text-[11px] py-1 px-1.5 text-[var(--dash-text-muted)] opacity-50 cursor-not-allowed flex items-center gap-1"
                          title="No registered website for this business"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </span>
                      )}

                      <button
                        onClick={handleExportChatLog}
                        className="crm-btn-secondary text-[11px] p-1.5"
                        title="Export Chat Transcript"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setShowRightDrawer(!showRightDrawer)}
                        className={`crm-btn-secondary text-[11px] p-1.5 ${showRightDrawer ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : ""}`}
                        title="Toggle Lead CRM Details"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Mobile More Actions Menu */}
                    <div className="relative sm:hidden">
                      <button
                        onClick={() => setShowMobileMoreMenu(!showMobileMoreMenu)}
                        className={`crm-btn-secondary p-1.5 rounded-md cursor-pointer ${showMobileMoreMenu ? "bg-emerald-500/10 text-emerald-500" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"}`}
                        title="More chat options"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {showMobileMoreMenu && (
                        <div
                          ref={mobileMenuRef}
                          className="absolute right-0 top-full mt-1.5 w-44 rounded-lg bg-[var(--dash-card-bg)] border border-[var(--dash-border)] shadow-xl p-1 z-50 text-xs space-y-0.5 animate-in fade-in zoom-in-95 duration-150"
                        >
                          {isValidWebsite(selectedConv.website) ? (
                            <a
                              href={formatWebsiteUrl(selectedConv.website)!}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => setShowMobileMoreMenu(false)}
                              className="w-full text-left px-2.5 py-1.5 hover:bg-slate-500/10 rounded-md text-blue-500 flex items-center gap-2 cursor-pointer"
                            >
                              <Globe className="w-3.5 h-3.5" /> Open Website
                            </a>
                          ) : (
                            <span className="w-full text-left px-2.5 py-1.5 rounded-md text-[var(--dash-text-muted)] opacity-50 cursor-not-allowed flex items-center gap-2">
                              <Globe className="w-3.5 h-3.5" /> No Website
                            </span>
                          )}

                          <button
                            onClick={() => {
                              handleExportChatLog();
                              setShowMobileMoreMenu(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 hover:bg-slate-500/10 rounded-md text-[var(--dash-text)] flex items-center gap-2 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-500" /> Export Chat Log
                          </button>

                          <button
                            onClick={() => {
                              setShowRightDrawer(!showRightDrawer);
                              setShowMobileMoreMenu(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 hover:bg-slate-500/10 rounded-md text-[var(--dash-text)] flex items-center gap-2 cursor-pointer"
                          >
                            <Info className="w-3.5 h-3.5 text-blue-400" /> {showRightDrawer ? "Hide Details" : "Lead Details"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Human Takeover Active Notice Banner - Slim Inline Pill */}
                {!selectedConv.whatsapp_ai_enabled && (
                  <div className="mx-2 sm:mx-4 my-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-[11px] text-amber-500 shrink-0 shadow-sm animate-in fade-in duration-200">
                    <div className="flex items-center gap-1.5 truncate">
                      <UserCheck className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                      <span className="truncate">
                        <strong>Human Takeover:</strong> <span className="hidden sm:inline">AI auto-reply silenced.</span>
                      </span>
                    </div>
                    <button
                      onClick={() => handleToggleAiAutoPilot(selectedConv)}
                      disabled={togglingAi}
                      className="text-[10px] sm:text-[11px] font-bold underline hover:text-amber-400 cursor-pointer ml-2 shrink-0"
                    >
                      Re-enable AI
                    </button>
                  </div>
                )}

                {/* Message Stream Area */}
                <div className="flex-1 min-h-0 overflow-y-auto p-2.5 sm:p-4 space-y-2 sm:space-y-3 bg-[var(--dash-bg)]">
                  {loadingConvMessages ? (
                    <div className="h-full flex items-center justify-center text-[var(--dash-text-muted)] gap-2 font-medium text-xs">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                      <span>Loading conversation history...</span>
                    </div>
                  ) : convMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-[var(--dash-text-muted)] p-8 text-center">
                      <MessageSquare className="w-10 h-10 text-emerald-500/30 mb-2" />
                      <p className="text-xs font-semibold text-[var(--dash-text)]">No Messages In Thread</p>
                      <p className="text-[11px] text-[var(--dash-text-muted)] mt-0.5 max-w-sm">
                        Type a message below or use AI Smart Reply to start communicating with {selectedConv.bussiness_name}.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Load Earlier Messages Button */}
                      {hasMoreMessages && !showAllMessages && (
                        <div className="flex justify-center py-1 mb-1 sticky top-0 z-10">
                          <button
                            onClick={() => {
                              setShowAllMessages(true);
                              fetchChatMessages(selectedConv.lead_id, true);
                            }}
                            disabled={loadingMoreMessages}
                            className="px-2.5 py-0.5 text-[10px] font-medium rounded-full bg-[var(--dash-card-bg)] hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 flex items-center gap-1 transition-all shadow-sm disabled:opacity-60 cursor-pointer"
                          >
                            {loadingMoreMessages ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Loading earlier messages...</span>
                              </>
                            ) : (
                              <>
                                <History className="w-3 h-3" />
                                <span>Load earlier messages ({totalMessageCount - convMessages.length} more)</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {showAllMessages && totalMessageCount > 5 && (
                        <div className="flex justify-center py-1 mb-1">
                          <span className="px-2.5 py-0.5 text-[10px] font-medium rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Showing all {totalMessageCount} messages
                          </span>
                        </div>
                      )}

                      {convMessages.map((m) => {
                      const isOutbound = m.direction === "outbound";
                      return (
                        <div
                          key={m.id}
                          className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-[75%] rounded-md p-3 shadow-sm relative text-xs leading-relaxed border ${
                              isOutbound
                                ? "bg-emerald-600 text-white border-emerald-500"
                                : "bg-[var(--dash-card-bg)] text-[var(--dash-text)] border-[var(--dash-border)]"
                            }`}
                          >
                            {/* Message Header */}
                            <div className="flex items-center justify-between gap-4 mb-1 opacity-75 border-b border-black/10 dark:border-white/10 pb-1">
                              <span className="text-[9px] font-bold tracking-wider uppercase flex items-center gap-1">
                                {isOutbound ? (
                                  <>
                                    <Bot className="w-2.5 h-2.5" /> OUTBOUND OUTREACH
                                  </>
                                ) : (
                                  <>
                                    <Smartphone className="w-2.5 h-2.5" /> INBOUND CUSTOMER
                                  </>
                                )}
                              </span>
                              <span className="text-[9px] font-mono">
                                {m.created_at ? formatISTTime(m.created_at) : ''}
                              </span>
                            </div>

                            {/* Body */}
                            <p className="whitespace-pre-wrap">{m.message_text}</p>

                            {/* CTAs Attached */}
                            {m.cta_buttons && m.cta_buttons.length > 0 && (
                              <div className="mt-2.5 pt-2 border-t border-black/10 dark:border-white/10 space-y-1">
                                <span className="text-[9px] font-bold uppercase tracking-wider block opacity-75">
                                  Interactive CTAs:
                                </span>
                                <div className="flex flex-wrap items-center gap-1">
                                  {m.cta_buttons.map((b) => (
                                    <button
                                      key={b.id}
                                      onClick={() => handleCtaClick(b)}
                                      className="px-2 py-1 rounded text-[10px] font-medium bg-black/20 hover:bg-black/40 text-white border border-white/20 flex items-center gap-1 cursor-pointer transition-all"
                                    >
                                      <span>{b.label}</span>
                                      <ChevronRight className="w-2.5 h-2.5" />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Ticks */}
                            <div className="flex justify-end items-center gap-1 mt-1 text-[9px] opacity-75">
                              {isOutbound && <CheckCheck className="w-3 h-3 text-cyan-300" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-md px-3 py-1.5 text-xs text-[var(--dash-text-muted)] flex items-center gap-1.5 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                        <span className="text-[10px] ml-1">Bot is generating reply...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Composer Bar */}
                <div className="p-3 border-t border-[var(--dash-border)] bg-[var(--dash-card-bg)] space-y-2 relative">
                  {/* Emoji Picker Popover */}
                  {showEmojiPicker && (
                    <div ref={emojiPickerRef} className="absolute bottom-16 left-3 z-30 crm-card p-2.5 shadow-2xl grid grid-cols-4 sm:grid-cols-8 gap-1.5 max-w-xs border border-[var(--dash-border)]">
                      {EMOJI_LIST.map((emo) => (
                        <button
                          key={emo}
                          onClick={() => { setManualMessageText((p) => p + emo); setShowEmojiPicker(false); }}
                          className="text-base hover:bg-slate-500/10 p-1 rounded text-center cursor-pointer transition-all"
                        >
                          {emo}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* CTA Dropup Menu */}
                  {showCtaMenu && (
                    <div ref={ctaMenuRef} className="absolute bottom-16 left-12 z-30 crm-card p-1.5 shadow-2xl w-52 text-xs space-y-1 border border-[var(--dash-border)]">
                      <span className="px-2.5 py-1 font-bold text-[var(--dash-text-muted)] block border-b border-[var(--dash-border)] uppercase text-[9px]">Quick CTA Presets</span>
                      <button
                        onClick={() => { setManualMessageText((p) => p + `\n📞 Call Us Now: ${selectedConv.phone_number}`); setShowCtaMenu(false); }}
                        className="w-full text-left px-2.5 py-1.5 hover:bg-slate-500/10 rounded-md text-[var(--dash-text)] font-medium flex items-center gap-1.5 cursor-pointer"
                      >
                        <Phone className="w-3 h-3 text-emerald-500" /> Insert Direct Call CTA
                      </button>
                      <button
                        onClick={() => {
                          const siteUrl = isValidWebsite(selectedConv.website) ? formatWebsiteUrl(selectedConv.website) : 'https://techinfinix.com';
                          setManualMessageText((p) => p + `\n🌐 Visit Website: ${siteUrl}`);
                          setShowCtaMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 hover:bg-slate-500/10 rounded-md text-[var(--dash-text)] font-medium flex items-center gap-1.5 cursor-pointer"
                      >
                        <Globe className="w-3 h-3 text-blue-500" /> Insert Website CTA
                      </button>
                      <button
                        onClick={() => { setManualMessageText((p) => p + `\n📅 Book Free Consultation: https://techinfinix.com/contact`); setShowCtaMenu(false); }}
                        className="w-full text-left px-2.5 py-1.5 hover:bg-slate-500/10 rounded-md text-[var(--dash-text)] font-medium flex items-center gap-1.5 cursor-pointer"
                      >
                        <Calendar className="w-3 h-3 text-purple-500" /> Insert Booking CTA
                      </button>
                    </div>
                  )}

                  {/* AI Smart Suggest Bar */}
                  <div className="flex items-center justify-between text-xs px-0.5">
                    <button
                      onClick={handleGenerateAiSuggest}
                      disabled={generatingAiReply}
                      className="text-emerald-500 hover:underline flex items-center gap-1 font-semibold cursor-pointer disabled:opacity-50 text-[11px]"
                    >
                      {generatingAiReply ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      <span>✨ Auto-Suggest AI Reply</span>
                    </button>
                    <span className="text-[10px] text-[var(--dash-text-muted)] font-mono">Shift+Enter for newline</span>
                  </div>

                  {/* Main Inputs */}
                  <form onSubmit={(e) => { e.preventDefault(); handleSendManualReply(); }} className="flex items-center gap-1.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 text-[var(--dash-text-muted)] hover:text-[var(--dash-text)] hover:bg-slate-500/10 rounded-md cursor-pointer shrink-0"
                      title="Emojis"
                    >
                      <Smile className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowCtaMenu(!showCtaMenu)}
                      className="p-2 text-[var(--dash-text-muted)] hover:text-emerald-500 hover:bg-slate-500/10 rounded-md cursor-pointer shrink-0"
                      title="Insert CTA Template"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    <input
                      type="text"
                      placeholder={`Reply to ${selectedConv.bussiness_name} on WhatsApp...`}
                      value={manualMessageText}
                      onChange={(e) => setManualMessageText(e.target.value)}
                      className="crm-input flex-1 min-w-0 text-xs py-2"
                    />

                    <button
                      type="submit"
                      disabled={sendingManualReply || !manualMessageText.trim()}
                      className="crm-btn-primary p-2 flex items-center justify-center cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {sendingManualReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-[var(--dash-text-muted)] text-xs">
                Select a conversation thread from the left to view messages.
              </div>
            )}
          </div>

          {/* Helper function to render the rich Lead Details content matching Screenshot 2 */}
          {(() => {
            const renderLeadContent = (conv: ConversationItem) => {
              const domain = conv.website
                ? conv.website.replace(/^https?:\/\//i, "").split("/")[0].replace(/^www\./i, "")
                : conv.email && !conv.email.includes("gmail") && !conv.email.includes("yahoo") && !conv.email.includes("outlook")
                ? conv.email.split("@")[1]
                : null;

              return (
                <div className="space-y-3 sm:space-y-3.5">
                  {/* Profile Card Header (exact match Screenshot 2) */}
                  <div className="p-3 sm:p-3.5 space-y-2.5 bg-[var(--dash-surface-alt)] border border-[var(--dash-border)] rounded-[var(--dash-card-radius)]">
                    <div className="flex items-center gap-3">
                      {/* Brand Image / Domain Favicon Avatar */}
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border border-[var(--dash-border)] bg-white shadow-xs shrink-0 flex items-center justify-center">
                        {domain ? (
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
                            alt={conv.bussiness_name}
                            className="w-full h-full object-contain p-1.5"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = "none";
                              const fallback = e.currentTarget.parentElement?.querySelector(".wa-lead-avatar-fallback");
                              if (fallback) (fallback as HTMLElement).style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className="wa-lead-avatar-fallback w-full h-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-black text-lg flex items-center justify-center"
                          style={{ display: domain ? "none" : "flex" }}
                        >
                          {conv.bussiness_name ? conv.bussiness_name.charAt(0).toUpperCase() : "#"}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm sm:text-base font-bold leading-snug truncate text-[var(--dash-text)]">
                          {conv.bussiness_name}
                        </h3>
                        <p className="text-[11px] sm:text-xs truncate font-medium text-[var(--dash-text-secondary)]">
                          {conv.category || conv.scraped_city || "Client Prospect"}
                        </p>
                        {isValidWebsite(conv.website) && (
                          <a
                            href={formatWebsiteUrl(conv.website)!}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-mono text-indigo-500 hover:underline flex items-center gap-1 mt-0.5 truncate"
                          >
                            <Globe className="w-3 h-3 shrink-0" />
                            <span className="truncate">{conv.website?.replace(/^https?:\/\//i, "")}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Dynamic Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="crm-badge badge-primary text-[10px]">
                        Source: {conv.latest_direction === "inbound" ? "Direct Inbound" : "Outreach Scraping"}
                      </span>
                      {conv.email && (
                        <span className="crm-badge badge-success text-[10px]">
                          Verified Email
                        </span>
                      )}
                      {conv.phone_number && (
                        <span className="crm-badge badge-warning text-[10px]">
                          Phone Contact
                        </span>
                      )}
                      {conv.rating && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          ★ {conv.rating}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Toolbar Grid (Screenshot 2: Call, Email, WhatsApp, WA Proposal, + Note, Follow-up) */}
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={formatDialerUrl(conv.phone_number)}
                      className="crm-btn-secondary flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-bold shrink-0 transition"
                      title="Make phone call"
                    >
                      <Phone className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Call</span>
                    </a>

                    <a
                      href={conv.email ? `mailto:${conv.email}` : undefined}
                      onClick={(e) => {
                        if (!conv.email) {
                          e.preventDefault();
                          showAlert("error", "No email registered for this contact");
                        }
                      }}
                      className="crm-btn-secondary flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-bold shrink-0 transition"
                      title="Send email"
                    >
                      <Mail className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{conv.email ? "Email" : "Add Email"}</span>
                    </a>

                    <a
                      href={`https://wa.me/${conv.clean_phone || conv.phone_number.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="crm-btn-secondary flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-bold shrink-0 transition"
                      title="Direct WhatsApp chat"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleCtaClick({ id: "wa_proposal", label: "Proposal", action_type: "quick_reply", payload: "proposal" })}
                      className="crm-btn-secondary flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-bold shrink-0 transition hover:border-emerald-500 cursor-pointer"
                      title="Send WhatsApp proposal"
                    >
                      <Zap className="w-3.5 h-3.5 text-emerald-500" />
                      <span>WA Proposal</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowNoteInput(!showNoteInput)}
                      className="crm-btn-secondary flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-bold shrink-0 transition cursor-pointer"
                      title="Add note"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-500" />
                      <span>Note</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => showAlert("success", "Follow-up logged for this prospect")}
                      className="crm-btn-secondary flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-bold shrink-0 transition cursor-pointer"
                      title="Follow-up reminder"
                    >
                      <Clock className="w-3.5 h-3.5 text-purple-500" />
                      <span>Follow-up</span>
                    </button>
                  </div>

                  {/* Star Interest Toggle Button (Unmark ⭐ or ⭐ Mark as Interested) */}
                  <button
                    type="button"
                    onClick={() => handleToggleInterest(conv)}
                    className={`w-full text-xs flex items-center justify-center gap-1.5 py-2.5 rounded-md font-bold transition cursor-pointer shadow-xs active:scale-95 ${
                      conv.is_interested
                        ? "bg-amber-500/15 border border-amber-500/30 text-amber-500 hover:bg-amber-500/25"
                        : "crm-btn-primary"
                    }`}
                    title={conv.is_interested ? "Click to unmark this contact as interested" : "Click to mark this contact as interested lead"}
                  >
                    <Star className={`w-3.5 h-3.5 ${conv.is_interested ? "fill-amber-500 text-amber-500" : "fill-current"}`} />
                    <span>{conv.is_interested ? "★ Unmark ★" : "⭐ Mark as Interested ⭐"}</span>
                  </button>

                  {/* Inline Add Note Form */}
                  {showNoteInput && (
                    <div className="p-3 rounded-md animate-fadeIn space-y-2 bg-[var(--dash-surface-alt)] border border-[var(--dash-border)]">
                      <label className="text-[11px] font-bold block text-[var(--dash-text-muted)]">
                        Write Internal Team Note:
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Type an internal note about this prospect..."
                        value={leadNoteInput}
                        onChange={(e) => setLeadNoteInput(e.target.value)}
                        className="crm-input w-full text-xs"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowNoteInput(false)}
                          className="crm-btn-secondary text-xs py-1 px-2.5 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!leadNoteInput.trim()) return;
                            showAlert("success", "Note saved successfully");
                            setShowNoteInput(false);
                          }}
                          className="crm-btn-primary text-xs py-1 px-3 cursor-pointer"
                        >
                          Save Note
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Contact Details Card (Screenshot 2) */}
                  <div className="p-3 sm:p-3.5 space-y-2.5 bg-[var(--dash-surface-alt)] border border-[var(--dash-border)] rounded-[var(--dash-card-radius)]">
                    <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)]">
                      Contact Details
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2.5">
                        <Mail className="w-4 h-4 shrink-0 text-[var(--dash-text-muted)]" />
                        <span className="font-semibold break-all text-[var(--dash-primary)]">
                          {conv.email || "No Email Listed"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-[var(--dash-text)]">
                        <Phone className="w-4 h-4 shrink-0 text-[var(--dash-text-muted)]" />
                        <span className="font-semibold">{format10DigitPhone(conv.phone_number)}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-[var(--dash-text)]">
                        <Globe className="w-4 h-4 shrink-0 text-[var(--dash-text-muted)]" />
                        {isValidWebsite(conv.website) ? (
                          <a
                            href={formatWebsiteUrl(conv.website)!}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-400 hover:underline truncate"
                          >
                            {conv.website?.replace(/^https?:\/\//i, "")}
                          </a>
                        ) : (
                          <span className="text-[var(--dash-text-muted)] italic text-xs">No website listed</span>
                        )}
                      </div>
                      {conv.scraped_city && (
                        <div className="flex items-center gap-2.5 text-[var(--dash-text)]">
                          <MapPin className="w-4 h-4 shrink-0 text-rose-500" />
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {conv.scraped_city}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Outreach & Campaign Intelligence Card (Screenshot 2) */}
                  <div className="p-3 sm:p-3.5 space-y-2.5 bg-[var(--dash-surface-alt)] border border-[var(--dash-border)] rounded-[var(--dash-card-radius)]">
                    <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)]">
                      Outreach & Campaign Intelligence
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-white/50 dark:bg-black/20 border border-slate-200/80 dark:border-neutral-800">
                        <span className="text-[10px] text-slate-400 block font-medium">WhatsApp Outreach</span>
                        <span className="font-bold capitalize text-emerald-500">
                          {conv.whatsapp_status || "Inbound"}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/50 dark:bg-black/20 border border-slate-200/80 dark:border-neutral-800">
                        <span className="text-[10px] text-slate-400 block font-medium">Email Campaign</span>
                        <span className="font-bold capitalize text-indigo-500">
                          Pending
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs px-1">
                      <span className="text-slate-500 dark:text-neutral-400 font-medium">AI Auto-Reply Bot</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        conv.whatsapp_ai_enabled
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                      }`}>
                        {conv.whatsapp_ai_enabled ? "Active" : "Disabled"}
                      </span>
                    </div>
                  </div>

                  {/* Activity History & Internal Notes Card (Screenshot 2) */}
                  <div className="p-3 sm:p-3.5 space-y-2.5 border border-[var(--dash-border)] rounded-[var(--dash-card-radius)]">
                    <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)]">
                      Activity History
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                        <span className="font-medium text-[var(--dash-text)]">
                          {conv.latest_direction === "inbound" ? "📩 Inbound WhatsApp Message Received" : "🚀 Outreach Campaign Initiated"}
                        </span>
                      </div>
                      {conv.last_reply && (
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span className="text-[var(--dash-text-muted)] truncate">
                            Last reply: {conv.last_reply}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Lead Specs Summary */}
                    <div className="pt-2 border-t border-[var(--dash-border)] space-y-1 text-xs">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-[var(--dash-text-muted)]">Lead ID:</span>
                        <span className="font-mono font-semibold text-[var(--dash-text)]">#{conv.lead_id}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-[var(--dash-text-muted)]">Category:</span>
                        <span className="text-[var(--dash-text)]">{conv.category || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            };

            return (
              <>
                {/* Desktop Right Sidebar (in-grid col-span-3, visible on screens >= 1024px) */}
                {isDesktop && showRightDrawer && selectedConv && (
                  <div className="lg:col-span-3 border-l border-[var(--dash-border)] flex flex-col overflow-hidden bg-[var(--dash-card-bg)]">
                    {/* Header */}
                    <div className="p-3 border-b border-[var(--dash-border)] bg-[var(--dash-card-bg)] flex items-center justify-between shrink-0 sticky top-0 z-30">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => handleToggleInterest(selectedConv)}
                          className={`crm-badge ${selectedConv.is_interested ? "badge-warning" : "badge-secondary"} text-xs font-bold cursor-pointer hover:opacity-80 transition flex items-center gap-1`}
                          title="Click to toggle interest status"
                        >
                          <span className="w-2 h-2 rounded-full" style={{ background: selectedConv.is_interested ? "var(--dash-warning)" : "var(--dash-text-muted)" }} />
                          <span className="capitalize">{selectedConv.is_interested ? "Interested" : (selectedConv.whatsapp_status || "Lead")}</span>
                          <ChevronDown className="w-3 h-3 opacity-60" />
                        </button>
                        <span className="crm-badge badge-success text-[10px] font-bold">
                          Score: {selectedConv.is_interested ? 94 : 75}
                        </span>
                      </div>
                      <button
                        onClick={() => setShowRightDrawer(false)}
                        className="px-2.5 py-1 text-xs font-bold rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-500 hover:bg-rose-500/20 cursor-pointer flex items-center gap-1 transition active:scale-95"
                        title="Hide CRM Panel"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Close</span>
                      </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="p-3.5 space-y-3.5 overflow-y-auto flex-1 crm-scrollbar">
                      {renderLeadContent(selectedConv)}
                    </div>
                  </div>
                )}

                {/* Mobile Right Drawer (Rendered at Root Portal with z-[99999] so navbar NEVER obscures it) */}
                {mounted && typeof document !== "undefined" && !isDesktop && showRightDrawer && selectedConv && createPortal(
                  <div
                    onClick={() => setShowRightDrawer(false)}
                    data-dash-theme={typeof document !== "undefined" ? document.documentElement.getAttribute("data-dash-theme") || (document.documentElement.classList.contains("dark") ? "dark" : "light") : "dark"}
                    className="fixed inset-0 z-[99999] overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn cursor-pointer"
                  >
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="w-full sm:max-w-md h-full h-[100dvh] max-h-[100dvh] shadow-2xl flex flex-col justify-between cursor-default relative overflow-hidden bg-[var(--dash-card-bg)] text-[var(--dash-text)]"
                      style={{
                        borderLeft: "1px solid var(--dash-border)"
                      }}
                    >
                      {/* Sticky Header with Safe-Area Inset & High-Contrast Close Button */}
                      <div
                        className="flex-none px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 z-30 sticky top-0 shadow-xs bg-[var(--dash-card-bg)] border-b border-[var(--dash-border)]"
                        style={{
                          paddingTop: "max(env(safe-area-inset-top, 0px), 0.75rem)"
                        }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <button
                            onClick={() => handleToggleInterest(selectedConv)}
                            className={`crm-badge ${selectedConv.is_interested ? "badge-warning" : "badge-secondary"} text-xs font-bold cursor-pointer hover:opacity-80 transition flex items-center gap-1.5 shrink-0`}
                            title="Click to toggle interest status"
                          >
                            <span className="w-2 h-2 rounded-full" style={{ background: selectedConv.is_interested ? "var(--dash-warning)" : "var(--dash-text-muted)" }} />
                            <span className="capitalize">{selectedConv.is_interested ? "Interested" : (selectedConv.whatsapp_status || "Outreach")}</span>
                            <ChevronDown className="w-3 h-3 opacity-60" />
                          </button>
                          <span className="crm-badge badge-success text-xs font-bold shrink-0">
                            Score: {selectedConv.is_interested ? 94 : 75}
                          </span>
                        </div>

                        {/* Red Close Button */}
                        <button
                          onClick={() => setShowRightDrawer(false)}
                          className="px-3 sm:px-3.5 py-1.5 min-h-[34px] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition rounded-md shadow-xs active:scale-95 shrink-0"
                          style={{
                            background: "var(--dash-danger-light)",
                            color: "var(--dash-danger)",
                            border: "1px solid var(--dash-danger)"
                          }}
                          aria-label="Close lead details"
                          title="Close drawer"
                        >
                          <X className="w-4 h-4 shrink-0" />
                          <span>Close</span>
                        </button>
                      </div>

                      {/* Scrollable Popup Content */}
                      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 flex-1 overflow-y-auto crm-scrollbar">
                        {renderLeadContent(selectedConv)}
                      </div>

                      {/* Sticky Bottom Action Bar (matching Screenshot 2) */}
                      <div className="p-3 border-t border-[var(--dash-border)] bg-[var(--dash-card-bg)] flex items-center justify-between gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setShowRightDrawer(false)}
                          className="p-2 rounded-md crm-btn-secondary text-xs cursor-pointer"
                          title="Close drawer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCtaClick({ id: "wa_proposal", label: "Proposal", action_type: "quick_reply", payload: "proposal" })}
                          className="flex-1 crm-btn-secondary text-xs font-bold text-emerald-500 border-emerald-500/30 flex items-center justify-center gap-1.5 py-2 hover:bg-emerald-500/10 cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Proposal 🚀</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleInterest(selectedConv)}
                          className="flex-1 crm-btn-primary text-xs font-bold flex items-center justify-center gap-1.5 py-2 cursor-pointer"
                        >
                          <span>Update Status</span>
                        </button>
                      </div>
                    </div>
                  </div>,
                  document.body
                )}
              </>
            );
          })()}
      </div>
    )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 2: CTA & CAMPAIGN ANALYTICS + SPAM & BLOCK AUDIT REPORT
         ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "analytics" && (
        <div className="space-y-5">
          {/* Analytics KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="crm-card p-4">
              <div className="flex items-center justify-between text-xs text-[var(--dash-text-muted)] font-medium">
                <span>Reply Conversion Rate</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-500 mt-2">
                {analyticsData?.summary?.response_rate !== undefined
                  ? analyticsData.summary.response_rate
                  : (stats?.response_rate ?? 0)}%
              </div>
              <div className="text-[11px] text-[var(--dash-text-muted)] mt-1">Outreach to inbound reply ratio</div>
            </div>

            <div className="crm-card p-4">
              <div className="flex items-center justify-between text-xs text-[var(--dash-text-muted)] font-medium">
                <span>CTA Click Rate</span>
                <Sparkles className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-blue-500 mt-2">
                {analyticsData?.summary?.cta_click_rate !== undefined
                  ? analyticsData.summary.cta_click_rate
                  : (stats?.cta_click_rate ?? 0)}%
              </div>
              <div className="text-[11px] text-[var(--dash-text-muted)] mt-1">Prospects who clicked CTA</div>
            </div>

            <div className="crm-card p-4">
              <div className="flex items-center justify-between text-xs text-[var(--dash-text-muted)] font-medium">
                <span>Qualified Hot Leads</span>
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-amber-500 mt-2">
                {analyticsData?.summary?.total_interested !== undefined
                  ? analyticsData.summary.total_interested
                  : (stats?.interested || 0)}
              </div>
              <div className="text-[11px] text-[var(--dash-text-muted)] mt-1">Marked Interested ⭐</div>
            </div>

            <div className="crm-card p-4">
              <div className="flex items-center justify-between text-xs text-[var(--dash-text-muted)] font-medium">
                <span>Spam & Block Rate</span>
                <ShieldAlert className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-rose-500 mt-2">
                {analyticsData?.summary?.spam_block_rate !== undefined
                  ? analyticsData.summary.spam_block_rate
                  : (stats?.sent ? (((stats.blocked || 0) + (stats.reported || 0)) / stats.sent * 100).toFixed(1) : "0.0")}%
              </div>
              <div className="text-[11px] text-[var(--dash-text-muted)] mt-1">Safe threshold (&lt; 2.0%)</div>
            </div>
          </div>

          {/* Daily Sending Quota & Capacity Usage Card */}
          <div className="crm-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-[var(--dash-text)] flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Daily Sending Quota & Capacity Usage</span>
                </h3>
                <p className="text-xs text-[var(--dash-text-muted)] mt-0.5">
                  Monitor daily outreach limits, messages sent today, and remaining message allowance
                </p>
              </div>
              <button
                onClick={() => setDailyLimitModalOpen(true)}
                className="crm-btn-secondary text-xs flex items-center gap-1.5 self-start sm:self-auto"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Adjust Limit ({dailyLimit})
              </button>
            </div>

            <div className="bg-[var(--dash-bg)] border border-[var(--dash-border)] p-4 rounded-md space-y-3">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-[var(--dash-text)]">Daily Quota Consumption: <strong className="font-mono">{sentToday} / {dailyLimit}</strong> messages</span>
                <span className="text-emerald-500 font-mono font-bold">
                  {Math.round(((sentToday || 0) / (dailyLimit || 1)) * 100)}% Used ({Math.max(0, dailyLimit - sentToday)} Remaining Today)
                </span>
              </div>

              <div className="w-full bg-slate-500/10 rounded-full h-2.5 overflow-hidden p-0.5 border border-[var(--dash-border)]">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, ((sentToday || 0) / (dailyLimit || 1)) * 100))}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-3 text-center pt-1">
                <div className="bg-[var(--dash-card-bg)] p-2.5 rounded-md border border-[var(--dash-border)]">
                  <div className="text-[11px] text-[var(--dash-text-muted)] font-medium">Sent Today</div>
                  <div className="text-lg font-bold text-[var(--dash-text)] font-mono">{sentToday}</div>
                </div>
                <div className="bg-[var(--dash-card-bg)] p-2.5 rounded-md border border-[var(--dash-border)]">
                  <div className="text-[11px] text-[var(--dash-text-muted)] font-medium">Remaining Quota</div>
                  <div className="text-lg font-bold text-emerald-500 font-mono">{Math.max(0, dailyLimit - sentToday)}</div>
                </div>
                <div className="bg-[var(--dash-card-bg)] p-2.5 rounded-md border border-[var(--dash-border)]">
                  <div className="text-[11px] text-[var(--dash-text-muted)] font-medium">Daily Limit</div>
                  <div className="text-lg font-bold text-blue-500 font-mono">{dailyLimit}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Chart 1: Daily WhatsApp Outreach Volume */}
            <div className="crm-card p-5 space-y-3">
              <div>
                <h3 className="text-sm font-bold text-[var(--dash-text)] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span>Outreach & Reply Volume Over Time</span>
                </h3>
                <p className="text-xs text-[var(--dash-text-muted)] mt-0.5">Track daily message dispatches vs customer replies</p>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyOutreachChartData}>
                    <defs>
                      <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorReplied" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--dash-border)" />
                    <XAxis dataKey="day" stroke="var(--dash-text-muted)" fontSize={11} />
                    <YAxis stroke="var(--dash-text-muted)" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--dash-card-bg)", borderColor: "var(--dash-border)", borderRadius: "6px", color: "var(--dash-text)" }} />
                    <Area type="monotone" dataKey="sent" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSent)" name="Sent Messages" />
                    <Area type="monotone" dataKey="replied" stroke="#10b981" fillOpacity={1} fill="url(#colorReplied)" name="Inbound Replies" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: CTA Button Engagement Breakdown */}
            <div className="crm-card p-5 space-y-3">
              <div>
                <h3 className="text-sm font-bold text-[var(--dash-text)] flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-amber-500" />
                  <span>Call-To-Action (CTA) Click Distribution</span>
                </h3>
                <p className="text-xs text-[var(--dash-text-muted)] mt-0.5">Breakdown of which interactive buttons prospects click</p>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ctaChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {ctaChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "var(--dash-card-bg)", borderColor: "var(--dash-border)", borderRadius: "6px", color: "var(--dash-text)" }} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Outreach Conversion Funnel */}
            <div className="crm-card p-5 space-y-3 lg:col-span-2">
              <div>
                <h3 className="text-sm font-bold text-[var(--dash-text)] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-500" />
                  <span>Outreach Conversion Funnel</span>
                </h3>
                <p className="text-xs text-[var(--dash-text-muted)] mt-0.5">End-to-end pipeline progression from raw prospect to hot lead</p>
              </div>

              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--dash-border)" />
                    <XAxis type="number" stroke="var(--dash-text-muted)" fontSize={11} />
                    <YAxis dataKey="stage" type="category" stroke="var(--dash-text-muted)" fontSize={11} width={110} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--dash-card-bg)", borderColor: "var(--dash-border)", borderRadius: "6px", color: "var(--dash-text)" }} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {funnelData.map((entry, index) => (
                        <Cell key={`funnel-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ── DEDICATED SPAM & BLOCK REPORTS AUDIT TABLE ── */}
          <div className="crm-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[var(--dash-text)] flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span>Spam & Block Audit Report</span>
                  <span className="px-2 py-0.2 rounded text-[11px] font-mono font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                    {spamAndBlocksList.length} Flagged
                  </span>
                </h3>
                <p className="text-xs text-[var(--dash-text-muted)] mt-0.5">
                  Detailed audit of prospects who opted out, reported spam, blocked the sender number, or unsubscribed
                </p>
              </div>
              <button
                onClick={fetchAnalytics}
                className="crm-btn-secondary text-xs flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Audit</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-md border border-[var(--dash-border)]">
              <table className="w-full text-left text-xs text-[var(--dash-text)]">
                <thead className="bg-[var(--dash-bg)] text-[var(--dash-text-muted)] uppercase text-[10px] font-semibold border-b border-[var(--dash-border)]">
                  <tr>
                    <th className="p-3">Business & Contact</th>
                    <th className="p-3">Location & Category</th>
                    <th className="p-3">Flag Reason</th>
                    <th className="p-3">Last Incoming Message</th>
                    <th className="p-3">Reported At</th>
                    <th className="p-3 text-right">Protection Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--dash-border)] bg-[var(--dash-card-bg)]">
                  {spamAndBlocksList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[var(--dash-text-muted)] text-xs">
                        <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                        <span className="font-semibold text-[var(--dash-text)] block">Clean Sender Reputation</span>
                        <span>Zero spam flags, blocks, or unsubscribe requests recorded!</span>
                      </td>
                    </tr>
                  ) : (
                    spamAndBlocksList.map((item) => (
                      <tr key={item.lead_id} className="hover:bg-slate-500/5 transition-all">
                        <td className="p-3 font-medium">
                          <div className="font-semibold text-[var(--dash-text)]">{item.bussiness_name}</div>
                          <div className="text-[10px] font-mono text-[var(--dash-text-muted)]">{item.phone_number}</div>
                        </td>
                        <td className="p-3 text-[var(--dash-text-muted)]">
                          <div>{item.scraped_city || "—"}</div>
                          <div className="text-[10px]">{item.category || "General"}</div>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            item.whatsapp_status === "reported"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          }`}>
                            <Ban className="w-2.5 h-2.5" />
                            <span>{item.whatsapp_status}</span>
                          </span>
                        </td>
                        <td className="p-3 text-[var(--dash-text-muted)] max-w-[220px] truncate">
                          "{item.last_reply || "STOP / Unsubscribe requested"}"
                        </td>
                        <td className="p-3 text-[var(--dash-text-muted)] font-mono text-[10px]">
                          {item.reply_at ? formatISTDateTime(item.reply_at) : "Recently"}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => showAlert("success", `Opt-out confirmed for ${item.phone_number}. Number permanently blacklisted from campaigns.`)}
                            className="crm-btn-secondary text-[10px] py-1 px-2 text-rose-500 border-rose-500/30"
                          >
                            Blacklist Confirmed
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 3: PROSPECTS & CAMPAIGN QUEUE TABLE
         ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "leads" && (
        <div className="crm-card p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-[var(--dash-text)]">Outreach Prospects Database</h2>
              <p className="text-xs text-[var(--dash-text-muted)] mt-0.5">Scraped Google Maps prospects & outreach campaign delivery status</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Search prospects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="crm-input text-xs py-1.5 w-48 sm:w-60"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="crm-input text-xs py-1.5"
              >
                <option value="all">All Statuses</option>
                <option value="replied">💬 Replied (Awaiting Interest)</option>
                <option value="interested">⭐ Interested (High Intent)</option>
                <option value="combined">🔥 Combined (Replied + Interested)</option>
                <option value="pending">Pending</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
                <option value="blocked">Blocked</option>
                <option value="reported">Reported</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-md border border-[var(--dash-border)]">
            <table className="w-full text-left text-xs text-[var(--dash-text)]">
              <thead className="bg-[var(--dash-bg)] text-[var(--dash-text-muted)] uppercase text-[10px] font-semibold border-b border-[var(--dash-border)]">
                <tr>
                  <th className="p-3">Business Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">City / Category</th>
                  <th className="p-3">WhatsApp Status</th>
                  <th className="p-3">Last Reply</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--dash-border)] bg-[var(--dash-card-bg)]">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[var(--dash-text-muted)]">
                      No prospects found matching your search.
                    </td>
                  </tr>
                ) : (
                  leads.map((l) => (
                    <tr
                      key={l.id}
                      onClick={() => setSelectedLeadModal(l)}
                      className="hover:bg-slate-500/5 transition-all cursor-pointer"
                    >
                      <td className="p-3 font-semibold text-[var(--dash-text)]">{l.bussiness_name}</td>
                      <td className="p-3 font-mono text-[var(--dash-text-muted)]">{l.bussiness_number}</td>
                      <td className="p-3 text-[var(--dash-text-muted)]">{l.scraped_city} • {l.category || l.scraped_service}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border capitalize ${
                          statusColors[l.whatsapp_status || "pending"]
                        }`}>
                          {statusIcons[l.whatsapp_status || "pending"]}
                          <span>{l.whatsapp_status || "pending"}</span>
                        </span>
                      </td>
                      <td className="p-3 text-[var(--dash-text-muted)] max-w-[180px] truncate">
                        {l.whatsapp_last_reply || "—"}
                      </td>
                      <td className="p-3 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedLeadModal(l)}
                          className="crm-btn-secondary text-[10px] py-1 px-2"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleToggleInterest(l.id)}
                          className={`text-[10px] py-1 px-2 rounded-md font-semibold transition cursor-pointer ${
                            l.is_interested
                              ? "bg-amber-500/15 border border-amber-500/30 text-amber-500 hover:bg-amber-500/25"
                              : "crm-btn-primary"
                          }`}
                        >
                          {l.is_interested ? "⭐ Interested" : "Interested?"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 4: LIVE ACTIVITY CONSOLE LOGS
         ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "logs" && (
        <div className="crm-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--dash-text)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>Real-Time WhatsApp Bot Console Logs</span>
            </h2>
            <button
              onClick={fetchActivityLogs}
              disabled={loadingLogs}
              className="crm-btn-secondary text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? "animate-spin" : ""}`} />
              <span>Refresh Log</span>
            </button>
          </div>

          <div className="bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-md p-3.5 h-[500px] overflow-y-auto font-mono text-xs text-[var(--dash-text-muted)] space-y-1">
            {logs.length === 0 ? (
              <div className="italic text-center py-12">No activity logs recorded yet.</div>
            ) : (
              logs.map((line, idx) => (
                <div key={idx} className="hover:bg-slate-500/5 p-0.5 rounded leading-relaxed">
                  {line}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── MODAL 1: EDIT DAILY LIMIT ── */}
      {dailyLimitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="crm-card max-w-md w-full p-6 space-y-4 shadow-2xl border border-[var(--dash-border)]">
            <div className="flex items-center justify-between border-b border-[var(--dash-border)] pb-3">
              <h3 className="font-bold text-base text-[var(--dash-text)] flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-500" />
                <span>Configure Daily Sending Limit</span>
              </h3>
              <button onClick={() => setDailyLimitModalOpen(false)} className="text-[var(--dash-text-muted)] hover:text-[var(--dash-text)] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[var(--dash-text-muted)]">
              Set the maximum number of automated outreach messages sent within a 24-hour UTC window to preserve number reputation and deliverability.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase text-[var(--dash-text-muted)] mb-1.5">
                Max Messages / Day
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={newLimitInput}
                onChange={(e) => setNewLimitInput(Number(e.target.value))}
                className="crm-input w-full text-base font-bold font-mono py-2"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--dash-border)]">
              <button
                onClick={() => setDailyLimitModalOpen(false)}
                className="crm-btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDailyLimit}
                disabled={savingLimit}
                className="crm-btn-primary text-xs flex items-center gap-1.5"
              >
                {savingLimit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Save Daily Limit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: PAIR WHATSAPP QR ── */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="crm-card max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-[var(--dash-border)]">
            <div className="flex items-center justify-between border-b border-[var(--dash-border)] pb-3">
              <h3 className="font-bold text-base text-[var(--dash-text)]">Pair WhatsApp Instance</h3>
              <button onClick={() => setQrModalOpen(false)} className="text-[var(--dash-text-muted)] hover:text-[var(--dash-text)] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingQr ? (
              <div className="py-12 flex flex-col items-center gap-3 text-[var(--dash-text-muted)]">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                <span className="text-xs">Fetching pairing QR from Evolution API...</span>
              </div>
            ) : qrBase64 ? (
              <div className="space-y-3">
                <img src={qrBase64} alt="WhatsApp QR Code" className="mx-auto rounded-md border border-[var(--dash-border)] w-60 h-60 object-contain bg-white p-2" />
                <p className="text-xs text-[var(--dash-text-muted)]">Scan this QR code from your WhatsApp mobile application (Linked Devices).</p>
              </div>
            ) : (
              <p className="text-xs text-red-400 py-6">Could not fetch QR code from Evolution API. Make sure instance is online.</p>
            )}

            <button
              onClick={() => setQrModalOpen(false)}
              className="w-full crm-btn-secondary text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL 3: SEND TEST MESSAGE ── */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="crm-card max-w-md w-full p-6 space-y-4 shadow-2xl border border-[var(--dash-border)]">
            <div className="flex items-center justify-between border-b border-[var(--dash-border)] pb-3">
              <h3 className="font-bold text-base text-[var(--dash-text)]">Send Direct Test WhatsApp</h3>
              <button onClick={() => setTestModalOpen(false)} className="text-[var(--dash-text-muted)] hover:text-[var(--dash-text)] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold uppercase text-[var(--dash-text-muted)] mb-1">Target Phone Number</label>
                <input
                  type="text"
                  value={testNumber}
                  onChange={(e) => setTestNumber(e.target.value)}
                  placeholder="e.g. 7990738939"
                  className="crm-input w-full"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-[var(--dash-text-muted)] mb-1">Custom Message (Optional)</label>
                <textarea
                  rows={3}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Leave empty to send standard outreach template..."
                  className="crm-input w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--dash-border)]">
              <button onClick={() => setTestModalOpen(false)} className="crm-btn-secondary text-xs">Cancel</button>
              <button
                onClick={handleSendTestMessage}
                disabled={sendingTest}
                className="crm-btn-primary text-xs flex items-center gap-1.5"
              >
                {sendingTest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Send Test</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: FULL LEAD DETAILS MODAL ── */}
      {selectedLeadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="crm-card max-w-2xl w-full p-6 space-y-5 shadow-2xl relative my-8 border border-[var(--dash-border)]">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[var(--dash-border)] pb-3">
              <div className="space-y-1 pr-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-lg text-[var(--dash-text)]">{selectedLeadModal.bussiness_name}</h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border capitalize ${
                    statusColors[selectedLeadModal.whatsapp_status || "pending"]
                  }`}>
                    {statusIcons[selectedLeadModal.whatsapp_status || "pending"]}
                    <span>{selectedLeadModal.whatsapp_status || "pending"}</span>
                  </span>
                  {selectedLeadModal.is_interested && (
                    <span className="bg-amber-500/10 text-amber-500 border border-amber-500/25 text-[11px] px-2 py-0.5 rounded font-bold flex items-center gap-1">
                      ⭐ Hot Lead
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--dash-text-muted)] flex items-center gap-2">
                  <span>ID: #{selectedLeadModal.id}</span>
                  <span>•</span>
                  <span>Scraped: {formatISTDate(selectedLeadModal.created_at)}</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedLeadModal(null)}
                className="text-[var(--dash-text-muted)] hover:text-[var(--dash-text)] p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              <div className="bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-md p-3.5 space-y-1">
                <span className="text-[var(--dash-text-muted)] font-medium flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-500" /> Phone / WhatsApp
                </span>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono text-sm font-semibold text-[var(--dash-text)]">
                    {selectedLeadModal.bussiness_number || "—"}
                  </span>
                  {selectedLeadModal.bussiness_number && (
                    <a
                      href={`https://wa.me/${selectedLeadModal.bussiness_number.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="crm-btn-secondary text-[11px] py-1 px-2 text-emerald-500 flex items-center gap-1"
                    >
                      <span>Open Chat</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-md p-3.5 space-y-1">
                <span className="text-[var(--dash-text-muted)] font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" /> Location & Service
                </span>
                <p className="font-semibold text-sm text-[var(--dash-text)] pt-1">
                  {selectedLeadModal.scraped_city || "Unknown City"}
                </p>
                <p className="text-[var(--dash-text-muted)] truncate">
                  {selectedLeadModal.category || selectedLeadModal.scraped_service || "General Business"}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--dash-border)]">
              <button
                onClick={() => {
                  handleMarkInterested(selectedLeadModal.id);
                  setSelectedLeadModal(prev => prev ? { ...prev, is_interested: true, whatsapp_status: "interested" } : null);
                }}
                className="crm-btn-primary text-xs flex items-center gap-1.5"
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Mark Interested ⭐</span>
              </button>

              <button
                onClick={() => setSelectedLeadModal(null)}
                className="crm-btn-secondary text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 9. Test Mode Password Authorization Modal ── */}
      {toggleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="crm-card w-full max-w-md p-6 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--dash-border)]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--dash-text)]">
                    Admin Authorization Required
                  </h3>
                  <p className="text-[11px] text-[var(--dash-text-muted)]">
                    Confirm Super Admin Password to toggle WhatsApp Test Mode
                  </p>
                </div>
              </div>
              <button
                onClick={() => setToggleModalOpen(false)}
                className="text-gray-400 hover:text-gray-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs leading-relaxed text-amber-700 dark:text-amber-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  Switching to: {targetTestMode ? "🛡️ SAFE TEST MODE (Sandbox Redirection)" : "⚠️ LIVE PRODUCTION MODE (Real Recipients)"}
                </span>
              </div>
              <p className="text-[11px] opacity-90 pl-5">
                {targetTestMode
                  ? "100% of outgoing WhatsApp messages will be strictly redirected to test number (+7990738939)."
                  : "All outgoing WhatsApp messages will be sent to REAL client numbers."}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--dash-text)] block">
                Super Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Super Admin password..."
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleConfirmToggleTestMode();
                  }}
                  className="crm-input w-full text-sm py-2.5 px-3 pr-10 font-mono"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {toggleError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{toggleError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--dash-border)]">
              <button
                type="button"
                onClick={() => setToggleModalOpen(false)}
                className="crm-btn-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
                disabled={togglingTestMode}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmToggleTestMode}
                disabled={togglingTestMode || !adminPassword.trim()}
                className="crm-btn-primary px-5 py-2 text-xs font-bold inline-flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {togglingTestMode ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Authorizing...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Confirm & Toggle Mode</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
