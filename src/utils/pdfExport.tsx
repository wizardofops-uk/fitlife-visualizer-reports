import { startOfWeek, endOfWeek, subWeeks, format } from 'date-fns';
import { ProcessedFitnessData, DailyData, MealEntry, ActivityData, WaterData } from '@/types/fitness';
import { pdf } from '@react-pdf/renderer';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { formatDate } from '@/utils/fitnessUtils';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export interface DailyStats {
  date: string;
  totalCaloriesIn: number;
  totalCaloriesOut: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalSteps: number;
  totalDistance: number;
  totalWater: number;
  meals: MealEntry[];
}

export interface WeeklyStats {
  startDate: string;
  endDate: string;
  totalCaloriesIn: number;
  totalCaloriesOut: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalSteps: number;
  totalDistance: number;
  totalWater: number;
  averageCaloriesIn: number;
  averageCaloriesOut: number;
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
  averageSteps: number;
  averageDistance: number;
  averageWater: number;
}

export interface ExportOptions {
  startDate?: Date;
  endDate?: Date;
}

const getDefaultDateRange = (): { startDate: Date; endDate: Date } => {
  const today = new Date();
  const lastWeek = subWeeks(today, 1);
  return {
    startDate: startOfWeek(lastWeek),
    endDate: endOfWeek(lastWeek),
  };
};

const calculateDailyStats = (dailyData: DailyData): DailyStats => {
  return {
    date: dailyData.date,
    totalCaloriesIn: dailyData.totalCaloriesIn || 0,
    totalCaloriesOut: dailyData.caloriesOut || 0,
    totalProtein: dailyData.totalProtein || 0,
    totalCarbs: dailyData.totalCarbs || 0,
    totalFat: dailyData.totalFat || 0,
    totalSteps: dailyData.steps || 0,
    totalDistance: dailyData.distance || 0,
    totalWater: dailyData.waterIntake || 0,
    meals: dailyData.meals || []
  };
};

const calculateWeeklyStats = (dailyStats: DailyStats[]): WeeklyStats => {
  const startDate = dailyStats[0].date;
  const endDate = dailyStats[dailyStats.length - 1].date;
  const daysCount = dailyStats.length;

  const totals = dailyStats.reduce(
    (acc, day) => ({
      totalCaloriesIn: acc.totalCaloriesIn + day.totalCaloriesIn,
      totalCaloriesOut: acc.totalCaloriesOut + day.totalCaloriesOut,
      totalProtein: acc.totalProtein + day.totalProtein,
      totalCarbs: acc.totalCarbs + day.totalCarbs,
      totalFat: acc.totalFat + day.totalFat,
      totalSteps: acc.totalSteps + day.totalSteps,
      totalDistance: acc.totalDistance + day.totalDistance,
      totalWater: acc.totalWater + day.totalWater,
    }),
    {
      totalCaloriesIn: 0,
      totalCaloriesOut: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalSteps: 0,
      totalDistance: 0,
      totalWater: 0,
    }
  );

  return {
    startDate,
    endDate,
    ...totals,
    averageCaloriesIn: totals.totalCaloriesIn / daysCount,
    averageCaloriesOut: totals.totalCaloriesOut / daysCount,
    averageProtein: totals.totalProtein / daysCount,
    averageCarbs: totals.totalCarbs / daysCount,
    averageFat: totals.totalFat / daysCount,
    averageSteps: totals.totalSteps / daysCount,
    averageDistance: totals.totalDistance / daysCount,
    averageWater: totals.totalWater / daysCount,
  };
};

interface PDFOptions {
  startDate: Date;
  endDate: Date;
}

// Cache for chart images
const chartImageCache = new Map<string, string>();

