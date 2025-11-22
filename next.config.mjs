/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // typedRoutes: true, // Disabled: Not compatible with Turbopack in Next.js 15.0.0-canary.57
    optimizePackageImports: ["sortablejs"],
  },
};

export default nextConfig;
