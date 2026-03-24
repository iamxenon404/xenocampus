'use client'

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Plus, BookOpen, Loader2,
  ChevronRight, Library, Settings2, Hash
} from "lucide-react";
import { getClassSubjects, type Subject } from "@/lib/ecosystem-api/classesApi";

export default function ClassSubjects() {
  const router = useRouter();
  const { subdomain, classId } = useParams<{ subdomain: string; classId: string }>();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const base = `/school/${subdomain}/teacher`;

  useEffect(() => {
    if (!classId) return;
    const fetchSubjects = async () => {
      try {
        const data = await getClassSubjects(Number(classId));
        setSubjects(data);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, [classId]);

  return (
    <div className="p-4 md:p-8 min-h-screen bg-slate-50 dark:bg-[#050507]">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <button
              onClick={() => router.push(`${base}/classes`)}
              className="flex items-center gap-2 mb-4 text-slate-500 dark:text-emerald-400/60 hover:text-emerald-600 transition-all font-bold text-xs tracking-widest uppercase"
            >
              <ArrowLeft size={16} />
              Back to Classes
            </button>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white">
              Class <span className="text-emerald-600">Subjects</span>
            </h1>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`${base}/classes/${classId}/subjects/create`)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl shadow-lg font-bold"
          >
            <Plus size={20} />
            Create Subject
          </motion.button>
        </div>

        {/* Status Bar */}
        {!loading && (
          <div className="flex items-center gap-4 mb-8 text-sm font-medium text-slate-500">
            <span className="bg-white dark:bg-white/5 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10">
              Class ID: <span className="text-emerald-600">{classId}</span>
            </span>
            <span className="bg-white dark:bg-white/5 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10">
              Total: {subjects.length}
            </span>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
            <p className="text-slate-400 font-medium">Fetching curriculum...</p>
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-white/5 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-white/10">
            <Library className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-xl font-bold dark:text-white text-slate-800">No subjects found</h3>
            <p className="text-slate-500 mb-6">This class doesn't have any subjects yet.</p>
            <button
              onClick={() => router.push(`${base}/classes/${classId}/subjects/create`)}
              className="text-emerald-600 font-bold underline"
            >
              Add your first subject
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subj) => (
              <motion.div
                key={subj.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => router.push(`${base}/classes/${classId}/subjects/${subj.id}`)}
                className="group cursor-pointer bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 p-6 rounded-[2rem] hover:shadow-xl transition-all"
              >
                <div className="flex justify-between mb-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-xl">
                    <BookOpen size={24} />
                  </div>
                  <Settings2 size={18} className="text-slate-300" />
                </div>

                <h3 className="text-xl font-bold dark:text-white mb-2 group-hover:text-emerald-500 transition-colors">
                  {subj.name}
                </h3>

                <div className="flex items-center gap-2 text-slate-400 text-xs font-mono uppercase">
                  <Hash size={12} />
                  {subj.code || "No Code"}
                </div>

                <div className="mt-6 flex items-center gap-1 text-emerald-600 font-bold text-sm">
                  Manage <ChevronRight size={16} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}