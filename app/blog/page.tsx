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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/posts/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-foreground/20 hover:shadow-md"
              >
                {/* 封面图 */}
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {post.cover ? (
                    <img
                      src={post.cover}
                      alt={post.title}
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <Icon icon="mdi:image-outline" className="size-12 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                {/* 内容区 */}
                <div className="flex flex-1 flex-col p-5">
                  {/* 标签 */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="mb-3">
                      <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        {post.tags[0]}
                      </span>
                    </div>
                  )}

                  {/* 标题 */}
                  <h2 className="text-lg font-bold leading-tight tracking-tight transition-colors group-hover:text-foreground/70 line-clamp-2">
                    {post.title}
                  </h2>

                  {/* 描述 */}
                  {post.description && (
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                      {post.description}
                    </p>
                  )}

                  {/* 日期 */}
                  <time
                    className="mt-4 text-xs font-medium text-muted-foreground/70"
                    dateTime={post.date}
                  >
                    {post.date}
                  </time>
                </div>
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
