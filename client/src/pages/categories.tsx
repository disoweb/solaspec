
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Grid, List, Filter, Package, TrendingUp } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductCard from "@/components/product-card";
import { Link } from "wouter";

export default function Categories() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products", selectedCategory, searchTerm, sortBy],
  });

  const categories = [
    {
      id: "",
      name: "All Categories",
      description: "Browse all solar products",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300&h=200&fit=crop",
      count: 351,
      subcategories: [],
    },
    {
      id: "residential",
      name: "Residential Solar",
      description: "Home solar solutions for every budget",
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop",
      count: 150,
      subcategories: [
        { id: "rooftop", name: "Rooftop Systems", count: 89 },
        { id: "ground-mount", name: "Ground Mount", count: 34 },
        { id: "solar-shingles", name: "Solar Shingles", count: 27 },
      ],
    },
    {
      id: "commercial",
      name: "Commercial Solar",
      description: "Business and commercial installations",
      image: "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=300&h=200&fit=crop",
      count: 89,
      subcategories: [
        { id: "office-buildings", name: "Office Buildings", count: 45 },
        { id: "retail-stores", name: "Retail Stores", count: 28 },
        { id: "warehouses", name: "Warehouses", count: 16 },
      ],
    },
    {
      id: "industrial",
      name: "Industrial Solar",
      description: "Large-scale industrial installations",
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=300&h=200&fit=crop",
      count: 45,
      subcategories: [
        { id: "utility-scale", name: "Utility Scale", count: 25 },
        { id: "manufacturing", name: "Manufacturing", count: 12 },
        { id: "agriculture", name: "Agriculture", count: 8 },
      ],
    },
    {
      id: "components",
      name: "Solar Components",
      description: "Individual components and parts",
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=300&h=200&fit=crop",
      count: 67,
      subcategories: [
        { id: "solar-panels", name: "Solar Panels", count: 28 },
        { id: "inverters", name: "Inverters", count: 22 },
        { id: "batteries", name: "Batteries", count: 17 },
      ],
    },
  ];

  const filteredProducts = products?.filter((product: any) => {
    const matchesSearch = !searchTerm || product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = filteredProducts?.sort((a: any, b: any) => {
    switch (sortBy) {
      case "price-low":
        return parseFloat(a.price) - parseFloat(b.price);
      case "price-high":
        return parseFloat(b.price) - parseFloat(a.price);
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="solar-gradient py-12">
        <div className="max-w-7xl mx-auto container-mobile">
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Solar Product Categories
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Browse our comprehensive selection of solar solutions
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto container-mobile">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {categories.map((category) => (
              <Card 
                key={category.id} 
                className={`overflow-hidden hover:shadow-xl transition-all cursor-pointer group ${
                  selectedCategory === category.id ? 'ring-2 ring-blue-600' : ''
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
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
                
                {category.subcategories.length > 0 && (
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground">Subcategories:</h4>
                      <div className="flex flex-wrap gap-2">
                        {category.subcategories.map((sub) => (
                          <Badge key={sub.id} variant="outline" className="text-xs">
                            {sub.name} ({sub.count})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center space-x-4">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>

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
            </div>
          </div>

          {/* Products Results */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                {selectedCategory ? 
                  categories.find(c => c.id === selectedCategory)?.name || "Products" : 
                  "All Products"
                }
              </h2>
              <p className="text-muted-foreground">
                {sortedProducts?.length || 0} products found
              </p>
            </div>
            {selectedCategory && (
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedCategory("")}
                >
                  Clear Category Filter
                </Button>
              </div>
            )}
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-6"}>
              {[...Array(6)].map((_, i) => (
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
          ) : sortedProducts && sortedProducts.length > 0 ? (
            <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-6"}>
              {sortedProducts.map((product: any) => (
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
              <h3 className="text-lg font-semibold text-foreground mb-2">No Products Found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or browse all categories
              </p>
              <Button onClick={() => {setSearchTerm(""); setSelectedCategory("")}} variant="outline">
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
