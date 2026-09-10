"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
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
  Sparkles,
  CheckCheck,
  Trash2,
  Mail,
  CheckCircle2,
  ExternalLink,
  Volume2
} from "lucide-react";

import { authFetch } from "@/lib/authFetch";
import { API_URL } from "@/lib/config";

interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  timestamp: number;
  type: "inquiry" | "lead" | "system" | "email";
  read: boolean;
  link: string;
}

function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Web Audio API Sound Chime Synthesizer
const playNotificationSound = () => {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // First tone (D5 - 587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain1.gain.setValueAtTime(0.1, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.15);

    // Second tone (A5 - 880 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
    gain2.gain.setValueAtTime(0.12, ctx.currentTime + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.1);
    osc2.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Autoplay restrictions may require initial user click
  }
};

// LocalStorage Persistence Helpers for Read Status
const getReadIds = (): Set<string> => {
  if (typeof window === "undefined") return new Set();
  try {
    const saved = localStorage.getItem("crm_read_notification_ids");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch (e) {
    return new Set();
  }
};

const saveReadIds = (readIds: Set<string>) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("crm_read_notification_ids", JSON.stringify(Array.from(readIds)));
  } catch (e) {}
};

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

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeNotifFilter, setActiveNotifFilter] = useState<"all" | "unread" | "inquiry" | "system">("all");
  const [activeToastNotif, setActiveToastNotif] = useState<AppNotification | null>(null);

  const notifRef = useRef<HTMLDivElement>(null);
  const mobileNotifRef = useRef<HTMLDivElement>(null);

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

  // Dismiss notification popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notifRef.current && !notifRef.current.contains(event.target as Node) &&
        mobileNotifRef.current && !mobileNotifRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch live notifications & badge counts from backend
  const loadCountsAndNotifications = useCallback(async (isBackgroundPoll = false) => {
    if (!isAuthenticated) return;
    try {
      const [scrapedRes, leadsRes, contactsRes] = await Promise.allSettled([
        authFetch(`${API_URL}/api/v1/scraped-leads/stats`),
        authFetch(`${API_URL}/api/v1/leads/`),
        authFetch(`${API_URL}/api/v1/contacts/`)
      ]);

      const readSet = getReadIds();
      const notifList: AppNotification[] = [];
      let totalLeadsCount = 0;

      if (scrapedRes.status === "fulfilled" && scrapedRes.value.ok) {
        const stats = await scrapedRes.value.json();
        totalLeadsCount += stats.total || 0;
      }

      if (leadsRes.status === "fulfilled" && leadsRes.value.ok) {
        const inq = await leadsRes.value.json();
        if (Array.isArray(inq)) {
          totalLeadsCount += inq.length;
          inq.slice(0, 5).forEach((l: any) => {
            const id = `inq-${l.id}`;
            notifList.push({
              id,
              title: "New Inbound Lead",
              message: `${l.name || "Prospect"} requested services for ${l.company || "Direct Inbound"}.`,
              time: l.created_at ? formatRelativeTime(l.created_at) : "Recently",
              timestamp: l.created_at ? new Date(l.created_at).getTime() : Date.now(),
              type: "lead",
              read: readSet.has(id),
              link: "/admin/dashboard/leads"
            });
          });
        }
      }
      setLeadsBadge(String(totalLeadsCount));

      if (contactsRes.status === "fulfilled" && contactsRes.value.ok) {
        const msgs = await contactsRes.value.json();
        const msgArr = Array.isArray(msgs) ? msgs : [];
        setContactsBadge(String(msgArr.length));
        msgArr.slice(0, 5).forEach((msg: any) => {
          const id = `contact-${msg.id}`;
          notifList.push({
            id,
            title: "New Contact Inquiry",
            message: `${msg.name || "Visitor"}: "${msg.message ? msg.message.slice(0, 50) + "..." : "New message"}"`,
            time: msg.created_at ? formatRelativeTime(msg.created_at) : "Recently",
            timestamp: msg.created_at ? new Date(msg.created_at).getTime() : Date.now(),
            type: "inquiry",
            read: readSet.has(id),
            link: "/admin/dashboard/contacts"
          });
        });
      }

      // Add System Status Notifications
      const sysId1 = "sys-db-status";
      notifList.push({
        id: sysId1,
        title: "CRM Engine Online",
        message: `Connected with ${totalLeadsCount} pipeline prospects in database.`,
        time: "Just now",
        timestamp: Date.now(),
        type: "system",
        read: readSet.has(sysId1),
        link: "/admin/dashboard"
      });

      const sysId2 = "sys-email-worker";
      notifList.push({
        id: sysId2,
        title: "Autonomous Email Worker",
        message: "Email automation standby mode • Ready for outreach campaigns.",
        time: "10m ago",
        timestamp: Date.now() - 10 * 60 * 1000,
        type: "email",
        read: readSet.has(sysId2),
        link: "/admin/dashboard/email-outreach"
      });

      notifList.sort((a, b) => b.timestamp - a.timestamp);

      // Check if new unread items arrived during background polling
      if (isBackgroundPoll) {
        const hasNewUnread = notifList.some(n => !n.read && !notifications.some(existing => existing.id === n.id));
        if (hasNewUnread) {
          playNotificationSound();
        }
      }

      setNotifications(notifList);
    } catch (e) {
      console.error("Failed to load badge counts & notifications:", e);
    }
  }, [isAuthenticated, notifications]);

  // Initial load & 15-second background polling
  useEffect(() => {
    loadCountsAndNotifications(false);
    const interval = setInterval(() => {
      loadCountsAndNotifications(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [loadCountsAndNotifications]);

  if (typeof window !== "undefined" && !isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    const readSet = getReadIds();
    notifications.forEach(n => readSet.add(n.id));
    saveReadIds(readSet);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (item: AppNotification) => {
    const readSet = getReadIds();
    readSet.add(item.id);
    saveReadIds(readSet);
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
    setNotificationsOpen(false);
    if (item.link) {
      router.push(item.link);
    }
  };

  // Interactive Test Notification Trigger
  const triggerTestNotification = () => {
    const testId = `test-${Date.now()}`;
    const sampleCompanies = ["Acme Corp", "Apex Innovations", "Starlight Media", "Vanguard Tech"];
    const comp = sampleCompanies[Math.floor(Math.random() * sampleCompanies.length)];
    
    const newNotif: AppNotification = {
      id: testId,
      title: `⚡ Live Test: Inquiry from ${comp}`,
      message: `Direct inbound inquiry received! Client requested custom AI & web development services.`,
      time: "Just now",
      timestamp: Date.now(),
      type: "inquiry",
      read: false,
      link: "/admin/dashboard/leads"
    };

    playNotificationSound();
    setActiveToastNotif(newNotif);
    setNotifications(prev => [newNotif, ...prev]);

    // Auto-dismiss toast after 5 seconds
    setTimeout(() => {
      setActiveToastNotif(null);
    }, 5000);
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeNotifFilter === "unread") return !n.read;
    if (activeNotifFilter === "inquiry") return n.type === "inquiry" || n.type === "lead";
    if (activeNotifFilter === "system") return n.type === "system" || n.type === "email";
    return true;
  });

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
        { name: "Email Outreach", href: "/admin/dashboard/email-outreach", icon: TerminalSquare, badge: "LIVE" },
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
      
      {/* ── Floating Live Notification Toast Banner ── */}
      {activeToastNotif && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full bg-slate-900/95 dark:bg-[#111111]/95 text-white p-4 rounded-2xl border border-indigo-500/30 shadow-2xl backdrop-blur-md animate-fadeIn flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-400 shrink-0">
            <Bell className="w-5 h-5 animate-pulse text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white truncate">{activeToastNotif.title}</h4>
              <span className="text-[10px] text-indigo-400 font-mono">NEW</span>
            </div>
            <p className="text-[11px] text-slate-300 dark:text-neutral-300 mt-1 line-clamp-2 leading-relaxed">
              {activeToastNotif.message}
            </p>
            <button
              onClick={() => {
                handleNotificationClick(activeToastNotif);
                setActiveToastNotif(null);
              }}
              className="mt-2 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer inline-flex items-center gap-1"
            >
              <span>View Record &rarr;</span>
            </button>
          </div>
          <button
            onClick={() => setActiveToastNotif(null)}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mobile Top Bar */}
      <div className="lg:hidden w-full bg-slate-900 dark:bg-[#09090b] border-b border-slate-800 dark:border-neutral-800 px-5 py-3.5 flex items-center justify-between z-30 shrink-0 text-white">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-slate-300 hover:text-white p-1 cursor-pointer"
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
            className="text-slate-400 hover:text-white p-1 transition cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>

          {/* Mobile Bell Button */}
          <div className="relative" ref={mobileNotifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="text-slate-400 hover:text-white p-1 transition relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
              )}
            </button>
          </div>

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
                className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
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
      <main className="flex-1 flex flex-col overflow-hidden relative z-10 bg-slate-50 dark:bg-[#000000]">
        
        {/* Top Navigation Bar */}
        <header className="hidden lg:flex h-16 bg-white dark:bg-[#0a0a0a] border-b border-slate-200/80 dark:border-neutral-800 px-8 items-center justify-between shrink-0 shadow-xs z-20">
          
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

            {/* Notification Bell Dropdown Container */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`p-2 rounded-xl transition relative cursor-pointer ${
                  notificationsOpen
                    ? "bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                title="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <>
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                  </>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl z-50 overflow-hidden animate-fadeIn">
                  {/* Header */}
                  <div className="p-3.5 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between bg-slate-50/60 dark:bg-neutral-900/60">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-rose-500 text-white rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      {/* Test Trigger Button */}
                      <button
                        onClick={triggerTestNotification}
                        className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900 transition cursor-pointer flex items-center gap-1"
                        title="Simulate a real-time incoming notification"
                      >
                        <Zap className="w-3 h-3 text-indigo-500" />
                        <span>Test</span>
                      </button>

                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer flex items-center gap-1"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Read all</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setNotifications([]);
                          const readSet = getReadIds();
                          notifications.forEach(n => readSet.add(n.id));
                          saveReadIds(readSet);
                        }}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded hover:bg-slate-100 dark:hover:bg-neutral-800"
                        title="Clear all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1 px-3 py-1.5 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/30 dark:bg-neutral-900/30 text-[11px]">
                    {(["all", "unread", "inquiry", "system"] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveNotifFilter(tab)}
                        className={`px-2.5 py-0.5 rounded-md capitalize font-medium transition cursor-pointer ${
                          activeNotifFilter === tab
                            ? "bg-indigo-600 text-white font-bold"
                            : "text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Notification Items List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-neutral-900">
                    {filteredNotifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400 dark:text-neutral-500 space-y-1">
                        <CheckCircle2 className="w-8 h-8 text-slate-300 dark:text-neutral-700 mx-auto" />
                        <p className="font-semibold text-slate-600 dark:text-neutral-400">All caught up!</p>
                        <p className="text-[11px]">No notifications found.</p>
                      </div>
                    ) : (
                      filteredNotifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3 transition flex items-start gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-neutral-900/80 ${
                            !n.read ? "bg-indigo-50/30 dark:bg-indigo-950/20" : ""
                          }`}
                        >
                          {/* Icon per type */}
                          <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                            n.type === "inquiry"
                              ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                              : n.type === "lead"
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                              : n.type === "email"
                              ? "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400"
                              : "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300"
                          }`}>
                            {n.type === "inquiry" && <Mail className="w-3.5 h-3.5" />}
                            {n.type === "lead" && <UserCheck className="w-3.5 h-3.5" />}
                            {n.type === "email" && <MessageSquare className="w-3.5 h-3.5" />}
                            {n.type === "system" && <Zap className="w-3.5 h-3.5" />}
                          </div>

                          {/* Message Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className={`text-xs font-bold truncate ${
                                !n.read ? "text-indigo-600 dark:text-indigo-400" : "text-slate-900 dark:text-white"
                              }`}>
                                {n.title}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono shrink-0">
                                {n.time}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-neutral-400 mt-0.5 line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>
                          </div>

                          {/* Unread Indicator */}
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Popover Footer */}
                  <div className="p-2.5 border-t border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 text-center">
                    <button
                      onClick={() => {
                        setNotificationsOpen(false);
                        router.push("/admin/dashboard/leads");
                      }}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>View All Pipeline Leads</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

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
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 md:p-8 relative max-w-full">
          <div className="relative z-10 w-full max-w-7xl mx-auto min-h-full">
            {children}
          </div>
        </div>
      </main>

    </div>
  );
}
