'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  Users,
  UserCheck,
  ShoppingBag,
  Package,
  ArrowLeft,
  Menu,
  X,
  LogOut,
  Image,
  Gamepad2,
  DollarSign,
  MonitorPlay,
  Megaphone,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { clearDevAdminSession } from '@/lib/devAdmin';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/accounts', label: 'Listings', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/sellers', label: 'Sellers', icon: UserCheck },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/admin/hero-banners', label: 'Home Banners', icon: MonitorPlay },
  { href: '/admin/event-photos', label: 'Event Photos', icon: Image },
  { href: '/admin/games', label: 'Games', icon: Gamepad2 },
  { href: '/admin/packages', label: 'Top-Up Prices', icon: DollarSign },
];

export function AdminShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName?: string;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="admin-root">
      {sidebarOpen && (
        <button
          type="button"
          className="admin-sidebar-overlay lg:hidden"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">
          <h1>
            Pannei<span style={{ color: 'var(--pink)' }}>Store</span>
          </h1>
          <p>Admin Panel</p>
        </div>

        <nav className="admin-nav">
          {NAV.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={`admin-nav-link ${isActive(href, exact) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link href="/" className="admin-nav-link" onClick={() => setSidebarOpen(false)}>
            <ArrowLeft size={16} />
            Back to Store
          </Link>
          <button
            type="button"
            className="admin-nav-link w-full"
            onClick={() => {
              clearDevAdminSession();
              signOut({ callbackUrl: '/' });
            }}
          >
            <LogOut size={16} />
            Log Out
          </button>
          {userName && (
            <p className="px-3 pt-2 text-xs text-[var(--text-muted)] truncate">{userName}</p>
          )}
        </div>
      </aside>

      <div className="admin-main">
        <div className="admin-topbar">
          <button
            type="button"
            className="admin-mobile-toggle"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <Link href="/" className="admin-nav-link" style={{ padding: '0.375rem 0' }}>
            <Store size={16} />
            Store
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
