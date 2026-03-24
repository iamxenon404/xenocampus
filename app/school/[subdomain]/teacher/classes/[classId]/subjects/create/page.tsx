'use client'

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Loader2, CheckCircle2, AlertCircle, Layers } from "lucide-react";
import { createSubject, getTeacherClasses, type ClassGroup } from "@/lib/ecosystem-api/classesApi";

export default function CreateSubject() {
  const router = useRouter();
  const { subdomain, classId } = useParams<{ subdomain: string; classId: string }>();

  const [name, setName] = useState("");
  const [selectedClass, setSelectedClass] = useState<number | "">(
    classId ? Number(classId) : ""
  );
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const base = `/school/${subdomain}/teacher`;

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getTeacherClasses();
        setClasses(data);
      } catch {
        console.error("Failed to fetch classes");
      }
    };
    fetchClasses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return setStatus({ type: 'error', msg: "Please select a class" });

    setLoading(true);
    setStatus(null);

    try {
      const data = await createSubject(selectedClass, name);
      setStatus({ type: 'success', msg: `Subject "${data.name}" created successfully!` });
      setName("");
      setTimeout(() => router.push(`${base}/classes/${classId}/subjects`), 1500);
    } catch (err: any) {
      setStatus({
        type: 'error',
        msg: err.response?.data?.detail || "Error creating subject",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050507] p-6 flex flex-col items-center">
      <div className="w-full max-w-md">

        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-8 text-slate-500 hover:text-emerald-600 transition-colors font-bold text-xs tracking-widest uppercase"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 p-8 rounded-[2.5rem] shadow-xl"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600">
              <BookOpen size={28} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Add <span className="text-emerald-600">Subject</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                <Layers size={14} className="text-emerald-500" /> Target Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(Number(e.target.value))}
                required
                className="w-full px-5 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white appearance-none cursor-pointer"
              >
                <option value="" className="dark:bg-slate-900">Select a Class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id} className="dark:bg-slate-900">
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                Subject Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Advanced Physics"
                className="w-full px-5 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white placeholder:text-slate-400"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Create Subject"}
            </motion.button>
          </form>

          {status && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`mt-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${
                status.type === 'success'
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
              }`}
            >
              {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {status.msg}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}