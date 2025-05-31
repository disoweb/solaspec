import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Zap, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductCard from "@/components/product-card";

export default function Home() {
  const { user } = useAuth();

  const { data: featuredProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products?featured=true"],
  });

  const { data: cartItems } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const { data: orders } = useQuery({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  const getDashboardPath = () => {
    switch (user?.role) {
      case 'vendor':
        return '/vendor-dashboard';
      case 'admin':
        return '/admin-dashboard';
      default:
        return '/buyer-dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Welcome Section */}
      <section className="solar-gradient py-12">
        <div className="max-w-7xl mx-auto container-mobile">
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Welcome back, {user?.firstName || 'Solar Enthusiast'}!
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Your journey to sustainable energy continues here
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/marketplace">
                <Button size="lg" className="solar-bg hover:bg-primary/90">
                  Browse Marketplace
                </Button>
              </Link>
              <Link href={getDashboardPath()}>
                <Button variant="outline" size="lg" className="solar-border solar-text hover:bg-accent">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card>
              <CardContent className="p-6 text-center">
                <ShoppingCart className="w-8 h-8 solar-text mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{cartItems?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Items in Cart</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{orders?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Orders Placed</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  ${orders?.reduce((sum: number, order: any) => sum + parseFloat(order.totalAmount || 0), 0).toLocaleString() || '0'}
                </div>
                <div className="text-sm text-muted-foreground">Total Invested</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto container-mobile">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Featured Solar Systems</h2>
              <p className="text-muted-foreground">Handpicked systems from our top-rated vendors</p>
            </div>
            <Link href="/marketplace">
              <Button variant="outline" className="solar-border solar-text hover:bg-accent">
                View All
              </Button>
            </Link>
          </div>
          
          {productsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts?.slice(0, 3).map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto container-mobile">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Quick Actions</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/marketplace">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 solar-bg rounded-lg flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Browse Products</h3>
                  <p className="text-sm text-muted-foreground">Explore our solar system catalog</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/installers">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Find Installers</h3>
                  <p className="text-sm text-muted-foreground">Connect with certified professionals</p>
                </CardContent>
              </Card>
            </Link>
            
            {user?.role === 'vendor' && (
              <Link href="/vendor-dashboard">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Vendor Dashboard</h3>
                    <p className="text-sm text-muted-foreground">Manage your products and sales</p>
                  </CardContent>
                </Card>
              </Link>
            )}
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Get Support</h3>
                <p className="text-sm text-muted-foreground">Contact our expert team</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      {orders && orders.length > 0 && (
        <section className="py-16 bg-card">
          <div className="max-w-7xl mx-auto container-mobile">
            <h2 className="text-3xl font-bold text-foreground mb-8">Recent Activity</h2>
            
            <div className="space-y-4">
              {orders.slice(0, 3).map((order: any) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">Order #{order.id.slice(0, 8)}</h3>
                        <p className="text-sm text-muted-foreground">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">
                          ${parseFloat(order.totalAmount).toLocaleString()}
                        </div>
                        <Badge 
                          variant={order.status === 'completed' ? 'default' : 'secondary'}
                          className={order.status === 'completed' ? 'bg-green-500' : ''}
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link href={getDashboardPath()}>
                <Button variant="outline" className="solar-border solar-text hover:bg-accent">
                  View All Activity
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
