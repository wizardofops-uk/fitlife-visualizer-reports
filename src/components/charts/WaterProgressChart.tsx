import React from 'react';
import { Progress } from '@/components/ui/progress';
import { getWaterPercentage } from '@/utils/fitnessUtils';

interface WaterProgressChartProps {
  waterIntake: number;
  goal: number;
}

const WaterProgressChart: React.FC<WaterProgressChartProps> = React.memo(({ waterIntake, goal }) => {
  const waterPercentage = getWaterPercentage(waterIntake, goal);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Water Intake</span>
        <span>{waterIntake} ml ({waterPercentage}%)</span>
      </div>
      <Progress value={waterPercentage} className="h-2 bg-blue-100" indicatorClassName="bg-blue-400" />
    </div>
  );
});

WaterProgressChart.displayName = 'WaterProgressChart';

export default WaterProgressChart;
