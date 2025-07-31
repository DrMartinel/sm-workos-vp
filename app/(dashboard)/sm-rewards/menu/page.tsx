"use client"

import { useState, useEffect } from "react"
import { Search, Filter, ShoppingCart, Coins, Package, Barcode, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { canteenProductsService, CanteenProduct } from "@/app/shared-ui/lib/utils/supabase/canteen-products"
import { cn } from "@/lib/utils"

export default function MenuPage() {
  const [products, setProducts] = useState<CanteenProduct[]>([])
  const [filteredProducts, setFilteredProducts] = useState<CanteenProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [selectedProduct, setSelectedProduct] = useState<CanteenProduct | null>(null)

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const data = await canteenProductsService.getAllProducts()
        setProducts(data)
        setFilteredProducts(data)
      } catch (error) {
        console.error("Failed to fetch products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Filter and sort products
  useEffect(() => {
    let filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.includes(searchTerm)
    )

    // Sort products
    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "price":
          aValue = a.price_sm_rewards
          bValue = b.price_sm_rewards
          break
        case "stock":
          aValue = a.stock_quantity
          bValue = b.stock_quantity
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredProducts(filtered)
  }, [products, searchTerm, sortBy, sortOrder])

  const ProductCard = ({ product }: { product: CanteenProduct }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border border-gray-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Product Image */}
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{product.name}</h3>
              <Badge
                variant={product.stock_quantity > 0 ? "default" : "secondary"}
                className="text-xs"
              >
                {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : "Out of stock"}
              </Badge>
            </div>

            {product.description && (
              <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
            )}

            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Coins className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold text-gray-900">{product.price_sm_rewards}</span>
                <span className="text-xs text-gray-500">SM Points</span>
              </div>
              <span className="text-xs text-gray-500">
                ≈ {(product.price_sm_rewards).toLocaleString()} VND
              </span>
            </div>

            {/* Barcode Info */}
            {product.barcode && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Barcode className="h-3 w-3" />
                <span className="font-mono">{product.barcode}</span>
              </div>
            )}

            {/* View Details Button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedProduct(product)
              }}
            >
              <Eye className="h-3 w-3 mr-1" />
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const ProductDetailModal = ({ product, onClose }: { product: CanteenProduct; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Product Details</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>

          {/* Product Image */}
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Package className="h-24 w-24 text-gray-400" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
              {product.description && (
                <p className="text-sm text-gray-600 mt-1">{product.description}</p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                <span className="text-xl font-bold text-gray-900">{product.price_sm_rewards}</span>
                <span className="text-sm text-gray-500">SM Points</span>
              </div>
              <span className="text-sm text-gray-500">
                ≈ {(product.price_sm_rewards).toLocaleString()} VND
              </span>
            </div>

            {/* Stock Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Stock Status</span>
              <Badge
                variant={product.stock_quantity > 0 ? "default" : "secondary"}
              >
                {product.stock_quantity > 0 ? `${product.stock_quantity} available` : "Out of stock"}
              </Badge>
            </div>

            {/* Barcode */}
            {product.barcode && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Barcode className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">Barcode</span>
                </div>
                <div className="font-mono text-sm bg-white p-2 rounded border">
                  {product.barcode}
                </div>
              </div>
            )}

            {/* Product ID */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Product ID</span>
                <span className="font-mono text-sm">{product.id}</span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-500 mt-4">Đang tải menu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu Canteen</h1>
          <p className="text-gray-500 mt-1">Xem tất cả sản phẩm có sẵn để mua bằng SM Points</p>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm sản phẩm, mô tả hoặc mã vạch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={(value: "name" | "price" | "stock") => setSortBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Tên</SelectItem>
                <SelectItem value="price">Giá</SelectItem>
                <SelectItem value="stock">Tồn kho</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="space-y-6">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? "Không tìm thấy sản phẩm nào phù hợp với tìm kiếm của bạn." : "Không có sản phẩm nào trong menu."}
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      {filteredProducts.length > 0 && (
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Hiển thị {filteredProducts.length} sản phẩm</span>
            <span>Tổng cộng {products.length} sản phẩm</span>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
} 