export const siteConfig = {
  name: "ZhiJing's Blog",
  title: "ZhiJing's Blog",
  subtitle: "一个基于 Next.js 构建的现代博客",
  url: "https://iwexe.top",
  icon: "/favicon.svg",
  description: "Go with the flow.",
  keywords: ["blog", "nextjs", "技术博客", "静态博客"],
  lang: "zh-CN",
  ogImage: "/og-image.svg",
  analytics: {
    umami: {
      src: "https://u.iwexe.top/script.js",
      websiteId: "6eda9065-3954-4f1f-8dee-5729460f3e92"
    }
  },
  author: {
    name: "致靖",
    url: "https://iwexe.top"
  },
  bio: {
    avatar: "https://iwexe.top/avatar.svg",
    name: "致靖",
    bio: "Go with the flow.",
    links: [
      {
        name: "GitHub",
        icon: "simple-icons:github",
        url: "https://github.com/ZhiJingHub",
        color: "#333333"
      },
      {
        name: "Telegram",
        icon: "simple-icons:telegram",
        url: "https://t.me/ZhiJing_PM_Bot",
        color: "#0088cc"
      },
      {
        name: "邮箱",
        icon: "mdi:email-outline",
        url: "mailto:me@iwexe.top"
      }
    ]
  },
  giscus: {
    repo: "ZhiJingHub/blog",
    repoId: "",
    category: "Announcements",
    categoryId: ""
  },
  navLinks: [
    { label: "博客", icon: "mdi:post-outline", href: "/blog" },
    { label: "封面制作", icon: "mdi:image-edit", href: "/cover" },
    { label: "格式转换", icon: "mdi:image-sync", href: "/convert" },
    { label: "水印", icon: "mdi:watermark", href: "/watermark" },
    { label: "友链", icon: "mdi:link-variant", href: "/friends" },
    { label: "统计", icon: "mdi:chart-line", href: "https://u.iwexe.top/share/WSuA9kxePFGSUVVD" }
  ] as const
}

export type SiteConfig = typeof siteConfig
