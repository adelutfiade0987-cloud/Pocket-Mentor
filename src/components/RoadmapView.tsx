import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Milestone as MilestoneIcon,
  CheckCircle2,
  Circle,
  Plus,
  ArrowRight,
  Sparkles,
  ChevronDown,
  BookOpen,
  Briefcase,
  Users,
  Coins,
} from 'lucide-react';
import { Milestone, LifeStage, GoalCategory } from '../types';

interface RoadmapViewProps {
  currentStage: LifeStage;
  milestones: Milestone[];
  onToggleMilestone: (id: string) => void;
  onConvertMilestoneToGoal: (milestone: Milestone) => void;
  onSetCurrentStage: (stage: LifeStage) => void;
}

const STAGES_ORDER: { stage: LifeStage; label: string; desc: string }[] = [
  { stage: 'High school grad', label: 'Lulus SMA / Gap', desc: 'Eksplorasi skill, portofolio dari nol' },
  { stage: 'Semester 1–2', label: 'Semester 1–2', desc: 'Adaptasi kampus & fondasi dasar' },
  { stage: 'Semester 3–4', label: 'Semester 3–4', desc: 'Peminatan, freelance & kompetisi' },
  { stage: 'Semester 5–6', label: 'Semester 5–6', desc: 'Magang formal & topik skripsi' },
  { stage: 'Semester 7', label: 'Semester 7', desc: 'Pacing skripsi & pipeline kerja' },
  { stage: 'Semester 8', label: 'Semester 8', desc: 'Sidang, interview & transisi karier' },
  { stage: 'Already working', label: 'Dunia Kerja', desc: 'Dana darurat & upskilling berkala' },
];

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  currentStage,
  milestones,
  onToggleMilestone,
  onConvertMilestoneToGoal,
  onSetCurrentStage,
}) => {
  const [selectedStage, setSelectedStage] = useState<LifeStage>(currentStage);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  const stageMilestones = milestones.filter((m) => m.stageId === selectedStage);
  const completedInStage = stageMilestones.filter((m) => m.completed).length;

  const handleConvert = (milestone: Milestone) => {
    setConvertingId(milestone.id);
    onConvertMilestoneToGoal(milestone);
    setTimeout(() => setConvertingId(null), 600);
  };

  const getCategoryIcon = (cat: GoalCategory) => {
    switch (cat) {
      case 'study':
        return <BookOpen className="w-3.5 h-3.5 text-[#6C5CE7]" />;
      case 'career':
        return <Briefcase className="w-3.5 h-3.5 text-[#FA5A50]" />;
      case 'health':
        return <Users className="w-3.5 h-3.5 text-[#3FB876]" />;
      case 'finance':
        return <Coins className="w-3.5 h-3.5 text-[#FFB020]" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F9] pb-28 pt-4 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-[#6C5CE7] mb-1">
          <MilestoneIcon className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Life-Stage Path</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1A1A2E]">Roadmap Karier & Hidup</h1>
        <p className="text-xs text-[#6B7280]">
          Peta jalan komprehensif dari transisi kuliah hingga dunia kerja profesional.
        </p>
      </div>

      {/* Connected Thread Horizontal Timeline */}
      <div className="bg-white p-4 rounded-3xl border border-black/[0.05] shadow-xs mb-5 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-3 min-w-[580px] relative px-2 py-1">
          {/* Thread Line connecting nodes */}
          <div className="absolute top-1/2 left-6 right-6 h-1 bg-black/[0.08] -translate-y-1/2 z-0" />

          {STAGES_ORDER.map((item) => {
            const isCurrent = currentStage === item.stage;
            const isSelected = selectedStage === item.stage;
            const stageItems = milestones.filter((m) => m.stageId === item.stage);
            const isAllDone = stageItems.length > 0 && stageItems.every((m) => m.completed);

            return (
              <button
                key={item.stage}
                type="button"
                onClick={() => setSelectedStage(item.stage)}
                className="relative z-10 flex flex-col items-center group shrink-0 focus:outline-none"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isSelected
                      ? 'bg-[#6C5CE7] text-white shadow-md shadow-[#6C5CE7]/35 scale-110 ring-4 ring-[#6C5CE7]/15'
                      : isAllDone
                      ? 'bg-[#3FB876] text-white'
                      : isCurrent
                      ? 'bg-white text-[#6C5CE7] border-2 border-[#6C5CE7]'
                      : 'bg-[#F5F5F9] text-[#6B7280] border border-black/[0.1] hover:border-[#6C5CE7]'
                  }`}
                >
                  {isAllDone ? (
                    <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <span>{item.label.includes('Semester') ? item.label.replace('Semester ', 'S') : 'M'}</span>
                  )}
                </div>

                <span
                  className={`text-[11px] mt-2 font-semibold transition-colors ${
                    isSelected ? 'text-[#6C5CE7]' : 'text-[#6B7280]'
                  }`}
                >
                  {item.label}
                </span>

                {isCurrent && (
                  <span className="text-[9px] font-bold text-[#6C5CE7] bg-[#6C5CE7]/10 px-1.5 py-0.2 rounded-full mt-0.5">
                    Aktif
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Detail Panel */}
      <div className="bg-white p-5 rounded-3xl border border-black/[0.05] shadow-xs mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-xs font-semibold text-[#6C5CE7]">Fase Terpilih</span>
            <h2 className="text-lg font-bold text-[#1A1A2E]">{selectedStage}</h2>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-[#1A1A2E] tabular-nums">
              {completedInStage}/{stageMilestones.length}
            </span>
            <p className="text-[10px] text-[#6B7280]">tonggak selesai</p>
          </div>
        </div>

        {selectedStage !== currentStage && (
          <button
            type="button"
            onClick={() => onSetCurrentStage(selectedStage)}
            className="w-full mt-1 mb-3 py-1.5 px-3 bg-[#6C5CE7]/10 hover:bg-[#6C5CE7]/20 text-[#6C5CE7] text-xs font-bold rounded-xl transition-all"
          >
            Jadikan Ini Fase Hidup Utamaku
          </button>
        )}

        <div className="w-full h-2 bg-[#F5F5F9] rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-[#6C5CE7] rounded-full transition-all duration-300"
            style={{
              width: `${stageMilestones.length > 0 ? (completedInStage / stageMilestones.length) * 100 : 0}%`,
            }}
          />
        </div>

        {/* Milestones List */}
        <div className="space-y-3">
          {stageMilestones.map((milestone) => {
            const isConverting = convertingId === milestone.id;

            return (
              <motion.div
                key={milestone.id}
                layout
                animate={isConverting ? { scale: [1, 1.03, 1], y: [0, -4, 0] } : {}}
                className={`p-3.5 rounded-2xl border transition-all ${
                  milestone.completed
                    ? 'bg-[#F5F5F9]/70 border-black/[0.04]'
                    : 'bg-white border-black/[0.07] hover:border-[#6C5CE7]/30 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => onToggleMilestone(milestone.id)}
                      className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90 ${
                        milestone.completed
                          ? 'bg-[#3FB876] text-white animate-check-bounce'
                          : 'border-2 border-black/20 hover:border-[#6C5CE7]'
                      }`}
                    >
                      {milestone.completed ? (
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 opacity-0" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="p-1 rounded-md bg-[#F5F5F9]">
                          {getCategoryIcon(milestone.category)}
                        </span>
                        <h3
                          className={`text-xs font-bold leading-snug ${
                            milestone.completed
                              ? 'line-through text-[#6B7280]'
                              : 'text-[#1A1A2E]'
                          }`}
                        >
                          {milestone.title}
                        </h3>
                      </div>
                      <p className="text-[11px] text-[#6B7280] leading-relaxed">
                        {milestone.description}
                      </p>
                    </div>
                  </div>

                  {/* Convert to Today's Goal button (Milestone -> Goal) */}
                  {!milestone.completed && (
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      type="button"
                      onClick={() => handleConvert(milestone)}
                      title="Jadikan target harian hari ini"
                      className="shrink-0 p-2 rounded-xl bg-[#6C5CE7]/10 text-[#6C5CE7] hover:bg-[#6C5CE7] hover:text-white transition-all flex items-center gap-1 text-[11px] font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Jadikan Target</span>
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
