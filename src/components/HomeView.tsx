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
} from 'lucide-react';
import { UserProfile, Goal, Milestone, JournalEntry, FinanceData, CalendarEvent, EventUrgency } from '../types';
import { playTextToSpeech, stopAudioPlayback } from '../utils/tts';

interface HomeViewProps {
  user: UserProfile;
  goals: Goal[];
  milestones: Milestone[];
  journal: JournalEntry[];
  finance: FinanceData;
  events?: CalendarEvent[];
  onNavigateTab: (tab: any) => void;
  onAddGoal: (title: string, category: any) => void;
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
  // Stats
  const today = new Date().toISOString().split('T')[0];
  const todayGoals = goals.filter((g) => g.date === today);
  const completedTodayCount = todayGoals.filter((g) => g.completed).length;
  const totalTodayCount = todayGoals.length;
  const streak = 7; // Active streak

  // Time-aware greeting
  const [greeting, setGreeting] = useState('Selamat Pagi');
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) setGreeting('Selamat Pagi');
    else if (hour >= 11 && hour < 15) setGreeting('Selamat Siang');
    else if (hour >= 15 && hour < 19) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');
  }, []);

  // Morning Kickoff Banner state
  const [showKickoff, setShowKickoff] = useState(true);
  const [kickoffAdded, setKickoffAdded] = useState(false);

  // Suggested milestone for user's stage
  const pendingMilestones = milestones.filter(
    (m) => m.stageId === user.stage && !m.completed
  );
  const suggestedMilestone = pendingMilestones[0] || milestones[0];

  // AI Mentor Daily Tip
  const [mentorTip, setMentorTip] = useState<{
    title: string;
    tip: string;
    suggestedGoal: string;
    category: string;
  }>({
    title: 'Pacing Skripsi & Portofolio',
    tip: `Di ${user.stage}, fokus utamamu adalah menjaga momentum tanpa burnout. 300 kata skripsi per hari lebih baik daripada maraton seminggu sekali.`,
    suggestedGoal: 'Tulis 300 kata paragraf pengantar skripsi',
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

  const handleAddKickoffGoal = () => {
    if (suggestedMilestone && !kickoffAdded) {
      onAddGoal(suggestedMilestone.title, suggestedMilestone.category);
      setKickoffAdded(true);
      setTimeout(() => setShowKickoff(false), 800);
    }
  };

  const lastJournalDate = journal[0]?.date;
  const journalStatus = lastJournalDate === today ? 'Sudah mengisi hari ini' : 'Belum ada catatan hari ini';

  return (
    <div className="min-h-screen bg-[#F5F5F9] pb-28 pt-4 px-4 max-w-md mx-auto">
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

        {/* Current Streak */}
        <div className="bg-white p-3 rounded-2xl border border-black/[0.04] shadow-xs">
          <div className="flex items-center justify-between text-[#6B7280] mb-1">
            <span className="text-[11px] font-medium">Streak</span>
            <Flame className="w-3.5 h-3.5 text-[#FFB020] animate-pulse" />
          </div>
          <div className="text-lg font-bold text-[#1A1A2E] tabular-nums">
            {streak} Hari
          </div>
          <span className="text-[10px] text-[#FFB020] font-medium">konsisten terus</span>
        </div>

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

      {/* Morning Kickoff Banner (Slide down, soft spring, pull from roadmap) */}
      <AnimatePresence>
        {showKickoff && suggestedMilestone && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="mb-4 bg-white p-3.5 rounded-2xl border-l-4 border-[#6C5CE7] border-y border-r border-black/[0.05] shadow-xs relative"
          >
            <button
              type="button"
              onClick={() => setShowKickoff(false)}
              className="absolute top-2.5 right-2.5 text-[#6B7280] hover:text-[#1A1A2E] p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="pr-6">
              <div className="flex items-center gap-1.5 text-[#6C5CE7] mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Morning Kickoff</span>
              </div>
              <h3 className="text-xs font-semibold text-[#1A1A2E] leading-snug">
                {suggestedMilestone.title}
              </h3>
              <p className="text-[11px] text-[#6B7280] mt-0.5 line-clamp-1">
                {suggestedMilestone.description}
              </p>

              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddKickoffGoal}
                  disabled={kickoffAdded}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-1 transition-all ${
                    kickoffAdded
                      ? 'bg-[#3FB876] text-white'
                      : 'bg-[#6C5CE7] text-white hover:bg-[#5b4bc7]'
                  }`}
                >
                  {kickoffAdded ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Masuk ke Target</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3" />
                      <span>Jadikan Target Hari Ini</span>
                    </>
                  )}
                </button>
              </div>
            </div>
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

            {/* Read Aloud Button (Gemini TTS) */}
            <button
              type="button"
              onClick={handleReadAloud}
              disabled={tipLoading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isPlayingAudio
                  ? 'bg-[#FA5A50] text-white animate-pulse'
                  : 'bg-white text-[#6C5CE7] hover:bg-white/90 shadow-xs'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Jeda Suara</span>
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

      {/* Grid of Colored Shortcut Cards (Design System Section 3) */}
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
            className="bg-[#FFB020] text-[#1A1A2E] p-4 rounded-3xl cursor-pointer shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[130px]"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-[#1A1A2E]" />
              </div>
              <span className="text-[11px] bg-black/10 px-2 py-0.5 rounded-full font-semibold">
                Refleksi
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1A1A2E]">Jurnal Harian</h3>
              <p className="text-[11px] text-[#1A1A2E]/80 mt-0.5 truncate">
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
              <h3 className="font-bold text-sm text-white">Finansial Mandiri</h3>
              <p className="text-[11px] text-white/80 mt-0.5 truncate">
                Alokasi kebutuhan & tabungan
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Creative Writing & Vision Card Banner */}
      <section className="mb-5">
        <div
          onClick={() => onNavigateTab('vision')}
          className="bg-white p-4 rounded-3xl border border-black/[0.05] shadow-xs cursor-pointer hover:border-[#6C5CE7]/40 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#6C5CE7]/10 text-[#6C5CE7] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A1A2E]">Creative Studio & Vision</h3>
              <p className="text-xs text-[#6B7280]">
                Unggah foto meja belajar atau suasana, AI ghostwrite cerita & bacakan!
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#6B7280]" />
        </div>
      </section>

      {/* Upcoming strip linking directly to Kalender */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#6C5CE7]" />
            <h2 className="text-base font-bold text-[#1A1A2E]">Mendatang</h2>
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
              // Day short label
              const evDate = new Date(ev.date);
              const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
              const dayLabel = isNaN(evDate.getTime()) ? 'H' : days[evDate.getDay()];

              // Badge styling
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
    </div>
  );
};
