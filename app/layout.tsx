import type React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const siteUrl = process.env.NEXT_PUBLIC_URL || "https://2ewbp.manapuraza.com";
const ogImage = `${siteUrl}/ogp.webp`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Converter WebP/WebM | Batch Image & Video Converter",
    template: "%s | Converter WebP/WebM",
  },
  description:
    "Convert JPG, JPEG, PNG, SVG, HEIC images to WebP and MP4, MOV, MKV, AVI, WEBM, M4V to WebM with drag-and-drop and sequential naming.",
  keywords: [
    "WebP converter",
    "WebM converter",
    "image optimizer",
    "video converter",
    "batch convert",
    "drag and drop",
    "converter webp webm",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-48x48.png", type: "image/png", sizes: "48x48" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { url: "/favicon-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/favicon-512x512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: [
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon.ico" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Converter WebP/WebM | Batch Image & Video Converter",
    description:
      "Drag, reorder, and convert images to WebP and videos to WebM with sequential filenames and ZIP export.",
    url: siteUrl,
    siteName: "Converter WebP/WebM",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Converter WebP/WebM - Batch Image & Video Converter",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Converter WebP/WebM | Batch Image & Video Converter",
    description: "Convert images to WebP and videos to WebM with drag-and-drop and ZIP export.",
    images: [ogImage],
  },
  applicationName: "Converter WebP/WebM",
  authors: [{ name: "Converter WebP/WebM" }],
  manifest: "/manifest.webmanifest",
  category: "utilities",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#2196f3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast: "dark:bg-dark-bg-secondary dark:text-dark-text-primary dark:border-dark-border-DEFAULT",
              success: "dark:bg-green-900/20 dark:text-green-400 dark:border-green-700",
              error: "dark:bg-red-900/20 dark:text-red-400 dark:border-red-700",
            },
          }}
          duration={4000}
        />
      </body>
    </html>
  );
}
