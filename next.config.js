/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // << add this line

  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
  // Ensure images from placeholder.svg are allowed
  images: {
    domains: ["placeholder.svg"],
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Handle webpack configuration for missing dependencies
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ignore pino-pretty on client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "pino-pretty": false,
      }
    }

    // Ignore specific modules that might cause issues
    config.externals = config.externals || []
    config.externals.push({
      "pino-pretty": "pino-pretty",
    })

    return config
  },
}

module.exports = nextConfig
