import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, MapPin, Star } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import InstallerCard from "@/components/installer-card";

export default function Installers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(true);

  const { data: installers, isLoading } = useQuery({
    queryKey: ["/api/installers", { verified: verifiedOnly }],
    queryKey: [
      "/api/installers",
      verifiedOnly ? "?verified=true" : "",
    ].filter(Boolean).join(""),
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedLocation("");
    setVerifiedOnly(true);
  };

  // Filter installers based on search criteria
  const filteredInstallers = installers?.filter((installer: any) => {
    const matchesSearch = !searchTerm || 
      installer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (installer.serviceAreas && installer.serviceAreas.some((area: string) => 
        area.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    
    const matchesLocation = !selectedLocation || 
      (installer.serviceAreas && installer.serviceAreas.some((area: string) =>
        area.toLowerCase().includes(selectedLocation.toLowerCase())
      ));

    return matchesSearch && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="solar-gradient py-12">
        <div className="max-w-7xl mx-auto container-mobile">
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Certified Solar Installers
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Connect with verified professionals in your area
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-card border-b">
        <div className="max-w-7xl mx-auto container-mobile">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search installers or locations..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Locations</SelectItem>
                  <SelectItem value="california">California</SelectItem>
                  <SelectItem value="texas">Texas</SelectItem>
                  <SelectItem value="florida">Florida</SelectItem>
                  <SelectItem value="arizona">Arizona</SelectItem>
                  <SelectItem value="nevada">Nevada</SelectItem>
                  <SelectItem value="colorado">Colorado</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="verified"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="verified" className="text-sm font-medium">
                  Verified Only
                </label>
              </div>
              
              {(searchTerm || selectedLocation || !verifiedOnly) && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-8 bg-muted/30">
        <div className="max-w-7xl mx-auto container-mobile">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Verified Professionals</h3>
              <p className="text-sm text-muted-foreground">Licensed, insured, and background-checked</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Local Experts</h3>
              <p className="text-sm text-muted-foreground">Installers familiar with your area's requirements</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Badge className="w-6 h-6 bg-yellow-600" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Quality Guaranteed</h3>
              <p className="text-sm text-muted-foreground">Backed by reviews and warranty protection</p>
            </div>
          </div>
        </div>
      </section>

      {/* Installers Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto container-mobile">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {isLoading ? "Loading..." : `${filteredInstallers?.length || 0} Installers Found`}
              </h2>
              {(searchTerm || selectedLocation) && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {searchTerm && (
                    <Badge variant="secondary">
                      Search: {searchTerm}
                    </Badge>
                  )}
                  {selectedLocation && (
                    <Badge variant="secondary">
                      Location: {selectedLocation}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Installers Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredInstallers && filteredInstallers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInstallers.map((installer: any) => (
                <InstallerCard 
                  key={installer.id} 
                  installer={installer}
                  user={{
                    firstName: "Professional",
                    lastName: "Installer",
                    profileImageUrl: null
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Installers Found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or location filters
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear All Filters
              </Button>
            </div>
          )}

          {/* Call to Action */}
          {filteredInstallers && filteredInstallers.length > 0 && (
            <div className="text-center mt-12 p-8 bg-card rounded-lg border">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Need Help Choosing an Installer?
              </h3>
              <p className="text-muted-foreground mb-4">
                Our solar experts can help match you with the perfect installer for your needs.
              </p>
              <Button className="bg-primary hover:bg-primary/90">
                Get Expert Consultation
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
