"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import { PremiumNavbar } from "@/components/layout/PremiumNavbar";
import { FloatingBottomNav } from "@/components/layout/FloatingBottomNav";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { useTheme } from "@/components/ThemeProvider";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();

  const user = session?.user
    ? {
        name: session.user.name ?? "User",
        avatar: session.user.image ?? null,
        role: ((session as { role?: string }).role ?? "BUYER") as
          | "BUYER"
          | "SELLER"
          | "ADMIN",
      }
    : null;

  return (
    <div className="theme-shell flex-1 flex flex-col min-h-screen relative">
      <div className="pointer-events-none absolute inset-0 theme-aura" />
      <PremiumNavbar
        user={user}
        notificationCount={0}
        onLogout={() => signOut({ callbackUrl: "/" })}
        theme={theme}
        onThemeToggle={toggleTheme}
      />

      <main className="main-content flex-1 w-full z-10 px-4 sm:px-6">
        {children}
      </main>

      <FloatingBottomNav />

      <ScrollToTop />

      <footer className="theme-footer w-full border-t py-8 text-center text-xs hidden lg:block mt-12 z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            &copy; 2026{" "}
            <span className="font-bold theme-heading uppercase tracking-wider">
              Pannei<span className="text-brand-pink">Store</span>
            </span>
            . All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="/terms" className="hover:text-brand-pink transition-colors">
              Terms of Service
            </a>
            <a href="/privacy" className="hover:text-brand-pink transition-colors">
              Privacy Policy
            </a>
            <a href="/support" className="hover:text-brand-pink transition-colors">
              Support Chat
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
