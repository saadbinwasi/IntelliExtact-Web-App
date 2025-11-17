/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  // Externalize packages that have native dependencies
  serverExternalPackages: ['tesseract.js', 'sharp'],
  // Add webpack config to handle tesseract.js worker paths
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Fix tesseract.js worker path resolution
      config.resolve.alias = {
        ...config.resolve.alias,
      }
    }
    return config
  },
  // Add empty turbopack config to avoid webpack/turbopack conflict
  turbopack: {},
}

module.exports = nextConfig

