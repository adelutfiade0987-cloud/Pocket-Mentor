# Rencana Transformasi: Nested Bento Grid Roadmap & Percakapan Alami Chatbot

Transformasi sistem navigasi **Roadmap** dari timeline horizontal menjadi **Nested Bento Grid (Kotak Berjenjang 3 Level)** dengan kartu berestetika tinggi sesuai desain "Pusat Aktivitas", serta perombakan sistem interaksi **AI Chatbot** menjadi *Thought Partner* dua arah yang mengalir alami tanpa kekakuan formalitas.

---

### Tinjauan Pengguna & Keputusan Kritis

> [!IMPORTANT]
> **Keputusan Terkonfirmasi dari Tanya Jawab:**
> - **Transisi Level 2 ke Level 3:** Menggunakan transisi halaman penuh (*full-page slide transition*) yang bersih dilengkapi tombol kembali (*Back button*) dan *breadcrumb* navigasi.
> - **Panjang & Gaya Balasan Chatbot:** Paragraf sedang (2–3 paragraf mengalir) dengan penekanan poin penting (menggunakan *bolding* tipografis natural), menghindari gaya daftar artikel kaku/Wikipedia.

---

## 1. Konsep & Arsitektur Solusi

### A. Bagian 1: Nested Bento Grid Roadmap (3 Level)
Sistem roadmap diubah total dari horizontal scroller menjadi 3 hierarki bertingkat:
1. **Level 1 (Kategori Utama):** Grid 2 kolom dengan 6 kartu berwarna solid, rounded-3xl (24–28px radius), ikon di kiri atas, badge ringkasan di kanan atas, judul tebal, dan jumlah sub-fase.
   - Masa SMA (`#6C5CE7` Ungu)
   - After SMA / Transisi (`#FA5A50` Coral)
   - Masa Kuliah (`#FFB020` Amber)
   - Fresh Graduate (`#3FB876` Hijau)
   - Dunia Kerja (`#3B82F6` Biru)
   - Lanjut Studi S2 (`#EC4899` Pink)
2. **Level 2 (Sub-Kotak Spesifik):** Muncul saat kategori Level 1 diklik.
   - Menyajikan 23 sub-kotak terstruktur (SMA: 3 kelas; Transisi: 3 jalur; Kuliah: 8 semester; Fresh Grad: 3 pilar; Kerja: 3 tahapan; S2: 3 persiapan).
   - Dilengkapi *Header Bar* dengan tombol navigasi kembali, judul kategori, dan progress penyelesaian keseluruhan.
3. **Level 3 (Detail Checklist & Aksi):** Tampilan halaman penuh detail langkah demi langkah untuk sub-fase yang dipilih.
   - Progress bar dinamis (misal: "3/4 selesai").
   - 3–4 langkah konkret dan realistis untuk setiap sub-kotak yang disimpan terstruktur di `storage.ts`.
   - Interaksi checkbox dengan animasi bounce, badge kategori, dan tombol **"+ Jadikan Target"** untuk menyalin tonggak ke *Daily Goals* hari ini.

### B. Bagian 2: Chatbot Interaktif Dua Arah (Thought Partner)
- Penyesuaian `systemInstruction` di server Express (`/api/mentor/chat`):
  - **Persona Sejajar:** Menggunakan kata sapaan "aku/kamu" dan "kita", hangat, dewasa, tidak menggurui.
  - **Formula 3 Langkah Respon:**
    1. *Empati & Validasi:* Menanggapi inti keresahan user secara personal (1–2 kalimat).
    2. *Insight Tajam (Blind Spot):* Membedah realitas lapangan yang jarang disadari (tanpa menyuruh user cari di Google).
    3. *Pertanyaan Balik (Mirror Question):* Selalu mengunci respon dengan 1 pertanyaan spesifik untuk menggali kesiapan atau sudut pandang user.
  - **Panjang Pesan Terkendali:** Maksimal 2–3 paragraf pendek dengan penekanan frasa kunci penting.

