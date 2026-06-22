"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function HeroBannerSlider({ banners }: { banners: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners || banners.length === 0) return null;

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % banners.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);

  return (
    <div className="relative w-full h-[300px] md:h-[400px] lg:h-[480px] rounded-3xl overflow-hidden mb-12 shadow-2xl border border-white/10 group">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Background Image */}
          {banners[currentIndex].imageUrl ? (
            <img
              src={banners[currentIndex].imageUrl}
              alt={banners[currentIndex].title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-brand-pink to-purple-900" />
          )}

          {/* Dark Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

          {/* Text Content */}
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 lg:px-24">
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 max-w-2xl leading-tight"
              style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
            >
              {banners[currentIndex].title}
            </motion.h2>

            {banners[currentIndex].subtitle && (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-lg md:text-xl text-white/90 mb-8 max-w-xl font-medium"
                style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
              >
                {banners[currentIndex].subtitle}
              </motion.p>
            )}

            {banners[currentIndex].buttonText && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Link
                  href={banners[currentIndex].buttonUrl || "#"}
                  className="inline-flex px-8 py-3.5 bg-brand-pink text-white font-bold rounded-xl hover:bg-brand-pink/90 transition-colors shadow-lg hover:shadow-brand-pink/25"
                >
                  {banners[currentIndex].buttonText}
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
          >
            <ChevronRight size={24} />
          </button>
          
          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentIndex ? "bg-brand-pink w-8" : "bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
