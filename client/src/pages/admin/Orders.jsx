import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, MoreVertical, Edit, Trash2, Eye, ChevronDown, Loader2, Truck, Package, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react'
import { orderAPI } from '../../services/api'
import toast from 'react-hot-toast'

const statusOptions = ['all', 'pending', 'confirmed', 'in_progress', 'review', 'completed', 'cancelled']
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'amount', label: 'Highest Amount' },
  { value: 'status', label: 'Status' },
]

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  review: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  in_progress: Truck,
  review: Eye,
  completed: Package,
  cancelled: XCircle,
}

const getStatusIcon = (status) => {
  const Icon = statusIcons[status] || Clock
  return <Icon className="w-3 h-3" />
}

const statusFlow = ['pending', 'confirmed', 'in_progress', 'review', 'completed']

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState(null)
  
  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await orderAPI.getOrders({
        page,
        limit: 15,
        search: searchQuery,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sort: sortBy,
      })
      setOrders(response.data.orders)
      setTotalPages(response.data.totalPages || 1)
    } catch (error) {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchOrders()
  }, [page, searchQuery, statusFilter, sortBy])
  
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId)
    try {
      await orderAPI.updateStatus(orderId, newStatus)
      toast.success(`Order status updated to ${newStatus.replace('_', ' ')}`)
      fetchOrders()
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setUpdating(null)
    }
  }
  
  const getNextStatus = (currentStatus) => {
    const currentIndex = statusFlow.indexOf(currentStatus)
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) return null
    return statusFlow[currentIndex + 1]
  }
  
  const getPrevStatus = (currentStatus) => {
    const currentIndex = statusFlow.indexOf(currentStatus)
    if (currentIndex <= 0) return null
    return statusFlow[currentIndex - 1]
  }
  
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white">Orders</h1>
          <p className="text-dark-600 dark:text-dark-400 mt-1">Manage client orders and project requests</p>
        </div>
      </motion.div>
      
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="card p-4"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              placeholder="Search orders, clients, projects..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setPage(1)}
              className="input pl-10"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="input w-auto"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value); setPage(1); }}
              className="input w-auto"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>
      
      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="card overflow-hidden"
      >
        {loading ? (
          <div className="p-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-4 py-4 border-b border-dark-200 dark:border-dark-700">
                <div className="w-10 h-10 bg-dark-200 dark:bg-dark-700 rounded" />
                <div className="flex-1">
                  <div className="h-4 bg-dark-200 dark:bg-dark-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-dark-200 dark:bg-dark-700 rounded w-1/2" />
                </div>
                <div className="w-24 h-8 bg-dark-200 dark:bg-dark-700 rounded" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto text-dark-300 dark:text-dark-600 mb-4" />
            <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">No orders found</h3>
            <p className="text-dark-600 dark:text-dark-400">Orders will appear here when clients submit project requests</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800/50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-dark-500 dark:text-dark-500">Order ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-dark-500 dark:text-dark-500">Project Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-dark-500 dark:text-dark-500">Client</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-dark-500 dark:text-dark-500">Plan</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-dark-500 dark:text-dark-500">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-dark-500 dark:text-dark-500">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-dark-500 dark:text-dark-500">Date</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-dark-500 dark:text-dark-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
                  <AnimatePresence>
                    {orders.map((order, index) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-dark-50 dark:hover:bg-dark-800/50"
                      >
                        <td className="py-4 px-4">
                          <span className="font-mono text-sm font-medium text-dark-900 dark:text-white">{order.id}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                            {order.projectType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Custom'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-dark-900 dark:text-white">{order.clientName || order.contactInfo?.name}</p>
                            <p className="text-sm text-dark-500 dark:text-dark-500">{order.contactInfo?.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                            {order.plan?.charAt(0).toUpperCase() + order.plan?.slice(1) || 'Professional'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm font-medium text-dark-900 dark:text-white">
                          ${order.totalPrice?.toLocaleString() || '0'}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[order.status]}`}>
                              {getStatusIcon(order.status)}
                              {order.status.replace('_', ' ')}
                            </span>
                            
                            {/* Quick status progression */}
                            <div className="flex items-center gap-1">
                              {getPrevStatus(order.status) && (
                                <button
                                  onClick={() => handleStatusChange(order.id, getPrevStatus(order.status))}
                                  disabled={updating === order.id}
                                  className="p-1.5 rounded text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 hover:text-dark-600 dark:hover:text-dark-300 disabled:opacity-50"
                                  aria-label="Previous status"
                                >
                                  <ChevronDown className="w-4 h-4 -rotate-90" />
                                </button>
                              )}
                              {getNextStatus(order.status) && (
                                <button
                                  onClick={() => handleStatusChange(order.id, getNextStatus(order.status))}
                                  disabled={updating === order.id}
                                  className="p-1.5 rounded text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 hover:text-dark-600 dark:hover:text-dark-300 disabled:opacity-50"
                                  aria-label="Next status"
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-dark-500 dark:text-dark-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-2 rounded-lg text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 hover:text-dark-600 dark:hover:text-dark-300 transition-colors"
                              aria-label="View order details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <Link
                              to={`/admin/orders/${order.id}`}
                              className="p-2 rounded-lg text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 hover:text-dark-600 dark:hover:text-dark-300 transition-colors"
                              aria-label="Edit order"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t border-dark-200 dark:border-dark-700">
                <p className="text-sm text-dark-500 dark:text-dark-500">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary px-3 py-1.5 text-sm"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn-secondary px-3 py-1.5 text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
      
      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedOrder(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-dark-900 rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-dark-200 dark:border-dark-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-dark-900 dark:text-white">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-lg text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-dark-500 dark:text-dark-500">Order ID</p>
                  <p className="font-mono font-medium text-dark-900 dark:text-white">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-dark-500 dark:text-dark-500">Date</p>
                  <p className="font-medium text-dark-900 dark:text-white">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-dark-500 dark:text-dark-500">Project Type</p>
                  <p className="font-medium text-dark-900 dark:text-white">{selectedOrder.projectType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                </div>
                <div>
                  <p className="text-sm text-dark-500 dark:text-dark-500">Plan</p>
                  <p className="font-medium text-dark-900 dark:text-white capitalize">{selectedOrder.plan}</p>
                </div>
                <div>
                  <p className="text-sm text-dark-500 dark:text-dark-500">Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[selectedOrder.status]}`}>
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-dark-500 dark:text-dark-500">Total</p>
                  <p className="font-bold text-dark-900 dark:text-white text-lg">${selectedOrder.totalPrice?.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="border-t border-dark-200 dark:border-dark-800 pt-6">
                <h3 className="font-semibold text-dark-900 dark:text-white mb-4">Client Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-dark-500 dark:text-dark-500">Name</p>
                    <p className="font-medium text-dark-900 dark:text-white">{selectedOrder.contactInfo?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-dark-500 dark:text-dark-500">Email</p>
                    <p className="font-medium text-dark-900 dark:text-white">{selectedOrder.contactInfo?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-dark-500 dark:text-dark-500">Company</p>
                    <p className="font-medium text-dark-900 dark:text-white">{selectedOrder.contactInfo?.company || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-dark-500 dark:text-dark-500">Phone</p>
                    <p className="font-medium text-dark-900 dark:text-white">{selectedOrder.contactInfo?.phone || 'Not provided'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-dark-500 dark:text-dark-500">Preferred Contact</p>
                    <p className="font-medium text-dark-900 dark:text-white capitalize">{selectedOrder.contactInfo?.preferredContact}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-dark-200 dark:border-dark-800 pt-6">
                <h3 className="font-semibold text-dark-900 dark:text-white mb-4">Project Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-dark-500 dark:text-dark-500">Title</p>
                    <p className="font-medium text-dark-900 dark:text-white">{selectedOrder.projectDetails?.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-dark-500 dark:text-dark-500">Description</p>
                    <p className="text-dark-600 dark:text-dark-400">{selectedOrder.projectDetails?.description}</p>
                  </div>
                  {selectedOrder.projectDetails?.requirements && (
                    <div>
                      <p className="text-sm text-dark-500 dark:text-dark-500">Requirements</p>
                      <p className="text-dark-600 dark:text-dark-400">{selectedOrder.projectDetails?.requirements}</p>
                    </div>
                  )}
                  {selectedOrder.projectDetails?.referenceUrls && (
                    <div>
                      <p className="text-sm text-dark-500 dark:text-dark-500">Reference URLs</p>
                      <p className="text-primary-600 dark:text-primary-400">{selectedOrder.projectDetails?.referenceUrls}</p>
                    </div>
                  )}
                  {selectedOrder.projectDetails?.deadline && (
                    <div>
                      <p className="text-sm text-dark-500 dark:text-dark-500">Deadline</p>
                      <p className="font-medium text-dark-900 dark:text-white">{new Date(selectedOrder.projectDetails.deadline).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}