/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Images are served via Next.js proxy routes from same domain
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drama.ctgs.link',
        pathname: '/portraits/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/portraits/**',
      },
    ],
  },
}

module.exports = nextConfig
