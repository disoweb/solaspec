import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, CheckCircle, Building, Calendar } from "lucide-react";

interface InstallerCardProps {
  installer: {
    id: number;
    userId: string;
    companyName: string;
    experience?: number;
    totalInstallations?: number;
    certifications?: string[];
    serviceAreas?: string[];
    availability?: string;
    rating?: string;
    totalReviews?: number;
    verified: boolean;
  };
  user?: {
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
}

export default function InstallerCard({ installer, user }: InstallerCardProps) {
  const rating = installer.rating ? parseFloat(installer.rating) : 4.8;
  const reviews = installer.totalReviews || 0;
  const experience = installer.experience || 0;
  const installations = installer.totalInstallations || 0;
  const serviceArea = installer.serviceAreas?.[0] || "Local Area";
  const availability = installer.availability 
    ? new Date(installer.availability).toLocaleDateString()
    : "Contact for availability";

  const defaultImage = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face";

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <img 
            src={user?.profileImageUrl || defaultImage}
            alt={`${user?.firstName} ${user?.lastName}` || installer.companyName}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-sm text-muted-foreground">{installer.companyName}</p>
            <div className="flex items-center space-x-1 mt-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-muted-foreground">
                {rating.toFixed(1)} ({reviews} reviews)
              </span>
              {installer.verified && (
                <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{serviceArea}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4" />
            <span>{experience} years experience</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Building className="w-4 h-4" />
            <span>{installations}+ installations</span>
          </div>
          
          {installer.certifications && installer.certifications.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {installer.certifications.slice(0, 2).map((cert, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {cert}
                </Badge>
              ))}
              {installer.certifications.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{installer.certifications.length - 2} more
                </Badge>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-foreground">Next Available:</span>
          <span className="text-sm text-green-600 font-medium flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {availability}
          </span>
        </div>
        
        <div className="flex space-x-3">
          <Button className="flex-1 bg-primary hover:bg-primary/90">
            Contact
          </Button>
          <Button variant="outline">
            Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
