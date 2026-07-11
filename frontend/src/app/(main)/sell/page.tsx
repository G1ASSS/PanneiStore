"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, ShieldCheck, Banknote, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { buildOwnerTelegramUrl } from "@/utils/telegram";

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
    <circle cx="12" cy="12" r="12" fill="#2AABEE" />
    <path
      d="M5.2 11.4l12.6-4.86c.58-.21 1.09.14.9.98l-2.14 10.1c-.16.7-.58.87-1.18.54l-3.26-2.4-1.57 1.52c-.17.17-.32.32-.65.32l.23-3.32 6.04-5.45c.26-.23-.06-.36-.4-.13l-7.46 4.7-3.21-1c-.7-.22-.71-.7.15-1.04z"
      fill="white"
    />
  </svg>
);

const requirements = [
  {
    icon: ShieldCheck,
    iconColor: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/20",
    type: "required" as const,
    en: "NRC, Location, Household registration, and Mail Changeable required",
    my: "Nrc, location, အိမ်ထောင်စုစာရင်း, mail chg ရမှ ယူပါတယ်",
  },
  {
    icon: Banknote,
    iconColor: "text-sky-400",
    bgColor: "bg-sky-400/10",
    borderColor: "border-sky-400/20",
    type: "required" as const,
    en: "Only accepting accounts valued between 100,000 – 800,000 MMK",
    my: "100k - 800k အတွင်းအကောင့်တွေပဲ ယူပါတယ်",
  },
  {
    icon: Clock,
    iconColor: "text-rose-400",
    bgColor: "bg-rose-400/10",
    borderColor: "border-rose-400/20",
    type: "rejected" as const,
    en: "Accounts not personally played for 6+ months will NOT be accepted",
    my: "6လအထက် ကိုယ်တိုင်ဆော့ထားတာမဟုတ်တဲ့ အကောင့်တွေဆိုမယူပါဘူး",
  },
];

export default function SellPage() {
  const { t } = useLanguage();

  return (
    <div className="sell-page-wrapper">
      {/* Hero background gradient */}
      <div className="sell-bg-glow" aria-hidden />

      {/* Top Bar */}
      <div className="ad-topbar sell-topbar">
        <Link href="/" className="ad-back-btn" aria-label="Back to home">
          <ArrowLeft size={20} strokeWidth={2} aria-hidden />
          {t("Back", "နောက်သို့")}
        </Link>
      </div>

      <div className="sell-content">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="sell-hero"
        >
          <div className="sell-badge">
            <span>🎮</span>
            <span>{t("ML Account Trading", "ML အကောင့် ရောင်းဝယ်ရေး")}</span>
          </div>
          <h1 className="sell-title">
            {t("Sell Your", "သင့်အကောင့်ကို")}
            <br />
            <span className="text-gradient-pink-purple">{t("Account", "ရောင်းချပါ")}</span>
          </h1>
          <p className="sell-subtitle">
            {t(
              "Read the requirements below carefully before reaching out to us.",
              "ဆက်သွယ်မတိုင်မီ အောက်ပါ သတ်မှတ်ချက်များကို သေချာဖတ်ပါ။"
            )}
          </p>
        </motion.div>

        {/* Requirements Cards */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="sell-requirements"
        >
          <h2 className="sell-req-heading">
            {t("Requirements", "သတ်မှတ်ချက်များ")}
          </h2>

          <div className="sell-req-list">
            {requirements.map((req, i) => {
              const Icon = req.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                  className={`sell-req-card ${req.bgColor} ${req.borderColor}`}
                >
                  <div className={`sell-req-icon-wrap ${req.bgColor}`}>
                    <Icon className={req.iconColor} size={22} strokeWidth={2} />
                  </div>
                  <div className="sell-req-text">
                    <p className="sell-req-label">{t(req.en, req.my)}</p>
                    <span className={`sell-req-badge ${req.type === "required" ? "sell-badge-ok" : "sell-badge-no"}`}>
                      {req.type === "required"
                        ? t("Required", "လိုအပ်သည်")
                        : t("Not Accepted", "မလက်ခံပါ")}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="sell-cta-wrap"
        >
          <a
            href={buildOwnerTelegramUrl("Hi, I want to sell my MLBB account. Here are the details:")}
            target="_blank"
            rel="noreferrer"
            className="sell-cta-btn"
          >
            <TelegramIcon />
            <span>{t("Contact on Telegram to Sell", "Telegram တွင် ဆက်သွယ်ပါ")}</span>
          </a>
          <p className="sell-cta-hint">
            {t("We'll respond as quickly as possible.", "တတ်နိုင်သမျှ မြန်မြန် ပြန်ကြားပါမည်။")}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
