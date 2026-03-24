'use client'

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, School, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { createClass } from "@/lib/ecosystem-api/classesApi";

export default function CreateClass() {
  const router = useRouter();
  const { subdomain } = useParams<{ subdomain: string }>();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const base = `/school/${subdomain}/teacher`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const data = await createClass(name);
      setStatus({ type: 'success', msg: `Class "${data.name}" created successfully!` });
      setName("");
      setTimeout(() => router.push(`${base}/classes`), 2000);
    } catch (err: any) {
      setStatus({
        type: 'error',
        msg: err.response?.data?.detail || "Error creating class",
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
          className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600">
              <School size={28} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              New <span className="text-emerald-600">Class</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                Class Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Grade 10 - Mathematics"
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
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Initialize Class"}
            </motion.button>
          </form>

          {status && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`mt-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${
                status.type === 'success'
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                  : "bg-red-50 text-red-700 border border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
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