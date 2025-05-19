import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { validateData } from '../utils/validation';
import { fitnessDataSchema } from '../utils/validation';
import { handleError } from '../utils/errors';
import { format, subDays } from 'date-fns';

const API_BASE_URL = 'https://api.fitbit.com/1';

interface FetchOptions {
  startDate: Date;
  endDate: Date;
  accessToken: string;
}

const fetchFitbitData = async ({ startDate, endDate, accessToken }: FetchOptions) => {
  try {
    const dateRange = {
      start: format(startDate, 'yyyy-MM-dd'),
      end: format(endDate, 'yyyy-MM-dd'),
    };

    // Fetch nutrition data
    const nutritionResponse = await fetch(
      `${API_BASE_URL}/user/-/foods/log/date/${dateRange.start}/${dateRange.end}.json`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!nutritionResponse.ok) {
      throw new Error(`Nutrition API error: ${nutritionResponse.statusText}`);
    }

    const nutritionData = await nutritionResponse.json();

    // Fetch activity data
    const activityResponse = await fetch(
      `${API_BASE_URL}/user/-/activities/date/${dateRange.start}/${dateRange.end}.json`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!activityResponse.ok) {
      throw new Error(`Activity API error: ${activityResponse.statusText}`);
    }

    const activityData = await activityResponse.json();

    // Fetch water data
    const waterResponse = await fetch(
      `${API_BASE_URL}/user/-/foods/log/water/date/${dateRange.start}/${dateRange.end}.json`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!waterResponse.ok) {
      throw new Error(`Water API error: ${waterResponse.statusText}`);
    }

    const waterData = await waterResponse.json();

    // Combine and validate the data
    const combinedData = {
      dailyData: nutritionData.foods.map((food: any) => ({
        date: food.logDate,
        meals: food.meals,
        activities: activityData.activities,
        water: waterData.water,
      })),
      weeklySummary: {
        startDate: dateRange.start,
        endDate: dateRange.end,
        totalCalories: nutritionData.summary.calories,
        totalProtein: nutritionData.summary.protein,
        totalCarbs: nutritionData.summary.carbs,
        totalFat: nutritionData.summary.fat,
        totalSteps: activityData.summary.steps,
        totalDistance: activityData.summary.distances[0]?.distance || 0,
        totalWater: waterData.summary.water,
      },
    };

    return validateData(combinedData, fitnessDataSchema);
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const useFitbitData = (accessToken: string | null) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['fitbitData'],
    queryFn: () => {
      if (!accessToken) {
        throw new Error('No access token available');
      }
      return fetchFitbitData({
        startDate: subDays(new Date(), 7),
        endDate: new Date(),
        accessToken,
      });
    },
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  const refreshData = useMutation({
    mutationFn: fetchFitbitData,
    onSuccess: (newData) => {
      queryClient.setQueryData(['fitbitData'], newData);
    },
    onError: (error) => {
      handleError(error);
    },
  });

  return {
    data,
    isLoading,
    error,
    refreshData: refreshData.mutate,
  };
}; 