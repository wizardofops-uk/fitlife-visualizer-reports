
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFitness } from '@/context/FitnessContext';
import { importSampleData } from '@/data/sampleData';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from "lucide-react";
import { flexibleValidateAndMap } from '@/utils/importValidation';

const DataImporter: React.FC = () => {
  const { importData } = useFitness();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);
        console.log("Imported JSON data:", jsonData);
        const result = flexibleValidateAndMap(jsonData);

        if (!result.success) {
          toast({
            title: "Import failed",
            description: result.message,
            variant: "destructive",
          });
          setIsLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }

        console.log("Mapped data:", result.mappedData);
        importData(result.mappedData);
        
        // Create a more informative success message
        const mealCount = result.mappedData.meals.length;
        const activityCount = result.mappedData.activities.length;
        const waterCount = result.mappedData.water.length;
        
        toast({
          title: "Data imported successfully",
          description: `Imported ${mealCount} meal entries, ${activityCount} activity records, and ${waterCount} water intake records`,
        });
      } catch (error) {
        console.error('Error importing file:', error);
        toast({
          title: "Import failed",
          description: "There was an error processing your file",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.onerror = () => {
      toast({
        title: "Error reading file",
        description: "There was a problem reading your file",
        variant: "destructive",
      });
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  const handleSampleData = async () => {
    try {
      setIsLoading(true);
      const sampleData = importSampleData();
      importData(sampleData);
      toast({
        title: "Sample data loaded",
        description: "Sample fitness data has been loaded successfully",
      });
    } catch (error) {
      console.error('Error loading sample data:', error);
      toast({
        title: "Error loading sample data",
        description: "There was a problem loading the sample data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Your Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileImport}
              className="hidden"
              id="json-file-input"
              disabled={isLoading}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                "Import JSON File"
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              Upload your fitness data in JSON format
            </p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleSampleData}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load Sample Data"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataImporter;
