import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, 'data', 'portfolio.json')

// Default data structure
const defaultData = {
  users: [],
  categories: [],
  projects: [],
  orders: [],
  settings: {}
}

// Initialize database
const adapter = new JSONFile(dbPath)
const db = new Low(adapter, defaultData)

// Initialize and seed data
async function initDatabase() {
  await db.read()
  
  // If database is empty, seed with default data
  if (!db.data || db.data.users.length === 0) {
    db.data = defaultData
    await seedDefaultData()
    await db.write()
  }
}

async function seedDefaultData() {
  // Default admin user
  const hashedPassword = bcrypt.hashSync('admin123', 10)
  const adminId = uuidv4()
  db.data.users.push({
    id: adminId,
    name: 'Admin User',
    email: 'admin@orgportfolio.com',
    password: hashedPassword,
    role: 'admin',
    status: 'active',
    avatar: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login: null
  })
  
  // Default categories
  const defaultCategories = [
    { id: uuidv4(), name: 'Web Experiences', slug: 'web', description: 'Interactive 3D websites and web applications', color: '#0ea5e9', icon: 'globe', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuidv4(), name: 'Product Showcases', slug: 'product', description: '3D product visualizations and configurators', color: '#8b5cf6', icon: 'package', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuidv4(), name: 'Brand Identity', slug: 'brand', description: '3D brand experiences and identity systems', color: '#ec4899', icon: 'palette', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: uuidv4(), name: 'Interactive Art', slug: 'interactive', description: 'Creative coding and interactive installations', color: '#22d3ee', icon: 'zap', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]
  
  db.data.categories.push(...defaultCategories)
  
  // Find category IDs
  const webCat = defaultCategories.find(c => c.slug === 'web')
  const productCat = defaultCategories.find(c => c.slug === 'product')
  const brandCat = defaultCategories.find(c => c.slug === 'brand')
  
  // Sample projects
  const sampleProjects = [
    {
      id: uuidv4(),
      title: 'Aether - 3D Portfolio Template',
      slug: 'aether-3d-portfolio',
      description: 'A stunning 3D portfolio template with smooth animations and interactive elements.',
      long_description: 'Aether is a meticulously crafted 3D portfolio template designed for creative professionals. Built with React Three Fiber, it features smooth scroll-triggered animations, interactive 3D elements, and a fully responsive design that works beautifully across all devices.',
      thumbnail: 'https://images.unsplash.com/photo-1558655146-9f40138edf3c?w=800&h=600&fit=crop',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1558655146-9f40138edf3c?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1558655146-9f40138edf3c?w=1200&h=800&fit=crop',
      ]),
      category_id: webCat?.id,
      technologies: JSON.stringify(['React', 'Three.js', 'React Three Fiber', 'Tailwind CSS', 'Framer Motion']),
      tags: JSON.stringify(['portfolio', '3d', 'template', 'react', 'webgl']),
      color: '#0ea5e9',
      status: 'published',
      featured: true,
      views: 12500,
      client_name: 'Internal Project',
      project_url: 'https://aether-demo.orgportfolio.com',
      github_url: 'https://github.com/orgportfolio/aether',
      duration: '6 weeks',
      team_size: 3,
      challenges: JSON.stringify(['Complex scroll animations', 'Performance optimization', 'Cross-browser compatibility']),
      solutions: JSON.stringify(['Custom scroll controller', 'Level of detail system', 'Progressive enhancement']),
      results: JSON.stringify(['60fps on all devices', '95+ Lighthouse score', 'Featured on Awwwards']),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: 'Nebula - E-commerce 3D Experience',
      slug: 'nebula-ecommerce-3d',
      description: 'Immersive 3D product showcase with AR preview and real-time customization.',
      long_description: 'Nebula revolutionizes online shopping by bringing products to life in 3D. Customers can rotate, zoom, and customize products in real-time, with AR preview allowing them to visualize items in their own space before purchase.',
      thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=800&fit=crop',
      ]),
      category_id: productCat?.id,
      technologies: JSON.stringify(['React', 'Three.js', 'WebXR', 'Stripe', 'Node.js', 'PostgreSQL']),
      tags: JSON.stringify(['ecommerce', '3d', 'ar', 'webxr', 'shopping']),
      color: '#8b5cf6',
      status: 'published',
      featured: true,
      views: 28400,
      client_name: 'TechStart Inc',
      project_url: 'https://nebula-demo.orgportfolio.com',
      github_url: 'https://github.com/orgportfolio/nebula',
      duration: '12 weeks',
      team_size: 5,
      challenges: JSON.stringify(['AR implementation', 'Real-time customization', 'Payment integration']),
      solutions: JSON.stringify(['WebXR API with fallback', 'GPU-accelerated rendering', 'Stripe Elements integration']),
      results: JSON.stringify(['40% increase in conversion', '2.5x average session duration', 'Featured on FWA']),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: 'Lumina - Brand Identity System',
      slug: 'lumina-brand-identity',
      description: 'Dynamic 3D brand identity with interactive logo and motion design system.',
      long_description: 'Lumina is a comprehensive brand identity system built around a living, breathing 3D logo. The identity adapts and responds to user interaction, creating a memorable brand experience across all touchpoints.',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop',
      gallery: JSON.stringify([
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=800&fit=crop',
      ]),
      category_id: brandCat?.id,
      technologies: JSON.stringify(['Three.js', 'GSAP', 'After Effects', 'Figma', 'Principle']),
      tags: JSON.stringify(['branding', '3d', 'motion', 'identity', 'logo']),
      color: '#ec4899',
      status: 'published',
      featured: false,
      views: 8900,
      client_name: 'Creative Agency',
      project_url: 'https://lumina-demo.orgportfolio.com',
      duration: '4 weeks',
      team_size: 2,
      challenges: JSON.stringify(['Logo animation system', 'Brand consistency', 'Asset delivery']),
      solutions: JSON.stringify(['Procedural animation', 'Design tokens', 'Automated export pipeline']),
      results: JSON.stringify(['Brand recognition +60%', 'Social engagement +150%', 'Client retained for 3 years']),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]
  
  db.data.projects.push(...sampleProjects)
  
  // Default settings
  const defaultSettings = {
    siteName: 'Org Portfolio',
    siteDescription: 'Creating immersive 3D digital experiences',
    siteUrl: 'https://orgportfolio.com',
    contactEmail: 'hello@orgportfolio.com',
    timezone: 'UTC',
    language: 'en',
    maintenanceMode: false,
    primaryColor: '#0ea5e9',
    secondaryColor: '#8b5cf6',
    darkMode: 'system',
    emailNewOrder: true,
    emailOrderUpdates: true,
    emailNewUser: true,
    emailWeeklyReport: false,
    twoFactorAuth: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireEmailVerification: true,
    apiRateLimit: 1000,
    apiEnabled: true,
    webhooksEnabled: true,
    backupFrequency: 'daily',
    logRetention: 90,
  }
  
  for (const [key, value] of Object.entries(defaultSettings)) {
    db.data.settings[key] = value
  }
}

