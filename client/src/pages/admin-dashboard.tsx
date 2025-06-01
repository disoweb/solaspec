
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { 
  Shield, 
  Users, 
  Package, 
  DollarSign,
  TrendingUp,
  Settings,
  BarChart3,
  FileText,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  UserCheck,
  Store,
  CreditCard,
  Bell,
  Mail,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Award,
  Flag,
  Zap
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto container-mobile py-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Admin Access Required</h3>
              <p className="text-muted-foreground mb-4">
                You need administrator privileges to access this dashboard.
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

  const { data: analytics } = useQuery({
    queryKey: ["/api/admin/analytics"],
    enabled: !!user,
  });

  const { data: pendingVendors } = useQuery({
    queryKey: ["/api/admin/vendors/pending"],
    enabled: !!user,
  });

  const { data: recentOrders } = useQuery({
    queryKey: ["/api/admin/orders/recent"],
    enabled: !!user,
  });

  const { data: systemReports } = useQuery({
    queryKey: ["/api/admin/reports"],
    enabled: !!user,
  });

  const { data: supportTickets } = useQuery({
    queryKey: ["/api/admin/support/tickets"],
    enabled: !!user,
  });

  const approveVendorMutation = useMutation({
    mutationFn: async (vendorId: string) => {
      return apiRequest(`/api/admin/vendors/${vendorId}/approve`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Vendor Approved",
        description: "Vendor has been approved and notified",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendors/pending"] });
    },
  });

  const rejectVendorMutation = useMutation({
    mutationFn: async ({ vendorId, reason }: { vendorId: string; reason: string }) => {
      return apiRequest(`/api/admin/vendors/${vendorId}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Vendor Rejected",
        description: "Vendor application has been rejected",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendors/pending"] });
    },
  });

  const updateSystemSettingMutation = useMutation({
    mutationFn: async (settings: any) => {
      return apiRequest("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "System settings have been updated successfully",
      });
    },
  });

  const stats = {
    totalRevenue: analytics?.totalRevenue || 0,
    totalOrders: analytics?.totalOrders || 0,
    totalVendors: analytics?.totalVendors || 0,
    totalCustomers: analytics?.totalCustomers || 0,
    monthlyGrowth: analytics?.monthlyGrowth || 0,
    pendingApprovals: pendingVendors?.length || 0,
    activeTickets: supportTickets?.filter((ticket: any) => ticket.status === 'open').length || 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto container-mobile py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your marketplace and monitor system performance
          </p>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +{stats.monthlyGrowth}% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all vendors
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalVendors}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.pendingApprovals} pending approval
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered users
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    Pending Approvals ({stats.pendingApprovals})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingVendors && pendingVendors.length > 0 ? (
                    <div className="space-y-3">
                      {pendingVendors.slice(0, 3).map((vendor: any) => (
                        <div key={vendor.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{vendor.companyName}</p>
                            <p className="text-sm text-muted-foreground">{vendor.email}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => approveVendorMutation.mutate(vendor.id)}
                              disabled={approveVendorMutation.isPending}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectVendorMutation.mutate({ vendorId: vendor.id, reason: "Requirements not met" })}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                      {pendingVendors.length > 3 && (
                        <Button variant="outline" className="w-full" onClick={() => setActiveTab("vendors")}>
                          View All ({pendingVendors.length - 3} more)
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No pending approvals</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Support Tickets ({stats.activeTickets})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {supportTickets && supportTickets.length > 0 ? (
                    <div className="space-y-3">
                      {supportTickets.slice(0, 3).map((ticket: any) => (
                        <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{ticket.subject}</p>
                            <p className="text-sm text-muted-foreground">
                              {ticket.customerName} • {ticket.priority}
                            </p>
                          </div>
                          <Badge variant={
                            ticket.priority === 'high' ? 'destructive' :
                            ticket.priority === 'medium' ? 'default' : 'secondary'
                          }>
                            {ticket.priority}
                          </Badge>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" onClick={() => setActiveTab("support")}>
                        View All Tickets
                      </Button>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No active tickets</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {recentOrders && recentOrders.length > 0 ? (
                  <div className="space-y-3">
                    {recentOrders.map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.customerName} • {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${order.totalAmount.toLocaleString()}</p>
                          <Badge variant={
                            order.status === 'completed' ? 'default' :
                            order.status === 'installing' ? 'secondary' : 'outline'
                          }>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">No recent orders</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vendors Tab */}
          <TabsContent value="vendors" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Vendor Management</h2>
              <div className="flex gap-2">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Invite Vendor
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Vendor List */}
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {pendingVendors?.map((vendor: any) => (
                    <div key={vendor.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <h4 className="font-medium">{vendor.companyName}</h4>
                          <p className="text-sm text-muted-foreground">{vendor.email}</p>
                          <p className="text-sm text-muted-foreground">{vendor.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{vendor.status}</Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => approveVendorMutation.mutate(vendor.id)}
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Order Management</h2>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Orders
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {recentOrders?.map((order: any) => (
                    <div key={order.id} className="p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Order #{order.id.slice(0, 8)}</h4>
                        <p className="text-sm text-muted-foreground">
                          {order.customerName} • {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ${order.totalAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          order.status === 'completed' ? 'default' :
                          order.status === 'installing' ? 'secondary' : 'outline'
                        }>
                          {order.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold">System Settings</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Marketplace Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow New Vendor Registration</Label>
                      <p className="text-sm text-muted-foreground">Enable vendors to register</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-approve Vendors</Label>
                      <p className="text-sm text-muted-foreground">Automatically approve new vendors</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Commission Rate (%)</Label>
                      <p className="text-sm text-muted-foreground">Default commission rate</p>
                    </div>
                    <Input type="number" defaultValue="10" className="w-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Escrow System</Label>
                      <p className="text-sm text-muted-foreground">Hold payments until completion</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-release Days</Label>
                      <p className="text-sm text-muted-foreground">Days to auto-release funds</p>
                    </div>
                    <Input type="number" defaultValue="7" className="w-20" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Minimum Order Amount</Label>
                      <p className="text-sm text-muted-foreground">Minimum order value</p>
                    </div>
                    <Input type="number" defaultValue="1000" className="w-24" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label>New Order Notifications</Label>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Vendor Application Alerts</Label>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Payment Notifications</Label>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>System Alerts</Label>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => updateSystemSettingMutation.mutate({})}>
                Save Settings
              </Button>
            </div>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Support Management</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Ticket
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{supportTickets?.filter((t: any) => t.status === 'open').length || 0}</div>
                  <p className="text-sm text-muted-foreground">Open Tickets</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{supportTickets?.filter((t: any) => t.status === 'pending').length || 0}</div>
                  <p className="text-sm text-muted-foreground">Pending Response</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{supportTickets?.filter((t: any) => t.status === 'resolved').length || 0}</div>
                  <p className="text-sm text-muted-foreground">Resolved Today</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {supportTickets?.map((ticket: any) => (
                    <div key={ticket.id} className="p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{ticket.subject}</h4>
                        <p className="text-sm text-muted-foreground">
                          {ticket.customerName} • {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          ticket.priority === 'high' ? 'destructive' :
                          ticket.priority === 'medium' ? 'default' : 'secondary'
                        }>
                          {ticket.priority}
                        </Badge>
                        <Badge variant="outline">{ticket.status}</Badge>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Analytics & Reports</h2>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Date Range
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Sales Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">+{stats.monthlyGrowth}%</div>
                  <Progress value={stats.monthlyGrowth} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3.2%</div>
                  <Progress value={32} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Avg Order Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(stats.totalRevenue / Math.max(stats.totalOrders, 1)).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">Per order</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Customer Satisfaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.8/5</div>
                  <div className="flex mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Chart visualization would go here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
