"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/lib/authStore";
import { authFetch, API } from "@/lib/authFetch";
import { PhoneCall, MessageSquare, CheckCircle2, Building, MapPin, Star, ExternalLink, Loader2, Phone, Sparkles, Heart } from "lucide-react";
import { format10DigitPhone, formatDialerUrl, formatWebsiteUrl } from "@/lib/formatters";

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
  const { accessToken, user } = useAuthStore();
  const [leads, setLeads] = useState<ScrapedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchUncontactedLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/api/v1/scraped-leads/?page=1&limit=100`);
      if (res.ok) {
        const data = await res.json();
        const uncontacted = (data.leads || []).filter((l: any) => !l.whatsapp_status || l.whatsapp_status === 'pending');
        setLeads(uncontacted);
      }
    } catch (err) {
      console.error("Failed to fetch uncontacted leads", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUncontactedLeads();
  }, [fetchUncontactedLeads]);

  const handleMarkContacted = async (id: number) => {
    setProcessingId(id);
    try {
      await authFetch(`${API}/api/v1/scraped-leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp_status: "sent", whatsapp_sent_at: new Date().toISOString() })
      });
      setLeads((prev) => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error("Failed to mark contacted", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkInterested = async (id: number | string) => {
    if (!user) return;
    setProcessingId(Number(id));
    try {
      await authFetch(`${API}/api/v1/leads/${id}/mark-interested`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "SALES_CALL", user_id: user.id })
      });
      setLeads((prev) => prev.filter(l => l.id !== Number(id)));
    } catch (err) {
      console.error("Failed to mark interested", err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Sales Calling</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Quick-dial uncontacted leads & track outreach</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href="/admin/dashboard/sales-calls/interested" className="text-sm font-semibold px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 transition-colors">
            View Interested
          </a>
          <div className="text-sm font-semibold px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full border border-indigo-200 dark:border-indigo-800/50 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            {leads.length} Pending Calls
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
          <p className="text-sm font-medium">Loading your call list...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-400 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 opacity-50 mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">All Caught Up!</h3>
          <p className="text-sm mt-2 text-slate-500">There are no uncontacted leads in your queue.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {leads.map((lead) => (
            <div key={lead.id} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all group">
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3 w-full">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Building className="w-5 h-5" />
                  </div>
                  <div className="w-full pr-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight" title={lead.bussiness_name || "Unknown Business"}>
                      {lead.bussiness_name || "Unknown Business"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                      {lead.scraped_city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {lead.scraped_city}</span>}
                      {lead.rating && lead.rating !== "0" && (
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current" /> {lead.rating} 
                          <span className="text-slate-400">({lead.total_review || 0})</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 mb-5 flex-grow">
                {(lead.primary_category || lead.category) && (
                  <div className="inline-flex w-fit px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-700/50">
                    {lead.primary_category || lead.category}
                  </div>
                )}

                {lead.bussiness_address && (
                  <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Address:</span>
                    {lead.bussiness_address}
                  </div>
                )}
                
                {lead.bussiness_website && (
                  <a href={formatWebsiteUrl(lead.bussiness_website)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 w-fit mt-1">
                    <ExternalLink className="w-4 h-4" /> Visit Website
                  </a>
                )}
              </div>

              <div className="mt-auto pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                <div className="flex gap-3 w-full">
                  <a
                    href={formatDialerUrl(lead.bussiness_number)}
                    className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
                  >
                    <Phone className="w-4 h-4" /> Call
                  </a>
                  
                  <a
                    href={`https://wa.me/${format10DigitPhone(lead.bussiness_number)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg font-bold text-sm transition-colors shadow-sm shadow-[#25D366]/20"
                  >
                    <MessageSquare className="w-4 h-4" /> WhatsApp
                  </a>
                </div>
                
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => handleMarkContacted(lead.id)}
                    disabled={processingId === lead.id}
                    className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-sm transition-all disabled:opacity-50"
                  >
                    {processingId === lead.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Contacted
                  </button>

                  <button
                    onClick={() => handleMarkInterested(lead.id)}
                    disabled={processingId === lead.id}
                    className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 rounded-lg font-bold text-sm transition-all disabled:opacity-50"
                  >
                    {processingId === lead.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
                    Interested
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