// Helper functions for querying
function getUsers() {
  return db.data.users
}

function getUserById(id) {
  return db.data.users.find(u => u.id === id)
}

function getUserByEmail(email) {
  return db.data.users.find(u => u.email === email)
}

function getCategories() {
  return db.data.categories
}

function getCategoryById(id) {
  return db.data.categories.find(c => c.id === id)
}

function getCategoryBySlug(slug) {
  return db.data.categories.find(c => c.slug === slug)
}

function getProjects(filters = {}) {
  let projects = [...db.data.projects]
  
  if (filters.status) {
    projects = projects.filter(p => p.status === filters.status)
  }
  
  if (filters.category) {
    const cat = getCategoryBySlug(filters.category)
    if (cat) {
      projects = projects.filter(p => p.category_id === cat.id)
    }
  }
  
  if (filters.search) {
    const search = filters.search.toLowerCase()
    projects = projects.filter(p => 
      p.title.toLowerCase().includes(search) ||
      p.description.toLowerCase().includes(search) ||
      (p.tags && JSON.parse(p.tags).some(t => t.toLowerCase().includes(search)))
    )
  }
  
  // Sort
  switch (filters.sort) {
    case 'oldest':
      projects.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      break
    case 'popular':
      projects.sort((a, b) => b.views - a.views)
      break
    case 'name':
      projects.sort((a, b) => a.title.localeCompare(b.title))
      break
    default: // newest
      projects.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }
  
  // Parse JSON fields and add category info
  return projects.map(p => ({
    ...p,
    gallery: p.gallery ? JSON.parse(p.gallery) : [],
    technologies: p.technologies ? JSON.parse(p.technologies) : [],
    tags: p.tags ? JSON.parse(p.tags) : [],
    challenges: p.challenges ? JSON.parse(p.challenges) : [],
    solutions: p.solutions ? JSON.parse(p.solutions) : [],
    results: p.results ? JSON.parse(p.results) : [],
    category: p.category_id ? getCategoryById(p.category_id) : null,
    featured: Boolean(p.featured),
  }))
}

function getProjectById(id) {
  const project = db.data.projects.find(p => p.id === id)
  if (!project) return null
  
  return {
    ...project,
    gallery: project.gallery ? JSON.parse(project.gallery) : [],
    technologies: project.technologies ? JSON.parse(project.technologies) : [],
    tags: project.tags ? JSON.parse(project.tags) : [],
    challenges: project.challenges ? JSON.parse(project.challenges) : [],
    solutions: project.solutions ? JSON.parse(project.solutions) : [],
    results: project.results ? JSON.parse(project.results) : [],
    category: project.category_id ? getCategoryById(project.category_id) : null,
    featured: Boolean(project.featured),
  }
}

