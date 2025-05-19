import { MealEntry, ActivityData, WaterData, DailyData, WeeklySummary } from '@/types/fitness';

export function processImportedData(rawData: any): {
  meals: MealEntry[];
  activities: ActivityData[];
  waterData: WaterData[];
  dailyData: Record<string, DailyData>;
  weeklySummaries: WeeklySummary[];
} {
  const meals: MealEntry[] = rawData.meals?.map((item: any) => ({
    date: item.Date || '',
    day: item.Day || '',
    meal: item.Meal || '',
    name: item.Name || '',
    brandName: item.BrandName || item.brandName || '',
    amount: parseFloat(item.Amount) || 0,
    unit: item.Unit || '',
    calories: parseFloat(item.Cals) || 0,
    carbs: parseFloat(item.Carbs) || 0,
    fat: parseFloat(item.Fat) || 0,
    protein: parseFloat(item.Protein) || 0,
  })) || [];
  const activities: ActivityData[] = rawData.activities?.map((item: any) => ({
    date: item.Date || '',
    caloriesOut: parseFloat(item['Cals Out']) || 0,
  })) || [];
  const waterData: WaterData[] = rawData.water?.map((item: any) => ({
    date: item.Date || '',
    amount: parseFloat(item.Water) || 0,
  })) || [];
  const dailyData: Record<string, DailyData> = {};
  meals.forEach(meal => {
    const date = meal.date;
    if (!dailyData[date]) {
      dailyData[date] = {
        date,
        day: meal.day,
        meals: [],
        totalCaloriesIn: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalProtein: 0,
        caloriesOut: 0,
        waterIntake: 0,
      };
    }
    dailyData[date].meals.push({ 
      ...meal, 
      brandName: meal.brandName || (meal as any).BrandName || '' 
    });
    dailyData[date].totalCaloriesIn += meal.calories;
    dailyData[date].totalCarbs += meal.carbs;
    dailyData[date].totalFat += meal.fat;
    dailyData[date].totalProtein += meal.protein;
  });
  activities.forEach(activity => {
    const date = activity.date;
    if (dailyData[date]) {
      dailyData[date].caloriesOut = activity.caloriesOut;
    }
  });
  waterData.forEach(water => {
    const date = water.date;
    if (dailyData[date]) {
      dailyData[date].waterIntake = water.amount;
    }
  });
  const weeklySummaries: WeeklySummary[] = generateWeeklySummaries(dailyData);
  return {
    meals,
    activities,
    waterData,
    dailyData,
    weeklySummaries,
  };
}

function generateWeeklySummaries(dailyData: Record<string, DailyData>): WeeklySummary[] {
  const summaries: WeeklySummary[] = [];
  const dates = Object.keys(dailyData).sort();
  if (dates.length === 0) return [];
  const weeks: { [weekKey: string]: string[] } = {};
  dates.forEach(date => {
    const dateObj = new Date(date);
    const weekStart = new Date(dateObj);
    weekStart.setDate(dateObj.getDate() - dateObj.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    if (!weeks[weekKey]) {
      weeks[weekKey] = [];
    }
    weeks[weekKey].push(date);
  });
  Object.keys(weeks).forEach(weekKey => {
    const weekDates = weeks[weekKey];
    const weekEnd = new Date(weekKey);
    weekEnd.setDate(weekEnd.getDate() + 6);
    let totalCaloriesIn = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalProtein = 0;
    let totalCaloriesOut = 0;
    let totalWaterIntake = 0;
    weekDates.forEach(date => {
      const day = dailyData[date];
      totalCaloriesIn += day.totalCaloriesIn;
      totalCarbs += day.totalCarbs;
      totalFat += day.totalFat;
      totalProtein += day.totalProtein;
      totalCaloriesOut += day.caloriesOut;
      totalWaterIntake += day.waterIntake;
    });
    const daysCount = weekDates.length;
    summaries.push({
      startDate: weekKey,
      endDate: weekEnd.toISOString().split('T')[0],
      averageCaloriesIn: totalCaloriesIn / daysCount,
      averageCarbs: totalCarbs / daysCount,
      averageFat: totalFat / daysCount,
      averageProtein: totalProtein / daysCount,
      averageCaloriesOut: totalCaloriesOut / daysCount,
      averageWaterIntake: totalWaterIntake / daysCount,
      totalCaloriesIn,
      totalCarbs,
      totalFat,
      totalProtein,
      totalCaloriesOut,
      totalWaterIntake,
    });
  });
  return summaries.sort((a, b) => a.startDate.localeCompare(b.startDate));
}
