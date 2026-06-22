'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const ORDER_STATUSES: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending Payment', color: '#F59E0B' },
  PAYMENT_SUBMITTED: { label: 'Payment Submitted', color: '#3B82F6' },
  PAYMENT_VERIFIED: { label: 'Verified', color: '#10B981' },
  COMPLETED: { label: 'Completed', color: '#10B981' },
  CANCELLED: { label: 'Cancelled', color: '#EF4444' },
};

export default function SellerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [seller, setSeller] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'listings'>('orders');
  const token = (session as any)?.accessToken;

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/auth/login'); return; }
    if (status === 'authenticated') fetchData();
  }, [status]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sellerRes, analyticsRes, ordersRes, accountsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/sellers/me`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/sellers/analytics`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/seller?limit=10`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts?limit=6`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [sellerData, analyticsData, ordersData, accountsData] = await Promise.all([
        sellerRes.json(), analyticsRes.json(), ordersRes.json(), accountsRes.json(),
      ]);
      if (sellerData.success) setSeller(sellerData.data);
      if (analyticsData.success) setAnalytics(analyticsData.data);
      if (ordersData.success) setOrders(ordersData.data.orders || []);
      if (accountsData.success) setAccounts(accountsData.data.accounts || []);
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (id: string) => {
    if (!confirm('Delete this listing?')) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  };

  if (loading) return <div className="page-loading" />;

  if (!seller) {
    return (
      <div className="seller-register-page">
        <div className="seller-register-card">
          <div className="seller-register-icon">🏪</div>
          <h1>Become a Seller</h1>
          <p>Start selling Mobile Legends accounts to thousands of buyers in Myanmar.</p>
          <Link href="/seller/register" className="btn-primary">Apply as Seller</Link>
        </div>
      </div>
    );
  }

  if (!seller.isApproved) {
    return (
      <div className="seller-pending-page">
        <div className="pending-card">
          <div className="pending-icon">⏳</div>
          <h1>Application Under Review</h1>
          <p>Your seller application is being reviewed by our admin team. We'll notify you once approved.</p>
          <Link href="/" className="btn-ghost">Back to Home</Link>
        </div>
      </div>
    );
  }

  const stats = analytics?.stats;

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div className="seller-header-info">
          <div className="seller-avatar-lg">
            {seller.avatar ? (
              <Image src={seller.avatar} alt={seller.shopName} fill style={{ objectFit: 'cover' }} />
            ) : (
              <span>{seller.shopName[0]}</span>
            )}
          </div>
          <div>
            <h1 className="dashboard-title">{seller.shopName}</h1>
            <p className="dashboard-subtitle">
              {'★'.repeat(Math.round(seller.rating || 0))} {seller.rating?.toFixed(1) || '0.0'} · {seller.reviewCount || 0} reviews
            </p>
          </div>
        </div>
        <div className="header-actions">
          <Link href="/seller/listings/new" className="btn-primary">+ New Listing</Link>
          <Link href={`/sellers/${seller.id}`} className="btn-secondary">View Shop</Link>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="stats-grid">
          {[
            { label: 'Active Listings', value: stats.activeListings, icon: '📋', color: 'pink' },
            { label: 'Sold Accounts', value: stats.soldListings, icon: '✅', color: 'green' },
            { label: 'Revenue', value: `MMK ${Number(stats.totalRevenue || 0).toLocaleString()}`, icon: '💰', color: 'purple' },
            { label: 'Rating', value: `${stats.rating?.toFixed(1) || '0.0'} ★`, icon: '⭐', color: 'amber' },
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

      {/* Sales Chart */}
      {analytics?.salesChart && (
        <div className="dashboard-section">
          <h2>Revenue (Last 6 Months)</h2>
          <div className="mini-chart">
            {analytics.salesChart.map((d: any, i: number) => {
              const maxSales = Math.max(...analytics.salesChart.map((x: any) => x.sales), 1);
              const height = Math.max((d.sales / maxSales) * 100, 4);
              return (
                <div key={i} className="chart-bar-col">
                  <span className="chart-bar-value">
                    {d.sales > 0 ? `${(d.sales / 1000).toFixed(0)}K` : ''}
                  </span>
                  <div className="chart-bar" style={{ height: `${height}%` }} />
                  <span className="chart-bar-label">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="dashboard-section">
        <div className="section-tab-header">
          <button className={`section-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            Recent Orders
          </button>
          <button className={`section-tab ${activeTab === 'listings' ? 'active' : ''}`} onClick={() => setActiveTab('listings')}>
            My Listings
          </button>
        </div>

        {activeTab === 'orders' && (
          <div className="orders-list">
            {orders.length === 0 ? (
              <div className="empty-orders"><span>📦</span><p>No orders yet</p></div>
            ) : orders.map((order) => {
              const statusInfo = ORDER_STATUSES[order.status] || { label: order.status, color: '#888' };
              const firstItem = order.items?.[0];
              const itemName = firstItem?.account?.title || 'Account';
              return (
                <Link key={order.id} href={`/seller/orders/${order.id}`} className="order-row">
                  <div className="order-row-info">
                    <span className="order-row-title">{itemName}</span>
                    <span className="order-row-number">#{order.orderNumber}</span>
                    <span className="order-row-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="order-row-buyer">
                    {order.buyer?.name}
                  </div>
                  <span className="status-badge" style={{ background: `${statusInfo.color}22`, color: statusInfo.color }}>
                    {statusInfo.label}
                  </span>
                  <span className="order-row-price">MMK {Number(order.finalPrice).toLocaleString()}</span>
                  <span className="order-row-arrow">→</span>
                </Link>
              );
            })}
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="listings-grid">
            {accounts.length === 0 ? (
              <div className="empty-orders">
                <span>📋</span>
                <p>No listings yet</p>
                <Link href="/seller/listings/new" className="btn-primary">Create First Listing</Link>
              </div>
            ) : accounts.map((account) => (
              <div key={account.id} className="listing-card">
                <div className="listing-card-image">
                  {account.images?.[0] && (
                    <Image src={account.images[0].url} alt={account.title} fill style={{ objectFit: 'cover' }} />
                  )}
                  <span className={`listing-status-dot ${account.status.toLowerCase()}`} />
                </div>
                <div className="listing-card-info">
                  <h4>{account.title}</h4>
                  <p>{account.rank} · {account.status}</p>
                  <p className="listing-price">MMK {Number(account.price).toLocaleString()}</p>
                </div>
                <div className="listing-card-actions">
                  <Link href={`/seller/listings/${account.id}/edit`} className="btn-sm">Edit</Link>
                  <button className="btn-sm btn-danger" onClick={() => deleteAccount(account.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
