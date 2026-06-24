'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Package, Clock, CheckCircle2, XCircle, ChevronRight, Gem,
  ShoppingBag, Send, Loader2, ReceiptText, LogIn, UserPlus,
  Sparkles, Trophy, Wallet, TrendingUp, ArrowRight, Shield,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const getStatusConfig = (t: any) => ({
  PENDING:           { label: t('Awaiting Payment', 'ငွေပေးချေရန် စောင့်ဆိုင်းနေပါသည်'),   color: '#F59E0B', glow: 'rgba(245,158,11,0.25)',    bg: 'rgba(245,158,11,0.1)',    gradient: 'linear-gradient(135deg,#F59E0B,#D97706)', icon: <Clock size={12} strokeWidth={2.5}/> },
  PAYMENT_SUBMITTED: { label: t('Under Review', 'စစ်ဆေးနေပါသည်'),       color: '#3B82F6', glow: 'rgba(59,130,246,0.25)',    bg: 'rgba(59,130,246,0.1)',    gradient: 'linear-gradient(135deg,#3B82F6,#2563EB)', icon: <Send size={12} strokeWidth={2.5}/>  },
  PAYMENT_VERIFIED:  { label: t('Payment Verified', 'ငွေပေးချေမှု အတည်ပြုပြီးပါပြီ'),   color: '#10B981', glow: 'rgba(16,185,129,0.25)',    bg: 'rgba(16,185,129,0.1)',    gradient: 'linear-gradient(135deg,#10B981,#059669)', icon: <Shield size={12} strokeWidth={2.5}/> },
  PROCESSING:        { label: t('Processing', 'ဆောင်ရွက်နေပါသည်'),         color: '#8B5CF6', glow: 'rgba(139,92,246,0.25)',    bg: 'rgba(139,92,246,0.1)',    gradient: 'linear-gradient(135deg,#8B5CF6,#7C3AED)', icon: <Loader2 size={12} strokeWidth={2.5}/> },
  COMPLETED:         { label: t('Completed', 'ပြီးစီးပါပြီ'),          color: '#10B981', glow: 'rgba(16,185,129,0.25)',    bg: 'rgba(16,185,129,0.1)',    gradient: 'linear-gradient(135deg,#10B981,#059669)', icon: <CheckCircle2 size={12} strokeWidth={2.5}/> },
  CANCELLED:         { label: t('Cancelled', 'ပယ်ဖျက်လိုက်ပါပြီ'),          color: '#EF4444', glow: 'rgba(239,68,68,0.25)',     bg: 'rgba(239,68,68,0.1)',     gradient: 'linear-gradient(135deg,#EF4444,#DC2626)', icon: <XCircle size={12} strokeWidth={2.5}/> },
});

const getTabs = (t: any) => [
  { key: 'ALL',               label: t('All', 'အားလုံး'),       icon: <ReceiptText size={13}/> },
  { key: 'PENDING',           label: t('Pending', 'ဆိုင်းငံ့'),   icon: <Clock size={13}/> },
  { key: 'PAYMENT_SUBMITTED', label: t('Review', 'စစ်ဆေးဆဲ'),    icon: <Send size={13}/> },
  { key: 'COMPLETED',         label: t('Done', 'ပြီးစီး'),      icon: <CheckCircle2 size={13}/> },
  { key: 'CANCELLED',         label: t('Cancelled', 'ပယ်ဖျက်'), icon: <XCircle size={13}/> },
];

/* ───────────────────────────────────────── skeleton */
function Skeleton() {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--card-border)',
      borderRadius: 20, padding: 20, display: 'flex', gap: 16, alignItems: 'center',
    }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--card-border)', flexShrink: 0,
        animation: 'orderPulse 1.4s ease-in-out infinite' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
        <div style={{ height: 14, width: '60%', borderRadius: 7, background: 'var(--card-border)',
          animation: 'orderPulse 1.4s ease-in-out infinite 0.1s' }} />
        <div style={{ height: 11, width: '40%', borderRadius: 7, background: 'var(--card-border)',
          animation: 'orderPulse 1.4s ease-in-out infinite 0.2s' }} />
      </div>
      <div style={{ width: 90, height: 28, borderRadius: 20, background: 'var(--card-border)', flexShrink: 0,
        animation: 'orderPulse 1.4s ease-in-out infinite 0.15s' }} />
    </div>
  );
}

