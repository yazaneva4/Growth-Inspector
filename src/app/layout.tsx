import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";
import "./globals.css";

// Fonts are self-hosted from npm packages (@fontsource/*) instead of
// next/font/google, so `next build` never depends on fonts.googleapis.com being
// reachable and well-formed (a malformed response there failed CI once).
// Same families, weights and subsets as before.

// Plus Jakarta Sans — rounded, premium sans-serif matching the brand logomark style.
const jakartaSans = localFont({
  variable: "--font-geist-sans",
  display: "swap",
  src: [
    { path: "../../node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../../node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
});

// Arabic-native typeface so Khaleeji/MSA content renders beautifully.
const notoArabic = localFont({
  variable: "--font-arabic",
  display: "swap",
  src: "../../node_modules/@fontsource-variable/noto-kufi-arabic/files/noto-kufi-arabic-arabic-wght-normal.woff2",
  weight: "100 900",
});

// Editorial serif for headlines and formal documents — same register as the
// serif Anthropic uses for its own long-form/editorial text.
const sourceSerif = localFont({
  variable: "--font-serif-brand",
  display: "swap",
  src: [
    { path: "../../node_modules/@fontsource/source-serif-4/files/source-serif-4-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../node_modules/@fontsource/source-serif-4/files/source-serif-4-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../node_modules/@fontsource/source-serif-4/files/source-serif-4-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — AI customer engagement for Saudi Arabia`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "AI customer service",
    "Saudi Arabia",
    "Arabic AI",
    "WhatsApp automation",
    "social media AI",
    "Khaleeji dialect",
    "growth analytics",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — AI customer engagement for Saudi Arabia`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
    alternateLocale: "ar_SA",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — AI customer engagement for Saudi Arabia`,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      data-app-revision={process.env.VERCEL_GIT_COMMIT_SHA || ""}
      lang="en"
      className={`${jakartaSans.variable} ${notoArabic.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}<Script src="/app-updates.js" strategy="afterInteractive" /></body>
    </html>
  );
}
