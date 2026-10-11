import type {
  Allergy,
  UserProfile,
  FoodCheck,
  ExposureReport,
  Reminder,
  WellnessRoutine,
  RoutineActivity,
} from '../types';

/**
 * Fictional demo allergies list for testing and prototyping
 */
export const mockSampleAllergies: Allergy[] = [
  {
    id: 'alg-001',
    allergenName: 'Peanuts',
    category: 'peanuts',
    severity: 'severe',
    symptoms: ['Hives', 'Lip swelling', 'Throat constriction', 'Wheezing'],
    diagnosedByDoctor: true,
    diagnosedDate: '2022-04-10',
    notes: 'Prescribed twin-pack auto-injector (EpiPen). Strict zero-tolerance.',
    aliases: ['peanut', 'groundnut', 'arachis', 'peanut butter', 'peanut oil', 'beer nut'],
  },
  {
    id: 'alg-002',
    allergenName: 'Shellfish (Crustaceans & Shrimp)',
    category: 'crustaceans',
    severity: 'moderate',
    symptoms: ['Skin rash', 'Stomach cramps', 'Nausea'],
    diagnosedByDoctor: true,
    diagnosedDate: '2023-08-15',
    notes: 'Mild reactions previously; advised to avoid cross-contaminated cookware.',
    aliases: ['shrimp', 'prawn', 'crab', 'lobster', 'crayfish', 'krill', 'scampi'],
  },
  {
    id: 'alg-003',
    allergenName: 'Sesame Seeds',
    category: 'sesame',
    severity: 'mild',
    symptoms: ['Itchy mouth', 'Mild flushing'],
    diagnosedByDoctor: false,
    diagnosedDate: '2024-01-20',
    notes: 'Self-observed mild oral allergy syndrome with tahini and sesame seed oils.',
    aliases: ['sesame', 'tahini', 'til', 'gingelly', 'sesame oil', 'sesame paste'],
  },
];

/**
 * Clearly fictional demo user profile.
 * Notice: Medical health safety (allergies, EpiPen) is kept strictly separate
 * from general lifestyle dietary preferences (vegetarian, low sodium).
 */
export const mockDemoUserProfile: UserProfile = {
  id: 'usr-demo-789',
  fullName: 'Alex Jordan (Demo Profile)',
  email: 'alex.jordan.demo@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  createdAt: '2025-01-10T08:00:00Z',

  // Personal Information (Fictional Demo Data)
  age: 29,
  height: 175,
  heightUnit: 'cm',
  weight: 68,
  weightUnit: 'kg',

  // Medical & Health (Safety-Critical)
  healthProfile: {
    allergies: mockSampleAllergies,
    hasEpiPen: true,
    epiPenExpiryDate: '2026-12-31',
    hasAsthma: false,
    emergencyContact: {
      name: 'Morgan Jordan',
      relationship: 'Spouse',
      phoneNumber: '+1 (555) 019-2834',
      isDoctor: false,
    },
    emergencyActionPlanNotes:
      'In case of accidental peanut exposure: administer EpiPen immediately to outer thigh and call 911 emergency services.',
  },

  // Lifestyle & Dietary Preferences (Non-Medical)
  dietaryPreferences: {
    primaryDiet: 'vegetarian',
    dislikedIngredients: ['Cilantro', 'Artificial Sweeteners'],
    avoidArtificialAdditives: true,
    preferOrganic: true,
    notes: 'Prefers plant-based proteins and clean whole-food ingredients.',
  },

  // App & Device Settings
  settings: {
    notificationsEnabled: true,
    highRiskAlertSound: true,
    cameraAutofocusOcr: true,
    inAppReminders: true,
    foodSafetyAlerts: true,
    hydrationNudges: false,
  },
};

/**
 * Fictional demo food checks showcasing safe vs unsafe allergen detections
 */
