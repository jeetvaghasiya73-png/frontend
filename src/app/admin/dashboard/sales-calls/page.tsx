"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/lib/authStore";
import { authFetch, API } from "@/lib/authFetch";
import { PhoneCall, MessageSquare, CheckCircle2, User, Building, MapPin, Star, ExternalLink, Loader2, Phone } from "lucide-react";
import { format10DigitPhone, formatDialerUrl, formatWebsiteUrl } from "@/lib/formatters";

interface ScrapedLead {
  id: number;
  bussiness_name: string;
  bussiness_number: string;
  scraped_city: string;
  rating: string;
  total_review: string;
  bussiness_website: string;
  primary_category: string;
  whatsapp_status: string | null;
  whatsapp_sent_at: string | null;
}

export default function SalesCallingDashboard() {
  const { accessToken } = useAuthStore();
  const [leads, setLeads] = useState<ScrapedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<number | null>(null);

  const fetchUncontactedLeads = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch scraped leads. In a real app we'd pass a filter for uncontacted.
      // For now we'll fetch page 1 and filter locally, or rely on a backend filter if one existed.
      // Easiest is to fetch the latest scraped leads and show the ones without whatsapp_status='sent'
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
    setMarkingId(id);
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
      setMarkingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-5 rounded-md border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Sales Calling</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Quick-dial uncontacted leads & track outreach</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs font-semibold px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {leads.length} Pending Calls
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
          <p className="text-sm">Loading your call list...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white dark:bg-[#0f172a] rounded-md border border-slate-200 dark:border-slate-800 shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 opacity-50 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Caught Up!</h3>
          <p className="text-sm mt-2 text-slate-500">There are no uncontacted leads in your queue.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.map((lead) => (
            <div key={lead.id} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-md p-5 flex flex-col hover:border-emerald-500/50 transition-colors shadow-sm relative group">
              
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <Building className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1" title={lead.bussiness_name || "Unknown Business"}>
                      {lead.bussiness_name || "Unknown Business"}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {lead.scraped_city || "Unknown City"}</span>
                      {lead.rating && <span className="flex items-center gap-0.5 text-amber-500"><Star className="w-3 h-3 fill-current" /> {lead.rating}</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-2 space-y-2 flex-grow">
                {lead.primary_category && (
                  <div className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-semibold rounded-sm">
                    {lead.primary_category}
                  </div>
                )}
                
                {lead.bussiness_website && (
                  <a href={formatWebsiteUrl(lead.bussiness_website)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline w-fit">
                    <ExternalLink className="w-3.5 h-3.5" /> Visit Website
                  </a>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                <div className="flex gap-2 w-full">
                  <a
                    href={formatDialerUrl(lead.bussiness_number)}
                    className="flex-1 flex justify-center items-center gap-2 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-200 transition"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Now
                  </a>
                  
                  <a
                    href={`https://wa.me/${format10DigitPhone(lead.bussiness_number)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex justify-center items-center gap-2 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded font-bold text-xs transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                </div>
                
                <button
                  onClick={() => handleMarkContacted(lead.id)}
                  disabled={markingId === lead.id}
                  className="w-full flex justify-center items-center gap-2 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded font-bold text-xs transition disabled:opacity-50"
                >
                  {markingId === lead.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Mark Contacted
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
