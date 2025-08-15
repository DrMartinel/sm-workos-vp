"use client"

import { useState, useEffect, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Plus,
  RefreshCw,
  X,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Loader2,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { transactionsService, Transaction } from "@/lib/utils/supabase/transactions"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/store/hooks/useAuth"

export function TransactionsComponent() {
  const { profile } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showTransactionDetails, setShowTransactionDetails] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Success and Error modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  // Load transactions on component mount
  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    setIsLoading(true)
    try {
      const transactionsData = await transactionsService.getMyTransactions()
      setTransactions(transactionsData)
    } catch (error) {
      console.error('Error loading transactions:', error)
      setErrorMessage("Failed to load transactions. Please try again.")
      setShowErrorModal(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateTransactionStatus = async (transactionId: number, status: Transaction['status']) => {
    setIsUpdatingStatus(true)
    try {
      const success = await transactionsService.updateTransactionStatus(transactionId, status)
      if (success) {
        // Update the transaction in the local state
        setTransactions(transactions.map(t => 
          t.id === transactionId ? { ...t, status } : t
        ))
        setShowTransactionDetails(false)
        
        const statusText = status === "completed" ? "approved" : status === "failed" ? "rejected" : status
        setSuccessMessage(`Transaction #${transactionId} has been ${statusText} successfully!`)
        setShowSuccessModal(true)
      } else {
        setErrorMessage("Failed to update transaction status. Please try again.")
        setShowErrorModal(true)
      }
    } catch (error) {
      console.error('Error updating transaction status:', error)
      setErrorMessage("An error occurred while updating the transaction status. Please try again.")
      setShowErrorModal(true)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch =
        searchTerm === "" ||
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.id.toString().includes(searchTerm)

      const matchesStatus = statusFilter === "all" || transaction.status === statusFilter
      const matchesType = typeFilter === "all" || transaction.type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [transactions, searchTerm, statusFilter, typeFilter])

  // Pagination calculations
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, typeFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setTypeFilter("all")
    setCurrentPage(1)
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  // Calculate summary stats
  const stats = useMemo(() => {
    const total = filteredTransactions.length
    const completed = filteredTransactions.filter((t) => t.status === "completed").length
    const pending = filteredTransactions.filter((t) => t.status === "pending").length
    const totalAmount = filteredTransactions
      .filter((t) => t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0)

    return { total, completed, pending, totalAmount }
  }, [filteredTransactions])

  const getStatusBadge = (status: Transaction["status"]) => {
    const variants = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
      cancelled: "outline",
    } as const
    return <Badge variant={variants[status]}>{status}</Badge>
  }

  const getTypeIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "earn":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "spend":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case "transfer":
        return <ArrowUpDown className="h-4 w-4 text-blue-600" />
      case "topup":
        return <Plus className="h-4 w-4 text-purple-600" />
      default:
        return <RefreshCw className="h-4 w-4" />
    }
  }

  const getTypeBadge = (type: Transaction["type"]) => {
    const colors = {
      earn: "bg-green-100 text-green-800",
      spend: "bg-red-100 text-red-800",
      transfer: "bg-blue-100 text-blue-800",
      topup: "bg-purple-100 text-purple-800",
    }
    return (
      <Badge variant="outline" className={colors[type]}>
        {type}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading transactions...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Transactions</p>
                <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <RefreshCw className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Completed</p>
                <p className="text-3xl font-bold text-green-900">{stats.completed}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Pending</p>
                <p className="text-3xl font-bold text-orange-900">{stats.pending}</p>
              </div>
              <TrendingDown className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Total Amount</p>
                <p className="text-3xl font-bold text-purple-900">{stats.totalAmount.toLocaleString()}</p>
              </div>
              <Plus className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Transaction Management
              </CardTitle>
              <CardDescription>Monitor and manage all SM Rewards transactions</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadTransactions}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="earn">Earn</SelectItem>
                    <SelectItem value="spend">Spend</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="topup">Top Up</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={clearFilters} size="icon">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Label htmlFor="items-per-page" className="text-sm">Show:</Label>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                  setItemsPerPage(Number(value))
                  setCurrentPage(1)
                }}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {searchTerm || statusFilter !== "all" || typeFilter !== "all" 
                          ? "No transactions match your filters" 
                          : "No transactions found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-mono text-sm">#{transaction.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{profile?.username || transaction.user_id}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(transaction.type)}
                            {getTypeBadge(transaction.type)}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span
                              className={
                                transaction.type === "earn" || transaction.type === "topup"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {transaction.type === "earn" || transaction.type === "topup" ? "+" : "-"}
                              {transaction.amount.toLocaleString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {transaction.description || "No description"}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          <div>
                            <div>{transaction.date}</div>
                            <div className="text-muted-foreground">{transaction.time}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTransaction(transaction)
                                setShowTransactionDetails(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {transaction.status === "pending" && (
                              <div className="flex space-x-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateTransactionStatus(transaction.id, "completed")}
                                  className="text-green-600 hover:text-green-700"
                                  disabled={isUpdatingStatus}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateTransactionStatus(transaction.id, "failed")}
                                  className="text-red-600 hover:text-red-700"
                                  disabled={isUpdatingStatus}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {/* Page numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          className="w-8 h-8"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      {selectedTransaction && (
        <Dialog open={showTransactionDetails} onOpenChange={setShowTransactionDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>View detailed transaction information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Transaction ID</Label>
                  <p className="text-sm text-gray-600">#{selectedTransaction.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(selectedTransaction.type)}
                    <span className="text-sm capitalize">{selectedTransaction.type}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <p className="text-sm text-gray-600">{selectedTransaction.amount.toLocaleString()} SM Points</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  {getStatusBadge(selectedTransaction.status)}
                </div>
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <p className="text-sm text-gray-600">{selectedTransaction.date}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Time</Label>
                  <p className="text-sm text-gray-600">{selectedTransaction.time}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-gray-600">{selectedTransaction.description || "No description"}</p>
              </div>
              {selectedTransaction.status === "pending" && (
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleUpdateTransactionStatus(selectedTransaction.id, "completed")}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isUpdatingStatus}
                  >
                    {isUpdatingStatus ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleUpdateTransactionStatus(selectedTransaction.id, "failed")}
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    disabled={isUpdatingStatus}
                  >
                    {isUpdatingStatus ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Success!</h3>
            <p className="text-gray-600 mb-4">{successMessage}</p>
            <Button onClick={() => setShowSuccessModal(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <Button onClick={() => setShowErrorModal(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
