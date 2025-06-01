
import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, 
  Zap, 
  ShoppingCart, 
  User, 
  LogOut, 
  BarChart3, 
  Package, 
  Settings, 
  Store, 
  Shield, 
  LayoutDashboard,
  Search,
  Bell,
  X
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";

export default function Header() {
  const [location, setLocation] = useLocation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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
    { name: "Categories", href: "/categories" },
    { name: "Learn", href: "#" },
  ];

  const getDashboardPath = () => {
    switch (user?.role) {
      case 'vendor':
        return '/vendor-dashboard';
      case 'admin':
        return '/admin-dashboard';
      case 'installer':
        return '/installer-dashboard';
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
      case 'installer':
        return <Package className="w-4 h-4" />;
      default:
        return <LayoutDashboard className="w-4 h-4" />;
    }
  };

  const getDashboardLabel = () => {
    switch (user?.role) {
      case 'vendor':
        return 'Vendor Hub';
      case 'admin':
        return 'Admin Panel';
      case 'installer':
        return 'Installer Portal';
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
    <>
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href={user ? "/" : "/"}>
              <div className="flex items-center space-x-2 cursor-pointer group">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center group-hover:from-blue-700 group-hover:to-blue-800 transition-colors">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Solaspec
                  </span>
                  <div className="text-xs text-muted-foreground font-medium">Solar Marketplace</div>
                </div>
              </div>
            </Link>

            {/* Desktop Search */}
            <div className="hidden lg:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search solar systems, vendors..."
                  className="pl-10 pr-4 bg-gray-50 border-gray-200 focus:bg-white"
                />
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <Button 
                    variant={location === item.href ? "default" : "ghost"}
                    size="sm"
                    className="font-medium"
                  >
                    {item.name}
                  </Button>
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              {/* Mobile Search */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="w-5 h-5" />
              </Button>

              {user ? (
                <>
                  {/* Notifications */}
                  <Button variant="ghost" size="sm" className="relative hidden sm:flex">
                    <Bell className="w-5 h-5" />
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      3
                    </Badge>
                  </Button>

                  {/* Cart Icon (for buyers) */}
                  {user?.role !== 'admin' && (
                    <Link href="/checkout">
                      <Button variant="ghost" size="sm" className="relative">
                        <ShoppingCart className="w-5 h-5" />
                        {cartItemCount > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                          >
                            {cartItemCount}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  )}

                  {/* Dashboard Link */}
                  <Link href={getDashboardPath()}>
                    <Button variant="outline" size="sm" className="hidden md:flex items-center space-x-2">
                      {getDashboardIcon()}
                      <span>{getDashboardLabel()}</span>
                    </Button>
                  </Link>

                  {/* User Avatar & Menu */}
                  <div className="hidden sm:flex items-center space-x-2">
                    {user?.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt={user.firstName || 'User'} 
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                    <div className="hidden lg:block">
                      <div className="text-sm font-medium text-foreground">
                        {user?.firstName || 'User'}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {user.role}
                      </Badge>
                    </div>
                  </div>

                  {/* Logout */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="hidden sm:flex"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button size="sm" asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                    <Link href="/register">Get Started</Link>
                  </Button>
                </>
              )}

              {/* Mobile Menu Toggle */}
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-0">
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-lg font-bold text-blue-600">Solaspec</span>
                        </div>
                      </div>
                      
                      {user && (
                        <div className="flex items-center space-x-3 mt-4 p-3 bg-gray-50 rounded-lg">
                          {user?.profileImageUrl ? (
                            <img 
                              src={user.profileImageUrl} 
                              alt={user.firstName || 'User'} 
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-600" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="font-medium text-foreground">
                              {user?.firstName} {user?.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">{user?.email}</div>
                            <Badge variant="secondary" className="text-xs mt-1">
                              {user.role}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 p-6">
                      <div className="space-y-2">
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
                            <div className="my-4 border-t"></div>

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
                              <Link href="/checkout">
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
                          </>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    {user && (
                      <div className="p-6 border-t">
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
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
          <div className="bg-white p-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search solar systems, vendors..."
                  className="pl-10 pr-4"
                  autoFocus
                />
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSearchOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
