import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Loaded at runtime on the server, never bundled (Agent Vault SDK drives a remote browser over a WebSocket).
  serverExternalPackages: ["@agentvault/playwright", "playwright-core", "ws"],
};

export default nextConfig;
