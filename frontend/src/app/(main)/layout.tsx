"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import { PremiumNavbar } from "@/components/layout/PremiumNavbar";
import { FloatingBottomNav } from "@/components/layout/FloatingBottomNav";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { GlobalFooter } from "@/components/layout/GlobalFooter";
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

      <GlobalFooter />
    </div>
  );
}
