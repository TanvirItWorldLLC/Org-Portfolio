import Link from 'next/link';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-950">
      <div className="container-custom py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-dark-900 dark:text-white mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">O</span>
              </div>
              <span>Org Portfolio</span>
            </Link>
            <p className="text-dark-600 dark:text-dark-400 max-w-md">
              Creating immersive 3D digital experiences that elevate your brand and engage your audience.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-dark-900 dark:text-white mb-4">Company</h4>
            <ul className="space-y-2 text-dark-600 dark:text-dark-400 text-sm">
              <li><Link href="/about" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">About Us</Link></li>
              <li><Link href="/portfolio" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Portfolio</Link></li>
              <li><Link href="/contact" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Contact</Link></li>
              <li><Link href="/order" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Order Now</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-dark-900 dark:text-white mb-4">Account</h4>
            <ul className="space-y-2 text-dark-600 dark:text-dark-400 text-sm">
              <li><Link href="/login" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Register</Link></li>
              <li><Link href="/admin/dashboard" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Admin</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-dark-200 dark:border-dark-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-dark-500 dark:text-dark-500">
            © {year} Org Portfolio. All rights reserved.
          </p>
          <p className="text-sm text-dark-500 dark:text-dark-500">
            Built with Next.js, Three.js & ❤️
          </p>
        </div>
      </div>
    </footer>
  );
}