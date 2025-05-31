import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import AdminOverview from "@/components/dashboard/admin-overview";
import { 
  BarChart3, 
  Users, 
  Store, 
  Package, 
  Settings,
  Shield
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

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
    { id: "users", label: "Users", icon: Users },
    { id: "vendors", label: "Vendors", icon: Store },
    { id: "products", label: "Products", icon: Package },
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
            System administration and platform management
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
        {activeTab === "overview" && <AdminOverview />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "vendors" && <VendorsTab />}
        {activeTab === "products" && <ProductsTab />}
        {activeTab === "settings" && <SettingsTab />}
      </div>

      <Footer />
    </div>
  );
}

// Users Tab Component
function UsersTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">User Management</h2>
      
      <Card>
        <CardContent className="p-6 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">User Management</h3>
          <p className="text-muted-foreground mb-4">
            User management features will be implemented here.
          </p>
          <Button variant="outline">
            View All Users
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Vendors Tab Component
function VendorsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Vendor Management</h2>
      
      <Card>
        <CardContent className="p-6 text-center">
          <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Vendor Management</h3>
          <p className="text-muted-foreground mb-4">
            Vendor verification and management features will be implemented here.
          </p>
          <Button variant="outline">
            View All Vendors
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Products Tab Component
function ProductsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Product Management</h2>
      
      <Card>
        <CardContent className="p-6 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Product Management</h3>
          <p className="text-muted-foreground mb-4">
            Product moderation and management features will be implemented here.
          </p>
          <Button variant="outline">
            View All Products
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Settings Tab Component
function SettingsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Platform Settings</h2>
      
      <Card>
        <CardContent className="p-6 text-center">
          <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Platform Settings</h3>
          <p className="text-muted-foreground mb-4">
            System configuration and settings will be implemented here.
          </p>
          <Button variant="outline">
            Configure Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
