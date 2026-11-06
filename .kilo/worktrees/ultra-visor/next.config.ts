/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.fbcdn.net',   // সব Facebook CDN সাবডোমেইন অনুমোদিত হবে
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;