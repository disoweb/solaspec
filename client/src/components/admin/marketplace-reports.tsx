
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, ShoppingBag, DollarSign, Download, Calendar, Filter } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function MarketplaceReports() {
  const [timeRange, setTimeRange] = useState("30");
  const [reportType, setReportType] = useState("overview");

  const { data: reportData, isLoading } = useQuery({
    queryKey: ["/api/admin/reports", { timeRange, reportType }],
  });

  const { data: registrationData } = useQuery({
    queryKey: ["/api/admin/reports/registrations", { timeRange }],
  });

  const { data: salesData } = useQuery({
    queryKey: ["/api/admin/reports/sales", { timeRange }],
  });

  const { data: vendorPerformance } = useQuery({
    queryKey: ["/api/admin/reports/vendor-performance", { timeRange }],
  });

  const { data: commissionData } = useQuery({
    queryKey: ["/api/admin/reports/commissions", { timeRange }],
  });

  const exportReport = (format: string) => {
    const data = {
      overview: reportData,
      registrations: registrationData,
      sales: salesData,
      vendorPerformance,
      commissions: commissionData,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marketplace-report-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-8 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Marketplace Reports</h2>
          <p className="text-muted-foreground">Comprehensive analytics and insights</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => exportReport('json')}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${reportData?.totalRevenue?.toLocaleString() || '0'}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+{reportData?.revenueGrowth || 0}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Users</p>
                <p className="text-2xl font-bold">{reportData?.newUsers?.toLocaleString() || '0'}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-blue-600 mr-1" />
              <span className="text-sm text-blue-600">+{reportData?.userGrowth || 0}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{reportData?.totalOrders?.toLocaleString() || '0'}</p>
              </div>
              <ShoppingBag className="w-8 h-8 text-purple-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-purple-600 mr-1" />
              <span className="text-sm text-purple-600">+{reportData?.orderGrowth || 0}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Commission Earned</p>
                <p className="text-2xl font-bold">${reportData?.totalCommission?.toLocaleString() || '0'}</p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-orange-600 mr-1" />
              <span className="text-sm text-orange-600">+{reportData?.commissionGrowth || 0}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="registrations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
          <TabsTrigger value="sales">Sales & Orders</TabsTrigger>
          <TabsTrigger value="vendors">Vendor Performance</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
        </TabsList>

        <TabsContent value="registrations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>New Registrations Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={registrationData?.timeline || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="buyers" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="vendors" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="installers" stroke="#ffc658" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Registration Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={registrationData?.distribution || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(registrationData?.distribution || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData?.timeline || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#8884d8" />
                    <Bar dataKey="revenue" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Product Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(salesData?.topCategories || []).map((category: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge>{category.name}</Badge>
                        <span className="text-sm">{category.orders} orders</span>
                      </div>
                      <span className="font-semibold">${category.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(vendorPerformance?.topVendors || []).map((vendor: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-semibold">
                        {vendor.companyName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{vendor.companyName}</p>
                        <p className="text-sm text-muted-foreground">
                          {vendor.totalOrders} orders • {vendor.totalProducts} products
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${vendor.totalRevenue?.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        Commission: ${vendor.totalCommission?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Commission Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={commissionData?.timeline || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="commission" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Commission Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Commission Earned</span>
                  <span className="font-semibold">${commissionData?.total?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Commission Rate</span>
                  <span className="font-semibold">{commissionData?.averageRate || '0'}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Top Commission Vendor</span>
                  <span className="font-semibold">{commissionData?.topVendor || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>This Month</span>
                  <span className="font-semibold">${commissionData?.thisMonth?.toLocaleString() || '0'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
