/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['next-auth'],
  // Disable static generation for pages that use authentication
  output: 'standalone',
  // Configure React 19 compatibility
  experimental: {
    optimizePackageImports: ['next-auth'],
  },
}

export default nextConfig
