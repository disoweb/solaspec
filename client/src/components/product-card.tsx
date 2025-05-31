import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link } from "wouter";
import { Star, MapPin, ShoppingCart, Eye } from "lucide-react";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    description: string;
    price: string;
    capacity?: string;
    type: string;
    imageUrl?: string;
    vendorId: number;
    inStock: boolean;
    locations?: string[];
  };
  layout?: "grid" | "list";
}

export default function ProductCard({ product, layout = "grid" }: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity: 1,
      });
    },
    onSuccess: () => {
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsAddingToCart(false);
    },
  });

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Please Sign In",
        description: "You need to be signed in to add items to cart.",
        variant: "destructive",
      });
      return;
    }
    
    setIsAddingToCart(true);
    addToCartMutation.mutate();
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return numPrice.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const getInstallmentPrice = (price: string) => {
    const numPrice = parseFloat(price);
    const withFee = numPrice * 1.30; // 30% fee for installments
    const monthlyPayment = withFee / 30; // 30 months
    return monthlyPayment.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const defaultImage = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop";

  if (layout === "list") {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            <div className="relative md:w-80 h-48 md:h-auto">
              <img 
                src={product.imageUrl || defaultImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-4 left-4 bg-green-500 hover:bg-green-500">
                Verified Vendor
              </Badge>
              {!product.inStock && (
                <Badge variant="destructive" className="absolute top-4 right-4">
                  Out of Stock
                </Badge>
              )}
            </div>
            
            <div className="flex-1 p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-foreground">{product.name}</h3>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-muted-foreground">4.8</span>
                    </div>
                  </div>
                  
                  <Badge variant="secondary" className="mb-3">
                    {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                  </Badge>
                  
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  
                  {product.locations && product.locations.length > 0 && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                      <MapPin className="w-4 h-4" />
                      <span>Available in {product.locations.join(", ")}</span>
                    </div>
                  )}
                </div>
                
                <div className="md:ml-6 md:text-right">
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-foreground">
                      {formatPrice(product.price)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      or {getInstallmentPrice(product.price)}/month
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      30% Tax Credit Available
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Link href={`/products/${product.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      onClick={handleAddToCart}
                      disabled={!product.inStock || isAddingToCart}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {isAddingToCart ? "Adding..." : "Add to Cart"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative">
        <img 
          src={product.imageUrl || defaultImage}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <Badge className="absolute top-4 left-4 bg-green-500 hover:bg-green-500">
          Verified Vendor
        </Badge>
        {!product.inStock && (
          <Badge variant="destructive" className="absolute top-4 right-4">
            Out of Stock
          </Badge>
        )}
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-foreground">{product.name}</h3>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-muted-foreground">4.8</span>
          </div>
        </div>
        
        <Badge variant="secondary" className="mb-3">
          {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
        </Badge>
        
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {product.description}
        </p>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
            <span className="text-sm text-green-600 font-medium">
              30% Tax Credit Available
            </span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Installments:</span> {getInstallmentPrice(product.price)}/month (30 months)
          </div>
          
          {product.locations && product.locations.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>Available in {product.locations.join(", ")}</span>
            </div>
          )}
        </div>
        
        <div className="flex space-x-3 mt-6">
          <Button 
            className="flex-1 bg-primary hover:bg-primary/90" 
            onClick={handleAddToCart}
            disabled={!product.inStock || isAddingToCart}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </Button>
          <Link href={`/products/${product.id}`}>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
