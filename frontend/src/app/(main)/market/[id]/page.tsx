'use client';

import { useState, useEffect, useLayoutEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight,
  Users,
  Sparkles,
  Trophy,
  Star,
  ShoppingBag,
  Swords,
  ArrowLeft,
  X,
  ChevronLeft,
  ZoomIn,
} from 'lucide-react';
import { AccountDetail } from '@/types/account';

import { buildAccountInquiryMessage, buildOwnerTelegramUrl } from '@/utils/telegram';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AccountDetailPage() {
  const { t } = useLanguage();
  const params = useParams();
  const accountId = String(params.id);
  const [account, setAccount] = useState<AccountDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'skins'>('overview');
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [accountId]);

  useEffect(() => {
    if (!lightboxOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxOpen(false);
      if (event.key === 'ArrowLeft') {
        setActiveImage((index) => Math.max(0, index - 1));
      }
      if (event.key === 'ArrowRight') {
        setActiveImage((index) => Math.min(account?.images.length ?? 1, index + 1) - 1);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [lightboxOpen, account?.images.length]);

  useEffect(() => {
    setActiveImage(0);
    setActiveTab('overview');

    let cancelled = false;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/${accountId}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success) {
          setAccount(data.data);
        } else {
          setAccount(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAccount(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accountId]);

  if (loading) {
    return (
      <div className="ad-page">
        <div className="ad-skeleton">
          <div className="ad-skel ad-skel-breadcrumb" />
          <div className="ad-skel ad-skel-hero">
            <div className="ad-skel ad-skel-image" />
            <div className="ad-skel-panel">
              <div className="ad-skel ad-skel-line ad-skel-line--sm" />
              <div className="ad-skel ad-skel-line ad-skel-line--lg" />
              <div className="ad-skel ad-skel-line ad-skel-line--md" />
              <div className="ad-skel ad-skel-pills" />
              <div className="ad-skel ad-skel-line ad-skel-line--price" />
              <div className="ad-skel ad-skel-btn" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="ad-page ad-not-found">
        <div className="ad-not-found-card">
          <Trophy size={40} strokeWidth={1.5} className="ad-not-found-icon" />
          <h2>{t("Account Not Found", "အကောင့် မတွေ့ပါ")}</h2>
          <p>{t("This listing may have been removed or sold. Browse the market for more accounts.", "ဤအကောင့်သည် ရောင်းထွက်သွားပြီ (သို့) ဖြုတ်ချခံရခြင်း ဖြစ်နိုင်ပါသည်။ စျေးကွက်ထဲတွင် အခြားအကောင့်များကို ဆက်လက်လေ့လာပါ။")}</p>
          <Link href="/market" className="hero-cta hero-cta-primary ad-back-btn">
            <ArrowLeft size={16} />
            {t("Back to Market", "အရောင်းစင်တာသို့ ပြန်သွားရန်")}
          </Link>
        </div>
      </div>
    );
  }

  const mainImage = account.images[activeImage]?.url || '/placeholder.jpg';
  const isAvailable = account.status === 'AVAILABLE';
  const imageCount = account.images.length;
  const telegramBuyUrl = buildOwnerTelegramUrl(buildAccountInquiryMessage(account));

  const quickStats = [
    { icon: Users, label: t('Heroes', 'ဟီးရိုးများ'), value: account.heroCount, accent: 'ad-stat-pill--pink' },
    { icon: Sparkles, label: t('Skins', 'စကင်များ'), value: account.skinCount, accent: 'ad-stat-pill--purple' },
    { icon: Swords, label: t('Win Rate', 'နိုင်နှုန်း'), value: `${account.winRate}%`, accent: 'ad-stat-pill--cyan' },
    { icon: Trophy, label: t('Level', 'အဆင့်'), value: account.level, accent: 'ad-stat-pill--gold' },
  ];

  const overviewStats = [
    { id: 'rank', label: t('Collection Level', 'စုဆောင်းမှုအဆင့်'), value: account.rank },
    { id: 'server', label: t('Server', 'ဆာဗာ'), value: account.server },
    { id: 'level', label: t('Level', 'အဆင့်'), value: account.level },
    { id: 'winRate', label: t('Win Rate', 'နိုင်နှုန်း'), value: `${account.winRate}%` },
    { id: 'matches', label: t('Total Matches', 'ပွဲအရေအတွက်'), value: account.totalMatches.toLocaleString() },
    { id: 'heroes', label: t('Hero Count', 'ဟီးရိုးအရေအတွက်'), value: account.heroCount },
    { id: 'skins', label: t('Skin Count', 'စကင်အရေအတွက်'), value: account.skinCount },
    { id: 'emblems', label: t('Emblem Count', 'အမှတ်တံဆိပ်အရေအတွက်'), value: account.emblemCount },
  ];

  const tabs = [
    { id: 'overview' as const, label: t('Overview', 'အကျဉ်းချုပ်') },
    { id: 'skins' as const, label: t('Skins', 'စကင်များ'), count: account.skinCount },
  ];

  return (
    <div className="ad-page">
      <div className="ad-topbar">
        <Link href="/market" className="ad-back-btn" aria-label="Back to market">
          <ArrowLeft size={20} strokeWidth={2} aria-hidden />
          {t("Back", "နောက်သို့")}
        </Link>
      </div>

      <div className="ad-hero">
        <div className="ad-gallery">
          <div
            className="ad-main-image ad-main-image-btn"
            role="button"
            tabIndex={0}
            onClick={() => setLightboxOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setLightboxOpen(true);
              }
            }}
            aria-label="View full screen photo"
          >
            {account.isFeatured && (
              <span className="ad-featured-badge">
                <Star size={12} fill="currentColor" />
                {t("Featured", "အထူးအကောင့်")}
              </span>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mainImage} alt={account.title} className="ad-main-image-img" />
            <div className="ad-image-gradient" aria-hidden />
            <span className="ad-zoom-hint">
              <ZoomIn size={14} strokeWidth={2.25} />
              {t("Tap to enlarge", "ပုံကြီးချဲ့ရန် နှိပ်ပါ")}
            </span>
            {imageCount > 1 && (
              <span className="ad-image-counter">
                {activeImage + 1} / {imageCount}
              </span>
            )}
            {!isAvailable && <div className="ad-sold-overlay">{t("SOLD", "ရောင်းထွက်သွားပြီ")}</div>}
          </div>

          {imageCount > 1 && (
            <div className="ad-thumbnails">
              {account.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  className={`ad-thumb ${activeImage === i ? 'ad-thumb--active' : ''}`}
                  onClick={() => setActiveImage(i)}
                  aria-label={`Select screenshot ${i + 1}`}
                  aria-current={activeImage === i}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="ad-thumb-img" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ad-info">
          <div className="ad-panel-top">
            <div className="ad-panel-badges">
              <span className="ad-rank-badge">
                <Trophy size={13} strokeWidth={2.25} />
                {account.rank}
              </span>
              <span className="ad-server-badge">{account.server}</span>
              {isAvailable && <span className="ad-status-badge">{t("Available", "ဝယ်ယူနိုင်ပါသည်")}</span>}
            </div>

            <h1 className="ad-title">{account.title}</h1>
            {account.titleMyanmar && <p className="ad-title-mm">{account.titleMyanmar}</p>}

            <div className="ad-price-block ad-price-block--mobile">
              <span className="ad-price-label">{t("Price", "စျေးနှုန်း")}</span>
              <div className="ad-price-row">
                <span className="ad-price-amount">{Number(account.price).toLocaleString()}</span>
                <span className="ad-price-currency">MMK</span>
              </div>
            </div>
          </div>

          <div className="ad-panel-body">
            <div className="ad-quick-stats">
              {quickStats.map(({ icon: Icon, label, value, accent }) => (
                <div key={label} className={`ad-stat-pill ${accent}`}>
                  <Icon size={14} strokeWidth={2} />
                  <span className="ad-stat-pill-value">{value}</span>
                  <span className="ad-stat-pill-label">{label}</span>
                </div>
              ))}
            </div>

            <div className="ad-price-block ad-price-block--full">
              <span className="ad-price-label">{t("Price", "စျေးနှုန်း")}</span>
              <div className="ad-price-row">
                <span className="ad-price-amount">{Number(account.price).toLocaleString()}</span>
                <span className="ad-price-currency">MMK</span>
              </div>
            </div>

            <div className="ad-actions ad-actions--desktop">
              {isAvailable ? (
                <a
                  href={telegramBuyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-cta hero-cta-primary ad-buy-btn"
                >
                  <ShoppingBag size={18} strokeWidth={2} />
                  {t("Buy Now", "ယခုဝယ်မည်")}
                </a>
              ) : (
                <div className="ad-sold-msg">{t("This account has been sold.", "ဤအကောင့်သည် ရောင်းထွက်သွားပြီဖြစ်သည်။")}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isAvailable && (
        <div className="ad-mobile-bar">
          <a
            href={telegramBuyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-cta hero-cta-primary ad-mobile-buy"
          >
            <ShoppingBag size={16} strokeWidth={2} />
            {t("Buy Now", "ယခုဝယ်မည်")}
          </a>
        </div>
      )}

      <section className="ad-tabs-section">
        <div className="ad-tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`ad-tab ${activeTab === tab.id ? 'ad-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.count !== undefined && <span className="ad-tab-count">{tab.count}</span>}
            </button>
          ))}
        </div>

        <div className="ad-tab-panel" role="tabpanel">
          {activeTab === 'overview' && (
            <div className="ad-overview">
              <div className="ad-overview-grid">
                {overviewStats.map(({ id, label, value }) => (
                  <div key={id} className="ad-overview-cell">
                    <span className="ad-overview-label">{label}</span>
                    <span className="ad-overview-value">{value}</span>
                  </div>
                ))}
              </div>
              {account.description && (
                <div className="ad-description">
                  <h3>{t("About this account", "အကောင့်အချက်အလက်များ")}</h3>
                  <p>{account.description}</p>
                  {account.descMyanmar && <p className="ad-description-mm">{account.descMyanmar}</p>}
                </div>
              )}
            </div>
          )}

          {activeTab === 'skins' && (
            <div className="ad-chips">
              {account.skins.map((skin, i) => (
                <div key={i} className={`ad-chip ad-chip--skin ${skin.isLegend ? 'ad-chip--legend' : ''}`}>
                  {skin.isLegend && <Star size={11} fill="currentColor" className="ad-chip-star" />}
                  <span className="ad-chip-name">{skin.skinName}</span>
                  <span className="ad-chip-sub">({skin.heroName})</span>
                </div>
              ))}
              {account.skins.length === 0 && <p className="ad-empty">{t("Detailed skin list not provided. Please review the screenshots above.", "အသေးစိတ် စကင်စာရင်း မပါဝင်ပါ။ အထက်ပါ ဓာတ်ပုံများကို ကြည့်ရှုပါ။")}</p>}
            </div>
          )}
        </div>
      </section>

      {lightboxOpen && (
        <div
          className="ad-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Account photo full screen"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            className="ad-lightbox-close"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close full screen"
          >
            <X size={22} strokeWidth={2} />
          </button>

          {imageCount > 1 && (
            <>
              <button
                type="button"
                className="ad-lightbox-nav ad-lightbox-nav--prev"
                disabled={activeImage === 0}
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveImage((index) => Math.max(0, index - 1));
                }}
                aria-label="Previous photo"
              >
                <ChevronLeft size={24} strokeWidth={2} />
              </button>
              <button
                type="button"
                className="ad-lightbox-nav ad-lightbox-nav--next"
                disabled={activeImage === imageCount - 1}
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveImage((index) => Math.min(imageCount - 1, index + 1));
                }}
                aria-label="Next photo"
              >
                <ChevronRight size={24} strokeWidth={2} />
              </button>
              <span className="ad-lightbox-counter">
                {activeImage + 1} / {imageCount}
              </span>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mainImage}
            alt={account.title}
            className="ad-lightbox-img"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
