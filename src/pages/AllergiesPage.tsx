import React, { useState } from 'react';
import {
  HeartPulse,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Info,
  X,
  Tag,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { useAllergies } from '../context';
import type { Allergy, AllergenCategory, AllergySeverity } from '../types';

interface AllergyFormData {
  allergenName: string;
  category: AllergenCategory;
  customCategory: string;
  severity: AllergySeverity;
  aliasesInput: string;
  symptomsInput: string;
  diagnosedByDoctor: boolean;
  notes: string;
}

const CATEGORY_OPTIONS: { value: AllergenCategory; label: string }[] = [
  { value: 'peanuts', label: 'Nuts - Peanuts' },
  { value: 'tree_nuts', label: 'Nuts - Tree Nuts (Almond, Walnut, Cashew, etc.)' },
  { value: 'dairy', label: 'Dairy / Milk' },
  { value: 'eggs', label: 'Eggs' },
  { value: 'crustaceans', label: 'Seafood - Shellfish & Crustaceans (Shrimp, Crab)' },
  { value: 'fish', label: 'Seafood - Finfish (Salmon, Tuna, Cod)' },
  { value: 'wheat_gluten', label: 'Grains - Wheat & Gluten' },
  { value: 'soy', label: 'Soy / Soybeans' },
  { value: 'sesame', label: 'Sesame' },
  { value: 'mustard', label: 'Mustard' },
  { value: 'celery', label: 'Celery' },
  { value: 'sulphites', label: 'Sulphites' },
  { value: 'lupin', label: 'Lupin' },
  { value: 'molluscs', label: 'Molluscs (Clams, Mussels, Squid)' },
  { value: 'other', label: 'Other / Custom Category...' },
];

const INITIAL_FORM_DATA: AllergyFormData = {
  allergenName: '',
  category: 'peanuts',
  customCategory: '',
  severity: 'moderate',
  aliasesInput: '',
  symptomsInput: '',
  diagnosedByDoctor: false,
  notes: '',
};

export const AllergiesPage: React.FC = () => {
  const { allergies, addAllergy, updateAllergy, deleteAllergy } = useAllergies();

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAllergyId, setEditingAllergyId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AllergyFormData>(INITIAL_FORM_DATA);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Delete Confirmation state
  const [allergyToDelete, setAllergyToDelete] = useState<Allergy | null>(null);

  // Open form for adding
  const handleOpenAdd = () => {
    setEditingAllergyId(null);
    setFormData(INITIAL_FORM_DATA);
    setFormError(null);
    setIsFormOpen(true);
  };

  // Open form for editing
  const handleOpenEdit = (allergy: Allergy) => {
    setEditingAllergyId(allergy.id);
    setFormData({
      allergenName: allergy.allergenName,
      category: allergy.category,
      customCategory: allergy.customCategory || '',
      severity: allergy.severity,
      aliasesInput: allergy.aliases ? allergy.aliases.join(', ') : '',
      symptomsInput: allergy.symptoms ? allergy.symptoms.join(', ') : '',
      diagnosedByDoctor: allergy.diagnosedByDoctor,
      notes: allergy.notes || '',
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAllergyId(null);
    setFormError(null);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = formData.allergenName.trim();
    if (!trimmedName) {
      setFormError('Allergen name is required.');
      return;
    }

    if (formData.category === 'other' && !formData.customCategory.trim()) {
      setFormError('Please enter a custom category name or select an existing category.');
      return;
    }

    // Parse aliases
    const aliasesArray = formData.aliasesInput
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    // If no aliases provided, include lowercased name by default
    if (aliasesArray.length === 0) {
      aliasesArray.push(trimmedName.toLowerCase());
    }

    // Parse symptoms
    const symptomsArray = formData.symptomsInput
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (editingAllergyId) {
      // Update existing allergy
      const result = updateAllergy(editingAllergyId, {
        allergenName: trimmedName,
        category: formData.category,
        customCategory: formData.category === 'other' ? formData.customCategory.trim() : undefined,
        severity: formData.severity,
        aliases: aliasesArray,
        symptoms: symptomsArray,
        diagnosedByDoctor: formData.diagnosedByDoctor,
        notes: formData.notes.trim() || undefined,
      });

      if (!result.success) {
        setFormError(result.error || 'Failed to update allergy entry.');
        return;
      }

      setActionSuccess(`Updated allergen entry for "${trimmedName}".`);
    } else {
      // Add new allergy
      const result = addAllergy({
        allergenName: trimmedName,
        category: formData.category,
        customCategory: formData.category === 'other' ? formData.customCategory.trim() : undefined,
        severity: formData.severity,
        aliases: aliasesArray,
        symptoms: symptomsArray,
        diagnosedByDoctor: formData.diagnosedByDoctor,
        notes: formData.notes.trim() || undefined,
        diagnosedDate: new Date().toISOString().split('T')[0],
      });

      if (!result.success) {
        setFormError(result.error || 'Failed to add allergy entry.');
        return;
      }

      setActionSuccess(`Added "${trimmedName}" to your active allergy profile.`);
    }

    setIsFormOpen(false);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  // Delete confirmation handlers
  const handleConfirmDelete = () => {
    if (allergyToDelete) {
      deleteAllergy(allergyToDelete.id);
      setActionSuccess(`Removed "${allergyToDelete.allergenName}" from active profile.`);
      setAllergyToDelete(null);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl font-sans antialiased">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HeartPulse className="w-6 h-6 text-teal-accent" />
            <h1 className="text-2xl font-bold text-navy-950 tracking-tight">
              My Registered Allergies
            </h1>
            <span className="badge-teal text-xs">{allergies.length} Active Filters</span>
          </div>
          <p className="text-sm text-navy-500">
            Manage your allergen profile. Changes directly update screening filters in Food Checker and Exposure Assistant.
          </p>
        </div>

        {/* Add Allergy Button */}
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-accent hover:bg-teal-accent-hover text-white text-xs font-semibold shadow-subtle transition-colors cursor-pointer self-start sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
        >
          <Plus className="w-4 h-4" />
          <span>Add Allergy</span>
        </button>
      </div>

      {/* Demo Session Notice (Requirement 9) */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-navy-700 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-teal-accent shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-navy-950">Demo Session Notice:</strong> Changes you make
          here are saved in your current browser session state and immediately update the Food
          Checker and Exposure Assistant. Because cloud database persistence is not connected,
          refreshing the page will reset entries to the baseline demo profile.
        </div>
      </div>

      {/* Medical Diagnosis & Packaging Safety Reminder (Requirements 10 & 11) */}
      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p>
            <strong className="font-bold text-amber-950">Medical Notice:</strong> Adding, editing,
            or deleting an allergen in this application is for ingredient screening customization
            only and does <strong>not change or replace a clinical medical diagnosis</strong>.
          </p>
          <p className="text-amber-900">
            SafeBiteAI cannot guarantee food safety. Always verify physical product labels and check
            for cross-contact warning statements on packaging.
          </p>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccess && (
        <div
          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in shadow-subtle"
          role="status"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{actionSuccess}</span>
        </div>
      )}

      {/* ALLERGIES GRID CARDS (Requirement 1 & 2) */}
      {allergies.length === 0 ? (
        <div className="safebite-card p-12 text-center bg-white border border-slate-200/90 rounded-2xl shadow-subtle space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-navy-400 flex items-center justify-center mx-auto">
            <HeartPulse className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-navy-950">No Allergies Registered</h2>
          <p className="text-xs text-navy-500 max-w-sm mx-auto">
            You currently have no active allergen filters. Click &ldquo;Add Allergy&rdquo; above to register an allergen for screening.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allergies.map((allergy) => {
            const displayCategory =
              allergy.category === 'other' && allergy.customCategory
                ? allergy.customCategory
                : allergy.category.replace('_', ' ');

            return (
              <div
                key={allergy.id}
                className="safebite-card p-5 bg-white border border-slate-200/90 rounded-2xl shadow-subtle flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
              >
                {/* Card Top: Title, Category & Severity */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-base font-bold text-navy-950 leading-tight">
                        {allergy.allergenName}
                      </h2>
                      <span className="text-[11px] font-semibold text-teal-accent capitalize block mt-0.5">
                        {displayCategory}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
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

                  {/* Known Aliases (Requirement 2) */}
                  <div>
                    <span className="text-[10px] font-semibold text-navy-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                      <Tag className="w-3 h-3" />
                      Known Aliases Screened:
                    </span>
                    {allergy.aliases && allergy.aliases.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                        {allergy.aliases.map((alias, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-navy-700 border border-slate-200/60 font-mono"
                          >
                            {alias}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-navy-400 italic">No custom aliases recorded</span>
                    )}
                  </div>

                  {/* Optional User Notes (Requirement 2) */}
                  {allergy.notes && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-navy-600">
                      <strong className="text-navy-800 font-semibold block text-[11px]">User Notes:</strong>
                      {allergy.notes}
                    </div>
                  )}

                  {/* Documented Symptoms (if any) */}
                  {allergy.symptoms && allergy.symptoms.length > 0 && (
                    <div>
                      <span className="text-[10px] font-semibold text-navy-400 uppercase tracking-wider block mb-1">
                        Typical Symptoms:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {allergy.symptoms.map((sym, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded bg-blue-accent-subtle text-blue-accent border border-blue-accent-border font-medium"
                          >
                            {sym}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer: Physician Status & Actions (Requirement 4) */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-navy-500">
                    {allergy.diagnosedByDoctor ? (
                      <span className="flex items-center gap-1 text-teal-accent font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Dr. Verified
                      </span>
                    ) : (
                      <span>Self-Reported</span>
                    )}
                  </div>

                  {/* Edit & Delete Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(allergy)}
                      className="p-1.5 rounded-lg text-navy-600 hover:text-teal-accent hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit this allergy entry"
                      aria-label={`Edit ${allergy.allergenName}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAllergyToDelete(allergy)}
                      className="p-1.5 rounded-lg text-navy-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete this allergy entry"
                      aria-label={`Delete ${allergy.allergenName}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT ALLERGY MODAL (Requirement 3, 4, 5, 6) */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="allergy-form-title"
        >
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-card-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 id="allergy-form-title" className="text-base font-bold text-navy-950 flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-teal-accent" />
                <span>{editingAllergyId ? 'Edit Allergy Entry' : 'Add New Allergy Entry'}</span>
              </h2>
              <button
                type="button"
                onClick={handleCloseForm}
                className="p-1.5 rounded-lg text-navy-400 hover:text-navy-800 hover:bg-slate-100 cursor-pointer"
                aria-label="Close form"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveForm} className="space-y-4">
              {/* Allergen Name */}
              <div>
                <label
                  htmlFor="form-allergen-name"
                  className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1"
                >
                  Allergen Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="form-allergen-name"
                  type="text"
                  value={formData.allergenName}
                  onChange={(e) => setFormData({ ...formData, allergenName: e.target.value })}
                  placeholder="e.g. Cashews, Cow Milk, Gluten, Mustard"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-navy-900 bg-white placeholder:text-navy-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                />
              </div>

              {/* Category (Requirement 5) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="form-allergen-category"
                    className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1"
                  >
                    Allergen Category
                  </label>
                  <select
                    id="form-allergen-category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as AllergenCategory })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-navy-900 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Severity Level */}
                <div>
                  <label
                    htmlFor="form-allergen-severity"
                    className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1"
                  >
                    Severity Level
                  </label>
                  <select
                    id="form-allergen-severity"
                    value={formData.severity}
                    onChange={(e) =>
                      setFormData({ ...formData, severity: e.target.value as AllergySeverity })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-navy-900 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                  >
                    <option value="mild">Mild (Localized rash, itchy mouth)</option>
                    <option value="moderate">Moderate (Hives, swelling, digestive upset)</option>
                    <option value="severe">Severe (Prescribed auto-injector / Anaphylaxis risk)</option>
                    <option value="life-threatening">Life-Threatening (High-grade reaction)</option>
                  </select>
                </div>
              </div>

              {/* Custom Category Input if 'other' is selected (Requirement 5) */}
              {formData.category === 'other' && (
                <div>
                  <label
                    htmlFor="form-custom-category"
                    className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1"
                  >
                    Custom Category Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="form-custom-category"
                    type="text"
                    value={formData.customCategory}
                    onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                    placeholder="e.g. Legumes, Nightshades, Seed Oils"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-navy-900 bg-white placeholder:text-navy-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                  />
                </div>
              )}

              {/* Known Aliases (Requirement 2) */}
              <div>
                <label
                  htmlFor="form-allergen-aliases"
                  className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1"
                >
                  Known Aliases &amp; Alternate Names (Comma-separated)
                </label>
                <input
                  id="form-allergen-aliases"
                  type="text"
                  value={formData.aliasesInput}
                  onChange={(e) => setFormData({ ...formData, aliasesInput: e.target.value })}
                  placeholder="e.g. casein, whey, lactose, curd, butter (for dairy)"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-navy-900 bg-white placeholder:text-navy-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                />
                <p className="mt-1 text-[11px] text-navy-400">
                  Food Checker uses these keywords to catch hidden or technical ingredient aliases.
                </p>
              </div>

              {/* Symptoms Input */}
              <div>
                <label
                  htmlFor="form-allergen-symptoms"
                  className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1"
                >
                  Typical Symptoms (Comma-separated, Optional)
                </label>
                <input
                  id="form-allergen-symptoms"
                  type="text"
                  value={formData.symptomsInput}
                  onChange={(e) => setFormData({ ...formData, symptomsInput: e.target.value })}
                  placeholder="e.g. hives, stomach cramps, facial swelling"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-navy-900 bg-white placeholder:text-navy-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                />
              </div>

              {/* User Notes (Requirement 2) */}
              <div>
                <label
                  htmlFor="form-allergen-notes"
                  className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1"
                >
                  User Notes &amp; Clinical Context (Optional)
                </label>
                <textarea
                  id="form-allergen-notes"
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Confirmed by skin prick test in 2023. Prescribed EpiPen."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-navy-900 bg-white placeholder:text-navy-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                />
              </div>

              {/* Doctor Diagnosed Checkbox */}
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.diagnosedByDoctor}
                  onChange={(e) =>
                    setFormData({ ...formData, diagnosedByDoctor: e.target.checked })
                  }
                  className="w-4 h-4 text-teal-accent rounded border-slate-300 focus:ring-teal-500"
                />
                <span className="text-xs text-navy-800 font-medium">
                  Formally diagnosed by a licensed allergist or physician
                </span>
              </label>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-navy-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-accent hover:bg-teal-accent-hover text-white text-xs font-semibold shadow-subtle transition-colors cursor-pointer"
                >
                  {editingAllergyId ? 'Save Changes' : 'Register Allergen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG (Requirement 7) */}
      {allergyToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-xs animate-in fade-in"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-desc"
        >
          <div className="w-full max-w-md bg-white border border-rose-200 rounded-2xl shadow-card-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 id="delete-dialog-title" className="text-base font-bold text-navy-950">
                  Delete Allergen Entry?
                </h2>
                <p className="text-xs text-navy-500">
                  Confirm removal from your active safety profile
                </p>
              </div>
            </div>

            <p id="delete-dialog-desc" className="text-xs text-navy-700 leading-relaxed">
              Are you sure you want to remove <strong>&ldquo;{allergyToDelete.allergenName}&rdquo;</strong> from your registered allergies?
              This will immediately disable automated safety filters for this allergen in the Food Checker and Exposure Assistant.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAllergyToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-navy-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-subtle cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllergiesPage;
