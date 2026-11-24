import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sanjana Pandey | News Reporter, Journalist & News Anchor",
    template: "%s | Sanjana Pandey",
  },
  description:
    "Official digital journalism portfolio of Sanjana Pandey — News Reporter, Journalist, and News Anchor based in Ranchi, Jharkhand. Featuring reporting reels, dispatches, and media credentials.",
  keywords: [
    "Sanjana Pandey",
    "News Reporter",
    "Journalist",
    "News Anchor",
    "Ranchi",
    "Jharkhand",
    "Mass Communication",
    "Global Awaaz News Channel",
    "Broadcast Journalism Portfolio",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Sanjana Pandey — Journalism Portfolio",
    title: "Sanjana Pandey | News Reporter, Journalist & News Anchor",
    description:
      "Telling Stories. Reporting Truth. Connecting People. Explore reporting reels, articles, and editorial experience of Sanjana Pandey.",
    images: [
      {
        url: "/images/sanjana-hero.jpg",
        width: 900,
        height: 1200,
        alt: "Sanjana Pandey — News Reporter, Journalist & News Anchor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sanjana Pandey | News Reporter, Journalist & News Anchor",
    description: "Telling Stories. Reporting Truth. Connecting People.",
    images: ["/images/sanjana-hero.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Playfair+Display:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
