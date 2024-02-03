/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      "mongodb-client-encryption": false ,
      "aws4": false
      };
  
    return config;
  },

}

module.exports = nextConfig
