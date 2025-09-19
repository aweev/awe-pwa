// next.config.ts
import bundleAnalyzer from '@next/bundle-analyzer';
import nextPWA from '@ducanh2912/next-pwa';
import createNextIntlPlugin from 'next-intl/plugin';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const withPWA = nextPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  fallbacks: { document: '/offline' },
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/res\.cloudinary\.com\//,
        handler: 'CacheFirst',
        options: {
          cacheName: 'cloudinary-images',
          expiration: { maxEntries: 100, maxAgeSeconds: 86400 },
        },
      },
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\//,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'supabase-assets',
          expiration: { maxEntries: 50, maxAgeSeconds: 3600 },
        },
      },
      {
        urlPattern: /^https:\/\/images\.unsplash\.com\//,
        handler: 'CacheFirst',
        options: {
          cacheName: 'unsplash-images',
          expiration: { maxEntries: 100, maxAgeSeconds: 86400 },
        },
      },
      {
        urlPattern: /^\/api\//,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-calls',
          networkTimeoutSeconds: 5,
          expiration: { maxEntries: 50, maxAgeSeconds: 300 },
        },
      },
    ],
  },
});

const withIntl = createNextIntlPlugin('./lib/i18n.ts');

function createCSP(dev: boolean) {
  return [
    "default-src 'self'",
    `script-src 'self'${dev ? " 'unsafe-inline' 'unsafe-eval'" : ''}`,
    `style-src 'self'${dev ? " 'unsafe-inline'" : ''}`,
    "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://*.supabase.co",
    "font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co https://api.cloudinary.com https://api.posthog.com",
    "media-src 'self' https://res.cloudinary.com https://*.supabase.co",
    "worker-src 'self' blob:",
    "frame-src 'self' https://js.stripe.com https://www.youtube.com https://player.vimeo.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
}

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
  {
    key: 'Content-Security-Policy',
    value: createCSP(process.env.NODE_ENV === 'development'),
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: process.cwd(),
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com'],
  },
  experimental: {},
};

export default withBundleAnalyzer(withPWA(withIntl(nextConfig)));
