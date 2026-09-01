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
  Gift,
  Sun,
  Moon,
  Settings,
  Shield,
  BarChart,
  TerminalSquare,
  ChevronLeft,
  ChevronRight,
  Mail
} from "lucide-react";

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
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed");
      if (saved === "true") {
        setIsCollapsed(true);
      }
    }
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex items-center justify-center text-gray-900 dark:text-white font-mono text-sm">
        Authenticating Console Session...
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  const navGroups = [
    {
      title: "GENERAL",
      links: [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Leads", href: "/admin/dashboard/leads", icon: Users },
        { name: "Messages", href: "/admin/dashboard/contacts", icon: MessageSquare, badge: "8" },
      ]
    },
    {
      title: "TOOLS",
      links: [
        { name: "Portfolio", href: "/admin/dashboard/portfolio", icon: Briefcase },
        { name: "Blog Posts", href: "/admin/dashboard/blogs", icon: FileText },
        { name: "Testimonials", href: "/admin/dashboard/testimonials", icon: Star },
        { name: "Automation", href: "/admin/dashboard/automation", icon: TerminalSquare, badge: "BETA" },
      ]
    },
    {
      title: "SUPPORT",
      links: [
        { name: "FAQ Panels", href: "/admin/dashboard/faqs", icon: HelpCircle },
        { name: "Settings", href: "/admin/dashboard/settings", icon: Settings },
        ...(user?.is_superadmin ? [{ name: "Security", href: "/admin/dashboard/security", icon: Shield }] : []),
      ]
    }
  ];

  return (
    <div className="h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white flex flex-col lg:flex-row overflow-hidden relative">
      
      {/* Mobile Top Bar */}
      <div className="lg:hidden w-full bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-2">
           <button
             onClick={() => setMobileOpen(!mobileOpen)}
             className="text-gray-600 dark:text-white hover:text-accent-custom mr-1"
             aria-label="Toggle Menu"
           >
             {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
           </button>
           <div className="w-8 h-8 rounded bg-gradient-to-tr from-accent-custom to-purple-600 flex items-center justify-center text-white font-bold text-base">N</div>
           <span className="font-bold tracking-tight text-sm">Nexora</span>
        </div>
        
        {/* Right side actions on Mobile */}
        <div className="flex items-center gap-3">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" aria-label="Toggle Theme">
             {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
          <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors relative" aria-label="Notifications">
             <Bell className="w-4.5 h-4.5" />
             <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>
          <div className="w-7 h-7 rounded-full bg-accent-custom/20 border border-accent-custom/30 overflow-hidden flex items-center justify-center text-accent-custom font-bold text-[10px] shrink-0">
            {user?.username ? user.username.slice(0, 2).toUpperCase() : "AD"}
          </div>
        </div>
      </div>

      {/* Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-white/10 flex flex-col justify-between z-40 transition-all duration-300 transform lg:translate-x-0 lg:static lg:h-full ${
          isCollapsed ? "w-[76px]" : "w-[260px]"
        } ${mobileOpen ? "translate-x-0 shadow-2xl w-[260px]" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden no-scrollbar">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 h-20 shrink-0 border-b border-gray-100 dark:border-white/5 gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-gradient-to-tr from-accent-custom to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-[0_0_10px_rgba(79,124,255,0.4)] shrink-0">
                N
              </div>
              {!isCollapsed && <span className="font-bold tracking-tight text-xl animate-fadeIn">Nexora</span>}
            </div>
            {!mobileOpen && (
              <button
                onClick={() => {
                  const newVal = !isCollapsed;
                  setIsCollapsed(newVal);
                  localStorage.setItem("sidebar-collapsed", String(newVal));
                }}
                className="hidden lg:flex p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-6">
            {navGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-2">
                {!isCollapsed && (
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 block animate-fadeIn">
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
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 cursor-pointer select-none ${
                          isActive
                            ? "bg-gray-100/80 dark:bg-white/10 text-gray-900 dark:text-white"
                            : "text-gray-500 dark:text-[#B0B0B0] hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                        }`}
                        title={isCollapsed ? link.name : undefined}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-accent-custom" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-white"}`} />
                          {!isCollapsed && <span className="animate-fadeIn">{link.name}</span>}
                        </div>
                        {!isCollapsed && link.badge && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            link.badge === "BETA" 
                              ? "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300"
                              : "text-gray-900 dark:text-white"
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

          {/* Bottom Team/Logout Section */}
          <div className="p-4 border-t border-gray-100 dark:border-white/5 space-y-3">
             <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-3 flex items-center justify-between cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-colors">
               <div className="flex items-center gap-3 min-w-0">
                 <div className="w-8 h-8 rounded bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                    <Briefcase className="w-4 h-4" />
                 </div>
                 {!isCollapsed && (
                   <div className="flex flex-col min-w-0 animate-fadeIn">
                     <span className="text-[10px] text-gray-500 dark:text-gray-400">Team</span>
                     <span className="text-xs font-bold truncate">Marketing</span>
                   </div>
                 )}
               </div>
               {!isCollapsed && <UserCheck className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
             </div>
             
             <button
               onClick={handleLogout}
               className="w-full bg-white dark:bg-transparent border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-900 dark:text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all"
             >
               <LogOut className="w-3.5 h-3.5 shrink-0" />
               {!isCollapsed && <span className="animate-fadeIn">Sign Out</span>}
             </button>
             {!isCollapsed && (
               <div className="text-center text-[9px] text-gray-400 dark:text-gray-600 mt-2 font-mono animate-fadeIn">
                 @2026 Nexora AI, Inc.
               </div>
             )}
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10 bg-gray-50 dark:bg-[#050505]">
        
        {/* Top Navbar */}
        <header className="hidden lg:flex h-20 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] px-6 lg:px-10 items-center justify-between shrink-0">
           {/* Search */}
           <div className="flex-1 max-w-md hidden sm:flex items-center">
             <div className="relative w-full">
               <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
               <input 
                 type="text" 
                 placeholder="Search" 
                 className="w-full pl-9 pr-12 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-accent-custom dark:focus:border-accent-custom text-gray-900 dark:text-white transition-colors"
               />
               <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-gray-400 font-mono font-bold">
                 <span>⌘</span><span>F</span>
               </div>
             </div>
           </div>

           {/* Right Icons & Profile */}
           <div className="flex items-center gap-4 sm:gap-6 ml-auto">
             <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500">
               <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
               </button>
               <button className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  <Gift className="w-5 h-5" />
               </button>
               <button className="hover:text-gray-900 dark:hover:text-white transition-colors relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#0a0a0a]" />
               </button>
             </div>
             
             <div className="h-8 w-[1px] bg-gray-200 dark:bg-white/10" />

             <div className="flex items-center gap-3">
               <div className="flex flex-col text-right hidden sm:flex">
                 <span className="text-[11px] font-bold text-gray-900 dark:text-white">
                   {user?.username || "Admin"}
                 </span>
                 <span className={`text-[10px] font-semibold ${
                   user?.is_superadmin
                     ? "text-accent-custom"
                     : "text-gray-500 dark:text-gray-400"
                 }`}>
                   {user?.is_superadmin ? "Super Admin" : "Admin"}
                 </span>
               </div>
               <div className="w-9 h-9 rounded-full bg-accent-custom/20 border border-accent-custom/30 overflow-hidden flex items-center justify-center text-accent-custom font-bold text-xs">
                 {user?.username ? user.username.slice(0, 2).toUpperCase() : "AD"}
               </div>
             </div>
           </div>
        </header>

        {/* Page Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {/* Soft background grid inside dashboard (dark mode only) */}
          <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none z-0 hidden dark:block" />
          
          <div className="relative z-10 w-full max-w-7xl mx-auto min-h-full">
            {children}
          </div>
        </div>
      </main>

    </div>
  );
}
