import React, { useState } from 'react';
import {
  ShieldAlert,
  PhoneCall,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  HeartPulse,
  Info,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  User,
  Activity,
  Droplets,
  Eye,
  Hand,
  Sparkles,
} from 'lucide-react';
import {
  mockDemoExposureReports,
  mockDemoUserProfile,
} from '../data/mockData';
import { useAllergies } from '../context';
import type { ExposureReport, AllergySeverity } from '../types';

type ExposureRoute = 'ingested' | 'skin_contact' | 'eye_contact';

interface SymptomOption {
  id: string;
  label: string;
  isEmergencyWarning: boolean;
}

const SYMPTOM_OPTIONS: SymptomOption[] = [
  // Severe / Emergency Warning Symptoms
  {
    id: 'sym_breathing',
    label: 'Breathing difficulty / Wheezing',
    isEmergencyWarning: true,
  },
  {
    id: 'sym_throat_tongue',
    label: 'Throat or tongue swelling / Tightness',
    isEmergencyWarning: true,
  },
  {
    id: 'sym_collapse',
    label: 'Collapse / Fainting / Severe dizziness',
    isEmergencyWarning: true,
  },
  {
    id: 'sym_rapid_worsening',
    label: 'Rapidly worsening symptoms',
    isEmergencyWarning: true,
  },
  // Mild Localized Symptoms
  {
    id: 'sym_mild_itching',
    label: 'Mild localized itching',
    isEmergencyWarning: false,
  },
  {
    id: 'sym_localized_rash',
    label: 'Mild localized rash / Redness',
    isEmergencyWarning: false,
  },
  {
    id: 'sym_hives',
    label: 'Widespread hives / Welts',
    isEmergencyWarning: false,
  },
  {
    id: 'sym_lip_tingling',
    label: 'Lip tingling / Itchy palate',
    isEmergencyWarning: false,
  },
  {
    id: 'sym_mild_nausea',
    label: 'Mild nausea / Stomach discomfort',
    isEmergencyWarning: false,
  },
];

const TIME_OPTIONS = [
  'Just now (< 15 mins ago)',
  'About 30 minutes ago',
  '1 to 2 hours ago',
  'Earlier today (3–6 hours ago)',
  'Yesterday / Prior date',
];

