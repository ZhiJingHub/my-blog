import { getAllPosts } from '@/lib/utils/posts';
import { siteConfig } from '@/lib/config/site';
import PostCard from '@/components/PostCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `文章列表 - ${siteConfig.title}`,
  description: '浏览所有文章'
};

export default function PostsPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-6 sm:py-8">
        {/* 页面标题 */}
        <div className="mb-12">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">文章</h1>
          <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
        </div>

        {/* 文章列表 */}
        {posts.length === 0 ? (
          <div className="py-24 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted/50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-8 text-muted-foreground/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-base text-muted-foreground">暂无文章</p>
            <p className="mt-1.5 text-sm text-muted-foreground/80">
              在 content/posts/ 目录下创建 Markdown 文件即可
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
