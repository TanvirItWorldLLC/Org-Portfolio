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

// Create order (public)
router.post('/', [
  body('projectType').trim().notEmpty().withMessage('Project type is required'),
  body('plan').trim().notEmpty().withMessage('Plan is required'),
  body('totalPrice').isInt({ min: 0 }).withMessage('Valid price required'),
  body('projectDetails').isObject().withMessage('Project details required'),
  body('contactInfo').isObject().withMessage('Contact info required'),
], validate, optionalAuth, async (req, res) => {
  const { projectType, plan, totalPrice, projectDetails, contactInfo } = req.body
  
  const id = uuidv4()
  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  
  const order = {
    id,
    order_id: orderId,
    project_type: projectType,
    plan,
    total_price: totalPrice,
    status: 'pending',
    project_details: JSON.stringify(projectDetails),
    contact_info: JSON.stringify(contactInfo),
    user_id: req.user?.id || null,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  
  await database.createOrder(order)
  
  const createdOrder = database.getOrderById(id)
  
  // TODO: Send notification email
  
  res.status(201).json({ order: createdOrder })
})

// Get all orders (admin)
router.get('/', authenticateToken, requireAdmin, [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('search').optional().trim(),
  query('status').optional().trim(),
  query('sort').optional().trim(),
], validate, (req, res) => {
  const page = req.query.page || 1
  const limit = Math.min(req.query.limit || 15, 50)
  const offset = (page - 1) * limit
  const search = req.query.search || ''
  const status = req.query.status
  const sort = req.query.sort || 'newest'
  
  // Get all orders first
  let orders = database.getOrders({ status, search, sort })
  
  const total = orders.length
  const totalPages = Math.ceil(total / limit)
  
  // Paginate
  const paginatedOrders = orders.slice(offset, offset + limit)
  
  res.json({
    orders: paginatedOrders,
    pagination: { page, limit, total, totalPages }
  })
})

// Get single order (admin or owner)
router.get('/:id', authenticateToken, (req, res) => {
  const order = database.getOrderById(req.params.id)
  
  if (!order) {
    return res.status(404).json({ message: 'Order not found' })
  }
  
  // Check ownership
  if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' })
  }
  
  res.json({ order })
})

// Update order status (admin)
router.patch('/:id/status', authenticateToken, requireAdmin, [
  body('status').isIn(['pending', 'confirmed', 'in_progress', 'review', 'completed', 'cancelled']).withMessage('Invalid status'),
], validate, async (req, res) => {
  const order = database.getOrderById(req.params.id)
  if (!order) {
    return res.status(404).json({ message: 'Order not found' })
  }
  
  const { status } = req.body
  await database.updateOrder(req.params.id, { status })
  
  const updated = database.getOrderById(req.params.id)
  
  // TODO: Send status update notification
  
  res.json({ order: updated })
})

// Update order (admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const order = database.getOrderById(req.params.id)
  if (!order) {
    return res.status(404).json({ message: 'Order not found' })
  }
  
  const allowedFields = ['status', 'plan', 'total_price', 'project_details', 'contact_info', 'notes']
  const updates = {}
  
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      if (['project_details', 'contact_info'].includes(field)) {
        updates[field] = JSON.stringify(req.body[field])
      } else {
        updates[field] = req.body[field]
      }
    }
  }
  
  if (Object.keys(updates).length > 0) {
    await database.updateOrder(req.params.id, updates)
  }
  
  const updated = database.getOrderById(req.params.id)
  res.json({ order: updated })
})

// Delete order (admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const order = database.getOrderById(req.params.id)
  if (!order) {
    return res.status(404).json({ message: 'Order not found' })
  }
  
  await database.deleteOrder(req.params.id)
  res.json({ message: 'Order deleted successfully' })
})

export default router