
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useLocation } from 'react-router-dom';

interface Tab {
  id: string;
  label: string;
  path: string;
}

interface AppTabsProps {
  tabs: Tab[];
  children: React.ReactNode;
}

const AppTabs: React.FC<AppTabsProps> = ({ tabs, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active tab based on current path
  const activeTab = tabs.find(tab => location.pathname === tab.path)?.id || tabs[0].id;
  
  const handleTabChange = (value: string) => {
    const tab = tabs.find(tab => tab.id === value);
    if (tab) {
      navigate(tab.path);
    }
  };
  
  return (
    <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        {tabs.map(tab => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={activeTab} className="mt-4">
        {children}
      </TabsContent>
    </Tabs>
  );
};

export default AppTabs;
