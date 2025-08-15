"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TransactionsComponent } from "./transactions-component"
import { ProductManagementComponent } from "./product-management-component"
import { Package, CreditCard } from "lucide-react"

export function SmRewardManagement() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Package className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">SM Rewards Management</h1>
          <p className="text-muted-foreground">Manage transactions and products for the SM Rewards system</p>
        </div>
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Management</CardTitle>
              <CardDescription>Monitor and manage all SM Rewards transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionsComponent />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>Add, edit, and manage products available for SM Rewards redemption</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductManagementComponent />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
