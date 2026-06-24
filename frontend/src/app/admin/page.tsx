'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { adminFetch } from '@/lib/adminApi';
import { hasDevAdminSession, isDevAdminEnabled } from '@/lib/devAdmin';
import { Users, Store, Clock, CheckCircle2, Banknote, Gamepad2, Gem } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

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
  salesData: { date: string; sales: number }[];
  usersData: { date: string; active: number }[];
  heroData: { name: string; value: number }[];
}

const COLORS = ['#ec4899', '#a855f7', '#3b82f6', '#10b981', '#f59e0b'];

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

  return (
    <div className="flex flex-col gap-8">
      <div className="admin-page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Overview of your store activity</p>
        </div>
        <Link href="/admin/accounts/new" className="btn-primary">
          + New Listing
        </Link>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {stats && (
        <div className="stats-grid">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'pink' },
            { label: 'Approved Sellers', value: stats.totalSellers, icon: Store, color: 'purple' },
            { label: 'Pending Sellers', value: stats.pendingSellers, icon: Clock, color: 'amber' },
            { label: 'Completed Orders', value: stats.totalCompletedOrders, icon: CheckCircle2, color: 'green' },
            {
              label: 'Total Revenue',
              value: `MMK ${Number(stats.totalRevenue).toLocaleString()}`,
              icon: Banknote,
              color: 'green',
            },
            { label: 'Account Sales', value: stats.accountSalesCount, icon: Gamepad2, color: 'pink' },
            { label: 'Diamond Sales', value: stats.diamondSalesCount, icon: Gem, color: 'purple' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`stat-card stat-${color}`}>
              <div className="stat-card-icon-wrap w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-[var(--color)] shadow-[0_0_15px_var(--glow)]">
                <Icon size={20} strokeWidth={2} />
              </div>
              <div className="mt-3">
                <p className="stat-card-value text-2xl font-bold">{value}</p>
                <p className="stat-card-label text-sm text-[var(--text-muted)] mt-1">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── CHARTS SECTION ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {/* Sales Over Time */}
        <div className="admin-card">
          <div className="section-header mb-6">
            <h2>Sales Over Time (Last 7 Days)</h2>
          </div>
          <div className="h-[300px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.salesData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#888888" tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#888888"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `MMK ${value / 1000}k`}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#13111c', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Active Users */}
        <div className="admin-card">
          <div className="section-header mb-6">
            <h2>Daily Active Users</h2>
          </div>
          <div className="h-[300px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.usersData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#888888" tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <RechartsTooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#13111c', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="active" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Pending Payments Table */}
        <div className="admin-card">
          <div className="section-header">
            <h2>Pending Payment Reviews</h2>
            <Link href="/admin/orders" className="btn-sm">
              View all
            </Link>
          </div>
          {!data?.pendingPayments?.length ? (
            <p className="text-sm text-[var(--text-muted)] mt-4">No pending payments</p>
          ) : (
            <div className="admin-table-wrap mt-4">
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
      </div>
    </div>
  );
}
