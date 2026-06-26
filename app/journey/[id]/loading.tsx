export default function JourneyLoading() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header skeleton */}
      <div className="h-16 bg-surface-container-lowest border-b border-outline-variant/20 animate-pulse" />

      {/* Hero map skeleton */}
      <div className="h-[460px] md:h-[560px] mb-stack-md hero-clip bg-surface-container animate-pulse relative">
        <div className="absolute bottom-0 left-0 p-margin-mobile md:p-margin-desktop space-y-2">
          <div className="h-6 w-24 bg-surface-container-lowest/20 rounded-full animate-pulse" />
          <div className="h-9 w-72 bg-surface-container-lowest/20 rounded-xl animate-pulse" />
          <div className="h-4 w-48 bg-surface-container-lowest/20 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Feed skeleton */}
        <div className="lg:col-span-8 flex flex-col gap-stack-lg">
          {[0, 1].map(i => (
            <div key={i} className="space-y-3">
              <div className="h-3 w-32 bg-surface-container rounded animate-pulse" />
              <div className="h-7 w-2/3 bg-surface-container rounded-lg animate-pulse" />
              <div className="h-4 w-full bg-surface-container-low rounded animate-pulse" />
              <div className="aspect-video bg-surface-container rounded-lg animate-pulse" />
            </div>
          ))}
        </div>

        {/* Sidebar skeleton */}
        <aside className="lg:col-span-4 space-y-4 mt-stack-md lg:mt-0">
          <div className="card p-5 space-y-3">
            <div className="h-3 w-12 bg-surface-container rounded animate-pulse" />
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-surface-container shrink-0" />
                <div className="h-4 bg-surface-container-low rounded animate-pulse flex-1" />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
