"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { ProductManagementComponent } from "./components/product-management-component"
import { TransactionsComponent } from "./components/transactions-component"
import { AdminOnly } from "@/components/role-protection"

export default function CanteenManagementPage() {
  const [activeTab, setActiveTab] = useState("products")

  return (
    <AdminOnly>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Canteen Management</h1>
            <p className="text-gray-600">Manage products and monitor transactions</p>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <ProductManagementComponent />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <TransactionsComponent />
          </TabsContent>
        </Tabs>
      </div>
    </AdminOnly>
  )
} 