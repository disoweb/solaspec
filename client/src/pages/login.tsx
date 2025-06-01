import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Zap, Eye, EyeOff, Shield, Loader2 } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  // Get search params from URL
  const urlParams = new URLSearchParams(window.location.search);
  const isAdminLogin = urlParams.get('admin') === 'true';
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if this is admin login


  useEffect(() => {
    if (user) {
      // Redirect based on user role
      const redirectPaths = {
        admin: "/admin-dashboard",
        vendor: "/vendor-dashboard",
        installer: "/installer-dashboard",
        default: "/buyer-dashboard"
      };
      setLocation(redirectPaths[user.role] || redirectPaths.default);
    }
  }, [user, setLocation]);

  // Pre-fill admin credentials if admin login
  useEffect(() => {
    if (isAdminLogin) {
      setEmail("admin@solaspec.com");
      setPassword("admin123");
    }
  }, [isAdminLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsAnimating(true);
    setError("");

    try {
      await login(email, password);
    } catch (e: any) {
      setError(e.message || "Login failed. Please check your credentials.");
      setIsAnimating(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-4">
        <Card className="w-full shadow-lg border-0">
          <CardHeader className="space-y-1 px-6 pt-8 pb-4">
            <div className="flex flex-col items-center">
              <div className={`w-14 h-14 ${isAdminLogin ? 'bg-red-600' : 'bg-primary'} rounded-xl flex items-center justify-center mb-3 transition-all duration-300 ${isAnimating ? 'scale-110' : ''}`}>
                {isAdminLogin ? (
                  <Shield className="w-6 h-6 text-white" />
                ) : (
                  <Zap className="w-6 h-6 text-primary-foreground" />
                )}
              </div>
              <div className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {isAdminLogin ? 'Admin Portal' : 'Welcome Back'}
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  {isAdminLogin 
                    ? 'Secure access to the admin dashboard'
                    : 'Sign in to manage your solar solutions'
                  }
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-8">
            {isAdminLogin && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4 text-sm text-red-800">
                <p className="font-medium">Demo Admin Credentials</p>
                <p>Email: admin@solaspec.com</p>
                <p>Password: admin123</p>
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription className="flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="h-11 focus-visible:ring-primary/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-gray-700">Password</Label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 pr-10 focus-visible:ring-primary/50"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                    <span className="sr-only">Toggle password visibility</span>
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              {!isAdminLogin && (
                <div className="text-center text-sm text-gray-600 mt-4">
                  Don't have an account?{" "}
                  <Link 
                    to="/register" 
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Create one
                  </Link>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}