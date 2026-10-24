"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuthStore } from "@/lib/authStore";
import { authFetch, API } from "@/lib/authFetch";
import {
  BarChart3,
  Users,
  PhoneCall,
  Star,
  CheckCircle2,
  Clock,
  Download,
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Loader2,
  Phone,
  Building,
  MapPin,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  CalendarDays,
  MessageSquare,
  MousePointerClick,
  PhoneForwarded,
  Bot,
  UserCheck
} from "lucide-react";
import { format10DigitPhone, formatISTDateTime, formatRelativeTime } from "@/lib/formatters";
import { ADMIN_PATH } from "@/lib/config";

interface SummaryStats {
  total_leads_assigned: number;
  total_calls_logged: number;
  total_interested: number;
  total_contacted: number;
  total_callbacks: number;
  total_invalid: number;
  total_pending_leads: number;
  conversion_rate: number;
  total_call_clicks?: number;
  total_whatsapp_clicks?: number;
}

interface LeaderboardEntry {
  user_id: number;
  username: string;
  job_title: string;
  assigned_count: number;
  completed_count: number;
  calls_count: number;
  interested_count: number;
  contacted_count: number;
  callback_count: number;
  invalid_count: number;
  pending_count: number;
  conversion_rate: number;
  progress_percentage: number;
  last_active_at: string | null;
}

interface DailyBreakdownItem {
  date: string;
  caller_id: number;
  caller_name: string;
  job_title: string;
  calls_count: number;
  interested_count: number;
  contacted_count: number;
  callback_count: number;
  invalid_count: number;
  total_duration_minutes: number;
}

interface CallAuditLog {
  id: number;
  called_at: string;
  disposition: string;
  notes: string | null;
  callback_at: string | null;
  duration_seconds: number;
  source?: string;
  actor_name?: string;
  is_bot?: boolean;
  caller: {
    id: number | null;
    username: string;
    job_title: string;
  };
  lead: {
    id: number;
    bussiness_name: string;
    bussiness_number: string;
    scraped_city: string;
    category: string;
  };
}

interface CallerActionAuditLog {
  id: number;
  queue_item_id: number;
  lead_id: number;
  caller_user_id: number;
  action_type: string;
  notes: string | null;
  created_at: string;
  caller: {
    id: number;
    username: string;
    job_title: string;
  };
  lead: {
    id: number;
    bussiness_name: string;
    bussiness_number: string;
    scraped_city: string;
    category: string;
  };
}

