"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn"; // we can create a tiny util folder or use a inline function

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative inline-flex items-center justify-center font-semibold rounded-full overflow-hidden transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-pink/50 cursor-pointer",
          // Size
          size === "sm" && "px-4 py-1.5 text-xs",
          size === "md" && "px-6 py-2.5 text-sm",
          size === "lg" && "px-8 py-3.5 text-base",
          // Variant
          variant === "primary" && "bg-gradient-to-r from-brand-pink to-brand-purple text-white shadow-[0_4px_15px_rgba(255,46,147,0.35)] hover:shadow-[0_6px_20px_rgba(255,46,147,0.55)]",
          variant === "secondary" && "bg-dark-card border border-brand-purple/20 text-white hover:bg-dark-card/80 hover:border-brand-pink/30",
          variant === "outline" && "border border-brand-pink text-brand-pink hover:bg-brand-pink/10 shadow-[inset_0_0_8px_rgba(255,46,147,0.05)]",
          variant === "danger" && "bg-gradient-to-r from-red-600 to-pink-700 text-white shadow-[0_4px_15px_rgba(220,38,38,0.3)]",
          className
        )}
        {...(props as any)}
      >
        {/* Glow highlight inside */}
        {variant === "primary" && (
          <span className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0)_0%,rgba(255,255,255,0.25)_50%,rgba(255,255,255,0)_100%)] -skew-x-12 translate-x-[-150%] hover:animate-[shine_0.75s_ease]" />
        )}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </motion.button>
    );
  }
);

GlassButton.displayName = "GlassButton";
