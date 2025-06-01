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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Megaphone, 
  Plus, 
  Edit, 
  Trash2, 
  Send,
  Users,
  User,
  Building,
  Globe,
  Clock,
  Calendar,
  Eye,
  EyeOff,
  Mail,
  AlertTriangle,
  Info,
  CheckCircle
} from "lucide-react";

const announcementTypes = [
  { value: 'info', label: 'Information', icon: Info, color: 'text-blue-600' },
  { value: 'warning', label: 'Warning', icon: AlertTriangle, color: 'text-orange-600' },
  { value: 'success', label: 'Success', icon: CheckCircle, color: 'text-green-600' },
  { value: 'urgent', label: 'Urgent', icon: AlertTriangle, color: 'text-red-600' },
];

const targetTypes = [
  { value: 'all_vendors', label: 'All Vendors', icon: Building, description: 'Send to all registered vendors' },
  { value: 'vendor_group', label: 'Vendor Group', icon: Users, description: 'Send to specific vendor groups' },
  { value: 'specific_vendors', label: 'Specific Vendors', icon: User, description: 'Send to selected vendors' },
  { value: 'all_users', label: 'All Users', icon: Globe, description: 'Send to all platform users' },
];

export default function Announcements() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info',
    targetType: 'all_vendors',
    targetGroups: [],
    targetVendors: [],
    sendEmail: false,
    emailSubject: '',
    emailTemplate: '',
    scheduledAt: '',
    expiresAt: ''
  });

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["/api/admin/announcements"],
  });

  const { data: vendorGroups } = useQuery({
    queryKey: ["/api/vendor-groups"],
  });

  const { data: vendors } = useQuery({
    queryKey: ["/api/vendors"],
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingAnnouncement) {
        await apiRequest("PUT", `/api/admin/announcements/${editingAnnouncement.id}`, data);
      } else {
        await apiRequest("POST", "/api/admin/announcements", data);
      }
    },
    onSuccess: () => {
      toast({
        title: editingAnnouncement ? "Announcement Updated" : "Announcement Created",
        description: `Announcement has been ${editingAnnouncement ? 'updated' : 'created'} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      setShowCreateDialog(false);
      setEditingAnnouncement(null);
      resetForm();
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (announcementId: number) => {
      await apiRequest("DELETE", `/api/admin/announcements/${announcementId}`);
    },
    onSuccess: () => {
      toast({
        title: "Announcement Deleted",
        description: "Announcement has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'info',
      targetType: 'all_vendors',
      targetGroups: [],
      targetVendors: [],
      sendEmail: false,
      emailSubject: '',
      emailTemplate: '',
      scheduledAt: '',
      expiresAt: ''
    });
  };

  const handleEdit = (announcement: any) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      targetType: announcement.targetType,
      targetGroups: announcement.targetGroups || [],
      targetVendors: announcement.targetVendors || [],
      sendEmail: announcement.sendEmail || false,
      emailSubject: announcement.emailSubject || '',
      emailTemplate: announcement.emailTemplate || '',
      scheduledAt: announcement.scheduledAt ? new Date(announcement.scheduledAt).toISOString().slice(0, 16) : '',
      expiresAt: announcement.expiresAt ? new Date(announcement.expiresAt).toISOString().slice(0, 16) : ''
    });
    setShowCreateDialog(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      ...formData,
      scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : null,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null
    };

    createAnnouncementMutation.mutate(submitData);
  };

  const getTypeInfo = (type: string) => {
    return announcementTypes.find(t => t.value === type) || announcementTypes[0];
  };

  const getTargetTypeInfo = (type: string) => {
    return targetTypes.find(t => t.value === type) || targetTypes[0];
  };

  const getAnnouncementStatus = (announcement: any) => {
    const now = new Date();
    const scheduledAt = announcement.scheduledAt ? new Date(announcement.scheduledAt) : null;
    const expiresAt = announcement.expiresAt ? new Date(announcement.expiresAt) : null;

    if (!announcement.isActive) return { status: 'inactive', label: 'Inactive', color: 'text-gray-600' };
    if (scheduledAt && scheduledAt > now) return { status: 'scheduled', label: 'Scheduled', color: 'text-blue-600' };
    if (expiresAt && expiresAt < now) return { status: 'expired', label: 'Expired', color: 'text-gray-600' };
    return { status: 'active', label: 'Active', color: 'text-green-600' };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Megaphone className="w-6 h-6 animate-pulse mr-2" />
            <span>Loading announcements...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeAnnouncements = announcements?.filter((a: any) => {
    const status = getAnnouncementStatus(a);
    return status.status === 'active';
  }) || [];

  const scheduledAnnouncements = announcements?.filter((a: any) => {
    const status = getAnnouncementStatus(a);
    return status.status === 'scheduled';
  }) || [];

  const expiredAnnouncements = announcements?.filter((a: any) => {
    const status = getAnnouncementStatus(a);
    return status.status === 'expired' || status.status === 'inactive';
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Announcements</h2>
        <Button onClick={() => {
          resetForm();
          setEditingAnnouncement(null);
          setShowCreateDialog(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Create Announcement
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Megaphone className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{activeAnnouncements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold">{scheduledAnnouncements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <EyeOff className="w-8 h-8 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Expired/Inactive</p>
                <p className="text-2xl font-bold">{expiredAnnouncements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Announcements Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active ({activeAnnouncements.length})</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled ({scheduledAnnouncements.length})</TabsTrigger>
          <TabsTrigger value="expired">Expired/Inactive ({expiredAnnouncements.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <AnnouncementsList 
            announcements={activeAnnouncements} 
            onEdit={handleEdit}
            onDelete={deleteAnnouncementMutation.mutate}
          />
        </TabsContent>

        <TabsContent value="scheduled">
          <AnnouncementsList 
            announcements={scheduledAnnouncements} 
            onEdit={handleEdit}
            onDelete={deleteAnnouncementMutation.mutate}
          />
        </TabsContent>

        <TabsContent value="expired">
          <AnnouncementsList 
            announcements={expiredAnnouncements} 
            onEdit={handleEdit}
            onDelete={deleteAnnouncementMutation.mutate}
          />
        </TabsContent>
      </Tabs>

      {/* Create/Edit Announcement Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Announcement Type *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {announcementTypes.map(type => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${type.color}`} />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="target-type">Target Audience *</Label>
                <Select 
                  value={formData.targetType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, targetType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience..." />
                  </SelectTrigger>
                  <SelectContent>
                    {targetTypes.map(type => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <span>{type.label}</span>
                            </div>
                            <p className="text-xs text-gray-600">{type.description}</p>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter announcement title..."
                required
              />
            </div>

            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter announcement content..."
                rows={6}
                required
              />
            </div>

            {/* Email Settings */}
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="send-email"
                  checked={formData.sendEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, sendEmail: e.target.checked }))}
                />
                <Label htmlFor="send-email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Send email notification
                </Label>
              </div>

              {formData.sendEmail && (
                <div className="space-y-3 ml-6">
                  <div>
                    <Label htmlFor="email-subject">Email Subject</Label>
                    <Input
                      id="email-subject"
                      value={formData.emailSubject}
                      onChange={(e) => setFormData(prev => ({ ...prev, emailSubject: e.target.value }))}
                      placeholder="Email subject (leave empty to use announcement title)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email-template">Email Template</Label>
                    <Textarea
                      id="email-template"
                      value={formData.emailTemplate}
                      onChange={(e) => setFormData(prev => ({ ...prev, emailTemplate: e.target.value }))}
                      placeholder="Custom email template (leave empty to use default)"
                      rows={4}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Scheduling */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduled-at">Schedule For (Optional)</Label>
                <Input
                  id="scheduled-at"
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to publish immediately</p>
              </div>

              <div>
                <Label htmlFor="expires-at">Expires At (Optional)</Label>
                <Input
                  id="expires-at"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowCreateDialog(false);
                  setEditingAnnouncement(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createAnnouncementMutation.isPending}>
                {createAnnouncementMutation.isPending 
                  ? (editingAnnouncement ? "Updating..." : "Creating...") 
                  : (editingAnnouncement ? "Update Announcement" : "Create Announcement")
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AnnouncementsList({ 
  announcements, 
  onEdit, 
  onDelete 
}: { 
  announcements: any[]; 
  onEdit: (announcement: any) => void;
  onDelete: (id: number) => void;
}) {
  const getTypeInfo = (type: string) => {
    return announcementTypes.find(t => t.value === type) || announcementTypes[0];
  };

  const getTargetTypeInfo = (type: string) => {
    return targetTypes.find(t => t.value === type) || targetTypes[0];
  };

  const getAnnouncementStatus = (announcement: any) => {
    const now = new Date();
    const scheduledAt = announcement.scheduledAt ? new Date(announcement.scheduledAt) : null;
    const expiresAt = announcement.expiresAt ? new Date(announcement.expiresAt) : null;

    if (!announcement.isActive) return { status: 'inactive', label: 'Inactive', color: 'text-gray-600' };
    if (scheduledAt && scheduledAt > now) return { status: 'scheduled', label: 'Scheduled', color: 'text-blue-600' };
    if (expiresAt && expiresAt < now) return { status: 'expired', label: 'Expired', color: 'text-gray-600' };
    return { status: 'active', label: 'Active', color: 'text-green-600' };
  };

  if (announcements.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No announcements in this category</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement: any) => {
        const typeInfo = getTypeInfo(announcement.type);
        const targetInfo = getTargetTypeInfo(announcement.targetType);
        const status = getAnnouncementStatus(announcement);
        const TypeIcon = typeInfo.icon;
        const TargetIcon = targetInfo.icon;

        return (
          <Card key={announcement.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <TypeIcon className={`w-5 h-5 ${typeInfo.color}`} />
                    <h3 className="font-semibold text-lg">{announcement.title}</h3>
                    <Badge variant="outline" className={status.color}>
                      {status.label}
                    </Badge>
                    {announcement.sendEmail && (
                      <Badge variant="secondary">
                        <Mail className="w-3 h-3 mr-1" />
                        Email
                      </Badge>
                    )}
                  </div>

                  <p className="text-gray-600 mb-3 line-clamp-2">{announcement.content}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <TargetIcon className="w-4 h-4" />
                      <span>{targetInfo.label}</span>
                    </div>
                    <span>•</span>
                    <span>Created: {new Date(announcement.createdAt).toLocaleDateString()}</span>
                    {announcement.scheduledAt && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Scheduled: {new Date(announcement.scheduledAt).toLocaleDateString()}</span>
                        </div>
                      </>
                    )}
                    {announcement.expiresAt && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Expires: {new Date(announcement.expiresAt).toLocaleDateString()}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onEdit(announcement)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-600"
                    onClick={() => onDelete(announcement.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}