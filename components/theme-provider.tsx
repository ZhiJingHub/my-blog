'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type ThemeMode = 'light' | 'dark' | 'system'

type ThemeContextType = {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  cycle: () => void
}

const ThemeProviderContext = createContext<ThemeContextType>({
  mode: 'system',
  setMode: () => {},
  cycle: () => {}
})

export function useTheme() {
  return useContext(ThemeProviderContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('theme') as ThemeMode | null
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      setMode(stored)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

    document.documentElement.classList.toggle('dark', isDark)
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', isDark ? '#1a1b22' : '#fefefe')

    localStorage.setItem('theme', mode)
  }, [mode, mounted])

  useEffect(() => {
    if (mode !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      const isDark = e.matches
      document.documentElement.classList.toggle('dark', isDark)
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) meta.setAttribute('content', isDark ? '#1a1b22' : '#fefefe')
    }

    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [mode])

  const cycle = () => {
    const modes: ThemeMode[] = ['light', 'dark', 'system']
    const idx = modes.indexOf(mode)
    setMode(modes[(idx + 1) % modes.length])
  }

  return (
    <ThemeProviderContext.Provider value={{ mode, setMode, cycle }}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export function ThemeToggle() {
  const { mode, cycle } = useTheme()

  const label = mode === 'light' ? '浅色模式' : mode === 'dark' ? '深色模式' : '跟随系统'

  return (
    <button
      onClick={cycle}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      aria-label={label}
      title={label}
    >
      {mode === 'light' && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      )}
      {mode === 'dark' && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )}
      {mode === 'system' && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="20" height="14" x="2" y="3" rx="2" />
          <line x1="8" x2="16" y1="21" y2="21" />
          <line x1="12" x2="12" y1="17" y2="21" />
        </svg>
      )}
    </button>
  )
}
