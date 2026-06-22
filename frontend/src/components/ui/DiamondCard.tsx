"use client";

import React from "react";
import { LiquidCard } from "./LiquidCard";
import { Sparkles } from "lucide-react";
import { cn } from "@/utils/cn";

export interface DiamondPackageData {
  id: string;
  amount: number;
  bonusDiamonds: number;
  price: string | number;
  label?: string | null;
  labelMyanmar?: string | null;
  isPopular: boolean;
  isBestValue: boolean;
}

interface DiamondCardProps {
  pkg: DiamondPackageData;
  isSelected?: boolean;
  onSelect?: (pkg: DiamondPackageData) => void;
  locale?: "en" | "my";
}

export const DiamondCard: React.FC<DiamondCardProps> = ({
  pkg,
  isSelected = false,
  onSelect,
  locale = "en",
}) => {
  const label = (locale === "my" && pkg.labelMyanmar) ? pkg.labelMyanmar : pkg.label;
  const formattedPrice = new Intl.NumberFormat("en-US").format(Number(pkg.price));

  return (
    <LiquidCard
      hoverEffect
      onClick={() => onSelect?.(pkg)}
      className={cn(
        "cursor-pointer border transition-all duration-300 relative select-none",
        isSelected
          ? "border-brand-pink bg-brand-pink/10 shadow-[0_0_20px_rgba(255,46,147,0.25)]"
          : "border-brand-purple/20 hover:border-brand-pink/40"
      )}
    >
      {/* Popular or Best Value Badges */}
      {pkg.isPopular && (
        <span className="absolute -top-2.5 right-4 bg-gradient-to-r from-brand-pink to-brand-purple text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-white shadow-sm border border-brand-pink/20">
          Popular
        </span>
      )}
      {pkg.isBestValue && (
        <span className="absolute -top-2.5 right-4 bg-gradient-to-r from-brand-cyan to-brand-purple text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-black shadow-sm border border-brand-cyan/20">
          Best Value
        </span>
      )}

      <div className="flex flex-col gap-4 items-center text-center">
        {/* Diamond Icon & Amount */}
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-cyan/20 to-brand-pink/20 flex items-center justify-center border border-brand-cyan/20 shadow-md">
            {/* SVG Gem representation */}
            <svg
              className="w-7 h-7 text-brand-cyan filter drop-shadow-[0_0_8px_rgba(0,245,255,0.4)]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2L2 9.14L12 22L22 9.14L12 2Z" />
            </svg>
          </div>
          {pkg.bonusDiamonds > 0 && (
            <span className="absolute -bottom-1 -right-2 bg-brand-pink text-[9px] font-bold text-white px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
              <Sparkles size={8} /> +{pkg.bonusDiamonds}
            </span>
          )}
        </div>

        {/* Package info */}
        <div>
          <div className="text-xl font-extrabold text-white">
            {pkg.amount} <span className="text-xs font-semibold text-brand-cyan">Diamonds</span>
          </div>
          {label && (
            <div className="text-[10px] uppercase font-bold tracking-widest text-brand-pink/70 mt-1">
              {label}
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="w-full pt-3 border-t border-white/5 flex items-center justify-center gap-1">
          <span className="text-sm font-black text-white">{formattedPrice}</span>
          <span className="text-[10px] font-bold text-brand-pink">MMK</span>
        </div>
      </div>
    </LiquidCard>
  );
};
