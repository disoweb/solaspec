import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import VendorStats from "@/components/dashboard/vendor-stats";
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
  Eye
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function VendorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [showProductForm, setShowProductForm] = useState(false);
  const [inventoryAlerts, setInventoryAlerts] = useState([
    { id: 1, message: "Low stock for Product A" },
    { id: 2, message: "Product B is out of stock" },
  ]);
  const [inventory, setInventory] = useState([
    { id: 1, productName: "Solar Panel 300W", sku: "SP300", quantity: 50, reservedQuantity: 10, minStockLevel: 5 },
    { id: 2, productName: "Inverter 5kW", sku: "INV5", quantity: 20, reservedQuantity: 5, minStockLevel: 2 },
  ]);
  const [escrowAccounts, setEscrowAccounts] = useState([
    { id: 1, orderId: "1234", totalAmount: 1000, heldAmount: 1000, releasedAmount: 0, customerName: "John Doe", status: "funded" },
    { id: 2, orderId: "5678", totalAmount: 2500, heldAmount: 2500, releasedAmount: 0, customerName: "Jane Smith", status: "funded" },
    { id: 3, orderId: "9101", totalAmount: 1500, heldAmount: 0, releasedAmount: 1500, customerName: "Alice Johnson", status: "completed" },
  ]);

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
    { id: "orders", label: "Orders", icon: Package },
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
        <div className="flex flex-wrap gap-2 mb-8 border-b">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center space-x-2"
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <VendorStats />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    className="h-24 flex flex-col space-y-2"
                    onClick={() => {
                      setActiveTab("products");
                      setShowProductForm(true);
                    }}
                  >
                    <Plus className="w-6 h-6" />
                    <span>Add New Product</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col space-y-2"
                    onClick={() => setActiveTab("orders")}
                  >
                    <Package className="w-6 h-6" />
                    <span>View Orders</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col space-y-2"
                    onClick={() => setActiveTab("settings")}
                  >
                    <Settings className="w-6 h-6" />
                    <span>Update Profile</span>
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
          </div>
        )}

        {activeTab === "products" && <ProductsTab vendor={vendor} />}
        {activeTab === "orders" && <OrdersTab />}
        {activeTab === "settings" && <SettingsTab vendor={vendor} />}
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
        <h2 className="text-2xl font-bold text-foreground">My Products</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
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
                  <label className="block text-sm font-medium mb-1">Product Name</label>
                  <Input name="name" required />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Price ($)</label>
                  <Input name="price" type="number" required />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Capacity</label>
                  <Input name="capacity" placeholder="e.g., 10kW" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
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
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
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
                        {product.inStock ? "In Stock" : "Out of Stock"}
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

// Orders Tab Component
function OrdersTab() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  if (isLoading) {
    return <div className="h-32 bg-muted rounded animate-pulse"></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Order Management</h2>

      {orders && orders.length > 0 ? (
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
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No orders yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Settings Tab Component  
function SettingsTab({ vendor }: { vendor: any }) {
  const [inventoryAlerts, setInventoryAlerts] = useState([
    { id: 1, message: "Low stock for Product A" },
    { id: 2, message: "Product B is out of stock" },
  ]);
  const [inventory, setInventory] = useState([
    { id: 1, productName: "Solar Panel 300W", sku: "SP300", quantity: 50, reservedQuantity: 10, minStockLevel: 5 },
    { id: 2, productName: "Inverter 5kW", sku: "INV5", quantity: 20, reservedQuantity: 5, minStockLevel: 2 },
  ]);
  const [escrowAccounts, setEscrowAccounts] = useState([
    { id: 1, orderId: "1234", totalAmount: 1000, heldAmount: 1000, releasedAmount: 0, customerName: "John Doe", status: "funded" },
    { id: 2, orderId: "5678", totalAmount: 2500, heldAmount: 2500, releasedAmount: 0, customerName: "Jane Smith", status: "funded" },
    { id: 3, orderId: "9101", totalAmount: 1500, heldAmount: 0, releasedAmount: 1500, customerName: "Alice Johnson", status: "completed" },
  ]);
  return (
    <Tabs defaultValue="settings" className="w-full">
      <TabsList>
        <TabsTrigger value="inventory">Inventory</TabsTrigger>
        <TabsTrigger value="escrow">Escrow</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
        <TabsContent value="inventory" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Inventory Management</h2>
              <Button>Add Stock</Button>
            </div>

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

            {/* Inventory Table */}
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
          </TabsContent>

          <TabsContent value="escrow" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Escrow Accounts</h2>
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
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Vendor settings and profile management coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
    </Tabs>
  );
}