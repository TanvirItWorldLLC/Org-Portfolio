import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye, Star, ChevronDown, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { portfolioAPI } from '../../services/api'
import toast from 'react-hot-toast'

const statusOptions = ['all', 'draft', 'published', 'archived']
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title', label: 'Title A-Z' },
  { value: 'views', label: 'Most Views' },
]

export default function AdminProjects() {
  const [projects, setProjects] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await portfolioAPI.getProjects({
        page,
        limit: 10,
        search: searchQuery,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sort: sortBy,
      })
      setProjects(response.data.projects)
      setTotalPages(response.data.totalPages || 1)
      if (categories.length === 0) {
        const catResponse = await portfolioAPI.getCategories()
        setCategories(catResponse.data.categories)
      }
    } catch (error) {
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchProjects()
  }, [page, searchQuery, statusFilter, sortBy])
  
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    
    setDeleting(id)
    try {
      await portfolioAPI.deleteProject(id)
      toast.success('Project deleted successfully')
      fetchProjects()
    } catch (error) {
      toast.error('Failed to delete project')
    } finally {
      setDeleting(null)
    }
  }
  
  const handleToggleFeatured = async (project) => {
    try {
      await portfolioAPI.updateProject(project.id, { featured: !project.featured })
      toast.success(project.featured ? 'Removed from featured' : 'Added to featured')
      fetchProjects()
    } catch (error) {
      toast.error('Failed to update project')
    }
  }
  
  const handleTogglePublished = async (project) => {
    try {
      await portfolioAPI.updateProject(project.id, { status: project.status === 'published' ? 'draft' : 'published' })
      toast.success(project.status === 'published' ? 'Project unpublished' : 'Project published')
      fetchProjects()
    } catch (error) {
      toast.error('Failed to update project')
    }
  }
  
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white">Projects</h1>
          <p className="text-dark-600 dark:text-dark-400 mt-1">Manage your portfolio projects</p>
        </div>
        <Link to="/admin/projects/new" className="btn-primary">
          <Plus className="w-5 h-5" />
          Add Project
        </Link>
      </motion.div>
      
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="card p-4"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setPage(1)}
              className="input pl-10"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="input w-auto"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value); setPage(1); }}
              className="input w-auto"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>
      
      {/* Projects Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="card overflow-hidden"
      >
        {loading ? (
          <div className="p-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-4 py-4 border-b border-dark-200 dark:border-dark-700">
                <div className="w-16 h-10 bg-dark-200 dark:bg-dark-700 rounded" />
                <div className="flex-1">
                  <div className="h-4 bg-dark-200 dark:bg-dark-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-dark-200 dark:bg-dark-700 rounded w-1/2" />
                </div>
                <div className="w-24 h-8 bg-dark-200 dark:bg-dark-700 rounded" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center">
            <FolderKanban className="w-16 h-16 mx-auto text-dark-300 dark:text-dark-600 mb-4" />
            <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">No projects found</h3>
            <p className="text-dark-600 dark:text-dark-400 mb-4">Get started by creating your first project</p>
            <Link to="/admin/projects/new" className="btn-primary inline-flex">
              <Plus className="w-4 h-4" />
              Create Project
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800/50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-dark-500 dark:text-dark-500">Project</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-dark-500 dark:text-dark-500">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-dark-500 dark:text-dark-500">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-dark-500 dark:text-dark-500">Views</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-dark-500 dark:text-dark-500">Featured</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-dark-500 dark:text-dark-500">Created</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-dark-500 dark:text-dark-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
                  <AnimatePresence>
                    {projects.map((project, index) => (
                      <motion.tr
                        key={project.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-dark-50 dark:hover:bg-dark-800/50"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-700/20 flex items-center justify-center">
                              <Star className="w-5 h-5 text-primary-500" />
                            </div>
                            <div>
                              <Link to={`/portfolio/${project.id}`} target="_blank" className="font-medium text-dark-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors block truncate max-w-xs">
                                {project.title}
                              </Link>
                              <p className="text-sm text-dark-500 dark:text-dark-500 truncate max-w-xs">{project.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {project.category ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                              {project.category.name}
                            </span>
                          ) : (
                            <span className="text-sm text-dark-500 dark:text-dark-500">Uncategorized</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            project.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            project.status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                          }`}>
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-dark-600 dark:text-dark-400">
                          {(project.views || 0).toLocaleString()}
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleToggleFeatured(project)}
                            className={`p-2 rounded-lg transition-colors ${project.featured ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' : 'bg-dark-100 dark:bg-dark-800 text-dark-400 hover:bg-dark-200 dark:hover:bg-dark-700'}`}
                            aria-label={project.featured ? 'Remove from featured' : 'Add to featured'}
                          >
                            <Star className={`w-5 h-5 ${project.featured ? 'fill-current' : ''}`} />
                          </button>
                        </td>
                        <td className="py-4 px-4 text-sm text-dark-500 dark:text-dark-500">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              to={`/portfolio/${project.id}`}
                              target="_blank"
                              className="p-2 rounded-lg text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 hover:text-dark-600 dark:hover:text-dark-300 transition-colors"
                              aria-label="View project"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/admin/projects/${project.id}/edit`}
                              className="p-2 rounded-lg text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 hover:text-dark-600 dark:hover:text-dark-300 transition-colors"
                              aria-label="Edit project"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(project.id)}
                              disabled={deleting === project.id}
                              className="p-2 rounded-lg text-dark-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
                              aria-label="Delete project"
                            >
                              {deleting === project.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t border-dark-200 dark:border-dark-700">
                <p className="text-sm text-dark-500 dark:text-dark-500">
                  Page {page} of {totalPages} ({projects.length} projects)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary px-3 py-1.5 text-sm"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn-secondary px-3 py-1.5 text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}