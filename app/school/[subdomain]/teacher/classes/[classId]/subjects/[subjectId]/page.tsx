'use client'

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, FileText, BookOpen, Download,
  ExternalLink, ChevronRight, Zap, Layers, BarChart3, Clock
} from "lucide-react";
import * as resourceApi from "@/lib/ecosystem-api/resourceApi";
import * as mcqApi from "@/lib/ecosystem-api/mcqApi";

interface Resource {
  id: number;
  title: string;
  resource_type: string;
  file_url?: string | null;
  external_url?: string | null;
}

export default function SubjectDashboard() {
  const router = useRouter();
  const { subdomain, classId, subjectId } = useParams<{
    subdomain: string;
    classId: string;
    subjectId: string;
  }>();

  const subjectIdNum = Number(subjectId);
  const base = `/school/${subdomain}/teacher`;

  const [resources, setResources] = useState<Resource[]>([]);
  const [tests, setTests] = useState<mcqApi.Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resourceData, testData] = await Promise.all([
          resourceApi.fetchTeacherResourcesBySubject?.(subjectIdNum) || [],
          mcqApi.getTestsBySubject(subjectIdNum),
        ]);
        setResources(resourceData);
        setTests(testData);
      } catch (err) {
        console.error("Failed to load subject data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [subjectIdNum]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-white dark:bg-[#050605]">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-emerald-500/10 dark:border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500" size={24} />
      </div>
      <p className="text-emerald-600 dark:text-emerald-500/50 font-black tracking-widest text-xs uppercase animate-pulse">
        Initializing Lab
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-[#050605] transition-colors duration-500">
      <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-12 pb-20">

        {/* Hero */}
        <section className="relative overflow-hidden bg-white dark:bg-gradient-to-br dark:from-[#0a0c0a] dark:to-[#050605] rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-14 border border-slate-200 dark:border-white/5 shadow-xl">
          <div className="hidden dark:block absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />

          <div className="relative z-10">
            <button
              onClick={() => router.push(`${base}/classes/${classId}/subjects`)}
              className="group flex items-center gap-3 text-slate-500 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 hover:text-emerald-600 dark:hover:text-white transition-all"
            >
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <ArrowLeft size={14} />
              </div>
              Back to Curriculum
            </button>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
              <div className="space-y-4">
                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-full uppercase tracking-tight inline-block">
                  Academic Module
                </span>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none text-slate-900 dark:text-white">
                  Subject{" "}
                  <span className="text-emerald-500 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-emerald-400 dark:to-emerald-600">
                    Lab.
                  </span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md text-lg">
                  Subject ID{" "}
                  <span className="text-emerald-600 dark:text-white font-mono">#{subjectId}</span>{" "}
                  — Orchestrate your learning materials and assessments.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex gap-4 p-2 bg-slate-50 dark:bg-white/5 backdrop-blur-2xl rounded-3xl border border-slate-200 dark:border-white/10">
                  <StatCard icon={<Layers size={16} />} label="Resources" value={resources.length} />
                  <StatCard icon={<BarChart3 size={16} />} label="Tests" value={tests.length} />
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-wrap gap-4">
              <button
                onClick={() => router.push(`${base}/resources/upload?subjectId=${subjectIdNum}`)}
                className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-sm hover:scale-105 transition-all flex items-center gap-3 shadow-xl"
              >
                <Plus size={20} strokeWidth={3} /> Upload Material
              </button>
              <button
                onClick={() => router.push(`${base}/mcq/create?subjectId=${subjectIdNum}`)}
                className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-3"
              >
                <Zap size={20} fill="currentColor" /> Create Assessment
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Resources */}
          <div className="lg:col-span-8 space-y-8">
            <SectionHeader title="Learning Materials" count={resources.length} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AnimatePresence mode="popLayout">
                {resources.map((res, idx) => (
                  <motion.div
                    key={res.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => router.push(`${base}/resources/${res.id}`)}
                    className="group relative cursor-pointer bg-white dark:bg-[#0d0f0d] border border-slate-200 dark:border-white/[0.05] p-7 rounded-[2rem] hover:border-emerald-500/50 transition-all shadow-sm hover:shadow-xl"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-14 h-14 bg-slate-50 dark:bg-emerald-500/10 text-slate-400 dark:text-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                        <BookOpen size={24} />
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {res.file_url && (
                          <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg text-slate-400">
                            <Download size={16} />
                          </div>
                        )}
                        {res.external_url && (
                          <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg text-slate-400">
                            <ExternalLink size={16} />
                          </div>
                        )}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors line-clamp-1">
                      {res.title}
                    </h3>
                    <span className="text-[10px] font-black text-slate-500 dark:text-emerald-500 uppercase tracking-widest px-2 py-1 bg-slate-100 dark:bg-emerald-500/5 rounded-md">
                      {res.resource_type}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Assessments */}
          <div className="lg:col-span-4 space-y-8">
            <SectionHeader title="Assessments" />
            <div className="space-y-4">
              {tests.map((test, idx) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => router.push(`${base}/mcq/${test.id}`)}
                  className="group cursor-pointer bg-white dark:bg-[#0d0f0d] border border-slate-200 dark:border-transparent p-5 rounded-2xl flex items-center justify-between transition-all hover:border-emerald-500/30 shadow-sm hover:shadow-lg dark:hover:bg-emerald-500/5"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:rotate-6 transition-transform">
                      <FileText size={20} className="text-emerald-600 dark:text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors">
                        {test.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase">
                          <Clock size={12} /> {test.duration_minutes}m
                        </div>
                        <div className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                        <div className="text-[10px] text-slate-500 font-bold uppercase">
                          {test.total_questions} Questions
                        </div>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </motion.div>
              ))}

              {tests.length === 0 && (
                <div className="p-12 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2.5rem] text-center">
                  <Zap size={24} className="text-slate-300 mx-auto mb-4" />
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No assessments yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Sub-components */
const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) => (
  <div className="px-5 py-3 flex items-center gap-4">
    <div className="text-emerald-600 dark:text-emerald-500">{icon}</div>
    <div>
      <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest leading-none mb-1">{label}</p>
      <p className="text-xl font-black leading-none text-slate-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const SectionHeader = ({ title, count }: { title: string; count?: number }) => (
  <div className="flex items-center gap-6 px-2">
    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{title}</h2>
    <div className="h-[2px] flex-1 bg-gradient-to-r from-slate-200 dark:from-emerald-500/20 to-transparent" />
    {count !== undefined && (
      <span className="px-3 py-1 bg-slate-100 dark:bg-emerald-500/10 text-slate-500 dark:text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-200 dark:border-emerald-500/20">
        {count}
      </span>
    )}
  </div>
);
