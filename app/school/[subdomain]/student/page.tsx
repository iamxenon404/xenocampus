'use client'

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEcoAuth } from "@/components/ecosystem/EcoAuthProvider";
import {
  BookOpen, BrainCircuit, BarChart3, Library,
  CalendarDays, ArrowUpRight, Clock, GraduationCap, Zap
} from "lucide-react";

export default function StudentDashboard() {
  const router = useRouter();
  const { subdomain } = useParams<{ subdomain: string }>();
  const { user } = useEcoAuth();

  const base = `/school/${subdomain}/student`;

  const quickLinks = [
    { title: "Resources", icon: BookOpen,    color: "indigo",  path: `${base}/resources` },
    { title: "MCQ Tests", icon: BrainCircuit, color: "purple", path: `${base}/mcq` },
    { title: "E-Library", icon: Library,     color: "blue",    path: `${base}/elibrary` },
    { title: "Events",    icon: CalendarDays, color: "rose",   path: `${base}/events` },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 pb-12 animate-in fade-in duration-1000">

      {/* Hero Banner */}
      <section className="relative min-h-[400px] flex flex-col justify-between overflow-hidden bg-[#0a0a0c] dark:bg-indigo-600 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl border border-white/5">
        <div className="relative z-10 flex justify-between items-start">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2 rounded-full border border-white/10"
          >
            <Clock size={16} className="text-indigo-300" />
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-100">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </motion.div>
          <div className="hidden md:flex items-center gap-2 bg-indigo-500/20 px-4 py-2 rounded-2xl border border-indigo-400/20">
            <Zap size={14} className="text-yellow-400 fill-yellow-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">System Online</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <motion.h1
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl md:text-8xl font-black tracking-tighter leading-none"
          >
            Elevate your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
              Learning.
            </span>
          </motion.h1>
          <p className="text-indigo-100/60 text-xl font-medium max-w-lg leading-relaxed">
            Welcome back,{" "}
            <span className="text-white font-bold underline underline-offset-4 decoration-indigo-400/50">
              {user?.username || 'Student'}
            </span>. Your learning modules are ready.
          </p>
        </div>

        <div className="relative z-10 pt-8 border-t border-white/10 flex items-center gap-6">
          <div className="flex -space-x-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-indigo-600 bg-indigo-400 flex items-center justify-center text-[10px] font-bold">
                {i}
              </div>
            ))}
          </div>
          <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest">
            3 Courses Active this semester
          </p>
        </div>

        <div className="absolute top-0 right-0 w-1/2 h-full">
          <svg viewBox="0 0 400 400" className="absolute top-0 right-0 opacity-20 w-full h-full">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'white', stopOpacity: 0.2 }} />
                <stop offset="100%" style={{ stopColor: 'white', stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            <circle cx="300" cy="100" r="150" fill="url(#grad1)" />
          </svg>
        </div>
        <div className="absolute -bottom-48 -left-24 w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[120px]" />
      </section>

      {/* Quick Links Grid */}
      <section className="space-y-8 px-2">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold dark:text-white tracking-tight">Access Modules</h2>
          <div className="h-px flex-1 bg-slate-200 dark:bg-white/5" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickLinks.map((link, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(link.path)}
              className="flex flex-col items-start p-8 bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/[0.05] rounded-[2.5rem] hover:border-indigo-500 transition-all group shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10"
            >
              <div className={`p-4 rounded-2xl bg-${link.color}-500/10 text-${link.color}-500 mb-6 group-hover:rotate-12 transition-transform duration-500`}>
                <link.icon size={28} />
              </div>
              <div className="space-y-1 text-left">
                <h3 className="text-lg font-bold dark:text-white">{link.title}</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Access your portal</p>
              </div>
              <div className="mt-6 self-end text-slate-300 dark:text-white/10 group-hover:text-indigo-500 transition-colors">
                <ArrowUpRight size={24} />
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Performance Preview */}
      <section className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-10">
        <div className="p-6 bg-white dark:bg-black rounded-3xl shadow-xl">
          <BarChart3 size={40} className="text-indigo-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold dark:text-white tracking-tight">Performance Analytics</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md">
            Detailed tracking of your grades and attendance will appear here once term results are published.
          </p>
        </div>
        <button
          onClick={() => router.push(`${base}/grading`)}
          className="md:ml-auto px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm hover:scale-105 transition-transform"
        >
          View Full Report
        </button>
      </section>

      {/* Footer */}
      <footer className="pt-8 flex justify-between items-center px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600/10 rounded-lg flex items-center justify-center">
            <GraduationCap size={16} className="text-indigo-600" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">EDUOS Student Platform</span>
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">© 2026 Academic Integrity</p>
      </footer>
    </div>
  );
}