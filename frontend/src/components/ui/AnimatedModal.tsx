"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const AnimatedModal: React.FC<AnimatedModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
}) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Card Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={cn(
              "relative w-full max-w-lg glass-panel p-6 rounded-3xl z-10 shadow-2xl border border-brand-pink/20 overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(400px_at_50%_-100px,rgba(255,46,147,0.1),transparent)]",
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-3">
              {title ? (
                <h2 className="text-lg font-bold text-white tracking-wide uppercase text-gradient-pink-purple pl-1">
                  {title}
                </h2>
              ) : (
                <div />
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-1 focus:ring-brand-pink/35 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Inner Content */}
            <div className="relative z-10">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
