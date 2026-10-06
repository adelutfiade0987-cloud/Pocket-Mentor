import { UserProfile, Goal, Milestone, JournalEntry, FinanceData, LifeStage } from '../types';

export const INITIAL_MILESTONES: Milestone[] = [
  // High school grad
  {
    id: 'm-hs-1',
    stageId: 'High school grad',
    title: 'Audit keahlian digital dasar & tools industri',
    description: 'Kuasai 1 tool inti (e.g. Figma, Canva Pro, Excel/Sheets, dasar coding/Notion).',
    category: 'study',
    completed: false,
  },
  {
    id: 'm-hs-2',
    stageId: 'High school grad',
    title: 'Bikin portofolio pertama berisi 2 project nyata',
    description: 'Bisa proyek sukarela untuk UMKM lokal atau studi kasus mandiri.',
    category: 'career',
    completed: false,
  },
  {
    id: 'm-hs-3',
    stageId: 'High school grad',
    title: 'Daftar 1 magang entry-level atau freelance gig',
    description: 'Cari peluang kerja lepas pertama di Glints, Dealls, atau Fastwork.',
    category: 'career',
    completed: false,
  },

  // Semester 1–2
  {
    id: 'm-sem1-1',
    stageId: 'Semester 1–2',
    title: 'Adaptasi gaya belajar kampus & manajemen waktu',
    description: 'Atur sistem kalender mingguan antara kuliah, tugas, dan istirahat.',
    category: 'study',
    completed: true,
  },
  {
    id: 'm-sem1-2',
    stageId: 'Semester 1–2',
    title: 'Gabung 1 organisasi kampus atau komunitas minat',
    description: 'Eksplorasi minat tanpa takut salah jurusan; bangun jejaring teman sebaya.',
    category: 'career',
    completed: true,
  },
  {
    id: 'm-sem1-3',
    stageId: 'Semester 1–2',
    title: 'Baca 2 buku atau artikel riset di luar silabus kuliah',
    description: 'Perluas sudut pandang di luar apa yang cuma diajarkan dosen.',
    category: 'study',
    completed: false,
  },

  // Semester 3–4
  {
    id: 'm-sem3-1',
    stageId: 'Semester 3–4',
    title: 'Kerucutkan fokus ke 1–2 peminatan karier',
    description: 'Pilih spesialisasi yang paling kamu nikmati dan punya prospek pasar riil.',
    category: 'career',
    completed: true,
  },
  {
    id: 'm-sem3-2',
    stageId: 'Semester 3–4',
    title: 'Ikuti lomba karya tulis / hackathon / case competition',
    description: 'Uji kemampuanmu melawan mahasiswa luar kampus untuk mengasah mental.',
    category: 'study',
    completed: false,
  },
  {
    id: 'm-sem3-3',
    stageId: 'Semester 3–4',
    title: 'Publikasikan 1 karya / analisis di LinkedIn atau Medium',
    description: 'Mulai bangun personal brand sejak awal, jangan tunggu lulus baru aktif.',
    category: 'content',
    completed: false,
  },

  // Semester 5–6
  {
    id: 'm-sem5-1',
    stageId: 'Semester 5–6',
    title: 'Amankan magang formal (MSIB / korporat / startup)',
    description: 'Dapatkan pengalaman kerja riil 3-6 bulan sebelum memasuki tahun terakhir.',
    category: 'career',
    completed: false,
  },
  {
    id: 'm-sem5-2',
    stageId: 'Semester 5–6',
    title: 'Mulai riset topik dan dosen pembimbing skripsi',
    description: 'Kumpulkan minimal 10 jurnal referensi terkini untuk proposal skripsi.',
    category: 'study',
    completed: false,
  },
  {
    id: 'm-sem5-3',
    stageId: 'Semester 5–6',
    title: 'Coffee chat / networking dengan 1 praktisi industri',
    description: 'Tanyakan realita kerja harian di industri impianmu.',
    category: 'career',
    completed: false,
  },

  // Semester 7
  {
    id: 'm-sem7-1',
    stageId: 'Semester 7',
    title: 'Tulis dan submit Bab 1–3 proposal skripsi',
    description: 'Pacing konstan: 300–500 kata per hari mengalahkan begadang sebulan.',
    category: 'study',
    completed: false,
  },
  {
    id: 'm-sem7-2',
    stageId: 'Semester 7',
    title: 'Perbarui CV ATS-friendly & portofolio live link',
    description: 'Pastikan bukti hasil kerja terukur dengan angka dan impact nyata.',
    category: 'career',
    completed: false,
  },
  {
    id: 'm-sem7-3',
    stageId: 'Semester 7',
    title: 'Buat target pipeline lamaran kerja / freelance bulanan',
    description: 'Siapkan list 15 perusahaan target dan jadwal pembukaan program MT/graduate.',
    category: 'career',
    completed: false,
  },

  // Semester 8
  {
    id: 'm-sem8-1',
    stageId: 'Semester 8',
    title: 'Selesaikan sidang skripsi & revisi tepat waktu',
    description: 'Tuntaskan beban akademik terakhir untuk membuka fokus penuh ke karier.',
    category: 'study',
    completed: false,
  },
  {
    id: 'm-sem8-2',
    stageId: 'Semester 8',
    title: 'Submit minimal 20 lamaran terkurasi & latihan interview',
    description: 'Kuasai teknik STAR untuk menceritakan pengalaman organisasi dan magang.',
    category: 'career',
    completed: false,
  },
  {
    id: 'm-sem8-3',
    stageId: 'Semester 8',
    title: 'Hitung runway tabungan untuk masa transisi kerja',
    description: 'Pastikan ada dana cukup untuk 2–3 bulan pertama setelah wisuda.',
    category: 'finance',
    completed: false,
  },

  // Already working
  {
    id: 'm-work-1',
    stageId: 'Already working',
    title: 'Bangun dana darurat setara 3 bulan pengeluaran',
    description: 'Fondasi ketenangan pikiran agar tidak panik menghadapi perubahan mendadak.',
    category: 'finance',
    completed: false,
  },
  {
    id: 'm-work-2',
    stageId: 'Already working',
    title: 'Alokasikan 2 jam per minggu untuk upskilling terarah',
    description: 'Pelajari tool baru atau sertifikasi yang membuka peluang promosi/pindah jenjang.',
    category: 'study',
    completed: false,
  },
  {
    id: 'm-work-3',
    stageId: 'Already working',
    title: 'Lakukan evaluasi 6-bulanan kepuasan karier & kompensasi',
    description: 'Pastikan kamu bertumbuh, bukan sekadar terjebak rutinitas.',
    category: 'career',
    completed: false,
  },
];

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'g-1',
    title: 'Tulis 500 kata Bab 2 Skripsi',
    completed: true,
    category: 'study',
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'g-2',
    title: 'Perbarui 1 studi kasus di CV & LinkedIn',
    completed: true,
    category: 'career',
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'g-3',
    title: 'Jalan santai / peregangan 15 menit',
    completed: true,
    category: 'health',
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'g-4',
    title: 'Catat pemasukan & pengeluaran hari ini',
    completed: false,
    category: 'finance',
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'g-5',
    title: 'Riset 3 jurnal acuan metodologi penelitian',
    completed: false,
    category: 'study',
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'g-6',
    title: 'Draft ide postingan edukasi di media sosial',
    completed: false,
    category: 'content',
    date: new Date().toISOString().split('T')[0],
  },
];

