---
title: "Next.js App Router 实战指南"
date: "2026-07-17"
description: "深入理解 Next.js App Router 的核心概念：Server Components、Streaming、动静结合等最佳实践。"
tags: ["Next.js", "React", "前端"]
---

## 为什么选择 App Router

Next.js App Router 带来了革命性的架构变化。它基于 **React Server Components**，让我们可以在服务端渲染组件，大幅减少客户端 JavaScript 体积。

## Server Components vs Client Components

默认情况下，App Router 中的所有组件都是 Server Components。只有当你需要以下能力时，才使用 `"use client"`：

- `useState` / `useEffect` 等 hooks
- 浏览器 API（`window`、`localStorage`）
- 事件处理器（`onClick`、`onChange`）
- 类组件

```tsx
// Server Component（默认）- 无需标记
export default async function PostList() {
  const posts = await fetchPosts() // 直接 await，无需 useEffect
  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>
}

// Client Component - 仅在叶子节点使用
"use client"
export function LikeButton({ postId }: { postId: string }) {
  const [liked, setLiked] = useState(false)
  return <button onClick={() => setLiked(!liked)}>❤️ {liked ? "已赞" : "点赞"}</button>
}
```

## Streaming 与 Suspense

通过 `<Suspense>` 可以隔离动态组件，实现渐进式加载：

```tsx
import { Suspense } from "react"

export default function Page() {
  return (
    <div>
      <h1>我的博客</h1>
      <Suspense fallback={<Loading />}>
        <PostList /> {/* 动态数据，异步加载 */}
      </Suspense>
    </div>
  )
}
```

## 数据获取

在 Server Components 中获取数据变得异常简单：

```tsx
export default async function PostPage({ params }) {
  const { slug } = await params
  const post = await getPost(slug)

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </article>
  )
}
```

## 小结

App Router 代表了 React 应用开发的未来方向。掌握 Server Components 的思维模式，是构建高性能现代 Web 应用的关键。
