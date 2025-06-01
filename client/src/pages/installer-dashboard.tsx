
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  TrendingUp, 
  Users, 
  Star,
  Settings,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Wrench,
  DollarSign,
  FileText,
  Award,
  Play,
  Pause,
  Check
} from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function InstallerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: installer } = useQuery({
    queryKey: ["/api/installers/profile"],
    enabled: !!user,
  });

  const { data: orders } = useQuery({
    queryKey: ["/api/orders"],
    enabled: !!installer?.id,
  });

  const { data: milestones } = useQuery({
    queryKey: ["/api/milestones"],
    enabled: !!installer?.id,
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest("PUT", `/api/milestones/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
      toast({
        title: "Milestone Updated",
        description: "Milestone status has been updated successfully.",
      });
    },
  });

  // Redirect if not installer
  if (user?.role !== 'installer') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto container-mobile py-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Installer Access Required</h3>
              <p className="text-muted-foreground mb-4">
                You need installer privileges to access this dashboard.
              </p>
              <Button asChild>
                <Link href="/">Go Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const stats = {
    totalJobs: orders?.length || 0,
    completedJobs: orders?.filter((o: any) => o.status === 'completed').length || 0,
    activeJobs: orders?.filter((o: any) => ['installing', 'in_progress'].includes(o.status)).length || 0,
    pendingJobs: orders?.filter((o: any) => o.status === 'pending').length || 0,
    totalEarnings: milestones?.reduce((acc: number, milestone: any) => {
      return acc + (milestone.status === 'completed' ? parseFloat(milestone.amount || 0) : 0);
    }, 0) || 0,
    pendingPayments: milestones?.reduce((acc: number, milestone: any) => {
      return acc + (milestone.status === 'verified' ? parseFloat(milestone.amount || 0) : 0);
    }, 0) || 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto container-mobile py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Installer Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {installer?.companyName || user?.firstName}! Manage your installations and milestones.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalJobs}</p>
                </div>
                <Wrench className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.activeJobs}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedJobs}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-600">${stats.totalEarnings.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Active Jobs */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders?.filter((order: any) => ['installing', 'in_progress'].includes(order.status)).slice(0, 5).map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{order.productName}</p>
                          <p className="text-sm text-muted-foreground">{order.customerName}</p>
                        </div>
                        <Badge variant="secondary">
                          {order.status}
                        </Badge>
                      </div>
                    ))}
                    {orders?.filter((order: any) => ['installing', 'in_progress'].includes(order.status)).length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No active jobs</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Milestones */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {milestones?.filter((m: any) => ['pending', 'in_progress'].includes(m.status)).slice(0, 5).map((milestone: any) => (
                      <div key={milestone.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{milestone.name}</p>
                          <p className="text-sm text-muted-foreground">${milestone.amount}</p>
                        </div>
                        <Badge variant={milestone.status === 'in_progress' ? 'secondary' : 'outline'}>
                          {milestone.percentage}%
                        </Badge>
                      </div>
                    ))}
                    {milestones?.filter((m: any) => ['pending', 'in_progress'].includes(m.status)).length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No upcoming milestones</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Earnings Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Earnings Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">${stats.totalEarnings.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Earned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">${stats.pendingPayments.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Pending Release</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{installer?.rating || "4.8"}</div>
                    <div className="text-sm text-muted-foreground">Average Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Installation Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders?.map((order: any) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{order.productName}</h3>
                        <Badge variant={
                          order.status === 'completed' ? 'default' : 
                          order.status === 'installing' ? 'secondary' : 'outline'
                        }>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Customer</p>
                          <p>{order.customerName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Order Value</p>
                          <p>${parseFloat(order.totalAmount).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Order Date</p>
                          <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Progress</p>
                          <Progress value={order.status === 'completed' ? 100 : order.status === 'installing' ? 50 : 0} className="w-full" />
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!orders || orders.length === 0) && (
                    <div className="text-center py-8">
                      <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No installation jobs yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Installation Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {milestones?.map((milestone: any) => (
                    <div key={milestone.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{milestone.name}</h3>
                        <Badge variant={
                          milestone.status === 'completed' ? 'default' : 
                          milestone.status === 'in_progress' ? 'secondary' : 
                          milestone.status === 'verified' ? 'default' : 'outline'
                        }>
                          {milestone.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{milestone.description}</p>
                      
                      <div className="grid md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-muted-foreground">Payment Amount</p>
                          <p className="font-medium text-green-600">${milestone.amount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Percentage</p>
                          <p className="font-medium">{milestone.percentage}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Due Date</p>
                          <p>{new Date(milestone.dueDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Order ID</p>
                          <p>#{milestone.orderId?.slice(0, 8)}</p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        {milestone.status === 'pending' && (
                          <Button 
                            size="sm"
                            onClick={() => updateMilestoneMutation.mutate({ id: milestone.id, status: 'in_progress' })}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Start Work
                          </Button>
                        )}
                        {milestone.status === 'in_progress' && (
                          <Button 
                            size="sm"
                            onClick={() => updateMilestoneMutation.mutate({ id: milestone.id, status: 'completed' })}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Mark Complete
                          </Button>
                        )}
                        {milestone.status === 'completed' && (
                          <Badge variant="default" className="flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>Awaiting Verification</span>
                          </Badge>
                        )}
                        {milestone.status === 'verified' && (
                          <Badge variant="default" className="flex items-center space-x-1">
                            <DollarSign className="w-3 h-3" />
                            <span>Payment Released</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!milestones || milestones.length === 0) && (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No milestones yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {milestones?.filter((m: any) => m.status === 'verified').map((milestone: any) => (
                      <div key={milestone.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{milestone.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {milestone.verifiedAt ? new Date(milestone.verifiedAt).toLocaleDateString() : 'Pending'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">${milestone.amount}</p>
                          <Badge variant="default">Paid</Badge>
                        </div>
                      </div>
                    ))}
                    {milestones?.filter((m: any) => m.status === 'verified').length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No payments received yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {milestones?.filter((m: any) => m.status === 'completed').map((milestone: any) => (
                      <div key={milestone.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{milestone.name}</p>
                          <p className="text-sm text-muted-foreground">Awaiting customer verification</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-600">${milestone.amount}</p>
                          <Badge variant="secondary">Pending</Badge>
                        </div>
                      </div>
                    ))}
                    {milestones?.filter((m: any) => m.status === 'completed').length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No pending payments</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Installer Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Company Name</Label>
                      <Input defaultValue={installer?.companyName || ''} />
                    </div>
                    <div>
                      <Label>Experience (Years)</Label>
                      <Input defaultValue={installer?.experience || ''} />
                    </div>
                  </div>
                  <div>
                    <Label>Service Areas</Label>
                    <Input defaultValue={installer?.serviceAreas?.join(', ') || ''} />
                  </div>
                  <div>
                    <Label>Certifications</Label>
                    <Textarea defaultValue={installer?.certifications?.join('\n') || ''} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Total Installations</Label>
                      <Input defaultValue={installer?.totalInstallations || '0'} disabled />
                    </div>
                    <div>
                      <Label>Rating</Label>
                      <Input defaultValue={installer?.rating || '0'} disabled />
                    </div>
                  </div>
                  <Button>Update Profile</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certifications & Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium">Certified Installer</h4>
                    <p className="text-sm text-muted-foreground">NABCEP Certified</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <h4 className="font-medium">Top Rated</h4>
                    <p className="text-sm text-muted-foreground">4.8+ Rating</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-medium">Verified</h4>
                    <p className="text-sm text-muted-foreground">Background Checked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
