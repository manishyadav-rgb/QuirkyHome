import type { NextConfig } from "next";

const backendBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://qhbackend.onrender.com";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/auth/me',
          destination: `${backendBaseUrl}/api/auth/me`,
        },
        {
          source: '/api/auth/send-otp',
          destination: `${backendBaseUrl}/api/auth/send-otp`,
        },
        {
          source: '/api/auth/verify-otp',
          destination: `${backendBaseUrl}/api/auth/verify-otp`,
        },
        {
          source: '/api/auth/logout',
          destination: `${backendBaseUrl}/api/auth/logout`,
        },
        {
          source: '/api/auth/team-login',
          destination: `${backendBaseUrl}/api/auth/team-login`,
        },
      ],
    };
  },
};

export default nextConfig;
