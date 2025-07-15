import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AccessibilityProvider } from "@/components/accessibility-provider";
import { Navigation } from "@/components/navigation";
import Dashboard from "@/pages/dashboard";
import QuoteRequest from "@/pages/quote-request";
import QuoteManagement from "@/pages/quote-management";
import Customers from "@/pages/customers";
import CalendarPage from "@/pages/calendar";
import Reports from "@/pages/reports";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/quote-request" component={QuoteRequest} />
      <Route path="/quotes" component={QuoteManagement} />
      <Route path="/customers" component={Customers} />
      <Route path="/calendar" component={CalendarPage} />
      <Route path="/reports" component={Reports} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-neutral-100 dark:bg-background">
            {/* Skip to main content link */}
            <a 
              href="#main-content" 
              className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
            >
              Skip to main content
            </a>
            
            <Navigation />
            
            <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
              <Router />
            </main>
            
            <footer className="bg-white dark:bg-card border-t border-border mt-16" role="contentinfo">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center text-sm text-muted-foreground">
                  <p>&copy; 2024 Clean Cut Yard Works. All rights reserved.</p>
                  <p className="mt-2">Professional landscaping management system with accessibility features.</p>
                </div>
              </div>
            </footer>
          </div>
          <Toaster />
        </TooltipProvider>
      </AccessibilityProvider>
    </QueryClientProvider>
  );
}

export default App;
