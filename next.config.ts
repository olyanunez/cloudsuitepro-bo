import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // Deshabilitar ESLint durante el build de producción
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Deshabilitar verificación de TypeScript durante el build
    ignoreBuildErrors: true,
  },
  compiler: {
    // Enable JSX transformation
    styledComponents: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
