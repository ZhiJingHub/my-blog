import { MDXRemote } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import rehypePrettyCode from "rehype-pretty-code"
import { visit } from "unist-util-visit"

const mdxComponents = {}

// 插件：为 pre 添加 data-language 属性
function rehypeCodeLanguage() {
  return (tree: any) => {
    visit(tree, "element", (node: any) => {
      if (node.tagName === "pre" && node.children?.[0]?.tagName === "code") {
        const code = node.children[0]
        const className = code.properties?.className?.[0] || ""
        const lang = className.replace("language-", "")
        if (lang) {
          node.properties = node.properties || {}
          node.properties["data-language"] = lang
        }
      }
    })
  }
}

// 插件：移除 script 标签（rehype-pretty-code 可能注入）
function rehypeRemoveScripts() {
  return (tree: any) => {
    visit(tree, (node: any, index: any, parent: any) => {
      if (node.tagName === "script" && parent && typeof index === "number") {
        parent.children.splice(index, 1)
        return index
      }
    })
  }
}

const rehypePrettyCodeOptions = {
  theme: {
    dark: "github-dark",
    light: "github-light",
  },
  keepBackground: true,
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
