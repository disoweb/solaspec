
import { Link } from "wouter";
import { Shield, HelpCircle, FileText, Heart } from "lucide-react";

export default function DashboardFooter() {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          {/* Left side - Links */}
          <div className="flex items-center space-x-6 text-sm">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors flex items-center">
              <HelpCircle className="w-4 h-4 mr-1" />
              Help Center
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors flex items-center">
              <Shield className="w-4 h-4 mr-1" />
              Privacy
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              Terms
            </Link>
          </div>

          {/* Right side - Copyright */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>&copy; {new Date().getFullYear()} Solaspec</span>
            <Heart className="w-3 h-3 text-red-500" />
            <span>Solar Marketplace</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
