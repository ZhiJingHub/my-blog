import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="text-8xl font-bold text-muted-foreground/30">404</div>
      <h1 className="text-3xl font-bold">页面未找到</h1>
      <p className="max-w-md text-muted-foreground">
        你访问的页面不存在或已被移除。
      </p>
      <Link
        href="/"
        className="rounded-lg bg-primary px-6 py-2.5 text-primary-foreground transition-colors hover:bg-primary/90"
      >
        返回首页
      </Link>
    </div>
  )
}
