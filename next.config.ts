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
    const useRemoteAuth = process.env.USE_REMOTE_AUTH === "1";
    if (!useRemoteAuth) {
      return { beforeFiles: [] };
    }

    return {
      beforeFiles: [
        {
          source: '/api/auth/:path*',
          destination: `${backendBaseUrl}/api/auth/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
