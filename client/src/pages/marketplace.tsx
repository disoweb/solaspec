import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Grid, List } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductCard from "@/components/product-card";

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products", searchTerm, selectedType, minPrice, maxPrice]
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("");
    setMinPrice("");
    setMaxPrice("");
  };

  const filteredProducts = products?.filter((product: any) => {
    const matchesSearch = !searchTerm || product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || selectedType === "all" || product.type === selectedType;
    const matchesMinPrice = !minPrice || parseFloat(product.price) >= parseFloat(minPrice);
    const matchesMaxPrice = !maxPrice || parseFloat(product.price) <= parseFloat(maxPrice);
    return matchesSearch && matchesType && matchesMinPrice && matchesMaxPrice;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="solar-gradient py-12">
        <div className="max-w-7xl mx-auto container-mobile">
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Solar System Marketplace
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Discover verified solar systems from trusted vendors
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-card border-b">
        <div className="max-w-7xl mx-auto container-mobile">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search solar systems..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="System Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-24"
                type="number"
              />

              <Input
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-24"
                type="number"
              />

              {(searchTerm || (selectedType && selectedType !== "all") || minPrice || maxPrice) && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>

            {/* View Mode Toggle */}
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
      </section>

      {/* Products Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto container-mobile">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {isLoading ? "Loading..." : `${filteredProducts?.length || 0} Solar Systems Found`}
              </h2>
              {(searchTerm || (selectedType && selectedType !== "all") || minPrice || maxPrice) && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {searchTerm && (
                    <Badge variant="secondary">
                      Search: {searchTerm}
                    </Badge>
                  )}
                  {selectedType && (
                    <Badge variant="secondary">
                      Type: {selectedType}
                    </Badge>
                  )}
                  {minPrice && (
                    <Badge variant="secondary">
                      Min: ${minPrice}
                    </Badge>
                  )}
                  {maxPrice && (
                    <Badge variant="secondary">
                      Max: ${maxPrice}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Products Grid/List */}
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
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-6"}>
              {filteredProducts.map((product: any) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  layout={viewMode}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Products Found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or browse all products
              </p>
              <Button onClick={clearFilters} variant="outline">
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