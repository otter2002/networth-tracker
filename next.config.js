/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is now stable in Next.js 14
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless']
  },
  // Vercel optimizations
  swcMinify: true
}

module.exports = nextConfig 