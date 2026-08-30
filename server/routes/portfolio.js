import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { body, query, validationResult } from 'express-validator'
import { database } from '../database.js'
import { authenticateToken, optionalAuth, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  next()
}

// Get all projects with pagination, search, filter
router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('search').optional().trim(),
  query('category').optional().trim(),
  query('status').optional().trim(),
  query('sort').optional().trim(),
], validate, (req, res) => {
  const page = req.query.page || 1
  const limit = Math.min(req.query.limit || 12, 50)
  const offset = (page - 1) * limit
  const search = req.query.search || ''
  const category = req.query.category
  const status = req.query.status || 'published'
  const sort = req.query.sort || 'newest'
  
  // Get all projects first
  let projects = database.getProjects({ status, category, search, sort })
  
  const total = projects.length
  const totalPages = Math.ceil(total / limit)
  
  // Paginate
  const paginatedProjects = projects.slice(offset, offset + limit)
  
  // Get categories
  const categories = database.getCategories()
  
  res.json({
    projects: paginatedProjects,
    categories,
    pagination: { page, limit, total, totalPages }
  })
})

// Get single project
router.get('/:id', optionalAuth, (req, res) => {
  const project = database.getProjectById(req.params.id)
  
  if (!project) {
    return res.status(404).json({ message: 'Project not found' })
  }
  
  // Increment views (only for public access)
  if (!req.user || req.user.role !== 'admin') {
    database.incrementViews(req.params.id)
    project.views += 1
  }
  
  res.json({ project })
})

// Get categories
router.get('/categories/all', (req, res) => {
  const categories = database.getCategories()
  res.json({ categories })
})

// Create project (admin only)
router.post('/', authenticateToken, requireAdmin, [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('category_id').optional().isUUID().withMessage('Valid category ID required'),
], validate, async (req, res) => {
  const {
    title, description, long_description, category_id, technologies, tags, color,
    status, featured, client_name, project_url, github_url, duration, team_size,
    challenges, solutions, results
  } = req.body
  
  const slug = title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + uuidv4().slice(0, 8)
  
  const id = uuidv4()
  
  const project = {
    id, title, slug, description, long_description: long_description || null, category_id: category_id || null,
    technologies: JSON.stringify(technologies || []), tags: JSON.stringify(tags || []), color: color || '#0ea5e9',
    status: status || 'draft', featured: featured ? true : false, client_name: client_name || null, 
    project_url: project_url || null, github_url: github_url || null, duration: duration || null, team_size: team_size || null,
    challenges: JSON.stringify(challenges || []), solutions: JSON.stringify(solutions || []), results: JSON.stringify(results || []),
    thumbnail: null, gallery: JSON.stringify([]), views: 0,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }
  
  await database.createProject(project)
  
  const createdProject = database.getProjectById(id)
  res.status(201).json({ project: createdProject })
})

// Update project (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const project = database.getProjectById(req.params.id)
  if (!project) {
    return res.status(404).json({ message: 'Project not found' })
  }
  
  const allowedFields = [
    'title', 'description', 'long_description', 'category_id', 'technologies', 'tags', 'color',
    'status', 'featured', 'client_name', 'project_url', 'github_url', 'duration', 'team_size',
    'challenges', 'solutions', 'results', 'thumbnail', 'gallery'
  ]
  
  const updates = {}
  
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      if (['technologies', 'tags', 'challenges', 'solutions', 'results', 'gallery'].includes(field)) {
        updates[field] = JSON.stringify(req.body[field] || [])
      } else if (field === 'featured') {
        updates[field] = req.body[field] ? true : false
      } else {
        updates[field] = req.body[field]
      }
    }
  }
  
  if (Object.keys(updates).length > 0) {
    await database.updateProject(req.params.id, updates)
  }
  
  const updated = database.getProjectById(req.params.id)
  res.json({ project: updated })
})

// Delete project (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const project = database.getProjectById(req.params.id)
  if (!project) {
    return res.status(404).json({ message: 'Project not found' })
  }
  
  await database.deleteProject(req.params.id)
  res.json({ message: 'Project deleted successfully' })
})

// Category routes
router.post('/categories', authenticateToken, requireAdmin, [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required'),
  body('slug').trim().isLength({ min: 1 }).withMessage('Slug is required'),
], validate, async (req, res) => {
  const { name, slug, description, color, icon } = req.body
  const id = uuidv4()
  
  const category = {
    id, name, slug, description: description || null, color: color || '#0ea5e9', icon: icon || null,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }
  
  try {
    await database.createCategory(category)
    const created = database.getCategoryById(id)
    res.status(201).json({ category: created })
  } catch (error) {
    return res.status(400).json({ message: 'Category slug already exists' })
  }
})

router.put('/categories/:id', authenticateToken, requireAdmin, async (req, res) => {
  const category = database.getCategoryById(req.params.id)
  if (!category) {
    return res.status(404).json({ message: 'Category not found' })
  }
  
  const { name, slug, description, color, icon } = req.body
  const updates = {}
  
  if (name) updates.name = name
  if (slug) updates.slug = slug
  if (description !== undefined) updates.description = description
  if (color) updates.color = color
  if (icon !== undefined) updates.icon = icon
  
  if (Object.keys(updates).length > 0) {
    updates.updated_at = new Date().toISOString()
    await database.updateCategory(req.params.id, updates)
  }
  
  const updated = database.getCategoryById(req.params.id)
  res.json({ category: updated })
})

router.delete('/categories/:id', authenticateToken, requireAdmin, async (req, res) => {
  const category = database.getCategoryById(req.params.id)
  if (!category) {
    return res.status(404).json({ message: 'Category not found' })
  }
  
  await database.deleteCategory(req.params.id)
  res.json({ message: 'Category deleted successfully' })
})

// Upload image placeholder
router.post('/upload', authenticateToken, requireAdmin, (req, res) => {
  // In a real app, handle file upload with multer
  // For now, return a placeholder URL
  res.json({ url: 'https://via.placeholder.com/800x600/0ea5e9/ffffff?text=Uploaded+Image' })
})

export default router