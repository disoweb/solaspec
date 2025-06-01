
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Package, Truck, CheckCircle, Clock, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function OrderTracking() {
  const [orderCode, setOrderCode] = useState("");
  const [searchedOrder, setSearchedOrder] = useState<string | null>(null);

  const { data: orderDetails, isLoading } = useQuery({
    queryKey: ["/api/orders", searchedOrder],
    queryFn: () => apiRequest(`/api/orders/${searchedOrder}`),
    enabled: !!searchedOrder,
  });

  const handleSearch = () => {
    if (orderCode.trim()) {
      setSearchedOrder(orderCode.trim());
    }
  };

  const getStatusProgress = (status: string) => {
    const statusMap: { [key: string]: number } = {
      pending: 10,
      paid: 25,
      escrow: 40,
      installing: 70,
      completed: 100,
      cancelled: 0,
    };
    return statusMap[status] || 0;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'paid':
      case 'escrow':
        return <Package className="w-4 h-4" />;
      case 'installing':
        return <Truck className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'installing':
        return 'bg-blue-500';
      case 'paid':
      case 'escrow':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Track Your Order
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter order ID (e.g., ORD-123456)"
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={!orderCode.trim()}>
              Track Order
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Order Details */}
      {isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      )}

      {orderDetails && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Order #{orderDetails.id.slice(0, 8)}</CardTitle>
                <p className="text-muted-foreground">
                  Placed on {new Date(orderDetails.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Badge 
                variant="secondary" 
                className={`${getStatusColor(orderDetails.status)} text-white`}
              >
                <div className="flex items-center">
                  {getStatusIcon(orderDetails.status)}
                  <span className="ml-1 capitalize">{orderDetails.status}</span>
                </div>
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{getStatusProgress(orderDetails.status)}%</span>
              </div>
              <Progress value={getStatusProgress(orderDetails.status)} className="h-2" />
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <h4 className="font-semibold">Order Timeline</h4>
              <div className="space-y-3">
                {[
                  { status: 'pending', label: 'Order Placed', completed: true },
                  { status: 'paid', label: 'Payment Confirmed', completed: ['paid', 'escrow', 'installing', 'completed'].includes(orderDetails.status) },
                  { status: 'escrow', label: 'Funds in Escrow', completed: ['escrow', 'installing', 'completed'].includes(orderDetails.status) },
                  { status: 'installing', label: 'Installation Started', completed: ['installing', 'completed'].includes(orderDetails.status) },
                  { status: 'completed', label: 'Installation Complete', completed: orderDetails.status === 'completed' },
                ].map((step, index) => (
                  <div key={step.status} className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className={step.completed ? 'text-foreground' : 'text-muted-foreground'}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Details */}
            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
              <div>
                <h4 className="font-semibold mb-2">Order Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product:</span>
                    <span>{orderDetails.productName || 'Solar System'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span>{orderDetails.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="font-semibold">${parseFloat(orderDetails.totalAmount).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {orderDetails.shippingAddress && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Installation Address
                  </h4>
                  <div className="text-sm text-muted-foreground">
                    {orderDetails.shippingAddress.street}<br />
                    {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.zipCode}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {searchedOrder && !orderDetails && !isLoading && (
        <Card>
          <CardContent className="p-6 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
            <p className="text-muted-foreground">
              Please check your order ID and try again.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
