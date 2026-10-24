"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuthStore } from "@/lib/authStore";
import { authFetch, API } from "@/lib/authFetch";
import {
  PhoneCall,
  Phone,
  MessageSquare,
  CheckCircle2,
  Building,
  MapPin,
  Star,
  ExternalLink,
  Loader2,
  Calendar,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  PlusCircle,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Check,
  FileText,
  Heart,
  Ban,
  ArrowRight,
  UserCheck,
  Users,
  Filter,
  Lock,
  Trash2,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";
import { format10DigitPhone, formatDialerUrl, formatWebsiteUrl, matchesSimilaritySearch, formatRelativeTime } from "@/lib/formatters";
import { ADMIN_PATH } from "@/lib/config";

interface QueueLeadItem {
  queue_id: number;
  lead_id: number;
  status: "pending" | "contacted" | "interested" | "callback" | "invalid";
  batch_id: string | null;
  call_attempts: number;
  last_called_at: string | null;
  callback_at: string | null;
  notes: string | null;
  assigned_at: string | null;
  is_phone_masked?: boolean;
  dialer_phone?: string;
  assigned_to?: {
    id: number | null;
    username: string;
    job_title: string;
  };
  lead: {
    id: number;
    bussiness_name: string;
    bussiness_number: string;
    bussiness_email: string;
    scraped_city: string;
    rating: string;
    total_review: string;
    bussiness_website: string;
    category: string;
    bussiness_address: string;
    is_interested: boolean;
    whatsapp_status: string | null;
  };
}

interface CallerStats {
  total_assigned: number;
  total_completed: number;
  total_interested: number;
  total_contacted: number;
  total_callbacks: number;
  total_pending: number;
  progress_percentage: number;
}

interface TelecallerSummary {
  id: number;
  username: string;
  job_title: string;
  is_superadmin: boolean;
  is_main_admin: boolean;
  is_sales_assigned?: boolean;
  total_assigned: number;
  total_pending: number;
  total_completed: number;
  total_interested: number;
  total_contacted: number;
  total_callbacks: number;
  progress_percentage: number;
}

export default function SalesCallingDeskPage() {
  const { user } = useAuthStore();
  const isSuperAdmin = Boolean(user?.is_superadmin || user?.is_main_admin);
  const callerName = user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : "Telecaller";

  // Telecaller Switcher for Admin & Super Admin
  const [telecallers, setTelecallers] = useState<TelecallerSummary[]>([]);
  const [selectedCallerId, setSelectedCallerId] = useState<string>("all");

  const [items, setItems] = useState<QueueLeadItem[]>([]);
  const [stats, setStats] = useState<CallerStats>({
    total_assigned: 0,
    total_completed: 0,
    total_interested: 0,
    total_contacted: 0,
    total_callbacks: 0,
    total_pending: 0,
    progress_percentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Generate Queue Modal State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [batchSize, setBatchSize] = useState(50);
  const [filterCity, setFilterCity] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [targetUserId, setTargetUserId] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [generateMessage, setGenerateMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Disposition Action States
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [activeNotes, setActiveNotes] = useState<Record<number, string>>({});

  // Role check: Only users with sales role or admin can operate
  const hasSalesRole = Boolean(
    user?.is_superadmin ||
    user?.is_main_admin ||
    user?.permissions?.includes("sales_calling") ||
    user?.permissions?.includes("all")
  );

  // Schedule Callback Modal State
  const [callbackItem, setCallbackItem] = useState<QueueLeadItem | null>(null);
  const [callbackDate, setCallbackDate] = useState("");
  const [callbackTime, setCallbackTime] = useState("");
  const [callbackNote, setCallbackNote] = useState("");
  const [savingCallback, setSavingCallback] = useState(false);

  // Fetch telecallers directory (for Admins to inspect other agents' queues)
  const fetchTelecallers = useCallback(async () => {
    try {
      const res = await authFetch(`${API}/api/v1/sales-calls/telecallers`);
      if (res.ok) {
        const data = await res.json();
        setTelecallers(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch telecallers:", err);
    }
  }, []);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchTelecallers();
    }
  }, [isSuperAdmin, fetchTelecallers]);

  // Fetch caller's queue (or team queue for admin)
  const fetchQueue = useCallback(async (pageNumber = 1, filter = statusFilter, callerId = selectedCallerId) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pageNumber),
        limit: "24",
        status: filter,
      });

      if (isSuperAdmin) {
        if (callerId && callerId !== "all") {
          params.append("caller_id", callerId);
        } else {
          params.append("caller_id", "all");
        }
      }

      const res = await authFetch(`${API}/api/v1/sales-calls/my-queue?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setTotalPages(data.pages || 1);
        setTotalItems(data.total || 0);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to fetch caller queue:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, selectedCallerId, isSuperAdmin]);

  useEffect(() => {
    fetchQueue(page, statusFilter, selectedCallerId);
  }, [fetchQueue, page, statusFilter, selectedCallerId]);

  // WebSocket Live Updates
  useEffect(() => {
    const handleWs = (e: any) => {
      const type = e.detail?.type;
      if (
        type === "call_queue_generated" ||
        type === "call_disposition_updated" ||
        type === "lead_updated" ||
        type === "queue_lead_removed" ||
        type === "caller_queue_bulk_dequeued" ||
        type === "caller_action_tracked"
      ) {
        fetchQueue(page, statusFilter, selectedCallerId);
        if (isSuperAdmin) {
          fetchTelecallers();
        }
      }
    };
    window.addEventListener("crm_ws_event", handleWs);
    return () => window.removeEventListener("crm_ws_event", handleWs);
  }, [fetchQueue, fetchTelecallers, page, statusFilter, selectedCallerId, isSuperAdmin]);

  // Bulk Dequeue All Leads from Caller (Admin only - Dequeues, does NOT delete)
  const [bulkDequeuing, setBulkDequeuing] = useState(false);
  const handleBulkDequeue = async (callerId: number, callerUsername: string) => {
    if (
      !window.confirm(
        `Are you sure you want to release ALL leads assigned to "${callerUsername}"?\n\n⚠️ IMPORTANT: These leads will be released back to the general pool for other telecallers to claim. The business leads will NOT be deleted.`
      )
    ) {
      return;
    }
    setBulkDequeuing(true);
    try {
      const res = await authFetch(`${API}/api/v1/sales-calls/bulk-dequeue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caller_id: callerId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message || `Successfully dequeued ${data.count} leads.`);
        fetchQueue(1, statusFilter, selectedCallerId);
        if (isSuperAdmin) fetchTelecallers();
      } else {
        alert(data.message || data.detail || "Failed to bulk dequeue leads.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to bulk dequeue caller leads.");
    } finally {
      setBulkDequeuing(false);
    }
  };

  // Track Call and WhatsApp button interactions (Telecaller audit & attempt count)
  const handleTrackAction = async (queueId: number, actionType: "call_clicked" | "whatsapp_clicked") => {
    // Optimistically increment call attempts locally on the card
    setItems((prev) =>
      prev.map((item) =>
        item.queue_id === queueId ? { ...item, call_attempts: (item.call_attempts || 0) + 1 } : item
      )
    );
    try {
      await authFetch(`${API}/api/v1/sales-calls/${queueId}/track-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action_type: actionType }),
      });
    } catch (err) {
      console.error("Failed to track button action:", err);
    }
  };

  // Remove Lead from Queue (Admin only)
  const handleRemoveLead = async (queueId: number, leadName: string) => {
    if (!window.confirm(`Are you sure you want to remove "${leadName}" from this caller's queue? The lead will be released back to the general pool.`)) {
      return;
    }
    setDeletingId(queueId);
    try {
      const res = await authFetch(`${API}/api/v1/sales-calls/queue/${queueId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems(prev => prev.filter(i => i.queue_id !== queueId));
        setTotalItems(prev => Math.max(0, prev - 1));
        setStats(prev => ({
          ...prev,
          total_assigned: Math.max(0, prev.total_assigned - 1),
          total_pending: Math.max(0, prev.total_pending - 1),
        }));
        if (isSuperAdmin) {
          fetchTelecallers();
        }
      } else {
        const err = await res.json();
        alert(err.detail || "Failed to remove lead from queue.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to remove lead from queue.");
    } finally {
      setDeletingId(null);
    }
  };

  // Open queue generation modal with auto-selected sales caller
  const openGenerateModal = () => {
    setGenerateMessage(null);
    if (isSuperAdmin) {
      const salesOnly = telecallers.filter((t) => t.is_sales_assigned);
      if (selectedCallerId !== "all" && salesOnly.some((t) => String(t.id) === selectedCallerId)) {
        setTargetUserId(selectedCallerId);
      } else if (salesOnly.length > 0) {
        setTargetUserId(String(salesOnly[0].id));
      } else {
        setTargetUserId("");
      }
    }
    setShowGenerateModal(true);
  };

  // Check if telecaller is blocked from generating due to pending leads
  const isGenerationBlocked = useMemo(() => {
    // If regular caller or admin generating for themselves, check pending count
    if (!isSuperAdmin) {
      return stats.total_pending > 0;
    }
    // If admin has selected a specific caller, check that caller's pending count
    if (selectedCallerId !== "all") {
      return stats.total_pending > 0;
    }
    return false;
  }, [isSuperAdmin, selectedCallerId, stats.total_pending]);

  // Generate new queue batch
  const handleGenerateQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSalesRole && !isSuperAdmin) {
      setGenerateMessage({
        text: "Access denied: Only sales persons assigned the Sales Caller role by Super Admin can create a call queue.",
        isError: true,
      });
      return;
    }

    if (isGenerationBlocked) {
      setGenerateMessage({
        text: `Cannot generate new queue: You have ${stats.total_pending} pending lead(s) in queue. You must complete or update all pending leads first.`,
        isError: true,
      });
      return;
    }

    setGenerating(true);
    setGenerateMessage(null);
    try {
      const payload: any = {
        batch_size: Number(batchSize),
        city: filterCity.trim() || undefined,
        category: filterCategory.trim() || undefined,
      };

      if (isSuperAdmin) {
        if (!targetUserId) {
          setGenerateMessage({
            text: "Please select an authorized sales caller from the list.",
            isError: true,
          });
          return;
        }
        payload.target_user_id = Number(targetUserId);
      }

      const res = await authFetch(`${API}/api/v1/sales-calls/generate-queue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGenerateMessage({ text: data.message || `Assigned ${data.count} leads to the queue!`, isError: false });
        setTimeout(() => {
          setShowGenerateModal(false);
          setGenerateMessage(null);
          setStatusFilter("pending");
          setPage(1);
          fetchQueue(1, "pending", selectedCallerId);
          if (isSuperAdmin) fetchTelecallers();
        }, 1200);
      } else {
        setGenerateMessage({
          text: data.message || data.detail || "Unable to claim new leads. Make sure all current leads have been updated.",
          isError: true,
        });
      }
    } catch (err: any) {
      setGenerateMessage({ text: err.message || "Failed to generate queue.", isError: true });
    } finally {
      setGenerating(false);
    }
  };

  // Submit Disposition
  const handleDisposition = async (
    queueId: number,
    disposition: "interested" | "contacted" | "callback" | "invalid",
    customNotes?: string,
    cbDatetime?: string
  ) => {
    setProcessingId(queueId);
    try {
      const noteToSend = customNotes ?? activeNotes[queueId] ?? "";
      const res = await authFetch(`${API}/api/v1/sales-calls/${queueId}/disposition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disposition,
          notes: noteToSend.trim() || undefined,
          callback_at: cbDatetime || undefined,
        }),
      });

      if (res.ok) {
        // Optimistically update or remove item if viewing a specific status tab
        if (statusFilter !== "all" && statusFilter !== disposition) {
          setItems(prev => prev.filter(i => i.queue_id !== queueId));
          setTotalItems(prev => Math.max(0, prev - 1));
        } else {
          setItems(prev => prev.map(i => i.queue_id === queueId ? { ...i, status: disposition } : i));
        }

        // Recalculate local stats
        setStats(prev => {
          const wasCompleted = prev.total_completed;
          const newCompleted = (disposition as string) !== "callback" ? wasCompleted + 1 : wasCompleted;
          const newInterested = disposition === "interested" ? prev.total_interested + 1 : prev.total_interested;
          const newContacted = disposition === "contacted" ? prev.total_contacted + 1 : prev.total_contacted;
          const newPending = Math.max(0, prev.total_pending - 1);
          const newCallbacks = disposition === "callback" ? prev.total_callbacks + 1 : prev.total_callbacks;
          const newProg = prev.total_assigned > 0 ? Math.round((newCompleted / prev.total_assigned) * 100) : 0;

          return {
            ...prev,
            total_completed: newCompleted,
            total_interested: newInterested,
            total_contacted: newContacted,
            total_pending: newPending,
            total_callbacks: newCallbacks,
            progress_percentage: newProg,
          };
        });

        if (isSuperAdmin) {
          fetchTelecallers();
        }
      }
    } catch (err) {
      console.error("Failed to update call disposition:", err);
    } finally {
      setProcessingId(null);
    }
  };

  // Save Callback Modal
  const handleSaveCallback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackItem) return;
    setSavingCallback(true);
    try {
      const isoDatetime = callbackDate ? new Date(`${callbackDate}T${callbackTime || "10:00"}:00`).toISOString() : undefined;
      await handleDisposition(callbackItem.queue_id, "callback", callbackNote, isoDatetime);
      setCallbackItem(null);
      setCallbackDate("");
      setCallbackTime("");
      setCallbackNote("");
    } finally {
      setSavingCallback(false);
    }
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    return items.filter((item) =>
      matchesSimilaritySearch(searchQuery, [
        item.lead?.bussiness_name,
        item.lead?.bussiness_number,
        item.lead?.bussiness_email,
        item.lead?.scraped_city,
        item.lead?.category,
        item.lead?.bussiness_address,
        item.assigned_to?.username,
        item.notes,
      ])
    );
  }, [items, searchQuery]);

  // Current view label
  const currentViewTitle = useMemo(() => {
    if (!isSuperAdmin) return `${callerName}’s Calling Desk`;
    if (selectedCallerId === "all") return "Team Overview (All Telecallers)";
    const found = telecallers.find(t => String(t.id) === selectedCallerId);
    return found ? `${found.username}’s Calling Desk` : "Telecaller Desk";
  }, [isSuperAdmin, selectedCallerId, callerName, telecallers]);

  return (
    <div className="space-y-5 animate-fadeIn pb-24">
      {/* Personalized Caller Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-4 sm:p-5 rounded-lg border border-slate-100 dark:border-slate-800/80 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-md flex items-center justify-center text-white shrink-0 font-bold" style={{ background: "var(--dash-primary)" }}>
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {currentViewTitle}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Live Desk
              </span>
              {stats.total_pending > 0 && !isSuperAdmin && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {stats.total_pending} Pending
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isSuperAdmin
                ? "Inspect any sales caller's queue, review progress, or audit live calling leads"
                : "Dedicated queue of uncalled leads assigned exclusively to you"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Generation Button with pending indicator */}
          <button
            onClick={openGenerateModal}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-bold transition shadow-xs cursor-pointer ${
              isGenerationBlocked
                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 hover:bg-amber-100"
                : "crm-btn-primary text-white"
            }`}
            title={isGenerationBlocked ? `Complete your ${stats.total_pending} pending leads before generating new leads` : "Claim fresh batch of leads"}
          >
            {isGenerationBlocked ? <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> : <PlusCircle className="w-4 h-4" />}
            <span>{isGenerationBlocked ? `Queue Locked (${stats.total_pending} Pending)` : "Generate Call Queue"}</span>
          </button>

          {isSuperAdmin && (
            <a
              href={`${ADMIN_PATH}/dashboard/sales-calls/reports`}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 rounded-md text-xs font-semibold transition"
            >
              <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
              <span>Executive Reports →</span>
            </a>
          )}
        </div>
      </header>

      {/* Admin Telecaller Switcher Bar - Production-Ready Redesign */}
      {isSuperAdmin && (
        <div className="bg-white dark:bg-[#0f172a] p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Title & All Callers quick toggle */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                  Telecaller Desk Queue
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Select a sales agent to inspect their active calls & leads
                </span>
              </div>
            </div>

            {/* Quick Segmented Switcher & Combobox */}
            <div className="flex flex-wrap items-center gap-2.5 flex-1 lg:justify-end">
              {/* All Telecallers Team Button */}
              <button
                onClick={() => setSelectedCallerId("all")}
                className={`text-xs font-bold px-3.5 py-2 rounded-lg border transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  selectedCallerId === "all"
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm ring-2 ring-slate-900/10 dark:ring-white/20"
                    : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>👥 All Telecallers</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  selectedCallerId === "all"
                    ? "bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900"
                    : "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300"
                }`}>
                  Team Queue
                </span>
              </button>

              {/* Dedicated Caller Dropdown Selector */}
              <div className="relative min-w-[260px] sm:min-w-[320px] max-w-full">
                <select
                  value={selectedCallerId}
                  onChange={(e) => setSelectedCallerId(e.target.value)}
                  className="w-full text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer appearance-none pr-8"
                >
                  <option value="all">-- Select Individual Telecaller --</option>
                  {telecallers.map((t) => (
                    <option key={t.id} value={String(t.id)}>
                      {t.username} • {t.total_pending} pending / {t.total_assigned} assigned ({t.progress_percentage}% completed)
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Bulk Dequeue button for selected caller */}
              {selectedCallerId !== "all" && (() => {
                const currentCaller = telecallers.find(t => String(t.id) === selectedCallerId);
                if (!currentCaller || currentCaller.total_assigned === 0) return null;
                return (
                  <button
                    onClick={() => handleBulkDequeue(currentCaller.id, currentCaller.username)}
                    disabled={bulkDequeuing}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/70 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition cursor-pointer disabled:opacity-50 shrink-0"
                    title="Release all assigned leads back to the general pool (leads are dequeued, NOT deleted)"
                  >
                    {bulkDequeuing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    <span>Bulk Dequeue All ({currentCaller.total_assigned})</span>
                  </button>
                );
              })()}
            </div>
          </div>

          {/* Active Caller Details Bar when specific caller is selected */}
          {selectedCallerId !== "all" && (() => {
            const activeCaller = telecallers.find(t => String(t.id) === selectedCallerId);
            if (!activeCaller) return null;
            return (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[11px] shadow-sm">
                    {activeCaller.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {activeCaller.username}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {activeCaller.job_title || "Sales Executive"}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200/60 dark:border-amber-800/50">
                    {activeCaller.total_pending} Pending Calls
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/50">
                    {activeCaller.total_interested} Interested Leads
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {activeCaller.progress_percentage}% Done
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Real-time KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white dark:bg-[#0f172a] p-3.5 sm:p-4 rounded-lg border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Assigned</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{stats.total_assigned}</span>
            <span className="text-xs text-indigo-500 font-semibold font-mono">Leads</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] p-3.5 sm:p-4 rounded-lg border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] sm:text-[11px] font-bold text-amber-500 uppercase tracking-wider">Pending (To Call)</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">{stats.total_pending}</span>
            <span className="text-xs text-slate-400 font-medium">To Dial</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] p-3.5 sm:p-4 rounded-lg border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Interested (Hot)</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.total_interested}</span>
            <span className="text-xs text-emerald-500 font-semibold font-mono">Converted</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] p-3.5 sm:p-4 rounded-lg border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] sm:text-[11px] font-bold text-blue-600 uppercase tracking-wider">Contacted</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">{stats.total_contacted}</span>
            <span className="text-xs text-slate-400 font-medium">Done</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] p-3.5 sm:p-4 rounded-lg border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
          <span className="text-[10px] sm:text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Shift Progress</span>
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white mb-1">
              <span>{stats.progress_percentage}%</span>
              <span className="text-[10px] text-slate-400">{stats.total_completed}/{stats.total_assigned}</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, stats.progress_percentage)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0f172a] p-3.5 rounded-lg border border-slate-100 dark:border-slate-800/80 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { key: "pending", label: "Pending (To Call)", count: stats.total_pending, color: "amber" },
            { key: "interested", label: "Interested", count: stats.total_interested, color: "emerald" },
            { key: "contacted", label: "Contacted", count: stats.total_contacted, color: "blue" },
            { key: "callback", label: "Callbacks", count: stats.total_callbacks, color: "purple" },
            { key: "all", label: "All in Queue", count: stats.total_assigned, color: "slate" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setStatusFilter(tab.key);
                setPage(1);
              }}
              className={`text-xs font-semibold px-3 py-1.5 rounded-md border transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === tab.key
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20"
                  : "bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200/70 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                statusFilter === tab.key
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search phone, name, city, caller..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-md pl-8 pr-7 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Calling Queue Card List */}
      {loading && items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white dark:bg-[#0f172a] rounded-lg border border-slate-100 dark:border-slate-800/60 shadow-sm">
          <Loader2 className="w-7 h-7 animate-spin mb-3 text-indigo-500" />
          <p className="text-xs font-semibold">Loading calling queue...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-[#0f172a] rounded-lg border border-slate-100 dark:border-slate-800/80 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-500 mb-3.5">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {isSuperAdmin && selectedCallerId !== "all"
              ? "No Leads in this Filter for this Caller"
              : isSuperAdmin
              ? "No Leads in Current Queue Filter"
              : "Your Call Queue is Clear!"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5">
            {isSuperAdmin
              ? "You can switch to another telecaller from the tabs above or generate a fresh queue batch."
              : "You have completed all pending leads in this filter. Click below to generate an exclusive new batch."}
          </p>
          <button
            onClick={openGenerateModal}
            disabled={isGenerationBlocked}
            className={`px-4 py-2 rounded-md text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer ${
              isGenerationBlocked
                ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Generate New Call Queue</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => {
              if (!item) return null;
              const lead = item.lead || ({} as any);
              const formattedPhone = lead?.bussiness_number ? format10DigitPhone(lead.bussiness_number) : "";
              const dialerUrl = lead?.bussiness_number ? formatDialerUrl(lead.bussiness_number) : "#";
              const isItemProcessing = processingId === item.queue_id;
              const callerBadgeName = item.assigned_to?.username || "Sales Caller";

              return (
                <div
                  key={item.queue_id}
                  className="bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-slate-800/80 rounded-lg p-4 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all group"
                >
                  {/* Top Card Info */}
                  <div>
                    {/* Caller Marker / Badge */}
                    <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900/60 rounded-md border border-slate-100 dark:border-slate-800 mb-2.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-[9px] flex items-center justify-center shrink-0">
                          {(callerBadgeName || "S").charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {item.status === "pending" ? "Assigned:" : "Contacted by:"}{" "}
                          <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{callerBadgeName}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-medium text-slate-400">
                          {item.call_attempts > 0 ? `${item.call_attempts} call${item.call_attempts > 1 ? "s" : ""}` : "Not called"}
                        </span>
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleRemoveLead(item.queue_id, lead?.bussiness_name || "Lead")}
                            disabled={deletingId === item.queue_id}
                            className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded transition cursor-pointer"
                            title="Admin: Remove lead from caller queue"
                          >
                            {deletingId === item.queue_id ? (
                              <Loader2 className="w-3 h-3 animate-spin text-rose-500" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-2.5 mb-2">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/50 mt-0.5">
                          <Building className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3
                            className="text-sm font-bold text-slate-900 dark:text-white truncate"
                            title={lead?.bussiness_name || "Unknown Business"}
                          >
                            {lead?.bussiness_name || "Unknown Business"}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            {item.is_phone_masked ? (
                              <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                <ShieldAlert className="w-3 h-3 text-amber-500" />
                                <span>{lead?.bussiness_number || "+91 ••••• •••••"}</span>
                                <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1 py-0.2 rounded border border-amber-200 dark:border-amber-800">
                                  Protected
                                </span>
                              </span>
                            ) : (
                              <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">
                                {formattedPhone ? `+${formattedPhone}` : "No Number"}
                              </span>
                            )}
                            {lead?.scraped_city && (
                              <span className="text-[10px] text-slate-400 flex items-center gap-0.5 truncate">
                                <MapPin className="w-2.5 h-2.5" /> {lead.scraped_city}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          item.status === "interested"
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : item.status === "contacted"
                            ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                            : item.status === "callback"
                            ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
                            : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-1.5 my-2">
                      {lead?.category && (
                        <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 rounded border border-slate-100 dark:border-slate-800">
                          {lead.category}
                        </span>
                      )}
                      {lead?.rating && lead.rating !== "0" && (
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/30 rounded border border-amber-100 dark:border-amber-900/40">
                          <Star className="w-2.5 h-2.5 fill-current" /> {lead.rating}
                          <span className="text-slate-400">({lead?.total_review || 0})</span>
                        </span>
                      )}
                      {lead?.bussiness_website && (
                        <a
                          href={formatWebsiteUrl(lead.bussiness_website) || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1"
                        >
                          <ExternalLink className="w-2.5 h-2.5" /> Website
                        </a>
                      )}
                    </div>

                    {lead?.bussiness_address && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2.5">
                        {lead.bussiness_address}
                      </p>
                    )}

                    {/* Quick Call Notes input */}
                    <div className="mt-1.5 mb-2.5">
                      <input
                        type="text"
                        placeholder="Add call notes / takeaway..."
                        value={activeNotes[item.queue_id] ?? item.notes ?? ""}
                        onChange={(e) => setActiveNotes(prev => ({ ...prev, [item.queue_id]: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                    {/* Primary Dialer & WhatsApp buttons with click tracking */}
                    <div className="flex gap-2">
                      <a
                        href={item.dialer_phone ? `tel:${item.dialer_phone}` : dialerUrl}
                        onClick={() => handleTrackAction(item.queue_id, "call_clicked")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-md text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition shadow-sm cursor-pointer"
                        title="Click to dial customer via device phone dialer"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call Now
                      </a>
                      <a
                        href={
                          item.dialer_phone
                            ? `https://wa.me/${item.dialer_phone.replace(/^\+/, "")}`
                            : `https://wa.me/${formattedPhone}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => handleTrackAction(item.queue_id, "whatsapp_clicked")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-md text-xs font-bold transition shadow-sm cursor-pointer"
                        title="Open WhatsApp chat with lead"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                    </div>

                    {/* Disposition Buttons */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => handleDisposition(item.queue_id, "interested")}
                        disabled={isItemProcessing}
                        className="py-1.5 px-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 rounded text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Mark as Interested Hot Lead"
                      >
                        {isItemProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />}
                        Interested
                      </button>

                      <button
                        onClick={() => handleDisposition(item.queue_id, "contacted")}
                        disabled={isItemProcessing}
                        className="py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Mark as Contacted (Not Interested / Done)"
                      >
                        {isItemProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                        Contacted
                      </button>

                      <button
                        onClick={() => {
                          setCallbackItem(item);
                          setCallbackNote(activeNotes[item.queue_id] || item.notes || "");
                        }}
                        disabled={isItemProcessing}
                        className="py-1.5 px-2 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60 rounded text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Schedule Follow-up Callback"
                      >
                        <Clock className="w-3 h-3" />
                        Callback
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 pb-2">
              <span className="text-xs text-slate-500">
                Showing {filteredItems.length} of {totalItems} leads in queue
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                  className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Generate Queue Modal ── */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Generate Call Queue</h3>
              </div>
              <button
                onClick={() => {
                  setShowGenerateModal(false);
                  setGenerateMessage(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Business Rule Warning when pending leads exist */}
            {isGenerationBlocked ? (
              <div className="p-3.5 rounded-md bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-200">
                  <Lock className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>Queue Generation Blocked</span>
                </div>
                <p className="leading-relaxed">
                  You currently have <strong>{stats.total_pending} pending lead(s)</strong> waiting to be called.
                  You must call and update the status for all current leads (mark as <em>Interested</em>, <em>Contacted</em>, <em>Callback</em>, or <em>Invalid</em>) before claiming fresh leads.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 leading-relaxed">
                Claims an exclusive batch of uncalled leads. Zero duplication guarantee: no two callers will ever be assigned the same lead.
              </p>
            )}

            {generateMessage && (
              <div className={`p-3 rounded-md text-xs font-semibold flex items-center gap-2 ${
                generateMessage.isError
                  ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
              }`}>
                {generateMessage.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                <span>{generateMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleGenerateQueue} className="space-y-3.5">
              {/* Admin target caller select */}
              {isSuperAdmin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assign Leads To Sales Caller:
                  </label>
                  {telecallers.filter((t) => t.is_sales_assigned).length === 0 ? (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-md text-xs text-amber-800 dark:text-amber-300">
                      No designated Sales Callers found. Please go to <strong>Security Settings</strong> and grant the <strong>Sales Caller</strong> role to a team member first.
                    </div>
                  ) : (
                    <select
                      value={targetUserId}
                      onChange={(e) => setTargetUserId(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                    >
                      <option value="" disabled>-- Select Authorized Sales Caller --</option>
                      {telecallers
                        .filter((t) => t.is_sales_assigned)
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.username} ({t.total_pending} pending / {t.total_assigned} total)
                          </option>
                        ))}
                    </select>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">
                    Admins and Super Admins manage and audit queues. Call batches can only be held by authorized Sales Callers.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Queue Batch Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[25, 50, 100].map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setBatchSize(size)}
                      className={`py-2 text-xs font-bold rounded-md border transition cursor-pointer ${
                        batchSize === size
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {size} Leads
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target City (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Surat, Ahmedabad, Mumbai..."
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category / Industry (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Real Estate, Software, Healthcare..."
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating || isGenerationBlocked}
                  className={`px-4 py-2 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md ${
                    isGenerationBlocked
                      ? "bg-slate-300 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30"
                  }`}
                >
                  {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{generating ? "Claiming Leads..." : "Claim Batch"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Schedule Callback Modal ── */}
      {callbackItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Schedule Callback</h3>
              </div>
              <button
                onClick={() => setCallbackItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-md bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-xs text-purple-900 dark:text-purple-300">
              Scheduling follow-up for <strong>{callbackItem.lead.bussiness_name}</strong> ({callbackItem.lead.bussiness_number})
            </div>

            <form onSubmit={handleSaveCallback} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Callback Date
                  </label>
                  <input
                    type="date"
                    required
                    value={callbackDate}
                    onChange={(e) => setCallbackDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Callback Time
                  </label>
                  <input
                    type="time"
                    value={callbackTime}
                    onChange={(e) => setCallbackTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Follow-up Notes / Reason
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Decision maker was in meeting, asked to call back tomorrow at 2 PM..."
                  value={callbackNote}
                  onChange={(e) => setCallbackNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCallbackItem(null)}
                  className="px-4 py-2 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCallback}
                  className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {savingCallback ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
                  <span>Save Reminder</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
