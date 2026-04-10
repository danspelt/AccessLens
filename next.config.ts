import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['mongodb', 'bcryptjs'],
  async redirects() {
    return [{ source: '/login', destination: '/signin', permanent: true }];
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
    return [
      {
        source: '/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
