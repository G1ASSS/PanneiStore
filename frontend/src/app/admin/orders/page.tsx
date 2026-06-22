'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { adminFetch } from '@/lib/adminApi';

interface PendingPayment {
  id: string;
  order: {
    id: string;
    orderNumber: string;
    type: string;
    finalPrice: number | string;
    status: string;
    buyer: { name: string };
  };
}

export default function AdminOrdersPage() {
  const { data: session } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken ?? '';
  const [pending, setPending] = useState<PendingPayment[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    if (!token) return;
    try {
      const res = await adminFetch<{ pendingPayments: PendingPayment[] }>(
        '/admin/analytics',
        { token }
      );
      setPending(res.data.pendingPayments ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const verify = async (orderId: string, isApproved: boolean) => {
    setSuccess('');
    try {
      await adminFetch(`/admin/orders/${orderId}/verify`, {
        token,
        method: 'POST',
        body: JSON.stringify({
          isApproved,
          rejectionReason: isApproved ? undefined : 'Payment proof rejected by admin',
        }),
      });
      setSuccess(isApproved ? 'Payment approved' : 'Payment rejected');
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const completeDiamond = async (orderId: string) => {
    setSuccess('');
    try {
      await adminFetch(`/admin/orders/${orderId}/complete-diamond`, {
        token,
        method: 'POST',
        body: JSON.stringify({}),
      });
      setSuccess('Diamond order marked complete');
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h2>Orders</h2>
          <p>Review pending payment proofs</p>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}
      {success && <div className="admin-success">{success}</div>}

      <div className="admin-card">
        {pending.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No pending payment reviews</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Type</th>
                  <th>Buyer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.order.orderNumber}</td>
                    <td>{payment.order.type}</td>
                    <td>{payment.order.buyer.name}</td>
                    <td>MMK {Number(payment.order.finalPrice).toLocaleString()}</td>
                    <td>{payment.order.status}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="btn-sm"
                          onClick={() => verify(payment.order.id, true)}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn-sm btn-danger"
                          onClick={() => verify(payment.order.id, false)}
                        >
                          Reject
                        </button>
                        {payment.order.type === 'DIAMOND' && (
                          <button
                            type="button"
                            className="btn-sm"
                            onClick={() => completeDiamond(payment.order.id)}
                          >
                            Complete
                          </button>
                        )}
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
