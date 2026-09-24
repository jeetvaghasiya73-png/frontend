"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Activity,
  RefreshCw,
  Zap,
  Mail,
  Bot,
  MessageSquare,
  Server,
  Database,
  Inbox,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Send,
  Cpu,
  Layers,
  Plus,
  Trash2,
  Users,
  Check
} from "lucide-react";
import { authFetch, API } from "@/lib/authFetch";

interface ServiceTestResult {
  testing: boolean;
  result: {
    success: boolean;
    message: string;
    latency_ms?: number;
    details?: any;
    [key: string]: any;
  } | null;
}

interface SystemOverview {
  timestamp: string;
  server_environment: {
    os: string;
    project_name: string;
    website_url: string;
    autonomous_mode: {
      batch_size: number;
      interval_hours: number;
      delay_range: string;
    };
  };
  services: {
    database: {
      configured: boolean;
      connected: boolean;
      type: string;
      counts: { leads: number; contacts: number; users: number };
    };
    smtp: {
      configured: boolean;
      host: string;
      port: number;
      use_tls: boolean;
      use_ssl: boolean;
      sender_email: string;
      account: string;
      test_mode: boolean;
    };
    ai: {
      configured: boolean;
      provider: string;
      model: string;
      has_key: boolean;
    };
    whatsapp: {
      configured: boolean;
      api_url: string;
      instance_name: string;
      has_api_key: boolean;
      test_mode: boolean;
      test_number: string;
      daily_limit: number;
    };
    imap: {
      configured: boolean;
      host: string;
      port: number;
      account: string;
    };
  };
}

