import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Marketplace from "@/pages/marketplace";
import VendorDashboard from "@/pages/vendor-dashboard";
import BuyerDashboard from "@/pages/buyer-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import Installers from "@/pages/installers";
import ProductDetails from "@/pages/product-details";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/marketplace" component={Marketplace} />
          <Route path="/installers" component={Installers} />
          <Route path="/products/:id" component={ProductDetails} />
          {user?.role === 'vendor' && (
            <Route path="/vendor-dashboard" component={VendorDashboard} />
          )}
          {user?.role === 'buyer' && (
            <Route path="/buyer-dashboard" component={BuyerDashboard} />
          )}
          {user?.role === 'admin' && (
            <Route path="/admin-dashboard" component={AdminDashboard} />
          )}
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
