const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development" || true,
  register: false,
  skipWaiting: false,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    cpus: 1
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      },
      {
        protocol: "http",
        hostname: "**"
      }
    ]
  }
};

module.exports = withPWA(nextConfig);

