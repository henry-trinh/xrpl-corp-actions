import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // Prevent ESLint errors from failing `next build` on Vercel
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
