'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  User, Mail, Shield, ShoppingBag, Receipt, Wallet,
  LogIn, UserPlus, ChevronRight, LogOut,
  Heart, Bell, HelpCircle, Lock, ExternalLink, Gamepad2,
} from 'lucide-react';

/* ─── Avatar component ─── */
function Avatar({ name, image, size = 80 }: { name: string; image?: string | null; size?: number }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
      />
    );
  }
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        background: 'linear-gradient(135deg, #ff2e93, #a12cff)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.35, fontWeight: 800, color: '#fff',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

/* ─── Role badge ─── */
function RoleBadge({ role }: { role: string }) {
  const cfg: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    ADMIN:  { label: 'Admin',  color: '#ff2e93', bg: 'rgba(255,46,147,0.12)',  icon: <Shield size={11} /> },
    SELLER: { label: 'Seller', color: '#a12cff', bg: 'rgba(161,44,255,0.12)', icon: <Shield size={11} /> },
    BUYER:  { label: 'Buyer',  color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', icon: <User size={11} /> },
  };
  const c = cfg[role] ?? cfg.BUYER;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 999,
      background: c.bg, color: c.color,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
      border: `1px solid ${c.color}30`,
    }}>
      {c.icon} {c.label}
    </span>
  );
}

/* ─── Menu item ─── */
function MenuItem({
  icon, label, href, onClick, danger = false, external = false,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
  external?: boolean;
}) {
  const inner = (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 18px',
      cursor: 'pointer',
      transition: 'background 0.2s',
    }}
      className="profile-menu-item"
    >
      <span style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: danger ? 'rgba(239,68,68,0.1)' : 'var(--card-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: danger ? '#EF4444' : 'var(--muted)',
      }}>
        {icon}
      </span>
      <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: danger ? '#EF4444' : 'var(--heading)' }}>
        {label}
      </span>
      {external
        ? <ExternalLink size={14} color="var(--muted)" />
        : <ChevronRight size={16} color="var(--muted)" />}
    </div>
  );

  if (onClick) return <div onClick={onClick}>{inner}</div>;
  if (href) return <Link href={href} style={{ textDecoration: 'none' }}>{inner}</Link>;
  return inner;
}

/* ─── Section card ─── */
function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--card-border)',
      borderRadius: 20, overflow: 'hidden',
    }}>
      {children}
    </div>
  );
}

