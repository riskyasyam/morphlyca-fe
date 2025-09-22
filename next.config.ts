import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript type checking during production builds
    ignoreBuildErrors: true,
  },
  experimental: {
    // Enable turbopack for faster builds
    turbo: {},
  },
  // Optimize for Docker
  output: 'standalone',
};

export default nextConfig;
