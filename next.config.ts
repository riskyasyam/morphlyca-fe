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
  // Fix turbopack configuration
  turbopack: {
    // Enable turbopack for faster builds
  },
  // Optimize for Docker
  output: 'standalone',
};

export default nextConfig;
