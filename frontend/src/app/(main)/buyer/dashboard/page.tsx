'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const ORDER_STATUSES: Record<string, { label: string; color: string; icon: string }> = {
  PENDING: { label: 'Pending Payment', color: '#F59E0B', icon: '⏳' },
  PAYMENT_SUBMITTED: { label: 'Payment Submitted', color: '#3B82F6', icon: '📤' },
  PAYMENT_VERIFIED: { label: 'Payment Verified', color: '#10B981', icon: '✅' },
  PROCESSING: { label: 'Processing', color: '#8B5CF6', icon: '⚙️' },
  COMPLETED: { label: 'Completed', color: '#10B981', icon: '🎉' },
  CANCELLED: { label: 'Cancelled', color: '#EF4444', icon: '❌' },
};

export default function BuyerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  const token = (session as any)?.accessToken;

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/auth/login'); return; }
    if (status === 'authenticated') fetchData();
  }, [status]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, statsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/buyer`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const ordersData = await ordersRes.json();
      const statsData = await statsRes.json();
      if (ordersData.success) setOrders(ordersData.data.orders || []);
      if (statsData.success) setStats(statsData.data.stats);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = activeTab === 'ALL'
    ? orders
    : orders.filter((o) => o.status === activeTab);

  if (loading) return <div className="page-loading" />;

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">My Dashboard</h1>
          <p className="dashboard-subtitle">Manage your orders and wishlist</p>
        </div>
        <div className="header-actions">
          <Link href="/market" className="btn-primary">
            Browse Accounts
          </Link>
          <Link href="/topup" className="btn-secondary">
            💎 Top Up
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          {[
            { label: 'Total Orders', value: stats.totalOrders, icon: '📦', color: 'pink' },
            { label: 'Completed', value: stats.completedOrders, icon: '✅', color: 'green' },
            { label: 'Pending', value: stats.pendingPayments, icon: '⏳', color: 'amber' },
            { label: 'Total Spent', value: `MMK ${Number(stats.totalSpent || 0).toLocaleString()}`, icon: '💰', color: 'purple' },
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

      {/* Orders */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>My Orders</h2>
          <div className="order-status-tabs">
            {['ALL', 'PENDING', 'PAYMENT_SUBMITTED', 'COMPLETED', 'CANCELLED'].map((s) => (
              <button
                key={s}
                className={`status-tab ${activeTab === s ? 'active' : ''}`}
                onClick={() => setActiveTab(s)}
              >
                {s === 'ALL' ? 'All' : ORDER_STATUSES[s]?.label || s}
              </button>
            ))}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="empty-orders">
            <span className="empty-icon">📦</span>
            <h3>No orders found</h3>
            <p>Start shopping to see your orders here</p>
            <Link href="/market" className="btn-primary">Browse Market</Link>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => {
              const statusInfo = ORDER_STATUSES[order.status] || { label: order.status, color: '#888', icon: '?' };
              const firstItem = order.items?.[0];
              const itemImage = firstItem?.account?.images?.[0]?.url;
              const itemName = firstItem?.account?.title || `${firstItem?.diamondPackage?.amount} 💎 Diamonds`;

              return (
                <Link key={order.id} href={`/buyer/orders/${order.id}`} className="order-row">
                  <div className="order-row-image">
                    {itemImage ? (
                      <Image src={itemImage} alt={itemName} fill style={{ objectFit: 'cover' }} />
                    ) : (
                      <span className="order-row-placeholder">💎</span>
                    )}
                  </div>
                  <div className="order-row-info">
                    <span className="order-row-title">{itemName}</span>
                    <span className="order-row-number">#{order.orderNumber}</span>
                    <span className="order-row-date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="order-row-status">
                    <span
                      className="status-badge"
                      style={{ background: `${statusInfo.color}22`, color: statusInfo.color, border: `1px solid ${statusInfo.color}44` }}
                    >
                      {statusInfo.icon} {statusInfo.label}
                    </span>
                  </div>
                  <div className="order-row-price">
                    MMK {Number(order.finalPrice).toLocaleString()}
                  </div>
                  <span className="order-row-arrow">→</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
