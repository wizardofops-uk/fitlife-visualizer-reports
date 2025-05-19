import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber, getMacroPercentages } from '@/utils/fitnessUtils';

interface NutritionSummaryCardProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water?: number;
}

const NutritionSummaryCard: React.FC<NutritionSummaryCardProps> = React.memo(({ calories, protein, carbs, fat, water = 0 }) => {
  const macroPercentages = getMacroPercentages(protein, carbs, fat);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nutrition Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Calories</p>
            <p className="text-2xl font-bold">{formatNumber(calories)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Water</p>
            <p className="text-2xl font-bold">{formatNumber(water)} ml</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Protein</p>
            <p className="text-2xl font-bold">{formatNumber(protein)}g ({macroPercentages.proteinPercent.toFixed(0)}%)</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Carbs</p>
            <p className="text-2xl font-bold">{formatNumber(carbs)}g ({macroPercentages.carbsPercent.toFixed(0)}%)</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fat</p>
            <p className="text-2xl font-bold">{formatNumber(fat)}g ({macroPercentages.fatPercent.toFixed(0)}%)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

NutritionSummaryCard.displayName = 'NutritionSummaryCard';

export default NutritionSummaryCard;
