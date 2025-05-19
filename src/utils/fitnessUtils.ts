import { MealEntry, DailyData, WeeklySummary } from '@/types/fitness';

export interface NutrientDataPoint {
  name: string;
  value: number;
  color: string;
}

// Format a date to display as string
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Format a number with commas
export function formatNumber(value: number, decimals = 0): string {
  // Handle NaN, null, or undefined values
  if (value === null || value === undefined || isNaN(value)) {
    return decimals === 0 ? '0' : '0.0';
  }
  
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

// Calculate macro percentages
export function getMacroPercentages(protein: number, carbs: number, fat: number) {
  // Ensure we have valid numbers, not NaN or undefined
  protein = protein || 0;
  carbs = carbs || 0;
  fat = fat || 0;

  // Calculate calories from each macro
  const proteinKcal = protein * 4;
  const carbsKcal = carbs * 4;
  const fatKcal = fat * 9;
  const totalKcal = proteinKcal + carbsKcal + fatKcal;
  if (totalKcal === 0) return { proteinPercent: 0, carbsPercent: 0, fatPercent: 0 };

  return {
    proteinPercent: Math.round((proteinKcal / totalKcal) * 100),
    carbsPercent: Math.round((carbsKcal / totalKcal) * 100),
    fatPercent: Math.round((fatKcal / totalKcal) * 100)
  };
}

// Get water percentage
export function getWaterPercentage(waterIntake: number, goal = 2500): number {
  return Math.min(Math.round((waterIntake / goal) * 100), 100);
}

// Get date range for a week
export function getWeekDates(startDate: string): string[] {
  const start = new Date(startDate);
  const dates: string[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
}

// Format date range
export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

// Get nutrient data for charts
export function getNutrientData(data: { totalProtein?: number; totalCarbs?: number; totalFat?: number }): NutrientDataPoint[] {
  // Ensure all values are valid numbers, defaulting to 0 for invalid values
  const ensureNumber = (value: any) => {
    if (value === undefined || value === null || isNaN(value)) return 0;
    return typeof value === 'number' ? value : Number(value) || 0;
  };
  
  const protein = ensureNumber(data.totalProtein);
  const carbs = ensureNumber(data.totalCarbs);
  const fat = ensureNumber(data.totalFat);
  
  return [
    { name: 'Carbs', value: carbs, color: '#FF9800' },
    { name: 'Protein', value: protein, color: '#2196F3' },
    { name: 'Fat', value: fat, color: '#F44336' },
  ];
}

// Filter meals by type
export function getMealsByType(meals: MealEntry[], mealType: string): MealEntry[] {
  return meals.filter(meal => 
    meal.meal.toLowerCase() === mealType.toLowerCase()
  );
}

// Parse date string to ISO format
export function formatDateToISO(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
}

// Get week start date (Sunday) from any date
export function getWeekStartDate(dateStr: string): Date {
  if (!dateStr) {
    console.error('getWeekStartDate: Date string is undefined or empty');
    throw new Error('Invalid date: date string is empty');
  }
  
  // Try to parse the date
  const date = new Date(dateStr);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    console.error(`getWeekStartDate: Invalid date string "${dateStr}"`);
    throw new Error(`Invalid date: "${dateStr}"`);
  }
  
  // Calculate the start of the week (Sunday)
  const day = date.getDay(); // 0 for Sunday
  date.setDate(date.getDate() - day);
  return date;
}

// Group daily data by week
export function groupByWeek(dailyData: Record<string, DailyData>): Record<string, DailyData[]> {
  const result: Record<string, DailyData[]> = {};
  
  // First, do some debugging to help diagnose issues
  console.log('groupByWeek: Data structure received:', {
    keys: Object.keys(dailyData),
    firstEntry: Object.keys(dailyData).length > 0 ? 
      JSON.stringify(dailyData[Object.keys(dailyData)[0]]) : 'No entries'
  });
  
  Object.entries(dailyData).forEach(([dateKey, day]) => {
    // Ensure the date property exists by using the key if needed
    if (!day.date) {
      console.log(`groupByWeek: Adding missing date property for key ${dateKey}`);
      (day as any).date = dateKey;
    }
    
    // Skip entries with no date property (should not happen after the fix above)
    if (!day || !day.date) {
      console.warn('groupByWeek: Skipping entry with missing date property', day);
      return;
    }
    
    try {
      const weekStart = getWeekStartDate(day.date);
      const weekKey = formatDateToISO(weekStart.toISOString());
      
      if (!result[weekKey]) {
        result[weekKey] = [];
      }
      
      result[weekKey].push(day);
    } catch (error) {
      console.error(`Error processing date ${day.date}:`, error);
      // Skip invalid dates instead of crashing
    }
  });
  
  // Check if we have any valid weeks
  if (Object.keys(result).length === 0) {
    console.warn('groupByWeek: No valid weeks found in data');
  } else {
    console.log('groupByWeek: Successfully grouped data into weeks:', Object.keys(result));
  }
  
  return result;
}

// Calculate weekly summary from daily data
export function calculateWeeklySummary(days: DailyData[]): WeeklySummary | null {
  if (!days.length) return null;
  
  // Helper to ensure values are numbers
  const ensureNumber = (value: any) => {
    if (value === undefined || value === null || isNaN(value)) return 0;
    return typeof value === 'number' ? value : Number(value) || 0;
  };
  
  const startDate = new Date(days.reduce((min, day) => 
    day.date < min ? day.date : min, days[0].date
  ));
  
  const endDate = new Date(days.reduce((max, day) => 
    day.date > max ? day.date : max, days[0].date
  ));
  
  // Safely access properties with fallbacks to 0 for undefined values
  const totalCaloriesIn = days.reduce((sum, day) => sum + ensureNumber(day.totalCaloriesIn), 0);
  const totalCarbs = days.reduce((sum, day) => sum + ensureNumber(day.totalCarbs), 0);
  const totalFat = days.reduce((sum, day) => sum + ensureNumber(day.totalFat), 0);
  const totalProtein = days.reduce((sum, day) => sum + ensureNumber(day.totalProtein), 0);
  const totalCaloriesOut = days.reduce((sum, day) => sum + ensureNumber(day.caloriesOut), 0);
  const totalWaterIntake = days.reduce((sum, day) => sum + ensureNumber(day.waterIntake), 0);
  
  // Ensure we never divide by zero
  const count = Math.max(1, days.length);
  
  return {
    startDate: formatDateToISO(startDate.toISOString()),
    endDate: formatDateToISO(endDate.toISOString()),
    averageCaloriesIn: Math.round(totalCaloriesIn / count),
    averageCarbs: Math.round(totalCarbs / count),
    averageFat: Math.round(totalFat / count),
    averageProtein: Math.round(totalProtein / count),
    averageCaloriesOut: Math.round(totalCaloriesOut / count),
    averageWaterIntake: Math.round(totalWaterIntake / count),
    totalCaloriesIn,
    totalCarbs,
    totalFat,
    totalProtein,
    totalCaloriesOut,
    totalWaterIntake
  };
}

// Parse JSON data
export function parseImportedJson(json: string): any {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    throw new Error('Invalid JSON format');
  }
}
