/**
 * SafeBiteAI Core TypeScript Type Definitions
 * 
 * Medical allergy and health safety data are kept strictly separate
 * from general lifestyle dietary preferences.
 */

// ----------------------------------------------------
// Allergen & Medical Health Types
// ----------------------------------------------------

export type AllergySeverity = 'mild' | 'moderate' | 'severe' | 'life-threatening';

export type AllergenCategory =
  | 'tree_nuts'
  | 'peanuts'
  | 'crustaceans'
  | 'fish'
  | 'dairy'
  | 'eggs'
  | 'wheat_gluten'
  | 'soy'
  | 'sesame'
  | 'mustard'
  | 'celery'
  | 'sulphites'
  | 'lupin'
  | 'molluscs'
  | 'other';

export interface Allergy {
  id: string;
  allergenName: string;
  category: AllergenCategory;
  customCategory?: string;
  severity: AllergySeverity;
  symptoms: string[];
  diagnosedByDoctor: boolean;
  notes?: string;
  diagnosedDate?: string;
  aliases?: string[];
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  isDoctor?: boolean;
}

export interface MedicalHealthProfile {
  allergies: Allergy[];
  hasEpiPen: boolean;
  epiPenExpiryDate?: string;
  hasAsthma: boolean;
  emergencyContact: EmergencyContact;
  emergencyActionPlanNotes?: string;
}

// ----------------------------------------------------
// General Dietary Preferences (Non-Medical)
// ----------------------------------------------------

export type LifestyleDiet =
  | 'omnivore'
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'halal'
  | 'kosher'
  | 'keto'
  | 'low_sodium'
  | 'low_sugar'
  | 'custom';

export interface DietaryPreferences {
  primaryDiet: LifestyleDiet;
  dislikedIngredients: string[];
  avoidArtificialAdditives: boolean;
  preferOrganic: boolean;
  notes?: string;
}

// ----------------------------------------------------
// User Profile (Composite)
// ----------------------------------------------------

export type HeightUnit = 'cm' | 'ft_in';
export type WeightUnit = 'kg' | 'lbs';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;

  // Personal Information
  age?: number;
  height?: number;
  heightUnit?: HeightUnit;
  weight?: number;
  weightUnit?: WeightUnit;
  
  // Health & Medical (Safety Critical)
  healthProfile: MedicalHealthProfile;

  // Lifestyle & Dietary (Non-Medical Preferences)
  dietaryPreferences: DietaryPreferences;

  // App Settings
  settings: {
    notificationsEnabled: boolean;
    highRiskAlertSound: boolean;
    cameraAutofocusOcr: boolean;
    inAppReminders?: boolean;
    foodSafetyAlerts?: boolean;
    hydrationNudges?: boolean;
  };
}

// ----------------------------------------------------
// Food Safety & Allergen Check Types
// ----------------------------------------------------

export type SafetyStatus = 'safe' | 'caution' | 'unsafe' | 'unknown';
export type ScanSource = 'barcode' | 'ocr_label' | 'manual_entry';

export interface IngredientMatch {
  ingredientName: string;
  isAllergen: boolean;
  allergenId?: string;
  matchedAllergenName?: string;
  severity?: AllergySeverity;
  isDietaryConflict: boolean;
  conflictReason?: string;
}

export interface FoodCheck {
  id: string;
  foodName: string;
  brand?: string;
  barcode?: string;
  scanSource: ScanSource;
  ingredientsList: string[];
  safetyStatus: SafetyStatus;
  detectedAllergens: IngredientMatch[];
  detectedDietaryConflicts: IngredientMatch[];
  summaryNote: string;
  checkedAt: string;
}

// ----------------------------------------------------
// Exposure Incident & Symptom Report Types
// ----------------------------------------------------

export interface ExposureReport {
  id: string;
  reportedAt: string;
  foodName: string;
  suspectedAllergens: string[];
  severity: AllergySeverity;
  symptomsExperienced: string[];
  epiPenAdministered: boolean;
  actionTaken: string; // e.g. "Took antihistamine, rested, monitored breathing"
  notes?: string;
  resolved: boolean;
}

// ----------------------------------------------------
// Reminders & Medication Schedule Types
// ----------------------------------------------------

export type ReminderCategory =
  | 'hydration'
  | 'wellness'
  | 'skin_care'
  | 'hair_care'
  | 'medication'
  | 'other';

export type ReminderType =
  | 'epipen_expiration'
  | 'medication'
  | 'allergy_appointment'
  | 'hydration'
  | 'daily_symptom_check';

export type ReminderFrequency = 'daily' | 'weekly' | 'monthly' | 'one_time' | 'as_needed';

export interface Reminder {
  id: string;
  title: string;
  category: ReminderCategory;
  dueDate: string; // ISO date string e.g. "2026-10-11"
  timeOfDay: string; // e.g. "09:00" or "09:00 AM"
  frequency: ReminderFrequency;
  notes?: string;
  completed: boolean;
  completedAt?: string;
  // Optional / legacy compatibility fields
  type?: ReminderType;
  isActive?: boolean;
  description?: string;
}

// ----------------------------------------------------
// Wellness Routine & Habit Tracking Types
// ----------------------------------------------------

export type WellnessCategory =
  | 'nutrition_tracking'
  | 'hydration'
  | 'mindfulness'
  | 'symptom_journal'
  | 'gut_health'
  | 'skin_care'
  | 'hair_care'
  | 'general_wellness';

export interface WellnessRoutine {
  id: string;
  title: string;
  category: WellnessCategory;
  frequency: string; // e.g. "Daily morning"
  completedToday: boolean;
  currentStreakDays: number;
  description: string;
}

export type RoutineActivityCategory = 'skin_care' | 'hair_care' | 'general_wellness';

export interface RoutineActivity {
  id: string;
  name: string;
  category: RoutineActivityCategory;
  frequency: string; // e.g. "Daily morning", "2-3x / week", "Nightly"
  notes?: string;
  completedToday: boolean;
  completedAt?: string;
}
