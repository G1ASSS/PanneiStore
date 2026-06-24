"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, ShoppingBag, Sparkles, Receipt, User, Wallet } from "lucide-react";
import { cn } from "@/utils/cn";
import { useLanguage } from '@/contexts/LanguageContext';

export const FloatingBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { t } = useLanguage();

  const tabs = [
    { name: t("Home", "ပင်မ"), href: "/", icon: Home },
    { name: t("Market", "အကောင့်"), href: "/market", icon: ShoppingBag },
    { name: t("Top Up", "စိန်ဖြည့်ရန်"), href: "/topup", icon: Wallet },
    { name: t("Orders", "ဝယ်ယူမှုများ"), href: "/orders", icon: Receipt },
    { name: t("Profile", "အကောင့်"), href: "/profile", icon: User },
  ];

  return (
    <div className="liquid-tab-bar-wrap mobile-bottom-nav lg:hidden">
      <nav className="liquid-tab-bar" aria-label="Main navigation">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);

          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn("liquid-tab-item group", isActive && "is-active")}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <motion.span
                  layoutId="liquidTabIndicator"
                  className="liquid-tab-indicator"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}

              <span className="liquid-tab-content">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.25 : 1.85}
                  className={cn(
                    "liquid-tab-icon",
                    isActive ? "text-brand-pink" : "text-[var(--liquid-tab-muted)]"
                  )}
                />
                <span
                  className={cn(
                    "liquid-tab-label",
                    isActive ? "text-brand-pink" : "text-[var(--liquid-tab-muted)]"
                  )}
                >
                  {tab.name}
                </span>
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
