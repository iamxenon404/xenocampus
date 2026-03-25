'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { fetchTeacherResources, deleteResource } from "@/lib/ecosystem-api/resourceApi";
import type { ResourceModel } from "@/lib/ecosystem-api/types";
import ResourceCard from "@/components/ecosystem/teacher/ResourceCard";
import UploadResourceForm from "@/components/ecosystem/teacher/UploadResourceForm";
import {
  Plus, RefreshCw, LayoutGrid,
  Layers, Bookmark, SlidersHorizontal, X, AlertCircle
} from "lucide-react";

export default function TeacherResourcesPage() {
  const { subdomain } = useParams<{ subdomain: string }>();

  const [resources, setResources] = useState<ResourceModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [filterClass, setFilterClass] = useState<number | null>(null);
  const [filterSubject, setFilterSubject] = useState<number | null>(null);

  const base = `/school/${subdomain}/teacher`;

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchTeacherResources();
      setResources(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load resources. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this resource?")) return;
    try {
      await deleteResource(id);
      await load();
    } catch (err: any) {
      alert("Delete failed: " + (err.message || err));
    }
  };

  const uniqueClasses = Array.from(
    new Map(resources.map((r) => r.class_group).filter(Boolean).map((c) => [c!.id, c])).values()
  ).sort((a, b) => a!.id - b!.id);

  const uniqueSubjects = Array.from(
    new Map(resources.map((r) => r.subject).filter(Boolean).map((s) => [s!.id, s])).values()
  ).sort((a, b) => a!.id - b!.id);

  const filteredResources = resources.filter((r) => {
    if (filterClass && r.class_group?.id !== filterClass) return false;
    if (filterSubject && r.subject?.id !== filterSubject) return false;
    return true;
  });

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#060a05] gap-4">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-emerald-600 font-black uppercase tracking-widest text-xs">Accessing Archives...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-10 min-h-screen bg-slate-50 dark:bg-[#060a05] text-slate-900 dark:text-slate-100 transition-colors duration-500">

      {/* Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-[0.3em]">
            <Bookmark size={14} /> Faculty Portal
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
            Curriculum <span className="text-emerald-500 italic">Hub.</span>
          </h1>
        </div>

        <div className="flex gap-3">
          <button
            onClick={load}
            className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:rotate-180 transition-all duration-500"
          >
            <RefreshCw size={20} className="text-slate-400" />
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Plus size={20} strokeWidth={3} /> New Resource
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-10">

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-rose-500/10 border border-rose-500/20 rounded-[2rem] p-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500/60">Sync Error</p>
                  <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{error}</p>
                </div>
              </div>
              <button onClick={() => setError(null)} className="p-2 hover:bg-rose-500/10 rounded-full text-rose-500 transition-colors">
                <X size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Total Materials" value={resources.length} icon={<LayoutGrid size={24} />} color="emerald" />
          <StatCard label="Active Classes" value={uniqueClasses.length} icon={<UsersIcon size={24} />} color="blue" />
          <StatCard label="Subjects Covered" value={uniqueSubjects.length} icon={<Layers size={24} />} color="purple" />
        </section>

        {/* Filters */}
        <section className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem] p-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 px-4 border-r border-slate-200 dark:border-white/10">
            <SlidersHorizontal size={18} className="text-slate-400" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Filters</span>
          </div>

          <select
            value={filterClass || ""}
            onChange={(e) => setFilterClass(e.target.value ? parseInt(e.target.value) : null)}
            className="bg-transparent font-bold text-sm focus:outline-none cursor-pointer p-2 dark:text-white"
          >
            <option value="">All Classes</option>
            {uniqueClasses.map(c => <option key={c?.id} value={c?.id}>{c?.name}</option>)}
          </select>

          <select
            value={filterSubject || ""}
            onChange={(e) => setFilterSubject(e.target.value ? parseInt(e.target.value) : null)}
            className="bg-transparent font-bold text-sm focus:outline-none cursor-pointer p-2 dark:text-white"
          >
            <option value="">All Subjects</option>
            {uniqueSubjects.map(s => <option key={s?.id} value={s?.id}>{s?.name}</option>)}
          </select>

          {(filterClass || filterSubject) && (
            <button
              onClick={() => { setFilterClass(null); setFilterSubject(null); }}
              className="ml-auto flex items-center gap-2 text-[10px] font-black uppercase text-red-500 hover:opacity-70"
            >
              <X size={14} /> Clear All
            </button>
          )}
        </section>

        {/* Upload modal */}
        <AnimatePresence>
          {showUpload && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-[#0a0a0c] w-full max-w-2xl rounded-[3rem] shadow-2xl border border-white/10"
              >
                <UploadResourceForm onClose={() => { setShowUpload(false); load(); }} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        {filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredResources.map((r, idx) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link href={`${base}/resources/${r.id}`} className="block group">
                  <ResourceCard resource={r} onDelete={handleDelete} />
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[3rem]">
            <p className="text-slate-400 font-bold">No resources found matching these filters.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    emerald: "text-emerald-500 bg-emerald-500/10",
    blue: "text-blue-500 bg-blue-500/10",
    purple: "text-purple-500 bg-purple-500/10",
  };
  return (
    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-8 rounded-[2.5rem] flex items-center justify-between shadow-sm">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
        <p className="text-4xl font-black tracking-tighter">{value.toString().padStart(2, '0')}</p>
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors[color]}`}>
        {icon}
      </div>
    </div>
  );
}

function UsersIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}