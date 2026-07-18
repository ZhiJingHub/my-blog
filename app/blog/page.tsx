import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
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
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">博客</h1>
          <p className="mt-2 text-muted-foreground">记录技术思考与成长历程</p>
        </div>

        {/* 文章列表 */}
        {posts.length === 0 ? (
          <Card className="relative overflow-hidden">
            <CardHeader className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <CardTitle className="text-center text-5xl font-black tracking-widest text-foreground/[0.06] dark:text-foreground/[0.08] select-none">
                空
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 flex flex-col items-center gap-4 py-16">
              <Icon icon="mdi:file-document-outline" className="size-12 text-muted-foreground" />
              <p className="text-muted-foreground">还没有文章，敬请期待</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <Card key={post.slug} className="group relative overflow-hidden transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <Link href={`/blog/posts/${post.slug}`} className="block">
                    <article>
                      {/* 日期 */}
                      <time className="text-sm text-muted-foreground" dateTime={post.date}>
                        {post.date}
                      </time>

                      {/* 标题 */}
                      <h2 className="mt-1 text-xl font-semibold tracking-tight group-hover:text-foreground/80 transition-colors">
                        {post.title}
                      </h2>

                      {/* 描述 */}
                      {post.description && (
                        <p className="mt-2 text-muted-foreground line-clamp-2">{post.description}</p>
                      )}

                      {/* 标签 */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {post.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </article>
                  </Link>
                </CardContent>
              </Card>
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
