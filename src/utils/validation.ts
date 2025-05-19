import { z } from 'zod';

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in yyyy-MM-dd format');

export const mealEntrySchema = z.object({
  name: z.string(),
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
  timestamp: dateStringSchema,
  meal: z.string().optional(),
});

export const activityDataSchema = z.object({
  steps: z.number().min(0),
  distance: z.number().min(0),
  calories: z.number().min(0),
  activeMinutes: z.number().min(0),
  date: dateStringSchema,
});

export const waterDataSchema = z.object({
  amount: z.number().min(0),
  timestamp: dateStringSchema,
});

export const dailyDataSchema = z.object({
  date: dateStringSchema,
  meals: z.array(mealEntrySchema),
  totalCaloriesIn: z.number().min(0),
  totalCarbs: z.number().min(0),
  totalProtein: z.number().min(0),
  totalFat: z.number().min(0),
  caloriesOut: z.number().min(0),
  waterIntake: z.number().min(0),
  steps: z.number().min(0),
  distance: z.number().min(0),
});

export const fitnessDataSchema = z.object({
  meals: z.array(mealEntrySchema),
  activities: z.array(activityDataSchema),
  waterData: z.array(waterDataSchema),
  dailyData: z.record(dateStringSchema, dailyDataSchema),
  dailyTotals: z.record(dateStringSchema, z.object({
    calories: z.number().min(0),
    protein: z.number().min(0),
    carbs: z.number().min(0),
    fat: z.number().min(0),
    steps: z.number().min(0),
    distance: z.number().min(0),
    water: z.number().min(0),
  })).optional(),
});

export const validateData = <T>(data: unknown, schema: z.ZodSchema<T>): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        `Validation failed: ${error.errors.map(e => e.message).join(', ')}`
      );
    }
    throw error;
  }
}; 