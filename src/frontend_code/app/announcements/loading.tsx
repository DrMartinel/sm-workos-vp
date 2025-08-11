import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AnnouncementsLoading() {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Search and Filters Skeleton */}
        <div className="mb-8 space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Announcements List Skeleton */}
        <div className="space-y-8">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="mb-6">
              <Card className="border border-gray-200">
                {/* Random chance for cover image skeleton */}
                {index % 3 === 0 && <Skeleton className="w-full h-48 rounded-t-lg" />}

                <CardHeader className={index % 3 === 0 ? "pb-3" : ""}>
                  {/* Badges skeleton */}
                  <div className="flex gap-2 mb-3">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>

                  {/* Title skeleton */}
                  <Skeleton className="h-6 w-3/4 mb-2" />

                  {/* Event info skeleton (for some cards) */}
                  {index % 3 === 0 && (
                    <div className="flex gap-4 mb-3">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  )}

                  {/* Description skeleton */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
