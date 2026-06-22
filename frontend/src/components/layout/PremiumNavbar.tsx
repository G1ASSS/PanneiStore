"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Globe2,
  User,
  LogOut,
  LayoutDashboard,
  Moon,
  Sun,
  Menu,
  Search,
  Heart,
} from "lucide-react";

type ThemeMode = "light" | "blue-dark";

interface PremiumNavbarProps {
  user?: {
    name: string;
    avatar?: string | null;
    role: "BUYER" | "SELLER" | "ADMIN";
  } | null;
  notificationCount?: number;
  onLogout?: () => void;
  theme?: ThemeMode;
  onThemeToggle?: () => void;
}

export const PremiumNavbar: React.FC<PremiumNavbarProps> = ({
  user = null,
  notificationCount = 0,
  onLogout,
  theme = "light",
  onThemeToggle,
}) => {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="theme-navbar sticky top-0 z-40 w-full border-b backdrop-blur-md">

      {/* ===================== DESKTOP NAV ===================== */}
      <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-center h-20 w-full">

        {/* LEFT: Logo */}
        <a href="/" className="shrink-0 flex items-center justify-self-start">
          <span className="text-xl font-bold theme-heading tracking-[0.15em]">
            PannEi{" "}
            <span className="text-gray-400 font-normal tracking-[0.1em]">
              Store
            </span>
          </span>
        </a>

        {/* CENTER: Nav links */}
        <nav className="flex items-center justify-self-center gap-8 xl:gap-10">
          <Link
            href="/market"
            className={`text-sm font-semibold transition-colors whitespace-nowrap ${
              pathname.startsWith("/market")
                ? "text-brand-pink"
                : "theme-muted hover:text-brand-pink"
            }`}
          >
            Market
          </Link>
          <Link
            href="/topup"
            className={`text-sm font-semibold transition-colors whitespace-nowrap ${
              pathname.startsWith("/topup")
                ? "text-brand-pink"
                : "theme-muted hover:text-brand-pink"
            }`}
          >
            Top Up
          </Link>
          <Link
            href="/orders"
            className={`text-sm font-semibold transition-colors whitespace-nowrap ${
              pathname.startsWith("/orders") || pathname.startsWith("/buyer")
                ? "text-brand-pink"
                : "theme-muted hover:text-brand-pink"
            }`}
          >
            Orders
          </Link>
        </nav>

        {/* RIGHT: Action icons pinned to the far right */}
        <div className="flex items-center justify-end justify-self-end gap-5 xl:gap-6">
          {/* Language */}
          <button className="flex items-center gap-1.5 text-sm font-semibold theme-muted hover:text-brand-pink transition-colors">
            <Globe2 size={17} />
            <span>EN</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={onThemeToggle}
            className="theme-muted hover:text-brand-pink transition-colors"
          >
            {mounted ? (theme === "blue-dark" ? <Sun size={17} /> : <Moon size={17} />) : <div style={{ width: 17, height: 17 }} />}
          </button>

          {/* Notifications */}
          <Link
            href="/notifications"
            className="relative theme-muted hover:text-brand-pink transition-colors"
          >
            <Bell size={17} />
            {notificationCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#cca677] text-[9px] font-bold text-white flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </Link>

          {/* Search */}
          <button className="theme-muted hover:text-brand-pink transition-colors">
            <Search size={17} />
          </button>

          {/* Wishlist */}
          <Link
            href="/buyer/dashboard"
            className="relative theme-muted hover:text-brand-pink transition-colors"
            aria-label="Wishlist"
          >
            <Heart size={17} />
          </Link>

          {/* Profile / Auth dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="theme-muted hover:text-brand-pink transition-colors focus:outline-none"
            >
              <User size={17} />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-48 glass-panel rounded-2xl py-2 z-50 border border-brand-pink/20 shadow-xl"
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b border-white/5 mb-1.5">
                          <p className="text-xs font-bold theme-heading truncate">
                            {user.name}
                          </p>
                          <p className="text-[10px] font-semibold text-gray-500 uppercase mt-0.5">
                            {user.role}
                          </p>
                        </div>
                        <Link
                          href={
                            user.role === "ADMIN"
                              ? "/admin"
                              : user.role === "SELLER"
                                ? "/seller"
                                : "/buyer"
                          }
                        >
                          <button className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-gray-300 hover:text-brand-pink transition-colors text-left">
                            <LayoutDashboard size={14} /> Dashboard
                          </button>
                        </Link>
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            onLogout?.();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors text-left mt-1"
                        >
                          <LogOut size={14} /> Log Out
                        </button>
                      </>
                    ) : (
                      <Link href="/auth/login">
                        <button className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold theme-heading hover:text-brand-pink transition-colors text-left">
                          Log In / Register
                        </button>
                      </Link>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ===================== MOBILE NAV ===================== */}
      <div className="flex lg:hidden items-center justify-between h-16 w-full px-4">
        {/* Left: Menu + Logo */}
        <div className="flex items-center gap-3">
          <button className="theme-muted hover:text-brand-pink transition-colors">
            <Menu size={22} />
          </button>
          <a href="/" className="flex items-center overflow-hidden">
            <span className="text-[14px] sm:text-[16px] font-bold theme-heading tracking-widest whitespace-nowrap">
              PannEi{" "}
              <span className="text-gray-400 font-normal tracking-normal">
                Store
              </span>
            </span>
          </a>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-5 sm:gap-6">
          <button className="theme-muted hover:text-brand-pink transition-colors">
            <Globe2 size={18} />
          </button>

          <button
            onClick={onThemeToggle}
            className="theme-muted hover:text-brand-pink transition-colors p-2"
          >
            {mounted ? (theme === "blue-dark" ? <Sun size={18} /> : <Moon size={18} />) : <div style={{ width: 18, height: 18 }} />}
          </button>

          <Link
            href="/notifications"
            className="relative theme-muted hover:text-brand-pink transition-colors"
          >
            <Bell size={18} />
            {notificationCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#cca677] text-[8px] font-bold text-white flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </Link>

          <button className="theme-muted hover:text-brand-pink transition-colors hidden sm:block">
            <Search size={18} />
          </button>
        </div>
      </div>

    </header>
  );
};
