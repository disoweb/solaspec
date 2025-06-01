
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Mail,
  Shield,
  CheckCircle,
  Clock,
  Settings
} from "lucide-react";

const availablePermissions = [
  { id: 'products', label: 'Product Management', description: 'Create, edit, and delete products' },
  { id: 'orders', label: 'Order Management', description: 'View and manage orders' },
  { id: 'inventory', label: 'Inventory Management', description: 'Manage stock and inventory' },
  { id: 'analytics', label: 'Analytics & Reports', description: 'View sales analytics and reports' },
  { id: 'coupons', label: 'Coupon Management', description: 'Create and manage discount coupons' },
  { id: 'customers', label: 'Customer Support', description: 'Handle customer inquiries and support' },
  { id: 'payouts', label: 'Financial Management', description: 'View payouts and financial data' },
  { id: 'staff', label: 'Staff Management', description: 'Manage team members and permissions' },
];

const staffRoles = [
  { value: 'manager', label: 'Manager', description: 'Full access to most features' },
  { value: 'assistant', label: 'Assistant', description: 'Limited access to daily operations' },
  { value: 'support', label: 'Support', description: 'Customer support focused role' },
  { value: 'analyst', label: 'Analyst', description: 'Analytics and reporting focused' },
  { value: 'inventory', label: 'Inventory Specialist', description: 'Stock and inventory management' },
];

export default function StaffManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [inviteForm, setInviteForm] = useState({
    userEmail: '',
    role: '',
    permissions: [] as string[]
  });

  const { data: staff, isLoading } = useQuery({
    queryKey: ["/api/vendor/staff"],
  });

  const inviteStaffMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/vendor/staff", data);
    },
    onSuccess: () => {
      toast({
        title: "Staff Invited",
        description: "Staff member has been invited successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/staff"] });
      setShowInviteDialog(false);
      setInviteForm({ userEmail: '', role: '', permissions: [] });
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ staffId, permissions }: { staffId: number; permissions: any }) => {
      await apiRequest("PUT", `/api/vendor/staff/${staffId}/permissions`, { permissions });
    },
    onSuccess: () => {
      toast({
        title: "Permissions Updated",
        description: "Staff permissions have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/staff"] });
      setShowEditDialog(false);
    },
  });

  const removeStaffMutation = useMutation({
    mutationFn: async (staffId: number) => {
      await apiRequest("DELETE", `/api/vendor/staff/${staffId}`);
    },
    onSuccess: () => {
      toast({
        title: "Staff Removed",
        description: "Staff member has been removed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/staff"] });
    },
  });

  const handleInviteSubmit = () => {
    if (!inviteForm.userEmail || !inviteForm.role) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    inviteStaffMutation.mutate({
      userEmail: inviteForm.userEmail,
      role: inviteForm.role,
      permissions: inviteForm.permissions,
    });
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setInviteForm(prev => ({
        ...prev,
        permissions: [...prev.permissions, permissionId]
      }));
    } else {
      setInviteForm(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => p !== permissionId)
      }));
    }
  };

  const getRoleInfo = (roleValue: string) => {
    return staffRoles.find(role => role.value === roleValue);
  };

  const getStatusBadge = (member: any) => {
    if (member.joinedAt) {
      return <Badge variant="default">Active</Badge>;
    } else if (member.isActive) {
      return <Badge variant="secondary">Invited</Badge>;
    } else {
      return <Badge variant="outline">Inactive</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Users className="w-6 h-6 animate-pulse mr-2" />
            <span>Loading staff...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Team & Staff Management</h2>
        <Button onClick={() => setShowInviteDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Invite Staff
        </Button>
      </div>

      {/* Staff Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold">{staff?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Members</p>
                <p className="text-2xl font-bold">
                  {staff?.filter((s: any) => s.joinedAt).length || 0}
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
                <p className="text-sm text-gray-600">Pending Invites</p>
                <p className="text-2xl font-bold">
                  {staff?.filter((s: any) => !s.joinedAt && s.isActive).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          {staff && staff.length > 0 ? (
            <div className="space-y-4">
              {staff.map((member: any) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{member.userName}</h4>
                      <p className="text-sm text-gray-600">{member.userEmail}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{getRoleInfo(member.role)?.label}</Badge>
                        {getStatusBadge(member)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedStaff(member);
                        setShowEditDialog(true);
                      }}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeStaffMutation.mutate(member.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No team members yet</p>
              <Button onClick={() => setShowInviteDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Invite Your First Team Member
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Staff Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="team@example.com"
                  value={inviteForm.userEmail}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, userEmail: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="role">Role *</Label>
                <Select value={inviteForm.role} onValueChange={(value) => setInviteForm(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {staffRoles.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-sm text-gray-600">{role.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {availablePermissions.map(permission => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission.id}
                        checked={inviteForm.permissions.includes(permission.id)}
                        onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor={permission.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {permission.label}
                        </Label>
                        <p className="text-xs text-gray-600">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleInviteSubmit} disabled={inviteStaffMutation.isPending}>
                {inviteStaffMutation.isPending ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Permissions Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Permissions</DialogTitle>
          </DialogHeader>
          
          {selectedStaff && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold">{selectedStaff.userName}</h4>
                <p className="text-sm text-gray-600">{selectedStaff.userEmail}</p>
                <Badge variant="outline" className="mt-2">
                  {getRoleInfo(selectedStaff.role)?.label}
                </Badge>
              </div>

              <div>
                <Label>Current Permissions</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {availablePermissions.map(permission => {
                    const hasPermission = selectedStaff.permissions?.[permission.id] || false;
                    return (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-${permission.id}`}
                          checked={hasPermission}
                          onCheckedChange={(checked) => {
                            setSelectedStaff(prev => ({
                              ...prev,
                              permissions: {
                                ...prev.permissions,
                                [permission.id]: checked
                              }
                            }));
                          }}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label
                            htmlFor={`edit-${permission.id}`}
                            className="text-sm font-medium leading-none"
                          >
                            {permission.label}
                          </Label>
                          <p className="text-xs text-gray-600">{permission.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => updatePermissionsMutation.mutate({
                    staffId: selectedStaff.id,
                    permissions: selectedStaff.permissions
                  })}
                  disabled={updatePermissionsMutation.isPending}
                >
                  {updatePermissionsMutation.isPending ? "Updating..." : "Update Permissions"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
