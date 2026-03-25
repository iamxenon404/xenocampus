'use client'

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { studentJoinClass } from "@/lib/ecosystem-api/studentClassesApi";

export default function JoinClass() {
  const router = useRouter();
  const { subdomain } = useParams<{ subdomain: string }>();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; msg: string }>({ type: null, msg: "" });

  const base = `/school/${subdomain}/student`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return setStatus({ type: 'error', msg: "Please enter a class code." });

    setLoading(true);
    setStatus({ type: null, msg: "" });

    try {
      const cls = await studentJoinClass(code.trim());
      setStatus({ type: 'success', msg: `Successfully joined "${cls.name}"!` });
      setCode("");
      setTimeout(() => router.push(`${base}/classes`), 1500);
    } catch (err: any) {
      setStatus({
        type: 'error',
        msg: err.response?.data?.detail || "Failed to join class. Please check the code.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-[#050507]/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-500/10"
      >
        <button
          onClick={() => router.push(`${base}/classes`)}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-500 transition-colors mb-8 text-sm font-medium group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to list
        </button>

        <div className="mb-8">
          <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 mb-4">
            <KeyRound size={28} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Join <span className="text-indigo-500">Class</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Enter the unique enrollment code provided by your teacher.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="e.g. CLS-12345"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full px-6 py-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white transition-all font-mono tracking-widest uppercase placeholder:font-sans placeholder:tracking-normal"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Enroll Now"}
          </button>
        </form>

        <AnimatePresence mode="wait">
          {status.msg && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mt-6 p-4 rounded-2xl flex items-center gap-3 font-medium text-sm ${
                status.type === 'success'
                  ? "bg-green-500/10 text-green-600 border border-green-500/20"
                  : "bg-red-500/10 text-red-500 border border-red-500/20"
              }`}
            >
              {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {status.msg}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}