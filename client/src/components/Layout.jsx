import { Outlet, Link, useLocation } from 'react-router-dom'
import { Menu, X, Sun, Moon, ShoppingBag, User, LogOut, LayoutDashboard } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const { user, logout, isAuthenticated, isAdmin } = useAuth()
  const location = useLocation()

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = savedTheme ? savedTheme === 'dark' : prefersDark
    setDarkMode(shouldBeDark)
    document.documentElement.classList.toggle('dark', shouldBeDark)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', newDarkMode)
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-dark-950 transition-colors duration-300">
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/80 dark:bg-dark-950/80 backdrop-blur-xl shadow-sm' : 'bg-transparent'
        }`}
      >
        <nav className="container-custom" aria-label="Main navigation">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-dark-900 dark:text-white" aria-label="Org Portfolio Home">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">O</span>
              </div>
              <span className="hidden sm:block">Org Portfolio</span>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary-600 dark:hover:text-primary-400 ${
                    location.pathname === link.href
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-dark-600 dark:text-dark-300'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-4">
              <Link to="/order" className="btn-primary text-sm px-4 py-2">
                <ShoppingBag className="w-4 h-4" />
                <span>Order Now</span>
              </Link>

              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  {isAdmin && (
                    <Link to="/admin/dashboard" className="btn-secondary text-sm px-4 py-2">
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Admin</span>
                    </Link>
                  )}
                  <div className="relative group">
                    <button className="flex items-center gap-2 btn-secondary text-sm px-4 py-2">
                      <User className="w-4 h-4" />
                      <span>{user?.name}</span>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-900 rounded-xl shadow-lg border border-dark-200 dark:border-dark-700 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <Link to="/profile" className="block px-4 py-2 text-sm text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800">Profile</Link>
                      <Link to="/orders" className="block px-4 py-2 text-sm text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800">My Orders</Link>
                      <hr className="my-2 border-dark-200 dark:border-dark-700" />
                      <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Logout</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="btn-ghost text-sm px-4 py-2">Sign In</Link>
                  <Link to="/register" className="btn-primary text-sm px-4 py-2">Get Started</Link>
                </div>
              )}

              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            <button
              className="lg:hidden p-2 rounded-xl text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          <div
            id="mobile-menu"
            className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
          >
            <div className="py-4 space-y-2 border-t border-dark-200 dark:border-dark-700">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    location.pathname === link.href
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                      : 'text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 space-y-2">
                <Link to="/order" className="btn-primary w-full justify-center" onClick={() => setMobileMenuOpen(false)}>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Order Now</span>
                </Link>
                {isAuthenticated ? (
                  <div className="space-y-2">
                    {isAdmin && (
                      <Link to="/admin/dashboard" className="btn-secondary w-full justify-center" onClick={() => setMobileMenuOpen(false)}>
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    <button onClick={logout} className="btn-danger w-full justify-center">
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link to="/login" className="btn-secondary w-full justify-center" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                    <Link to="/register" className="btn-primary w-full justify-center" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1 pt-16 lg:pt-20">
        <Outlet />
      </main>

      <footer className="border-t border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-950">
        <div className="container-custom py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2 text-xl font-bold text-dark-900 dark:text-white mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">O</span>
                </div>
                <span>Org Portfolio</span>
              </Link>
              <p className="text-dark-600 dark:text-dark-400 max-w-md">
                Creating immersive 3D digital experiences that elevate your brand and engage your audience.
              </p>
              <div className="mt-6 flex gap-4">
                <a href="#" className="w-10 h-10 rounded-xl bg-dark-100 dark:bg-dark-800 flex items-center justify-center text-dark-600 dark:text-dark-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" aria-label="Twitter">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-dark-100 dark:bg-dark-800 flex items-center justify-center text-dark-600 dark:text-dark-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" aria-label="GitHub">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-dark-100 dark:bg-dark-800 flex items-center justify-center text-dark-600 dark:text-dark-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" aria-label="LinkedIn">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-dark-100 dark:bg-dark-800 flex items-center justify-center text-dark-600 dark:text-dark-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" aria-label="Dribbble">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.827 1.92-2.165 3.483-3.898 4.464-1.734.984-3.597 1.473-5.521 1.473-3.389 0-6.256-1.141-8.574-3.423C.147 17.498 0 14.59 0 12s.147-5.498.444-8.143A11.89 11.89 0 015.541.69c1.924-.49 3.787-.232 5.521.723 1.734.954 3.194 2.612 3.898 4.53.704 1.92-1.09 3.462-2.944 3.752-1.09.173-2.18.26-3.27.26s-2.18-.087-3.27-.26c-1.854-.29-3.648-1.832-2.944-3.752.704-1.918 2.164-3.576 3.898-4.53 1.734-.955 3.597-.743 5.521-.26 3.47 1.065 6.208 3.832 6.885 7.412.046.226.069.452.069.678 0 3.094-1.683 5.835-4.328 7.32zm-4.04-10.812c.854-1.749 2.226-3.245 3.898-4.324 1.957-1.243 4.135-1.828 6.236-1.828 3.39 0 6.257 1.14 8.575 3.423.207.205.389.435.548.688-.069.138-.161.276-.276.414-1.034 1.516-2.757 2.757-4.756 3.446-1.998.689-4.134 1.033-6.348 1.033-2.213 0-4.351-.345-6.349-1.033-1.999-.689-3.722-1.93-4.756-3.446-.069-.138-.161-.276-.276-.414.138-.253.32-.483.517-.689 2.317-2.282 5.184-3.422 8.574-3.422 2.101 0 4.279.586 6.236 1.828 1.672 1.079 3.044 2.575 3.898 4.324.759 1.55-.966 3.102-2.62 3.379-1.724.276-3.517.138-5.309-.138-1.862-.276-3.655-.62-5.309-.138-1.655.276-3.379 1.828-2.621 3.379z"/></svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-dark-900 dark:text-white mb-4">Company</h4>
              <ul className="space-y-2 text-dark-600 dark:text-dark-400 text-sm">
                <li><Link to="/about" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">About Us</Link></li>
                <li><Link to="/portfolio" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Portfolio</Link></li>
                <li><Link to="/contact" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-dark-900 dark:text-white mb-4">Services</h4>
              <ul className="space-y-2 text-dark-600 dark:text-dark-400 text-sm">
                <li><Link href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">3D Web Design</Link></li>
                <li><Link href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Interactive Experiences</Link></li>
                <li><Link href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">WebGL Development</Link></li>
                <li><Link href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Brand Identity</Link></li>
                <li><Link href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Digital Strategy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-dark-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-dark-600 dark:text-dark-400 text-sm">
                <li><Link href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Cookie Policy</Link></li>
                <li><Link href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">License</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-dark-200 dark:border-dark-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-dark-500 dark:text-dark-500">
              © {new Date().getFullYear()} Org Portfolio. All rights reserved.
            </p>
            <p className="text-sm text-dark-500 dark:text-dark-500">
              Built with React, Three.js & ❤️
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}