/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 👇 Add this line to tell Next.js where your real project root is
  outputFileTracingRoot: __dirname,
};

module.exports = nextConfig;
