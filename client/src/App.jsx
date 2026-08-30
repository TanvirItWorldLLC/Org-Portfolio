import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { PortfolioProvider } from './contexts/PortfolioContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Portfolio from './pages/Portfolio'
import ProjectDetail from './pages/ProjectDetail'
import About from './pages/About'
import Contact from './pages/Contact'
import Order from './pages/Order'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminProjects from './pages/admin/Projects'
import AdminOrders from './pages/admin/Orders'
import AdminSettings from './pages/admin/Settings'
import AdminUsers from './pages/admin/Users'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import './components/three/Scene3D.css'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="flex flex-col items-center gap-4 text-white">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-dark-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="portfolio/:id" element={<ProjectDetail />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="order" element={<Order />} />
        <Route path="order/:projectId" element={<Order />} />
      </Route>

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected User Routes */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<div className="container-custom py-12">User Dashboard - Coming Soon</div>} />
        <Route path="orders" element={<div className="container-custom py-12">My Orders - Coming Soon</div>} />
        <Route path="profile" element={<div className="container-custom py-12">Profile - Coming Soon</div>} />
      </Route>

      {/* Admin Routes */}
      <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route path="admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="admin/dashboard" element={<AdminDashboard />} />
        <Route path="admin/projects" element={<AdminProjects />} />
        <Route path="admin/orders" element={<AdminOrders />} />
        <Route path="admin/users" element={<AdminUsers />} />
        <Route path="admin/settings" element={<AdminSettings />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<div className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-950"><div className="text-center"><h1 className="text-6xl font-bold text-dark-900 dark:text-white">404</h1><p className="mt-4 text-dark-600 dark:text-dark-400">Page not found</p><a href="/" className="mt-6 inline-block text-primary-600 hover:underline">Go home</a></div></div>} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <PortfolioProvider>
        <AppRoutes />
      </PortfolioProvider>
    </AuthProvider>
  )
}