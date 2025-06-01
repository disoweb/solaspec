
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Minus, ShoppingBag, Package, Truck, Shield, CreditCard } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CartItemWithProduct {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: string;
    imageUrl?: string;
    vendor: {
      id: number;
      companyName: string;
      verified: boolean;
    };
    inStock: boolean;
    stockQuantity: number;
  };
}

interface GroupedCartItems {
  [vendorId: string]: {
    vendor: {
      id: number;
      companyName: string;
      verified: boolean;
    };
    items: CartItemWithProduct[];
    subtotal: number;
  };
}

export default function ShoppingCart() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupons, setAppliedCoupons] = useState<{[vendorId: string]: string}>({});

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["/api/cart"],
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      return apiRequest(`/api/cart/${id}`, {
        method: "PUT",
        body: JSON.stringify({ quantity }),
      });
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
      return apiRequest(`/api/cart/${id}`, {
        method: "DELETE",
      });
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

  // Group cart items by vendor
  const groupedItems: GroupedCartItems = cartItems.reduce((acc: GroupedCartItems, item: CartItemWithProduct) => {
    const vendorId = item.product.vendor.id.toString();
    if (!acc[vendorId]) {
      acc[vendorId] = {
        vendor: item.product.vendor,
        items: [],
        subtotal: 0,
      };
    }
    acc[vendorId].items.push(item);
    acc[vendorId].subtotal += parseFloat(item.product.price) * item.quantity;
    return acc;
  }, {});

  const totalAmount = Object.values(groupedItems).reduce((sum, group) => sum + group.subtotal, 0);
  const totalItems = cartItems.reduce((sum: number, item: CartItemWithProduct) => sum + item.quantity, 0);

  const handleUpdateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantityMutation.mutate({ id, quantity: newQuantity });
  };

  const handleRemoveItem = (id: number) => {
    removeItemMutation.mutate(id);
  };

  const applyCoupon = (vendorId: string) => {
    if (couponCode.trim()) {
      setAppliedCoupons(prev => ({ ...prev, [vendorId]: couponCode }));
      setCouponCode("");
      toast({
        title: "Coupon Applied",
        description: `Coupon "${couponCode}" applied to ${groupedItems[vendorId].vendor.companyName}`,
      });
    }
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
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Shopping Cart ({totalItems} items)
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Grouped Cart Items by Vendor */}
      {Object.entries(groupedItems).map(([vendorId, group]) => (
        <Card key={vendorId}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold">{group.vendor.companyName}</h3>
                  <div className="flex items-center gap-2">
                    {group.vendor.verified && (
                      <Badge variant="default" className="text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    <span className="text-sm text-gray-600">
                      {group.items.length} item{group.items.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">${group.subtotal.toLocaleString()}</div>
                {appliedCoupons[vendorId] && (
                  <Badge variant="secondary" className="mt-1">
                    Coupon: {appliedCoupons[vendorId]}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cart Items */}
            {group.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {item.product.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium">{item.product.name}</h4>
                  <p className="text-sm text-gray-600">
                    ${parseFloat(item.product.price).toLocaleString()} each
                  </p>
                  {!item.product.inStock && (
                    <Badge variant="destructive" className="mt-1">Out of Stock</Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stockQuantity}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="text-right">
                  <div className="font-semibold">
                    ${(parseFloat(item.product.price) * item.quantity).toLocaleString()}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Coupon Section */}
            <div className="border-t pt-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => applyCoupon(vendorId)}
                  disabled={!couponCode.trim()}
                >
                  Apply Coupon
                </Button>
              </div>
            </div>

            {/* Shipping Options */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-4 h-4 text-gray-600" />
                <span className="font-medium">Shipping Options</span>
              </div>
              <Select defaultValue="standard">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Shipping (5-7 days) - Free</SelectItem>
                  <SelectItem value="express">Express Shipping (2-3 days) - $25</SelectItem>
                  <SelectItem value="overnight">Overnight Shipping - $50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Cart Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>Calculated at checkout</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>${totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Link href="/checkout">
              <Button className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>

          {/* Security Badge */}
          <div className="mt-4 text-center text-sm text-gray-600">
            <div className="flex items-center justify-center gap-1">
              <Shield className="w-4 h-4" />
              <span>Secure checkout with 256-bit SSL encryption</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
