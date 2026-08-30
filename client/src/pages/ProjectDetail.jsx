import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, Github, Share2, Tag, Eye, Star, Clock, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePortfolio } from '../contexts/PortfolioContext'
import { Scene3D } from '../components/three/Scene3D'
import { ProjectDetailScene } from '../components/three/ProjectDetailScene'

export default function ProjectDetail() {
  const { id } = useParams()
  const { projects, fetchProject, loading } = usePortfolio()
  const [project, setProject] = useState(null)
  const [projectLoading, setProjectLoading] = useState(true)
  
  useEffect(() => {
    const loadProject = async () => {
      try {
        setProjectLoading(true)
        let foundProject = projects.find(p => p.id === id)
        if (!foundProject) {
          const data = await fetchProject(id)
          setProject(data)
        } else {
          setProject(foundProject)
        }
      } catch (error) {
        console.error('Failed to load project:', error)
      } finally {
        setProjectLoading(false)
      }
    }
    loadProject()
  }, [id, projects, fetchProject])
  
  if (projectLoading) {
    return (
      <>
        <Scene3D className="opacity-50" />
        <div className="relative z-10 min-h-screen flex items-center justify-center bg-white/50 dark:bg-dark-950/50">
          <div className="flex flex-col items-center gap-4 text-dark-600 dark:text-dark-400">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p>Loading project...</p>
          </div>
        </div>
      </>
    )
  }
  
  if (!project) {
    return (
      <>
        <Scene3D className="opacity-50" />
        <div className="relative z-10 min-h-screen flex items-center justify-center bg-white/50 dark:bg-dark-950/50">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-dark-900 dark:text-white mb-4">Project Not Found</h1>
            <Link to="/portfolio" className="btn-primary">Back to Portfolio</Link>
          </div>
        </div>
      </>
    )
  }
  
  return (
    <>
      <Scene3D className="opacity-30" />
      
      <div className="relative z-10 min-h-screen bg-white/50 dark:bg-dark-950/50 backdrop-blur-sm">
        <div className="container-custom py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Portfolio
            </Link>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {project.category && (
                <Link
                  to={`/portfolio?category=${project.category.slug}`}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                >
                  {project.category.name}
                </Link>
              )}
              {project.featured && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Featured
                </span>
              )}
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-dark-900 dark:text-white mb-4">
              {project.title}
            </h1>
            
            <p className="text-lg text-dark-600 dark:text-dark-300 max-w-3xl leading-relaxed">
              {project.description}
            </p>
          </motion.div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="aspect-video rounded-2xl overflow-hidden bg-dark-100 dark:bg-dark-800 relative"
              >
                <ProjectDetailScene project={project} />
                
                <div className="absolute bottom-4 right-4 flex gap-2">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur text-dark-900 flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                      aria-label="View live project"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur text-dark-900 flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                      aria-label="View source code"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  <button className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur text-dark-900 flex items-center justify-center hover:bg-white transition-colors shadow-lg" aria-label="Share project">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
              
              {project.gallery && project.gallery.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h3 className="text-2xl font-bold text-dark-900 dark:text-white mb-6">Project Gallery</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.gallery.map((image, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="aspect-video rounded-xl overflow-hidden bg-dark-100 dark:bg-dark-800"
                      >
                        <img
                          src={image}
                          alt={`${project.title} - Gallery ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-dark-900 dark:text-white mb-6">Project Details</h3>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-dark-600 dark:text-dark-300 leading-relaxed mb-4">
                    {project.longDescription || project.description}
                  </p>
                  
                  {project.challenges && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-dark-900 dark:text-white mb-3">Challenges</h4>
                      <ul className="list-disc list-inside text-dark-600 dark:text-dark-300 space-y-2">
                        {project.challenges.map((challenge, i) => (
                          <li key={i}>{challenge}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {project.solutions && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-dark-900 dark:text-white mb-3">Solutions</h4>
                      <ul className="list-disc list-inside text-dark-600 dark:text-dark-300 space-y-2">
                        {project.solutions.map((solution, i) => (
                          <li key={i}>{solution}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {project.results && (
                    <div>
                      <h4 className="text-lg font-semibold text-dark-900 dark:text-white mb-3">Results</h4>
                      <ul className="list-disc list-inside text-dark-600 dark:text-dark-300 space-y-2">
                        {project.results.map((result, i) => (
                          <li key={i}>{result}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
            
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="card sticky top-24"
              >
                <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Tech Stack</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies?.map(tech => (
                    <span key={tech} className="px-3 py-1 rounded-full text-sm bg-dark-100 dark:bg-dark-800 text-dark-700 dark:text-dark-300 border border-dark-200 dark:border-dark-700">
                      {tech}
                    </span>
                  ))}
                </div>
                
                <div className="space-y-4 pt-6 border-t border-dark-200 dark:border-dark-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="text-sm text-dark-500 dark:text-dark-500">Duration</p>
                      <p className="font-medium text-dark-900 dark:text-white">{project.duration || '3 months'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-dark-500 dark:text-dark-500">Team Size</p>
                      <p className="font-medium text-dark-900 dark:text-white">{project.teamSize || '4 members'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-dark-500 dark:text-dark-500">Views</p>
                      <p className="font-medium text-dark-900 dark:text-white">{project.views?.toLocaleString() || '1,234'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {project.tags && project.tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="card"
                >
                  <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                      <Link
                        key={tag}
                        to={`/portfolio?search=${tag}`}
                        className="px-3 py-1.5 rounded-lg text-sm bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="card bg-gradient-to-br from-primary-500/10 to-primary-700/10 border-primary-200 dark:border-primary-800"
              >
                <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-3">Like this project?</h3>
                <p className="text-dark-600 dark:text-dark-300 mb-4">Let's work together on your next 3D experience.</p>
                <Link to="/order" className="btn-primary w-full justify-center">
                  Start a Project
                  <ArrowLeft className="w-4 h-4 -rotate-180" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

import { useState, useEffect } from 'react'