import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { 
  ShoppingCart, 
  CreditCard, 
  MapPin, 
  Package, 
  Shield,
  Truck,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Split
} from "lucide-react";

interface VendorOrder {
  vendorId: number;
  vendorName: string;
  verified: boolean;
  items: any[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  estimatedDelivery: string;
}

export default function Checkout() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentType, setPaymentType] = useState("full");
  const [installmentMonths, setInstallmentMonths] = useState(12);
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
  });

  const { data: cartItems, isLoading: cartLoading } = useQuery({
    queryKey: ["/api/cart"],
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return apiRequest("POST", "/api/orders/multi-vendor", orderData);
    },
    onSuccess: (data) => {
      toast({
        title: "Orders Created Successfully",
        description: `${data.subOrders.length} separate orders have been created for your vendors.`,
      });
      // Redirect to order confirmation
      window.location.href = `/order-confirmation?parentOrderId=${data.parentOrderId}`;
    },
    onError: (error: any) => {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to create orders. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto container-mobile py-12">
          <Card>
            <CardContent className="p-6 text-center">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Please Sign In</h3>
              <p className="text-muted-foreground mb-4">
                You need to be signed in to proceed with checkout.
              </p>
              <Button asChild>
                <a href="/login">Sign In</a>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (cartLoading) {
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

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto container-mobile py-12">
          <Card>
            <CardContent className="p-6 text-center">
              <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Your Cart is Empty</h3>
              <p className="text-muted-foreground mb-4">
                Add some items to your cart before proceeding to checkout.
              </p>
              <Button asChild>
                <a href="/marketplace">Continue Shopping</a>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Group items by vendor and calculate totals
  const vendorOrders: VendorOrder[] = Object.values(
    cartItems.reduce((acc: any, item: any) => {
      const vendorId = item.product.vendorId;
      if (!acc[vendorId]) {
        acc[vendorId] = {
          vendorId,
          vendorName: item.product.vendor?.companyName || 'Unknown Vendor',
          verified: item.product.vendor?.verified || false,
          items: [],
          subtotal: 0,
          shipping: 0,
          tax: 0,
          discount: 0,
          total: 0,
          estimatedDelivery: calculateEstimatedDelivery()
        };
      }

      acc[vendorId].items.push(item);
      const itemTotal = item.product.price * item.quantity;
      acc[vendorId].subtotal += itemTotal;

      // Calculate shipping (free over $100, otherwise $15)
      acc[vendorId].shipping = acc[vendorId].subtotal > 100 ? 0 : 15;

      // Calculate tax (8.5%)
      acc[vendorId].tax = acc[vendorId].subtotal * 0.085;

      // Calculate total
      acc[vendorId].total = acc[vendorId].subtotal + acc[vendorId].shipping + acc[vendorId].tax - acc[vendorId].discount;

      return acc;
    }, {})
  );

  const grandTotal = vendorOrders.reduce((sum, order) => sum + order.total, 0);
  const totalItems = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
  const installmentFeeRate = 0.30; // 30% fee for installments
  const finalTotal = paymentType === 'installment' ? grandTotal * (1 + installmentFeeRate) : grandTotal;

  function calculateEstimatedDelivery(): string {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7); // 7 days from now
    return deliveryDate.toLocaleDateString();
  }

  const handlePlaceOrder = () => {
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zip) {
      toast({
        title: "Incomplete Address",
        description: "Please fill in all shipping address fields.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      vendorOrders,
      paymentType,
      installmentMonths: paymentType === 'installment' ? installmentMonths : null,
      totalAmount: finalTotal,
      shippingAddress,
      paymentMethod,
    };

    createOrderMutation.mutate(orderData);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto container-mobile py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Checkout</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Split className="w-5 h-5" />
            <span>Multi-vendor order processing</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="San Francisco"
                    />
                  </div>

                  <div>
                    <Label htmlFor="state">State</Label>
                    <Select 
                      value={shippingAddress.state} 
                      onValueChange={(value) => setShippingAddress(prev => ({ ...prev, state: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="TX">Texas</SelectItem>
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="FL">Florida</SelectItem>
                        {/* Add more states as needed */}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      value={shippingAddress.zip}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, zip: e.target.value }))}
                      placeholder="94102"
                    />
                  </div>

                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select 
                      value={shippingAddress.country} 
                      onValueChange={(value) => setShippingAddress(prev => ({ ...prev, country: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card">Credit/Debit Card</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal">PayPal</Label>
                  </div>
                </RadioGroup>

                {paymentMethod === "card" && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Payment Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={paymentType} onValueChange={setPaymentType}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full" id="full" />
                    <Label htmlFor="full">Pay in Full</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="installment" id="installment" />
                    <Label htmlFor="installment">
                      Installment Plan (+{(installmentFeeRate * 100)}% fee)
                    </Label>
                  </div>
                </RadioGroup>

                {paymentType === "installment" && (
                  <div className="pt-4 border-t space-y-4">
                    <div>
                      <Label htmlFor="months">Number of Months</Label>
                      <Select value={installmentMonths.toString()} onValueChange={(value) => setInstallmentMonths(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">6 months</SelectItem>
                          <SelectItem value="12">12 months</SelectItem>
                          <SelectItem value="18">18 months</SelectItem>
                          <SelectItem value="24">24 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        Monthly payment: ${(finalTotal / installmentMonths).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Total with fees: ${finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Multi-Vendor Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Summary
                  <Badge variant="outline" className="ml-auto">
                    {vendorOrders.length} Vendor{vendorOrders.length > 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {vendorOrders.map((vendorOrder, index) => (
                  <div key={vendorOrder.vendorId} className="space-y-3">
                    {/* Vendor Header */}
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{vendorOrder.vendorName}</span>
                          {vendorOrder.verified && (
                            <Shield className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            <span>Est. delivery: {vendorOrder.estimatedDelivery}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Vendor Items */}
                    {vendorOrder.items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3 py-2">
                        <img
                          src={item.product.imageUrl || "/placeholder-product.jpg"}
                          alt={item.product.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-medium">
                          ${(item.product.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    ))}

                    {/* Vendor Totals */}
                    <div className="space-y-1 text-sm bg-gray-50 p-3 rounded">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${vendorOrder.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span className={vendorOrder.shipping === 0 ? 'text-green-600' : ''}>
                          {vendorOrder.shipping === 0 ? 'Free' : `$${vendorOrder.shipping.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>${vendorOrder.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between font-medium pt-1 border-t">
                        <span>Vendor Total:</span>
                        <span>${vendorOrder.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    {index < vendorOrders.length - 1 && <Separator />}
                  </div>
                ))}

                <Separator />

                {/* Grand Total */}
                <div className="space-y-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Order Total:</span>
                    <span>${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>

                  {paymentType === "installment" && (
                    <>
                      <div className="flex justify-between text-sm text-yellow-600">
                        <span>Installment Fee ({(installmentFeeRate * 100)}%):</span>
                        <span>+${(grandTotal * installmentFeeRate).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-green-600">
                        <span>Final Total:</span>
                        <span>${finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Processing Info */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800 mb-1">Multi-Vendor Processing</p>
                    <p className="text-blue-700">
                      Your order will be automatically split into {vendorOrders.length} separate sub-orders. 
                      Each vendor will fulfill their portion independently, and you'll receive tracking 
                      information for each shipment.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Place Order Button */}
            <Button 
              size="lg" 
              className="w-full" 
              onClick={handlePlaceOrder}
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? (
                <>
                  <Clock className="w-5 h-5 mr-2 animate-spin" />
                  Processing Orders...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Place Order (${finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}