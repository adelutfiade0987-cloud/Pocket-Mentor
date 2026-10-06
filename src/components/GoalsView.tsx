import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Flame,
  Sparkles,
  Clock,
  Check,
  Bell,
  X,
} from 'lucide-react';
import { Goal, GoalCategory, UserProfile } from '../types';
import { fireCelebrationConfetti } from '../utils/confetti';

interface GoalsViewProps {
  user: UserProfile;
  goals: Goal[];
  onToggleGoal: (id: string) => void;
  onAddGoal: (title: string, category: GoalCategory) => void;
  onDeleteGoal: (id: string) => void;
}

const CATEGORY_COLORS: Record<GoalCategory, { bg: string; text: string; label: string }> = {
  study: { bg: 'bg-[#6C5CE7]/10', text: 'text-[#6C5CE7]', label: 'Akademik' },
  career: { bg: 'bg-[#FA5A50]/10', text: 'text-[#FA5A50]', label: 'Karier' },
  health: { bg: 'bg-[#3FB876]/10', text: 'text-[#3FB876]', label: 'Kesehatan' },
  finance: { bg: 'bg-[#FFB020]/10', text: 'text-[#FFB020]', label: 'Finansial' },
  content: { bg: 'bg-[#EC4899]/10', text: 'text-[#EC4899]', label: 'Kreatif' },
};

