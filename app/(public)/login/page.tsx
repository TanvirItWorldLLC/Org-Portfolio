'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const redirect = search.get('redirect') || '/';
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      router.push(user.role === 'admin' ? '/admin/dashboard' : redirect);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <span className="text-white font-bold">O</span>
            </div>
            <span className="text-xl font-bold text-dark-900 dark:text-white">Org Portfolio</span>
          </Link>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">Welcome back</h1>
          <p className="text-dark-600 dark:text-dark-400">Sign in to your account</p>
        </div>

        <div className="card">
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-12" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input pl-12" placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in...</> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-dark-600 dark:text-dark-400">
            Don&apos;t have an account? <Link href="/register" className="text-primary-600 dark:text-primary-400 hover:underline">Sign up</Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-dark-500">
          Default admin: <code className="bg-dark-100 dark:bg-dark-800 px-2 py-1 rounded">admin@orgportfolio.com</code> / <code className="bg-dark-100 dark:bg-dark-800 px-2 py-1 rounded">admin123</code>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={null}><LoginInner /></Suspense>;
}