import { SmRewardManagement } from "@/components/sm-reward-management"
import { Gift, TrendingUp } from "lucide-react"

export default function RewardsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Gift className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">SM Rewards Management</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Manage transactions and product catalog
              </p>
            </div>
          </div>

          <SmRewardManagement />
        </div>
      </div>
    </div>
  )
}
