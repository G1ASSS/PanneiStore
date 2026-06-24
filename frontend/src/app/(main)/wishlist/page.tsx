"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Heart, SearchX, Loader2, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { AccountCard, AccountData } from "@/components/ui/AccountCard";
import axios from "axios";

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      setLoading(false);
      return;
    }
    if (status === "authenticated") {
      const fetchWishlist = async () => {
        try {
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/users/wishlist`,
            {
              headers: { Authorization: `Bearer ${(session as any).accessToken}` },
            }
          );
          if (res.data?.data) {
            // map wishlist items to AccountData
            const formatted = res.data.data.map((item: any) => ({
              id: item.account.id,
              title: item.account.title,
              titleMyanmar: item.account.titleMyanmar,
              price: item.account.price,
              rank: item.account.rank,
              heroCount: item.account.heroCount,
              skinCount: item.account.skinCount,
              winRate: item.account.winRate,
              server: item.account.server,
              isFeatured: item.account.isFeatured,
              images: item.account.images,
              seller: item.account.seller,
            }));
            setItems(formatted);
          }
        } catch (error) {
          console.error("Failed to fetch wishlist:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchWishlist();
    }
  }, [status, session]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-brand-pink" />
          <p className="theme-muted text-sm font-medium">Loading wishlist…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="diamonds-page">
      {/* Header */}
      <div className="diamonds-hero">
        <div className="diamonds-hero-bg">
          <div className="diamond-float d1 text-brand-pink/60 drop-shadow-[0_0_15px_rgba(255,46,147,0.5)]"><Heart size={44} className="fill-brand-pink" strokeWidth={1.5} /></div>
          <div className="diamond-float d2 text-brand-purple/50 drop-shadow-[0_0_15px_rgba(161,44,255,0.4)]"><Sparkles size={36} className="fill-brand-purple" strokeWidth={1.5} /></div>
          <div className="diamond-float d3 text-brand-cyan/60 drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]"><Star size={40} className="fill-brand-cyan" strokeWidth={1.5} /></div>
        </div>
        <h1 className="diamonds-title">
          My Wishlist
        </h1>
        <p className="diamonds-subtitle">Saved accounts you're keeping an eye on</p>
      </div>

      <div className="diamonds-body" style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', paddingBottom: '120px' }}>
        {status === "unauthenticated" ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center text-center glass-panel rounded-3xl p-8 border border-[var(--card-border)] bg-[var(--card)] shadow-sm">
            <div className="w-20 h-20 rounded-full bg-[var(--soft-surface)] flex items-center justify-center mb-6">
              <Heart size={32} className="text-[var(--muted)] opacity-50" />
            </div>
            <h2 className="text-xl font-bold theme-heading mb-2">Sign in to view wishlist</h2>
            <p className="theme-muted mb-8 max-w-sm">
              Keep track of your favorite accounts by signing in or creating a new account.
            </p>
            <Link href="/auth/login" className="hero-cta hero-cta-primary px-8 py-3">
              Sign In / Register
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center text-center glass-panel rounded-3xl p-8 border border-[var(--card-border)] bg-[var(--card)] shadow-sm">
            <div className="w-20 h-20 rounded-full bg-[var(--soft-surface)] flex items-center justify-center mb-6">
              <SearchX size={32} className="text-[var(--muted)] opacity-50" />
            </div>
            <h2 className="text-xl font-bold theme-heading mb-2">Your wishlist is empty</h2>
            <p className="theme-muted mb-8 max-w-sm">
              You haven't saved any accounts yet. Explore the market and hit the heart icon to save items here!
            </p>
            <Link href="/market" className="hero-cta hero-cta-primary px-8 py-3">
              Explore Market
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {items.map((acc) => (
              <AccountCard key={acc.id} account={acc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
