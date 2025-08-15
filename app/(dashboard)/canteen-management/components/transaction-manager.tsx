"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Gift,
  Award,
  Calendar,
  MoreHorizontal,
  Eye,
  AlertCircle,
  CalendarDays,
  Search,
  Filter,
} from "lucide-react"

type TransactionStatus = "pending" | "approved" | "rejected"

interface Transaction {
  id: string
  userId: string
  userName: string
  amount: number
  description: string
  status: TransactionStatus
  createdAt: string
  type: "reward" | "redemption"
}

// Mock data
const initialTransactions: Transaction[] = [
  {
    id: "1",
    userId: "user_123",
    userName: "John Doe",
    amount: 500,
    description: "Completed survey campaign",
    status: "pending",
    createdAt: "2024-01-15T10:30:00Z",
    type: "reward",
  },
  {
    id: "2",
    userId: "user_456",
    userName: "Jane Smith",
    amount: -200,
    description: "Gift card redemption",
    status: "pending",
    createdAt: "2024-01-15T09:15:00Z",
    type: "redemption",
  },
  {
    id: "3",
    userId: "user_789",
    userName: "Mike Johnson",
    amount: 750,
    description: "Referral bonus",
    status: "approved",
    createdAt: "2024-01-14T16:45:00Z",
    type: "reward",
  },
  {
    id: "4",
    userId: "user_321",
    userName: "Sarah Wilson",
    amount: -100,
    description: "Product discount",
    status: "rejected",
    createdAt: "2024-01-14T14:20:00Z",
    type: "redemption",
  },
  {
    id: "5",
    userId: "user_555",
    userName: "Alex Chen",
    amount: 300,
    description: "Social media engagement",
    status: "pending",
    createdAt: "2024-01-15T08:00:00Z",
    type: "reward",
  },
  {
    id: "6",
    userId: "user_666",
    userName: "Emma Davis",
    amount: -150,
    description: "Amazon gift card",
    status: "approved",
    createdAt: "2024-01-14T12:30:00Z",
    type: "redemption",
  },
  {
    id: "7",
    userId: "user_777",
    userName: "David Brown",
    amount: 1000,
    description: "Monthly achievement bonus",
    status: "pending",
    createdAt: "2024-01-15T07:45:00Z",
    type: "reward",
  },
  {
    id: "8",
    userId: "user_888",
    userName: "Lisa Garcia",
    amount: -75,
    description: "Coffee shop voucher",
    status: "approved",
    createdAt: "2024-01-14T11:15:00Z",
    type: "redemption",
  },
  {
    id: "9",
    userId: "user_999",
    userName: "Tom Wilson",
    amount: 400,
    description: "Weekly challenge completion",
    status: "approved",
    createdAt: "2024-01-10T14:30:00Z",
    type: "reward",
  },
  {
    id: "10",
    userId: "user_101",
    userName: "Amy Johnson",
    amount: -300,
    description: "Electronics voucher",
    status: "pending",
    createdAt: "2024-01-12T16:20:00Z",
    type: "redemption",
  },
]

export function TransactionManager() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [dateRange, setDateRange] = useState<string>("all")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const handleApprove = (id: string) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, status: "approved" as TransactionStatus } : t)))
  }

  const handleReject = (id: string) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, status: "rejected" as TransactionStatus } : t)))
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      searchQuery === "" ||
      transaction.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.userId.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter

    const transactionDate = new Date(transaction.createdAt)
    const today = new Date()

    let matchesDate = true
    if (dateRange === "today") {
      matchesDate = transactionDate.toDateString() === today.toDateString()
    } else if (dateRange === "week") {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      matchesDate = transactionDate >= weekAgo
    } else if (dateRange === "month") {
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      matchesDate = transactionDate >= monthAgo
    } else if (dateRange === "custom" && startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      matchesDate = transactionDate >= start && transactionDate <= end
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  const clearDateFilter = () => {
    setDateRange("all")
    setStartDate("")
    setEndDate("")
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    clearDateFilter()
  }

  const hasActiveDateFilter = dateRange !== "all"
  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all" || hasActiveDateFilter

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="default" className="gap-1 bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        )
    }
  }

  const formatAmount = (amount: number) => {
    const isNegative = amount < 0
    const absAmount = Math.abs(amount)
    return (
      <span className={isNegative ? "text-red-600" : "text-green-600"}>
        {isNegative ? "-" : "+"}${absAmount}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const pendingCount = transactions.filter((t) => t.status === "pending").length
  const approvedCount = transactions.filter((t) => t.status === "approved").length
  const rejectedCount = transactions.filter((t) => t.status === "rejected").length
  const totalRewards = transactions
    .filter((t) => t.type === "reward" && t.status === "approved")
    .reduce((sum, t) => sum + t.amount, 0)
  const totalRedemptions = Math.abs(
    transactions
      .filter((t) => t.type === "redemption" && t.status === "approved")
      .reduce((sum, t) => sum + t.amount, 0),
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Pending</CardTitle>
            <div className="p-1 bg-orange-100 rounded">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{pendingCount}</div>
            <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" />
              Needs review
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Approved</CardTitle>
            <div className="p-1 bg-green-100 rounded">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{approvedCount}</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              Processing
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Rejected</CardTitle>
            <div className="p-1 bg-red-100 rounded">
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{rejectedCount}</div>
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
              <TrendingDown className="h-3 w-3" />
              Declined
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Rewards</CardTitle>
            <div className="p-1 bg-blue-100 rounded">
              <Award className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">${totalRewards}</div>
            <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              Distributed
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Redeemed</CardTitle>
            <div className="p-1 bg-purple-100 rounded">
              <Gift className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">${totalRedemptions}</div>
            <p className="text-xs text-purple-600 flex items-center gap-1 mt-1">
              <Gift className="h-3 w-3" />
              Claimed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-slate-100 rounded">
                <DollarSign className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <CardTitle>Transactions</CardTitle>
                <CardDescription>
                  Review and manage all reward transactions
                  {hasActiveFilters && (
                    <span className="ml-2 text-sm">
                      ({filteredTransactions.length} of {transactions.length} shown)
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4 mr-2" />
              More Actions
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[160px]">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              {dateRange === "custom" && (
                <>
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-[140px]"
                      placeholder="Start date"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-[140px]"
                      placeholder="End date"
                    />
                  </div>
                </>
              )}

              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user, description, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Clear All Filters
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 text-muted-foreground/50" />
                      <p>No transactions found matching your filters</p>
                      {hasActiveFilters && (
                        <Button variant="outline" size="sm" onClick={clearAllFilters}>
                          Clear all filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-slate-100 rounded">
                          <User className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                          <div className="font-medium">{transaction.userName}</div>
                          <div className="text-sm text-muted-foreground">{transaction.userId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <div className="p-1 rounded mt-0.5">
                          {transaction.type === "reward" ? (
                            <Award className="h-3 w-3 text-green-600" />
                          ) : (
                            <Gift className="h-3 w-3 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground capitalize flex items-center gap-1">
                            {transaction.type}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatAmount(transaction.amount)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(transaction.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell>
                      {transaction.status === "pending" ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(transaction.id)}
                            className="h-8 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(transaction.id)}
                            className="h-8"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" className="h-8">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
