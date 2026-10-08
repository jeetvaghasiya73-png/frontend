"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/lib/authStore";
import { authFetch, API } from "@/lib/authFetch";
import { PhoneCall, MessageSquare, CheckCircle2, Building, MapPin, Star, ExternalLink, Loader2, Phone, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { format10DigitPhone, formatDialerUrl, formatWebsiteUrl } from "@/lib/formatters";
import { ADMIN_PATH } from "@/lib/config";

interface ScrapedLead {
  id: number;
  bussiness_name: string;
  bussiness_number: string;
  bussiness_email: string;
  scraped_city: string;
  rating: string;
  total_review: string;
  bussiness_website: string;
  primary_category: string;
  category: string;
  bussiness_address: string;
  whatsapp_status: string | null;
  whatsapp_sent_at: string | null;
}

export default function SalesCallingDashboard() {
  const { user } = useAuthStore();
  const [leads, setLeads] = useState<ScrapedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);

  const fetchUncontactedLeads = useCallback(async (pageNumber: number) => {
    setLoading(true);
    try {
      // Use status=pending to only get leads who have NOT been sent any messages
      const res = await authFetch(`${API}/api/v1/scraped-leads/?page=${pageNumber}&limit=12&status=pending`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
        setTotalPages(data.pages || 1);
        setTotalLeads(data.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch uncontacted leads", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUncontactedLeads(page);
  }, [fetchUncontactedLeads, page]);

  const handleMarkContacted = async (id: number) => {
    setProcessingId(id);
    try {
      await authFetch(`${API}/api/v1/scraped-leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp_status: "sent", whatsapp_sent_at: new Date().toISOString() })
      });
      // Remove from current view
      setLeads((prev) => prev.filter(l => l.id !== id));
      setTotalLeads((prev) => prev > 0 ? prev - 1 : 0);
    } catch (err) {
      console.error("Failed to mark contacted", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkInterested = async (id: number) => {
    if (!user) return;
    setProcessingId(id);
    try {
      await authFetch(`${API}/api/v1/leads/${id}/mark-interested`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "SALES_CALL", user_id: user.id })
      });
      setLeads((prev) => prev.filter(l => l.id !== id));
      setTotalLeads((prev) => prev > 0 ? prev - 1 : 0);
    } catch (err) {
      console.error("Failed to mark interested", err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-5 rounded-lg border border-slate-100 dark:border-slate-800/60 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Sales Calling</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Quick-dial uncontacted leads</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a href={`${ADMIN_PATH}/dashboard/sales-calls/interested`} className="text-xs font-semibold px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-[6px] border border-emerald-200/60 dark:border-emerald-800/40 hover:bg-emerald-100 transition-colors">
            View Interested
          </a>
          <div className="text-xs font-semibold px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-[6px] border border-indigo-200/60 dark:border-indigo-800/40 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            {totalLeads} Pending
          </div>
        </div>
      </header>

      {loading && leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white dark:bg-[#0f172a] rounded-lg border border-slate-100 dark:border-slate-800/60 shadow-sm">
          <Loader2 className="w-6 h-6 animate-spin mb-3 text-indigo-500" />
          <p className="text-xs font-medium">Loading call queue...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white dark:bg-[#0f172a] rounded-lg border border-slate-100 dark:border-slate-800/60 shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 opacity-40 mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Caught Up!</h3>
          <p className="text-xs mt-1 text-slate-500">No uncontacted leads found in your queue.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {leads.map((lead) => (
              <div key={lead.id} className="bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-slate-800/60 rounded-lg p-5 flex flex-col shadow-sm hover:shadow-md hover:border-indigo-500/20 dark:hover:border-indigo-500/30 transition-all group">
                
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-2.5 w-full">
                    <div className="w-8 h-8 rounded-[6px] bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/30">
                      <Building className="w-4 h-4" />
                    </div>
                    <div className="w-full pr-1">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight" title={lead.bussiness_name || "Unknown Business"}>
                        {lead.bussiness_name || "Unknown Business"}
                      </h3>
                      <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                        {lead.bussiness_number ? `+${format10DigitPhone(lead.bussiness_number)}` : "No Number"}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        {lead.scraped_city && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3 text-slate-400" /> {lead.scraped_city}</span>}
                        {lead.rating && lead.rating !== "0" && (
                          <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-500">
                            <Star className="w-3 h-3 fill-current" /> {lead.rating} 
                            <span className="text-slate-400 ml-0.5">({lead.total_review || 0})</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mb-4 flex-grow">
                  {(lead.primary_category || lead.category) && (
                    <div className="inline-flex w-fit px-2 py-0.5 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 text-[10px] font-semibold rounded-[4px] border border-slate-100 dark:border-slate-700/50">
                      {lead.primary_category || lead.category}
                    </div>
                  )}

                  {lead.bussiness_address && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/30 p-2 rounded-[6px] border border-slate-100 dark:border-slate-800/50">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">Address:</span>
                      <span className="line-clamp-2">{lead.bussiness_address}</span>
                    </div>
                  )}
                  
                  {lead.bussiness_website && (
                    <a href={formatWebsiteUrl(lead.bussiness_website)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 w-fit mt-0.5">
                      <ExternalLink className="w-3 h-3" /> Visit Website
                    </a>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/60 flex flex-col gap-2.5">
                  <div className="flex gap-2 w-full">
                    <a
                      href={formatDialerUrl(lead.bussiness_number)}
                      className="flex-1 flex justify-center items-center gap-1.5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-[6px] font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-sm"
                    >
                      <Phone className="w-3 h-3" /> Call
                    </a>
                    
                    <a
                      href={`https://wa.me/${format10DigitPhone(lead.bussiness_number)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex justify-center items-center gap-1.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-[6px] font-bold text-xs transition-colors shadow-sm"
                    >
                      <MessageSquare className="w-3 h-3" /> WhatsApp
                    </a>
                  </div>
                  
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => handleMarkContacted(lead.id)}
                      disabled={processingId === lead.id}
                      className="flex-1 flex justify-center items-center gap-1.5 py-2 bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/70 dark:border-slate-700/60 rounded-[6px] font-bold text-xs transition-all disabled:opacity-50"
                    >
                      {processingId === lead.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                      Contacted
                    </button>

                    <button
                      onClick={() => handleMarkInterested(lead.id)}
                      disabled={processingId === lead.id}
                      className="flex-1 flex justify-center items-center gap-1.5 py-2 bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 rounded-[6px] font-bold text-xs transition-all disabled:opacity-50"
                    >
                      {processingId === lead.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Heart className="w-3 h-3" />}
                      Interested
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 pb-2">
              <span className="text-xs text-slate-500 font-medium">
                Showing {leads.length} of {totalLeads} uncontacted leads
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="p-1.5 rounded-[6px] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Page {page} of {totalPages}
                </span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                  className="p-1.5 rounded-[6px] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
