/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
      {
        source: '/preview/:path*',
        destination: 'http://localhost:8000/preview/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
