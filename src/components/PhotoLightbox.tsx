"use client";

import React, { useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import type { GalleryItem } from "@/types/portfolio";
import { formatEditorialDate } from "@/lib/video-utils";

interface PhotoLightboxProps {
  images: GalleryItem[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}

export function PhotoLightbox({
  images,
  currentIndex,
  onClose,
  onNavigate,
}: PhotoLightboxProps) {
  useEffect(() => {
    if (currentIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        onNavigate((currentIndex - 1 + images.length) % images.length);
      }
      if (e.key === "ArrowRight") {
        onNavigate((currentIndex + 1) % images.length);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [currentIndex, images.length, onClose, onNavigate]);

  if (currentIndex === null || !images[currentIndex]) return null;
  const item = images[currentIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.caption}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close lightbox"
        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 rounded-sm"
      >
        <X className="w-6 h-6" />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((currentIndex - 1 + images.length) % images.length);
            }}
            aria-label="Previous photo"
            className="absolute left-3 sm:left-6 p-2.5 text-white/85 hover:text-white bg-white/10 hover:bg-white/20 rounded-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((currentIndex + 1) % images.length);
            }}
            aria-label="Next photo"
            className="absolute right-3 sm:right-6 p-2.5 text-white/85 hover:text-white bg-white/10 hover:bg-white/20 rounded-sm"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      <div
        className="max-w-5xl w-full flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative max-h-[75vh] w-full flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt={item.caption}
            loading="lazy"
            decoding="async"
            className="max-h-[75vh] max-w-full object-contain rounded-sm shadow-2xl"
          />
        </div>
        <div className="w-full max-w-3xl text-center space-y-1.5 px-2">
          <div className="flex items-center justify-center gap-3 text-xs font-mono uppercase tracking-wider text-white/60">
            <span className="text-[#DF3B42]">{item.category}</span>
            {item.takenDate && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatEditorialDate(item.takenDate)}
              </span>
            )}
            <span>
              {currentIndex + 1} / {images.length}
            </span>
          </div>
          {item.title && (
            <h4 className="font-serif text-lg font-semibold text-white">{item.title}</h4>
          )}
          <p className="text-sm text-white/85 leading-relaxed">{item.caption}</p>
        </div>
      </div>
    </div>
  );
}
