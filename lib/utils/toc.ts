import fs from "fs"
import path from "path"

export interface TocItem {
  id: string
  text: string
  level: number
}

// 从 markdown 内容中提取 h1-h3 标题，生成 slug 与 rehype-slug 保持一致
export function extractToc(content: string): TocItem[] {
  const items: TocItem[] = []
  const lines = content.split("\n")

  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)$/)
    if (!match) continue

    const level = match[1].length
    const text = match[2]
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // 去除链接语法
      .replace(/[*_`~]/g, "") // 去除格式标记
      .trim()

    if (!text) continue

    // 与 github-slugger 行为一致：小写、去特殊字符、空格转连字符
    const id = text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")

    items.push({ id, text, level })
  }

  return items
}
