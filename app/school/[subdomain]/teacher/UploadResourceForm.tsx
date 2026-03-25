'use client'

import { useState, useEffect } from "react";
import {
  fetchTeacherClasses,
  fetchClassSubjects,
  uploadResource,
  updateResource,
} from "@/lib/ecosystem-api/resourceApi";
import type { ResourceModel } from "@/lib/ecosystem-api/types";
import { X, Upload, Link as LinkIcon, AlertCircle } from "lucide-react";

interface Props {
  onClose: () => void;
  resource?: ResourceModel | null;
  onSuccess?: () => void;
}

export default function UploadResourceForm({ onClose, resource, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    title: resource?.title || "",
    description: resource?.description || "",
    resource_type: resource?.resource_type || "pdf",
    class_group: resource?.class_group?.id?.toString() || "",
    subject: resource?.subject?.id?.toString() || "",
    file: null as File | null,
    external_url: resource?.external_url || "",
    term: resource?.term || "",
    tags: resource?.tags || "",
    is_downloadable: resource?.is_downloadable ?? true,
  });

  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const data = await fetchTeacherClasses();
        setClasses(data);
        if (resource?.class_group?.id) {
          const sData = await fetchClassSubjects(resource.class_group.id);
          setSubjects(sData);
        }
      } catch {
        setError("System could not reach the classroom server.");
      } finally {
        setInitialLoading(false);
      }
    };
    loadClasses();
  }, [resource]);

  useEffect(() => {
    if (!formData.class_group || initialLoading) return;
    const loadSubjects = async () => {
      try {
        const data = await fetchClassSubjects(Number(formData.class_group));
        setSubjects(data);
      } catch {
        setError("Failed to sync subjects for this class.");
      }
    };
    loadSubjects();
  }, [formData.class_group]);

  const updateField = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((p) => ({ ...p, [name]: val }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFormData((p) => ({ ...p, file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) return setError("Please provide a title.");
    if (!formData.class_group) return setError("Class assignment is required.");

    try {
      setLoading(true);
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val !== null && val !== undefined) {
          data.append(key, val instanceof File ? val : String(val));
        }
      });

      if (resource) {
        await updateResource(resource.id, data);
      } else {
        await uploadResource(data);
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "An error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Library...</p>
    </div>
  );

  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl max-w-2xl w-full mx-auto">

      {/* Header */}
      <div className="px-8 pt-8 pb-6 flex justify-between items-center border-b border-slate-50 dark:border-white/5">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            {resource ? "Modify Resource" : "Add to Library"}
          </h2>
          <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mt-1">Resource Management</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
          <X size={20} className="text-slate-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {error && (
          <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-sm font-bold">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <FormField label="Resource Title">
              <input
                type="text" name="title" value={formData.title} onChange={updateField}
                placeholder="e.g. Advanced Calculus Worksheet"
                className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
              />
            </FormField>
          </div>

          <FormField label="Class Group">
            <select name="class_group" value={formData.class_group} onChange={updateField}
              className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white appearance-none"
            >
              <option value="">Choose Class</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>

          <FormField label="Subject Area">
            <select name="subject" value={formData.subject} onChange={updateField}
              disabled={!formData.class_group}
              className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white appearance-none disabled:opacity-50"
            >
              <option value="">Select Subject</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </FormField>
        </div>

        {/* Content type */}
        <div className="bg-slate-50 dark:bg-white/[0.02] p-6 rounded-3xl space-y-6 border border-slate-100 dark:border-white/5">
          <FormField label="Content Type">
            <div className="flex flex-wrap gap-2">
              {['pdf', 'presentation', 'video', 'link'].map((type) => (
                <button
                  key={type} type="button"
                  onClick={() => setFormData(p => ({ ...p, resource_type: type }))}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                    formData.resource_type === type
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-white dark:bg-white/5 text-slate-400 border border-slate-200 dark:border-white/10'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </FormField>

          {formData.resource_type === "link" ? (
            <FormField label="External Link">
              <div className="relative">
                <LinkIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url" name="external_url" value={formData.external_url} onChange={updateField}
                  placeholder="https://..."
                  className="w-full pl-12 pr-5 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                />
              </div>
            </FormField>
          ) : (
            <FormField label="Upload File">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl hover:border-emerald-500/50 transition-colors cursor-pointer bg-white dark:bg-transparent">
                <Upload size={24} className="text-emerald-500 mb-2" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
                  {formData.file ? formData.file.name : "Click to browse files"}
                </p>
                <input type="file" className="hidden" onChange={handleFileChange} />
              </label>
            </FormField>
          )}
        </div>

        <FormField label="Brief Description">
          <textarea
            name="description" value={formData.description} onChange={updateField}
            placeholder="What should students know about this?"
            className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white h-28 resize-none"
          />
        </FormField>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${formData.is_downloadable ? 'bg-emerald-500' : 'bg-slate-300'}`}>
              <div className={`bg-white w-4 h-4 rounded-full transition-transform ${formData.is_downloadable ? 'translate-x-4' : ''}`} />
            </div>
            <input type="checkbox" name="is_downloadable" className="hidden" checked={formData.is_downloadable} onChange={updateField} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">
              Allow Downloads
            </span>
          </label>

          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-emerald-500/20 transition-all disabled:bg-slate-300"
            >
              {loading ? "Syncing..." : resource ? "Update" : "Upload"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">{label}</label>
      {children}
    </div>
  );
}
```

---

Resources section done. Here's the updated progress:
```
teacher/resources/
├── page.tsx              ✅ TeacherResourcesPage
└── [id]/
    └── page.tsx          ✅ ResourceDetail

components/ecosystem/teacher/
├── ResourceCard.tsx      ✅
└── UploadResourceForm.tsx ✅