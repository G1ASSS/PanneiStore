"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Sparkles, Star, Trophy, Users } from "lucide-react";
import { AccountData } from "./AccountCard";

interface PopularAccountCardProps {
  account: AccountData;
  locale?: "en" | "my";
}

export const PopularAccountCard: React.FC<PopularAccountCardProps> = ({
  account,
  locale = "en",
}) => {
  const primaryImage =
    account.images?.find((img) => img.isPrimary)?.url ||
    account.images?.[0]?.url ||
    "/placeholder-ml.jpg";
  const title =
    locale === "my" && account.titleMyanmar ? account.titleMyanmar : account.title;
  const formattedPrice = new Intl.NumberFormat("en-US").format(Number(account.price));

  return (
    <Link href={`/market/${account.id}`} className="popular-account-card group">
      <div className="popular-account-card-image-wrap">
        <img
          src={primaryImage}
          alt={account.title}
          className="popular-account-card-image"
          loading="lazy"
        />
        <span className="popular-account-card-rank">
          <Trophy size={11} strokeWidth={2.25} />
          {account.rank}
        </span>
      </div>

      <div className="popular-account-card-body">
        <h3 className="popular-account-card-title">{title}</h3>

        <div className="popular-account-card-meta">
          <span className="popular-account-card-chip">
            <Users size={11} />
            {account.heroCount}
          </span>
          <span className="popular-account-card-chip">
            <Sparkles size={11} />
            {account.skinCount}
          </span>
          <span className="popular-account-card-chip popular-account-card-chip--muted">
            {account.winRate}% WR
          </span>
        </div>

        <div className="popular-account-card-footer">
          <div className="popular-account-card-price-block">
            <span className="popular-account-card-price">{formattedPrice}</span>
            <span className="popular-account-card-currency">MMK</span>
          </div>
          <div className="popular-account-card-seller">
            <Star size={11} className="popular-account-card-star" fill="currentColor" />
            <span>{account.seller.rating}</span>
            <span className="popular-account-card-dot">·</span>
            <span className="popular-account-card-shop">{account.seller.shopName}</span>
          </div>
          <span className="popular-account-card-arrow" aria-hidden="true">
            <ArrowUpRight size={16} strokeWidth={2} />
          </span>
        </div>
      </div>
    </Link>
  );
};
