import React, { useState, useEffect } from 'react';
import type { Allergy } from '../types';
import { mockDemoUserProfile } from '../data/mockData';
import { AllergyContext } from './allergyContextValue';


export const AllergyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allergies, setAllergies] = useState<Allergy[]>(() => [
    ...mockDemoUserProfile.healthProfile.allergies,
  ]);

  // Keep mockDemoUserProfile reference updated in memory so non-context functions stay in sync
  useEffect(() => {
    mockDemoUserProfile.healthProfile.allergies = allergies;
  }, [allergies]);

  const addAllergy = (newAllergy: Omit<Allergy, 'id'>): { success: boolean; error?: string } => {
    const trimmedName = newAllergy.allergenName.trim();
    if (!trimmedName) {
      return { success: false, error: 'Allergen name is required.' };
    }

    const isDuplicate = allergies.some(
      (a) => a.allergenName.trim().toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      return {
        success: false,
        error: `An allergy entry for "${trimmedName}" is already registered. Duplicate entries are prevented.`,
      };
    }

    const created: Allergy = {
      ...newAllergy,
      id: `alg-${Date.now()}`,
      allergenName: trimmedName,
      aliases:
        newAllergy.aliases && newAllergy.aliases.length > 0
          ? newAllergy.aliases
          : [trimmedName.toLowerCase()],
    };

    setAllergies((prev) => [created, ...prev]);
    return { success: true };
  };

  const updateAllergy = (
    id: string,
    updates: Partial<Allergy>
  ): { success: boolean; error?: string } => {
    if (updates.allergenName !== undefined) {
      const trimmedName = updates.allergenName.trim();
      if (!trimmedName) {
        return { success: false, error: 'Allergen name cannot be empty.' };
      }

      const isDuplicate = allergies.some(
        (a) =>
          a.id !== id && a.allergenName.trim().toLowerCase() === trimmedName.toLowerCase()
      );

      if (isDuplicate) {
        return {
          success: false,
          error: `Another allergy entry with the name "${trimmedName}" already exists.`,
        };
      }
      updates.allergenName = trimmedName;
    }

    setAllergies((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    return { success: true };
  };

  const deleteAllergy = (id: string) => {
    setAllergies((prev) => prev.filter((item) => item.id !== id));
  };

  const resetToDefault = () => {
    setAllergies([...mockDemoUserProfile.healthProfile.allergies]);
  };

  return (
    <AllergyContext.Provider
      value={{
        allergies,
        addAllergy,
        updateAllergy,
        deleteAllergy,
        resetToDefault,
      }}
    >
      {children}
    </AllergyContext.Provider>
  );
};

export default AllergyProvider;
