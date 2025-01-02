/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.mode = 'production'; 
    return config;
  },
}

module.exports = nextConfig

