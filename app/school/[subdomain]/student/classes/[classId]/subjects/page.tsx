'use client'

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Plus, BookOpen, Search,
  Loader2, Hash, ChevronRight, BookMarked
} from "lucide-react";
import { getStudentSubjects, type StudentSubject } from "@/lib/ecosystem-api/studentClassesApi";

export default function StudentClassSubjects() {
  const router = useRouter();
  const { subdomain, classId } = useParams<{ subdomain: string; classId: string }>();

  const [subjects, setSubjects] = useState<StudentSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const base = `/school/${subdomain}/student`;

  useEffect(() => {
    if (!classId) return;
    const fetchSubjects = async () => {
      try {
        const all = await getStudentSubjects();
        setSubjects(all.filter((s) => s.class_group === Number(classId)));
      } catch (err) {
        console.error("Failed to fetch subjects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, [classId]);

  const filtered = subjects.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 min-h-screen bg-slate-50 dark:bg-[#050507] transition-colors duration-300">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <button
              onClick={() => router.push(`${base}/classes`)}
              className="group flex items-center gap-2 mb-4 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-medium text-sm"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to Classes
            </button>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Class <span className="text-indigo-600 dark:text-indigo-500">Subjects</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Manage your modules and track your academic progress.
            </p>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(`${base}/classes/${classId}/subjects/join`)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-500/25 transition-all font-bold"
          >
            <Plus size={20} strokeWidth={3} />
            Join Subject
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search your subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white transition-all"
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium animate-pulse">Loading subjects...</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-6 bg-white dark:bg-white/[0.02] border border-dashed border-slate-300 dark:border-white/10 rounded-[2.5rem]"
          >
            <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
              <BookOpen size={32} />
            </div>
            <h3 className="text-xl font-bold dark:text-white text-slate-800">
              {searchTerm ? "No matches found" : "No subjects joined"}
            </h3>
            <p className="text-slate-500 text-center mt-2 max-w-xs">
              {searchTerm
                ? "Adjust your search terms."
                : "Click 'Join Subject' to start your learning journey."}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((subj, index) => (
              <motion.div
                key={subj.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => router.push(`${base}/classes/${classId}/subjects/${subj.id}`)}
                className="group relative cursor-pointer bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 p-6 rounded-[2rem] hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    <BookMarked size={24} />
                  </div>
                  <div className="p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-50 dark:bg-white/5 text-indigo-600 dark:text-indigo-400">
                    <ChevronRight size={18} />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {subj.name}
                </h3>

                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Hash size={14} className="text-indigo-500/50" strokeWidth={3} />
                  <span className="text-xs font-black uppercase tracking-widest">ID: {subj.id}</span>
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 rounded-[2rem] transition-opacity pointer-events-none" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}