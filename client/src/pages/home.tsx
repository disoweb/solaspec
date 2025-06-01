import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Zap, Star, MapPin, TrendingUp, Users, Award, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductCard from "@/components/product-card";

const categories = [
  { id: "residential", name: "Residential Solar", icon: "🏠", count: 245 },
  { id: "commercial", name: "Commercial Solar", icon: "🏢", count: 132 },
  { id: "industrial", name: "Industrial Solar", icon: "🏭", count: 87 },
  { id: "accessories", name: "Solar Accessories", icon: "🔧", count: 156 },
];

const collections = [
  { id: "featured", name: "Featured Products", description: "Hand-picked solar solutions" },
  { id: "new", name: "New Arrivals", description: "Latest solar technology" },
  { id: "bestsellers", name: "Best Sellers", description: "Most popular products" },
  { id: "deals", name: "Special Deals", description: "Limited time offers" },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const { data: featuredProducts = [] } = useQuery({
    queryKey: ["/api/products", { featured: true, limit: 8 }],
  });

  const { data: newProducts = [] } = useQuery({
    queryKey: ["/api/products", { limit: 6, sortBy: "newest" }],
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["/api/vendors", { verified: true, limit: 6 }],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/marketplace?search=${encodeURIComponent(searchQuery)}${selectedCategory ? `&category=${selectedCategory}` : ''}`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section with Search */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <span className="text-4xl font-bold text-blue-600">Solaspec</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Solar Marketplace
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect with verified vendors, professional installers, and find the perfect solar solution for your needs
            </p>

            {/* Enhanced Search Bar */}
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 bg-white rounded-lg shadow-lg p-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search for solar panels, inverters, batteries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 text-lg focus:ring-0"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </div>
            </form>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">2,500+</div>
              <div className="text-gray-600">Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">500+</div>
              <div className="text-gray-600">Verified Vendors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">1,200+</div>
              <div className="text-gray-600">Installers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">10,000+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-xl text-gray-600">Find exactly what you need for your solar project</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/categories?type=${category.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{category.icon}</div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                    <Badge variant="secondary">{category.count} products</Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Collections</h2>
            <p className="text-xl text-gray-600">Curated selections for every solar need</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {collections.map((collection) => (
              <Link key={collection.id} href={`/marketplace?collection=${collection.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer group h-full">
                  <CardHeader>
                    <CardTitle className="group-hover:text-blue-600 transition-colors">
                      {collection.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{collection.description}</p>
                    <Button variant="outline" className="mt-4 w-full">
                      Explore Collection
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
              <p className="text-xl text-gray-600">Top-rated solar solutions</p>
            </div>
            <Link href="/marketplace?featured=true">
              <Button variant="outline">View All Featured</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Trusted Vendors */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted Vendors</h2>
            <p className="text-xl text-gray-600">Verified sellers you can trust</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor: any) => (
              <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{vendor.companyName}</h3>
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">
                          {vendor.rating || "5.0"} ({vendor.totalReviews || "0"} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{vendor.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant={vendor.verified ? "default" : "secondary"}>
                      {vendor.verified ? "Verified" : "Pending"}
                    </Badge>
                    <Link href={`/vendor/${vendor.id}`}>
                      <Button variant="outline" size="sm">View Store</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Go Solar?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied customers who've made the switch to clean energy
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/marketplace">
              <Button size="lg" variant="secondary">
                Browse Products
              </Button>
            </Link>
            <Link href="/installers">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
                Find Installers
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}