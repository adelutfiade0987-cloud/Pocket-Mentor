import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Flame,
  CheckCircle2,
  Calendar,
  ArrowRight,
  RefreshCw,
  Compass,
  Milestone as MilestoneIcon,
  BookOpen,
  Wallet,
  CheckSquare,
  MessageCircle,
  X,
  Plus,
  ChevronRight,
  Check,
  RotateCcw,
  ShieldCheck,
  Target,
  Clock,
  Info,
} from 'lucide-react';
import { UserProfile, Goal, Milestone, JournalEntry, FinanceData, CalendarEvent, GoalCategory } from '../types';
import { playTextToSpeech, stopAudioPlayback } from '../utils/tts';
import { calculateStreak, recordActivity } from '../utils/storage';

interface HomeViewProps {
  user: UserProfile;
  goals: Goal[];
  milestones: Milestone[];
  journal: JournalEntry[];
  finance: FinanceData;
  events?: CalendarEvent[];
  onNavigateTab: (tab: any) => void;
  onAddGoal: (title: string, category: any, linkedMilestoneId?: string) => void;
  onOpenChat: () => void;
  onOpenSettings: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  goals,
  milestones,
  journal,
  finance,
  events = [],
  onNavigateTab,
  onAddGoal,
  onOpenChat,
  onOpenSettings,
}) => {
  const today = new Date().toISOString().split('T')[0];

  // Stats: Goals completed today
  const todayGoals = goals.filter((g) => g.date === today);
  const completedTodayCount = todayGoals.filter((g) => g.completed).length;
  const totalTodayCount = todayGoals.length;

  // Real Dynamic Streak Calculation
  const streakInfo = calculateStreak(user.id, goals, journal);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);

  // Time-aware greeting
  const [greeting, setGreeting] = useState('Selamat Pagi');
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) setGreeting('Selamat Pagi');
    else if (hour >= 11 && hour < 15) setGreeting('Selamat Siang');
    else if (hour >= 15 && hour < 19) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');
  }, []);

  // Morning Kickoff Banner state & flexible stage-aware milestone selection
  const [showKickoff, setShowKickoff] = useState(true);
  const [kickoffAddedToast, setKickoffAddedToast] = useState(false);
  const [kickoffIndex, setKickoffIndex] = useState(0);

  // Filter uncompleted milestones tailored to user's stage / categories
  const pendingMilestones = milestones.filter((m) => {
    if (m.completed) return false;
    if (m.stageId === user.stage) return true;
    if (user.stage === 'High school grad' && (m.categoryId === 'cat-sma' || m.categoryId === 'cat-transisi')) return true;
    if (user.stage.includes('Semester') && m.categoryId === 'cat-kuliah') return true;
    if (user.stage === 'Already working' && (m.categoryId === 'cat-kerja' || m.categoryId === 'cat-freshgrad')) return true;
    return false;
  });

  const activeKickoffMilestone =
    pendingMilestones.length > 0
      ? pendingMilestones[kickoffIndex % pendingMilestones.length]
      : null;

  // Check if current kickoff milestone is already in today's goals
  const isKickoffAddedToToday = activeKickoffMilestone
    ? goals.some((g) => g.linkedMilestoneId === activeKickoffMilestone.id && g.date === today)
    : false;

  const handleAddKickoffGoal = () => {
    if (activeKickoffMilestone && !isKickoffAddedToToday) {
      onAddGoal(activeKickoffMilestone.title, activeKickoffMilestone.category, activeKickoffMilestone.id);
      recordActivity(user.id, today);
      setKickoffAddedToast(true);
      setTimeout(() => setKickoffAddedToast(false), 2200);
    }
  };

  const handleNextKickoff = () => {
    setKickoffIndex((prev) => prev + 1);
  };

  // Helper for milestone category label & styling
  const getKickoffCategoryTag = (cat?: GoalCategory) => {
    switch (cat) {
      case 'study':
        return { label: 'Akademik', color: 'bg-[#6C5CE7]/15 text-[#6C5CE7]' };
      case 'career':
        return { label: 'Karier', color: 'bg-[#FA5A50]/15 text-[#FA5A50]' };
      case 'finance':
        return { label: 'Finansial', color: 'bg-[#FFB020]/15 text-[#FFB020]' };
      case 'content':
        return { label: 'Portofolio', color: 'bg-[#EC4899]/15 text-[#EC4899]' };
      default:
        return { label: 'Kebiasaan', color: 'bg-[#3FB876]/15 text-[#3FB876]' };
    }
  };

  // AI Mentor Daily Tip
  const [mentorTip, setMentorTip] = useState<{
    title: string;
    tip: string;
    suggestedGoal: string;
    category: string;
  }>({
    title: 'Fokus Hari Ini',
    tip: `Di ${user.stage}, konsistensi 1% setiap hari jauh lebih bernilai daripada sprint mendadak yang bikin burnout. Luangkan waktu untuk satu kemajuan nyata hari ini.`,
    suggestedGoal: 'Kerjakan 1 prioritas utama selama 25 menit',
    category: 'study',
  });
  const [tipLoading, setTipLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Fetch stage-aware tip on load or when stage changes
  useEffect(() => {
    let isMounted = true;
    async function loadTip() {
      try {
        setTipLoading(true);
        const res = await fetch('/api/mentor/tip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile: user,
            recentGoals: completedTodayCount,
            mood: journal[0]?.mood || 'great',
          }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data && isMounted) {
            setMentorTip(json.data);
          }
        }
      } catch (err) {
        console.warn('Failed to load fresh tip:', err);
      } finally {
        if (isMounted) setTipLoading(false);
      }
    }
    loadTip();
    return () => {
      isMounted = false;
      stopAudioPlayback();
    };
  }, [user.stage, user.major]);

  const handleReadAloud = async () => {
    if (isPlayingAudio) {
      stopAudioPlayback();
      setIsPlayingAudio(false);
      return;
    }

    const narrationText = `${mentorTip.title}. ${mentorTip.tip} Target hari ini: ${mentorTip.suggestedGoal}`;
    setIsPlayingAudio(true);

    await playTextToSpeech(narrationText, {
      voiceName: 'Puck',
      style: 'Warm, encouraging Indonesian older mentor',
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  const lastJournalDate = journal[0]?.date;
  const journalStatus = lastJournalDate === today ? 'Sudah mengisi hari ini' : 'Belum ada catatan hari ini';

  return (
    <div className="min-h-screen bg-[#F5F5F9] pb-28 pt-4 px-4 max-w-md mx-auto relative">
      {/* Top Bar Contract: Brand + Avatar Action */}
      <header className="flex items-center justify-between py-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#6C5CE7] text-white flex items-center justify-center shadow-xs">
            <Compass className="w-4 h-4 stroke-[2.4]" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#1A1A2E]">PocketMentor</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenChat}
            className="w-10 h-10 rounded-full bg-white text-[#6C5CE7] border border-black/[0.06] flex items-center justify-center shadow-xs hover:bg-[#6C5CE7]/5 active:scale-95 transition-all"
            title="Tanya Mentor"
          >
            <MessageCircle className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-xs ring-2 ring-[#6C5CE7]/30 hover:scale-105 transition-all"
            title="Profil & Pengaturan"
          >
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>
        </div>
      </header>

      {/* Greeting Hero */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[#1A1A2E]">
          {greeting}, {user.name.split(' ')[0]}! 👋
        </h1>
        <p className="text-xs text-[#6B7280] font-medium mt-0.5">
          {user.origin ? `${user.origin} · ` : ''}
          {user.major || user.careerDirection || 'Fokus langkah hari ini'}
        </p>
      </div>

      {/* Quick Stats Strip */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {/* Completed Goals */}
        <div
          onClick={() => onNavigateTab('goals')}
          className="bg-white p-3 rounded-2xl border border-black/[0.04] shadow-xs cursor-pointer hover:border-[#6C5CE7]/30 transition-all"
        >
          <div className="flex items-center justify-between text-[#6B7280] mb-1">
            <span className="text-[11px] font-medium">Target</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3FB876]" />
          </div>
          <div className="text-lg font-bold text-[#1A1A2E] tabular-nums">
            {completedTodayCount}/{totalTodayCount}
          </div>
          <span className="text-[10px] text-[#6B7280]">selesai hari ini</span>
        </div>

        {/* Current Streak (Interactive!) */}
        <motion.div
          whileTap={{ scale: 0.96 }}
          onClick={() => setIsStreakModalOpen(true)}
          className="bg-white p-3 rounded-2xl border border-black/[0.04] shadow-xs cursor-pointer hover:border-[#FFB020]/50 hover:shadow-xs transition-all group"
          title="Klik untuk melihat detail pelacak konsistensi streak"
        >
          <div className="flex items-center justify-between text-[#6B7280] mb-1">
            <span className="text-[11px] font-medium group-hover:text-[#FFB020] transition-colors">Streak</span>
            <Flame className="w-3.5 h-3.5 text-[#FFB020] animate-pulse" />
          </div>
          <div className="text-lg font-bold text-[#1A1A2E] tabular-nums flex items-center justify-between">
            <span>{streakInfo.currentStreak} Hari</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#6B7280]/60 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <span className={`text-[10px] font-medium ${streakInfo.todayActive ? 'text-[#3FB876]' : 'text-[#FFB020]'}`}>
            {streakInfo.todayActive ? 'Aktif hari ini ✓' : 'Konsisten terus'}
          </span>
        </motion.div>

        {/* Current Stage */}
        <div
          onClick={() => onNavigateTab('roadmap')}
          className="bg-white p-3 rounded-2xl border border-black/[0.04] shadow-xs cursor-pointer hover:border-[#6C5CE7]/30 transition-all"
        >
          <div className="flex items-center justify-between text-[#6B7280] mb-1">
            <span className="text-[11px] font-medium">Fase Hidup</span>
            <span className="w-2 h-2 rounded-full bg-[#6C5CE7]" />
          </div>
          <div className="text-sm font-bold text-[#6C5CE7] truncate">
            {user.stage}
          </div>
          <span className="text-[10px] text-[#6B7280]">Roadmap aktif</span>
        </div>
      </div>

      {/* ================= MORNING KICKOFF BANNER (Flexible, Stage-Aware & Dynamic) ================= */}
      <AnimatePresence>
        {showKickoff && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="mb-4 bg-white p-4 rounded-3xl border-l-4 border-[#6C5CE7] border-y border-r border-black/[0.05] shadow-xs relative"
          >
            <button
              type="button"
              onClick={() => setShowKickoff(false)}
              className="absolute top-3 right-3 text-[#6B7280] hover:text-[#1A1A2E] p-1 rounded-full hover:bg-black/5 transition-colors"
              title="Sembunyikan kickoff"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {activeKickoffMilestone ? (
              <div className="pr-6">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5 text-[#6C5CE7]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Morning Kickoff</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getKickoffCategoryTag(activeKickoffMilestone.category).color}`}>
                    {getKickoffCategoryTag(activeKickoffMilestone.category).label}
                  </span>
                  <span className="text-[10px] text-[#6B7280]">
                    {user.stage}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-[#1A1A2E] leading-snug">
                  {activeKickoffMilestone.title}
                </h3>
                <p className="text-[11px] text-[#6B7280] mt-1 leading-relaxed line-clamp-2">
                  {activeKickoffMilestone.description}
                </p>

                {/* Progress indicator */}
                <div className="mt-2 text-[10px] text-[#6B7280] font-medium">
                  Tonggak {(kickoffIndex % pendingMilestones.length) + 1} dari {pendingMilestones.length} yang belum selesai
                </div>

                {/* Interactive Action Buttons */}
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  {isKickoffAddedToToday ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] px-3 py-1.5 bg-[#3FB876]/15 text-[#3FB876] font-bold rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Sudah Masuk Target Hari Ini</span>
                      </span>
                      {pendingMilestones.length > 1 && (
                        <button
                          type="button"
                          onClick={handleNextKickoff}
                          className="text-[11px] px-2.5 py-1.5 bg-black/5 hover:bg-black/10 text-[#1A1A2E] font-semibold rounded-full flex items-center gap-1 transition-colors"
                        >
                          <span>Langkah Berikutnya</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleAddKickoffGoal}
                        className="text-xs px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1 bg-[#6C5CE7] hover:bg-[#5b4bc7] text-white transition-all active:scale-95 shadow-xs"
                      >
                        {kickoffAddedToast ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Ditambahkan!</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Jadikan Target Hari Ini</span>
                          </>
                        )}
                      </button>

                      {pendingMilestones.length > 1 && (
                        <button
                          type="button"
                          onClick={handleNextKickoff}
                          className="text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-1 bg-black/5 hover:bg-black/10 text-[#1A1A2E] transition-colors"
                          title="Tampilkan saran langkah lain untuk fase ini"
                        >
                          <RotateCcw className="w-3 h-3 text-[#6B7280]" />
                          <span>Ganti Saran</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              // All milestones in this stage completed!
              <div className="pr-6">
                <div className="flex items-center gap-1.5 text-[#3FB876] mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Fase Selesai</span>
                </div>
                <h3 className="text-xs font-bold text-[#1A1A2E] leading-snug">
                  Hebat! Seluruh tonggak di fase {user.stage} sudah tercapai 🎉
                </h3>
                <p className="text-[11px] text-[#6B7280] mt-1 leading-relaxed">
                  Kamu sudah menuntaskan semua target terstruktur untuk fase ini. Saatnya melangkah ke fase berikutnya di Roadmap!
                </p>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => onNavigateTab('roadmap')}
                    className="text-xs px-3.5 py-1.5 rounded-full font-bold bg-[#6C5CE7] hover:bg-[#5b4bc7] text-white flex items-center gap-1.5"
                  >
                    <span>Buka Roadmap Lengkap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Mentor Stage-Aware Daily Tip Card */}
      <section className="mb-5">
        <div className="bg-[#6C5CE7] text-white p-5 rounded-3xl shadow-lg shadow-[#6C5CE7]/25 relative overflow-hidden">
          {/* Subtle background glow/circle */}
          <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />

          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                Mentor Harian · {user.stage}
              </span>
            </div>

            <button
              type="button"
              onClick={handleReadAloud}
              className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                isPlayingAudio
                  ? 'bg-[#FA5A50] text-white animate-pulse'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Read Aloud</span>
                </>
              )}
            </button>
          </div>

          <div className="relative z-10 space-y-2">
            <h2 className="text-base font-bold text-white leading-snug">
              {mentorTip.title}
            </h2>
            <p className="text-xs text-white/90 leading-relaxed font-normal">
              {mentorTip.tip}
            </p>

            {/* Suggested Goal quick pill */}
            <div className="pt-2 border-t border-white/15 flex items-center justify-between">
              <div className="text-[11px] text-white/80">
                <span className="font-semibold text-white">Saran langkah: </span>
                <span>{mentorTip.suggestedGoal}</span>
              </div>
              <button
                type="button"
                onClick={() => onAddGoal(mentorTip.suggestedGoal, mentorTip.category as any)}
                className="shrink-0 ml-2 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white"
                title="Tambah ke Target"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Grid of Colored Shortcut Cards */}
      <section className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-[#1A1A2E]">Pusat Aktivitas</h2>
          <span className="text-xs text-[#6B7280]">Pintasan cepat</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Roadmap (Purple #6C5CE7) */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigateTab('roadmap')}
            className="bg-[#6C5CE7] text-white p-4 rounded-3xl cursor-pointer shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[130px]"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MilestoneIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                Fase
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Roadmap Karier</h3>
              <p className="text-[11px] text-white/80 mt-0.5 truncate">
                {pendingMilestones.length} tonggak tersisa
              </p>
            </div>
          </motion.div>

          {/* Card 2: Goals (Coral #FA5A50) */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigateTab('goals')}
            className="bg-[#FA5A50] text-white p-4 rounded-3xl cursor-pointer shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[130px]"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <CheckSquare className="w-4 h-4 text-white" />
              </div>
              <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                Hari ini
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Target Harian</h3>
              <p className="text-[11px] text-white/80 mt-0.5">
                {totalTodayCount - completedTodayCount} target aktif
              </p>
            </div>
          </motion.div>

          {/* Card 3: Journal (Amber #FFB020) */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigateTab('journal')}
            className="bg-[#FFB020] text-white p-4 rounded-3xl cursor-pointer shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[130px]"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                Harian
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Jurnal Refleksi</h3>
              <p className="text-[11px] text-white/80 mt-0.5 truncate">
                {journalStatus}
              </p>
            </div>
          </motion.div>

          {/* Card 4: Finance (Green #3FB876) */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigateTab('finance')}
            className="bg-[#3FB876] text-white p-4 rounded-3xl cursor-pointer shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[130px]"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                50/30/20
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Keuangan Mahasiswa</h3>
              <p className="text-[11px] text-white/80 mt-0.5">
                Simulasi Rp {(finance.monthlyIncome / 1000).toLocaleString('id-ID')}rb
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Upcoming Strip: Calendar Deadlines */}
      <section className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#6C5CE7]" />
            <h2 className="text-base font-bold text-[#1A1A2E]">Agenda Terdekat</h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('calendar')}
            className="text-xs font-semibold text-[#6C5CE7] hover:underline flex items-center gap-0.5"
          >
            <span>Buka Kalender</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {events.length === 0 ? (
            <div
              onClick={() => onNavigateTab('calendar')}
              className="bg-white p-4 rounded-2xl border border-black/[0.04] text-center cursor-pointer hover:border-[#6C5CE7]/30 transition-all"
            >
              <p className="text-xs text-[#6B7280]">
                Belum ada agenda tercatat. Klik untuk membuat agenda atau deadline pertama!
              </p>
            </div>
          ) : (
            events.slice(0, 3).map((ev) => {
              const evDate = new Date(ev.date);
              const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
              const dayLabel = isNaN(evDate.getTime()) ? 'H' : days[evDate.getDay()];

              let badgeColor = 'bg-[#FA5A50]/10 text-[#FA5A50]';
              let badgeText = 'Penting';
              if (ev.urgency === 'urgent') {
                badgeColor = 'bg-[#FA5A50] text-white';
                badgeText = 'Urgent';
              } else if (ev.urgency === 'penting') {
                badgeColor = 'bg-[#FA5A50]/15 text-[#FA5A50]';
                badgeText = 'Penting';
              } else if (ev.urgency === 'sebentar_lagi') {
                badgeColor = 'bg-[#FFB020]/15 text-[#FFB020]';
                badgeText = 'Sebentar Lagi';
              } else if (ev.urgency === 'masih_lama') {
                badgeColor = 'bg-[#3FB876]/15 text-[#3FB876]';
                badgeText = 'Masih Lama';
              } else if (ev.urgency === 'karir') {
                badgeColor = 'bg-[#6C5CE7]/15 text-[#6C5CE7]';
                badgeText = 'Karier';
              }

              return (
                <div
                  key={ev.id}
                  onClick={() => onNavigateTab('calendar')}
                  className="bg-white p-3.5 rounded-2xl border border-black/[0.04] shadow-xs flex items-center justify-between cursor-pointer hover:border-[#6C5CE7]/30 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#6C5CE7]/10 text-[#6C5CE7] flex items-center justify-center font-bold text-xs shrink-0">
                      {dayLabel}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-[#1A1A2E] truncate">
                        {ev.title}
                      </h4>
                      <p className="text-[11px] text-[#6B7280] truncate">
                        {ev.date} {ev.time ? `· ${ev.time} WIB` : ''} {ev.location ? `· ${ev.location}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2 ${badgeColor}`}>
                    {badgeText}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ================= INTERACTIVE STREAK TRACKER MODAL ================= */}
      <AnimatePresence>
        {isStreakModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="p-4 border-b border-black/[0.05] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-[#FFB020] text-white flex items-center justify-center shadow-xs">
                    <Flame className="w-5 h-5 fill-white stroke-[2]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#1A1A2E]">Pelacak Konsistensi (Streak)</h2>
                    <p className="text-[11px] text-[#6B7280]">
                      Sistem pencatat aktivitas otomatis PocketMentor
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsStreakModalOpen(false)}
                  className="p-2 text-[#6B7280] hover:text-[#1A1A2E] rounded-full hover:bg-black/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Hero Flame Display */}
                <div className="bg-gradient-to-br from-[#FFB020]/15 via-[#FA5A50]/10 to-[#6C5CE7]/5 p-5 rounded-3xl border border-[#FFB020]/25 text-center relative overflow-hidden">
                  <div className="w-16 h-16 rounded-full bg-[#FFB020] text-white flex items-center justify-center mx-auto mb-2 shadow-md shadow-[#FFB020]/30">
                    <Flame className="w-9 h-9 fill-white animate-pulse" />
                  </div>
                  <div className="text-3xl font-extrabold text-[#1A1A2E] tracking-tight tabular-nums">
                    {streakInfo.currentStreak} Hari
                  </div>
                  <p className="text-xs font-semibold text-[#FFB020] mt-0.5">
                    Konsistensi Produktif Berturut-turut
                  </p>

                  {/* Status today alert */}
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs">
                    {streakInfo.todayActive ? (
                      <span className="bg-[#3FB876]/15 border-[#3FB876]/30 text-[#3FB876] px-3 py-1 rounded-full flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Aktivitas hari ini tercatat! Apimu aman menyala 🔥</span>
                      </span>
                    ) : (
                      <span className="bg-[#FFB020]/15 border-[#FFB020]/30 text-[#D97706] px-3 py-1 rounded-full flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Selesaikan 1 aktivitas hari ini sebelum 23:59!</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 7-Day Visual Calendar Strip */}
                <div>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <h3 className="text-xs font-bold text-[#1A1A2E] uppercase tracking-wider">
                      Catatan 7 Hari Terakhir
                    </h3>
                    <span className="text-[10px] text-[#6B7280]">
                      {streakInfo.history.filter((h) => h.active).length} hari aktif
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5">
                    {streakInfo.history.map((day, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col items-center p-2 rounded-2xl border transition-all ${
                          day.isToday
                            ? 'border-[#6C5CE7] bg-[#6C5CE7]/5 shadow-xs ring-1 ring-[#6C5CE7]/20'
                            : 'border-black/[0.05] bg-white'
                        }`}
                      >
                        <span className={`text-[10px] font-semibold mb-1 ${day.isToday ? 'text-[#6C5CE7]' : 'text-[#6B7280]'}`}>
                          {day.dayName}
                        </span>

                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-transform ${
                            day.active
                              ? 'bg-[#FFB020] text-white shadow-xs scale-105'
                              : 'bg-black/[0.04] text-[#6B7280]'
                          }`}
                        >
                          {day.active ? (
                            <Flame className="w-4 h-4 fill-white stroke-[2]" />
                          ) : (
                            <span>{day.dayNumber}</span>
                          )}
                        </div>

                        <span className="text-[9px] mt-1 font-bold">
                          {day.isToday ? (
                            <span className="text-[#6C5CE7]">Hari Ini</span>
                          ) : day.active ? (
                            <span className="text-[#3FB876]">Aktif</span>
                          ) : (
                            <span className="text-[#6B7280]/60">-</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Consistency Metrics */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#F5F5F9] p-3 rounded-2xl text-center">
                    <span className="text-[10px] text-[#6B7280] font-semibold">Streak Saat Ini</span>
                    <div className="text-base font-extrabold text-[#1A1A2E] mt-0.5 tabular-nums">
                      {streakInfo.currentStreak} Hari
                    </div>
                  </div>
                  <div className="bg-[#F5F5F9] p-3 rounded-2xl text-center">
                    <span className="text-[10px] text-[#6B7280] font-semibold">Rekor Terbaik</span>
                    <div className="text-base font-extrabold text-[#FFB020] mt-0.5 tabular-nums">
                      {streakInfo.maxStreak} Hari
                    </div>
                  </div>
                  <div className="bg-[#F5F5F9] p-3 rounded-2xl text-center">
                    <span className="text-[10px] text-[#6B7280] font-semibold">Total Hari Aktif</span>
                    <div className="text-base font-extrabold text-[#3FB876] mt-0.5 tabular-nums">
                      {streakInfo.totalActiveDays} Hari
                    </div>
                  </div>
                </div>

                {/* Explanation: How PocketMentor Tracks Activity */}
                <div className="bg-white p-4 rounded-3xl border border-black/[0.06] shadow-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A1A2E]">
                    <ShieldCheck className="w-4 h-4 text-[#6C5CE7]" />
                    <span>Bagaimana PocketMentor Melacak Aktivitasmu?</span>
                  </div>
                  <p className="text-[11px] text-[#6B7280] leading-relaxed">
                    Sistem streak di PocketMentor didesain otomatis dan adil. Cukup lakukan minimal <strong>satu aktivitas bermakna</strong> setiap hari sebelum pukul 23:59:
                  </p>
                  <ul className="text-[11px] text-[#1A1A2E] space-y-1.5 pl-1">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7]" />
                      <span><strong>Target Harian:</strong> Selesaikan minimal 1 target di tab Target.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FFB020]" />
                      <span><strong>Jurnal Refleksi:</strong> Tulis catatan atau curhat singkat di tab Jurnal.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FA5A50]" />
                      <span><strong>Roadmap Hidup:</strong> Centang salah satu langkah konkret di tab Roadmap.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3FB876]" />
                      <span><strong>Agenda Tugas:</strong> Buat atau selesaikan agenda di Kalender.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-3 bg-[#F5F5F9] border-t border-black/[0.05] flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsStreakModalOpen(false);
                    onNavigateTab('goals');
                  }}
                  className="flex-1 py-2.5 px-4 bg-[#6C5CE7] hover:bg-[#5b4bc4] text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Kerjakan Target Hari Ini</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsStreakModalOpen(false);
                    onNavigateTab('journal');
                  }}
                  className="py-2.5 px-4 bg-white border border-black/[0.08] hover:bg-black/5 text-[#1A1A2E] rounded-full text-xs font-bold transition-colors"
                >
                  Tulis Jurnal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
