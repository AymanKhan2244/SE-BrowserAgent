/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: false,
  // Static export for production (served by FastAPI on port 8000)
  ...(isProd ? { output: 'export', distDir: 'out' } : {}),
  // Dev-mode rewrites: proxy API & preview calls to FastAPI
  ...(!isProd ? {
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
  } : {}),
};

module.exports = nextConfig;
