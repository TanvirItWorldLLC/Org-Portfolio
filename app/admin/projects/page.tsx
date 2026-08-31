'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Star, Loader2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  thumbnail?: string;
  color: string;
  status: string;
  featured: boolean;
  views: number;
  tags: string[];
  technologies: string[];
  clientName?: string;
  projectUrl?: string;
  githubUrl?: string;
  duration?: string;
  teamSize?: number;
  category: { id: string; name: string; slug: string } | null;
  categoryId?: string | null;
}
interface Category { id: string; name: string; slug: string; }

const EMPTY: Partial<Project> = {
  title: '',
  description: '',
  longDescription: '',
  color: '#0ea5e9',
  status: 'draft',
  featured: false,
  thumbnail: '',
  technologies: [],
  tags: [],
  clientName: '',
  projectUrl: '',
  githubUrl: '',
  duration: '',
  teamSize: undefined,
  categoryId: null,
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editing, setEditing] = useState<Partial<Project> | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: statusFilter, limit: '50' });
      if (search) params.set('search', search);
      const [p, c] = await Promise.all([
        fetch(`/api/portfolio?${params}`, { credentials: 'include' }).then((r) => r.json()),
        fetch('/api/portfolio/categories', { credentials: 'include' }).then((r) => r.json()),
      ]);
      setProjects(p.projects || []);
      setCategories(c.categories || []);
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [statusFilter]);

  async function toggle(id: string, field: 'featured' | 'status', value: boolean | string) {
    try {
      const res = await fetch(`/api/portfolio/${id}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error('Update failed');
      toast.success('Updated');
      load();
    } catch (e) { toast.error('Failed'); }
  }

  async function remove(id: string) {
    if (!confirm('Delete this project?')) return;
    try {
      const res = await fetch(`/api/portfolio/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Deleted');
      load();
    } catch { toast.error('Failed'); }
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    try {
      const isNew = !editing.id;
      const url = isNew ? '/api/portfolio' : `/api/portfolio/${editing.id}`;
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      toast.success(isNew ? 'Project created' : 'Project updated');
      setEditing(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white">Projects</h1>
          <p className="text-dark-600 dark:text-dark-400 mt-1">Manage your portfolio projects</p>
        </div>
        <button onClick={() => setEditing(EMPTY)} className="btn-primary self-start">
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text" placeholder="Search projects..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            className="input pl-10"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-auto">
          <option value="all">All</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse h-12 bg-dark-100 dark:bg-dark-800 rounded" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-dark-500">No projects. Create your first one!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-500">Project</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-500">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-500">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-500">Views</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-dark-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-dark-50 dark:hover:bg-dark-800/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${p.color}40` }}>
                          <Star className="w-5 h-5" style={{ color: p.color }} />
                        </div>
                        <div>
                          <p className="font-medium text-dark-900 dark:text-white">{p.title}</p>
                          <p className="text-sm text-dark-500 line-clamp-1">{p.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {p.category ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">{p.category.name}</span>
                      ) : (
                        <span className="text-sm text-dark-500">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => toggle(p.id, 'status', p.status === 'published' ? 'draft' : 'published')}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          p.status === 'published' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : p.status === 'draft' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                            : 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {p.status}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-sm text-dark-600 dark:text-dark-400">{(p.views || 0).toLocaleString()}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <a href={`/portfolio/${p.id}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800" aria-label="View">
                          <Eye className="w-4 h-4" />
                        </a>
                        <button onClick={() => toggle(p.id, 'featured', !p.featured)} className={`p-2 rounded-lg ${p.featured ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' : 'text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800'}`} aria-label="Toggle featured">
                          <Star className={`w-4 h-4 ${p.featured ? 'fill-current' : ''}`} />
                        </button>
                        <button onClick={() => setEditing(p)} className="p-2 rounded-lg text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800" aria-label="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => remove(p.id)} className="p-2 rounded-lg text-dark-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600" aria-label="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor modal */}
      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setEditing(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dark-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-dark-200 dark:border-dark-800 flex items-center justify-between">
                <h2 className="text-xl font-bold text-dark-900 dark:text-white">{editing.id ? 'Edit Project' : 'New Project'}</h2>
                <button onClick={() => setEditing(null)} className="p-2 rounded-lg text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="label">Title *</label>
                  <input className="input" value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                </div>
                <div>
                  <label className="label">Description *</label>
                  <textarea className="input resize-none" rows={3} value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
                </div>
                <div>
                  <label className="label">Long Description</label>
                  <textarea className="input resize-none" rows={4} value={editing.longDescription || ''} onChange={(e) => setEditing({ ...editing, longDescription: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Category</label>
                    <select className="input" value={editing.categoryId || ''} onChange={(e) => setEditing({ ...editing, categoryId: e.target.value || null })}>
                      <option value="">None</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Status</label>
                    <select className="input" value={editing.status || 'draft'} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Color</label>
                    <input type="color" className="input h-12 p-1" value={editing.color || '#0ea5e9'} onChange={(e) => setEditing({ ...editing, color: e.target.value })} />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={!!editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} />
                      <span className="text-sm">Featured</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="label">Thumbnail URL</label>
                  <input className="input" value={editing.thumbnail || ''} onChange={(e) => setEditing({ ...editing, thumbnail: e.target.value })} />
                </div>
                <div>
                  <label className="label">Tags (comma-separated)</label>
                  <input className="input" value={(editing.tags || []).join(', ')} onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
                </div>
                <div>
                  <label className="label">Technologies (comma-separated)</label>
                  <input className="input" value={(editing.technologies || []).join(', ')} onChange={(e) => setEditing({ ...editing, technologies: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Client</label>
                    <input className="input" value={editing.clientName || ''} onChange={(e) => setEditing({ ...editing, clientName: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Duration</label>
                    <input className="input" value={editing.duration || ''} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Project URL</label>
                    <input className="input" value={editing.projectUrl || ''} onChange={(e) => setEditing({ ...editing, projectUrl: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">GitHub URL</label>
                    <input className="input" value={editing.githubUrl || ''} onChange={(e) => setEditing({ ...editing, githubUrl: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-dark-200 dark:border-dark-800 flex justify-end gap-3">
                <button onClick={() => setEditing(null)} className="btn-secondary">Cancel</button>
                <button onClick={save} disabled={saving} className="btn-primary">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}