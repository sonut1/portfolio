"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Newspaper, Search, Calendar, MapPin, Film, ArrowRight, ArrowUpRight } from "lucide-react";
import type { ArticleItem } from "@/types/portfolio";
import { ARTICLE_CATEGORIES } from "@/lib/defaults";
import { formatEditorialDate } from "@/lib/video-utils";

export function ArticlesSection({ articles }: { articles: ArticleItem[] }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return articles.filter((a) => {
      const catMatch = selectedCategory === "All" || a.category === selectedCategory;
      const qMatch =
        !q ||
        a.headline.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        (a.location || "").toLowerCase().includes(q);
      return catMatch && qMatch;
    });
  }, [articles, selectedCategory, searchQuery]);

  return (
    <section
      id="articles"
      className="py-16 sm:py-24 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--accent-crimson)]">
              05 / Featured Stories & Articles
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
              Written Dispatches & Editorial Reports
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)]">
              Long-form reporting, feature stories, interview transcripts, and field notes.
            </p>
          </div>

          {articles.length > 0 && (
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, beats..."
                aria-label="Search articles"
                className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] rounded-sm focus:outline-none focus:border-[var(--accent-crimson)]"
              />
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {["All", ...ARTICLE_CATEGORIES].map((cat) => {
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

        {articles.length === 0 ? (
          <div className="border border-dashed border-[var(--border-subtle)] bg-[var(--bg-card)] p-10 sm:p-14 text-center rounded-sm space-y-4">
            <div className="mx-auto w-14 h-14 flex items-center justify-center border border-[var(--border-subtle)] bg-[var(--bg-secondary)] rounded-sm text-[var(--accent-crimson)]">
              <Newspaper className="w-7 h-7" />
            </div>
            <div className="max-w-lg mx-auto space-y-2">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                Editorial Desk — Stories Awaiting Publication
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Published stories, written dispatches, and feature reports created in the
                Newsroom Admin Dashboard will appear here with dedicated reader pages and
                linked broadcast clips.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--accent-crimson)] text-[var(--text-primary)] rounded-sm transition-colors"
              >
                <span>Write or Publish Story</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 border border-[var(--border-subtle)] bg-[var(--bg-card)] text-center rounded-sm">
            <p className="text-sm text-[var(--text-secondary)]">
              No published articles match your filter criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((article, idx) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="group border border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-sm overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
              >
                {article.coverImageUrl ? (
                  <Link
                    href={`/articles/${article.slug}`}
                    className="block relative aspect-[16/10] bg-[#0D1B2A] overflow-hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={article.coverImageUrl}
                        alt={article.headline}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                ) : (
                  <Link
                    href={`/articles/${article.slug}`}
                    className="block relative aspect-[16/10] bg-[#0D1B2A] text-white/70 flex items-center justify-center"
                  >
                    <Newspaper className="w-8 h-8 text-[#DF3B42]" />
                  </Link>
                )}

                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-wider">
                      <span className="text-[var(--accent-crimson)] font-semibold">
                        {article.category}
                      </span>
                      {article.publishedAt && (
                        <>
                          <span className="text-[var(--text-muted)]">•</span>
                          <span className="inline-flex items-center gap-1 text-[var(--text-muted)]">
                            <Calendar className="w-3 h-3" />
                            {formatEditorialDate(article.publishedAt)}
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="font-serif text-xl font-bold text-[var(--text-primary)] leading-snug group-hover:text-[var(--accent-crimson)] transition-colors">
                      <Link href={`/articles/${article.slug}`}>{article.headline}</Link>
                    </h3>

                    <p className="text-sm text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3 text-[var(--text-muted)]">
                      {article.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[var(--accent-crimson)]" />
                          {article.location}
                        </span>
                      )}
                      {article.relatedVideo && (
                        <span className="inline-flex items-center gap-1 text-[var(--accent-crimson)]">
                          <Film className="w-3 h-3" />
                          Video
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/articles/${article.slug}`}
                      className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-[var(--text-primary)] group-hover:text-[var(--accent-crimson)] transition-colors"
                    >
                      <span>Read</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
