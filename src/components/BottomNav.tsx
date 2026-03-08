import { Calendar, BookOpen, RotateCcw, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Tab = 'today' | 'subjects' | 'revision' | 'pyqs' | 'analytics';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs = [
  { id: 'today' as Tab, icon: Calendar, label: 'Today' },
  { id: 'subjects' as Tab, icon: BookOpen, label: 'Subjects' },
  { id: 'revision' as Tab, icon: RotateCcw, label: 'Revision' },
  { id: 'analytics' as Tab, icon: BarChart3, label: 'Insights' },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around py-1.5 px-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[60px]",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
              <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>
                {tab.label}
              </span>
              {isActive && <div className="w-4 h-0.5 rounded-full bg-primary mt-0.5" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
