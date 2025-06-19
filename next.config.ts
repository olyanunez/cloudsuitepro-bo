import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compiler: {
    // Enable JSX transformation
    styledComponents: true,
  },
};

export default nextConfig;
