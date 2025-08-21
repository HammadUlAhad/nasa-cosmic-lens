import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'apod.nasa.gov',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.nasa.gov',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'epic.gsfc.nasa.gov',
        pathname: '/archive/**',
      },
      {
        protocol: 'https',
        hostname: 'mars.nasa.gov',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'mars.jpl.nasa.gov',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'mars.jpl.nasa.gov',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images-assets.nasa.gov',
        pathname: '/**',
      }
    ],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if ESLint errors are present
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if there are type errors  
    ignoreBuildErrors: false,
  }
};

export default nextConfig;
