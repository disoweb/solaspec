import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useAuth() {
  const [, setLocation] = useLocation();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response;
    },
    onSuccess: (userData) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Redirect based on user role
      const redirectPaths = {
        admin: "/admin-dashboard",
        vendor: "/vendor-dashboard", 
        trader: "/vendor-dashboard",
        installer: "/installer-dashboard",
        default: "/buyer-dashboard"
      };
      setLocation(redirectPaths[userData.role] || redirectPaths.default);
    },
    onError: (error) => {
      throw error;
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("/api/auth/logout", {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    },
    onError: () => {
      // Force logout even if API fails
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    },
  });

  const isAuthenticated = !!user && !error;

  const requireAuth = (requiredRole?: string) => {
    if (!isAuthenticated) {
      setLocation("/login");
      return false;
    }

    if (requiredRole && user?.role !== requiredRole) {
      setLocation("/");
      return false;
    }

    return true;
  };

  const login = async (email: string, password: string) => {
    return loginMutation.mutateAsync({ email, password });
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    requireAuth,
    login,
    logout,
  };
}