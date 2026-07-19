import { defineCollection, defineConfig, s } from "velite"

// 博客文章集合：构建时解析 frontmatter 并校验类型安全
const posts = defineCollection({
  name: "Post",
  pattern: "content/posts/*.{md,mdx}",
  schema: s.object({
    slug: s.slug("posts"),
    title: s.string(),
    date: s.isodate(),
    description: s.string().optional(),
    tags: s.array(s.string()).default([]),
    cover: s.string().optional(),
    draft: s.boolean().default(false),
    // 保留原始 MDX 源码，运行时由 next-mdx-remote 编译渲染
    content: s.raw(),
  }),
})

// 友链集合：构建时读取 JSON 文件，消除运行时 fs 操作
const friends = defineCollection({
  name: "FriendLink",
  pattern: "data/friends/*.json",
  schema: s.object({
    name: s.string(),
    url: s.string(),
    avatar: s.string().optional().nullable(),
    description: s.string().optional(),
    backlink: s.string().optional(),
    vip: s.boolean().default(false),
  }),
})

export default defineConfig({
  collections: { posts, friends },
})
