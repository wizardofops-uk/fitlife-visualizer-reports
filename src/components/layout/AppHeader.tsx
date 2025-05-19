import React from 'react';
import { Heart } from 'lucide-react';

const AppHeader: React.FC = () => {
  return (
    <header className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="w-10" /> {/* Spacer for left side */}
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" fill="currentColor" />
            <h1 className="text-xl font-bold">FitLife</h1>
          </div>
          <div className="w-10" /> {/* Spacer for right side */}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
