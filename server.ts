import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize GoogleGenAI server-side with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-memory IP rate limiter: max 40 requests per hour per IP (protects Gemini quota for 50 trial users)
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const ipRateLimits = new Map<string, RateLimitRecord>();
const RATE_LIMIT_MAX = 40;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour window

const apiRateLimiter: express.RequestHandler = (req, res, next) => {
  const forwarded = req.headers['x-forwarded-for'];
  const ip =
    typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : (req.socket.remoteAddress || 'unknown-client');

  const now = Date.now();
  const record = ipRateLimits.get(ip);

  if (!record || now > record.resetTime) {
    ipRateLimits.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return next();
  }

  if (record.count >= RATE_LIMIT_MAX) {
    const remainingSeconds = Math.ceil((record.resetTime - now) / 1000);
    const remainingMinutes = Math.ceil(remainingSeconds / 60);
    return res.status(429).json({
      success: false,
      error: `Batas kuota penggunaan AI tercapai (maks 40 permintaan/jam per perangkat). Silakan coba lagi dalam ${remainingMinutes} menit.`,
      retryAfterSeconds: remainingSeconds,
    });
  }

  record.count += 1;
  next();
};

// Periodic cleanup of expired rate limit entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, rec] of ipRateLimits.entries()) {
    if (now > rec.resetTime) {
      ipRateLimits.delete(ip);
    }
  }
}, 10 * 60 * 1000);

app.use('/api', apiRateLimiter);

