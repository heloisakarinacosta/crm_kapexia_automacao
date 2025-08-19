/** @type {import("next").NextConfig} */
const nextConfig = {
  // output: 'standalone', // Removido para usar build padrão
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3005/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;

