/**
 * SafeBiteAI API Service Placeholder
 * 
 * Future backend integration abstraction layer.
 * NOTE: Currently returns typed mock data with simulated asynchronous delays.
 * No real network requests are executed at this stage.
 */

import type {
  UserProfile,
  Allergy,
  FoodCheck,
  ExposureReport,
  Reminder,
  WellnessRoutine,
} from '../types';
import {
  mockDemoUserProfile,
  mockSampleAllergies,
  mockDemoFoodChecks,
  mockDemoExposureReports,
  mockDemoReminders,
  mockDemoWellnessRoutines,
} from '../data/mockData';

// Simulated response latency helper (default: 150ms for realistic UI testing)
const simulateLatency = <T>(data: T, delayMs: number = 150): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delayMs);
  });
};

export const api = {
  /**
   * Fetch current authenticated user's profile and health preferences
   */
  async getUserProfile(): Promise<UserProfile> {
    return simulateLatency({ ...mockDemoUserProfile });
  },

  /**
   * Update user profile settings or preferences
   */
  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    return simulateLatency({
      ...mockDemoUserProfile,
      ...updates,
    });
  },

  /**
   * Fetch user's registered medical allergies list
   */
  async getAllergies(): Promise<Allergy[]> {
    return simulateLatency([...mockSampleAllergies]);
  },

  /**
   * Analyze food item ingredients against user's allergy profile
   */
  async checkFoodSafety(foodName: string, ingredients: string[]): Promise<FoodCheck> {
    // Simulated placeholder response for allergen detection
    const simulatedResult: FoodCheck = {
      id: `chk-${Date.now()}`,
      foodName,
      scanSource: 'manual_entry',
      ingredientsList: ingredients,
      safetyStatus: 'safe',
      detectedAllergens: [],
      detectedDietaryConflicts: [],
      summaryNote: `No immediate critical allergens detected among ${ingredients.length} ingredients.`,
      checkedAt: new Date().toISOString(),
    };

    return simulateLatency(simulatedResult);
  },

  /**
   * Fetch history of past food checks
   */
  async getFoodCheckHistory(): Promise<FoodCheck[]> {
    return simulateLatency([...mockDemoFoodChecks]);
  },

  /**
   * Fetch past exposure incident reports
   */
  async getExposureReports(): Promise<ExposureReport[]> {
    return simulateLatency([...mockDemoExposureReports]);
  },

  /**
   * Submit a new allergen exposure or reaction incident report
   */
  async submitExposureReport(
    report: Omit<ExposureReport, 'id' | 'reportedAt'>
  ): Promise<ExposureReport> {
    const newReport: ExposureReport = {
      ...report,
      id: `exp-${Date.now()}`,
      reportedAt: new Date().toISOString(),
    };

    return simulateLatency(newReport);
  },

  /**
   * Fetch user reminders (EpiPen expiry, medication, check-ins)
   */
  async getReminders(): Promise<Reminder[]> {
    return simulateLatency([...mockDemoReminders]);
  },

  /**
   * Fetch daily wellness routines and habits
   */
  async getWellnessRoutines(): Promise<WellnessRoutine[]> {
    return simulateLatency([...mockDemoWellnessRoutines]);
  },
};

export default api;
