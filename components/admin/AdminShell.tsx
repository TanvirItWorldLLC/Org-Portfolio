'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard, FolderKanban, ShoppingBag, Users, Settings, LogOut, Menu, X, ChevronLeft, Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/components/providers/AuthProvider';

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    if (typeof window !== 'undefined') localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  async function handleLogout() {
    await logout();
    toast.success('Logged out');
    router.push('/');
  }

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950 flex">
      <div className={`fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setOpen(false)} />

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-white dark:bg-dark-900 border-r border-dark-200 dark:border-dark-800 transition-all duration-300 flex flex-col ${
          collapsed ? 'w-20' : 'w-64'
        } ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-dark-200 dark:border-dark-800">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            {!collapsed && <span className="text-xl font-bold text-dark-900 dark:text-white">Admin</span>}
          </Link>
          <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-lg text-dark-500 hover:bg-dark-100 dark:hover:bg-dark-800 hidden lg:block" aria-label="Toggle sidebar">
            <ChevronLeft className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Admin">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-dark-200 dark:border-dark-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'A'}</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-dark-900 dark:text-white truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs text-dark-500 truncate">{user?.email}</p>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 ${collapsed ? 'justify-center' : ''}`}>
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-dark-950/80 backdrop-blur-xl border-b border-dark-200 dark:border-dark-800">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <button onClick={() => setOpen(true)} className="lg:hidden p-2 rounded-lg text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800" aria-label="Open menu">
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="text-sm text-dark-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              ← Back to site
            </Link>
            <button onClick={toggleTheme} className="p-2 rounded-xl text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800" aria-label="Toggle theme">
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}