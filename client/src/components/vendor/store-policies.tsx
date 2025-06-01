import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  ScrollText, 
  Plus, 
  Edit, 
  Trash2, 
  FileText,
  Shield,
  Truck,
  RotateCcw,
  CreditCard,
  Settings
} from "lucide-react";

const policyTypes = [
  { value: 'shipping', label: 'Shipping Policy', icon: Truck, description: 'Delivery terms and conditions' },
  { value: 'returns', label: 'Returns & Refunds', icon: RotateCcw, description: 'Return and refund policies' },
  { value: 'privacy', label: 'Privacy Policy', icon: Shield, description: 'Data protection and privacy' },
  { value: 'terms', label: 'Terms of Service', icon: FileText, description: 'General terms and conditions' },
  { value: 'warranty', label: 'Warranty Policy', icon: Settings, description: 'Product warranty information' },
  { value: 'payment', label: 'Payment Terms', icon: CreditCard, description: 'Payment methods and terms' },
  { value: 'custom', label: 'Custom Policy', icon: ScrollText, description: 'Custom store policy' },
];

export default function StorePolicies() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<any>(null);
  const [formData, setFormData] = useState({
    policyType: '',
    title: '',
    content: '',
    displayOrder: 0,
    isActive: true
  });

  const { data: policies, isLoading } = useQuery({
    queryKey: ["/api/vendor/policies"],
  });

  const createPolicyMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingPolicy) {
        await apiRequest("PUT", `/api/vendor/policies/${editingPolicy.id}`, data);
      } else {
        await apiRequest("POST", "/api/vendor/policies", data);
      }
    },
    onSuccess: () => {
      toast({
        title: editingPolicy ? "Policy Updated" : "Policy Created",
        description: `Store policy has been ${editingPolicy ? 'updated' : 'created'} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/policies"] });
      setShowCreateDialog(false);
      setEditingPolicy(null);
      resetForm();
    },
  });

  const deletePolicyMutation = useMutation({
    mutationFn: async (policyId: number) => {
      await apiRequest("DELETE", `/api/vendor/policies/${policyId}`);
    },
    onSuccess: () => {
      toast({
        title: "Policy Deleted",
        description: "Store policy has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/policies"] });
    },
  });

  const resetForm = () => {
    setFormData({
      policyType: '',
      title: '',
      content: '',
      displayOrder: 0,
      isActive: true
    });
  };

  const handleEdit = (policy: any) => {
    setEditingPolicy(policy);
    setFormData({
      policyType: policy.policyType,
      title: policy.title,
      content: policy.content,
      displayOrder: policy.displayOrder || 0,
      isActive: policy.isActive
    });
    setShowCreateDialog(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.policyType || !formData.title || !formData.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createPolicyMutation.mutate(formData);
  };

  const getPolicyTypeInfo = (type: string) => {
    return policyTypes.find(pt => pt.value === type) || policyTypes[policyTypes.length - 1];
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <ScrollText className="w-6 h-6 animate-pulse mr-2" />
            <span>Loading store policies...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Store Policies</h2>
        <Button onClick={() => {
          resetForm();
          setEditingPolicy(null);
          setShowCreateDialog(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Policy
        </Button>
      </div>

      {/* Policy Types Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {policyTypes.slice(0, 6).map((type) => {
          const existingPolicy = policies?.find((p: any) => p.policyType === type.value);
          const Icon = type.icon;

          return (
            <Card key={type.value} className={`cursor-pointer transition-colors ${
              existingPolicy ? 'border-green-200 bg-green-50' : 'border-gray-200'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`w-5 h-5 ${existingPolicy ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="font-medium">{type.label}</span>
                  {existingPolicy && (
                    <Badge variant="outline" className="text-green-600">
                      Created
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                {existingPolicy ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(existingPolicy)}>
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600"
                      onClick={() => deletePolicyMutation.mutate(existingPolicy.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setFormData(prev => ({ ...prev, policyType: type.value, title: type.label }));
                      setShowCreateDialog(true);
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Create
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Existing Policies */}
      <Card>
        <CardHeader>
          <CardTitle>Your Store Policies</CardTitle>
        </CardHeader>
        <CardContent>
          {policies && policies.length > 0 ? (
            <div className="space-y-4">
              {policies.map((policy: any) => {
                const typeInfo = getPolicyTypeInfo(policy.policyType);
                const Icon = typeInfo.icon;

                return (
                  <div key={policy.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-gray-600" />
                        <h4 className="font-semibold">{policy.title}</h4>
                        <Badge variant="outline">
                          {typeInfo.label}
                        </Badge>
                        {!policy.isActive && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(policy)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600"
                          onClick={() => deletePolicyMutation.mutate(policy.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">{policy.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Last updated: {new Date(policy.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <ScrollText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No store policies created yet</p>
              <p className="text-sm text-gray-500 mb-4">
                Create policies to inform customers about your store terms and conditions.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Policy
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Policy Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPolicy ? 'Edit Store Policy' : 'Create Store Policy'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="policy-type">Policy Type *</Label>
                <Select 
                  value={formData.policyType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, policyType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select policy type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {policyTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="display-order">Display Order</Label>
                <Input
                  id="display-order"
                  type="number"
                  min="0"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="title">Policy Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter policy title..."
                required
              />
            </div>

            <div>
              <Label htmlFor="content">Policy Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter policy content..."
                rows={10}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is-active"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              />
              <Label htmlFor="is-active">Active (visible to customers)</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowCreateDialog(false);
                  setEditingPolicy(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createPolicyMutation.isPending}>
                {createPolicyMutation.isPending 
                  ? (editingPolicy ? "Updating..." : "Creating...") 
                  : (editingPolicy ? "Update Policy" : "Create Policy")
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}