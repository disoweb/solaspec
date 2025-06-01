
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  DollarSign, 
  Plus, 
  Download, 
  TrendingUp,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  PiggyBank
} from "lucide-react";

const paymentMethods = [
  { value: 'bank_transfer', label: 'Bank Transfer', description: 'Direct transfer to bank account' },
  { value: 'paypal', label: 'PayPal', description: 'Transfer to PayPal account' },
  { value: 'stripe', label: 'Stripe', description: 'Stripe Connect payout' },
  { value: 'check', label: 'Check', description: 'Physical check by mail' },
];

export default function PayoutManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showWithdrawalDialog, setShowWithdrawalDialog] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    paymentMethod: '',
    paymentDetails: {}
  });

  const { data: balance } = useQuery({
    queryKey: ["/api/vendor/balance"],
  });

  const { data: payouts } = useQuery({
    queryKey: ["/api/vendor/payouts"],
  });

  const { data: withdrawals } = useQuery({
    queryKey: ["/api/vendor/withdrawals"],
  });

  const createWithdrawalMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/vendor/withdrawals", data);
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal Requested",
        description: "Your withdrawal request has been submitted for review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/withdrawals"] });
      setShowWithdrawalDialog(false);
      setWithdrawalForm({ amount: '', paymentMethod: '', paymentDetails: {} });
    },
  });

  const handleWithdrawalSubmit = () => {
    if (!withdrawalForm.amount || !withdrawalForm.paymentMethod) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(withdrawalForm.amount);
    if (amount <= 0 || amount > (balance?.balance || 0)) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount within your available balance.",
        variant: "destructive",
      });
      return;
    }

    createWithdrawalMutation.mutate({
      amount: withdrawalForm.amount,
      paymentMethod: withdrawalForm.paymentMethod,
      paymentDetails: withdrawalForm.paymentDetails,
    });
  };

  const getPayoutStatusBadge = (status: string) => {
    const variants: any = {
      pending: "secondary",
      processing: "default",
      completed: "outline",
      failed: "destructive"
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getPayoutIcon = (type: string) => {
    switch (type) {
      case 'commission':
        return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'bonus':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case 'refund':
        return <ArrowDownRight className="w-4 h-4 text-orange-600" />;
      default:
        return <Wallet className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payouts & Withdrawals</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowWithdrawalDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Request Withdrawal
          </Button>
        </div>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <PiggyBank className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Available Balance</p>
                <p className="text-2xl font-bold text-green-600">
                  ${(balance?.balance || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Earned</p>
                <p className="text-2xl font-bold">
                  ${payouts?.filter((p: any) => p.type === 'commission').reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0).toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <ArrowUpRight className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Total Withdrawn</p>
                <p className="text-2xl font-bold">
                  ${withdrawals?.filter((w: any) => w.status === 'processed').reduce((sum: number, w: any) => sum + parseFloat(w.amount), 0).toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending Withdrawals</p>
                <p className="text-2xl font-bold">
                  {withdrawals?.filter((w: any) => w.status === 'pending').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payouts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payouts">Payout History</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
            </CardHeader>
            <CardContent>
              {payouts && payouts.length > 0 ? (
                <div className="space-y-4">
                  {payouts.map((payout: any) => (
                    <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        {getPayoutIcon(payout.type)}
                        <div>
                          <h4 className="font-semibold capitalize">{payout.type}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(payout.createdAt).toLocaleDateString()}
                          </p>
                          {payout.notes && (
                            <p className="text-sm text-gray-500">{payout.notes}</p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {payout.type === 'withdrawal' ? '-' : '+'}${payout.amount}
                        </p>
                        {getPayoutStatusBadge(payout.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No payouts yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {withdrawals && withdrawals.length > 0 ? (
                <div className="space-y-4">
                  {withdrawals.map((withdrawal: any) => (
                    <div key={withdrawal.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <ArrowUpRight className="w-5 h-5 text-red-600" />
                        <div>
                          <h4 className="font-semibold">Withdrawal Request</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(withdrawal.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            via {paymentMethods.find(m => m.value === withdrawal.paymentMethod)?.label}
                          </p>
                          {withdrawal.adminNotes && (
                            <p className="text-sm text-gray-500 mt-1">
                              Admin: {withdrawal.adminNotes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-lg">-${withdrawal.amount}</p>
                        {getPayoutStatusBadge(withdrawal.status)}
                        {withdrawal.processedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Processed: {new Date(withdrawal.processedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No withdrawal requests yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Withdrawal Request Dialog */}
      <Dialog open={showWithdrawalDialog} onOpenChange={setShowWithdrawalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Withdrawal</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                Available Balance: <span className="font-bold">${(balance?.balance || 0).toLocaleString()}</span>
              </p>
            </div>

            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={withdrawalForm.amount}
                onChange={(e) => setWithdrawalForm(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="payment-method">Payment Method *</Label>
              <Select 
                value={withdrawalForm.paymentMethod} 
                onValueChange={(value) => setWithdrawalForm(prev => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method..." />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map(method => (
                    <SelectItem key={method.value} value={method.value}>
                      <div>
                        <div className="font-medium">{method.label}</div>
                        <div className="text-sm text-gray-600">{method.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {withdrawalForm.paymentMethod === 'bank_transfer' && (
              <div className="space-y-3">
                <Input
                  placeholder="Bank Name"
                  onChange={(e) => setWithdrawalForm(prev => ({ 
                    ...prev, 
                    paymentDetails: { ...prev.paymentDetails, bankName: e.target.value }
                  }))}
                />
                <Input
                  placeholder="Account Number"
                  onChange={(e) => setWithdrawalForm(prev => ({ 
                    ...prev, 
                    paymentDetails: { ...prev.paymentDetails, accountNumber: e.target.value }
                  }))}
                />
                <Input
                  placeholder="Routing Number"
                  onChange={(e) => setWithdrawalForm(prev => ({ 
                    ...prev, 
                    paymentDetails: { ...prev.paymentDetails, routingNumber: e.target.value }
                  }))}
                />
              </div>
            )}

            {withdrawalForm.paymentMethod === 'paypal' && (
              <Input
                placeholder="PayPal Email"
                type="email"
                onChange={(e) => setWithdrawalForm(prev => ({ 
                  ...prev, 
                  paymentDetails: { ...prev.paymentDetails, paypalEmail: e.target.value }
                }))}
              />
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowWithdrawalDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleWithdrawalSubmit} disabled={createWithdrawalMutation.isPending}>
                {createWithdrawalMutation.isPending ? "Submitting..." : "Request Withdrawal"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
