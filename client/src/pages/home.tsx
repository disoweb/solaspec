
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, TrendingUp, Star, MapPin, ShoppingCart, Eye, Zap, Shield, Award, Users, Package, Grid, List } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductCard from "@/components/product-card";
import { Link } from "wouter";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: featuredProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products", "featured=true&limit=8"],
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: topVendors } = useQuery({
    queryKey: ["/api/vendors", "verified=true&limit=6"],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/marketplace?search=${encodeURIComponent(searchTerm)}`;
    }
  };

  const productCategories = [
    {
      id: "residential",
      name: "Residential Solar",
      description: "Home solar solutions",
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop",
      count: 150,
    },
    {
      id: "commercial",
      name: "Commercial Solar", 
      description: "Business solar systems",
      image: "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=300&h=200&fit=crop",
      count: 89,
    },
    {
      id: "industrial",
      name: "Industrial Solar",
      description: "Large-scale installations",
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=300&h=200&fit=crop",
      count: 45,
    },
    {
      id: "portable",
      name: "Portable Solar",
      description: "Mobile solar solutions",
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop",
      count: 67,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section with Search */}
      <section className="solar-gradient py-16">
        <div className="max-w-7xl mx-auto container-mobile">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Solar Energy <span className="text-blue-600">Marketplace</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Connect with verified solar vendors, certified installers, and find the perfect solar solution for your needs.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search solar panels, inverters, batteries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-24 h-14 text-lg"
                />
                <Button 
                  type="submit"
                  className="absolute right-2 top-2 h-10 bg-blue-600 hover:bg-blue-700"
                >
                  Search
                </Button>
              </div>
            </form>

            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/marketplace">Browse All Products</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/installers">Find Installers</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/register">Become a Vendor</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto container-mobile">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Shop by Category</h2>
            <p className="text-xl text-muted-foreground">Find the perfect solar solution for your needs</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {productCategories.map((category) => (
              <Link key={category.id} href={`/marketplace?type=${category.id}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-all cursor-pointer group">
                  <div className="relative h-48">
                    <img 
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold">{category.name}</h3>
                      <p className="text-sm opacity-90">{category.description}</p>
                    </div>
                    <Badge className="absolute top-4 right-4 bg-white/90 text-black">
                      {category.count} products
                    </Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto container-mobile">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Featured Products</h2>
              <p className="text-xl text-muted-foreground">Top-rated systems from verified vendors</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <Button variant="outline" asChild>
                <Link href="/marketplace">View All</Link>
              </Button>
            </div>
          </div>

          {productsLoading ? (
            <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-4 gap-6" : "space-y-6"}>
              {[...Array(8)].map((_, i) => (
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
          ) : featuredProducts && featuredProducts.length > 0 ? (
            <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-4 gap-6" : "space-y-6"}>
              {featuredProducts.map((product: any) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  layout={viewMode}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Featured Products</h3>
              <p className="text-muted-foreground">Check back later for featured products.</p>
            </div>
          )}
        </div>
      </section>

      {/* Top Vendors Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto container-mobile">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Top Verified Vendors</h2>
            <p className="text-xl text-muted-foreground">Trusted partners in solar energy</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topVendors?.map((vendor: any) => (
              <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Zap className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{vendor.companyName}</h3>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-muted-foreground">{vendor.rating || "4.8"}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Verified</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {vendor.description || "Professional solar solutions provider with years of experience."}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {vendor.totalReviews || "0"} reviews
                    </span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/vendors/${vendor.id}`}>View Store</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto container-mobile">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Solaspec?</h2>
            <p className="text-xl text-muted-foreground">Your trusted solar marketplace</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Secure Payments",
                description: "Escrow protection and milestone-based payments ensure your money is safe"
              },
              {
                icon: Award,
                title: "Verified Vendors",
                description: "All vendors are thoroughly vetted and verified for quality assurance"
              },
              {
                icon: Users,
                title: "Expert Installers",
                description: "Certified professionals with proven track records"
              },
              {
                icon: Star,
                title: "Quality Guarantee",
                description: "30% tax credits and comprehensive warranties on all systems"
              }
            ].map((feature, index) => (
              <div key={feature.title} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto container-mobile text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Go Solar?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied customers who've made the switch to clean energy
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/marketplace">Shop Solar Systems</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600" asChild>
              <Link href="/register">Become a Vendor</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
