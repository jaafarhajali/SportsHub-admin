import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com', 'localhost', 'images.unsplash.com'],  // add this line
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
