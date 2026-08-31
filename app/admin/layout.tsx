import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { AdminShell } from '@/components/admin/AdminShell';

export const metadata = { title: 'Admin Dashboard' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/admin/dashboard');
  if (user.role !== 'ADMIN') redirect('/');

  // AdminShell uses client-side useAuth for reactivity, so just render it
  return <AdminShell>{children}</AdminShell>;
}