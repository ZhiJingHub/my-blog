import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPosts } from '@/lib/utils/posts';
import { siteConfig } from '@/lib/config/site';
import { formatDate } from '@/lib/utils/format';
import PageViews from '@/components/PageViews';
import PostContent from './PostContent';
import type { Metadata } from 'next';

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: '文章不存在',
      description: '该文章不存在或已被删除'
    };
  }

  return {
    title: `${post.metadata.title} - ${siteConfig.title}`,
    description: post.metadata.description
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
        {/* 返回按钮 */}
        <div className="mb-6">
          <a
            href="/posts"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← 返回文章列表
          </a>
        </div>

        {/* 文章头部 */}
        <header className="mb-8">
          {/* 元信息 */}
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <time dateTime={post.metadata.published} className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-primary" />
              {formatDate(post.metadata.published)}
            </time>
            <span className="text-border">•</span>
            <span className="flex items-center gap-1.5">
              <span>{post.metadata.stats.wordCount.toLocaleString()} 字</span>
            </span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-1.5">
              <span>约 {post.metadata.stats.readTime} 分钟</span>
            </span>
            <span className="text-border">•</span>
            <PageViews pathname={`/posts/${slug}/`} className="flex items-center gap-1.5" />
          </div>

          {/* 标题 */}
          <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {post.metadata.title}
          </h1>

          {/* 描述 */}
          <p className="text-lg text-muted-foreground">{post.metadata.description}</p>

          {/* 标签 */}
          {post.metadata.tags && post.metadata.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.metadata.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* 文章内容 */}
        <PostContent content={post.content} />

        {/* 返回按钮 */}
        <footer className="mt-12 border-t pt-8">
          <div className="flex justify-center">
            <a
              href="/posts"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-accent"
            >
              ← 返回文章列表
            </a>
          </div>
        </footer>
      </div>
    </article>
  );
}
