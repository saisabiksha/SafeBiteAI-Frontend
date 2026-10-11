import React, { useState } from 'react';
import {
  Bell,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Info,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Droplets,
  Sparkles,
  Scissors,
  Pill,
  HeartPulse,
  X,
  ShieldAlert,
  CalendarDays,
} from 'lucide-react';
import { mockDemoReminders } from '../data/mockData';
import type { Reminder, ReminderCategory, ReminderFrequency } from '../types';

interface ReminderFormData {
  title: string;
  category: ReminderCategory;
  dueDate: string;
  timeOfDay: string;
  frequency: ReminderFrequency;
  notes: string;
}

const CATEGORIES: { id: ReminderCategory; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'hydration', label: 'Hydration', icon: Droplets },
  { id: 'wellness', label: 'Wellness', icon: HeartPulse },
  { id: 'skin_care', label: 'Skin Care', icon: Sparkles },
  { id: 'hair_care', label: 'Hair Care', icon: Scissors },
  { id: 'medication', label: 'Medication', icon: Pill },
  { id: 'other', label: 'Other', icon: Bell },
];

const FREQUENCIES: { id: ReminderFrequency; label: string }[] = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'one_time', label: 'One-time' },
  { id: 'as_needed', label: 'As needed' },
];

// Helper functions defined outside component to ensure pure renders
const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCurrentFormattedTime = (): string => {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatTimeForDisplay = (timeStr: string): string => {
  if (!timeStr) return '09:00 AM';
  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    return timeStr;
  }
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parts[1] || '00';
  if (isNaN(hours)) return timeStr;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${String(displayHours).padStart(2, '0')}:${minutes} ${ampm}`;
};

const formatTimeForInput = (timeStr: string): string => {
  if (!timeStr) return '09:00';
  if (!timeStr.includes('AM') && !timeStr.includes('PM')) {
    return timeStr;
  }
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return '09:00';
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${minutes}`;
};

