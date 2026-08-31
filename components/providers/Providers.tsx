'use client';

import { useEffect, useState } from 'react';
import { AuthProvider } from './AuthProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Apply persisted theme before hydration mismatch warnings fire
    const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldDark = saved ? saved === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', shouldDark ?? false);
    setMounted(true);
  }, []);

  if (!mounted) return <>{children}</>;
  return <AuthProvider>{children}</AuthProvider>;
}