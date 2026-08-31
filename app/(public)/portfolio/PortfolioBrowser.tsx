'use client';

import { useMemo, useState } from 'react';
import { Search, Grid, List, Tag } from 'lucide-react';
import { ProjectCard3D } from '@/components/three/ProjectCard3D';
import { motion } from 'framer-motion';

export interface Project {
  id: string;
  title: string;
  slug?: string;
  description: string;
  color: string;
  featured: boolean;
  views: number;
  tags: string[];
  category: { name: string; color: string; slug: string } | null;
}
interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string | null;
}

export function PortfolioBrowser({
  initialProjects,
  initialCategories,
}: {
  initialProjects: Project[];
  initialCategories: Category[];
}) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const allCategories = useMemo(
    () => [{ id: 'all', name: 'All Projects', slug: 'all', color: '#0ea5e9', icon: null }, ...initialCategories],
    [initialCategories],
  );

  const filtered = useMemo(() => {
    return initialProjects.filter((p) => {
      const catMatch = category === 'all' || p.category?.slug === category;
      const s = search.toLowerCase();
      const searchMatch =
        !s ||
        p.title.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s) ||
        p.tags.some((t) => t.toLowerCase().includes(s));
      return catMatch && searchMatch;
    });
  }, [initialProjects, category, search]);

  return (
    <>
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-12"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input w-auto appearance-none pr-10 bg-white dark:bg-dark-800"
          >
            {allCategories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>

          <div className="flex bg-dark-100 dark:bg-dark-800 rounded-xl p-1">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded-lg ${view === 'grid' ? 'bg-white dark:bg-dark-900 shadow-sm text-primary-600' : 'text-dark-500'}`}
              aria-label="Grid view"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-lg ${view === 'list' ? 'bg-white dark:bg-dark-900 shadow-sm text-primary-600' : 'text-dark-500'}`}
              aria-label="List view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <Tag className="w-16 h-16 mx-auto text-dark-300 dark:text-dark-600 mb-4" />
          <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">No projects found</h3>
          <p className="text-dark-600 dark:text-dark-400">Try adjusting your search or filter criteria.</p>
        </motion.div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <ProjectCard3D key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => (
            <div key={p.id} className="card flex flex-col sm:flex-row gap-6">
              <div className="relative w-full sm:w-72 flex-shrink-0">
                <div className="aspect-video rounded-xl overflow-hidden bg-dark-100 dark:bg-dark-800 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${p.color}30, ${p.color}80)` }}>
                  <span className="text-2xl font-bold text-white drop-shadow">{p.title[0]}</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  {p.category && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                      {p.category.name}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">{p.title}</h3>
                <p className="text-dark-600 dark:text-dark-400 mb-4 line-clamp-2">{p.description}</p>
                <div className="flex flex-wrap gap-2">
                  {p.tags.slice(0, 5).map((tag) => (
                    <span key={tag} className="px-2 py-1 rounded text-xs bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}