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
  recordActivity,
  setStoredActivityDates,
  DEFAULT_USER,
  isSupabaseConfigured,
  syncProfileToSupabase,
  fetchProfileFromSupabase,
  syncGoalUpsert,
  syncGoalDelete,
  fetchGoalsFromSupabase,
  syncMilestoneUpsert,
  fetchMilestonesFromSupabase,
  syncJournalUpsert,
  fetchJournalFromSupabase,
  syncFinanceUpsert,
  fetchFinanceFromSupabase,
  syncCalendarEventUpsert,
  syncCalendarEventDelete,
  fetchCalendarEventsFromSupabase,
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

  // Sync state on user change & hydrate from Supabase
  useEffect(() => {
    let isCancelled = false;

    // 1. Instant local load (optimistic fallback)
    saveStoredUser(user);
    setGoals(getStoredGoals(user.id));
    setMilestones(getStoredMilestones(user.id));
    setJournal(getStoredJournal(user.id));
    setFinance(getStoredFinance(user.id));
    setEvents(getStoredEvents(user.id));

    // 2. Asynchronous remote sync from Supabase if configured
    if (isSupabaseConfigured() && user.id) {
      (async () => {
        try {
          // 1. Fetch remote profile & activity dates
          const profileRes = await fetchProfileFromSupabase(user.id);
          if (profileRes && !isCancelled) {
            const { profile: remoteProfile, activityDates } = profileRes;
            if (remoteProfile) {
              setUser((prev) => {
                const merged = { ...prev, ...remoteProfile };
                saveStoredUser(merged);
                return merged;
              });
            }
            if (activityDates && activityDates.length > 0) {
              setStoredActivityDates(user.id, activityDates);
            }
          }

          // 2. Fetch remote goals
          const remoteGoals = await fetchGoalsFromSupabase(user.id);
          if (remoteGoals && remoteGoals.length > 0 && !isCancelled) {
            setGoals(remoteGoals);
            saveStoredGoals(user.id, remoteGoals);
          }

          // 3. Fetch remote milestones
          const remoteMilestones = await fetchMilestonesFromSupabase(user.id);
          if (remoteMilestones && remoteMilestones.length > 0 && !isCancelled) {
            const completedMap = new Map<string, boolean>();
            const convertedMap = new Map<string, string | undefined>();
            remoteMilestones.forEach((rm) => {
              completedMap.set(rm.id, rm.completed);
              if (rm.convertedToGoalId) convertedMap.set(rm.id, rm.convertedToGoalId);
            });

            setMilestones((prev) => {
              const updated = prev.map((m) => {
                const isComp = completedMap.has(m.id) ? completedMap.get(m.id)! : m.completed;
                const convId = convertedMap.has(m.id) ? convertedMap.get(m.id) : m.convertedToGoalId;
                return { ...m, completed: isComp, convertedToGoalId: convId };
              });
              saveStoredMilestones(user.id, updated);
              return updated;
            });
          }

          // 4. Fetch remote journal entries
          const remoteJournal = await fetchJournalFromSupabase(user.id);
          if (remoteJournal && remoteJournal.length > 0 && !isCancelled) {
            setJournal(remoteJournal);
            saveStoredJournal(user.id, remoteJournal);
          }

          // 5. Fetch remote finance data
          const remoteFinance = await fetchFinanceFromSupabase(user.id);
          if (remoteFinance && !isCancelled) {
            setFinance(remoteFinance);
            saveStoredFinance(user.id, remoteFinance);
          }

          // 6. Fetch remote calendar events
          const remoteEvents = await fetchCalendarEventsFromSupabase(user.id);
          if (remoteEvents && remoteEvents.length > 0 && !isCancelled) {
            setEvents(remoteEvents);
            saveStoredEvents(user.id, remoteEvents);
          }
        } catch (err) {
          console.warn('[PocketMentor App] Supabase background fetch error:', err);
        }
      })();
    }

    return () => {
      isCancelled = true;
    };
  }, [user.id]);

  const handleSplashFinish = () => {
    if (user && user.id && user.id !== 'user_default' && user.onboarded) {
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
    syncProfileToSupabase(updatedUser);

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
    syncProfileToSupabase(updatedUser);
    setAppState('main');
  };

  // Goal handlers with optimistic UI + background Supabase sync
  const handleToggleGoal = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    let toggledGoal: Goal | null = null;
    let linkedMilestoneToSync: Milestone | null = null;

    const updated = goals.map((g) => {
      if (g.id === id) {
        const nextCompleted = !g.completed;

        if (nextCompleted) {
          recordActivity(user.id, today);
        }

        toggledGoal = { ...g, completed: nextCompleted };

        // Auto Tick Milestones:
        // When linked goal is completed, roadmap milestone ticks itself!
        if (g.linkedMilestoneId) {
          const updatedMilestones = milestones.map((m) => {
            if (m.id === g.linkedMilestoneId) {
              const updatedM = { ...m, completed: nextCompleted };
              linkedMilestoneToSync = updatedM;
              return updatedM;
            }
            return m;
          });
          setMilestones(updatedMilestones);
          saveStoredMilestones(user.id, updatedMilestones);
        }

        return toggledGoal;
      }
      return g;
    });

    setGoals(updated);
    saveStoredGoals(user.id, updated);

    // Asynchronous Supabase sync
    if (toggledGoal) {
      syncGoalUpsert(user.id, toggledGoal);
    }
    if (linkedMilestoneToSync) {
      syncMilestoneUpsert(user.id, linkedMilestoneToSync);
    }
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
    syncGoalUpsert(user.id, newGoal);
  };

  const handleDeleteGoal = (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    saveStoredGoals(user.id, updated);
    syncGoalDelete(user.id, id);
  };

  // Milestone handlers with optimistic UI + background Supabase sync
  const handleToggleMilestone = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    let toggledMilestone: Milestone | null = null;

    const updated = milestones.map((m) => {
      if (m.id === id) {
        const next = !m.completed;
        if (next) recordActivity(user.id, today);
        toggledMilestone = { ...m, completed: next };
        return toggledMilestone;
      }
      return m;
    });
    setMilestones(updated);
    saveStoredMilestones(user.id, updated);

    if (toggledMilestone) {
      syncMilestoneUpsert(user.id, toggledMilestone);
    }
  };

  const handleConvertMilestoneToGoal = (milestone: Milestone) => {
    const today = new Date().toISOString().split('T')[0];
    const goalId = 'g-' + Date.now();
    // Check if goal already exists for today
    const exists = goals.some((g) => g.linkedMilestoneId === milestone.id && g.date === today);
    if (!exists) {
      handleAddGoal(milestone.title, milestone.category, milestone.id);
      // Mark convertedToGoalId on milestone
      const updatedM: Milestone = { ...milestone, convertedToGoalId: goalId };
      const updatedMilestones = milestones.map((m) => (m.id === milestone.id ? updatedM : m));
      setMilestones(updatedMilestones);
      saveStoredMilestones(user.id, updatedMilestones);
      syncMilestoneUpsert(user.id, updatedM);
    }
  };

  const handleSetCurrentStage = (stage: LifeStage) => {
    const updated = { ...user, stage };
    setUser(updated);
    saveStoredUser(updated);
    syncProfileToSupabase(updated);
  };

  // Journal handler with optimistic UI + background Supabase sync
  const handleSaveJournalEntry = (entry: JournalEntry) => {
    const today = new Date().toISOString().split('T')[0];
    recordActivity(user.id, today);
    const exists = journal.some((j) => j.id === entry.id || j.date === entry.date);
    let updated: JournalEntry[];
    if (exists) {
      updated = journal.map((j) => (j.id === entry.id || j.date === entry.date ? entry : j));
    } else {
      updated = [entry, ...journal];
    }
    setJournal(updated);
    saveStoredJournal(user.id, updated);
    syncJournalUpsert(user.id, entry);
  };

  // Finance handler with optimistic UI + background Supabase sync
  const handleUpdateFinance = (data: FinanceData) => {
    setFinance(data);
    saveStoredFinance(user.id, data);
    syncFinanceUpsert(user.id, data);
  };

  // Calendar event handlers with optimistic UI + background Supabase sync
  const handleAddEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: 'ev-' + Date.now(),
    };
    const updated = [newEvent, ...events];
    setEvents(updated);
    saveStoredEvents(user.id, updated);
    syncCalendarEventUpsert(user.id, newEvent);
  };

  const handleToggleEvent = (id: string) => {
    let toggledEvent: CalendarEvent | null = null;
    const updated = events.map((ev) => {
      if (ev.id === id) {
        toggledEvent = { ...ev, completed: !ev.completed };
        return toggledEvent;
      }
      return ev;
    });
    setEvents(updated);
    saveStoredEvents(user.id, updated);
    if (toggledEvent) {
      syncCalendarEventUpsert(user.id, toggledEvent);
    }
  };

  const handleDeleteEvent = (id: string) => {
    const updated = events.filter((ev) => ev.id !== id);
    setEvents(updated);
    saveStoredEvents(user.id, updated);
    syncCalendarEventDelete(user.id, id);
  };

  // User settings
  const handleUpdateUser = (updated: UserProfile) => {
    setUser(updated);
    saveStoredUser(updated);
    syncProfileToSupabase(updated);
  };

  const handleSignOut = () => {
    localStorage.removeItem('pocketmentor_user');
    setUser(DEFAULT_USER);
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
