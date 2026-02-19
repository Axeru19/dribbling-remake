import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "Dribbling",
    template: "%s | Dribbling",
  },
  description: "Gestione squadre e giocatori di basket",
  applicationName: "Dribbling",
  keywords: ["basket", "basketball", "squadra", "giocatori", "gestione"],
  authors: [{ name: "Dribbling Team" }],
  // PWA manifest
  manifest: "/manifest.json",
  // iOS PWA support
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Dribbling",
    startupImage: [
      // iPhone 16 Pro Max
      {
        url: "/screenshots/screenshot-mobile.png",
        media:
          "(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3)",
      },
      // iPhone 14 Pro / 15 Pro
      {
        url: "/screenshots/screenshot-mobile.png",
        media:
          "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
  // Open Graph
  openGraph: {
    type: "website",
    title: "Dribbling",
    description: "Gestione squadre e giocatori di basket",
    siteName: "Dribbling",
  },
  // Icons
  icons: {
    icon: [
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/icons/icon-maskable-512x512.png",
      },
    ],
  },
  // Mobile
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <head>
        {/* Android Chrome PWA */}
        <meta name="mobile-web-app-capable" content="yes" />
        {/* Evita che il browser rilevi automaticamente i numeri di telefono */}
        <meta name="format-detection" content="telephone=no" />
        {/* MS Tiles (Windows Phone legacy) */}
        <meta name="msapplication-TileColor" content="#1a1a1a" />
        <meta
          name="msapplication-TileImage"
          content="/icons/icon-192x192.png"
        />
      </head>
      <body>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
