import { createContext } from 'react';
import type { Allergy } from '../types';

export interface AllergyContextType {
  allergies: Allergy[];
  addAllergy: (newAllergy: Omit<Allergy, 'id'>) => { success: boolean; error?: string };
  updateAllergy: (id: string, updates: Partial<Allergy>) => { success: boolean; error?: string };
  deleteAllergy: (id: string) => void;
  resetToDefault: () => void;
}

export const AllergyContext = createContext<AllergyContextType | undefined>(undefined);
