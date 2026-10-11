import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  User,
  ShieldAlert,
  HeartPulse,
  Phone,
  Utensils,
  Bell,
  Volume2,
  Camera,
  CheckCircle2,
  Save,
  X,
  RotateCcw,
  AlertTriangle,
  Info,
  Lock,
  Scale,
  Ruler,
  ExternalLink,
  ShieldCheck,
  Droplets,
  Tag,
} from 'lucide-react';
import { mockDemoUserProfile } from '../data/mockData';
import { useAllergies } from '../context';
import type { UserProfile, HeightUnit, WeightUnit } from '../types';

interface ProfileFormState {
  fullName: string;
  age: string;
  height: string;
  heightUnit: HeightUnit;
  weight: string;
  weightUnit: WeightUnit;
  primaryDiet: string;
  dislikedIngredients: string;
  avoidArtificialAdditives: boolean;
  preferOrganic: boolean;
  settings: {
    notificationsEnabled: boolean;
    highRiskAlertSound: boolean;
    cameraAutofocusOcr: boolean;
    inAppReminders: boolean;
    foodSafetyAlerts: boolean;
    hydrationNudges: boolean;
  };
}

export const ProfilePage: React.FC = () => {
  // Shared React allergy state (Requirement 2: do not create a separate allergy list)
  const { allergies: sharedAllergies } = useAllergies();

  // Saved Profile State (Client-Side Session)
  const [profile, setProfile] = useState<UserProfile>(() => ({
    ...mockDemoUserProfile,
    age: mockDemoUserProfile.age ?? 29,
    height: mockDemoUserProfile.height ?? 175,
    heightUnit: mockDemoUserProfile.heightUnit ?? 'cm',
    weight: mockDemoUserProfile.weight ?? 68,
    weightUnit: mockDemoUserProfile.weightUnit ?? 'kg',
  }));

  // Editable Form State
  const [formState, setFormState] = useState<ProfileFormState>(() => ({
    fullName: profile.fullName,
    age: String(profile.age ?? 29),
    height: String(profile.height ?? 175),
    heightUnit: profile.heightUnit ?? 'cm',
    weight: String(profile.weight ?? 68),
    weightUnit: profile.weightUnit ?? 'kg',
    primaryDiet: profile.dietaryPreferences.primaryDiet,
    dislikedIngredients: profile.dietaryPreferences.dislikedIngredients.join(', '),
    avoidArtificialAdditives: profile.dietaryPreferences.avoidArtificialAdditives,
    preferOrganic: profile.dietaryPreferences.preferOrganic,
    settings: {
      notificationsEnabled: profile.settings.notificationsEnabled,
      highRiskAlertSound: profile.settings.highRiskAlertSound,
      cameraAutofocusOcr: profile.settings.cameraAutofocusOcr,
      inAppReminders: profile.settings.inAppReminders ?? true,
      foodSafetyAlerts: profile.settings.foodSafetyAlerts ?? true,
      hydrationNudges: profile.settings.hydrationNudges ?? false,
    },
  }));

  // Feedback & Validation States
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const triggerSuccess = (msg: string) => {
    setSaveSuccessMessage(msg);
    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 4500);
  };

  // ---------------------------------------------------------------------------
  // Validation Logic (Requirements 1 & 4)
  // ---------------------------------------------------------------------------
  const validateForm = (): boolean => {
    const errors: string[] = [];

    // Full name validation
    if (!formState.fullName.trim()) {
      errors.push('Full name is required and cannot be blank.');
    }

    // Age validation (reasonable numeric range)
    const ageNum = Number(formState.age);
    if (!formState.age.trim() || isNaN(ageNum) || ageNum < 1 || ageNum > 125) {
      errors.push('Age must be a valid number between 1 and 125 years.');
    }

    // Height validation
    const heightNum = Number(formState.height);
    if (!formState.height.trim() || isNaN(heightNum) || heightNum <= 0) {
      errors.push('Height must be a valid positive number.');
    } else if (formState.heightUnit === 'cm' && (heightNum < 40 || heightNum > 270)) {
      errors.push('Height in cm must be between 40 cm and 270 cm.');
    } else if (formState.heightUnit === 'ft_in' && (heightNum < 1.0 || heightNum > 9.0)) {
      errors.push('Height in feet must be between 1.0 and 9.0 ft.');
    }

    // Weight validation
    const weightNum = Number(formState.weight);
    if (!formState.weight.trim() || isNaN(weightNum) || weightNum <= 0) {
      errors.push('Weight must be a valid positive number.');
    } else if (formState.weightUnit === 'kg' && (weightNum < 10 || weightNum > 450)) {
      errors.push('Weight in kg must be between 10 kg and 450 kg.');
    } else if (formState.weightUnit === 'lbs' && (weightNum < 20 || weightNum > 1000)) {
      errors.push('Weight in lbs must be between 20 lbs and 1000 lbs.');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // ---------------------------------------------------------------------------
  // Save, Cancel & Reset Handlers (Requirement 4)
  // ---------------------------------------------------------------------------
  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const updatedProfile: UserProfile = {
      ...profile,
      fullName: formState.fullName.trim(),
      age: Number(formState.age),
      height: Number(formState.height),
      heightUnit: formState.heightUnit,
      weight: Number(formState.weight),
      weightUnit: formState.weightUnit,
      dietaryPreferences: {
        ...profile.dietaryPreferences,
        primaryDiet: formState.primaryDiet as UserProfile['dietaryPreferences']['primaryDiet'],
        dislikedIngredients: formState.dislikedIngredients
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        avoidArtificialAdditives: formState.avoidArtificialAdditives,
        preferOrganic: formState.preferOrganic,
      },
      settings: {
        ...formState.settings,
      },
    };

    setProfile(updatedProfile);
    setValidationErrors([]);
    triggerSuccess(
      'Profile changes saved in demo session memory. (Notice: Browser refresh will reset to default data.)'
    );
  };

  const handleCancelEdits = () => {
    setFormState({
      fullName: profile.fullName,
      age: String(profile.age ?? 29),
      height: String(profile.height ?? 175),
      heightUnit: profile.heightUnit ?? 'cm',
      weight: String(profile.weight ?? 68),
      weightUnit: profile.weightUnit ?? 'kg',
      primaryDiet: profile.dietaryPreferences.primaryDiet,
      dislikedIngredients: profile.dietaryPreferences.dislikedIngredients.join(', '),
      avoidArtificialAdditives: profile.dietaryPreferences.avoidArtificialAdditives,
      preferOrganic: profile.dietaryPreferences.preferOrganic,
      settings: {
        notificationsEnabled: profile.settings.notificationsEnabled,
        highRiskAlertSound: profile.settings.highRiskAlertSound,
        cameraAutofocusOcr: profile.settings.cameraAutofocusOcr,
        inAppReminders: profile.settings.inAppReminders ?? true,
        foodSafetyAlerts: profile.settings.foodSafetyAlerts ?? true,
        hydrationNudges: profile.settings.hydrationNudges ?? false,
      },
    });
    setValidationErrors([]);
    triggerSuccess('Unsaved form changes discarded.');
  };

  const handleResetToDefaults = () => {
    const defaultProfile: UserProfile = {
      ...mockDemoUserProfile,
      age: 29,
      height: 175,
      heightUnit: 'cm',
      weight: 68,
      weightUnit: 'kg',
    };
    setProfile(defaultProfile);
    setFormState({
      fullName: defaultProfile.fullName,
      age: '29',
      height: '175',
      heightUnit: 'cm',
      weight: '68',
      weightUnit: 'kg',
      primaryDiet: defaultProfile.dietaryPreferences.primaryDiet,
      dislikedIngredients: defaultProfile.dietaryPreferences.dislikedIngredients.join(', '),
      avoidArtificialAdditives: defaultProfile.dietaryPreferences.avoidArtificialAdditives,
      preferOrganic: defaultProfile.dietaryPreferences.preferOrganic,
      settings: {
        notificationsEnabled: defaultProfile.settings.notificationsEnabled,
        highRiskAlertSound: defaultProfile.settings.highRiskAlertSound,
        cameraAutofocusOcr: defaultProfile.settings.cameraAutofocusOcr,
        inAppReminders: true,
        foodSafetyAlerts: true,
        hydrationNudges: false,
      },
    });
    setValidationErrors([]);
    triggerSuccess('Reset profile to initial fictional demo data.');
  };

  const handleToggleSetting = (key: keyof ProfileFormState['settings']) => {
    setFormState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: !prev.settings[key],
      },
    }));
  };

  return (
    <div className="space-y-7 max-w-6xl pb-12">
      {/* --------------------------------------------------------------------- */}
      {/* PAGE HEADER */}
      {/* --------------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-2xl font-bold text-navy-950 tracking-tight">
              User Profile &amp; Preferences
            </h1>
            <span className="badge-teal text-xs">Account Settings</span>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-navy-600 border border-slate-200">
              Demo Mode &bull; Local Session Only
            </span>
          </div>
          <p className="text-sm text-navy-500">
            Manage your personal metrics, unit preferences, linked allergens, and in-app safety
            options.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-navy-600 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
            title="Reset profile inputs to default demo data"
          >
            <RotateCcw className="w-3.5 h-3.5 text-navy-400" />
            <span>Reset Demo Defaults</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccessMessage && (
        <div
          role="status"
          aria-live="polite"
          className="p-3.5 rounded-xl bg-teal-accent-subtle border border-teal-accent-border text-teal-accent text-xs flex items-center gap-2.5 shadow-2xs transition-all animate-in fade-in"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{saveSuccessMessage}</span>
        </div>
      )}

      {/* Validation Errors Alert */}
      {validationErrors.length > 0 && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1.5 shadow-2xs animate-in fade-in"
        >
          <div className="flex items-center gap-2 font-bold text-rose-800">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Please correct the following errors before saving:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-rose-700 pl-1 text-[11px]">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* DEMO NOTICE & PRIVACY/SAFETY BANNER (Requirement 5) */}
      {/* --------------------------------------------------------------------- */}
      <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-navy-900 shadow-2xs space-y-2">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-xs font-bold text-navy-950">
              Demo Environment &amp; Privacy Statement
            </h2>
            <p className="text-xs text-navy-700 leading-relaxed">
              <strong>Frontend Prototype Only:</strong> All details on this page are stored
              strictly within your browser&rsquo;s active React session memory. No passwords,
              external cookies, or health records are saved in localStorage, sessionStorage, or a
              remote database. Changes will reset upon page reload.
            </p>
            <p className="text-[11px] text-navy-600">
              * Personal attributes (height, weight, age) are general lifestyle markers. SafeBiteAI
              does <strong>not</strong> provide medical diagnoses, clinical calorie limits, or
              treatment recommendations.
            </p>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* PROFILE OVERVIEW CARD */}
      {/* --------------------------------------------------------------------- */}
      <section
        aria-label="Profile Summary"
        className="safebite-card p-6 bg-white border border-slate-200/90 rounded-2xl shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-accent-subtle to-blue-accent-subtle border border-teal-accent-border flex items-center justify-center text-teal-accent shadow-subtle text-xl font-bold shrink-0">
            {profile.fullName
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-navy-950">{profile.fullName}</h2>
              <span className="badge-teal text-[11px]">Active Profile</span>
            </div>
            <p className="text-xs text-navy-500 flex items-center gap-1.5 mt-1">
              <Mail className="w-3.5 h-3.5 text-navy-400" />
              <span>{profile.email}</span>
            </p>
            <p className="text-[11px] text-navy-400 mt-0.5">
              Member ID: <span className="font-mono text-navy-600">{profile.id}</span>
            </p>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="flex flex-wrap items-center gap-2 sm:self-center">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="block text-xs font-bold text-navy-900">{profile.age} yrs</span>
            <span className="block text-[10px] text-navy-500 font-medium">Age</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="block text-xs font-bold text-navy-900">
              {profile.height} {profile.heightUnit}
            </span>
            <span className="block text-[10px] text-navy-500 font-medium">Height</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="block text-xs font-bold text-navy-900">
              {profile.weight} {profile.weightUnit}
            </span>
            <span className="block text-[10px] text-navy-500 font-medium">Weight</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="block text-xs font-bold text-teal-accent">{sharedAllergies.length}</span>
            <span className="block text-[10px] text-navy-500 font-medium">Allergies</span>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* MAIN FORM: PERSONAL INFO & PREFERENCES */}
      {/* --------------------------------------------------------------------- */}
      <form onSubmit={handleSaveChanges} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ----------------------------------------------------------------- */}
          {/* 1. PERSONAL INFORMATION (Requirement 1) */}
          {/* ----------------------------------------------------------------- */}
          <section
            aria-labelledby="personal-info-heading"
            className="safebite-card p-6 bg-white border border-slate-200/90 rounded-2xl shadow-subtle space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="personal-info-heading" className="text-base font-bold text-navy-950">
                    Personal Information
                  </h3>
                  <p className="text-[11px] text-navy-500">
                    Identity details and general physical metrics
                  </p>
                </div>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-navy-600 border border-slate-200">
                Editable
              </span>
            </div>

            <div className="space-y-3.5">
              {/* Full Name */}
              <div className="space-y-1">
                <label htmlFor="profile-fullname-input" className="text-xs font-bold text-navy-900 block">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="profile-fullname-input"
                  type="text"
                  required
                  value={formState.fullName}
                  onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                  placeholder="e.g. Alex Jordan"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                />
              </div>

              {/* Email (Read-Only Demo Field) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="profile-email-input" className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                    Email Address
                    <Lock className="w-3 h-3 text-navy-400" />
                  </label>
                  <span className="text-[10px] text-navy-400 italic">Read-only in demo</span>
                </div>
                <input
                  id="profile-email-input"
                  type="email"
                  readOnly
                  disabled
                  value={profile.email}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100/70 text-xs text-navy-500 cursor-not-allowed"
                />
                <p className="text-[10px] text-navy-400">
                  Email authentication is locked to the active prototype session.
                </p>
              </div>

              {/* Age */}
              <div className="space-y-1">
                <label htmlFor="profile-age-input" className="text-xs font-bold text-navy-900 block">
                  Age (Years) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="profile-age-input"
                  type="number"
                  min={1}
                  max={125}
                  required
                  value={formState.age}
                  onChange={(e) => setFormState({ ...formState, age: e.target.value })}
                  placeholder="e.g. 29"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                />
              </div>

              {/* Height & Unit */}
              <div className="space-y-1">
                <label htmlFor="profile-height-input" className="text-xs font-bold text-navy-900 block">
                  Height <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      id="profile-height-input"
                      type="number"
                      step={formState.heightUnit === 'cm' ? '1' : '0.1'}
                      required
                      value={formState.height}
                      onChange={(e) => setFormState({ ...formState, height: e.target.value })}
                      placeholder={formState.heightUnit === 'cm' ? '175' : '5.9'}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                    />
                    <Ruler className="w-3.5 h-3.5 text-navy-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                  <select
                    id="profile-height-unit-select"
                    aria-label="Height Unit"
                    value={formState.heightUnit}
                    onChange={(e) =>
                      setFormState({ ...formState, heightUnit: e.target.value as HeightUnit })
                    }
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-navy-800 bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                  >
                    <option value="cm">cm (Centimeters)</option>
                    <option value="ft_in">ft (Feet)</option>
                  </select>
                </div>
              </div>

              {/* Weight & Unit */}
              <div className="space-y-1">
                <label htmlFor="profile-weight-input" className="text-xs font-bold text-navy-900 block">
                  Weight <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      id="profile-weight-input"
                      type="number"
                      step={formState.weightUnit === 'kg' ? '0.5' : '1'}
                      required
                      value={formState.weight}
                      onChange={(e) => setFormState({ ...formState, weight: e.target.value })}
                      placeholder={formState.weightUnit === 'kg' ? '68' : '150'}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                    />
                    <Scale className="w-3.5 h-3.5 text-navy-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                  <select
                    id="profile-weight-unit-select"
                    aria-label="Weight Unit"
                    value={formState.weightUnit}
                    onChange={(e) =>
                      setFormState({ ...formState, weightUnit: e.target.value as WeightUnit })
                    }
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-navy-800 bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                  >
                    <option value="kg">kg (Kilograms)</option>
                    <option value="lbs">lbs (Pounds)</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* ----------------------------------------------------------------- */}
          {/* 3. PREFERENCES & IN-APP NOTIFICATIONS (Requirement 3) */}
          {/* ----------------------------------------------------------------- */}
          <section
            aria-labelledby="preferences-heading"
            className="safebite-card p-6 bg-white border border-slate-200/90 rounded-2xl shadow-subtle space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="preferences-heading" className="text-base font-bold text-navy-950">
                    App &amp; Notification Preferences
                  </h3>
                  <p className="text-[11px] text-navy-500">
                    Customize simulated in-app alerts and tool behavior
                  </p>
                </div>
              </div>
              <span className="badge-blue text-[10px]">Client Preferences</span>
            </div>

            <div className="space-y-3">
              {/* Notification Toggle 1: Push Notifications */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-navy-900">In-App Alerts &amp; Banners</p>
                  <p className="text-[11px] text-navy-500">
                    Simulate visual toast notifications during your session
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSetting('notificationsEnabled')}
                  className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                    formState.settings.notificationsEnabled
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-slate-200 text-navy-600'
                  }`}
                >
                  {formState.settings.notificationsEnabled ? 'Active (ON)' : 'Muted (OFF)'}
                </button>
              </div>

              {/* Notification Toggle 2: High Risk Audio Alert */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-navy-900 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-rose-500" />
                    High-Risk Allergen Warning Tone
                  </p>
                  <p className="text-[11px] text-navy-500">
                    Play simulated audio cue when severe allergens are found
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSetting('highRiskAlertSound')}
                  className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                    formState.settings.highRiskAlertSound
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-slate-200 text-navy-600'
                  }`}
                >
                  {formState.settings.highRiskAlertSound ? 'Sound ON' : 'Muted'}
                </button>
              </div>

              {/* Notification Toggle 3: Food Safety Alerts */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-navy-900">Food Safety Check Alerts</p>
                  <p className="text-[11px] text-navy-500">
                    Show instant allergen banners after ingredient screening
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSetting('foodSafetyAlerts')}
                  className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                    formState.settings.foodSafetyAlerts
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-slate-200 text-navy-600'
                  }`}
                >
                  {formState.settings.foodSafetyAlerts ? 'Active' : 'Off'}
                </button>
              </div>

              {/* Notification Toggle 4: Hydration Nudges */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-navy-900 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-teal-600" />
                    Hydration Nudges
                  </p>
                  <p className="text-[11px] text-navy-500">
                    In-app reminders to log water throughout the day
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSetting('hydrationNudges')}
                  className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                    formState.settings.hydrationNudges
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-slate-200 text-navy-600'
                  }`}
                >
                  {formState.settings.hydrationNudges ? 'Active' : 'Off'}
                </button>
              </div>

              {/* Notification Toggle 5: Camera Autofocus */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-navy-900 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-blue-500" />
                    Camera OCR Autofocus
                  </p>
                  <p className="text-[11px] text-navy-500">
                    Optimize camera lens focus for small ingredient label text
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSetting('cameraAutofocusOcr')}
                  className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                    formState.settings.cameraAutofocusOcr
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-slate-200 text-navy-600'
                  }`}
                >
                  {formState.settings.cameraAutofocusOcr ? 'Autofocus ON' : 'Manual'}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] text-navy-500 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-navy-400 shrink-0 mt-0.5" />
              <span>
                <strong>Prototype Notice:</strong> These notification toggles reflect in-app demo
                states. External operating system push alerts or background notifications are not
                supported without native system integration.
              </span>
            </div>
          </section>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* ACTION BUTTONS: SAVE & CANCEL (Requirement 4) */}
        {/* ------------------------------------------------------------------- */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-navy-500">
            <span>Remember to save your changes to update your active demo profile.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleCancelEdits}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-navy-700 transition-colors shadow-2xs"
            >
              <X className="w-3.5 h-3.5 text-navy-400" />
              <span>Cancel</span>
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </form>

      {/* --------------------------------------------------------------------- */}
      {/* 2. ALLERGY PROFILE: SHARED STATE READING (Requirement 2) */}
      {/* --------------------------------------------------------------------- */}
      <section
        aria-labelledby="allergy-profile-heading"
        className="safebite-card p-6 bg-white border border-slate-200/90 rounded-2xl shadow-subtle space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 id="allergy-profile-heading" className="text-base font-bold text-navy-950">
                Registered Allergy Profile
              </h3>
              <p className="text-[11px] text-navy-500">
                Shared active allergen list screened by Food Checker and Exposure Assistant
              </p>
            </div>
          </div>

          {/* Navigation Button to My Allergies (Requirement 2) */}
          <Link
            to="/allergies"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs transition-colors self-start sm:self-auto shrink-0"
          >
            <span>Manage in My Allergies</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Informative Note: Shared Single Source of Truth */}
        <div className="p-3.5 rounded-xl bg-teal-accent-subtle/50 border border-teal-accent-border text-xs text-navy-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              This list is read directly from your <strong>shared React allergy state</strong>. Any
              allergens added, edited, or removed in My Allergies automatically update here.
            </span>
          </div>
          <span className="text-[11px] font-bold text-teal-700 whitespace-nowrap">
            {sharedAllergies.length} Registered
          </span>
        </div>

        {/* Registered Allergies Grid */}
        {sharedAllergies.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
            <HeartPulse className="w-8 h-8 text-navy-300 mx-auto" />
            <h4 className="text-sm font-bold text-navy-900">No allergies currently registered</h4>
            <p className="text-xs text-navy-500">
              Visit My Allergies to add allergen items for automatic food screening.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {sharedAllergies.map((allergy) => (
              <div
                key={allergy.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-navy-950">{allergy.allergenName}</h4>
                      <span className="text-[11px] text-teal-accent font-semibold capitalize block mt-0.5">
                        {allergy.category === 'other' && allergy.customCategory
                          ? allergy.customCategory
                          : allergy.category.replace('_', ' ')}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                        allergy.severity === 'severe' || allergy.severity === 'life-threatening'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : allergy.severity === 'moderate'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {allergy.severity}
                    </span>
                  </div>

                  {/* Aliases */}
                  {allergy.aliases && allergy.aliases.length > 0 && (
                    <div className="mt-2.5">
                      <span className="text-[10px] font-semibold text-navy-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                        <Tag className="w-2.5 h-2.5" />
                        Screened Aliases:
                      </span>
                      <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                        {allergy.aliases.slice(0, 4).map((alias, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-navy-700 font-mono"
                          >
                            {alias}
                          </span>
                        ))}
                        {allergy.aliases.length > 4 && (
                          <span className="text-[10px] text-navy-400 font-medium">
                            +{allergy.aliases.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {allergy.notes && (
                    <p className="text-xs text-navy-600 bg-slate-50 p-2 rounded-lg border border-slate-200/50 mt-2 line-clamp-2">
                      {allergy.notes}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  {allergy.diagnosedByDoctor ? (
                    <span className="text-teal-accent font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Physician Verified
                    </span>
                  ) : (
                    <span className="text-navy-400 italic">Self-Observed</span>
                  )}
                  <Link
                    to="/allergies"
                    className="text-teal-600 hover:text-teal-700 font-bold hover:underline"
                  >
                    Edit &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Medical and Emergency Contacts Note */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* EpiPen Status */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                Auto-Injector (EpiPen) Status
              </span>
              <p className="text-[11px] text-navy-500">
                {profile.healthProfile.hasEpiPen
                  ? `Active prescription tracked. Expiry: ${profile.healthProfile.epiPenExpiryDate || 'Recorded'}`
                  : 'No active prescription recorded.'}
              </p>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                profile.healthProfile.hasEpiPen
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-navy-600'
              }`}
            >
              {profile.healthProfile.hasEpiPen ? 'Yes (Active)' : 'No'}
            </span>
          </div>

          {/* Emergency Contact */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-teal-accent" />
                Emergency Contact
              </span>
              <p className="text-[11px] text-navy-500">
                {profile.healthProfile.emergencyContact.name} (
                {profile.healthProfile.emergencyContact.relationship})
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-teal-accent">
              {profile.healthProfile.emergencyContact.phoneNumber}
            </span>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* DIETARY PREFERENCES OVERVIEW */}
      {/* --------------------------------------------------------------------- */}
      <section
        aria-labelledby="dietary-preferences-heading"
        className="safebite-card p-6 bg-white border border-slate-200/90 rounded-2xl shadow-subtle space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h3 id="dietary-preferences-heading" className="text-base font-bold text-navy-950">
                Dietary Lifestyle &amp; Sourcing Preferences
              </h3>
              <p className="text-[11px] text-navy-500">
                Non-medical preferences, diet style, and food habits
              </p>
            </div>
          </div>
          <span className="badge-blue text-[10px]">Lifestyle Only</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-navy-400 uppercase tracking-wider block mb-1">
              Primary Diet
            </span>
            <span className="text-sm font-bold text-navy-950 capitalize">
              {profile.dietaryPreferences.primaryDiet}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-navy-400 uppercase tracking-wider block mb-1">
              Artificial Additives
            </span>
            <span className="text-sm font-bold text-navy-950">
              {profile.dietaryPreferences.avoidArtificialAdditives ? 'Avoided' : 'Permitted'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-navy-400 uppercase tracking-wider block mb-1">
              Organic Preference
            </span>
            <span className="text-sm font-bold text-navy-950">
              {profile.dietaryPreferences.preferOrganic ? 'Preferred' : 'Standard'}
            </span>
          </div>
        </div>

        {profile.dietaryPreferences.dislikedIngredients.length > 0 && (
          <div>
            <span className="text-xs font-bold text-navy-700 block mb-1.5">
              Disliked / Excluded Ingredients:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {profile.dietaryPreferences.dislikedIngredients.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-navy-700 text-xs font-medium border border-slate-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;
