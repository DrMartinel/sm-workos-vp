export default function TasksPageLoading() {
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header Skeleton */}
      <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex items-center space-x-4">
          <div className="h-9 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-9 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </header>

      {/* Main content Skeleton */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar Skeleton */}
        <aside className="w-64 border-r border-gray-200 p-4 overflow-y-auto">
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="space-y-2">
            <div className="h-8 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>

          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mt-8 mb-4"></div>
          <div className="space-y-2">
            <div className="h-8 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
        </aside>

        {/* Task list Skeleton */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="h-24 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-24 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-24 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-24 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>
      </main>
    </div>
  )
}