export const RemindersPage: React.FC = () => {
  const todayDateStr = getTodayDateString();

  // Reminders state initialized with demo data
  const [reminders, setReminders] = useState<Reminder[]>(() => [...mockDemoReminders]);

  // Tab & Category Filters
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | ReminderCategory>('all');

  // Modal Dialog States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [deletingReminder, setDeletingReminder] = useState<Reminder | null>(null);

  // Form State
  const [formData, setFormData] = useState<ReminderFormData>({
    title: '',
    category: 'medication',
    dueDate: todayDateStr,
    timeOfDay: '09:00',
    frequency: 'daily',
    notes: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // ---------------------------------------------------------------------------
  // Action Handlers
  // ---------------------------------------------------------------------------
  const handleToggleComplete = (id: string) => {
    const nowTime = getCurrentFormattedTime();
    setReminders((prev) =>
      prev.map((rem) => {
        if (rem.id === id) {
          const nextCompleted = !rem.completed;
          return {
            ...rem,
            completed: nextCompleted,
            completedAt: nextCompleted ? nowTime : undefined,
          };
        }
        return rem;
      })
    );
    triggerToast('Reminder status updated.');
  };

  const handleOpenAddModal = () => {
    setEditingReminder(null);
    setFormData({
      title: '',
      category: 'medication',
      dueDate: todayDateStr,
      timeOfDay: '09:00',
      frequency: 'daily',
      notes: '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rem: Reminder) => {
    setEditingReminder(rem);
    setFormData({
      title: rem.title,
      category: rem.category,
      dueDate: rem.dueDate || todayDateStr,
      timeOfDay: formatTimeForInput(rem.timeOfDay),
      frequency: rem.frequency,
      notes: rem.notes || '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = formData.title.trim();

    // Validation (Requirement 2)
    if (!trimmedTitle) {
      setFormError('Reminder title is required.');
      return;
    }

    if (!formData.dueDate) {
      setFormError('Please select a valid scheduled date.');
      return;
    }

    if (!formData.timeOfDay) {
      setFormError('Please specify a reminder time.');
      return;
    }

    // Check for past date on new one-time reminder
    if (!editingReminder && formData.frequency === 'one_time' && formData.dueDate < todayDateStr) {
      setFormError('One-time reminders cannot be scheduled for a past date.');
      return;
    }

    const formattedTime = formatTimeForDisplay(formData.timeOfDay);

    if (editingReminder) {
      // Update existing
      setReminders((prev) =>
        prev.map((rem) =>
          rem.id === editingReminder.id
            ? {
                ...rem,
                title: trimmedTitle,
                category: formData.category,
                dueDate: formData.dueDate,
                timeOfDay: formattedTime,
                frequency: formData.frequency,
                notes: formData.notes.trim() || undefined,
              }
            : rem
        )
      );
      triggerToast(`Updated reminder "${trimmedTitle}".`);
    } else {
      // Create new
      const newRem: Reminder = {
        id: `rem-${Date.now()}`,
        title: trimmedTitle,
        category: formData.category,
        dueDate: formData.dueDate,
        timeOfDay: formattedTime,
        frequency: formData.frequency,
        notes: formData.notes.trim() || undefined,
        completed: false,
        isActive: true,
      };
      setReminders((prev) => [newRem, ...prev]);
      triggerToast(`Created reminder "${trimmedTitle}".`);
    }

    setIsModalOpen(false);
    setEditingReminder(null);
    setFormError(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingReminder) return;
    setReminders((prev) => prev.filter((r) => r.id !== deletingReminder.id));
    triggerToast(`Deleted reminder "${deletingReminder.title}".`);
    setDeletingReminder(null);
  };

  const handleResetDemoData = () => {
    setReminders([...mockDemoReminders]);
    triggerToast('Reset reminders to default fictional demo schedule.');
  };

  // ---------------------------------------------------------------------------
  // Filtering & Partitioning (Requirement 1)
  // ---------------------------------------------------------------------------
  const todayReminders = reminders.filter(
    (r) => !r.completed && r.dueDate <= todayDateStr
  );
  const upcomingReminders = reminders.filter((r) => !r.completed && r.dueDate > todayDateStr);
  const completedReminders = reminders.filter((r) => r.completed);

  const filteredReminders = reminders.filter((r) => {
    // Tab filter
    if (activeTab === 'today' && (r.completed || r.dueDate > todayDateStr)) {
      return false;
    }
    if (activeTab === 'upcoming' && (r.completed || r.dueDate <= todayDateStr)) {
      return false;
    }
    if (activeTab === 'completed' && !r.completed) {
      return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && r.category !== selectedCategory) {
      return false;
    }

    return true;
  });

  const getCategoryBadgeClass = (category: ReminderCategory): string => {
    switch (category) {
      case 'medication':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'hydration':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'skin_care':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'hair_care':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'wellness':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-navy-700 border-slate-200';
    }
  };

  const getCategoryIcon = (category: ReminderCategory) => {
    const match = CATEGORIES.find((c) => c.id === category);
    if (!match) return <Bell className="w-4 h-4" />;
    const IconComp = match.icon;
    return <IconComp className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* --------------------------------------------------------------------- */}
      {/* PAGE HEADER */}
      {/* --------------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-2xl font-bold text-navy-950 tracking-tight">
              Safety &amp; Routine Reminders
            </h1>
            <span className="badge-teal text-xs">Alert Schedule</span>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-navy-600 border border-slate-200">
              In-App Demo &bull; Local State
            </span>
          </div>
          <p className="text-sm text-navy-500">
            Keep track of clinician-prescribed medication timings, auto-injector checks, and daily
            wellness habits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDemoData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-navy-600 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
            title="Reset reminders to initial demo data"
          >
            <RotateCcw className="w-3.5 h-3.5 text-navy-400" />
            <span>Reset Demo Data</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Reminder</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="p-3 rounded-xl bg-teal-accent-subtle border border-teal-accent-border text-teal-accent text-xs flex items-center gap-2 shadow-2xs transition-all animate-in fade-in"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* DEMO NOTICE & REMINDER BEHAVIOUR (Requirement 5) */}
      {/* --------------------------------------------------------------------- */}
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-navy-900 shadow-2xs space-y-2">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-xs font-bold text-navy-950">
              In-App Prototype Reminders Notice
            </h2>
            <p className="text-xs text-navy-700 leading-relaxed">
              These reminders are scheduled and displayed <strong>in-app only</strong> for this
              frontend demonstration. Background system push notifications and alarms are not
              connected; no external alerts are dispatched. Reminders are maintained in session
              React state and will reset upon browser refresh.
            </p>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* MEDICATION & ALLERGY SAFETY DISCLAIMER (Requirements 3 & 4) */}
      {/* --------------------------------------------------------------------- */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200/90 text-navy-900 shadow-2xs space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5 text-amber-700" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-amber-950">
              Medication &amp; Wellness Safety Guidance
            </h2>
            <p className="text-xs text-amber-900 leading-relaxed">
              <strong>Clinician Prescription Only:</strong> Enter medication reminders solely from
              your existing doctor-prescribed schedule. SafeBiteAI does <em>not</em> recommend
              medicines, calculate doses, adjust schedules, or advise starting or stopping any drug.
            </p>
            <p className="text-xs text-amber-950 font-semibold bg-amber-100/60 p-2 rounded-lg border border-amber-200/70">
              &ldquo;Follow your prescription and clinician&rsquo;s instructions. This reminder does
              not confirm whether a dose is medically appropriate.&rdquo;
            </p>
            <p className="text-[11px] text-amber-800 pt-0.5">
              * Hydration and wellness reminders are personal lifestyle aids. They do <strong>not</strong>{' '}
              prevent, treat, or desensitize allergic reactions or anaphylaxis.
            </p>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 1. REMINDERS DASHBOARD METRICS (Requirement 1) */}
      {/* --------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Active */}
        <div className="safebite-card p-4 bg-white border border-slate-200/90 rounded-2xl shadow-subtle flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-navy-400 uppercase tracking-wider block mb-1">
              Active Schedule
            </span>
            <div className="text-2xl font-extrabold text-navy-950">
              {todayReminders.length + upcomingReminders.length}
            </div>
            <p className="text-[11px] text-navy-500 mt-0.5">Pending reminder alerts</p>
          </div>
          <span className="text-[10px] font-semibold text-teal-700 mt-2 block">
            {reminders.length} total registered
          </span>
        </div>

        {/* Metric 2: Due Today */}
        <div className="safebite-card p-4 bg-white border border-slate-200/90 rounded-2xl shadow-subtle flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-navy-400 uppercase tracking-wider block mb-1">
              Due Today
            </span>
            <div className="text-2xl font-extrabold text-amber-600">
              {todayReminders.length}
            </div>
            <p className="text-[11px] text-navy-500 mt-0.5">Requires check or completion today</p>
          </div>
          <span className="text-[10px] font-bold text-amber-700 mt-2 block">
            {todayReminders.length > 0 ? 'Action needed today' : 'All today tasks completed'}
          </span>
        </div>

        {/* Metric 3: Upcoming */}
        <div className="safebite-card p-4 bg-white border border-slate-200/90 rounded-2xl shadow-subtle flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-navy-400 uppercase tracking-wider block mb-1">
              Upcoming
            </span>
            <div className="text-2xl font-extrabold text-navy-950">
              {upcomingReminders.length}
            </div>
            <p className="text-[11px] text-navy-500 mt-0.5">Scheduled for upcoming dates</p>
          </div>
          <span className="text-[10px] font-semibold text-blue-700 mt-2 block">
            Future alerts &amp; expiry checks
          </span>
        </div>

        {/* Metric 4: Completed */}
        <div className="safebite-card p-4 bg-white border border-slate-200/90 rounded-2xl shadow-subtle flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-navy-400 uppercase tracking-wider block mb-1">
              Completed
            </span>
            <div className="text-2xl font-extrabold text-emerald-600">
              {completedReminders.length}
            </div>
            <p className="text-[11px] text-navy-500 mt-0.5">Checked off this session</p>
          </div>
          <span className="text-[10px] font-semibold text-emerald-700 mt-2 block">
            {Math.round((completedReminders.length / (reminders.length || 1)) * 100)}% completion rate
          </span>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* FILTER TABS & CATEGORY SELECTOR */}
      {/* --------------------------------------------------------------------- */}
      <div className="safebite-card p-4 bg-white border border-slate-200/90 rounded-2xl shadow-subtle space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Main Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                activeTab === 'all'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-navy-600 hover:bg-slate-200/80'
              }`}
            >
              All ({reminders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('today')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                activeTab === 'today'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-navy-600 hover:bg-slate-200/80'
              }`}
            >
              Today&rsquo;s ({todayReminders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upcoming')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                activeTab === 'upcoming'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-navy-600 hover:bg-slate-200/80'
              }`}
            >
              Upcoming ({upcomingReminders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                activeTab === 'completed'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-navy-600 hover:bg-slate-200/80'
              }`}
            >
              Completed ({completedReminders.length})
            </button>
          </div>

          {/* Category Filter Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="filter-category-select" className="text-xs text-navy-500 font-semibold shrink-0">
              Category:
            </label>
            <select
              id="filter-category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as 'all' | ReminderCategory)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-navy-900 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <option value="all">All Categories</option>
              <option value="medication">Medication</option>
              <option value="hydration">Hydration</option>
              <option value="skin_care">Skin Care</option>
              <option value="hair_care">Hair Care</option>
              <option value="wellness">Wellness</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* REMINDERS LIST (Requirements 1 & 2) */}
      {/* --------------------------------------------------------------------- */}
      <div className="space-y-3">
        {filteredReminders.length === 0 ? (
          <div className="safebite-card p-10 text-center bg-white border border-slate-200/90 rounded-2xl shadow-subtle space-y-2">
            <CalendarDays className="w-8 h-8 text-navy-300 mx-auto" />
            <h2 className="text-sm font-bold text-navy-900">No reminders found</h2>
            <p className="text-xs text-navy-500 max-w-sm mx-auto">
              There are no reminders matching your current filter. Click &ldquo;Create Reminder&rdquo;
              to schedule an alert.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredReminders.map((rem) => {
              const isToday = rem.dueDate === todayDateStr;
              const isOverdue = !rem.completed && rem.dueDate < todayDateStr;
              const isUpcoming = !rem.completed && rem.dueDate > todayDateStr;

              return (
                <div
                  key={rem.id}
                  className={`safebite-card p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    rem.completed
                      ? 'bg-slate-50/70 border-slate-200 opacity-75'
                      : isToday
                      ? 'bg-white border-amber-200/80 shadow-2xs'
                      : 'bg-white border-slate-200/90 shadow-subtle hover:border-slate-300'
                  }`}
                >
                  {/* Left: Checkbox & Reminder Details */}
                  <div className="flex items-start gap-3.5 flex-1">
                    {/* Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(rem.id)}
                      aria-label={
                        rem.completed
                          ? `Mark "${rem.title}" as incomplete`
                          : `Mark "${rem.title}" as complete`
                      }
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        rem.completed
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-teal-500 bg-white'
                      }`}
                    >
                      {rem.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </button>

                    {/* Content */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2
                          className={`text-sm font-bold ${
                            rem.completed
                              ? 'text-navy-500 line-through'
                              : 'text-navy-950'
                          }`}
                        >
                          {rem.title}
                        </h2>

                        {/* Category Tag */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border ${getCategoryBadgeClass(
                            rem.category
                          )}`}
                        >
                          {getCategoryIcon(rem.category)}
                          {rem.category.replace('_', ' ')}
                        </span>

                        {/* Frequency Tag */}
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-navy-600 border border-slate-200/60 capitalize">
                          {rem.frequency.replace('_', ' ')}
                        </span>

                        {/* Status Badge */}
                        {rem.completed ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Completed
                          </span>
                        ) : isOverdue ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200">
                            Past Due
                          </span>
                        ) : isToday ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                            Due Today
                          </span>
                        ) : isUpcoming ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                            Upcoming
                          </span>
                        ) : null}
                      </div>

                      {/* Notes / Clinician Direction */}
                      {rem.notes && (
                        <p className="text-xs text-navy-600 bg-slate-50 p-2 rounded-lg border border-slate-200/60 leading-relaxed max-w-2xl">
                          {rem.notes}
                        </p>
                      )}

                      {/* Completed At Tag */}
                      {rem.completed && rem.completedAt && (
                        <span className="text-[11px] text-emerald-700 font-medium block">
                          Completed at {rem.completedAt}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Date, Time & Actions */}
                  <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-2 text-xs font-mono font-semibold text-navy-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                      <Clock className="w-3.5 h-3.5 text-teal-accent shrink-0" />
                      <span>{rem.timeOfDay}</span>
                      <span className="text-slate-300">&bull;</span>
                      <Calendar className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                      <span>{rem.dueDate}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(rem)}
                        className="p-1.5 rounded-lg text-navy-500 hover:text-navy-900 hover:bg-slate-100 transition-colors"
                        title="Edit reminder"
                        aria-label={`Edit ${rem.title}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingReminder(rem)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                        title="Delete reminder"
                        aria-label={`Delete ${rem.title}`}
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
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* CREATE / EDIT REMINDER MODAL (Requirement 2 & 3) */}
      {/* --------------------------------------------------------------------- */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-reminder-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/50 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 id="modal-reminder-title" className="text-base font-bold text-navy-950">
                {editingReminder ? 'Edit Reminder' : 'Create a Reminder'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
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

            <form onSubmit={handleSaveReminder} className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label htmlFor="reminder-title-input" className="text-xs font-bold text-navy-900 block">
                  Reminder Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="reminder-title-input"
                  type="text"
                  required
                  placeholder="e.g. Afternoon Antihistamine Maintenance Dose"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label htmlFor="reminder-category-input" className="text-xs font-bold text-navy-900 block">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  id="reminder-category-input"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as ReminderCategory })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 bg-white"
                >
                  <option value="medication">Medication (Clinician Prescribed)</option>
                  <option value="hydration">Hydration (Water Intake)</option>
                  <option value="skin_care">Skin Care (Moisturizer / Sunscreen)</option>
                  <option value="hair_care">Hair Care (Gentle Wash / Rinse)</option>
                  <option value="wellness">Wellness (Mindfulness / Check-in)</option>
                  <option value="other">Other (Auto-injector Check / Custom)</option>
                </select>
              </div>

              {/* Medication Safety Callout inside Form (Requirement 3) */}
              {formData.category === 'medication' && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-navy-900 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Medication Schedule Policy</span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    Enter medication reminders <strong>only from your existing clinician-prescribed schedule</strong>.
                    SafeBiteAI does not recommend drugs, calculate dosages, modify frequencies, or
                    advise starting/stopping medication.
                  </p>
                  <p className="text-[11px] text-amber-950 font-semibold bg-white/70 p-2 rounded-lg border border-amber-200/80">
                    &ldquo;Follow your prescription and clinician&rsquo;s instructions. This reminder
                    does not confirm whether a dose is medically appropriate.&rdquo;
                  </p>
                </div>
              )}

              {/* Date & Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Date */}
                <div className="space-y-1">
                  <label htmlFor="reminder-date-input" className="text-xs font-bold text-navy-900 block">
                    Scheduled Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="reminder-date-input"
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 bg-white"
                  />
                </div>

                {/* Time */}
                <div className="space-y-1">
                  <label htmlFor="reminder-time-input" className="text-xs font-bold text-navy-900 block">
                    Time of Day <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="reminder-time-input"
                    type="time"
                    required
                    value={formData.timeOfDay}
                    onChange={(e) => setFormData({ ...formData, timeOfDay: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 bg-white"
                  />
                </div>
              </div>

              {/* Frequency */}
              <div className="space-y-1">
                <label htmlFor="reminder-frequency-input" className="text-xs font-bold text-navy-900 block">
                  Repeat Frequency
                </label>
                <select
                  id="reminder-frequency-input"
                  value={formData.frequency}
                  onChange={(e) =>
                    setFormData({ ...formData, frequency: e.target.value as ReminderFrequency })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 bg-white"
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label htmlFor="reminder-notes-input" className="text-xs font-bold text-navy-900 block">
                  Optional Notes / Clinical Instructions
                </label>
                <textarea
                  id="reminder-notes-input"
                  rows={2}
                  placeholder="e.g. Take with a full glass of water after dinner as advised by Dr. Patel."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 resize-none"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-navy-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs transition-colors"
                >
                  {editingReminder ? 'Save Changes' : 'Create Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* DELETE CONFIRMATION MODAL (Requirement 2) */}
      {/* --------------------------------------------------------------------- */}
      {deletingReminder && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-delete-rem-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/50 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 id="modal-delete-rem-title" className="text-base font-bold text-navy-950">
                  Delete Reminder?
                </h3>
                <span className="text-xs text-navy-500">This action cannot be undone.</span>
              </div>
            </div>

            <p className="text-xs text-navy-600">
              Are you sure you want to delete &ldquo;<strong>{deletingReminder.title}</strong>&rdquo;
              from your reminders schedule?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingReminder(null)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-navy-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs"
              >
                Delete Reminder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemindersPage;
