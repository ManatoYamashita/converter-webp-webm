import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://webplyzer.app";
const ogImage = "/ogp.webp";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Webplyzer | Batch WebP Converter",
    template: "%s | Webplyzer",
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
    "webplyzer",
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
    title: "Webplyzer | Batch WebP Converter",
    description:
      "Drag, reorder, and convert images to WebP and videos to WebM with sequential filenames and ZIP export.",
    url: siteUrl,
    siteName: "Webplyzer",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Webplyzer - Batch WebP Converter",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Webplyzer | Batch WebP Converter",
    description: "Convert images to WebP and videos to WebM with drag-and-drop and ZIP export.",
    images: [ogImage],
  },
  applicationName: "Webplyzer",
  authors: [{ name: "Webplyzer" }],
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
    <html lang="en" className="dark">
      <body className="font-sans">{children}</body>
    </html>
  );
}
