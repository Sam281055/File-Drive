import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "disciplined-dachshund-368.convex.cloud"
      }
    ]
  },
};

export default nextConfig;