export default function CallingReportsDashboard() {
  const { user } = useAuthStore();
  const isSuperAdmin = Boolean(user?.is_superadmin || user?.is_main_admin);

  const [datePreset, setDatePreset] = useState<"today" | "yesterday" | "7d" | "30d" | "all">("all");
  const [selectedCallerId, setSelectedCallerId] = useState<string>("all");

  const [summary, setSummary] = useState<SummaryStats>({
    total_leads_assigned: 0,
    total_calls_logged: 0,
    total_interested: 0,
    total_contacted: 0,
    total_callbacks: 0,
    total_invalid: 0,
    total_pending_leads: 0,
    conversion_rate: 0,
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [dailyBreakdown, setDailyBreakdown] = useState<DailyBreakdownItem[]>([]);
  const [logs, setLogs] = useState<CallAuditLog[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [logPage, setLogPage] = useState(1);
  const [totalLogPages, setTotalLogPages] = useState(1);
  const [logSearch, setLogSearch] = useState("");
  const [logDispositionFilter, setLogDispositionFilter] = useState("all");
  const [logActorFilter, setLogActorFilter] = useState<"all" | "team" | "whatsapp_bot">("all");

  const [interactionLogs, setInteractionLogs] = useState<CallerActionAuditLog[]>([]);
  const [totalInteractions, setTotalInteractions] = useState(0);
  const [interactionPage, setInteractionPage] = useState(1);
  const [totalInteractionPages, setTotalInteractionPages] = useState(1);
  const [interactionTypeFilter, setInteractionTypeFilter] = useState("all");
  const [interactionLoading, setInteractionLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Compute ISO dates based on preset
  const { dateFrom, dateTo } = useMemo(() => {
    const now = new Date();
    if (datePreset === "today") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { dateFrom: start.toISOString(), dateTo: undefined };
    }
    if (datePreset === "yesterday") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, -1);
      return { dateFrom: start.toISOString(), dateTo: end.toISOString() };
    }
    if (datePreset === "7d") {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { dateFrom: start.toISOString(), dateTo: undefined };
    }
    if (datePreset === "30d") {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { dateFrom: start.toISOString(), dateTo: undefined };
    }
    return { dateFrom: undefined, dateTo: undefined };
  }, [datePreset]);

  // Fetch summary, leaderboard, and daily breakdown
  const fetchSummary = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append("date_from", dateFrom);
      if (dateTo) params.append("date_to", dateTo);
      if (selectedCallerId !== "all") params.append("caller_id", selectedCallerId);

      const res = await authFetch(`${API}/api/v1/sales-calls/reports/summary?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary || {});
        setLeaderboard(data.leaderboard || []);
        setDailyBreakdown(data.daily_breakdown || []);
      }
    } catch (err) {
      console.error("Failed to load reports summary:", err);
    }
  }, [dateFrom, dateTo, selectedCallerId]);

  // Fetch audit logs
  const fetchLogs = useCallback(async (pageNumber = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pageNumber),
        limit: "25",
      });
      if (dateFrom) params.append("date_from", dateFrom);
      if (dateTo) params.append("date_to", dateTo);
      if (selectedCallerId !== "all") params.append("caller_id", selectedCallerId);
      if (logDispositionFilter !== "all") params.append("disposition", logDispositionFilter);
      if (logActorFilter !== "all") params.append("actor_filter", logActorFilter);
      if (logSearch.trim()) params.append("search", logSearch.trim());

      const res = await authFetch(`${API}/api/v1/sales-calls/reports/logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotalLogs(data.total || 0);
        setTotalLogPages(data.pages || 1);
      }
    } catch (err) {
      console.error("Failed to load call logs:", err);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, selectedCallerId, logDispositionFilter, logActorFilter, logSearch]);

  // Fetch telecaller button interaction logs (Call / WhatsApp clicks audit)
  const fetchInteractions = useCallback(async (pageNumber = 1) => {
    setInteractionLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pageNumber),
        limit: "25",
      });
      if (dateFrom) params.append("date_from", dateFrom);
      if (dateTo) params.append("date_to", dateTo);
      if (selectedCallerId !== "all") params.append("caller_id", selectedCallerId);
      if (interactionTypeFilter !== "all") params.append("action_type", interactionTypeFilter);

      const res = await authFetch(`${API}/api/v1/sales-calls/reports/interactions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setInteractionLogs(data.logs || []);
        setTotalInteractions(data.total || 0);
        setTotalInteractionPages(data.pages || 1);
      }
    } catch (err) {
      console.error("Failed to load interaction logs:", err);
    } finally {
      setInteractionLoading(false);
    }
  }, [dateFrom, dateTo, selectedCallerId, interactionTypeFilter]);

  useEffect(() => {
    fetchSummary();
    fetchLogs(logPage);
    fetchInteractions(interactionPage);
  }, [fetchSummary, fetchLogs, fetchInteractions, logPage, interactionPage]);

  // WebSocket Live Updates
  useEffect(() => {
    const handleWs = (e: any) => {
      const type = e.detail?.type;
      if (
        type === "caller_action_tracked" ||
        type === "call_disposition_updated" ||
        type === "call_queue_generated" ||
        type === "caller_queue_bulk_dequeued"
      ) {
        fetchSummary();
        fetchLogs(logPage);
        fetchInteractions(interactionPage);
      }
    };
    window.addEventListener("crm_ws_event", handleWs);
    return () => window.removeEventListener("crm_ws_event", handleWs);
  }, [fetchSummary, fetchLogs, fetchInteractions, logPage, interactionPage]);

  // Handle CSV Export
  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append("date_from", dateFrom);
      if (dateTo) params.append("date_to", dateTo);
      if (selectedCallerId !== "all") params.append("caller_id", selectedCallerId);

      const res = await authFetch(`${API}/api/v1/sales-calls/reports/export?${params.toString()}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `calling_report_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Failed to export calling report:", err);
    } finally {
      setExporting(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center p-6 bg-white dark:bg-[#0f172a] rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Access Denied</h2>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Only Super Admins and Main Admins are authorized to view team calling performance reports.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      {/* Executive Header */}
      <header className="crm-card p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-[var(--dash-btn-radius)] flex items-center justify-center text-white shrink-0 font-bold" style={{ background: "var(--dash-primary)" }}>
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: "var(--dash-text)" }}>
                Telecalling Executive Reports
              </h1>
              <span className="crm-badge badge-violet text-[10px] font-bold">
                Management Analytics
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "var(--dash-text-muted)" }}>
              Live team calling productivity, conversion rates, daily agent breakdowns, and audit trails
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Back to Live Queue Button */}
          <a
            href={`${ADMIN_PATH}/dashboard/sales-calls/queue`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-[var(--dash-btn-radius)] border border-[var(--dash-border)] bg-[var(--dash-surface-alt)] text-[var(--dash-text)] hover:border-[var(--dash-primary)] text-xs font-semibold transition"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[var(--dash-primary)]" />
            <span>← Live Calling Desk</span>
          </a>

          {/* Export CSV button */}
          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-2 crm-btn-primary text-white text-xs font-bold transition cursor-pointer disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>Export CSV</span>
          </button>
        </div>
      </header>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0f172a] p-3.5 rounded-lg border border-slate-100 dark:border-slate-800/80 shadow-sm">
        {/* Date presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:inline" />
          {[
            { key: "today", label: "Today" },
            { key: "yesterday", label: "Yesterday" },
            { key: "7d", label: "Last 7 Days" },
            { key: "30d", label: "Last 30 Days" },
            { key: "all", label: "All Time" },
          ].map(p => (
            <button
              key={p.key}
              onClick={() => setDatePreset(p.key as any)}
              className={`text-xs font-semibold px-2.5 py-1 rounded-md border transition cursor-pointer ${
                datePreset === p.key
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Telecaller filter */}
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedCallerId}
            onChange={(e) => setSelectedCallerId(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Telecallers</option>
            {leaderboard.map(agent => (
              <option key={agent.user_id} value={agent.user_id}>
                {agent.username} ({agent.calls_count} calls)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-lg border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Calls Logged</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{summary.total_calls_logged}</span>
            <span className="text-[10px] text-indigo-500 font-semibold font-mono">Dials</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-lg border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Call Clicks</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">{summary.total_call_clicks ?? 0}</span>
            <span className="text-[10px] text-slate-400 font-medium">Clicks</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-lg border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[#25D366] uppercase tracking-wider">WA Clicks</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-[#25D366]">{summary.total_whatsapp_clicks ?? 0}</span>
            <span className="text-[10px] text-slate-400 font-medium">Chats</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-lg border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Interested</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">{summary.total_interested}</span>
            <span className="text-[10px] text-emerald-500 font-semibold font-mono">Won</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-lg border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Conv. Rate</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">{summary.conversion_rate}%</span>
            <span className="text-[10px] text-slate-400 font-medium">Interest</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-lg border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Contacted</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">{summary.total_contacted}</span>
            <span className="text-[10px] text-slate-400 font-medium">Leads</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] p-3.5 rounded-lg border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Callbacks</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">{summary.total_callbacks}</span>
            <span className="text-[10px] text-slate-400 font-medium">Scheduled</span>
          </div>
        </div>

        <div className="crm-card p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Pending</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-amber-500">{summary.total_pending_leads}</span>
            <span className="text-[10px] text-zinc-400 font-medium">To Call</span>
          </div>
        </div>
      </div>

      {/* Telecaller Performance Leaderboard */}
      <div className="crm-card overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Caller Performance Leaderboard</h2>
          </div>
          <span className="text-xs text-zinc-400 font-medium">{leaderboard.length} Active Agents</span>
        </div>

        {leaderboard.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No telecallers have been assigned queue leads yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Telecaller / Agent</th>
                  <th className="py-3 px-4 text-center">Assigned</th>
                  <th className="py-3 px-4 text-center">Completed Calls</th>
                  <th className="py-3 px-4 text-center">Interested (Hot)</th>
                  <th className="py-3 px-4 text-center">Conversion Rate</th>
                  <th className="py-3 px-4 text-center">Callbacks</th>
                  <th className="py-3 px-4 text-center">Pending</th>
                  <th className="py-3 px-4">Shift Progress</th>
                  <th className="py-3 px-4 text-right">Last Call</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {leaderboard.map((agent) => (
                  <tr key={agent.user_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {agent.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div>{agent.username}</div>
                        <div className="text-[10px] font-normal text-slate-400">{agent.job_title || "Sales Caller"}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                      {agent.assigned_count}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-blue-600 dark:text-blue-400">
                      {agent.completed_count}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                        <Star className="w-3 h-3 fill-emerald-500" />
                        {agent.interested_count}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-black text-emerald-600 dark:text-emerald-400">
                      {agent.conversion_rate}%
                    </td>
                    <td className="py-3.5 px-4 text-center text-purple-600 dark:text-purple-400 font-bold">
                      {agent.callback_count}
                    </td>
                    <td className="py-3.5 px-4 text-center text-amber-600 dark:text-amber-400 font-bold">
                      {agent.pending_count}
                    </td>
                    <td className="py-3.5 px-4 min-w-[120px]">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                        <span>{agent.progress_percentage}%</span>
                        <span>{agent.completed_count}/{agent.assigned_count}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
                          style={{ width: `${Math.min(100, agent.progress_percentage)}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right text-[11px] font-mono text-slate-400">
                      {agent.last_active_at ? formatISTDateTime(agent.last_active_at) : "Never"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Daily Call Activity Breakdown (Minimal Details per Caller per Day) */}
      <div className="crm-card overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Daily Calling Activity Breakdown</h2>
          </div>
          <span className="text-xs text-zinc-400 font-medium">{dailyBreakdown.length} Daily Records</span>
        </div>

        {dailyBreakdown.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No daily call activity records found for this period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Sales Caller</th>
                  <th className="py-3 px-4 text-center">Total Calls Done</th>
                  <th className="py-3 px-4 text-center">Interested (Hot)</th>
                  <th className="py-3 px-4 text-center">Contacted</th>
                  <th className="py-3 px-4 text-center">Callbacks</th>
                  <th className="py-3 px-4 text-center">Invalid</th>
                  <th className="py-3 px-4 text-center">Talk Time</th>
                  <th className="py-3 px-4 text-right">Daily Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {dailyBreakdown.map((row, idx) => {
                  const conv = row.calls_count > 0 ? Math.round((row.interested_count / row.calls_count) * 100) : 0;
                  return (
                    <tr key={`${row.date}-${row.caller_id}-${idx}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {row.date}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {row.caller_name.charAt(0).toUpperCase()}
                        </div>
                        <span>{row.caller_name}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-blue-600 dark:text-blue-400">
                        {row.calls_count}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                          <Star className="w-2.5 h-2.5 fill-emerald-500" />
                          {row.interested_count}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                        {row.contacted_count}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-purple-600 dark:text-purple-400">
                        {row.callback_count}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-400">
                        {row.invalid_count}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {row.total_duration_minutes > 0 ? `${row.total_duration_minutes}m` : "—"}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                        {conv}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Chronological Call Activity Audit Log */}
      <div className="crm-card overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Call & Status Activity Audit Trail</h2>
            <span className="text-xs text-zinc-400">({totalLogs} total entries)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Actor filter */}
            <select
              value={logActorFilter}
              onChange={(e) => {
                setLogActorFilter(e.target.value as any);
                setLogPage(1);
              }}
              className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="all">All Actors (Team & Bot)</option>
              <option value="team">👥 Team Callers Only</option>
              <option value="whatsapp_bot">🤖 WhatsApp Bot Only</option>
            </select>

            {/* Disposition filter */}
            <select
              value={logDispositionFilter}
              onChange={(e) => {
                setLogDispositionFilter(e.target.value);
                setLogPage(1);
              }}
              className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Outcomes</option>
              <option value="interested">⭐ Interested Only</option>
              <option value="contacted">📞 Contacted Only</option>
              <option value="callback">🕒 Callbacks Only</option>
              <option value="invalid">❌ Invalid Number</option>
            </select>

            {/* Search */}
            <div className="relative max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search lead, caller, notes..."
                value={logSearch}
                onChange={(e) => {
                  setLogSearch(e.target.value);
                  setLogPage(1);
                }}
                className="pl-7 pr-3 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white w-48 sm:w-60 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mb-2" />
            <span className="text-xs">Loading audit logs...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No activity or status change logs match this criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Time (IST)</th>
                  <th className="py-3 px-4">Changed By / Actor</th>
                  <th className="py-3 px-4">Business / Lead</th>
                  <th className="py-3 px-4">Outcome</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Notes / Remarks</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {logs.map((log) => {
                  const leadPhone = log.lead?.bussiness_number ? format10DigitPhone(log.lead.bussiness_number) : "";
                  const isBotActor = log.is_bot || log.source === "whatsapp_bot" || log.caller?.username?.toLowerCase().includes("bot") || log.actor_name?.toLowerCase().includes("bot");
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-[11px] font-mono font-medium text-slate-900 dark:text-white">
                          {formatISTDateTime(log.called_at)}
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                          <span>🇮🇳 IST (UTC+5:30)</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {isBotActor ? (
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              <Bot className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Bot
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">Customer / Inbound</div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                              <UserCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span className="truncate max-w-[140px]">{log.actor_name || log.caller?.username || "Admin"}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 capitalize">
                              {log.caller?.job_title || "Sales Caller"}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]" title={log.lead?.bussiness_name}>
                          {log.lead?.bussiness_name || "Unknown Business"}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {leadPhone ? `+${leadPhone}` : "—"} {log.lead?.scraped_city ? `• ${log.lead.scraped_city}` : ""}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          log.disposition === "interested"
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : log.disposition === "contacted"
                            ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                            : log.disposition === "callback"
                            ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}>
                          {log.disposition === "interested" ? "⭐ Interested" : log.disposition === "contacted" ? "📞 Contacted" : log.disposition}
                        </span>
                        {log.callback_at && (
                          <div className="text-[10px] text-purple-600 dark:text-purple-400 mt-0.5 flex items-center gap-1 font-mono">
                            <Clock className="w-2.5 h-2.5" /> {formatISTDateTime(log.callback_at)}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {log.source === "whatsapp_bot"
                            ? "WhatsApp Bot"
                            : log.source === "queue_disposition"
                            ? "Call Queue"
                            : log.source === "sales_calling_screen"
                            ? "Calling List"
                            : log.source === "whatsapp_dashboard"
                            ? "WhatsApp Tab"
                            : log.source === "interested_screen"
                            ? "Hot Leads Tab"
                            : (log.source || "Sales Call")}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-[11px] max-w-xs truncate" title={log.notes || ""}>
                        {log.notes || "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {leadPhone && (
                          <a
                            href={`https://wa.me/${leadPhone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#25D366] hover:underline"
                          >
                            Chat WhatsApp →
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalLogPages > 1 && (
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Showing Page {logPage} of {totalLogPages}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLogPage(p => Math.max(1, p - 1))}
                disabled={logPage === 1 || loading}
                className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setLogPage(p => Math.min(totalLogPages, p + 1))}
                disabled={logPage === totalLogPages || loading}
                className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Telecaller Click-to-Call & Button Interaction Audit Feed */}
      <div className="crm-card overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Caller Button Actions & Click-to-Call Audit</h2>
            <span className="text-xs text-zinc-400">({totalInteractions} button clicks tracked)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Action Type filter */}
            <select
              value={interactionTypeFilter}
              onChange={(e) => {
                setInteractionTypeFilter(e.target.value);
                setInteractionPage(1);
              }}
              className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Button Actions</option>
              <option value="call_clicked">"Call Now" Clicks</option>
              <option value="whatsapp_clicked">"WhatsApp" Clicks</option>
            </select>
          </div>
        </div>

        {interactionLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mb-2" />
            <span className="text-xs">Loading button interactions...</span>
          </div>
        ) : interactionLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No button clicks or telecaller interactions recorded yet for this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Sales Caller</th>
                  <th className="py-3 px-4">Action Triggered</th>
                  <th className="py-3 px-4">Target Business / Lead</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-right">Direct Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {interactionLogs.map((log) => {
                  const leadPhone = log.lead?.bussiness_number ? format10DigitPhone(log.lead.bussiness_number) : "";
                  const isCallAction = log.action_type === "call_clicked";
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 text-[11px] font-mono text-slate-400 whitespace-nowrap">
                        {formatISTDateTime(log.created_at)}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {(log.caller?.username || "C").charAt(0).toUpperCase()}
                        </div>
                        <span>{log.caller?.username || "Unknown Caller"}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isCallAction
                              ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                              : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          }`}
                        >
                          {isCallAction ? (
                            <>
                              <Phone className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                              <span>"Call Now" Pressed</span>
                            </>
                          ) : (
                            <>
                              <MessageSquare className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>"WhatsApp" Pressed</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white truncate max-w-[220px]" title={log.lead?.bussiness_name}>
                          {log.lead?.bussiness_name || "Unknown Business"}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {leadPhone ? `+${leadPhone}` : "—"}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-[11px]">
                        {log.lead?.scraped_city ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" /> {log.lead.scraped_city}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {leadPhone && (
                          <a
                            href={`https://wa.me/${leadPhone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#25D366] hover:underline"
                          >
                            WhatsApp →
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Interaction Pagination */}
        {totalInteractionPages > 1 && (
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Showing Page {interactionPage} of {totalInteractionPages}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setInteractionPage((p) => Math.max(1, p - 1))}
                disabled={interactionPage === 1 || interactionLoading}
                className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setInteractionPage((p) => Math.min(totalInteractionPages, p + 1))}
                disabled={interactionPage === totalInteractionPages || interactionLoading}
                className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
