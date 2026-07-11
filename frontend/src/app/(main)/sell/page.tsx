"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ClipboardList, CheckCircle2, XCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { buildOwnerTelegramUrl } from "@/utils/telegram";

export default function SellPage() {
  const { t } = useLanguage();

  return (
    <div className="ad-page">
      <div className="ad-topbar max-w-[1180px] mx-auto px-4 w-full">
        <Link href="/" className="ad-back-btn" aria-label="Back to home">
          <ArrowLeft size={20} strokeWidth={2} aria-hidden />
          {t("Back", "နောက်သို့")}
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-3 text-gradient-pink-purple">
            {t("Sell Your Account", "သင့်အကောင့်ကို ရောင်းချပါ")}
          </h1>
          <p className="text-[var(--muted)]">
            {t(
              "Please read our strict requirements below before contacting us to sell your account.",
              "သင့်အကောင့်ကို ရောင်းချရန် မဆက်သွယ်မီ အောက်ပါ သတ်မှတ်ချက်များကို ဖတ်ရှုပါ။"
            )}
          </p>
        </div>

        <div className="p-6 md:p-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm mb-8 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-brand-pink opacity-5 rounded-full blur-3xl pointer-events-none"></div>
          
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2 border-b border-[var(--border)] pb-4">
            <ClipboardList className="text-brand-pink" size={24} />
            {t("Requirements", "သတ်မှတ်ချက်များ")}
          </h2>
          
          <ul className="space-y-4 list-none pl-0">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-500 mt-0.5 shrink-0" size={20} /> 
              <span className="text-[15px] font-medium leading-relaxed">Nrc, location, အိမ်ထောင်စုစာရင်း, mail chg ရမှ ယူတာပါ</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-500 mt-0.5 shrink-0" size={20} /> 
              <span className="text-[15px] font-medium leading-relaxed">100k - 800k အတွင်းအကောင့်တေပဲယူတာပါ</span>
            </li>
            <li className="flex items-start gap-3">
              <XCircle className="text-red-400 mt-0.5 shrink-0" size={20} /> 
              <span className="text-[15px] font-medium leading-relaxed text-[var(--muted)]">6လအထက်ကိုယ်တိုင်ဆော့ထားတာမဟုတ်တဲ့အကောင့်တေဆိုမယူပါဘူး</span>
            </li>
          </ul>
        </div>

        <div className="flex justify-center">
          <a 
            href={buildOwnerTelegramUrl("Hi, I want to sell my MLBB account. Here are the details:")} 
            target="_blank" 
            rel="noreferrer" 
            className="hero-cta hero-cta-secondary w-full md:w-auto justify-center py-3.5 px-8 text-[15px] shadow-lg shadow-black/5 hover:shadow-black/10 flex items-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z" fill="#2AABEE" />
            </svg>
            <span className="font-semibold text-[var(--foreground)]">{t("Contact on Telegram", "Telegram တွင် ဆက်သွယ်ပါ")}</span> <ArrowRight size={18} className="text-[var(--muted)]" />
          </a>
        </div>
      </div>
    </div>
  );
}
