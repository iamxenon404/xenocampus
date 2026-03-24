'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, School, UploadCloud, FileEdit,
  BarChart3, BookType, CalendarDays, Presentation,
  Command, ClipboardCheck, ChevronRight, LogOut, X,
} from "lucide-react";

interface SidebarProps {
  user: any;
  subdomain: string;
  onLogout: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export default function TeacherSidebar({ user, subdomain, onLogout, isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const base = `/school/${subdomain}/teacher`;

  const menuItems = [
    { name: "Dashboard",        path: `${base}`,                  icon: LayoutDashboard, shortcut: "D" },
    { name: "My Classes",       path: `${base}/classes`,          icon: School,          shortcut: "C" },
    { name: "Upload Resources", path: `${base}/resources`,        icon: UploadCloud,     shortcut: "U" },
    { name: "Manage MCQs",      path: `${base}/mcq`,              icon: FileEdit,        shortcut: "M" },
    { name: "Class Analytics",  path: `${base}/analytics`,        icon: BarChart3,       shortcut: "A" },
    { name: "Grading Center",   path: `${base}/grading`,          icon: ClipboardCheck,  shortcut: "G" },
    { name: "Library",          path: `${base}/elibrary`,         icon: BookType,        shortcut: "L" },
    { name: "Events",           path: `${base}/events`,           icon: CalendarDays,    shortcut: "E" },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {!isCollapsed && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCollapsed(true)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width:  isCollapsed ? (isMobile ? 64  : 80)    : (isMobile ? "90%" : 288),
          height: isCollapsed ? (isMobile ? 64  : "90%") : (isMobile ? "80%" : "90%"),
          top:    isMobile ? (isCollapsed ? "auto" : "10%") : "5%",
          bottom: isMobile && isCollapsed ? 24 : "auto",
          left:   isMobile ? (isCollapsed ? "auto" : "5%") : 16,
          right:  isMobile && isCollapsed ? 24 : (isMobile ? "5%" : "auto"),
          borderRadius: isCollapsed ? "1.5rem" : "2.5rem",
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={{ overflow: isMobile ? "hidden" : "visible" }}
        className={`
          fixed z-50 flex flex-col
          bg-white/80 dark:bg-[#050605]/90 backdrop-blur-2xl
          border border-slate-200/50 dark:border-white/[0.05]
          shadow-2xl shadow-emerald-500/10 scrollbar-hide
          ${isCollapsed ? "items-center" : ""}
        `}
      >
        {/* Mobile FAB collapsed state */}
        {isCollapsed && isMobile ? (
          <button
            onClick={(e) => { e.stopPropagation(); setIsCollapsed(false); }}
            className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-2xl shadow-lg"
          >
            <Presentation size={28} />
          </button>
        ) : (
          <>
            {/* Branding */}
            <div className={`p-6 mb-2 flex items-center justify-between w-full ${isCollapsed ? 'justify-center' : 'gap-4'}`}>
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0 w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/20">
                  <Presentation size={22} className="text-white z-10" />
                  <div className="absolute inset-0 bg-emerald-400 blur-lg opacity-20" />
                </div>
                {!isCollapsed && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
                    <span className="font-black tracking-tighter text-xl dark:text-white leading-none">
                      EDU<span className="text-emerald-500">OS</span>
                    </span>
                  </motion.div>
                )}
              </div>
              {!isCollapsed && isMobile && (
                <button onClick={() => setIsCollapsed(true)} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                  <X size={24} />
                </button>
              )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 space-y-2 overflow-y-auto scrollbar-hide w-full">
              {menuItems.map((item) => {
                const isActive = item.name === "Dashboard"
                  ? pathname === item.path
                  : pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => isMobile && setIsCollapsed(true)}
                    className={`relative flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 group
                      ${isActive
                        ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-white/[0.03]"
                      }`}
                  >
                    <div className="flex items-center gap-3 z-10">
                      <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className="flex-shrink-0" />
                      {!isCollapsed && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tracking-tight whitespace-nowrap">
                          {item.name}
                        </motion.span>
                      )}
                    </div>
                    {!isCollapsed && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity md:flex">
                        <Command size={10} className="text-slate-400" />
                        <span className="text-[10px] text-slate-400 font-mono">{item.shortcut}</span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Profile */}
            <div className="p-3 mt-auto w-full">
              <div className={`bg-slate-50 dark:bg-emerald-500/5 border border-slate-200/50 dark:border-emerald-500/10 rounded-[2rem] p-2 transition-all flex items-center ${isCollapsed ? 'flex-col gap-4 py-4' : 'gap-3 p-4'}`}>
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-white border-2 border-emerald-500/20">
                    {user?.username?.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#050605] rounded-full" />
                </div>
                {!isCollapsed && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-bold dark:text-white truncate">{user?.username}</span>
                    <span className="text-[9px] text-emerald-500/50 font-black uppercase tracking-tighter">Faculty</span>
                  </motion.div>
                )}
                <button
                  onClick={onLogout}
                  className={`flex items-center justify-center rounded-xl transition-all ${isCollapsed ? 'w-10 h-10 bg-red-500/10 text-red-500' : 'p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-500'}`}
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Desktop toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-emerald-500 rounded-full md:flex hidden items-center justify-center text-white shadow-lg z-[100] hover:scale-110 transition-transform cursor-pointer"
        >
          <ChevronRight size={14} className={`transition-transform duration-500 ${isCollapsed ? '' : 'rotate-180'}`} />
        </button>
      </motion.aside>
    </>
  );
}