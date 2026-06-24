"use client";

import React from "react";
import Link from "next/link";
import { LiquidCard } from "./LiquidCard";
import { Sparkles, Trophy, Users } from "lucide-react";

export interface AccountData {
  id: string;
  title: string;
  titleMyanmar?: string | null;
  price: string | number;
  rank: string;
  heroCount: number;
  skinCount: number;
  winRate: number;
  server: string;
  images: Array<{ url: string; isPrimary: boolean }>;
  seller: {
    shopName: string;
    rating: number;
  };
}

interface AccountCardProps {
  account: AccountData;
  locale?: "en" | "my";
}

export const AccountCard: React.FC<AccountCardProps> = ({ account, locale = "en" }) => {
  const primaryImage =
    account.images?.find((img) => img.isPrimary)?.url ||
    account.images?.[0]?.url ||
    "/placeholder-ml.jpg";
  const title =
    locale === "my" && account.titleMyanmar ? account.titleMyanmar : account.title;
  const formattedPrice = new Intl.NumberFormat("en-US").format(Number(account.price));

  return (
    <Link href={`/market/${account.id}`} className="block h-full">
      <LiquidCard className="account-card h-full flex flex-col p-0 group" glow>
        <div className="account-card-media relative aspect-[16/10] w-full overflow-hidden bg-purple-950/20">
          <img
            src={primaryImage}
            alt={account.title}
            className="account-card-img w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <span className="account-card-server absolute top-3 left-3 bg-black/60 backdrop-blur-md text-[10px] font-bold text-brand-cyan px-2.5 py-1 rounded-full border border-brand-cyan/20 uppercase tracking-widest">
            {account.server}
          </span>
          <div className="account-card-chips absolute bottom-3 left-3 right-3 flex gap-2">
            <span className="account-card-chip bg-black/55 backdrop-blur-md text-[10px] font-semibold !text-white px-2 py-1 rounded-md flex items-center gap-1 border border-white/5">
              <Users size={12} className="text-brand-pink shrink-0" /> {account.heroCount} Heroes
            </span>
            <span className="account-card-chip bg-black/55 backdrop-blur-md text-[10px] font-semibold !text-white px-2 py-1 rounded-md flex items-center gap-1 border border-white/5">
              <Sparkles size={12} className="text-brand-purple shrink-0" /> {account.skinCount} Skins
            </span>
          </div>
        </div>

        <div className="account-card-body p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="account-card-rank flex items-center gap-1.5 text-xs text-brand-pink font-semibold uppercase tracking-wider mb-1">
              <Trophy size={12} className="shrink-0" />
              <span className="truncate">{account.rank}</span>
            </div>
            <h3 className="account-card-title text-sm font-bold theme-heading line-clamp-1 group-hover:text-brand-pink transition-colors">
              {title}
            </h3>

            <div className="account-card-meta mt-3 text-xs theme-muted border-b theme-soft-border pb-3">
              <span className="account-card-meta-label block text-[10px] uppercase opacity-70">Win Rate</span>
              <span className="account-card-meta-value font-bold theme-heading">{account.winRate}%</span>
            </div>
          </div>

          <div className="account-card-price-row flex items-center justify-between mt-3.5 pt-1">
            <div className="account-card-price-label text-xs theme-muted uppercase">Price</div>
            <div className="account-card-price text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-cyan">
              {formattedPrice}{" "}
              <span className="text-xs font-semibold text-brand-pink">MMK</span>
            </div>
          </div>
        </div>
      </LiquidCard>
    </Link>
  );
};
