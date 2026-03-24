'use client'

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users, Plus, Loader2, Calendar,
  ChevronRight, LayoutGrid, Search
} from "lucide-react";
import { getTeacherClasses } from "@/lib/ecosystem-api/classesApi";

interface ClassGroup {
  id: number;
  name: string;
  code: string;
  created_at: string;
}

export default function TeacherClassList() {
  const router = useRouter();
  const { subdomain } = useParams<{ subdomain: string }>();

  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const base = `/school/${subdomain}/teacher`;

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getTeacherClasses();
        setClasses(data);
      } catch (err) {
        console.error("Error fetching classes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const filtered = classes.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 min-h-screen bg-slate-50 dark:bg-[#050507]">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <LayoutGrid size={18} className="text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Teacher Portal
              </span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white">
              My <span className="text-emerald-600">Classes</span>
            </h1>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(`${base}/classes/create`)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-600/20 font-bold transition-colors"
          >
            <Plus size={20} />
            New Class
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search classes..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
            <p className="font-medium">Loading your classrooms...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-white/5 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/10">
            <div className="inline-flex p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-4 text-slate-400">
              <Users size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {search ? "No classes match your search" : "No Classes Assigned"}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8">
              {search
                ? "Try a different search term."
                : "You haven't created or been assigned to any classes yet."}
            </p>
            {!search && (
              <button
                onClick={() => router.push(`${base}/classes/create`)}
                className="text-emerald-600 font-extrabold hover:text-emerald-700 underline underline-offset-4"
              >
                Create your first class now
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((cls, index) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => router.push(`${base}/classes/${cls.id}/subjects`)}
                className="group relative cursor-pointer bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 p-6 rounded-[2rem] hover:border-emerald-500/50 transition-all hover:shadow-2xl hover:shadow-emerald-500/10"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                    <Users size={24} />
                  </div>
                  <div className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full text-[10px] font-black text-slate-400 tracking-tighter uppercase">
                    {cls.code}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-500 transition-colors">
                  {cls.name}
                </h3>

                <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    <span>{new Date(cls.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    View Subjects
                  </span>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 group-hover:bg-emerald-500 group-hover:text-white transition-all text-slate-400">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}