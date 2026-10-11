import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ScanLine,
  ShieldAlert,
  HeartPulse,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import {
  mockDemoUserProfile,
  mockDemoFoodChecks,
  mockDemoWellnessRoutines,
} from '../data/mockData';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Welcome Banner */}
      <section className="safebite-card p-6 bg-gradient-to-r from-teal-accent-subtle/70 via-white to-blue-accent-subtle/50 border border-teal-accent-border/60 rounded-2xl shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="badge-teal text-xs">Allergen Shield Active</span>
            <span className="text-xs text-navy-500 font-medium">
              Demo Environment
            </span>
          </div>
          <h1 className="text-2xl font-bold text-navy-950 tracking-tight">
            Welcome back, {mockDemoUserProfile.fullName.split(' ')[0]}
          </h1>
          <p className="text-sm text-navy-600 max-w-xl">
            SafeBiteAI is currently monitoring ingredients against your 3 registered allergens. No recent adverse exposures flagged.
          </p>
        </div>

        <Link
          to="/food-checker"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-accent hover:bg-teal-accent-hover text-white text-sm font-semibold shadow-subtle transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 cursor-pointer"
        >
          <ScanLine className="w-4 h-4" />
          <span>New Food Scan</span>
        </Link>
      </section>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="safebite-card p-5 bg-white border border-slate-200/90 rounded-2xl shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-navy-500">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Allergies Tracked
            </span>
            <HeartPulse className="w-4 h-4 text-teal-accent" />
          </div>
          <div className="text-2xl font-bold text-navy-950">
            {mockDemoUserProfile.healthProfile.allergies.length}
          </div>
          <p className="text-xs text-navy-500">
            Peanuts, Shellfish, Sesame
          </p>
        </div>

        {/* Metric 2 */}
        <div className="safebite-card p-5 bg-white border border-slate-200/90 rounded-2xl shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-navy-500">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Auto-Injector
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            Verified
          </div>
          <p className="text-xs text-navy-500">
            Expires {mockDemoUserProfile.healthProfile.epiPenExpiryDate}
          </p>
        </div>

        {/* Metric 3 */}
        <div className="safebite-card p-5 bg-white border border-slate-200/90 rounded-2xl shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-navy-500">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Recent Scans
            </span>
            <ScanLine className="w-4 h-4 text-blue-accent" />
          </div>
          <div className="text-2xl font-bold text-navy-950">
            {mockDemoFoodChecks.length}
          </div>
          <p className="text-xs text-navy-500">
            1 Safe, 1 High-Risk Unsafe
          </p>
        </div>

        {/* Metric 4 */}
        <div className="safebite-card p-5 bg-white border border-slate-200/90 rounded-2xl shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-navy-500">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Wellness Streak
            </span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-navy-950">
            {mockDemoWellnessRoutines[0]?.currentStreakDays || 14} Days
          </div>
          <p className="text-xs text-navy-500">
            Pre-meal check-in streak
          </p>
        </div>
      </div>

      {/* Recent Food Scans & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Checks List */}
        <div className="lg:col-span-2 safebite-card p-6 bg-white border border-slate-200/90 rounded-2xl shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-navy-950">
                Recent Food Scans
              </h2>
              <p className="text-xs text-navy-500">
                Ingredients checked against your profile
              </p>
            </div>
            <Link
              to="/food-checker"
              className="text-xs font-semibold text-teal-accent hover:text-teal-accent-hover flex items-center gap-1"
            >
              <span>View Food Checker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {mockDemoFoodChecks.map((check) => (
              <div
                key={check.id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-navy-950">
                      {check.foodName}
                    </span>
                    <span className="text-xs text-navy-500">
                      ({check.brand})
                    </span>
                  </div>
                  <p className="text-xs text-navy-600">
                    {check.summaryNote}
                  </p>
                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1 ${
                    check.safetyStatus === 'safe'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {check.safetyStatus === 'safe' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Safe
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" />
                      Unsafe
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Safety Actions & Shortcuts */}
        <div className="safebite-card p-6 bg-white border border-slate-200/90 rounded-2xl shadow-subtle space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-navy-950">
              Quick Actions
            </h2>
            <p className="text-xs text-navy-500">
              Fast access to essential safety tools
            </p>
          </div>

          <div className="space-y-2.5">
            <Link
              to="/exposure-assistant"
              className="p-3 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-50 flex items-center justify-between text-navy-900 text-xs font-semibold transition-colors"
            >
              <div className="flex items-center gap-2 text-rose-700">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Exposure Incident Assistant</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-rose-600" />
            </Link>

            <Link
              to="/allergies"
              className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/70 flex items-center justify-between text-navy-900 text-xs font-semibold transition-colors"
            >
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-teal-accent shrink-0" />
                <span>Review &amp; Update Allergies</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-navy-400" />
            </Link>

            <Link
              to="/reminders"
              className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/70 flex items-center justify-between text-navy-900 text-xs font-semibold transition-colors"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-accent shrink-0" />
                <span>Safety &amp; Medication Reminders</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-navy-400" />
            </Link>

            <Link
              to="/profile"
              className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/70 flex items-center justify-between text-navy-900 text-xs font-semibold transition-colors"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-accent shrink-0" />
                <span>Emergency Contact &amp; Diet</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-navy-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
