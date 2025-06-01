
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { 
  ShoppingCart, 
  CreditCard, 
  Truck, 
  Shield, 
  MapPin,
  Calendar,
  CheckCircle,
  Lock,
  AlertTriangle,
  Gift,
  Percent,
  Clock
} from "lucide-react";

export default function Checkout() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [billingAddress, setBillingAddress] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  });
  const [shippingAddress, setShippingAddress] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  });
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const { data: cartItems } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const { data: shippingOptions } = useQuery({
    queryKey: ["/api/shipping/options"],
    enabled: !!user,
  });

  const { data: appliedCoupon, refetch: refetchCoupon } = useQuery({
    queryKey: ["/api/cart/coupon"],
    enabled: !!user && !!couponCode,
  });

  const applyCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      return apiRequest("/api/cart/apply-coupon", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Coupon Applied",
        description: "Discount has been applied to your order",
      });
      refetchCoupon();
    },
    onError: () => {
      toast({
        title: "Invalid Coupon",
        description: "The coupon code is invalid or expired",
        variant: "destructive",
      });
    },
  });

  const placeOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return apiRequest("/api/orders/place", {
        method: "POST",
        body: JSON.stringify(orderData),
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Order Placed Successfully",
        description: "You will be redirected to track your order",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setLocation(`/order-confirmation/${data.orderId}`);
    },
    onError: () => {
      toast({
        title: "Order Failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Redirect if no cart items or not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto container-mobile py-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Login Required</h3>
              <p className="text-muted-foreground mb-4">
                Please log in to proceed with checkout.
              </p>
              <Button asChild>
                <a href="/login">Log In</a>
              </Button>
            </CardContent>
          </Card>
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

  // Group cart items by vendor
  const itemsByVendor = cartItems.reduce((acc: any, item: any) => {
    const vendorId = item.product.vendorId;
    if (!acc[vendorId]) {
      acc[vendorId] = {
        vendor: item.product.vendor,
        items: [],
        subtotal: 0,
      };
    }
    acc[vendorId].items.push(item);
    acc[vendorId].subtotal += item.product.price * item.quantity;
    return acc;
  }, {});

  const subtotal = cartItems.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const shippingCost = shippingOptions?.find((option: any) => option.id === shippingMethod)?.cost || 0;
  const taxAmount = (subtotal - discountAmount) * 0.08; // 8% tax
  const total = subtotal - discountAmount + shippingCost + taxAmount;

  const handlePlaceOrder = () => {
    if (!agreeToTerms) {
      toast({
        title: "Agreement Required",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    placeOrderMutation.mutate({
      items: cartItems,
      billingAddress,
      shippingAddress: sameAsShipping ? billingAddress : shippingAddress,
      paymentMethod,
      shippingMethod,
      couponCode: appliedCoupon?.code,
      specialInstructions,
      subtotal,
      discountAmount,
      shippingCost,
      taxAmount,
      total,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto container-mobile py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Checkout</h1>
          <p className="text-muted-foreground">
            Complete your solar energy system purchase
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Billing Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Billing Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={billingAddress.firstName}
                      onChange={(e) => setBillingAddress({...billingAddress, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={billingAddress.lastName}
                      onChange={(e) => setBillingAddress({...billingAddress, lastName: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={billingAddress.email}
                    onChange={(e) => setBillingAddress({...billingAddress, email: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={billingAddress.phone}
                    onChange={(e) => setBillingAddress({...billingAddress, phone: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={billingAddress.address}
                    onChange={(e) => setBillingAddress({...billingAddress, address: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={billingAddress.city}
                      onChange={(e) => setBillingAddress({...billingAddress, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Select
                      value={billingAddress.state}
                      onValueChange={(value) => setBillingAddress({...billingAddress, state: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="TX">Texas</SelectItem>
                        <SelectItem value="FL">Florida</SelectItem>
                        {/* Add more states */}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={billingAddress.zipCode}
                      onChange={(e) => setBillingAddress({...billingAddress, zipCode: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Installation Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sameAsShipping"
                    checked={sameAsShipping}
                    onCheckedChange={setSameAsShipping}
                  />
                  <Label htmlFor="sameAsShipping">Same as billing address</Label>
                </div>
                
                {!sameAsShipping && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="shippingFirstName">First Name</Label>
                        <Input
                          id="shippingFirstName"
                          value={shippingAddress.firstName}
                          onChange={(e) => setShippingAddress({...shippingAddress, firstName: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="shippingLastName">Last Name</Label>
                        <Input
                          id="shippingLastName"
                          value={shippingAddress.lastName}
                          onChange={(e) => setShippingAddress({...shippingAddress, lastName: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="shippingAddress">Address</Label>
                      <Input
                        id="shippingAddress"
                        value={shippingAddress.address}
                        onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="shippingCity">City</Label>
                        <Input
                          id="shippingCity"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="shippingState">State</Label>
                        <Select
                          value={shippingAddress.state}
                          onValueChange={(value) => setShippingAddress({...shippingAddress, state: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CA">California</SelectItem>
                            <SelectItem value="NY">New York</SelectItem>
                            <SelectItem value="TX">Texas</SelectItem>
                            <SelectItem value="FL">Florida</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="shippingZipCode">ZIP Code</Label>
                        <Input
                          id="shippingZipCode"
                          value={shippingAddress.zipCode}
                          onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shipping Method */}
            <Card>
              <CardHeader>
                <CardTitle>Installation Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="standard" id="standard" />
                    <div className="flex-1">
                      <Label htmlFor="standard" className="font-medium">Standard Installation</Label>
                      <p className="text-sm text-muted-foreground">4-6 weeks • Free</p>
                    </div>
                    <Badge variant="secondary">Free</Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="expedited" id="expedited" />
                    <div className="flex-1">
                      <Label htmlFor="expedited" className="font-medium">Expedited Installation</Label>
                      <p className="text-sm text-muted-foreground">2-3 weeks • $500</p>
                    </div>
                    <Badge variant="outline">$500</Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="priority" id="priority" />
                    <div className="flex-1">
                      <Label htmlFor="priority" className="font-medium">Priority Installation</Label>
                      <p className="text-sm text-muted-foreground">1-2 weeks • $1,000</p>
                    </div>
                    <Badge variant="destructive">$1,000</Badge>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="credit_card" id="credit_card" />
                    <div className="flex-1">
                      <Label htmlFor="credit_card" className="font-medium">Credit Card</Label>
                      <p className="text-sm text-muted-foreground">Pay with Visa, Mastercard, or American Express</p>
                    </div>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="financing" id="financing" />
                    <div className="flex-1">
                      <Label htmlFor="financing" className="font-medium">Solar Financing</Label>
                      <p className="text-sm text-muted-foreground">0% APR for qualified buyers</p>
                    </div>
                    <Badge variant="default">0% APR</Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="lease" id="lease" />
                    <div className="flex-1">
                      <Label htmlFor="lease" className="font-medium">Solar Lease</Label>
                      <p className="text-sm text-muted-foreground">Monthly payments starting at $99</p>
                    </div>
                    <Calendar className="w-5 h-5" />
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Special Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Special Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Any special installation requirements or notes for our team..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Terms and Conditions */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={setAgreeToTerms}
                  />
                  <div className="text-sm">
                    <Label htmlFor="terms" className="font-medium">
                      I agree to the{" "}
                      <a href="/terms" className="text-primary hover:underline">
                        Terms and Conditions
                      </a>{" "}
                      and{" "}
                      <a href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </a>
                    </Label>
                    <p className="text-muted-foreground mt-1">
                      By placing this order, you agree to our installation terms and warranty conditions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items by Vendor */}
                {Object.entries(itemsByVendor).map(([vendorId, vendorData]: [string, any]) => (
                  <div key={vendorId} className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <MapPin className="w-4 h-4" />
                      {vendorData.vendor?.companyName || 'Vendor'}
                    </div>
                    
                    {vendorData.items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3 py-2">
                        <img
                          src={item.product.images?.[0] || "/placeholder-product.jpg"}
                          alt={item.product.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-medium">
                          ${(item.product.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    ))}
                    
                    <div className="text-sm text-right">
                      Vendor subtotal: ${vendorData.subtotal.toLocaleString()}
                    </div>
                    <Separator />
                  </div>
                ))}

                {/* Coupon Code */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      onClick={() => applyCouponMutation.mutate(couponCode)}
                      disabled={!couponCode || applyCouponMutation.isPending}
                    >
                      Apply
                    </Button>
                  </div>
                  {appliedCoupon && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Gift className="w-4 h-4" />
                      {appliedCoupon.code} applied (-${discountAmount.toLocaleString()})
                    </div>
                  )}
                </div>

                <Separator />

                {/* Order Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-${discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span>Installation:</span>
                    <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toLocaleString()}`}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${taxAmount.toLocaleString()}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${total.toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={placeOrderMutation.isPending || !agreeToTerms}
                >
                  {placeOrderMutation.isPending ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>

                {/* Security Badges */}
                <div className="flex items-center justify-center gap-4 pt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    SSL Secure
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    25-Year Warranty
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">What's Included</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Professional installation
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Permits and inspections
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  25-year product warranty
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Monitoring and support
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Federal tax credits
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
