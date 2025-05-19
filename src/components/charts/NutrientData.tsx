
import { DailyData } from "@/types/fitness";

export type NutrientDataPoint = {
  name: string;
  value: number;
  color: string;
};

export function getNutrientData(dailyData: DailyData): NutrientDataPoint[] {
  return [
    { name: 'Carbs', value: dailyData.totalCarbs, color: '#FF9800' },
    { name: 'Protein', value: dailyData.totalProtein, color: '#2196F3' },
    { name: 'Fat', value: dailyData.totalFat, color: '#F44336' },
  ];
}
