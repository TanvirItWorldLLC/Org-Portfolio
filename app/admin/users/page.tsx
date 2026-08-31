'use client';

import { useEffect, useState } from 'react';
import { Search, Trash2, Loader2, Mail, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  orderCount: number;
  totalSpent: number;
  lastLogin: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (roleFilter !== 'all') params.set('role', roleFilter);
      if (search) params.set('search', search);
      const r = await fetch(`/api/admin/users?${params}`, { credentials: 'include' });
      const d = await r.json();
      setUsers(d.users || []);
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [roleFilter]);

  async function setRole(id: string, role: string) {
    setUpdating(id);
    try {
      const r = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: role.toUpperCase() }),
      });
      if (!r.ok) throw new Error();
      toast.success('Role updated');
      load();
    } catch { toast.error('Failed'); }
    finally { setUpdating(null); }
  }

  async function setStatus(id: string, status: string) {
    setUpdating(id);
    try {
      const r = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: status.toUpperCase() }),
      });
      if (!r.ok) throw new Error();
      toast.success('Status updated');
      load();
    } catch { toast.error('Failed'); }
    finally { setUpdating(null); }
  }

  async function remove(id: string) {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    setDeleting(id);
    try {
      const r = await fetch(`/api/admin/users/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.error || 'Failed');
      }
      toast.success('Deleted');
      load();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
    finally { setDeleting(null); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark-900 dark:text-white">Users</h1>
        <p className="text-dark-600 dark:text-dark-400 mt-1">Manage user accounts and permissions</p>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text" placeholder="Search users..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            className="input pl-10"
          />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input w-auto">
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="animate-pulse h-12 bg-dark-100 dark:bg-dark-800 rounded" />)}</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-dark-500">No users.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-500">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-500">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-500">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-500">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-500">Orders</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-dark-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-dark-50 dark:hover:bg-dark-800/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                          <span className="text-white font-bold">{u.name?.[0]?.toUpperCase() || u.email[0].toUpperCase()}</span>
                        </div>
                        <p className="font-medium text-dark-900 dark:text-white">{u.name}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <a href={`mailto:${u.email}`} className="text-dark-600 dark:text-dark-400 hover:text-primary-600 flex items-center gap-1">
                        <Mail className="w-3 h-3" />{u.email}
                      </a>
                    </td>
                    <td className="py-4 px-4">
                      <select value={u.role} onChange={(e) => setRole(u.id, e.target.value)} disabled={updating === u.id} className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer focus:outline-none ${u.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-4 px-4">
                      <select value={u.status} onChange={(e) => setStatus(u.id, e.target.value)} disabled={updating === u.id} className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer focus:outline-none ${u.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-sm text-dark-600 dark:text-dark-400">{u.orderCount}</td>
                    <td className="py-4 px-4 text-right">
                      <button onClick={() => remove(u.id)} disabled={deleting === u.id} className="p-2 rounded-lg text-dark-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600">
                        {deleting === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}