import { Capacitor } from '@capacitor/core';
import { HealthConnectAPI } from '@/types/health-connect';
import { AndroidHealthConnect } from './AndroidHealthConnect';

export class HealthService {
  private static instance: HealthService;

  private constructor() {}

  public static getInstance(): HealthService {
    if (!HealthService.instance) {
      HealthService.instance = new HealthService();
    }
    return HealthService.instance;
  }

  public async requestPermissions(): Promise<boolean> {
    // In Electron, we don't need to request permissions
    return true;
  }

  public async getSteps(startDate: Date, endDate: Date) {
    return this.getDummyStepData(startDate, endDate);
  }

  private getDummyStepData(startDate: Date, endDate: Date) {
    const result = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      result.push({
        timestamp: new Date(currentDate),
        value: Math.floor(Math.random() * 10000) + 2000, // Random steps between 2000-12000
        unit: 'steps'
      });
      
      // Increment by one day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return result;
  }

  public async getNutrition(startDate: Date, endDate: Date) {
    return this.getDummyNutritionData(startDate, endDate);
  }

  private getDummyNutritionData(startDate: Date, endDate: Date) {
    const result = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      // Add calories entry
      result.push({
        timestamp: new Date(currentDate),
        value: Math.floor(Math.random() * 1000) + 1500, // Random calories between 1500-2500
        unit: 'kcal',
        type: 'calories'
      });
      
      // Add protein entry
      result.push({
        timestamp: new Date(currentDate),
        value: Math.floor(Math.random() * 50) + 50, // Random protein between 50-100g
        unit: 'g',
        type: 'protein'
      });
      
      // Increment by one day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return result;
  }
} 