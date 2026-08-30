import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, MoreVertical, Edit, Trash2, Plus, Loader2, Mail, Shield, UserCheck, UserX, ChevronDown } from 'lucide-react'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'

const roleOptions = ['all', 'admin', 'user']
const statusOptions = ['all', 'active', 'inactive']
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'email', label: 'Email' },
]

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [updating, setUpdating] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getUsers({
        page,
        limit: 15,
        search: searchQuery,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sort: sortBy,
      })
      setUsers(response.data.users)
      setTotalPages(response.data.totalPages || 1)
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchUsers()
  }, [page, searchQuery, roleFilter, statusFilter, sortBy])
  
  const handleRoleChange = async (userId, newRole) => {
    setUpdating(userId)
    try {
      await adminAPI.updateUser(userId, { role: newRole })
      toast.success(`User role updated to ${newRole}`)
      fetchUsers()
    } catch (error) {
      toast.error('Failed to update user role')
    } finally {
      setUpdating(null)
    }
  }
  
  const handleStatusChange = async (userId, newStatus) => {
    setUpdating(userId)
    try {
      await adminAPI.updateUser(userId, { status: newStatus })
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`)
      fetchUsers()
    } catch (error) {
      toast.error('Failed to update user status')
    } finally {
      setUpdating(null)
    }
  }
  
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
    
    setDeleting(id)
    try {
      await adminAPI.deleteUser(id)
      toast.success('User deleted successfully')
      fetchUsers()
    } catch (error) {
      toast.error('Failed to delete user')
    } finally {
      setDeleting(null)
    }
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
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white">Users</h1>
          <p className="text-dark-600 dark:text-dark-400 mt-1">Manage user accounts and permissions</p>
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
              placeholder="Search users..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setPage(1)}
              className="input pl-10"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={roleFilter}
              onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
              className="input w-auto"
            >
              {roleOptions.map(role => (
                <option key={role} value={role}>{role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}</option>
              ))}
            </select>
            
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="input w-auto"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}</option>
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
      
      {/* Users Table */}
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
                <div className="w-10 h-10 bg-dark-200 dark:bg-dark-700 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-dark-200 dark:bg-dark-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-dark-200 dark:bg-dark-700 rounded w-1/2" />
                </div>
                <div className="w-24 h-8 bg-dark-200 dark:bg-dark-700 rounded" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto text-dark-300 dark:text-dark-600 mb-4" />
            <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">No users found</h3>
            <p className="text-dark-600 dark:text-dark-400">Users will appear here when they register</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800/50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-dark-500 dark:text-dark-500">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-dark-500 dark:text-dark-500">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-dark-500 dark:text-dark-500">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-dark-500 dark:text-dark-500">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-dark-500 dark:text-dark-500">Orders</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-dark-500 dark:text-dark-500">Joined</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-dark-500 dark:text-dark-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
                  <AnimatePresence>
                    {users.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-dark-50 dark:hover:bg-dark-800/50"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                              <span className="text-white font-bold">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                            </div>
                            <div>
                              <p className="font-medium text-dark-900 dark:text-white">{user.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <a href={`mailto:${user.email}`} className="text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                            {user.email}
                          </a>
                        </td>
                        <td className="py-4 px-4">
                          <select
                            value={user.role}
                            onChange={e => handleRoleChange(user.id, e.target.value)}
                            disabled={updating === user.id}
                            className={`px-2 py-1 rounded-full text-xs font-medium border-0 bg-transparent appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="py-4 px-4">
                          <select
                            value={user.status || 'active'}
                            onChange={e => handleStatusChange(user.id, e.target.value)}
                            disabled={updating === user.id}
                            className={`px-2 py-1 rounded-full text-xs font-medium border-0 bg-transparent appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </td>
                        <td className="py-4 px-4 text-sm text-dark-600 dark:text-dark-400">
                          {(user.orderCount || 0).toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-sm text-dark-500 dark:text-dark-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="p-2 rounded-lg text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 hover:text-dark-600 dark:hover:text-dark-300 transition-colors"
                              aria-label="View user details"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              disabled={deleting === user.id}
                              className="p-2 rounded-lg text-dark-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
                              aria-label="Delete user"
                            >
                              {deleting === user.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
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
      
      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedUser(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-dark-900 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-dark-200 dark:border-dark-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-dark-900 dark:text-white">User Details</h2>
              <button onClick={() => setSelectedUser(null)} className="p-2 rounded-lg text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">{selectedUser.name?.charAt(0).toUpperCase() || 'U'}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-dark-900 dark:text-white">{selectedUser.name}</h3>
                  <p className="text-dark-500 dark:text-dark-500">@{selectedUser.username || 'no-username'}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-dark-500 dark:text-dark-500">Email</span>
                  <a href={`mailto:${selectedUser.email}`} className="text-primary-600 dark:text-primary-400 hover:underline">{selectedUser.email}</a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-500 dark:text-dark-500">Role</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                    {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-500 dark:text-dark-500">Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedUser.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {selectedUser.status?.charAt(0).toUpperCase() + selectedUser.status?.slice(1) || 'Active'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-500 dark:text-dark-500">Orders</span>
                  <span className="font-medium text-dark-900 dark:text-white">{(selectedUser.orderCount || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-500 dark:text-dark-500">Total Spent</span>
                  <span className="font-medium text-dark-900 dark:text-white">${(selectedUser.totalSpent || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-500 dark:text-dark-500">Member Since</span>
                  <span className="font-medium text-dark-900 dark:text-white">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-500 dark:text-dark-500">Last Login</span>
                  <span className="font-medium text-dark-900 dark:text-white">{selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString() : 'Never'}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}