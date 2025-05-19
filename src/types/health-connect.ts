export interface HealthData {
  timestamp: Date;
  value: number;
  unit: string;
}

export interface NutritionData extends HealthData {
  type: 'calories' | 'protein' | 'carbs' | 'fat';
  name?: string;
  mealType?: string;
}

export interface HealthConnectAPI {
  initialize(): Promise<void>;
  requestPermissions(): Promise<boolean>;
  getSteps(startDate: Date, endDate: Date): Promise<HealthData[]>;
  getNutrition(startDate: Date, endDate: Date): Promise<NutritionData[]>;
} 