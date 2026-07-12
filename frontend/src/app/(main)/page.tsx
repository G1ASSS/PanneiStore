"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Flame,
  ArrowRight,
  Gamepad2,
  Gem,
  Store,
  BadgeCheck,
  Users,
  Star,
  Clock,
  Search,
  CreditCard,
  PackageCheck,
} from "lucide-react";
import { PopularAccountCard } from "@/components/ui/PopularAccountCard";
import { LiquidCard } from "@/components/ui/LiquidCard";
import { EventPhotoSlider } from "@/components/ui/EventPhotoSlider";
import { HeroBannerSlider } from "@/components/ui/HeroBannerSlider";
import { AnnouncementPopup } from "@/components/ui/AnnouncementPopup";
import { buildOwnerTelegramUrl } from "@/utils/telegram";

import { useLanguage } from "@/contexts/LanguageContext";

const platformStats = [
  {
    value: "5,000+",
    label: { en: "Accounts Sold", my: "ရောင်းချပြီးသော အကောင့်များ" },
    icon: Users,
    accent: "stat-accent-gold",
  },
  {
    value: "99.8%",
    label: { en: "Happy Escrow Ratings", my: "စိတ်ချယုံကြည်ရသော ဝန်ဆောင်မှု" },
    icon: Star,
    accent: "stat-accent-pink",
  },
  {
    value: "< 3 Mins",
    label: { en: "Average Diamond Delivery", my: "စိန်ထည့်သွင်းမှု ကြာချိန်" },
    icon: Clock,
    accent: "stat-accent-cyan",
  },
];

// Removed hardcoded popularAccounts definition

const howItWorks = [
  {
    step: "01",
    title: { en: "Browse & Choose", my: "ရှာဖွေပြီး ရွေးချယ်ပါ" },
    description: { en: "Pick an account or diamond package that fits your budget.", my: "သင့်ဘတ်ဂျက်နှင့် ကိုက်ညီသော အကောင့် သို့မဟုတ် စိန်ပက်ကေ့ချ်ကို ရွေးချယ်ပါ။" },
    icon: Search,
  },
  {
    step: "02",
    title: { en: "Pay Securely", my: "လုံခြုံစွာ ငွေပေးချေပါ" },
    description: { en: "Pay with KBZ Pay, Wave Money, and other local options.", my: "KBZ Pay, Wave Money နှင့် အခြား ငွေပေးချေမှုများဖြင့် ပေးချေနိုင်ပါသည်။" },
    icon: CreditCard,
  },
  {
    step: "03",
    title: { en: "Receive Instantly", my: "ချက်ချင်း ရယူပါ" },
    description: { en: "Get account details or diamonds within minutes.", my: "အကောင့် အချက်အလက် သို့မဟုတ် စိန်များကို မိနစ်ပိုင်းအတွင်း ရရှိမည်ဖြစ်ပါသည်။" },
    icon: PackageCheck,
  },
];

