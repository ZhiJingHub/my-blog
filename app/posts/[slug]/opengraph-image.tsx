import { ImageResponse } from "next/og"
import { getPostBySlug, getAllPosts } from "@/lib/utils/posts"
import { siteConfig } from "@/lib/config/site"

export const alt = "Blog Post"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return new ImageResponse(
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: "#1a1b22", color: "#e4e4e7" }}>
        Post not found
      </div>,
      size
    )
  }

  const tags = post.tags?.slice(0, 3) ?? []

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #1a1b22 0%, #252630 50%, #1e1f2e 100%)",
        color: "#e4e4e7",
        fontFamily: "sans-serif",
        padding: "60px",
      }}
    >
      {/* 顶部品牌 */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "auto" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "bold", color: "white" }}>
          Z
        </div>
        <span style={{ fontSize: "20px", fontWeight: "600", opacity: "0.8" }}>{siteConfig.name}</span>
      </div>

      {/* 标题 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", flex: 1, justifyContent: "center" }}>
        <h1 style={{ fontSize: post.title.length > 30 ? "48px" : "56px", fontWeight: "800", lineHeight: "1.2", margin: 0, letterSpacing: "-0.02em", color: "#fafafa" }}>
          {post.title}
        </h1>
        {post.description && (
          <p style={{ fontSize: "22px", opacity: "0.6", margin: 0, lineHeight: "1.5" }}>
            {post.description.length > 80 ? post.description.slice(0, 80) + "…" : post.description}
          </p>
        )}
      </div>

      {/* 底部信息 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "18px", opacity: "0.5" }}>
            {new Date(post.date).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}
          </span>
          {tags.length > 0 && (
            <div style={{ display: "flex", gap: "8px" }}>
              {tags.map((tag) => (
                <span key={tag} style={{ fontSize: "14px", padding: "4px 12px", borderRadius: "999px", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <span style={{ fontSize: "16px", opacity: "0.4" }}>iwexe.top</span>
      </div>
    </div>,
    size
  )
}
