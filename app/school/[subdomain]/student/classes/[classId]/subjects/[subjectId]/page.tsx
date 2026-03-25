'use client'

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { fetchStudentResourcesBySubject } from "@/lib/ecosystem-api/studentResourceApi";
import * as studentMcqApi from "@/lib/ecosystem-api/studentMcqApi";
import {
  Loader2, AlertCircle, Play, ChevronDown, BookOpen,
  BarChart3, ArrowLeft, Download, ExternalLink,
  Clock, FileText, Sparkles, Trophy, Users,
} from "lucide-react";

interface Resource {
  id: number;
  title: string;
  resource_type: string;
  file_url?: string | null;
  external_url?: string | null;
}

interface Test {
  id: number;
  title: string;
  description?: string;
  category: "weekly_questions" | "tests" | "exams" | "practice_questions";
  is_active: boolean;
  total_questions: number;
  duration_minutes: number;
}

export default function StudentSubjectDashboard() {
  const router = useRouter();
  const { subdomain, classId, subjectId } = useParams<{
    subdomain: string;
    classId: string;
    subjectId: string;
  }>();

  const subjectIdNum = Number(subjectId);
  const base = `/school/${subdomain}/student`;

  const [resources, setResources] = useState<Resource[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'resources' | 'tests'>('resources');

  useEffect(() => {
    if (!subjectId) return;
    const fetchData = async () => {
      try {
        const [resourceData, testData] = await Promise.all([
          fetchStudentResourcesBySubject(subjectIdNum),
          studentMcqApi.getTestsBySubject(subjectIdNum),
        ]);
        setResources(resourceData);
        setTests(testData.filter((t: Test) => t.is_active));
        setError(null);
      } catch {
        setError("Failed to synchronize subject data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [subjectIdNum]);

  const getCategoryStyles = (category: string) => {
    const styles: Record<string, string> = {
      weekly_questions: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
      tests: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20",
      exams: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20",
      practice_questions: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
    };
    return styles[category] || "bg-slate-500/10 text-slate-500";
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-[#050507]">
      <div className="relative">
        <div className="w-20 h-20 border-2 border-indigo-500/20 rounded-full animate-ping absolute" />
        <Loader2 className="w-20 h-20 animate-spin text-indigo-600 dark:text-indigo-500 relative z-10" />
      </div>
      <p className="mt-8 text-indigo-600 dark:text-indigo-400 font-black tracking-[0.3em] text-xs animate-pulse">
        SYNCHRONIZING CORE
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050507] text-slate-900 dark:text-white transition-colors duration-300">

      {/* Background glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-600/5 dark:bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-purple-600/5 dark:bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto">

        {/* Nav */}
        <nav className="flex items-center justify-between mb-12">
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => router.push(`${base}/classes/${classId}/subjects`)}
            className="group flex items-center gap-3 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-all shadow-sm backdrop-blur-md"
          >
            <ArrowLeft size={18} />
            <span className="text-xs font-black tracking-widest uppercase">Subjects</span>
          </motion.button>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
            <Sparkles size={14} className="animate-pulse" />
            <span className="text-[10px] font-black tracking-widest uppercase">Term 2 Active</span>
          </div>
        </nav>

        {/* Header */}
        <header className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-8"
          >
            <div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 italic text-slate-900 dark:text-white">
                Mastering <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400">
                  Your Potential.
                </span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 max-w-md font-medium">
                Curated learning materials and real-time assessments.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Resources" val={resources.length} icon={<BookOpen size={20} />} color="text-blue-600 dark:text-blue-400" />
              <StatCard label="Tests" val={tests.length} icon={<BarChart3 size={20} />} color="text-rose-600 dark:text-rose-400" />
            </div>
          </motion.div>
        </header>

        {error && (
          <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl p-4 mb-8 text-rose-600 dark:text-rose-500">
            <AlertCircle size={20} />
            <span className="font-bold text-sm">{error}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 p-1.5 bg-slate-200/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl w-fit backdrop-blur-md">
          {(['resources', 'tests'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all uppercase ${
                activeTab === tab
                  ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Main content */}
          <main className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {activeTab === 'resources' ? (
                <motion.div
                  key="resources"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {resources.length === 0 ? (
                    <EmptyState icon={<FileText />} message="No resources in vault." />
                  ) : (
                    resources.map((res) => (
                      <ResourceCard
                        key={res.id}
                        res={res}
                        onClick={() => router.push(`${base}/resources/${res.id}`)}
                      />
                    ))
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="tests"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {tests.length === 0 ? (
                    <EmptyState icon={<Trophy />} message="No assessments found." />
                  ) : (
                    tests.map((test) => (
                      <TestCard
                        key={test.id}
                        test={test}
                        styles={getCategoryStyles(test.category)}
                        onStart={() => router.push(`${base}/mcq/take/${test.id}`)}
                      />
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 overflow-hidden shadow-xl"
            >
              <div className="relative z-10">
                <BarChart3 className="text-indigo-100 mb-6" size={32} />
                <h3 className="text-2xl font-black mb-2 uppercase italic tracking-tighter text-white">Performance</h3>
                <p className="text-indigo-100/70 text-sm mb-8 font-medium">Real-time breakdown of your score trends.</p>
                <button
                  onClick={() => router.push(`${base}/grading`)}
                  className="w-full bg-white text-indigo-600 py-4 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-all shadow-lg"
                >
                  VIEW RESULTS
                </button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            </motion.div>

            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md shadow-sm">
              <h3 className="font-black text-[10px] tracking-[0.3em] text-slate-400 dark:text-slate-500 uppercase mb-8">Quick Tools</h3>
              <div className="space-y-4">
                <SidebarButton icon={<Users size={18} />} label="Classmates" />
                <SidebarButton icon={<Trophy size={18} />} label="Leaderboard" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* Sub-components */
const StatCard = ({ label, val, icon, color }: { label: string; val: number; icon: React.ReactNode; color: string }) => (
  <div className="bg-white dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-[2rem] min-w-[140px] shadow-sm">
    <div className={`${color} mb-3`}>{icon}</div>
    <p className="text-3xl font-black text-slate-900 dark:text-white">{val}</p>
    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</p>
  </div>
);

const ResourceCard = ({ res, onClick }: { res: Resource; onClick: () => void }) => (
  <motion.div
    whileHover={{ y: -5 }}
    onClick={onClick}
    className="p-6 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-[2rem] cursor-pointer transition-all flex flex-col justify-between min-h-[160px] shadow-sm hover:shadow-md dark:hover:bg-white/[0.06]"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-indigo-100 dark:bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400">
        <BookOpen size={20} />
      </div>
      <div className="flex gap-2 text-slate-400">
        {res.file_url && <Download size={14} />}
        {res.external_url && <ExternalLink size={14} />}
      </div>
    </div>
    <h3 className="font-black text-lg leading-tight mb-4 line-clamp-2 text-slate-800 dark:text-white">{res.title}</h3>
    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400/80 bg-indigo-50 dark:bg-indigo-500/5 w-fit px-3 py-1 rounded-lg">
      {res.resource_type}
    </span>
  </motion.div>
);

const TestCard = ({ test, styles, onStart }: { test: Test; styles: string; onStart: () => void }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-[2.5rem] hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-all shadow-sm">
    <div className="space-y-3">
      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${styles}`}>
        {test.category.replace('_', ' ')}
      </span>
      <h3 className="font-black text-2xl tracking-tight text-slate-900 dark:text-white">{test.title}</h3>
      <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-indigo-600 dark:text-indigo-500" /> {test.total_questions} Qs
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-indigo-600 dark:text-indigo-500" /> {test.duration_minutes} Mins
        </div>
      </div>
    </div>
    <button
      onClick={onStart}
      className="bg-indigo-600 dark:bg-white text-white dark:text-black hover:bg-indigo-700 dark:hover:bg-indigo-500 dark:hover:text-white px-10 py-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-3 tracking-widest shadow-lg"
    >
      <Play size={14} fill="currentColor" /> START
    </button>
  </div>
);

const SidebarButton = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <button className="w-full flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-indigo-500/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-all group">
    <div className="flex items-center gap-4">
      <div className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{icon}</div>
      <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-white">{label}</span>
    </div>
    <ChevronDown size={16} className="-rotate-90 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all" />
  </button>
);

const EmptyState = ({ icon, message }: { icon: React.ReactNode; message: string }) => (
  <div className="w-full py-20 flex flex-col items-center justify-center bg-slate-100/50 dark:bg-white/[0.02] border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[3rem]">
    <div className="text-slate-300 dark:text-slate-700 mb-4 scale-[2]">{icon}</div>
    <p className="text-slate-400 dark:text-slate-500 font-bold text-sm tracking-widest uppercase">{message}</p>
  </div>
);
