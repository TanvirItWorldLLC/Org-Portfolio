import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, FolderKanban, ShoppingBag, Users, DollarSign, Eye, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { adminAPI } from '../../services/api'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const statCards = [
  { label: 'Total Projects', value: '0', change: '+12%', icon: FolderKanban, color: 'bg-blue-500', trend: 'up' },
  { label: 'Active Orders', value: '0', change: '+5%', icon: ShoppingBag, color: 'bg-purple-500', trend: 'up' },
  { label: 'Total Users', value: '0', change: '+8%', icon: Users, color: 'bg-green-500', trend: 'up' },
  { label: 'Revenue', value: '$0', change: '+23%', icon: DollarSign, color: 'bg-orange-500', trend: 'up' },
]

const recentOrders = [
  { id: '#ORD-001', project: '3D Portfolio Redesign', client: 'Acme Corp', amount: '$15,000', status: 'pending', date: '2024-01-15' },
  { id: '#ORD-002', project: 'E-commerce Experience', client: 'TechStart Inc', amount: '$45,000', status: 'in_progress', date: '2024-01-14' },
  { id: '#ORD-003', project: 'Product Configurator', client: 'Design Studio', amount: '$28,000', status: 'completed', date: '2024-01-13' },
  { id: '#ORD-004', project: 'Virtual Exhibition', client: 'Museum of Art', amount: '$75,000', status: 'review', date: '2024-01-12' },
  { id: '#ORD-005', project: 'Landing Page', client: 'StartupXYZ', amount: '$8,000', status: 'cancelled', date: '2024-01-11' },
]

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  review: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const statusIcons = {
  pending: Clock,
  in_progress: TrendingUp,
  review: Eye,
  completed: CheckCircle,
  cancelled: XCircle,
}

const getStatusIcon = (status) => {
  const Icon = statusIcons[status] || Clock
  return <Icon className="w-3 h-3" />
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(statCards)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState(recentOrders)
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminAPI.getStats()
        const data = response.data
        setStats([
          { ...statCards[0], value: data.totalProjects?.toLocaleString() || '0', change: data.projectsChange || '+12%' },
          { ...statCards[1], value: data.activeOrders?.toLocaleString() || '0', change: data.ordersChange || '+5%' },
          { ...statCards[2], value: data.totalUsers?.toLocaleString() || '0', change: data.usersChange || '+8%' },
          { ...statCards[3], value: `$${data.revenue?.toLocaleString() || '0'}`, change: data.revenueChange || '+23%' },
        ])
        if (data.recentOrders) setOrders(data.recentOrders)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])
  
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white">Dashboard</h1>
          <p className="text-dark-600 dark:text-dark-400 mt-1">Overview of your portfolio business</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary">Export Report</button>
          <button className="btn-primary">Refresh</button>
        </div>
      </motion.div>
      
      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-dark-500 dark:text-dark-500 mb-1">{stat.label}</p>
                {loading ? (
                  <div className="h-8 w-32 bg-dark-200 dark:bg-dark-700 rounded animate-pulse" />
                ) : (
                  <p className="text-3xl font-bold text-dark-900 dark:text-white">{stat.value}</p>
                )}
                <div className="flex items-center gap-1 mt-2">
                  {stat.trend === 'up' ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">{stat.change}</span>
                  <span className="text-sm text-dark-500 dark:text-dark-500">vs last month</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Recent Orders & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-dark-900 dark:text-white">Recent Orders</h2>
            <a href="/admin/orders" className="text-sm text-primary-600 hover:underline dark:text-primary-400">View All</a>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-200 dark:border-dark-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-500 dark:text-dark-500">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-500 dark:text-dark-500">Project</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-500 dark:text-dark-500">Client</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-500 dark:text-dark-500">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-500 dark:text-dark-500">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-500 dark:text-dark-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
                {orders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-dark-50 dark:hover:bg-dark-800/50"
                  >
                    <td className="py-4 px-4 text-sm font-mono text-dark-900 dark:text-white">{order.id}</td>
                    <td className="py-4 px-4 text-sm text-dark-900 dark:text-white">{order.project}</td>
                    <td className="py-4 px-4 text-sm text-dark-600 dark:text-dark-400">{order.client}</td>
                    <td className="py-4 px-4 text-sm font-medium text-dark-900 dark:text-white">{order.amount}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[order.status]}`}>
                        {getStatusIcon(order.status)}
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-dark-500 dark:text-dark-500">{order.date}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-4"
        >
          <div className="card">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <a href="/admin/projects/new" className="btn-secondary w-full justify-start gap-3">
                <FolderKanban className="w-5 h-5" />
                Add New Project
              </a>
              <a href="/admin/orders" className="btn-secondary w-full justify-start gap-3">
                <ShoppingBag className="w-5 h-5" />
                Manage Orders
              </a>
              <a href="/admin/users" className="btn-secondary w-full justify-start gap-3">
                <Users className="w-5 h-5" />
                View Users
              </a>
              <a href="/admin/settings" className="btn-secondary w-full justify-start gap-3">
                <Settings className="w-5 h-5" />
                Settings
              </a>
            </div>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-600 dark:text-dark-400">API Status</span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-600 dark:text-dark-400">Database</span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-600 dark:text-dark-400">Storage</span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  72% Used
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-600 dark:text-dark-400">CDN</span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Active
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}