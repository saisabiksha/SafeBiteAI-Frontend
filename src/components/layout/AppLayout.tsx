import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, ShieldCheck, Bell, ShieldAlert } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children?: React.ReactNode;
}

const getPageTitle = (pathname: string): { title: string; subtitle: string } => {
  switch (pathname) {
    case '/':
      return {
        title: 'Safety Dashboard',
        subtitle: 'Overview of your food safety status and wellness metrics',
      };
    case '/food-checker':
      return {
        title: 'Food Checker',
        subtitle: 'Scan ingredients or labels to detect allergen risks instantly',
      };
    case '/exposure-assistant':
      return {
        title: 'Exposure Assistant',
        subtitle: 'Emergency action steps and reaction tracking guidance',
      };
    case '/allergies':
      return {
        title: 'My Allergies',
        subtitle: 'Manage your verified allergens, severities, and symptoms',
      };
    case '/wellness':
      return {
        title: 'Wellness & Nutrition',
        subtitle: 'Daily routines, gut health, and mindful eating habits',
      };
    case '/reminders':
      return {
        title: 'Safety Reminders',
        subtitle: 'Medication alerts, EpiPen expiry tracking, and daily check-ins',
      };
    case '/profile':
      return {
        title: 'User Profile',
        subtitle: 'Personal details, medical emergency contacts, and diet preferences',
      };
    default:
      return {
        title: 'SafeBiteAI',
        subtitle: 'Food safety and personal wellness assistant',
      };
  }
};

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const pageInfo = getPageTitle(location.pathname);

  // Handle escape key to close mobile drawer
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-slate-50/50 text-navy-900 flex flex-col font-sans antialiased">
      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-slate-200/90 px-4 py-3 flex items-center justify-between shadow-subtle">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-accent-subtle border border-teal-accent-border flex items-center justify-center text-teal-accent">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="font-bold text-navy-950 text-base">SafeBiteAI</span>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-xl text-navy-700 hover:text-navy-950 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          aria-label="Open navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-navy-950/30 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div className="relative flex flex-col w-full max-w-xs bg-white shadow-card-lg z-10 animate-in slide-in-from-left duration-200">
            <Sidebar
              isMobileDrawer
              onCloseMobile={() => setMobileMenuOpen(false)}
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop Main Shell */}
      <div className="flex-1 flex w-full">
        {/* Stable Left Desktop Sidebar */}
        <div className="hidden lg:block shrink-0 sticky top-0 h-screen">
          <Sidebar />
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Desktop Top Header Bar */}
          <header className="hidden lg:flex sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 px-8 items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-navy-950 tracking-tight">
                {pageInfo.title}
              </h1>
              <p className="text-xs text-navy-500">
                {pageInfo.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Emergency Quick Action Pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-accent-subtle border border-teal-accent-border text-teal-accent text-xs font-semibold">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Allergen Shield Active</span>
              </div>

              {/* Notification Indicator */}
              <button
                type="button"
                className="p-2 rounded-xl text-navy-600 hover:text-navy-950 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 relative"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-accent" />
              </button>
            </div>
          </header>

          {/* Main Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
