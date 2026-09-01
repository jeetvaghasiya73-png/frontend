"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "@/lib/authStore";
import { Loader2, Trash2, Mail, Phone, Calendar, Building, Sparkles, Database, Globe, Star, ChevronLeft, ChevronRight, Filter, ChevronDown } from "lucide-react";
import { authFetch, API } from "@/lib/authFetch";

type SourceFilter = "all" | "inquiry" | "scraped";

interface NormalizedLead {
  id: number;
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
}

const LEADS_PER_PAGE = 12;

export default function LeadsManager() {
  const { accessToken } = useAuthStore();
  const [allLeads, setAllLeads] = useState<NormalizedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Track expanded state for phone numbers per lead card
  const [expandedPhones, setExpandedPhones] = useState<Record<string, boolean>>({});
  const togglePhones = (id: string) => {
    setExpandedPhones(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchLeads = async () => {
    try {
      const inquiryRes = await authFetch(`${API}/api/v1/leads/`);
      const inquiryData: any[] = inquiryRes.ok ? await inquiryRes.json() : [];

      const scrapedRes = await authFetch(`${API}/api/v1/scraped-leads/?page=1&limit=100`);
      const scrapedJson = scrapedRes.ok ? await scrapedRes.json() : { leads: [], total: 0 };
      const scrapedData: any[] = scrapedJson.leads || [];

      const normalizedInquiries: NormalizedLead[] = inquiryData.map((lead: any) => ({
        id: lead.id,
        name: lead.name || "Unknown",
        email: lead.email || "",
        phone: lead.phone || "",
        company: lead.company || "",
        services: lead.services || [],
        message: lead.message || "",
        status: lead.status || "pending",
        created_at: lead.created_at,
        source: "inquiry" as const,
      }));

      const normalizedScraped: NormalizedLead[] = scrapedData.map((lead: any) => ({
        id: lead.id + 100000,
        name: lead.bussiness_name || "Unknown Business",
        email: lead.bussiness_email || "",
        phone: lead.bussiness_number || "",
        company: lead.scraped_city || "",
        services: lead.scraped_service ? [lead.scraped_service] : [],
        message: "",
        status: "scraped",
        created_at: lead.created_at,
        source: "scraped" as const,
        rating: lead.rating || "",
        website: lead.bussiness_website || "",
        city: lead.scraped_city || "",
        category: lead.category || "",
        email_status: lead.email_status || "pending",
      }));

      const merged = [...normalizedInquiries, ...normalizedScraped];
      merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setAllLeads(merged);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [accessToken]);

  // Reset page and status filter when source changes
  useEffect(() => {
    setCurrentPage(1);
    setStatusFilter("all");
  }, [sourceFilter]);

  const handleStatusChange = async (leadId: number, currentStatus: string, newStatus: string) => {
    if (currentStatus === newStatus) return;
    const lead = allLeads.find(l => l.id === leadId);
    if (!lead) return;
    setUpdatingId(leadId);
    try {
      if (lead.source === "inquiry") {
        const response = await authFetch(`${API}/api/v1/leads/${leadId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus })
        });
        if (response.ok) {
          setAllLeads(allLeads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
        }
      } else {
        const response = await authFetch(`${API}/api/v1/scraped-leads/${leadId - 100000}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email_status: newStatus })
        });
        if (response.ok) {
          setAllLeads(allLeads.map(l => l.id === leadId ? { ...l, email_status: newStatus } : l));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (lead: NormalizedLead) => {
    if (!confirm("Delete this lead permanently?")) return;
    try {
      const endpoint = lead.source === "inquiry"
        ? `${API}/api/v1/leads/${lead.id}`
        : `${API}/api/v1/scraped-leads/${lead.id - 100000}`;
      const response = await authFetch(endpoint, { method: "DELETE" });
      if (response.ok) {
        setAllLeads(prev => prev.filter(l => l.id !== lead.id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLeads = allLeads.filter(lead => {
    if (sourceFilter !== "all" && lead.source !== sourceFilter) return false;
    if (statusFilter !== "all") {
      const activeStatus = lead.source === "inquiry" ? lead.status : (lead.email_status || "pending");
      if (activeStatus.toLowerCase() !== statusFilter.toLowerCase()) return false;
    }
    return true;
  });

  const statusOptions = useMemo(() => {
    if (sourceFilter === "inquiry") {
      return [
        { value: "all", label: "All Statuses" },
        { value: "pending", label: "Pending" },
        { value: "contacting", label: "Contacting" },
        { value: "qualified", label: "Qualified" },
        { value: "closed", label: "Closed" }
      ];
    } else if (sourceFilter === "scraped") {
      return [
        { value: "all", label: "All Statuses" },
        { value: "pending", label: "Pending" },
        { value: "sent", label: "Sent" },
        { value: "failed", label: "Failed" }
      ];
    } else {
      return [
        { value: "all", label: "All Statuses" },
        { value: "pending", label: "Pending" },
        { value: "contacting", label: "Contacting" },
        { value: "qualified", label: "Qualified" },
        { value: "closed", label: "Closed" },
        { value: "sent", label: "Sent (Scraped)" },
        { value: "failed", label: "Failed (Scraped)" }
      ];
    }
  }, [sourceFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / LEADS_PER_PAGE));
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * LEADS_PER_PAGE,
    currentPage * LEADS_PER_PAGE
  );

  const inquiryCount = allLeads.filter(l => l.source === "inquiry").length;
  const scrapedCount = allLeads.filter(l => l.source === "scraped").length;

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center flex-col gap-3">
        <Loader2 className="w-8 h-8 text-accent-custom animate-spin" />
        <span className="font-mono text-xs text-gray-500 dark:text-[#B0B0B0]">Syncing Leads database...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Leads Manager
          </h1>
          <p className="text-xs text-gray-550 dark:text-[#B0B0B0] mt-1 font-mono">
            {filteredLeads.length} leads &middot; Page {currentPage} of {totalPages}
          </p>
        </div>

        {/* Filters Deck */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-8 pr-8 py-1.5 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-lg text-xs font-bold text-gray-700 dark:text-white focus:outline-none focus:border-accent-custom cursor-pointer appearance-none"
            >
              {statusOptions.map((opt: { value: string; label: string }) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Source Tabs */}
          <div className="flex items-center gap-1.5 border border-gray-250 dark:border-white/10 p-1 bg-gray-50 dark:bg-black/20 rounded-xl">
            {([
              { key: "all" as SourceFilter, label: "All", count: allLeads.length, icon: null },
              { key: "inquiry" as SourceFilter, label: "Inquiries", count: inquiryCount, icon: <Sparkles className="w-3 h-3" /> },
              { key: "scraped" as SourceFilter, label: "Scraped", count: scrapedCount, icon: <Database className="w-3 h-3" /> },
            ]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setSourceFilter(tab.key)}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  sourceFilter === tab.key
                    ? "bg-accent-custom text-white shadow-sm"
                    : "text-gray-550 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {tab.icon}
                {tab.label}
                <span className={`ml-0.5 text-[10px] ${sourceFilter === tab.key ? "text-white/70" : "text-gray-450 dark:text-gray-500"}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leads Grid */}
      {paginatedLeads.length === 0 ? (
        <div className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111111] p-12 rounded-xl text-center shadow-sm">
          <p className="text-sm text-gray-500 dark:text-[#B0B0B0] font-mono">No leads found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginatedLeads.map((lead) => (
            <div
              key={`${lead.source}-${lead.id}`}
              className={`group border rounded-xl p-4 bg-white dark:bg-[#111111] transition-all duration-200 shadow-sm hover:shadow-md ${
                lead.source === "inquiry" && lead.status === "pending"
                  ? "border-accent-custom/40"
                  : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
              }`}
            >
              {/* Top row: Name + Actions */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate leading-tight">
                    {lead.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {/* Source badge */}
                     {lead.source === "scraped" ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] uppercase font-bold font-mono bg-teal-500/10 text-teal-500 border border-teal-500/20 px-1.5 py-px rounded-full">
                          Scraped
                        </span>
                        <span className={`text-[8px] uppercase font-bold font-mono px-1.5 py-px rounded-full border ${
                          lead.email_status === "sent" ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" :
                          lead.email_status === "failed" ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" :
                          "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
                        }`}>
                          {lead.email_status || "pending"}
                        </span>
                      </div>
                    ) : (
                      <span className={`text-[8px] uppercase font-bold font-mono px-1.5 py-px rounded-full border ${
                        lead.status === "pending" ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20" :
                        lead.status === "contacting" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" :
                        lead.status === "qualified" ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" :
                        "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20"
                      }`}>
                        {lead.status}
                      </span>
                    )}
                    {lead.rating && (
                      <span className="flex items-center gap-0.5 text-[10px] text-yellow-500 font-semibold">
                        <Star className="w-2.5 h-2.5 fill-yellow-500" /> {lead.rating}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {lead.source === "inquiry" ? (
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, lead.status, e.target.value)}
                      className="bg-transparent border border-gray-200 dark:border-white/10 rounded px-1.5 py-0.5 text-[10px] text-gray-700 dark:text-gray-300 focus:outline-none focus:border-accent-custom cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="contacting">Contacting</option>
                      <option value="qualified">Qualified</option>
                      <option value="closed">Closed</option>
                    </select>
                  ) : (
                    <select
                      value={lead.email_status || "pending"}
                      onChange={(e) => handleStatusChange(lead.id, lead.email_status || "pending", e.target.value)}
                      className="bg-transparent border border-gray-200 dark:border-white/10 rounded px-1.5 py-0.5 text-[10px] text-gray-700 dark:text-gray-300 focus:outline-none focus:border-accent-custom cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="sent">Sent</option>
                      <option value="failed">Failed</option>
                    </select>
                  )}
                  <button
                    onClick={() => handleDelete(lead)}
                    className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Contact details */}
              <div className="space-y-2 text-[11px] text-gray-500 dark:text-[#999]">
                {(() => {
                  const emails = lead.email ? lead.email.replace(/\r\n/g, ";").replace(/\n/g, ";").split(";").map((e: string) => e.trim()).filter(Boolean) : [];
                  const phones = lead.phone ? lead.phone.replace(/\r\n/g, ";").replace(/\n/g, ";").split(";").map((p: string) => p.trim()).filter(Boolean) : [];
                  const isExpanded = !!expandedPhones[`${lead.source}-${lead.id}`];
                  const visiblePhones = isExpanded ? phones : phones.slice(0, 2);

                  return (
                    <div className="flex flex-col gap-2">
                      {emails.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {emails.map((email: string, idx: number) => (
                            <a
                              key={`email-${idx}`}
                              href={`mailto:${email}`}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-50 dark:bg-white/3 border border-gray-200 dark:border-white/5 hover:text-accent-custom hover:border-accent-custom/30 transition-colors truncate max-w-[220px]"
                            >
                              <Mail className="w-2.5 h-2.5 shrink-0 text-gray-400 dark:text-[#555]" />
                              <span className="truncate">{email}</span>
                            </a>
                          ))}
                        </div>
                      )}
                      
                      {phones.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {visiblePhones.map((phone: string, idx: number) => (
                            <a
                              key={`phone-${idx}`}
                              href={`tel:${phone.replace(/\s+/g, "")}`}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-50 dark:bg-white/3 border border-gray-200 dark:border-white/5 hover:text-accent-custom hover:border-accent-custom/30 transition-colors font-mono text-[10px]"
                            >
                              <Phone className="w-2.5 h-2.5 shrink-0 text-gray-400 dark:text-[#555]" />
                              <span>{phone}</span>
                            </a>
                          ))}
                          
                          {phones.length > 2 && (
                            <button
                              onClick={() => togglePhones(`${lead.source}-${lead.id}`)}
                              className="text-[10px] text-accent-custom hover:underline cursor-pointer flex items-center gap-0.5 font-semibold"
                            >
                              {isExpanded ? "Show less" : `+${phones.length - 2} more`}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
                {lead.website && (
                  <div className="pt-0.5">
                    <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-50 dark:bg-white/3 border border-gray-200 dark:border-white/5 hover:text-accent-custom hover:border-accent-custom/30 transition-colors truncate max-w-full">
                      <Globe className="w-2.5 h-2.5 shrink-0 text-gray-400 dark:text-[#555]" />
                      <span className="truncate">{lead.website}</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Footer: services + meta */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
                <div className="flex flex-wrap gap-1 min-w-0">
                  {lead.services?.slice(0, 2).map((srv, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-[9px] font-mono font-semibold bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-1.5 py-px rounded text-gray-600 dark:text-gray-300 truncate max-w-[100px]"
                    >
                      {srv}
                    </span>
                  ))}
                  {(lead.services?.length || 0) > 2 && (
                    <span className="text-[9px] text-gray-400">+{lead.services!.length - 2}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 shrink-0">
                  <Calendar className="w-2.5 h-2.5" />
                  {new Date(lead.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                </div>
              </div>

              {/* Message preview for inquiry leads */}
              {lead.message && (
                <p className="mt-2 text-[10px] text-gray-400 dark:text-gray-500 line-clamp-2 leading-relaxed">
                  {lead.message}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111111] flex items-center justify-center text-gray-500 dark:text-gray-400 hover:border-accent-custom hover:text-accent-custom disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(page => {
              // Show first, last, current, and neighbors
              if (page === 1 || page === totalPages) return true;
              if (Math.abs(page - currentPage) <= 1) return true;
              return false;
            })
            .reduce<(number | "dots")[]>((acc, page, idx, arr) => {
              if (idx > 0 && page - (arr[idx - 1] as number) > 1) {
                acc.push("dots");
              }
              acc.push(page);
              return acc;
            }, [])
            .map((item, idx) =>
              item === "dots" ? (
                <span key={`dots-${idx}`} className="text-xs text-gray-400 px-1">…</span>
              ) : (
                <button
                  key={item}
                  onClick={() => setCurrentPage(item as number)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    currentPage === item
                      ? "bg-accent-custom text-white shadow-sm"
                      : "border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111111] text-gray-600 dark:text-gray-400 hover:border-accent-custom/50"
                  }`}
                >
                  {item}
                </button>
              )
            )}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111111] flex items-center justify-center text-gray-500 dark:text-gray-400 hover:border-accent-custom hover:text-accent-custom disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