const generateChartImage = async (data: DailyData[]) => {
  const cacheKey = JSON.stringify(data.map(d => ({ 
    date: d.date, 
    calories: d.totalCaloriesIn 
  })));
  
  if (chartImageCache.has(cacheKey)) {
    return chartImageCache.get(cacheKey)!;
  }

  const { default: html2canvas } = await import('html2canvas');

  const chartData = data.map(day => ({
    date: format(new Date(day.date), 'EEE'),
    calories: day.totalCaloriesIn
  }));

  const tempDiv = document.createElement('div');
  tempDiv.style.width = '800px';
  tempDiv.style.height = '400px';
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-1000px';
  tempDiv.style.top = '-1000px';
  tempDiv.style.backgroundColor = '#ffffff';
  document.body.appendChild(tempDiv);

  const Chart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis 
          dataKey="date" 
          tick={{ fill: '#666' }}
          axisLine={{ stroke: '#666' }}
        />
        <YAxis 
          tick={{ fill: '#666' }}
          axisLine={{ stroke: '#666' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff',
            border: '1px solid #eee',
            borderRadius: '4px',
            padding: '8px'
          }}
          formatter={(value: number) => [`${value} kcal`, 'Calories']}
        />
        <Bar 
          dataKey="calories" 
          fill="#8884d8"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  const root = createRoot(tempDiv);
  root.render(<Chart />);

  await new Promise(resolve => setTimeout(resolve, 1000));

  const canvas = await html2canvas(tempDiv, {
    background: '#ffffff',
    useCORS: true,
    allowTaint: true,
    logging: false,
  });

  document.body.removeChild(tempDiv);
  root.unmount();

  const chartImage = canvas.toDataURL('image/png');
  chartImageCache.set(cacheKey, chartImage);
  
  return chartImage;
};

const generateNutrientChartImage = async (dailyData: DailyData) => {
  const protein = dailyData.totalProtein || 0;
  const carbs = dailyData.totalCarbs || 0;
  const fat = dailyData.totalFat || 0;
  const proteinKcal = protein * 4;
  const carbsKcal = carbs * 4;
  const fatKcal = fat * 9;
  const totalKcal = proteinKcal + carbsKcal + fatKcal;

  const cacheKey = JSON.stringify({
    protein: dailyData.totalProtein,
    carbs: dailyData.totalCarbs,
    fat: dailyData.totalFat
  });
  
  if (chartImageCache.has(cacheKey)) {
    return chartImageCache.get(cacheKey)!;
  }

  const { default: html2canvas } = await import('html2canvas');

  // Use calories for the pie chart
  const data = [
    { name: 'Protein', value: proteinKcal },
    { name: 'Carbs', value: carbsKcal },
    { name: 'Fat', value: fatKcal }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  const tempDiv = document.createElement('div');
  tempDiv.style.width = '800px';
  tempDiv.style.height = '400px';
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-1000px';
  tempDiv.style.top = '-1000px';
  tempDiv.style.backgroundColor = '#ffffff';
  document.body.appendChild(tempDiv);

  const Chart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => {
            if (totalKcal === 0) return `${name} 0%`;
            const percent = ((value / totalKcal) * 100).toFixed(0);
            return `${name} ${percent}%`;
          }}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff',
            border: '1px solid #eee',
            borderRadius: '4px',
            padding: '8px'
          }}
          formatter={(value: number, name: string, props: any) => {
            if (totalKcal === 0) return [`0g (0%)`, name];
            const percent = ((value / totalKcal) * 100).toFixed(1);
            // Show both grams and percent for clarity
            let grams = 0;
            if (name === 'Protein') grams = protein;
            if (name === 'Carbs') grams = carbs;
            if (name === 'Fat') grams = fat;
            return [`${grams}g (${percent}%)`, name];
          }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value: string, entry: any) => {
            if (totalKcal === 0) return `${value} (0%)`;
            const percent = ((entry.payload.value / totalKcal) * 100).toFixed(1);
            return `${value} (${percent}%)`;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );

  const root = createRoot(tempDiv);
  root.render(<Chart />);

  await new Promise(resolve => setTimeout(resolve, 1000));

  const canvas = await html2canvas(tempDiv, {
    background: '#ffffff',
    useCORS: true,
    allowTaint: true,
    logging: false,
  });

  document.body.removeChild(tempDiv);
  root.unmount();

  const chartImage = canvas.toDataURL('image/png');
  chartImageCache.set(cacheKey, chartImage);
  
  return chartImage;
};

