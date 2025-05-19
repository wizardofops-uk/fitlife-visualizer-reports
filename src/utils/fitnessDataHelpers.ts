import { fitnessDataSchema } from './validation';
import { ValidationError } from './errors';

export interface ProcessedFitnessData {
  meals: Array<{
    name: string;
    brandName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    timestamp: string;
    meal?: string;
    amount: string;
    unit: string;
  }>;
  activities: Array<{
    steps: number;
    distance: number;
    calories: number;
    activeMinutes: number;
    date: string;
  }>;
  waterData: Array<{
    amount: number;
    timestamp: string;
  }>;
  dailyData: Record<string, {
    date: string;
    meals: Array<{
      name: string;
      brandName: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      timestamp: string;
      meal?: string;
      amount: string;
      unit: string;
    }>;
    totalCaloriesIn: number;
    totalCarbs: number;
    totalProtein: number;
    totalFat: number;
    caloriesOut: number;
    waterIntake: number;
    steps: number;
    distance: number;
  }>;
  dailyTotals?: Record<string, {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    steps: number;
    distance: number;
    water: number;
  }>;
}

export function processImportedData(data: any): ProcessedFitnessData {
  try {
    // Helper function to ensure date is in yyyy-MM-dd format
    const formatDate = (dateStr: string | undefined): string => {
      if (!dateStr) {
        console.warn('Missing date in data entry');
        return new Date().toISOString().split('T')[0]; // Use current date as fallback
      }
      // If already in yyyy-MM-dd format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      // Try to parse and format the date
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date: ${dateStr}, using current date as fallback`);
        return new Date().toISOString().split('T')[0];
      }
      return date.toISOString().split('T')[0];
    };

    // Process Fitbit data format
    const processedData: ProcessedFitnessData = {
      meals: data.meals?.map((meal: any) => {
        // Check if this is already a processed meal object
        if (meal.timestamp && meal.name && typeof meal.calories === 'number') {
          console.log('Using existing processed meal:', meal);
          return {
            name: meal.name,
            brandName: meal.brandName || '',
            calories: meal.calories,
            protein: meal.protein || 0,
            carbs: meal.carbs || 0,
            fat: meal.fat || 0,
            timestamp: meal.timestamp,
            meal: meal.meal,
            amount: meal.amount !== undefined ? meal.amount : (meal.Amount !== undefined ? meal.Amount : ''),
            unit: meal.unit || meal.Unit || ''
          };
        }
        
        // For raw data, try both Date and date fields
        const date = formatDate(meal.Date || meal.date);
        console.log('Processing raw meal with date:', date, 'from:', meal);
        return {
          name: meal.Name || meal.name || 'Unknown Food',
          brandName: meal.BrandName || meal.brandName || '',
          calories: parseFloat(meal.Cals || meal.calories || '0'),
          protein: parseFloat(meal.Protein || meal.protein || '0'),
          carbs: parseFloat(meal.Carbs || meal.carbs || '0'),
          fat: parseFloat(meal.Fat || meal.fat || '0'),
          timestamp: date,
          meal: meal.Meal || meal.meal,
          amount: meal.Amount !== undefined ? meal.Amount : (meal.amount !== undefined ? meal.amount : ''),
          unit: meal.Unit || meal.unit || ''
        };
      }).filter(Boolean) || [],
      activities: data.activities?.map((activity: any) => {
        // Check if this is already a processed activity object
        if (activity.date && typeof activity.date === 'string' && typeof activity.steps === 'number') {
          console.log('Using existing processed activity:', activity);
          return {
            steps: activity.steps,
            distance: activity.distance || 0,
            calories: activity.calories || 0,
            activeMinutes: activity.activeMinutes || 0,
            date: activity.date
          };
        }
        
        // For raw data, try both date and Date fields
        const date = formatDate(activity.date || activity.Date);
        console.log('Processing raw activity with date:', date, 'from:', activity);
        return {
          steps: parseInt(activity.summary?.steps || '0'),
          distance: parseFloat(activity.summary?.distances?.[0]?.distance || '0'),
          calories: parseInt(activity.summary?.caloriesOut || '0'),
          activeMinutes: parseInt(activity.summary?.veryActiveMinutes || '0'),
          date
        };
      }).filter(Boolean) || [],
      waterData: data.water?.map((water: any) => {
        // Check if this is already a processed water object
        if (water.timestamp && typeof water.amount === 'number') {
          console.log('Using existing processed water:', water);
          return {
            amount: water.amount,
            timestamp: water.timestamp
          };
        }
        
        // For raw data, try both Date and date fields
        const date = formatDate(water.Date || water.date);
        console.log('Processing raw water with date:', date, 'from:', water);
        return {
          amount: parseFloat(water.Water || water.amount || '0'),
          timestamp: date
        };
      }).filter(Boolean) || [],
      dailyData: {}
    };

    // Group data by date
    const dailyData: Record<string, any> = {};
    
    // Process meals by date
    processedData.meals.forEach(meal => {
      const date = meal.timestamp;
      if (!dailyData[date]) {
        initializeDailyData(dailyData, date);
      }
      dailyData[date].meals.push({
        name: meal.name,
        brandName: meal.brandName,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        timestamp: meal.timestamp,
        meal: meal.meal,
        amount: meal.amount,
        unit: meal.unit
      });
      dailyData[date].totalCaloriesIn += meal.calories;
      dailyData[date].totalCarbs += meal.carbs;
      dailyData[date].totalProtein += meal.protein;
      dailyData[date].totalFat += meal.fat;
    });

    // Add activity data
    processedData.activities.forEach(activity => {
      const date = activity.date;
      if (!dailyData[date]) {
        initializeDailyData(dailyData, date);
      }
      dailyData[date].caloriesOut += activity.calories;
      dailyData[date].steps += activity.steps;
      dailyData[date].distance += activity.distance;
    });

    // Add water data
    processedData.waterData.forEach(water => {
      const date = water.timestamp;
      if (!dailyData[date]) {
        initializeDailyData(dailyData, date);
      }
      dailyData[date].waterIntake += water.amount;
    });

    // Helper function to initialize daily data structure
    function initializeDailyData(data: Record<string, any>, date: string) {
      data[date] = {
        date,
        meals: [],
        totalCaloriesIn: 0,
        totalCarbs: 0,
        totalProtein: 0,
        totalFat: 0,
        caloriesOut: 0,
        waterIntake: 0,
        steps: 0,
        distance: 0
      };
    }

    // Calculate daily totals
    const dailyTotals: Record<string, {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      steps: number;
      distance: number;
      water: number;
    }> = {};
    
    // Initialize daily totals for all dates in dailyData
    Object.keys(dailyData).forEach(date => {
      dailyTotals[date] = {
        calories: dailyData[date].totalCaloriesIn,
        protein: dailyData[date].totalProtein,
        carbs: dailyData[date].totalCarbs,
        fat: dailyData[date].totalFat,
        steps: dailyData[date].steps,
        distance: dailyData[date].distance,
        water: dailyData[date].waterIntake
      };
    });

    const result = {
      ...processedData,
      dailyData,
      dailyTotals
    };

    // Log the data before validation
    console.log('Data before validation:', JSON.stringify(result, null, 2));

    // Validate the processed data against the schema
    try {
      fitnessDataSchema.parse(result);
    } catch (error) {
      console.error('Validation error:', error);
      throw error;
    }

    return result;
  } catch (error) {
    console.error('Error processing data:', error);
    if (error instanceof ValidationError) {
      throw new Error(`Invalid data format: ${error.message}`);
    }
    throw error;
  }
}

export function validateFitnessData(data: unknown): boolean {
  try {
    fitnessDataSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}

export function calculateDailyTotals(data: ProcessedFitnessData): Record<string, {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  steps: number;
  distance: number;
  water: number;
}> {
  const dailyTotals: Record<string, {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    steps: number;
    distance: number;
    water: number;
  }> = {};

  // Process meals
  data.meals.forEach(meal => {
    const date = meal.timestamp;
    if (!dailyTotals[date]) {
      dailyTotals[date] = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        steps: 0,
        distance: 0,
        water: 0
      };
    }
    dailyTotals[date].calories += meal.calories;
    dailyTotals[date].protein += meal.protein;
    dailyTotals[date].carbs += meal.carbs;
    dailyTotals[date].fat += meal.fat;
  });

  // Process activities
  data.activities.forEach(activity => {
    const date = activity.date;
    if (!dailyTotals[date]) {
      dailyTotals[date] = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        steps: 0,
        distance: 0,
        water: 0
      };
    }
    dailyTotals[date].steps += activity.steps;
    dailyTotals[date].distance += activity.distance;
  });

  // Process water intake
  data.waterData.forEach(water => {
    const date = water.timestamp;
    if (!dailyTotals[date]) {
      dailyTotals[date] = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        steps: 0,
        distance: 0,
        water: 0
      };
    }
    dailyTotals[date].water += typeof water.amount === 'number' ? water.amount : parseFloat(water.amount || '0');
  });

  return dailyTotals;
} 