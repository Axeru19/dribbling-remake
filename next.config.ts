import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  // Disabilita SW in development per evitare interferenze
  disable: process.env.NODE_ENV === "development",
  // Aggressivo caching nell'app shell
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  // Ricarica quando torna online dopo essere stato offline
  reloadOnOnline: true,
  // Gestisce il fallback offline
  fallbacks: {
    document: "/offline",
  },
  workboxOptions: {
    // Esclude le API routes dal pre-caching (dati sempre live)
    exclude: [/middleware-manifest\.json$/],
    runtimeCaching: [
      // API Routes: sempre dalla rete, fallback cache se offline
      {
        urlPattern: /^\/api\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 60 * 60, // 1 ora
          },
          networkTimeoutSeconds: 10,
        },
      },
      // Static assets Next.js: CacheFirst (cambiano con ogni build)
      {
        urlPattern: /^\/_next\/static\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-static-cache",
          expiration: {
            maxEntries: 128,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 giorni
          },
        },
      },
      // Next.js image optimization
      {
        urlPattern: /^\/_next\/image\?.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "next-image-cache",
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 60 * 60 * 24, // 1 giorno
          },
        },
      },
      // Pagine dell'app: StaleWhileRevalidate per buona UX offline
      {
        urlPattern: /^\/dashboard\/.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "pages-cache",
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 60 * 60, // 1 ora
          },
        },
      },
      // Google Fonts
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "google-fonts-stylesheets",
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts-webfonts",
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 anno
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
};

export default withPWA(nextConfig);
