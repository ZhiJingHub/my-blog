import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 启用缓存组件 + Partial Prerendering (PPR)
  // 静态外壳（layout）立即渲染，动态内容通过 Suspense 流式加载
  cacheComponents: true,
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
