import { useContext } from 'react';
import { AllergyContext, type AllergyContextType } from './allergyContextValue';

export const useAllergies = (): AllergyContextType => {
  const context = useContext(AllergyContext);
  if (!context) {
    throw new Error('useAllergies must be used within an AllergyProvider');
  }
  return context;
};
