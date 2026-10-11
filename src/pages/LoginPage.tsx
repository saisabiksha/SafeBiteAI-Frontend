import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Info,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Email format validation
  const validateEmail = (val: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(val.trim());
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address (e.g. name@example.com).';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSuccessMessage(null);

    // Simulated frontend login latency (No server call, no storage of passwords)
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage('Demo login verified! Redirecting to your dashboard...');
      setTimeout(() => {
        navigate('/');
      }, 900);
    }, 600);
  };

  const handleFillDemo = () => {
    setEmail('alex.jordan.demo@example.com');
    setPassword('SafeBite2026!');
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans antialiased">
      {/* Branding Header */}
      <div className="mb-6 flex flex-col items-center text-center">
        <Link
          to="/"
          className="flex items-center gap-3 p-1 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          aria-label="SafeBiteAI Home"
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-accent-subtle border border-teal-accent-border flex items-center justify-center text-teal-accent shadow-subtle">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-navy-950">
                SafeBite
              </span>
              <span className="text-xl font-bold text-teal-accent">
                AI
              </span>
            </div>
            <p className="text-xs text-navy-500 font-medium tracking-tight">
              Food Safety &amp; Personal Wellness
            </p>
          </div>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-card">
        {/* Notice: Frontend Demo only */}
        <div className="mb-6 p-3.5 rounded-xl bg-blue-accent-subtle border border-blue-accent-border flex items-start gap-3 text-xs text-navy-700">
          <Info className="w-4 h-4 text-blue-accent shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold text-navy-900 block mb-0.5">
              Frontend Demo Simulation
            </strong>
            This is an offline UI demo. No real credentials are sent to a server or stored in local storage.
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-950 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-sm text-navy-500 mt-1">
            Access your personalized allergen profiles and wellness metrics.
          </p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div
            className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2.5 animate-in fade-in duration-200"
            role="status"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Email Input */}
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-navy-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-navy-900 bg-white placeholder:text-navy-300 transition-colors focus:bg-white focus-visible:outline-none focus-visible:ring-2 ${
                  errors.email
                    ? 'border-rose-300 focus-visible:ring-rose-400'
                    : 'border-slate-200 focus-visible:ring-teal-500 hover:border-slate-300'
                }`}
              />
            </div>
            {errors.email && (
              <p
                id="email-error"
                className="mt-1.5 text-xs text-rose-600 flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-navy-700 uppercase tracking-wider"
              >
                Password
              </label>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-xs text-teal-accent hover:text-teal-accent-hover font-medium underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
              >
                Autofill Demo
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-navy-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                className={`w-full pl-10 pr-11 py-2.5 rounded-xl border text-sm text-navy-900 bg-white placeholder:text-navy-300 transition-colors focus:bg-white focus-visible:outline-none focus-visible:ring-2 ${
                  errors.password
                    ? 'border-rose-300 focus-visible:ring-rose-400'
                    : 'border-slate-200 focus-visible:ring-teal-500 hover:border-slate-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-navy-400 hover:text-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-r-xl"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p
                id="password-error"
                className="mt-1.5 text-xs text-rose-600 flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-teal-accent hover:bg-teal-accent-hover text-white font-semibold text-sm shadow-subtle transition-all duration-150 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Links */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-navy-500 gap-2">
          <span>
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="text-teal-accent hover:text-teal-accent-hover font-semibold underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
            >
              Create Account
            </Link>
          </span>

          <Link
            to="/"
            className="text-navy-600 hover:text-navy-950 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
          >
            Explore Dashboard &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
