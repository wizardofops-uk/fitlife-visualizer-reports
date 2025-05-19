import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { clearDatabase } from '@/services/sqliteService';
import { toast } from 'sonner';
import { useFitness } from '@/context/FitnessContext';

const Settings = () => {
  const { clearData } = useFitness();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearDatabase = async () => {
    if (isClearing) return; // Prevent multiple simultaneous clear operations
    
    setIsClearing(true);
    try {
      clearDatabase();
      clearData();
      toast.success('Database cleared successfully');
    } catch (error) {
      console.error('Error clearing database:', error);
      toast.error('Failed to clear database');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">Database</h2>
          <p className="text-muted-foreground mb-6">Clear all data from the database. This action cannot be undone.</p>
          <Button 
            variant="destructive" 
            onClick={handleClearDatabase}
            className="w-full md:w-auto"
            disabled={isClearing}
          >
            {isClearing ? 'Clearing...' : 'Clear Database'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings; 