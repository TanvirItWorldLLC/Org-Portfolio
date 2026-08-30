import jwt from 'jsonwebtoken'
import { db } from '../database.js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' })
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' })
    }
    
    // Verify user still exists and is active
    const dbUser = db.prepare('SELECT id, email, role, status FROM users WHERE id = ?').get(user.id)
    if (!dbUser || dbUser.status !== 'active') {
      return res.status(403).json({ message: 'User not found or inactive' })
    }
    
    req.user = { id: dbUser.id, email: dbUser.email, role: dbUser.role }
    next()
  })
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) {
    return next()
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err) {
      const dbUser = db.prepare('SELECT id, email, role, status FROM users WHERE id = ?').get(user.id)
      if (dbUser && dbUser.status === 'active') {
        req.user = { id: dbUser.id, email: dbUser.email, role: dbUser.role }
      }
    }
    next()
  })
}

export function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}