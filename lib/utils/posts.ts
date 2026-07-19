import { cache } from "react"
import { posts } from "@/.velite"

export type Post = (typeof posts)[number]

// velite 在构建时将 Markdown/MDX 解析为类型安全的内容集合
export const getAllPosts = cache(() => {
  return posts
    .filter((post) => !post.draft)
    .sort((a, b) => (a.date > b.date ? -1 : 1))
})

export const getPostBySlug = cache((slug: string) => {
  return posts.find((post) => post.slug === slug) ?? null
})
