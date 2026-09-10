"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  FileText,
  Briefcase,
  HelpCircle,
  LogOut,
  Menu,
  X,
  UserCheck,
  Star,
  Search,
  Bell,
  Sun,
  Moon,
  Settings,
  Shield,
  TerminalSquare,
  ChevronLeft,
  ChevronRight,
  Zap,
  Layers,
  Sparkles
} from "lucide-react";

import { authFetch } from "@/lib/authFetch";
import { API_URL } from "@/lib/config";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [leadsBadge, setLeadsBadge] = useState<string>("...");
  const [contactsBadge, setContactsBadge] = useState<string>("...");
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed");
      if (saved === "true") {
        setIsCollapsed(true);
      }
    }
    if (!isAuthenticated && typeof window !== "undefined") {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  // Fetch dynamic badge counts
  useEffect(() => {
    if (!isAuthenticated) return;
    async function loadCounts() {
      try {
        const [scrapedRes, leadsRes, contactsRes] = await Promise.allSettled([
          authFetch(`${API_URL}/api/v1/scraped-leads/stats`),
          authFetch(`${API_URL}/api/v1/leads/`),
          authFetch(`${API_URL}/api/v1/contacts/`)
        ]);

        let totalLeadsCount = 0;
        if (scrapedRes.status === "fulfilled" && scrapedRes.value.ok) {
          const stats = await scrapedRes.value.json();
          totalLeadsCount += stats.total || 0;
        }
        if (leadsRes.status === "fulfilled" && leadsRes.value.ok) {
          const inq = await leadsRes.value.json();
          totalLeadsCount += Array.isArray(inq) ? inq.length : 0;
        }
        setLeadsBadge(String(totalLeadsCount));

        if (contactsRes.status === "fulfilled" && contactsRes.value.ok) {
          const msgs = await contactsRes.value.json();
          setContactsBadge(String(Array.isArray(msgs) ? msgs.length : 0));
        }
      } catch (e) {
        console.error("Failed to load sidebar badge counts:", e);
      }
    }
    loadCounts();
  }, [isAuthenticated]);

  // Synchronous check if already in browser
  if (typeof window !== "undefined" && !isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  const navGroups = [
    {
      title: "CORE CRM",
      links: [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Leads Database", href: "/admin/dashboard/leads", icon: Users, badge: leadsBadge },
        { name: "Messages Inbox", href: "/admin/dashboard/contacts", icon: MessageSquare, badge: contactsBadge },
      ]
    },
    {
      title: "AUTOMATION & TOOLS",
      links: [
        { name: "Email Outreach", href: "/admin/dashboard/automation/outreach", icon: TerminalSquare, badge: "LIVE" },
        { name: "Portfolio Works", href: "/admin/dashboard/portfolio", icon: Briefcase },
        { name: "Blog Articles", href: "/admin/dashboard/blogs", icon: FileText },
        { name: "Testimonials", href: "/admin/dashboard/testimonials", icon: Star },
      ]
    },
    {
      title: "ADMINISTRATION",
      links: [
        { name: "FAQ Management", href: "/admin/dashboard/faqs", icon: HelpCircle },
        { name: "System Settings", href: "/admin/dashboard/settings", icon: Settings },
        ...(user?.is_superadmin ? [{ name: "Security & Roles", href: "/admin/dashboard/security", icon: Shield }] : []),
      ]
    }
  ];

  return (
    <div className="h-screen bg-slate-50 dark:bg-[#000000] text-slate-800 dark:text-neutral-200 flex flex-col lg:flex-row overflow-hidden relative font-sans antialiased">
      
      {/* Mobile Top Bar */}
      <div className="lg:hidden w-full bg-slate-900 dark:bg-[#09090b] border-b border-slate-800 dark:border-neutral-800 px-5 py-3.5 flex items-center justify-between z-30 shrink-0 text-white">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-slate-300 hover:text-white p-1"
            aria-label="Toggle Navigation"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center shadow-md shadow-indigo-500/30">
            <Zap className="w-4.5 h-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-sm leading-none">LeadFlow</span>
            <span className="text-[9px] uppercase font-semibold tracking-wider text-indigo-400">Enterprise CRM</span>
          </div>
        </div>

        {/* Mobile Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-slate-400 hover:text-white p-1 transition"
          >
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
          <div className="relative">
            <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs ring-2 ring-indigo-400/30">
              {user?.username ? user.username.slice(0, 2).toUpperCase() : "AR"}
            </span>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
          </div>
        </div>
      </div>

      {/* ── Left Sidebar Panel (Vercel Deep Black Theme) ── */}
      <aside
        className={`fixed inset-y-0 left-0 bg-slate-900 dark:bg-[#000000] border-r border-slate-800/80 dark:border-neutral-800 flex flex-col justify-between z-40 transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-full text-slate-300 select-none ${
          isCollapsed ? "w-[76px]" : "w-[260px]"
        } ${mobileOpen ? "translate-x-0 shadow-2xl w-[260px]" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden no-scrollbar">
          
          {/* Brand Logo Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col animate-fadeIn">
                  <span className="text-base font-bold text-white tracking-tight">LeadFlow</span>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-indigo-400">Enterprise CRM</span>
                </div>
              )}
            </div>
            {!mobileOpen && (
              <button
                onClick={() => {
                  const newVal = !isCollapsed;
                  setIsCollapsed(newVal);
                  localStorage.setItem("sidebar-collapsed", String(newVal));
                }}
                className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-3.5 space-y-5 text-sm font-medium">
            {navGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1.5">
                {!isCollapsed && (
                  <span className="text-[10px] font-bold text-slate-400/80 uppercase tracking-wider px-3 block animate-fadeIn">
                    {group.title}
                  </span>
                )}
                <div className="space-y-1">
                  {group.links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <a
                        key={link.name}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer select-none ${
                          isActive
                            ? "bg-indigo-600/20 text-indigo-400 font-bold border border-indigo-500/30 shadow-xs"
                            : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/80"
                        }`}
                        title={isCollapsed ? link.name : undefined}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-200"}`} />
                          {!isCollapsed && <span className="animate-fadeIn">{link.name}</span>}
                        </div>
                        {!isCollapsed && link.badge && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            link.badge === "LIVE"
                              ? "bg-emerald-500 text-white animate-pulse"
                              : "bg-indigo-600 text-white"
                          }`}>
                            {link.badge}
                          </span>
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User Profile Pill & Sign Out */}
          <div className="p-3 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800 transition cursor-pointer">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <span className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-indigo-300 ring-2 ring-indigo-500/30">
                    {user?.username ? user.username.slice(0, 2).toUpperCase() : "AR"}
                  </span>
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col text-left min-w-0 animate-fadeIn">
                    <span className="text-xs font-semibold text-slate-200 truncate">{user?.username || "Alex Rivera"}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {user?.is_superadmin ? "Main Superadmin" : "Sales Admin"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-slate-800/80 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer border border-slate-700/50 hover:border-rose-500/30"
            >
              <LogOut className="w-3.5 h-3.5" />
              {!isCollapsed && <span className="animate-fadeIn">Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Workspace Panel ── */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10 bg-slate-50 dark:bg-[#080d1a]">
        
        {/* Top Navigation Bar */}
        <header className="hidden lg:flex h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 px-8 items-center justify-between shrink-0 shadow-xs z-20">
          
          {/* Quick Search */}
          <div className="flex-1 max-w-md flex items-center">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search CRM prospects, leads, or logs..."
                className="w-full pl-9 pr-12 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 font-mono">
                ⌘K
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Toggle Dark/Light Mode"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            <button
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white dark:ring-slate-900" />
            </button>

            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800" />

            <div className="flex items-center gap-3">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {user?.username || "Alex Rivera"}
                </span>
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                  {user?.is_superadmin ? "Main Admin" : "Sales Lead"}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-md shadow-indigo-600/30">
                {user?.username ? user.username.slice(0, 2).toUpperCase() : "AR"}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Workspace Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="relative z-10 w-full max-w-7xl mx-auto min-h-full">
            {children}
          </div>
        </div>
      </main>

    </div>
  );
}
