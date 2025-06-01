
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Upload, Building, FileText, Shield, CheckCircle, AlertCircle } from "lucide-react";

interface CustomField {
  id: string;
  name: string;
  type: "text" | "textarea" | "select" | "checkbox" | "radio" | "number" | "email" | "phone" | "url" | "date" | "file";
  required: boolean;
  options?: string[];
  placeholder?: string;
  description?: string;
}

const defaultCustomFields: CustomField[] = [
  {
    id: "business_type",
    name: "Business Type",
    type: "select",
    required: true,
    options: ["Solar Installer", "Equipment Distributor", "Solar Manufacturer", "Other"],
    description: "Select your primary business type"
  },
  {
    id: "years_in_business",
    name: "Years in Business",
    type: "number",
    required: true,
    placeholder: "Enter number of years",
    description: "How many years have you been in the solar business?"
  },
  {
    id: "service_areas",
    name: "Service Areas",
    type: "textarea",
    required: true,
    placeholder: "List your service areas (one per line)",
    description: "Geographic areas where you provide services"
  },
  {
    id: "certifications",
    name: "Certifications",
    type: "checkbox",
    required: false,
    options: ["NABCEP Certified", "OSHA Certified", "State Licensed", "Manufacturer Certified"],
    description: "Select all applicable certifications"
  },
  {
    id: "business_license",
    name: "Business License Number",
    type: "text",
    required: true,
    placeholder: "Enter your business license number",
    description: "Your official business license number"
  },
  {
    id: "insurance_coverage",
    name: "Insurance Coverage",
    type: "radio",
    required: true,
    options: ["General Liability Only", "General + Professional", "Full Coverage Package"],
    description: "Type of insurance coverage you carry"
  },
  {
    id: "annual_revenue",
    name: "Annual Revenue Range",
    type: "select",
    required: false,
    options: ["Under $100K", "$100K - $500K", "$500K - $1M", "$1M - $5M", "Over $5M"],
    description: "Your company's annual revenue (optional)"
  },
  {
    id: "company_documents",
    name: "Company Documents",
    type: "file",
    required: true,
    description: "Upload business license, insurance certificate, etc."
  },
  {
    id: "references",
    name: "Customer References",
    type: "textarea",
    required: false,
    placeholder: "Provide 2-3 customer references with contact information",
    description: "Optional customer references"
  }
];

