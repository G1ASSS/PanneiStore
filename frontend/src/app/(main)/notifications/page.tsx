'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bell, BellOff, ShoppingBag, Wallet, MessageSquare,
  CheckCircle2, XCircle, Shield, Star, Package,
  ArrowLeft, Check, RefreshCw, Gamepad2,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

/* ─── Types ─── */
interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
  data?: Record<string, any>;
}

/* ─── Icon per type ─── */
function NotifIcon({ type }: { type: string }) {
  const cfg: Record<string, { icon: React.ReactNode; bg: string; color: string }> = {
    NEW_ORDER:          { icon: <ShoppingBag size={18} />, bg: 'rgba(59,130,246,0.12)',  color: '#3B82F6' },
    PAYMENT_COMPLETED:  { icon: <Wallet size={18} />,      bg: 'rgba(16,185,129,0.12)', color: '#10B981' },
    PAYMENT_VERIFIED:   { icon: <CheckCircle2 size={18} />,bg: 'rgba(16,185,129,0.12)', color: '#10B981' },
    MESSAGE_RECEIVED:   { icon: <MessageSquare size={18} />,bg: 'rgba(161,44,255,0.12)',color: '#a12cff' },
    ACCOUNT_SOLD:       { icon: <Package size={18} />,     bg: 'rgba(255,46,147,0.12)', color: '#ff2e93' },
    ORDER_CANCELLED:    { icon: <XCircle size={18} />,     bg: 'rgba(239,68,68,0.12)',  color: '#EF4444' },
    REVIEW_RECEIVED:    { icon: <Star size={18} />,        bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
    SELLER_APPROVED:    { icon: <Shield size={18} />,      bg: 'rgba(16,185,129,0.12)', color: '#10B981' },
    SYSTEM:             { icon: <Bell size={18} />,        bg: 'rgba(100,116,139,0.12)',color: '#64748B' },
  };
  const c = cfg[type] ?? cfg.SYSTEM;
  return (
    <div style={{
      width: 44, height: 44, borderRadius: 14, flexShrink: 0,
      background: c.bg, color: c.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {c.icon}
    </div>
  );
}

/* ─── Time ago ─── */
function timeAgo(dateStr: string, t: any) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return t('Just now', 'ယခုလေးတင်');
  if (m < 60) return `${m}${t('m ago', ' မိနစ်အကြာက')}`;
  if (h < 24) return `${h}${t('h ago', ' နာရီအကြာက')}`;
  if (d < 7) return `${d}${t('d ago', ' ရက်အကြာက')}`;
  return new Date(dateStr).toLocaleDateString();
}

/* ─── Single notification row ─── */
function NotifRow({
  notif, onRead, t,
}: {
  notif: Notification;
  onRead: (id: string) => void;
  t: any;
}) {
  const isUnread = !notif.readAt;
  const linkHref = notif.data?.orderId
    ? `/buyer/orders/${notif.data.orderId}`
    : notif.type === 'MESSAGE_RECEIVED' ? '/chat' : null;

  const inner = (
    <div
      onClick={() => isUnread && onRead(notif.id)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 18px',
        background: isUnread ? 'rgba(255,46,147,0.04)' : 'transparent',
        borderLeft: isUnread ? '3px solid #ff2e93' : '3px solid transparent',
        cursor: isUnread || linkHref ? 'pointer' : 'default',
        transition: 'background 0.2s',
        position: 'relative',
      }}
      className="notif-row"
    >
      <NotifIcon type={notif.type} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <p style={{
            fontSize: 14, fontWeight: isUnread ? 700 : 600,
            color: 'var(--heading)', margin: 0, lineHeight: 1.4,
          }}>
            {notif.title}
          </p>
          <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0, fontWeight: 500 }}>
            {timeAgo(notif.createdAt, t)}
          </span>
        </div>
        <p style={{
          fontSize: 13, color: 'var(--muted)', margin: '3px 0 0',
          lineHeight: 1.5, fontWeight: 400,
        }}>
          {notif.message}
        </p>
      </div>
      {isUnread && (
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: '#ff2e93', flexShrink: 0, marginTop: 4,
        }} />
      )}
    </div>
  );

  if (linkHref) {
    return <Link href={linkHref} style={{ textDecoration: 'none', display: 'block' }}>{inner}</Link>;
  }
  return inner;
}

