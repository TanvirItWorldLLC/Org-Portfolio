'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, FolderKanban, ShoppingBag, Users, DollarSign, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

interface Stats {
  totalProjects: number;
  publishedProjects: number;
  activeOrders: number;
  totalOrders: number;
  totalUsers: number;
  activeUsers: number;
  revenue: number;
  projectsChange: string;
  ordersChange: string;
  usersChange: string;
  revenueChange: string;
  recentOrders: Array<{
    id: string;
    orderId: string;
    projectType: string;
    plan: string;
    totalPrice: number;
    status: string;
    contactInfo: { name?: string; email?: string };
    createdAt: string;
  }>;
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
  pending: Clock,
  confirmed: CheckCircle,
  in_progress: TrendingUp,
  review: Eye,
  completed: CheckCircle,
  cancelled: XCircle,
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { label: 'Total Projects', value: stats.totalProjects.toLocaleString(), change: stats.projectsChange, icon: FolderKanban, color: 'bg-blue-500' },
        { label: 'Active Orders', value: stats.activeOrders.toLocaleString(), change: stats.ordersChange, icon: ShoppingBag, color: 'bg-purple-500' },
        { label: 'Total Users', value: stats.totalUsers.toLocaleString(), change: stats.usersChange, icon: Users, color: 'bg-green-500' },
        { label: 'Revenue', value: `$${stats.revenue.toLocaleString()}`, change: stats.revenueChange, icon: DollarSign, color: 'bg-orange-500' },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white">Dashboard</h1>
          <p className="text-dark-600 dark:text-dark-400 mt-1">Overview of your portfolio business</p>
        </div>
        <button onClick={() => window.location.reload()} className="btn-secondary self-start">Refresh</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <div key={i} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-dark-500 mb-1">{c.label}</p>
                {loading ? (
                  <div className="h-8 w-32 bg-dark-200 dark:bg-dark-700 rounded animate-pulse" />
                ) : (
                  <p className="text-3xl font-bold text-dark-900 dark:text-white">{c.value}</p>
                )}
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">{c.change}</span>
                  <span className="text-sm text-dark-500">vs last month</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl ${c.color} flex items-center justify-center`}>
                <c.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-200 dark:border-dark-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-dark-500">Order ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-dark-500">Project</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-dark-500">Client</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-dark-500">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-dark-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-dark-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
              {!stats || stats.recentOrders.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-dark-500">No orders yet.</td></tr>
              ) : (
                stats.recentOrders.map((o) => {
                  const Icon = STATUS_ICONS[o.status] || Clock;
                  return (
                    <tr key={o.id} className="hover:bg-dark-50 dark:hover:bg-dark-800/50">
                      <td className="py-4 px-4 text-sm font-mono text-dark-900 dark:text-white">{o.orderId}</td>
                      <td className="py-4 px-4 text-sm text-dark-900 dark:text-white capitalize">{o.projectType.replace('_', ' ')}</td>
                      <td className="py-4 px-4 text-sm text-dark-600 dark:text-dark-400">{o.contactInfo?.name}</td>
                      <td className="py-4 px-4 text-sm font-medium text-dark-900 dark:text-white">${o.totalPrice.toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[o.status]}`}>
                          <Icon className="w-3 h-3" />{o.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-dark-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}