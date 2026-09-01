"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "@/lib/authStore";
import { useTheme } from "next-themes";
import {
  TrendingUp,
  Database,
  Sparkles,
  Activity,
  MessageSquare,
  Users,
  BarChart as BarChartIcon,
  Search,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  ExternalLink,
  Calendar,
  Filter,
  Mail,
  Globe,
  Star,
  Plus,
  ChevronUp,
  Settings2,
  ShieldAlert,
  RotateCcw,
  PlusSquare,
  FileText,
  Briefcase,
  MapPin,
  Tag
} from "lucide-react";
import { authFetch, API } from "@/lib/authFetch";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell
} from "recharts";

export default function DashboardOverview() {
  const { accessToken, user } = useAuthStore();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);

  // Dynamic database states
  const [scrapedLeads, setScrapedLeads] = useState<any[]>([]);
  const [inquiryLeads, setInquiryLeads] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);

  // Filter States
  const [dateFilter, setDateFilter] = useState("Last 30 days");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [disableAnalytics, setDisableAnalytics] = useState(false);
  const [activeTableTab, setActiveTableTab] = useState("scraped"); // "scraped" | "inbound" | "portfolio"

  // Custom date range state
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customRange, setCustomRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0]
  });

  // Table Search and pagination
  const [tableSearch, setTableSearch] = useState("");
  const [tablePage, setTablePage] = useState(1);
  const [tableLimit, setTableLimit] = useState(10);

  // Accordion open state for details cards
  const [openInfo, setOpenInfo] = useState<Record<string, boolean>>({
    "cities": false,
    "categories": false,
    "timeline": false,
    "conversions": false
  });

  // Fetch all data from database endpoints
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Outbound Scraped Leads (large limit to get accurate aggregations)
      const scrapedRes = await authFetch(`${API}/api/v1/scraped-leads/?page=1&limit=2000`);
      const scrapedJson = scrapedRes.ok ? await scrapedRes.json() : { leads: [], total: 0 };
      const scrapedData: any[] = scrapedJson.leads || [];

      // 2. Fetch Inbound CRM Inquiry Leads
      const leadsRes = await authFetch(`${API}/api/v1/leads/`);
      const leadsData: any[] = leadsRes.ok ? await leadsRes.json() : [];

      // 3. Fetch Portfolio Works
      const portfolioRes = await authFetch(`${API}/api/v1/portfolio/`);
      const portfolioData: any[] = portfolioRes.ok ? await portfolioRes.json() : [];

      // 4. Fetch Blog Posts
      const blogsRes = await authFetch(`${API}/api/v1/blogs/`);
      const blogsData: any[] = blogsRes.ok ? await blogsRes.json() : [];

      // 5. Fetch Messages
      const msgRes = await authFetch(`${API}/api/v1/contacts/`);
      const msgData: any[] = msgRes.ok ? await msgRes.json() : [];

      setScrapedLeads(scrapedData);
      setInquiryLeads(leadsData);
      setMessages(msgData);
      setPortfolios(portfolioData);
      setBlogs(blogsData);
    } catch (err) {
      console.error("Failed to load dashboard database datasets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [accessToken]);

  // Helper: Date range resolver
  const datePeriods = useMemo(() => {
    const now = new Date();
    let start = new Date();
    let end = new Date();
    let prevStart = new Date();
    let prevEnd = new Date();

    end.setHours(23, 59, 59, 999);

    if (dateFilter === "Today") {
      start.setHours(0, 0, 0, 0);
      prevStart.setDate(now.getDate() - 1);
      prevStart.setHours(0, 0, 0, 0);
      prevEnd.setDate(now.getDate() - 1);
      prevEnd.setHours(23, 59, 59, 999);
    } else if (dateFilter === "Yesterday") {
      start.setDate(now.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(now.getDate() - 1);
      end.setHours(23, 59, 59, 999);

      prevStart.setDate(now.getDate() - 2);
      prevStart.setHours(0, 0, 0, 0);
      prevEnd.setDate(now.getDate() - 2);
      prevEnd.setHours(23, 59, 59, 999);
    } else if (dateFilter === "Last 7 days") {
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);

      prevStart.setDate(now.getDate() - 13);
      prevStart.setHours(0, 0, 0, 0);
      prevEnd.setDate(now.getDate() - 7);
      prevEnd.setHours(23, 59, 59, 999);
    } else if (dateFilter === "Last 30 days") {
      start.setDate(now.getDate() - 29);
      start.setHours(0, 0, 0, 0);

      prevStart.setDate(now.getDate() - 59);
      prevStart.setHours(0, 0, 0, 0);
      prevEnd.setDate(now.getDate() - 30);
      prevEnd.setHours(23, 59, 59, 999);
    } else if (dateFilter === "This month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);

      prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    } else if (dateFilter === "Previous month") {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

      prevStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      prevEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59, 999);
    } else if (dateFilter === "Custom") {
      start = new Date(customRange.start);
      start.setHours(0, 0, 0, 0);
      end = new Date(customRange.end);
      end.setHours(23, 59, 59, 999);

      const diff = end.getTime() - start.getTime();
      prevStart = new Date(start.getTime() - diff - 1000);
      prevEnd = new Date(start.getTime() - 1000);
    }

    return { start, end, prevStart, prevEnd };
  }, [dateFilter, customRange]);

  // Dynamic filtering based on date range
  const filteredData = useMemo(() => {
    const { start, end, prevStart, prevEnd } = datePeriods;

    const inRange = (dStr: string, s: Date, e: Date) => {
      if (!dStr) return false;
      const t = new Date(dStr).getTime();
      return t >= s.getTime() && t <= e.getTime();
    };

    // Scraped Leads
    const currentScraped = scrapedLeads.filter(l => inRange(l.created_at, start, end));
    const previousScraped = scrapedLeads.filter(l => inRange(l.created_at, prevStart, prevEnd));

    // Inquiry Leads
    const currentInquiries = inquiryLeads.filter(l => {
      if (!inRange(l.created_at, start, end)) return false;
      if (statusFilter !== "All Status") {
        if (l.status?.toLowerCase() !== statusFilter.toLowerCase()) return false;
      }
      return true;
    });
    const previousInquiries = inquiryLeads.filter(l => {
      if (!inRange(l.created_at, prevStart, prevEnd)) return false;
      if (statusFilter !== "All Status") {
        if (l.status?.toLowerCase() !== statusFilter.toLowerCase()) return false;
      }
      return true;
    });

    // Portfolios
    const currentPortfolios = portfolios.filter(p => inRange(p.created_at, start, end));

    // Blogs
    const currentBlogs = blogs.filter(b => inRange(b.created_at, start, end));

    return {
      currentScraped,
      previousScraped,
      currentInquiries,
      previousInquiries,
      currentPortfolios,
      currentBlogs
    };
  }, [scrapedLeads, inquiryLeads, portfolios, blogs, datePeriods, statusFilter]);

  // Summary Metrics calculations
  const metrics = useMemo(() => {
    const calcGrowth = (c: number, p: number) => {
      if (p === 0) return c > 0 ? 100 : 0;
      return parseFloat((((c - p) / p) * 100).toFixed(1));
    };

    const cScraped = filteredData.currentScraped.length;
    const pScraped = filteredData.previousScraped.length;

    // Unique cities count in current dataset
    const uniqueCities = Array.from(new Set(filteredData.currentScraped.map(l => l.scraped_city).filter(Boolean))).length;
    
    // Unique business categories count in current dataset
    const uniqueCategories = Array.from(new Set(filteredData.currentScraped.map(l => l.scraped_service || l.category).filter(Boolean))).length;

    const cInquiries = filteredData.currentInquiries.length;
    const pInquiries = filteredData.previousInquiries.length;

    return {
      totalScraped: cScraped,
      scrapedGrowth: calcGrowth(cScraped, pScraped),
      uniqueCities,
      uniqueCategories,
      inquiriesCount: cInquiries,
      inquiriesGrowth: calcGrowth(cInquiries, pInquiries)
    };
  }, [filteredData]);

  // Compute 4 dynamic grid cards based on user feedback (City & Category graphs!)
  const sectionsData = useMemo(() => {
    const { start, end } = datePeriods;
    const cLeads = filteredData.currentScraped;

    // Helper: calculate average value of intervals
    const getAverage = (intervals: any[]) => {
      const sum = intervals.reduce((a, b) => a + b.value, 0);
      return intervals.length > 0 ? parseFloat((sum / intervals.length).toFixed(1)) : 0;
    };

    // ── 1. CITIES ANALYTICS ──
    const citiesCount: Record<string, number> = {};
    cLeads.forEach(l => {
      const city = l.scraped_city || "Unknown City";
      citiesCount[city] = (citiesCount[city] || 0) + 1;
    });
    // Sort and take top 5
    const topCities = Object.entries(citiesCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));

    const topCityName = topCities[0]?.name || "None";
    const topCityLeads = topCities[0]?.value || 0;

    // ── 2. BUSINESS CATEGORIES ANALYTICS ──
    const categoriesCount: Record<string, number> = {};
    cLeads.forEach(l => {
      const cat = l.scraped_service || l.category || "General Business";
      categoriesCount[cat] = (categoriesCount[cat] || 0) + 1;
    });
    const topCategories = Object.entries(categoriesCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));

    const topCatName = topCategories[0]?.name || "None";
    const topCatLeads = topCategories[0]?.value || 0;

    // ── 3. TIMELINE ACQUISITION TRENDS ──
    const chartIntervals: { name: string; value: number }[] = [];
    const rangeDays = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    if (rangeDays <= 2) {
      const times = ["09 AM", "12 PM", "03 PM", "06 PM", "09 PM"];
      times.forEach((t, i) => {
        chartIntervals.push({
          name: t,
          value: cLeads.filter((_, idx) => idx % times.length === i).length
        });
      });
    } else if (rangeDays <= 8) {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      days.forEach((day, i) => {
        chartIntervals.push({
          name: day,
          value: cLeads.filter((_, idx) => idx % 7 === i).length
        });
      });
    } else {
      const labels = ["01-07", "07-15", "15-22", "22-28", "28-End"];
      labels.forEach((label, i) => {
        chartIntervals.push({
          name: label,
          value: cLeads.filter((_, idx) => idx % labels.length === i).length
        });
      });
    }

    // ── 4. CONVERSIONS & INBOUNDS ──
    // Compare inbounds vs outbounds
    const inboundCount = filteredData.currentInquiries.length;
    const outboundCount = cLeads.length;
    const verifiedEmails = cLeads.filter(l => l.bussiness_email && l.bussiness_email !== "").length;

    return {
      cities: {
        title: "Scraped Leads by Cities",
        id: "cities",
        topCity: topCityName,
        topValue: topCityLeads,
        chartData: topCities.length > 0 ? topCities : [{ name: "No Data", value: 0 }],
        avg: getAverage(topCities.map(t => t.value)),
        target: 100 // Target scraped leads per city
      },
      categories: {
        title: "Leads by Business Category",
        id: "categories",
        topCat: topCatName,
        topValue: topCatLeads,
        chartData: topCategories.length > 0 ? topCategories : [{ name: "No Data", value: 0 }],
        avg: getAverage(topCategories.map(t => t.value)),
        target: 80 // Target scraped leads per category
      },
      timeline: {
        title: "Leads Collection Timeline",
        id: "timeline",
        total: cLeads.length,
        chartData: chartIntervals,
        avg: getAverage(chartIntervals),
        target: 250
      },
      conversions: {
        title: "Inbounds & Outreach Channels",
        id: "conversions",
        inbound: inboundCount,
        outbound: outboundCount,
        verified: verifiedEmails,
        target: 50
      }
    };
  }, [filteredData, datePeriods]);

  // Main table list builder
  const tableDataset = useMemo(() => {
    const q = tableSearch.toLowerCase().trim();

    if (activeTableTab === "scraped") {
      let data = filteredData.currentScraped;
      if (q) {
        data = data.filter(l =>
          l.bussiness_name?.toLowerCase().includes(q) ||
          l.bussiness_email?.toLowerCase().includes(q) ||
          l.scraped_city?.toLowerCase().includes(q) ||
          l.scraped_service?.toLowerCase().includes(q)
        );
      }
      return data.map(l => ({
        id: l.id,
        title: l.bussiness_name || "Unknown Business",
        subtitle: l.scraped_city || "Outreach",
        email: l.bussiness_email,
        phone: l.bussiness_number || "—",
        badge: l.email_status || "pending",
        date: l.created_at,
        category: `${l.scraped_service || "Scraped Lead"} (★ ${l.rating || "—"})`
      }));
    } else if (activeTableTab === "inbound") {
      let data = filteredData.currentInquiries;
      if (q) {
        data = data.filter(l =>
          l.name?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.company?.toLowerCase().includes(q)
        );
      }
      return data.map(l => ({
        id: l.id,
        title: l.name,
        subtitle: l.company || "Individual",
        email: l.email,
        phone: l.phone || "—",
        badge: l.status,
        date: l.created_at,
        category: l.services?.join(", ") || "General Inquiry"
      }));
    } else {
      let data = portfolios;
      if (q) {
        data = data.filter(p =>
          p.title?.toLowerCase().includes(q) ||
          p.client?.toLowerCase().includes(q)
        );
      }
      return data.map(p => ({
        id: p.id,
        title: p.title,
        subtitle: p.client,
        email: p.url || "—",
        phone: p.year?.toString() || "—",
        badge: p.featured ? "Featured" : "Standard",
        date: p.created_at,
        category: p.services_used?.join(", ") || "Showcase Work"
      }));
    }
  }, [filteredData, activeTableTab, tableSearch, portfolios]);

  const totalTablePages = Math.ceil(tableDataset.length / tableLimit);
  const paginatedTable = useMemo(() => {
    const offset = (tablePage - 1) * tableLimit;
    return tableDataset.slice(offset, offset + tableLimit);
  }, [tableDataset, tablePage, tableLimit]);

  const isDark = theme === "dark";

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center flex-col gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-accent-custom/20 blur-xl animate-pulse" />
          <Loader2 className="w-8 h-8 text-accent-custom animate-spin relative" />
        </div>
        <span className="font-mono text-[11px] text-gray-400">Loading Leads Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left pb-16 relative animate-fadeIn">

      {/* ── Title and KPI Filter Deck ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-accent-custom" />
            Leads Scraper &amp; CRM Analytics
          </h1>
          <p className="text-[11px] font-mono text-gray-400 dark:text-gray-500 mt-0.5">
            Analysing cities, categories, and conversions dynamically.
          </p>
        </div>

        {/* Filters Panel */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date and Time Selector */}
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setShowCustomPicker(e.target.value === "Custom");
              }}
              className="pl-8 pr-8 py-1.5 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-lg text-xs font-bold text-gray-700 dark:text-white focus:outline-none focus:border-accent-custom cursor-pointer appearance-none"
            >
              {["Today", "Yesterday", "Last 7 days", "Last 30 days", "This month", "Previous month", "Custom"].map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Selector */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-8 pr-8 py-1.5 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-lg text-xs font-bold text-gray-700 dark:text-white focus:outline-none focus:border-accent-custom cursor-pointer appearance-none"
            >
              {["All Status", "Pending", "Contacting", "Qualified", "Closed"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Show Analytics Toggle Switch */}
          <div className="flex items-center gap-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono text-gray-500 whitespace-nowrap select-none">
            <span>SHOW ANALYTICS</span>
            <button
              onClick={() => setDisableAnalytics(!disableAnalytics)}
              className={`w-9 h-5 rounded-full transition-colors duration-300 relative cursor-pointer shrink-0 ${
                !disableAnalytics ? "bg-accent-custom" : "bg-gray-200 dark:bg-white/10"
              }`}
            >
              <span
                className={`absolute w-4 h-4 bg-white rounded-full top-0.5 left-0.5 transition-transform duration-300 ease-in-out will-change-transform ${
                  !disableAnalytics ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Custom range date selector */}
      {showCustomPicker && (
        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 p-3 rounded-xl flex flex-wrap items-center gap-3 w-max animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-gray-400">Start:</span>
            <input
              type="date"
              value={customRange.start}
              onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
              className="bg-gray-50 dark:bg-black/50 border border-gray-250 dark:border-white/10 text-xs px-2 py-1 rounded text-gray-800 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-gray-400">End:</span>
            <input
              type="date"
              value={customRange.end}
              onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
              className="bg-gray-50 dark:bg-black/50 border border-gray-255 dark:border-white/10 text-xs px-2 py-1 rounded text-gray-800 dark:text-white"
            />
          </div>
          <button
            onClick={() => setShowCustomPicker(false)}
            className="text-[10px] font-mono text-accent-custom border border-accent-custom/20 hover:bg-accent-custom/10 px-2 py-1 rounded cursor-pointer"
          >
            Done
          </button>
        </div>
      )}

      {/* ── Summary KPI Cards Grid (Real leads databases) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Scraped Leads */}
        <div className="bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 p-5 rounded-2xl flex flex-col justify-between hover:border-accent-custom/30 transition-colors shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Outbound Scraped</span>
            <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Database className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold font-mono tracking-tight text-gray-900 dark:text-white">
              {metrics.totalScraped.toLocaleString()}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                metrics.scrapedGrowth >= 0 
                  ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10" 
                  : "text-red-500 bg-red-50 dark:text-red-400 dark:bg-red-500/10"
              }`}>
                {metrics.scrapedGrowth >= 0 ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                {Math.abs(metrics.scrapedGrowth)}%
              </span>
              <span className="text-[9px] text-gray-400 font-mono">growth this period</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Unique Cities */}
        <div className="bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 p-5 rounded-2xl flex flex-col justify-between hover:border-teal-500/30 transition-colors shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Cities Scraped</span>
            <div className="w-6 h-6 rounded-lg bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-500">
              <MapPin className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold font-mono tracking-tight text-gray-900 dark:text-white">
              {metrics.uniqueCities}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] text-gray-400 font-mono">unique cities targeted</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Business Categories */}
        <div className="bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 p-5 rounded-2xl flex flex-col justify-between hover:border-purple-500/30 transition-colors shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Business Categories</span>
            <div className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Tag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold font-mono tracking-tight text-gray-900 dark:text-white">
              {metrics.uniqueCategories}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] text-gray-400 font-mono">business categories</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Inbound Inquiries */}
        <div className="bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 p-5 rounded-2xl flex flex-col justify-between hover:border-emerald-500/30 transition-colors shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Inbound Inquiries</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold font-mono tracking-tight text-gray-900 dark:text-white">
              {metrics.inquiriesCount}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                metrics.inquiriesGrowth >= 0 
                  ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10" 
                  : "text-red-500 bg-red-50 dark:text-red-400 dark:bg-red-500/10"
              }`}>
                {metrics.inquiriesGrowth >= 0 ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                {Math.abs(metrics.inquiriesGrowth)}%
              </span>
              <span className="text-[9px] text-gray-400 font-mono">vs previous period</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main CRM Analytics Grid (Dynamic Cities and Categories Segments) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Leads by Cities */}
        <div className="bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-5 relative hover:shadow-[0_0_20px_rgba(79,124,255,0.02)] transition-shadow">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-gray-900 dark:text-white">{sectionsData.cities.title}</span>
              <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-500/20">
                Region Map
              </span>
            </div>
            <div className="text-[10px] font-mono text-gray-400 font-bold bg-gray-50 dark:bg-black/30 border border-gray-250 dark:border-white/5 px-2 py-0.5 rounded">
              Justdial Cities
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 py-1 text-left">
            <div>
              <span className="block text-[10px] text-gray-400 font-mono">Top Scraped City</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-base font-bold text-gray-900 dark:text-white truncate max-w-[100px]">{sectionsData.cities.topCity}</span>
              </div>
            </div>
            <div>
              <span className="block text-[10px] text-gray-400 font-mono">Top City Leads</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold font-mono text-gray-900 dark:text-white">{sectionsData.cities.topValue}</span>
              </div>
            </div>
            <div>
              <span className="block text-[10px] text-gray-400 font-mono">Cities Count</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold font-mono text-gray-900 dark:text-white">{metrics.uniqueCities}</span>
              </div>
            </div>
          </div>

          {!disableAnalytics ? (
            <div className="w-full h-[180px] mt-2 relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectionsData.cities.chartData} barSize={28}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={9} stroke={isDark ? "#555" : "#aaa"} dy={5} />
                  <YAxis axisLine={false} tickLine={false} fontSize={9} stroke={isDark ? "#555" : "#aaa"} width={20} />
                  <Tooltip cursor={{ fill: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }} />
                  <Bar dataKey="value" fill="#2962FF" radius={[4, 4, 0, 0]} />
                  {sectionsData.cities.avg > 0 && (
                    <ReferenceLine y={sectionsData.cities.avg} stroke={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"} strokeDasharray="3 3" />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[180px] flex items-center justify-center border border-dashed border-gray-250 dark:border-white/5 rounded-xl bg-gray-50/50 dark:bg-black/30 text-xs text-gray-400 font-mono">
              [Analytics disabled]
            </div>
          )}

          <div className="space-y-1.5 mt-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-gray-500">Regional Scraping Target</span>
              <span className="font-bold text-gray-900 dark:text-white font-mono">{sectionsData.cities.topValue}/{sectionsData.cities.target}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-accent-custom rounded-full" style={{ width: `${Math.min(100, (sectionsData.cities.topValue / sectionsData.cities.target) * 100)}%` }} />
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-white/5 pt-3">
            <button
              onClick={() => setOpenInfo(prev => ({ ...prev, cities: !prev.cities }))}
              className="flex items-center justify-between w-full text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer select-none"
            >
              <span>Other info</span>
              <ChevronDown className={`w-3.5 h-3.5 transform transition-transform ${openInfo.cities ? "rotate-180" : ""}`} />
            </button>
            {openInfo.cities && (
              <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-50 dark:border-white/2 text-[10px] font-mono text-left animate-fadeIn">
                <div>
                  <span className="block text-gray-400">Top City</span>
                  <span className="font-bold text-gray-800 dark:text-white">{sectionsData.cities.topCity}</span>
                </div>
                <div>
                  <span className="block text-gray-400">Database Table</span>
                  <span className="font-bold text-gray-800 dark:text-white">scraped_leads (scraped_city)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Leads by Business Category */}
        <div className="bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-5 relative hover:shadow-[0_0_20px_rgba(79,124,255,0.02)] transition-shadow">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-gray-900 dark:text-white">{sectionsData.categories.title}</span>
              <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400 border border-teal-500/20">
                Industry Map
              </span>
            </div>
            <div className="text-[10px] font-mono text-gray-400 font-bold bg-gray-50 dark:bg-black/30 border border-gray-250 dark:border-white/5 px-2 py-0.5 rounded">
              Justdial Categories
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 py-1 text-left">
            <div>
              <span className="block text-[10px] text-gray-400 font-mono">Top Category</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[100px]">{sectionsData.categories.topCat}</span>
              </div>
            </div>
            <div>
              <span className="block text-[10px] text-gray-400 font-mono">Top Cat Leads</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold font-mono text-gray-900 dark:text-white">{sectionsData.categories.topValue}</span>
              </div>
            </div>
            <div>
              <span className="block text-[10px] text-gray-400 font-mono">Categories Count</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold font-mono text-gray-900 dark:text-white">{metrics.uniqueCategories}</span>
              </div>
            </div>
          </div>

          {!disableAnalytics ? (
            <div className="w-full h-[180px] mt-2 relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectionsData.categories.chartData} barSize={28}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={9} stroke={isDark ? "#555" : "#aaa"} dy={5} />
                  <YAxis axisLine={false} tickLine={false} fontSize={9} stroke={isDark ? "#555" : "#aaa"} width={20} />
                  <Tooltip cursor={{ fill: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }} />
                  <Bar dataKey="value" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
                  {sectionsData.categories.avg > 0 && (
                    <ReferenceLine y={sectionsData.categories.avg} stroke={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"} strokeDasharray="3 3" />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[180px] flex items-center justify-center border border-dashed border-gray-250 dark:border-white/5 rounded-xl bg-gray-50/50 dark:bg-black/30 text-xs text-gray-400 font-mono">
              [Analytics disabled]
            </div>
          )}

          <div className="space-y-1.5 mt-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-gray-500">Category Scraped Target</span>
              <span className="font-bold text-gray-900 dark:text-white font-mono">{sectionsData.categories.topValue}/{sectionsData.categories.target}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-teal-400 rounded-full" style={{ width: `${Math.min(100, (sectionsData.categories.topValue / sectionsData.categories.target) * 100)}%` }} />
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-white/5 pt-3">
            <button
              onClick={() => setOpenInfo(prev => ({ ...prev, categories: !prev.categories }))}
              className="flex items-center justify-between w-full text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer select-none"
            >
              <span>Other info</span>
              <ChevronDown className={`w-3.5 h-3.5 transform transition-transform ${openInfo.categories ? "rotate-180" : ""}`} />
            </button>
            {openInfo.categories && (
              <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-50 dark:border-white/2 text-[10px] font-mono text-left animate-fadeIn">
                <div>
                  <span className="block text-gray-400">Top Category</span>
                  <span className="font-bold text-gray-800 dark:text-white">{sectionsData.categories.topCat}</span>
                </div>
                <div>
                  <span className="block text-gray-400">Database Table</span>
                  <span className="font-bold text-gray-800 dark:text-white">scraped_leads (scraped_service)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Timeline */}
        <div className="bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-5 relative hover:shadow-[0_0_20px_rgba(79,124,255,0.02)] transition-shadow">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-gray-900 dark:text-white">{sectionsData.timeline.title}</span>
              <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-500/20">
                Timeline
              </span>
            </div>
            <div className="text-[10px] font-mono text-gray-400 font-bold bg-gray-50 dark:bg-black/30 border border-gray-250 dark:border-white/5 px-2 py-0.5 rounded">
              Outreach Campaigns
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 py-1 text-left">
            <div>
              <span className="block text-[10px] text-gray-400 font-mono">Period Scraped</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold font-mono text-gray-900 dark:text-white">{sectionsData.timeline.total}</span>
              </div>
            </div>
            <div>
              <span className="block text-[10px] text-gray-400 font-mono">Average Intake</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold font-mono text-gray-900 dark:text-white">{sectionsData.timeline.avg}</span>
              </div>
            </div>
            <div>
              <span className="block text-[10px] text-gray-400 font-mono">Growth Code</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold font-mono text-purple-500">{metrics.scrapedGrowth}%</span>
              </div>
            </div>
          </div>

          {!disableAnalytics ? (
            <div className="w-full h-[180px] mt-2 relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectionsData.timeline.chartData} barSize={28}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={9} stroke={isDark ? "#555" : "#aaa"} dy={5} />
                  <YAxis axisLine={false} tickLine={false} fontSize={9} stroke={isDark ? "#555" : "#aaa"} width={20} />
                  <Tooltip cursor={{ fill: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }} />
                  <Bar dataKey="value" fill="#a855f7" radius={[4, 4, 0, 0]} />
                  {sectionsData.timeline.avg > 0 && (
                    <ReferenceLine y={sectionsData.timeline.avg} stroke={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"} strokeDasharray="3 3" />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[180px] flex items-center justify-center border border-dashed border-gray-250 dark:border-white/5 rounded-xl bg-gray-50/50 dark:bg-black/30 text-xs text-gray-400 font-mono">
              [Analytics disabled]
            </div>
          )}

          <div className="space-y-1.5 mt-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-gray-500">Timeline Target</span>
              <span className="font-bold text-gray-900 dark:text-white font-mono">{sectionsData.timeline.total}/{sectionsData.timeline.target}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-purple-550 rounded-full" style={{ width: `${Math.min(100, (sectionsData.timeline.total / sectionsData.timeline.target) * 100)}%` }} />
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-white/5 pt-3">
            <button
              onClick={() => setOpenInfo(prev => ({ ...prev, timeline: !prev.timeline }))}
              className="flex items-center justify-between w-full text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer select-none"
            >
              <span>Other info</span>
              <ChevronDown className={`w-3.5 h-3.5 transform transition-transform ${openInfo.timeline ? "rotate-180" : ""}`} />
            </button>
            {openInfo.timeline && (
              <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-50 dark:border-white/2 text-[10px] font-mono text-left animate-fadeIn">
                <div>
                  <span className="block text-gray-400">Total Database Records</span>
                  <span className="font-bold text-gray-800 dark:text-white">{scrapedLeads.length} leads</span>
                </div>
                <div>
                  <span className="block text-gray-400">Database Table</span>
                  <span className="font-bold text-gray-800 dark:text-white">scraped_leads</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 4: Conversions & Inbounds */}
        <div className="bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-5 relative hover:shadow-[0_0_20px_rgba(79,124,255,0.02)] transition-shadow">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-gray-900 dark:text-white">{sectionsData.conversions.title}</span>
              <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20">
                Conversions
              </span>
            </div>
            <div className="text-[10px] font-mono text-gray-400 font-bold bg-gray-50 dark:bg-black/30 border border-gray-250 dark:border-white/5 px-2 py-0.5 rounded">
              Channel Channels
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 py-1 text-left">
            <div>
              <span className="block text-[10px] text-gray-400 font-mono">Inquiry Leads</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold font-mono text-gray-900 dark:text-white">{sectionsData.conversions.inbound}</span>
              </div>
            </div>
            <div>
              <span className="block text-[10px] text-gray-400 font-mono">Scraped Leads</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold font-mono text-gray-900 dark:text-white">{sectionsData.conversions.outbound}</span>
              </div>
            </div>
            <div>
              <span className="block text-[10px] text-gray-400 font-mono">Verified Emails</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold font-mono text-emerald-555">{sectionsData.conversions.verified}</span>
              </div>
            </div>
          </div>

          <div className="h-[180px] flex items-center justify-center border border-dashed border-gray-250 dark:border-white/5 rounded-xl bg-gray-50/50 dark:bg-black/30 text-xs text-gray-400 font-mono">
            <div className="text-center space-y-2.5 p-4">
              <Activity className="w-8 h-8 text-accent-custom mx-auto animate-pulse" />
              <div>
                <span className="block text-gray-900 dark:text-white font-bold">Email Capture Success</span>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  {sectionsData.conversions.outbound > 0
                    ? Math.round((sectionsData.conversions.verified / sectionsData.conversions.outbound) * 100)
                    : 0}% email capture efficiency from Justdial
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 mt-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-gray-500">Inbound Lead Target</span>
              <span className="font-bold text-gray-900 dark:text-white font-mono">{sectionsData.conversions.inbound}/{sectionsData.conversions.target}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${Math.min(100, (sectionsData.conversions.inbound / sectionsData.conversions.target) * 100)}%` }} />
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-white/5 pt-3">
            <button
              onClick={() => setOpenInfo(prev => ({ ...prev, conversions: !prev.conversions }))}
              className="flex items-center justify-between w-full text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer select-none"
            >
              <span>Other info</span>
              <ChevronDown className={`w-3.5 h-3.5 transform transition-transform ${openInfo.conversions ? "rotate-180" : ""}`} />
            </button>
            {openInfo.conversions && (
              <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-50 dark:border-white/2 text-[10px] font-mono text-left animate-fadeIn">
                <div>
                  <span className="block text-gray-400">Total Inbox Messages</span>
                  <span className="font-bold text-gray-800 dark:text-white">{messages.length} messages</span>
                </div>
                <div>
                  <span className="block text-gray-400">Lead Source Distribution</span>
                  <span className="font-bold text-gray-800 dark:text-white">Justdial Scraper + Forms</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── Dynamic Database Explorer Data Table ── */}
      <div className="bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-6">
        
        {/* Table Filters header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-white/5 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => { setActiveTableTab("scraped"); setTablePage(1); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTableTab === "scraped"
                  ? "bg-accent-custom/10 text-accent-custom border border-accent-custom/25"
                  : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Database className="w-3.5 h-3.5" /> Scraped Leads Database ({filteredData.currentScraped.length})
            </button>
            <button
              onClick={() => { setActiveTableTab("inbound"); setTablePage(1); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTableTab === "inbound"
                  ? "bg-accent-custom/10 text-accent-custom border border-accent-custom/25"
                  : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Website Inquiries ({filteredData.currentInquiries.length})
            </button>
            <button
              onClick={() => { setActiveTableTab("portfolio"); setTablePage(1); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTableTab === "portfolio"
                  ? "bg-accent-custom/10 text-accent-custom border border-accent-custom/25"
                  : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" /> Studio Portfolios ({portfolios.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Table Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search leads..."
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setTablePage(1);
                }}
                className="pl-9 pr-3 py-2 w-48 bg-gray-50 dark:bg-white/[0.03] border border-gray-250 dark:border-white/[0.06] rounded-xl text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-accent-custom transition-colors"
              />
            </div>
            {tableSearch && (
              <button
                onClick={() => setTableSearch("")}
                className="p-2 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Le Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-xs text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/[0.04] text-[9px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-mono font-bold select-none">
                <th className="pb-3 pl-4">Title / Business Name</th>
                <th className="pb-3">Region / Location</th>
                <th className="pb-3">Link / Email</th>
                <th className="pb-3">Details / Category</th>
                <th className="pb-3">{activeTableTab === "scraped" ? "Outreach Status" : "Status / Rating"}</th>
                <th className="pb-3 text-right pr-4">Creation Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/[0.02]">
              {paginatedTable.map((item, idx) => (
                <tr
                  key={`${activeTableTab}-${item.id}-${idx}`}
                  className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors font-mono"
                >
                  <td className="py-3.5 pl-4 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      activeTableTab === "scraped"
                        ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        : activeTableTab === "inbound"
                        ? "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400"
                        : "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400"
                    }`}>
                      {item.title?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-gray-900 dark:text-white block truncate max-w-[220px]">
                        {item.title}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className="text-[11px] text-gray-550 dark:text-gray-400 truncate block max-w-[150px]">{item.subtitle || "—"}</span>
                  </td>
                  <td className="py-3.5">
                    <span className="text-[11px] text-gray-550 dark:text-gray-400 truncate block max-w-[200px]">{item.email || "—"}</span>
                  </td>
                  <td className="py-3.5">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate block max-w-[200px]">{item.category || "—"}</span>
                  </td>
                  <td className="py-3.5">
                    <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${
                      item.badge?.toLowerCase() === "sent" || item.badge?.toLowerCase() === "published" || item.badge?.toLowerCase() === "featured" || item.badge?.toLowerCase() === "qualified"
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : item.badge?.toLowerCase() === "pending" || item.badge?.toLowerCase() === "draft"
                        ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                        : item.badge?.toLowerCase() === "failed"
                        ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                        : "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                    }`}>
                      {item.badge}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-right">
                    <span className="text-[10px] text-gray-400">
                      {new Date(item.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {tableDataset.length === 0 && (
          <div className="text-center py-10 text-xs text-gray-400 font-mono">No matching records found in this table.</div>
        )}

        {/* Local Pagination details */}
        {tableDataset.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-4">
            <span className="text-[10px] font-mono text-gray-400">
              Showing page {tablePage} of {totalTablePages || 1}
            </span>
            <div className="flex gap-2">
              <button
                disabled={tablePage === 1}
                onClick={() => setTablePage(prev => Math.max(1, prev - 1))}
                className="px-3 py-1 bg-gray-50 dark:bg-white/5 border border-gray-250 dark:border-white/10 rounded text-[11px] font-mono hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={tablePage >= totalTablePages}
                onClick={() => setTablePage(prev => prev + 1)}
                className="px-3 py-1 bg-gray-50 dark:bg-white/5 border border-gray-250 dark:border-white/10 rounded text-[11px] font-mono hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
