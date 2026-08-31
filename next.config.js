/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
  },
  // ARM64 SWC binary fallback — disable SWC native, force Babel transpilation.
  // This is needed on Hostinger KVM ARM and some CI environments where
  // @next/swc-linux-arm64 / @next/swc-android-arm64 binaries aren't published
  // for the exact installed Next.js version.
  webpack: (config, { dev, isServer }) => {
    if (!isServer && !dev) {
      // Disable SWC binary resolution at build time
      config.resolve.alias = {
        ...config.resolve.alias,
        '@next/swc-android-arm64': false,
        '@next/swc-linux-arm64-gnu': false,
        '@next/swc-linux-arm64-musl': false,
      };
    }
    return config;
  },
  // Disable SWC minify for ARM environments
  swcMinify: false,
};

module.exports = nextConfig;