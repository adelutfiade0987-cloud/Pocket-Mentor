import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  Sparkles,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  BookOpen,
  Feather,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { UserProfile, SceneAnalysisResult } from '../types';
import { playTextToSpeech, stopAudioPlayback } from '../utils/tts';

interface VisionStudioViewProps {
  user: UserProfile;
}

const SAMPLE_PRESETS = [
  {
    title: 'Meja Skripsi Larut Malam',
    desc: 'Laptop menyala, cangkir kopi dingin, catatan berserakan',
    src: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Sudut Kafe Kota Saat Hujan',
    desc: 'Kaca berembun, lampu kuning temaram, notebook terbuka',
    src: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Langit Senja dari Rooftop Kampus',
    desc: 'Lembayung oranye, gedung kampus, embusan angin sore',
    src: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
  },
];

export const VisionStudioView: React.FC<VisionStudioViewProps> = ({ user }) => {
  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_PRESETS[0].src);
  const [mode, setMode] = useState<'creative' | 'study'>('creative');
  const [loading, setLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);

  const [result, setResult] = useState<SceneAnalysisResult>({
    mood: 'Melancholic, focused, yet quietly ambitious',
    sceneAnalysis:
      'Pendar cahaya monitor menerangi cangkir keramik dan lembar-lembar catatan riset. Kontras bayangan malam di luar jendela menegaskan keheningan ruang saat dunia lain sedang tertidur lelap.',
    openingStory:
      'Pukul tiga pagi selalu memiliki bahasa rahasianya sendiri. Di balik dengung pelan pendingin ruangan dan aroma kafein yang mulai mendingin di dasar cangkir, kursor berkedip ritmis di layar putih — seolah menantang Rian untuk menyelesaikan paragraf terakhir yang telah mengendap berhari-hari di kepalanya. Setiap kalimat yang ia ketik bukan sekadar tugas akhir; itu adalah jembatan rapuh namun nyata antara masa mudanya yang riuh dan gerbang masa depan yang belum terpetakan.',
    reflectionTakeaway:
      'Setiap karya besar dimulai dari keberanian duduk berjam-jam dalam keheningan saat belum ada yang menonton.',
    imageSrc: SAMPLE_PRESETS[0].src,
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSelectedImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (loading) return;
    setLoading(true);
    stopAudioPlayback();
    setIsPlayingAudio(false);

    try {
      // If selectedImage is an external url, fetch and convert to base64 or pass data
      let base64Data = selectedImage;
      if (selectedImage.startsWith('http')) {
        const resp = await fetch(selectedImage);
        const blob = await resp.blob();
        base64Data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }

      const res = await fetch('/api/mentor/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: 'image/jpeg',
          mode,
          profile: user,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setResult({
            ...json.data,
            imageSrc: selectedImage,
          });
        }
      }
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReadAloud = async () => {
    if (isPlayingAudio) {
      stopAudioPlayback();
      setIsPlayingAudio(false);
      return;
    }

    const narration = `Analisis suasana: ${result.mood}. ${result.openingStory}`;
    setIsPlayingAudio(true);

    await playTextToSpeech(narration, {
      voiceName: 'Puck',
      style: 'Expressive literary narrator with warm emotional inflection',
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  const handleCopyStory = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(result.openingStory);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F9] pb-28 pt-4 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-[#6C5CE7] mb-1">
          <Feather className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Vision & Ghostwriting</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1A1A2E]">Creative Studio</h1>
        <p className="text-xs text-[#6B7280]">
          Unggah foto suasana meja belajar atau objek sekitar. AI menganalisis mood dan menulis paragraf pembuka cerita.
        </p>
      </div>

      {/* Mode Selector */}
      <div className="flex bg-white p-1 rounded-2xl border border-black/[0.05] shadow-xs mb-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setMode('creative')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            mode === 'creative'
              ? 'bg-[#6C5CE7] text-white shadow-xs'
              : 'text-[#6B7280] hover:text-[#1A1A2E]'
          }`}
        >
          Paragraf Cerita (Ghostwriter)
        </button>
        <button
          type="button"
          onClick={() => setMode('study')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            mode === 'study'
              ? 'bg-[#6C5CE7] text-white shadow-xs'
              : 'text-[#6B7280] hover:text-[#1A1A2E]'
          }`}
        >
          Refleksi Belajar & Skripsi
        </button>
      </div>

      {/* Image Preview & Upload Section */}
      <div className="bg-white p-4 rounded-3xl border border-black/[0.05] shadow-xs mb-4">
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-gray-100 mb-3 border border-black/[0.04]">
          <img
            src={selectedImage}
            alt="Scene to analyze"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />

          <label
            htmlFor="scene-upload"
            className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-[#1A1A2E] text-xs font-semibold px-3 py-1.5 rounded-full shadow-md backdrop-blur-xs cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-[#6C5CE7]" />
            <span>Ganti Foto</span>
          </label>
          <input
            id="scene-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Preset Thumbnails */}
        <div>
          <span className="text-[11px] font-bold text-[#6B7280] block mb-1.5">
            Atau pilih suasana referensi:
          </span>
          <div className="grid grid-cols-3 gap-2">
            {SAMPLE_PRESETS.map((preset, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedImage(preset.src)}
                className={`p-1 rounded-xl border text-left transition-all ${
                  selectedImage === preset.src
                    ? 'border-[#6C5CE7] ring-2 ring-[#6C5CE7]/20 bg-[#6C5CE7]/5'
                    : 'border-black/[0.06] hover:border-black/20'
                }`}
              >
                <img
                  src={preset.src}
                  alt={preset.title}
                  className="w-full h-12 object-cover rounded-lg mb-1"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[10px] font-bold text-[#1A1A2E] block truncate">
                  {preset.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Button: Analyze */}
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full mt-4 h-12 rounded-2xl bg-[#6C5CE7] hover:bg-[#5b4bc7] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#6C5CE7]/20 disabled:opacity-50 transition-all"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Menganalisis suasana dengan Gemini...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Analisis Mood & Tulis Cerita</span>
            </div>
          )}
        </button>
      </div>

      {/* Generated Story & Analysis Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={result.openingStory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-5 rounded-3xl border border-black/[0.05] shadow-xs space-y-4"
        >
          {/* Mood & Scene observation */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C5CE7]">
                Mood & Nuansa Visual
              </span>
              <span className="text-[11px] font-bold bg-[#6C5CE7]/10 text-[#6C5CE7] px-2.5 py-0.5 rounded-full">
                {result.mood}
              </span>
            </div>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              {result.sceneAnalysis}
            </p>
          </div>

          {/* Opening Paragraph / Story */}
          <div className="p-4 rounded-2xl bg-[#F5F5F9] border border-black/[0.04] relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#1A1A2E] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#6C5CE7]" />
                Paragraf Pembuka Cerita
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyStory}
                  className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#1A1A2E] hover:bg-black/5"
                  title="Salin teks"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#3FB876]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                {/* Read Aloud Button (Expressive AI Voice gemini-3.8-flash-tts) */}
                <button
                  type="button"
                  onClick={handleReadAloud}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    isPlayingAudio
                      ? 'bg-[#FA5A50] text-white animate-pulse'
                      : 'bg-[#6C5CE7] text-white hover:bg-[#5b4bc7]'
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Stop Suara</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Read Aloud</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-[#1A1A2E] font-serif leading-relaxed whitespace-pre-wrap italic">
              "{result.openingStory}"
            </p>
          </div>

          {/* Reflection Takeaway */}
          {result.reflectionTakeaway && (
            <div className="pt-1 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#FFB020] shrink-0 mt-0.5" />
              <p className="text-[11px] font-medium text-[#6B7280] leading-snug">
                <span className="font-bold text-[#1A1A2E]">Catatan Mentor: </span>
                {result.reflectionTakeaway}
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
