import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Compass,
  BookOpen,
  Award,
  Briefcase,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Plus,
  Check,
  ChevronRight,
  ChevronDown,
  Coins,
  Users,
  Target,
  ArrowRight,
  X,
} from 'lucide-react';
import { Milestone, LifeStage, GoalCategory } from '../types';
import { ROADMAP_CATEGORIES, RoadmapCategory, RoadmapSubPhase } from '../utils/storage';

interface RoadmapViewProps {
  currentStage: LifeStage;
  milestones: Milestone[];
  onToggleMilestone: (id: string) => void;
  onConvertMilestoneToGoal: (milestone: Milestone) => void;
  onSetCurrentStage: (stage: LifeStage) => void;
}

interface StageOption {
  stage: LifeStage;
  title: string;
  categoryLabel: string;
  desc: string;
  categoryId: string;
  subPhaseId: string;
  color: string;
}

const STAGE_OPTIONS: StageOption[] = [
  {
    stage: 'High school grad',
    title: 'Masa SMA / Transisi & Gap Year',
    categoryLabel: 'Masa SMA & Transisi',
    desc: 'Eksplorasi minat-bakat, persiapan ujian masuk PTN, atau produktif saat gap year.',
    categoryId: 'cat-transisi',
    subPhaseId: 'sub-transisi-ujian',
    color: '#FA5A50',
  },
  {
    stage: 'Semester 1–2',
    title: 'Semester 1–2 (Tahun Pertama Kuliah)',
    categoryLabel: 'Masa Kuliah',
    desc: 'Adaptasi sistem SKS, amankan IPK awal >3.50, dan eksplorasi organisasi kampus.',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-1',
    color: '#FFB020',
  },
  {
    stage: 'Semester 3–4',
    title: 'Semester 3–4 (Peminatan & Portofolio)',
    categoryLabel: 'Masa Kuliah',
    desc: 'Bangun Proof of Work mandiri, ikut lomba/PKM, dan coba freelance pemula.',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-3',
    color: '#FFB020',
  },
  {
    stage: 'Semester 5–6',
    title: 'Semester 5–6 (Magang Industri & Topik Skripsi)',
    categoryLabel: 'Masa Kuliah',
    desc: 'Magang formal MSIB/korporat, networking praktisi, dan kumpulkan 10 jurnal skripsi.',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-5',
    color: '#FFB020',
  },
  {
    stage: 'Semester 7',
    title: 'Semester 7 (Seminar Proposal & Skripsi)',
    categoryLabel: 'Masa Kuliah',
    desc: 'Lulus seminar proposal, konsistensi 300–500 kata skripsi/hari, dan bidik program MT.',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-7',
    color: '#FFB020',
  },
  {
    stage: 'Semester 8',
    title: 'Semester 8 (Sidang Akhir & Transisi Kerja)',
    categoryLabel: 'Masa Kuliah & Fresh Grad',
    desc: 'Sidang skripsi, aktif melamar kerja entry-level, dan persiapan wisuda kelulusan.',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-8',
    color: '#3FB876',
  },
  {
    stage: 'Already working',
    title: 'Dunia Kerja (Fresh Grad & Profesional)',
    categoryLabel: 'Dunia Kerja',
    desc: 'Lolos probation 90 hari, alokasi gaji 50/30/20, dana darurat, dan akselerasi promosi.',
    categoryId: 'cat-kerja',
    subPhaseId: 'sub-kerja-probation',
    color: '#3B82F6',
  },
];

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  currentStage,
  milestones,
  onToggleMilestone,
  onConvertMilestoneToGoal,
  onSetCurrentStage,
}) => {
  // Navigation State for 3-Level Nested Bento Grid
  // Level 1: selectedCategoryId === null, selectedSubPhaseId === null
  // Level 2: selectedCategoryId !== null, selectedSubPhaseId === null
  // Level 3: selectedCategoryId !== null, selectedSubPhaseId !== null
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubPhaseId, setSelectedSubPhaseId] = useState<string | null>(null);
  const [justConvertedId, setJustConvertedId] = useState<string | null>(null);
  const [isStageSelectorOpen, setIsStageSelectorOpen] = useState(false);

  const selectedCategory = ROADMAP_CATEGORIES.find((c) => c.id === selectedCategoryId);
  const selectedSubPhase = selectedCategory?.subPhases.find((sp) => sp.id === selectedSubPhaseId);

  // Helper to get icon for category
  const renderCategoryIcon = (iconName: string, className = 'w-4 h-4 text-white') => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className={className} />;
      case 'Compass':
        return <Compass className={className} />;
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'Award':
        return <Award className={className} />;
      case 'Briefcase':
        return <Briefcase className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      default:
        return <Compass className={className} />;
    }
  };

  // Helper to get category step icon
  const getGoalCategoryBadge = (cat: GoalCategory) => {
    switch (cat) {
      case 'study':
        return { label: 'Akademik', color: 'bg-[#6C5CE7]/10 text-[#6C5CE7]', icon: <BookOpen className="w-3 h-3" /> };
      case 'career':
        return { label: 'Karier', color: 'bg-[#FA5A50]/10 text-[#FA5A50]', icon: <Briefcase className="w-3 h-3" /> };
      case 'health':
        return { label: 'Kebiasaan', color: 'bg-[#3FB876]/10 text-[#3FB876]', icon: <Users className="w-3 h-3" /> };
      case 'finance':
        return { label: 'Finansial', color: 'bg-[#FFB020]/10 text-[#FFB020]', icon: <Coins className="w-3 h-3" /> };
      default:
        return { label: 'Portofolio', color: 'bg-[#EC4899]/10 text-[#EC4899]', icon: <Sparkles className="w-3 h-3" /> };
    }
  };

  const handleConvertGoal = (milestone: Milestone) => {
    setJustConvertedId(milestone.id);
    onConvertMilestoneToGoal(milestone);
    setTimeout(() => {
      setJustConvertedId(null);
    }, 1200);
  };

  // Compute category progress stats
  const getCategoryStats = (category: RoadmapCategory) => {
    const catMilestones = milestones.filter(
      (m) => m.categoryId === category.id || category.subPhases.some((sp) => sp.id === m.subPhaseId)
    );
    const completed = catMilestones.filter((m) => m.completed).length;
    const total = catMilestones.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percent };
  };

  // Compute subphase progress stats
  const getSubPhaseStats = (subPhaseId: string) => {
    const spMilestones = milestones.filter((m) => m.subPhaseId === subPhaseId);
    const completed = spMilestones.filter((m) => m.completed).length;
    const total = spMilestones.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percent };
  };

  // Check if a category relates to currentStage
  const isCategoryCurrent = (category: RoadmapCategory) => {
    if (category.id === 'cat-sma' && currentStage === 'High school grad') return true;
    if (category.id === 'cat-transisi' && currentStage === 'High school grad') return true;
    if (category.id === 'cat-kuliah' && currentStage.includes('Semester')) return true;
    if (category.id === 'cat-freshgrad' && currentStage === 'Semester 8') return true;
    if (category.id === 'cat-kerja' && currentStage === 'Already working') return true;
    return false;
  };

  const jumpToStageRoadmap = (stage: LifeStage) => {
    const target = STAGE_OPTIONS.find((s) => s.stage === stage) || STAGE_OPTIONS[1];
    setSelectedCategoryId(target.categoryId);
    setSelectedSubPhaseId(target.subPhaseId);
    setIsStageSelectorOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F9] pb-32 pt-4 px-4 max-w-md mx-auto relative">
      <AnimatePresence mode="wait">
        {/* ================= LEVEL 1: KOTAK KATEGORI UTAMA (6 BOX GRID 2 KOLOM) ================= */}
        {!selectedCategoryId && (
          <motion.div
            key="level-1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="mb-4">
              <div className="flex items-center gap-2 text-[#6C5CE7] mb-1">
                <Compass className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Life-Stage Path</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#1A1A2E]">Roadmap Karier & Hidup</h1>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Peta jalan komprehensif dari transisi kuliah hingga dunia kerja profesional.
              </p>
            </div>

            {/* Interactive Current Stage Indicator Banner */}
            <motion.div
              whileTap={{ scale: 0.99 }}
              onClick={() => jumpToStageRoadmap(currentStage)}
              className="bg-white p-3.5 rounded-2xl border border-black/[0.05] shadow-xs mb-4 flex items-center justify-between hover:border-[#6C5CE7]/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#6C5CE7]/10 text-[#6C5CE7] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Target className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#6B7280] tracking-wider">
                      Fase Aktif Kamu
                    </span>
                    <span className="text-[10px] text-[#6C5CE7] font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      Buka modul <ArrowRight className="w-3 h-3 inline" />
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#1A1A2E] truncate">
                    {currentStage}
                  </p>
                </div>
              </div>

              {/* Interactive "Sedang Dijalani / Ubah" button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsStageSelectorOpen(true);
                }}
                className="shrink-0 flex items-center gap-1.5 text-[11px] font-bold text-[#6C5CE7] bg-[#6C5CE7]/10 hover:bg-[#6C5CE7] hover:text-white px-3 py-1.5 rounded-full transition-all active:scale-95 cursor-pointer shadow-2xs group/btn ml-2"
                title="Klik untuk memilih atau mengubah fase hidup yang sedang dijalani"
              >
                <span className="w-2 h-2 rounded-full bg-[#3FB876] animate-pulse shrink-0" />
                <span>Sedang Dijalani</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#6C5CE7] group-hover/btn:text-white transition-colors" />
              </button>
            </motion.div>

            {/* 6 Bento Grid Cards (2 Kolom) */}
            <div className="grid grid-cols-2 gap-3">
              {ROADMAP_CATEGORIES.map((cat) => {
                const stats = getCategoryStats(cat);
                const isCurrent = isCategoryCurrent(cat);

                return (
                  <motion.div
                    key={cat.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    style={{ backgroundColor: cat.color }}
                    className="text-white p-4 rounded-3xl cursor-pointer shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[160px] group transition-transform"
                  >
                    {/* Top Row: Icon on left, Badge on right */}
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        {renderCategoryIcon(cat.iconName, 'w-4 h-4 text-white')}
                      </div>
                      <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                        {cat.badge}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="mt-4">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="font-bold text-sm text-white leading-snug">{cat.title}</h3>
                        {isCurrent && (
                          <span className="w-2 h-2 rounded-full bg-white shrink-0 animate-pulse" title="Fase Aktif" />
                        )}
                      </div>
                      <p className="text-[11px] text-white/80 line-clamp-2 leading-relaxed">
                        {cat.subtitle}
                      </p>

                      {/* Progress summary bar */}
                      <div className="mt-3 pt-2 border-t border-white/20 flex items-center justify-between text-[10px] text-white/90">
                        <span>{stats.completed}/{stats.total} Selesai</span>
                        <span className="font-bold">{stats.percent}%</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ================= LEVEL 2: SUB-KOTAK BENTO GRID ================= */}
        {selectedCategoryId && !selectedSubPhaseId && selectedCategory && (
          <motion.div
            key="level-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Back Button */}
            <button
              type="button"
              onClick={() => setSelectedCategoryId(null)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6C5CE7] bg-white px-3.5 py-2 rounded-full border border-black/[0.05] shadow-xs mb-4 hover:bg-[#6C5CE7]/5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Kategori Utama</span>
            </button>

            {/* Category Header Hero */}
            <div
              style={{ backgroundColor: selectedCategory.color }}
              className="p-5 rounded-3xl text-white shadow-sm mb-4 relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  {renderCategoryIcon(selectedCategory.iconName, 'w-5 h-5 text-white')}
                </div>
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-bold">
                  {selectedCategory.badge}
                </span>
              </div>

              <h2 className="text-xl font-bold text-white mb-1">{selectedCategory.title}</h2>
              <p className="text-xs text-white/85 leading-relaxed">{selectedCategory.subtitle}</p>

              {/* Category overall progress */}
              {(() => {
                const stats = getCategoryStats(selectedCategory);
                return (
                  <div className="mt-4 pt-3 border-t border-white/20">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                      <span>Progres Keseluruhan</span>
                      <span>{stats.completed} dari {stats.total} langkah ({stats.percent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-500 rounded-full"
                        style={{ width: `${stats.percent}%` }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Instruction */}
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold text-[#1A1A2E]">Pilih Sub-Fase</span>
              <span className="text-[11px] text-[#6B7280]">
                {selectedCategory.subPhases.length} Modul Tersedia
              </span>
            </div>

            {/* Sub-Boxes Grid (2 Kolom) */}
            <div className="grid grid-cols-2 gap-3">
              {selectedCategory.subPhases.map((subPhase) => {
                const stats = getSubPhaseStats(subPhase.id);
                const isStageActive =
                  subPhase.defaultStageId === currentStage ||
                  (currentStage === 'Semester 7' && subPhase.id === 'sub-sem-7') ||
                  (currentStage === 'Semester 8' && subPhase.id === 'sub-sem-8') ||
                  (currentStage === 'Semester 1–2' && (subPhase.id === 'sub-sem-1' || subPhase.id === 'sub-sem-2')) ||
                  (currentStage === 'Semester 3–4' && (subPhase.id === 'sub-sem-3' || subPhase.id === 'sub-sem-4')) ||
                  (currentStage === 'Semester 5–6' && (subPhase.id === 'sub-sem-5' || subPhase.id === 'sub-sem-6'));

                return (
                  <motion.div
                    key={subPhase.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedSubPhaseId(subPhase.id)}
                    className="bg-white p-4 rounded-3xl border border-black/[0.05] shadow-xs cursor-pointer hover:border-[#6C5CE7]/30 flex flex-col justify-between min-h-[145px] relative group transition-all"
                  >
                    {/* Top Row: Icon on left, Badge on right */}
                    <div className="flex items-center justify-between">
                      <div
                        style={{ backgroundColor: `${selectedCategory.color}15`, color: selectedCategory.color }}
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                      >
                        {renderCategoryIcon(selectedCategory.iconName, 'w-4 h-4')}
                      </div>

                      {isStageActive ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#3FB876]/15 text-[#3FB876] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#3FB876] animate-pulse" />
                          Sedang Dijalani
                        </span>
                      ) : (
                        <span
                          style={{ backgroundColor: `${selectedCategory.color}15`, color: selectedCategory.color }}
                          className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                        >
                          {subPhase.badge}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="mt-3">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-xs text-[#1A1A2E] leading-snug line-clamp-1">
                          {subPhase.title}
                        </h3>
                      </div>
                      <p className="text-[10px] text-[#6B7280] line-clamp-2 mt-0.5 leading-relaxed">
                        {subPhase.description}
                      </p>

                      {/* Bottom progress bar */}
                      <div className="mt-2.5 pt-2 border-t border-black/[0.04] flex items-center justify-between text-[10px] text-[#6B7280]">
                        <span className="font-medium">{stats.completed}/{stats.total} Selesai</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#6B7280] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ================= LEVEL 3: DETAIL STEP-BY-STEP ROADMAP ================= */}
        {selectedCategoryId && selectedSubPhaseId && selectedCategory && selectedSubPhase && (
          <motion.div
            key="level-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Back Button to Level 2 */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setSelectedSubPhaseId(null)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6C5CE7] bg-white px-3.5 py-2 rounded-full border border-black/[0.05] shadow-xs hover:bg-[#6C5CE7]/5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke {selectedCategory.title}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedSubPhaseId(null);
                  setSelectedCategoryId(null);
                }}
                className="text-[11px] font-semibold text-[#6B7280] hover:text-[#1A1A2E] underline"
              >
                Menu Utama
              </button>
            </div>

            {/* Sub-Phase Detail Hero */}
            <div className="bg-white p-5 rounded-3xl border border-black/[0.05] shadow-xs mb-4">
              <div className="flex items-center justify-between mb-2">
                <span
                  style={{ backgroundColor: `${selectedCategory.color}15`, color: selectedCategory.color }}
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                >
                  {selectedSubPhase.badge}
                </span>

                {/* Interactive "Jadikan Fase Aktif" or "Sedang Dijalani" toggle */}
                {selectedSubPhase.defaultStageId && selectedSubPhase.defaultStageId !== currentStage ? (
                  <button
                    type="button"
                    onClick={() => onSetCurrentStage(selectedSubPhase.defaultStageId as LifeStage)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6C5CE7] bg-[#6C5CE7]/10 hover:bg-[#6C5CE7] hover:text-white px-3 py-1.5 rounded-full transition-all active:scale-95 cursor-pointer shadow-2xs"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>+ Jadikan Fase Aktif</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsStageSelectorOpen(true)}
                    className="text-[11px] font-bold text-[#3FB876] bg-[#3FB876]/10 hover:bg-[#3FB876]/20 px-3 py-1.5 rounded-full flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                    title="Klik untuk mengubah fase aktif"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Sedang Dijalani</span>
                    <ChevronDown className="w-3 h-3 text-[#3FB876]" />
                  </button>
                )}
              </div>

              <h2 className="text-lg font-bold text-[#1A1A2E] mb-1">{selectedSubPhase.title}</h2>
              <p className="text-xs text-[#6B7280] leading-relaxed mb-4">{selectedSubPhase.description}</p>

              {/* Progress Bar & Stats */}
              {(() => {
                const stats = getSubPhaseStats(selectedSubPhase.id);
                return (
                  <div className="bg-[#F5F5F9] p-3 rounded-2xl">
                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                      <span className="text-[#1A1A2E]">Capaian Langkah</span>
                      <span className="text-[#6C5CE7]">{stats.completed} dari {stats.total} Selesai ({stats.percent}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-black/[0.08] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${stats.percent}%`, backgroundColor: selectedCategory.color }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Checklist of Steps */}
            <div className="mb-3 px-1 flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#1A1A2E] uppercase tracking-wider">
                Daftar Langkah Konkret (Checklist)
              </h3>
              <span className="text-[11px] text-[#6B7280]">
                {milestones.filter((m) => m.subPhaseId === selectedSubPhase.id).length} Langkah
              </span>
            </div>

            <div className="space-y-3">
              {milestones
                .filter((m) => m.subPhaseId === selectedSubPhase.id)
                .map((milestone) => {
                  const badge = getGoalCategoryBadge(milestone.category);
                  const isJustConverted = justConvertedId === milestone.id;

                  return (
                    <div
                      key={milestone.id}
                      className={`bg-white p-4 rounded-3xl border transition-all ${
                        milestone.completed
                          ? 'border-[#3FB876]/30 bg-[#3FB876]/[0.02]'
                          : 'border-black/[0.05] hover:border-[#6C5CE7]/30'
                      } shadow-xs`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Interactive Checkbox */}
                        <button
                          type="button"
                          onClick={() => onToggleMilestone(milestone.id)}
                          className="mt-0.5 shrink-0 focus:outline-none cursor-pointer"
                        >
                          {milestone.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-[#3FB876] fill-[#3FB876]/10 stroke-[2.5]" />
                          ) : (
                            <Circle className="w-5 h-5 text-[#6B7280]/40 hover:text-[#6C5CE7] stroke-[2]" />
                          )}
                        </button>

                        {/* Title & Description */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${badge.color}`}
                            >
                              {badge.icon}
                              <span>{badge.label}</span>
                            </span>
                          </div>

                          <h4
                            className={`text-xs font-bold leading-snug transition-all ${
                              milestone.completed
                                ? 'line-through text-[#6B7280]'
                                : 'text-[#1A1A2E]'
                            }`}
                          >
                            {milestone.title}
                          </h4>

                          <p className="text-[11px] text-[#6B7280] mt-1 leading-relaxed">
                            {milestone.description}
                          </p>

                          {/* Action Button: Convert to Daily Goal */}
                          <div className="mt-3 pt-2.5 border-t border-black/[0.04] flex items-center justify-between">
                            <span className="text-[10px] text-[#6B7280]">
                              {milestone.completed ? 'Status: Selesai' : 'Siap dikerjakan'}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleConvertGoal(milestone)}
                              disabled={milestone.completed}
                              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full transition-all ${
                                isJustConverted
                                  ? 'bg-[#3FB876] text-white'
                                  : milestone.completed
                                  ? 'opacity-40 cursor-not-allowed bg-black/5 text-[#6B7280]'
                                  : 'bg-[#6C5CE7]/10 hover:bg-[#6C5CE7] text-[#6C5CE7] hover:text-white'
                              }`}
                            >
                              {isJustConverted ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Ditambahkan!</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3 h-3" />
                                  <span>+ Jadikan Target</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= INTERACTIVE STAGE SELECTOR MODAL / BOTTOM SHEET ================= */}
      <AnimatePresence>
        {isStageSelectorOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-black/[0.05] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-[#6C5CE7] text-white flex items-center justify-center shadow-xs">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#1A1A2E]">Pilih Fase Aktif Kamu</h2>
                    <p className="text-[11px] text-[#6B7280]">
                      Menyesuaikan saran AI, roadmap, dan target harian
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsStageSelectorOpen(false)}
                  className="p-2 text-[#6B7280] hover:text-[#1A1A2E] rounded-full hover:bg-black/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body: List of Life Stages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {STAGE_OPTIONS.map((opt) => {
                  const isCurrent = opt.stage === currentStage;

                  return (
                    <motion.div
                      key={opt.stage}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        onSetCurrentStage(opt.stage);
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                        isCurrent
                          ? 'border-[#6C5CE7] bg-[#6C5CE7]/[0.06] shadow-xs ring-2 ring-[#6C5CE7]/20'
                          : 'border-black/[0.06] bg-white hover:border-[#6C5CE7]/40 hover:bg-[#F5F5F9]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              style={{ backgroundColor: `${opt.color}18`, color: opt.color }}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            >
                              {opt.categoryLabel}
                            </span>

                            {isCurrent && (
                              <span className="text-[10px] font-bold bg-[#3FB876] text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                                Sedang Dijalani
                              </span>
                            )}
                          </div>

                          <h3 className="text-xs font-bold text-[#1A1A2E]">{opt.title}</h3>
                          <p className="text-[11px] text-[#6B7280] mt-0.5 leading-relaxed">
                            {opt.desc}
                          </p>
                        </div>

                        {/* Radio or check circle */}
                        <div className="mt-1 shrink-0">
                          {isCurrent ? (
                            <div className="w-5 h-5 rounded-full bg-[#6C5CE7] text-white flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-black/[0.15] hover:border-[#6C5CE7]" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="p-3 bg-[#F5F5F9] border-t border-black/[0.05] flex gap-2">
                <button
                  type="button"
                  onClick={() => jumpToStageRoadmap(currentStage)}
                  className="flex-1 py-2.5 px-4 bg-[#6C5CE7] hover:bg-[#5b4bc4] text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Buka Roadmap Fase Ini</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsStageSelectorOpen(false)}
                  className="py-2.5 px-4 bg-white border border-black/[0.08] hover:bg-black/5 text-[#1A1A2E] rounded-full text-xs font-bold transition-colors"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
