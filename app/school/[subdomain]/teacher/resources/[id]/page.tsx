'use client'

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchTeacherResourceById, downloadResource } from "@/lib/ecosystem-api/resourceApi";
import type { ResourceModel } from "@/lib/ecosystem-api/types";
import {
  ArrowLeft, Download, ExternalLink, Edit3, Trash2,
  Calendar, User, Tag, ShieldCheck, ShieldAlert, BookOpen
} from "lucide-react";

export default function ResourceDetail() {
  const { subdomain, id } = useParams<{ subdomain: string; id: string }>();
  const router = useRouter();

  const [resource, setResource] = useState<ResourceModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const base = `/school/${subdomain}/teacher`;

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const data = await fetchTeacherResourceById(Number(id));
        setResource(data);
      } catch {
        setError("Could not load resource. It may not exist or you may be unauthorized.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDownload = async () => {
    if (!resource || downloading) return;
    try {
      setDownloading(true);
      await downloadResource(resource.id);
    } catch {
      setError("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
    </div>
  );

  if (error) return (
    <div className="max-w-2xl mx-auto mt-20 p-8 text-center bg-rose-50 dark:bg-rose-900/10 rounded-[2.5rem] border border-rose-100 dark:border-rose-900/20">
      <p className="text-rose-600 dark:text-rose-400 font-bold">{error}</p>
      <Link href={`${base}/resources`} className="mt-4 inline-block text-sm font-black text-emerald-600 uppercase tracking-widest hover:underline">
        Return to Library
      </Link>
    </div>
  );

  if (!resource) return null;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6">

      {/* Back nav */}
      <Link
        href={`${base}/resources`}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-500 transition-colors mb-10 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-[11px] font-black tracking-[0.2em] uppercase">Back to Library</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: main content */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white dark:bg-white/[0.03] rounded-[3rem] p-8 md:p-14 border border-slate-100 dark:border-white/10 shadow-sm relative overflow-hidden">
            <BookOpen size={200} className="absolute -right-10 -bottom-10 text-emerald-500 opacity-[0.03] pointer-events-none" />

            <div className="inline-flex items-center px-5 py-2 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
              {resource.resource_type || 'Educational Material'}
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-800 dark:text-white mb-8 leading-[1.1]">
              {resource.title}
            </h1>

            <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
              {resource.description || "No description provided for this resource."}
            </p>

            {resource.tags && (
              <div className="flex flex-wrap gap-2 mt-12">
                {resource.tags.split(',').map(tag => (
                  <span key={tag} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-xl text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <Tag size={12} className="text-emerald-500" /> {tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            {resource.file_url && (
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex-[2] flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-black py-5 rounded-[2rem] transition-all shadow-xl shadow-emerald-500/20 text-lg"
              >
                <Download size={22} />
                {downloading ? "Preparing File..." : "Download Material"}
              </button>
            )}
            {resource.external_url && (
              
                href={resource.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-3 bg-slate-900 dark:bg-white/10 text-white font-black py-5 rounded-[2rem] hover:bg-slate-800 transition-all text-lg"
              >
                <ExternalLink size={22} />
                Visit Site
              </a>
            )}
          </div>
        </div>

        {/* Right: metadata */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-50 dark:bg-white/[0.02] rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5 shadow-inner">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500/60 mb-8">Metadata</h4>

            <div className="space-y-6">
              <DetailRow
                icon={<Calendar size={18} />}
                label="Created"
                value={resource.created_at
                  ? new Date(resource.created_at).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })
                  : 'N/A'}
              />
              <DetailRow icon={<User size={18} />} label="Author" value={resource.uploaded_by || 'School Staff'} />

              {resource.class_group && (
                <DetailRow
                  icon={<ShieldCheck size={18} />}
                  label="Assigned Class"
                  value={resource.class_group.name}
                  subValue={resource.class_group.code}
                />
              )}
              {resource.subject && (
                <DetailRow icon={<BookOpen size={18} />} label="Subject Area" value={resource.subject.name} />
              )}

              <div className="pt-6 border-t border-slate-200 dark:border-white/5">
                {resource.is_downloadable ? (
                  <div className="flex items-center gap-3 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                    <ShieldCheck size={20} className="text-emerald-500" />
                    <div>
                      <p className="text-[10px] font-black text-emerald-600/70 uppercase tracking-tighter">Permissions</p>
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Students can download</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                    <ShieldAlert size={20} className="text-amber-500" />
                    <div>
                      <p className="text-[10px] font-black text-amber-600/70 uppercase tracking-tighter">Permissions</p>
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-400">View-only mode</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Admin actions */}
          <div className="grid grid-cols-1 gap-3">
            <Link
              href={`${base}/resources/${resource.id}/edit`}
              className="flex items-center justify-center gap-2 p-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl text-slate-600 dark:text-white font-black hover:border-emerald-500 transition-all hover:text-emerald-500"
            >
              <Edit3 size={18} /> Edit Resource
            </Link>
            <button
              onClick={() => {
                if (confirm("This will permanently remove this resource. Continue?")) {
                  // delete logic — wire up deleteResource() here
                  router.push(`${base}/resources`);
                }
              }}
              className="flex items-center justify-center gap-2 p-5 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-3xl font-black hover:bg-rose-500 hover:text-white transition-all shadow-sm"
            >
              <Trash2 size={18} /> Delete Resource
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value, subValue }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="text-emerald-500/40 mt-1">{icon}</div>
      <div>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider leading-none mb-1.5">{label}</p>
        <p className="text-base font-bold text-slate-700 dark:text-slate-200">
          {value}{subValue && <span className="text-emerald-500 font-medium ml-1">[{subValue}]</span>}
        </p>
      </div>
    </div>
  );
}