/* ──────────────────────────────── Main Page ──────────────────────────────── */
export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [signingOut, setSigningOut] = useState(false);

  const user = session?.user;
  const role = (session as any)?.role ?? 'BUYER';

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut({ callbackUrl: '/' });
  };

  /* ── Not signed in ── */
  if (status === 'unauthenticated') {
    return (
      <>
        <style>{`
          @keyframes floatProfile { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        `}</style>
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
            {/* Icon */}
            <div style={{
              width: 100, height: 100, borderRadius: 28, margin: '0 auto 28px',
              background: 'linear-gradient(135deg, rgba(255,46,147,0.15), rgba(161,44,255,0.2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'floatProfile 3s ease-in-out infinite',
              border: '1px solid rgba(161,44,255,0.2)',
              boxShadow: '0 0 40px rgba(161,44,255,0.15), 0 20px 40px rgba(0,0,0,0.08)',
            }}>
              <User size={44} strokeWidth={1.4} color="#a12cff" />
            </div>

            <h2 style={{ fontSize: 26, fontWeight: 900, color: 'var(--heading)', marginBottom: 10 }}>
              Your Profile
            </h2>
            <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 32 }}>
              Sign in to manage your account,<br />track orders and top-ups.
            </p>

            {/* Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32, textAlign: 'left' }}>
              {[
                { icon: <ShoppingBag size={14} color="#3B82F6" />, text: 'View purchase history' },
                { icon: <Gamepad2 size={14} color="#a12cff" />, text: 'Manage diamond top-ups' },
                { icon: <Receipt size={14} color="#10B981" />, text: 'Track order status' },
                { icon: <Shield size={14} color="#ff2e93" />, text: 'Secure account settings' },
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
              marginBottom: 12,
            }}>
              <LogIn size={16} /> Sign In
            </Link>
            <Link href="/auth/register" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '13px 32px', borderRadius: 24, width: '100%',
              background: 'var(--card)', border: '1px solid var(--card-border)',
              color: 'var(--heading)', fontSize: 14, fontWeight: 700, textDecoration: 'none',
            }}>
              <UserPlus size={16} /> Create Account
            </Link>
          </div>
        </div>
      </>
    );
  }

  /* ── Loading ── */
  if (status === 'loading') {
    return <div className="page-loading" />;
  }

  /* ── Authenticated ── */
  return (
    <>
      <style>{`
        .profile-menu-item:hover { background: var(--card-border) !important; }
        .profile-menu-item + .profile-menu-item { border-top: 1px solid var(--card-border); }
      `}</style>

      <div style={{ maxWidth: 540, margin: '0 auto', padding: '24px 0 16px' }}>

        {/* ── Hero card ── */}
        <div style={{
          background: 'var(--card)', border: '1px solid var(--card-border)',
          borderRadius: 24, padding: '28px 24px', marginBottom: 16,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Top accent */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            background: 'linear-gradient(90deg, #ff2e93, #a12cff, #00f5ff)',
          }} />

          {/* Glow */}
          <div style={{
            position: 'absolute', top: -60, right: -60, width: 200, height: 200,
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(161,44,255,0.12), transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 18, position: 'relative' }}>
            {/* Avatar with ring */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                position: 'absolute', inset: -3, borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff2e93, #a12cff)',
                zIndex: 0,
              }} />
              <div style={{
                position: 'absolute', inset: -1, borderRadius: '50%',
                background: 'var(--card)', zIndex: 1,
              }} />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <Avatar name={user?.name ?? 'User'} image={user?.image} size={76} />
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ marginBottom: 6 }}>
                <RoleBadge role={role} />
              </div>
              <h1 style={{
                fontSize: 20, fontWeight: 900, color: 'var(--heading)',
                letterSpacing: '-0.02em', margin: '0 0 4px',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user?.name ?? 'User'}
              </h1>
              <p style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5, margin: 0 }}>
                <Mail size={12} />
                {user?.email ?? ''}
              </p>
            </div>
          </div>
        </div>

        {/* ── Quick links ── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { label: 'My Orders', icon: <Receipt size={22} color="#ff2e93" />, href: '/orders', bg: 'rgba(255,46,147,0.1)' },
              { label: 'Top Up',    icon: <Wallet size={22} color="#a12cff" />,  href: '/topup',  bg: 'rgba(161,44,255,0.1)' },
              { label: 'Market',   icon: <ShoppingBag size={22} color="#3B82F6" />, href: '/market', bg: 'rgba(59,130,246,0.1)' },
            ].map(({ label, icon, href, bg }) => (
              <Link key={label} href={href} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'var(--card)', border: '1px solid var(--card-border)',
                  borderRadius: 16, padding: '16px 12px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                  className="profile-quick-link"
                >
                  <div style={{
                    width: 46, height: 46, borderRadius: 14, background: bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {icon}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--heading)', textAlign: 'center' }}>{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Account section ── */}
        <SectionCard>
          <div style={{ padding: '12px 18px 6px', fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Account
          </div>
          <MenuItem icon={<User size={16} />} label="Edit Profile" href="/profile/edit" />
          <MenuItem icon={<Bell size={16} />} label="Notifications" href="/notifications" />
          <MenuItem icon={<Heart size={16} />} label="Wishlist" href="/wishlist" />
        </SectionCard>

        {role === 'SELLER' && (
          <div style={{ marginTop: 12 }}>
            <SectionCard>
              <div style={{ padding: '12px 18px 6px', fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Seller
              </div>
              <MenuItem icon={<Shield size={16} />} label="Seller Dashboard" href="/seller/dashboard" />
            </SectionCard>
          </div>
        )}

        {/* ── Support section ── */}
        <div style={{ marginTop: 12 }}>
          <SectionCard>
            <div style={{ padding: '12px 18px 6px', fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Support
            </div>
            <MenuItem icon={<HelpCircle size={16} />} label="Help Center" href="https://t.me/panneisan2002" external />
            <MenuItem icon={<Lock size={16} />} label="Privacy Policy" href="/privacy" />
          </SectionCard>
        </div>

        {/* ── Sign out ── */}
        <div style={{ marginTop: 12, marginBottom: 8 }}>
          <SectionCard>
            <MenuItem
              icon={<LogOut size={16} />}
              label={signingOut ? 'Signing out…' : 'Sign Out'}
              danger
              onClick={handleSignOut}
            />
          </SectionCard>
        </div>

        {/* App version */}
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', marginTop: 12 }}>
          PanneiStore v1.0 · Myanmar's #1 MLBB Marketplace
        </p>

      </div>

      <style>{`
        .profile-quick-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }
      `}</style>
    </>
  );
}
