import React from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import Layout from "./components/layout/header";
import Home from "./pages/home";
import Landing from "./pages/landing";
import Login from "./pages/login";
import Register from "./pages/register";
import Marketplace from "./pages/marketplace";
import Categories from "./pages/categories";
import ProductDetails from "./pages/product-details";
import BuyerDashboard from "./pages/buyer-dashboard";
import VendorDashboard from "./pages/vendor-dashboard";
import AdminDashboard from "./pages/admin-dashboard";
import Installers from "./pages/installers";
import Checkout from "./pages/checkout";
import OrderConfirmation from "./pages/order-confirmation";
import NotFound from "./pages/not-found";
import "./index.css";
import InstallerDashboard from "./pages/installer-dashboard";

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            <Switch>
              <Route path="/" component={Landing} />
              <Route path="/home" component={Home} />
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
              <Route path="/marketplace" component={Marketplace} />
              <Route path="/buyer-dashboard" component={BuyerDashboard} />
              <Route path="/categories" component={Categories} />
              <Route path="/product/:id" component={ProductDetails} />
              <Route path="/installers" component={Installers} />
              <Route path="/checkout" component={Checkout} />
              <Route path="/order-confirmation/:orderId" component={OrderConfirmation} />
              <Route path="/admin-dashboard" component={AdminDashboard} />
              <Route path="/vendor-dashboard" component={VendorDashboard} />
              <Route path="/installer-dashboard" component={InstallerDashboard} />
              <Route component={NotFound} />
            </Switch>
            <Toaster />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;