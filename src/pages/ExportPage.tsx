import React, { useState, lazy } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFitness } from '@/context/FitnessContext';
import { Download } from 'lucide-react';
import { generatePDF } from '@/utils/pdfExport';
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';
import { addDays, format, startOfDay, endOfDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PDFReport = lazy(() => import('@/components/pdf/PDFReport'));

const ExportPage = () => {
  const { fitnessData } = useFitness();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfDay(addDays(new Date(), -7)),
    to: endOfDay(new Date()),
  });

  const handleExportPDF = async () => {
    try {
      if (!fitnessData) {
        toast.error('No data to export');
        return;
      }

      if (!dateRange?.from || !dateRange?.to) {
        toast.error('Please select a date range');
        return;
      }

      const pdfBlob = await generatePDF(fitnessData, {
        startDate: startOfDay(dateRange.from),
        endDate: endOfDay(dateRange.to),
      });
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fitness-report.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Export Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Export your fitness data as a PDF report. This includes all your tracked meals,
              activities, and progress over time.
            </p>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button
              onClick={handleExportPDF}
              size="lg"
              className="w-full gap-2"
              disabled={!fitnessData || !dateRange?.from || !dateRange?.to}
            >
              <Download className="h-4 w-4" />
              Export as PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportPage; 