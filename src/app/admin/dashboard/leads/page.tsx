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
  FileSpreadsheet
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

  // Drawer state
  const [selectedLead, setSelectedLead] = useState<NormalizedLead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
    <div className="space-y-6 text-left pb-20 relative animate-fadeIn font-sans antialiased text-slate-800 dark:text-slate-200">
      
      {/* Top Bar Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0a0a0a] p-5 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-sm">
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-semibold text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-800 transition shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-semibold text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-800 transition shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>Import Sheet</span>
          </button>
          <button
            type="button"
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
      <section className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col">
        
        {/* Controls Deck */}
        <div className="p-4 border-b border-slate-200/80 dark:border-neutral-800 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Segmented View Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <button
              onClick={() => setSourceFilter("all")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                sourceFilter === "all"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200/60 dark:border-slate-700 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All Leads ({allLeads.length})
            </button>
            <button
              onClick={() => setSourceFilter("scraped")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                sourceFilter === "scraped"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200/60 dark:border-slate-700 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Outbound Scraped ({allLeads.filter(l => l.source === "scraped").length})
            </button>
            <button
              onClick={() => setSourceFilter("inquiry")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                sourceFilter === "inquiry"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200/60 dark:border-slate-700 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Website Inquiries ({allLeads.filter(l => l.source === "inquiry").length})
            </button>
          </div>

          {/* Search & Status Controls */}
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, email, city..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition"
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-8 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer appearance-none"
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
          </div>
        </div>

        {/* Lead Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
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
            <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
              {paginatedLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => {
                    setSelectedLead(lead);
                    setIsDrawerOpen(true);
                  }}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition cursor-pointer"
                >
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
              ))}
            </tbody>
          </table>
        </div>

        {paginatedLeads.length === 0 && (
          <div className="text-center py-12 text-xs text-slate-400 font-mono">No matching lead records found.</div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Page <span className="font-semibold text-slate-900 dark:text-white">{currentPage}</span> of{" "}
              <span className="font-semibold text-slate-900 dark:text-white">{totalPages}</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Slide-Over Drawer with Backdrop Click-Outside Close */}
      {isDrawerOpen && selectedLead && (
        <div
          onClick={() => setIsDrawerOpen(false)}
          className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-[#0a0a0a] h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-neutral-800 overflow-y-auto cursor-default"
          >
            <div className="p-6 border-b border-slate-200/80 dark:border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {selectedLead.source === "scraped" ? "Outbound Prospect" : "Inbound Lead"}
                </span>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer transition"
                  title="Close panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shrink-0">
                  {selectedLead.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{selectedLead.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">{selectedLead.company || selectedLead.city || "Client Prospect"}</p>
                </div>
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

            <div className="p-6 border-t border-slate-200/80 dark:border-neutral-800 flex items-center justify-between bg-slate-50/50 dark:bg-neutral-900/40">
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

    </div>
  );
}
