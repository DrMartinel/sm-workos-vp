"use client"

import { useState, useEffect, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Barcode,
  DollarSign,
  Archive,
  Eye,
  EyeOff,
  Search,
  Filter,
  RefreshCw,
  X,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { canteenProductsService, CanteenProduct } from "@/lib/utils/supabase/canteen-products"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ProductManagementComponent() {
  const [products, setProducts] = useState<CanteenProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<CanteenProduct | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<CanteenProduct | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    barcode: "",
    price_sm_rewards: 0,
    stock_quantity: 0,
    image_url: "",
    is_active: true,
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Success and Error modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  // Load products on component mount
  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setIsLoading(true)
    try {
      const productsData = await canteenProductsService.getAllProducts()
      setProducts(productsData)
    } catch (error) {
      console.error('Error loading products:', error)
      setErrorMessage("Failed to load products. Please try again.")
      setShowErrorModal(true)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      barcode: "",
      price_sm_rewards: 0,
      stock_quantity: 0,
      image_url: "",
      is_active: true,
    })
  }

  const handleAdd = async () => {
    if (!formData.name || formData.price_sm_rewards <= 0) {
      setErrorMessage("Please fill in all required fields (Product Name and Price).")
      setShowErrorModal(true)
      return
    }

    setIsSubmitting(true)
    try {
      const newProduct = await canteenProductsService.createProduct({
      name: formData.name,
      description: formData.description || null,
        barcode: formData.barcode || null,
      price_sm_rewards: formData.price_sm_rewards,
      stock_quantity: formData.stock_quantity,
        image_url: formData.image_url || null,
      is_active: formData.is_active,
      })

      if (newProduct) {
    setProducts([...products, newProduct])
    setIsAddDialogOpen(false)
    resetForm()
        setSuccessMessage(`Product "${formData.name}" has been created successfully!`)
        setShowSuccessModal(true)
      } else {
        setErrorMessage("Failed to create product. Please try again.")
        setShowErrorModal(true)
      }
    } catch (error) {
      console.error('Error adding product:', error)
      setErrorMessage("An error occurred while creating the product. Please try again.")
      setShowErrorModal(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (product: CanteenProduct) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || "",
      barcode: product.barcode || "",
      price_sm_rewards: product.price_sm_rewards,
      stock_quantity: product.stock_quantity,
      image_url: product.image_url || "",
      is_active: product.is_active,
    })
  }

  const handleUpdate = async () => {
    if (!editingProduct || !formData.name || formData.price_sm_rewards <= 0) {
      setErrorMessage("Please fill in all required fields (Product Name and Price).")
      setShowErrorModal(true)
      return
    }

    setIsSubmitting(true)
    try {
      const updatedProduct = await canteenProductsService.updateProduct(editingProduct.id, {
      name: formData.name,
      description: formData.description || null,
        barcode: formData.barcode || null,
      price_sm_rewards: formData.price_sm_rewards,
      stock_quantity: formData.stock_quantity,
        image_url: formData.image_url || null,
      is_active: formData.is_active,
      })

      if (updatedProduct) {
    setProducts(products.map((p) => (p.id === editingProduct.id ? updatedProduct : p)))
    setEditingProduct(null)
    resetForm()
        setSuccessMessage(`Product "${formData.name}" has been updated successfully!`)
        setShowSuccessModal(true)
      } else {
        setErrorMessage("Failed to update product. Please try again.")
        setShowErrorModal(true)
      }
    } catch (error) {
      console.error('Error updating product:', error)
      setErrorMessage("An error occurred while updating the product. Please try again.")
      setShowErrorModal(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (product: CanteenProduct) => {
    setIsSubmitting(true)
    try {
      const success = await canteenProductsService.deleteProduct(product.id)
      if (success) {
        setProducts(products.filter((p) => p.id !== product.id))
        setDeletingProduct(null)
        setSuccessMessage(`Product "${product.name}" has been deleted successfully!`)
        setShowSuccessModal(true)
      } else {
        setErrorMessage("Failed to delete product. Please try again.")
        setShowErrorModal(true)
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      setErrorMessage("An error occurred while deleting the product. Please try again.")
      setShowErrorModal(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const hardDeleteProduct = async (product: CanteenProduct) => {
    setIsSubmitting(true)
    try {
      const success = await canteenProductsService.hardDeleteProduct(product.id)
      if (success) {
        setProducts(products.filter((p) => p.id !== product.id))
        setDeletingProduct(null)
        setSuccessMessage(`Product "${product.name}" has been permanently deleted!`)
        setShowSuccessModal(true)
      } else {
        setErrorMessage("Failed to permanently delete product. Please try again.")
        setShowErrorModal(true)
      }
    } catch (error) {
      console.error('Error hard deleting product:', error)
      setErrorMessage("An error occurred while permanently deleting the product. Please try again.")
      setShowErrorModal(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleActive = async (product: CanteenProduct) => {
    try {
      const updatedProduct = await canteenProductsService.updateProduct(product.id, {
        is_active: !product.is_active
      })

      if (updatedProduct) {
        setProducts(products.map((p) => (p.id === product.id ? updatedProduct : p)))
        const status = updatedProduct.is_active ? "activated" : "deactivated"
        setSuccessMessage(`Product "${product.name}" has been ${status} successfully!`)
        setShowSuccessModal(true)
      } else {
        setErrorMessage(`Failed to ${product.is_active ? "deactivate" : "activate"} product. Please try again.`)
        setShowErrorModal(true)
      }
    } catch (error) {
      console.error('Error toggling product status:', error)
      setErrorMessage("An error occurred while updating the product status. Please try again.")
      setShowErrorModal(true)
    }
  }

  // Calculate summary stats
  const stats = useMemo(() => {
    const total = products.length
    const active = products.filter((p) => p.is_active).length
    const totalStock = products.reduce((sum, p) => sum + p.stock_quantity, 0)
    const lowStock = products.filter((p) => p.stock_quantity < 10).length

    return { total, active, totalStock, lowStock }
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        searchTerm === "" ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })
  }, [products, searchTerm])

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const clearFilters = () => {
    setSearchTerm("")
    setCurrentPage(1)
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading products...</span>
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
                <p className="text-sm font-medium text-blue-700">Total Products</p>
                <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <Package className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Active Products</p>
                <p className="text-3xl font-bold text-green-900">{stats.active}</p>
              </div>
              <Eye className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Total Stock</p>
                <p className="text-3xl font-bold text-purple-900">{stats.totalStock}</p>
              </div>
              <Archive className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Low Stock</p>
                <p className="text-3xl font-bold text-orange-900">{stats.lowStock}</p>
              </div>
              <AlertCircle className="h-10 w-10 text-orange-600" />
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
                Product Management
              </CardTitle>
              <CardDescription>Add, edit, and manage products available for SM Rewards redemption</CardDescription>
        </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadProducts}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
                <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>Create a new product for SM Rewards redemption</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="Enter barcode (optional)"
                />
                      </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter product description"
                />
              </div>
                    <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">SM Rewards Price *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price_sm_rewards}
                  onChange={(e) => setFormData({ ...formData, price_sm_rewards: Number.parseInt(e.target.value) || 0 })}
                  placeholder="Enter price in SM Rewards points"
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: Number.parseInt(e.target.value) || 0 })}
                  placeholder="Enter stock quantity"
                />
                      </div>
                      <div>
                        <Label htmlFor="image">Image URL</Label>
                        <Input
                          id="image"
                          value={formData.image_url}
                          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                          placeholder="Enter image URL"
                        />
                      </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
                    <Button onClick={handleAdd} disabled={isSubmitting || !formData.name || formData.price_sm_rewards <= 0}>
                      {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Add Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                {searchTerm && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex items-center space-x-2">
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
                  <TableHead>Product</TableHead>
                  <TableHead>Barcode</TableHead>
                    <TableHead>Price (SM Points)</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {currentProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? "No products match your search criteria" : "No products found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                          <div className="flex items-center space-x-3">
                        <img
                              src={product.image_url || "/placeholder.svg"}
                          alt={product.name}
                              className="h-12 w-12 rounded-lg object-cover border"
                        />
                        <div>
                          <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">{product.description}</div>
                            </div>
                      </div>
                    </TableCell>
                    <TableCell>
                          {product.barcode ? (
                            <Badge variant="outline" className="font-mono text-xs">
                              {product.barcode}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">No barcode</span>
                          )}
                    </TableCell>
                    <TableCell>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                            <span className="font-medium">{product.price_sm_rewards}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                          <Badge 
                            variant={product.stock_quantity > 10 ? "default" : product.stock_quantity > 0 ? "secondary" : "destructive"}
                          >
                            {product.stock_quantity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                          <div className="flex items-center space-x-2">
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? "Active" : "Inactive"}
                        </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleActive(product)}
                            >
                              {product.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDeletingProduct(product)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{product.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => hardDeleteProduct(product)}
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={isSubmitting}
                                  >
                                    {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
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

      {/* Edit Product Dialog */}
      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit Product</DialogTitle>
                              <DialogDescription>Update product information</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="edit-name">Product Name *</Label>
                                <Input
                                  id="edit-name"
                                  value={formData.name}
                                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-barcode">Barcode</Label>
                                <Input
                                  id="edit-barcode"
                                  value={formData.barcode}
                                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                />
                </div>
                              </div>
                              <div>
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                  id="edit-description"
                                  value={formData.description}
                                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                              </div>
              <div className="grid grid-cols-3 gap-4">
                              <div>
                  <Label htmlFor="edit-price">Price (SM Points) *</Label>
                                <Input
                                  id="edit-price"
                                  type="number"
                                  value={formData.price_sm_rewards}
                    onChange={(e) => setFormData({ ...formData, price_sm_rewards: Number.parseInt(e.target.value) || 0 })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-stock">Stock Quantity *</Label>
                                <Input
                                  id="edit-stock"
                                  type="number"
                                  value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-image">Image URL</Label>
                  <Input
                    id="edit-image"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  />
                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="edit-active"
                                  checked={formData.is_active}
                                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                />
                                <Label htmlFor="edit-active">Active</Label>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setEditingProduct(null)}>
                                Cancel
                              </Button>
              <Button onClick={handleUpdate} disabled={isSubmitting || !formData.name || formData.price_sm_rewards <= 0}>
                {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Update Product
              </Button>
                            </DialogFooter>
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
