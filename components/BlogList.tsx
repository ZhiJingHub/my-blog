"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Icon } from "@iconify/react"
import type { Post } from "@/lib/types/post"

function highlightText(text: string, query: string) {
  if (!query) return text
  const parts = text.split(new RegExp(`(${query})`, "gi"))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="rounded bg-yellow-200 px-0.5 dark:bg-yellow-800 dark:text-yellow-100">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function BlogList({ posts }: { posts: Post[] }) {
  const [search, setSearch] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedSearch = useDebounce(search, 300)

  // 键盘快捷键 Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === "Escape" && isSearchFocused) {
        inputRef.current?.blur()
        setSearch("")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isSearchFocused])

  const filteredPosts = useMemo(() => {
    if (!debouncedSearch) return posts
    const query = debouncedSearch.toLowerCase()
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.description?.toLowerCase().includes(query) ||
        post.tags?.some((tag) => tag.toLowerCase().includes(query))
    )
  }, [posts, debouncedSearch])

  return (
    <>
      {/* 搜索框 */}
      <div className="relative mb-6">
        <Icon
          icon="mdi:magnify"
          className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors"
          style={{ color: isSearchFocused ? "hsl(var(--foreground))" : undefined }}
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="搜索文章... (⌘K)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className="w-full rounded-lg border border-border bg-card py-3 pl-12 pr-20 text-sm transition-all placeholder:text-muted-foreground/50 focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-foreground/10"
        />
        <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2">
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="清除搜索"
            >
              <Icon icon="mdi:close-circle" className="size-4" />
            </button>
          )}
          <span className="hidden text-xs text-muted-foreground sm:inline">
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs">⌘</kbd>
            <kbd className="ml-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-xs">K</kbd>
          </span>
        </div>
      </div>

      {/* 搜索结果计数 */}
      {debouncedSearch && (
        <div className="mb-4 text-sm text-muted-foreground">
          {filteredPosts.length === 0
            ? "没有找到匹配的文章"
            : `找到 ${filteredPosts.length} 篇文章`}
        </div>
      )}

      {/* 文章列表 */}
      {filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card py-12">
          <Icon icon="mdi:file-document-outline" className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {debouncedSearch ? "没有找到匹配的文章" : "还没有文章"}
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
                  <Image
                    src={post.cover}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
                  <div className="mb-2 flex flex-wrap gap-1">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="inline-block rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                      >
                        {highlightText(tag, debouncedSearch)}
                      </span>
                    ))}
                  </div>
                )}

                {/* 标题 */}
                <h2 className="text-sm font-bold leading-tight tracking-tight transition-colors group-hover:text-foreground/70 line-clamp-2">
                  {highlightText(post.title, debouncedSearch)}
                </h2>

                {/* 描述 */}
                {post.description && (
                  <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                    {highlightText(post.description, debouncedSearch)}
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