export const generatePDF = async (data: any, options: PDFOptions) => {
  try {
    console.log('Generating PDF with data:', data);
    console.log('Date range:', options.startDate, 'to', options.endDate);
    
    // Extract dailyData from the input data
    const dailyData = data.dailyData || {};
    
    // Convert the data object to an array of daily data with proper typing
    const dailyDataArray = Object.entries(dailyData).map(([date, data]) => {
      const dailyData = data as DailyData;
      return {
        date,
        day: format(new Date(date), 'EEE'),
        meals: dailyData.meals || [],
        totalCaloriesIn: dailyData.totalCaloriesIn || 0,
        totalCarbs: dailyData.totalCarbs || 0,
        totalFat: dailyData.totalFat || 0,
        totalProtein: dailyData.totalProtein || 0,
        caloriesOut: dailyData.caloriesOut || 0,
        waterIntake: dailyData.waterIntake || 0,
        steps: dailyData.steps || 0,
        distance: dailyData.distance || 0,
        activities: dailyData.activities || [],
        water: dailyData.water || []
      };
    });
    
    console.log('Daily data array:', dailyDataArray);
    
    // Sort the array by date
    dailyDataArray.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Get all dates in the range (inclusive of start and end dates)
    const allDatesInRange: string[] = [];
    const currentDate = new Date(options.startDate);
    const endDate = new Date(options.endDate);
    
    // Set time to midnight to ensure consistent date comparison
    currentDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    while (currentDate <= endDate) {
      allDatesInRange.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    console.log('All dates in range:', allDatesInRange);
    
    // Find missing dates - only include dates within the selected range
    const availableDates = new Set(dailyDataArray.map(d => d.date));
    const missingDates = allDatesInRange.filter(date => {
      const dateObj = new Date(date);
      dateObj.setHours(0, 0, 0, 0);
      return !availableDates.has(date) && 
             dateObj >= options.startDate && 
             dateObj <= options.endDate;
    });
    
    console.log('Missing dates:', missingDates);
    
    // Filter data based on date range
    const filteredData = dailyDataArray.filter(day => {
      const dayDate = new Date(day.date);
      dayDate.setHours(0, 0, 0, 0);
      return dayDate >= options.startDate && dayDate <= options.endDate;
    });

    // Log meal data to verify amount and unit
    filteredData.forEach(day => {
      console.log(`Meals for ${day.date}:`, day.meals.map(meal => ({
        name: meal.name,
        amount: meal.amount,
        unit: meal.unit,
        brandName: meal.brandName
      })));
    });

    // Patch: Ensure every meal has required properties
    filteredData.forEach(day => {
      day.meals = day.meals.map(meal => ({
        ...meal,
        brandName: meal.brandName || (meal as any).BrandName || '-',
        amount: meal.amount !== undefined && meal.amount !== null ? meal.amount : '',
        unit: meal.unit || '',
        meal: meal.meal || '-'
      }));
    });

    console.log('Filtered data:', filteredData);
    
    // If no data is available, create a placeholder for the last day
    if (filteredData.length === 0) {
      const lastDate = new Date(options.endDate);
      filteredData.push({
        date: lastDate.toISOString().split('T')[0],
        day: format(lastDate, 'EEE'),
        totalCaloriesIn: 0,
        caloriesOut: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        steps: 0,
        distance: 0,
        waterIntake: 0,
        meals: [],
        activities: [],
        water: []
      });
    }
    
    // Calculate daily and weekly stats
    const dailyStats = filteredData.map(calculateDailyStats);
    console.log('Daily stats:', dailyStats);
    
    const weeklyStats = calculateWeeklyStats(dailyStats);
    console.log('Weekly stats:', weeklyStats);
    
    // Generate chart images
    const chartImage = await generateChartImage(filteredData);
    const nutrientChartImage = await generateNutrientChartImage(filteredData[filteredData.length - 1]);
    
    // Import PDFReport and generate PDF
    const { default: PDFReport } = await import('@/components/pdf/PDFReport');
    const pdfDoc = pdf(
      <PDFReport
        dailyStats={dailyStats}
        weeklyStats={weeklyStats}
        chartImage={chartImage}
        nutrientChartImage={nutrientChartImage}
        missingDates={missingDates}
      />
    );

    if (dailyDataArray.length > 0) {
      console.log('Meals passed to PDF:', dailyDataArray[0].meals);
    }

    filteredData.forEach((day, i) => {
      console.log(`Meals for day ${i} (${day.date}):`, day.meals);
    });

    return await pdfDoc.toBlob();
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Failed to generate PDF report');
    throw error;
  }
}; 