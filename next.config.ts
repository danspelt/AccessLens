import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingIncludes: {
      '/api/health': ['./src/lib/db/**/*'],
    },
  },
};

export default nextConfig;

