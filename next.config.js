/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 👇 Add this line to tell Next.js where your real project root is
  outputFileTracingRoot: __dirname,

  images: {
    // Allow Next's Image Optimization to fetch images from your S3 bucket host.
    // This supports images served from the hostname (query params on presigned URLs are allowed).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "prem-industries-ecom-images.s3.ap-south-1.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
