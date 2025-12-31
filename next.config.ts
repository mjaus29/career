import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  // Explicitly disable Turbopack to use webpack for PWA compatibility
  experimental: {
    turbopack: false,
  },
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  ...nextConfig,
});
