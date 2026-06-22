"use client";

import React from "react";
import { cn } from "@/utils/cn";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "animate-pulse bg-white/5 border border-white/5 rounded-xl",
        className
      )}
      {...props}
    />
  );
};

export const AccountCardSkeleton: React.FC = () => {
  return (
    <div className="glass-panel rounded-2xl p-0 overflow-hidden flex flex-col h-full">
      {/* Aspect Ratio block */}
      <Skeleton className="aspect-[16/10] w-full rounded-b-none" />
      <div className="p-4 flex-1 flex flex-col justify-between gap-4">
        <div>
          <Skeleton className="h-4 w-1/3 mb-2" />
          <Skeleton className="h-5 w-3/4 mb-4" />
          <div className="flex justify-between border-b border-white/5 pb-3">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-6 w-1/3" />
          </div>
        </div>
        <div className="flex justify-between items-center mt-1">
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-7 w-2/5 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export const DiamondCardSkeleton: React.FC = () => {
  return (
    <div className="glass-panel rounded-2xl p-5 border border-brand-purple/10 flex flex-col items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-2xl" />
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-8 w-full border-t border-white/5 pt-3" />
    </div>
  );
};

export const TableRowSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-4 py-4 px-3 border-b border-white/5">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-8 w-24 rounded-lg" />
    </div>
  );
};
