import type { Allergy } from '../../types';

export type VerificationOutcome =
  | 'Potential Allergen Detected'
  | 'No Listed Allergen Identified'
  | 'Unable to Verify';

export interface MatchedAllergenDetail {
  ingredientEntered: string;
  matchedAlias: string;
  allergenName: string;
  severity: Allergy['severity'];
  allergyId: string;
}

export interface AllergenMatchResult {
  outcome: VerificationOutcome;
  matchedAllergens: MatchedAllergenDetail[];
  ambiguousIngredientsFound: string[];
  parsedIngredients: string[];
  summary: string;
  reasons: string[];
}

/**
 * Common deterministic aliases for key food allergen categories
 */
const ALLERGEN_ALIAS_DICTIONARY: Record<string, string[]> = {
  // Peanuts
  peanuts: [
    'peanut',
    'peanuts',
    'groundnut',
    'groundnuts',
    'arachis',
    'arachis hypogaea',
    'peanut oil',
    'peanut butter',
    'peanut flour',
    'peanut paste',
    'beer nut',
    'monkey nut',
    'mandelonas',
  ],
  // Shellfish / Crustaceans / Molluscs
  crustaceans: [
    'shellfish',
    'shrimp',
    'shrimps',
    'prawn',
    'prawns',
    'crab',
    'crabs',
    'lobster',
    'lobsters',
    'crawfish',
    'crayfish',
    'krill',
    'scampi',
    'barnacle',
    'clam',
    'clams',
    'mussel',
    'mussels',
    'oyster',
    'oysters',
    'scallop',
    'scallops',
    'squid',
    'calamari',
    'octopus',
    'shrimp powder',
    'shrimp paste',
    'crab meat',
    'surimi',
  ],
  // Sesame
  sesame: [
    'sesame',
    'sesames',
    'sesame seed',
    'sesame seeds',
    'tahini',
    'tahina',
    'til',
    'gingelly',
    'sesamum',
    'sesame oil',
    'sesame paste',
    'goma',
    'benne',
    'benne seed',
  ],
  // Tree Nuts
  tree_nuts: [
    'tree nut',
    'tree nuts',
    'almond',
    'almonds',
    'walnut',
    'walnuts',
    'cashew',
    'cashews',
    'pecan',
    'pecans',
    'pistachio',
    'pistachios',
    'macadamia',
    'brazil nut',
    'hazelnut',
    'hazelnuts',
    'filbert',
    'chestnut',
    'praline',
    'marzipan',
    'nut butter',
    'nut paste',
  ],
  // Dairy
  dairy: [
    'milk',
    'dairy',
    'whey',
    'casein',
    'caseinate',
    'lactose',
    'butter',
    'cheese',
    'cream',
    'yogurt',
    'ghee',
    'curds',
  ],
  // Eggs
  eggs: [
    'egg',
    'eggs',
    'albumen',
    'albumin',
    'mayonnaise',
    'meringue',
    'lysozyme',
    'ovalbumin',
    'ovomucin',
    'egg white',
    'egg yolk',
  ],
  // Wheat / Gluten
  wheat_gluten: [
    'wheat',
    'gluten',
    'barley',
    'rye',
    'spelt',
    'durum',
    'semolina',
    'farina',
    'graham',
    'triticale',
  ],
  // Soy
  soy: [
    'soy',
    'soya',
    'soybean',
    'soybeans',
    'edamame',
    'tofu',
    'tempeh',
    'miso',
    'tamari',
    'soy lecithin',
    'soy protein',
    'soy sauce',
  ],
};

/**
 * Ambiguous terms that cannot be confirmed safe without manufacturer clarification
 */
const AMBIGUOUS_TERMS: { term: string; warning: string }[] = [
  { term: 'spices', warning: 'Unspecified "spices" may conceal sesame, mustard, or celery.' },
  { term: 'spice', warning: 'Unspecified "spice" blend cannot be verified.' },
  { term: 'natural flavor', warning: '"Natural flavors" can derive from allergen-containing sources.' },
  { term: 'natural flavors', warning: '"Natural flavors" can derive from allergen-containing sources.' },
  { term: 'natural flavoring', warning: '"Natural flavoring" origin is undisclosed.' },
  { term: 'artificial flavor', warning: 'Flavoring agents may carry cross-contact carriers.' },
  { term: 'artificial flavors', warning: 'Flavoring agents may carry cross-contact carriers.' },
  { term: 'flavorings', warning: 'Undisclosed flavorings cannot be verified.' },
  { term: 'flavoring', warning: 'Undisclosed flavoring cannot be verified.' },
  { term: 'vegetable oil', warning: 'Unspecified vegetable oil may include peanut or sesame oil blends.' },
  { term: 'vegetable broth', warning: 'Broth bases often contain hidden hydrolysates or extracts.' },
  { term: 'seasoning', warning: 'Generic "seasoning" mixes frequently contain unlisted ground allergens.' },
  { term: 'seasonings', warning: 'Generic "seasonings" cannot be verified safe.' },
  { term: 'hydrolyzed protein', warning: 'Hydrolyzed vegetable protein may derive from soy or wheat.' },
  { term: 'emulsifier', warning: 'Unspecified emulsifiers may contain soy or egg fractions.' },
];

/**
 * Clean and parse free-form ingredient text into discrete ingredient tokens
 */
export function parseIngredientText(rawText: string): string[] {
  if (!rawText.trim()) return [];

  // Normalize delimiters (newlines, bullets, colons, slashes, semicolons) into commas
  const sanitized = rawText
    .replace(/^ingredients\s*[:-]/i, '')
    .replace(/[\n\r;•*·]+/g, ', ')
    .replace(/\[|\]|\(|\)/g, ', ');

  return sanitized
    .split(',')
    .map((item) => item.trim().replace(/^[-–—]\s*/, ''))
    .filter((item) => item.length > 0 && !/^and\s+/i.test(item));
}

