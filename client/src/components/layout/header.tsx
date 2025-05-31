import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { 
  Zap, 
  Menu, 
  ShoppingCart, 
  User, 
  LogOut,
  LayoutDashboard,
  Store,
  Users,
  Shield
} from "lucide-react";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: cartItems } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const cartItemCount = cartItems?.length || 0;

  const navigation = [
    { name: "Marketplace", href: "/marketplace" },
    { name: "Installers", href: "/installers" },
    { name: "Learn", href: "#" },
    { name: "Support", href: "#" },
  ];

  const getDashboardPath = () => {
    switch (user?.role) {
      case 'vendor':
        return '/vendor-dashboard';
      case 'admin':
        return '/admin-dashboard';
      default:
        return '/buyer-dashboard';
    }
  };

  const getDashboardIcon = () => {
    switch (user?.role) {
      case 'vendor':
        return <Store className="w-4 h-4" />;
      case 'admin':
        return <Shield className="w-4 h-4" />;
      default:
        return <LayoutDashboard className="w-4 h-4" />;
    }
  };

  const getDashboardLabel = () => {
    switch (user?.role) {
      case 'vendor':
        return 'Vendor Dashboard';
      case 'admin':
        return 'Admin Dashboard';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={isAuthenticated ? "/" : "/"}>
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">SolarConnect</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <button 
                  className={`font-medium transition-colors ${
                    location === item.href 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  {item.name}
                </button>
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Cart Icon (for buyers) */}
                {user?.role !== 'admin' && (
                  <Link href="/cart">
                    <Button variant="ghost" size="sm" className="relative">
                      <ShoppingCart className="w-5 h-5" />
                      {cartItemCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {cartItemCount}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                )}

                {/* Dashboard Link */}
                <Link href={getDashboardPath()}>
                  <Button variant="ghost" size="sm" className="hidden md:flex items-center space-x-2">
                    {getDashboardIcon()}
                    <span>{getDashboardLabel()}</span>
                  </Button>
                </Link>

                {/* User Menu */}
                <div className="flex items-center space-x-2">
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt={user.firstName || 'User'} 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium text-foreground">
                    {user?.firstName || 'User'}
                  </span>
                  {user?.role && (
                    <Badge variant="secondary" className="hidden sm:block text-xs">
                      {user.role}
                    </Badge>
                  )}
                </div>

                {/* Logout */}
                <Button variant="ghost" size="sm" asChild>
                  <a href="/api/logout">
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:ml-2 sm:block">Logout</span>
                  </a>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <a href="/api/login">Sign In</a>
                </Button>
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <a href="/api/login">Join as Vendor</a>
                </Button>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  {/* Mobile Navigation */}
                  {navigation.map((item) => (
                    <Link key={item.name} href={item.href}>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Button>
                    </Link>
                  ))}

                  {isAuthenticated && (
                    <>
                      <hr className="my-4" />
                      
                      {/* Dashboard Link */}
                      <Link href={getDashboardPath()}>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {getDashboardIcon()}
                          <span className="ml-2">{getDashboardLabel()}</span>
                        </Button>
                      </Link>

                      {/* Cart (for buyers) */}
                      {user?.role !== 'admin' && (
                        <Link href="/cart">
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <ShoppingCart className="w-4 h-4" />
                            <span className="ml-2">Cart ({cartItemCount})</span>
                          </Button>
                        </Link>
                      )}

                      <hr className="my-4" />

                      {/* User Info */}
                      <div className="flex items-center space-x-3 px-3 py-2">
                        {user?.profileImageUrl ? (
                          <img 
                            src={user.profileImageUrl} 
                            alt={user.firstName || 'User'} 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-foreground">
                            {user?.firstName} {user?.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">{user?.email}</div>
                          {user?.role && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {user.role}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Button variant="outline" className="w-full" asChild>
                        <a href="/api/logout">
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </a>
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