```
┌────────────────────────────────────────────────────────┐
│               LEVEL 1: 6 Kategori Utama                │
│  [Masa SMA]     [After SMA]    [Masa Kuliah]          │
│  [Fresh Grad]   [Dunia Kerja]  [Lanjut Studi S2]      │
└───────────────────────────┬────────────────────────────┘
                            │ (Klik Kategori)
                            ▼
┌────────────────────────────────────────────────────────┐
│               LEVEL 2: Sub-Kotak Grid                  │
│  < Kembali   •  Kategori Terpilih                      │
│  [Sub-Fase A]   [Sub-Fase B]   [Sub-Fase C] ...        │
└───────────────────────────┬────────────────────────────┘
                            │ (Klik Sub-Fase)
                            ▼
┌────────────────────────────────────────────────────────┐
│            LEVEL 3: Detail Checklist & Aksi            │
│  < Kembali ke Sub-Fase  •  Progress 75% [========    ]│
│  ☑ Langkah 1: ...                   [+ Jadikan Target] │
│  ☐ Langkah 2: ...                   [+ Jadikan Target] │
│  ☐ Langkah 3: ...                   [+ Jadikan Target] │
└────────────────────────────────────────────────────────┘
```

---

## 2. Rincian Pengalaman Pengguna (UX) & Desain Visual

### Identitas Visual & Kartu Bento
- **Geometri Kartu:** Sudut membulat `rounded-3xl` (24px–28px), bantalan dalam 16px–20px, elevasi lembut tanpa border ganda.
- **Warna Solid & Saturated:**
  - Masa SMA: `#6C5CE7` (Solid Primary Purple)
  - After SMA / Transisi: `#FA5A50` (Coral)
  - Masa Kuliah: `#FFB020` (Amber)
  - Fresh Graduate: `#3FB876` (Green)
  - Dunia Kerja: `#3B82F6` (Electric Blue)
  - Lanjut Studi S2: `#EC4899` (Vibrant Pink)
- **Anatomi Kartu:**
  - Ikon badge putih transparan (`bg-white/20`) di pojok kiri atas.
  - Badge indikator jumlah langkah/progress di pojok kanan atas.
  - Tipografi judul tebal 15–16px di kiri bawah dengan meta teks 11–12px.
  - State aktif dan tap feedback (`whileTap: scale 0.98`).

---

## 3. Struktur Data & Integrasi State

### Data Model di `src/types/index.ts` & `src/utils/storage.ts`
- Memperluas identifikasi sub-fase ke dalam entitas data:
  ```ts
  export interface RoadmapCategory {
    id: string; // 'sma' | 'transisi' | 'kuliah' | 'freshgrad' | 'kerja' | 's2'
    title: string;
    color: string;
    icon: string;
    badge: string;
    subPhases: RoadmapSubPhase[];
  }

  export interface RoadmapSubPhase {
    id: string; // e.g. 'sma-1', 'transisi-gapyear', 'kuliah-sem4', etc.
    categoryId: string;
    title: string;
    subtitle: string;
    itemsCount?: number;
  }
  ```
- **Database 23 Sub-Kotak & >70 Milestone Lengkap di `storage.ts`:**
  Setiap sub-kotak dilengkapi minimal 3–4 langkah realistis dengan kategori (study, career, health, finance, content) yang otomatis tersimpan di `localStorage` per akun pengguna.

---

## 4. Langkah Implementasi Bertahap

1. **Pembaruan Data Model & Database Milestone (`src/types/index.ts` & `src/utils/storage.ts`):**
   - Menambahkan definisi 6 kategori utama dan 23 sub-kotak.
   - Mengisi data milestone lengkap (3–4 langkah konkret untuk setiap sub-kotak).
2. **Pembangunan Ulang `src/components/RoadmapView.tsx`:**
   - Menghapus horizontal timeline lama.
   - Mengimplementasikan navigasi state (`viewLevel: 1 | 2 | 3`, `selectedCategory`, `selectedSubPhase`).
   - Menyusun Level 1 Grid 6 Kartu (warna flat solid).
   - Menyusun Level 2 Sub-Kotak Grid dengan tombol kembali.
   - Menyusun Level 3 Checklist Halaman Penuh dengan progress bar dan tombol "+ Jadikan Target".
3. **Penyempurnaan Prompt AI Chatbot (`server.ts` & `src/components/MentorChatModal.tsx`):**
   - Memperbarui `systemInstruction` di `/api/mentor/chat` dengan aturan ketat: bahasa percakapan mengalir (2–3 paragraf), empati + blind spot insight + pertanyaan cermin balik.
   - Memastikan `MentorChatModal.tsx` menampilkan interaksi yang responsif, hangat, dan natural.
4. **Verifikasi & Uji Kompilasi:**
   - Menjalankan `compile_applet` dan `lint_applet` untuk memastikan bebas error.
   - Menguji interaksi klik di seluruh level navigasi roadmap.
