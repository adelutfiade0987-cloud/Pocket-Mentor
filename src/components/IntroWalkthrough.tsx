import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  Milestone,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Volume2,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface IntroWalkthroughProps {
  onFinish: () => void;
}

interface Slide {
  id: number;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  highlightText: string;
  iconBg: string;
  icon: React.ReactNode;
  previewCard: React.ReactNode;
}

export const IntroWalkthrough: React.FC<IntroWalkthroughProps> = ({ onFinish }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    {
      id: 0,
      badge: 'Fase Transisi Hidup',
      badgeColor: 'bg-[#6C5CE7]/10 text-[#6C5CE7]',
      title: 'Mentor yang Mengerti Fase Hidupmu',
      subtitle:
        'Bukan aplikasi produktivitas umum. PocketMentor dirancang khusus untuk kamu yang lagi menavigasi transisi dari SMA, semester demi semester kuliah, sampai awal karier.',
      highlightText: 'Saran yang relevan dengan skripsi, magang, dan realitasmu.',
      iconBg: 'bg-[#6C5CE7]',
      icon: <Compass className="w-10 h-10 text-white stroke-[2.2]" />,
      previewCard: (
        <div className="bg-[#6C5CE7] text-white p-4 rounded-3xl shadow-lg shadow-[#6C5CE7]/25 w-full max-w-[280px] mx-auto text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
              Semester 7 • Skripsi
            </span>
            <Sparkles className="w-4 h-4 text-white/80" />
          </div>
          <h4 className="text-xs font-bold leading-snug">Pacing 500 Kata per Hari</h4>
          <p className="text-[11px] text-white/80 mt-1 line-clamp-2">
            "Konsistensi harian mengalahkan maraton seminggu sebelum deadline sidang."
          </p>
        </div>
      ),
    },
    {
      id: 1,
      badge: 'Roadmap & Target 1%',
      badgeColor: 'bg-[#FA5A50]/10 text-[#FA5A50]',
      title: 'Ubah Cita-Cita Jadi Aksi Nyata Harian',
      subtitle:
        'Peta jalan hidup dari lulus SMA hingga dunia kerja profesional. Cukup 1-tap untuk mengubah tonggak besar roadmap menjadi target harian yang bisa kamu centang.',
      highlightText: 'Tonggak roadmap otomatis tercentang saat target selesai.',
      iconBg: 'bg-[#FA5A50]',
      icon: <Milestone className="w-10 h-10 text-white stroke-[2.2]" />,
      previewCard: (
        <div className="bg-white border border-black/[0.08] p-4 rounded-3xl shadow-sm w-full max-w-[280px] mx-auto text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#FA5A50] bg-[#FA5A50]/10 px-2 py-0.5 rounded-full">
              Milestone → Goal
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#3FB876]" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#3FB876] text-white flex items-center justify-center text-[10px] font-bold">
              ✓
            </div>
            <span className="text-xs font-bold text-[#1A1A2E] line-through">
              Submit Draft Bab 2 Skripsi
            </span>
          </div>
          <p className="text-[10px] text-[#6B7280]">
            Streak 7 hari konsisten berturut-turut 🔥
          </p>
        </div>
      ),
    },
    {
      id: 2,
      badge: 'Diskusi & Refleksi Suara',
      badgeColor: 'bg-[#FFB020]/10 text-[#FFB020]',
      title: 'Teman Bicara Tanpa Perlu Janji Temu',
      subtitle:
        'Curhat kesulitan belajar, bimbingan CV, atau dengarkan narasi cerita pembangkit semangat lewat suara AI yang hangat dan ekspresif. Selalu ada di sakumu kapan pun kamu butuh.',
      highlightText: 'Dilengkapi narasi audio AI dan studio analisis foto meja belajar.',
      iconBg: 'bg-[#FFB020]',
      icon: <Volume2 className="w-10 h-10 text-[#1A1A2E] stroke-[2.2]" />,
      previewCard: (
        <div className="bg-[#FFB020] text-[#1A1A2E] p-4 rounded-3xl shadow-md w-full max-w-[280px] mx-auto text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold bg-black/10 px-2 py-0.5 rounded-full">
              AI Voice & Vision
            </span>
            <Volume2 className="w-4 h-4 text-[#1A1A2E]" />
          </div>
          <p className="text-xs font-semibold leading-relaxed">
            "Tenang, kamu nggak tertinggal. Setiap orang punya garis waktu masing-masing. Fokus ke langkah hari ini ya!"
          </p>
        </div>
      ),
    },
    {
      id: 3,
      badge: 'Personalisasi Akun',
      badgeColor: 'bg-[#3FB876]/10 text-[#3FB876]',
      title: 'Data & Privasi Sepenuhnya Milikmu',
      subtitle:
        'Catatan jurnal rahasia, rencana finansial 50/30/20, dan target hidupmu tersimpan aman dalam akun pribadimu. Bebas diakses kapan saja tanpa biaya per sesi.',
      highlightText: 'Mulai dengan kuesioner singkat untuk menyesuaikan tokomu.',
      iconBg: 'bg-[#3FB876]',
      icon: <ShieldCheck className="w-10 h-10 text-white stroke-[2.2]" />,
      previewCard: (
        <div className="bg-[#3FB876] text-white p-4 rounded-3xl shadow-lg shadow-[#3FB876]/25 w-full max-w-[280px] mx-auto text-left space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
              Profil Terpersonalisasi
            </span>
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          <h4 className="text-xs font-bold">Siap Menemani Perjalananmu</h4>
          <p className="text-[10px] text-white/85">
            Disesuaikan dengan jurusan, minat, dan target karier impianmu.
          </p>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((s) => s + 1);
    } else {
      onFinish();
    }
  };

  const handleSkip = () => {
    onFinish();
  };

  const activeSlide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-[#F5F5F9] flex flex-col justify-between p-6 max-w-md mx-auto select-none">
      {/* Top Header: Brand Wordmark & Lewati Button */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#6C5CE7] text-white flex items-center justify-center shadow-xs">
            <Compass className="w-4 h-4 stroke-[2.4]" />
          </div>
          <span className="text-base font-bold tracking-tight text-[#1A1A2E]">
            PocketMentor
          </span>
        </div>

        <button
          type="button"
          onClick={handleSkip}
          className="text-xs font-semibold text-[#6B7280] hover:text-[#1A1A2E] px-3 py-1.5 rounded-full hover:bg-black/5 transition-colors"
        >
          Lewati
        </button>
      </div>

      {/* Main Slide Carousel Area */}
      <div className="my-auto py-4 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            {/* Visual Icon Anchor */}
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 20 }}
              className={`w-20 h-20 rounded-3xl ${activeSlide.iconBg} flex items-center justify-center shadow-xl mb-5`}
            >
              {activeSlide.icon}
            </motion.div>

            {/* Interactive Preview Mockup Card */}
            <div className="mb-6 w-full flex justify-center">
              {activeSlide.previewCard}
            </div>

            {/* Badge Pill */}
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block ${activeSlide.badgeColor}`}
            >
              {activeSlide.badge}
            </span>

            {/* Title */}
            <h2 className="text-2xl font-bold tracking-tight text-[#1A1A2E] mb-2 px-2 leading-snug">
              {activeSlide.title}
            </h2>

            {/* Subtitle */}
            <p className="text-xs text-[#6B7280] leading-relaxed max-w-xs mb-2">
              {activeSlide.subtitle}
            </p>

            {/* Highlight line */}
            <p className="text-[11px] font-semibold text-[#6C5CE7]">
              {activeSlide.highlightText}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls: Dot Indicators & Action Button */}
      <div className="pb-4 space-y-4">
        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === idx
                  ? 'w-7 bg-[#6C5CE7]'
                  : 'w-2 bg-black/[0.15] hover:bg-black/30'
              }`}
              aria-label={`Ke slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Primary Action Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleNext}
          className="w-full h-14 rounded-full bg-[#6C5CE7] hover:bg-[#5b4bc7] text-white font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#6C5CE7]/30 transition-all"
        >
          <span>
            {currentSlide === slides.length - 1 ? 'Mulai Sekarang' : 'Lanjut'}
          </span>
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
};
