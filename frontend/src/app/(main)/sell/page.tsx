"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
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

        <div className="p-6 md:p-8 rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--card)] to-[var(--background)] shadow-sm mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-[var(--border)] pb-3">
            <span className="text-2xl">📋</span>
            {t("Requirements", "သတ်မှတ်ချက်များ")}
          </h2>
          
          <ul className="space-y-4 list-none pl-0">
            <li className="flex items-start gap-3">
              <span className="text-green-500 mt-0.5 text-lg">✅</span> 
              <span className="text-[15px] font-medium leading-relaxed">Nrc, location, အိမ်ထောင်စုစာရင်း, mail chg ရမှ ယူတာပါ</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 mt-0.5 text-lg">✅</span> 
              <span className="text-[15px] font-medium leading-relaxed">100k - 800k အတွင်းအကောင့်တေပဲယူတာပါ</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-0.5 text-lg">❌</span> 
              <span className="text-[15px] font-medium leading-relaxed text-[var(--muted)]">6လအထက်ကိုယ်တိုင်ဆော့ထားတာမဟုတ်တဲ့အကောင့်တေဆိုမယူပါဘူး</span>
            </li>
          </ul>
        </div>

        <div className="flex justify-center">
          <a 
            href={buildOwnerTelegramUrl("Hi, I want to sell my MLBB account. Here are the details:")} 
            target="_blank" 
            rel="noreferrer" 
            className="hero-cta hero-cta-primary w-full md:w-auto justify-center py-3.5 px-8 text-base shadow-lg shadow-brand-pink/20 hover:shadow-brand-pink/40"
          >
            <img src="/icons/telegram.svg" alt="Telegram" className="w-5 h-5 opacity-90 invert brightness-0" />
            {t("Contact on Telegram", "Telegram တွင် ဆက်သွယ်ပါ")} <ArrowRight size={18} className="ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
}
