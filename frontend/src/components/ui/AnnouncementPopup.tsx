"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Megaphone } from "lucide-react";
import Link from "next/link";
import { GlassButton } from "./GlassButton";

interface Announcement {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
}

export function AnnouncementPopup({ announcement }: { announcement: Announcement | null }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Wait a short moment before showing popup for better UX
    if (announcement) {
      const timer = setTimeout(() => {
        // Optional: Check local storage to not show the same popup if they already dismissed it
        const dismissed = localStorage.getItem(`dismissed_announcement_${announcement.id}`);
        if (!dismissed) {
          setIsOpen(true);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [announcement]);

  if (!announcement) return null;

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(`dismissed_announcement_${announcement.id}`, "true");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Popup Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Close Button - Highly Visible and Theme-Aware */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-30 w-10 h-10 flex items-center justify-center bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-black/80 text-black dark:text-white rounded-full shadow-xl transition-colors border border-gray-300 dark:border-white/20"
              aria-label="Close"
            >
              <X size={20} strokeWidth={3} />
            </button>

            {/* Optional Image */}
            {announcement.imageUrl && (
              <div className="w-full aspect-video relative bg-gray-100 dark:bg-black">
                <img
                  src={announcement.imageUrl}
                  alt={announcement.title}
                  className="w-full h-full object-cover"
                />
                {/* Smooth fade effect at the bottom to blend into the modal body */}
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-zinc-900" />
              </div>
            )}

            {/* Content Container */}
            <div className={`p-6 sm:p-8 ${!announcement.imageUrl ? "pt-10" : ""}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-brand-pink/10 text-brand-pink rounded-xl">
                  <Megaphone size={20} />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">
                  {announcement.title}
                </h3>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-white/80 leading-relaxed whitespace-pre-wrap font-medium">
                  {announcement.content}
                </p>
              </div>

              {/* Action Buttons */}
              {announcement.buttonText && announcement.buttonUrl && (
                <div className="mt-10 pt-8 border-t border-gray-100 dark:border-white/10 flex justify-center">
                  <Link href={announcement.buttonUrl} onClick={handleClose} className="w-full block">
                    <button className="w-full py-5 bg-[#d4b589] text-[#111111] font-black text-xl sm:text-2xl rounded-full hover:bg-[#c2a47a] transition-colors shadow-lg">
                      {announcement.buttonText}
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
