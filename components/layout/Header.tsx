'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Menu, Moon, Sun, ShoppingBag, User, LogOut, LayoutDashboard, X } from 'lucide-react';
import toast from 'react-hot-toast';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDark(isDark);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  async function handleLogout() {
    try {
      await logout();
      toast.success('Logged out');
    } catch {
      toast.error('Logout failed');
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 dark:bg-dark-950/80 backdrop-blur-xl shadow-sm' : 'bg-transparent'
      }`}
    >
      <nav className="container-custom" aria-label="Main">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-dark-900 dark:text-white"
            aria-label="Org Portfolio home"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <span className="hidden sm:block">Org Portfolio</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm font-medium transition-colors hover:text-primary-600 dark:hover:text-primary-400 ${
                  pathname === l.href
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-dark-600 dark:text-dark-300'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link href="/order" className="btn-primary text-sm px-4 py-2">
              <ShoppingBag className="w-4 h-4" />
              <span>Order Now</span>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Link href="/admin/dashboard" className="btn-secondary text-sm px-4 py-2">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}
                <div className="relative group">
                  <button className="flex items-center gap-2 btn-secondary text-sm px-4 py-2">
                    <User className="w-4 h-4" />
                    <span>{user?.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-900 rounded-xl shadow-lg border border-dark-200 dark:border-dark-700 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="btn-ghost text-sm px-4 py-2">Sign In</Link>
                <Link href="/register" className="btn-primary text-sm px-4 py-2">Get Started</Link>
              </div>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          <button
            className="lg:hidden p-2 rounded-xl text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800"
            onClick={() => setMobileOpen((s) => !s)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden py-4 space-y-2 border-t border-dark-200 dark:border-dark-700">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  pathname === l.href
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                    : 'text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-4 space-y-2">
              <Link
                href="/order"
                onClick={() => setMobileOpen(false)}
                className="btn-primary w-full justify-center"
              >
                <ShoppingBag className="w-4 h-4" />
                Order Now
              </Link>
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="btn-secondary w-full justify-center"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button onClick={handleLogout} className="btn-danger w-full justify-center">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-secondary w-full justify-center">
                    Sign In
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-primary w-full justify-center">
                    Get Started
                  </Link>
                </>
              )}
              <button
                onClick={toggleTheme}
                className="w-full btn-ghost justify-center"
                aria-label="Toggle theme"
              >
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {dark ? 'Light mode' : 'Dark mode'}
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}