function getOrders(filters = {}) {
  let orders = [...db.data.orders]
  
  if (filters.status) {
    orders = orders.filter(o => o.status === filters.status)
  }
  
  if (filters.search) {
    const search = filters.search.toLowerCase()
    orders = orders.filter(o => 
      o.id.toLowerCase().includes(search) ||
      o.project_type.toLowerCase().includes(search) ||
      (o.contact_info && JSON.parse(o.contact_info).name?.toLowerCase().includes(search)) ||
      (o.contact_info && JSON.parse(o.contact_info).email?.toLowerCase().includes(search))
    )
  }
  
  // Sort
  switch (filters.sort) {
    case 'oldest':
      orders.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      break
    case 'amount':
      orders.sort((a, b) => b.total_price - a.total_price)
      break
    case 'status':
      orders.sort((a, b) => a.status.localeCompare(b.status))
      break
    default: // newest
      orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }
  
  return orders.map(o => ({
    ...o,
    project_details: o.project_details ? JSON.parse(o.project_details) : {},
    contact_info: o.contact_info ? JSON.parse(o.contact_info) : {},
  }))
}

function getOrderById(id) {
  const order = db.data.orders.find(o => o.id === id)
  if (!order) return null
  
  return {
    ...order,
    project_details: order.project_details ? JSON.parse(order.project_details) : {},
    contact_info: order.contact_info ? JSON.parse(order.contact_info) : {},
  }
}

function getSettings() {
  return db.data.settings
}

async function save() {
  await db.write()
}

// Initialize on import
initDatabase()

// Export database object with helper methods
export const database = {
  db,
  initDatabase,
  save,
  // Users
  getUsers,
  getUserById,
  getUserByEmail,
  createUser: async (user) => {
    db.data.users.push(user)
    await save()
    return user
  },
  updateUser: async (id, updates) => {
    const index = db.data.users.findIndex(u => u.id === id)
    if (index !== -1) {
      db.data.users[index] = { ...db.data.users[index], ...updates, updated_at: new Date().toISOString() }
      await save()
      return db.data.users[index]
    }
    return null
  },
  deleteUser: async (id) => {
    const index = db.data.users.findIndex(u => u.id === id)
    if (index !== -1) {
      db.data.users.splice(index, 1)
      await save()
      return true
    }
    return false
  },
  // Categories
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory: async (category) => {
    db.data.categories.push(category)
    await save()
    return category
  },
  updateCategory: async (id, updates) => {
    const index = db.data.categories.findIndex(c => c.id === id)
    if (index !== -1) {
      db.data.categories[index] = { ...db.data.categories[index], ...updates, updated_at: new Date().toISOString() }
      await save()
      return db.data.categories[index]
    }
    return null
  },
  deleteCategory: async (id) => {
    const index = db.data.categories.findIndex(c => c.id === id)
    if (index !== -1) {
      db.data.categories.splice(index, 1)
      await save()
      return true
    }
    return false
  },
  // Projects
  getProjects,
  getProjectById,
  createProject: async (project) => {
    db.data.projects.push(project)
    await save()
    return project
  },
  updateProject: async (id, updates) => {
    const index = db.data.projects.findIndex(p => p.id === id)
    if (index !== -1) {
      db.data.projects[index] = { ...db.data.projects[index], ...updates, updated_at: new Date().toISOString() }
      await save()
      return db.data.projects[index]
    }
    return null
  },
  deleteProject: async (id) => {
    const index = db.data.projects.findIndex(p => p.id === id)
    if (index !== -1) {
      db.data.projects.splice(index, 1)
      await save()
      return true
    }
    return false
  },
  incrementViews: async (id) => {
    const project = db.data.projects.find(p => p.id === id)
    if (project) {
      project.views = (project.views || 0) + 1
      await save()
    }
  },
  // Orders
  getOrders,
  getOrderById,
  createOrder: async (order) => {
    db.data.orders.push(order)
    await save()
    return order
  },
  updateOrder: async (id, updates) => {
    const index = db.data.orders.findIndex(o => o.id === id)
    if (index !== -1) {
      db.data.orders[index] = { ...db.data.orders[index], ...updates, updated_at: new Date().toISOString() }
      await save()
      return db.data.orders[index]
    }
    return null
  },
  deleteOrder: async (id) => {
    const index = db.data.orders.findIndex(o => o.id === id)
    if (index !== -1) {
      db.data.orders.splice(index, 1)
      await save()
      return true
    }
    return false
  },
  // Settings
  getSettings,
  updateSettings: async (settings) => {
    db.data.settings = { ...db.data.settings, ...settings }
    await save()
    return db.data.settings
  },
}

export { db }