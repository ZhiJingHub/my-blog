import type { Metadata } from "next"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { getPostBySlug, getAllPosts } from "@/lib/utils/posts"
import { MDXContent } from "@/components/MDXContent"
import { TableOfContents } from "@/components/TableOfContents"
import { extractToc } from "@/lib/utils/toc"
import { siteConfig } from "@/lib/config/site"

type PostPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = getAllPosts().map((post) => ({ slug: post.slug }))
  // cacheComponents 要求 generateStaticParams 至少返回一个结果
  return slugs.length > 0 ? slugs : [{ slug: "_empty" }]
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

  const toc = extractToc(post.content)

  return (
    <div className="min-h-screen bg-background">
      <div className="grid grid-cols-[1fr_minmax(0,48rem)_1fr] px-4 py-8 sm:py-12">
        <article className="col-start-2">
          {/* 文章头部 */}
          <header className="mb-10">
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
              {new Date(post.date).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}
            </time>
          </header>

          {/* 文章正文 */}
          <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-a:text-foreground prose-a:no-underline hover:prose-a:underline">
            <Suspense fallback={<div className="flex items-center gap-2 text-sm text-muted-foreground"><div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />加载中...</div>}>
              <MDXContent source={post.content} />
            </Suspense>
          </div>
        </article>

        <TableOfContents items={toc} />
      </div>
    </div>
  )
}
