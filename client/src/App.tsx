import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Permissions from "@/pages/Permissions";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/permissions" component={Permissions} />
      {/* Placeholder for Settings */}
      <Route path="/settings" component={() => (
        <Permissions /> /* Re-using permissions for now as it's the main settings concern */
      )} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
