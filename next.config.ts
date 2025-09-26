import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@chakra-ui/react', '@chakra-ui/icons'],
  },

  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // Compression
  compress: true,

  // Production optimization
  ...(process.env.NODE_ENV === 'production' && {
    output: 'standalone',
  }),
};

export default nextConfig;
