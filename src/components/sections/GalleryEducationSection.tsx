"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Camera, GraduationCap, MapPin, Calendar, Maximize2, ArrowUpRight } from "lucide-react";
import type { GalleryItem, ParsedProfile } from "@/types/portfolio";
import { GALLERY_CATEGORIES } from "@/lib/defaults";
import { PhotoLightbox } from "@/components/PhotoLightbox";

interface GalleryEducationSectionProps {
  images: GalleryItem[];
  profile: ParsedProfile;
}

export function GalleryEducationSection({
  images,
  profile,
}: GalleryEducationSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (selectedCategory === "All") return images;
    return images.filter((img) => img.category === selectedCategory);
  }, [images, selectedCategory]);

  return (
    <>
      {/* G. Photo Gallery */}
      <section
        id="gallery"
        className="py-16 sm:py-24 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)]"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-2 max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--accent-crimson)]">
              06 / Photo Gallery
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
              From the Newsroom & Field
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)]">
              Reporting moments, newsroom activities, interviews, media events, and portraits.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {["All", ...GALLERY_CATEGORIES].map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-sm border transition-colors ${
                    active
                      ? "bg-[#0D1B2A] text-white border-[#0D1B2A] dark:bg-[#F4F1EA] dark:text-[#0D1B2A] dark:border-[#F4F1EA]"
                      : "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--text-primary)]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {images.length === 0 ? (
            <div className="border border-dashed border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-10 sm:p-14 text-center rounded-sm space-y-4">
              <div className="mx-auto w-14 h-14 flex items-center justify-center border border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-sm text-[var(--accent-crimson)]">
                <Camera className="w-7 h-7" />
              </div>
              <div className="max-w-lg mx-auto space-y-2">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                  Photo Archive — Ready for Field Moments
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Behind-the-scenes newsroom photographs, interview frames, and field coverage
                  images uploaded via the Admin Dashboard will be displayed here with an
                  interactive lightbox.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--accent-crimson)] text-[var(--text-primary)] rounded-sm transition-colors"
                >
                  <span>Upload Photos in Admin</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-center rounded-sm">
              <p className="text-sm text-[var(--text-secondary)]">
                No photographs found in this category yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className="group relative aspect-[4/3] w-full overflow-hidden border border-[var(--border-subtle)] bg-[#0D1B2A] rounded-sm text-left"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={item.imageUrl}
                        alt={item.caption}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
                  <span className="absolute top-3 right-3 p-1.5 bg-black/50 text-white rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-4 h-4" />
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-4 space-y-1">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#DF3B42]">
                      {item.category}
                    </span>
                    <p className="text-sm font-medium text-white line-clamp-2">
                      {item.caption}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <PhotoLightbox
          images={filtered}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      </section>

      {/* H. Education */}
      <section
        id="education"
        className="py-16 sm:py-24 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)]"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-2 max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--accent-crimson)]">
              07 / Education
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
              Academic Foundation
            </h2>
          </div>

          <div className="relative pl-6 sm:pl-10 border-l-2 border-[var(--border-subtle)] space-y-8">
            {profile.education.map((edu, idx) => (
              <motion.div
                key={edu.id || edu.degree}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                className="relative"
              >
                <span className="absolute -left-[33px] sm:-left-[49px] top-6 h-4 w-4 rounded-full bg-[var(--accent-crimson)] border-4 border-[var(--bg-secondary)]" />
                <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:p-7 rounded-sm shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--accent-crimson)]">
                      <GraduationCap className="w-4 h-4" />
                      <span>Academic Qualification</span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                      {edu.degree}
                    </h3>
                    <p className="text-base font-medium text-[var(--text-secondary)]">
                      {edu.institution}
                    </p>
                    {edu.notes && (
                      <p className="text-sm text-[var(--text-muted)] max-w-2xl pt-1">
                        {edu.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-xs font-mono uppercase tracking-wider text-[var(--text-primary)] rounded-sm">
                      <Calendar className="w-3.5 h-3.5 text-[var(--accent-crimson)]" />
                      {edu.period}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                      <MapPin className="w-3.5 h-3.5" />
                      {edu.location}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
