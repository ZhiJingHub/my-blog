import type { Metadata } from "next"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { getAllPosts } from "@/lib/utils/posts"
import { siteConfig } from "@/lib/config/site"

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
      <div className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
        {/* 标题区域 */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">博客</h1>
          <p className="mt-2 text-muted-foreground">记录技术思考与成长历程</p>
        </div>

        {/* 文章列表 */}
        {posts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card py-12">
            <Icon icon="mdi:file-document-outline" className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">还没有文章</p>
          </div>
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border bg-card">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/posts/${post.slug}`}
                className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/50"
              >
                {/* 日期 */}
                <time
                  className="shrink-0 text-xs tabular-nums text-muted-foreground"
                  dateTime={post.date}
                >
                  {post.date}
                </time>

                {/* 分隔点 */}
                <span className="size-1 shrink-0 rounded-full bg-border" />

                {/* 标题 */}
                <h2 className="flex-1 truncate text-sm font-medium transition-colors group-hover:text-foreground">
                  {post.title}
                </h2>

                {/* 标签 */}
                {post.tags && post.tags.length > 0 && (
                  <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                    {post.tags[0]}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* 返回首页 */}
        <div className="mt-10 text-center">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "inline-flex items-center gap-1"
            )}
          >
            <Icon icon="mdi:arrow-left" className="mr-2 size-4" />
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
