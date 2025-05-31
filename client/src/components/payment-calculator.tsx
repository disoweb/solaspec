import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";

interface PaymentCalculatorProps {
  initialPrice?: number;
  onCalculationChange?: (calculation: PaymentCalculation) => void;
}

interface PaymentCalculation {
  basePrice: number;
  installmentFee: number;
  taxCredit: number;
  totalPrice: number;
  monthlyPayment: number;
  paymentType: string;
  installmentMonths: number;
}

export default function PaymentCalculator({ 
  initialPrice = 25000, 
  onCalculationChange 
}: PaymentCalculatorProps) {
  const [basePrice, setBasePrice] = useState(initialPrice);
  const [paymentType, setPaymentType] = useState("full");
  const [installmentMonths, setInstallmentMonths] = useState(36);
  
  const [calculation, setCalculation] = useState<PaymentCalculation>({
    basePrice: initialPrice,
    installmentFee: 0,
    taxCredit: initialPrice * 0.30, // 30% tax credit
    totalPrice: initialPrice,
    monthlyPayment: 0,
    paymentType: "full",
    installmentMonths: 0,
  });

  useEffect(() => {
    const newCalculation = calculatePayment();
    setCalculation(newCalculation);
    if (onCalculationChange) {
      onCalculationChange(newCalculation);
    }
  }, [basePrice, paymentType, installmentMonths, onCalculationChange]);

  const calculatePayment = (): PaymentCalculation => {
    const taxCredit = basePrice * 0.30; // 30% federal tax credit
    let installmentFee = 0;
    let totalPrice = basePrice;
    let monthlyPayment = 0;
    let months = 0;

    if (paymentType === "installment") {
      installmentFee = basePrice * 0.30; // 30% fee for installments
      totalPrice = basePrice + installmentFee;
      monthlyPayment = totalPrice / installmentMonths;
      months = installmentMonths;
    }

    return {
      basePrice,
      installmentFee,
      taxCredit,
      totalPrice,
      monthlyPayment,
      paymentType,
      installmentMonths: months,
    };
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const paymentOptions = [
    { value: "full", label: "Full Payment (0% fee)", months: 0 },
    { value: "installment", label: "Installment Plan (30% fee)", months: 24 },
  ];

  const installmentOptions = [
    { value: 24, label: "24 months" },
    { value: 36, label: "36 months" },
    { value: 48, label: "48 months" },
    { value: 60, label: "60 months" },
    { value: 84, label: "84 months" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="w-5 h-5 mr-2" />
          Payment Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* System Price Input */}
        <div>
          <Label htmlFor="system-price">System Price</Label>
          <Input
            id="system-price"
            type="number"
            value={basePrice}
            onChange={(e) => setBasePrice(Number(e.target.value))}
            className="mt-1"
          />
        </div>

        {/* Payment Type Selection */}
        <div>
          <Label>Payment Terms</Label>
          <Select value={paymentType} onValueChange={setPaymentType}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {paymentOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Installment Length (only shown for installment payments) */}
        {paymentType === "installment" && (
          <div>
            <Label>Payment Period</Label>
            <Select 
              value={installmentMonths.toString()} 
              onValueChange={(value) => setInstallmentMonths(Number(value))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {installmentOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Calculation Results */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Base Price:</span>
                <span className="font-semibold">{formatCurrency(calculation.basePrice)}</span>
              </div>
              
              {calculation.installmentFee > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Installment Fee (30%):</span>
                  <span className="font-semibold text-orange-600">
                    {formatCurrency(calculation.installmentFee)}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Federal Tax Credit (30%):</span>
                <span className="font-semibold text-green-600">
                  -{formatCurrency(calculation.taxCredit)}
                </span>
              </div>
              
              <hr className="my-3" />
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-foreground">
                  Total {paymentType === "installment" ? "with Fee" : "Price"}:
                </span>
                <span className="text-lg font-bold text-foreground">
                  {formatCurrency(calculation.totalPrice)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">After Tax Credit:</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(calculation.totalPrice - calculation.taxCredit)}
                </span>
              </div>
              
              {calculation.monthlyPayment > 0 && (
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-muted-foreground">Monthly Payment:</span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(calculation.monthlyPayment)}/month
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• Federal tax credit subject to eligibility</p>
          <p>• Installment payments include 30% financing fee</p>
          <p>• All payments protected by escrow</p>
          {calculation.monthlyPayment > 0 && (
            <p>• Total of {calculation.installmentMonths} monthly payments</p>
          )}
        </div>

        {/* Action Button */}
        <Button className="w-full bg-primary hover:bg-primary/90">
          {paymentType === "installment" ? "Apply for Financing" : "Get Quote"}
        </Button>
      </CardContent>
    </Card>
  );
}
