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
    // gemini-3.1-pro-preview for complex tasks, gemini-3.5-flash for general, gemini-3.1-flash-lite for fast
    let selectedModel = 'gemini-3.5-flash';
    if (modelChoice === 'complex') selectedModel = 'gemini-3.1-pro-preview';
    else if (modelChoice === 'fast') selectedModel = 'gemini-3.1-flash-lite';

    const stage = profile?.stage || 'College Student';
    const major = profile?.major || 'General';
    const career = profile?.career || 'General';

    const systemInstruction = `You are PocketMentor ("A mentor that fits in your pocket"), a supportive, sharp, empathetic older mentor for young Indonesians.
Voice and tone:
- Warm, direct, encouraging, practical.
- Use natural Indonesian / English mix as typical among young Indonesian students and early professionals ("kamu / kita", santai tapi berbobot).
- You know their background: Stage: ${stage}, Major/Role: ${major}, Target Career: ${career}.
- Ground advice in practical reality (thesis struggles, internship hunts, entry salaries in Indo, freelancing, portofolio creation).
- Keep answers concise, actionable, and conversational. Avoid huge walls of text unless explicitly asked for a deep breakdown.`;

    const contents = (messages || []).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content || m.text || '' }],
    }));

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
      reply: response.text || 'Ada yang bisa kubantu lagi untuk langkahmu hari ini?',
      modelUsed: selectedModel,
    });
  } catch (err: any) {
    console.error('Error in mentor chat:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Gagal menghubungi PocketMentor.',
      fallbackReply: 'Maaf, mentor sedang ada sedikit kendala koneksi. Coba ulangi pertanyaanmu ya!',
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
