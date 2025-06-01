
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
  Import
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
    { id: "products", label: "Products", icon: Package },
    { id: "import-export", label: "Import/Export", icon: Import },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "orders", label: "Orders", icon: FileText },
    { id: "escrow", label: "Escrow & Payments", icon: Shield },
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
          <TabsList className="grid w-full grid-cols-8">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
                <tab.icon className="w-4 h-4" />
                <span className="hidden md:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

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

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products", vendor?.id ? `?vendorId=${vendor.id}` : ""],
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
