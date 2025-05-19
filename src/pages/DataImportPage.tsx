import React, { useState, useMemo, lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { processImportedData, validateFitnessData, calculateDailyTotals } from '@/utils/fitnessDataHelpers';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { Loader2, Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useFitness } from '@/context/FitnessContext';
import { ProcessedFitnessData as AppProcessedFitnessData, DailyFitnessData } from '@/types/fitness';
import { NativeToast } from '@/utils/nativeToast';

// Lazy load the import components with startTransition and Suspense support
const FitbitImport = lazy(() => import('@/components/import/FitbitImport'));

// Create a loading component for Suspense fallback
const LoadingComponent = () => (
  <div className="flex items-center justify-center w-full h-40">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

interface DailyTotals {
  calories: number;
  steps: number;
  distance: number;
  water: number;
}

interface DailyTotalsMap {
  [date: string]: DailyTotals;
}

// Helper function to convert ProcessedFitnessData from utils to AppProcessedFitnessData
const adaptFitnessData = (data: any): AppProcessedFitnessData => {
  console.log('Adapting fitness data - initial data structure:', {
    hasDailyData: !!data.dailyData,
    sampleDate: data.dailyData ? Object.keys(data.dailyData)[0] : null,
    sampleData: data.dailyData ? data.dailyData[Object.keys(data.dailyData)[0]] : null
  });

  // Extract dates
  const dates = Object.keys(data.dailyData || {}).sort();
  const startDate = dates[0] || new Date().toISOString().split('T')[0];
  const endDate = dates[dates.length - 1] || new Date().toISOString().split('T')[0];
  
  // Convert dailyData structure to match AppProcessedFitnessData
  const appDailyData: Record<string, DailyFitnessData> = {};
  
  Object.entries(data.dailyData || {}).forEach(([date, dayData]: [string, any]) => {
    console.log(`Processing day data for ${date}:`, {
      totalCaloriesIn: dayData.totalCaloriesIn,
      totalProtein: dayData.totalProtein, 
      totalCarbs: dayData.totalCarbs,
      totalFat: dayData.totalFat,
      waterIntake: dayData.waterIntake,
      totalWater: dayData.totalWater
    });
    
    // Ensure all numeric values are properly converted and default to 0 if undefined/null/NaN
    const ensureNumber = (value: any) => {
      if (value === undefined || value === null || isNaN(value)) return 0;
      return typeof value === 'number' ? value : Number(value) || 0;
    };
    
    // Handle both waterIntake and totalWater property names
    const waterValue = ensureNumber(dayData.totalWater || dayData.waterIntake);
    
    appDailyData[date] = {
      totalCaloriesIn: ensureNumber(dayData.totalCaloriesIn),
      totalSteps: ensureNumber(dayData.steps || dayData.totalSteps),
      totalDistance: ensureNumber(dayData.distance || dayData.totalDistance),
      totalWater: waterValue,
      // Make sure to copy all macro nutrients
      totalProtein: ensureNumber(dayData.totalProtein || dayData.protein),
      totalCarbs: ensureNumber(dayData.totalCarbs || dayData.carbs),
      totalFat: ensureNumber(dayData.totalFat || dayData.fat),
      // Copy additional properties for compatibility
      caloriesOut: ensureNumber(dayData.caloriesOut),
      waterIntake: waterValue,
      steps: ensureNumber(dayData.steps || dayData.totalSteps),
      distance: ensureNumber(dayData.distance || dayData.totalDistance),
      // Make sure date and day are copied
      date: dayData.date || date,
      day: dayData.day || new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
      meals: (dayData.meals || []).map((meal: any) => ({
        name: meal.name || '',
        brandName: meal.brandName || '',
        amount: meal.amount !== undefined ? meal.amount : '',
        unit: meal.unit || '',
        meal: meal.meal || '',
        calories: ensureNumber(meal.calories),
        protein: ensureNumber(meal.protein),
        carbs: ensureNumber(meal.carbs),
        fat: ensureNumber(meal.fat),
        time: meal.timestamp || meal.time || ''
      })),
      activities: [] // Default empty activities
    };
  });
  
  // Log a sample of the processed data
  const sampleDate = Object.keys(appDailyData)[0];
  console.log('Adapted fitness data sample:', sampleDate ? {
    date: sampleDate,
    data: appDailyData[sampleDate]
  } : 'No data');
  
  return {
    dailyData: appDailyData,
    startDate,
    endDate
  };
};

const DataImportContent = (): JSX.Element => {
  const { fitnessData, setFitnessData, isAuthenticated } = useFitness();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const summaryData = useMemo(() => {
    if (!fitnessData) return null;
    
    // Extract counts from dailyData
    const allMeals: any[] = [];
    const allActivities: any[] = [];
    let waterEntries = 0;
    
    Object.values(fitnessData.dailyData).forEach(day => {
      allMeals.push(...(day.meals || []));
      allActivities.push(...(day.activities || []));
      if (day.totalWater > 0) waterEntries++;
    });
    
    const mealsCount = allMeals.length;
    const activitiesCount = allActivities.length;
    const waterCount = waterEntries;

    return {
      mealsCount,
      activitiesCount,
      waterCount,
      dateRange: {
        start: fitnessData.startDate,
        end: fitnessData.endDate
      }
    };
  }, [fitnessData]);

  const handleFitbitImportSuccess = (data: any) => {
    try {
      // Process and validate the data
      if (!validateFitnessData(data)) {
        throw new Error('Invalid data format from Fitbit');
      }

      // Data is already processed, so just adapt it
      const adaptedData = adaptFitnessData(data);
      setFitnessData(adaptedData);
      
      // Show both regular and native toast
      toast.success('Fitbit data imported successfully');
      NativeToast.success('Fitbit data imported successfully');
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error processing Fitbit data:', error);
      toast.error('Failed to process Fitbit data');
      NativeToast.error('Failed to process Fitbit data');
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Import Fitness Data</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="fitbit" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="fitbit">Fitbit</TabsTrigger>
            </TabsList>
            <TabsContent value="fitbit">
              <ErrorBoundary>
                <Suspense fallback={<LoadingComponent />}>
                  <FitbitImport onImportSuccess={handleFitbitImportSuccess} />
                </Suspense>
              </ErrorBoundary>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {summaryData && (
        <Card>
          <CardHeader>
            <CardTitle>Import Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date Range</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(summaryData.dateRange.start).toLocaleDateString()} - {new Date(summaryData.dateRange.end).toLocaleDateString()}
                </p>
              </div>
              <div>
                <Label>Data Points</Label>
                <p className="text-sm text-muted-foreground">
                  {summaryData.mealsCount} meals, {summaryData.activitiesCount} activities, {summaryData.waterCount} water entries
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default function DataImportPage() {
  return (
    <ErrorBoundary>
      <DataImportContent />
    </ErrorBoundary>
  );
}
