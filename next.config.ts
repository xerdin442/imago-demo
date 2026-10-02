import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@coinbase/cdp-sdk', '@reown/appkit'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.istockphoto.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com'
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org'
      }
    ],
  }
};

export default nextConfig;
