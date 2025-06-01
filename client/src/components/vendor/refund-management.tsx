
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  RefreshCw, 
  MessageSquare, 
  Eye, 
  DollarSign,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

export default function RefundManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRefund, setSelectedRefund] = useState<any>(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageText, setMessageText] = useState("");

  const { data: refunds, isLoading } = useQuery({
    queryKey: ["/api/refunds"],
  });

  const { data: refundMessages } = useQuery({
    queryKey: ["/api/refunds", selectedRefund?.id, "messages"],
    enabled: !!selectedRefund?.id,
  });

  const updateRefundMutation = useMutation({
    mutationFn: async ({ refundId, data }: { refundId: number; data: any }) => {
      await apiRequest("PUT", `/api/refunds/${refundId}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Refund Updated",
        description: "Refund status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/refunds"] });
    },
  });

  const addMessageMutation = useMutation({
    mutationFn: async ({ refundId, message }: { refundId: number; message: string }) => {
      await apiRequest("POST", `/api/refunds/${refundId}/messages`, { message });
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/refunds"] });
      setMessageText("");
      setShowMessageDialog(false);
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'processed':
        return <DollarSign className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
      processed: "outline"
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading refunds...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Refund Management</h2>
        <Button variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Refunds</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="processed">Processed</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <RefundList 
            refunds={refunds} 
            onSelectRefund={setSelectedRefund}
            onUpdateRefund={updateRefundMutation.mutate}
            onShowMessages={(refund) => {
              setSelectedRefund(refund);
              setShowMessageDialog(true);
            }}
          />
        </TabsContent>

        <TabsContent value="pending">
          <RefundList 
            refunds={refunds?.filter((r: any) => r.status === 'pending')} 
            onSelectRefund={setSelectedRefund}
            onUpdateRefund={updateRefundMutation.mutate}
            onShowMessages={(refund) => {
              setSelectedRefund(refund);
              setShowMessageDialog(true);
            }}
          />
        </TabsContent>

        <TabsContent value="approved">
          <RefundList 
            refunds={refunds?.filter((r: any) => r.status === 'approved')} 
            onSelectRefund={setSelectedRefund}
            onUpdateRefund={updateRefundMutation.mutate}
            onShowMessages={(refund) => {
              setSelectedRefund(refund);
              setShowMessageDialog(true);
            }}
          />
        </TabsContent>

        <TabsContent value="processed">
          <RefundList 
            refunds={refunds?.filter((r: any) => r.status === 'processed')} 
            onSelectRefund={setSelectedRefund}
            onUpdateRefund={updateRefundMutation.mutate}
            onShowMessages={(refund) => {
              setSelectedRefund(refund);
              setShowMessageDialog(true);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Refund Communication</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedRefund && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold">Refund #{selectedRefund.id}</h4>
                <p className="text-sm text-gray-600">Amount: ${selectedRefund.amount}</p>
                <p className="text-sm text-gray-600">Order: #{selectedRefund.orderId}</p>
              </div>
            )}

            {/* Messages */}
            <div className="max-h-60 overflow-y-auto space-y-3">
              {refundMessages?.map((message: any) => (
                <div key={message.id} className="border-l-4 border-blue-200 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{message.senderName}</span>
                    <Badge variant="outline" className="text-xs">
                      {message.senderRole}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm">{message.message}</p>
                </div>
              ))}
            </div>

            {/* New Message */}
            <div className="space-y-2">
              <Textarea
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end">
                <Button
                  onClick={() => addMessageMutation.mutate({
                    refundId: selectedRefund.id,
                    message: messageText
                  })}
                  disabled={!messageText.trim() || addMessageMutation.isPending}
                >
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RefundList({ 
  refunds, 
  onSelectRefund, 
  onUpdateRefund,
  onShowMessages 
}: { 
  refunds: any[]; 
  onSelectRefund: (refund: any) => void;
  onUpdateRefund: (data: any) => void;
  onShowMessages: (refund: any) => void;
}) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'processed':
        return <DollarSign className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
      processed: "outline"
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  if (!refunds || refunds.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No refund requests found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {refunds.map((refund: any) => (
        <Card key={refund.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(refund.status)}
                  <h3 className="font-semibold">Refund #{refund.id}</h3>
                  {getStatusBadge(refund.status)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Amount</p>
                    <p className="font-medium">${refund.amount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Order</p>
                    <p className="font-medium">#{refund.orderId}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Customer</p>
                    <p className="font-medium">{refund.requesterName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Date</p>
                    <p className="font-medium">
                      {new Date(refund.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-gray-600 text-sm">Reason:</p>
                  <p className="text-sm">{refund.reason}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onShowMessages(refund)}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Messages
                </Button>

                {refund.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => onUpdateRefund({
                        refundId: refund.id,
                        data: { status: 'approved' }
                      })}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateRefund({
                        refundId: refund.id,
                        data: { status: 'rejected' }
                      })}
                    >
                      Reject
                    </Button>
                  </>
                )}

                {refund.status === 'approved' && (
                  <Button
                    size="sm"
                    onClick={() => onUpdateRefund({
                      refundId: refund.id,
                      data: { status: 'processed' }
                    })}
                  >
                    Mark Processed
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
