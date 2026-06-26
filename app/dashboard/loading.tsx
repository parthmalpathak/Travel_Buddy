export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Header skeleton */}
      <div className="h-16 bg-surface-container-lowest border-b border-outline-variant/20 animate-pulse" />

      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-md">
        {/* Greeting skeleton */}
        <div className="mb-8 space-y-2">
          <div className="h-8 w-64 bg-surface-container rounded-xl animate-pulse" />
          <div className="h-4 w-40 bg-surface-container-low rounded-lg animate-pulse" />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[0, 1, 2].map(i => (
            <div key={i} className="card px-6 py-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-surface-container-low animate-pulse shrink-0" />
              <div className="space-y-2">
                <div className="h-7 w-10 bg-surface-container rounded-lg animate-pulse" />
                <div className="h-3 w-16 bg-surface-container-low rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Cards skeleton */}
        <div className="h-4 w-28 bg-surface-container rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="card overflow-hidden">
              <div className="h-28 bg-surface-container animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 bg-surface-container rounded-lg animate-pulse" />
                <div className="h-3 w-1/2 bg-surface-container-low rounded animate-pulse" />
                <div className="h-3 w-full bg-surface-container-low rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
