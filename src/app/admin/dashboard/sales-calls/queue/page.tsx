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
  ArrowRight
} from "lucide-react";
import { format10DigitPhone, formatDialerUrl, formatWebsiteUrl, matchesSimilaritySearch } from "@/lib/formatters";
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

export default function SalesCallingDeskPage() {
  const { user } = useAuthStore();
  const isSuperAdmin = Boolean(user?.is_superadmin || user?.is_main_admin);
  const callerName = user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : "Telecaller";

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
  const [generating, setGenerating] = useState(false);
  const [generateMessage, setGenerateMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Disposition Action States
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [activeNotes, setActiveNotes] = useState<Record<number, string>>({});

  // Schedule Callback Modal State
  const [callbackItem, setCallbackItem] = useState<QueueLeadItem | null>(null);
  const [callbackDate, setCallbackDate] = useState("");
  const [callbackTime, setCallbackTime] = useState("");
  const [callbackNote, setCallbackNote] = useState("");
  const [savingCallback, setSavingCallback] = useState(false);

  // Fetch caller's queue
  const fetchQueue = useCallback(async (pageNumber = 1, filter = statusFilter) => {
    setLoading(true);
    try {
      const res = await authFetch(
        `${API}/api/v1/sales-calls/my-queue?page=${pageNumber}&limit=24&status=${filter}`
      );
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
  }, [statusFilter]);

  useEffect(() => {
    fetchQueue(page, statusFilter);
  }, [fetchQueue, page, statusFilter]);

  // WebSocket Live Updates
  useEffect(() => {
    const handleWs = (e: any) => {
      const type = e.detail?.type;
      if (type === "call_queue_generated" || type === "call_disposition_updated" || type === "lead_updated") {
        fetchQueue(page, statusFilter);
      }
    };
    window.addEventListener("crm_ws_event", handleWs);
    return () => window.removeEventListener("crm_ws_event", handleWs);
  }, [fetchQueue, page, statusFilter]);

  // Generate new queue batch
  const handleGenerateQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setGenerateMessage(null);
    try {
      const res = await authFetch(`${API}/api/v1/sales-calls/generate-queue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch_size: Number(batchSize),
          city: filterCity.trim() || undefined,
          category: filterCategory.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGenerateMessage({ text: data.message || `Assigned ${data.count} leads to your queue!`, isError: false });
        setTimeout(() => {
          setShowGenerateModal(false);
          setGenerateMessage(null);
          setStatusFilter("pending");
          setPage(1);
          fetchQueue(1, "pending");
        }, 1200);
      } else {
        setGenerateMessage({ text: data.message || data.detail || "No unassigned leads found.", isError: true });
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
        item.notes,
      ])
    );
  }, [items, searchQuery]);

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      {/* Personalized Caller Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-5 rounded-lg border border-slate-100 dark:border-slate-800/60 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {callerName}&rsquo;s Calling Desk
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Active Desk
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Dedicated queue of uncalled leads assigned exclusively to you
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold transition shadow-sm shadow-indigo-600/30 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Generate Call Queue</span>
          </button>
          {isSuperAdmin && (
            <a
              href={`${ADMIN_PATH}/dashboard/sales-calls/reports`}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/60 rounded-md text-xs font-semibold transition"
            >
              <span>Team Reports →</span>
            </a>
          )}
        </div>
      </header>

      {/* Real-time KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white dark:bg-[#0f172a] p-4 rounded-lg border border-slate-100 dark:border-slate-800/60 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Assigned</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.total_assigned}</span>
            <span className="text-xs text-indigo-500 font-semibold font-mono">Leads</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] p-4 rounded-lg border border-slate-100 dark:border-slate-800/60 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">Pending Call</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.total_pending}</span>
            <span className="text-xs text-slate-400 font-medium">To Dial</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] p-4 rounded-lg border border-slate-100 dark:border-slate-800/60 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Interested (Hot)</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.total_interested}</span>
            <span className="text-xs text-emerald-500 font-semibold font-mono">Converted</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] p-4 rounded-lg border border-slate-100 dark:border-slate-800/60 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Contacted</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{stats.total_contacted}</span>
            <span className="text-xs text-slate-400 font-medium">Done</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] p-4 rounded-lg border border-slate-100 dark:border-slate-800/60 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Shift Progress</span>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0f172a] p-3.5 rounded-lg border border-slate-100 dark:border-slate-800/60 shadow-sm">
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
            placeholder="Search phone, name, city..."
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
          <p className="text-xs font-semibold">Loading your calling queue...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-[#0f172a] rounded-lg border border-slate-100 dark:border-slate-800/60 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-500 mb-3.5">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Your Call Queue is Empty!</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5">
            You don&rsquo;t have any pending leads in this filter. Click below to generate an exclusive new batch of fresh leads.
          </p>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold transition shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Generate New Call Queue</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const lead = item.lead;
              const formattedPhone = lead.bussiness_number ? format10DigitPhone(lead.bussiness_number) : "";
              const dialerUrl = formatDialerUrl(lead.bussiness_number);
              const isItemProcessing = processingId === item.queue_id;

              return (
                <div
                  key={item.queue_id}
                  className="bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-slate-800/60 rounded-lg p-5 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-indigo-500/20 dark:hover:border-indigo-500/30 transition-all group"
                >
                  {/* Top Card Info */}
                  <div>
                    <div className="flex items-start justify-between gap-2.5 mb-2.5">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/40 mt-0.5">
                          <Building className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3
                            className="text-sm font-bold text-slate-900 dark:text-white truncate"
                            title={lead.bussiness_name || "Unknown Business"}
                          >
                            {lead.bussiness_name || "Unknown Business"}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">
                              {formattedPhone ? `+${formattedPhone}` : "No Number"}
                            </span>
                            {lead.scraped_city && (
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
                    <div className="flex flex-wrap items-center gap-1.5 my-2.5">
                      {lead.category && (
                        <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 rounded border border-slate-100 dark:border-slate-800">
                          {lead.category}
                        </span>
                      )}
                      {lead.rating && lead.rating !== "0" && (
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/30 rounded border border-amber-100 dark:border-amber-900/40">
                          <Star className="w-2.5 h-2.5 fill-current" /> {lead.rating}
                          <span className="text-slate-400">({lead.total_review || 0})</span>
                        </span>
                      )}
                      {lead.bussiness_website && (
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

                    {lead.bussiness_address && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                        {lead.bussiness_address}
                      </p>
                    )}

                    {/* Quick Call Notes input */}
                    <div className="mt-2 mb-3">
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
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 space-y-2">
                    {/* Primary Dialer & WhatsApp buttons */}
                    <div className="flex gap-2">
                      <a
                        href={dialerUrl}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-md text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call Now
                      </a>
                      <a
                        href={`https://wa.me/${formattedPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-md text-xs font-bold transition shadow-sm"
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
            <div className="flex items-center justify-between pt-4 pb-2">
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
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

            <p className="text-xs text-slate-500 leading-relaxed">
              Atomically claims an exclusive batch of uncalled leads for <strong>{callerName}</strong>. Zero duplication guarantee: no two callers will ever be assigned the same lead.
            </p>

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
                  disabled={generating}
                  className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
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
