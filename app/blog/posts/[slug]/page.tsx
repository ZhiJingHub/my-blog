import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { getPostBySlug, getAllPosts, renderMarkdown } from "@/lib/utils/posts"
import { siteConfig } from "@/lib/config/site"

type PostPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: `${post.title} | ${siteConfig.name}`,
      description: post.description ?? "",
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
    },
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) notFound()

  const html = await renderMarkdown(post.content)

  return (
    <div className="min-h-screen bg-background">
      <article className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
        {/* 文章头部 */}
        <header className="mb-10">
          {/* 返回链接 */}
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon icon="mdi:arrow-left" className="size-4" />
            返回博客
          </Link>

          {/* 标签 */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* 标题 */}
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>

          {/* 日期 */}
          <time className="mt-3 block text-sm text-muted-foreground" dateTime={post.date}>
            {post.date}
          </time>
        </header>

        {/* 文章正文 */}
        <div
          className="prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-a:text-foreground prose-a:no-underline hover:prose-a:underline prose-pre:bg-muted prose-pre:border"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* 底部分隔与返回 */}
        <div className="mt-16 border-t pt-8 text-center">
          <Link
            href="/blog"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "inline-flex items-center gap-1"
            )}
          >
            <Icon icon="mdi:arrow-left" className="mr-2 size-4" />
            返回博客列表
          </Link>
        </div>
      </article>
    </div>
  )
}
