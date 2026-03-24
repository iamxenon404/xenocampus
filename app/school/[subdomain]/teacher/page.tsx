'use client'

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEcoAuth } from "@/components/ecosystem/EcoAuthProvider";
import {
  UploadCloud, FileEdit, BarChart3, ArrowUpRight,
  Clock, Presentation, Users, CheckCircle, PlusCircle
} from "lucide-react";

export default function TeacherDashboard() {
  const router = useRouter();
  const { subdomain } = useParams<{ subdomain: string }>();
  const { user } = useEcoAuth();

  const base = `/school/${subdomain}/teacher`;

  const features = [
    {
      title: "Content Lab",
      desc: "Upload learning materials & manage your syllabus resources.",
      icon: UploadCloud,
      path: `${base}/resources/upload`,
      styles: {
        iconBg: "bg-emerald-500/10", iconText: "text-emerald-500",
        hoverShadow: "hover:shadow-emerald-500/10", accentBar: "bg-emerald-500/20"
      }
    },
    {
      title: "Assessment Engine",
      desc: "Design quizzes, add questions, and set live exam timers.",
      icon: FileEdit,
      path: `${base}/mcq`,
      styles: {
        iconBg: "bg-blue-500/10", iconText: "text-blue-500",
        hoverShadow: "hover:shadow-blue-500/10", accentBar: "bg-blue-500/20"
      }
    },
    {
      title: "Insight Analytics",
      desc: "View student engagement, test scores, and progress trends.",
      icon: BarChart3,
      path: `${base}/analytics`,
      styles: {
        iconBg: "bg-purple-500/10", iconText: "text-purple-500",
        hoverShadow: "hover:shadow-purple-500/10", accentBar: "bg-purple-500/20"
      }
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 pb-12 animate-in fade-in duration-1000">

      {/* Hero Banner */}
      <section className="relative min-h-[380px] flex flex-col justify-between overflow-hidden bg-[#050605] dark:bg-emerald-600 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl border border-white/5">
        <div className="relative z-10 flex justify-between items-start">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2 rounded-full border border-white/10"
          >
            <Clock size={16} className="text-emerald-300" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-100">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </motion.div>
          <div className="hidden md:flex items-center gap-2 bg-emerald-500/20 px-4 py-2 rounded-2xl border border-emerald-400/20">
            <Presentation size={14} className="text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">Faculty Session Active</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <motion.h1
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl md:text-7xl font-black tracking-tighter leading-none"
          >
            Empower the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-200 to-emerald-400">
              Next Generation.
            </span>
          </motion.h1>
          <p className="text-emerald-100/60 text-xl font-medium max-w-lg leading-relaxed">
            Welcome back,{" "}
            <span className="text-white font-bold underline underline-offset-4 decoration-emerald-400/50">
              Prof. {user?.username || 'Educator'}
            </span>. Your virtual classroom is live.
          </p>
        </div>

        <div className="relative z-10 pt-8 border-t border-white/10 flex flex-wrap items-center gap-8">
          <div className="flex items-center gap-3">
            <Users size={18} className="text-emerald-400" />
            <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest">Faculty Network Online</p>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle size={18} className="text-emerald-400" />
            <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest">Academic Year 2025-26</p>
          </div>
        </div>

        <div className="absolute -bottom-48 -right-24 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-10 right-10 opacity-5 pointer-events-none">
          <Presentation size={240} />
        </div>
      </section>

      {/* Feature Cards */}
      <section className="space-y-8 px-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold dark:text-white tracking-tight">Faculty Tools</h2>
            <div className="h-px w-32 bg-slate-200 dark:bg-white/5" />
          </div>
          <button
            onClick={() => router.push(`${base}/classes`)}
            className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-widest hover:underline transition-all"
          >
            <PlusCircle size={14} />
            Quick Action
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -10 }}
              onClick={() => router.push(item.path)}
              className={`group cursor-pointer bg-white dark:bg-[#0a0c0a] border border-slate-200 dark:border-white/[0.05] p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl ${item.styles.hoverShadow} transition-all duration-500 relative overflow-hidden`}
            >
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all">
                <ArrowUpRight size={20} className={item.styles.iconText} />
              </div>
              <div className={`w-16 h-16 flex items-center justify-center rounded-2xl mb-8 ${item.styles.iconBg} ${item.styles.iconText} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                <item.icon size={32} strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">{item.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-500 leading-relaxed font-medium">{item.desc}</p>
              <div className={`mt-8 h-1 w-12 ${item.styles.accentBar} group-hover:w-full transition-all duration-700 rounded-full`} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-8 border-t border-slate-200 dark:border-white/[0.05] flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
            <Presentation size={16} className="text-emerald-500" />
          </div>
          <p className="text-[10px] font-black tracking-[0.2em] uppercase">EDUOS Faculty Network • 2026</p>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest">Secured Educator Access Profile</p>
      </footer>
    </div>
  );
}