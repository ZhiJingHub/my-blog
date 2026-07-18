import type { Metadata } from "next"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
          <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card py-16">
            <Icon icon="mdi:file-document-outline" className="size-12 text-muted-foreground" />
            <p className="text-muted-foreground">还没有文章，敬请期待</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/posts/${post.slug}`}
                className="group relative block rounded-xl border border-border bg-card p-6 transition-all hover:border-foreground/20 hover:shadow-sm"
              >
                <article className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
                  {/* 日期 */}
                  <time
                    className="shrink-0 text-sm tabular-nums text-muted-foreground sm:w-24 sm:pt-0.5"
                    dateTime={post.date}
                  >
                    {post.date}
                  </time>

                  {/* 内容 */}
                  <div className="flex-1 space-y-2">
                    {/* 标题 */}
                    <h2 className="text-lg font-semibold tracking-tight transition-colors group-hover:text-foreground/80">
                      {post.title}
                    </h2>

                    {/* 描述 */}
                    {post.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{post.description}</p>
                    )}

                    {/* 标签 */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 箭头 */}
                  <div className="hidden shrink-0 items-center sm:flex">
                    <Icon
                      icon="mdi:arrow-right"
                      className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground"
                    />
                  </div>
                </article>
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
