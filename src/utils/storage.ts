import {
  UserProfile,
  Goal,
  Milestone,
  JournalEntry,
  FinanceData,
  LifeStage,
  GoalCategory,
  CalendarEvent,
  ChatMessage,
} from '../types';
import {
  syncProfileToSupabase,
  syncGoalUpsert,
  syncMilestoneUpsert,
  syncJournalUpsert,
  syncFinanceUpsert,
  syncCalendarEventUpsert,
  syncChatMessageUpsert,
} from './supabase';

export * from './supabase';

export interface RoadmapSubPhase {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  badge: string;
  defaultStageId?: LifeStage | string;
}

export interface RoadmapCategory {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  color: string; // Hex color code
  iconName: 'GraduationCap' | 'Compass' | 'BookOpen' | 'Award' | 'Briefcase' | 'Sparkles';
  subPhases: RoadmapSubPhase[];
}

export const ROADMAP_CATEGORIES: RoadmapCategory[] = [
  {
    id: 'cat-sma',
    title: 'Masa SMA',
    subtitle: 'Eksplorasi minat, pondasi nilai & peminatan jurusan awal',
    badge: '3 Tingkat',
    color: '#6C5CE7',
    iconName: 'GraduationCap',
    subPhases: [
      {
        id: 'sub-sma-1',
        categoryId: 'cat-sma',
        title: 'Kelas 1 SMA',
        description: 'Audit minat belajar, adaptasi SMA & eksplorasi ekstrakurikuler.',
        badge: 'Fase Fondasi',
        defaultStageId: 'High school grad',
      },
      {
        id: 'sub-sma-2',
        categoryId: 'cat-sma',
        title: 'Kelas 2 SMA',
        description: 'Pematangan peminatan, cicil nilai rapor & coba kompetisi.',
        badge: 'Fase Pematangan',
        defaultStageId: 'High school grad',
      },
      {
        id: 'sub-sma-3',
        categoryId: 'cat-sma',
        title: 'Kelas 3 SMA',
        description: 'Simulasi UTBK, finalisasi target kampus & persiapan berkas.',
        badge: 'Fase Ujian Akhir',
        defaultStageId: 'High school grad',
      },
    ],
  },
  {
    id: 'cat-transisi',
    title: 'After SMA / Transisi',
    subtitle: 'Strategi masuk universitas, pemilihan jurusan & gap year terarah',
    badge: '3 Jalur',
    color: '#FA5A50',
    iconName: 'Compass',
    subPhases: [
      {
        id: 'sub-transisi-ujian',
        categoryId: 'cat-transisi',
        title: 'Persiapan Ujian & Jalur Masuk',
        description: 'Bedah passing grade, strategi SNBT/Mandiri & latihan sub-tes.',
        badge: 'Target Lolos',
        defaultStageId: 'High school grad',
      },
      {
        id: 'sub-transisi-kampus',
        categoryId: 'cat-transisi',
        title: 'Memilih Kampus & Jurusan Ideal',
        description: 'Analisis prospek kerja 5 tahun, kalkulasi finansial & tanya alumni.',
        badge: 'Riset Kampus',
        defaultStageId: 'High school grad',
      },
      {
        id: 'sub-transisi-gapyear',
        categoryId: 'cat-transisi',
        title: 'Produktif saat Gap Year',
        description: 'Jadwal belajar harian, skill digital & portofolio mandiri.',
        badge: 'Growth Mindset',
        defaultStageId: 'High school grad',
      },
    ],
  },
  {
    id: 'cat-kuliah',
    title: 'Masa Kuliah',
    subtitle: 'Perjalanan 8 semester dari adaptasi SKS hingga naskah skripsi',
    badge: '8 Semester',
    color: '#FFB020',
    iconName: 'BookOpen',
    subPhases: [
      {
        id: 'sub-sem-1',
        categoryId: 'cat-kuliah',
        title: 'Semester 1',
        description: 'Adaptasi ritme SKS, amankan IPK awal & eksplorasi 1 organisasi.',
        badge: 'Semester 1',
        defaultStageId: 'Semester 1–2',
      },
      {
        id: 'sub-sem-2',
        categoryId: 'cat-kuliah',
        title: 'Semester 2',
        description: 'Stabilisasi akademik, kuasai 1 tools industri & atur budget kos.',
        badge: 'Semester 2',
        defaultStageId: 'Semester 1–2',
      },
      {
        id: 'sub-sem-3',
        categoryId: 'cat-kuliah',
        title: 'Semester 3',
        description: 'Ambil tanggung jawab organisasi, ikuti lomba & bangun LinkedIn.',
        badge: 'Semester 3',
        defaultStageId: 'Semester 3–4',
      },
      {
        id: 'sub-sem-4',
        categoryId: 'cat-kuliah',
        title: 'Semester 4',
        description: 'Jajal freelance pemula, susun portofolio 1 halaman & publikasi karya.',
        badge: 'Semester 4',
        defaultStageId: 'Semester 3–4',
      },
      {
        id: 'sub-sem-5',
        categoryId: 'cat-kuliah',
        title: 'Semester 5',
        description: 'Daftar magang industri MSIB, resume ATS & kumpulkan 10 jurnal skripsi.',
        badge: 'Semester 5',
        defaultStageId: 'Semester 5–6',
      },
      {
        id: 'sub-sem-6',
        categoryId: 'cat-kuliah',
        title: 'Semester 6',
        description: 'Maksimalkan kinerja magang, ajukan dospem & draft Bab 1 proposal.',
        badge: 'Semester 6',
        defaultStageId: 'Semester 5–6',
      },
      {
        id: 'sub-sem-7',
        categoryId: 'cat-kuliah',
        title: 'Semester 7',
        description: 'Lulus seminar proposal (Sempro), tulis 300-500 kata/hari & bidik MT.',
        badge: 'Semester 7',
        defaultStageId: 'Semester 7',
      },
      {
        id: 'sub-sem-8',
        categoryId: 'cat-kuliah',
        title: 'Semester 8',
        description: 'Sidang skripsi, aktif melamar kerja entry-level & persiapan wisuda.',
        badge: 'Semester 8',
        defaultStageId: 'Semester 8',
      },
    ],
  },
  {
    id: 'cat-freshgrad',
    title: 'Fresh Graduate',
    subtitle: 'Bedah CV ATS, strategi job fair, interview & negosiasi kompensasi',
    badge: '3 Pilar',
    color: '#3FB876',
    iconName: 'Award',
    subPhases: [
      {
        id: 'sub-fg-cv',
        categoryId: 'cat-freshgrad',
        title: 'Bedah CV & Portofolio',
        description: '1 lembar ATS-friendly, 3 studi kasus portofolio & audit LinkedIn.',
        badge: 'Branding Diri',
        defaultStageId: 'Semester 8',
      },
      {
        id: 'sub-fg-melamar',
        categoryId: 'cat-freshgrad',
        title: 'Strategi Melamar & Job Fair',
        description: 'Spreadsheet pelacak lamaran, 5-10 lamaran custom/pekan & campus hiring.',
        badge: 'Pipeline Kerja',
        defaultStageId: 'Semester 8',
      },
      {
        id: 'sub-fg-interview',
        categoryId: 'cat-freshgrad',
        title: 'Persiapan Interview & Negosiasi Gaji',
        description: 'Latihan STAR method, riset standar gaji industri & offering negosiasi.',
        badge: 'Interview Ready',
        defaultStageId: 'Already working',
      },
    ],
  },
  {
    id: 'cat-kerja',
    title: 'Dunia Kerja',
    subtitle: 'Lulus probation 90 hari, kelola gaji pertama & percepat kenaikan level',
    badge: '3 Tahap',
    color: '#3B82F6',
    iconName: 'Briefcase',
    subPhases: [
      {
        id: 'sub-kerja-probation',
        categoryId: 'cat-kerja',
        title: 'Adaptasi 90 Hari Pertama / Probation',
        description: 'Pahami KPI atasan, komunikasi tim & review evaluasi 30-60-90 hari.',
        badge: 'Lolos Probation',
        defaultStageId: 'Already working',
      },
      {
        id: 'sub-kerja-gaji',
        categoryId: 'cat-kerja',
        title: 'Manajemen Gaji & Dana Darurat',
        description: 'Aturan 50/30/20, dana darurat 3 bulan & hindari pinjol konsumtif.',
        badge: 'Sehat Finansial',
        defaultStageId: 'Already working',
      },
      {
        id: 'sub-kerja-promosi',
        categoryId: 'cat-kerja',
        title: 'Akselerasi Karier & Promosi',
        description: 'Brag document dampak bisnis, inisiatif project & sertifikasi lanjutan.',
        badge: 'Level Up Karier',
        defaultStageId: 'Already working',
      },
    ],
  },
  {
    id: 'cat-s2',
    title: 'Lanjut Studi S2',
    subtitle: 'Riset kampus impian, skor bahasa, LoA & strategi lolos beasiswa',
    badge: '3 Rute',
    color: '#EC4899',
    iconName: 'Sparkles',
    subPhases: [
      {
        id: 'sub-s2-tujuan',
        categoryId: 'cat-s2',
        title: 'Menentukan Tujuan & Riset Kampus',
        description: 'Tentukan tujuan karier/riset, kurikulum kampus & estimasi biaya.',
        badge: 'Target Kampus',
        defaultStageId: 'Already working',
      },
      {
        id: 'sub-s2-bahasa',
        categoryId: 'cat-s2',
        title: 'Persiapan Bahasa & Dokumen LoA',
        description: 'Target IELTS/TOEFL, Statement of Purpose & 2 surat rekomendasi.',
        badge: 'Kantongi LoA',
        defaultStageId: 'Already working',
      },
      {
        id: 'sub-s2-beasiswa',
        categoryId: 'cat-s2',
        title: 'Berburu Beasiswa Dalam/Luar Negeri',
        description: 'Timeline LPDP/AAS/Chevening, proposal esai kontribusi & mock interview.',
        badge: 'Target Beasiswa',
        defaultStageId: 'Already working',
      },
    ],
  },
];

