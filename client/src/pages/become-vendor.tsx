
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import VendorRegistrationForm from "@/components/vendor/vendor-registration-form";
import { 
  CheckCircle, 
  DollarSign, 
  Users, 
  BarChart3, 
  Shield, 
  Truck,
  Star,
  Globe,
  Zap,
  TrendingUp
} from "lucide-react";

const benefits = [
  {
    icon: DollarSign,
    title: "Competitive Commission Structure",
    description: "Keep 90% of your sales with our low 10% commission rate"
  },
  {
    icon: Users,
    title: "Access to Thousands of Customers",
    description: "Reach buyers actively searching for solar solutions"
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics Dashboard",
    description: "Track sales, inventory, and performance metrics in real-time"
  },
  {
    icon: Shield,
    title: "Secure Payment Processing",
    description: "Fast, secure payments with escrow protection"
  },
  {
    icon: Truck,
    title: "Integrated Shipping Solutions",
    description: "Streamlined logistics and shipping management"
  },
  {
    icon: Globe,
    title: "Marketing Support",
    description: "Featured listings and promotional opportunities"
  }
];

const features = [
  "Product catalog management",
  "Inventory tracking and alerts",
  "Order management system",
  "Customer communication tools",
  "Sales reporting and analytics",
  "Bulk import/export tools",
  "Multi-channel integration",
  "24/7 support"
];

const steps = [
  {
    step: 1,
    title: "Submit Application",
    description: "Complete our comprehensive vendor registration form with your business details"
  },
  {
    step: 2,
    title: "Document Review",
    description: "Our team reviews your business license, certifications, and credentials"
  },
  {
    step: 3,
    title: "Approval Process",
    description: "Get approved within 2-3 business days and receive your vendor dashboard access"
  },
  {
    step: 4,
    title: "Start Selling",
    description: "Upload your products, set up inventory, and start reaching customers"
  }
];

export default function BecomeVendor() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <span className="text-4xl font-bold text-blue-600">Solaspec</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Become a Vendor
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join thousands of solar professionals growing their business on our marketplace.
              Reach more customers, increase sales, and scale your solar business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Start Your Application
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">500+</div>
              <div className="text-gray-600">Active Vendors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">$2.5M+</div>
              <div className="text-gray-600">Monthly Sales</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">10,000+</div>
              <div className="text-gray-600">Active Buyers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">98%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Sell on Solaspec?</h2>
            <p className="text-xl text-gray-600">Everything you need to grow your solar business</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <benefit.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg">{benefit.title}</h3>
                  </div>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get started in just a few simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">{step.step}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Powerful Tools for Your Business
              </h2>
              <p className="text-gray-600 mb-8">
                Our comprehensive vendor dashboard provides everything you need to manage
                and grow your solar business effectively.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-xl font-semibold mb-6 text-center">Vendor Dashboard Preview</h3>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Monthly Sales</span>
                    <span className="text-green-600 font-bold">$45,230</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Orders</span>
                    <span className="text-blue-600 font-bold">186</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Active Products</span>
                    <span className="text-purple-600 font-bold">42</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Customer Rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-bold">4.8</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Commission Structure */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Simple, fair pricing that grows with your business</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-blue-200">
              <CardHeader className="text-center">
                <Badge className="mx-auto mb-4 bg-blue-600">Most Popular</Badge>
                <CardTitle className="text-2xl">Standard Plan</CardTitle>
                <div className="text-4xl font-bold text-blue-600 mt-4">
                  10%
                  <span className="text-lg font-normal text-gray-600 ml-2">commission</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-semibold">No Setup Fees</h4>
                    <p className="text-sm text-gray-600">Get started for free</p>
                  </div>
                  <div>
                    <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-semibold">Weekly Payouts</h4>
                    <p className="text-sm text-gray-600">Fast payment processing</p>
                  </div>
                  <div>
                    <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-semibold">Secure Transactions</h4>
                    <p className="text-sm text-gray-600">Escrow protection</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section id="register" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-gray-600">Complete your vendor application below</p>
          </div>

          <VendorRegistrationForm />
        </div>
      </section>

      <Footer />
    </div>
  );
}
