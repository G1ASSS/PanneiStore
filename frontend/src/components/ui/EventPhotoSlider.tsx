"use client";

import React, { useState, useEffect } from "react";

interface EventPhoto {
  id: string;
  title: string;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
}

interface EventPhotoSliderProps {
  photos: EventPhoto[];
  autoSlideInterval?: number;
}

export function EventPhotoSlider({ photos, autoSlideInterval = 5000 }: EventPhotoSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const activePhotos = photos.filter((photo) => photo.isActive);

  useEffect(() => {
    if (activePhotos.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % activePhotos.length);
        setIsTransitioning(false);
      }, 300);
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [activePhotos.length, autoSlideInterval]);

  const goToSlide = (index: number) => {
    if (index === currentIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  if (activePhotos.length === 0) {
    return (
      <div className="relative aspect-square rounded-2xl overflow-hidden border theme-soft-border flex items-center justify-center">
        <div className="absolute inset-0 hero-icon-grid" />
        <div className="relative flex flex-col items-center justify-center gap-5 text-center">
          <div className="hero-store-icon">
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-black uppercase tracking-[0.3em] text-brand-pink">PanneiStore</div>
            <div className="theme-heading text-2xl md:text-3xl font-black uppercase mt-2">MLBB Market</div>
          </div>
        </div>
      </div>
    );
  }

  const currentPhoto = activePhotos[currentIndex];

  return (
    <div className="relative aspect-square rounded-2xl overflow-hidden border theme-soft-border">
      <img
        src={currentPhoto.imageUrl}
        alt={currentPhoto.title}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      />
      
      {activePhotos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {activePhotos.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