// Endpoint 1: Personalized Stage-Aware Daily Mentor Tip
app.post('/api/mentor/tip', async (req, res) => {
  try {
    const { profile, recentGoals, mood } = req.body;
    const stage = profile?.stage || 'Semester 7';
    const major = profile?.major || 'General';
    const origin = profile?.origin || 'Indonesia';
    const career = profile?.career || 'Creative & Tech';
    const interests = Array.isArray(profile?.interests) ? profile.interests.join(', ') : (profile?.interests || 'Productivity');
    const contribution = profile?.contribution || 'Problem solver';
    const focusAreas = Array.isArray(profile?.focusAreas) ? profile.focusAreas.join(', ') : 'Career & Goals';

    const prompt = `You are PocketMentor ("A mentor that fits in your pocket"), a warm, direct, encouraging mentor for young Indonesians navigating critical life stage transitions.
Speak like a smart older sibling / experienced friend who is a few steps ahead — never corporate, never clinical. Always frame copy warmly using natural "kamu/kita" framing.

User Profile:
- Life Stage: ${stage}
- Field/Major: ${major}
- Origin: ${origin}
- Interests: ${interests}
- Career Direction: ${career}
- Desired Identity/Contribution ("Mau dibutuhkan sebagai apa"): ${contribution}
- Focus Areas: ${focusAreas}
- Recent Activity: Completed ${recentGoals || 0} goals today. Current Mood: ${mood || 'Energetic'}.

Task:
Generate 1 punchy, deeply relevant daily mentor tip/nudge for today. Weave realistic Indonesian/global career context naturally (e.g. entry pathways, portfolio tips, thesis pacing) without sounding like a research paper or mentioning fake numbers.
Also provide 1 concrete suggested action goal for today.

Respond strictly in JSON with this schema:
{
  "title": "Short warm kicker (e.g. Langkah Kecil Hari Ini)",
  "tip": "2 to 3 sentences of genuine, stage-aware mentor wisdom for today.",
  "suggestedGoal": "One clear action item they can accomplish today (under 10 words).",
  "category": "career" | "study" | "health" | "finance" | "content"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text || '{}';
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = {
        title: 'Fokus Hari Ini',
        tip: 'Ingat, konsistensi 1% setiap hari jauh lebih bernilai daripada sprint mendadak yang bikin burnout. Luangkan waktu untuk satu kemajuan nyata hari ini.',
        suggestedGoal: 'Kerjakan 1 prioritas utama selama 25 menit',
        category: 'study',
      };
    }

    res.json({ success: true, data });
  } catch (err: any) {
    console.error('Error generating mentor tip:', err);
    // Graceful fallback response
    res.json({
      success: true,
      data: {
        title: 'Nasihat Mentor Hari Ini',
        tip: 'Fokus pada satu hal yang paling menggerakkan jarum hari ini. Nggak perlu sempurna, yang penting ada progres nyata.',
        suggestedGoal: 'Selesaikan 1 draft atau tugas utama',
        category: 'career',
      },
    });
  }
});

// Endpoint 2: Multi-Turn PocketMentor Chat
app.post('/api/mentor/chat', async (req, res) => {
  try {
    const { messages, profile, modelChoice } = req.body;
    // Choose model based on requirements:
    // gemini-3.1-pro-preview for complex tasks, gemini-3.8-flash for general, gemini-3.1-flash-lite for fast
    let selectedModel = 'gemini-3.8-flash';
    if (modelChoice === 'complex') selectedModel = 'gemini-3.1-pro-preview';
    else if (modelChoice === 'fast') selectedModel = 'gemini-3.1-flash-lite';

    // 1. Ambil seluruh data dari profile
    const name = profile?.name || 'Teman';
    const origin = profile?.origin || 'Indonesia';
    const stage = profile?.stage || 'Semester 7';
    const major = profile?.major || 'General';
    const interests = Array.isArray(profile?.interests)
      ? profile.interests.join(', ')
      : (profile?.interests || '-');
    const careerDirection = profile?.careerDirection || profile?.career || '-';
    const desiredContribution = profile?.desiredContribution || profile?.contribution || '-';

    // 2, 3, 4. System Instruction: Thought Partner / Teman Diskusi WhatsApp-style, Anti-Kaku, Diskusi Dua Arah, dan Roadmap
    const systemInstruction = `Kamu adalah PocketMentor, seorang "Thought Partner / Teman Diskusi" sebaya yang cerdas, hangat, dan solutif bagi pemuda Indonesia. Kamu bukan guru yang menggurui, bukan bot tutorial, dan bukan artikel ensiklopedia. Obrolanmu mengalir alami dan akrab layaknya percakapan WhatsApp yang mendalam dengan sahabat atau mentor yang peduli.

Profil Teman Bicara Kamu:
- Nama: ${name}
- Asal Kota: ${origin}
- Fase Saat Ini: ${stage}
- Jurusan / Bidang: ${major}
- Minat & Passion: ${interests}
- Arah Karier Impian: ${careerDirection}
- Identitas / Kontribusi yang Diinginkan: ${desiredContribution}

Pedoman Gaya Chat Manusia & Anti-Kaku:
- GAYA CHAT MANUSIA: Tulis balasan dalam format 2–3 paragraf sedang yang mengalir wajar, dengan penekanan pada **kata kunci atau frasa penting** agar mudah dipahami.
- DILARANG KERAS membuat daftar poin-poin/bullet list panjang bergaya artikel Wikipedia atau diktat kuliah, KECUALI pengguna secara eksplisit meminta "buatkan daftar / list".
- ANTI-KAKU: Gunakan bahasa percakapan Indonesia sehari-hari yang santai, hangat, supel, dan dewasa. Selalu gunakan sapaan "aku/kamu" dan "kita".
- DISKUSI DUA ARAH (3 Langkah Respons):
  1. Validasi & Empati Singkat: Respons inti keresahan atau pertanyaan mereka dalam 1-2 kalimat awal dengan pemahaman emosional yang hangat.
  2. Insight Tajam & Realitas: Bedah 1 sudut pandang baru atau **blind spot** yang sering luput disadari orang, lengkap dengan realitas lapangannya. Berikan penekanan tebal (**bold**) pada poin krusial.
  3. Pertanyaan Cermin (Mirror Question): Selalu tutup balasanmu dengan tepat 1 pertanyaan balik yang spesifik untuk menggali situasi riil mereka sebelum buru-buru menyimpulkan.

Tiga Aturan Utama yang WAJIB Diterapkan:
1. Refleksi Langsung:
   - JANGAN PERNAH menyuruh user riset sendiri di luar chat (misal: "coba cari di Google dulu" atau "tentukan dulu maumu").
   - Jangan beri syarat sebelum membantu. Langsung bedah konsekuensi, dinamika kerja, beban SKS, atau pilihan industri secara konkret di dalam chat ini.
2. Pertanyaan Cermin:
   - Satu pertanyaan terbuka penutup yang mengajak user mengecek kesiapan dirinya, menguji asumsinya, atau menilai prioritas riilnya.
3. Proof of Work:
   - Jika user merasa minder belum ada pengalaman (terutama semester 3–4 atau baru mulai), dorong mereka membuat karya nyata mandiri (studi kasus tugas kuliah, postingan analisis LinkedIn, repositori GitHub, tulisan Medium, atau desain Figma publik). Bukti karya nyata jauh lebih dihargai industri dibanding tumpukan sertifikat webinar.

Acuan Roadmap Fase Hidup:
- High school grad: Eksplorasi minat-bakat terstruktur, bedah trade-off kampus top vs jurusan impian, dan kesiapan finansial/beasiswa tanpa beban rasa bersalah.
- Semester 1–2: Adaptasi ritme SKS mandiri, jaga IPK awal >3.50 sebagai bantalan, dan seimbangkan eksplorasi organisasi tanpa mengorbankan fondasi kuliah.
- Semester 3–4: Proof of Work proyek mandiri, kompetisi karya tulis/case study, dan freelance/magang pemula.
- Semester 5–6: Magang industri formal (MSIB/korporat), networking praktisi terarah, dan pengumpulan 10 jurnal untuk calon topik skripsi.
- Semester 7–8: Konsistensi pacing naskah skripsi (300–500 kata/hari), resume ATS-friendly, persiapan interview kerja, dan kesiapan mental transisi fresh graduate.
- Already working: Evaluasi 90 hari probation, rumus dana darurat 50/30/20, upskilling berkala, dan dokumentasi brag sheet untuk negosiasi kenaikan karier.`;

    // Pastikan percakapan dimulai dari role 'user' pertama (Gemini mensyaratkan giliran pertama adalah user)
    const rawMessages = (messages || []).filter((m: any) => (m.content || m.text || '').trim());
    const firstUserIdx = rawMessages.findIndex((m: any) => m.role === 'user');
    const validMessages = firstUserIdx >= 0 ? rawMessages.slice(firstUserIdx) : rawMessages;

    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
    for (const m of validMessages) {
      const role = m.role === 'user' ? 'user' : 'model';
      const text = (m.content || m.text || '').trim();
      if (!text) continue;

      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        contents[contents.length - 1].parts[0].text += '\n' + text;
      } else {
        contents.push({
          role,
          parts: [{ text }],
        });
      }
    }

    // Default jika tidak ada pesan user sama sekali
    if (contents.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: 'Halo mentor, aku mau diskusi tentang langkah berikutnya.' }],
      });
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction,
        temperature: 0.75,
      },
    });

    res.json({
      success: true,
      reply: response.text || 'Ada yang mau kita bedah lebih dalam lagi hari ini?',
      modelUsed: selectedModel,
    });
  } catch (err: any) {
    console.error('Error in mentor chat:', err);
    // Intelligent fallback reply rather than throwing 500 error
    const stage = req.body?.profile?.stage || 'High school grad';
    const fallbackReply = `Aku paham banget perasaan bimbangmu saat ini. Di fase ${stage}, memilih kampus atau arah selanjutnya memang terasa krusial dan bikin overthinking karena kita takut salah langkah.

Yang sering jadi **blind spot** adalah orang terlalu terpaku pada nama besar kampus, padahal realitasnya dunia kerja dan industri jauh lebih melihat **keselarasan kurikulum dengan kebiasaan belajarmu, serta bukti portofolio nyata (Proof of Work)** yang kamu ciptakan selama kuliah nanti. Kampus top membuka gerbang awal, tapi ketekunanmu yang menentukan kariermu ke depan.

Kira-kira apa yang paling bikin kamu cemas sekarang: takut salah pilih jurusan yang nggak disukai, atau lebih mengkhawatirkan prospek kerja dan biaya kuliahnya?`;

    res.json({
      success: true,
      reply: fallbackReply,
      modelUsed: 'offline-mentor-fallback',
    });
  }
});

// Endpoint 3: Analyze Image & Ghostwrite Story / Study Reflection (using gemini-3.1-pro-preview)
app.post('/api/mentor/analyze-image', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', mode = 'creative', profile } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

    const stage = profile?.stage || 'College Student';
    const career = profile?.career || 'Creative Explorer';

    const promptText = mode === 'creative'
      ? `Analyze the mood, visual atmosphere, lighting, and scene of this image.
Then, ghostwrite an evocative, immersive opening paragraph to a story set in that world (around 80-120 words).
Also provide a short mood description and a thematic writing prompt / mentor takeaway for someone who loves storytelling.
Respond strictly in JSON format:
{
  "mood": "Short mood description (e.g. Melancholic yet hopeful, Golden-hour quiet)",
  "sceneAnalysis": "Concise 2-sentence description of key details, lighting, and emotional undertone in the scene.",
  "openingStory": "The ghostwritten opening paragraph set in this world.",
  "reflectionTakeaway": "A short 1-line inspiring reflection or thought prompt."
}`
      : `Analyze this image (could be study workspace, notes, laptop, campus, or creative work).
Observe the mood and context for a student / young professional in life stage: ${stage}, aiming for: ${career}.
Provide:
1) Mood and visual observation.
2) An encouraging mentor commentary on their dedication/setup.
3) An opening narrative paragraph that captures this exact moment in their personal journey.
Respond strictly in JSON format:
{
  "mood": "Mood description",
  "sceneAnalysis": "Visual observation of the space or scene",
  "openingStory": "An evocative narrative opening paragraph capturing this moment of growth and pursuit",
  "reflectionTakeaway": "Practical mentor takeaway"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = {
        mood: 'Atmospheric & contemplative',
        sceneAnalysis: 'A beautifully framed scene filled with character and quiet energy.',
        openingStory: 'The morning mist clung to the edges of the quiet city, carrying the faint scent of rain and roasted beans...',
        reflectionTakeaway: 'Setiap sudut menyimpan cerita, tergantung bagaimana caramu memandangnya.',
      };
    }

    res.json({ success: true, data });
  } catch (err: any) {
    console.error('Error analyzing image:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Gagal menganalisis gambar.',
    });
  }
});

// Endpoint 4: Expressive Text to Speech (TTS) using gemini-3.8-flash-tts
app.post('/api/mentor/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Puck', style = 'Warm, expressive mentor' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    // gemini-3.8-flash-tts generates complete WAV file
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 1000), // Keep within comfortable speech length
              speechMetadata: {
                style,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error('No audio data returned from Gemini TTS');
    }

    res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (err: any) {
    console.error('Error in Gemini TTS:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'TTS generation failed',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PocketMentor server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
