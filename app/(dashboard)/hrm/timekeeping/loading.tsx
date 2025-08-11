export default function TimekeepingLoading() {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen animate-pulse">
      {/* Header */}
      <div className="space-y-1">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
      </div>

      {/* Attendance Status Banner */}
      <div className="bg-gray-200 rounded-lg p-4 h-20"></div>

      {/* Tabs */}
      <div className="w-full">
        <div className="grid w-full grid-cols-2 h-12 bg-gray-200 rounded"></div>
        
        <div className="mt-6">
          {/* Monthly Summary Card */}
          <div className="mb-6 bg-gray-200 rounded-lg h-48"></div>

          {/* Calendar Card */}
          <div className="bg-gray-200 rounded-lg">
            <div className="p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-gray-300 rounded w-32"></div>
                <div className="flex gap-3">
                  <div className="h-8 bg-gray-300 rounded w-24"></div>
                  <div className="h-8 bg-gray-300 rounded w-24"></div>
                  <div className="h-8 bg-gray-300 rounded w-8"></div>
                  <div className="h-8 bg-gray-300 rounded w-8"></div>
                </div>
              </div>
              
              {/* Calendar Grid */}
              <div className="mb-6">
                <div className="grid grid-cols-7 gap-3 mb-4">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="h-6 bg-gray-300 rounded"></div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-3">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-300 rounded-lg"></div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="border-t pt-4">
                <div className="h-4 bg-gray-300 rounded w-16 mb-3"></div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-300 rounded-sm"></div>
                      <div className="h-3 bg-gray-300 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
