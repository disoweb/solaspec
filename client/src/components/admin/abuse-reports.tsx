
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  AlertTriangle,
  Shield,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Flag,
  MessageSquare,
  User,
  Package,
  Star
} from "lucide-react";

const reportCategories = {
  fake_product: { label: 'Fake Product', icon: Package, color: 'text-red-600' },
  inappropriate_content: { label: 'Inappropriate Content', icon: AlertTriangle, color: 'text-orange-600' },
  spam: { label: 'Spam', icon: MessageSquare, color: 'text-yellow-600' },
  fraud: { label: 'Fraud', icon: Shield, color: 'text-red-600' },
  copyright: { label: 'Copyright Violation', icon: Flag, color: 'text-purple-600' },
  other: { label: 'Other', icon: AlertTriangle, color: 'text-gray-600' },
};

const priorityColors = {
  low: 'text-green-600',
  medium: 'text-yellow-600',
  high: 'text-orange-600',
  urgent: 'text-red-600',
};

export default function AbuseReports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [resolution, setResolution] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const { data: reports, isLoading } = useQuery({
    queryKey: ["/api/admin/abuse-reports"],
  });

  const updateReportMutation = useMutation({
    mutationFn: async ({ reportId, data }: { reportId: number; data: any }) => {
      await apiRequest("PUT", `/api/admin/abuse-reports/${reportId}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Report Updated",
        description: "Abuse report has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/abuse-reports"] });
      setShowDetailsDialog(false);
    },
  });

  const getReportIcon = (reportType: string) => {
    switch (reportType) {
      case 'product':
        return <Package className="w-4 h-4" />;
      case 'review':
        return <Star className="w-4 h-4" />;
      case 'vendor':
        return <User className="w-4 h-4" />;
      default:
        return <Flag className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: "secondary",
      under_review: "default",
      resolved: "outline",
      dismissed: "destructive"
    };
    return <Badge variant={variants[status] || "secondary"}>{status.replace('_', ' ')}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'under_review':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'dismissed':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryInfo = (category: string) => {
    return reportCategories[category as keyof typeof reportCategories] || reportCategories.other;
  };

  const handleReportAction = (action: string) => {
    if (!selectedReport) return;

    const updates: any = {
      status: action,
      reviewedBy: 1, // Current admin user ID
      adminNotes: adminNotes,
    };

    if (action === 'resolved') {
      updates.resolution = resolution;
    }

    updateReportMutation.mutate({
      reportId: selectedReport.id,
      data: updates
    });
  };

  const openReportDetails = (report: any) => {
    setSelectedReport(report);
    setAdminNotes(report.adminNotes || '');
    setResolution(report.resolution || '');
    setShowDetailsDialog(true);
  };

  const reportsByStatus = {
    pending: reports?.filter((r: any) => r.status === 'pending') || [],
    under_review: reports?.filter((r: any) => r.status === 'under_review') || [],
    resolved: reports?.filter((r: any) => r.status === 'resolved') || [],
    dismissed: reports?.filter((r: any) => r.status === 'dismissed') || [],
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 animate-pulse mr-2" />
            <span>Loading abuse reports...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Abuse Reports</h2>
        <div className="flex items-center gap-2">
          <Badge variant="destructive">
            {reportsByStatus.pending.length} Pending
          </Badge>
          <Badge variant="secondary">
            {reportsByStatus.under_review.length} Under Review
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{reportsByStatus.pending.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Eye className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Under Review</p>
                <p className="text-2xl font-bold">{reportsByStatus.under_review.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold">{reportsByStatus.resolved.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Dismissed</p>
                <p className="text-2xl font-bold">{reportsByStatus.dismissed.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({reportsByStatus.pending.length})</TabsTrigger>
          <TabsTrigger value="under_review">Under Review ({reportsByStatus.under_review.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({reportsByStatus.resolved.length})</TabsTrigger>
          <TabsTrigger value="dismissed">Dismissed ({reportsByStatus.dismissed.length})</TabsTrigger>
        </TabsList>

        {Object.entries(reportsByStatus).map(([status, statusReports]) => (
          <TabsContent key={status} value={status}>
            <ReportList 
              reports={statusReports} 
              onSelectReport={openReportDetails}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Report Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Abuse Report Details</DialogTitle>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6">
              {/* Report Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Report Type</p>
                    <div className="flex items-center gap-2">
                      {getReportIcon(selectedReport.reportType)}
                      <span className="font-medium capitalize">{selectedReport.reportType}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4" />
                      <span className="font-medium">{getCategoryInfo(selectedReport.category).label}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Priority</p>
                    <Badge 
                      variant="outline" 
                      className={priorityColors[selectedReport.priority as keyof typeof priorityColors]}
                    >
                      {selectedReport.priority}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Reported By</p>
                    <span className="font-medium">{selectedReport.reporterName}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label>Description</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">{selectedReport.description}</p>
                </div>
              </div>

              {/* Evidence */}
              {selectedReport.evidence && (
                <div>
                  <Label>Evidence</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">Evidence files attached</p>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <Label htmlFor="admin-notes">Admin Notes</Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes..."
                  rows={3}
                />
              </div>

              {/* Resolution */}
              {selectedReport.status === 'pending' || selectedReport.status === 'under_review' ? (
                <div>
                  <Label htmlFor="resolution">Resolution Details</Label>
                  <Textarea
                    id="resolution"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Describe the resolution or action taken..."
                    rows={3}
                  />
                </div>
              ) : (
                selectedReport.resolution && (
                  <div>
                    <Label>Resolution</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">{selectedReport.resolution}</p>
                    </div>
                  </div>
                )
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2">
                {selectedReport.status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleReportAction('under_review')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Start Review
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleReportAction('dismissed')}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Dismiss
                    </Button>
                  </>
                )}

                {selectedReport.status === 'under_review' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleReportAction('dismissed')}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Dismiss
                    </Button>
                    <Button
                      onClick={() => handleReportAction('resolved')}
                      disabled={!resolution.trim()}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Resolve
                    </Button>
                  </>
                )}

                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReportList({ 
  reports, 
  onSelectReport 
}: { 
  reports: any[]; 
  onSelectReport: (report: any) => void;
}) {
  const getReportIcon = (reportType: string) => {
    switch (reportType) {
      case 'product':
        return <Package className="w-4 h-4" />;
      case 'review':
        return <Star className="w-4 h-4" />;
      case 'vendor':
        return <User className="w-4 h-4" />;
      default:
        return <Flag className="w-4 h-4" />;
    }
  };

  const getCategoryInfo = (category: string) => {
    return reportCategories[category as keyof typeof reportCategories] || reportCategories.other;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'under_review':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'dismissed':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No reports in this category</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report: any) => {
        const categoryInfo = getCategoryInfo(report.category);
        
        return (
          <Card key={report.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6" onClick={() => onSelectReport(report)}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(report.status)}
                    <div className="flex items-center gap-2">
                      {getReportIcon(report.reportType)}
                      <span className="font-medium capitalize">{report.reportType} Report</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <categoryInfo.icon className={`w-4 h-4 ${categoryInfo.color}`} />
                      <span className="text-sm">{categoryInfo.label}</span>
                    </div>
                    <Badge 
                      variant="outline"
                      className={priorityColors[report.priority as keyof typeof priorityColors]}
                    >
                      {report.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {report.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Reported by: {report.reporterName}</span>
                    <span>•</span>
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    {report.reviewerName && (
                      <>
                        <span>•</span>
                        <span>Reviewed by: {report.reviewerName}</span>
                      </>
                    )}
                  </div>
                </div>

                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
