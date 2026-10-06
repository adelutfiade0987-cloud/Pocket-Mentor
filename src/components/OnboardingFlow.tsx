import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Sparkles, Compass } from 'lucide-react';
import { UserProfile, LifeStage } from '../types';

interface OnboardingFlowProps {
  initialName?: string;
  onComplete: (profile: Partial<UserProfile>) => void;
}

const COMMON_CITIES = ['Jakarta', 'Bandung', 'Yogyakarta', 'Surabaya', 'Semarang', 'Malang', 'Medan', 'Denpasar'];

const COMMON_INTERESTS = [
  'Penulisan & Content',
  'UI/UX & Desain Grafis',
  'Software & AI Tools',
  'Digital Marketing',
  'Bisnis & Kewirausahaan',
  'Riset & Akademik',
  'Sosial & Komunitas',
  'Fotografi / Video',
];

const FOCUS_CHIPS = [
  'Career & job prep',
  'Daily habits & goals',
  'Journaling & reflection',
  'Money management',
  'Content creation / personal brand',
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ initialName = 'Teman Baru', onComplete }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 10;
  const [curtainActive, setCurtainActive] = useState(false);

  // Form State
  const [name, setName] = useState(initialName);
  const [origin, setOrigin] = useState('Bandung');
  const [stage, setStage] = useState<LifeStage>('Semester 7');
  const [collegeSemester, setCollegeSemester] = useState<number>(7);
  const [major, setMajor] = useState('Ilmu Komunikasi');
  const [currentRole, setCurrentRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [interests, setInterests] = useState<string[]>(['Penulisan & Content', 'Digital Marketing']);
  const [customInterest, setCustomInterest] = useState('');
  const [careerDirection, setCareerDirection] = useState('Creative Strategist di Startup');
  const [desiredContribution, setDesiredContribution] = useState('Dibutuhkan sebagai problem solver kreatif yang solutif');
  const [targetDestination, setTargetDestination] = useState('Jakarta / Remote');
  const [focusAreas, setFocusAreas] = useState<string[]>([
    'Career & job prep',
    'Daily habits & goals',
    'Journaling & reflection',
  ]);

  const toggleInterest = (item: string) => {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !interests.includes(customInterest.trim())) {
      setInterests((prev) => [...prev, customInterest.trim()]);
      setCustomInterest('');
    }
  };

  const toggleFocusArea = (item: string) => {
    setFocusAreas((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep((s) => s + 1);
    } else {
      // Step 10: Ready -> trigger curtain wash transition into Home
      setCurtainActive(true);
      setTimeout(() => {
        onComplete({
          name: name.trim() || 'Teman Belajar',
          origin,
          stage,
          collegeSemester: stage.includes('Semester') ? collegeSemester : undefined,
          major: stage.includes('Semester') ? major : undefined,
          currentRole: stage === 'Already working' ? currentRole : undefined,
          industry: stage === 'Already working' ? industry : undefined,
          interests,
          careerDirection,
          desiredContribution,
          targetDestination,
          focusAreas,
          onboarded: true,
        });
      }, 350);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="relative min-h-screen bg-[#F5F5F9] flex flex-col justify-between p-6 max-w-md mx-auto overflow-hidden">
      {/* Curtain wash on finish */}
      <AnimatePresence>
        {curtainActive && (
          <motion.div
            initial={{ scaleY: 0, originY: 1 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 bg-[#6C5CE7]"
          />
        )}
      </AnimatePresence>

      {/* Top Header & Thin Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="p-2 -ml-2 rounded-full text-[#6B7280] hover:text-[#1A1A2E] hover:bg-black/5"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-9" />
          )}

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C5CE7]">
              User Profiling & Assessment
            </span>
            <span className="text-xs font-semibold text-[#6B7280]">
              Langkah {step} dari {totalSteps}
            </span>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="text-xs font-semibold text-[#6C5CE7] hover:underline px-2 py-1"
          >
            {step === totalSteps ? 'Selesai' : 'Lewati'}
          </button>
        </div>

        {/* Thin progress bar */}
        <div className="w-full h-1.5 bg-black/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#6C5CE7] rounded-full"
            initial={{ width: `${((step - 1) / totalSteps) * 100}%` }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ duration: 0.25 }}
          />
        </div>
      </div>

      {/* Step Content Area */}
      <div className="my-auto py-6">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold tracking-tight text-[#1A1A2E]">
                Hai {name}, senang kamu ada di sini.
              </h2>
              <p className="text-sm text-[#6B7280]">
                PocketMentor dirancang untuk jadi teman diskusi yang paham betul fase hidupmu. Mau kita panggil dengan nama apa?
              </p>
              <div className="pt-2">
                <label className="block text-xs font-semibold text-[#1A1A2E] mb-1.5">
                  Nama panggilan kamu
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama kamu..."
                  className="w-full px-4 py-3 bg-white rounded-2xl border border-black/[0.08] text-[#1A1A2E] font-medium focus:outline-none focus:border-[#6C5CE7]"
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold tracking-tight text-[#1A1A2E]">
                Dari mana asal kotamu?
              </h2>
              <p className="text-sm text-[#6B7280]">
                Supaya saran biaya hidup, komunitas, dan realita pasar kerja terasa dekat dengan lokasimu.
              </p>
              <div>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Kota asal kamu (e.g. Bandung, Surabaya)..."
                  className="w-full px-4 py-3 bg-white rounded-2xl border border-black/[0.08] text-[#1A1A2E] font-medium focus:outline-none focus:border-[#6C5CE7] mb-3"
                />
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_CITIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setOrigin(c)}
                      className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                        origin === c
                          ? 'bg-[#6C5CE7] text-white font-medium'
                          : 'bg-white border border-black/[0.06] text-[#6B7280] hover:text-[#1A1A2E]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold tracking-tight text-[#1A1A2E]">
                Sedang di fase mana kamu sekarang?
              </h2>
              <p className="text-sm text-[#6B7280]">
                Setiap fase butuh perhatian berbeda. Pilih yang paling menggambarkan posisimu.
              </p>
              <div className="space-y-2.5 pt-1">
                {[
                  {
                    id: 'High school grad',
                    title: 'Baru lulus SMA / Gap year',
                    desc: 'Fokus eksplorasi skill, portofolio, dan arah karier.',
                    color: 'hover:border-[#FFB020]',
                  },
                  {
                    id: 'Semester 7',
                    title: 'Kuliah (Pilih semester nanti)',
                    desc: 'Menavigasi mata kuliah, organisasi, magang, atau skripsi.',
                    color: 'hover:border-[#6C5CE7]',
                  },
                  {
                    id: 'Already working',
                    title: 'Sudah bekerja / Freelance',
                    desc: 'Fokus finansial, adaptasi kerja, dan jenjang karier.',
                    color: 'hover:border-[#3FB876]',
                  },
                ].map((item) => (
                  <motion.button
                    key={item.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStage(item.id as LifeStage)}
                    className={`w-full p-4 rounded-2xl text-left border transition-all ${
                      stage === item.id
                        ? 'border-[#6C5CE7] bg-white shadow-sm ring-2 ring-[#6C5CE7]/20'
                        : `border-black/[0.06] bg-white ${item.color}`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm text-[#1A1A2E]">{item.title}</h3>
                      {stage === item.id && (
                        <div className="w-5 h-5 rounded-full bg-[#6C5CE7] text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-[#6B7280] mt-1">{item.desc}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step-4"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {stage !== 'Already working' && stage !== 'High school grad' ? (
                <>
                  <h2 className="text-2xl font-bold tracking-tight text-[#1A1A2E]">
                    Semester berapa & jurusan apa?
                  </h2>
                  <p className="text-sm text-[#6B7280]">
                    Pilih semester aktifmu pada timeline di bawah.
                  </p>

                  {/* Connected dot/thread semester picker */}
                  <div className="bg-white p-4 rounded-2xl border border-black/[0.06] my-3">
                    <div className="flex items-center justify-between relative px-2">
                      <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-black/[0.08] -translate-y-1/2 z-0" />
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
                        const isSelected = collegeSemester === sem;
                        const isPassed = collegeSemester > sem;
                        return (
                          <button
                            key={sem}
                            type="button"
                            onClick={() => {
                              setCollegeSemester(sem);
                              if (sem <= 2) setStage('Semester 1–2');
                              else if (sem <= 4) setStage('Semester 3–4');
                              else if (sem <= 6) setStage('Semester 5–6');
                              else if (sem === 7) setStage('Semester 7');
                              else setStage('Semester 8');
                            }}
                            className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-[#6C5CE7] text-white shadow-md shadow-[#6C5CE7]/30 scale-110 ring-4 ring-[#6C5CE7]/15'
                                : isPassed
                                ? 'bg-[#6C5CE7]/20 text-[#6C5CE7]'
                                : 'bg-[#F5F5F9] text-[#6B7280] border border-black/[0.08]'
                            }`}
                          >
                            {sem}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-center text-xs font-semibold text-[#6C5CE7] mt-3">
                      Semester {collegeSemester}{' '}
                      {collegeSemester >= 7
                        ? '• Pacing Skripsi & Persiapan Kerja'
                        : collegeSemester >= 5
                        ? '• Magang & Riset'
                        : '• Fondasi & Eksplorasi'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1A1A2E] mb-1.5">
                      Jurusan / Program Studi
                    </label>
                    <input
                      type="text"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      placeholder="Contoh: Manajemen, Teknik Informatika, DKV..."
                      className="w-full px-4 py-3 bg-white rounded-2xl border border-black/[0.08] text-[#1A1A2E] font-medium focus:outline-none focus:border-[#6C5CE7]"
                    />
                  </div>
                </>
              ) : stage === 'Already working' ? (
                <>
                  <h2 className="text-2xl font-bold tracking-tight text-[#1A1A2E]">
                    Pekerjaan & industri kamu?
                  </h2>
                  <p className="text-sm text-[#6B7280]">
                    Supaya mentor bisa memberi saran yang sesuai dengan konteks peran kerjamu sekarang.
                  </p>
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A2E] mb-1">
                        Posisi / Pekerjaan saat ini
                      </label>
                      <input
                        type="text"
                        value={currentRole}
                        onChange={(e) => setCurrentRole(e.target.value)}
                        placeholder="Contoh: Junior Graphic Designer, Sales Officer, Freelancer..."
                        className="w-full px-4 py-3 bg-white rounded-2xl border border-black/[0.08] text-[#1A1A2E] font-medium focus:outline-none focus:border-[#6C5CE7]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1A1A2E] mb-1">
                        Bidang / Industri
                      </label>
                      <input
                        type="text"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        placeholder="Contoh: FnB, Agensi Digital, Retail, Perbankan..."
                        className="w-full px-4 py-3 bg-white rounded-2xl border border-black/[0.08] text-[#1A1A2E] font-medium focus:outline-none focus:border-[#6C5CE7]"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold tracking-tight text-[#1A1A2E]">
                    Keahlian yang ingin kamu bangun?
                  </h2>
                  <p className="text-sm text-[#6B7280]">
                    Bagi lulusan SMA / gap year, memiliki 1 keahlian digital nyata adalah modal terbesar.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-[#1A1A2E] mb-1.5">
                      Fokus skill utama
                    </label>
                    <input
                      type="text"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      placeholder="Contoh: Video Editing, Digital Marketing, Coding..."
                      className="w-full px-4 py-3 bg-white rounded-2xl border border-black/[0.08] text-[#1A1A2E] font-medium focus:outline-none focus:border-[#6C5CE7]"
                    />
                  </div>
                </>
              )}
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step-5"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold tracking-tight text-[#1A1A2E]">
                Apa yang bikin kamu bersemangat?
              </h2>
              <p className="text-sm text-[#6B7280]">
                Pilih minat atau hobi yang ingin kamu kembangkan lebih jauh.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {COMMON_INTERESTS.map((item) => {
                  const active = interests.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleInterest(item)}
                      className={`text-xs px-3.5 py-2 rounded-2xl transition-all ${
                        active
                          ? 'bg-[#6C5CE7] text-white font-medium shadow-xs'
                          : 'bg-white border border-black/[0.06] text-[#1A1A2E] hover:border-black/20'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 flex gap-2">
                <input
                  type="text"
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomInterest()}
                  placeholder="Minat lainnya..."
                  className="flex-1 px-4 py-2.5 bg-white rounded-2xl border border-black/[0.08] text-xs text-[#1A1A2E] focus:outline-none focus:border-[#6C5CE7]"
                />
                <button
                  type="button"
                  onClick={addCustomInterest}
                  className="px-4 py-2.5 bg-[#6C5CE7] text-white rounded-2xl text-xs font-semibold"
                >
                  Tambah
                </button>
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div
              key="step-6"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold tracking-tight text-[#1A1A2E]">
                Karier impian atau arah tujuanmu?
              </h2>
              <p className="text-sm text-[#6B7280]">
                Gambaran kasar pun sangat membantu — mentor akan menyesuaikan nasihatnya.
              </p>
              <div>
                <input
                  type="text"
                  value={careerDirection}
                  onChange={(e) => setCareerDirection(e.target.value)}
                  placeholder="Contoh: Product Manager di Startup, Bikin Agensi Sendiri, BUMN..."
                  className="w-full px-4 py-3 bg-white rounded-2xl border border-black/[0.08] text-[#1A1A2E] font-medium focus:outline-none focus:border-[#6C5CE7] mb-2.5"
                />
                <div className="flex flex-wrap gap-1.5">
                  {['Startup / Tech', 'Korporat / BUMN', 'Freelance / Bisnis Sendiri', 'Media & Kreator', 'Akademik'].map(
                    (p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setCareerDirection(p)}
                        className="text-xs px-3 py-1 bg-white border border-black/[0.06] rounded-full text-[#6B7280] hover:text-[#1A1A2E]"
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === 7 && (
            <motion.div
              key="step-7"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold tracking-tight text-[#1A1A2E]">
                Kamu mau dibutuhkan sebagai apa?
              </h2>
              <p className="text-sm text-[#6B7280]">
                Bukan cuma titel pekerjaan — saat orang datang kepadamu, masalah apa yang ingin kamu bantu selesaikan?
              </p>
              <div>
                <textarea
                  rows={3}
                  value={desiredContribution}
                  onChange={(e) => setDesiredContribution(e.target.value)}
                  placeholder="Contoh: Orang yang bisa merangkai ide rumit jadi tulisan yang menggugah, atau yang jago menyelesaikan bottleneck teknis..."
                  className="w-full px-4 py-3 bg-white rounded-2xl border border-black/[0.08] text-[#1A1A2E] font-medium focus:outline-none focus:border-[#6C5CE7]"
                />
              </div>
            </motion.div>
          )}

          {step === 8 && (
            <motion.div
              key="step-8"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold tracking-tight text-[#1A1A2E]">
                Ada target tempat kerja atau studi lanjut?
              </h2>
              <p className="text-sm text-[#6B7280]">
                Kota impian, perusahaan impian, atau kampus tujuan (bisa dilewati jika belum pasti).
              </p>
              <div>
                <input
                  type="text"
                  value={targetDestination}
                  onChange={(e) => setTargetDestination(e.target.value)}
                  placeholder="Contoh: Jakarta / Remote, Universitas Indonesia, GoTo, Luar Negeri..."
                  className="w-full px-4 py-3 bg-white rounded-2xl border border-black/[0.08] text-[#1A1A2E] font-medium focus:outline-none focus:border-[#6C5CE7]"
                />
              </div>
            </motion.div>
          )}

          {step === 9 && (
            <motion.div
              key="step-9"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold tracking-tight text-[#1A1A2E]">
                Apa fokus yang paling kamu butuhkan sehari-hari?
              </h2>
              <p className="text-sm text-[#6B7280]">
                Pilih topik panduan harian yang ingin diprioritaskan oleh mentor.
              </p>
              <div className="space-y-2 pt-1">
                {FOCUS_CHIPS.map((chip) => {
                  const active = focusAreas.includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => toggleFocusArea(chip)}
                      className={`w-full p-3.5 rounded-2xl text-left border flex items-center justify-between transition-all ${
                        active
                          ? 'border-[#6C5CE7] bg-white shadow-xs'
                          : 'border-black/[0.06] bg-white hover:border-black/20'
                      }`}
                    >
                      <span className="text-sm font-semibold text-[#1A1A2E]">{chip}</span>
                      {active && (
                        <div className="w-5 h-5 rounded-full bg-[#6C5CE7] text-white flex items-center justify-center animate-check-bounce">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 10 && (
            <motion.div
              key="step-10"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-[#6C5CE7]">
                <Sparkles className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Here's your starting point</span>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-[#1A1A2E]">
                Profil mentormu siap, {name}!
              </h2>

              {/* Animated Summary Card */}
              <div className="bg-[#6C5CE7] text-white p-5 rounded-3xl shadow-lg shadow-[#6C5CE7]/25 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white/80">Fase Saat Ini</span>
                  <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full">
                    {stage}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold">
                    {major ? `${major} • ` : ''}
                    {careerDirection}
                  </h3>
                  <p className="text-xs text-white/80 mt-1 line-clamp-2">
                    "{desiredContribution}"
                  </p>
                </div>

                <div className="pt-2 border-t border-white/15">
                  <p className="text-[11px] text-white/75">Target Pertama Disarankan:</p>
                  <p className="text-xs font-semibold text-white mt-0.5">
                    {stage.includes('Semester 7') || stage.includes('Semester 8')
                      ? 'Tulis 500 kata Bab 2 Skripsi hari ini'
                      : 'Rangkum 1 skill utama yang ingin kamu kuasai'}
                  </p>
                </div>
              </div>

              <p className="text-xs text-center text-[#6B7280]">
                Semua data bisa kamu ubah kapan saja di Pengaturan.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom CTA Button */}
      <div className="pt-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleNext}
          className="w-full h-14 rounded-full bg-[#6C5CE7] text-white font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#6C5CE7]/25 hover:shadow-xl transition-all"
        >
          <span>{step === totalSteps ? 'Masuk ke PocketMentor' : 'Lanjutkan'}</span>
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
};