export const mockDemoFoodChecks: FoodCheck[] = [
  {
    id: 'chk-101',
    foodName: 'Organic Berry Oat Crunch Bar',
    brand: 'NatureHarvest',
    barcode: '012345678901',
    scanSource: 'barcode',
    ingredientsList: [
      'Rolled Oats',
      'Brown Rice Syrup',
      'Dried Blueberries',
      'Sunflower Seeds',
      'Chia Seeds',
      'Sea Salt',
    ],
    safetyStatus: 'safe',
    detectedAllergens: [],
    detectedDietaryConflicts: [],
    summaryNote: 'Safe to consume. No peanut, shellfish, or sesame ingredients detected.',
    checkedAt: '2026-10-10T14:30:00Z',
  },
  {
    id: 'chk-102',
    foodName: 'Crispy Pad Thai Noodle Kit',
    brand: 'Golden Wok Express',
    barcode: '098765432109',
    scanSource: 'ocr_label',
    ingredientsList: [
      'Rice Noodles',
      'Peanut Sauce Paste',
      'Crushed Roasted Peanuts',
      'Shrimp Powder',
      'Soy Sauce',
      'Sugar',
      'Sesame Oil',
    ],
    safetyStatus: 'unsafe',
    detectedAllergens: [
      {
        ingredientName: 'Crushed Roasted Peanuts',
        isAllergen: true,
        allergenId: 'alg-001',
        matchedAllergenName: 'Peanuts',
        severity: 'severe',
        isDietaryConflict: false,
      },
      {
        ingredientName: 'Shrimp Powder',
        isAllergen: true,
        allergenId: 'alg-002',
        matchedAllergenName: 'Shellfish',
        severity: 'moderate',
        isDietaryConflict: true,
        conflictReason: 'Non-vegetarian seafood derivative',
      },
      {
        ingredientName: 'Sesame Oil',
        isAllergen: true,
        allergenId: 'alg-003',
        matchedAllergenName: 'Sesame Seeds',
        severity: 'mild',
        isDietaryConflict: false,
      },
    ],
    detectedDietaryConflicts: [
      {
        ingredientName: 'Shrimp Powder',
        isAllergen: true,
        isDietaryConflict: true,
        conflictReason: 'Violates Vegetarian lifestyle preference',
      },
    ],
    summaryNote: 'HIGH RISK: Contains Peanuts, Shrimp, and Sesame. Do not consume.',
    checkedAt: '2026-10-11T12:15:00Z',
  },
];

/**
 * Fictional demo incident exposure report
 */
export const mockDemoExposureReports: ExposureReport[] = [
  {
    id: 'exp-201',
    reportedAt: '2026-09-18T19:45:00Z',
    foodName: 'Cross-contaminated Bakery Cupcake',
    suspectedAllergens: ['Peanuts'],
    severity: 'mild',
    symptomsExperienced: ['Mild lip tingling', 'Itchy palate'],
    epiPenAdministered: false,
    actionTaken: 'Took Cetirizine 10mg antihistamine, rinsed mouth with water, rested for 2 hours.',
    notes: 'Bakery stated nut-free on label, but may share equipment with peanut pastries.',
    resolved: true,
  },
];

/**
 * Fictional demo reminders (EpiPen check, wellness routines)
 */
export const mockDemoReminders: Reminder[] = [
  {
    id: 'rem-101',
    title: 'Midday Hydration Break (2 Glasses)',
    category: 'hydration',
    dueDate: '2026-10-11',
    timeOfDay: '01:30 PM',
    frequency: 'daily',
    notes: 'Drink 500ml water after lunch to support gentle digestion.',
    completed: true,
    completedAt: '01:32 PM',
    isActive: true,
  },
  {
    id: 'rem-102',
    title: 'Prescribed Maintenance Dose (Clinician Plan)',
    category: 'medication',
    dueDate: '2026-10-11',
    timeOfDay: '09:00 PM',
    frequency: 'daily',
    notes: 'Take prescribed dose strictly according to your clinician’s directions.',
    completed: false,
    isActive: true,
  },
  {
    id: 'rem-103',
    title: 'Evening Barrier Moisturizer Routine',
    category: 'skin_care',
    dueDate: '2026-10-11',
    timeOfDay: '09:30 PM',
    frequency: 'daily',
    notes: 'Fragrance-free, nut-oil-free cream after gentle face cleansing.',
    completed: false,
    isActive: true,
  },
  {
    id: 'rem-104',
    title: 'Inspect EpiPen / Adrenaline Auto-Injector Expiry',
    category: 'medication',
    dueDate: '2026-10-18',
    timeOfDay: '10:00 AM',
    frequency: 'monthly',
    notes: 'Check safety cap, expiration date label, and solution window for clarity.',
    completed: false,
    isActive: true,
  },
  {
    id: 'rem-105',
    title: 'Scalp Care & Sulfate-Free Wash',
    category: 'hair_care',
    dueDate: '2026-10-13',
    timeOfDay: '08:00 AM',
    frequency: 'weekly',
    notes: 'pH-balanced gentle wash; inspect label to ensure no tree nut or dairy extracts.',
    completed: false,
    isActive: true,
  },
  {
    id: 'rem-106',
    title: 'Pre-Weekend Restaurant Allergen Check',
    category: 'other',
    dueDate: '2026-10-16',
    timeOfDay: '04:00 PM',
    frequency: 'one_time',
    notes: 'Contact head chef regarding peanut and dairy cross-contact prevention.',
    completed: false,
    isActive: true,
  },
  {
    id: 'rem-107',
    title: 'Morning Mindfulness & Stress Check',
    category: 'wellness',
    dueDate: '2026-10-11',
    timeOfDay: '08:00 AM',
    frequency: 'daily',
    notes: '5 minutes of calm box breathing to reduce dining anxiety.',
    completed: true,
    completedAt: '08:05 AM',
    isActive: true,
  },
];


