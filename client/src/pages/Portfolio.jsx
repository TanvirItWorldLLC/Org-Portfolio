import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Grid, List, ChevronDown, Tag } from 'lucide-react'
import { usePortfolio } from '../contexts/PortfolioContext'
import { Scene3D } from '../components/three/Scene3D'
import { ProjectCard3D } from '../components/three/ProjectCard3D'

const categories = [
  { id: 'all', name: 'All Projects', count: 0 },
  { id: 'web', name: 'Web Experiences', count: 0 },
  { id: 'product', name: 'Product Showcases', count: 0 },
  { id: 'brand', name: 'Brand Identity', count: 0 },
  { id: 'interactive', name: 'Interactive Art', count: 0 },
]

export default function Portfolio() {
  const { projects, categories: apiCategories, loading } = usePortfolio()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('newest')
  
  const allCategories = useMemo(() => [
    { id: 'all', name: 'All Projects' },
    ...(apiCategories?.map(c => ({ id: c.slug, name: c.name })) || categories.slice(1))
  ], [apiCategories])
  
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesCategory = selectedCategory === 'all' || project.category?.slug === selectedCategory
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesCategory && matchesSearch
    }).sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.createdAt) - new Date(a.createdAt)
        case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt)
        case 'popular': return (b.views || 0) - (a.views || 0)
        case 'name': return a.title.localeCompare(b.title)
        default: return 0
      }
    })
  }, [projects, selectedCategory, searchQuery, sortBy])
  
  return (
    <>
      <Scene3D className="opacity-50" />
      
      <div className="relative z-10 min-h-screen bg-white/50 dark:bg-dark-950/50 backdrop-blur-sm">
        <div className="container-custom py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-dark-900 dark:text-white mb-4">
              Our <span className="gradient-text">Portfolio</span>
            </h1>
            <p className="text-lg text-dark-600 dark:text-dark-300 max-w-2xl">
              Explore our collection of immersive 3D web experiences, interactive product showcases, and digital art installations.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8 flex flex-col lg:flex-row lg:items-center gap-6"
          >
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-12"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input pl-10 pr-10 appearance-none bg-white dark:bg-dark-800"
                >
                  {allCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400 pointer-events-none" />
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input w-auto appearance-none pr-10 bg-white dark:bg-dark-800"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
                <option value="name">A-Z</option>
              </select>
              
              <div className="flex bg-dark-100 dark:bg-dark-800 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-dark-900 shadow-sm text-primary-600 dark:text-primary-400' : 'text-dark-500 hover:text-dark-700 dark:hover:text-dark-300'}`}
                  aria-label="Grid view"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-dark-900 shadow-sm text-primary-600 dark:text-primary-400' : 'text-dark-500 hover:text-dark-700 dark:hover:text-dark-300'}`}
                  aria-label="List view"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="aspect-video bg-dark-200 dark:bg-dark-700 rounded-xl mb-4" />
                  <div className="h-4 bg-dark-200 dark:bg-dark-700 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-dark-200 dark:bg-dark-700 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Tag className="w-16 h-16 mx-auto text-dark-300 dark:text-dark-600 mb-4" />
              <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">No projects found</h3>
              <p className="text-dark-600 dark:text-dark-400">Try adjusting your search or filter criteria.</p>
            </motion.div>
          ) : (
            <>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-dark-500 dark:text-dark-500 mb-6"
              >
                Showing {filteredProjects.length} of {projects.length} projects
              </motion.p>
              
              <AnimatePresence mode="popLayout">
                {viewMode === 'grid' ? (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  >
                    {filteredProjects.map((project, index) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                      >
                        <ProjectCard3D project={project} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {filteredProjects.map((project, index) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="card flex flex-col sm:flex-row gap-6"
                      >
                        <div className="relative w-full sm:w-72 flex-shrink-0">
                          <div className="aspect-video rounded-xl overflow-hidden bg-dark-100 dark:bg-dark-800">
                            {project.thumbnail ? (
                              <img
                                src={project.thumbnail}
                                alt={project.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500/20 to-primary-700/20">
                                <Tag className="w-12 h-12 text-primary-500" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {project.category && (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                                  {project.category.name}
                                </span>
                              )}
                              {project.featured && (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                                  Featured
                                </span>
                              )}
                            </div>
                            <Link to={`/portfolio/${project.id}`}>
                              <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                {project.title}
                              </h3>
                            </Link>
                            <p className="text-dark-600 dark:text-dark-400 mb-4 line-clamp-2">{project.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {project.tags?.slice(0, 5).map(tag => (
                                <span key={tag} className="px-2 py-1 rounded text-xs bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <Link
                            to={`/portfolio/${project.id}`}
                            className="btn-primary mt-4 w-full sm:w-auto justify-center"
                          >
                            View Project
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </>
  )
}