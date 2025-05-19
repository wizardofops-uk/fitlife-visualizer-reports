import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label } from 'recharts';

interface NutrientPieChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

const NutrientPieChart: React.FC<NutrientPieChartProps> = React.memo(({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px]">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Calculate percentages for custom rendering
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithPercent = data.map(item => ({
    ...item,
    percent: Math.round((item.value / total) * 100)
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <Pie
          data={dataWithPercent}
          cx="50%"
          cy="50%"
          labelLine={true}
          outerRadius={90}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${percent}%`}
          paddingAngle={2}
        >
          {dataWithPercent.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value, name) => [`${value}g (${dataWithPercent.find(item => item.name === name)?.percent}%)`, name]} />
      </PieChart>
    </ResponsiveContainer>
  );
});

NutrientPieChart.displayName = 'NutrientPieChart';

export default NutrientPieChart;
