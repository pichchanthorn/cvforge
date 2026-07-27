import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages — no server runtime available there.
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
