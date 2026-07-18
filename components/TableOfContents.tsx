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
    <nav className="sticky top-20 hidden w-56 shrink-0 xl:block">
      <div className="rounded-lg border bg-card p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          目录
        </p>
        <ul className="space-y-1 text-sm">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" })
                }}
                className={`block rounded-md px-2 py-1 transition-colors leading-relaxed ${
                  item.level === 1 ? "pl-2 font-medium" : item.level === 2 ? "pl-4" : "pl-6 text-[0.8rem]"
                } ${
                  activeId === item.id
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