export default function SettingsPage() {
  const [overview, setOverview] = useState<SystemOverview | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [runningAll, setRunningAll] = useState(false);
  const [overallHealth, setOverallHealth] = useState<number | null>(null);

  // Individual test states
  const [dbStatus, setDbStatus] = useState<ServiceTestResult>({ testing: false, result: null });
  const [smtpStatus, setSmtpStatus] = useState<ServiceTestResult>({ testing: false, result: null });
  const [aiStatus, setAiStatus] = useState<ServiceTestResult>({ testing: false, result: null });
  const [waStatus, setWaStatus] = useState<ServiceTestResult>({ testing: false, result: null });
  const [imapStatus, setImapStatus] = useState<ServiceTestResult>({ testing: false, result: null });

  // Custom test email address input
  const [customTestEmail, setCustomTestEmail] = useState("");

  // Toast Notifications
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch read-only system overview
  const fetchOverview = useCallback(async () => {
    setLoadingOverview(true);
    try {
      const res = await authFetch(`${API}/api/v1/settings/overview`);
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
      }
    } catch (err: any) {
      console.warn("Failed to load system overview:", err?.message || err);
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  // Admin Notification Email Recipients (Multi-Admin Alert Broadcast)
  const [adminEmails, setAdminEmails] = useState<string[]>(["meetvaghasiya166@gmail.com"]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [addingEmail, setAddingEmail] = useState(false);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);

  const fetchAdminEmails = useCallback(async () => {
    try {
      const res = await authFetch(`${API}/api/v1/settings/admin-emails`);
      if (res.ok) {
        const data = await res.json();
        setAdminEmails(data.emails || ["meetvaghasiya166@gmail.com"]);
      }
    } catch (e) {
      console.error("Failed to load admin emails:", e);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
    fetchAdminEmails();
  }, [fetchOverview, fetchAdminEmails]);

  const handleAddAdminEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminEmail.includes("@")) return;
    setAddingEmail(true);
    try {
      const res = await authFetch(`${API}/api/v1/settings/admin-emails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newAdminEmail.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setAdminEmails(data.emails || []);
        setNewAdminEmail("");
        showToast("success", `Added ${newAdminEmail.trim()} to admin alert recipients!`);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast("error", err.detail || "Failed to add admin email.");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Network error adding admin email.");
    } finally {
      setAddingEmail(false);
    }
  };

  const handleRemoveAdminEmail = async (emailToRemove: string) => {
    if (emailToRemove === "meetvaghasiya166@gmail.com") {
      showToast("error", "Primary admin email cannot be removed.");
      return;
    }
    setRemovingEmail(emailToRemove);
    try {
      const res = await authFetch(`${API}/api/v1/settings/admin-emails/${encodeURIComponent(emailToRemove)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        setAdminEmails(data.emails || []);
        showToast("success", `Removed ${emailToRemove} from admin notifications.`);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast("error", err.detail || "Failed to remove admin email.");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Network error removing admin email.");
    } finally {
      setRemovingEmail(null);
    }
  };

  // Run Database Test
  const handleTestDatabase = async () => {
    setDbStatus({ testing: true, result: null });
    try {
      const res = await authFetch(`${API}/api/v1/settings/test-database`, { method: "POST" });
      const data = await res.json();
      setDbStatus({ testing: false, result: data });
      if (data.success) {
        showToast("success", `Database active (${data.latency_ms}ms roundtrip)`);
      } else {
        showToast("error", data.message || "Database connection test failed");
      }
      return data.success;
    } catch (err: any) {
      const fail = { success: false, message: err.message || "Database request failed" };
      setDbStatus({ testing: false, result: fail });
      showToast("error", fail.message);
      return false;
    }
  };

  // Run SMTP Test
  const handleTestSmtp = async () => {
    setSmtpStatus({ testing: true, result: null });
    try {
      const payload = customTestEmail.trim() ? { test_recipient: customTestEmail.trim() } : {};
      const res = await authFetch(`${API}/api/v1/settings/test-smtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setSmtpStatus({ testing: false, result: data });
      if (data.success) {
        showToast("success", data.message || "SMTP connected successfully!");
      } else {
        showToast("error", data.message || "SMTP check failed");
      }
      return data.success;
    } catch (err: any) {
      const fail = { success: false, message: err.message || "SMTP check failed" };
      setSmtpStatus({ testing: false, result: fail });
      showToast("error", fail.message);
      return false;
    }
  };

  // Run AI / OpenRouter Test
  const handleTestAi = async () => {
    setAiStatus({ testing: true, result: null });
    try {
      const res = await authFetch(`${API}/api/v1/settings/test-ai`, { method: "POST" });
      const data = await res.json();
      setAiStatus({ testing: false, result: data });
      if (data.success) {
        showToast("success", `AI Model responded in ${data.latency_ms}ms`);
      } else {
        showToast("error", data.message || "AI check failed");
      }
      return data.success;
    } catch (err: any) {
      const fail = { success: false, message: err.message || "AI probe failed" };
      setAiStatus({ testing: false, result: fail });
      showToast("error", fail.message);
      return false;
    }
  };

  // Run WhatsApp Evolution API Test
  const handleTestWhatsApp = async () => {
    setWaStatus({ testing: true, result: null });
    try {
      const res = await authFetch(`${API}/api/v1/settings/test-whatsapp`, { method: "POST" });
      const data = await res.json();
      setWaStatus({ testing: false, result: data });
      if (data.success) {
        showToast("success", data.message || "Evolution API bridge operational!");
      } else {
        showToast("error", data.message || "WhatsApp connection check failed");
      }
      return data.success;
    } catch (err: any) {
      const fail = { success: false, message: err.message || "WhatsApp check failed" };
      setWaStatus({ testing: false, result: fail });
      showToast("error", fail.message);
      return false;
    }
  };

  // Run IMAP Test
  const handleTestImap = async () => {
    setImapStatus({ testing: true, result: null });
    try {
      const res = await authFetch(`${API}/api/v1/settings/test-imap`, { method: "POST" });
      const data = await res.json();
      setImapStatus({ testing: false, result: data });
      if (data.success) {
        showToast("success", data.message || "IMAP mailbox verified!");
      } else {
        showToast("error", data.message || "IMAP check failed");
      }
      return data.success;
    } catch (err: any) {
      const fail = { success: false, message: err.message || "IMAP connection failed" };
      setImapStatus({ testing: false, result: fail });
      showToast("error", fail.message);
      return false;
    }
  };

  // Run Master Suite (All 5 Services Simultaneously)
  const handleRunAllTests = async () => {
    setRunningAll(true);
    showToast("success", "Running complete infrastructure health test suite...");
    try {
      const [dbOk, smtpOk, aiOk, waOk, imapOk] = await Promise.all([
        handleTestDatabase(),
        handleTestSmtp(),
        handleTestAi(),
        handleTestWhatsApp(),
        handleTestImap()
      ]);

      const passed = [dbOk, smtpOk, aiOk, waOk, imapOk].filter(Boolean).length;
      const score = Math.round((passed / 5) * 100);
      setOverallHealth(score);
      fetchOverview();
    } catch (err) {
      console.error(err);
    } finally {
      setRunningAll(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 border transition-all animate-bounce ${
            toast.type === "success"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
          }`}
          style={{ background: "var(--dash-surface)" }}
        >
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          PAGE HEADER
      ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[var(--dash-border)] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg sm:text-xl tracking-tight" style={{ color: "var(--dash-text)" }}>
                System Diagnostics &amp; Connectivity Tests
              </h1>
              <p className="text-xs mt-0.5" style={{ color: "var(--dash-text-muted)" }}>
                Real-time health telemetry, API latencies, and service connectivity diagnostics across your infrastructure.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchOverview}
            disabled={loadingOverview}
            className="crm-btn-secondary inline-flex items-center gap-1.5 px-3 py-2 text-xs"
            title="Refresh system overview"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingOverview ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleRunAllTests}
            disabled={runningAll}
            className="crm-btn-primary inline-flex items-center gap-2 px-4 py-2 text-xs font-bold shadow-md cursor-pointer"
          >
            {runningAll ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Suite...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Run Master Health Check</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SYSTEM OVERVIEW SUMMARY BAR
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Health Score Card */}
        <div className="crm-card p-4 rounded-lg border border-[var(--dash-border)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold" style={{ color: "var(--dash-text-muted)" }}>
              Infrastructure Health
            </div>
            <div className="text-base font-bold flex items-center gap-2" style={{ color: "var(--dash-text)" }}>
              {overallHealth !== null ? `${overallHealth}% Operational` : "Ready to Test"}
              {overallHealth !== null && (
                <span className={`w-2 h-2 rounded-full ${overallHealth >= 80 ? "bg-emerald-500" : "bg-amber-500"}`} />
              )}
            </div>
          </div>
        </div>

        {/* Database Stats Card */}
        <div className="crm-card p-4 rounded-lg border border-[var(--dash-border)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold" style={{ color: "var(--dash-text-muted)" }}>
              Database Storage
            </div>
            <div className="text-xs font-bold" style={{ color: "var(--dash-text)" }}>
              {overview?.services?.database ? (
                <span>
                  {overview.services.database.type} • {overview.services.database.counts.leads} Leads / {overview.services.database.counts.contacts} Inquiries
                </span>
              ) : (
                "Connecting..."
              )}
            </div>
          </div>
        </div>

        {/* WhatsApp Routing Card */}
        <div className="crm-card p-4 rounded-lg border border-[var(--dash-border)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold" style={{ color: "var(--dash-text-muted)" }}>
              WhatsApp Safety Shield
            </div>
            <div className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--dash-text)" }}>
              {overview?.services?.whatsapp?.test_mode ? (
                <span className="text-emerald-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Test Sandbox ({overview.services.whatsapp.test_number})
                </span>
              ) : (
                <span className="text-amber-500 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Live Recipients Active
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Email Outreach Status Card */}
        <div className="crm-card p-4 rounded-lg border border-[var(--dash-border)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20 shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold" style={{ color: "var(--dash-text-muted)" }}>
              Email Routing Mode
            </div>
            <div className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--dash-text)" }}>
              {overview?.services?.smtp?.test_mode ? (
                <span className="text-purple-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Test Sandbox Active
                </span>
              ) : (
                <span className="text-blue-500 flex items-center gap-1">
                  <Send className="w-3.5 h-3.5" /> Live Client Dispatch
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SERVICE DIAGNOSTICS CARDS (GRID OF 5 SERVICES)
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. DATABASE SERVICE CARD */}
        <div className="crm-card p-5 border border-[var(--dash-border)] rounded-lg space-y-4 flex flex-col justify-between shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-2" style={{ color: "var(--dash-text)" }}>
                <Database className="w-4 h-4 text-blue-500" />
                Database Engine
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--dash-surface-alt)] border border-[var(--dash-border)]">
                {overview?.services?.database?.type || "SQLAlchemy"}
              </span>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: "var(--dash-text-muted)" }}>
              Executes a live query (`SELECT 1`) to measure engine roundtrip response latency and verify database integrity.
            </p>

            {dbStatus.result && (
              <div
                className={`p-3 rounded-md text-xs leading-relaxed font-mono ${
                  dbStatus.result.success
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                }`}
              >
                <div className="font-bold">{dbStatus.result.success ? "✓ Query Succeeded" : "✕ Database Error"}</div>
                <div className="mt-1 text-[11px]">{dbStatus.result.message}</div>
                {dbStatus.result.latency_ms !== undefined && (
                  <div className="mt-1 text-[10px] opacity-80">Latency: {dbStatus.result.latency_ms}ms</div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleTestDatabase}
            disabled={dbStatus.testing}
            className="crm-btn-secondary w-full py-2 text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            {dbStatus.testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-blue-500" />}
            <span>{dbStatus.testing ? "Executing Query..." : "Test Database Connection"}</span>
          </button>
        </div>

        {/* 2. SMTP EMAIL SERVICE CARD */}
        <div className="crm-card p-5 border border-[var(--dash-border)] rounded-lg space-y-4 flex flex-col justify-between shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-2" style={{ color: "var(--dash-text)" }}>
                <Mail className="w-4 h-4 text-purple-500" />
                SMTP Email Gateway
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--dash-surface-alt)] border border-[var(--dash-border)]">
                {overview?.services?.smtp?.host || "smtp.gmail.com"}
              </span>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: "var(--dash-text-muted)" }}>
              Tests TLS handshake and credential authentication with the outbound SMTP relay server.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-medium" style={{ color: "var(--dash-text-muted)" }}>
                Optional: Send test ping to email
              </label>
              <input
                type="email"
                placeholder="test@example.com"
                value={customTestEmail}
                onChange={(e) => setCustomTestEmail(e.target.value)}
                className="crm-input w-full text-xs font-mono py-1.5 px-2.5"
              />
            </div>

            {smtpStatus.result && (
              <div
                className={`p-3 rounded-md text-xs leading-relaxed font-mono ${
                  smtpStatus.result.success
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                }`}
              >
                <div className="font-bold">{smtpStatus.result.success ? "✓ SMTP Handshake Passed" : "✕ SMTP Failed"}</div>
                <div className="mt-1 text-[11px]">{smtpStatus.result.message}</div>
                {smtpStatus.result.latency_ms !== undefined && (
                  <div className="mt-1 text-[10px] opacity-80">Latency: {smtpStatus.result.latency_ms}ms</div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleTestSmtp}
            disabled={smtpStatus.testing}
            className="crm-btn-secondary w-full py-2 text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            {smtpStatus.testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-purple-500" />}
            <span>{smtpStatus.testing ? "Testing SMTP Relay..." : "Test SMTP Gateway"}</span>
          </button>
        </div>

        {/* 3. OPENROUTER AI SERVICE CARD */}
        <div className="crm-card p-5 border border-[var(--dash-border)] rounded-lg space-y-4 flex flex-col justify-between shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-2" style={{ color: "var(--dash-text)" }}>
                <Bot className="w-4 h-4 text-indigo-500" />
                AI Model (OpenRouter)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--dash-surface-alt)] border border-[var(--dash-border)]">
                {overview?.services?.ai?.model?.split("/")[1] || "deepseek-v4"}
              </span>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: "var(--dash-text-muted)" }}>
              Sends a fast probe message to verify API key validity, token limits, and LLM inference latency.
            </p>

            {aiStatus.result && (
              <div
                className={`p-3 rounded-md text-xs leading-relaxed font-mono ${
                  aiStatus.result.success
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                }`}
              >
                <div className="font-bold">{aiStatus.result.success ? "✓ AI Model Ready" : "✕ AI Key Rejected"}</div>
                <div className="mt-1 text-[11px]">{aiStatus.result.message}</div>
                {aiStatus.result.latency_ms !== undefined && (
                  <div className="mt-1 text-[10px] opacity-80">Latency: {aiStatus.result.latency_ms}ms</div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleTestAi}
            disabled={aiStatus.testing}
            className="crm-btn-secondary w-full py-2 text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            {aiStatus.testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-indigo-500" />}
            <span>{aiStatus.testing ? "Pinging OpenRouter..." : "Test AI Model Inference"}</span>
          </button>
        </div>

        {/* 4. EVOLUTION WHATSAPP API CARD */}
        <div className="crm-card p-5 border border-[var(--dash-border)] rounded-lg space-y-4 flex flex-col justify-between shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-2" style={{ color: "var(--dash-text)" }}>
                <MessageSquare className="w-4 h-4 text-emerald-500" />
                Evolution WhatsApp API
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--dash-surface-alt)] border border-[var(--dash-border)]">
                {overview?.services?.whatsapp?.instance_name || "7990738939"}
              </span>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: "var(--dash-text-muted)" }}>
              Connects to Evolution API server and checks whether your paired WhatsApp instance is in an OPEN / CONNECTED state.
            </p>

            {waStatus.result && (
              <div
                className={`p-3 rounded-md text-xs leading-relaxed font-mono ${
                  waStatus.result.success
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                }`}
              >
                <div className="font-bold">{waStatus.result.success ? "✓ Evolution API Reachable" : "✕ Bridge Disconnected"}</div>
                <div className="mt-1 text-[11px]">{waStatus.result.message}</div>
                {waStatus.result.connection_state && (
                  <div className="mt-1 text-[10px] opacity-80 font-bold">State: {waStatus.result.connection_state}</div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleTestWhatsApp}
            disabled={waStatus.testing}
            className="crm-btn-secondary w-full py-2 text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            {waStatus.testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-emerald-500" />}
            <span>{waStatus.testing ? "Connecting to Bridge..." : "Test WhatsApp Bridge"}</span>
          </button>
        </div>

        {/* 5. IMAP INBOX LISTENER CARD */}
        <div className="crm-card p-5 border border-[var(--dash-border)] rounded-lg space-y-4 flex flex-col justify-between shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-2" style={{ color: "var(--dash-text)" }}>
                <Inbox className="w-4 h-4 text-amber-500" />
                IMAP Mailbox Listener
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--dash-surface-alt)] border border-[var(--dash-border)]">
                {overview?.services?.imap?.host || "imap.gmail.com"}
              </span>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: "var(--dash-text-muted)" }}>
              Logs into the inbound IMAP inbox to verify incoming reply polling and sentiment digestion.
            </p>

            {imapStatus.result && (
              <div
                className={`p-3 rounded-md text-xs leading-relaxed font-mono ${
                  imapStatus.result.success
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                }`}
              >
                <div className="font-bold">{imapStatus.result.success ? "✓ Mailbox Connected" : "✕ IMAP Error"}</div>
                <div className="mt-1 text-[11px]">{imapStatus.result.message}</div>
                {imapStatus.result.inbox_messages !== undefined && (
                  <div className="mt-1 text-[10px] opacity-80">Total Unread/Recent: {imapStatus.result.inbox_messages}</div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleTestImap}
            disabled={imapStatus.testing}
            className="crm-btn-secondary w-full py-2 text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            {imapStatus.testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-500" />}
            <span>{imapStatus.testing ? "Connecting to Mailbox..." : "Test IMAP Listener"}</span>
          </button>
        </div>

        {/* 6. SYSTEM ARCHITECTURE & AUTONOMOUS ENGINE CARD */}
        <div className="crm-card p-5 border border-[var(--dash-border)] rounded-lg space-y-4 flex flex-col justify-between shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-2" style={{ color: "var(--dash-text)" }}>
                <Server className="w-4 h-4 text-cyan-500" />
                Autonomous Engine
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                ACTIVE
              </span>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: "var(--dash-text-muted)" }}>
              Background scheduling parameters for automated batch outreach, randomized human delay windows, and ban protection.
            </p>

            <div className="p-3 rounded-md bg-[var(--dash-surface-alt)] border border-[var(--dash-border)] text-xs font-mono space-y-1 text-[var(--dash-text-secondary)]">
              <div>Batch Size: {overview?.server_environment?.autonomous_mode?.batch_size || 100} leads/cycle</div>
              <div>Interval: Every {overview?.server_environment?.autonomous_mode?.interval_hours || 3} hours</div>
              <div>Delay: {overview?.server_environment?.autonomous_mode?.delay_range || "2s - 5s"} per message</div>
            </div>
          </div>

          <div className="text-[11px] text-[var(--dash-text-muted)] flex items-center justify-between pt-2 border-t border-[var(--dash-border)]">
            <span>Server OS: {overview?.server_environment?.os || "Windows/Linux"}</span>
            <span>API: FastAPI 0.115+</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          7. DEDICATED ADMIN NOTIFICATION EMAIL RECIPIENTS (MULTI-ADMIN)
      ───────────────────────────────────────────────────────────── */}
      <div className="crm-card p-6 border border-[var(--dash-border)] rounded-lg space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--dash-border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--dash-text)] flex items-center gap-2">
                <span>Admin Alert Email Broadcast Network</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {adminEmails.length} Active {adminEmails.length === 1 ? "Recipient" : "Recipients"}
                </span>
              </h2>
              <p className="text-xs text-[var(--dash-text-muted)] mt-0.5">
                Whenever a client submits an inbound inquiry or clicks &quot;Interested&quot; on WhatsApp, instant alert notifications are dispatched to all emails below via Google Email Service (<code>thechinfinix1@gmail.com</code>).
              </p>
            </div>
          </div>
        </div>

        {/* Dual Email Flow Explanation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
            <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Check className="w-4 h-4 shrink-0" />
              <span>User / Client Emails (Brevo API)</span>
            </div>
            <p className="text-[11px] text-[var(--dash-text-muted)] leading-relaxed">
              All website subscriber welcome briefings, contact thank-you confirmations, and proposals go directly to the client via <strong>Brevo API</strong> (Sender: <code>contact@techinfinix.com</code>).
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-indigo-500/5 border border-indigo-500/20 space-y-1.5">
            <div className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Admin Alerts (Google Email Service)</span>
            </div>
            <p className="text-[11px] text-[var(--dash-text-muted)] leading-relaxed">
              All internal alerts (Hot WhatsApp leads, Inbound website leads, Newsletter alerts) are sent from <strong>thechinfinix1@gmail.com</strong> concurrently to every admin listed below.
            </p>
          </div>
        </div>

        {/* Registered Admin Emails List */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[var(--dash-text)] block">
            Registered Admin Email Addresses:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {adminEmails.map((email) => {
              const isPrimary = email.toLowerCase() === "meetvaghasiya166@gmail.com";
              return (
                <div
                  key={email}
                  className="flex items-center justify-between p-3 rounded-md bg-[var(--dash-surface-alt)] border border-[var(--dash-border)] text-xs font-mono"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate text-[var(--dash-text)] font-semibold">{email}</span>
                  </div>
                  {isPrimary ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
                      Primary
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRemoveAdminEmail(email)}
                      disabled={removingEmail === email}
                      className="p-1 rounded text-rose-500 hover:bg-rose-500/10 transition cursor-pointer shrink-0"
                      title={`Remove ${email}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Add New Admin Email Form */}
        <form onSubmit={handleAddAdminEmail} className="pt-2 border-t border-[var(--dash-border)] flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="flex-1">
            <input
              type="email"
              required
              placeholder="Add another admin email (e.g. partner@techinfinix.com)..."
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="crm-input w-full text-xs font-mono py-2 px-3"
            />
          </div>
          <button
            type="submit"
            disabled={addingEmail || !newAdminEmail.trim()}
            className="crm-btn-primary px-4 py-2 text-xs font-bold inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
          >
            {addingEmail ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            <span>{addingEmail ? "Adding Admin..." : "Add Admin Email"}</span>
          </button>
        </form>
      </div>

    </div>
  );
}
