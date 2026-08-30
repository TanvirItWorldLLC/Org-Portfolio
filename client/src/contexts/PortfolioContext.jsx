import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { portfolioAPI } from '../services/api'

const PortfolioContext = createContext(null)

export function PortfolioProvider({ children }) {
  const [projects, setProjects] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProjects = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      const response = await portfolioAPI.getProjects(params)
      setProjects(response.data.projects)
      setCategories(response.data.categories)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchProject = useCallback(async (id) => {
    try {
      const response = await portfolioAPI.getProject(id)
      return response.data.project
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const createProject = useCallback(async (projectData) => {
    const response = await portfolioAPI.createProject(projectData)
    setProjects(prev => [response.data.project, ...prev])
    return response.data.project
  }, [])

  const updateProject = useCallback(async (id, projectData) => {
    const response = await portfolioAPI.updateProject(id, projectData)
    setProjects(prev => prev.map(p => p.id === id ? response.data.project : p))
    return response.data.project
  }, [])

  const deleteProject = useCallback(async (id) => {
    await portfolioAPI.deleteProject(id)
    setProjects(prev => prev.filter(p => p.id !== id))
  }, [])

  const fetchCategories = useCallback(async () => {
    const response = await portfolioAPI.getCategories()
    setCategories(response.data.categories)
  }, [])

  const createCategory = useCallback(async (categoryData) => {
    const response = await portfolioAPI.createCategory(categoryData)
    setCategories(prev => [...prev, response.data.category])
    return response.data.category
  }, [])

  const updateCategory = useCallback(async (id, categoryData) => {
    const response = await portfolioAPI.updateCategory(id, categoryData)
    setCategories(prev => prev.map(c => c.id === id ? response.data.category : c))
    return response.data.category
  }, [])

  const deleteCategory = useCallback(async (id) => {
    await portfolioAPI.deleteCategory(id)
    setCategories(prev => prev.filter(c => c.id !== id))
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const value = {
    projects,
    categories,
    loading,
    error,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolio() {
  const context = useContext(PortfolioContext)
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider')
  }
  return context
}