export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'j-1',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    prompt: 'Apa satu hal yang berjalan lancar hari ini, dan apa yang bisa kamu syukuri?',
    content: 'Hari ini sempat bimbingan dengan dosen pembimbing. Sempat cemas revisinya banyak, ternyata responsnya positif dan cuma perlu tambahkan data kuantitatif di Bab 3. Lega rasanya ada arah yang jelas.',
    mood: 'great',
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const INITIAL_FINANCE: FinanceData = {
  monthlyIncome: 3500000, // IDR 3.500.000 average allowance / early freelance income
  currency: 'IDR',
  needsPercent: 50,
  wantsPercent: 30,
  savingsPercent: 20,
  emergencyFundTargetMonths: 3,
  emergencyFundCurrent: 2100000,
};

export const ROTATING_PROMPTS = [
  'Apa hal paling bermakna yang kamu selesaikan hari ini?',
  'Apa kekhawatiran terbesar yang lagi ada di kepalamu saat ini?',
  'Kalau hari ini bisa diulang, apa satu keputusan kecil yang ingin kamu ubah?',
  'Siapa orang yang paling membantumu belakangan ini, dan apa yang kamu pelajari dari mereka?',
  'Di bagian mana kamu merasa paling bertumbuh minggu ini?',
  'Apa satu hal sederhana yang membuatmu tersenyum hari ini?',
];

