import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";

export default function ShoppingCartComponent() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const updateCartMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      await apiRequest("PUT", `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
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
        description: "Failed to update cart item.",
        variant: "destructive",
      });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Removed from Cart",
        description: "Item has been removed from your cart.",
      });
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
        description: "Failed to remove item from cart.",
        variant: "destructive",
      });
    },
  });

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateCartMutation.mutate({ id, quantity: newQuantity });
  };

  const removeItem = (id: number) => {
    removeFromCartMutation.mutate(id);
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Sign In Required</h3>
          <p className="text-muted-foreground mb-4">
            Please sign in to view your shopping cart.
          </p>
          <Button asChild>
            <a href="/api/login">Sign In</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Shopping Cart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex space-x-4">
                  <div className="h-16 w-16 bg-muted rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Your Cart is Empty</h3>
          <p className="text-muted-foreground mb-4">
            Add some solar systems to your cart to get started.
          </p>
          <Button asChild>
            <a href="/marketplace">Browse Products</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const total = cartItems.reduce((sum: number, item: any) => {
    return sum + (parseFloat(item.product?.price || 0) * item.quantity);
  }, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShoppingCart className="w-5 h-5 mr-2" />
          Shopping Cart ({cartItems.length} items)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {cartItems.map((item: any) => (
            <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
              <img 
                src={item.product?.imageUrl || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&h=100&fit=crop"}
                alt={item.product?.name || "Product"}
                className="w-16 h-16 object-cover rounded"
              />
              
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{item.product?.name}</h4>
                <p className="text-sm text-muted-foreground">{item.product?.type}</p>
                <p className="text-lg font-bold text-foreground">
                  ${parseFloat(item.product?.price || 0).toLocaleString()}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeItem(item.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-foreground">Total:</span>
              <span className="text-2xl font-bold text-foreground">
                ${total.toLocaleString()}
              </span>
            </div>
            
            <div className="text-sm text-muted-foreground mb-4">
              <p>• 30% Federal Tax Credit Available</p>
              <p>• Escrow Protection Included</p>
              <p>• Installment Plans Available</p>
            </div>
            
            <Button className="w-full bg-primary hover:bg-primary/90" size="lg">
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
