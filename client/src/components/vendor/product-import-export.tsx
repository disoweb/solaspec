
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from "lucide-react";

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export default function ProductImportExport({ vendor }: { vendor: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [exportFormat, setExportFormat] = useState("csv");

  const exportProductsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/products/export", {
        method: "GET",
        headers: {
          'Accept': exportFormat === 'csv' ? 'text/csv' : 'application/json',
        },
      });
      return response;
    },
    onSuccess: (data) => {
      const blob = new Blob([data], { 
        type: exportFormat === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: `Products exported as ${exportFormat.toUpperCase()}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export products",
        variant: "destructive",
      });
    },
  });

  const importProductsMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      return apiRequest("/api/products/import", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: (result: ImportResult) => {
      setImportResult(result);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      
      if (result.success > 0) {
        toast({
          title: "Import Completed",
          description: `${result.success} products imported successfully${result.failed > 0 ? `, ${result.failed} failed` : ''}`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import products",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setImporting(false);
      setImportProgress(0);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImporting(true);
      setImportResult(null);
      
      // Simulate progress
      const interval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      importProductsMutation.mutate(file);
    }
  };

  const downloadTemplate = () => {
    const csvTemplate = `name,description,price,capacity,type,warranty,efficiency,stockQuantity,minimumOrderQuantity,weight,dimensions,sku,locations
"High Efficiency Solar Panel","Description here",299.99,"400W","residential","25 years",22.5,100,1,18.5,"{""length"": 2000, ""width"": 1000, ""height"": 40}","SKU001","California;Nevada"
"Commercial Solar Inverter","Description here",1299.99,"10kW","commercial","10 years",98.5,50,1,45,"{""length"": 500, ""width"": 300, ""height"": 200}","SKU002","California;Nevada;Arizona"`;
    
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-import-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Products
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="export-format">Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Excel Compatible)</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={() => exportProductsMutation.mutate()}
              disabled={exportProductsMutation.isPending}
            >
              <Download className="w-4 h-4 mr-2" />
              {exportProductsMutation.isPending ? "Exporting..." : "Export Products"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Products
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={downloadTemplate}
            >
              <FileText className="w-4 h-4 mr-2" />
              Download Template
            </Button>
            <div className="text-sm text-muted-foreground">
              Download the CSV template to ensure proper formatting
            </div>
          </div>

          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              Drop your CSV or JSON file here, or click to browse
            </p>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
            >
              {importing ? "Importing..." : "Select File"}
            </Button>
          </div>

          {importing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Importing products...</span>
                <span>{importProgress}%</span>
              </div>
              <Progress value={importProgress} />
            </div>
          )}

          {importResult && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  {importResult.failed === 0 ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  )}
                  <h4 className="font-semibold">Import Results</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{importResult.success}</div>
                    <div className="text-sm text-muted-foreground">Successful</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{importResult.failed}</div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                </div>

                {importResult.errors.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2">Errors:</h5>
                    <div className="space-y-1">
                      {importResult.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Import Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Import Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Supported formats:</strong> CSV, JSON</p>
            <p><strong>Required fields:</strong> name, price, type</p>
            <p><strong>Optional fields:</strong> description, capacity, warranty, efficiency, etc.</p>
            <p><strong>Array fields:</strong> Use semicolons to separate multiple values (e.g., "California;Nevada")</p>
            <p><strong>JSON format:</strong> Use proper JSON structure for dimensions field</p>
            <p><strong>File size limit:</strong> Maximum 10MB</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
