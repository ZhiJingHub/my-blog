import type { Metadata } from "next"
import { Icon } from "@iconify/react"
import { getAllPosts } from "@/lib/utils/posts"
import { siteConfig } from "@/lib/config/site"
import { BlogList } from "@/components/BlogList"

export const metadata: Metadata = {
  title: "博客",
  description: "技术文章与思考",
  openGraph: {
    title: `博客 | ${siteConfig.name}`,
    description: "技术文章与思考",
  },
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-8 sm:py-12">
        {/* 标题区域 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">博客</h1>
          <p className="mt-2 text-muted-foreground">记录技术思考与成长历程</p>
        </div>

        {/* 博客列表（含搜索） */}
        <BlogList posts={posts} />
      </div>
    </div>
  )
}
