
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Zap, ShoppingCart, User, LogOut, BarChart3, Package, Settings, Store, Shield, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Header() {
  const [location, setLocation] = useLocation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { toast } = useToast();
  const { user, logout } = useAuth();

  const { data: cartItems } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("/api/auth/logout", { method: "POST" }),
    onSuccess: () => {
      logout();
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Logged out successfully",
      });
    },
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

  const handleLogout = async () => {
    try {
      logoutMutation.mutate();
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Logout failed",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={user ? "/" : "/"}>
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-blue-600">Solaspec</span>
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
            {user ? (
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:ml-2 sm:block">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link href="/register">Join as Vendor</Link>
                </Button>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
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
                        onClick={() => setIsSheetOpen(false)}
                      >
                        {item.name}
                      </Button>
                    </Link>
                  ))}

                  {user && (
                    <>
                      <hr className="my-4" />

                      {/* Dashboard Link */}
                      <Link href={getDashboardPath()}>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start"
                          onClick={() => setIsSheetOpen(false)}
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
                            onClick={() => setIsSheetOpen(false)}
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

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          handleLogout();
                          setIsSheetOpen(false);
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
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
