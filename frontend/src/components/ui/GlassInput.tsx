"use client";

import React from "react";
import { cn } from "@/utils/cn";

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, type = "text", label, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            "glass-input px-4 py-3 rounded-xl text-sm w-full transition-all duration-200 placeholder:text-gray-600",
            error && "border-red-500/50 focus:border-red-500 focus:ring-red-500/25",
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs font-medium text-red-400 pl-1">
            {error}
          </span>
        )}
      </div>
    );
  }
);

GlassInput.displayName = "GlassInput";