export default function VendorRegistrationForm() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [customFieldData, setCustomFieldData] = useState<any>({});
  const [uploadedFiles, setUploadedFiles] = useState<{[key: string]: File}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const submitRegistrationMutation = useMutation({
    mutationFn: async (data: any) => {
      const submitData = new FormData();
      
      // Add basic form data
      Object.keys(data.basicInfo).forEach(key => {
        submitData.append(key, data.basicInfo[key]);
      });
      
      // Add custom field data
      submitData.append('customFields', JSON.stringify(data.customFields));
      
      // Add uploaded files
      Object.keys(data.files).forEach(key => {
        submitData.append(`file_${key}`, data.files[key]);
      });

      return apiRequest("/api/vendors/register", {
        method: "POST",
        body: submitData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Registration Submitted",
        description: "Your vendor application has been submitted for review. You'll be notified once it's processed.",
      });
      setStep(totalSteps + 1); // Success step
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to submit registration",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomFieldChange = (fieldId: string, value: any) => {
    setCustomFieldData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleFileUpload = (fieldId: string, file: File) => {
    setUploadedFiles(prev => ({ ...prev, [fieldId]: file }));
  };

  const validateStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return formData.companyName && formData.email && formData.phone;
      case 2:
        const requiredFields = defaultCustomFields.filter(field => field.required);
        return requiredFields.every(field => {
          if (field.type === 'file') {
            return uploadedFiles[field.id];
          }
          return customFieldData[field.id];
        });
      case 3:
        return formData.agreeToTerms;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    } else {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields before continuing",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => setStep(prev => prev - 1);

  const submitForm = () => {
    setIsSubmitting(true);
    const submitData = {
      basicInfo: formData,
      customFields: customFieldData,
      files: uploadedFiles,
    };
    submitRegistrationMutation.mutate(submitData);
  };

  const renderCustomField = (field: CustomField) => {
    const value = customFieldData[field.id] || '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
          />
        );

      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            rows={4}
          />
        );

      case 'select':
        return (
          <Select value={value} onValueChange={(val) => handleCustomFieldChange(field.id, val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <RadioGroup value={value} onValueChange={(val) => handleCustomFieldChange(field.id, val)}>
            {field.options?.map(option => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}_${option}`} />
                <Label htmlFor={`${field.id}_${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        const checkboxValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}_${option}`}
                  checked={checkboxValues.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleCustomFieldChange(field.id, [...checkboxValues, option]);
                    } else {
                      handleCustomFieldChange(field.id, checkboxValues.filter(v => v !== option));
                    }
                  }}
                />
                <Label htmlFor={`${field.id}_${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
          />
        );

      case 'file':
        return (
          <div className="space-y-2">
            <Input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(field.id, file);
                }
              }}
            />
            {uploadedFiles[field.id] && (
              <Badge variant="secondary">
                {uploadedFiles[field.id].name}
              </Badge>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (step > totalSteps) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Registration Submitted!</h2>
          <p className="text-muted-foreground mb-6">
            Thank you for applying to become a vendor. Your application is now under review.
            You'll receive an email notification once your application has been processed.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">What happens next?</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Our team will review your application within 2-3 business days</li>
              <li>• You may be contacted for additional information</li>
              <li>• Once approved, you'll receive your vendor dashboard access</li>
              <li>• You can then start listing your products on our marketplace</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Vendor Registration</h2>
            <span className="text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
          </div>
          <Progress value={progress} className="w-full" />
        </CardContent>
      </Card>

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName || ''}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Enter your company name"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://your-website.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Company Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Tell us about your company and services"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Business Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="business@company.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Business Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Business Address</Label>
              <Textarea
                id="address"
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Full business address including city, state, and zip code"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Custom Fields */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {defaultCustomFields.map(field => (
              <div key={field.id}>
                <Label htmlFor={field.id}>
                  {field.name}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {field.description && (
                  <p className="text-sm text-muted-foreground mb-2">{field.description}</p>
                )}
                {renderCustomField(field)}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Terms and Conditions */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Terms and Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
              <h4 className="font-semibold mb-2">Vendor Agreement</h4>
              <div className="text-sm space-y-2">
                <p>By becoming a vendor on our platform, you agree to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Provide accurate and up-to-date product information</li>
                  <li>Honor all sales and maintain competitive pricing</li>
                  <li>Provide excellent customer service</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Pay applicable commission fees as outlined</li>
                  <li>Maintain required certifications and licenses</li>
                  <li>Respond to customer inquiries within 24 hours</li>
                  <li>Process orders within specified timeframes</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms || false}
                  onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked)}
                />
                <Label htmlFor="agreeToTerms">
                  I agree to the terms and conditions *
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreeToCommission"
                  checked={formData.agreeToCommission || false}
                  onCheckedChange={(checked) => handleInputChange('agreeToCommission', checked)}
                />
                <Label htmlFor="agreeToCommission">
                  I understand and agree to the 10% commission structure
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="subscribeToUpdates"
                  checked={formData.subscribeToUpdates || false}
                  onCheckedChange={(checked) => handleInputChange('subscribeToUpdates', checked)}
                />
                <Label htmlFor="subscribeToUpdates">
                  Subscribe to platform updates and vendor newsletters
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={step === 1}
        >
          Previous
        </Button>

        {step < totalSteps ? (
          <Button onClick={nextStep}>
            Next
          </Button>
        ) : (
          <Button 
            onClick={submitForm}
            disabled={!validateStep(step) || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        )}
      </div>
    </div>
  );
}
