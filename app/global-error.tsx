'use client'

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center p-8">
          <div className="text-center">
            <div className="text-6xl">💥</div>
            <h1 className="mt-4 text-2xl font-bold">严重错误</h1>
            <p className="mt-2 text-muted-foreground">
              应用遇到了无法恢复的错误，请刷新页面重试。
            </p>
            {process.env.NODE_ENV === 'development' && error.message && (
              <pre className="mt-4 max-w-lg overflow-auto rounded-lg bg-muted p-4 text-left text-xs">
                {error.message}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-6 rounded-lg bg-primary px-6 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
            >
              刷新页面
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
