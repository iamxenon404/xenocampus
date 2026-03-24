'use client'

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEcoAuth } from "@/components/ecosystem/EcoAuthProvider";
import TeacherSidebar from "./TeacherSidebar";
// import TeacherSidebar from "@/components/ecosystem/teacher/TeacherSidebar";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { subdomain } = useParams<{ subdomain: string }>();
  const { user, role, logout } = useEcoAuth();

  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsCollapsed(true);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 768) return;
      setIsCollapsed(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push(`/school/${subdomain}/login`);
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#020302] transition-colors duration-500">
      <TeacherSidebar
        user={user}
        subdomain={subdomain}
        onLogout={handleLogout}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header
          className={`h-20 flex items-center justify-between px-10 border-b border-slate-100 dark:border-white/[0.03] bg-white/50 dark:bg-[#020302]/50 backdrop-blur-xl sticky top-0 z-30 transition-all duration-500 ${
            isCollapsed ? "md:ml-24 ml-0" : "ml-0 md:ml-80"
          }`}
        >
          <div>
            <h2 className="text-xl font-bold dark:text-white tracking-tight">Faculty Control Center</h2>
            <p className="text-[10px] font-bold text-emerald-600/60 dark:text-emerald-500/40 uppercase tracking-[0.2em]">
              {user?.email}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>Academic Year 2025/26</span>
          </div>
        </header>

        <main
          className={`transition-all duration-500 pt-10 pr-6 md:pr-10 ${
            isCollapsed ? "md:pl-28 pl-6" : "md:pl-[340px] pl-6"
          }`}
        >
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}