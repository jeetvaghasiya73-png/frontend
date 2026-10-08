"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/lib/authStore";
import { authFetch, API } from "@/lib/authFetch";
import { Heart, Building, MapPin, ExternalLink, Loader2, Phone, MessageSquare, ShieldCheck } from "lucide-react";
import { format10DigitPhone, formatDialerUrl, formatWebsiteUrl } from "@/lib/formatters";

interface InterestedLead {
  id: string;
  business_name: string;
  phone_formatted: string;
  normalized_phone: string;
  email: string;
  city: string;
  website: string;
  primary_category: string;
  interested_source: string | null;
  interested_by_user_id: number | null;
  created_at: string;
  lead_status: string;
}

export default function InterestedLeadsDashboard() {
  const { user } = useAuthStore();
  const [leads, setLeads] = useState<InterestedLead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInterestedLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/api/v1/leads/?lead_status=INTERESTED&limit=100`);
      if (res.ok) {
        const data = await res.json();
        // Assuming backend returns an array directly, but check if paginated
        const leadsData = Array.isArray(data) ? data : data.leads || [];
        setLeads(leadsData);
      }
    } catch (err) {
      console.error("Failed to fetch interested leads", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterestedLeads();
  }, [fetchInterestedLeads]);

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-5 rounded-lg border border-slate-100 dark:border-slate-800/60 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Interested Leads</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Leads marked as interested via WhatsApp or Sales Calls</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-[6px] border border-emerald-200/60 dark:border-emerald-800/40 flex items-center gap-1.5">
            {leads.length} Interested
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white dark:bg-[#0f172a] rounded-lg border border-slate-100 dark:border-slate-800/60 shadow-sm">
          <Loader2 className="w-6 h-6 animate-spin mb-3 text-emerald-500" />
          <p className="text-xs font-medium">Loading interested leads...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white dark:bg-[#0f172a] rounded-lg border border-slate-100 dark:border-slate-800/60 shadow-sm">
          <ShieldCheck className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Interested Leads Yet</h3>
          <p className="text-xs mt-1 text-slate-500">Keep dialing! Interested leads will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {leads.map((lead) => (
            <div key={lead.id} className="bg-white dark:bg-[#0f172a] border border-emerald-200/50 dark:border-emerald-800/40 rounded-lg p-5 flex flex-col shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2">
                <span className="text-[9px] font-bold px-2 py-1 bg-slate-50 dark:bg-slate-800/50 text-slate-500 rounded-bl-lg">
                  {lead.interested_source === 'SALES_CALL' ? 'Via Sales Call' : 'Via WhatsApp'}
                </span>
              </div>
              <div className="flex justify-between items-start mb-3 mt-1">
                <div className="flex items-start gap-2.5 w-full">
                  <div className="w-8 h-8 rounded-[6px] bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/20">
                    <Building className="w-4 h-4" />
                  </div>
                  <div className="w-full pr-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                      {lead.business_name || "Unknown Business"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                      {lead.city && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3 text-slate-400" /> {lead.city}</span>}
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
                  <a href={formatWebsiteUrl(lead.website)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 w-fit mt-0.5">
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
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
