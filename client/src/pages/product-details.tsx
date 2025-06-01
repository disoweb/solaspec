
import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import PaymentCalculator from "@/components/payment-calculator";
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Share2, 
  Truck, 
  Shield, 
  Award,
  MessageSquare,
  Store,
  Zap,
  Battery,
  Sun,
  Gauge,
  Calendar,
  MapPin,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Gift,
  Package,
  CreditCard,
  Info,
  Users,
  Clock
} from "lucide-react";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [activeTab, setActiveTab] = useState("overview");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: [`/api/products/${id}`],
    enabled: !!id,
  });

  const { data: vendor } = useQuery({
    queryKey: [`/api/vendors/${product?.vendorId}`],
    enabled: !!product?.vendorId,
  });

  const { data: reviews } = useQuery({
    queryKey: [`/api/products/${id}/reviews`],
    enabled: !!id,
  });

  const { data: relatedProducts } = useQuery({
    queryKey: [`/api/products/related/${id}`],
    enabled: !!id,
  });

  const addToCartMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/cart/add", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Added to Cart",
        description: "Product has been added to your cart",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/wishlist/add/${id}`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Added to Wishlist",
        description: "Product has been added to your wishlist",
      });
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/products/${id}/reviews`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted",
        description: "Thank you for your review!",
      });
      setReviewText("");
      setReviewRating(5);
      queryClient.invalidateQueries({ queryKey: [`/api/products/${id}/reviews`] });
    },
  });

  const requestQuoteMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/quotes/request", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Quote Requested",
        description: "The vendor will contact you soon with a quote",
      });
      setShowQuoteForm(false);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto container-mobile py-8">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-muted rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-12 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto container-mobile py-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Product Not Found</h3>
              <p className="text-muted-foreground mb-4">
                The product you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <a href="/marketplace">Browse Products</a>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images || ["/placeholder-product.jpg"];
  const averageRating = reviews?.reduce((acc: number, review: any) => acc + review.rating, 0) / (reviews?.length || 1) || 0;
  const isInStock = product.stock > 0;
  const discountPercentage = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to cart",
        variant: "destructive",
      });
      return;
    }

    addToCartMutation.mutate({
      productId: product.id,
      quantity,
      variant: selectedVariant,
    });
  };

  const handleAddToWishlist = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to wishlist",
        variant: "destructive",
      });
      return;
    }

    addToWishlistMutation.mutate();
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to submit a review",
        variant: "destructive",
      });
      return;
    }

    submitReviewMutation.mutate({
      rating: reviewRating,
      comment: reviewText,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto container-mobile py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <a href="/" className="hover:text-foreground">Home</a>
          <span className="mx-2">/</span>
          <a href="/marketplace" className="hover:text-foreground">Marketplace</a>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        {/* Product Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{product.category}</Badge>
                {product.featured && <Badge variant="default">Featured</Badge>}
                {discountPercentage > 0 && (
                  <Badge variant="destructive">-{discountPercentage}% OFF</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < averageRating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({reviews?.length || 0} reviews)
                  </span>
                </div>
                <Badge variant={isInStock ? "default" : "destructive"}>
                  {isInStock ? `${product.stock} in stock` : 'Out of stock'}
                </Badge>
              </div>
            </div>

            {/* Vendor Info */}
            {vendor && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Store className="w-8 h-8 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">{vendor.companyName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {vendor.location} • Member since {new Date(vendor.createdAt).getFullYear()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto">
                      Visit Store
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pricing */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-foreground">
                  ${product.price.toLocaleString()}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Price includes installation by certified professionals
              </p>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Select Configuration:</label>
                <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose configuration" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.variants.map((variant: any) => (
                      <SelectItem key={variant.id} value={variant.id}>
                        {variant.name} - ${variant.price.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="text-sm font-medium mb-2 block">Quantity:</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center"
                  min="1"
                  max={product.stock}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!isInStock || addToCartMutation.isPending}
                  className="flex-1"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <Button variant="outline" onClick={handleAddToWishlist}>
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="outline">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowQuoteForm(true)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Request Custom Quote
              </Button>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm">25 Year Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Free Installation</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-600" />
                <span className="text-sm">Certified Installers</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-600" />
                <span className="text-sm">High Efficiency</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="specifications">Specs</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="financing">Financing</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Product Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {product.description || "No description available."}
                </p>
                
                {product.features && (
                  <div>
                    <h4 className="font-semibold mb-2">Key Features:</h4>
                    <ul className="space-y-1">
                      {product.features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications">
            <Card>
              <CardHeader>
                <CardTitle>Technical Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Power Output:</span>
                      <span className="font-medium">{product.powerOutput || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Efficiency:</span>
                      <span className="font-medium">{product.efficiency || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Panel Type:</span>
                      <span className="font-medium">{product.panelType || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dimensions:</span>
                      <span className="font-medium">{product.dimensions || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weight:</span>
                      <span className="font-medium">{product.weight || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Warranty:</span>
                      <span className="font-medium">{product.warranty || '25 years'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Certification:</span>
                      <span className="font-medium">{product.certification || 'IEC Certified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Inverter Included:</span>
                      <span className="font-medium">{product.inverterIncluded ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews ({reviews?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  {reviews && reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review: any) => (
                        <div key={review.id} className="border-b pb-4 last:border-b-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{review.userName}</span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-muted-foreground">{review.comment}</p>
                          <div className="flex gap-2 mt-2">
                            <Button variant="ghost" size="sm">
                              <ThumbsUp className="w-4 h-4 mr-1" />
                              Helpful
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Flag className="w-4 h-4 mr-1" />
                              Report
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No reviews yet. Be the first to review this product!
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Add Review Form */}
              {user && (
                <Card>
                  <CardHeader>
                    <CardTitle>Write a Review</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Rating:</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setReviewRating(rating)}
                              className="p-1"
                            >
                              <Star
                                className={`w-6 h-6 ${
                                  rating <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Review:</label>
                        <Textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="Share your experience with this product..."
                          rows={4}
                        />
                      </div>
                      <Button type="submit" disabled={!reviewText.trim() || submitReviewMutation.isPending}>
                        Submit Review
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="financing">
            <PaymentCalculator
              productPrice={product.price}
              productName={product.name}
            />
          </TabsContent>

          <TabsContent value="support">
            <Card>
              <CardHeader>
                <CardTitle>Product Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
                    <MessageSquare className="w-8 h-8" />
                    <span className="font-medium">Live Chat</span>
                    <span className="text-sm text-muted-foreground">Get instant support</span>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
                    <Users className="w-8 h-8" />
                    <span className="font-medium">Expert Consultation</span>
                    <span className="text-sm text-muted-foreground">Schedule a call</span>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
                    <Clock className="w-8 h-8" />
                    <span className="font-medium">Installation Timeline</span>
                    <span className="text-sm text-muted-foreground">Track your project</span>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
                    <Shield className="w-8 h-8" />
                    <span className="font-medium">Warranty Support</span>
                    <span className="text-sm text-muted-foreground">25-year coverage</span>
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Frequently Asked Questions</h4>
                  <div className="space-y-2">
                    <details className="group">
                      <summary className="cursor-pointer text-sm font-medium">
                        What's included in the installation?
                      </summary>
                      <p className="text-sm text-muted-foreground mt-2">
                        Installation includes all mounting hardware, electrical connections, permits, and system commissioning.
                      </p>
                    </details>
                    <details className="group">
                      <summary className="cursor-pointer text-sm font-medium">
                        How long does installation take?
                      </summary>
                      <p className="text-sm text-muted-foreground mt-2">
                        Most residential installations are completed within 1-3 days, depending on system size.
                      </p>
                    </details>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((relatedProduct: any) => (
                <Card key={relatedProduct.id} className="group cursor-pointer">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                      <img
                        src={relatedProduct.images?.[0] || "/placeholder-product.jpg"}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <h3 className="font-medium text-sm mb-1">{relatedProduct.name}</h3>
                    <p className="text-primary font-bold">
                      ${relatedProduct.price.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quote Request Modal */}
      {showQuoteForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Request Custom Quote</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                requestQuoteMutation.mutate({
                  productId: product.id,
                  message: formData.get('message'),
                  quantity: formData.get('quantity'),
                });
              }} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Quantity:</label>
                  <Input name="quantity" type="number" min="1" defaultValue="1" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Special Requirements:</label>
                  <Textarea
                    name="message"
                    placeholder="Describe any special requirements or questions..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={requestQuoteMutation.isPending}>
                    Request Quote
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowQuoteForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}
