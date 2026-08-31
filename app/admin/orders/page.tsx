'use client';

import { useEffect, useState } from 'react';
import { Search, Trash2, Loader2, Eye, ChevronDown, X, Clock, CheckCircle, Truck, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface Order {
  id: string;
  orderId: string;
  projectType: string;
  plan: string;
  totalPrice: number;
  status: string;
  projectDetails: { title?: string; description?: string; requirements?: string; referenceUrls?: string; deadline?: string };
  contactInfo: { name?: string; email?: string; company?: string; phone?: string; preferredContact?: string };
  notes?: string;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  review: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};
const STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  pending: Clock, confirmed: CheckCircle, in_progress: Truck, review: Eye, completed: Package, cancelled: X,
};
const FLOW = ['pending', 'confirmed', 'in_progress', 'review', 'completed'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('search', search);
      const r = await fetch(`/api/orders?${params}`, { credentials: 'include' });
      const d = await r.json();
      setOrders(d.orders || []);
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [statusFilter]);

  async function setStatus(id: string, status: string) {
    setUpdating(id);
    try {
      const r = await fetch(`/api/orders/${id}`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: status.toUpperCase() }),
      });
      if (!r.ok) throw new Error('Failed');
      toast.success(`Updated to ${status}`);
      load();
    } catch { toast.error('Failed'); }
    finally { setUpdating(null); }
  }

  async function remove(id: string) {
    if (!confirm('Delete this order?')) return;
    try {
      const r = await fetch(`/api/orders/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!r.ok) throw new Error('Failed');
      toast.success('Deleted');
      load();
    } catch { toast.error('Failed'); }
  }

  function nextStatus(s: string) {
    const i = FLOW.indexOf(s);
    return i >= 0 && i < FLOW.length - 1 ? FLOW[i + 1] : null;
  }
  function prevStatus(s: string) {
    const i = FLOW.indexOf(s);
    return i > 0 ? FLOW[i - 1] : null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark-900 dark:text-white">Orders</h1>
        <p className="text-dark-600 dark:text-dark-400 mt-1">Manage client orders and project requests</p>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text" placeholder="Search orders..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            className="input pl-10"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-auto">
          <option value="all">All</option>
          {FLOW.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="animate-pulse h-12 bg-dark-100 dark:bg-dark-800 rounded" />)}</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-dark-500">No orders yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-500">Order</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-500">Client</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-500">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-500">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-500">Date</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-dark-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
                {orders.map((o) => {
                  const Icon = STATUS_ICONS[o.status] || Clock;
                  return (
                    <tr key={o.id} className="hover:bg-dark-50 dark:hover:bg-dark-800/50">
                      <td className="py-4 px-4">
                        <p className="font-mono text-sm font-medium text-dark-900 dark:text-white">{o.orderId}</p>
                        <p className="text-xs text-dark-500 capitalize">{o.projectType.replace('_', ' ')} • {o.plan}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-dark-900 dark:text-white">{o.contactInfo?.name || '—'}</p>
                        <p className="text-xs text-dark-500">{o.contactInfo?.email}</p>
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-dark-900 dark:text-white">${o.totalPrice.toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[o.status]}`}>
                            <Icon className="w-3 h-3" />{o.status.replace('_', ' ')}
                          </span>
                          {prevStatus(o.status) && (
                            <button onClick={() => setStatus(o.id, prevStatus(o.status)!)} disabled={updating === o.id} className="p-1.5 rounded text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800" aria-label="Previous status">
                              <ChevronDown className="w-4 h-4 -rotate-90" />
                            </button>
                          )}
                          {nextStatus(o.status) && (
                            <button onClick={() => setStatus(o.id, nextStatus(o.status)!)} disabled={updating === o.id} className="p-1.5 rounded text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800" aria-label="Next status">
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-dark-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => setSelected(o)} className="p-2 rounded-lg text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => remove(o.id)} className="p-2 rounded-lg text-dark-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelected(null)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-dark-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-dark-200 dark:border-dark-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-dark-900 dark:text-white">Order {selected.orderId}</h2>
              <button onClick={() => setSelected(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-dark-500">Project Type</p><p className="font-medium capitalize">{selected.projectType.replace('_', ' ')}</p></div>
                <div><p className="text-sm text-dark-500">Plan</p><p className="font-medium capitalize">{selected.plan}</p></div>
                <div><p className="text-sm text-dark-500">Status</p><p className="font-medium capitalize">{selected.status.replace('_', ' ')}</p></div>
                <div><p className="text-sm text-dark-500">Total</p><p className="font-bold text-lg">${selected.totalPrice.toLocaleString()}</p></div>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Client</h3>
                <p>{selected.contactInfo?.name} ({selected.contactInfo?.email})</p>
                {selected.contactInfo?.company && <p className="text-sm text-dark-500">{selected.contactInfo.company}</p>}
                {selected.contactInfo?.phone && <p className="text-sm text-dark-500">{selected.contactInfo.phone}</p>}
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Project</h3>
                <p className="font-medium">{selected.projectDetails?.title}</p>
                <p className="text-sm text-dark-600 dark:text-dark-400">{selected.projectDetails?.description}</p>
                {selected.projectDetails?.requirements && <p className="text-sm text-dark-600 dark:text-dark-400 mt-2"><strong>Requirements:</strong> {selected.projectDetails.requirements}</p>}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}