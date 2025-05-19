import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MealEntry } from '@/types/fitness';
import { formatNumber } from '@/utils/fitnessUtils';

interface MealListProps {
  meals: MealEntry[];
  title?: string;
}

const MealList: React.FC<MealListProps> = React.memo(({ 
  meals, 
  title = "Meals" 
}) => {
  // Group meals by type (Breakfast, Lunch, Dinner, Snack)
  const mealsByType: Record<string, MealEntry[]> = {};
  
  meals.forEach(meal => {
    const type = meal.meal;
    if (!mealsByType[type]) {
      mealsByType[type] = [];
    }
    mealsByType[type].push(meal);
  });

  // Sort meal types in logical order
  const mealOrder: Record<string, number> = {
    'Breakfast': 1,
    'Morning Snack': 2,
    'Lunch': 3,
    'Afternoon Snack': 4,
    'Dinner': 5,
    'Evening Snack': 6,
    'Snack': 7,
  };
  
  const sortedMealTypes = Object.keys(mealsByType).sort((a, b) => {
    return (mealOrder[a] || 99) - (mealOrder[b] || 99);
  });

  if (meals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No meals recorded for this day</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>{title}</span>
          <span className="text-sm font-normal">
            {meals.length} {meals.length === 1 ? 'meal' : 'meals'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {sortedMealTypes.map(mealType => (
            <div key={mealType} className="divide-y">
              <div className="px-4 py-2 bg-muted/50 font-semibold text-foreground border-b">
                {mealType}
                <span className="text-sm font-medium text-muted-foreground ml-2">
                  {mealsByType[mealType].reduce((sum, meal) => sum + meal.calories, 0)} kcal
                </span>
              </div>
              
              {mealsByType[mealType].map((meal, index) => (
                <div key={index} className="p-4 hover:bg-muted/10">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">
                        {meal.name}
                        {meal.brandName && (
                          <span className="text-sm text-muted-foreground ml-1">
                            ({meal.brandName})
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {meal.amount} {meal.unit}
                      </div>
                    </div>
                    <div className="text-right">
                      <div>{formatNumber(meal.calories)} kcal</div>
                      <div className="text-xs text-muted-foreground">
                        Carbohydrates: {formatNumber(meal.carbs)}g • 
                        Protein: {formatNumber(meal.protein)}g • 
                        Fat: {formatNumber(meal.fat)}g
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

MealList.displayName = 'MealList';

export default MealList;