/**
 * Deterministically match parsed ingredients against registered user allergies
 */
export function checkIngredientsSafety(
  rawInput: string,
  userAllergies: Allergy[]
): AllergenMatchResult {
  const trimmedInput = rawInput.trim();

  // 1. Check for empty or excessively short input
  if (!trimmedInput) {
    return {
      outcome: 'Unable to Verify',
      matchedAllergens: [],
      ambiguousIngredientsFound: [],
      parsedIngredients: [],
      summary: 'No ingredient text provided.',
      reasons: ['Please enter an ingredient list to analyze for food allergens.'],
    };
  }

  const ingredients = parseIngredientText(trimmedInput);

  if (ingredients.length === 0 || (ingredients.length === 1 && ingredients[0].length < 3)) {
    return {
      outcome: 'Unable to Verify',
      matchedAllergens: [],
      ambiguousIngredientsFound: [],
      parsedIngredients: ingredients,
      summary: 'Ingredient text is incomplete or too short to analyze.',
      reasons: ['The entered text does not appear to contain a readable list of food ingredients.'],
    };
  }

  const matchedAllergens: MatchedAllergenDetail[] = [];
  const ambiguousFound: string[] = [];
  const reasons: string[] = [];

  // 2. Perform deterministic matching against each user allergy
  for (const allergy of userAllergies) {
    // Collect all aliases for this allergy
    const categoryKey = allergy.category.toLowerCase();
    const dictionaryAliases = ALLERGEN_ALIAS_DICTIONARY[categoryKey] || [];
    
    // Also include normalized allergen name, custom aliases, and dictionary tokens
    const allergenNameLower = allergy.allergenName.toLowerCase();
    const customAliases = allergy.aliases
      ? allergy.aliases.map((a) => a.toLowerCase().trim()).filter(Boolean)
      : [];
    const allAliases = Array.from(
      new Set([
        allergenNameLower,
        ...allergenNameLower.replace(/[()&,/]/g, ' ').split(/\s+/).filter((w) => w.length > 2),
        ...customAliases,
        ...dictionaryAliases,
      ])
    );

    for (const ingredient of ingredients) {
      const ingLower = ingredient.toLowerCase();

      for (const alias of allAliases) {
        // Match whole word or exact substring
        const regex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(ingLower)) {
          // Avoid duplicate matches for same ingredient and allergen
          const alreadyMatched = matchedAllergens.some(
            (m) => m.ingredientEntered === ingredient && m.allergyId === allergy.id
          );

          if (!alreadyMatched) {
            matchedAllergens.push({
              ingredientEntered: ingredient,
              matchedAlias: alias,
              allergenName: allergy.allergenName,
              severity: allergy.severity,
              allergyId: allergy.id,
            });
            reasons.push(
              `Matched "${ingredient}" with registered allergen "${allergy.allergenName}" (${allergy.severity.toUpperCase()}).`
            );
          }
        }
      }
    }
  }

  // 3. Scan for ambiguous ingredients
  const fullTextLower = trimmedInput.toLowerCase();
  for (const ambiguous of AMBIGUOUS_TERMS) {
    const regex = new RegExp(`\\b${ambiguous.term}\\b`, 'i');
    if (regex.test(fullTextLower)) {
      if (!ambiguousFound.includes(ambiguous.term)) {
        ambiguousFound.push(ambiguous.term);
        reasons.push(ambiguous.warning);
      }
    }
  }

  // 4. Decide outcome based on strict safety hierarchy:
  // A. If ANY registered allergen is detected -> POTENTIAL_ALLERGEN_DETECTED (High Risk)
  if (matchedAllergens.length > 0) {
    return {
      outcome: 'Potential Allergen Detected',
      matchedAllergens,
      ambiguousIngredientsFound: ambiguousFound,
      parsedIngredients: ingredients,
      summary: `DANGER: ${matchedAllergens.length} ingredient match(es) detected for your registered allergies.`,
      reasons,
    };
  }

  // B. If ambiguous ingredients exist OR ingredient list has fewer than 2 items -> UNABLE_TO_VERIFY
  if (ambiguousFound.length > 0) {
    return {
      outcome: 'Unable to Verify',
      matchedAllergens: [],
      ambiguousIngredientsFound: ambiguousFound,
      parsedIngredients: ingredients,
      summary: `Caution: The label contains ${ambiguousFound.length} ambiguous ingredient term(s) that may conceal allergens.`,
      reasons,
    };
  }

  if (ingredients.length < 2) {
    return {
      outcome: 'Unable to Verify',
      matchedAllergens: [],
      ambiguousIngredientsFound: [],
      parsedIngredients: ingredients,
      summary: 'Insufficient ingredient data: Single word or incomplete label provided.',
      reasons: [
        'A complete multi-ingredient list is required to evaluate overall food safety reliably.',
      ],
    };
  }

  // C. Otherwise -> NO_LISTED_ALLERGEN_IDENTIFIED
  return {
    outcome: 'No Listed Allergen Identified',
    matchedAllergens: [],
    ambiguousIngredientsFound: [],
    parsedIngredients: ingredients,
    summary: `None of your ${userAllergies.length} registered allergens were detected in the ${ingredients.length} ingredients analyzed.`,
    reasons: [
      'Verified against registered allergies: ' +
        userAllergies.map((a) => a.allergenName).join(', ') +
        '.',
      'Disclaimer: Spices, unlisted additives, or factory cross-contact are not accounted for.',
    ],
  };
}
