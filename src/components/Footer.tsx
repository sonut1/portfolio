import React from "react";
import Link from "next/link";
import { Mail, MapPin, ArrowUpRight, Shield } from "lucide-react";
import { InstagramIcon, LinkedinIcon, YoutubeIcon } from "./BrandIcons";
import type { ParsedProfile } from "@/types/portfolio";
import { isEditablePlaceholder } from "@/lib/profile-parser";

export function Footer({ profile }: { profile: ParsedProfile }) {
  const hasEmail = !isEditablePlaceholder(profile.email);
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0D1B2A] text-[#F4F1EA] border-t border-[#1D2F47]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Identity */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-[#DF3B42]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">
                Portfolio
              </span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {profile.fullName}
            </h3>
            <p className="text-sm font-medium text-[#DF3B42] tracking-wide">
              {profile.designation}
            </p>
            <p className="text-sm text-white/70 leading-relaxed max-w-md">
              {profile.headline}
            </p>
            <div className="flex items-center gap-2 text-xs text-white/60 pt-1">
              <MapPin className="w-3.5 h-3.5 text-[#DF3B42]" />
              <span>{profile.location}</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">
              Sections
            </h4>
            <ul className="space-y-2 text-sm text-white/80">
              {[
                ["About Sanjana", "/#about"],
                ["Reporting Reels", "/#videos"],
                ["Reporting Experience", "/#experience"],
                ["Featured Stories", "/#articles"],
                ["Photo Gallery", "/#gallery"],
                ["Education", "/#education"],
                ["Contact & Hire", "/#contact"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">
              Press & Media Desk
            </h4>
            <div className="space-y-2.5 text-sm">
              {hasEmail ? (
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex items-center gap-2 text-white hover:text-[#DF3B42] transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#DF3B42]" />
                  <span>{profile.email}</span>
                </a>
              ) : (
                <div className="inline-flex items-center gap-2 text-white/60">

                  <a
                    href={`mailto:[EMAIL_ADDRESS]`}
                    className="inline-flex items-center gap-2 text-white hover:text-[#DF3B42] transition-colors"
                  >
                    <Mail className="w-4 h-4 text-[#DF3B42]" />
                    <span>sp6154817@gmail.com</span>
                  </a>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2">
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-white/15 bg-white/5 hover:bg-white/10 text-white rounded-sm transition-colors"
                >
                  <LinkedinIcon className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </a>
              )}
              {profile.instagramUrl && (
                <a
                  href={profile.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-white/15 bg-white/5 hover:bg-white/10 text-white rounded-sm transition-colors"
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                  <span>Instagram</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </a>
              )}
              {profile.youtubeUrl && (
                <a
                  href={profile.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-white/15 bg-white/5 hover:bg-white/10 text-white rounded-sm transition-colors"
                >
                  <YoutubeIcon className="w-3.5 h-3.5" />
                  <span>YouTube</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/55">
          <p>
            © {year} {profile.fullName}. All rights reserved.
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-white/60 hover:text-white transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Dashboard</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
