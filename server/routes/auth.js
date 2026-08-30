import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { body, validationResult } from 'express-validator'
import { database } from '../database.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  next()
}

// Register
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], validate, async (req, res) => {
  try {
    const { name, email, password } = req.body
    
    // Check if user exists
    const existingUser = database.getUserByEmail(email)
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create user
    const id = uuidv4()
    const user = {
      id,
      name,
      email,
      password: hashedPassword,
      role: 'user',
      status: 'active',
      avatar: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login: null
    }
    
    await database.createUser(user)
    
    const token = generateToken(user)
    
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Registration failed' })
  }
})

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], validate, async (req, res) => {
  try {
    const { email, password } = req.body
    
    // Find user
    const user = database.getUserByEmail(email)
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    
    // Check status
    if (user.status !== 'active') {
      return res.status(401).json({ message: 'Account is deactivated' })
    }
    
    // Update last login
    await database.updateUser(user.id, { last_login: new Date().toISOString() })
    
    const token = generateToken(user)
    
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Login failed' })
  }
})

// Get current user
router.get('/me', (req, res) => {
  // This will be handled by the authenticateToken middleware
  // The user will be attached to req.user
  const user = req.user
  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }
  
  // Get full user data
  const fullUser = database.getUserById(user.id)
  if (!fullUser) {
    return res.status(404).json({ message: 'User not found' })
  }
  
  res.json({ 
    user: { 
      id: fullUser.id, 
      name: fullUser.name, 
      email: fullUser.email, 
      role: fullUser.role,
      status: fullUser.status,
      avatar: fullUser.avatar,
      created_at: fullUser.created_at,
      last_login: fullUser.last_login
    } 
  })
})

// Update profile
router.put('/profile', [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
], validate, async (req, res) => {
  try {
    const { name, email } = req.body
    const userId = req.user.id
    
    // Check if email is taken by another user
    if (email) {
      const existingUser = database.getUserByEmail(email)
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: 'Email already in use' })
      }
    }
    
    // Update user
    const updates = {}
    if (name) updates.name = name
    if (email) updates.email = email
    
    if (Object.keys(updates).length > 0) {
      await database.updateUser(userId, updates)
    }
    
    const user = database.getUserById(userId)
    res.json({ user: { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      created_at: user.created_at,
      last_login: user.last_login
    }})
  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({ message: 'Failed to update profile' })
  }
})

// Change password
router.put('/password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
], validate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.user.id
    
    // Get user with password
    const user = database.getUserById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password)
    if (!validPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    // Update password
    await database.updateUser(userId, { password: hashedPassword })
    
    res.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Password change error:', error)
    res.status(500).json({ message: 'Failed to change password' })
  }
})

export default router