export const DEFAULT_USER: UserProfile = {
  id: 'user_default',
  name: 'Dimas Pratama',
  email: 'dimas.pratama@gmail.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  origin: 'Bandung',
  stage: 'Semester 7',
  collegeSemester: 7,
  major: 'Ilmu Komunikasi & Media Digital',
  currentRole: '',
  industry: 'Media & Tech',
  interests: ['Penulisan Kreatif', 'Desain UI/UX', 'Content Creation', 'Manajemen Waktu'],
  careerDirection: 'Creative Strategist di Startup / Agensi Digital',
  desiredContribution: 'Membantu brand dan kreator menyampaikan cerita yang otentik dan berdampak',
  targetDestination: 'Jakarta / Remote',
  focusAreas: ['Career & job prep', 'Daily habits & goals', 'Journaling & reflection'],
  reminderTime: '20:00',
  bannerNotifications: true,
  onboarded: true,
};

export function getStoredUser(): UserProfile {
  try {
    const raw = localStorage.getItem('pocketmentor_user');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // fallback
  }
  return DEFAULT_USER;
}

export function saveStoredUser(user: UserProfile) {
  localStorage.setItem('pocketmentor_user', JSON.stringify(user));
}

export function getStoredGoals(userId: string): Goal[] {
  try {
    const raw = localStorage.getItem(`pocketmentor_goals_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // fallback
  }
  return INITIAL_GOALS;
}

export function saveStoredGoals(userId: string, goals: Goal[]) {
  localStorage.setItem(`pocketmentor_goals_${userId}`, JSON.stringify(goals));
}

export function getStoredMilestones(userId: string): Milestone[] {
  try {
    const raw = localStorage.getItem(`pocketmentor_milestones_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // fallback
  }
  return INITIAL_MILESTONES;
}

export function saveStoredMilestones(userId: string, milestones: Milestone[]) {
  localStorage.setItem(`pocketmentor_milestones_${userId}`, JSON.stringify(milestones));
}

export function getStoredJournal(userId: string): JournalEntry[] {
  try {
    const raw = localStorage.getItem(`pocketmentor_journal_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // fallback
  }
  return INITIAL_JOURNAL_ENTRIES;
}

export function saveStoredJournal(userId: string, journal: JournalEntry[]) {
  localStorage.setItem(`pocketmentor_journal_${userId}`, JSON.stringify(journal));
}

export function getStoredFinance(userId: string): FinanceData {
  try {
    const raw = localStorage.getItem(`pocketmentor_finance_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // fallback
  }
  return INITIAL_FINANCE;
}

export function saveStoredFinance(userId: string, finance: FinanceData) {
  localStorage.setItem(`pocketmentor_finance_${userId}`, JSON.stringify(finance));
}

export const INITIAL_EVENTS: import('../types').CalendarEvent[] = [
  {
    id: 'ev-1',
    title: 'Bimbingan Bab 2 Skripsi & Metodologi',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Besok
    time: '14:00',
    location: 'Ruang Dosen / Lab Komunikasi',
    urgency: 'penting',
    type: 'skripsi',
    description: 'Siapkan draft Bab 2 dan lembar catatan bimbingan revisi.',
    completed: false,
  },
  {
    id: 'ev-2',
    title: 'Deadline Revisi Proposal Skripsi',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 hari lagi
    time: '23:59',
    location: 'Portal Kampus (SIAKAD)',
    urgency: 'urgent',
    type: 'skripsi',
    description: 'Pastikan format sitasi APA 7th edition dan cek similarity Turnitin.',
    completed: false,
  },
  {
    id: 'ev-3',
    title: 'Kirim Portofolio ke 2 Agensi Digital',
    date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0], // 4 hari lagi
    time: '10:00',
    location: 'Email / LinkedIn InMail',
    urgency: 'karir',
    type: 'magang',
    description: 'Kirim cover letter ringkas beserta live portfolio link Notion.',
    completed: false,
  },
  {
    id: 'ev-4',
    title: 'Tugas Analisis Studi Kasus Media Sosial',
    date: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0], // 6 hari lagi
    time: '17:00',
    location: 'Google Classroom',
    urgency: 'sebentar_lagi',
    type: 'tugas',
    description: 'Analisis kampanye brand lokal dan buat slide ringkasan 5 halaman.',
    completed: false,
  },
  {
    id: 'ev-5',
    title: 'Sidang Seminar Proposal (Sempro)',
    date: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0], // 2 minggu lagi
    time: '09:30',
    location: 'Auditorium Kampus Gedung C',
    urgency: 'masih_lama',
    type: 'ujian',
    description: 'Presentasi 15 menit di hadapan 2 dosen penguji.',
    completed: false,
  },
];

export function getStoredEvents(userId: string): import('../types').CalendarEvent[] {
  try {
    const raw = localStorage.getItem(`pocketmentor_events_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // fallback
  }
  return INITIAL_EVENTS;
}

export function saveStoredEvents(userId: string, events: import('../types').CalendarEvent[]) {
  localStorage.setItem(`pocketmentor_events_${userId}`, JSON.stringify(events));
}

