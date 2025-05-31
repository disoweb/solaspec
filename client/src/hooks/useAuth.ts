import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

export function useAuth() {
  const [, setLocation] = useLocation();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
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

  return {
    user,
    isAuthenticated,
    isLoading,
    requireAuth,
  };
}