export const INITIAL_MILESTONES: Milestone[] = [
  // ================= 1. MASA SMA =================
  // Kelas 1 SMA
  {
    id: 'm-sma1-1',
    categoryId: 'cat-sma',
    subPhaseId: 'sub-sma-1',
    stageId: 'High school grad',
    title: 'Audit minat & gaya belajar mandiri',
    description: 'Kenali apakah kamu tipe visual, auditori, atau kinestetik untuk menentukan ritme belajar yang paling efisien.',
    category: 'study',
    completed: true,
  },
  {
    id: 'm-sma1-2',
    categoryId: 'cat-sma',
    subPhaseId: 'sub-sma-1',
    stageId: 'High school grad',
    title: 'Eksplorasi ekstrakurikuler kepemimpinan atau teknologi',
    description: 'Pilih 1 ekskul yang mengasah soft skill atau skill digital sejak dini (OSIS, KIR, Robotik, atau Multimedia).',
    category: 'career',
    completed: true,
  },
  {
    id: 'm-sma1-3',
    categoryId: 'cat-sma',
    subPhaseId: 'sub-sma-1',
    stageId: 'High school grad',
    title: 'Bangun kebiasaan membaca buku non-pelajaran 15 menit/hari',
    description: 'Perluas kosakata dan wawasan umum melalui buku pengembangan diri atau artikel sains/sosial.',
    category: 'study',
    completed: false,
  },
  {
    id: 'm-sma1-4',
    categoryId: 'cat-sma',
    subPhaseId: 'sub-sma-1',
    stageId: 'High school grad',
    title: 'Petakan potensi diri dan topik yang membuatmu bersemangat',
    description: 'Catat aktivitas apa yang membuatmu lupa waktu untuk acuan pemilihan jurusan di masa depan.',
    category: 'health',
    completed: false,
  },

  // Kelas 2 SMA
  {
    id: 'm-sma2-1',
    categoryId: 'cat-sma',
    subPhaseId: 'sub-sma-2',
    stageId: 'High school grad',
    title: 'Tentukan fokus peminatan (IPA, IPS, atau Kejuruan) secara mantap',
    description: 'Pilih mata pelajaran peminatan yang linear dengan rencana program studi impian di perguruan tinggi.',
    category: 'study',
    completed: true,
  },
  {
    id: 'm-sma2-2',
    categoryId: 'cat-sma',
    subPhaseId: 'sub-sma-2',
    stageId: 'High school grad',
    title: 'Cicil nilai rapor semester 1–4 untuk jalur prestasi (SNBP)',
    description: 'Jaga tren grafik nilai mata pelajaran utama agar selalu stabil atau meningkat tiap semester.',
    category: 'study',
    completed: false,
  },
  {
    id: 'm-sma2-3',
    categoryId: 'cat-sma',
    subPhaseId: 'sub-sma-2',
    stageId: 'High school grad',
    title: 'Ikuti 1 kompetisi akademik atau karya inovasi tingkat kota/provinsi',
    description: 'Sertifikat kejuaraan resmi sangat bernilai untuk bobot portofolio seleksi nasional.',
    category: 'career',
    completed: false,
  },
  {
    id: 'm-sma2-4',
    categoryId: 'cat-sma',
    subPhaseId: 'sub-sma-2',
    stageId: 'High school grad',
    title: 'Buat daftar awal 5 universitas dan jurusan potensial',
    description: 'Bandingkan mata kuliah yang diajarkan, akreditasi, dan daya tampung tiap jurusan.',
    category: 'study',
    completed: false,
  },

  // Kelas 3 SMA
  {
    id: 'm-sma3-1',
    categoryId: 'cat-sma',
    subPhaseId: 'sub-sma-3',
    stageId: 'High school grad',
    title: 'Simulasi latihan soal UTBK-SNBT rutin tiap minggu',
    description: 'Fokus pada penalaran umum, literasi bahasa, dan penalaran matematika dengan batas waktu ketat.',
    category: 'study',
    completed: false,
  },
  {
    id: 'm-sma3-2',
    categoryId: 'cat-sma',
    subPhaseId: 'sub-sma-3',
    stageId: 'High school grad',
    title: 'Finalisasi pilihan jurusan prioritas & kampus cadangan',
    description: 'Terapkan strategi rasional: Pilihan 1 impian tinggi, Pilihan 2 aman sesuai passing grade tryout.',
    category: 'study',
    completed: false,
  },
  {
    id: 'm-sma3-3',
    categoryId: 'cat-sma',
    subPhaseId: 'sub-sma-3',
    stageId: 'High school grad',
    title: 'Siapkan berkas portofolio atau pendaftaran KIP-Kuliah',
    description: 'Lengkapi dokumen administrasi resmi, data penghasilan orang tua, atau karya portofolio sebelum batas akhir.',
    category: 'finance',
    completed: false,
  },
  {
    id: 'm-sma3-4',
    categoryId: 'cat-sma',
    subPhaseId: 'sub-sma-3',
    stageId: 'High school grad',
    title: 'Manajemen stres dan jaga pola istirahat jelang ujian',
    description: 'Tidur cukup 7 jam sehari dan hindari belajar sistem kebut semalam yang menurunkan fokus mental.',
    category: 'health',
    completed: false,
  },

  // ================= 2. AFTER SMA / TRANSISI =================
  // Persiapan Ujian & Jalur Masuk
  {
    id: 'm-tr1-1',
    categoryId: 'cat-transisi',
    subPhaseId: 'sub-transisi-ujian',
    stageId: 'High school grad',
    title: 'Bedah passing grade & rasio keketatan jurusan target',
    description: 'Ketahui perbandingan jumlah pendaftar vs kuota kursi agar tidak menembak target secara buta.',
    category: 'study',
    completed: false,
  },
  {
    id: 'm-tr1-2',
    categoryId: 'cat-transisi',
    subPhaseId: 'sub-transisi-ujian',
    stageId: 'High school grad',
    title: 'Ikuti tryout berkala & evaluasi kelemahan sub-tes',
    description: 'Identifikasi materi apa yang skornya sering drop, lalu buat sesi latihan khusus penguatan.',
    category: 'study',
    completed: false,
  },
  {
    id: 'm-tr1-3',
    categoryId: 'cat-transisi',
    subPhaseId: 'sub-transisi-ujian',
    stageId: 'High school grad',
    title: 'Siapkan strategi jalur mandiri & beasiswa swasta sebagai backup',
    description: 'Petakan jadwal tes mandiri PTN atau beasiswa penuh di kampus swasta unggulan.',
    category: 'finance',
    completed: false,
  },
  {
    id: 'm-tr1-4',
    categoryId: 'cat-transisi',
    subPhaseId: 'sub-transisi-ujian',
    stageId: 'High school grad',
    title: 'Latihan manajemen waktu: maksimal 1 menit per soal',
    description: 'Asah insting untuk tidak terjebak pada 1 soal sulit; lewati dan maksimalkan poin di soal lain.',
    category: 'study',
    completed: false,
  },

  // Memilih Kampus & Jurusan Ideal
  {
    id: 'm-tr2-1',
    categoryId: 'cat-transisi',
    subPhaseId: 'sub-transisi-kampus',
    stageId: 'High school grad',
    title: 'Analisis kurikulum & prospek karier 5 tahun ke depan',
    description: 'Pastikan jurusan yang dipilih relevan dengan kebutuhan industri masa depan, bukan tren sesaat.',
    category: 'career',
    completed: false,
  },
  {
    id: 'm-tr2-2',
    categoryId: 'cat-transisi',
    subPhaseId: 'sub-transisi-kampus',
    stageId: 'High school grad',
    title: 'Diskusi jujur dengan keluarga terkait finansial & biaya kos',
    description: 'Hitung estimasi UKT semesteran plus uang saku bulanan agar tidak membebani secara mendadak.',
    category: 'finance',
    completed: false,
  },
  {
    id: 'm-tr2-3',
    categoryId: 'cat-transisi',
    subPhaseId: 'sub-transisi-kampus',
    stageId: 'High school grad',
    title: 'Tanya alumni tentang realitas perkuliahan di kampus target',
    description: 'Dapatkan gambaran nyata tentang budaya kampus, biaya praktikum, dan peluang networking kerja.',
    category: 'career',
    completed: false,
  },
  {
    id: 'm-tr2-4',
    categoryId: 'cat-transisi',
    subPhaseId: 'sub-transisi-kampus',
    stageId: 'High school grad',
    title: 'Tetapkan komitmen belajar tanpa FOMO gengsi nama kampus',
    description: 'Ingat bahwa skill dan portfolio pribadi menentukan masa depan lebih besar daripada sekadar nama almamater.',
    category: 'health',
    completed: false,
  },

  // Produktif saat Gap Year
  {
    id: 'm-tr3-1',
    categoryId: 'cat-transisi',
    subPhaseId: 'sub-transisi-gapyear',
    stageId: 'High school grad',
    title: 'Susun jadwal harian terstruktur seperti jam reguler',
    description: 'Hindari siklus tidur terbalik; bangun jam 6 pagi dan tentukan blok waktu belajar serta istirahat.',
    category: 'health',
    completed: false,
  },
  {
    id: 'm-tr3-2',
    categoryId: 'cat-transisi',
    subPhaseId: 'sub-transisi-gapyear',
    stageId: 'High school grad',
    title: 'Kuasai 1 skill digital inti (Copywriting, Figma, Coding, Excel)',
    description: 'Selesaikan sertifikasi kursus gratis atau terjangkau untuk bekal portofolio kerja lepas.',
    category: 'study',
    completed: false,
  },
  {
    id: 'm-tr3-3',
    categoryId: 'cat-transisi',
    subPhaseId: 'sub-transisi-gapyear',
    stageId: 'High school grad',
    title: 'Bangun portofolio proyek mandiri atau bantu UMKM lokal',
    description: 'Tunjukkan bukti nyata bahwa kamu memanfaatkan masa jeda untuk berkontribusi positif.',
    category: 'career',
    completed: false,
  },
  {
    id: 'm-tr3-4',
    categoryId: 'cat-transisi',
    subPhaseId: 'sub-transisi-gapyear',
    stageId: 'High school grad',
    title: 'Jaga koneksi pertemanan dan hindari isolasi sosial',
    description: 'Ikuti komunitas minat atau relawan untuk menjaga kesehatan mental dan saling menguatkan.',
    category: 'health',
    completed: false,
  },

  // ================= 3. MASA KULIAH =================
  // Semester 1
  {
    id: 'm-s1-1',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-1',
    stageId: 'Semester 1–2',
    title: 'Adaptasi sistem SKS, portal kampus & gaya belajar mandiri',
    description: 'Pahami silabus mata kuliah, bobot penilaian tugas, dan aturan presensi minimal 75-80%.',
    category: 'study',
    completed: true,
  },
  {
    id: 'm-s1-2',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-1',
    stageId: 'Semester 1–2',
    title: 'Targetkan IPK awal > 3.50 sebagai bantalan akademik',
    description: 'Mata kuliah dasar umum (MKDU) semester awal relatif mudah dimaksimalkan untuk modal semester atas.',
    category: 'study',
    completed: true,
  },
  {
    id: 'm-s1-3',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-1',
    stageId: 'Semester 1–2',
    title: 'Eksplorasi 1–2 organisasi kampus atau UKM yang relevan',
    description: 'Fokus pada pembangunan relasi dan soft skill komunikasi tanpa mengambil beban jabatan berat dulu.',
    category: 'career',
    completed: true,
  },
  {
    id: 'm-s1-4',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-1',
    stageId: 'Semester 1–2',
    title: 'Kenali karakter dan bidang keahlian dosen prodi',
    description: 'Catat dosen mana yang aktif di riset atau industri untuk peluang asisten lab atau dospem skripsi kelak.',
    category: 'study',
    completed: false,
  },

  // Semester 2
  {
    id: 'm-s2-1',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-2',
    stageId: 'Semester 1–2',
    title: 'Pertahankan stabilitas IPK & rapikan catatan digital',
    description: 'Gunakan Notion, Obsidian, atau Google Drive dengan folder rapi per mata kuliah.',
    category: 'study',
    completed: true,
  },
  {
    id: 'm-s2-2',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-2',
    stageId: 'Semester 1–2',
    title: 'Perluas relasi lintas jurusan & networking kakak tingkat',
    description: 'Dapatkan bank soal ujian tahun lalu dan tips menghadapi dosen dari senior terpercaya.',
    category: 'career',
    completed: true,
  },
  {
    id: 'm-s2-3',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-2',
    stageId: 'Semester 1–2',
    title: 'Kuasai 1 software/tools industri spesifik jurusannmu',
    description: 'Bisa Figma, Canva Pro, SPSS, R, AutoCAD, atau dasar Python sesuai peminatan.',
    category: 'study',
    completed: false,
  },
  {
    id: 'm-s2-4',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-2',
    stageId: 'Semester 1–2',
    title: 'Buat sistem anggaran bulanan anak kos & dana darurat awal',
    description: 'Terapkan rumus 50/30/20 dan sisihkan minimal Rp 100.000/bulan untuk kebiasaan menabung.',
    category: 'finance',
    completed: false,
  },

  // Semester 3
  {
    id: 'm-s3-1',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-3',
    stageId: 'Semester 3–4',
    title: 'Ambil peran kepanitiaan / divisi inti di organisasi',
    description: 'Latih kemampuan memimpin rapat, manajemen waktu, dan problem solving tim nyata.',
    category: 'career',
    completed: true,
  },
  {
    id: 'm-s3-2',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-3',
    stageId: 'Semester 3–4',
    title: 'Ikuti Program Kreativitas Mahasiswa (PKM) atau lomba case study',
    description: 'Uji kemampuan menulis ilmiah atau berpikir analitis dalam kompetisi skala nasional.',
    category: 'study',
    completed: false,
  },
  {
    id: 'm-s3-3',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-3',
    stageId: 'Semester 3–4',
    title: 'Buat profil LinkedIn profesional dengan headline terarah',
    description: 'Tuliskan status studi, minat karier spesifik, dan pengalaman organisasi dengan ringkas.',
    category: 'career',
    completed: false,
  },
  {
    id: 'm-s3-4',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-3',
    stageId: 'Semester 3–4',
    title: 'Rancang 1 proyek mandiri sebagai Proof of Work awal',
    description: 'Ubah tugas kuliah menjadi studi kasus menarik atau portfolio publik yang bisa diakses siapa saja.',
    category: 'content',
    completed: false,
  },

  // Semester 4
  {
    id: 'm-s4-1',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-4',
    stageId: 'Semester 3–4',
    title: 'Jajal freelance pemula atau magang paruh waktu',
    description: 'Cari peluang kerja lepas di Fastwork, Sribulancer, atau proyek dosen untuk menguji skill riil.',
    category: 'career',
    completed: false,
  },
  {
    id: 'm-s4-2',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-4',
    stageId: 'Semester 3–4',
    title: 'Susun portofolio 1 halaman (Website/Notion/PDF)',
    description: 'Tampilkan 2-3 karya terbaik dengan struktur: Masalah, Peranmu, Solusi, dan Dampak yang dihasilkan.',
    category: 'career',
    completed: false,
  },
  {
    id: 'm-s4-3',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-4',
    stageId: 'Semester 3–4',
    title: 'Audit transkrip nilai & rencanakan mata kuliah peminatan',
    description: 'Pastikan tidak ada nilai D/E yang perlu mengulang agar semester atas bisa fokus skripsi dan magang.',
    category: 'study',
    completed: false,
  },
  {
    id: 'm-s4-4',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-4',
    stageId: 'Semester 3–4',
    title: 'Publikasikan tulisan wawasan industri di LinkedIn / Medium',
    description: 'Bangun reputasi digital sejak dini dengan membagikan apa yang sedang kamu pelajari.',
    category: 'content',
    completed: false,
  },

  // Semester 5
  {
    id: 'm-s5-1',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-5',
    stageId: 'Semester 5–6',
    title: 'Daftar program magang formal MSIB Kampus Merdeka / Korporat',
    description: 'Siapkan berkas SPTJM, surat rekomendasi prodi, dan CV ATS sebelum pembukaan pendaftaran.',
    category: 'career',
    completed: false,
  },
  {
    id: 'm-s5-2',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-5',
    stageId: 'Semester 5–6',
    title: 'Perbarui resume ATS-friendly dengan metode STAR',
    description: 'Gunakan metrik terukur (misal: "meningkatkan keterlibatan 30%", "membuat 12 materi grafis").',
    category: 'career',
    completed: false,
  },
  {
    id: 'm-s5-3',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-5',
    stageId: 'Semester 5–6',
    title: 'Kumpulkan 10 jurnal referensi acuan topik skripsi',
    description: 'Cari celah penelitian (research gap) pada jurnal nasional terindeks SINTA 2 atau Scopus.',
    category: 'study',
    completed: false,
  },
  {
    id: 'm-s5-4',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-5',
    stageId: 'Semester 5–6',
    title: 'Latihan simulasi wawancara user & technical test',
    description: 'Biasakan menjawab pertanyaan seputar studi kasus industri dengan runtut dan percaya diri.',
    category: 'career',
    completed: false,
  },

  // Semester 6
  {
    id: 'm-s6-1',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-6',
    stageId: 'Semester 5–6',
    title: 'Jalani magang dengan performa maksimal & bangun relasi',
    description: 'Jangan cuma menyelesaikan tugas; proaktif tanyakan feedback mingguan kepada mentor kantor.',
    category: 'career',
    completed: false,
  },
  {
    id: 'm-s6-2',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-6',
    stageId: 'Semester 5–6',
    title: 'Finalisasi usulan topik skripsi & ajukan calon dospem',
    description: 'Pilih dosen yang keahliannya sejalan dan memiliki reputasi komunikatif saat membimbing.',
    category: 'study',
    completed: false,
  },
  {
    id: 'm-s6-3',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-6',
    stageId: 'Semester 5–6',
    title: 'Susun draft Bab 1 proposal skripsi (Latar Belakang Masalah)',
    description: 'Dukung argumen dengan data statistik dan fenomena riil terbaru.',
    category: 'study',
    completed: false,
  },
  {
    id: 'm-s6-4',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-6',
    stageId: 'Semester 5–6',
    title: 'Minta surat rekomendasi / endorsement LinkedIn dari atasan magang',
    description: 'Bukti pengakuan dari praktisi industri sangat mendongkrak kredibilitas profilmu.',
    category: 'career',
    completed: false,
  },

  // Semester 7
  {
    id: 'm-s7-1',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-7',
    stageId: 'Semester 7',
    title: 'Selesaikan Bab 1–3 & lalui Seminar Proposal (Sempro)',
    description: 'Tuntaskan naskah bab metodologi penelitian dan revisi segera catatan dosen penguji.',
    category: 'study',
    completed: false,
  },
  {
    id: 'm-s7-2',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-7',
    stageId: 'Semester 7',
    title: 'Terapkan pacing: tulis minimal 300–500 kata skripsi/hari',
    description: 'Konsistensi harian mengalahkan begadang sebulan yang merusak fokus dan kesehatan.',
    category: 'study',
    completed: false,
  },
  {
    id: 'm-s7-3',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-7',
    stageId: 'Semester 7',
    title: 'Petakan target perusahaan untuk Management Trainee / Graduate Program',
    description: 'Catat kalender pembukaan MT di perbankan, FMCG, telco, dan startup teknologi.',
    category: 'career',
    completed: false,
  },
  {
    id: 'm-s7-4',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-7',
    stageId: 'Semester 7',
    title: 'Ikuti sesi mentoring atau review karier bersama praktisi',
    description: 'Mintalah sudut pandang objektif mengenai posisi yang paling cocok dengan kekuatan profilmu.',
    category: 'career',
    completed: false,
  },

  // Semester 8
  {
    id: 'm-s8-1',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-8',
    stageId: 'Semester 8',
    title: 'Rampungkan analisis data & submit naskah sidang skripsi',
    description: 'Pastikan lolos uji Turnitin/similarity di bawah batas maksimal prodi (biasanya < 20-25%).',
    category: 'study',
    completed: false,
  },
  {
    id: 'm-s8-2',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-8',
    stageId: 'Semester 8',
    title: 'Simulasi presentasi sidang skripsi di hadapan teman',
    description: 'Kuasai keterbatasan penelitian dan siapkan jawaban untuk pertanyaan metodologi yang krusial.',
    category: 'study',
    completed: false,
  },
  {
    id: 'm-s8-3',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-8',
    stageId: 'Semester 8',
    title: 'Aktif melamar lowongan kerja entry-level 2–3 bulan sebelum wisuda',
    description: 'Targetkan sudah memegang offering letter saat toga kelulusan dipakai.',
    category: 'career',
    completed: false,
  },
  {
    id: 'm-s8-4',
    categoryId: 'cat-kuliah',
    subPhaseId: 'sub-sem-8',
    stageId: 'Semester 8',
    title: 'Siapkan berkas administrasi wisuda, SKL, & sertifikat kompetensi',
    description: 'Kumpulkan sertifikat TOEFL/IELTS resmi dan bukti bebas pustaka perpustakaan.',
    category: 'study',
    completed: false,
  },

  // ================= 4. FRESH GRADUATE =================
  // Bedah CV & Portofolio
  {
    id: 'm-fg1-1',
    categoryId: 'cat-freshgrad',
    subPhaseId: 'sub-fg-cv',
    stageId: 'Semester 8',
    title: 'Format ulang CV menjadi 1 halaman berstandar ATS',
    description: 'Gunakan layout sederhana satu kolom, font standar, tanpa diagram lingkaran skill grafis.',
    category: 'career',
    completed: false,
  },
  {
    id: 'm-fg1-2',
    categoryId: 'cat-freshgrad',
    subPhaseId: 'sub-fg-cv',
    stageId: 'Semester 8',
    title: 'Showcase 3 project terbaik di portofolio dengan hasil terukur',
    description: 'Tunjukkan proses berpikir, tantangan teknis, dan solusi yang kamu implementasikan.',
    category: 'career',
    completed: false,
  },
  {
    id: 'm-fg1-3',
    categoryId: 'cat-freshgrad',
    subPhaseId: 'sub-fg-cv',
    stageId: 'Semester 8',
    title: 'Optimasi profil LinkedIn: pasang badge "Open to Work"',
    description: 'Tuliskan preferensi lokasi kerja (On-site / Hybrid / Remote) dan industri yang diincar.',
    category: 'career',
    completed: false,
  },
  {
    id: 'm-fg1-4',
    categoryId: 'cat-freshgrad',
    subPhaseId: 'sub-fg-cv',
    stageId: 'Semester 8',
    title: 'Minta peer review dari teman profesional atau mentor industri',
    description: 'Deteksi typo, kalimat bertele-tele, atau klaim yang terdengar terlalu muluk.',
    category: 'career',
    completed: false,
  },

  // Strategi Melamar & Job Fair
  {
    id: 'm-fg2-1',
    categoryId: 'cat-freshgrad',
    subPhaseId: 'sub-fg-melamar',
    stageId: 'Semester 8',
    title: 'Susun spreadsheet pelacak status lamaran pekerjaan',
    description: 'Catat kolom: Nama Perusahaan, Posisi, Tanggal Lamar, Kontak HR, dan Status Terkini.',
    category: 'career',
    completed: false,
  },
  {
    id: 'm-fg2-2',
    categoryId: 'cat-freshgrad',
    subPhaseId: 'sub-fg-melamar',
    stageId: 'Semester 8',
    title: 'Kirim 5–10 lamaran berkualitas tinggi setiap minggu',
    description: 'Kustomisasi cover letter dan resume sesuai kata kunci kualifikasi lowongan (jangan blast CV generik).',
    category: 'career',
    completed: false,
  },
  {
    id: 'm-fg2-3',
    categoryId: 'cat-freshgrad',
    subPhaseId: 'sub-fg-melamar',
    stageId: 'Semester 8',
    title: 'Hadiri job fair kampus atau virtual recruitment expo',
    description: 'Bawa salinan CV, berpakaian rapi, dan tanyakan kultur kerja langsung kepada user tim.',
    category: 'career',
    completed: false,
  },
  {
    id: 'm-fg2-4',
    categoryId: 'cat-freshgrad',
    subPhaseId: 'sub-fg-melamar',
    stageId: 'Semester 8',
    title: 'Lakukan cold messaging sopan ke alumni di perusahaan incaran',
    description: 'Minta wawasan 10 menit seputar ritme divisi mereka; referensi internal sangat membantu lolos screening.',
    category: 'career',
    completed: false,
  },

  // Persiapan Interview & Negosiasi Gaji
  {
    id: 'm-fg3-1',
    categoryId: 'cat-freshgrad',
    subPhaseId: 'sub-fg-interview',
    stageId: 'Already working',
    title: 'Kuasai jawaban pertanyaan interview klasik dengan metode STAR',
    description: 'Strukturkan jawaban: Situation, Task, Action, dan Result dengan angka konkret.',
    category: 'career',
    completed: false,
  },
  {
    id: 'm-fg3-2',
    categoryId: 'cat-freshgrad',
    subPhaseId: 'sub-fg-interview',
    stageId: 'Already working',
    title: 'Riset rentang gaji posisi di kota terkait (Salary Guide)',
    description: 'Gunakan panduan Glints, Jobstreet, atau Michael Page agar tidak memasang angka di bawah UMR atau terlalu tinggi.',
    category: 'finance',
    completed: false,
  },
  {
    id: 'm-fg3-3',
    categoryId: 'cat-freshgrad',
    subPhaseId: 'sub-fg-interview',
    stageId: 'Already working',
    title: 'Latihan negosiasi kompensasi, tunjangan BPJS, & benefit kerja',
    description: 'Ketahui hak pekerja: tunjangan makan/transport, asuransi kesehatan swasta, dan skema lembur.',
    category: 'finance',
    completed: false,
  },
  {
    id: 'm-fg3-4',
    categoryId: 'cat-freshgrad',
    subPhaseId: 'sub-fg-interview',
    stageId: 'Already working',
    title: 'Siapkan 3 pertanyaan berbobot untuk diajukan ke interviewer',
    description: 'Tanyakan contoh: "Apa indikator sukses utama dalam 6 bulan pertama untuk posisi ini?"',
    category: 'career',
    completed: false,
  },

  // ================= 5. DUNIA KERJA =================
  // Adaptasi 90 Hari Pertama / Probation
  {
    id: 'm-kj1-1',
    categoryId: 'cat-kerja',
    subPhaseId: 'sub-kerja-probation',
    stageId: 'Already working',
    title: 'Pahami KPI posisi, ekspektasi manajer, & ritme tim',
    description: 'Klarifikasi apa saja gol yang harus tercapai di akhir masa probation 3 bulan.',
    category: 'career',
    completed: false,
  },
  {
    id: 'm-kj1-2',
    categoryId: 'cat-kerja',
    subPhaseId: 'sub-kerja-probation',
    stageId: 'Already working',
    title: 'Catat seluruh SOP kerja harian & alur birokrasi kantor',
    description: 'Buat playbook pribadi agar tidak menanyakan pertanyaan teknis yang sama berulang kali.',
    category: 'study',
    completed: false,
  },
  {
    id: 'm-kj1-3',
    categoryId: 'cat-kerja',
    subPhaseId: 'sub-kerja-probation',
    stageId: 'Already working',
    title: 'Bangun reputasi andal: selalu kirim hasil tepat waktu',
    description: 'Keandalan (reliability) adalah sifat nomor satu yang dicari manajer dari karyawan baru.',
    category: 'career',
    completed: false,
  },
  {
    id: 'm-kj1-4',
    categoryId: 'cat-kerja',
    subPhaseId: 'sub-kerja-probation',
    stageId: 'Already working',
    title: 'Lakukan review berkala 30-60-90 hari bersama atasan',
    description: 'Minta umpan balik proaktif untuk memperbaiki kekurangan sebelum sidang probation resmi.',
    category: 'career',
    completed: false,
  },

  // Manajemen Gaji & Dana Darurat
  {
    id: 'm-kj2-1',
    categoryId: 'cat-kerja',
    subPhaseId: 'sub-kerja-gaji',
    stageId: 'Already working',
    title: 'Terapkan rumus alokasi 50/30/20 begitu gaji pertama cair',
    description: '50% kebutuhan pokok (kos/makan/transport), 30% keinginan pribadi, 20% tabungan masa depan.',
    category: 'finance',
    completed: false,
  },
  {
    id: 'm-kj2-2',
    categoryId: 'cat-kerja',
    subPhaseId: 'sub-kerja-gaji',
    stageId: 'Already working',
    title: 'Kumpulkan dana darurat setara 3 bulan biaya hidup pokok',
    description: 'Simpan di instrumen likuid dan aman seperti reksadana pasar uang atau tabungan digital berbunga harian.',
    category: 'finance',
    completed: false,
  },
  {
    id: 'm-kj2-3',
    categoryId: 'cat-kerja',
    subPhaseId: 'sub-kerja-gaji',
    stageId: 'Already working',
    title: 'Hindari perangkap lifestyle inflation dan utang konsumtif',
    description: 'Jangan langsung meng-upgrade gadget atau gaya hidup hanya karena sudah punya penghasilan tetap.',
    category: 'finance',
    completed: false,
  },
  {
    id: 'm-kj2-4',
    categoryId: 'cat-kerja',
    subPhaseId: 'sub-kerja-gaji',
    stageId: 'Already working',
    title: 'Buka rekening tabungan terpisah tanpa kartu debit aktif',
    description: 'Kunci otomatis uang tabungan agar tidak tergerus transaksi belanja online sehari-hari.',
    category: 'finance',
    completed: false,
  },

  // Akselerasi Karier & Promosi
  {
    id: 'm-kj3-1',
    categoryId: 'cat-kerja',
    subPhaseId: 'sub-kerja-promosi',
    stageId: 'Already working',
    title: 'Dokumentasikan Brag Document (arsip capaian kerja nyata)',
    description: 'Catat penghematan biaya, pertumbuhan metrik, dan testimoni rekan kerja untuk bahan kenaikan gaji.',
    category: 'career',
    completed: false,
  },
  {
    id: 'm-kj3-2',
    categoryId: 'cat-kerja',
    subPhaseId: 'sub-kerja-promosi',
    stageId: 'Already working',
    title: 'Ambil inisiatif pimpin project lintas divisi atau mentor junior',
    description: 'Tunjukkan kapasitas kepemimpinan sebelum promosi resmi diberikan perusahaan.',
    category: 'career',
    completed: false,
  },
  {
    id: 'm-kj3-3',
    categoryId: 'cat-kerja',
    subPhaseId: 'sub-kerja-promosi',
    stageId: 'Already working',
    title: 'Upskilling berkala dengan sertifikasi profesional tingkat lanjut',
    description: 'Ikuti kursus spesialisasi di sela waktu akhir pekan untuk menjaga daya saing pasar.',
    category: 'study',
    completed: false,
  },
  {
    id: 'm-kj3-4',
    categoryId: 'cat-kerja',
    subPhaseId: 'sub-kerja-promosi',
    stageId: 'Already working',
    title: 'Jadwalkan obrolan pengembangan karier saat annual review',
    description: 'Bicarakan ekspektasi jenjang karier berikutnya dengan data kontribusi yang solid.',
    category: 'career',
    completed: false,
  },

  // ================= 6. LANJUT STUDI S2 =================
  // Menentukan Tujuan & Riset Kampus
  {
    id: 'm-s2_1-1',
    categoryId: 'cat-s2',
    subPhaseId: 'sub-s2-tujuan',
    stageId: 'Already working',
    title: 'Tentukan motivasi kuat S2 (Riset Dosen vs Praktisi Industri)',
    description: 'Pahami apakah kamu butuh jalur Master by Research (akademisi) atau Master by Coursework (karier profesional).',
    category: 'study',
    completed: false,
  },
  {
    id: 'm-s2_1-2',
    categoryId: 'cat-s2',
    subPhaseId: 'sub-s2-tujuan',
    stageId: 'Already working',
    title: 'Riset kurikulum, profesor riset, & reputasi 5 kampus tujuan',
    description: 'Bandingkan program studi universitas top dalam negeri (UI/ITB/UGM) dan luar negeri.',
    category: 'study',
    completed: false,
  },
  {
    id: 'm-s2_1-3',
    categoryId: 'cat-s2',
    subPhaseId: 'sub-s2-tujuan',
    stageId: 'Already working',
    title: 'Cek syarat minimal IPK S1, linearitas, & portofolio riset',
    description: 'Pastikan transkrip dan mata kuliah prasyarat memenuhi standar admission jurusan target.',
    category: 'study',
    completed: false,
  },
  {
    id: 'm-s2_1-4',
    categoryId: 'cat-s2',
    subPhaseId: 'sub-s2-tujuan',
    stageId: 'Already working',
    title: 'Kalkulasi total biaya kuliah (tuition fee) & biaya hidup',
    description: 'Hitung rincian finansial per semester sebagai dasar perencanaan beasiswa atau tabungan mandiri.',
    category: 'finance',
    completed: false,
  },

  // Persiapan Bahasa & Dokumen LoA
  {
    id: 'm-s2_2-1',
    categoryId: 'cat-s2',
    subPhaseId: 'sub-s2-bahasa',
    stageId: 'Already working',
    title: 'Targetkan skor tes bahasa resmi (IELTS 6.5–7.0 / TOEFL iBT 90+)',
    description: 'Ikuti tes simulasi dan fokus perbaiki band score Writing serta Speaking akademis.',
    category: 'study',
    completed: false,
  },
  {
    id: 'm-s2_2-2',
    categoryId: 'cat-s2',
    subPhaseId: 'sub-s2-bahasa',
    stageId: 'Already working',
    title: 'Tulis Statement of Purpose (SoP) / Motivation Letter autentik',
    description: 'Ceritakan latar belakang masalah yang ingin kamu selesaikan dan kontribusimu setelah lulus S2.',
    category: 'study',
    completed: false,
  },
  {
    id: 'm-s2_2-3',
    categoryId: 'cat-s2',
    subPhaseId: 'sub-s2-bahasa',
    stageId: 'Already working',
    title: 'Amankan 2–3 surat rekomendasi dari dospem S1 atau atasan',
    description: 'Hubungi pemberi rekomendasi minimal 1 bulan sebelum deadline pendaftaran universitas.',
    category: 'career',
    completed: false,
  },
  {
    id: 'm-s2_2-4',
    categoryId: 'cat-s2',
    subPhaseId: 'sub-s2-bahasa',
    stageId: 'Already working',
    title: 'Submit pendaftaran universitas dan dapatkan Letter of Acceptance (LoA)',
    description: 'LoA Unconditional akan menjadi tiket emas penentu kelolosan seleksi beasiswa.',
    category: 'study',
    completed: false,
  },

  // Berburu Beasiswa Dalam/Luar Negeri
  {
    id: 'm-s2_3-1',
    categoryId: 'cat-s2',
    subPhaseId: 'sub-s2-beasiswa',
    stageId: 'Already working',
    title: 'Petakan timeline beasiswa target (LPDP, AAS, Chevening, Erasmus)',
    description: 'Catat tanggal pembukaan pendaftaran, seleksi bakat skolastik, hingga wawancara substantif.',
    category: 'finance',
    completed: false,
  },
  {
    id: 'm-s2_3-2',
    categoryId: 'cat-s2',
    subPhaseId: 'sub-s2-beasiswa',
    stageId: 'Already working',
    title: 'Susun rencana kontribusi pasca-studi yang selaras dengan visi bangsa',
    description: 'Jelaskan bagaimana ilmu yang kamu dapatkan akan langsung berdampak bagi kemajuan Indonesia.',
    category: 'study',
    completed: false,
  },
  {
    id: 'm-s2_3-3',
    categoryId: 'cat-s2',
    subPhaseId: 'sub-s2-beasiswa',
    stageId: 'Already working',
    title: 'Ikuti mock interview beasiswa dengan awardee berpengalaman',
    description: 'Latih artikulasi jawaban mengenai integritas, kepemimpinan, dan komitmen kembali ke tanah air.',
    category: 'career',
    completed: false,
  },
  {
    id: 'm-s2_3-4',
    categoryId: 'cat-s2',
    subPhaseId: 'sub-s2-beasiswa',
    stageId: 'Already working',
    title: 'Lengkapi berkas legalisir, surat sehat, & komitmen kembali ke Indonesia',
    description: 'Pastikan seluruh dokumen bebas cacat administrasi agar lolos tahap verifikasi berkas.',
    category: 'study',
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
  monthlyIncome: 3500000,
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
  // Background asynchronous sync to Supabase (including activity_dates)
  const activityDates = getStoredActivityDates(user.id);
  syncProfileToSupabase(user, activityDates).catch((err) => {
    console.warn('[Storage] Background Supabase user sync error:', err);
  });
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
    if (raw) {
      const parsed: Milestone[] = JSON.parse(raw);
      // If parsed contains new subPhaseId structure and has substantial milestones, use it
      if (Array.isArray(parsed) && parsed.length >= 50 && parsed.some((m) => m.subPhaseId)) {
        return parsed;
      }
      // Otherwise, migrate seamlessly: preserve completed status by matching ID or title
      const oldCompletedIds = new Set(parsed.filter((m) => m.completed).map((m) => m.id));
      const oldCompletedTitles = new Set(parsed.filter((m) => m.completed).map((m) => m.title.toLowerCase()));

      const upgraded = INITIAL_MILESTONES.map((m) => ({
        ...m,
        completed: oldCompletedIds.has(m.id) || oldCompletedTitles.has(m.title.toLowerCase()) || m.completed,
      }));
      saveStoredMilestones(userId, upgraded);
      return upgraded;
    }
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
  // Background asynchronous sync to Supabase finance_data
  syncFinanceUpsert(userId, finance).catch((err) => {
    console.warn('[Storage] Background Supabase finance sync error:', err);
  });
}

// ================= CHAT MESSAGES STORAGE =================
export function getStoredChatMessages(userId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(`pocketmentor_chat_${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // fallback
  }
  return [];
}

export function saveStoredChatMessages(userId: string, messages: ChatMessage[]) {
  localStorage.setItem(`pocketmentor_chat_${userId}`, JSON.stringify(messages));
}

export const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'ev-1',
    title: 'Bimbingan Bab 2 Skripsi & Metodologi',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
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
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
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
    date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
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
    date: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0],
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
    date: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
    time: '09:30',
    location: 'Auditorium Kampus Gedung C',
    urgency: 'masih_lama',
    type: 'ujian',
    description: 'Presentasi 15 menit di hadapan 2 dosen penguji.',
    completed: false,
  },
];

export function getStoredEvents(userId: string): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(`pocketmentor_events_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // fallback
  }
  return INITIAL_EVENTS;
}

export function saveStoredEvents(userId: string, events: CalendarEvent[]) {
  localStorage.setItem(`pocketmentor_events_${userId}`, JSON.stringify(events));
}

// ================= STREAK & ACTIVITY TRACKING =================
export interface StreakInfo {
  currentStreak: number;
  maxStreak: number;
  totalActiveDays: number;
  todayActive: boolean;
  history: Array<{
    date: string;
    dayName: string;
    dayNumber: number;
    active: boolean;
    isToday: boolean;
  }>;
}

export function getStoredActivityDates(userId: string): string[] {
  try {
    const raw = localStorage.getItem(`pocketmentor_activity_${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // fallback
  }

  // Seed default 6 days prior to today for consistent demo streak
  const today = new Date();
  const defaultDates: string[] = [];
  for (let i = 6; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    defaultDates.push(d.toISOString().split('T')[0]);
  }
  // If user already has goals completed today, add today too
  const goalsRaw = localStorage.getItem(`pocketmentor_goals_${userId}`);
  const todayStr = today.toISOString().split('T')[0];
  if (goalsRaw) {
    try {
      const goals: Goal[] = JSON.parse(goalsRaw);
      if (goals.some((g) => g.date === todayStr && g.completed)) {
        defaultDates.push(todayStr);
      }
    } catch {}
  } else {
    // Default has completed goals today
    defaultDates.push(todayStr);
  }

  localStorage.setItem(`pocketmentor_activity_${userId}`, JSON.stringify(defaultDates));
  return defaultDates;
}

export function setStoredActivityDates(userId: string, dates: string[]) {
  if (Array.isArray(dates) && dates.length > 0) {
    localStorage.setItem(`pocketmentor_activity_${userId}`, JSON.stringify(dates));
  }
}

export function recordActivity(userId: string, dateStr?: string) {
  const targetDate = dateStr || new Date().toISOString().split('T')[0];
  const current = getStoredActivityDates(userId);
  if (!current.includes(targetDate)) {
    const updated = [...current, targetDate];
    localStorage.setItem(`pocketmentor_activity_${userId}`, JSON.stringify(updated));
  }
}

export function calculateStreak(userId: string, goals: Goal[] = [], journal: JournalEntry[] = []): StreakInfo {
  const rawDates = getStoredActivityDates(userId);
  const dateSet = new Set<string>(rawDates);

  // Auto-record from completed goals and journal
  goals.forEach((g) => {
    if (g.completed && g.date) dateSet.add(g.date);
  });
  journal.forEach((j) => {
    if (j.date) dateSet.add(j.date);
  });

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayActive = dateSet.has(todayStr);

  // Calculate consecutive days
  let currentStreak = 0;
  // If active today, count from today; if not yet active today, check if yesterday was active
  let checkDate = new Date(today);
  if (!todayActive) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dStr = checkDate.toISOString().split('T')[0];
    if (dateSet.has(dStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate 7-day visual history (Monday to Sunday or last 7 days ending today)
  const history: StreakInfo['history'] = [];
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    const isToday = i === 0;
    const active = dateSet.has(dStr);

    history.push({
      date: dStr,
      dayName: dayNames[d.getDay()],
      dayNumber: d.getDate(),
      active,
      isToday,
    });
  }

  const totalActiveDays = dateSet.size;
  const maxStreak = Math.max(currentStreak, 14); // Baseline best record

  return {
    currentStreak: Math.max(currentStreak, 1),
    maxStreak,
    totalActiveDays,
    todayActive,
    history,
  };
}
