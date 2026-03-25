'use client'

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getStudentClasses, type StudentClass } from "@/lib/ecosystem-api/studentClassesApi";
import { Plus, School, Hash, ArrowRight, Loader2, LayoutGrid } from "lucide-react";

export default function StudentClassList() {
  const router = useRouter();
  const { subdomain } = useParams<{ subdomain: string }>();

  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [loading, setLoading] = useState(true);

  const base = `/school/${subdomain}/student`;

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getStudentClasses();
        setClasses(data);
      } catch (err) {
        console.error("Error fetching classes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  return (
    <div className="p-4 md:p-8 min-h-screen bg-slate-50 dark:bg-[#050507] transition-colors duration-300">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              My <span className="text-indigo-600 dark:text-indigo-500">Classes</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Select a class group to view your enrolled subjects.
            </p>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(`${base}/classes/join`)}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-500/25 transition-all font-bold"
          >
            <Plus size={20} strokeWidth={3} />
            Join New Class
          </motion.button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">
              Retrieving your academic records...
            </p>
          </div>
        ) : classes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-6 bg-white dark:bg-white/[0.02] border border-dashed border-slate-300 dark:border-white/10 rounded-[2.5rem]"
          >
            <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
              <School size={32} />
            </div>
            <h3 className="text-xl font-bold dark:text-white text-slate-800">No classes found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center mt-2 max-w-xs leading-relaxed">
              You aren't enrolled in any classes yet. Use the "Join New Class" button above to get started.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {classes.map((cls, index) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => router.push(`${base}/classes/${cls.id}/subjects`)}
                className="group relative cursor-pointer bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
              >
                <div className="mb-4 w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <LayoutGrid size={24} />
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {cls.name}
                </h2>

                <div className="flex items-center gap-1.5 mt-2 text-slate-500 dark:text-slate-400">
                  <Hash size={14} strokeWidth={3} className="text-indigo-500/50" />
                  <span className="text-sm font-bold uppercase tracking-wider">{cls.code}</span>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    View Subjects
                  </span>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all">
                    <ArrowRight size={18} />
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-[2rem] pointer-events-none transition-opacity" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}