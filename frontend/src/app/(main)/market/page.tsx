'use client';

import { useState, useEffect, useLayoutEffect, useRef, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  X,
  Store,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Gamepad2,
} from 'lucide-react';
import { AccountCard, AccountData } from '@/components/ui/AccountCard';
import { DEMO_POPULAR_ACCOUNTS } from '@/data/demoAccounts';
import { getLocalListings, localListingToCard } from '@/lib/localListings';
import { MARKET_FILTER_TIERS } from '@/data/collectorTiers';

interface Account {
  id: string;
  title: string;
  titleMyanmar?: string;
  price: number;
  rank: string;
  heroCount: number;
  skinCount: number;
  winRate: number;
  server: string;
  isFeatured: boolean;
  images: { url: string; isPrimary: boolean }[];
  seller: { shopName: string; rating: number; isApproved: boolean };
}

const RANKS = MARKET_FILTER_TIERS;

const SORT_OPTIONS = [
  { label: 'Newest', value: 'createdAt-desc' },
  { label: 'Price: Low–High', value: 'price-asc' },
  { label: 'Price: High–Low', value: 'price-desc' },
  { label: 'Most Viewed', value: 'viewCount-desc' },
];

function filterDemoAccounts(
  accounts: AccountData[],
  filters: { rank: string; minPrice: string; maxPrice: string; search: string; sort: string }
): Account[] {
  let result = [...accounts] as Account[];

  if (filters.rank !== 'All') {
    result = result.filter((a) =>
      a.rank.toLowerCase().includes(filters.rank.toLowerCase())
    );
  }

  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.rank.toLowerCase().includes(q) ||
        a.seller.shopName.toLowerCase().includes(q)
    );
  }

  if (filters.minPrice) {
    result = result.filter((a) => Number(a.price) >= Number(filters.minPrice));
  }
  if (filters.maxPrice) {
    result = result.filter((a) => Number(a.price) <= Number(filters.maxPrice));
  }

  const [sortBy, sortOrder] = filters.sort.split('-');
  result.sort((a, b) => {
    if (sortBy === 'price') {
      return sortOrder === 'asc'
        ? Number(a.price) - Number(b.price)
        : Number(b.price) - Number(a.price);
    }
    return 0;
  });

  return result;
}

function withLocalListings(
  accounts: Account[],
  filters: { rank: string; minPrice: string; maxPrice: string; search: string; sort: string }
): Account[] {
  const local = filterDemoAccounts(
    getLocalListings().map((l) => localListingToCard(l) as AccountData),
    filters
  ) as Account[];
  const localIds = new Set(local.map((a) => a.id));
  return [...local, ...accounts.filter((a) => !localIds.has(a.id))];
}

function formatAvailableCount(count: number): string {
  const label = count === 1 ? 'account' : 'accounts';
  return `${count.toLocaleString()} ${label} available`;
}

function useMobileFiltersLayout() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return isMobile;
}

