import { Link, useLocation } from "wouter";
import { useAccessibility } from "./accessibility-provider";
import { Button } from "@/components/ui/button";
import { Leaf, Contrast, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navigation() {
  const [location] = useLocation();
  const { toggleHighContrast } = useAccessibility();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/quotes", label: "Quotes" },
    { path: "/customers", label: "Customers" },
    { path: "/reports", label: "Reports" },
  ];

  const isActive = (path: string) => {
    return location === path || (path === "/dashboard" && location === "/");
  };

  return (
    <header className="bg-white dark:bg-card shadow-sm border-b border-border" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Leaf className="text-primary text-2xl mr-3" aria-hidden="true" />
              <h1 className="text-xl font-semibold text-foreground">Clean Cut Yard Works</h1>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8" role="navigation" aria-label="Main navigation">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`px-1 pt-1 pb-4 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 border-b-2 ${
                  isActive(item.path)
                    ? "text-primary border-primary"
                    : "text-muted-foreground hover:text-primary border-transparent"
                }`}
                aria-current={isActive(item.path) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {/* High Contrast Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleHighContrast}
              className="p-2 rounded-md text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Toggle high contrast mode"
            >
              <Contrast className="h-5 w-5" aria-hidden="true" />
            </Button>
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
            
            {/* User Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="User menu"
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                  JD
                </div>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <nav className="px-2 pt-2 pb-3 space-y-1" role="navigation" aria-label="Mobile navigation">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    isActive(item.path)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  }`}
                  aria-current={isActive(item.path) ? "page" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
