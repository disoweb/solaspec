import React from "react";
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

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    requireAuth,
    logout,
  };
}