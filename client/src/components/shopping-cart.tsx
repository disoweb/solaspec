import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ShoppingCart, Trash2, Plus, Minus, Package, CreditCard, Shield, Truck } from "lucide-react";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [paymentType, setPaymentType] = useState<"full" | "installment">("full");
  const [installmentMonths, setInstallmentMonths] = useState("30");

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      await apiRequest("PUT", `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart.",
      });
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return await apiRequest("POST", "/api/orders", orderData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order Created",
        description: "Your order has been placed successfully!",
      });
      onClose();
    },
  });

  // Group cart items by vendor
  const cartByVendor = cartItems?.reduce((groups: any, item: any) => {
    const vendorId = item.product?.vendorId || 'unknown';
    if (!groups[vendorId]) {
      groups[vendorId] = {
        vendorId,
        vendorName: item.product?.vendor?.companyName || 'Unknown Vendor',
        items: [],
        subtotal: 0,
      };
    }
    groups[vendorId].items.push(item);
    groups[vendorId].subtotal += parseFloat(item.product?.price || 0) * item.quantity;
    return groups;
  }, {});

  const totalAmount = Object.values(cartByVendor || {}).reduce(
    (total: number, vendor: any) => total + vendor.subtotal,
    0
  );

  const calculateInstallmentAmount = (amount: number) => {
    const feeRate = 0.30; // 30% fee
    const totalWithFee = amount * (1 + feeRate);
    return totalWithFee / parseInt(installmentMonths);
  };

  const handleCheckout = async () => {
    if (!cartItems || cartItems.length === 0) return;

    try {
      // Create orders for each vendor
      for (const vendorGroup of Object.values(cartByVendor)) {
        const vendor = vendorGroup as any;

        for (const item of vendor.items) {
          const orderData = {
            vendorId: vendor.vendorId,
            productId: item.productId,
            quantity: item.quantity,
            totalAmount: (parseFloat(item.product.price) * item.quantity).toString(),
            paymentType,
            installmentMonths: paymentType === 'installment' ? parseInt(installmentMonths) : null,
            shippingAddress: {
              // This would be collected from a form
              street: "123 Main St",
              city: "Anytown",
              state: "CA",
              zipCode: "12345",
            },
          };

          await createOrderMutation.mutateAsync(orderData);
        }
      }
    } catch (error) {
      toast({
        title: "Checkout Error",
        description: "Failed to process your order. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart className="w-6 h-6" />
              <span>Shopping Cart</span>
            </CardTitle>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : !cartItems || cartItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-4">Add some solar products to get started</p>
              <Button onClick={onClose}>Continue Shopping</Button>
            </div>
          ) : (
            <>
              {/* Cart Items by Vendor */}
              <div className="space-y-6">
                {Object.values(cartByVendor).map((vendorGroup: any) => (
                  <Card key={vendorGroup.vendorId} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{vendorGroup.vendorName}</h3>
                        <Badge variant="secondary">
                          {vendorGroup.items.length} item{vendorGroup.items.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {vendorGroup.items.map((item: any) => (
                        <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <img
                            src={item.product?.imageUrl || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&h=100&fit=crop"}
                            alt={item.product?.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{item.product?.name}</h4>
                            <p className="text-sm text-muted-foreground">{item.product?.capacity}</p>
                            <p className="font-semibold text-green-600">
                              ${parseFloat(item.product?.price || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantityMutation.mutate({
                                id: item.id,
                                quantity: Math.max(1, item.quantity - 1)
                              })}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantityMutation.mutate({
                                id: item.id,
                                quantity: item.quantity + 1
                              })}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeItemMutation.mutate(item.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-medium">Vendor Subtotal:</span>
                        <span className="font-bold text-green-600">
                          ${vendorGroup.subtotal.toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Separator />

              {/* Payment Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Payment Options</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="full-payment"
                        name="payment-type"
                        checked={paymentType === "full"}
                        onChange={() => setPaymentType("full")}
                      />
                      <label htmlFor="full-payment" className="flex-1">
                        <div className="font-medium">Pay in Full</div>
                        <div className="text-sm text-muted-foreground">
                          Complete payment now - ${totalAmount.toLocaleString()}
                        </div>
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="installment-payment"
                        name="payment-type"
                        checked={paymentType === "installment"}
                        onChange={() => setPaymentType("installment")}
                      />
                      <label htmlFor="installment-payment" className="flex-1">
                        <div className="font-medium">Installment Plan</div>
                        <div className="text-sm text-muted-foreground">
                          Flexible payment options with 30% processing fee
                        </div>
                      </label>
                    </div>

                    {paymentType === "installment" && (
                      <div className="ml-6 space-y-2">
                        <Select value={installmentMonths} onValueChange={setInstallmentMonths}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12">12 months - ${calculateInstallmentAmount(totalAmount).toFixed(0)}/month</SelectItem>
                            <SelectItem value="24">24 months - ${calculateInstallmentAmount(totalAmount * 24 / 30).toFixed(0)}/month</SelectItem>
                            <SelectItem value="30">30 months - ${calculateInstallmentAmount(totalAmount).toFixed(0)}/month</SelectItem>
                            <SelectItem value="36">36 months - ${calculateInstallmentAmount(totalAmount * 36 / 30).toFixed(0)}/month</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                          Total with fees: ${(totalAmount * 1.30).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Security Features */}
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-6 h-6 text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-800">Secure Escrow Protection</h4>
                      <p className="text-sm text-green-700">
                        Your payment is held securely until installation is complete
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax Credits:</span>
                    <span className="text-green-600">-30%</span>
                  </div>
                  {paymentType === "installment" && (
                    <div className="flex justify-between text-orange-600">
                      <span>Installment Fee (30%):</span>
                      <span>+${(totalAmount * 0.30).toLocaleString()}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>
                      ${paymentType === "installment" 
                        ? (totalAmount * 1.30).toLocaleString() 
                        : totalAmount.toLocaleString()}
                    </span>
                  </div>
                  {paymentType === "installment" && (
                    <p className="text-sm text-muted-foreground">
                      ${calculateInstallmentAmount(totalAmount).toFixed(0)}/month for {installmentMonths} months
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Checkout Button */}
              <div className="flex space-x-4">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Continue Shopping
                </Button>
                <Button 
                  onClick={handleCheckout}
                  disabled={createOrderMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {createOrderMutation.isPending ? "Processing..." : "Secure Checkout"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}