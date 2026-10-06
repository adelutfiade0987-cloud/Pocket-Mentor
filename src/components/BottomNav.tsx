import React from 'react';
import { Home, Calendar, Milestone, CheckSquare, BookOpen, Wallet, Sparkles } from 'lucide-react';

export type NavTab = 'home' | 'calendar' | 'roadmap' | 'goals' | 'journal' | 'finance' | 'vision';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  uncompletedGoalsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  uncompletedGoalsCount = 0,
}) => {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="w-4 h-4" />,
    },
    {
      id: 'calendar',
      label: 'Kalender',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: 'roadmap',
      label: 'Roadmap',
      icon: <Milestone className="w-4 h-4" />,
    },
    {
      id: 'goals',
      label: 'Goals',
      icon: <CheckSquare className="w-4 h-4" />,
      badge: uncompletedGoalsCount > 0 ? uncompletedGoalsCount : undefined,
    },
    {
      id: 'journal',
      label: 'Journal',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'finance',
      label: 'Finance',
      icon: <Wallet className="w-4 h-4" />,
    },
    {
      id: 'vision',
      label: 'Studio',
      icon: <Sparkles className="w-4 h-4" />,
    },
  ];

  return (
    <div className="fixed bottom-3 left-0 right-0 z-40 flex justify-center px-3 pointer-events-none">
      <nav
        aria-label="App Navigation"
        className="pointer-events-auto max-w-md w-full bg-[#6C5CE7] text-white px-1.5 py-1.5 rounded-full shadow-2xl shadow-[#6C5CE7]/40 flex items-center justify-around overflow-x-auto no-scrollbar"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center min-w-[42px] min-h-[42px] px-1.5 py-1 rounded-full transition-all duration-200 shrink-0 ${
                isActive
                  ? 'bg-white text-[#6C5CE7] font-bold shadow-xs scale-105'
                  : 'text-white/80 hover:text-white hover:bg-white/10 active:scale-95'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-[#FA5A50] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center ring-2 ring-[#6C5CE7]">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] mt-0.5 tracking-tight font-medium leading-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
