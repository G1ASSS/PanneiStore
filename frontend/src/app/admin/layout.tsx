'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import './admin.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = (session as any)?.role;

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.replace('/auth/login?callbackUrl=/admin');
    } else if (status === 'authenticated' && role && role !== 'ADMIN') {
      router.replace('/');
    }
  }, [status, role, router]);

  if (status === 'loading') {
    return <div className="admin-loading">Loading admin panel…</div>;
  }

  if (status === 'unauthenticated') {
    return <div className="admin-loading">Redirecting to sign in…</div>;
  }

  if (role && role !== 'ADMIN') {
    return (
      <div className="admin-root" style={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="admin-card" style={{ maxWidth: 480, textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Admin access required</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.6 }}>
            Your account does not have admin permissions. Please contact the administrator.
          </p>
        </div>
      </div>
    );
  }

  const userName = session?.user?.name ?? undefined;

  return <AdminShell userName={userName}>{children}</AdminShell>;
}
