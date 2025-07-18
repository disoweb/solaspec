import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import VendorStats from "@/components/dashboard/vendor-stats";
import ProductImportExport from "@/components/vendor/product-import-export";
import RefundManagement from "@/components/vendor/refund-management";
import StaffManagement from "@/components/vendor/staff-management";
import PayoutManagement from "@/components/vendor/payout-management";
import VendorVerification from "@/components/vendor/vendor-verification";
import StorePolicies from "@/components/vendor/store-policies";
import StoreReviews from "@/components/vendor/store-reviews";
import SupportTickets from "@/components/vendor/support-tickets";
import { 
  Package, 
  TrendingUp, 
  Users, 
  Star,
  Settings,
  BarChart3,
  Store,
  Shield,
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  Plus,
  Download,
  Upload,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Import,
  RotateCcw,
  Award,
  UserPlus,
  Ticket,
  MessageCircle,
  FileCheck,
  ScrollText,
  Star as StarIcon
} from "lucide-react";

export default function VendorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Check if user has vendor role
  const { data: vendor } = useQuery({
    queryKey: ["/api/vendors/profile"],
    enabled: user?.role === 'vendor',
  });

  const { data: products } = useQuery({
    queryKey: ["/api/products", vendor?.id ? `?vendorId=${vendor.id}` : ""],
    enabled: !!vendor?.id,
  });

  const { data: orders } = useQuery({
    queryKey: ["/api/orders"],
    enabled: !!vendor?.id,
  });

  const { data: inventory } = useQuery({
    queryKey: ["/api/inventory"],
    enabled: !!vendor?.id,
  });

  const { data: inventoryAlerts } = useQuery({
    queryKey: ["/api/inventory/alerts"],
    enabled: !!vendor?.id,
  });

  const { data: escrowAccounts } = useQuery({
    queryKey: ["/api/escrow"],
    enabled: !!vendor?.id,
  });

  // Redirect if not vendor
  if (user?.role !== 'vendor') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto container-mobile py-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Vendor Access Required</h3>
              <p className="text-muted-foreground mb-4">
                You need vendor privileges to access this dashboard.
              </p>
              <Button asChild>
                <a href="/">Go Home</a>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "verification", label: "Verification", icon: FileCheck },
    { id: "products", label: "Products", icon: Package },
    { id: "import-export", label: "Import/Export", icon: Import },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "orders", label: "Orders", icon: FileText },
    { id: "escrow", label: "Escrow & Payments", icon: Shield },
    { id: "refunds", label: "Refunds", icon: RotateCcw },
    { id: "payouts", label: "Payouts", icon: DollarSign },
    { id: "coupons", label: "Coupons", icon: Ticket },
    { id: "staff", label: "Team & Staff", icon: UserPlus },
    { id: "policies", label: "Store Policies", icon: ScrollText },
    { id: "reviews", label: "Store Reviews", icon: StarIcon },
    { id: "support", label: "Support", icon: MessageCircle },
    { id: "badges", label: "Badges", icon: Award },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto container-mobile py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Vendor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {vendor?.companyName || user?.firstName}! Manage your solar products and sales.
          </p>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-13 min-w-max">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2 whitespace-nowrap">
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden md:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-8">
            <VendorStats />

            {/* Inventory Alerts */}
            {inventoryAlerts && inventoryAlerts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <span>Inventory Alerts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {inventoryAlerts.map((alert: any) => (
                      <div key={alert.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <span className="text-sm">{alert.message}</span>
                        <Button size="sm" variant="outline">Mark as Read</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button 
                    className="h-24 flex flex-col space-y-2"
                    onClick={() => setActiveTab("products")}
                  >
                    <Plus className="w-6 h-6" />
                    <span>Add Product</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col space-y-2"
                    onClick={() => setActiveTab("inventory")}
                  >
                    <Package className="w-6 h-6" />
                    <span>Manage Inventory</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col space-y-2"
                    onClick={() => setActiveTab("orders")}
                  >
                    <FileText className="w-6 h-6" />
                    <span>View Orders</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col space-y-2"
                    onClick={() => setActiveTab("escrow")}
                  >
                    <DollarSign className="w-6 h-6" />
                    <span>Check Payments</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            {orders && orders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-semibold text-foreground">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            ${parseFloat(order.totalAmount).toLocaleString()}
                          </p>
                          <Badge variant="secondary">{order.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="verification" className="space-y-6">
            <VendorVerification />
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <ProductsTab vendor={vendor} />
          </TabsContent>

          <TabsContent value="import-export" className="space-y-6">
            <ProductImportExport vendor={vendor} />
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <InventoryTab vendor={vendor} inventory={inventory} />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <OrdersTab orders={orders} />
          </TabsContent>

          <TabsContent value="escrow" className="space-y-6">
            <EscrowTab escrowAccounts={escrowAccounts} />
          </TabsContent>

          <TabsContent value="refunds" className="space-y-6">
            <RefundManagement />
          </TabsContent>

          <TabsContent value="payouts" className="space-y-6">
            <PayoutManagement />
          </TabsContent>

          <TabsContent value="coupons" className="space-y-6">
            <CouponsTab vendor={vendor} />
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            <StaffManagement />
          </TabsContent>

          <TabsContent value="policies" className="space-y-6">
            <StorePolicies />
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <StoreReviews />
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <SupportTickets />
          </TabsContent>

          <TabsContent value="badges" className="space-y-6">
            <BadgesTab vendor={vendor} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsTab vendor={vendor} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsTab vendor={vendor} />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}

// Products Tab Component
function ProductsTab({ vendor }: { vendor: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productFilter, setProductFilter] = useState("all");

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products", vendor?.id ? `?vendorId=${vendor.id}` : "", productFilter],
    enabled: !!vendor?.id,
  });

  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      await apiRequest("POST", "/api/products", productData);
    },
    onSuccess: () => {
      toast({
        title: "Product Created",
        description: "Your product has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setShowForm(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData = {
      name: formData.get("name"),
      description: formData.get("description"),
      price: formData.get("price"),
      capacity: formData.get("capacity"),
      type: formData.get("type"),
      imageUrl: formData.get("imageUrl"),
      stockQuantity: formData.get("stockQuantity"),
      minimumOrderQuantity: formData.get("minimumOrderQuantity"),
      warranty: formData.get("warranty"),
      efficiency: formData.get("efficiency"),
      locations: formData.get("locations")?.toString().split(",").map(l => l.trim()),
    };
    createProductMutation.mutate(productData);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted rounded animate-pulse"></div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Product Management</h2>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="pb-4">
        <Select value={productFilter} onValueChange={setProductFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter Products" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Product Name *</label>
                  <Input name="name" required />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Price ($) *</label>
                  <Input name="price" type="number" step="0.01" required />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Capacity</label>
                  <Input name="capacity" placeholder="e.g., 10kW" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Type *</label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Stock Quantity</label>
                  <Input name="stockQuantity" type="number" min="0" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Minimum Order Quantity</label>
                  <Input name="minimumOrderQuantity" type="number" min="1" defaultValue="1" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Warranty</label>
                  <Input name="warranty" placeholder="e.g., 25 years" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Efficiency (%)</label>
                  <Input name="efficiency" type="number" step="0.01" min="0" max="100" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <Textarea name="description" required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <Input name="imageUrl" type="url" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Available Locations (comma-separated)</label>
                <Input name="locations" placeholder="California, Texas, Nevada" />
              </div>

              <div className="flex space-x-4">
                <Button type="submit" disabled={createProductMutation.isPending}>
                  {createProductMutation.isPending ? "Creating..." : "Create Product"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {products && products.length > 0 ? (
        <div className="grid gap-6">
          {products.map((product: any) => (
            <Card key={product.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{product.name}</h3>
                    <p className="text-muted-foreground">{product.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant="secondary">{product.type}</Badge>
                      <span className="text-lg font-bold text-foreground">
                        ${parseFloat(product.price).toLocaleString()}
                      </span>
                      <Badge variant={product.inStock ? "default" : "destructive"}>
                        {product.stockQuantity || 0} in stock
                      </Badge>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Products Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your first solar system product.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Product
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Inventory Tab Component
function InventoryTab({ vendor, inventory }: { vendor: any; inventory: any[] }) {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Inventory Management</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Stock
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Product</th>
                  <th className="text-left p-2">SKU</th>
                  <th className="text-left p-2">Stock</th>
                  <th className="text-left p-2">Reserved</th>
                  <th className="text-left p-2">Available</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory?.map((item: any) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-2">{item.productName}</td>
                    <td className="p-2">{item.sku}</td>
                    <td className="p-2">{item.quantity}</td>
                    <td className="p-2">{item.reservedQuantity}</td>
                    <td className="p-2">{item.quantity - item.reservedQuantity}</td>
                    <td className="p-2">
                      <Badge variant={item.quantity <= item.minStockLevel ? "destructive" : "default"}>
                        {item.quantity <= item.minStockLevel ? "Low Stock" : "In Stock"}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Button size="sm" variant="outline">Update</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Orders Tab Component
function OrdersTab({ orders }: { orders: any[] }) {
  const [orderFilter, setOrderFilter] = useState("all");

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No orders yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Order Management</h2>

      <div className="pb-4">
        <Select value={orderFilter} onValueChange={setOrderFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter Orders" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {orders.map((order: any) => (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Order #{order.id.slice(0, 8)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">
                    ${parseFloat(order.totalAmount).toLocaleString()}
                  </p>
                  <Badge variant="secondary">{order.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Escrow Tab Component
function EscrowTab({ escrowAccounts }: { escrowAccounts: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Escrow & Payments</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Escrow Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {escrowAccounts?.map((account: any) => (
              <div key={account.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Order #{account.orderId}</h3>
                  <Badge variant={
                    account.status === 'completed' ? 'default' : 
                    account.status === 'funded' ? 'secondary' : 'outline'
                  }>
                    {account.status}
                  </Badge>
                </div>
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Amount</p>
                    <p className="font-medium">${account.totalAmount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Held Amount</p>
                    <p className="font-medium">${account.heldAmount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Released Amount</p>
                    <p className="font-medium">${account.releasedAmount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Customer</p>
                    <p className="font-medium">{account.customerName}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Analytics Tab Component
function AnalyticsTab({ vendor }: { vendor: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics & Reports</h2>

      <Card>
        <CardContent className="p-6 text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Advanced Analytics</h3>
          <p className="text-muted-foreground mb-4">
            Detailed analytics and reporting features coming soon.
          </p>
          <Button variant="outline">View Reports</Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Coupons Tab Component
function CouponsTab({ vendor }: { vendor: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: coupons } = useQuery({
    queryKey: ["/api/vendor/coupons"],
  });

  const createCouponMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/vendor/coupons", data);
    },
    onSuccess: () => {
      toast({
        title: "Coupon Created",
        description: "Your coupon has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/coupons"] });
      setShowCreateDialog(false);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Coupon Management</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Ticket className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Active Coupons</p>
                <p className="text-2xl font-bold">
                  {coupons?.filter((c: any) => c.isActive).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Uses</p>
                <p className="text-2xl font-bold">
                  {coupons?.reduce((sum: number, c: any) => sum + (c.usageCount || 0), 0) || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Savings Provided</p>
                <p className="text-2xl font-bold">$2,450</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          {coupons && coupons.length > 0 ? (
            <div className="space-y-4">
              {coupons.map((coupon: any) => (
                <div key={coupon.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold text-lg">{coupon.code}</h4>
                    <p className="text-gray-600">{coupon.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span>
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}% off` : `$${coupon.discountValue} off`}
                      </span>
                      <span>Used: {coupon.usageCount}/{coupon.usageLimit || '∞'}</span>
                      {coupon.expiresAt && (
                        <span>Expires: {new Date(coupon.expiresAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={coupon.isActive ? "default" : "secondary"}>
                      {coupon.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No coupons created yet</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Coupon
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Badges Tab Component
function BadgesTab({ vendor }: { vendor: any }) {
  const { data: badges } = useQuery({
    queryKey: ["/api/vendor/badges"],
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Vendor Badges</h2>

      <Card>
        <CardHeader>
          <CardTitle>Your Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          {badges && badges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge: any) => (
                <div key={badge.id} className="border rounded-lg p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full" 
                       style={{ backgroundColor: badge.badgeColor }}>
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold">{badge.badgeName}</h4>
                  <p className="text-sm text-gray-600 mt-1">{badge.badgeDescription}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Awarded: {new Date(badge.awardedAt).toLocaleDateString()}
                  </p>
                  {badge.expiresAt && (
                    <p className="text-xs text-red-500">
                      Expires: {new Date(badge.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No badges earned yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Keep selling and providing great service to earn badges!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Store Policies Tab Component
function StorePoliciesTab({ vendor }: { vendor: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<any>(null);

  const { data: policies } = useQuery({
    queryKey: ["/api/vendor/policies"],
  });

  const createPolicyMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/vendor/policies", data);
    },
    onSuccess: () => {
      toast({
        title: "Policy Created",
        description: "Store policy has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/policies"] });
      setShowCreateDialog(false);
    },
  });

  const policyTypes = [
    { value: 'shipping', label: 'Shipping Policy' },
    { value: 'returns', label: 'Returns & Refunds' },
    { value: 'privacy', label: 'Privacy Policy' },
    { value: 'terms', label: 'Terms of Service' },
    { value: 'warranty', label: 'Warranty Policy' },
    { value: 'payment', label: 'Payment Terms' },
    { value: 'custom', label: 'Custom Policy' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Store Policies</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Policy
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Store Policies</CardTitle>
        </CardHeader>
        <CardContent>
          {policies && policies.length > 0 ? (
            <div className="space-y-4">
              {policies.map((policy: any) => (
                <div key={policy.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{policy.title}</h4>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Badge variant="outline" className="mb-2">
                    {policyTypes.find(t => t.value === policy.policyType)?.label}
                  </Badge>
                  <p className="text-sm text-gray-600 line-clamp-3">{policy.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ScrollText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No store policies created yet</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Policy
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Store Reviews Tab Component
function StoreReviewsTab({ vendor }: { vendor: any }) {
  const { data: reviews } = useQuery({
    queryKey: ["/api/vendors", vendor?.id, "reviews"],
    enabled: !!vendor?.id,
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Store Reviews</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <StarIcon className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold">4.8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold">{reviews?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold">
                  {reviews?.filter((r: any) => 
                    new Date(r.createdAt).getMonth() === new Date().getMonth()
                  ).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.slice(0, 10).map((review: any) => (
                <div key={review.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.customerName}</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon 
                            key={i} 
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      {review.isVerifiedPurchase && (
                        <Badge variant="outline" className="text-xs">Verified Purchase</Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {review.title && (
                    <h4 className="font-medium mb-1">{review.title}</h4>
                  )}

                  <p className="text-sm text-gray-600 mb-2">{review.comment}</p>

                  {review.vendorReply && (
                    <div className="bg-gray-50 p-3 rounded-lg mt-2">
                      <p className="text-xs text-gray-500 mb-1">Vendor Response:</p>
                      <p className="text-sm">{review.vendorReply}</p>
                    </div>
                  )}

                  {!review.vendorReply && (
                    <Button size="sm" variant="outline">
                      Reply to Review
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <StarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No reviews yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Support Tickets Tab Component
function SupportTicketsTab({ vendor }: { vendor: any }) {
  const { data: tickets } = useQuery({
    queryKey: ["/api/support/tickets"],
  });

  const getStatusBadge = (status: string) => {
    const variants: any = {
      open: "destructive",
      in_progress: "default",
      waiting_customer: "secondary",
      waiting_vendor: "secondary",
      resolved: "outline",
      closed: "outline"
    };
    return <Badge variant={variants[status] || "secondary"}>{status.replace('_', ' ')}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Support Tickets</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Open</p>
                <p className="text-2xl font-bold">
                  {tickets?.filter((t: any) => t.status === 'open').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">
                  {tickets?.filter((t: any) => t.status === 'in_progress').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold">
                  {tickets?.filter((t: any) => t.status === 'resolved').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Closed</p>
                <p className="text-2xl font-bold">
                  {tickets?.filter((t: any) => t.status === 'closed').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {tickets && tickets.length > 0 ? (
            <div className="space-y-4">
              {tickets.slice(0, 10).map((ticket: any) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{ticket.subject}</h4>
                    <p className="text-sm text-gray-600">#{ticket.ticketNumber}</p>
                    <p className="text-xs text-gray-500">
                      From: {ticket.customerName} • {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(ticket.status)}
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No support tickets yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Settings Tab Component  
function SettingsTab({ vendor }: { vendor: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Vendor Settings</h2>

      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Company Name</label>
            <Input defaultValue={vendor?.companyName} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea defaultValue={vendor?.description} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Website</label>
            <Input defaultValue={vendor?.website} />
          </div>
          <Button>Update Profile</Button>
        </CardContent>
      </Card>
    </div>
  );
}