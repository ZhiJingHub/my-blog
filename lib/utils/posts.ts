import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"
import remarkRehype from "remark-rehype"
import rehypeSlug from "rehype-slug"
import rehypeStringify from "rehype-stringify"
import type { Post, PostMeta } from "@/lib/types/post"

const postsDir = path.join(process.cwd(), "content", "posts")

export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDir)) return []

  return fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((file) => getPostBySlug(file.replace(/\.mdx?$/, "")))
    .filter((post): post is Post => post !== null && !post.draft)
    .sort((a, b) => (a.date > b.date ? -1 : 1))
}

export function getPostBySlug(slug: string): Post | null {
  const mdPath = path.join(postsDir, `${slug}.md`)
  const mdxPath = path.join(postsDir, `${slug}.mdx`)
  const filePath = fs.existsSync(mdPath) ? mdPath : fs.existsSync(mdxPath) ? mdxPath : null

  if (!filePath) return null

  const raw = fs.readFileSync(filePath, "utf-8")
  const { data, content } = matter(raw)

  return {
    slug,
    content,
    ...(data as PostMeta),
  }
}

export async function renderMarkdown(source: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(source)

  return result.toString()
}
