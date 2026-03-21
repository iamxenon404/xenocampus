/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['pub-*.r2.dev'],
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/django-api/:path*',
          destination: 'https://school-ecosystem-demo.onrender.com/:path*',
        },
      ]
    }
  },
  trailingSlash: false,
}

module.exports = nextConfig