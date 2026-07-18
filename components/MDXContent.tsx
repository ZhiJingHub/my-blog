import { MDXRemote } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import rehypePrettyCode from "rehype-pretty-code"
import { visit } from "unist-util-visit"
import { CodeBlockCopy } from "@/components/CodeBlockCopy"

const mdxComponents = {
  pre: ({ children, ...props }: React.ComponentProps<"pre">) => (
    <pre {...props} className="group">
      <CodeBlockCopy />
      {children}
    </pre>
  ),
}

interface Element {
  type: "element"
  tagName: string
  properties?: Record<string, unknown>
  children?: unknown[]
}

// 插件：为 pre 添加 data-language 属性
function rehypeCodeLanguage() {
  return (tree: unknown) => {
    visit(tree as Parameters<typeof visit>[0], "element", (node) => {
      const el = node as unknown as Element
      if (el.tagName === "pre" && (el.children?.[0] as Element)?.tagName === "code") {
        const code = el.children![0] as Element
        const className = (code.properties?.className as string[])?.[0] || ""
        const lang = className.replace("language-", "")
        if (lang) {
          el.properties = el.properties || {}
          el.properties["data-language"] = lang
        }
      }
    })
  }
}

// 插件：移除 script 标签（rehype-pretty-code 可能注入）
function rehypeRemoveScripts() {
  return (tree: unknown) => {
    visit(tree as Parameters<typeof visit>[0], (node, index, parent) => {
      const el = node as unknown as Element
      if (el.type === "element" && el.tagName === "script" && parent && typeof index === "number") {
        (parent as { children: unknown[] }).children.splice(index, 1)
        return index
      }
    })
  }
}

const rehypePrettyCodeOptions = {
  theme: {
    dark: "github-dark-dimmed",
    light: "snazzy-light",
  },
  keepBackground: false,
  defaultLang: "plaintext",
}

export async function MDXContent({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={mdxComponents}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            [rehypePrettyCode, rehypePrettyCodeOptions],
            rehypeCodeLanguage,
            rehypeRemoveScripts,
          ],
        },
      }}
    />
  )
}
