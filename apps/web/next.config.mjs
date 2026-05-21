/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Standalone output bundles only the runtime files (no node_modules at
  // /, no monorepo siblings) into .next/standalone — the Docker image
  // can then ship a minimal final stage. See docs/DEPLOY.md.
  output: 'standalone',
};

export default nextConfig;