/**
 * Fictional demo wellness routines
 */
export const mockDemoWellnessRoutines: WellnessRoutine[] = [
  {
    id: 'wel-401',
    title: 'Pre-Meal Allergen Check',
    category: 'nutrition_tracking',
    frequency: 'Every meal outside home',
    completedToday: true,
    currentStreakDays: 14,
    description: 'Scan packaged snacks or confirm kitchen ingredients with restaurant staff.',
  },
  {
    id: 'wel-402',
    title: 'Hydration & Gut Balance',
    category: 'hydration',
    frequency: 'Daily (2.5 Liters)',
    completedToday: false,
    currentStreakDays: 6,
    description: 'Support optimal digestion and immune regulation with structured hydration.',
  },
  {
    id: 'wel-403',
    title: 'Mindful Dining Check-in',
    category: 'mindfulness',
    frequency: 'Daily lunch',
    completedToday: true,
    currentStreakDays: 9,
    description: 'Take 3 calm breaths before eating to lower food anxiety and support mindful eating.',
  },
];

/**
 * Fictional demo skin, hair care, and wellness activities
 */
export const mockDemoRoutineActivities: RoutineActivity[] = [
  {
    id: 'act-501',
    name: 'Fragrance-Free Hydrating Facial Cleanser',
    category: 'skin_care',
    frequency: 'Twice daily (AM/PM)',
    notes: 'Gentle non-foaming wash. Pat dry with a clean towel; avoid harsh scrubbing.',
    completedToday: true,
    completedAt: '08:15 AM',
  },
  {
    id: 'act-502',
    name: 'Ceramide Barrier Moisturizing Cream',
    category: 'skin_care',
    frequency: 'Daily morning',
    notes: 'Hypoallergenic base. Verify product is free of almond, macadamia, or nut carrier oils.',
    completedToday: true,
    completedAt: '08:20 AM',
  },
  {
    id: 'act-503',
    name: 'Broad-Spectrum Mineral Sunscreen (SPF 50)',
    category: 'skin_care',
    frequency: 'Daily morning before heading outdoors',
    notes: 'Zinc oxide / titanium dioxide formula with no chemical fragrance masks.',
    completedToday: false,
  },
  {
    id: 'act-504',
    name: 'Gentle Sulfate-Free Scalp Cleanser',
    category: 'hair_care',
    frequency: '2–3 times per week',
    notes: 'pH-balanced rinse. Ensure formula is free of hydrolyzed wheat protein or dairy extracts.',
    completedToday: false,
  },
  {
    id: 'act-505',
    name: 'Hypoallergenic Scalp Conditioning Rinse',
    category: 'hair_care',
    frequency: 'Twice weekly',
    notes: 'Check bottle for argan or tree nut derivatives before application.',
    completedToday: false,
  },
  {
    id: 'act-506',
    name: 'Mindful Breathing Before Lunch',
    category: 'general_wellness',
    frequency: 'Daily lunch',
    notes: '3 calm breaths to lower food-allergy dining anxiety and support relaxed digestion.',
    completedToday: true,
    completedAt: '12:40 PM',
  },
];
