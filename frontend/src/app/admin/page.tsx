'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { adminFetch } from '@/lib/adminApi';
import { hasDevAdminSession, isDevAdminEnabled } from '@/lib/devAdmin';
import { getLocalListings } from '@/lib/localListings';

interface Analytics {
  stats: {
    totalUsers: number;
    totalSellers: number;
    pendingSellers: number;
    totalCompletedOrders: number;
    totalRevenue: number | string;
    accountSalesCount: number;
    diamondSalesCount: number;
  };
  pendingPayments: {
    id: string;
    order: {
      id: string;
      orderNumber: string;
      finalPrice: number | string;
      buyer: { name: string };
    };
  }[];
}

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken ?? '';
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    adminFetch<Analytics>('/admin/analytics', { token })
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message));
  }, [token]);

  const stats = data?.stats;

  const useLocal = isDevAdminEnabled() && hasDevAdminSession();

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Overview of your store activity</p>
        </div>
        <Link href="/admin/accounts/new" className="btn-primary">
          + New Listing
        </Link>
      </div>

      {useLocal && (
        <div className="admin-success" style={{ marginBottom: '1rem' }}>
          Running in local mode (no database). Listings are saved in your browser —{' '}
          {getLocalListings().length} listing(s) so far.
        </div>
      )}

      {error && <div className="admin-error">{error}</div>}

      {stats && (
        <div className="stats-grid">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'pink' },
            { label: 'Approved Sellers', value: stats.totalSellers, icon: '🏪', color: 'purple' },
            { label: 'Pending Sellers', value: stats.pendingSellers, icon: '⏳', color: 'amber' },
            { label: 'Completed Orders', value: stats.totalCompletedOrders, icon: '✅', color: 'green' },
            {
              label: 'Total Revenue',
              value: `MMK ${Number(stats.totalRevenue).toLocaleString()}`,
              icon: '💰',
              color: 'green',
            },
            { label: 'Account Sales', value: stats.accountSalesCount, icon: '🎮', color: 'pink' },
            { label: 'Diamond Sales', value: stats.diamondSalesCount, icon: '💎', color: 'purple' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className={`stat-card stat-${color}`}>
              <span className="stat-card-icon">{icon}</span>
              <div>
                <p className="stat-card-value">{value}</p>
                <p className="stat-card-label">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="admin-card">
        <div className="section-header">
          <h2>Pending Payment Reviews</h2>
          <Link href="/admin/orders" className="btn-sm">
            View all
          </Link>
        </div>
        {!data?.pendingPayments?.length ? (
          <p className="text-sm text-[var(--text-muted)]">No pending payments</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Buyer</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.pendingPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.order.orderNumber}</td>
                    <td>{payment.order.buyer.name}</td>
                    <td>MMK {Number(payment.order.finalPrice).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