export const GoalsView: React.FC<GoalsViewProps> = ({
  user,
  goals,
  onToggleGoal,
  onAddGoal,
  onDeleteGoal,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<GoalCategory>('study');
  const [streakPop, setStreakPop] = useState(false);
  const [showCelebrationBanner, setShowCelebrationBanner] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const todayGoals = goals.filter((g) => g.date === today);
  const completedCount = todayGoals.filter((g) => g.completed).length;
  const totalCount = todayGoals.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const streak = 7;

  // Suggested goals adapting to user's stage
  const stageSuggestions: { title: string; category: GoalCategory }[] =
    user.stage.includes('Semester 7') || user.stage.includes('Semester 8')
      ? [
          { title: 'Tulis 500 kata Bab 2 / Bab 3 Skripsi', category: 'study' },
          { title: 'Kirim 1 lamaran terkurasi di LinkedIn / Glints', category: 'career' },
          { title: 'Audit portofolio & perbarui tautan case study', category: 'content' },
          { title: 'Jalan santai 20 menit untuk refresh pikiran', category: 'health' },
        ]
      : user.stage.includes('Semester 5') || user.stage.includes('Semester 6')
      ? [
          { title: 'Riset 3 lowongan magang MSIB / korporat', category: 'career' },
          { title: 'Kumpulkan 5 jurnal ilmiah untuk topik skripsi', category: 'study' },
          { title: 'Update resume ATS dengan pencapaian organisasi', category: 'career' },
        ]
      : [
          { title: 'Baca 15 halaman materi di luar kuliah', category: 'study' },
          { title: 'Buat 1 postingan rangkuman insight di LinkedIn', category: 'content' },
          { title: 'Susun rencana jadwal belajar mingguan', category: 'study' },
        ];

  const handleToggle = (id: string) => {
    const goal = goals.find((g) => g.id === id);
    const willBeCompleted = goal ? !goal.completed : false;

    onToggleGoal(id);

    if (willBeCompleted) {
      setStreakPop(true);
      setTimeout(() => setStreakPop(false), 500);

      // Check if all goals are now completed!
      if (completedCount + 1 === totalCount && totalCount > 0) {
        fireCelebrationConfetti();
        setShowCelebrationBanner(true);
      }
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddGoal(newTitle.trim(), newCategory);
    setNewTitle('');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F9] pb-28 pt-4 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[#1A1A2E]">Target Harian</h1>
        <p className="text-xs text-[#6B7280]">
          Fokus pada progres bertahap setiap hari. Selesai lebih baik daripada sempurna.
        </p>
      </div>

      {/* Progress Ring & Streak Banner */}
      <div className="bg-white p-5 rounded-3xl border border-black/[0.05] shadow-xs mb-4 flex items-center justify-between relative overflow-hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-2xl font-extrabold text-[#1A1A2E] tabular-nums ${
                streakPop ? 'animate-streak-pop text-[#6C5CE7]' : ''
              }`}
            >
              {completedCount}/{totalCount}
            </span>
            <span className="text-xs text-[#6B7280] font-medium">target selesai</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FFB020]">
            <Flame className="w-4 h-4 fill-[#FFB020]" />
            <span>{streak} Hari Konsisten</span>
          </div>

          <p className="text-[11px] text-[#6B7280]">
            Pengingat malam aktif: <span className="font-semibold text-[#1A1A2E]">{user.reminderTime || '20:00'} WIB</span>
          </p>
        </div>

        {/* Circular Progress Ring */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-[#F5F5F9]"
              strokeWidth="3.8"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-[#6C5CE7] transition-all duration-500 ease-out"
              strokeDasharray={`${percentage}, 100`}
              strokeWidth="3.8"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute text-sm font-bold text-[#1A1A2E] tabular-nums">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Daily Goals Celebration Banner (Section 4) */}
      <AnimatePresence>
        {showCelebrationBanner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-4 bg-[#3FB876] text-white p-4 rounded-3xl shadow-lg shadow-[#3FB876]/25 relative"
            onClick={() => setShowCelebrationBanner(false)}
          >
            <button
              type="button"
              onClick={() => setShowCelebrationBanner(false)}
              className="absolute top-3 right-3 text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-white" />
              <h3 className="font-bold text-sm">Luar biasa! Semua target hari ini tuntas 🎉</h3>
            </div>
            <p className="text-xs text-white/90">
              Kamu membuktikan komitmen nyata untuk masa depanmu hari ini. Istirahat yang cukup ya!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Add Goal Form */}
      <form onSubmit={handleAddSubmit} className="bg-white p-3.5 rounded-3xl border border-black/[0.05] shadow-xs mb-4">
        <div className="flex items-center gap-2 mb-2.5">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Tambah target baru hari ini..."
            className="flex-1 px-3 py-2 bg-[#F5F5F9] rounded-xl text-xs text-[#1A1A2E] font-medium focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30"
          />
          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="p-2 rounded-xl bg-[#6C5CE7] text-white disabled:opacity-40 hover:bg-[#5b4bc7] transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Category Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(Object.keys(CATEGORY_COLORS) as GoalCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setNewCategory(cat)}
              className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors ${
                newCategory === cat
                  ? 'bg-[#6C5CE7] text-white shadow-xs'
                  : 'bg-[#F5F5F9] text-[#6B7280] hover:text-[#1A1A2E]'
              }`}
            >
              {CATEGORY_COLORS[cat].label}
            </button>
          ))}
        </div>
      </form>

      {/* Suggested Goals for Current Stage */}
      <div className="mb-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block mb-2">
          Saran Target Sesuai {user.stage}
        </span>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {stageSuggestions.map((s, idx) => (
            <motion.button
              whileTap={{ scale: 0.96 }}
              key={idx}
              type="button"
              onClick={() => onAddGoal(s.title, s.category)}
              className="shrink-0 bg-white border border-black/[0.06] hover:border-[#6C5CE7] p-2.5 rounded-2xl text-left shadow-xs flex items-center gap-2 max-w-[240px]"
            >
              <div className="w-6 h-6 rounded-lg bg-[#6C5CE7]/10 text-[#6C5CE7] flex items-center justify-center shrink-0">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-[#1A1A2E] truncate">
                {s.title}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Goals Checklist */}
      <div className="space-y-2.5">
        {todayGoals.map((goal) => {
          const catInfo = CATEGORY_COLORS[goal.category] || CATEGORY_COLORS.study;

          return (
            <motion.div
              key={goal.id}
              layout
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                goal.completed
                  ? 'bg-white/60 border-black/[0.04]'
                  : 'bg-white border-black/[0.06] shadow-xs hover:border-[#6C5CE7]/30'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => handleToggle(goal.id)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90 ${
                    goal.completed
                      ? 'bg-[#3FB876] text-white animate-check-bounce'
                      : 'border-2 border-black/20 hover:border-[#6C5CE7]'
                  }`}
                >
                  {goal.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

                <div className="min-w-0 flex-1">
                  <span
                    className={`text-xs font-semibold block truncate ${
                      goal.completed ? 'line-through text-[#6B7280]' : 'text-[#1A1A2E]'
                    }`}
                  >
                    {goal.title}
                  </span>
                  <span className={`text-[10px] font-bold ${catInfo.text}`}>
                    {catInfo.label}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onDeleteGoal(goal.id)}
                className="text-[#6B7280] hover:text-[#FA5A50] p-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
