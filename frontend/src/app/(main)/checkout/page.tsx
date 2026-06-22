'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

const PAYMENT_METHODS = [
  { id: 'KBZ_PAY', name: 'KBZ Pay', icon: '🏦', accountNo: '09-123-456-789', accountName: 'PanneiStore MM' },
  { id: 'WAVE_MONEY', name: 'Wave Money', icon: '🌊', accountNo: '09-987-654-321', accountName: 'PanneiStore MM' },
  { id: 'AYA_PAY', name: 'AYA Pay', icon: '💳', accountNo: '100-200-300', accountName: 'PanneiStore Co.' },
  { id: 'UAB_PAY', name: 'UAB Pay', icon: '🏧', accountNo: '200-300-400', accountName: 'PanneiStore Co.' },
  { id: 'MANUAL', name: 'Bank Transfer', icon: '📱', accountNo: 'AYA Bank — 1234567890', accountName: 'PanneiStore Co., Ltd.' },
];

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const accountId = searchParams.get('accountId');
  const diamondPackageId = searchParams.get('packageId');
  const type = searchParams.get('type') || (accountId ? 'ACCOUNT' : 'DIAMOND');

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('KBZ_PAY');
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);
  const [mlUserId, setMlUserId] = useState('');
  const [mlServerId, setMlServerId] = useState('');
  const [notes, setNotes] = useState('');
  const [agreed, setAgreed] = useState(false);

  const token = (session as any)?.accessToken;

  useEffect(() => {
    if (!session) { router.push('/auth/login'); return; }
    const url = accountId
      ? `${process.env.NEXT_PUBLIC_API_URL}/accounts/${accountId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/diamonds/packages/${diamondPackageId}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => { if (data.success) setItem(data.data); })
      .finally(() => setLoading(false));
  }, [accountId, diamondPackageId, session]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: couponCode, orderAmount: price }),
      });
      const data = await res.json();
      if (data.success) setCoupon(data.data);
      else setCouponError(data.message);
    } finally {
      setCouponLoading(false);
    }
  };

  const placeOrder = async () => {
    if (!agreed) return;
    setOrderLoading(true);
    try {
      const body: any = {
        type,
        paymentGateway: paymentMethod,
        notes,
        ...(coupon ? { couponCode: coupon.code } : {}),
      };
      if (type === 'ACCOUNT') body.accountId = accountId;
      if (type === 'DIAMOND') { body.diamondPackageId = diamondPackageId; body.mlUserId = mlUserId; body.mlServerId = mlServerId; }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) router.push(`/buyer/orders/${data.data.order.id}?new=true`);
    } finally {
      setOrderLoading(false);
    }
  };

  const price = item ? (type === 'ACCOUNT' ? Number(item.price) : Number(item.price)) : 0;
  const discount = coupon ? coupon.discountAmount : 0;
  const finalPrice = Math.max(0, price - discount);
  const selectedPayment = PAYMENT_METHODS.find((m) => m.id === paymentMethod)!;

  if (loading) return <div className="page-loading" />;

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <button className="back-btn" onClick={() => router.back()}>← Back</button>
        <h1>Checkout</h1>
      </div>

      <div className="checkout-grid">
        {/* Left Column */}
        <div className="checkout-left">
          {/* Item Summary */}
          <div className="checkout-card">
            <h2 className="checkout-section-title">Order Item</h2>
            {item && (
              <div className="checkout-item">
                {type === 'ACCOUNT' && item.images?.[0] && (
                  <div className="checkout-item-image">
                    <Image src={item.images[0].url} alt={item.title} fill style={{ objectFit: 'cover' }} />
                  </div>
                )}
                <div className="checkout-item-info">
                  <h3>{type === 'ACCOUNT' ? item.title : `${item.amount.toLocaleString()} 💎 Diamonds`}</h3>
                  {type === 'ACCOUNT' && <p>{item.rank} • {item.server}</p>}
                  {type === 'DIAMOND' && item.bonusDiamonds > 0 && <p>+{item.bonusDiamonds} bonus diamonds</p>}
                  <span className="checkout-item-price">MMK {price.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Diamond Fields */}
          {type === 'DIAMOND' && (
            <div className="checkout-card">
              <h2 className="checkout-section-title">Player Information</h2>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">ML User ID</label>
                  <input className="form-input" value={mlUserId} onChange={(e) => setMlUserId(e.target.value)} placeholder="123456789" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Server ID</label>
                  <input className="form-input" value={mlServerId} onChange={(e) => setMlServerId(e.target.value)} placeholder="2501" required />
                </div>
              </div>
            </div>
          )}

          {/* Payment Methods */}
          <div className="checkout-card">
            <h2 className="checkout-section-title">Payment Method</h2>
            <div className="payment-grid">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  className={`checkout-payment-btn ${paymentMethod === m.id ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod(m.id)}
                >
                  <span className="method-icon">{m.icon}</span>
                  <span>{m.name}</span>
                </button>
              ))}
            </div>

            <div className="payment-instruction">
              <p className="payment-instr-title">Payment Details</p>
              <div className="payment-detail-row">
                <span>Account Number</span>
                <strong>{selectedPayment.accountNo}</strong>
              </div>
              <div className="payment-detail-row">
                <span>Account Name</span>
                <strong>{selectedPayment.accountName}</strong>
              </div>
              <p className="payment-instr-note">
                Send the exact amount and submit your payment proof in the next step.
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="checkout-card">
            <h2 className="checkout-section-title">Notes (Optional)</h2>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Any special instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="checkout-right">
          <div className="checkout-card order-summary-card">
            <h2 className="checkout-section-title">Order Summary</h2>

            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>MMK {price.toLocaleString()}</span>
              </div>

              {/* Coupon */}
              <div className="coupon-row">
                <input
                  className="form-input coupon-input"
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => { setCouponCode(e.target.value); setCoupon(null); setCouponError(''); }}
                />
                <button className="btn-coupon" onClick={applyCoupon} disabled={couponLoading}>
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </div>
              {couponError && <p className="coupon-error">{couponError}</p>}
              {coupon && (
                <div className="summary-row discount">
                  <span>Discount ({coupon.code})</span>
                  <span>- MMK {discount.toLocaleString()}</span>
                </div>
              )}

              <div className="summary-divider" />
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>MMK {finalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="agreement-row">
              <input
                type="checkbox"
                id="agree"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <label htmlFor="agree">
                I agree to the <a href="/terms">Terms of Service</a> and understand this purchase is final.
              </label>
            </div>

            <button
              className="btn-primary btn-full"
              onClick={placeOrder}
              disabled={orderLoading || !agreed || (type === 'DIAMOND' && (!mlUserId || !mlServerId))}
            >
              {orderLoading ? <span className="btn-spinner" /> : `Place Order — MMK ${finalPrice.toLocaleString()}`}
            </button>

            <div className="secure-badge">
              🔒 Secure Checkout · Payment Protected
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="page-loading" />}>
      <CheckoutContent />
    </Suspense>
  );
}
