// API Response Types
export interface FitbitFoodLogResponse {
  /** Date of the food log (yyyy-MM-dd) */
  date?: string;
  foods: Array<{
    /** Timestamp when the item was logged */
    logDate?: string;
    loggedFood: {
      name: string;
      brand: string;
      amount: number;
      unit: { name: string };
      calories: number;
      mealTypeId: number;
    };
    nutritionalValues: {
      calories: number;
      carbs: number;
      fat: number;
      protein: number;
    };
  }>;
}

export interface FitbitActivityResponse {
  summary: {
    steps: number;
    distances: Array<{
      activity: string;
      distance: number;
    }>;
    caloriesOut: number;
    veryActiveMinutes: number;
  };
}

export interface FitbitWaterResponse {
  summary: {
    water: number;
  };
  goals: {
    water: number;
  };
}

// Imported Data Types
export interface FitbitMeal {
  Date: string;
  Day: string;
  Meal: string;
  Name: string;
  BrandName: string;
  Amount: string;
  Unit: string;
  Cals: string;
  Carbs: string;
  Fat: string;
  Protein: string;
}

export interface FitbitActivity {
  date: string;
  summary: {
    steps: number;
    distances: Array<{
      activity: string;
      distance: number;
    }>;
    caloriesOut: number;
    veryActiveMinutes: number;
  };
}

export interface FitbitWaterLog {
  Date: string;
  Water: string;
  'Water Goal': string;
}

export interface FitbitImportedData {
  meals: FitbitMeal[];
  activities: FitbitActivity[];
  water: FitbitWaterLog[];
}

// Component Props
import { ProcessedFitnessData } from '@/utils/fitnessDataHelpers';

export interface FitbitImportProps {
  onImportSuccess: (data: ProcessedFitnessData) => void;
}

// State Types
export interface DateRange {
  start: Date;
  end: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  isAuthorizing: boolean;
  isLoading: boolean;
  authToken: FitbitTokenResponse | null;
}

// Configuration Types
export interface FitbitConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
}

// Error Types
export interface FitbitError {
  code: string;
  message: string;
  details?: string;
}

// API Types
export interface FitbitTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user_id: string;
}

export interface FitbitAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string;
} 