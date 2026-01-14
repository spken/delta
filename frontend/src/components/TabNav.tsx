/**
 * Shared tab navigation component for page navigation.
 * Uses React Router for URL-based navigation between Analysis and History pages.
 */
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TabConfig {
  value: string;
  label: string;
  path: string;
}

const tabs: TabConfig[] = [
  { value: 'analysis', label: 'Analysis', path: '/analysis' },
  { value: 'history', label: 'History', path: '/history' },
];

export default function TabNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from current URL path
  const getActiveTab = (): string => {
    const currentPath = location.pathname;
    const activeTab = tabs.find((tab) => currentPath === tab.path);
    return activeTab?.value ?? 'analysis';
  };

  const handleTabChange = (value: string) => {
    const tab = tabs.find((t) => t.value === value);
    if (tab) {
      navigate(tab.path);
    }
  };

  return (
    <Tabs value={getActiveTab()} onValueChange={handleTabChange}>
      <TabsList className="bg-transparent p-0 h-auto gap-6">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="bg-transparent border-0 rounded-none px-0 py-2 shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-zinc-900 data-[state=active]:border-b-2 data-[state=active]:border-zinc-900 text-zinc-500 hover:text-zinc-700 transition-colors"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
