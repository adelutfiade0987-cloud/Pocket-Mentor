import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  UserProfile,
  Goal,
  Milestone,
  JournalEntry,
  FinanceData,
  LifeStage,
  GoalCategory,
  CalendarEvent,
} from './types';
import {
  getStoredUser,
  saveStoredUser,
  getStoredGoals,
  saveStoredGoals,
  getStoredMilestones,
  saveStoredMilestones,
  getStoredJournal,
  saveStoredJournal,
  getStoredFinance,
  saveStoredFinance,
  getStoredEvents,
  saveStoredEvents,
  DEFAULT_USER,
} from './utils/storage';

import { SplashView } from './components/SplashView';
import { IntroWalkthrough } from './components/IntroWalkthrough';
import { LoginView } from './components/LoginView';
import { OnboardingFlow } from './components/OnboardingFlow';
import { BottomNav, NavTab } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { CalendarView } from './components/CalendarView';
import { RoadmapView } from './components/RoadmapView';
import { GoalsView } from './components/GoalsView';
import { JournalView } from './components/JournalView';
import { FinanceView } from './components/FinanceView';
import { VisionStudioView } from './components/VisionStudioView';
import { MentorChatModal } from './components/MentorChatModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [appState, setAppState] = useState<'splash' | 'intro' | 'login' | 'onboarding' | 'main'>('splash');
  const [user, setUser] = useState<UserProfile>(getStoredUser);
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  const [goals, setGoals] = useState<Goal[]>(() => getStoredGoals(user.id));
  const [milestones, setMilestones] = useState<Milestone[]>(() => getStoredMilestones(user.id));
  const [journal, setJournal] = useState<JournalEntry[]>(() => getStoredJournal(user.id));
  const [finance, setFinance] = useState<FinanceData>(() => getStoredFinance(user.id));
  const [events, setEvents] = useState<CalendarEvent[]>(() => getStoredEvents(user.id));

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync state on user change
  useEffect(() => {
    saveStoredUser(user);
    setGoals(getStoredGoals(user.id));
    setMilestones(getStoredMilestones(user.id));
    setJournal(getStoredJournal(user.id));
    setFinance(getStoredFinance(user.id));
    setEvents(getStoredEvents(user.id));
  }, [user.id]);

  const handleSplashFinish = () => {
    if (user && user.onboarded) {
      setAppState('main');
    } else {
      setAppState('intro');
    }
  };

  const handleLoginSuccess = (partialUser: Partial<UserProfile>, isNewUser: boolean) => {
    const updatedUser: UserProfile = {
      ...DEFAULT_USER,
      ...partialUser,
      id: partialUser.id || 'usr_' + Date.now(),
      onboarded: !isNewUser,
    };
    setUser(updatedUser);
    saveStoredUser(updatedUser);

    if (isNewUser) {
      setAppState('onboarding');
    } else {
      setAppState('main');
    }
  };

  const handleOnboardingComplete = (profileData: Partial<UserProfile>) => {
    const updatedUser: UserProfile = {
      ...user,
      ...profileData,
      onboarded: true,
    };
    setUser(updatedUser);
    saveStoredUser(updatedUser);
    setAppState('main');
  };

  // Goal handlers
  const handleToggleGoal = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = goals.map((g) => {
      if (g.id === id) {
        const nextCompleted = !g.completed;

        // Auto Tick Milestones (Section 5B & 6):
        // When linked goal is completed, roadmap milestone ticks itself!
        if (g.linkedMilestoneId) {
          const updatedMilestones = milestones.map((m) =>
            m.id === g.linkedMilestoneId ? { ...m, completed: nextCompleted } : m
          );
          setMilestones(updatedMilestones);
          saveStoredMilestones(user.id, updatedMilestones);
        }

        return { ...g, completed: nextCompleted };
      }
      return g;
    });

    setGoals(updated);
    saveStoredGoals(user.id, updated);
  };

  const handleAddGoal = (title: string, category: GoalCategory, linkedMilestoneId?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const newGoal: Goal = {
      id: 'g-' + Date.now(),
      title,
      category,
      completed: false,
      date: today,
      linkedMilestoneId,
    };
    const updated = [newGoal, ...goals];
    setGoals(updated);
    saveStoredGoals(user.id, updated);
  };

  const handleDeleteGoal = (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    saveStoredGoals(user.id, updated);
  };

  // Milestone handlers
  const handleToggleMilestone = (id: string) => {
    const updated = milestones.map((m) =>
      m.id === id ? { ...m, completed: !m.completed } : m
    );
    setMilestones(updated);
    saveStoredMilestones(user.id, updated);
  };

  const handleConvertMilestoneToGoal = (milestone: Milestone) => {
    const today = new Date().toISOString().split('T')[0];
    // Check if goal already exists for today
    const exists = goals.some((g) => g.linkedMilestoneId === milestone.id && g.date === today);
    if (!exists) {
      handleAddGoal(milestone.title, milestone.category, milestone.id);
    }
  };

  const handleSetCurrentStage = (stage: LifeStage) => {
    const updated = { ...user, stage };
    setUser(updated);
    saveStoredUser(updated);
  };

  // Journal handler
  const handleSaveJournalEntry = (entry: JournalEntry) => {
    const exists = journal.some((j) => j.id === entry.id || j.date === entry.date);
    let updated: JournalEntry[];
    if (exists) {
      updated = journal.map((j) => (j.id === entry.id || j.date === entry.date ? entry : j));
    } else {
      updated = [entry, ...journal];
    }
    setJournal(updated);
    saveStoredJournal(user.id, updated);
  };

  // Finance handler
  const handleUpdateFinance = (data: FinanceData) => {
    setFinance(data);
    saveStoredFinance(user.id, data);
  };

  // Calendar event handlers
  const handleAddEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: 'ev-' + Date.now(),
    };
    const updated = [newEvent, ...events];
    setEvents(updated);
    saveStoredEvents(user.id, updated);
  };

  const handleToggleEvent = (id: string) => {
    const updated = events.map((ev) =>
      ev.id === id ? { ...ev, completed: !ev.completed } : ev
    );
    setEvents(updated);
    saveStoredEvents(user.id, updated);
  };

  const handleDeleteEvent = (id: string) => {
    const updated = events.filter((ev) => ev.id !== id);
    setEvents(updated);
    saveStoredEvents(user.id, updated);
  };

  // User settings
  const handleUpdateUser = (updated: UserProfile) => {
    setUser(updated);
    saveStoredUser(updated);
  };

  const handleSignOut = () => {
    setIsSettingsOpen(false);
    setAppState('login');
  };

  // Calculate uncompleted goals today for BottomNav badge
  const today = new Date().toISOString().split('T')[0];
  const uncompletedCount = goals.filter((g) => g.date === today && !g.completed).length;

  return (
    <div className="min-h-screen bg-[#F5F5F9] font-sans antialiased text-[#1A1A2E] select-none">
      {/* 1. Splash Screen */}
      {appState === 'splash' && <SplashView onFinish={handleSplashFinish} />}

      {/* 2. Welcome / Intro Screens (Halaman Pengenalan) */}
      {appState === 'intro' && (
        <IntroWalkthrough onFinish={() => setAppState('login')} />
      )}

      {/* 3. Login / Sign Up Screen (Halaman Otentikasi) */}
      {appState === 'login' && (
        <LoginView
          onLoginSuccess={handleLoginSuccess}
          onBackToIntro={() => setAppState('intro')}
        />
      )}

      {/* 4. User Profiling / Assessment (Kuesioner Awal / Preference Selection) */}
      {appState === 'onboarding' && (
        <OnboardingFlow
          initialName={user.name}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* 4. Main App Interface */}
      {appState === 'main' && (
        <div className="relative">
          {/* Main Content Pages with horizontal slide transitions */}
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="tab-home"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <HomeView
                  user={user}
                  goals={goals}
                  milestones={milestones}
                  journal={journal}
                  finance={finance}
                  events={events}
                  onNavigateTab={setActiveTab}
                  onAddGoal={handleAddGoal}
                  onOpenChat={() => setIsChatOpen(true)}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                />
              </motion.div>
            )}

            {activeTab === 'calendar' && (
              <motion.div
                key="tab-calendar"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <CalendarView
                  events={events}
                  onAddEvent={handleAddEvent}
                  onToggleEvent={handleToggleEvent}
                  onDeleteEvent={handleDeleteEvent}
                  onConvertToGoal={(title, cat) => handleAddGoal(title, cat)}
                />
              </motion.div>
            )}

            {activeTab === 'roadmap' && (
              <motion.div
                key="tab-roadmap"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <RoadmapView
                  currentStage={user.stage}
                  milestones={milestones}
                  onToggleMilestone={handleToggleMilestone}
                  onConvertMilestoneToGoal={handleConvertMilestoneToGoal}
                  onSetCurrentStage={handleSetCurrentStage}
                />
              </motion.div>
            )}

            {activeTab === 'goals' && (
              <motion.div
                key="tab-goals"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <GoalsView
                  user={user}
                  goals={goals}
                  onToggleGoal={handleToggleGoal}
                  onAddGoal={handleAddGoal}
                  onDeleteGoal={handleDeleteGoal}
                />
              </motion.div>
            )}

            {activeTab === 'journal' && (
              <motion.div
                key="tab-journal"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <JournalView
                  entries={journal}
                  onSaveEntry={handleSaveJournalEntry}
                />
              </motion.div>
            )}

            {activeTab === 'finance' && (
              <motion.div
                key="tab-finance"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <FinanceView
                  finance={finance}
                  onUpdateFinance={handleUpdateFinance}
                />
              </motion.div>
            )}

            {activeTab === 'vision' && (
              <motion.div
                key="tab-vision"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <VisionStudioView user={user} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Pill Bottom Navigation */}
          <BottomNav
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            uncompletedGoalsCount={uncompletedCount}
          />

          {/* Multi-turn Interactive PocketMentor Chat Dialog */}
          <MentorChatModal
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            user={user}
          />

          {/* Settings & Profile Modal */}
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            user={user}
            onUpdateUser={handleUpdateUser}
            onSignOut={handleSignOut}
            onRevisitIntro={() => setAppState('intro')}
            onRevisitProfiling={() => setAppState('onboarding')}
          />
        </div>
      )}
    </div>
  );
}