/* ───────────────────────────────────────── stat card */
function StatCard({ icon, label, value, color, gradient }: any) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--card-border)',
      borderRadius: 20, padding: '18px 20px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: -20, right: -20, width: 80, height: 80,
        borderRadius: '50%', background: gradient, opacity: 0.12, filter: 'blur(20px)',
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, background: gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: `0 6px 18px ${color}40`,
        }}>
          {icon}
        </div>
        <div>
          <p style={{ fontSize: 21, fontWeight: 900, color, margin: 0, lineHeight: 1.1 }}>{value}</p>
          <p style={{ fontSize: 11, color: 'var(--muted)', margin: '4px 0 0', fontWeight: 600 }}>{label}</p>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────── order row */
function OrderRow({ order, t }: { order: any; t: any }) {
  const STATUS = getStatusConfig(t);
  const cfg = STATUS[order.status as keyof typeof STATUS] || { label: order.status, color: '#888', glow: 'rgba(136,136,136,0.2)', bg: 'rgba(136,136,136,0.1)', gradient: '#888', icon: null };
  const isDiamond = order.type === 'DIAMOND';
  const firstItem = order.items?.[0];
  const itemName = isDiamond
    ? (firstItem?.diamondPackage?.packageName || t('Diamond Top-Up', 'စိန်ဖြည့်ခြင်း'))
    : (firstItem?.account?.title || t('Account Purchase', 'အကောင့် ဝယ်ယူခြင်း'));
  const imgUrl = firstItem?.account?.images?.[0]?.url;

  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/buyer/orders/${order.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 15, textDecoration: 'none',
        background: hovered
          ? 'linear-gradient(135deg, rgba(255,46,147,0.04), rgba(161,44,255,0.04))'
          : 'var(--card)',
        border: `1px solid ${hovered ? 'rgba(255,46,147,0.3)' : 'var(--card-border)'}`,
        borderRadius: 20, padding: '16px 18px',
        boxShadow: hovered ? '0 8px 32px rgba(255,46,147,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* Icon / thumbnail */}
      <div style={{
        width: 56, height: 56, borderRadius: 16, flexShrink: 0,
        background: isDiamond
          ? 'linear-gradient(135deg, rgba(255,46,147,0.15), rgba(161,44,255,0.2))'
          : 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(16,185,129,0.12))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', position: 'relative',
        boxShadow: isDiamond ? '0 4px 14px rgba(255,46,147,0.2)' : '0 4px 14px rgba(59,130,246,0.15)',
      }}>
        {imgUrl ? (
          <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : isDiamond ? (
          <Gem size={24} color="#ff2e93" strokeWidth={1.8} />
        ) : (
          <ShoppingBag size={24} color="#3B82F6" strokeWidth={1.8} />
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 14, fontWeight: 700, color: 'var(--heading)',
          margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{itemName}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
            #{order.orderNumber}
          </span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--card-border)', display: 'inline-block' }} />
          <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
            {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 7, flexShrink: 0 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '4px 11px', borderRadius: 20, fontSize: 11, fontWeight: 700,
          color: cfg.color, background: cfg.bg,
          border: `1px solid ${cfg.color}30`,
        }}>
          {cfg.icon} {cfg.label}
        </span>
        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--heading)', letterSpacing: '-0.02em' }}>
          {Number(order.finalPrice).toLocaleString()}{' '}
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)' }}>MMK</span>
        </span>
      </div>

      <ChevronRight
        size={18} strokeWidth={2.5}
        color={hovered ? '#ff2e93' : 'var(--muted)'}
        style={{ flexShrink: 0, transition: 'color 0.2s, transform 0.2s', transform: hovered ? 'translateX(2px)' : 'none' }}
      />
    </Link>
  );
}

