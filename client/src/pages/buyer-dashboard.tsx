
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  TrendingUp, 
  Users, 
  Star,
  Settings,
  Calendar,
  DollarSign,
  ShoppingCart,
  Heart,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  CreditCard,
  User,
  Bell,
  Shield,
  Gift,
  Award
} from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import BuyerOrders from "@/components/dashboard/buyer-orders";

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: orders } = useQuery({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  const { data: cartItems } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const { data: walletBalance } = useQuery({
    queryKey: ["/api/wallet/balance"],
    enabled: !!user,
  });

  // Redirect if not buyer or no user
  if (!user || (user.role !== 'buyer' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto container-mobile py-12">
          <Card>
            <CardContent className="p-6 text-center">
              <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Buyer Access Required</h3>
              <p className="text-muted-foreground mb-4">
                You need buyer privileges to access this dashboard.
              </p>
              <Button asChild>
                <Link href="/">Go Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const recentOrders = orders?.slice(0, 5) || [];
  const activeOrders = orders?.filter((order: any) => order.status === 'installing' || order.status === 'paid') || [];
  const completedOrders = orders?.filter((order: any) => order.status === 'completed') || [];
  const totalSpent = orders?.reduce((sum: number, order: any) => sum + order.totalAmount, 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto container-mobile py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-muted-foreground">
            Manage your solar journey from your personal dashboard
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orders?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {activeOrders.length} active orders
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all purchases
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cart Items</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{cartItems?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Items ready to purchase
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${walletBalance?.toLocaleString() || '0'}</div>
                  <p className="text-xs text-muted-foreground">
                    Available funds
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Recent Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentOrders.length > 0 ? (
                    <div className="space-y-4">
                      {recentOrders.map((order: any) => (
                        <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{order.productName}</p>
                            <p className="text-sm text-muted-foreground">
                              Order #{order.id.slice(0, 8)}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={
                              order.status === 'completed' ? 'default' :
                              order.status === 'installing' ? 'secondary' :
                              'outline'
                            }>
                              {order.status}
                            </Badge>
                            <p className="text-sm font-medium mt-1">
                              ${order.totalAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/buyer-dashboard?tab=orders">View All Orders</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No orders yet</p>
                      <Button asChild className="mt-2">
                        <Link href="/marketplace">Browse Products</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button asChild variant="outline" className="h-20 flex-col space-y-2">
                      <Link href="/marketplace">
                        <ShoppingCart className="w-6 h-6" />
                        <span>Browse Products</span>
                      </Link>
                    </Button>
                    
                    <Button asChild variant="outline" className="h-20 flex-col space-y-2">
                      <Link href="/installers">
                        <Users className="w-6 h-6" />
                        <span>Find Installers</span>
                      </Link>
                    </Button>
                    
                    <Button asChild variant="outline" className="h-20 flex-col space-y-2">
                      <Link href="/categories">
                        <Package className="w-6 h-6" />
                        <span>Categories</span>
                      </Link>
                    </Button>
                    
                    <Button variant="outline" className="h-20 flex-col space-y-2">
                      <Heart className="w-6 h-6" />
                      <span>Wishlist</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <BuyerOrders />
          </TabsContent>

          <TabsContent value="wishlist">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  Your Wishlist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Wishlist Items</h3>
                  <p className="text-muted-foreground mb-4">
                    Save products you're interested in to your wishlist
                  </p>
                  <Button asChild>
                    <Link href="/marketplace">Browse Products</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Wallet & Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-6 bg-primary/5 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Current Balance</h3>
                      <Button size="sm">Add Funds</Button>
                    </div>
                    <p className="text-3xl font-bold text-primary">
                      ${walletBalance?.toLocaleString() || '0.00'}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Recent Transactions</h4>
                    <div className="text-center py-8 text-muted-foreground">
                      No recent transactions
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">First Name</label>
                      <p className="text-lg">{user.firstName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Last Name</label>
                      <p className="text-lg">{user.lastName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <p className="text-lg">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Role</label>
                      <p className="text-lg capitalize">{user.role}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button variant="outline">Edit Profile</Button>
                  </div>
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
