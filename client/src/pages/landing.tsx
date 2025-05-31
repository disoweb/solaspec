import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Zap, Shield, Clock, CheckCircle, Users, Award, ArrowRight } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function Landing() {
  const featuredProducts = [
    {
      id: 1,
      name: "Premium 10kW Solar System",
      vendor: "SolarTech Solutions",
      price: "$25,000",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
      capacity: "10kW",
      installments: "$325/month",
      locations: "California"
    },
    {
      id: 2,
      name: "Commercial 50kW System",
      vendor: "GreenPower Industries",
      price: "$98,000",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop",
      capacity: "50kW",
      installments: "$1,350/month",
      locations: "Texas, Nevada"
    },
    {
      id: 3,
      name: "Compact 5kW System",
      vendor: "EcoSolar Pro",
      price: "$15,500",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400&h=300&fit=crop",
      capacity: "5kW",
      installments: "$202/month",
      locations: "Nationwide"
    }
  ];

  const installers = [
    {
      id: 1,
      name: "Mike Chen",
      company: "SolarPro Installations",
      rating: 4.9,
      reviews: 47,
      experience: 8,
      installations: 120,
      location: "San Francisco Bay Area",
      availability: "Dec 15, 2024",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      company: "EcoSolar Experts",
      rating: 5.0,
      reviews: 32,
      experience: 5,
      installations: 85,
      location: "Austin, Texas",
      availability: "Dec 8, 2024",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "David Rodriguez",
      company: "SunPower Solutions",
      rating: 4.8,
      reviews: 64,
      experience: 12,
      installations: 200,
      location: "Phoenix, Arizona",
      availability: "Jan 3, 2025",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    }
  ];

  const testimonials = [
    {
      name: "Jennifer Lee",
      title: "Homeowner",
      location: "Sacramento, CA",
      comment: "Solaspec made the entire process seamless. The escrow protection gave me peace of mind, and the installer they matched me with was professional and efficient. My energy bill dropped by 90%!",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
      savings: "$2,400/year saved",
      systemSize: "8.5kW system"
    },
    {
      name: "Marcus Thompson",
      title: "Business Owner",
      location: "Austin, TX", 
      comment: "As a business owner, I needed a reliable solar solution. The commercial system I purchased through Solaspec has exceeded expectations. ROI was achieved in just 5 years!",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=50&h=50&fit=crop&crop=face",
      savings: "$45,000/year saved",
      systemSize: "125kW system"
    },
    {
      name: "Lisa Chen",
      title: "Family of 4",
      location: "Denver, CO",
      comment: "The installment payment option made solar accessible for our family. The platform's transparency and the quality of vendors exceeded our expectations. Highly recommend!",
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=50&h=50&fit=crop&crop=face",
      savings: "$1,800/year saved",
      systemSize: "6.2kW system"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Trust Banner */}
      <section className="bg-green-50 border-b border-green-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-green-800">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span className="font-medium">SOC 2 Certified</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium hidden sm:inline">Better Business Bureau A+</span>
              <span className="font-medium sm:hidden">BBB A+</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span className="font-medium hidden sm:inline">NABCEP Certified Installers</span>
              <span className="font-medium sm:hidden">Certified</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="font-medium">10,000+ Customers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="solar-gradient py-8 sm:py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="animate-fade-in">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                  🏆 #1 Rated Solar Marketplace
                </Badge>
                <div className="flex items-center space-x-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-foreground">4.9/5</span>
                  <span className="text-sm text-muted-foreground">(2,847 reviews)</span>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  $2.4B+ Solar Systems Sold
                </Badge>
              </div>
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4 sm:mb-6">
                Verified Solar Systems with <span className="text-blue-600">Escrow Protection</span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8">
                Connect with certified vendors and installers. Shop with confidence using our secure escrow system and pay in flexible installments.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="solar-bg hover:bg-primary/90">
                  Explore Solar Systems
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button variant="outline" size="lg" className="solar-border solar-text hover:bg-accent">
                  Find Installers
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Verified Vendors</p>
                  <p className="text-xs text-muted-foreground">Licensed & Insured</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Escrow Protection</p>
                  <p className="text-xs text-muted-foreground">Secure Payments</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Zap className="w-6 h-6 text-yellow-600" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Fast Installation</p>
                  <p className="text-xs text-muted-foreground">30-Day Average</p>
                </div>
              </div>
            </div>
            
            <div className="relative animate-slide-up">
              <img 
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop" 
                alt="Modern house with solar panels" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-lg border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">$2,000 Saved</p>
                    <p className="text-sm text-muted-foreground">Annual Energy Cost</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Logos Section */}
      <section className="py-12 bg-card border-b">
        <div className="max-w-7xl mx-auto container-mobile">
          <div className="text-center mb-8">
            <p className="text-sm text-muted-foreground font-medium">TRUSTED BY LEADING ORGANIZATIONS</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-60">
            {[
              "Tesla Energy",
              "SunPower", 
              "Enphase",
              "LG Energy",
              "Canadian Solar",
              "First Solar"
            ].map((company, index) => (
              <div key={company} className="text-center">
                <div className="h-12 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-sm font-semibold text-muted-foreground">{company}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto container-mobile">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Featured Solar Systems</h2>
            <p className="text-xl text-muted-foreground">Top-rated systems from verified vendors</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-shadow animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="relative">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className="absolute top-4 left-4 bg-green-500 hover:bg-green-500">
                    Verified Vendor
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{product.name}</h3>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-muted-foreground">{product.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">by {product.vendor}</p>
                  <p className="text-foreground mb-4">Complete {product.capacity} system with high-efficiency panels and warranty.</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-foreground">{product.price}</span>
                      <span className="text-sm text-green-600 font-medium">30% Tax Credit Available</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Installments:</span> {product.installments} (30 months)
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>Available in {product.locations}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-6">
                    <Button className="flex-1 solar-bg hover:bg-primary/90">
                      Add to Cart
                    </Button>
                    <Button variant="outline">
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="solar-border solar-text hover:bg-accent">
              View All Products
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto container-mobile">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">How Solaspec Works</h2>
            <p className="text-xl text-muted-foreground">Simple, secure, and transparent solar purchasing</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Browse & Compare",
                description: "Explore verified solar systems from certified vendors with detailed specifications and reviews."
              },
              {
                step: "2", 
                title: "Secure Purchase",
                description: "Pay securely with escrow protection. Choose full payment or flexible installment plans."
              },
              {
                step: "3",
                title: "Find Installers", 
                description: "Get matched with certified installers in your area. View profiles, reviews, and availability."
              },
              {
                step: "4",
                title: "Installation & Support",
                description: "Professional installation with warranty support. Track progress and manage your system."
              }
            ].map((item, index) => (
              <div key={item.step} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="w-16 h-16 solar-bg rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Installer Network Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto container-mobile">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Certified Installer Network</h2>
            <p className="text-xl text-muted-foreground">Connect with verified professionals in your area</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {installers.map((installer, index) => (
              <Card key={installer.id} className="p-6 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex items-center space-x-4 mb-4">
                  <img 
                    src={installer.image} 
                    alt={installer.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{installer.name}</h3>
                    <p className="text-sm text-muted-foreground">{installer.company}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-muted-foreground">{installer.rating} ({installer.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="text-sm text-muted-foreground">
                    📍 {installer.location}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ✅ {installer.experience} years experience
                  </div>
                  <div className="text-sm text-muted-foreground">
                    🏠 {installer.installations}+ installations
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-foreground">Next Available:</span>
                  <span className="text-sm text-green-600 font-medium">{installer.availability}</span>
                </div>
                
                <div className="flex space-x-3">
                  <Button className="flex-1 solar-bg hover:bg-primary/90">
                    Contact
                  </Button>
                  <Button variant="outline">
                    Profile
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button className="solar-bg hover:bg-primary/90" size="lg">
              Find Installers Near You
            </Button>
          </div>
        </div>
      </section>

      {/* Security & Compliance Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto container-mobile">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Bank-Level Security & Compliance</h2>
            <p className="text-xl text-muted-foreground">Your data and transactions are protected by industry-leading security</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              {
                icon: Shield,
                title: "256-bit SSL Encryption",
                description: "Military-grade encryption protects all data transfers"
              },
              {
                icon: CheckCircle,
                title: "SOC 2 Type II Certified",
                description: "Independently audited security controls and processes"
              },
              {
                icon: Award,
                title: "PCI DSS Compliant",
                description: "Highest standard for payment card data security"
              },
              {
                icon: Users,
                title: "GDPR & CCPA Compliant",
                description: "Full compliance with privacy regulations"
              }
            ].map((item, index) => (
              <Card key={item.title} className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Payment & Escrow Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto container-mobile">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Secure Payment & Escrow Protection</h2>
            <p className="text-xl text-muted-foreground">Your investment is protected every step of the way</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {[
                {
                  icon: Shield,
                  title: "Escrow Protection",
                  description: "Your payment is held securely until installation is complete and approved. Funds are only released when you're satisfied.",
                  color: "green"
                },
                {
                  icon: Users,
                  title: "Flexible Payment Options", 
                  description: "Pay in full or choose installment plans. We support Paystack, cards, bank transfers, and digital wallets.",
                  color: "blue"
                },
                {
                  icon: Clock,
                  title: "Smart Installments",
                  description: "Spread payments over 24-84 months with competitive rates. No hidden fees, transparent pricing.",
                  color: "yellow"
                }
              ].map((feature, index) => (
                <div key={feature.title} className="flex items-start space-x-4 animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
                  <div className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Card className="p-8 bg-muted/30">
              <h3 className="text-xl font-semibold text-foreground mb-6">Payment Calculator</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">System Price</label>
                  <div className="text-2xl font-bold text-foreground">$25,000</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Payment Terms</label>
                  <div className="text-muted-foreground">36 months (30% fee)</div>
                </div>
                
                <Card className="p-4 bg-card border">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Base Price:</span>
                      <span className="font-semibold">$25,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Installment Fee:</span>
                      <span className="font-semibold text-orange-600">$7,500</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Tax Credit:</span>
                      <span className="font-semibold text-green-600">-$7,500</span>
                    </div>
                    <hr className="my-3"/>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-foreground">Total:</span>
                      <span className="text-lg font-bold text-foreground">$25,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Monthly Payment:</span>
                      <span className="text-xl font-bold solar-text">$417/month</span>
                    </div>
                  </div>
                </Card>
                
                <Button className="w-full solar-bg hover:bg-primary/90">
                  Apply for Financing
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto container-mobile">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            {[
              { number: "10,000+", label: "Solar Systems Installed" },
              { number: "$2.4B+", label: "Total Sales Volume" },
              { number: "99.8%", label: "Customer Satisfaction" },
              { number: "500+", label: "Certified Installers" }
            ].map((stat, index) => (
              <div key={stat.label} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-4xl lg:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto container-mobile">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">What Our Customers Say</h2>
            <p className="text-xl text-muted-foreground">Real experiences from satisfied solar system owners</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={testimonial.name} className="p-6 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">Verified Purchase</span>
                </div>
                <p className="text-foreground mb-4">"{testimonial.comment}"</p>
                <div className="bg-muted/50 p-3 rounded-lg mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Annual Savings:</span>
                    <span className="font-semibold text-green-600">{testimonial.savings}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">System Size:</span>
                    <span className="font-semibold">{testimonial.systemSize}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 solar-bg">
        <div className="max-w-7xl mx-auto container-mobile text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">Ready to Go Solar?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have made the switch to clean, affordable solar energy with Solaspec's trusted platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
              Browse Solar Systems
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              Become a Vendor
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
