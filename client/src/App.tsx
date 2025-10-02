import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";
import ProtectedRoute from "@/components/ProtectedRoute";

// Configurar el base path para GitHub Pages
const basePath = import.meta.env.PROD ? "/withgex" : "";

function Router() {
  return (
    <WouterRouter base={basePath}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/admin-login" component={AdminLogin} />
        <Route path="/admin">
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
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