export const ExposureAssistantPage: React.FC = () => {
  const userProfile = mockDemoUserProfile;
  const emergencyContact = userProfile.healthProfile.emergencyContact;
  const { allergies: userAllergies } = useAllergies();

  // Recent reports state initialized with demo data
  const [reports, setReports] = useState<ExposureReport[]>(mockDemoExposureReports);

  // Interaction State
  const [exposureRoute, setExposureRoute] = useState<ExposureRoute>('ingested');
  const [selectedSymptomIds, setSelectedSymptomIds] = useState<string[]>([]);
  const [customSymptomText, setCustomSymptomText] = useState('');

  // Copy feedback states
  const [copiedFirstAid, setCopiedFirstAid] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Incident Form State
  const [foodName, setFoodName] = useState('');
  const [suspectedAllergen, setSuspectedAllergen] = useState('');
  const [exposureTime, setExposureTime] = useState(TIME_OPTIONS[0]);
  const [actionsTaken, setActionsTaken] = useState('');
  const [exposureLocation, setExposureLocation] = useState('');
  const [epiPenAdministered, setEpiPenAdministered] = useState(false);

  // Form Validation & Feedback
  const [formErrors, setFormErrors] = useState<{ foodName?: string }>({});
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  // Triage state evaluation
  const selectedSymptoms = SYMPTOM_OPTIONS.filter((s) => selectedSymptomIds.includes(s.id));
  const hasSevereSymptoms = selectedSymptoms.some((s) => s.isEmergencyWarning);
  const hasMildSymptoms = selectedSymptoms.length > 0 && !hasSevereSymptoms;
  const hasNoSymptoms = selectedSymptoms.length === 0 && !customSymptomText.trim();

  // Toggle symptom chip
  const toggleSymptom = (id: string) => {
    setSelectedSymptomIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleResetSelections = () => {
    setSelectedSymptomIds([]);
    setCustomSymptomText('');
    setExposureRoute('ingested');
  };

  // Compile first aid text for copying
  const getFirstAidTextToCopy = (): string => {
    if (hasSevereSymptoms) {
      return `WHAT TO DO RIGHT NOW - SEVERE ALLERGIC REACTION
1. Call 112 in India now (or local emergency services immediately).
2. Use the person's prescribed epinephrine/adrenaline auto-injector immediately according to their emergency plan.
3. Position safely: Help them lie flat with legs raised if tolerated. If breathing is difficult, allow sitting with legs extended. DO NOT LET THEM STAND OR WALK.
4. If unconscious but breathing normally, place on side (recovery position). If not breathing normally, begin CPR.
5. Do NOT substitute home remedies or antihistamines for epinephrine in anaphylaxis.
6. If symptoms persist, follow emergency plan for a second auto-injector.
7. Emergency medical assessment is necessary even if symptoms improve.`;
    }
    if (exposureRoute === 'skin_contact' && hasNoSymptoms) {
      return `WHAT TO DO RIGHT NOW - FOOD CONTACT ON SKIN (NO GENERAL SYMPTOMS)
1. Gently wash the skin area with mild soap and cool running water. Do not scrub harshly.
2. Stop consuming the suspected food.
3. Note: Washing skin does NOT treat a systemic allergic reaction caused by swallowing the allergen.
4. Follow clinician allergy action plan and monitor for delayed symptoms.`;
    }
    if (exposureRoute === 'eye_contact') {
      return `WHAT TO DO RIGHT NOW - FOOD IN EYES
1. Immediately flush the eye with clean, cool running water gently for 10-15 minutes.
2. Do not rub the eye. Remove contact lenses if easy to do so.
3. Note: Eye rinsing soothes local irritation but does NOT treat a reaction caused by swallowing the food.
4. Contact an eye specialist or emergency service if pain, swelling, or redness persists.`;
    }
    if (hasMildSymptoms) {
      return `WHAT TO DO RIGHT NOW - MILD LOCALIZED ITCHING OR RASH
1. Stop eating the suspected food immediately.
2. If food touched the skin, gently wash the area with mild soap and cool running water.
3. Apply a cool, damp cloth to the itchy skin area for temporary soothing comfort.
4. Follow the person's existing clinician-provided allergy action plan.
5. If medication is needed, check with a qualified clinician or pharmacist. Never invent medicine names or doses.
6. Caution: Mild symptoms can worsen rapidly into a severe reaction. If breathing or throat symptoms appear, call 112 immediately.`;
    }
    return `WHAT TO DO RIGHT NOW - SUSPECTED EXPOSURE (NO CURRENT SYMPTOMS)
1. Stop consuming the suspected food immediately.
2. Follow your clinician-provided allergy action plan.
3. Monitor closely with someone nearby for delayed symptoms over several hours.
4. Know emergency warning signs (breathing difficulty, throat tightness, lip swelling, dizziness, hives).
Notice: Reactions can develop with delay; lack of immediate symptoms does not guarantee safety.`;
  };

  const handleCopyFirstAid = async () => {
    try {
      await navigator.clipboard.writeText(getFirstAidTextToCopy());
      setCopiedFirstAid(true);
      setTimeout(() => setCopiedFirstAid(false), 2500);
    } catch {
      setCopiedFirstAid(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { foodName?: string } = {};
    if (!foodName.trim()) {
      newErrors.foodName = 'Please enter the food or product suspected.';
    }
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const allSymptomsList = selectedSymptoms.map((s) => s.label);
    if (customSymptomText.trim()) {
      allSymptomsList.push(customSymptomText.trim());
    }

    const severityLevel: AllergySeverity = hasSevereSymptoms
      ? 'severe'
      : hasMildSymptoms
      ? 'mild'
      : 'mild';

    const newReport: ExposureReport = {
      id: `exp-${Date.now()}`,
      reportedAt: new Date().toISOString(),
      foodName: foodName.trim(),
      suspectedAllergens: suspectedAllergen.trim()
        ? [suspectedAllergen.trim()]
        : ['Unspecified / Suspected'],
      severity: severityLevel,
      symptomsExperienced: allSymptomsList.length > 0 ? allSymptomsList : ['No immediate symptoms'],
      epiPenAdministered,
      actionTaken: actionsTaken.trim()
        ? actionsTaken.trim()
        : hasSevereSymptoms
        ? 'Emergency services protocol followed'
        : 'Stopped consumption, resting',
      notes: `Exposure type: ${exposureRoute}. Timing: ${exposureTime}. Location: ${
        exposureLocation.trim() || 'Not specified'
      }. Severe symptoms present: ${hasSevereSymptoms ? 'YES' : 'NO'}.`,
      resolved: false,
    };

    setReports((prev) => [newReport, ...prev]);
    setSubmissionFeedback(
      `Exposure report for "${newReport.foodName}" has been recorded in local demo state.`
    );
  };

  const generateClinicalSummary = (): string => {
    const allSymptomsList = selectedSymptoms.map((s) => s.label);
    if (customSymptomText.trim()) {
      allSymptomsList.push(customSymptomText.trim());
    }

    return `=== SAFEBITEAI ALLERGY EXPOSURE SUMMARY ===
Patient: ${userProfile.fullName}
Registered Allergies: ${userAllergies.map((a) => `${a.allergenName} (${a.severity})`).join(', ')}
Suspected Food/Product: ${foodName || 'Not specified'}
Exposure Route: ${exposureRoute}
Suspected Allergen: ${suspectedAllergen || 'Unknown'}
Approximate Timing: ${exposureTime}
Severe Symptoms Present: ${hasSevereSymptoms ? 'YES (EMERGENCY)' : 'NO'}
Reported Symptoms:
${allSymptomsList.length > 0 ? allSymptomsList.map((s) => ` - ${s}`).join('\n') : ' - None reported at time of logging'}
EpiPen/Adrenaline Administered: ${epiPenAdministered ? 'YES' : 'NO'}
Immediate Actions Taken: ${actionsTaken || 'None recorded'}
Location/Context: ${exposureLocation || 'Not specified'}
Reported Date/Time: ${new Date().toLocaleString()}
Notice: Self-reported observations for healthcare professional handoff.`;
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(generateClinicalSummary());
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    } catch {
      setCopiedSummary(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl font-sans antialiased">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-navy-950 tracking-tight">
              Exposure Incident Assistant
            </h1>
            <span className="badge-teal text-xs">Practical First Aid</span>
          </div>
          <p className="text-sm text-navy-500">
            Immediate symptom-based first aid guidance you can follow while arranging medical care.
          </p>
        </div>

        {/* User Profile Context */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <User className="w-4 h-4 text-teal-accent shrink-0" />
          <div>
            <span className="font-semibold text-navy-900 block leading-tight">
              {userProfile.fullName.split(' ')[0]} (Demo Profile)
            </span>
            <span className="text-[11px] text-navy-500">
              {userAllergies.length} registered allergies tracked
            </span>
          </div>
        </div>
      </div>

      {/* Prominent Medical Notice */}
      <div className="p-3.5 rounded-xl bg-blue-accent-subtle/70 border border-blue-accent-border flex items-start gap-3 text-xs text-navy-800 shadow-subtle">
        <Info className="w-4 h-4 text-blue-accent shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-navy-900">General First Aid Notice:</strong> The guidance
          on this page provides general first aid steps to take while arranging professional medical
          care. It is <strong>not a diagnosis or replacement for medical care</strong>. Never delay
          emergency treatment while using this application.
        </div>
      </div>

      {/* STEP 1: EXPOSURE TYPE & SYMPTOM SELECTOR */}
      <section
        aria-labelledby="triage-selector-heading"
        className="safebite-card p-6 bg-white border border-slate-200/90 rounded-2xl shadow-subtle space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h2 id="triage-selector-heading" className="text-base font-bold text-navy-950 flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-accent" />
              <span>Step 1: What Happened? (Exposure &amp; Symptoms)</span>
            </h2>
            <p className="text-xs text-navy-500 mt-0.5">
              Select how the allergen made contact and your symptoms to see immediate first-aid instructions.
            </p>
          </div>
          {(selectedSymptomIds.length > 0 || exposureRoute !== 'ingested') && (
            <button
              type="button"
              onClick={handleResetSelections}
              className="text-xs text-navy-500 hover:text-navy-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Selections
            </button>
          )}
        </div>

        {/* 1A. Exposure Route Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-navy-700">
            How Did Contact Occur?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setExposureRoute('ingested')}
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                exposureRoute === 'ingested'
                  ? 'bg-teal-accent-subtle border-teal-accent text-teal-accent-hover ring-2 ring-teal-accent/30'
                  : 'bg-slate-50 border-slate-200 text-navy-700 hover:bg-slate-100'
              }`}
            >
              <HeartPulse className="w-4 h-4 text-teal-accent" />
              <span>Swallowed / Eaten Food</span>
            </button>

            <button
              type="button"
              onClick={() => setExposureRoute('skin_contact')}
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                exposureRoute === 'skin_contact'
                  ? 'bg-teal-accent-subtle border-teal-accent text-teal-accent-hover ring-2 ring-teal-accent/30'
                  : 'bg-slate-50 border-slate-200 text-navy-700 hover:bg-slate-100'
              }`}
            >
              <Hand className="w-4 h-4 text-teal-accent" />
              <span>Food Touched Skin</span>
            </button>

            <button
              type="button"
              onClick={() => setExposureRoute('eye_contact')}
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                exposureRoute === 'eye_contact'
                  ? 'bg-teal-accent-subtle border-teal-accent text-teal-accent-hover ring-2 ring-teal-accent/30'
                  : 'bg-slate-50 border-slate-200 text-navy-700 hover:bg-slate-100'
              }`}
            >
              <Eye className="w-4 h-4 text-teal-accent" />
              <span>Food Splashed in Eyes</span>
            </button>
          </div>
        </div>

        {/* 1B. Symptoms Selector */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          {/* Severe Symptoms */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                Severe Symptoms (Emergency Warning):
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SYMPTOM_OPTIONS.filter((s) => s.isEmergencyWarning).map((symptom) => {
                const isSelected = selectedSymptomIds.includes(symptom.id);
                return (
                  <button
                    key={symptom.id}
                    type="button"
                    onClick={() => toggleSymptom(symptom.id)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-rose-100/90 border-rose-400 text-rose-950 shadow-subtle ring-2 ring-rose-400/40'
                        : 'bg-rose-50/40 border-rose-200/70 text-rose-900 hover:bg-rose-50'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <span
                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 text-[10px] ${
                        isSelected
                          ? 'bg-rose-600 text-white border-rose-600 font-bold'
                          : 'border-rose-300 bg-white'
                      }`}
                    >
                      {isSelected ? '✓' : ''}
                    </span>
                    <span className="leading-snug">{symptom.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mild Symptoms */}
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-bold uppercase tracking-wider text-navy-700 block">
              Mild or Localized Symptoms:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {SYMPTOM_OPTIONS.filter((s) => !s.isEmergencyWarning).map((symptom) => {
                const isSelected = selectedSymptomIds.includes(symptom.id);
                return (
                  <button
                    key={symptom.id}
                    type="button"
                    onClick={() => toggleSymptom(symptom.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-start gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-teal-accent-subtle border-teal-accent text-navy-950 font-semibold shadow-subtle'
                        : 'bg-slate-50 border-slate-200 text-navy-700 hover:bg-slate-100'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 mt-0.5 text-[9px] ${
                        isSelected
                          ? 'bg-teal-accent text-white border-teal-accent font-bold'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected ? '✓' : ''}
                    </span>
                    <span className="leading-snug">{symptom.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* STEP 2: WHAT TO DO RIGHT NOW (PRACTICAL FIRST-AID GUIDE ABOVE REPORT FORM) */}
      <section
        aria-labelledby="what-to-do-heading"
        className="safebite-card p-6 sm:p-7 bg-white border-2 border-slate-200/90 rounded-2xl shadow-subtle space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-accent-subtle border border-teal-accent-border text-teal-accent flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="what-to-do-heading" className="text-xl font-bold text-navy-950 tracking-tight">
                What to Do Right Now
              </h2>
              <p className="text-xs text-navy-500">
                Immediate practical first-aid measures to follow while arranging medical care.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyFirstAid}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-accent-subtle hover:text-teal-accent text-xs font-semibold text-navy-700 transition-colors cursor-pointer self-start sm:self-auto"
            title="Copy these numbered first aid instructions to clipboard"
          >
            {copiedFirstAid ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied Instructions!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy First-Aid Steps</span>
              </>
            )}
          </button>
        </div>

        {/* CASE A: SEVERE ALLERGIC REACTION (EMERGENCY) */}
        {hasSevereSymptoms && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Immediate Emergency Call Banner */}
            <div className="p-4 rounded-xl bg-rose-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 animate-pulse shrink-0" />
                <div>
                  <h3 className="text-sm sm:text-base font-black tracking-tight leading-tight">
                    EMERGENCY: CALL 112 IN INDIA NOW
                  </h3>
                  <p className="text-xs text-rose-100">
                    Severe allergic reaction / anaphylaxis warning signs detected.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="tel:112"
                  className="px-4 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-900 font-black text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 text-rose-600" />
                  <span>Call 112 in India</span>
                </a>
                <a
                  href="tel:911"
                  className="px-3 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call 911</span>
                </a>
              </div>
            </div>

            {/* Critical Epinephrine & Home Remedy Warning */}
            <div className="p-3.5 rounded-xl bg-rose-100/70 border border-rose-300 text-rose-950 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <p>
                <strong>Critical Treatment Rule:</strong> Do <strong>NOT</strong> suggest or use home
                remedies or oral antihistamines as a substitute for epinephrine in anaphylaxis.
                Antihistamines do not relieve breathing difficulty or throat swelling.
              </p>
            </div>

            {/* Numbered Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Step 1 */}
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider mb-0.5">
                    Call Emergency Services Now
                  </h4>
                  <p className="text-xs text-rose-900 leading-relaxed">
                    Call <strong>112 in India now</strong> (or local emergency dispatch). Tell the
                    operator someone is having a severe allergic reaction.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider mb-0.5">
                    Use Prescribed Auto-Injector Immediately
                  </h4>
                  <p className="text-xs text-rose-900 leading-relaxed">
                    Use the person&apos;s prescribed epinephrine/adrenaline auto-injector (EpiPen)
                    immediately according to their emergency plan and device instructions.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                  3
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider mb-0.5">
                    Safe Body Positioning
                  </h4>
                  <p className="text-xs text-rose-900 leading-relaxed">
                    Help them lie flat with legs raised if tolerated. If breathing is difficult, allow
                    them to sit with legs extended.{' '}
                    <strong>Do not let them stand or walk.</strong>
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                  4
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider mb-0.5">
                    Unconscious Position / CPR
                  </h4>
                  <p className="text-xs text-rose-900 leading-relaxed">
                    If unconscious but breathing normally, place them on their side. If they stop
                    breathing normally, begin CPR immediately and follow dispatcher instructions.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                  5
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider mb-0.5">
                    Second Auto-Injector (If Symptoms Persist)
                  </h4>
                  <p className="text-xs text-rose-900 leading-relaxed">
                    If symptoms persist and emergency medical help has not arrived, follow their
                    emergency plan regarding a second prescribed auto-injector.
                  </p>
                </div>
              </div>

              {/* Step 6 */}
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                  6
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider mb-0.5">
                    Emergency Assessment Mandatory
                  </h4>
                  <p className="text-xs text-rose-900 leading-relaxed">
                    Emergency medical assessment is necessary{' '}
                    <strong>even if symptoms improve</strong>. A second wave of symptoms (biphasic
                    reaction) can occur hours later.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CASE B: FOOD CONTACT (SKIN OR EYES) */}
        {(exposureRoute === 'skin_contact' || exposureRoute === 'eye_contact') && (
          <div className="p-4 rounded-xl bg-teal-accent-subtle/50 border border-teal-accent-border space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-accent uppercase tracking-wider">
              <Droplets className="w-4 h-4" />
              <span>
                {exposureRoute === 'skin_contact'
                  ? 'Skin Contact Decontamination Guide'
                  : 'Eye Splash First Aid Guide'}
              </span>
            </div>

            {exposureRoute === 'skin_contact' ? (
              <div className="space-y-2 text-xs text-navy-800">
                <p>
                  <strong>Gently wash the skin:</strong> If the food touched the skin, wash the area
                  immediately with mild soap and cool running water. Pat dry with a clean towel; do
                  not scrub vigorously, as scrubbing can irritate the skin barrier.
                </p>
                <div className="p-2.5 rounded-lg bg-white border border-teal-accent-border/60 text-[11px] text-navy-700">
                  <strong className="text-teal-accent">Clinical Note:</strong> Washing the skin
                  soothes surface irritation and removes residual allergen, but{' '}
                  <strong>
                    it does NOT treat a systemic allergic reaction if the allergen was also ingested
                    or swallowed
                  </strong>
                  .
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs text-navy-800">
                <p>
                  <strong>Rinse eyes immediately:</strong> Gently flush the affected eye with clean,
                  cool running water for 10 to 15 minutes. Tilt the head so water flows away from the
                  unaffected eye. Do not rub the eye.
                </p>
                <div className="p-2.5 rounded-lg bg-white border border-teal-accent-border/60 text-[11px] text-navy-700">
                  <strong className="text-teal-accent">Clinical Note:</strong> Flushing eyes relieves
                  localized chemical irritation, but{' '}
                  <strong>
                    does NOT treat systemic allergic anaphylaxis caused by swallowing the food
                  </strong>
                  . If eye pain or vision blurriness persists, seek urgent ophthalmic care.
                </div>
              </div>
            )}
          </div>
        )}

        {/* CASE C: MILD LOCALIZED ITCHING OR RASH ONLY */}
        {hasMildSymptoms && !hasSevereSymptoms && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Cautionary Banner */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-2.5 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-amber-950 block">Important Progression Notice:</strong>
                Mild symptoms can worsen rapidly into a severe allergic reaction. SafeBiteAI{' '}
                <strong>cannot guarantee that the reaction will remain mild</strong>. Medical advice
                may be needed.
              </div>
            </div>

            {/* Numbered Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Step 1 */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider mb-0.5">
                    Stop Eating Suspected Food
                  </h4>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Stop eating the suspected food immediately. Avoid any further contact with it.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider mb-0.5">
                    Skin Decontamination
                  </h4>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    If the food touched the skin, gently wash the area with mild soap and cool running
                    water. Do not scrub harshly.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  3
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider mb-0.5">
                    Apply Cool, Damp Cloth
                  </h4>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Apply a cool, damp cloth to an itchy skin area for temporary soothing comfort. Do
                    not apply ice directly to skin.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  4
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider mb-0.5">
                    Follow Clinician Allergy Plan
                  </h4>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Follow the user&apos;s existing clinician-provided allergy management plan and stay
                    with someone who can monitor you.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  5
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider mb-0.5">
                    Check With Clinician or Pharmacist
                  </h4>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    If medication is needed, check with a qualified clinician or pharmacist. Never
                    invent medicine names or doses on your own.
                  </p>
                </div>
              </div>

              {/* Step 6 */}
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  6
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider mb-0.5">
                    Emergency Escalation
                  </h4>
                  <p className="text-xs text-rose-900 leading-relaxed">
                    If any emergency warning symptom appears (breathing difficulty, throat tightness,
                    collapse), call <strong>112 in India immediately</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CASE D: NO CURRENT SYMPTOMS */}
        {hasNoSymptoms && !hasSevereSymptoms && exposureRoute === 'ingested' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Cautionary Banner */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-navy-800 flex items-start gap-2.5 text-xs">
              <Info className="w-4 h-4 text-teal-accent shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-navy-950 block">Exposure Suspected (No Current Symptoms):</strong>
                Food allergy reactions can develop minutes to hours after exposure. SafeBiteAI{' '}
                <strong>does not guarantee that no reaction will occur</strong>.
              </div>
            </div>

            {/* Numbered Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Step 1 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-teal-accent text-white flex items-center justify-center font-bold text-sm shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-navy-950 uppercase tracking-wider mb-0.5">
                    Stop Consuming Food
                  </h4>
                  <p className="text-xs text-navy-700 leading-relaxed">
                    Stop consuming the suspected food immediately. Avoid any further intake.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-teal-accent text-white flex items-center justify-center font-bold text-sm shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-navy-950 uppercase tracking-wider mb-0.5">
                    Follow Allergy Action Plan
                  </h4>
                  <p className="text-xs text-navy-700 leading-relaxed">
                    Follow your clinician-provided allergy action plan for suspected exposures.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-teal-accent text-white flex items-center justify-center font-bold text-sm shrink-0">
                  3
                </div>
                <div>
                  <h4 className="text-xs font-bold text-navy-950 uppercase tracking-wider mb-0.5">
                    Monitor Closely Over Hours
                  </h4>
                  <p className="text-xs text-navy-700 leading-relaxed">
                    Stay with someone if possible and monitor closely for delayed symptoms over the
                    next several hours.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-teal-accent text-white flex items-center justify-center font-bold text-sm shrink-0">
                  4
                </div>
                <div>
                  <h4 className="text-xs font-bold text-navy-950 uppercase tracking-wider mb-0.5">
                    Know Emergency Warning Signs
                  </h4>
                  <p className="text-xs text-navy-700 leading-relaxed">
                    Watch for breathing difficulty, throat tightness, lip/tongue swelling, dizziness,
                    or widespread hives. If seen, call <strong>112 in India immediately</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* STEP 3: WHEN TO GET MEDICAL HELP */}
      <section
        aria-labelledby="medical-help-heading"
        className="safebite-card p-6 bg-slate-50 border border-slate-200/90 rounded-2xl shadow-subtle space-y-3"
      >
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <h2 id="medical-help-heading" className="text-sm font-bold text-navy-950">
            When to Get Medical Help
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-navy-800">
          <div className="p-3 rounded-xl bg-white border border-rose-200 space-y-1">
            <span className="font-bold text-rose-800 block uppercase tracking-wider text-[11px]">
              Call Emergency Services (112 in India) If:
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-navy-700">
              <li>Difficulty breathing, wheezing, or persistent cough</li>
              <li>Throat tightness, difficulty swallowing, or hoarseness</li>
              <li>Tongue or facial swelling</li>
              <li>Dizziness, lightheadedness, or feeling faint/collapsing</li>
              <li>Symptoms worsen rapidly</li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
            <span className="font-bold text-teal-accent-hover block uppercase tracking-wider text-[11px]">
              Contact Clinician / Urgent Care If:
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-navy-700">
              <li>Symptoms do not improve or cause persistent discomfort</li>
              <li>Rash or hives continue spreading</li>
              <li>You need guidance on prescribed medications or dosing</li>
              <li>You need follow-up care or an updated allergy emergency action plan</li>
            </ul>
          </div>
        </div>

        <div className="pt-1 flex items-center justify-between text-xs text-navy-600">
          <span>
            Designated Contact: <strong>{emergencyContact.name} ({emergencyContact.relationship})</strong>
          </span>
          <a
            href={`tel:${emergencyContact.phoneNumber.replace(/[^0-9+]/g, '')}`}
            className="font-mono font-semibold text-teal-accent hover:underline flex items-center gap-1"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            {emergencyContact.phoneNumber}
          </a>
        </div>
      </section>

      {/* STEP 4: EXPOSURE REPORT FORM & SUMMARY (BELOW FIRST AID) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Incident Form Column */}
        <div className="lg:col-span-7 space-y-6">
          <section
            aria-labelledby="report-form-heading"
            className="safebite-card p-6 sm:p-7 bg-white border border-slate-200/90 rounded-2xl shadow-subtle space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-accent" />
                <h2 id="report-form-heading" className="text-base font-bold text-navy-950">
                  Document Incident Details
                </h2>
              </div>
              <span className="badge-blue text-[10px]">Self-Reported Log</span>
            </div>

            <p className="text-xs text-navy-500">
              Document details for your doctor&apos;s review. This form is strictly an observation log.
            </p>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Suspected Food Name */}
              <div>
                <label
                  htmlFor="food-name-field"
                  className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1"
                >
                  Food or Product Suspected <span className="text-rose-500">*</span>
                </label>
                <input
                  id="food-name-field"
                  type="text"
                  value={foodName}
                  onChange={(e) => {
                    setFoodName(e.target.value);
                    if (formErrors.foodName) setFormErrors({});
                  }}
                  placeholder="e.g. Pad Thai noodles, bakery walnut cookie, salad dressing"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-navy-900 bg-white placeholder:text-navy-300 transition-colors focus:bg-white focus-visible:outline-none focus-visible:ring-2 ${
                    formErrors.foodName
                      ? 'border-rose-300 focus-visible:ring-rose-400'
                      : 'border-slate-200 focus-visible:ring-teal-500 hover:border-slate-300'
                  }`}
                />
                {formErrors.foodName && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{formErrors.foodName}</span>
                  </p>
                )}
              </div>

              {/* Suspected Allergen & Timing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="suspected-allergen-field"
                    className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1"
                  >
                    Possible Allergen Involved
                  </label>
                  <select
                    id="suspected-allergen-field"
                    value={suspectedAllergen}
                    onChange={(e) => setSuspectedAllergen(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-navy-900 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 hover:border-slate-300"
                  >
                    <option value="">Select suspected allergen...</option>
                    {userAllergies.map((alg) => (
                      <option key={alg.id} value={alg.allergenName}>
                        {alg.allergenName} ({alg.severity})
                      </option>
                    ))}
                    <option value="Tree Nuts">Tree Nuts (Cashew, Walnut, etc.)</option>
                    <option value="Dairy / Milk">Dairy / Milk</option>
                    <option value="Eggs">Eggs</option>
                    <option value="Wheat / Gluten">Wheat / Gluten</option>
                    <option value="Soy">Soy</option>
                    <option value="Unknown / Cross-Contact">Unknown / Cross-Contact</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="exposure-time-field"
                    className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1"
                  >
                    Approximate Time Eaten
                  </label>
                  <select
                    id="exposure-time-field"
                    value={exposureTime}
                    onChange={(e) => setExposureTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-navy-900 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 hover:border-slate-300"
                  >
                    {TIME_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Immediate Actions Taken & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="actions-taken-field"
                    className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1"
                  >
                    Immediate Actions Taken
                  </label>
                  <input
                    id="actions-taken-field"
                    type="text"
                    value={actionsTaken}
                    onChange={(e) => setActionsTaken(e.target.value)}
                    placeholder="e.g. Washed skin, cool cloth, followed plan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-navy-900 bg-white placeholder:text-navy-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 hover:border-slate-300"
                  />
                </div>

                <div>
                  <label
                    htmlFor="location-field"
                    className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1"
                  >
                    Location / Brand Context
                  </label>
                  <input
                    id="location-field"
                    type="text"
                    value={exposureLocation}
                    onChange={(e) => setExposureLocation(e.target.value)}
                    placeholder="e.g. Home, restaurant name, packaged snack"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-navy-900 bg-white placeholder:text-navy-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 hover:border-slate-300"
                  />
                </div>
              </div>

              {/* Auto-Injector Status Checkbox */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/60 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={epiPenAdministered}
                  onChange={(e) => setEpiPenAdministered(e.target.checked)}
                  className="w-4 h-4 text-teal-accent rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
                />
                <span className="text-xs text-navy-800 font-medium">
                  Prescribed Epinephrine / Adrenaline Auto-Injector was administered
                </span>
              </label>

              {/* Submit Action */}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-teal-accent hover:bg-teal-accent-hover text-white font-semibold text-sm shadow-subtle transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Save Incident Report (Demo State)</span>
              </button>
            </form>
          </section>
        </div>

        {/* Doctor Summary & Logs Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Doctor Handoff Summary */}
          <section
            aria-labelledby="handoff-summary-heading"
            className="safebite-card p-6 bg-white border border-slate-200/90 rounded-2xl shadow-subtle space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 id="handoff-summary-heading" className="text-sm font-bold text-navy-950 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-accent" />
                <span>Doctor Handoff Summary</span>
              </h2>
              <button
                type="button"
                onClick={handleCopySummary}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-accent-subtle hover:text-teal-accent text-xs font-semibold text-navy-700 transition-colors cursor-pointer"
                title="Copy structured summary for your physician"
              >
                {copiedSummary ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-navy-500">
              Concise summary for presentation to emergency clinicians or medical providers:
            </p>

            <pre className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-navy-800 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
              {generateClinicalSummary()}
            </pre>
          </section>

          {/* Submission Confirmation Alert */}
          {submissionFeedback && (
            <div
              className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-start gap-2.5 shadow-subtle animate-in fade-in"
              role="status"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">{submissionFeedback}</p>
                <p className="text-[11px] text-emerald-700">
                  Reminder: This record is saved strictly within your active browser session. It has{' '}
                  <strong>not</strong> been transmitted to emergency dispatch or external servers.
                </p>
              </div>
            </div>
          )}

          {/* Recent Incident Reports */}
          <section
            aria-labelledby="recent-reports-heading"
            className="safebite-card p-6 bg-white border border-slate-200/90 rounded-2xl shadow-subtle space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h2 id="recent-reports-heading" className="text-sm font-bold text-navy-950">
                  Recent Incident Reports
                </h2>
                <span className="text-[11px] text-navy-400">
                  {reports.length} report(s) in local state
                </span>
              </div>
              <span className="badge-teal text-[10px]">Local State Only</span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-navy-950">
                        {report.foodName}
                      </h3>
                      <span className="text-[10px] text-navy-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-navy-400" />
                        {new Date(report.reportedAt).toLocaleDateString()} •{' '}
                        {new Date(report.reportedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                        report.severity === 'severe' || report.severity === 'life-threatening'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : report.severity === 'moderate'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {report.severity}
                    </span>
                  </div>

                  <div className="text-[11px] text-navy-700">
                    <span className="text-navy-500">Suspected: </span>
                    <span className="font-semibold">{report.suspectedAllergens.join(', ')}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {report.symptomsExperienced.map((sym, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-white text-navy-700 border border-slate-200"
                      >
                        {sym}
                      </span>
                    ))}
                  </div>

                  <p className="text-[11px] text-navy-600 bg-white p-2 rounded-lg border border-slate-200/60">
                    <strong>Action:</strong> {report.actionTaken}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ExposureAssistantPage;