/* ──────────────────────────────── Main Page ──────────────────────────────── */
export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const token = (session as any)?.accessToken;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/auth/login'); return; }
    if (status === 'authenticated') fetchNotifications();
  }, [status]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (d.success) setNotifications(d.data.notifications);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const markRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, readAt: new Date().toISOString() } : n)
    );
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() }))
      );
    } finally { setMarkingAll(false); }
  };

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  if (status === 'loading') return (
    <div className="mk-loading">
      <Gamepad2 size={24} className="mk-loading-icon" />
      <span>{t("Loading…", "လုပ်ဆောင်နေပါသည်...")}</span>
    </div>
  );

  return (
    <>
      <style>{`
        .notif-row:hover { background: var(--card-border) !important; }
        .notif-row + .notif-row { border-top: 1px solid var(--card-border); }
      `}</style>

      <div style={{ maxWidth: 540, margin: '0 auto', padding: '24px 0 16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/profile" style={{ textDecoration: 'none', color: 'var(--muted)', display: 'flex' }}>
              <ArrowLeft size={20} />
            </Link>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--heading)', margin: 0, letterSpacing: '-0.02em' }}>
              {t("Notifications", "အသိပေးချက်များ")}
              {unreadCount > 0 && (
                <span style={{
                  marginLeft: 10, fontSize: 12, fontWeight: 700,
                  background: '#ff2e93', color: '#fff',
                  padding: '2px 8px', borderRadius: 999, verticalAlign: 'middle',
                }}>
                  {unreadCount}
                </span>
              )}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={markingAll}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 10,
                  background: 'var(--card)', border: '1px solid var(--card-border)',
                  color: 'var(--heading)', fontSize: 12, fontWeight: 700,
                  cursor: markingAll ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Check size={13} /> {markingAll ? t('Marking…', 'မှတ်သားနေပါသည်...') : t('Mark all read', 'အားလုံးကို ဖတ်ပြီးအဖြစ် မှတ်မည်')}
              </button>
            )}
            <button
              onClick={fetchNotifications}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: 10,
                background: 'var(--card)', border: '1px solid var(--card-border)',
                color: 'var(--muted)', cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="mk-loading">
            <Gamepad2 size={24} className="mk-loading-icon" />
            <span>{t("Loading notifications…", "အသိပေးချက်များကို ဆွဲယူနေပါသည်...")}</span>
          </div>
        ) : notifications.length === 0 ? (
          /* Empty state */
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '50vh', gap: 16, textAlign: 'center',
          }}>
            <div style={{
              width: 90, height: 90, borderRadius: 24, margin: '0 auto',
              background: 'linear-gradient(135deg, rgba(255,46,147,0.1), rgba(161,44,255,0.15))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(161,44,255,0.15)',
              boxShadow: '0 0 40px rgba(161,44,255,0.1)',
            }}>
              <BellOff size={36} strokeWidth={1.4} color="#a12cff" />
            </div>
            <div>
              <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--heading)', margin: '0 0 6px' }}>
                {t("All caught up!", "ဖတ်ရန်မကျန်တော့ပါ!")}
              </p>
              <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
                {t("No notifications yet. We'll notify you when something happens.", "အသိပေးချက်များ မရှိသေးပါ။ ထူးခြားမှုရှိပါက အကြောင်းကြားပေးပါမည်။")}
              </p>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'var(--card)', border: '1px solid var(--card-border)',
            borderRadius: 20, overflow: 'hidden',
          }}>
            {notifications.map((n) => (
              <NotifRow key={n.id} notif={n} onRead={markRead} t={t} />
            ))}
          </div>
        )}

      </div>
    </>
  );
}