interface MarketFiltersPanelProps {
  filters: {
    rank: string;
    minPrice: string;
    maxPrice: string;
  };
  onRankChange: (rank: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onApply: () => void;
  onReset: () => void;
  onClose: () => void;
  isOpen?: boolean;
  sheet?: boolean;
}

function MarketFiltersPanel({
  filters,
  onRankChange,
  onMinPriceChange,
  onMaxPriceChange,
  onApply,
  onReset,
  onClose,
  isOpen = true,
  sheet = false,
}: MarketFiltersPanelProps) {
  return (
    <aside
      className={`mk-sidebar ${isOpen ? 'mk-sidebar--open' : ''} ${sheet ? 'mk-sidebar--sheet' : ''}`}
    >
      <div className="mk-sidebar-handle" aria-hidden />

      <div className="mk-sidebar-head">
        <h3>Filters</h3>
        <button
          type="button"
          className="mk-sidebar-close"
          onClick={onClose}
          aria-label="Close filters"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mk-sidebar-body">
        <div className="mk-filter-group">
          <span className="mk-filter-label">Collector Tier</span>
          <div className={`mk-filter-chips ${sheet ? 'mk-filter-chips--grid' : ''}`}>
            {RANKS.map((rank) => {
              const isActive = filters.rank === rank;
              const label = rank;
              return (
                <button
                  key={rank}
                  type="button"
                  title={rank}
                  className={`mk-filter-chip ${isActive ? 'mk-filter-chip--active' : ''}`}
                  onClick={() => onRankChange(rank)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mk-filter-group mk-filter-group--price">
          <span className="mk-filter-label">Price Range (MMK)</span>
          {sheet ? (
            <div className="mk-price-row mk-price-row--sheet">
              <input
                type="number"
                className="mk-price-input"
                placeholder="Min"
                aria-label="Minimum price"
                value={filters.minPrice}
                onChange={(e) => onMinPriceChange(e.target.value)}
              />
              <span className="mk-price-sep">—</span>
              <input
                type="number"
                className="mk-price-input"
                placeholder="Max"
                aria-label="Maximum price"
                value={filters.maxPrice}
                onChange={(e) => onMaxPriceChange(e.target.value)}
              />
            </div>
          ) : (
            <div className="mk-price-row">
              <input
                type="number"
                className="mk-price-input"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => onMinPriceChange(e.target.value)}
              />
              <span className="mk-price-sep">—</span>
              <input
                type="number"
                className="mk-price-input"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => onMaxPriceChange(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mk-sidebar-actions">
        <button type="button" className="hero-cta hero-cta-primary mk-apply-btn" onClick={onApply}>
          Apply Filters
        </button>
        <button type="button" className="mk-reset-btn" onClick={onReset}>
          Reset All
        </button>
      </div>
    </aside>
  );
}

function MarketContent() {
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [availableTotal, setAvailableTotal] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [usingDemo, setUsingDemo] = useState(false);

  const [filters, setFilters] = useState({
    rank: searchParams.get('rank') || 'All',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: 'createdAt-desc',
    search: searchParams.get('search') || '',
  });

  const [showFilters, setShowFilters] = useState(false);
  const isMobileFilters = useMobileFiltersLayout();
  const isFirstLoad = useRef(true);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    if (!loading && isFirstLoad.current) {
      isFirstLoad.current = false;
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [loading]);

  useEffect(() => {
    if (!showFilters || !isMobileFilters) return;

    document.body.classList.add('mk-filters-open');
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.classList.remove('mk-filters-open');
      document.body.style.overflow = prev;
    };
  }, [showFilters, isMobileFilters]);

  useEffect(() => {
    fetchAvailableCount();
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [filters, page]);

  const fetchAvailableCount = async () => {
    const localAvailable = getLocalListings().filter((a) => a.status === 'AVAILABLE').length;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/accounts/count?status=AVAILABLE`
      );
      const data = await res.json();
      if (data.success) {
        setAvailableTotal((data.data?.total ?? 0) + localAvailable);
      } else {
        setAvailableTotal(localAvailable || DEMO_POPULAR_ACCOUNTS.length);
      }
    } catch {
      setAvailableTotal(localAvailable || DEMO_POPULAR_ACCOUNTS.length);
    }
  };

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '12' });
      if (filters.rank !== 'All') params.set('rank', filters.rank);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      if (filters.search) params.set('search', filters.search);
      const [sortBy, sortOrder] = filters.sort.split('-');
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts?${params}`);
      const data = await res.json();
      if (data.success) {
        const apiAccounts = data.data.accounts || [];
        const apiTotal = data.data.pagination?.total ?? 0;
        if (apiAccounts.length > 0) {
          setAccounts(apiAccounts);
          setTotal(apiTotal);
          setUsingDemo(false);
        } else if (apiTotal === 0) {
          const demo = withLocalListings(
            filterDemoAccounts(DEMO_POPULAR_ACCOUNTS, filters),
            filters
          );
          setAccounts(demo);
          setTotal(demo.length);
          setUsingDemo(true);
        } else {
          setAccounts([]);
          setTotal(apiTotal);
          setUsingDemo(false);
        }
      } else {
        const demo = withLocalListings(
          filterDemoAccounts(DEMO_POPULAR_ACCOUNTS, filters),
          filters
        );
        setAccounts(demo);
        setTotal(demo.length);
        setUsingDemo(true);
      }
    } catch {
      const demo = withLocalListings(
        filterDemoAccounts(DEMO_POPULAR_ACCOUNTS, filters),
        filters
      );
      setAccounts(demo);
      setTotal(demo.length);
      setUsingDemo(true);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = usingDemo ? 1 : Math.ceil(total / 12);

  const resetFilters = () => {
    setFilters({ rank: 'All', minPrice: '', maxPrice: '', sort: 'createdAt-desc', search: '' });
    setPage(1);
  };

  const closeFilters = () => setShowFilters(false);

  const applyFilters = () => {
    fetchAccounts();
    closeFilters();
  };

  const filterPanelProps = {
    filters,
    onRankChange: (rank: string) => setFilters({ ...filters, rank }),
    onMinPriceChange: (minPrice: string) => setFilters({ ...filters, minPrice }),
    onMaxPriceChange: (maxPrice: string) => setFilters({ ...filters, maxPrice }),
    onApply: applyFilters,
    onReset: resetFilters,
    onClose: closeFilters,
  };

  const mobileFilterPortal =
    isMobileFilters &&
    showFilters &&
    typeof document !== 'undefined' &&
    createPortal(
      <div className="mk-filter-portal-root">
        <button
          type="button"
          className="mk-filter-backdrop"
          aria-label="Close filters"
          onClick={closeFilters}
        />
        <MarketFiltersPanel {...filterPanelProps} sheet />
      </div>,
      document.body
    );

  return (
    <div className="mk-page">
      <section className="mk-hero" id="market-top">
        <div className="mk-hero-inner">
          <span className="mk-kicker">Browse Accounts</span>
          <h1 className="mk-title">
            ML Account <span className="text-gradient-pink-purple">Marketplace</span>
          </h1>
          <p className="mk-subtitle">
            {availableTotal === null
              ? 'Loading accounts…'
              : formatAvailableCount(availableTotal)}
          </p>

          <div className="mk-search">
            <Search size={18} strokeWidth={2} className="mk-search-icon" aria-hidden />
            <input
              type="search"
              placeholder="Search by tier, hero, skin…"
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                setPage(1);
              }}
              className="mk-search-input"
            />
          </div>

          <div className="mk-rank-scroll" role="tablist" aria-label="Filter by collector tier">
            {RANKS.map((rank) => (
              <button
                key={rank}
                type="button"
                role="tab"
                aria-selected={filters.rank === rank}
                className={`mk-rank-chip ${filters.rank === rank ? 'mk-rank-chip--active' : ''}`}
                onClick={() => {
                  setFilters({ ...filters, rank });
                  setPage(1);
                }}
              >
                {rank}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="mk-body">
        {!isMobileFilters && <MarketFiltersPanel {...filterPanelProps} isOpen />}

        <main className="mk-main">
          <div className="mk-toolbar">
            <button
              type="button"
              className="mk-filter-toggle"
              onClick={() => setShowFilters(true)}
            >
              <SlidersHorizontal size={15} strokeWidth={2} />
              Filters
            </button>
            <span className="mk-count">{total.toLocaleString()} accounts</span>
            <label className="mk-sort">
              <span className="mk-sort-label">Sort</span>
              <select
                className="mk-sort-select"
                value={filters.sort}
                onChange={(e) => {
                  setFilters({ ...filters, sort: e.target.value });
                  setPage(1);
                }}
                aria-label="Sort accounts"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {usingDemo && !loading && accounts.length > 0 && (
            <p className="mk-demo-note">Showing featured demo listings — connect API for live inventory.</p>
          )}

          {loading ? (
            <div className="mk-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="mk-skeleton" />
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <div className="mk-empty">
              <div className="mk-empty-icon">
                <Store size={32} strokeWidth={1.5} />
              </div>
              <h3>No accounts found</h3>
              <p>Try adjusting your filters or search terms.</p>
              <button type="button" className="hero-cta hero-cta-secondary mk-empty-btn" onClick={resetFilters}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="mk-grid">
              {accounts.map((account) => (
                <AccountCard key={account.id} account={account} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mk-pagination" aria-label="Pagination">
              <button
                type="button"
                className="mk-page-btn"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    type="button"
                    className={`mk-page-btn ${page === p ? 'mk-page-btn--active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                type="button"
                className="mk-page-btn"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                aria-label="Next page"
              >
                <ChevronRight size={18} />
              </button>
            </nav>
          )}
        </main>
      </div>
      {mobileFilterPortal}
    </div>
  );
}

export default function MarketPage() {
  return (
    <Suspense
      fallback={
        <div className="mk-page">
          <div className="mk-loading">
            <Gamepad2 size={24} className="mk-loading-icon" />
            <span>Loading marketplace…</span>
          </div>
        </div>
      }
    >
      <MarketContent />
    </Suspense>
  );
}
