import React, { useMemo } from 'react';
import { formatDate } from '@/utils/fitnessUtils';
import { DailyData } from '@/types/fitness';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CalorieBarChartProps {
  dailyData: DailyData[];
}

const CalorieBarChart: React.FC<CalorieBarChartProps> = React.memo(({ dailyData }) => {
  const chartData = useMemo(() => 
    dailyData.map(day => ({
      date: formatDate(day.date),
      calories: day.totalCaloriesIn
    })), 
    [dailyData]
  );

  if (!dailyData || dailyData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="calories" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
});

CalorieBarChart.displayName = 'CalorieBarChart';

export default CalorieBarChart;
