import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },
      // Cloudflare R2 public URL — set when R2 is configured
      // {
      //   protocol: "https",
      //   hostname: "cdn.yourdomain.com",
      //   pathname: "/**",
      // },
    ],
  },
};

export default nextConfig;
