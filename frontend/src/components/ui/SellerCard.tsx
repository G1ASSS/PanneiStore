"use client";

import React from "react";
import Link from "lucide-react"; // Wait, Link is from next/link, Lucide-react doesn't have Link except as icon. Let's make sure we import from next/link!
import NextLink from "next/link";
import { LiquidCard } from "./LiquidCard";
import { Star, ShoppingBag, MessageSquare, BadgeCheck } from "lucide-react";
import { GlassButton } from "./GlassButton";

export interface SellerData {
  id: string;
  shopName: string;
  shopNameMyanmar?: string | null;
  bio?: string | null;
  bioMyanmar?: string | null;
  avatar?: string | null;
  rating: number;
  totalSales: number;
  reviewCount: number;
  responseRate: number;
}

interface SellerCardProps {
  seller: SellerData;
  locale?: "en" | "my";
}

export const SellerCard: React.FC<SellerCardProps> = ({ seller, locale = "en" }) => {
  const shopName = (locale === "my" && seller.shopNameMyanmar) ? seller.shopNameMyanmar : seller.shopName;
  const bio = (locale === "my" && seller.bioMyanmar) ? seller.bioMyanmar : seller.bio;

  return (
    <LiquidCard className="p-6 flex flex-col justify-between" glow>
      <div>
        {/* Header Profile */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-brand-purple/10 border border-brand-purple/20 relative flex-shrink-0">
            {seller.avatar ? (
              <img src={seller.avatar} alt={seller.shopName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-brand-pink to-brand-purple flex items-center justify-center font-extrabold text-white text-lg">
                {seller.shopName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <h3 className="font-bold text-white text-base group-hover:text-brand-pink transition-colors">
                {shopName}
              </h3>
              <BadgeCheck size={16} className="text-brand-cyan filter drop-shadow-[0_0_4px_rgba(0,245,255,0.4)]" />
            </div>
            {/* Stars rating */}
            <div className="flex items-center gap-1.5 mt-1 text-xs text-yellow-400 font-bold">
              <Star size={13} fill="currentColor" />
              <span>{seller.rating.toFixed(1)}</span>
              <span className="text-gray-500 font-normal">({seller.reviewCount} reviews)</span>
            </div>
          </div>
        </div>

        {/* Bio description */}
        {bio && (
          <p className="text-xs text-gray-400 line-clamp-2 mt-4 leading-relaxed">
            {bio}
          </p>
        )}

        {/* Short stats */}
        <div className="grid grid-cols-2 gap-4 mt-5 py-3 border-y border-white/5 text-center">
          <div>
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total Sales</div>
            <div className="text-sm font-extrabold text-white flex items-center justify-center gap-1 mt-0.5">
              <ShoppingBag size={13} className="text-brand-pink" /> {seller.totalSales}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Response Rate</div>
            <div className="text-sm font-extrabold text-white mt-0.5">
              {seller.responseRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex gap-2.5 mt-6">
        <NextLink href={`/chat?receiverId=${seller.id}`} className="flex-1">
          <GlassButton variant="secondary" size="sm" className="w-full gap-1.5 py-2">
            <MessageSquare size={14} /> Chat
          </GlassButton>
        </NextLink>
        <NextLink href={`/sellers/${seller.id}`} className="flex-1">
          <GlassButton variant="outline" size="sm" className="w-full py-2">
            View Shop
          </GlassButton>
        </NextLink>
      </div>
    </LiquidCard>
  );
};
