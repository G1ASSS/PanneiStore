'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

const STATUS_FLOW = ['PENDING', 'PAYMENT_SUBMITTED', 'PAYMENT_VERIFIED', 'PROCESSING', 'COMPLETED'];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { t } = useLanguage();
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
  if (!order) return <div className="not-found-page"><h2>{t("Order not found", "ဝယ်ယူမှု မတွေ့ပါ")}</h2></div>;

  const statusIndex = STATUS_FLOW.indexOf(order.status);
  const firstItem = order.items?.[0];
  const isAccount = order.type === 'ACCOUNT';
  const canSubmitProof = order.status === 'PENDING';
  const canCancel = order.status === 'PENDING';
  const paymentMethod = PAYMENT_METHODS[order.paymentMethod as string] || PAYMENT_METHODS['MANUAL'];

  return (
    <div className="order-detail-page">
      <button className="back-btn" onClick={() => router.push('/buyer/dashboard')}>{t("← My Orders", "← ဝယ်ယူမှုများ")}</button>

      {isNew && (
        <div className="order-success-banner">
          {t("🎉 Order placed successfully! Please complete payment below.", "🎉 ဝယ်ယူမှု အောင်မြင်ပါသည်။ ကျေးဇူးပြု၍ အောက်တွင် ငွေပေးချေမှုကို ပြီးစီးအောင် ဆောင်ရွက်ပါ။")}
        </div>
      )}

      <div className="order-detail-grid">
        {/* Order Status Timeline */}
        <div className="order-card">
          <h2 className="card-title">{t("Order Status", "ဝယ်ယူမှု အခြေအနေ")}</h2>
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
                <div className="timeline-label">{t("Cancelled", "ပယ်ဖျက်လိုက်ပါပြီ")}</div>
              </div>
            )}
          </div>

          <div className="order-meta">
            <div className="order-meta-row">
              <span>{t("Order #", "အော်ဒါအမှတ်")}</span>
              <strong>{order.orderNumber}</strong>
            </div>
            <div className="order-meta-row">
              <span>{t("Type", "အမျိုးအစား")}</span>
              <strong>{order.type}</strong>
            </div>
            <div className="order-meta-row">
              <span>{t("Date", "ရက်စွဲ")}</span>
              <strong>{new Date(order.createdAt).toLocaleString()}</strong>
            </div>
            <div className="order-meta-row">
              <span>{t("Total", "စုစုပေါင်း")}</span>
              <strong>MMK {Number(order.finalPrice).toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* Item Details */}
        <div className="order-card">
          <h2 className="card-title">{t("Item Details", "အသေးစိတ် အချက်အလက်များ")}</h2>
          {firstItem && (
            <div className="order-item-detail">
              {isAccount && firstItem.account?.images?.[0] && (
                <div className="order-item-img">
                  <Image src={firstItem.account.images[0].url} alt={firstItem.account.title} fill style={{ objectFit: 'cover' }} />
                </div>
              )}
              <div>
                <h3>{isAccount ? firstItem.account?.title : `${firstItem.diamondPackage?.amount?.toLocaleString()} ${t("Diamonds", "စိန်များ")}`}</h3>
                {isAccount && <p>{firstItem.account?.rank} • {firstItem.account?.server}</p>}
                {!isAccount && order.mlUserId && (
                  <p>{t("User ID", "User ID")}: {order.mlUserId} | {t("Server", "Server")}: {order.mlServerId}</p>
                )}
                <p className="item-price">MMK {Number(firstItem.subtotal).toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>

        {/* Payment Proof Submission */}
        {canSubmitProof && (
          <div className="order-card highlight-card">
            <h2 className="card-title">{t("⚡ Submit Payment Proof", "⚡ ငွေလွှဲပြေစာ တင်ရန်")}</h2>

            <div className="payment-instructions">
              <p><strong>{t("Payment Method:", "ငွေပေးချေမည့်နည်းလမ်း-")}</strong> {order.paymentMethod?.replace(/_/g, ' ')}</p>
              <div className="payment-detail-box">
                <p>{t("Account No:", "အကောင့်နံပါတ်-")} <strong>{PAYMENT_METHODS[order.paymentMethod]?.accountNo || 'Contact support'}</strong></p>
                <p>{t("Account Name:", "အကောင့်အမည်-")} <strong>{PAYMENT_METHODS[order.paymentMethod]?.accountName || 'PanneiStore'}</strong></p>
                <p>{t("Amount:", "ကျသင့်ငွေ-")} <strong>MMK {Number(order.finalPrice).toLocaleString()}</strong></p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t("Transaction ID (Optional)", "ငွေလွှဲကုဒ် (မဖြစ်မနေမလိုပါ)")}</label>
              <input className="form-input" placeholder={t("Your transfer reference ID", "သင့်၏ ငွေလွှဲအထောက်အထားကုဒ်")} value={txId} onChange={(e) => setTxId(e.target.value)} />
            </div>

            <div className="proof-upload" onClick={() => fileRef.current?.click()}>
              {proofFile ? (
                <div className="proof-preview">
                  <Image src={URL.createObjectURL(proofFile)} alt="proof" fill style={{ objectFit: 'contain' }} />
                </div>
              ) : (
                <>
                  <span className="upload-icon">📸</span>
                  <p>{t("Click to upload payment screenshot", "ငွေလွှဲပြေစာ ဓာတ်ပုံတင်ရန် နှိပ်ပါ")}</p>
                  <p className="upload-hint">{t("JPG, PNG up to 10MB", "၁၀MB အောက် JPG, PNG ပုံများ")}</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => setProofFile(e.target.files?.[0] || null)} />

            <button className="btn-primary btn-full" onClick={submitProof} disabled={submitting || !proofFile}>
              {submitting ? <span className="btn-spinner" /> : t("Submit Payment Proof", "ငွေလွှဲပြေစာ တင်မည်")}
            </button>
          </div>
        )}

        {/* Submitted Proof */}
        {order.paymentProof && (
          <div className="order-card">
            <h2 className="card-title">{t("Payment Proof", "ငွေလွှဲပြေစာ")}</h2>
            <div className="proof-image">
              <Image src={order.paymentProof} alt="Payment proof" fill style={{ objectFit: 'contain' }} />
            </div>
            <p className="proof-status">
              {t("Status:", "အခြေအနေ-")} <strong>{order.payment?.status}</strong>
            </p>
          </div>
        )}

        {/* Cancel */}
        {canCancel && (
          <div className="order-card">
            <button className="btn-cancel" onClick={cancelOrder}>{t("Cancel Order", "ဝယ်ယူမှု ပယ်ဖျက်မည်")}</button>
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
