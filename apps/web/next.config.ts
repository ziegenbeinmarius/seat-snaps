import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@seat-snaps/shared"],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