/* ───────────────────────────────────────── main page */
export default function OrdersPage() {
  const { data: session, status } = useSession();
  const { t } = useLanguage();
  const TABS = getTabs(t);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [stats, setStats] = useState({ total: 0, completed: 0, spent: 0 });
  const token = (session as any)?.accessToken;

  useEffect(() => {
    if (status === 'authenticated') fetchOrders();
    if (status !== 'loading') setLoading(false);
  }, [status]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/buyer?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (d.success) {
        const list = d.data.orders || [];
        setOrders(list);
        setStats({
          total: list.length,
          completed: list.filter((o: any) => o.status === 'COMPLETED').length,
          spent: list.filter((o: any) => o.status === 'COMPLETED').reduce((s: number, o: any) => s + Number(o.finalPrice), 0),
        });
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const filtered = activeTab === 'ALL' ? orders : orders.filter(o => o.status === activeTab);

  /* ── Not signed in ── */
  if (status === 'unauthenticated') {
    return (
      <>
        <style>{`
          @keyframes floatDiamond { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-12px) rotate(8deg)} }
          @keyframes shimmerGlow { 0%,100%{opacity:0.5} 50%{opacity:1} }
        `}</style>
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>
            {/* Floating icon */}
            <div style={{
              width: 100, height: 100, borderRadius: 28, margin: '0 auto 28px',
              background: 'linear-gradient(135deg, rgba(255,46,147,0.15), rgba(161,44,255,0.2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'floatDiamond 3s ease-in-out infinite',
              border: '1px solid rgba(161,44,255,0.2)',
              boxShadow: '0 0 40px rgba(161,44,255,0.2), 0 20px 40px rgba(0,0,0,0.08)',
            }}>
              <ReceiptText size={44} strokeWidth={1.4} color="#a12cff" />
            </div>

            <h2 style={{ fontSize: 26, fontWeight: 900, color: 'var(--heading)', marginBottom: 12 }}>
              {t("View your orders", "သင်၏ ဝယ်ယူမှုများ ကြည့်ရန်")}
            </h2>
            <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 32 }}>
              {t("Track diamond top-ups, account purchases, payment status and order history — all in one place.", "စိန်ထည့်သွင်းခြင်း၊ အကောင့်ဝယ်ယူခြင်း၊ ငွေပေးချေမှု အခြေအနေနှင့် ဝယ်ယူမှု မှတ်တမ်းများကို တစ်နေရာတည်းတွင် ကြည့်ရှုပါ။")}
            </p>

            {/* Feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32, textAlign: 'left' }}>
              {[
                { icon: <Gem size={14} color="#ff2e93"/>,         text: t('Track diamond top-up orders', 'စိန်ဝယ်ယူမှု မှတ်တမ်းကို ကြည့်ရှုပါ') },
                { icon: <ShoppingBag size={14} color="#3B82F6"/>, text: t('View account purchase history', 'အကောင့်ဝယ်ယူမှု မှတ်တမ်းကို ကြည့်ရှုပါ') },
                { icon: <Shield size={14} color="#10B981"/>,      text: t('Monitor payment status', 'ငွေပေးချေမှု အခြေအနေကို ကြည့်ရှုပါ') },
                { icon: <Trophy size={14} color="#F59E0B"/>,      text: t('See spending stats & rewards', 'အသုံးပြုမှု မှတ်တမ်းနှင့် ဆုလက်ဆောင်များကို ကြည့်ရှုပါ') },
              ].map(({ icon, text }) => (
                <div key={text} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'var(--card)', border: '1px solid var(--card-border)',
                  borderRadius: 12, padding: '11px 16px',
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8, background: 'var(--card-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>{icon}</div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--heading)' }}>{text}</span>
                </div>
              ))}
            </div>

            <Link href="/auth/login" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '15px 32px', borderRadius: 24, width: '100%',
              background: 'linear-gradient(135deg, #ff2e93, #a12cff)',
              color: '#fff', fontSize: 15, fontWeight: 800, textDecoration: 'none',
              boxShadow: '0 8px 28px rgba(255,46,147,0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              marginBottom: 12,
            }}>
              <LogIn size={16} /> {t("Sign In to Continue", "ရှေ့ဆက်ရန် အကောင့်ဝင်ပါ")}
            </Link>
            <Link href="/auth/register" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '13px 32px', borderRadius: 24, width: '100%',
              background: 'var(--card)', border: '1px solid var(--card-border)',
              color: 'var(--heading)', fontSize: 14, fontWeight: 700, textDecoration: 'none',
            }}>
              <UserPlus size={15} /> {t("Create Free Account", "အကောင့် အခမဲ့ဖွင့်ရန်")}
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes orderPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>

      <div style={{ maxWidth: 740, margin: '0 auto', padding: '28px 16px 140px' }}>

        {/* ── Hero header (Top Up style) ── */}
        <div className="diamonds-hero" style={{ marginBottom: 24, borderRadius: 20 }}>
          <div className="diamonds-hero-bg">
            <div className="diamond-float d1">📦</div>
            <div className="diamond-float d2">🧾</div>
            <div className="diamond-float d3">📦</div>
          </div>
          <h1 className="diamonds-title">{t("My Orders", "ဝယ်ယူမှုများ")}</h1>
          <p className="diamonds-subtitle">{t("Track your purchases & payment status", "သင့်၏ ဝယ်ယူမှုများနှင့် ငွေပေးချေမှု အခြေအနေကို ခြေရာခံပါ")}</p>
        </div>

        {/* ── Stats ── */}
        {!loading && orders.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
            <StatCard icon={<Package size={18} color="#fff"/>} label={t("Total Orders", "ဝယ်ယူမှု စုစုပေါင်း")} value={stats.total}
              color="#a12cff" gradient="linear-gradient(135deg,#a12cff,#6d28d9)" />
            <StatCard icon={<CheckCircle2 size={18} color="#fff"/>} label={t("Completed", "ပြီးစီးပါပြီ")} value={stats.completed}
              color="#10B981" gradient="linear-gradient(135deg,#10B981,#059669)" />
            <StatCard icon={<Wallet size={18} color="#fff"/>} label={t("MMK Spent", "အသုံးပြုခဲ့သော ကျပ်ငွေ")}
              value={stats.spent > 999 ? `${(stats.spent/1000).toFixed(0)}K` : stats.spent.toLocaleString()}
              color="#ff2e93" gradient="linear-gradient(135deg,#ff2e93,#e11d48)" />
          </div>
        )}

        {/* ── Tabs ── */}
        <div style={{
          display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2,
          marginBottom: 20, scrollbarWidth: 'none',
        }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.key;
            const count = tab.key === 'ALL' ? orders.length
              : orders.filter(o => o.status === tab.key).length;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 16px', borderRadius: 24, fontSize: 12, fontWeight: 700,
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                background: isActive ? 'linear-gradient(135deg, #ff2e93, #a12cff)' : 'var(--card)',
                color: isActive ? '#fff' : 'var(--muted)',
                boxShadow: isActive ? '0 4px 16px rgba(255,46,147,0.35)' : '0 1px 3px rgba(0,0,0,0.05)',
                border: isActive ? 'none' : '1px solid var(--card-border)',
                transition: 'all 0.2s',
              } as React.CSSProperties}>
                {tab.icon}
                {tab.label}
                {count > 0 && (
                  <span style={{
                    background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--card-border)',
                    color: isActive ? '#fff' : 'var(--muted)',
                    borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 800,
                  }}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── List ── */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[0,1,2,3].map(i => <Skeleton key={i} />)}
          </div>

        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '64px 24px',
            background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 24,
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: 24, margin: '0 auto 20px',
              background: 'linear-gradient(135deg, rgba(255,46,147,0.1), rgba(161,44,255,0.12))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(161,44,255,0.15)',
            }}>
              <Package size={36} color="#a12cff" strokeWidth={1.4} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--heading)', marginBottom: 8 }}>
              {activeTab === 'ALL' ? t('No orders yet', 'ဝယ်ယူမှု မရှိသေးပါ') : t(`No ${TABS.find(t=>t.key===activeTab)?.label} orders`, `${TABS.find(t=>t.key===activeTab)?.label} ဝယ်ယူမှု မရှိပါ`)}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 28, lineHeight: 1.6 }}>
              {activeTab === 'ALL'
                ? t('Place your first order to see it here. Browse the market or top up diamonds!', 'ဝယ်ယူမှုမှတ်တမ်း ကြည့်ရန် ပထမဆုံး အော်ဒါတင်ပါ။ စျေးကွက်တွင် ကြည့်ရှုပါ သို့မဟုတ် စိန်ဖြည့်ပါ။')
                : t('Switch to "All" tab to see all your orders.', 'ဝယ်ယူမှုအားလုံးကို ကြည့်ရန် "အားလုံး" ကို နှိပ်ပါ။')}
            </p>
            {activeTab === 'ALL' && (
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/topup">
                  <button className="hero-cta hero-cta-secondary px-5 py-2.5 text-[13px] flex items-center justify-center gap-2 group whitespace-nowrap">
                    <Gem size={15}/> {t("Top up", "စိန်ဖြည့်ရန်")} <ArrowRight size={14}/>
                  </button>
                </Link>
                <Link href="/market" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '12px 24px', borderRadius: 24, fontSize: 13, fontWeight: 700,
                  background: 'var(--card)', border: '1px solid var(--card-border)',
                  color: 'var(--heading)', textDecoration: 'none',
                }}>
                  <ShoppingBag size={15}/> {t("Browse Market", "အရောင်းစင်တာ")}
                </Link>
              </div>
            )}
          </div>

        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(order => <OrderRow key={order.id} order={order} t={t} />)}
          </div>
        )}

        {/* ── Quick links footer ── */}
        {!loading && orders.length > 0 && (
          <div style={{
            marginTop: 28, padding: '18px 20px',
            background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Sparkles size={16} color="#ff2e93" />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--heading)' }}>
                {t("Want to order more?", "ထပ်မံဝယ်ယူလိုပါသလား?")}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link href="/topup" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                background: 'linear-gradient(135deg, #ff2e93, #a12cff)',
                color: '#fff', textDecoration: 'none', boxShadow: '0 4px 14px rgba(255,46,147,0.3)',
              }}>
                <Gem size={13}/> {t("Top Up", "စိန်ဖြည့်ရန်")}
              </Link>
              <Link href="/market" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                background: 'var(--card-border)', color: 'var(--heading)', textDecoration: 'none',
              }}>
                <TrendingUp size={13}/> {t("Market", "စျေးကွက်")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
