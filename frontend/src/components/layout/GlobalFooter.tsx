"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from '@/contexts/LanguageContext';

export const GlobalFooter: React.FC = () => {
  const pathname = usePathname();
  const { t } = useLanguage();

  // Determine if the footer should be visible on mobile based on the current route
  const isMobileVisible = pathname === "/" || pathname === "/profile" || pathname === "/privacy";
  
  // It is ALWAYS visible on desktop (lg:block). On mobile, it's either block or hidden based on the route.
  const visibilityClass = isMobileVisible ? "block" : "hidden lg:block";

  return (
    <footer className={`w-full border-t border-[var(--card-border)] pt-12 pb-8 text-[15px] mt-24 z-10 bg-[var(--background)] ${visibilityClass}`}>
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10 md:gap-6">
        <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left order-2 md:order-1">
          <div className="theme-muted font-medium">
            &copy; 2026{" "}
            <span className="font-black uppercase tracking-wider theme-heading">
              Pannei<span className="text-brand-pink">Store</span>
            </span>
            . {t("All rights reserved.", "မူပိုင်ခွင့်များအားလုံး သိမ်းဆည်းထားသည်။")}
          </div>
          <div className="theme-muted font-bold text-[14px]">
            Made with ❤️ by{" "}
            <a
              href="https://t.me/G1ASS"
              target="_blank"
              rel="noreferrer"
              className="text-brand-pink hover:text-brand-purple transition-colors font-black tracking-wide text-[15px]"
            >
              @G1ASS
            </a>
          </div>
        </div>
        <div className="flex flex-col items-center md:items-end gap-5 text-center md:text-right order-1 md:order-2">
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 font-bold theme-heading text-[15px]">
            <Link href="/terms" className="hover:text-brand-pink transition-colors">
              {t("Terms of Service", "ဝန်ဆောင်မှုဆိုင်ရာ စည်းမျဉ်းများ")}
            </Link>
            <Link href="/privacy" className="hover:text-brand-pink transition-colors">
              {t("Privacy Policy", "ကိုယ်ရေးကိုယ်တာလုံခြုံမှု မူဝါဒ")}
            </Link>
            <a
              href="https://t.me/Panneisan2002"
              target="_blank"
              rel="noreferrer"
              className="hover:text-brand-pink transition-colors"
            >
              {t("Support Chat", "အကူအညီရယူရန်")}
            </a>
          </div>
        </div>
      </div>
      {/* Spacer to prevent mobile bottom nav overlap */}
      <div className="h-[120px] lg:h-0 w-full" />
    </footer>
  );
};
