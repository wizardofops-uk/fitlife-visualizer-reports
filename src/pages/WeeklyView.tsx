import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFitness } from '@/context/FitnessContext';
import { formatDateToISO, formatDateRange, calculateWeeklySummary, groupByWeek } from '@/utils/fitnessUtils';
import NutritionSummaryCard from '@/components/summaries/NutritionSummaryCard';
import NutrientPieChart from '@/components/charts/NutrientPieChart';
import CalorieBarChart from '@/components/charts/CalorieBarChart';
import { DailyData, WeeklySummary } from '@/types/fitness';

const WeeklyView: React.FC = () => {
  const { fitnessData, selectedDate, setSelectedDate } = useFitness();
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [weeklyData, setWeeklyData] = useState<Record<string, DailyData[]>>({});
  const [currentWeekSummary, setCurrentWeekSummary] = useState<WeeklySummary | null>(null);
  
  // Group data by weeks when data changes
  useEffect(() => {
    if (fitnessData?.dailyData) {
      try {
        // Create a properly converted DailyData record from DailyFitnessData
        const convertedDailyData: Record<string, DailyData> = {};
        
        // Log complete data conversion for first date
        if (Object.keys(fitnessData.dailyData).length > 0) {
          const firstDate = Object.keys(fitnessData.dailyData)[0];
          const firstData = fitnessData.dailyData[firstDate];
          console.log('WeeklyView: First date complete data BEFORE conversion:', JSON.stringify({
            date: firstDate,
            data: firstData
          }));
        }
        
        // Helper to ensure values are numbers
        const ensureNumber = (value: any) => {
          if (value === undefined || value === null || isNaN(value)) return 0;
          return typeof value === 'number' ? value : Number(value) || 0;
        };
        
        // Loop through each entry in fitnessData.dailyData
        Object.entries(fitnessData.dailyData).forEach(([dateKey, data]) => {
          console.log(`WeeklyView: Converting data for ${dateKey}:`, JSON.stringify({
            originalData: {
              totalCaloriesIn: data.totalCaloriesIn,
              totalCarbs: data.totalCarbs,
              totalFat: data.totalFat,
              totalProtein: data.totalProtein,
              totalWater: data.totalWater,
              waterIntake: data.waterIntake
            }
          }));
          
          // Handle water values from either property
          const waterValue = ensureNumber(data.totalWater || data.waterIntake);
          
          // Convert the DailyFitnessData to DailyData
          convertedDailyData[dateKey] = {
            date: data.date || dateKey,
            day: data.day || new Date(dateKey).toLocaleDateString('en-US', { weekday: 'long' }),
            meals: (data.meals || []).map(meal => ({
              date: dateKey,
              day: data.day || new Date(dateKey).toLocaleDateString('en-US', { weekday: 'long' }),
              meal: 'Meal',
              name: meal.name || '',
              brandName: '',
              amount: 1,
              unit: 'serving',
              calories: ensureNumber(meal.calories),
              carbs: ensureNumber(meal.carbs),
              fat: ensureNumber(meal.fat),
              protein: ensureNumber(meal.protein),
              timestamp: meal.time || ''
            })),
            totalCaloriesIn: ensureNumber(data.totalCaloriesIn),
            totalCarbs: ensureNumber(data.totalCarbs),
            totalFat: ensureNumber(data.totalFat),
            totalProtein: ensureNumber(data.totalProtein),
            caloriesOut: ensureNumber(data.caloriesOut),
            waterIntake: waterValue,
            steps: ensureNumber(data.steps || data.totalSteps),
            distance: ensureNumber(data.distance || data.totalDistance)
          };
        });
        
        // Now group the properly converted data
        const groupedByWeek = groupByWeek(convertedDailyData);
        setWeeklyData(groupedByWeek);
        
        // Log the first data after conversion
        if (Object.keys(convertedDailyData).length > 0) {
          const firstDate = Object.keys(convertedDailyData)[0];
          const firstDataConverted = convertedDailyData[firstDate];
          console.log('WeeklyView: First date complete data AFTER conversion:', JSON.stringify({
            date: firstDate,
            data: firstDataConverted
          }));
        }
        
        // Set the most recent week as default if no week is selected
        if (Object.keys(groupedByWeek).length > 0 && (!selectedWeek || !groupedByWeek[selectedWeek])) {
          const weeks = Object.keys(groupedByWeek).sort();
          const mostRecentWeek = weeks[weeks.length - 1];
          console.log('WeeklyView: Setting selected week to most recent:', mostRecentWeek);
          setSelectedWeek(mostRecentWeek); // Most recent week
        }
      } catch (error) {
        console.error('Error processing weekly data:', error);
      }
    }
  }, [fitnessData, selectedWeek]);
  
  // Update summary when selected week changes
  useEffect(() => {
    if (selectedWeek && weeklyData[selectedWeek]) {
      const summary = calculateWeeklySummary(weeklyData[selectedWeek]);
      setCurrentWeekSummary(summary);
      
      // Update selected date to first day of the week
      if (weeklyData[selectedWeek].length > 0) {
        const firstDay = weeklyData[selectedWeek][0];
        setSelectedDate(firstDay.date);
      }
    }
  }, [selectedWeek, weeklyData, setSelectedDate]);
  
  // Handle week selection
  const handleWeekChange = (weekStart: string) => {
    setSelectedWeek(weekStart);
  };
  
  // Standardize macro averages for summary and chart
  const macroAverages = useMemo(() => {
    if (!currentWeekSummary) return { protein: 0, carbs: 0, fat: 0 };
    return {
      protein: currentWeekSummary.averageProtein,
      carbs: currentWeekSummary.averageCarbs,
      fat: currentWeekSummary.averageFat,
    };
  }, [currentWeekSummary]);

  const macroData = [
    { name: 'Protein', value: macroAverages.protein, color: '#2196F3' },
    { name: 'Carbs', value: macroAverages.carbs, color: '#FF9800' },
    { name: 'Fat', value: macroAverages.fat, color: '#F44336' },
  ];
  
  // Create sorted week list
  const weekList = Object.keys(weeklyData).sort().reverse();
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Select Week</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {weekList.length > 0 ? (
              weekList.map(weekStart => {
                const summary = calculateWeeklySummary(weeklyData[weekStart]);
                if (!summary) return null;
                
                return (
                  <div 
                    key={weekStart}
                    className={`p-3 rounded-md cursor-pointer ${
                      selectedWeek === weekStart ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleWeekChange(weekStart)}
                  >
                    <div className="font-medium">
                      {formatDateRange(summary.startDate, summary.endDate)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {weeklyData[weekStart].length} days recorded
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-muted-foreground text-center py-4">
                No weekly data available
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="col-span-1 md:col-span-2 space-y-4">
          {currentWeekSummary ? (
            <>
              <div className="bg-muted/10 p-4 rounded-md">
                <h2 className="text-xl font-semibold">
                  {formatDateRange(currentWeekSummary.startDate, currentWeekSummary.endDate)}
                </h2>
                <p className="text-muted-foreground">
                  {weeklyData[selectedWeek!].length} days recorded
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NutritionSummaryCard
                  calories={currentWeekSummary.averageCaloriesIn}
                  protein={macroAverages.protein}
                  carbs={macroAverages.carbs}
                  fat={macroAverages.fat}
                  water={currentWeekSummary.averageWaterIntake}
                />
                
                <Card>
                  <CardHeader>
                    <CardTitle>Average Macro Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center h-[280px] py-6">
                    <NutrientPieChart data={macroData} />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Calories</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[200px]">
                    <CalorieBarChart
                      dailyData={weeklyData[selectedWeek!]}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Energy & Activity Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Weekly Totals</h3>
                      <div className="flex justify-between">
                        <span className="text-sm">Calories consumed</span>
                        <span className="font-medium">{currentWeekSummary.totalCaloriesIn.toLocaleString()} kcal</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Calories burned</span>
                        <span className="font-medium">{currentWeekSummary.totalCaloriesOut.toLocaleString()} kcal</span>
                      </div>
                      <div className="flex justify-between border-t pt-1 mt-1">
                        <span className="font-medium">Net balance</span>
                        <span className={`font-medium ${
                          currentWeekSummary.totalCaloriesIn - currentWeekSummary.totalCaloriesOut > 0 
                            ? 'text-orange-500' 
                            : 'text-green-500'
                        }`}>
                          {(currentWeekSummary.totalCaloriesIn - currentWeekSummary.totalCaloriesOut).toLocaleString()} kcal
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 pt-2 border-t">
                      <h3 className="text-sm font-medium text-muted-foreground">Averages</h3>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Daily water intake</span>
                        <span className="font-medium">{currentWeekSummary.averageWaterIntake.toLocaleString()} ml</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Daily calories</span>
                        <span className="font-medium">{currentWeekSummary.averageCaloriesIn.toLocaleString()} kcal</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <p className="text-muted-foreground text-center">
                Select a week to view summary data or import your fitness data
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyView;
