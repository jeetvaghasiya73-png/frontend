"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/lib/authStore";
import { authFetch, API } from "@/lib/authFetch";
import { Heart, Building, MapPin, ExternalLink, Loader2, Phone, MessageSquare, ShieldCheck, CheckCircle2 } from "lucide-react";
import { format10DigitPhone, formatDialerUrl, formatWebsiteUrl } from "@/lib/formatters";
import { ADMIN_PATH } from "@/lib/config";

interface InterestedLead {
  id: string | number;
  business_name: string;
  normalized_phone: string;
  email: string;
  city: string;
  website: string;
  primary_category: string;
  interested_source?: string | null;
  created_at: string;
  status: "interested" | "contacted" | "pending";
  is_scraped: boolean;
}

export default function InterestedLeadsDashboard() {
  const { user } = useAuthStore();
  const [leads, setLeads] = useState<InterestedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("interested");
  const [actionId, setActionId] = useState<string | number | null>(null);

  const fetchLeads = useCallback(async (filter: string) => {
    setLoading(true);
    try {
      const combined: InterestedLead[] = [];

      // 1. Fetch scraped leads with selected status
      try {
        const scrapedRes = await authFetch(`${API}/api/v1/scraped-leads/?limit=100&status=${filter}`);
        if (scrapedRes.ok) {
          const sData = await scrapedRes.json();
          const list = sData.leads || [];
          for (const s of list) {
            combined.push({
              id: s.id,
              business_name: s.bussiness_name || "Unknown Business",
              normalized_phone: s.bussiness_number || "",
              email: s.bussiness_email || "",
              city: s.scraped_city || "",
              website: s.bussiness_website || "",
              primary_category: s.category || s.primary_category || "",
              interested_source: (s.is_interested || s.whatsapp_status === "interested") ? "Via Sales / WhatsApp" : "Sales Lead",
              created_at: s.created_at || new Date().toISOString(),
              status: (s.is_interested || s.whatsapp_status === "interested") ? "interested" : (s.whatsapp_status === "contacted" || s.whatsapp_status === "sent") ? "contacted" : "pending",
              is_scraped: true
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch scraped leads", err);
      }

      // 2. Fetch inbound website leads with selected status
      try {
        const inboundRes = await authFetch(`${API}/api/v1/leads/?limit=100&status=${filter}`);
        if (inboundRes.ok) {
          const iData = await inboundRes.json();
          const list = Array.isArray(iData) ? iData : iData.leads || [];
          for (const i of list) {
            combined.push({
              id: i.id,
              business_name: i.business_name || i.company || i.name || "Inbound Client",
              normalized_phone: i.phone || "",
              email: i.email || "",
              city: i.city || "",
              website: i.website || "",
              primary_category: i.category || (Array.isArray(i.services) ? i.services[0] : "") || "Web Inquiry",
              interested_source: "Via Website Inbound",
              created_at: i.created_at || new Date().toISOString(),
              status: (i.status === "contacted" || i.status === "Contacted") ? "contacted" : "interested",
              is_scraped: false
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch inbound leads", err);
      }

      setLeads(combined);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads(statusFilter);
  }, [fetchLeads, statusFilter]);

  const handleMarkUninterested = async (lead: InterestedLead) => {
    setActionId(lead.id);
    try {
      if (lead.is_scraped) {
        await authFetch(`${API}/api/v1/scraped-leads/${lead.id}/mark-uninterested`, { method: "POST" });
      } else {
        await authFetch(`${API}/api/v1/leads/${lead.id}/mark-uninterested`, { method: "POST" });
      }
      if (statusFilter === "interested") {
        setLeads(prev => prev.filter(l => l.id !== lead.id));
      } else {
        setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: "contacted" } : l));
      }
    } catch (err) {
      console.error("Failed to mark lead as uninterested", err);
    } finally {
      setActionId(null);
    }
  };

  const handleMarkInterested = async (lead: InterestedLead) => {
    setActionId(lead.id);
    try {
      if (lead.is_scraped) {
        await authFetch(`${API}/api/v1/scraped-leads/${lead.id}/mark-interested`, { method: "POST" });
      } else {
        await authFetch(`${API}/api/v1/leads/${lead.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "interested" })
        });
      }
      if (statusFilter === "contacted") {
        setLeads(prev => prev.filter(l => l.id !== lead.id));
      } else {
        setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: "interested" } : l));
      }
    } catch (err) {
      console.error("Failed to mark lead as interested", err);
    } finally {
      setActionId(null);
    }
  };

  const filterTabs = [
    { key: "interested", label: "Interested Leads", color: "emerald" },
    { key: "contacted", label: "Contacted Leads", color: "blue" },
    { key: "all", label: "All Contacts", color: "slate" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-5 rounded-lg border border-slate-100 dark:border-slate-800/60 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {statusFilter === "interested" ? "Interested Leads" : statusFilter === "contacted" ? "Contacted Leads" : "All Leads"}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Filtered status view for leads contacted via WhatsApp and Sales Calling
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-[6px] border transition-colors cursor-pointer ${
                statusFilter === tab.key
                  ? tab.color === "emerald" ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/20"
                  : tab.color === "blue" ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20"
                  : "bg-slate-700 text-white border-slate-700 shadow-sm"
                  : "bg-slate-50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/40 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <a
            href={`${ADMIN_PATH}/dashboard/sales-calls`}
            className="text-xs font-semibold px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-[6px] border border-indigo-200/60 dark:border-indigo-800/40 hover:bg-indigo-100 transition-colors"
          >
            ← Sales Call Queue
          </a>
          <div className="text-xs font-semibold px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-[6px] border border-emerald-200/60 dark:border-emerald-800/40 flex items-center gap-1.5">
            {leads.length} Total
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white dark:bg-[#0f172a] rounded-lg border border-slate-100 dark:border-slate-800/60 shadow-sm">
          <Loader2 className="w-6 h-6 animate-spin mb-3 text-emerald-500" />
          <p className="text-xs font-medium">Loading leads...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white dark:bg-[#0f172a] rounded-lg border border-slate-100 dark:border-slate-800/60 shadow-sm">
          <ShieldCheck className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Leads Found
          </h3>
          <p className="text-xs mt-1 text-slate-500">
            {statusFilter === "interested"
              ? "Keep dialing! Leads marked as interested will appear here."
              : "Leads marked as contacted will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {leads.map((lead) => (
            <div
              key={`${lead.is_scraped ? 's' : 'i'}-${lead.id}`}
              className={`bg-white dark:bg-[#0f172a] border rounded-lg p-5 flex flex-col shadow-sm hover:shadow-md transition-all group relative overflow-hidden ${
                lead.status === "interested"
                  ? "border-emerald-200/50 dark:border-emerald-800/40 hover:border-emerald-500/30"
                  : "border-blue-200/50 dark:border-blue-800/40 hover:border-blue-500/30"
              }`}
            >
              <div className="absolute top-0 right-0 p-2">
                <span className={`text-[9px] font-bold px-2 py-1 rounded-bl-lg ${
                  lead.status === "interested"
                    ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                    : "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                }`}>
                  {lead.status === "interested" ? "Interested" : "Contacted"}
                </span>
              </div>
              <div className="flex justify-between items-start mb-3 mt-1">
                <div className="flex items-start gap-2.5 w-full">
                  <div className={`w-8 h-8 rounded-[6px] flex items-center justify-center shrink-0 border ${
                    lead.status === "interested"
                      ? "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/20"
                      : "bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/20"
                  }`}>
                    <Building className="w-4 h-4" />
                  </div>
                  <div className="w-full pr-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                      {lead.business_name || "Unknown Business"}
                    </h3>
                    <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                      {lead.normalized_phone ? `+${format10DigitPhone(lead.normalized_phone)}` : "No Number"}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                      {lead.city && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3 text-slate-400" /> {lead.city}</span>}
                      {lead.interested_source && <span className="text-slate-400">{lead.interested_source}</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-4 flex-grow">
                {lead.primary_category && (
                  <div className="inline-flex w-fit px-2 py-0.5 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 text-[10px] font-semibold rounded-[4px] border border-slate-100 dark:border-slate-700/50">
                    {lead.primary_category}
                  </div>
                )}
                
                {lead.website && (
                  <a href={formatWebsiteUrl(lead.website) || "#"} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 w-fit mt-0.5">
                    <ExternalLink className="w-3 h-3" /> Visit Website
                  </a>
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/60 flex flex-col gap-2.5">
                <div className="flex gap-2 w-full">
                  <a
                    href={formatDialerUrl(lead.normalized_phone || "")}
                    className="flex-1 flex justify-center items-center gap-1.5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-[6px] font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-sm"
                  >
                    <Phone className="w-3 h-3" /> Call Back
                  </a>
                  
                  <a
                    href={`https://wa.me/${format10DigitPhone(lead.normalized_phone || "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex justify-center items-center gap-1.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-[6px] font-bold text-xs transition-colors shadow-sm"
                  >
                    <MessageSquare className="w-3 h-3" /> Message
                  </a>
                </div>

                <div className="flex gap-2 w-full">
                  {lead.status === "interested" ? (
                    <button
                      onClick={() => handleMarkUninterested(lead)}
                      disabled={actionId === lead.id}
                      className="w-full flex justify-center items-center gap-1.5 py-2 bg-rose-50 dark:bg-rose-900/10 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40 rounded-[6px] font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {actionId === lead.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                      Move to Contacted (Not Interested)
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMarkInterested(lead)}
                      disabled={actionId === lead.id}
                      className="w-full flex justify-center items-center gap-1.5 py-2 bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 rounded-[6px] font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {actionId === lead.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                      Mark as Interested
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
