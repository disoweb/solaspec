import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductCard from "@/components/product-card";
import PaymentCalculator from "@/components/payment-calculator";
import { 
  Star, 
  ShoppingCart, 
  CheckCircle, 
  MapPin, 
  Zap, 
  Shield, 
  Award,
  Plus,
  Minus,
  ArrowLeft,
  User,
  Calendar
} from "lucide-react";

export default function ProductDetails() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { data: product, isLoading, error } = useQuery({
    queryKey: [`/api/products/${id}`],
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: [`/api/products/${id}/reviews`],
    enabled: !!id,
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ["/api/products", product?.type ? `?type=${product.type}` : ""],
    enabled: !!product?.type,
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cart", {
        productId: parseInt(id!),
        quantity,
      });
    },
    onSuccess: () => {
      toast({
        title: "Added to Cart",
        description: `${quantity} x ${product.name} added to your cart.`,
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

  const defaultImage = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop";
  const productImages = [
    product?.imageUrl || defaultImage,
    "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=600&fit=crop",
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto container-mobile py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-6 w-1/3"></div>
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="h-96 bg-muted rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-20 bg-muted rounded"></div>
                <div className="h-12 bg-muted rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto container-mobile py-12">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Product Not Found</h3>
              <p className="text-muted-foreground mb-4">
                The product you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/marketplace">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Marketplace
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const averageRating = reviews?.length > 0 
    ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length 
    : 4.8;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto container-mobile py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/marketplace">
            <button className="hover:text-primary">Marketplace</button>
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg border"
              />
              {!product.inStock && (
                <Badge variant="destructive" className="absolute top-4 right-4">
                  Out of Stock
                </Badge>
              )}
            </div>
            
            {/* Image Thumbnails */}
            <div className="flex space-x-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg border-2 overflow-hidden ${
                    selectedImage === index ? 'border-primary' : 'border-border'
                  }`}
                >
                  <img 
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge className="bg-green-500 hover:bg-green-500">
                  Verified Vendor
                </Badge>
                <Badge variant="secondary">
                  {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                </Badge>
              </div>
              
              <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${
                        i < Math.floor(averageRating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">
                    {averageRating.toFixed(1)} ({reviews?.length || 0} reviews)
                  </span>
                </div>
                
                {product.locations && product.locations.length > 0 && (
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Available in {product.locations.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-muted-foreground text-lg">{product.description}</p>

            {/* Key Features */}
            <div className="grid grid-cols-2 gap-4">
              {product.capacity && (
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="font-medium">{product.capacity} System</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-medium">25-Year Warranty</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Professional Installation</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-yellow-600" />
                <span className="font-medium">High Efficiency</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4 p-6 bg-muted/30 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-3xl font-bold text-foreground">
                  {formatPrice(product.price)}
                </span>
                <span className="text-lg text-green-600 font-medium">
                  30% Tax Credit Available
                </span>
              </div>
              
              <div className="text-muted-foreground">
                <span className="font-medium">Installment option:</span> {getInstallmentPrice(product.price)}/month (30 months with 30% fee)
              </div>
              
              <div className="text-sm text-green-600">
                <p>• Federal tax credit up to {formatPrice((parseFloat(product.price) * 0.30).toString())}</p>
                <p>• Free shipping and handling</p>
                <p>• Escrow protection included</p>
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center"
                    min="1"
                  />
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Button 
                  size="lg" 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={handleAddToCart}
                  disabled={!product.inStock || isAddingToCart}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {isAddingToCart ? "Adding..." : "Add to Cart"}
                </Button>
                
                <Button variant="outline" size="lg">
                  Get Quote
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {product.capacity && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">System Capacity:</span>
                    <span className="font-medium">{product.capacity}</span>
                  </div>
                )}
                
                {product.panelCount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Panel Count:</span>
                    <span className="font-medium">{product.panelCount} panels</span>
                  </div>
                )}
                
                {product.efficiency && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Efficiency:</span>
                    <span className="font-medium">{product.efficiency}%</span>
                  </div>
                )}
                
                {product.warranty && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Warranty:</span>
                    <span className="font-medium">{product.warranty}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium capitalize">{product.type}</span>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map((review: any) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${
                                  i < review.rating 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{review.comment}</p>
                      </div>
                    ))}
                    
                    <Button variant="outline" className="w-full">
                      View All Reviews ({reviews.length})
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <User className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No reviews yet</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Write a Review
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Calculator */}
            <div>
              <PaymentCalculator initialPrice={parseFloat(product.price)} />
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 1 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-8">Related Products</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts
                .filter((p: any) => p.id !== product.id)
                .slice(0, 3)
                .map((relatedProduct: any) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
