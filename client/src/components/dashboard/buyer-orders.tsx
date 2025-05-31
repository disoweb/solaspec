import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Calendar, DollarSign, Truck } from "lucide-react";

export default function BuyerOrders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Order History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Orders Yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't placed any orders yet. Start browsing our solar systems!
            </p>
            <Button asChild>
              <a href="/marketplace">Browse Products</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 hover:bg-green-500';
      case 'installing':
        return 'bg-blue-500 hover:bg-blue-500';
      case 'paid':
      case 'escrow':
        return 'bg-yellow-500 hover:bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500 hover:bg-red-500';
      default:
        return 'bg-gray-500 hover:bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Package className="w-4 h-4" />;
      case 'installing':
        return <Truck className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="w-5 h-5 mr-2" />
          Order History ({orders.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order: any) => (
            <Card key={order.id} className="border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      Order #{order.id.slice(0, 8)}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1 capitalize">{order.status}</span>
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Amount</p>
                    <p className="font-semibold text-foreground">
                      ${parseFloat(order.totalAmount).toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Payment Type</p>
                    <p className="font-semibold text-foreground capitalize">
                      {order.paymentType}
                    </p>
                  </div>
                  
                  {order.installmentMonths && (
                    <div>
                      <p className="text-muted-foreground">Payment Term</p>
                      <p className="font-semibold text-foreground">
                        {order.installmentMonths} months
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="font-semibold text-foreground">
                      {new Date(order.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {order.notes && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground">Notes:</p>
                    <p className="text-sm text-foreground">{order.notes}</p>
                  </div>
                )}

                <div className="flex justify-end mt-4 space-x-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  {(order.status === 'pending' || order.status === 'paid') && (
                    <Button variant="outline" size="sm">
                      Track Order
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
