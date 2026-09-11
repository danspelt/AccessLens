import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['mongodb', 'bcryptjs'],
  async redirects() {
    return [
      { source: '/login', destination: '/signin', permanent: true },
      { source: '/places', destination: '/explore', permanent: false },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    const noIndexHeaders = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }];

    return [
      {
        source: '/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      ...[
        '/api/:path*',
        '/admin/:path*',
        '/dashboard/:path*',
        '/student/:path*',
        '/settings',
        '/favorites',
        '/my-reviews',
        '/my-places',
        '/activities',
        '/add-place',
        '/signin',
        '/signup/:path*',
        '/update-accessibility/:path*',
        '/places/new',
        '/places/:id/claim',
        '/places/:id/report',
        '/places/:id/update-accessibility',
        '/qr/:path*',
        '/pitch',
      ].map((source) => ({ source, headers: noIndexHeaders })),
    ];
  },
};

export default nextConfig;
