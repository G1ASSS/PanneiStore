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
import { DEMO_ACCOUNT_IDS, getDemoAccountById } from '@/data/demoAccounts';
import { getLocalListingById } from '@/lib/localListings';
import { buildAccountInquiryMessage, buildOwnerTelegramUrl } from '@/utils/telegram';

export default function AccountDetailPage() {
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

    const localAccount = getLocalListingById(accountId);
    if (localAccount) {
      setAccount(localAccount);
      setLoading(false);
      return;
    }

    const demoAccount = getDemoAccountById(accountId);

    if (DEMO_ACCOUNT_IDS.has(accountId)) {
      setAccount(demoAccount);
      setLoading(false);
      return;
    }

    let cancelled = false;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/${accountId}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success) {
          setAccount(data.data);
        } else if (demoAccount) {
          setAccount(demoAccount);
        } else {
          setAccount(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAccount(demoAccount ?? null);
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
          <h2>Account Not Found</h2>
          <p>This listing may have been removed or sold. Browse the market for more accounts.</p>
          <Link href="/market" className="hero-cta hero-cta-primary ad-back-btn">
            <ArrowLeft size={16} />
            Back to Market
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
    { icon: Users, label: 'Heroes', value: account.heroCount, accent: 'ad-stat-pill--pink' },
    { icon: Sparkles, label: 'Skins', value: account.skinCount, accent: 'ad-stat-pill--purple' },
    { icon: Swords, label: 'Win Rate', value: `${account.winRate}%`, accent: 'ad-stat-pill--cyan' },
    { icon: Trophy, label: 'Level', value: account.level, accent: 'ad-stat-pill--gold' },
  ];

  const overviewStats = [
    { label: 'Rank', value: account.rank },
    { label: 'Server', value: account.server },
    { label: 'Level', value: account.level },
    { label: 'Win Rate', value: `${account.winRate}%` },
    { label: 'Total Matches', value: account.totalMatches.toLocaleString() },
    { label: 'Hero Count', value: account.heroCount },
    { label: 'Skin Count', value: account.skinCount },
    { label: 'Collection Level', value: account.emblemCount },
  ];

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'skins' as const, label: 'Skins', count: account.skins.length },
  ];

  return (
    <div className="ad-page">
      <div className="ad-topbar">
        <Link href="/market" className="ad-back-btn" aria-label="Back to market">
          <ArrowLeft size={20} strokeWidth={2} aria-hidden />
          Back
        </Link>
      </div>

      <div className="ad-hero">
        <div className="ad-gallery">
          <button
            type="button"
            className="ad-main-image ad-main-image-btn"
            onClick={() => setLightboxOpen(true)}
            aria-label="View full screen photo"
          >
            {account.isFeatured && (
              <span className="ad-featured-badge">
                <Star size={12} fill="currentColor" />
                Featured
              </span>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mainImage} alt={account.title} className="ad-main-image-img" />
            <div className="ad-image-gradient" aria-hidden />
            <span className="ad-zoom-hint">
              <ZoomIn size={14} strokeWidth={2.25} />
              Tap to enlarge
            </span>
            {imageCount > 1 && (
              <span className="ad-image-counter">
                {activeImage + 1} / {imageCount}
              </span>
            )}
            {!isAvailable && <div className="ad-sold-overlay">SOLD</div>}
          </button>

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
              {isAvailable && <span className="ad-status-badge">Available</span>}
            </div>

            <h1 className="ad-title">{account.title}</h1>
            {account.titleMyanmar && <p className="ad-title-mm">{account.titleMyanmar}</p>}

            <div className="ad-price-block ad-price-block--mobile">
              <span className="ad-price-label">Price</span>
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
              <span className="ad-price-label">Price</span>
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
                  Buy Now
                </a>
              ) : (
                <div className="ad-sold-msg">This account has been sold.</div>
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
            Buy Now
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
                {overviewStats.map(({ label, value }) => (
                  <div key={label} className="ad-overview-cell">
                    <span className="ad-overview-label">{label}</span>
                    <span className="ad-overview-value">{value}</span>
                  </div>
                ))}
              </div>
              {account.description && (
                <div className="ad-description">
                  <h3>About this account</h3>
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
              {account.skins.length === 0 && <p className="ad-empty">No skin data available.</p>}
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
