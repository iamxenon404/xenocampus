import type { ResourceModel } from "@/lib/ecosystem-api/types";
import {
  Trash2, Edit3, FileText,
  Globe, BookOpen, GraduationCap, Clock, ChevronRight, Video
} from "lucide-react";

interface Props {
  resource: ResourceModel;
  onDelete?: (id: number) => void;
  onEdit?: (resource: ResourceModel) => void;
}

export default function ResourceCard({ resource, onDelete, onEdit }: Props) {
  const formattedDate = resource.created_at
    ? new Date(resource.created_at).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      })
    : "Recently";

  const getIcon = () => {
    if (resource.external_url) return <Globe size={22} />;
    if (resource.resource_type?.toLowerCase().includes('video')) return <Video size={22} />;
    return <FileText size={22} />;
  };

  return (
    <div className="group relative bg-white dark:bg-white/[0.02] rounded-[2.5rem] p-7 border border-slate-200 dark:border-white/[0.05] hover:border-emerald-500/50 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 flex flex-col h-full overflow-hidden">

      {/* Ghost bg icon */}
      <div className="absolute -right-6 -top-6 opacity-[0.03] dark:opacity-[0.1] group-hover:scale-125 transition-transform duration-700 text-emerald-500 pointer-events-none">
        <BookOpen size={160} />
      </div>

      {/* Top: icon + category + actions */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-inner">
            {getIcon()}
          </div>
          <span className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 dark:text-emerald-500/60">
            {resource.resource_type || 'General'}
          </span>
        </div>

        <div className="flex gap-1">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(resource); }}
              className="p-2 rounded-xl text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all"
              title="Edit"
            >
              <Edit3 size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(resource.id); }}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Title & description */}
      <div className="relative z-10 flex-grow">
        <h2 className="font-bold text-2xl leading-tight mb-3 dark:text-white group-hover:text-emerald-500 transition-colors">
          {resource.title}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-8 leading-relaxed font-medium">
          {resource.description || "Curated learning material for your classroom excellence."}
        </p>
      </div>

      {/* Meta tags */}
      <div className="flex flex-wrap gap-2 mb-8 relative z-10">
        {resource.class_group && (
          <span className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-wider">
            <GraduationCap size={12} className="text-emerald-500" />
            {resource.class_group.name}
          </span>
        )}
        {resource.subject && (
          <span className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-wider">
            <BookOpen size={12} className="text-emerald-500" />
            {resource.subject.code || resource.subject.name}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/[0.05] relative z-10">
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <Clock size={12} className="text-emerald-500/50" />
          {formattedDate}
        </div>
        <div className="flex items-center text-emerald-500 font-black text-xs uppercase tracking-widest group-hover:gap-2 transition-all cursor-pointer">
          Manage <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}