import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MarketplaceReports from "@/components/admin/marketplace-reports";
import AbuseReports from "@/components/admin/abuse-reports";
import Announcements from "@/components/admin/announcements";
import { 
  Users, 
  Store, 
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Megaphone,
  FileText,
  Shield,
  Settings,
  BarChart3,
  CheckCircle,
  Clock,
  Package,
  UserCheck
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: adminStats } = useQuery({
    queryKey: ["/api/analytics/admin"],
    enabled: user?.role === 'admin',
  });

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

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "users", label: "User Management", icon: Users },
    { id: "vendors", label: "Vendor Management", icon: Store },
    { id: "orders", label: "Order Management", icon: ShoppingCart },
    { id: "abuse-reports", label: "Abuse Reports", icon: AlertTriangle },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "verification", label: "Verification", icon: UserCheck },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto container-mobile py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your marketplace platform and monitor performance.
          </p>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-9 min-w-max">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2 whitespace-nowrap">
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden md:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-8">
            <OverviewTab adminStats={adminStats} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <MarketplaceReports />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagementTab />
          </TabsContent>

          <TabsContent value="vendors" className="space-y-6">
            <VendorManagementTab />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <OrderManagementTab />
          </TabsContent>

          <TabsContent value="abuse-reports" className="space-y-6">
            <AbuseReports />
          </TabsContent>

          <TabsContent value="announcements" className="space-y-6">
            <Announcements />
          </TabsContent>

          <TabsContent value="verification" className="space-y-6">
            <VerificationTab />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ adminStats }: { adminStats: any }) {
  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{adminStats?.totalUsers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Store className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Vendors</p>
                <p className="text-2xl font-bold">{adminStats?.totalVendors || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{adminStats?.totalOrders || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ${(adminStats?.totalRevenue || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              className="h-24 flex flex-col space-y-2"
              onClick={() => {}}
            >
              <Megaphone className="w-6 h-6" />
              <span>Send Announcement</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-24 flex flex-col space-y-2"
              onClick={() => {}}
            >
              <UserCheck className="w-6 h-6" />
              <span>Review Vendors</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-24 flex flex-col space-y-2"
              onClick={() => {}}
            >
              <AlertTriangle className="w-6 h-6" />
              <span>Check Reports</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-24 flex flex-col space-y-2"
              onClick={() => {}}
            >
              <BarChart3 className="w-6 h-6" />
              <span>View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {adminStats?.recentOrders?.slice(0, 5).map((order: any) => (
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
                  <p className="text-sm text-muted-foreground">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// User Management Tab
function UserManagementTab() {
  const { data: users } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">User Management</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">User management interface coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Vendor Management Tab
function VendorManagementTab() {
  const { data: vendors } = useQuery({
    queryKey: ["/api/vendors"],
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Vendor Management</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>All Vendors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Vendor management interface coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Order Management Tab
function OrderManagementTab() {
  const { data: orders } = useQuery({
    queryKey: ["/api/admin/orders"],
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Order Management</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Order management interface coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Verification Tab
function VerificationTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Vendor Verification</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Pending Verifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Verification management interface coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Settings Tab
function SettingsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Platform Settings</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Settings interface coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}