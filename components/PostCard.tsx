'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import type { PostModule } from '@/lib/types/post';

type PostCardProps = {
  post: PostModule;
};

export default function PostCard({ post }: PostCardProps) {
  const excerpt = post.metadata.description;

  return (
    <Link href={`/posts/${post.slug}`} className="group block">
      <article className="rounded-xl border border-border/60 bg-card overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
        {/* 封面图 */}
        {post.metadata.image && (
          <div className="relative aspect-video w-full overflow-hidden bg-muted">
            <Image
              src={post.metadata.image}
              alt={post.metadata.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        {/* 卡片内容 */}
        <div className="p-5">
          {/* 元信息 */}
          <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
            <time dateTime={post.metadata.published} className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
              {formatDate(post.metadata.published)}
            </time>
          </div>

          {/* 标题 */}
          <h2 className="mb-2 text-lg font-semibold leading-tight text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
            {post.metadata.title}
          </h2>

          {/* 摘要 */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {excerpt}
          </p>

          {/* 标签 */}
          {post.metadata.tags && post.metadata.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.metadata.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground transition-colors group-hover:bg-muted"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
