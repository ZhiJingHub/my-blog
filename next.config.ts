import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Workers 不支持 sharp，禁用 Next.js 图片优化
  // 由 Cloudflare 网络直接提供原始图片
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "iwexe.top",
      },
    ],
  },
};

export default nextConfig;
