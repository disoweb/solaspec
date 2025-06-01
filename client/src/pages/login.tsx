import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Zap, Eye, EyeOff, Shield } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check if this is admin login
  const urlParams = new URLSearchParams(window.location.search);
  const isAdminLogin = urlParams.get('admin') === 'true';

  useEffect(() => {
    if (user) {
      // Redirect based on user role
      switch (user.role) {
        case "admin":
          setLocation("/admin-dashboard");
          break;
        case "vendor":
          setLocation("/vendor-dashboard");
          break;
        case "installer":
          setLocation("/installer-dashboard");
          break;
        default:
          setLocation("/buyer-dashboard");
      }
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
    setError("");

    try {
      await login(email, password);
    } catch (e: any) {
      setError(e.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className={`w-8 h-8 ${isAdminLogin ? 'bg-red-600' : 'bg-primary'} rounded-lg flex items-center justify-center`}>
              {isAdminLogin ? (
                <Shield className="w-5 h-5 text-white" />
              ) : (
                <Zap className="w-5 h-5 text-primary-foreground" />
              )}
            </div>
            <span className="text-xl font-bold">Solaspec</span>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {isAdminLogin ? 'Admin Sign In' : 'Sign In'}
          </CardTitle>
          <CardDescription className="text-center">
            {isAdminLogin 
              ? 'Administrator access to the Solaspec platform'
              : 'Enter your credentials to access your account'
            }
          </CardDescription>
          {isAdminLogin && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-2">
              <p className="text-sm text-red-800">
                <strong>Demo Admin Access</strong><br />
                Email: admin@solaspec.com<br />
                Password: admin123
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mail@example.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                Signing in...
                <span className="ml-2 h-4 w-4 animate-spin">
                </span>
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}