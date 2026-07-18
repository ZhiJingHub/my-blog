"use client"

import { useState, useCallback } from "react"

export function CodeBlockCopy() {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    const btn = e.currentTarget
    const pre = btn.closest("pre")
    if (!pre) return

    const code = pre.querySelector("code")?.innerText || ""
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const textarea = document.createElement("textarea")
      textarea.value = code
      textarea.style.position = "fixed"
      textarea.style.opacity = "0"
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [])

  return (
    <button
      onClick={handleCopy}
      className="absolute right-3 top-3.5 z-10 flex h-7 items-center gap-1.5 rounded-md border bg-background/70 px-2.5 text-[0.7rem] text-muted-foreground opacity-0 backdrop-blur-sm transition-all hover:bg-accent hover:text-foreground group-hover:opacity-100"
      aria-label="复制代码"
    >
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <span>已复制</span>
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
          <span>复制</span>
        </>
      )}
    </button>
  )
}
