"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "@/lib/authStore";
import {
  Loader2,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Building,
  Sparkles,
  Database,
  Globe,
  Star,
  ChevronLeft,
  ChevronRight,
  Filter,
  ChevronDown,
  Search,
  Plus,
  X,
  SlidersHorizontal,
  Download,
  MoreVertical,
  Zap,
  MapPin,
  Tag,
  CheckCircle2,
  User,
  Users,
  FileSpreadsheet,
  MessageSquare
} from "lucide-react";
import { authFetch, API } from "@/lib/authFetch";

type SourceFilter = "all" | "inquiry" | "scraped";

interface NormalizedLead {
  id: number;
  rawId: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  services: string[];
  message?: string;
  status: string;
  created_at: string;
  source: "inquiry" | "scraped";
  rating?: string;
  website?: string;
  city?: string;
  category?: string;
  email_status?: string;
  score: number;
}

const LEADS_PER_PAGE = 10;

export default function LeadsManager() {
  const { accessToken } = useAuthStore();
  const [allLeads, setAllLeads] = useState<NormalizedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Selection & Bulk Delete state
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<number>>(new Set());

  // Drawer state
  const [selectedLead, setSelectedLead] = useState<NormalizedLead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Modal states for Import & Add Lead
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);

  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    bussiness_name: "",
    bussiness_email: "",
    bussiness_number: "",
    scraped_city: "",
    scraped_service: "",
    category: "",
    bussiness_website: "",
  });
  const [submittingNewLead, setSubmittingNewLead] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const fetchLeads = async () => {
    try {
      const inquiryRes = await authFetch(`${API}/api/v1/leads/`);
      const inquiryData: any[] = inquiryRes.ok ? await inquiryRes.json() : [];

      const scrapedRes = await authFetch(`${API}/api/v1/scraped-leads/?page=1&limit=1000`);
      let scrapedData: any[] = [];
      if (scrapedRes.ok) {
        const scrapedJson = await scrapedRes.json();
        if (Array.isArray(scrapedJson)) {
          scrapedData = scrapedJson;
        } else if (scrapedJson && Array.isArray(scrapedJson.leads)) {
          scrapedData = scrapedJson.leads;
        }
      }

      const normalizedInquiries: NormalizedLead[] = inquiryData.map((lead: any) => ({
        id: lead.id,
        rawId: lead.id,
        name: lead.name || "Unknown",
        email: lead.email || "",
        phone: lead.phone || "",
        company: lead.company || "Direct Inbound",
        services: lead.services || [],
        message: lead.message || "",
        status: lead.status || "pending",
        created_at: lead.created_at || new Date().toISOString(),
        source: "inquiry" as const,
        score: 94,
      }));

      const normalizedScraped: NormalizedLead[] = scrapedData.map((lead: any) => {
        const hasEmail = Boolean(lead.bussiness_email);
        const ratingVal = lead.rating ? parseFloat(lead.rating) : 3.5;
        const score = Math.min(99, Math.round((hasEmail ? 80 : 55) + ratingVal * 3.5));

        return {
          id: lead.id + 100000,
          rawId: lead.id,
          name: lead.bussiness_name || "Unknown Business",
          email: lead.bussiness_email || "",
          phone: lead.bussiness_number || "",
          company: lead.scraped_city || "Outreach",
          services: lead.scraped_service ? [lead.scraped_service] : [],
          message: "",
          status: "scraped",
          created_at: lead.created_at || new Date().toISOString(),
          source: "scraped" as const,
          rating: lead.rating || "",
          website: lead.bussiness_website || "",
          city: lead.scraped_city || "",
          category: lead.category || "",
          email_status: lead.email_status || "pending",
          score,
        };
      });

      const merged = [...normalizedInquiries, ...normalizedScraped];
      merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setAllLeads(merged);
    } catch (err) {
      console.error("Failed to load leads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [accessToken]);

  useEffect(() => {
    setCurrentPage(1);
    setStatusFilter("all");
  }, [sourceFilter]);

  const handleStatusUpdate = async (leadId: number, newStatus: string) => {
    setUpdatingId(leadId);
    try {
      const res = await authFetch(`${API}/api/v1/leads/${leadId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setAllLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
        );
        if (selectedLead?.id === leadId) {
          setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (err) {
      console.error("Failed to update lead status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteLead = async (lead: NormalizedLead) => {
    if (!confirm(`Are you sure you want to delete "${lead.name}"?`)) return;
    try {
      const endpoint = lead.source === "inquiry"
        ? `${API}/api/v1/leads/${lead.rawId}`
        : `${API}/api/v1/scraped-leads/${lead.rawId}`;

      const res = await authFetch(endpoint, { method: "DELETE" });
      if (res.ok) {
        setAllLeads((prev) => prev.filter((l) => l.id !== lead.id));
        if (selectedLead?.id === lead.id) {
          setIsDrawerOpen(false);
          setSelectedLead(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete lead:", err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeadIds.size === 0) return;
    if (!confirm(`Are you sure you want to permanently delete ${selectedLeadIds.size} selected lead(s)?`)) return;

    try {
      const leadIdsList = Array.from(selectedLeadIds);
      const res = await authFetch(`${API}/api/v1/scraped-leads/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_ids: leadIdsList }),
      });

      if (res.ok) {
        setAllLeads(prev => prev.filter(l => !selectedLeadIds.has(l.rawId)));
        setSelectedLeadIds(new Set());
        triggerToast("Selected leads deleted permanently");
      }
    } catch (err) {
      console.error("Failed bulk delete:", err);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;
    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append("file", importFile);

    try {
      const res = await authFetch(`${API}/api/v1/scraped-leads/upload`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const msg = data.message || `Successfully imported ${data.inserted} leads into database!`;
        setUploadResult(msg);
        triggerToast(msg);
        await fetchLeads();
        setTimeout(() => {
          setShowImportModal(false);
          setImportFile(null);
          setUploadResult(null);
        }, 1500);
      } else {
        const err = await res.json();
        setUploadResult(`Error: ${err.detail || "Failed to process spreadsheet."}`);
      }
    } catch (err: any) {
      setUploadResult(`Error: ${err.message || "Failed to upload file."}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateSingleLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.bussiness_name.trim()) {
      triggerToast("Lead Name is required");
      return;
    }
    setSubmittingNewLead(true);
    try {
      const res = await authFetch(`${API}/api/v1/scraped-leads/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLeadForm),
      });

      if (res.ok) {
        triggerToast(`Lead "${newLeadForm.bussiness_name}" added to database!`);
        setNewLeadForm({
          bussiness_name: "",
          bussiness_email: "",
          bussiness_number: "",
          scraped_city: "",
          scraped_service: "",
          category: "",
          bussiness_website: "",
        });
        setShowAddLeadModal(false);
        await fetchLeads();
      } else {
        const err = await res.json();
        triggerToast(err.detail || "Failed to create lead");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Error creating lead");
    } finally {
      setSubmittingNewLead(false);
    }
  };

  const handleExportCSV = () => {
    if (allLeads.length === 0) return;
    const headers = ["ID", "Name", "Email", "Phone", "Company/City", "Service", "Source", "Status", "Score", "Created At"];
    const rows = allLeads.map(l => [
      l.id,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.email}"`,
      `"${l.phone || ""}"`,
      `"${l.company || l.city || ""}"`,
      `"${l.services.join(", ") || l.category || ""}"`,
      l.source,
      l.status,
      l.score,
      l.created_at
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leadflow_leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(`Exported ${allLeads.length} leads to CSV file`);
  };

  const filteredLeads = useMemo(() => {
    let result = allLeads;

    if (sourceFilter !== "all") {
      result = result.filter((l) => l.source === sourceFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter((l) => {
        if (sourceFilter === "scraped" || l.source === "scraped") {
          return l.email_status?.toLowerCase() === statusFilter.toLowerCase();
        }
        return l.status.toLowerCase() === statusFilter.toLowerCase();
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.company?.toLowerCase().includes(q) ||
        l.city?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [allLeads, sourceFilter, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredLeads.length / LEADS_PER_PAGE);
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * LEADS_PER_PAGE;
    return filteredLeads.slice(start, start + LEADS_PER_PAGE);
  }, [filteredLeads, currentPage]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center flex-col gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 blur-xl animate-pulse" />
          <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin relative" />
        </div>
        <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">Loading Leads Database...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left pb-20 relative animate-fadeIn font-sans antialiased text-slate-800 dark:text-slate-200 w-full max-w-full overflow-x-hidden">
      
      {/* Action Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl border border-indigo-500/40 shadow-2xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Top Bar Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0a0a0a] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-sm w-full max-w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Leads Database</h1>
              <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white font-bold text-xs">
                {allLeads.length} Total
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">Manage, qualify, and inspect inbound &amp; outbound prospect records</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-semibold text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-800 transition shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-semibold text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-800 transition shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-500" />
            <span>Import Sheet</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddLeadModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-sm shadow-indigo-600/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </header>

      {/* KPI Overview Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-xl border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">TOTAL PROSPECTS</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{allLeads.length}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">+14.2%</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-xl border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">OUTBOUND SCRAPED</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {allLeads.filter(l => l.source === "scraped").length}
            </span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">Justdial</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-xl border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">INBOUND INQUIRIES</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {allLeads.filter(l => l.source === "inquiry").length}
            </span>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded">Web Forms</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0a0a0a] p-4 rounded-xl border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">EMAIL CAPTURE EFFICIENCY</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {Math.round((allLeads.filter(l => l.email).length / (allLeads.length || 1)) * 100)}%
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">High Quality</span>
          </div>
        </div>
      </section>

      {/* Segmented Filter Bar & Lead Table Container */}
      <section className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col w-full max-w-full overflow-hidden">
        
        {/* Controls Deck */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200/80 dark:border-neutral-800 flex flex-col xl:flex-row xl:items-center justify-between gap-3 w-full max-w-full">
          
          {/* Segmented View Tabs */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 bg-slate-100 dark:bg-neutral-900 p-1 rounded-xl border border-slate-200/80 dark:border-neutral-800 max-w-full overflow-x-auto">
            <button
              onClick={() => setSourceFilter("all")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer whitespace-nowrap shrink-0 ${
                sourceFilter === "all"
                  ? "bg-white dark:bg-neutral-800 text-slate-900 dark:text-white border border-slate-200/60 dark:border-neutral-700 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All Leads ({allLeads.length})
            </button>
            <button
              onClick={() => setSourceFilter("scraped")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer whitespace-nowrap shrink-0 ${
                sourceFilter === "scraped"
                  ? "bg-white dark:bg-neutral-800 text-slate-900 dark:text-white border border-slate-200/60 dark:border-neutral-700 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Outbound Scraped ({allLeads.filter(l => l.source === "scraped").length})
            </button>
            <button
              onClick={() => setSourceFilter("inquiry")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer whitespace-nowrap shrink-0 ${
                sourceFilter === "inquiry"
                  ? "bg-white dark:bg-neutral-800 text-slate-900 dark:text-white border border-slate-200/60 dark:border-neutral-700 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Website Inquiries ({allLeads.filter(l => l.source === "inquiry").length})
            </button>
          </div>

          {/* Search & Status Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, email, city..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition"
              />
            </div>

            <div className="relative w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto pl-8 pr-8 py-1.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer appearance-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="sent">Sent / Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="failed">Failed</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {selectedLeadIds.size > 0 && (
              <button
                type="button"
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white shadow-sm shadow-rose-600/30 transition cursor-pointer animate-fadeIn w-full sm:w-auto justify-center"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedLeadIds.size})</span>
              </button>
            )}
          </div>
        </div>

        {/* Lead Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-neutral-900/60 border-b border-slate-200/80 dark:border-neutral-800 text-slate-500 dark:text-neutral-400 font-semibold">
                <th className="py-3 px-4 w-8">
                  <input
                    type="checkbox"
                    checked={paginatedLeads.length > 0 && paginatedLeads.every(l => selectedLeadIds.has(l.rawId))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const newSet = new Set(selectedLeadIds);
                        paginatedLeads.forEach(l => newSet.add(l.rawId));
                        setSelectedLeadIds(newSet);
                      } else {
                        const newSet = new Set(selectedLeadIds);
                        paginatedLeads.forEach(l => newSet.delete(l.rawId));
                        setSelectedLeadIds(newSet);
                      }
                    }}
                    className="rounded border-slate-300 dark:border-neutral-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4 uppercase tracking-wider text-[10px]">Lead Name</th>
                <th className="py-3 px-3 uppercase tracking-wider text-[10px]">Company / City</th>
                <th className="py-3 px-3 uppercase tracking-wider text-[10px]">Industry / Service</th>
                <th className="py-3 px-3 uppercase tracking-wider text-[10px]">Source</th>
                <th className="py-3 px-3 uppercase tracking-wider text-[10px]">Status</th>
                <th className="py-3 px-3 uppercase tracking-wider text-[10px] text-center">Score</th>
                <th className="py-3 px-3 uppercase tracking-wider text-[10px]">Date Created</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-neutral-800">
              {paginatedLeads.map((lead) => {
                const isSelected = selectedLeadIds.has(lead.rawId);
                return (
                  <tr
                    key={lead.id}
                    onClick={() => {
                      setSelectedLead(lead);
                      setIsDrawerOpen(true);
                    }}
                    className={`transition cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50/50 dark:bg-indigo-950/30"
                        : "hover:bg-slate-50/80 dark:hover:bg-neutral-900/50"
                    }`}
                  >
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          const next = new Set(selectedLeadIds);
                          if (next.has(lead.rawId)) next.delete(lead.rawId);
                          else next.add(lead.rawId);
                          setSelectedLeadIds(next);
                        }}
                        className="rounded border-slate-300 dark:border-neutral-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
                        {lead.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5">
                          {lead.name}
                        </div>
                        <div className="text-slate-400 text-[11px] truncate max-w-[200px]">{lead.email || "No Email"}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                    {lead.company || lead.city || "—"}
                  </td>

                  <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400">
                    {lead.services.join(", ") || lead.category || "General Services"}
                  </td>

                  <td className="py-3.5 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      lead.source === "scraped"
                        ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                        : "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                    }`}>
                      {lead.source === "scraped" ? "Outbound" : "Inbound"}
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {lead.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] border border-emerald-200 dark:border-emerald-800">
                      {lead.score}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>

                  <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleDeleteLead(lead)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                      title="Delete Lead"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>

        {paginatedLeads.length === 0 && (
          <div className="text-center py-12 text-xs text-slate-400 font-mono">No matching lead records found.</div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200/80 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
            <span className="text-xs text-slate-500 dark:text-neutral-400">
              Page <span className="font-semibold text-slate-900 dark:text-white">{currentPage}</span> of{" "}
              <span className="font-semibold text-slate-900 dark:text-white">{totalPages}</span>
            </span>

            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3.5 py-1.5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-neutral-200 disabled:opacity-40 cursor-pointer hover:bg-slate-50 dark:hover:bg-neutral-800 transition"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm cursor-pointer ${
                    currentPage === p
                      ? "bg-indigo-600 text-white font-bold"
                      : "hidden sm:inline-flex bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-3.5 py-1.5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-neutral-200 disabled:opacity-40 cursor-pointer hover:bg-slate-50 dark:hover:bg-neutral-800 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Slide-Over Drawer / Responsive Popup Modal with Backdrop Click-Outside Close */}
      {isDrawerOpen && selectedLead && (
        <div
          onClick={() => setIsDrawerOpen(false)}
          className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-xs flex items-end sm:items-stretch justify-center sm:justify-end animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-white dark:bg-[#0a0a0a] h-[88vh] sm:h-full rounded-t-2xl sm:rounded-none shadow-2xl flex flex-col justify-between border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-neutral-800 overflow-y-auto cursor-default relative"
          >
            {/* Sticky Navigation Header with Prominent Close Icon Button */}
            <div className="sticky top-0 z-40 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md px-5 py-3.5 border-b border-slate-200/80 dark:border-neutral-800 flex items-center justify-between shadow-xs">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                {selectedLead.source === "scraped" ? "Outbound Prospect" : "Inbound Lead"}
              </span>
              
              {/* Responsive Close Button Icon */}
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 px-3 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-800 dark:text-neutral-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition border border-slate-200/80 dark:border-neutral-700"
                aria-label="Close lead popup"
                title="Close popup"
              >
                <span>Close</span>
                <X className="w-4 h-4 text-slate-700 dark:text-slate-200" />
              </button>
            </div>

            {/* Scrollable Popup Content */}
            <div className="p-6 space-y-4 flex-1">
              <div className="flex items-center gap-4 pt-1">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shrink-0">
                  {selectedLead.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{selectedLead.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">{selectedLead.company || selectedLead.city || "Client Prospect"}</p>
                </div>
              </div>

              {/* ── SLEEK & WELL-POSITIONED ACTION BUTTONS TOOLBAR ── */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-2">
                {/* Call */}
                {selectedLead.phone ? (
                  <a
                    href={`tel:${selectedLead.phone.replace(/[^0-9+]/g, "")}`}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-slate-100/90 dark:bg-neutral-900/90 border border-slate-200/80 dark:border-neutral-800 hover:border-indigo-500/50 hover:bg-indigo-600/10 text-slate-700 dark:text-neutral-200 text-xs font-bold transition shadow-xs cursor-pointer group shrink-0"
                  >
                    <Phone className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform shrink-0" />
                    <span>Call</span>
                  </a>
                ) : (
                  <button
                    disabled
                    className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-slate-100/40 dark:bg-neutral-900/40 border border-slate-200/40 dark:border-neutral-800/40 opacity-50 text-slate-400 text-xs font-semibold cursor-not-allowed shrink-0"
                  >
                    <Phone className="w-4 h-4 shrink-0" />
                    <span>Call</span>
                  </button>
                )}

                {/* Email */}
                {selectedLead.email ? (
                  <a
                    href={`mailto:${selectedLead.email}`}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-slate-100/90 dark:bg-neutral-900/90 border border-slate-200/80 dark:border-neutral-800 hover:border-indigo-500/50 hover:bg-indigo-600/10 text-slate-700 dark:text-neutral-200 text-xs font-bold transition shadow-xs cursor-pointer group shrink-0"
                  >
                    <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform shrink-0" />
                    <span>Email</span>
                  </a>
                ) : (
                  <button
                    disabled
                    className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-slate-100/40 dark:bg-neutral-900/40 border border-slate-200/40 dark:border-neutral-800/40 opacity-50 text-slate-400 text-xs font-semibold cursor-not-allowed shrink-0"
                  >
                    <Mail className="w-4 h-4 shrink-0" />
                    <span>Email</span>
                  </button>
                )}

                {/* WhatsApp */}
                {selectedLead.phone ? (
                  <a
                    href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-slate-100/90 dark:bg-neutral-900/90 border border-slate-200/80 dark:border-neutral-800 hover:border-emerald-500/50 hover:bg-emerald-600/10 text-slate-700 dark:text-neutral-200 text-xs font-bold transition shadow-xs cursor-pointer group shrink-0"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
                    <span className="truncate">Chat</span>
                  </a>
                ) : (
                  <button
                    disabled
                    className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-slate-100/40 dark:bg-neutral-900/40 border border-slate-200/40 dark:border-neutral-800/40 opacity-50 text-slate-400 text-xs font-semibold cursor-not-allowed shrink-0"
                  >
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <span>Chat</span>
                  </button>
                )}

                {/* Status Update / Action */}
                <button
                  onClick={() => handleStatusUpdate(selectedLead.id, selectedLead.status === "qualified" ? "pending" : "qualified")}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-slate-100/90 dark:bg-neutral-900/90 border border-slate-200/80 dark:border-neutral-800 hover:border-amber-500/50 hover:bg-amber-600/10 text-slate-700 dark:text-neutral-200 text-xs font-bold transition shadow-xs cursor-pointer group shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span>Qualify</span>
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDeleteLead(selectedLead)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-slate-100/90 dark:bg-neutral-900/90 border border-slate-200/80 dark:border-neutral-800 hover:border-rose-500/50 hover:bg-rose-600/10 text-slate-700 dark:text-neutral-200 text-xs font-bold transition shadow-xs cursor-pointer group shrink-0 col-span-2 sm:col-span-1"
                >
                  <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span>Delete</span>
                </button>
              </div>

              <div className="space-y-3 pt-4 text-xs">
                <div className="flex items-center gap-3 text-slate-700 dark:text-neutral-300">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 truncate">{selectedLead.email || "No Email Listed"}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 dark:text-neutral-300">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{selectedLead.phone || "No Phone Listed"}</span>
                </div>
                {selectedLead.city && (
                  <div className="flex items-center gap-3 text-slate-700 dark:text-neutral-300">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{selectedLead.city}</span>
                  </div>
                )}
                {selectedLead.website && (
                  <div className="flex items-center gap-3 text-slate-700 dark:text-neutral-300">
                    <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                    <a
                      href={selectedLead.website.startsWith("http") ? selectedLead.website : `https://${selectedLead.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline truncate"
                    >
                      {selectedLead.website}
                    </a>
                  </div>
                )}
                {selectedLead.rating && (
                  <div className="flex items-center gap-3 text-slate-700 dark:text-neutral-300">
                    <Star className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Rating: <strong>{selectedLead.rating} / 5.0</strong></span>
                  </div>
                )}
                {selectedLead.services && selectedLead.services.length > 0 && (
                  <div className="flex items-start gap-3 text-slate-700 dark:text-neutral-300 pt-1">
                    <Tag className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {selectedLead.services.map((svc, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-neutral-800 text-[10px] font-mono text-slate-700 dark:text-neutral-300">
                          {svc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions Footer */}
            <div className="p-5 border-t border-slate-200/80 dark:border-neutral-800 flex items-center justify-between bg-slate-50/50 dark:bg-neutral-900/40 shrink-0">
              <button
                onClick={() => handleDeleteLead(selectedLead)}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete Prospect
              </button>
              <a
                href={`mailto:${selectedLead.email}`}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition cursor-pointer flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                Send Email
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── 1. Import Excel / CSV Spreadsheet Modal ── */}
      {showImportModal && (
        <div
          onClick={() => setShowImportModal(false)}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl p-6 space-y-5 cursor-default relative"
          >
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Import Leads Spreadsheet</h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">Inject batch prospect records directly into database</p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-4">
              {/* File Dropzone */}
              <div className="border-2 border-dashed border-slate-300 dark:border-neutral-800 rounded-xl p-6 text-center hover:border-indigo-500 transition cursor-pointer bg-slate-50/50 dark:bg-neutral-900/40 relative">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <FileSpreadsheet className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
                {importFile ? (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-xs mx-auto">{importFile.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{(importFile.size / 1024).toFixed(1)} KB — Ready to Inject</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-700 dark:text-neutral-200">Click or drag `.xlsx`, `.xls` or `.csv` spreadsheet</p>
                    <p className="text-[10px] text-slate-400">Auto-resolves Name, Email, Phone, City, Website &amp; Category columns</p>
                  </div>
                )}
              </div>

              {uploadResult && (
                <div className={`p-3 rounded-xl text-xs font-mono border ${
                  uploadResult.startsWith("Error")
                    ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400"
                    : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                }`}>
                  {uploadResult}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!importFile || uploading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition cursor-pointer flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Injecting Leads...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Inject to Database</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 2. Add Lead Manual Form Modal ── */}
      {showAddLeadModal && (
        <div
          onClick={() => setShowAddLeadModal(false)}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl p-6 space-y-4 cursor-default relative"
          >
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center shadow-md">
                  <User className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Lead Record</h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">Manually insert a prospect into database</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddLeadModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSingleLead} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-neutral-300 mb-1">Business / Lead Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nexus Tech Studios"
                  value={newLeadForm.bussiness_name}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, bussiness_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-neutral-300 mb-1">Business Email</label>
                  <input
                    type="email"
                    placeholder="contact@nexus.com"
                    value={newLeadForm.bussiness_email}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, bussiness_email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-neutral-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 555-0192"
                    value={newLeadForm.bussiness_number}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, bussiness_number: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-neutral-300 mb-1">City / Location</label>
                  <input
                    type="text"
                    placeholder="New York"
                    value={newLeadForm.scraped_city}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, scraped_city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-neutral-300 mb-1">Service / Keyword</label>
                  <input
                    type="text"
                    placeholder="Web Development"
                    value={newLeadForm.scraped_service}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, scraped_service: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-neutral-300 mb-1">Website URL</label>
                <input
                  type="text"
                  placeholder="https://nexus.com"
                  value={newLeadForm.bussiness_website}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, bussiness_website: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingNewLead}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition cursor-pointer flex items-center gap-2"
                >
                  {submittingNewLead ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Save Lead to DB</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
