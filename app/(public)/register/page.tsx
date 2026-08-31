'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) return toast.error('Passwords do not match');
    if (password.length < 8) return toast.error('Password must be at least 8 characters');

    setSubmitting(true);
    try {
      await register(name, email, password);
      toast.success('Account created!');
      router.push('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
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
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">Create your account</h1>
          <p className="text-dark-600 dark:text-dark-400">Join us and start your 3D journey</p>
        </div>

        <div className="card">
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="label">Full name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input required value={name} onChange={(e) => setName(e.target.value)} className="input pl-12" placeholder="Jane Doe" />
              </div>
            </div>
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
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input pl-12" placeholder="At least 8 characters" />
              </div>
            </div>
            <div>
              <label className="label">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input pl-12" placeholder="Repeat password" />
              </div>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-dark-600 dark:text-dark-400">
            Already have an account? <Link href="/login" className="text-primary-600 dark:text-primary-400 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}