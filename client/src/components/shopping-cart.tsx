
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { 
  ShoppingBag, 
  Package, 
  Shield, 
  Truck, 
  Minus, 
  Plus, 
  X, 
  Tag,
  CreditCard,
  Calculator,
  MapPin,
  Clock
} from "lucide-react";

interface CartItemWithProduct {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: string;
    imageUrl: string;
    vendor: {
      id: number;
      companyName: string;
      verified: boolean;
    };
    vendorId: number;
    stockQuantity: number;
    minimumOrderQuantity: number;
  };
}

interface VendorCartGroup {
  vendor: {
    id: number;
    companyName: string;
    verified: boolean;
  };
  items: CartItemWithProduct[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  appliedCoupons: string[];
  shippingOption: 'standard' | 'express' | 'overnight';
}

interface GroupedCartItems {
  [vendorId: string]: VendorCartGroup;
}

export default function ShoppingCart() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [couponCodes, setCouponCodes] = useState<{[vendorId: string]: string}>({});
  const [appliedCoupons, setAppliedCoupons] = useState<{[vendorId: string]: string[]}>({});
  const [shippingOptions, setShippingOptions] = useState<{[vendorId: string]: string}>({});

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["/api/cart"],
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      return apiRequest("PUT", `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update quantity",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Success",
        description: "Item removed from cart",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove item",
        variant: "destructive",
      });
    },
  });

  // Group cart items by vendor with calculations
  const groupedItems: GroupedCartItems = cartItems.reduce((acc: GroupedCartItems, item: CartItemWithProduct) => {
    const vendorId = item.product.vendor.id.toString();
    if (!acc[vendorId]) {
      acc[vendorId] = {
        vendor: item.product.vendor,
        items: [],
        subtotal: 0,
        shipping: 0,
        tax: 0,
        discount: 0,
        total: 0,
        appliedCoupons: [],
        shippingOption: 'standard'
      };
    }
    
    acc[vendorId].items.push(item);
    const itemTotal = parseFloat(item.product.price) * item.quantity;
    acc[vendorId].subtotal += itemTotal;
    
    // Calculate shipping based on option
    const shippingOption = shippingOptions[vendorId] || 'standard';
    acc[vendorId].shippingOption = shippingOption as any;
    acc[vendorId].shipping = calculateShipping(shippingOption, acc[vendorId].subtotal);
    
    // Calculate tax (8.5% for demo)
    acc[vendorId].tax = acc[vendorId].subtotal * 0.085;
    
    // Apply discounts from coupons
    acc[vendorId].discount = calculateDiscount(appliedCoupons[vendorId] || [], acc[vendorId].subtotal);
    
    // Calculate total
    acc[vendorId].total = acc[vendorId].subtotal + acc[vendorId].shipping + acc[vendorId].tax - acc[vendorId].discount;
    
    return acc;
  }, {});

  const calculateShipping = (option: string, subtotal: number) => {
    if (subtotal > 500) return 0; // Free shipping over $500
    
    switch (option) {
      case 'express': return 25;
      case 'overnight': return 50;
      default: return subtotal > 100 ? 0 : 15; // Free standard shipping over $100
    }
  };

  const calculateDiscount = (coupons: string[], subtotal: number) => {
    // Mock discount calculation - in real app, would validate against backend
    let discount = 0;
    coupons.forEach(coupon => {
      if (coupon === 'SAVE10') discount += subtotal * 0.1;
      if (coupon === 'SAVE20') discount += subtotal * 0.2;
      if (coupon === 'FLAT50') discount += 50;
    });
    return Math.min(discount, subtotal * 0.5); // Max 50% discount
  };

  const grandTotal = Object.values(groupedItems).reduce((sum, group) => sum + group.total, 0);
  const totalItems = cartItems.reduce((sum: number, item: CartItemWithProduct) => sum + item.quantity, 0);

  const handleUpdateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantityMutation.mutate({ id, quantity: newQuantity });
  };

  const handleRemoveItem = (id: number) => {
    removeItemMutation.mutate(id);
  };

  const applyCoupon = (vendorId: string) => {
    const code = couponCodes[vendorId]?.trim();
    if (!code) return;

    // Validate coupon (mock validation)
    const validCoupons = ['SAVE10', 'SAVE20', 'FLAT50', 'WELCOME15'];
    if (!validCoupons.includes(code)) {
      toast({
        title: "Invalid Coupon",
        description: "This coupon code is not valid.",
        variant: "destructive",
      });
      return;
    }

    setAppliedCoupons(prev => ({
      ...prev,
      [vendorId]: [...(prev[vendorId] || []), code]
    }));
    
    setCouponCodes(prev => ({ ...prev, [vendorId]: '' }));
    
    toast({
      title: "Coupon Applied",
      description: `Coupon "${code}" applied successfully.`,
    });
  };

  const removeCoupon = (vendorId: string, coupon: string) => {
    setAppliedCoupons(prev => ({
      ...prev,
      [vendorId]: (prev[vendorId] || []).filter(c => c !== coupon)
    }));
  };

  const updateShippingOption = (vendorId: string, option: string) => {
    setShippingOptions(prev => ({ ...prev, [vendorId]: option }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
          <p className="text-gray-600 mb-6">Start shopping to add items to your cart</p>
          <Link href="/marketplace">
            <Button>Browse Products</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cart Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Shopping Cart ({totalItems} items)
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Split by Vendor
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Vendor Groups */}
      {Object.entries(groupedItems).map(([vendorId, group]) => (
        <Card key={vendorId} className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{group.vendor.companyName}</h3>
                  <div className="flex items-center gap-2">
                    {group.vendor.verified && (
                      <Badge variant="default" className="text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified Vendor
                      </Badge>
                    )}
                    <span className="text-sm text-gray-600">
                      {group.items.length} item{group.items.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  ${group.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-gray-500">Vendor Total</div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Items */}
            <div className="space-y-4">
              {group.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={item.product.imageUrl || "/placeholder-product.jpg"}
                    alt={item.product.name}
                    className="w-16 h-16 rounded object-cover"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{item.product.name}</h4>
                    <p className="text-sm text-gray-600">
                      ${parseFloat(item.product.price).toLocaleString()} each
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.product.stockQuantity} in stock
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center border rounded-lg">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= item.product.minimumOrderQuantity}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="px-3 py-1 min-w-[3rem] text-center">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stockQuantity}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="text-right min-w-[100px]">
                      <div className="font-semibold">
                        ${(parseFloat(item.product.price) * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Shipping Options */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Shipping Options</span>
              </div>
              <Select 
                value={group.shippingOption} 
                onValueChange={(value) => updateShippingOption(vendorId, value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">
                    <div className="flex justify-between w-full">
                      <span>Standard Shipping (5-7 days)</span>
                      <span className="ml-4">{group.subtotal > 100 ? 'Free' : '$15'}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="express">
                    <div className="flex justify-between w-full">
                      <span>Express Shipping (2-3 days)</span>
                      <span className="ml-4">$25</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="overnight">
                    <div className="flex justify-between w-full">
                      <span>Overnight Shipping</span>
                      <span className="ml-4">$50</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Coupon Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Discount Codes</span>
              </div>
              
              {/* Applied Coupons */}
              {group.appliedCoupons && group.appliedCoupons.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {group.appliedCoupons.map((coupon, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                      {coupon}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-0 text-green-600"
                        onClick={() => removeCoupon(vendorId, coupon)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code"
                  value={couponCodes[vendorId] || ''}
                  onChange={(e) => setCouponCodes(prev => ({ ...prev, [vendorId]: e.target.value }))}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => applyCoupon(vendorId)}
                  disabled={!couponCodes[vendorId]?.trim()}
                >
                  Apply
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Try: SAVE10, SAVE20, FLAT50, WELCOME15
              </p>
            </div>

            <Separator />

            {/* Vendor Totals Breakdown */}
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${group.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Shipping:</span>
                <span className={group.shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {group.shipping === 0 ? 'Free' : `$${group.shipping.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Tax (8.5%):</span>
                <span>${group.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              
              {group.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount:</span>
                  <span>-${group.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between font-semibold text-lg">
                <span>Vendor Total:</span>
                <span className="text-green-600">
                  ${group.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Grand Total Summary */}
      <Card className="border-2 border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calculator className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="text-xl font-bold text-green-800">Order Total</h3>
                <p className="text-sm text-green-700">
                  Combined total from {Object.keys(groupedItems).length} vendor{Object.keys(groupedItems).length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-800">
                ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-green-600">
                {totalItems} items total
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checkout Button */}
      <div className="flex justify-end">
        <Link href="/checkout">
          <Button size="lg" className="w-full md:w-auto">
            <CreditCard className="w-5 h-5 mr-2" />
            Proceed to Checkout
          </Button>
        </Link>
      </div>
    </div>
  );
}
