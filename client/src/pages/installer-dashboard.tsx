
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, queryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Wrench
} from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function InstallerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
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
    pendingJobs: orders?.filter((o: any) => ['installing', 'pending'].includes(o.status)).length || 0,
    totalEarnings: orders?.reduce((acc: number, order: any) => {
      return acc + (order.status === 'completed' ? parseFloat(order.installationFee || 0) : 0);
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
        <div className="grid md:grid-cols-4 gap-6 mb-8">
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
                  <p className="text-sm font-medium text-muted-foreground">Pending Jobs</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingJobs}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
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
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Jobs */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders?.slice(0, 5).map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{order.productName}</p>
                          <p className="text-sm text-muted-foreground">{order.customerName}</p>
                        </div>
                        <Badge variant={
                          order.status === 'completed' ? 'default' : 
                          order.status === 'installing' ? 'secondary' : 'outline'
                        }>
                          {order.status}
                        </Badge>
                      </div>
                    ))}
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
                    {milestones?.filter((m: any) => m.status === 'pending').slice(0, 5).map((milestone: any) => (
                      <div key={milestone.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{milestone.name}</p>
                          <p className="text-sm text-muted-foreground">${milestone.amount}</p>
                        </div>
                        <Badge variant="outline">
                          {milestone.percentage}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
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
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Customer</p>
                          <p>{order.customerName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Installation Fee</p>
                          <p>${order.installationFee}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Due Date</p>
                          <p>{new Date(order.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
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
                          milestone.status === 'in_progress' ? 'secondary' : 'outline'
                        }>
                          {milestone.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Amount</p>
                          <p>${milestone.amount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Percentage</p>
                          <p>{milestone.percentage}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Due Date</p>
                          <p>{new Date(milestone.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {milestone.status === 'pending' && (
                        <div className="mt-4">
                          <Button size="sm">Mark as In Progress</Button>
                        </div>
                      )}
                      {milestone.status === 'in_progress' && (
                        <div className="mt-4">
                          <Button size="sm">Mark as Completed</Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
                      <Input value={installer?.companyName || ''} />
                    </div>
                    <div>
                      <Label>Experience (Years)</Label>
                      <Input value={installer?.experience || ''} />
                    </div>
                  </div>
                  <div>
                    <Label>Service Areas</Label>
                    <Input value={installer?.serviceAreas?.join(', ') || ''} />
                  </div>
                  <div>
                    <Label>Certifications</Label>
                    <Textarea value={installer?.certifications?.join('\n') || ''} />
                  </div>
                  <Button>Update Profile</Button>
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
