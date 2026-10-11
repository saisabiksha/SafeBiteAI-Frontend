import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ScanLine,
  ShieldAlert,
  HeartPulse,
  Sparkles,
  Bell,
  User,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAllergies } from '../../context';

export interface NavItem {
  name: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: 'teal' | 'blue' | 'amber';
}

const navigationItems: NavItem[] = [
  {
    name: 'Dashboard',
    to: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Food Checker',
    to: '/food-checker',
    icon: ScanLine,
    badge: 'AI Scan',
    badgeVariant: 'teal',
  },
  {
    name: 'Exposure Assistant',
    to: '/exposure-assistant',
    icon: ShieldAlert,
  },
  {
    name: 'My Allergies',
    to: '/allergies',
    icon: HeartPulse,
    badge: '3 Active',
    badgeVariant: 'blue',
  },
  {
    name: 'Wellness',
    to: '/wellness',
    icon: Sparkles,
  },
  {
    name: 'Reminders',
    to: '/reminders',
    icon: Bell,
  },
  {
    name: 'Profile',
    to: '/profile',
    icon: User,
  },
];

interface SidebarProps {
  onNavigate?: () => void;
  onCloseMobile?: () => void;
  isMobileDrawer?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onNavigate,
  onCloseMobile,
  isMobileDrawer = false,
}) => {
  const { allergies } = useAllergies();

  return (
    <aside
      className={`flex flex-col h-full bg-white border-r border-slate-200/90 ${
        isMobileDrawer ? 'w-full max-w-xs' : 'w-64 lg:w-72'
      }`}
      aria-label="Main Navigation Sidebar"
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal-accent-subtle border border-teal-accent-border text-teal-accent shadow-subtle shrink-0"
            aria-hidden="true"
          >
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-navy-950">
                SafeBite
              </span>
              <span className="text-base font-bold text-teal-accent">
                AI
              </span>
            </div>
            <p className="text-[11px] leading-tight text-navy-500 font-medium tracking-tight">
              Food Safety &amp; Wellness
            </p>
          </div>
        </div>

        {/* Mobile Close Button */}
        {isMobileDrawer && onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-navy-500 hover:text-navy-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            aria-label="Close navigation drawer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-navy-500 uppercase">
          Menu
        </div>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const dynamicBadge = item.to === '/allergies' ? `${allergies.length} Active` : item.badge;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => {
                if (onNavigate) onNavigate();
                if (onCloseMobile) onCloseMobile();
              }}
              className={({ isActive }) =>
                `group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                  isActive
                    ? 'bg-teal-accent-subtle/80 text-teal-accent-hover font-semibold shadow-subtle border border-teal-accent-border/60'
                    : 'text-navy-700 hover:text-navy-950 hover:bg-slate-50 border border-transparent'
                }`
              }
              aria-label={item.name}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-teal-accent'
                          : 'text-navy-500 group-hover:text-navy-800'
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>

                  {dynamicBadge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                        item.badgeVariant === 'blue'
                          ? 'bg-blue-accent-subtle text-blue-accent border border-blue-accent-border'
                          : 'bg-teal-accent-subtle text-teal-accent border border-teal-accent-border'
                      }`}
                    >
                      {dynamicBadge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Emergency Health Status Indicator */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-subtle flex items-start gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0 animate-pulse" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-navy-900 truncate">
              Protection Active
            </p>
            <p className="text-[11px] text-navy-500 leading-snug">
              EpiPen verified • {allergies.length} filters active
            </p>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-navy-500 px-1">
          <span>Demo Session</span>
          <NavLink
            to="/login"
            className="text-teal-accent hover:text-teal-accent-hover font-medium underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500 rounded"
          >
            Switch Account
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
