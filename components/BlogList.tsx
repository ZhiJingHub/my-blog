"use client"

import { useState } from "react"
import Link from "next/link"
import { Icon } from "@iconify/react"
import type { Post } from "@/lib/types/post"

export function BlogList({ posts }: { posts: Post[] }) {
  const [search, setSearch] = useState("")

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.description?.toLowerCase().includes(search.toLowerCase()) ||
      post.tags?.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <>
      {/* 搜索框 */}
      <div className="relative mb-8">
        <Icon
          icon="mdi:magnify"
          className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          placeholder="搜索文章..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-card py-3 pl-12 pr-4 text-sm transition-colors placeholder:text-muted-foreground/50 focus:border-foreground/30 focus:outline-none"
        />
      </div>

      {/* 文章列表 */}
      {filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card py-12">
          <Icon icon="mdi:file-document-outline" className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {search ? "没有找到匹配的文章" : "还没有文章"}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/posts/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-foreground/20 hover:shadow-sm"
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
                    <Icon icon="mdi:image-outline" className="size-10 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {/* 内容区 */}
              <div className="flex flex-1 flex-col p-4">
                {/* 标签 */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mb-2">
                    <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {post.tags[0]}
                    </span>
                  </div>
                )}

                {/* 标题 */}
                <h2 className="text-sm font-bold leading-tight tracking-tight transition-colors group-hover:text-foreground/70 line-clamp-2">
                  {post.title}
                </h2>

                {/* 描述 */}
                {post.description && (
                  <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                    {post.description}
                  </p>
                )}

                {/* 日期 */}
                <time className="mt-3 text-xs text-muted-foreground/70" dateTime={post.date}>
                  {post.date}
                </time>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
