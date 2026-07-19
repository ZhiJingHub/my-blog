import GithubSlugger from "github-slugger"

export interface TocItem {
  id: string
  text: string
  level: number
}

// 从 markdown 内容中提取 h1-h3 标题，使用 github-slugger 生成与 rehype-slug 完全一致的锚点 id
export function extractToc(content: string): TocItem[] {
  const items: TocItem[] = []
  const lines = content.split("\n")
  const slugger = new GithubSlugger()

  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)$/)
    if (!match) continue

    const level = match[1].length
    const text = match[2]
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[*_`~]/g, "")
      .trim()

    if (!text) continue

    items.push({ id: slugger.slug(text), text, level })
  }

  return items
}
