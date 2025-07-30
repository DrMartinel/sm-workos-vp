"use client"

import { useState, useEffect, useRef } from "react"
import { canteenProductsService, CanteenProduct } from "@/lib/utils/supabase/canteen-products"
import { profilesService } from "@/lib/utils/supabase/profiles"
import {
  TrendingUp,
  Gift,
  CreditCard,
  QrCode,
  History,
  Send,
  Info,
  Plus,
  ArrowRightLeft,
  Coins,
  CheckCircle,
  XCircle,
  Camera,
  Scan,
  ChevronLeft,
  AlertCircle,
  FlipHorizontal,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import BarcodeScanner from "@/components/qr-scanner"
import BarcodeGenerator from "@/components/qr-generator"
import { VNPayService } from "@/app/shared-ui/lib/utils/vnpay"
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

// Transaction interface
interface Transaction {
  id: string
  type: "spend" | "earn" | "transfer" | "topup"
  amount: number
  description: string
  date: string
  time: string
  status: "completed" | "pending" | "failed"
}

// Initial mock transaction data for SM Rewards
const initialTransactions: Transaction[] = [
  {
    id: "1",
    type: "spend",
    amount: 25,
    description: "Lunch - Chicken Rice",
    date: "2024-01-25",
    time: "12:30 PM",
    status: "completed",
  },
  {
    id: "2",
    type: "earn",
    amount: 500,
    description: "Monthly Allowance",
    date: "2024-01-24",
    time: "09:00 AM",
    status: "completed",
  },
  {
    id: "3",
    type: "spend",
    amount: 8,
    description: "Coffee - Americano",
    date: "2024-01-24",
    time: "02:15 PM",
    status: "completed",
  },
  {
    id: "4",
    type: "transfer",
    amount: 50,
    description: "Transfer to John Doe",
    date: "2024-01-23",
    time: "11:45 AM",
    status: "completed",
  },
  {
    id: "5",
    type: "topup",
    amount: 200,
    description: "Top-up via Bank Transfer",
    date: "2024-01-22",
    time: "04:20 PM",
    status: "completed",
  },
  {
    id: "6",
    type: "spend",
    amount: 15,
    description: "Snack - Sandwich",
    date: "2024-01-21",
    time: "03:45 PM",
    status: "completed",
  },
  {
    id: "7",
    type: "transfer",
    amount: 30,
    description: "Transfer to Jane Smith",
    date: "2024-01-20",
    time: "11:20 AM",
    status: "completed",
  },
  {
    id: "8",
    type: "earn",
    amount: 100,
    description: "Performance Bonus",
    date: "2024-01-19",
    time: "09:15 AM",
    status: "completed",
  },
]



export default function SMRewardsPage() {
  const [currentView, setCurrentView] = useState<"main" | "history">("main")
  const [balance, setBalance] = useState(0)
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)

  // Modal states for SM Rewards
  const [showTopUpModal, setShowTopUpModal] = useState(false)
  const [showScanModal, setShowScanModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showInstructionsModal, setShowInstructionsModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [transferAmount, setTransferAmount] = useState("")
  const [transferRecipient, setTransferRecipient] = useState("")
  const [scannedProduct, setScannedProduct] = useState<{
    id: number
    name: string
    price: number
    image: string
    description?: string | null
    stock_quantity: number
    notFound?: boolean
    error?: boolean
  } | null>(null)
  const [isProcessingScan, setIsProcessingScan] = useState(false)
  const [filterType, setFilterType] = useState("all")
  const [searchTransactionTerm, setSearchTransactionTerm] = useState("")
  const [showQRTesting, setShowQRTesting] = useState(false)
  const [modalAmount, setModalAmount] = useState<string | null>(null);
  const [modalOrderInfo, setModalOrderInfo] = useState<string | null>(null);

  const vndBalance = balance * 1000


  const skipInitialBalanceFetch = useRef(false);

  // Fetch user's SM rewards balance on component mount
  const fetchBalance = async () => {
    try {
      setIsLoadingBalance(true)
      const userBalance = await profilesService.getSMRewardsBalance()
      setBalance(userBalance)
    } catch (error) {
      console.error('Error fetching SM rewards balance:', error)
      // Fallback to 0 if there's an error
      setBalance(0)
    } finally {
      setIsLoadingBalance(false)
    }
  }

  useEffect(() => {
    if (!skipInitialBalanceFetch.current) {
      fetchBalance();
    }
  }, []);

  // Effect to handle VNPay callback
  useEffect(() => {
    const search = window.location.search;
    const params = new URLSearchParams(search);

    const vnp_ResponseCode = params.get("vnp_ResponseCode");
    const vnp_TransactionStatus = params.get("vnp_TransactionStatus");
    const vnp_Amount = params.get("vnp_Amount");
    const vnp_OrderInfo = params.get("vnp_OrderInfo");

    if (vnp_ResponseCode && vnp_TransactionStatus) {
      if (vnp_ResponseCode === "00" && vnp_TransactionStatus === "00") {
        skipInitialBalanceFetch.current = true; // Set flag to skip initial fetch
        // Calculate coins to add
        const coinsToAdd = Math.floor(Number(vnp_Amount) * 0.001 / 100);

        // Update SM Points in the database
        profilesService.addSMRewards(coinsToAdd).then((success) => {
          if (success) {
            setShowSuccessModal(true);
            fetchBalance();
          } else {
            setShowErrorModal(true);
          }
        });
      } else {
        setShowErrorModal(true);
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Effect to fetch balance only if not skipped
  useEffect(() => {
    if (!skipInitialBalanceFetch.current) {
      fetchBalance();
    }
  }, []);

  // Helper function to generate current date and time
  const getCurrentDateTime = () => {
    const now = new Date()
    const date = now.toISOString().split("T")[0]
    const time = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    return { date, time }
  }

  // Helper function to add new transaction
  const addTransaction = (newTransaction: Omit<Transaction, "id" | "date" | "time" | "status">) => {
    const { date, time } = getCurrentDateTime()
    const transaction: Transaction = {
      ...newTransaction,
      id: Date.now().toString(),
      date,
      time,
      status: "completed",
    }
    setTransactions((prev) => [transaction, ...prev])
  }

  const handleTopUp = async () => {
    if (topUpAmount && paymentMethod) {
      const amount = Number.parseInt(topUpAmount);

      if (paymentMethod === "vnpay") {
        // VNPay flow
        const res = await VNPayService.createPayment({
          amount,
          language: "vn",
        });
        if (res.success && res.paymentUrl) {
          VNPayService.redirectToPayment(res.paymentUrl);
          return; // Stop further execution, redirecting
        } else {
          setShowTopUpModal(false);
          setShowErrorModal(true);
          return;
        }
      }

      const coinsToAdd = Math.floor(amount * 0.001)

      try {
        // Update balance in database
        const success = await profilesService.addSMRewards(coinsToAdd)
        
        if (success) {
          // Update local state
          setBalance((prev) => prev + coinsToAdd)

          // Add transaction to history
          addTransaction({
            type: "topup",
            amount: coinsToAdd,
            description: `Top-up via ${paymentMethod === "bank" ? "Bank Transfer" : paymentMethod === "qr" ? "QR Code Payment" : "Credit Card"}`,
          })

          setShowTopUpModal(false)
          setShowSuccessModal(true)
          setTopUpAmount("")
          setPaymentMethod("")
        } else {
          // Handle error
          setShowTopUpModal(false)
          setShowErrorModal(true)
        }
      } catch (error) {
        console.error('Error updating SM rewards balance:', error)
        setShowTopUpModal(false)
        setShowErrorModal(true)
      }
    }
  }

  const handleTransfer = async () => {
    if (transferAmount && transferRecipient) {
      const amount = Number.parseInt(transferAmount)
      if (amount > balance) {
        setShowTransferModal(false)
        setShowErrorModal(true)
      } else {
        try {
          // Update balance in database
          const success = await profilesService.deductSMRewards(amount)
          
          if (success) {
            // Update local state
            setBalance((prev) => prev - amount)

            // Add transaction to history
            const recipientName =
              transferRecipient === "john.doe"
                ? "John Doe"
                : transferRecipient === "jane.smith"
                  ? "Jane Smith"
                  : "Mike Johnson"
            
            addTransaction({
              type: "transfer",
              amount: amount,
              description: `Transfer to ${recipientName}`,
            })

            setShowTransferModal(false)
            setShowSuccessModal(true)
            setTransferAmount("")
            setTransferRecipient("")
          } else {
            // Handle error
            setShowTransferModal(false)
            setShowErrorModal(true)
          }
        } catch (error) {
          console.error('Error updating SM rewards balance:', error)
          setShowTransferModal(false)
          setShowErrorModal(true)
        }
      }
    }
  }

  const handleBarcodeScan = async (barcodeData: string) => {
    setIsProcessingScan(true)
    try {
      const product = await canteenProductsService.getProductByQR(barcodeData)
      if (product) {
        setScannedProduct({
          id: product.id,
          name: product.name,
          price: product.price_sm_rewards,
          image: product.image_url || "/placeholder.svg?height=100&width=100&text=Food",
          description: product.description || undefined,
          stock_quantity: product.stock_quantity
        })
      } else {
        // Product not found - show error state
        setScannedProduct({
          id: 0,
          name: "Product Not Found",
          price: 0,
          image: "/placeholder.svg?height=100&width=100&text=Not+Found",
          description: `Barcode "${barcodeData}" is not registered in our system.`,
          stock_quantity: 0,
          notFound: true
        })
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      // Show error state instead of fallback mock data
      setScannedProduct({
        id: 0,
        name: "Error Loading Product",
        price: 0,
        image: "/placeholder.svg?height=100&width=100&text=Error",
        description: "Unable to fetch product information. Please try again.",
        stock_quantity: 0,
        error: true
      })
    } finally {
      setIsProcessingScan(false)
    }
  }

  const handleScanError = (error: string) => {
    console.error("Barcode Scan error:", error)
    // You can show a toast notification here if needed
  }

  const handlePurchase = async () => {
    if (scannedProduct) {
      if (scannedProduct.price > balance) {
        setShowScanModal(false)
        setShowErrorModal(true)
      } else {
        try {
          // Update balance in database
          const success = await profilesService.deductSMRewards(scannedProduct.price)
          
          if (success) {
            // Update local state
            setBalance((prev) => prev - scannedProduct.price)

            // Add transaction to history
            addTransaction({
              type: "spend",
              amount: scannedProduct.price,
              description: `Purchase - ${scannedProduct.name}`,
            })

            setShowScanModal(false)
            setShowSuccessModal(true)
            setScannedProduct(null)
          } else {
            // Handle error
            setShowScanModal(false)
            setShowErrorModal(true)
          }
        } catch (error) {
          console.error('Error updating SM rewards balance:', error)
          setShowScanModal(false)
          setShowErrorModal(true)
        }
      }
    }
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesType = filterType === "all" || transaction.type === filterType
    const matchesSearch = transaction.description.toLowerCase().includes(searchTransactionTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "earn":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "spend":
        return <Coins className="h-4 w-4 text-red-600" />
      case "transfer":
        return <ArrowRightLeft className="h-4 w-4 text-blue-600" />
      case "topup":
        return <Plus className="h-4 w-4 text-purple-600" />
      default:
        return <Coins className="h-4 w-4 text-gray-600" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "earn":
      case "topup":
        return "text-green-600"
      case "spend":
      case "transfer":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  // Transaction History View Component
  const TransactionHistoryView = () => (
    <div className="space-y-6 bg-gray-50 min-h-screen">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentView("main")}
          className="flex items-center justify-center"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-500">View all your SM Point transactions</p>
        </div>
      </div>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>{filteredTransactions.length} transactions found</CardDescription>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("all")}
              className="rounded-full"
            >
              All
            </Button>
            <Button
              variant={filterType === "topup" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("topup")}
              className="rounded-full flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Top Up
            </Button>
            <Button
              variant={filterType === "spend" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("spend")}
              className="rounded-full flex items-center gap-1"
            >
              <QrCode className="h-3.5 w-3.5" />
              QR Pay
            </Button>
            <Button
              variant={filterType === "transfer" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("transfer")}
              className="rounded-full flex items-center gap-1"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              Transfer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-gray-50">{getTransactionIcon(transaction.type)}</div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {transaction.date} • {transaction.time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        "text-lg font-semibold flex items-center gap-1",
                        getTransactionColor(transaction.type),
                      )}
                    >
                      {transaction.type === "earn" || transaction.type === "topup" ? "+" : "-"}
                      {transaction.amount}
                      <Coins className="h-4 w-4" />
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No transactions found matching your criteria.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 bg-transparent"
                  onClick={() => {
                    setFilterType("all")
                    setSearchTransactionTerm("")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // SM Rewards Detail View Component
  const SMRewardsDetailView = () => (
    <div className="space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-900">SM Rewards</h1>
        <p className="text-gray-500">Manage your SM Points and rewards</p>
      </div>

      {/* Balance Card with Gradient Background */}
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0"
        onClick={() => setShowInstructionsModal(true)}
      >
        <CardHeader>
          <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
            <Coins className="h-5 w-5" />
            SM Point Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
                            <div className="text-3xl font-bold text-white">
                  {isLoadingBalance ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </div>
                  ) : (
                    balance.toLocaleString()
                  )}
                </div>
                <div className="text-sm text-blue-100">
                  {isLoadingBalance ? "Loading..." : `≈ ${vndBalance.toLocaleString()} VND`}
                </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowTopUpModal(true)}>
          <CardContent className="p-6 text-center">
            <div className="h-12 w-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900">Top Up</h3>
            <p className="text-sm text-gray-500 mt-1">Add funds</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowScanModal(true)}>
          <CardContent className="p-6 text-center">
            <div className="h-12 w-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
              <QrCode className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900">Scan to Pay</h3>
            <p className="text-sm text-gray-500 mt-1">Quick payment</p>
          </CardContent>
        </Card>

        {/* <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.location.href = '/applications/sm-rewards/menu'}>
          <CardContent className="p-6 text-center">
            <div className="h-12 w-12 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
              <Gift className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900">View Menu</h3>
            <p className="text-sm text-gray-500 mt-1">Browse products</p>
          </CardContent>
        </Card> */}

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentView("history")}>
          <CardContent className="p-6 text-center">
            <div className="h-12 w-12 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
              <History className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900">Transaction History</h3>
            <p className="text-sm text-gray-500 mt-1">View all</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowTransferModal(true)}>
          <CardContent className="p-6 text-center">
            <div className="h-12 w-12 mx-auto mb-3 bg-orange-100 rounded-full flex items-center justify-center">
              <ArrowRightLeft className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-medium text-gray-900">Transfer Point</h3>
            <p className="text-sm text-gray-500 mt-1">Send to others</p>
          </CardContent>
        </Card>
      </div>

      {/* Special Offers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-green-600" />
            Special Offers
          </CardTitle>
          <CardDescription>Limited time promotions and bonuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">20% Bonus Top-up</h4>
              <p className="text-sm text-green-800 mb-3">Get extra 20% points on your next top-up of 500+ points</p>
              <Button
                size="sm"
                variant="outline"
                className="bg-transparent border-green-600 text-green-700 hover:bg-green-50"
              >
                Claim Offer
              </Button>
            </div>
            <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Lunch Special</h4>
              <p className="text-sm text-blue-800 mb-3">Save 10 points on combo meals this week</p>
              <Button
                size="sm"
                variant="outline"
                className="bg-transparent border-blue-600 text-blue-700 hover:bg-blue-50"
              >
                View Menu
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Testing Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-purple-600" />
              <div>
                <CardTitle>QR Code Testing</CardTitle>
                <CardDescription>Generate QR codes for testing the scanner</CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQRTesting(!showQRTesting)}
              className="flex items-center gap-2"
            >
              {showQRTesting ? 'Hide' : 'Show'} Testing
            </Button>
          </div>
        </CardHeader>
        {showQRTesting && (
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Test Product QR Codes</h4>
                <div className="space-y-2">
                  {[
                    { name: 'Chicken Rice Set', data: 'product:1:Chicken Rice Set:25' },
                    { name: 'Coffee Americano', data: 'product:2:Coffee Americano:8' },
                    { name: 'Sandwich', data: 'product:3:Sandwich:15' },
                    { name: 'Noodle Soup', data: 'product:4:Noodle Soup:20' }
                  ].map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{product.name}</span>
                      <BarcodeGenerator 
                        defaultValue={product.data}
                        showDownload={false}
                        showCopy={true}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Custom Barcode</h4>
                <BarcodeGenerator 
                  defaultValue="product:999:Custom Product:50"
                  showDownload={true}
                  showCopy={true}
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest SM Point activities</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setCurrentView("history")}>
            View all
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  {getTransactionIcon(transaction.type)}
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.date} • {transaction.time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("font-medium flex items-center gap-1", getTransactionColor(transaction.type))}>
                    {transaction.type === "earn" || transaction.type === "topup" ? "+" : "-"}
                    {transaction.amount}
                    <Coins className="h-4 w-4" />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Main render logic
  const renderCurrentView = () => {
    if (currentView === "history") {
      return <TransactionHistoryView />
    }
    return <SMRewardsDetailView />
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Main Content - Conditionally render based on currentView */}
      {renderCurrentView()}

      {/* Modals for SM Rewards functionality */}

      {/* Instructions Modal */}
      <Dialog open={showInstructionsModal} onOpenChange={setShowInstructionsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              SM Point Instructions
            </DialogTitle>
            <DialogDescription>Learn how to earn and use your SM Points</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">How to Earn SM Points</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Monthly allowance: 500 SM Points</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Performance bonus: Up to 200 SM Points</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Referral bonus: 50 SM Points per referral</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Top-up: 1 VND = 0.001 SM Point</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">How to Use SM Points</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Canteen purchases: 1 SM Point = 1,000 VND</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Transfer to colleagues: No fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Company events: Special discounts</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Important Notes</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>SM Points expire after 12 months</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Maximum transfer: 1,000 SM Points per day</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Minimum top-up: 50,000 VND</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Top Up Modal */}
      <Dialog open={showTopUpModal} onOpenChange={setShowTopUpModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Top Up SM Points</DialogTitle>
            <DialogDescription>Add funds to your SM Point balance</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (VND)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
              />
              {topUpAmount && (
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  ≈ {Math.floor(Number.parseInt(topUpAmount) * 0.001)} <Coins className="h-3 w-3" />
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="payment">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="qr">QR Code Payment</SelectItem>
                  <SelectItem value="card">Credit Card</SelectItem>
                  <SelectItem value="vnpay">VNPay (ATM/Bank)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleTopUp} className="flex-1">
                Confirm Top Up
              </Button>
              <Button variant="outline" onClick={() => setShowTopUpModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Scan to Pay Modal */}
      <Dialog open={showScanModal} onOpenChange={setShowScanModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Scan to Pay</DialogTitle>
            <DialogDescription>
              Point your camera at a QR code to scan and make a payment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {isProcessingScan ? (
              <div className="text-center py-8">
                <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Processing scanned product...</p>
              </div>
            ) : !scannedProduct ? (
              <BarcodeScanner
                onScan={handleBarcodeScan} 
                onError={handleScanError}
                showCloseButton={false}
                showFlipButton={true}
                autoStart={true}
              />
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <img
                    src={scannedProduct.image || "/placeholder.svg"}
                    alt={scannedProduct.name}
                    className={`h-24 w-24 mx-auto rounded-lg object-cover ${scannedProduct.notFound || scannedProduct.error ? 'opacity-50' : ''}`}
                  />
                  <h3 className={`font-medium mt-2 ${scannedProduct.notFound ? 'text-red-600' : scannedProduct.error ? 'text-orange-600' : 'text-gray-900'}`}>
                    {scannedProduct.name}
                  </h3>
                  {scannedProduct.description && (
                    <p className={`text-sm ${scannedProduct.notFound ? 'text-red-500' : scannedProduct.error ? 'text-orange-500' : 'text-gray-500'}`}>
                      {scannedProduct.description}
                    </p>
                  )}
                  {!scannedProduct.notFound && !scannedProduct.error && (
                    <div className="mt-2">
                      <p className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-1">
                        {scannedProduct.price} <Coins className="h-6 w-6" />
                      </p>
                      <p className="text-sm text-gray-500">
                        ≈ {(scannedProduct.price * 1000).toLocaleString()} VND
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Stock: {scannedProduct.stock_quantity} available
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Balance check */}
                {!scannedProduct.notFound && !scannedProduct.error && scannedProduct.price > balance && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm">
                      Insufficient balance. You need {scannedProduct.price - balance} more SM Points.
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handlePurchase} 
                    className="flex-1"
                    disabled={scannedProduct.notFound || scannedProduct.error || scannedProduct.price > balance || scannedProduct.stock_quantity <= 0}
                  >
                    {scannedProduct.notFound || scannedProduct.error ? 'Cannot Purchase' : 'Confirm Purchase'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setScannedProduct(null)
                    }}
                  >
                    Scan Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setScannedProduct(null)
                      setShowScanModal(false)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Modal */}
      <Dialog open={showTransferModal} onOpenChange={setShowTransferModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer SM Points</DialogTitle>
            <DialogDescription>Send SM Points to another employee</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipient">Recipient</Label>
              <Select value={transferRecipient} onValueChange={setTransferRecipient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="john.doe">John Doe - Marketing</SelectItem>
                  <SelectItem value="jane.smith">Jane Smith - HR</SelectItem>
                  <SelectItem value="mike.johnson">Mike Johnson - IT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="transfer-amount">Amount</Label>
              <Input
                id="transfer-amount"
                type="number"
                placeholder="Enter amount"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />
              {transferAmount && (
                <p className="text-sm text-gray-500 mt-1">
                  ≈ {(Number.parseInt(transferAmount) * 1000).toLocaleString()} VND
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleTransfer} className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                Send Transfer
              </Button>
              <Button variant="outline" onClick={() => setShowTransferModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogTitle>Transaction Successful</DialogTitle>
        <DialogContent>
          <div className="text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Transaction Successful!</h3>
            <p className="text-gray-600 mb-4">
              {modalAmount && `You have topped up ${(Number(modalAmount) / 100).toLocaleString()} VND.`}
              {modalOrderInfo && <br />}
              {modalOrderInfo && <span>({decodeURIComponent(modalOrderInfo)})</span>}
            </p>
            <Button onClick={() => setShowSuccessModal(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent>
          <div className="text-center py-6">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Insufficient Balance</h3>
            <p className="text-gray-600 mb-4">You don't have enough SM Points for this transaction.</p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => {
                  setShowErrorModal(false)
                  setShowTopUpModal(true)
                }}
              >
                Top Up Now
              </Button>
              <Button variant="outline" onClick={() => setShowErrorModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
