import { useState } from "react";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Shield, 
  Truck, 
  Package, 
  Zap,
  MapPin,
  Calendar,
  Award,
  Info,
  CheckCircle,
  XCircle,
  Calculator
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductCard from "@/components/product-card";
import PaymentCalculator from "@/components/payment-calculator";

export default function ProductDetails() {
  const [, params] = useRoute("/product/:id");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [selectedInstaller, setSelectedInstaller] = useState("");
  const [paymentType, setPaymentType] = useState<"full" | "installment">("full");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const productId = params?.id;

  const { data: product, isLoading } = useQuery({
    queryKey: ["/api/products", productId],
    enabled: !!productId,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["/api/products", productId, "reviews"],
    enabled: !!productId,
  });

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ["/api/products", { type: product?.type, limit: 4 }],
    enabled: !!product?.type,
  });

  const { data: installers = [] } = useQuery({
    queryKey: ["/api/installers", { verified: true }],
  });

  const addToCartMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/cart", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Success",
        description: "Product added to cart",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add to cart",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = () => {
    if (!product) return;

    addToCartMutation.mutate({
      productId: product.id,
      quantity,
    });
  };

  const handleBuyNow = () => {
    if (!product) return;

    // Add to cart and redirect to checkout
    addToCartMutation.mutate({
      productId: product.id,
      quantity,
    });

    // Redirect to checkout after a brief delay
    setTimeout(() => {
      window.location.href = "/checkout";
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Product not found</h1>
            <Link href="/marketplace">
              <Button className="mt-4">Back to Marketplace</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const productImages = product.imageUrl ? [product.imageUrl] : [
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=400&h=300&fit=crop",
  ];

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href="/marketplace" className="hover:text-blue-600">Marketplace</Link>
            <span>/</span>
            <Link href={`/categories?type=${product.type}`} className="hover:text-blue-600 capitalize">
              {product.type}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </nav>

        {/* Product Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={productImages[activeImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {productImages.length > 1 && (
              <div className="flex space-x-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      index === activeImageIndex ? 'border-blue-600' : 'border-gray-200'
                    }`}
                  >
                    <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="capitalize">{product.type}</Badge>
                {product.featured && (
                  <Badge variant="default">Featured</Badge>
                )}
                {product.inStock ? (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    In Stock
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="w-3 h-3 mr-1" />
                    Out of Stock
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(averageRating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {averageRating.toFixed(1)} ({reviews.length} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Package className="w-4 h-4" />
                  <span>SKU: {product.sku || `SP-${product.id}`}</span>
                </div>
              </div>
            </div>

            {/* Vendor Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{product.vendor?.companyName}</h3>
                      <div className="flex items-center gap-2">
                        {product.vendor?.verified && (
                          <Badge variant="default" className="text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        <div className="flex items-center">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600 ml-1">
                            {product.vendor?.rating || "5.0"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Link href={`/vendor/${product.vendor?.id}`}>
                    <Button variant="outline" size="sm">View Store</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <div className="space-y-4">
              <div>
                <span className="text-3xl font-bold text-gray-900">
                  ${parseFloat(product.price).toLocaleString()}
                </span>
                <span className="text-gray-600 ml-2">per unit</span>
              </div>

              <PaymentCalculator
                price={parseFloat(product.price)}
                onPaymentTypeChange={setPaymentType}
              />
            </div>

            {/* Key Specifications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Key Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {product.capacity && (
                  <div>
                    <span className="text-sm text-gray-600">Capacity</span>
                    <div className="font-semibold">{product.capacity}</div>
                  </div>
                )}
                {product.efficiency && (
                  <div>
                    <span className="text-sm text-gray-600">Efficiency</span>
                    <div className="font-semibold">{product.efficiency}%</div>
                  </div>
                )}
                {product.warranty && (
                  <div>
                    <span className="text-sm text-gray-600">Warranty</span>
                    <div className="font-semibold">{product.warranty}</div>
                  </div>
                )}
                {product.panelCount && (
                  <div>
                    <span className="text-sm text-gray-600">Panel Count</span>
                    <div className="font-semibold">{product.panelCount} panels</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Purchase Options */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-sm font-medium">Quantity</label>
                  <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(Math.min(10, product.stockQuantity || 10))].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {installers.length > 0 && (
                  <div className="flex-1">
                    <label className="text-sm font-medium">Installation Service</label>
                    <Select value={selectedInstaller} onValueChange={setSelectedInstaller}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose installer (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No installation service</SelectItem>
                        {installers.map((installer: any) => (
                          <SelectItem key={installer.id} value={installer.id.toString()}>
                            {installer.companyName} - ${installer.installationFee || "Quote"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.inStock || addToCartMutation.isPending}
                  className="flex-1"
                  variant="outline"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={!product.inStock || addToCartMutation.isPending}
                  className="flex-1"
                >
                  Buy Now
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="flex-1">
                  <Heart className="w-4 h-4 mr-2" />
                  Save for Later
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Shipping & Returns */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Free shipping on orders over $1,000</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="text-sm">30-day return policy</span>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-purple-600" />
                  <span className="text-sm">Certified by industry standards</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="description" className="mb-12">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            <TabsTrigger value="installation">Installation</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="prose max-w-none">
                  <p>{product.description || "Detailed product description coming soon."}</p>
                  {/* Add more detailed description content */}
                  <h3>Key Features</h3>
                  <ul>
                    <li>High-efficiency solar panels with advanced technology</li>
                    <li>Durable construction for long-lasting performance</li>
                    <li>Easy installation with comprehensive mounting system</li>
                    <li>Industry-leading warranty coverage</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Technical Specifications</h3>
                    <div className="space-y-2">
                      {product.capacity && (
                        <div className="flex justify-between">
                          <span>Power Output</span>
                          <span>{product.capacity}</span>
                        </div>
                      )}
                      {product.efficiency && (
                        <div className="flex justify-between">
                          <span>Efficiency</span>
                          <span>{product.efficiency}%</span>
                        </div>
                      )}
                      {product.weight && (
                        <div className="flex justify-between">
                          <span>Weight</span>
                          <span>{product.weight} kg</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Warranty & Certifications</h3>
                    <div className="space-y-2">
                      {product.warranty && (
                        <div className="flex justify-between">
                          <span>Warranty Period</span>
                          <span>{product.warranty}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Certifications</span>
                        <span>IEC, UL, CE</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-6">
              {/* Review Summary */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
                      <div className="flex items-center justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(averageRating) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">{reviews.length} reviews</div>
                    </div>
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = reviews.filter((review: any) => review.rating === rating).length;
                        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                        return (
                          <div key={rating} className="flex items-center gap-2">
                            <span className="text-sm w-3">{rating}</span>
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <div className="flex-1 h-2 bg-gray-200 rounded">
                              <div 
                                className="h-2 bg-yellow-400 rounded" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-8">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Individual Reviews */}
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-sm">
                            {review.user?.firstName?.[0]}{review.user?.lastName?.[0]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">
                              {review.user?.firstName} {review.user?.lastName}
                            </span>
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
                            <span className="text-sm text-gray-600">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="installation" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Professional Installation Services</h3>
                <div className="space-y-4">
                  <p>Get your solar system professionally installed by certified technicians.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">What's Included:</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Site assessment and planning</li>
                        <li>• Professional installation</li>
                        <li>• System commissioning</li>
                        <li>• Performance testing</li>
                        <li>• Documentation and warranties</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Installation Timeline:</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Day 1: Site assessment</li>
                        <li>• Day 2-3: Permits and approvals</li>
                        <li>• Day 4-5: Installation</li>
                        <li>• Day 6: Testing and commissioning</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Available Installers:</h4>
                    <div className="space-y-2">
                      {installers.slice(0, 3).map((installer: any) => (
                        <div key={installer.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{installer.companyName}</div>
                            <div className="text-sm text-gray-600">
                              {installer.experience} years experience • {installer.totalInstallations} installations
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Get Quote</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.filter((p: any) => p.id !== product.id).slice(0, 4).map((relatedProduct: any) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}