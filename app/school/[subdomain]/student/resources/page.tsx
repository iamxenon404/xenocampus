'use client'

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchStudentResources } from "@/lib/ecosystem-api/studentResourceApi";
import type { ResourceModel } from "@/lib/ecosystem-api/types";
import {
  BookOpen, Filter, Search, X,
  ChevronRight, FileText, Video, GraduationCap
} from "lucide-react";

export default function StudentResourcesPage() {
  const router = useRouter();
  const { subdomain } = useParams<{ subdomain: string }>();

  const [resources, setResources] = useState<ResourceModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterClass, setFilterClass] = useState<number | null>(null);
  const [filterSubject, setFilterSubject] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const base = `/school/${subdomain}/student`;

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchStudentResources();
        setResources(data);
      } catch (err: any) {
        setError(err.message || "Failed to load resources");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const uniqueClasses = useMemo(() =>
    resources
      .map((r) => r.class_group)
      .filter(Boolean)
      .filter((c, i, arr) => i === arr.findIndex(x => x?.id === c?.id))
      .sort((a, b) => (a?.id ?? 0) - (b?.id ?? 0)),
    [resources]
  );

  const uniqueSubjects = useMemo(() =>
    resources
      .map((r) => r.subject)
      .filter(Boolean)
      .filter((s, i, arr) => i === arr.findIndex(x => x?.id === s?.id))
      .sort((a, b) => (a?.id ?? 0) - (b?.id ?? 0)),
    [resources]
  );

  const filteredResources = resources.filter((r) => {
    const matchesClass = !filterClass || r.class_group?.id === filterClass;
    const matchesSubject = !filterSubject || r.subject?.id === filterSubject;
    const matchesSearch = !searchQuery ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSubject && matchesSearch;
  });

  const clearFilters = () => {
    setFilterClass(null);
    setFilterSubject(null);
    setSearchQuery("");
  };

  const hasActiveFilters = filterClass || filterSubject || searchQuery;

  if (loading) return (
    <div className="p-8 space-y-6 animate-pulse bg-white dark:bg-[#050507] min-h-screen">
      <div className="h-10 bg-slate-100 dark:bg-white/[0.05] rounded-md w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-slate-100 dark:bg-white/[0.05] rounded-3xl" />
        ))}
      </div>
      <div className="h-64 bg-slate-100 dark:bg-white/[0.05] rounded-3xl" />
    </div>
  );

  return (
    <div className="p-4 md:p-8 min-h-screen bg-white dark:bg-[#050507] text-slate-900 dark:text-white transition-colors duration-300">

      {/* Header */}
      <header className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight dark:text-white">
              Learning <span className="text-indigo-500">Resources</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Curated materials to help you excel in your studies.
            </p>
            {error && <p className="text-rose-500 text-sm mt-1">{error}</p>}
          </div>

          <div className="bg-indigo-500/10 px-4 py-3 rounded-[2rem] border border-indigo-500/20 flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <GraduationCap size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-black text-indigo-500">Inventory</p>
              <p className="text-sm font-bold">{resources.length} Available Items</p>
            </div>
          </div>
        </div>
      </header>

      {/* Filter bar */}
      <section className="mb-10 sticky top-4 z-40">
        <div className="bg-white/80 dark:bg-[#0a0a0c]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.05] rounded-[2.5rem] shadow-2xl shadow-indigo-500/5 p-2">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2">

            {/* Search */}
            <div className="relative flex-grow group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-4 py-4 rounded-2xl bg-transparent border-none focus:ring-0 outline-none placeholder:text-slate-500 font-semibold text-slate-700 dark:text-white"
              />
            </div>

            <div className="hidden lg:block w-px h-8 bg-slate-200 dark:bg-white/10 mx-2" />

            {/* Filters */}
            <div className="flex flex-wrap md:flex-nowrap items-center gap-2 px-2 pb-2 lg:pb-0">

              <div className="relative flex-1 md:flex-none">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={filterClass || ""}
                  onChange={(e) => setFilterClass(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full md:w-40 pl-10 pr-8 py-3 rounded-2xl bg-slate-100/50 dark:bg-white/[0.03] border-transparent focus:ring-2 focus:ring-indigo-500/20 text-xs font-bold appearance-none cursor-pointer transition-all hover:bg-slate-200/50 dark:hover:bg-white/[0.06] dark:text-white outline-none"
                >
                  <option value="">All Grades</option>
                  {uniqueClasses.map((c) => (
                    <option key={c?.id} value={c?.id}>{c?.name}</option>
                  ))}
                </select>
              </div>

              <div className="relative flex-1 md:flex-none">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={filterSubject || ""}
                  onChange={(e) => setFilterSubject(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full md:w-40 pl-10 pr-8 py-3 rounded-2xl bg-slate-100/50 dark:bg-white/[0.03] border-transparent focus:ring-2 focus:ring-indigo-500/20 text-xs font-bold appearance-none cursor-pointer transition-all hover:bg-slate-200/50 dark:hover:bg-white/[0.06] dark:text-white outline-none"
                >
                  <option value="">All Subjects</option>
                  {uniqueSubjects.map((s) => (
                    <option key={s?.id} value={s?.id}>{s?.name}</option>
                  ))}
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-rose-500 hover:bg-rose-500/10 font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  <X size={16} /> Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      {filteredResources.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-white/[0.02] rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10">
          <div className="bg-slate-100 dark:bg-white/[0.05] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="text-slate-400" size={32} />
          </div>
          <h3 className="text-xl font-bold dark:text-white">No resources found</h3>
          <p className="text-slate-500 mt-2">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((r) => (
            <div
              key={r.id}
              onClick={() => router.push(`${base}/resources/${r.id}`)}
              className="group relative bg-white dark:bg-white/[0.02] rounded-[2.5rem] p-7 border border-slate-200 dark:border-white/[0.05] hover:border-indigo-500/50 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 cursor-pointer overflow-hidden"
            >
              {/* Ghost bg icon */}
              <div className="absolute -right-6 -top-6 opacity-[0.03] dark:opacity-[0.07] group-hover:scale-125 transition-transform duration-700 text-indigo-500">
                <BookOpen size={160} />
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-inner">
                  {r.resource_type?.toLowerCase().includes('video')
                    ? <Video size={22} />
                    : <FileText size={22} />}
                </div>
                <span className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  {r.resource_type || 'General'}
                </span>
              </div>

              <h2 className="font-bold text-2xl leading-tight mb-3 dark:text-white group-hover:text-indigo-500 transition-colors">
                {r.title}
              </h2>

              <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-8 leading-relaxed font-medium">
                {r.description || "Unlock your potential with this curated learning resource."}
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {r.class_group && (
                  <span className="px-4 py-1.5 bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-wider">
                    {r.class_group.name}
                  </span>
                )}
                {r.subject && (
                  <span className="px-4 py-1.5 bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-wider">
                    {r.subject.name}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/[0.05]">
                <div className="flex flex-wrap gap-2">
                  {r.tags?.split(",").slice(0, 2).map((tag, i) => (
                    <span key={i} className="text-[10px] text-indigo-500 font-bold">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
                <div className="flex items-center text-indigo-500 font-black text-xs uppercase tracking-widest group-hover:gap-2 transition-all">
                  Open <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}