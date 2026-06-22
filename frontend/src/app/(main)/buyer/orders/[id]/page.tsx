'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

const STATUS_FLOW = ['PENDING', 'PAYMENT_SUBMITTED', 'PAYMENT_VERIFIED', 'PROCESSING', 'COMPLETED'];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [txId, setTxId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const isNew = searchParams.get('new') === 'true';
  const token = (session as any)?.accessToken;

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setOrder(data.data);
    } finally {
      setLoading(false);
    }
  };

  const submitProof = async () => {
    if (!proofFile) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('proof', proofFile);
      if (txId) formData.append('transactionId', txId);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${params.id}/payment-proof`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
        setProofFile(null);
        setTxId('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const cancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${params.id}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) fetchOrder();
  };

  if (loading) return <div className="page-loading" />;
  if (!order) return <div className="not-found-page"><h2>Order not found</h2></div>;

  const statusIndex = STATUS_FLOW.indexOf(order.status);
  const firstItem = order.items?.[0];
  const isAccount = order.type === 'ACCOUNT';
  const canSubmitProof = order.status === 'PENDING';
  const canCancel = order.status === 'PENDING';
  const paymentMethod = PAYMENT_METHODS[order.paymentMethod as string] || PAYMENT_METHODS['MANUAL'];

  return (
    <div className="order-detail-page">
      <button className="back-btn" onClick={() => router.push('/buyer/dashboard')}>← My Orders</button>

      {isNew && (
        <div className="order-success-banner">
          🎉 Order placed successfully! Please complete payment below.
        </div>
      )}

      <div className="order-detail-grid">
        {/* Order Status Timeline */}
        <div className="order-card">
          <h2 className="card-title">Order Status</h2>
          <div className="status-timeline">
            {STATUS_FLOW.map((step, i) => (
              <div key={step} className={`timeline-step ${i <= statusIndex ? 'done' : ''} ${order.status === 'CANCELLED' ? 'cancelled' : ''}`}>
                <div className="timeline-dot">
                  {i < statusIndex ? '✓' : i === statusIndex ? '●' : '○'}
                </div>
                <div className="timeline-label">
                  {step.replace(/_/g, ' ')}
                </div>
                {i < STATUS_FLOW.length - 1 && <div className="timeline-line" />}
              </div>
            ))}
            {order.status === 'CANCELLED' && (
              <div className="timeline-step cancelled">
                <div className="timeline-dot">✕</div>
                <div className="timeline-label">Cancelled</div>
              </div>
            )}
          </div>

          <div className="order-meta">
            <div className="order-meta-row">
              <span>Order #</span>
              <strong>{order.orderNumber}</strong>
            </div>
            <div className="order-meta-row">
              <span>Type</span>
              <strong>{order.type}</strong>
            </div>
            <div className="order-meta-row">
              <span>Date</span>
              <strong>{new Date(order.createdAt).toLocaleString()}</strong>
            </div>
            <div className="order-meta-row">
              <span>Total</span>
              <strong>MMK {Number(order.finalPrice).toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* Item Details */}
        <div className="order-card">
          <h2 className="card-title">Item Details</h2>
          {firstItem && (
            <div className="order-item-detail">
              {isAccount && firstItem.account?.images?.[0] && (
                <div className="order-item-img">
                  <Image src={firstItem.account.images[0].url} alt={firstItem.account.title} fill style={{ objectFit: 'cover' }} />
                </div>
              )}
              <div>
                <h3>{isAccount ? firstItem.account?.title : `${firstItem.diamondPackage?.amount?.toLocaleString()} 💎 Diamonds`}</h3>
                {isAccount && <p>{firstItem.account?.rank} • {firstItem.account?.server}</p>}
                {!isAccount && order.mlUserId && (
                  <p>User ID: {order.mlUserId} | Server: {order.mlServerId}</p>
                )}
                <p className="item-price">MMK {Number(firstItem.subtotal).toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>

        {/* Payment Proof Submission */}
        {canSubmitProof && (
          <div className="order-card highlight-card">
            <h2 className="card-title">⚡ Submit Payment Proof</h2>

            <div className="payment-instructions">
              <p><strong>Payment Method:</strong> {order.paymentMethod?.replace(/_/g, ' ')}</p>
              <div className="payment-detail-box">
                <p>Account No: <strong>{PAYMENT_METHODS[order.paymentMethod]?.accountNo || 'Contact support'}</strong></p>
                <p>Account Name: <strong>{PAYMENT_METHODS[order.paymentMethod]?.accountName || 'PanneiStore'}</strong></p>
                <p>Amount: <strong>MMK {Number(order.finalPrice).toLocaleString()}</strong></p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Transaction ID (Optional)</label>
              <input className="form-input" placeholder="Your transfer reference ID" value={txId} onChange={(e) => setTxId(e.target.value)} />
            </div>

            <div className="proof-upload" onClick={() => fileRef.current?.click()}>
              {proofFile ? (
                <div className="proof-preview">
                  <Image src={URL.createObjectURL(proofFile)} alt="proof" fill style={{ objectFit: 'contain' }} />
                </div>
              ) : (
                <>
                  <span className="upload-icon">📸</span>
                  <p>Click to upload payment screenshot</p>
                  <p className="upload-hint">JPG, PNG up to 10MB</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => setProofFile(e.target.files?.[0] || null)} />

            <button className="btn-primary btn-full" onClick={submitProof} disabled={submitting || !proofFile}>
              {submitting ? <span className="btn-spinner" /> : 'Submit Payment Proof'}
            </button>
          </div>
        )}

        {/* Submitted Proof */}
        {order.paymentProof && (
          <div className="order-card">
            <h2 className="card-title">Payment Proof</h2>
            <div className="proof-image">
              <Image src={order.paymentProof} alt="Payment proof" fill style={{ objectFit: 'contain' }} />
            </div>
            <p className="proof-status">
              Status: <strong>{order.payment?.status}</strong>
            </p>
          </div>
        )}

        {/* Cancel */}
        {canCancel && (
          <div className="order-card">
            <button className="btn-cancel" onClick={cancelOrder}>Cancel Order</button>
          </div>
        )}
      </div>
    </div>
  );
}

const PAYMENT_METHODS: Record<string, { accountNo: string; accountName: string }> = {
  KBZ_PAY: { accountNo: '09-123-456-789', accountName: 'PanneiStore MM' },
  WAVE_MONEY: { accountNo: '09-987-654-321', accountName: 'PanneiStore MM' },
  AYA_PAY: { accountNo: '100-200-300', accountName: 'PanneiStore Co.' },
  UAB_PAY: { accountNo: '200-300-400', accountName: 'PanneiStore Co.' },
  MANUAL: { accountNo: 'AYA Bank — 1234567890', accountName: 'PanneiStore Co., Ltd.' },
};
