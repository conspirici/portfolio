import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        // In production, you should restrict this to your actual R2 domain
        // e.g., hostname: "pub-xxxxxxxxxxxx.r2.dev"
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
