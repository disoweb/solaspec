import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import BuyerOrders from "@/components/dashboard/buyer-orders";
import ShoppingCartComponent from "@/components/shopping-cart";
import PaymentCalculator from "@/components/payment-calculator";
import { 
  ShoppingCart, 
  Package, 
  Calculator, 
  CreditCard,
  User,
  Heart
} from "lucide-react";

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect if not buyer (or allow any authenticated user as potential buyer)
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto container-mobile py-12">
          <Card>
            <CardContent className="p-6 text-center">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Please Sign In</h3>
              <p className="text-muted-foreground mb-4">
                You need to be signed in to access your dashboard.
              </p>
              <Button asChild>
                <a href="/api/login">Sign In</a>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Package },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "cart", label: "Shopping Cart", icon: ShoppingCart },
    { id: "calculator", label: "Payment Calculator", icon: Calculator },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto container-mobile py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName}! Manage your solar journey here.
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
        {activeTab === "overview" && <OverviewTab user={user} />}
        {activeTab === "orders" && <BuyerOrders />}
        {activeTab === "cart" && <ShoppingCartComponent />}
        {activeTab === "calculator" && <PaymentCalculator />}
        {activeTab === "profile" && <ProfileTab user={user} />}
      </div>

      <Footer />
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ user }: { user: any }) {
  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <Card className="solar-gradient">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            {user?.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt={user.firstName || 'User'} 
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary-foreground" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Welcome back, {user?.firstName}!
              </h2>
              <p className="text-muted-foreground">
                Ready to continue your solar energy journey?
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Browse Products</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Explore our solar system catalog
            </p>
            <Button asChild className="w-full">
              <a href="/marketplace">Browse Now</a>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Find Installers</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect with certified professionals
            </p>
            <Button asChild variant="outline" className="w-full">
              <a href="/installers">Find Installers</a>
            </Button>
          </CardContent>
        </Card>
        
        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setActiveTab("calculator")}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Payment Calculator</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Estimate your solar investment
            </p>
            <Button variant="outline" className="w-full">
              Calculate
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Get Support</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Contact our expert team
            </p>
            <Button variant="outline" className="w-full">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BuyerOrders />
        <ShoppingCartComponent />
      </div>
    </div>
  );
}

// Profile Tab Component
function ProfileTab({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Profile Settings</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 mb-6">
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt={user.firstName || 'User'} 
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-muted-foreground" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-muted-foreground">{user?.email}</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Update Photo
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input 
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  defaultValue={user?.firstName || ''}
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input 
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  defaultValue={user?.lastName || ''}
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input 
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  defaultValue={user?.email || ''}
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <input 
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  defaultValue={user?.role || 'buyer'}
                  readOnly
                />
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-4">
                Profile information is managed through your account settings. 
                Contact support if you need to make changes.
              </p>
              <div className="flex space-x-4">
                <Button variant="outline">
                  Contact Support
                </Button>
                <Button variant="outline" asChild>
                  <a href="/api/logout">Sign Out</a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