export default function HomePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [eventPhotos, setEventPhotos] = React.useState<any[]>([]);
  const [banners, setBanners] = React.useState<any[]>([]);
  const [announcement, setAnnouncement] = React.useState<any>(null);
  const [popularAccounts, setPopularAccounts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchEventPhotos = async () => {
      try {
        const [photosRes, bannersRes, announcementRes, accountsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'}/event-photos/active`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'}/hero-banners/active`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'}/announcements/active`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'}/accounts?isFeatured=true&limit=6`)
        ]);
        
        const photosData = await photosRes.json();
        const bannersData = await bannersRes.json();
        const announcementData = await announcementRes.json();
        const accountsData = await accountsRes.json();

        if (photosData.success) setEventPhotos(photosData.data);
        if (bannersData.success) setBanners(bannersData.data);
        if (announcementData.success) setAnnouncement(announcementData.data);
        if (accountsData.success && accountsData.data.accounts.length > 0) {
          setPopularAccounts(accountsData.data.accounts);
        }
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventPhotos();
  }, []);

  const goToMarket = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    router.push("/market");
  };

  return (
    <div className="flex flex-col gap-10 md:gap-16 lg:gap-24 relative overflow-x-hidden">
      <AnnouncementPopup announcement={announcement} />
      
      {/* ─── DYNAMIC HERO BANNERS ─── */}
      {!loading && banners.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 mt-6">
          <div className="max-w-7xl mx-auto">
            <HeroBannerSlider banners={banners} />
          </div>
        </section>
      )}

      {/* ─── HERO SECTION (Fallback/Secondary) ─── */}
      <section className="home-hero relative grid items-center gap-10 lg:gap-14">

        <div className="home-hero-copy flex flex-col gap-6 text-left relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="home-kicker inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest w-fit"
          >
            <Flame size={12} className="animate-pulse" /> Pann Ei GAMING STORE
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-[2.95rem] lg:text-[3.45rem] xl:text-[4rem] font-black theme-heading leading-tight uppercase"
          >
            {t("YOUR GAMING", "သင့်ရဲ့ ဂိမ်းကစားခြင်းကို")} <br />
            <span className="text-gradient-pink-purple">{t("HUB", "အဆင့်မြှင့်တင်လိုက်ပါ")}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="theme-copy text-sm sm:text-base max-w-lg leading-relaxed"
          >
            {t(
              "Safely buy and sell Mobile Legends accounts or Game Items.",
              "Mobile Legends အကောင့်များကို လုံခြုံစိတ်ချစွာ ရောင်းဝယ်နိုင်ပြီး ဂိမ်း items များကို လွယ်ကူစွာ ထည့်သွင်းနိုင်ပါသည်။"
            )}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="home-hero-actions"
          >
            <Link href="/market" className="hero-cta hero-cta-primary">
              {t("Buy ML Accounts", "အကောင့်များ ဝယ်ရန်")}
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
            <Link href="/topup" className="hero-cta hero-cta-secondary">
              {t("Top up", "စိန်ဖြည့်ရန်")}
            </Link>
            <Link href="/sell" className="hero-cta hero-cta-secondary">
              {t("Want to Sell Your Account?", "သင့်အကောင့်ကို ရောင်းချချင်ပါသလား?")}
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="home-hero-visual w-full max-w-sm lg:max-w-[430px] xl:max-w-[460px] relative flex items-center justify-center"
        >
          <LiquidCard className="hero-icon-card w-full p-6 md:p-8 lg:p-9 relative overflow-hidden" hoverEffect={false}>
            {!loading && <EventPhotoSlider photos={eventPhotos} />}
          </LiquidCard>
        </motion.div>
      </section>

      {/* ─── PLATFORM STATS ─── */}
      <section className="home-stats home-centered-block">
        {platformStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label.en} className="home-stat">
              <div className={`home-stat-icon ${stat.accent}`}>
                <Icon size={20} strokeWidth={2} />
              </div>
              <div className={`home-stat-value ${stat.accent}`}>{stat.value}</div>
              <div className="home-stat-label">{t(stat.label.en, stat.label.my)}</div>
            </div>
          );
        })}
      </section>

      {/* ─── MOST POPULAR ACCOUNTS ─── */}
      <section className="home-section home-popular-section home-centered-block">
        <div className="home-popular-header">
          <span className="home-section-kicker">{t("Trending Now", "ယခု ရေပန်းစားနေသော")}</span>
          <h2 className="home-section-title">
            {t("Most Popular", "လူကြိုက်အများဆုံး")} <span className="text-gradient-pink-purple">{t("Accounts", "အကောင့်များ")}</span>
          </h2>
          <p className="home-section-desc">
            {t("Top-rated ML accounts loved by buyers — verified stats, premium skins, and trusted sellers.", "ဝယ်ယူသူများ အနှစ်သက်ဆုံး ထိပ်တန်း ML အကောင့်များ — စစ်ဆေးပြီးသား အချက်အလက်များ၊ ပရီမီယံ စကင်များနှင့် ယုံကြည်စိတ်ချရသော ရောင်းချသူများ")}
          </p>
        </div>

        <div className="home-popular-grid">
          {popularAccounts.map((account) => (
            <PopularAccountCard key={account.id} account={account} />
          ))}
        </div>

        <div className="home-popular-footer">
          <Link
            href="/market"
            scroll={false}
            onClick={(e) => {
              e.preventDefault();
              goToMarket();
            }}
            className="home-see-more"
          >
            <span>{t("Browse all accounts", "အကောင့်များအားလုံး ကြည့်ရှုရန်")}</span>
            <ArrowRight size={16} strokeWidth={2} className="home-see-more-icon" aria-hidden />
          </Link>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="home-process home-centered-block">
        <div className="home-process-inner">
          <div className="home-process-copy">
            <span className="home-section-kicker">{t("Simple Process", "လွယ်ကူသော အဆင့်များ")}</span>
            <h2 className="home-section-title">
              {t("From Browse to", "ရွေးချယ်မှုမှ")} <span className="text-gradient-pink-purple">{t("Delivery", "ပေးပို့ခြင်းအထိ")}</span>
            </h2>
            <p className="home-section-desc max-w-md">
              {t("Whether you are buying an account or topping up diamonds, PanneiStore keeps every step clear, fast, and secure.", "အကောင့်ဝယ်ယူခြင်း သို့မဟုတ် စိန်ထည့်သွင်းခြင်းများကို PanneiStore မှ ရှင်းလင်း၊ မြန်ဆန်ပြီး လုံခြုံစွာ ဆောင်ရွက်ပေးပါသည်။")}
            </p>
          </div>

          <div className="home-process-steps">
            {howItWorks.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="home-process-step">
                  <span className="home-process-step-icon">
                    <Icon size={14} strokeWidth={2} />
                  </span>
                  <span className="home-process-number-top">{item.step}</span>
                  <div className="home-process-step-content">
                    <h3 className="home-process-step-title">
                      <span className="home-process-number">{item.step}</span>
                      {t(item.title.en, item.title.my)}
                    </h3>
                    <p className="home-process-step-desc">{t(item.description.en, item.description.my)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
