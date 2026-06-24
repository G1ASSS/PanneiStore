import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import "./pages.css";
import Providers from "@/components/Providers";
import { RouteScrollReset } from "@/components/layout/RouteScrollReset";
import Script from "next/script";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "PanneiStore — Myanmar's #1 MLBB Marketplace",
  description: "Buy and sell verified Mobile Legends accounts and diamond top-ups in Myanmar. Safe, fast, and trusted by thousands.",
  keywords: "MLBB accounts, mobile legends accounts, myanmar gaming, diamond topup, panneistore",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "PanneiStore — Myanmar's #1 MLBB Marketplace",
    description: "Buy and sell verified Mobile Legends accounts and diamond top-ups in Myanmar.",
    type: "website",
    images: [
      {
        url: "/seo.jpg",
        width: 1200,
        height: 630,
        alt: "PanneiStore - Myanmar's #1 MLBB Marketplace",
      },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full`} suppressHydrationWarning>
      <head>
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("panneistore-color-theme-v2");if(t==="blue-dark"||t==="light"){document.documentElement.dataset.theme=t;}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <Providers>
          <RouteScrollReset />
          {children}
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}

