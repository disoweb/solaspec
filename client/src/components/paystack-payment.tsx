
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Lock, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaystackPaymentProps {
  amount: number;
  email: string;
  orderId: string;
  onSuccess: (reference: string) => void;
  onError: (error: any) => void;
}

export default function PaystackPayment({ 
  amount, 
  email, 
  orderId, 
  onSuccess, 
  onError 
}: PaystackPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const initializePayment = async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, you would:
      // 1. Load Paystack script dynamically
      // 2. Initialize payment with proper public key
      // 3. Handle the payment flow
      
      // Mock payment for demo purposes
      setTimeout(() => {
        const mockReference = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        onSuccess(mockReference);
        setIsLoading(false);
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully.",
        });
      }, 2000);

      // Real Paystack implementation would look like:
      /*
      const PaystackPop = window.PaystackPop;
      const handler = PaystackPop.setup({
        key: 'pk_test_your_public_key', // Replace with your public key
        email: email,
        amount: amount * 100, // Paystack expects amount in kobo
        currency: 'NGN',
        ref: `${orderId}_${Date.now()}`,
        callback: function(response) {
          onSuccess(response.reference);
          setIsLoading(false);
        },
        onClose: function() {
          setIsLoading(false);
        }
      });
      handler.openIframe();
      */
      
    } catch (error) {
      setIsLoading(false);
      onError(error);
      toast({
        title: "Payment Error",
        description: "There was an error processing your payment.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Secure Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <span className="font-medium">Total Amount:</span>
          <span className="text-2xl font-bold text-green-600">
            ₦{amount.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>Secured by Paystack</span>
          <Badge variant="outline" className="text-xs">SSL Encrypted</Badge>
        </div>

        <Button 
          onClick={initializePayment}
          disabled={isLoading}
          className="w-full h-12 bg-green-600 hover:bg-green-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Pay ₦{amount.toLocaleString()} Securely
            </>
          )}
        </Button>

        <div className="text-xs text-center text-muted-foreground">
          Your payment is protected by 256-bit SSL encryption
        </div>
      </CardContent>
    </Card>
  );
}
