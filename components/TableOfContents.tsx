"use client"

import { useEffect, useState } from "react"
import type { TocItem } from "@/lib/utils/toc"

export function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState("")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px", threshold: 0 }
    )

    const headings = document.querySelectorAll("h1[id], h2[id], h3[id]")
    headings.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  if (items.length === 0) return null

  return (
    <nav className="sticky top-20 col-start-3 mx-auto hidden w-56 self-start px-4 [@media(min-width:90rem)]:block">
      <div className="relative">
        {/* 左侧竖线指示器 */}
        <div className="absolute left-0 top-0 h-full w-px bg-border" />
        <div className="pl-4">
          <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground/70">
            目录
          </p>
          <ul className="space-y-0.5 text-[0.8rem]">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" })
                  }}
                  className={`relative block rounded-md px-2 py-1.5 transition-all duration-200 leading-relaxed ${
                    item.level === 1
                      ? "pl-2 font-medium"
                      : item.level === 2
                        ? "pl-4"
                        : "pl-6 text-[0.75rem]"
                  } ${
                    activeId === item.id
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {/* 活跃指示条 */}
                  {activeId === item.id && (
                    <span className="absolute left-[-1rem] top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-foreground transition-all" />
                  )}
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  )
}
