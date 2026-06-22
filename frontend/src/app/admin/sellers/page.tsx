'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { adminFetch } from '@/lib/adminApi';

interface SellerRow {
  id: string;
  shopName: string;
  createdAt: string;
  user: { name: string; email: string; phone?: string };
}

export default function AdminSellersPage() {
  const { data: session } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken ?? '';
  const [sellers, setSellers] = useState<SellerRow[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    if (!token) return;
    try {
      const res = await adminFetch<SellerRow[]>('/admin/sellers/queue', { token });
      setSellers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sellers');
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const review = async (id: string, isApproved: boolean) => {
    setSuccess('');
    try {
      await adminFetch(`/admin/sellers/${id}/approve`, {
        token,
        method: 'PATCH',
        body: JSON.stringify({ isApproved }),
      });
      setSuccess(isApproved ? 'Seller approved' : 'Seller rejected');
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h2>Seller Applications</h2>
          <p>Review and approve pending seller requests</p>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}
      {success && <div className="admin-success">{success}</div>}

      <div className="admin-card">
        {sellers.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No pending seller applications</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Shop</th>
                  <th>Owner</th>
                  <th>Email</th>
                  <th>Applied</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((seller) => (
                  <tr key={seller.id}>
                    <td>{seller.shopName}</td>
                    <td>{seller.user.name}</td>
                    <td>{seller.user.email}</td>
                    <td>{new Date(seller.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="btn-sm"
                          onClick={() => review(seller.id, true)}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn-sm btn-danger"
                          onClick={() => review(seller.id, false)}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
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
