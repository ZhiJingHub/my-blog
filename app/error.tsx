'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="text-6xl">😵</div>
      <h2 className="text-2xl font-bold">出了点问题</h2>
      <p className="max-w-md text-muted-foreground">
        页面加载时发生了错误，请重试。
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-primary px-6 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
      >
        重试
      </button>
    </div>
  )
}
