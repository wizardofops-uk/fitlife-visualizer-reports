// Fitness Data Types

// Meal entry from Fitbit data
export interface MealEntry {
  date: string;
  day: string;
  meal: string; // Breakfast, Lunch, Dinner, Snack, or Other
  name: string;
  brandName: string;
  amount: number;
  unit: string;
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
  timestamp?: string;
}

// Activity data from Fitbit
export interface ActivityData {
  date: string;
  caloriesOut: number;
}

// Water intake data
export interface WaterData {
  date: string;
  amount: number; // in ml
}

// Combined daily nutrition and activity data
export interface DailyData {
  date: string;
  day: string;
  meals: MealEntry[];
  totalCaloriesIn: number;
  totalCarbs: number;
  totalFat: number;
  totalProtein: number;
  caloriesOut: number;
  waterIntake: number;
  steps: number;
  distance: number;
  activities?: ActivityData[];
  water?: WaterData[];
}

// Weekly summary data
export interface WeeklySummary {
  startDate: string;
  endDate: string;
  averageCaloriesIn: number;
  averageCarbs: number;
  averageFat: number;
  averageProtein: number;
  averageCaloriesOut: number;
  averageWaterIntake: number;
  totalCaloriesIn: number;
  totalCarbs: number;
  totalFat: number;
  totalProtein: number;
  totalCaloriesOut: number;
  totalWaterIntake: number;
}

// Complete fitness data
export interface FitnessData {
  meals: MealEntry[];
  activities: ActivityData[];
  waterData: WaterData[];
  dailyData: Record<string, DailyData>;
  weeklySummaries: WeeklySummary[];
}

// Fitbit API types
export interface FitbitAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string;
}

export interface FitbitTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
  user_id: string;
}

export interface DailyFitnessData {
  date?: string;
  day?: string;
  totalCaloriesIn: number;
  totalSteps: number;
  totalDistance: number;
  totalWater: number;
  totalProtein?: number;
  totalCarbs?: number;
  totalFat?: number;
  caloriesOut?: number;
  waterIntake?: number;
  steps?: number;
  distance?: number;
  meals: Array<{
    name: string;
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    time: string;
  }>;
  activities: Array<{
    name: string;
    calories: number;
    duration: number;
    time: string;
  }>;
}

export interface ProcessedFitnessData {
  dailyData: Record<string, DailyFitnessData>;
  startDate: string;
  endDate: string;
}

export interface FitnessData {
  dailyData: Record<string, DailyFitnessData>;
  startDate: string;
  endDate: string;
}
