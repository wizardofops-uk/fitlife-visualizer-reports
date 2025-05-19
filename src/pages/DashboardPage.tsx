import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFitness } from '@/context/FitnessContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, BarChart3, Download } from 'lucide-react';
import { useMemo } from 'react';
import DailyView from './DailyView';
import WeeklyView from './WeeklyView';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardPage = () => {
  const { fitnessData, isLoading } = useFitness();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="container mx-auto px-1 sm:px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!fitnessData || !fitnessData.dailyData || Object.keys(fitnessData.dailyData).length === 0) {
    return (
      <div className="container mx-auto px-1 sm:px-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-4 sm:p-8">
            <div className="text-center space-y-6">
              <h3 className="text-2xl font-semibold">Welcome to Your Fitness Dashboard</h3>
              <p className="text-muted-foreground text-lg">
                Get started by importing your fitness data or manually adding entries.
              </p>
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={() => navigate('/import')}
                  size="lg"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Import Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-1 sm:px-4 space-y-4 sm:space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      
      {/* Detailed Views */}
      <Tabs defaultValue="daily" className="space-y-2 sm:space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="daily" className="space-x-2">
            <CalendarDays className="h-4 w-4" />
            <span>Daily View</span>
          </TabsTrigger>
          <TabsTrigger value="weekly" className="space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Weekly View</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="daily" className="overflow-hidden">
          <DailyView />
        </TabsContent>
        <TabsContent value="weekly" className="overflow-hidden">
          <WeeklyView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage; 