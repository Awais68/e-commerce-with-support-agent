/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Optimization on: external catalogue images are full-size JPEGs (often
    // >500 KB each) and the shop grid renders ~90 of them. Serving them raw was
    // the main cause of slow page loads.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fakestoreapi.com",
      },
      {
        protocol: "https",
        hostname: "kolzsticks.github.io",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "i.imgur.com",
      },
    ],
  },
}

export default nextConfig
