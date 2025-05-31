import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "./pages/home";
import Landing from "./pages/landing";
import Login from "./pages/login";
import Register from "./pages/register";
import Marketplace from "./pages/marketplace";
import ProductDetails from "./pages/product-details";
import BuyerDashboard from "./pages/buyer-dashboard";
import VendorDashboard from "./pages/vendor-dashboard";
import AdminDashboard from "./pages/admin-dashboard";
import Installers from "./pages/installers";
import NotFound from "./pages/not-found";
import "./index.css";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Switch>
            <Route path="/" component={Landing} />
            <Route path="/home" component={Home} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/marketplace" component={Marketplace} />
            <Route path="/product/:id" component={ProductDetails} />
            <Route path="/buyer-dashboard" component={BuyerDashboard} />
            <Route path="/vendor-dashboard" component={VendorDashboard} />
            <Route path="/admin-dashboard" component={AdminDashboard} />
            <Route path="/installers" component={Installers} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;