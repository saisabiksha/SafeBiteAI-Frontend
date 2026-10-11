import React, { useState, useRef } from 'react';
import {
  ScanLine,
  Search,
  Upload,
  X,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Utensils,
  Image as ImageIcon,
  RotateCcw,
  Check,
} from 'lucide-react';
import { useAllergies } from '../context';
import {
  checkIngredientsSafety,
  type AllergenMatchResult,
} from '../components/food/allergenMatcher';

export const FoodCheckerPage: React.FC = () => {
  const { allergies: userAllergies } = useAllergies();

  // Form states
  const [ingredientText, setIngredientText] = useState('');
  const [dishName, setDishName] = useState('');
  const [checkResult, setCheckResult] = useState<AllergenMatchResult | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  // Image upload states
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset sample buttons for quick testing
  const samplePresets = [
    {
      label: 'Peanut Snack (Unsafe)',
      text: 'Rolled oats, cane sugar, peanut butter (roasted peanuts, salt), vegetable oil, sea salt.',
    },
    {
      label: 'Sesame & Shrimp (Unsafe)',
      text: 'Rice noodles, shrimp powder, garlic, sesame oil, soy sauce, green onion.',
    },
    {
      label: 'Berry Oat Bar (Safe)',
      text: 'Whole grain rolled oats, organic tapioca syrup, dried cranberries, sunflower seeds, cinnamon.',
    },
    {
      label: 'Ambiguous Dressing (Ambiguous)',
      text: 'Water, soybean oil, vinegar, natural flavors, spices, xanthan gum.',
    },
  ];

  const handleApplyPreset = (text: string) => {
    setIngredientText(text);
    setCheckResult(null);
    setHasChecked(false);
  };

  const handleCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const result = checkIngredientsSafety(ingredientText, userAllergies);
    setCheckResult(result);
    setHasChecked(true);
  };

  const handleClear = () => {
    setIngredientText('');
    setCheckResult(null);
    setHasChecked(false);
  };

  // Image upload handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      setSelectedImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setSelectedImage(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-navy-950 tracking-tight">
              Food Safety Checker
            </h1>
            <span className="badge-teal text-xs">Deterministic AI Rules</span>
          </div>
          <p className="text-sm text-navy-500">
            Verify food ingredients against your active registered allergens ({userAllergies.length} active).
          </p>
        </div>

        {/* User Allergies Quick Badge Indicator */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-navy-500 font-medium mr-1">Active Filters:</span>
          {userAllergies.map((alg) => (
            <span
              key={alg.id}
              className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-navy-800 border border-slate-200"
            >
              {alg.allergenName}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Forms */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Manual Ingredient Entry Area */}
          <section
            className="safebite-card p-6 bg-white border border-slate-200/90 rounded-2xl shadow-subtle space-y-4"
            aria-labelledby="manual-check-heading"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-teal-accent" />
                <h2 id="manual-check-heading" className="text-base font-bold text-navy-950">
                  Manual Ingredient Verification
                </h2>
              </div>
              {ingredientText && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-navy-500 hover:text-navy-800 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>

            {/* Quick Test Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-navy-500 uppercase tracking-wider block">
                Quick Test Samples:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {samplePresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleApplyPreset(preset.text)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-accent-subtle hover:text-teal-accent-hover text-navy-700 transition-colors border border-slate-200/80 cursor-pointer text-left"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCheck} className="space-y-4">
              <div>
                <label
                  htmlFor="ingredients-textarea"
                  className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1.5"
                >
                  Paste or Type Ingredients List
                </label>
                <textarea
                  id="ingredients-textarea"
                  rows={5}
                  value={ingredientText}
                  onChange={(e) => {
                    setIngredientText(e.target.value);
                    if (hasChecked) setHasChecked(false);
                  }}
                  placeholder="e.g. Enriched wheat flour, sugar, peanut butter, palm oil, salt, natural flavors..."
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-sm text-navy-900 bg-white placeholder:text-navy-300 transition-colors focus:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 hover:border-slate-300 resize-y"
                  aria-describedby="ingredients-hint"
                />
                <p id="ingredients-hint" className="mt-1 text-[11px] text-navy-400">
                  Separate ingredients with commas or line breaks. Analyzes keywords and common aliases.
                </p>
              </div>

              {/* Check Ingredients Action Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-teal-accent hover:bg-teal-accent-hover text-white font-semibold text-sm shadow-subtle transition-all duration-150 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 cursor-pointer"
              >
                <ScanLine className="w-4 h-4" />
                <span>Check Ingredients</span>
              </button>
            </form>
          </section>

          {/* Restaurant Dish Name Field (Future Feature Placeholder) */}
          <section
            className="safebite-card p-6 bg-white border border-slate-200/90 rounded-2xl shadow-subtle space-y-3"
            aria-labelledby="dish-lookup-heading"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-blue-accent" />
                <h2 id="dish-lookup-heading" className="text-sm font-bold text-navy-950">
                  Restaurant &amp; Dish Lookup
                </h2>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-navy-600 border border-slate-200 uppercase tracking-wider">
                Upcoming Feature • Offline
              </span>
            </div>

            <div>
              <label
                htmlFor="dish-name-input"
                className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1"
              >
                Restaurant Dish Name
              </label>
              <div className="relative">
                <input
                  id="dish-name-input"
                  type="text"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  placeholder="e.g. Kung Pao Chicken from Dragon Express"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-navy-900 bg-slate-50/60 placeholder:text-navy-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-navy-500 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-accent shrink-0" />
                <span>
                  Automatic restaurant recipe breakdown is currently disconnected. Please paste the dish ingredients above for safety verification.
                </span>
              </p>
            </div>
          </section>

          {/* Food Label Image Upload Area with Preview */}
          <section
            className="safebite-card p-6 bg-white border border-slate-200/90 rounded-2xl shadow-subtle space-y-4"
            aria-labelledby="image-upload-heading"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-teal-accent" />
                <h2 id="image-upload-heading" className="text-sm font-bold text-navy-950">
                  Food Label Photo Upload
                </h2>
              </div>
              <span className="badge-blue text-[10px]">Preview Only</span>
            </div>

            {/* Clear disclaimer regarding AI/OCR */}
            <div className="p-3 rounded-xl bg-blue-accent-subtle border border-blue-accent-border flex items-start gap-2.5 text-xs text-navy-700">
              <Info className="w-4 h-4 text-blue-accent shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-navy-900 block mb-0.5">
                  Image Preview Notice:
                </strong>
                Direct AI/OCR text extraction from camera images is not yet connected. You can preview photos here, but please type or paste the ingredient list above to run the analysis.
              </div>
            </div>

            {/* Upload Area */}
            {!imagePreviewUrl ? (
              <div>
                <input
                  ref={fileInputRef}
                  id="food-label-file"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  aria-label="Upload food package label photo"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-6 border-2 border-dashed border-slate-200 hover:border-teal-accent-border rounded-xl flex flex-col items-center justify-center gap-2 bg-slate-50/50 hover:bg-teal-accent-subtle/30 transition-colors cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-navy-500 group-hover:text-teal-accent group-hover:border-teal-accent transition-colors shadow-subtle">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-semibold text-navy-800 block">
                      Click to choose a food label photo
                    </span>
                    <span className="text-[11px] text-navy-400">
                      PNG, JPG, or WEBP up to 10MB
                    </span>
                  </div>
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-accent" />
                    <span className="text-xs font-semibold text-navy-900 truncate max-w-xs">
                      {selectedImage?.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>

                <div className="rounded-lg overflow-hidden border border-slate-200 max-h-48 bg-slate-100 flex items-center justify-center">
                  <img
                    src={imagePreviewUrl}
                    alt="Food package label preview"
                    className="object-contain max-h-48 w-full"
                  />
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Verification Results Display */}
        <div className="lg:col-span-5 space-y-6">
          <section
            className="safebite-card p-6 bg-white border border-slate-200/90 rounded-2xl shadow-subtle space-y-4"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-navy-950">
                Verification Result
              </h2>
              {hasChecked && (
                <span className="text-[11px] text-navy-400 font-medium">
                  {checkResult?.parsedIngredients.length || 0} items parsed
                </span>
              )}
            </div>

            {!hasChecked || !checkResult ? (
              /* Idle Placeholder State */
              <div className="py-12 px-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-navy-400 flex items-center justify-center mx-auto">
                  <ScanLine className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-navy-800">
                    Awaiting Ingredients
                  </h3>
                  <p className="text-xs text-navy-500 max-w-xs mx-auto">
                    Enter an ingredient list or select one of the quick test presets to evaluate allergen safety.
                  </p>
                </div>
              </div>
            ) : (
              /* Active Analysis Results */
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Result Status Banner: One of 3 clear outcomes */}
                {checkResult.outcome === 'Potential Allergen Detected' && (
                  <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 space-y-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                      <h3 className="text-sm font-bold text-rose-950 uppercase tracking-tight">
                        Potential Allergen Detected
                      </h3>
                    </div>
                    <p className="text-xs text-rose-800 leading-relaxed font-medium">
                      {checkResult.summary}
                    </p>
                  </div>
                )}

                {checkResult.outcome === 'No Listed Allergen Identified' && (
                  <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 space-y-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-tight">
                        No Listed Allergen Identified
                      </h3>
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                      {checkResult.summary}
                    </p>
                  </div>
                )}

                {checkResult.outcome === 'Unable to Verify' && (
                  <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-900 space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                      <h3 className="text-sm font-bold text-amber-950 uppercase tracking-tight">
                        Unable to Verify
                      </h3>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed font-medium">
                      {checkResult.summary}
                    </p>
                  </div>
                )}

                {/* Specific Allergen Match Details (Requirement 5) */}
                {checkResult.matchedAllergens.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-navy-800 uppercase tracking-wider">
                      Matched Ingredients &amp; Registered Allergens:
                    </h4>
                    <div className="space-y-2">
                      {checkResult.matchedAllergens.map((match, idx) => (
                        <div
                          key={`${match.allergyId}-${idx}`}
                          className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-rose-600 block">
                                Matched Ingredient:
                              </span>
                              <span className="text-sm font-bold text-navy-950">
                                &ldquo;{match.ingredientEntered}&rdquo;
                              </span>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                                match.severity === 'severe' || match.severity === 'life-threatening'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {match.severity}
                            </span>
                          </div>

                          <div className="pt-1.5 border-t border-rose-100 text-xs text-navy-700 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span>
                              Relates to: <strong>{match.allergenName}</strong>
                            </span>
                            <span className="text-[11px] text-navy-500 font-mono">
                              Trigger alias: &quot;{match.matchedAlias}&quot;
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ambiguous Terms Breakdown */}
                {checkResult.ambiguousIngredientsFound.length > 0 && (
                  <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
                    <span className="text-xs font-bold text-amber-900 block">
                      Ambiguous Ingredient Warnings:
                    </span>
                    <ul className="text-xs text-amber-800 list-disc list-inside space-y-1">
                      {checkResult.reasons.map((reason, i) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Outcome Reasons & Safety Disclaimers */}
                {checkResult.outcome === 'No Listed Allergen Identified' && (
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                    <span className="text-xs font-bold text-navy-900 block">
                      Important Safety Notice:
                    </span>
                    <p className="text-xs text-navy-600 leading-relaxed">
                      SafeBiteAI verified this item specifically against your 3 registered allergens (
                      {userAllergies.map((a) => a.allergenName).join(', ')}). Always inspect the physical packaging for &ldquo;Manufactured in a facility that also processes...&rdquo; warnings.
                    </p>
                  </div>
                )}

                {/* Parsed Ingredients Summary */}
                {checkResult.parsedIngredients.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-navy-500 uppercase tracking-wider block mb-1.5">
                      Analyzed Tokens ({checkResult.parsedIngredients.length}):
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                      {checkResult.parsedIngredients.map((item, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-navy-700"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default FoodCheckerPage;
