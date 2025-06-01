
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Calendar, 
  Download,
  MessageSquare,
  MapPin,
  Clock,
  Star,
  Shield,
  Award
} from "lucide-react";

export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: [`/api/orders/${orderId}`],
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto container-mobile py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto container-mobile py-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Order Not Found</h3>
              <p className="text-muted-foreground mb-4">
                The order you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Button asChild>
                <a href="/buyer-dashboard">View Orders</a>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'pending': return 20;
      case 'confirmed': return 40;
      case 'preparing': return 60;
      case 'installing': return 80;
      case 'completed': return 100;
      default: return 0;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'installing': return 'text-blue-600';
      case 'confirmed': return 'text-yellow-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-4xl mx-auto container-mobile py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for choosing solar energy. Your order has been successfully placed.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Order Number:</span>
                  <span className="font-medium">#{order.id.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Order Date:</span>
                  <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Amount:</span>
                  <span className="font-bold text-lg">${order.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Payment Method:</span>
                  <span className="font-medium capitalize">{order.paymentMethod?.replace('_', ' ')}</span>
                </div>
              </CardContent>
            </Card>

            {/* Installation Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Installation Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Progress</span>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                  <Progress value={getStatusProgress(order.status)} className="h-2" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      getStatusProgress(order.status) >= 20 ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'
                    }`}>
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium">Order Confirmed</p>
                      <p className="text-sm text-muted-foreground">Your order has been received and confirmed</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      getStatusProgress(order.status) >= 40 ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium">Permits & Planning</p>
                      <p className="text-sm text-muted-foreground">Obtaining permits and planning installation</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      getStatusProgress(order.status) >= 60 ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium">Equipment Delivery</p>
                      <p className="text-sm text-muted-foreground">Solar panels and equipment shipped</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      getStatusProgress(order.status) >= 80 ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium">Installation</p>
                      <p className="text-sm text-muted-foreground">Professional installation and setup</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      getStatusProgress(order.status) >= 100 ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Star className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium">System Activation</p>
                      <p className="text-sm text-muted-foreground">System testing and activation</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items Ordered */}
            <Card>
              <CardHeader>
                <CardTitle>Items Ordered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <img
                        src={item.product?.images?.[0] || "/placeholder-product.jpg"}
                        alt={item.product?.name}
                        className="w-16 h-16 rounded object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product?.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ${item.product?.price?.toLocaleString()} each
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          ${(item.product?.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Installation Address */}
            {order.shippingAddress && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Installation Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    </p>
                    <p>{order.shippingAddress.address}</p>
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
                
                <Button className="w-full" variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
                
                <Button className="w-full" variant="outline" asChild>
                  <a href={`/track-order/${order.id}`}>
                    <Clock className="w-4 h-4 mr-2" />
                    Track Progress
                  </a>
                </Button>
                
                <Button className="w-full" asChild>
                  <a href="/marketplace">
                    Continue Shopping
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* What's Next */}
            <Card>
              <CardHeader>
                <CardTitle>What's Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Site Assessment</p>
                    <p className="text-muted-foreground">Our team will contact you within 48 hours to schedule a site assessment.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Permit Processing</p>
                    <p className="text-muted-foreground">We'll handle all permit applications and approvals for your installation.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Installation Day</p>
                    <p className="text-muted-foreground">Professional installation typically takes 1-3 days depending on system size.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Customer Support</p>
                  <p className="text-muted-foreground">Available 24/7 for any questions</p>
                  <p className="text-primary font-medium">1-800-SOLAR-24</p>
                </div>
                
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-primary">support@solaspec.com</p>
                </div>
                
                <div>
                  <p className="font-medium">Live Chat</p>
                  <p className="text-muted-foreground">Click the chat icon for instant help</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Clock,
  Eye,
  Download,
  Share2,
  Calendar,
  MapPin,
  Shield,
  Split
} from "lucide-react";

export default function OrderConfirmation() {
  const { user } = useAuth();
  const [parentOrderId, setParentOrderId] = useState<string>("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('parentOrderId');
    if (orderId) {
      setParentOrderId(orderId);
    }
  }, []);

  const { data: orderSummary, isLoading } = useQuery({
    queryKey: ["/api/orders/parent", parentOrderId],
    enabled: !!parentOrderId,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto container-mobile py-12">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Please sign in to view your order.</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto container-mobile py-12">
          <div className="animate-pulse space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-32 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: "secondary",
      paid: "default",
      escrow: "outline",
      installing: "default",
      completed: "default",
      cancelled: "destructive"
    };
    
    const colors: any = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-blue-100 text-blue-800",
      escrow: "bg-purple-100 text-purple-800",
      installing: "bg-orange-100 text-orange-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getOverallStatusMessage = (status: string) => {
    switch (status) {
      case 'completed':
        return { message: 'All orders completed successfully!', color: 'text-green-600' };
      case 'in_progress':
        return { message: 'Orders are being processed', color: 'text-blue-600' };
      case 'pending':
        return { message: 'Orders are pending confirmation', color: 'text-yellow-600' };
      case 'partially_cancelled':
        return { message: 'Some orders were cancelled', color: 'text-orange-600' };
      case 'cancelled':
        return { message: 'All orders were cancelled', color: 'text-red-600' };
      default:
        return { message: 'Mixed status - check individual orders', color: 'text-gray-600' };
    }
  };

  if (!orderSummary) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto container-mobile py-12">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Order not found.</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const statusInfo = getOverallStatusMessage(orderSummary.overallStatus);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-4xl mx-auto container-mobile py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Order Confirmed!</h1>
          <p className="text-lg text-muted-foreground">
            Your multi-vendor order has been successfully processed
          </p>
        </div>

        {/* Order Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Split className="w-5 h-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {orderSummary.totalSubOrders}
                </div>
                <div className="text-sm text-muted-foreground">Vendor Orders</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold">
                  ${orderSummary.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-muted-foreground">Total Amount</div>
              </div>
              
              <div className="text-center">
                <div className="text-sm font-medium mb-1">Overall Status</div>
                {getStatusBadge(orderSummary.overallStatus)}
              </div>
              
              <div className="text-center">
                <div className="text-sm font-medium mb-1">Order ID</div>
                <div className="text-xs text-muted-foreground font-mono">
                  {parentOrderId.slice(0, 8)}...
                </div>
              </div>
            </div>

            <div className={`mt-4 p-3 rounded-lg bg-gray-50`}>
              <p className={`text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.message}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Individual Vendor Orders */}
        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-semibold">Individual Vendor Orders</h2>
          
          {orderSummary.subOrders.map((subOrder: any, index: number) => (
            <Card key={subOrder.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Vendor Order #{index + 1}</h3>
                      <p className="text-sm text-muted-foreground">
                        Order ID: {subOrder.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold">
                      ${parseFloat(subOrder.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    {getStatusBadge(subOrder.status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Ordered: {new Date(subOrder.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Updated: {new Date(subOrder.updatedAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-muted-foreground" />
                    <span>Est. delivery: 5-7 days</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Truck className="w-4 h-4 mr-2" />
                    Track Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-blue-600">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Order Confirmation</h4>
                  <p className="text-sm text-muted-foreground">
                    Each vendor will receive and confirm your order separately
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-blue-600">2</span>
                </div>
                <div>
                  <h4 className="font-medium">Preparation & Shipping</h4>
                  <p className="text-sm text-muted-foreground">
                    Items will be prepared and shipped independently by each vendor
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-blue-600">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Tracking Updates</h4>
                  <p className="text-sm text-muted-foreground">
                    You'll receive separate tracking information for each shipment
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-blue-600">4</span>
                </div>
                <div>
                  <h4 className="font-medium">Delivery & Support</h4>
                  <p className="text-sm text-muted-foreground">
                    Each vendor will provide their own customer support and warranties
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Button asChild>
            <a href="/marketplace">Continue Shopping</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/buyer-dashboard">View All Orders</a>
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
