'use client'

import { useEffect, useState } from 'react'
import { siteConfig } from '@/lib/config/site'

type PageViewsProps = {
  pathname: string
  className?: string
  prefix?: string
  suffix?: string
  increment?: boolean
}

const viewCache = new Map<string, Promise<number>>()

export function PageViews({
  pathname,
  className = '',
  prefix = '',
  suffix = '次浏览',
  increment = true
}: PageViewsProps) {
  const [count, setCount] = useState<number | null>(null)
  const apiEnabled = !!siteConfig.viewsApi

  useEffect(() => {
    if (!apiEnabled) return

    const pathKey = pathname.replace(/\/$/, '') || '/'
    let actualIncrement = increment

    if (actualIncrement) {
      const sessionKey = `viewed:${pathKey}`
      try {
        if (sessionStorage.getItem(sessionKey)) {
          actualIncrement = false
        } else {
          sessionStorage.setItem(sessionKey, '1')
        }
      } catch {
        // sessionStorage 不可用时仍正常递增
      }
    }

    const cacheKey = `${actualIncrement ? 'inc' : 'read'}:${pathKey}`

    if (!viewCache.has(cacheKey)) {
      viewCache.set(
        cacheKey,
        fetch(siteConfig.viewsApi, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(actualIncrement ? { path: pathKey } : { paths: [pathKey] })
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (!data) return 0
            return actualIncrement ? data.count : data[0] || 0
          })
          .catch(() => 0)
      )
    }

    viewCache.get(cacheKey)!.then((n) => setCount(n))
  }, [pathname, increment, apiEnabled])

  if (!apiEnabled || count === null) return null

  return (
    <span className={className}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}
