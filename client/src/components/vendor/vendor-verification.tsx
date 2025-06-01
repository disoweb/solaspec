
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Shield, 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  Eye,
  Download
} from "lucide-react";

const documentTypes = [
  { value: 'proof_of_address', label: 'Proof of Address', description: 'Utility bill or bank statement' },
  { value: 'proof_of_identity', label: 'Proof of Identity', description: 'Government-issued ID' },
  { value: 'company_license', label: 'Business License', description: 'Valid business registration' },
  { value: 'tax_document', label: 'Tax Document', description: 'Tax ID or certificate' },
  { value: 'bank_statement', label: 'Bank Statement', description: 'Recent bank statement' },
  { value: 'other', label: 'Other', description: 'Other supporting document' },
];

export default function VendorVerification() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    documentType: '',
    documentName: '',
    file: null as File | null
  });

  const { data: documents, isLoading } = useQuery({
    queryKey: ["/api/vendor/verification/documents"],
  });

  const { data: requirements } = useQuery({
    queryKey: ["/api/vendor/verification/requirements"],
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      formData.append('documentType', data.documentType);
      formData.append('documentName', data.documentName);
      formData.append('file', data.file);

      return await fetch('/api/vendor/verification/upload', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Document Uploaded",
        description: "Your verification document has been submitted for review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/verification/documents"] });
      setShowUploadDialog(false);
      setUploadForm({ documentType: '', documentName: '', file: null });
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
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive"
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getDocumentTypeInfo = (type: string) => {
    return documentTypes.find(doc => doc.value === type);
  };

  const getVerificationProgress = () => {
    if (!documents || !requirements) return { progress: 0, approved: 0, total: 0 };
    
    const requiredDocs = requirements.filter((req: any) => req.isRequired);
    const approvedDocs = documents.filter((doc: any) => doc.status === 'approved');
    
    const total = requiredDocs.length;
    const approved = approvedDocs.length;
    const progress = total > 0 ? (approved / total) * 100 : 0;

    return { progress, approved, total };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm(prev => ({ ...prev, file, documentName: file.name }));
    }
  };

  const handleUploadSubmit = () => {
    if (!uploadForm.documentType || !uploadForm.file) {
      toast({
        title: "Missing Information",
        description: "Please select a document type and file.",
        variant: "destructive",
      });
      return;
    }

    uploadDocumentMutation.mutate(uploadForm);
  };

  const verificationStats = getVerificationProgress();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Shield className="w-6 h-6 animate-pulse mr-2" />
            <span>Loading verification status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Vendor Verification</h2>
        <Button onClick={() => setShowUploadDialog(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Verification Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Verification Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {verificationStats.approved} of {verificationStats.total} required documents approved
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${verificationStats.progress}%` }}
              ></div>
            </div>

            {verificationStats.progress === 100 && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Verification Complete!</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Required Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Required Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requirements?.filter((req: any) => req.isRequired).map((requirement: any) => {
              const uploadedDoc = documents?.find((doc: any) => doc.documentType === requirement.documentType);
              const docTypeInfo = getDocumentTypeInfo(requirement.documentType);
              
              return (
                <div key={requirement.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium">{docTypeInfo?.label}</h4>
                      <p className="text-sm text-gray-600">{requirement.description || docTypeInfo?.description}</p>
                      {requirement.allowedFormats && (
                        <p className="text-xs text-gray-500">
                          Allowed formats: {requirement.allowedFormats.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {uploadedDoc ? (
                      <>
                        {getStatusIcon(uploadedDoc.status)}
                        {getStatusBadge(uploadedDoc.status)}
                      </>
                    ) : (
                      <Badge variant="outline">Not Uploaded</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {documents && documents.length > 0 ? (
            <div className="space-y-4">
              {documents.map((document: any) => {
                const docTypeInfo = getDocumentTypeInfo(document.documentType);
                
                return (
                  <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(document.status)}
                      <div>
                        <h4 className="font-medium">{docTypeInfo?.label}</h4>
                        <p className="text-sm text-gray-600">{document.documentName}</p>
                        <p className="text-xs text-gray-500">
                          Uploaded: {new Date(document.submittedAt).toLocaleDateString()}
                        </p>
                        {document.reviewNotes && (
                          <p className="text-xs text-gray-600 mt-1">
                            Notes: {document.reviewNotes}
                          </p>
                        )}
                        {document.expiresAt && (
                          <p className="text-xs text-orange-600">
                            Expires: {new Date(document.expiresAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(document.status)}
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No documents uploaded yet</p>
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Your First Document
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Document Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Verification Document</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="document-type">Document Type *</Label>
              <Select 
                value={uploadForm.documentType} 
                onValueChange={(value) => setUploadForm(prev => ({ ...prev, documentType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type..." />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-gray-600">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="document-name">Document Name</Label>
              <Input
                id="document-name"
                value={uploadForm.documentName}
                onChange={(e) => setUploadForm(prev => ({ ...prev, documentName: e.target.value }))}
                placeholder="Enter document name..."
              />
            </div>

            <div>
              <Label htmlFor="file">File *</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileChange}
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 5MB)
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUploadSubmit} 
                disabled={uploadDocumentMutation.isPending}
              >
                {uploadDocumentMutation.isPending ? "Uploading..." : "Upload Document"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
