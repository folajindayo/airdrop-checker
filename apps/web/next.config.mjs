/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@airdrop-finder/shared'],
  experimental: {
    optimizePackageImports: ["@radix-ui/react-icons"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
