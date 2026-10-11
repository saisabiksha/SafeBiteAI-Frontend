import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Droplets,
  Sparkles,
  Activity,
  CheckCircle2,
  Plus,
  Minus,
  RotateCcw,
  Edit2,
  Trash2,
  ShieldAlert,
  AlertTriangle,
  Info,
  Clock,
  Flame,
  ArrowRight,
  Smile,
  X,
  Calendar,
  Settings,
  Scissors,
} from 'lucide-react';
import {
  mockDemoRoutineActivities,
  mockDemoWellnessRoutines,
} from '../data/mockData';
import { useAllergies } from '../context';
import type { RoutineActivity, RoutineActivityCategory } from '../types';

interface RoutineFormData {
  name: string;
  category: RoutineActivityCategory;
  frequency: string;
  notes: string;
}

const FREQUENCY_PRESETS = [
  'Daily morning',
  'Daily evening',
  'Twice daily (AM/PM)',
  'As needed',
];

const getCurrentFormattedTime = (): string => {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const WellnessPage: React.FC = () => {
  const { allergies: userAllergies } = useAllergies();

  // ---------------------------------------------------------------------------
  // Hydration State (Requirement 2)
  // ---------------------------------------------------------------------------
  const [hydrationGlasses, setHydrationGlasses] = useState<number>(5);
  const [hydrationGoal, setHydrationGoal] = useState<number>(8);
  const [hydrationLogs, setHydrationLogs] = useState<string[]>([
    '08:00 AM',
    '09:45 AM',
    '11:30 AM',
    '01:15 PM',
    '03:30 PM',
  ]);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [tempGoal, setTempGoal] = useState(hydrationGoal);

  // ---------------------------------------------------------------------------
  // Routine Activities State (Requirement 3)
  // ---------------------------------------------------------------------------
  const [activities, setActivities] = useState<RoutineActivity[]>(() => [
    ...mockDemoRoutineActivities,
  ]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<
    'all' | RoutineActivityCategory
  >('all');

  // Modal & Form States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<RoutineActivity | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<RoutineActivity | null>(null);

  const [formData, setFormData] = useState<RoutineFormData>({
    name: '',
    category: 'skin_care',
    frequency: 'Daily morning',
    notes: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Show temporary toast notice
  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => {
      setActionNotice(null);
    }, 3500);
  };

  // ---------------------------------------------------------------------------
  // Hydration Handlers
  // ---------------------------------------------------------------------------
  const handleRecordGlass = () => {
    const nowTime = getCurrentFormattedTime();
    setHydrationGlasses((prev) => prev + 1);
    setHydrationLogs((prev) => [...prev, nowTime]);
    triggerNotice('Recorded 1 glass of water.');
  };

  const handleUndoGlass = () => {
    if (hydrationGlasses <= 0) return;
    setHydrationGlasses((prev) => Math.max(0, prev - 1));
    setHydrationLogs((prev) => prev.slice(0, prev.length - 1));
    triggerNotice('Undid last water entry.');
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempGoal < 1 || tempGoal > 24) {
      return;
    }
    setHydrationGoal(tempGoal);
    setIsGoalModalOpen(false);
    triggerNotice(`Updated daily water goal to ${tempGoal} glasses.`);
  };

  const handleResetHydration = () => {
    setHydrationGlasses(0);
    setHydrationLogs([]);
    triggerNotice("Reset today's water tracker.");
  };

  // ---------------------------------------------------------------------------
  // Activity Handlers
  // ---------------------------------------------------------------------------
  const handleToggleActivity = (id: string) => {
    const nowTime = getCurrentFormattedTime();

    setActivities((prev) =>
      prev.map((act) => {
        if (act.id === id) {
          const nextCompleted = !act.completedToday;
          return {
            ...act,
            completedToday: nextCompleted,
            completedAt: nextCompleted ? nowTime : undefined,
          };
        }
        return act;
      })
    );
  };

  const handleOpenAddModal = () => {
    setEditingActivity(null);
    setFormData({
      name: '',
      category: 'skin_care',
      frequency: 'Daily morning',
      notes: '',
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (activity: RoutineActivity) => {
    setEditingActivity(activity);
    setFormData({
      name: activity.name,
      category: activity.category,
      frequency: activity.frequency,
      notes: activity.notes || '',
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      setFormError('Please enter an activity name.');
      return;
    }

    if (editingActivity) {
      // Update existing
      setActivities((prev) =>
        prev.map((act) =>
          act.id === editingActivity.id
            ? {
                ...act,
                name: trimmedName,
                category: formData.category,
                frequency: formData.frequency.trim() || 'Daily',
                notes: formData.notes.trim() || undefined,
              }
            : act
        )
      );
      triggerNotice(`Updated "${trimmedName}".`);
    } else {
      // Add new
      const newAct: RoutineActivity = {
        id: `act-${Date.now()}`,
        name: trimmedName,
        category: formData.category,
        frequency: formData.frequency.trim() || 'Daily',
        notes: formData.notes.trim() || undefined,
        completedToday: false,
      };
      setActivities((prev) => [newAct, ...prev]);
      triggerNotice(`Added "${trimmedName}" to your routine.`);
    }

    setIsAddModalOpen(false);
    setEditingActivity(null);
    setFormError(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingActivity) return;
    setActivities((prev) => prev.filter((act) => act.id !== deletingActivity.id));
    triggerNotice(`Removed "${deletingActivity.name}".`);
    setDeletingActivity(null);
  };

  const handleResetDemoData = () => {
    setActivities([...mockDemoRoutineActivities]);
    setHydrationGlasses(5);
    setHydrationGoal(8);
    setHydrationLogs([
      '08:00 AM',
      '09:45 AM',
      '11:30 AM',
      '01:15 PM',
      '03:30 PM',
    ]);
    triggerNotice('Reset wellness routines and hydration to demo initial state.');
  };

  // ---------------------------------------------------------------------------
  // Derived Metrics
  // ---------------------------------------------------------------------------
  const skinCareActivities = activities.filter((a) => a.category === 'skin_care');
  const hairCareActivities = activities.filter((a) => a.category === 'hair_care');
  const generalWellnessActivities = activities.filter(
    (a) => a.category === 'general_wellness'
  );

  const completedSkinCount = skinCareActivities.filter((a) => a.completedToday).length;
  const completedHairCount = hairCareActivities.filter((a) => a.completedToday).length;
  const completedGeneralCount = generalWellnessActivities.filter(
    (a) => a.completedToday
  ).length;

  const completedActivitiesToday = activities.filter((a) => a.completedToday);

  const filteredActivities = activities.filter((a) => {
    if (selectedCategoryFilter === 'all') return true;
    return a.category === selectedCategoryFilter;
  });

  const hydrationProgressPercent = Math.min(
    100,
    Math.round((hydrationGlasses / hydrationGoal) * 100)
  );

  return (
    <div className="space-y-7 max-w-6xl pb-12">
      {/* --------------------------------------------------------------------- */}
      {/* PAGE HEADER */}
      {/* --------------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-2xl font-bold text-navy-950 tracking-tight">
              Wellness &amp; Daily Routines
            </h1>
            <span className="badge-teal text-xs">Habit Tracker</span>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-navy-600 border border-slate-200">
              Demo Mode &bull; Local State
            </span>
          </div>
          <p className="text-sm text-navy-500">
            Track hydration, daily skin and hair routines, and mindful eating habits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDemoData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-navy-600 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
            title="Reset all wellness counters to initial demo data"
          >
            <RotateCcw className="w-3.5 h-3.5 text-navy-400" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionNotice && (
        <div
          role="status"
          aria-live="polite"
          className="p-3 rounded-xl bg-teal-accent-subtle border border-teal-accent-border text-teal-accent text-xs flex items-center gap-2 shadow-2xs transition-all animate-in fade-in"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{actionNotice}</span>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* SAFETY CALLOUT: Suspected Reaction vs Wellness (Requirement 5) */}
      {/* --------------------------------------------------------------------- */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200/90 text-navy-900 shadow-2xs space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5 text-amber-700" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
              Important Safety Notice: Suspected Reactions vs Wellness Routines
            </h2>
            <p className="text-xs text-amber-900 leading-relaxed">
              If you or someone in your care experiences sudden rashes, hives, lip or tongue
              swelling, difficulty breathing, or dizziness,{' '}
              <strong>do NOT treat it as a skin care or wellness issue</strong>. These are signs of a
              potential allergic reaction and require immediate clinical assessment or emergency
              response.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-amber-200/70 text-xs text-amber-900">
          <span className="font-medium text-[11px]">
            Severe allergy symptoms must NEVER be managed as a wellness routine.
          </span>
          <Link
            to="/exposure-assistant"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 transition-colors shadow-2xs self-start sm:self-auto shrink-0"
          >
            <span>Go to Exposure Assistant</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 1. DAILY WELLNESS OVERVIEW (Requirement 1) */}
      {/* --------------------------------------------------------------------- */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-navy-950 flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-accent" />
              Daily Wellness Overview
            </h2>
            <p className="text-xs text-navy-500">
              High-level overview of hydration, skin care, hair care, and daily wellness habits.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-navy-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            Fictional Demo Data
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Overview Card: Hydration */}
          <div className="safebite-card p-4 bg-white border border-slate-200/90 rounded-2xl shadow-subtle space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-navy-400 uppercase tracking-wider">
                  Hydration
                </span>
                <span className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
                  <Droplets className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-extrabold text-navy-950">
                {hydrationGlasses}{' '}
                <span className="text-xs font-semibold text-navy-500">/ {hydrationGoal} glasses</span>
              </div>
              <p className="text-[11px] text-navy-500 mt-0.5">
                {hydrationProgressPercent >= 100
                  ? 'Daily water goal achieved!'
                  : `${hydrationProgressPercent}% of daily goal completed`}
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                <div
                  className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${hydrationProgressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-teal-700">
                  ~{hydrationGlasses * 250} ml logged
                </span>
                <button
                  type="button"
                  onClick={handleRecordGlass}
                  className="text-teal-600 hover:text-teal-700 font-bold hover:underline"
                >
                  + Add glass
                </button>
              </div>
            </div>
          </div>

          {/* Overview Card: Skin Care */}
          <div className="safebite-card p-4 bg-white border border-slate-200/90 rounded-2xl shadow-subtle space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-navy-400 uppercase tracking-wider">
                  Skin Care
                </span>
                <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <Sparkles className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-extrabold text-navy-950">
                {completedSkinCount}{' '}
                <span className="text-xs font-semibold text-navy-500">
                  / {skinCareActivities.length} done
                </span>
              </div>
              <p className="text-[11px] text-navy-500 mt-0.5">
                Fragrance-free barrier protection &amp; mineral suncare
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-navy-500">
                {skinCareActivities.length - completedSkinCount} pending today
              </span>
              <span className="badge-blue text-[10px]">Gentle Care</span>
            </div>
          </div>

          {/* Overview Card: Hair Care */}
          <div className="safebite-card p-4 bg-white border border-slate-200/90 rounded-2xl shadow-subtle space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-navy-400 uppercase tracking-wider">
                  Hair &amp; Scalp
                </span>
                <span className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                  <Scissors className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-extrabold text-navy-950">
                {completedHairCount}{' '}
                <span className="text-xs font-semibold text-navy-500">
                  / {hairCareActivities.length} done
                </span>
              </div>
              <p className="text-[11px] text-navy-500 mt-0.5">
                Sulfate-free scalp washes &amp; hypoallergenic rinses
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-navy-500">
                {hairCareActivities.length - completedHairCount} pending
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                Scalp Balance
              </span>
            </div>
          </div>

          {/* Overview Card: General Wellness & Streaks */}
          <div className="safebite-card p-4 bg-white border border-slate-200/90 rounded-2xl shadow-subtle space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-navy-400 uppercase tracking-wider">
                  Mindful Habits
                </span>
                <span className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <Flame className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-extrabold text-navy-950">
                {completedGeneralCount}{' '}
                <span className="text-xs font-semibold text-navy-500">
                  / {generalWellnessActivities.length} done
                </span>
              </div>
              <p className="text-[11px] text-navy-500 mt-0.5">
                Pre-meal mindfulness &amp; dining anxiety checks
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-amber-700 font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {mockDemoWellnessRoutines[0]?.currentStreakDays || 14}d streak
              </span>
              <span className="badge-teal text-[10px]">Mindful Dining</span>
            </div>
          </div>
        </div>

        {/* Overview Disclaimer (Requirement 1 & 10) */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-navy-600 flex items-center gap-2">
          <Info className="w-4 h-4 text-navy-400 shrink-0" />
          <span>
            <strong>General Wellness Notice:</strong> Hydration and wellness routines promote
            overall well-being. They do <strong>NOT</strong> prevent, cure, desensitize, or treat
            food allergies, anaphylaxis, or immune reactions.
          </span>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 2. HYDRATION TRACKER (Requirement 2) */}
      {/* --------------------------------------------------------------------- */}
      <section
        aria-labelledby="hydration-section-title"
        className="safebite-card p-5 sm:p-6 bg-white border border-slate-200/90 rounded-2xl shadow-subtle space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center">
                <Droplets className="w-4 h-4" />
              </span>
              <h2 id="hydration-section-title" className="text-lg font-bold text-navy-950">
                Hydration Tracker
              </h2>
            </div>
            <p className="text-xs text-navy-500 mt-0.5">
              Record glasses of water throughout your day to support digestion and vital hydration.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setTempGoal(hydrationGoal);
                setIsGoalModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-navy-700 transition-colors shadow-2xs"
            >
              <Settings className="w-3.5 h-3.5 text-navy-400" />
              <span>Set Goal ({hydrationGoal} glasses)</span>
            </button>
          </div>
        </div>

        {/* Progress Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
          {/* Stat Metric */}
          <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-100 space-y-2">
            <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
              Today's Water Intake
            </span>
            <div className="text-3xl font-extrabold text-navy-950">
              {hydrationGlasses}{' '}
              <span className="text-sm font-semibold text-navy-500">
                / {hydrationGoal} glasses
              </span>
            </div>
            <p className="text-xs text-navy-600 font-medium">
              ~{hydrationGlasses * 250} ml / ~{hydrationGoal * 250} ml (approx. 250ml per glass)
            </p>
            <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-teal-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${hydrationProgressPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-teal-700 block text-right">
              {hydrationProgressPercent}% achieved
            </span>
          </div>

          {/* Interactive Glass Visuals */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-navy-900">Visual Glasses Log:</span>
              <span className="text-[11px] text-navy-500">
                Click "+ Record Glass" or any empty cup to log
              </span>
            </div>

            {/* Cup indicators grid */}
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: hydrationGoal }).map((_, index) => {
                const isFilled = index < hydrationGlasses;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      if (!isFilled && index === hydrationGlasses) {
                        handleRecordGlass();
                      }
                    }}
                    title={isFilled ? `Glass ${index + 1} recorded` : `Click to record glass ${index + 1}`}
                    className={`w-11 h-13 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all text-xs font-bold ${
                      isFilled
                        ? 'bg-teal-500 text-white border-teal-600 shadow-2xs scale-100'
                        : 'bg-slate-50 text-navy-400 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50'
                    }`}
                  >
                    <Droplets className={`w-3.5 h-3.5 ${isFilled ? 'text-white' : 'text-navy-300'}`} />
                    <span className="text-[10px]">{index + 1}</span>
                  </button>
                );
              })}
            </div>

            {/* Action Buttons: Add, Undo, Reset */}
            <div className="flex items-center gap-2.5 pt-2 flex-wrap">
              <button
                type="button"
                onClick={handleRecordGlass}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Record Glass (+1)</span>
              </button>

              <button
                type="button"
                onClick={handleUndoGlass}
                disabled={hydrationGlasses <= 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-navy-700 text-xs font-semibold shadow-2xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Minus className="w-3.5 h-3.5" />
                <span>Undo Entry</span>
              </button>

              <button
                type="button"
                onClick={handleResetHydration}
                className="inline-flex items-center gap-1 text-[11px] text-navy-400 hover:text-navy-600 font-semibold px-2 py-1 ml-auto"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>

        {/* Clear non-medical disclaimer (Requirement 2) */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] text-navy-500 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-navy-400 shrink-0 mt-0.5" />
          <span>
            <strong>General Wellness Tracker:</strong> Water logging is for routine self-monitoring
            and does not represent clinical advice, electrolyte recommendations, or fluid
            prescription. Fluid needs differ based on physical activity, climate, and personal
            health.
          </span>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 3. SKIN AND HAIR CARE ROUTINES (Requirement 3) */}
      {/* --------------------------------------------------------------------- */}
      <section
        aria-labelledby="routines-section-title"
        className="safebite-card p-5 sm:p-6 bg-white border border-slate-200/90 rounded-2xl shadow-subtle space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 id="routines-section-title" className="text-lg font-bold text-navy-950">
                Skin &amp; Hair Care Routines
              </h2>
            </div>
            <p className="text-xs text-navy-500 mt-0.5">
              Personalized gentle care activities. Add, customize, complete, and review your daily
              routine.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Activity</span>
          </button>
        </div>

        {/* Registered Allergen Cosmetic Alert (Requirement 3) */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-navy-900 space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-950 block">
                Allergen Caution for Personal Care Products
              </span>
              <p className="text-amber-900 leading-relaxed text-[11px]">
                Your active registered allergens include:{' '}
                <strong>
                  {userAllergies.length > 0
                    ? userAllergies.map((a) => a.allergenName).join(', ')
                    : 'None registered'}
                </strong>
                . Many moisturizers, body lotions, hair oils, and shampoos contain hidden food/plant
                derivatives (such as <em>sweet almond oil</em>, <em>argan oil</em>,{' '}
                <em>macadamia seed oil</em>, <em>hydrolyzed wheat protein</em>, or <em>goat milk</em>
                ). Always verify cosmetic ingredient lists before application.
              </p>
              <p className="text-[11px] text-amber-800 italic">
                * Cosmetic and hair routines do NOT treat, heal, or prevent allergic skin reactions,
                contact dermatitis flare-ups, or hives.
              </p>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100">
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              selectedCategoryFilter === 'all'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'bg-slate-100 text-navy-600 hover:bg-slate-200/80'
            }`}
          >
            All Routines ({activities.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('skin_care')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              selectedCategoryFilter === 'skin_care'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'bg-slate-100 text-navy-600 hover:bg-slate-200/80'
            }`}
          >
            Skin Care ({skinCareActivities.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('hair_care')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              selectedCategoryFilter === 'hair_care'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'bg-slate-100 text-navy-600 hover:bg-slate-200/80'
            }`}
          >
            Hair &amp; Scalp ({hairCareActivities.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('general_wellness')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              selectedCategoryFilter === 'general_wellness'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'bg-slate-100 text-navy-600 hover:bg-slate-200/80'
            }`}
          >
            General Wellness ({generalWellnessActivities.length})
          </button>
        </div>

        {/* Activities List */}
        {filteredActivities.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
            <Smile className="w-8 h-8 text-navy-300 mx-auto" />
            <h3 className="text-sm font-bold text-navy-900">No activities in this category</h3>
            <p className="text-xs text-navy-500">
              Click &ldquo;Add Activity&rdquo; above to create a gentle care routine.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredActivities.map((activity) => {
              const isSkin = activity.category === 'skin_care';
              const isHair = activity.category === 'hair_care';

              return (
                <div
                  key={activity.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                    activity.completedToday
                      ? 'bg-emerald-50/40 border-emerald-200 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Header: Checkbox + Title + Category Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleToggleActivity(activity.id)}
                          aria-label={
                            activity.completedToday
                              ? `Mark ${activity.name} as incomplete`
                              : `Mark ${activity.name} as complete`
                          }
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            activity.completedToday
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 hover:border-teal-500 bg-white'
                          }`}
                        >
                          {activity.completedToday && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </button>

                        <div>
                          <h3
                            className={`text-sm font-bold ${
                              activity.completedToday
                                ? 'text-emerald-950 line-through opacity-80'
                                : 'text-navy-950'
                            }`}
                          >
                            {activity.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                isSkin
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : isHair
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : 'bg-teal-50 text-teal-700 border border-teal-200'
                              }`}
                            >
                              {activity.category.replace('_', ' ')}
                            </span>
                            <span className="text-[11px] text-navy-500 font-medium">
                              &bull; {activity.frequency}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Completed Today Badge */}
                      {activity.completedToday && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                          Done
                        </span>
                      )}
                    </div>

                    {/* Optional User Notes */}
                    {activity.notes && (
                      <p className="text-xs text-navy-600 bg-slate-50/80 p-2 rounded-lg border border-slate-200/50 leading-relaxed">
                        {activity.notes}
                      </p>
                    )}
                  </div>

                  {/* Card Footer: Timestamp & Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      {activity.completedToday && activity.completedAt ? (
                        <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Done today at {activity.completedAt}
                        </span>
                      ) : (
                        <span className="text-[11px] text-navy-400">Pending today</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(activity)}
                        className="p-1.5 rounded-lg text-navy-500 hover:text-navy-900 hover:bg-slate-100 transition-colors"
                        title="Edit activity"
                        aria-label={`Edit ${activity.name}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingActivity(activity)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                        title="Delete activity"
                        aria-label={`Delete ${activity.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 4. WELLNESS HISTORY (Requirement 4) */}
      {/* --------------------------------------------------------------------- */}
      <section
        aria-labelledby="history-section-title"
        className="safebite-card p-5 sm:p-6 bg-white border border-slate-200/90 rounded-2xl shadow-subtle space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-navy-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </span>
              <h2 id="history-section-title" className="text-lg font-bold text-navy-950">
                Today&rsquo;s Wellness History
              </h2>
            </div>
            <p className="text-xs text-navy-500 mt-0.5">
              Summary of completed self-care activities and hydration entries logged today.
            </p>
          </div>

          <span className="text-[11px] font-semibold text-navy-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 self-start sm:self-auto">
            Session History &bull; React State Only
          </span>
        </div>

        {/* History Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Hydration Log Timeline */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-teal-600" />
                Water Log ({hydrationGlasses} glasses)
              </span>
              <span className="text-[11px] font-semibold text-teal-700">
                {hydrationProgressPercent}% of Goal
              </span>
            </div>

            {hydrationLogs.length === 0 ? (
              <p className="text-xs text-navy-400 italic">No glasses recorded today yet.</p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {hydrationLogs.map((time, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-white border border-slate-200/60"
                  >
                    <span className="text-navy-700 font-medium">Glass #{idx + 1} (~250ml)</span>
                    <span className="text-navy-400 text-[11px] font-mono">{time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Activities Log */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Completed Activities ({completedActivitiesToday.length})
              </span>
              <span className="text-[11px] font-semibold text-navy-500">
                {completedActivitiesToday.length} of {activities.length} completed
              </span>
            </div>

            {completedActivitiesToday.length === 0 ? (
              <p className="text-xs text-navy-400 italic">
                No routine activities completed yet today.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {completedActivitiesToday.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-white border border-emerald-100"
                  >
                    <span className="text-navy-900 font-semibold truncate max-w-[200px]">
                      {act.name}
                    </span>
                    <span className="text-emerald-700 text-[11px] font-medium shrink-0">
                      {act.completedAt || 'Today'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Demo Persistence Notice (Requirement 4 & 9) */}
        <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 text-[11px] text-amber-900 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>
            <strong>Demo Storage Notice:</strong> Wellness history and hydration are stored in
            shared React memory for this session. Persistent cloud/database storage is not
            connected; refreshing your browser may reset values to default fictional demo data.
          </span>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* ADD / EDIT ACTIVITY MODAL (Requirement 3) */}
      {/* --------------------------------------------------------------------- */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-activity-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/50 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 id="modal-activity-title" className="text-base font-bold text-navy-950">
                {editingActivity ? 'Edit Routine Activity' : 'Add Routine Activity'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-navy-400 hover:text-navy-700 hover:bg-slate-100"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveActivity} className="space-y-4">
              {/* Activity Name */}
              <div className="space-y-1">
                <label
                  htmlFor="activity-name-field"
                  className="text-xs font-bold text-navy-900 block"
                >
                  Activity Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="activity-name-field"
                  type="text"
                  required
                  placeholder="e.g. Fragrance-Free Gentle Moisturizer"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label
                  htmlFor="activity-category-field"
                  className="text-xs font-bold text-navy-900 block"
                >
                  Routine Category
                </label>
                <select
                  id="activity-category-field"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as RoutineActivityCategory,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 bg-white"
                >
                  <option value="skin_care">Skin Care (Cleanser, Moisturizer, Sunscreen)</option>
                  <option value="hair_care">Hair &amp; Scalp Care (Gentle Wash, Rinse)</option>
                  <option value="general_wellness">General Wellness &amp; Mindfulness</option>
                </select>
              </div>

              {/* Frequency */}
              <div className="space-y-1">
                <label
                  htmlFor="activity-frequency-field"
                  className="text-xs font-bold text-navy-900 block"
                >
                  Frequency
                </label>
                <input
                  id="activity-frequency-field"
                  type="text"
                  placeholder="e.g. Daily morning, 2–3 times per week"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                />
                <div className="flex flex-wrap gap-1 mt-1">
                  {FREQUENCY_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormData({ ...formData, frequency: preset })}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-navy-600 hover:bg-slate-200 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label
                  htmlFor="activity-notes-field"
                  className="text-xs font-bold text-navy-900 block"
                >
                  Notes &amp; Safety Checks (Optional)
                </label>
                <textarea
                  id="activity-notes-field"
                  rows={2}
                  placeholder="e.g. Ensure product label is free of nut oils or fragrance allergens."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-navy-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs transition-colors"
                >
                  {editingActivity ? 'Save Changes' : 'Add Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* DELETE CONFIRMATION MODAL (Requirement 3) */}
      {/* --------------------------------------------------------------------- */}
      {deletingActivity && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-delete-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/50 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 id="modal-delete-title" className="text-base font-bold text-navy-950">
                  Delete Activity?
                </h3>
                <span className="text-xs text-navy-500">This action cannot be undone.</span>
              </div>
            </div>

            <p className="text-xs text-navy-600">
              Are you sure you want to remove &ldquo;<strong>{deletingActivity.name}</strong>&rdquo;
              from your wellness routine?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingActivity(null)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-navy-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs"
              >
                Delete Activity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* SET HYDRATION GOAL MODAL (Requirement 2) */}
      {/* --------------------------------------------------------------------- */}
      {isGoalModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-goal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/50 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xs w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 id="modal-goal-title" className="text-sm font-bold text-navy-950">
                Set Daily Water Goal
              </h3>
              <button
                type="button"
                onClick={() => setIsGoalModalOpen(false)}
                className="p-1 rounded-lg text-navy-400 hover:text-navy-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="hydration-goal-input" className="text-xs text-navy-600 block">
                  Target Glasses per Day (approx. 250ml per glass):
                </label>
                <div className="flex items-center gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => setTempGoal((prev) => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-xl border border-slate-200 text-navy-700 font-bold hover:bg-slate-100 flex items-center justify-center"
                  >
                    -
                  </button>
                  <input
                    id="hydration-goal-input"
                    type="number"
                    min={1}
                    max={24}
                    value={tempGoal}
                    onChange={(e) => setTempGoal(Number(e.target.value) || 1)}
                    className="w-16 px-2 py-1 text-center font-bold text-lg rounded-xl border border-slate-200 text-navy-950"
                  />
                  <button
                    type="button"
                    onClick={() => setTempGoal((prev) => Math.min(24, prev + 1))}
                    className="w-8 h-8 rounded-xl border border-slate-200 text-navy-700 font-bold hover:bg-slate-100 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
                <p className="text-[11px] text-navy-400 text-center">
                  Total target: ~{tempGoal * 250} ml per day
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-navy-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WellnessPage;
