'use client';

import { useSession } from 'next-auth/react';
import { notFound } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import './admin.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const role = (session as any)?.role;

  if (status === 'loading') {
    return null; // Or a brief loading spinner
  }

  if (status === 'unauthenticated' || (status === 'authenticated' && role !== 'ADMIN')) {
    notFound();
  }

  const userName = session?.user?.name ?? undefined;

  return <AdminShell userName={userName}>{children}</AdminShell>;
}
