import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { body, query, validationResult } from 'express-validator'
import { database } from '../database.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  next()
}

// Get dashboard stats
router.get('/stats', authenticateToken, requireAdmin, (req, res) => {
  const users = database.getUsers()
  const projects = database.getProjects({ status: 'all' })
  const orders = database.getOrders()
  
  const totalProjects = projects.length
  const publishedProjects = projects.filter(p => p.status === 'published').length
  const activeOrders = orders.filter(o => ['pending', 'confirmed', 'in_progress', 'review'].includes(o.status)).length
  const totalOrders = orders.length
  const totalUsers = users.length
  const activeUsers = users.filter(u => u.status === 'active').length
  const revenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.total_price, 0)
  
  // Recent orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10)
    .map(o => ({
      ...o,
      project_details: JSON.parse(o.project_details),
      contact_info: JSON.parse(o.contact_info),
    }))
  
  res.json({
    totalProjects,
    publishedProjects,
    activeOrders,
    totalOrders,
    totalUsers,
    activeUsers,
    revenue,
    projectsChange: '+12%',
    ordersChange: '+5%',
    usersChange: '+8%',
    revenueChange: '+23%',
    recentOrders
  })
})

// Get all users (admin)
router.get('/users', authenticateToken, requireAdmin, [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('search').optional().trim(),
  query('role').optional().trim(),
  query('status').optional().trim(),
  query('sort').optional().trim(),
], validate, (req, res) => {
  const page = req.query.page || 1
  const limit = Math.min(req.query.limit || 15, 50)
  const offset = (page - 1) * limit
  const search = req.query.search || ''
  const role = req.query.role
  const status = req.query.status
  const sort = req.query.sort || 'newest'
  
  let users = [...database.getUsers()]
  
  if (search) {
    const searchTerm = search.toLowerCase()
    users = users.filter(u => 
      u.name.toLowerCase().includes(searchTerm) ||
      u.email.toLowerCase().includes(searchTerm)
    )
  }
  
  if (role) {
    users = users.filter(u => u.role === role)
  }
  
  if (status) {
    users = users.filter(u => u.status === status)
  }
  
  // Sort
  switch (sort) {
    case 'oldest':
      users.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      break
    case 'name':
      users.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'email':
      users.sort((a, b) => a.email.localeCompare(b.email))
      break
    default: // newest
      users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }
  
  const total = users.length
  const totalPages = Math.ceil(total / limit)
  
  // Paginate
  const paginatedUsers = users.slice(offset, offset + limit)
  
  // Add order counts
  const orders = database.getOrders()
  const usersWithStats = paginatedUsers.map(u => {
    const userOrders = orders.filter(o => o.user_id === u.id)
    const orderCount = userOrders.length
    const totalSpent = userOrders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.total_price, 0)
    
    return {
      ...u,
      orderCount,
      totalSpent,
      status: u.status || 'active',
    }
  })
  
  res.json({
    users: usersWithStats,
    pagination: { page, limit, total, totalPages }
  })
})

// Get single user (admin)
router.get('/users/:id', authenticateToken, requireAdmin, (req, res) => {
  const user = database.getUserById(req.params.id)
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }
  
  // Get user's orders
  const orders = database.getOrders()
  const userOrders = orders.filter(o => o.user_id === user.id)
  const orderCount = userOrders.length
  const totalSpent = userOrders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.total_price, 0)
  
  res.json({ user: {
    ...user,
    orderCount,
    totalSpent,
    status: user.status || 'active',
    orders: userOrders.slice(0, 10).map(o => ({
      ...o,
      project_details: JSON.parse(o.project_details),
      contact_info: JSON.parse(o.contact_info),
    }))
  }})
})

// Update user (admin)
router.put('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  const user = database.getUserById(req.params.id)
  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }
  
  const allowedFields = ['name', 'email', 'role', 'status']
  const updates = {}
  
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field]
    }
  }
  
  if (Object.keys(updates).length > 0) {
    await database.updateUser(req.params.id, updates)
  }
  
  const updated = database.getUserById(req.params.id)
  res.json({ user: updated })
})

// Delete user (admin)
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  const user = database.getUserById(req.params.id)
  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }
  
  // Prevent deleting self
  if (user.id === req.user.id) {
    return res.status(400).json({ message: 'Cannot delete your own account' })
  }
  
  await database.deleteUser(req.params.id)
  res.json({ message: 'User deleted successfully' })
})

// Get settings (admin)
router.get('/settings', authenticateToken, requireAdmin, (req, res) => {
  const settings = database.getSettings()
  res.json({ settings })
})

// Update settings (admin)
router.put('/settings', authenticateToken, requireAdmin, async (req, res) => {
  const { settings } = req.body
  
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ message: 'Settings object is required' })
  }
  
  await database.updateSettings(settings)
  
  // Return updated settings
  const updatedSettings = database.getSettings()
  res.json({ settings: updatedSettings })
})

export default router