
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export const MarketingChannelPageSkeleton = () => {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Combined Scorecard and Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="pb-4">
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-4 w-3/4 mt-1" />
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                {[...Array(3)].map((_, j) => (
                                    <div key={j} className="text-center space-y-2">
                                        <Skeleton className="h-4 w-16 mx-auto" />
                                        <Skeleton className="h-7 w-24 mx-auto" />
                                        <Skeleton className="h-4 w-20 mx-auto" />
                                    </div>
                                ))}
                            </div>
                            <Skeleton className="h-[300px] w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Time Series Analysis Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {[...Array(2)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                           <Skeleton className="h-6 w-1/2" />
                           <Skeleton className="h-4 w-3/4 mt-1" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-[380px] w-full" />
                            <div className="flex justify-center items-center gap-4 mt-4">
                                {[...Array(4)].map((_, j) => (
                                   <div key={j} className="flex items-center gap-2">
                                       <Skeleton className="h-3 w-3 rounded-full" />
                                       <Skeleton className="h-4 w-20" />
                                   </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tables Skeleton */}
            {[...Array(2)].map((_, i) => (
                <Card className="mt-6" key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-2/3 mt-1" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {[...Array(10)].map((_, j) => (
                                <Skeleton key={j} className="h-12 w-full" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
} 