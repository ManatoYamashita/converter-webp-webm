import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://webplyzer.app";
const ogImage = "/ogp.webp";
const favicon = "/favicon.ico";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Webplyzer | Batch WebP Converter",
    template: "%s | Webplyzer",
  },
  description: "Convert JPG, JPEG, PNG, SVG, HEIC images to WebP in perfect order with drag-and-drop and sequential naming.",
  keywords: ["WebP converter", "image optimizer", "batch convert", "drag and drop", "webplyzer"],
  icons: {
    icon: favicon,
    shortcut: favicon,
    apple: favicon,
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Webplyzer | Batch WebP Converter",
    description: "Drag, reorder, and convert images to WebP with sequential filenames and ZIP export.",
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
    description: "Convert JPG, PNG, SVG, HEIC to WebP with drag-and-drop and ZIP export.",
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
