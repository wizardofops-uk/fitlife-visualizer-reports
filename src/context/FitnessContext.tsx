import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { ProcessedFitnessData, DailyFitnessData } from '@/types/fitness';
import { processImportedData } from '@/utils/fitnessDataHelpers';
import { initAndSeedDatabase, runQuery, exec } from '@/services/sqliteService';
import { fitnessDataSchema } from '@/utils/validation';
import { toast } from 'sonner';
import { User } from '@/types/auth';

interface FitnessContextType {
  fitnessData: ProcessedFitnessData | null;
  setFitnessData: (data: ProcessedFitnessData) => void;
  clearData: () => void;
  saveData: () => Promise<void>;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  setUserEmail: (email: string) => void;
  importData: (data: any) => Promise<void>;
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
  isLoading: boolean;
  dailyTotals: Record<string, {
    calories: number;
    steps: number;
    distance: number;
    water: number;
  }> | null;
  weeklySummary: Array<{
    weekStart: string;
    calories: number;
    steps: number;
    distance: number;
    water: number;
    days: number;
    averageCalories: number;
    averageSteps: number;
    averageDistance: number;
    averageWater: number;
  }> | null;
}

const FitnessContext = createContext<FitnessContextType | undefined>(undefined);

export const FitnessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fitnessData, setFitnessData] = useState<ProcessedFitnessData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const dailyTotals = useMemo(() => {
    if (!fitnessData) return null;
    return Object.entries(fitnessData.dailyData).reduce((acc, [date, data]) => {
      acc[date] = {
        calories: data.totalCaloriesIn,
        steps: data.totalSteps,
        distance: data.totalDistance,
        water: data.totalWater
      };
      return acc;
    }, {} as Record<string, {
      calories: number;
      steps: number;
      distance: number;
      water: number;
    }>);
  }, [fitnessData]);

  const weeklySummary = useMemo(() => {
    if (!fitnessData) return null;
    const weeks = Object.entries(fitnessData.dailyData).reduce((acc, [date, data]) => {
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!acc[weekKey]) {
        acc[weekKey] = {
          calories: 0,
          steps: 0,
          distance: 0,
          water: 0,
          days: 0
        };
      }
      
      acc[weekKey].calories += data.totalCaloriesIn;
      acc[weekKey].steps += data.totalSteps;
      acc[weekKey].distance += data.totalDistance;
      acc[weekKey].water += data.totalWater;
      acc[weekKey].days++;
      
      return acc;
    }, {} as Record<string, {
      calories: number;
      steps: number;
      distance: number;
      water: number;
      days: number;
    }>);

    return Object.entries(weeks).map(([weekStart, data]) => ({
      weekStart,
      ...data,
      averageCalories: data.calories / data.days,
      averageSteps: data.steps / data.days,
      averageDistance: data.distance / data.days,
      averageWater: data.water / data.days
    }));
  }, [fitnessData]);

  // Helper: get user by email
  const getUserByEmail = (email: string): User | null => {
    const users = runQuery('SELECT * FROM users WHERE email = ?', [email]);
    return users.length > 0 ? users[0] as User : null;
  };

  // Helper: create user
  const createUser = (email: string, passwordHash: string): number => {
    exec('INSERT INTO users (email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?)', [
      email,
      passwordHash,
      new Date().toISOString(),
      new Date().toISOString()
    ]);
    // Get the new user's id
    const user = getUserByEmail(email);
    return user ? user.id : -1;
  };

  // Helper: get fitness data
  const getFitnessData = (userId: number, startDate: string, endDate: string): any[] => {
    return runQuery(
      'SELECT * FROM fitnessData WHERE userId = ? AND date BETWEEN ? AND ? ORDER BY date ASC',
      [userId, startDate, endDate]
    );
  };

  // Helper: save fitness data
  const saveFitnessData = (userId: number, data: any): void => {
    const validatedData = fitnessDataSchema.parse(data);
    exec(
      'INSERT INTO fitnessData (userId, date, steps, calories, distance, water) VALUES (?, ?, ?, ?, ?, ?)',
      [
        userId,
        new Date().toISOString(),
        validatedData.steps || 0,
        validatedData.calories || 0,
        validatedData.distance || 0,
        validatedData.water || 0
      ]
    );
  };

  // Helper: clear all fitness data (but keep default user)
  const clearDatabase = () => {
    exec('DELETE FROM fitnessData');
    exec("DELETE FROM users WHERE email != 'user@app.local'");
  };

  // Helper: import data (expects array of fitnessData rows)
  const importData = async (data: any[]): Promise<void> => {
    if (!Array.isArray(data)) return;
    data.forEach(row => {
      saveFitnessData(row.userId, row);
    });
    toast.success('Data imported successfully');
  };

  // Helper: save all data (for now, just a stub)
  const saveData = async () => {
    toast.success('Data saved!');
  };

  // Helper: clear all loaded fitness data from state
  const clearData = () => {
    setFitnessData(null);
    setSelectedDate(null);
  };

  // Helper: set user email in localStorage
  const setUserEmail = (email: string) => {
    localStorage.setItem('user_email', email);
  };

  // On mount: initialize DB, check for user, load fitness data
  useEffect(() => {
    const initializeDb = async () => {
      setIsLoading(true);
      try {
        await initAndSeedDatabase();
        // Check for existing user
        const email = localStorage.getItem('user_email') || 'user@app.local';
        let user = getUserByEmail(email);
        if (!user) {
          // Create default user
          const userId = createUser(email, 'password123');
          user = getUserByEmail(email);
        }
        if (user) {
          setIsAuthenticated(true);
          // Load the most recent 30 days of fitness data
          const data = getFitnessData(
            user.id,
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            new Date().toISOString()
          );
          if (data && data.length > 0) {
            // You may want to process this data as needed
            setFitnessData(data[data.length - 1]);
            // Set the initial selected date to the most recent date
            const dates = data.map(d => d.date).sort();
            if (dates.length > 0) {
              setSelectedDate(dates[dates.length - 1]);
            }
          }
        } else {
          localStorage.removeItem('user_email');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Database initialization error:', error);
        toast.error('Failed to initialize database');
      } finally {
        setIsLoading(false);
      }
    };
    initializeDb();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      clearData();
    }
  }, [isAuthenticated]);

  return (
    <FitnessContext.Provider
      value={{
        fitnessData,
        setFitnessData,
        clearData,
        saveData,
        isAuthenticated,
        setIsAuthenticated,
        setUserEmail,
        importData,
        selectedDate,
        setSelectedDate,
        isLoading,
        dailyTotals,
        weeklySummary
      }}
    >
      {children}
    </FitnessContext.Provider>
  );
};

export const useFitness = () => {
  const context = useContext(FitnessContext);
  if (!context) {
    throw new Error('useFitness must be used within a FitnessProvider');
  }
  return context;
};

