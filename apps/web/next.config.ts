import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@seat-snaps/shared"],
  typedRoutes: true,
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".jsx": [".tsx", ".jsx"],
    };
    return config;
  },
};

export default nextConfig;
