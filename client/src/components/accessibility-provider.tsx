import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AccessibilityContextType {
  highContrast: boolean;
  toggleHighContrast: () => void;
  announceToScreenReader: (message: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [highContrast, setHighContrast] = useState(false);
  const [liveRegion, setLiveRegion] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create ARIA live region for screen reader announcements
    const region = document.createElement('div');
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    document.body.appendChild(region);
    setLiveRegion(region);

    // Load high contrast preference
    const stored = localStorage.getItem('high-contrast');
    if (stored === 'true') {
      setHighContrast(true);
      document.documentElement.classList.add('high-contrast');
    }

    return () => {
      if (region && document.body.contains(region)) {
        document.body.removeChild(region);
      }
    };
  }, []);

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    
    if (newValue) {
      document.documentElement.classList.add('high-contrast');
      localStorage.setItem('high-contrast', 'true');
      announceToScreenReader('High contrast mode enabled');
    } else {
      document.documentElement.classList.remove('high-contrast');
      localStorage.setItem('high-contrast', 'false');
      announceToScreenReader('High contrast mode disabled');
    }
  };

  const announceToScreenReader = (message: string) => {
    if (liveRegion) {
      liveRegion.textContent = message;
      // Clear after announcement
      setTimeout(() => {
        if (liveRegion) {
          liveRegion.textContent = '';
        }
      }, 1000);
    }
  };

  return (
    <AccessibilityContext.Provider 
      value={{ 
        highContrast, 
        toggleHighContrast, 
        announceToScreenReader 
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}
