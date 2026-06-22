"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface LiquidCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glow?: boolean;
  children: React.ReactNode;
}

export const LiquidCard: React.FC<LiquidCardProps> = ({
  className,
  hoverEffect = true,
  glow = false,
  children,
  ...props
}) => {
  const CardComponent = hoverEffect ? motion.div : "div";
  
  return (
    <CardComponent
      {...(hoverEffect ? {
        whileHover: { y: -5, transition: { duration: 0.2 } }
      } : {})}
      className={cn(
        "glass-panel rounded-2xl p-5 overflow-hidden relative",
        glow && "before:absolute before:inset-0 before:bg-[radial-gradient(400px_at_50%_-100px,rgba(255,46,147,0.15),transparent)]",
        hoverEffect && "glass-panel-hover",
        className
      )}
      {...props as any}
    >
      {/* Decorative neon corner indicator */}
      {glow && (
        <span className="absolute top-0 right-0 w-20 h-[2px] bg-gradient-to-r from-transparent to-brand-pink opacity-50" />
      )}
      
      <div className="relative z-10">{children}</div>
    </CardComponent>
  );
};
