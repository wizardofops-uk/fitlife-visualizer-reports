
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ImportInstructions: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>Import Instructions</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <p>
        Upload a JSON file with your fitness data in one of the following formats:
      </p>
      
      <Tabs defaultValue="standard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="standard">Standard Format</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition Format</TabsTrigger>
        </TabsList>
        
        <TabsContent value="standard" className="space-y-4">
          <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
{`{
  "meals": [
    {
      "Date": "2023-06-01",
      "Day": "Thursday",
      "Meal": "Breakfast",
      "BrandName": "Quaker Oats",
      "Amount": "1",
      "Unit": "cup",
      "Cals": "170",
      "Carbs": "33",
      "Fat": "2.5",
      "Protein": "5"
    },
    ...
  ],
  "activities": [
    {
      "Date": "2023-06-01", 
      "Cals Out": "2100"
    },
    ...
  ],
  "water": [
    {
      "Date": "2023-06-01",
      "Water": "1500"
    },
    ...
  ]
}`}
          </pre>
        </TabsContent>
        
        <TabsContent value="nutrition" className="space-y-4">
          <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
{`{
  "2023-06-01": {
    "foods": [
      {
        "logDate": "2023-06-01",
        "loggedFood": {
          "brand": "Arla",
          "mealTypeId": 1,
          "name": "Protein Yogurt",
          "amount": 200,
          "unit": { "name": "gram" }
        },
        "nutritionalValues": {
          "calories": 144,
          "carbs": 13.2,
          "fat": 0.4,
          "protein": 20,
          "sodium": 88
        }
      }
    ],
    "goals": { 
      "calories": 2000,
      "estimatedCaloriesOut": 2200
    },
    "summary": {
      "calories": 1524,
      "water": 1500,
      "carbs": 159,
      "fat": 39.1,
      "protein": 126.6
    }
  }
}`}
          </pre>
        </TabsContent>
      </Tabs>
      
      <p className="text-sm text-muted-foreground">
        For testing purposes, you can use the "Load Sample Data" button to see how the app works with example data.
      </p>
    </CardContent>
  </Card>
);

export default ImportInstructions;
