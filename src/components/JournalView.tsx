import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Smile,
  Meh,
  Frown,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Check,
} from 'lucide-react';
import { JournalEntry, MoodType } from '../types';
import { ROTATING_PROMPTS } from '../utils/storage';

interface JournalViewProps {
  entries: JournalEntry[];
  onSaveEntry: (entry: JournalEntry) => void;
}

const MOODS: { id: MoodType; label: string; icon: string; color: string }[] = [
  { id: 'great', label: 'Lega & Senang', icon: '😄', color: 'bg-[#3FB876]/15 text-[#3FB876] border-[#3FB876]' },
  { id: 'good', label: 'Produktif', icon: '🙂', color: 'bg-[#6C5CE7]/15 text-[#6C5CE7] border-[#6C5CE7]' },
  { id: 'neutral', label: 'Biasa Saja', icon: '😐', color: 'bg-[#FFB020]/15 text-[#FFB020] border-[#FFB020]' },
  { id: 'tired', label: 'Lelah / Butuh Rehat', icon: '🥱', color: 'bg-[#6B7280]/15 text-[#6B7280] border-[#6B7280]' },
  { id: 'stressed', label: 'Kewalahan / Cemas', icon: '😣', color: 'bg-[#FA5A50]/15 text-[#FA5A50] border-[#FA5A50]' },
];

export const JournalView: React.FC<JournalViewProps> = ({ entries, onSaveEntry }) => {
  const today = new Date().toISOString().split('T')[0];
  const existingToday = entries.find((e) => e.date === today);

  const [promptIndex, setPromptIndex] = useState(0);
  const [content, setContent] = useState(existingToday?.content || '');
  const [mood, setMood] = useState<MoodType>(existingToday?.mood || 'good');
  const [prompt, setPrompt] = useState(existingToday?.prompt || ROTATING_PROMPTS[0]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  // Sync if prop changes
  useEffect(() => {
    if (existingToday) {
      setContent(existingToday.content);
      setMood(existingToday.mood);
      setPrompt(existingToday.prompt);
    }
  }, [existingToday]);

  // Debounced auto-save (500ms)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setSaveStatus('saving');
    const timer = setTimeout(() => {
      onSaveEntry({
        id: existingToday?.id || `j-${today}`,
        date: today,
        prompt,
        content,
        mood,
        updatedAt: new Date().toISOString(),
      });
      setSaveStatus('saved');
    }, 550);

    return () => clearTimeout(timer);
  }, [content, mood, prompt]);

  const handleRotatePrompt = () => {
    const nextIdx = (promptIndex + 1) % ROTATING_PROMPTS.length;
    setPromptIndex(nextIdx);
    setPrompt(ROTATING_PROMPTS[nextIdx]);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F9] pb-28 pt-4 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A2E]">Jurnal Harian</h1>
          <p className="text-xs text-[#6B7280]">
            Satu catatan hening per hari untuk menyaring pikiran.
          </p>
        </div>

        {/* Quiet "Saved" status indicator (Section 4) */}
        <div className="h-6 flex items-center">
          <AnimatePresence>
            {saveStatus === 'saved' && (
              <motion.span
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[11px] font-semibold text-[#3FB876] flex items-center gap-1 bg-[#3FB876]/10 px-2 py-0.5 rounded-full"
              >
                <Check className="w-3 h-3" />
                Tersimpan
              </motion.span>
            )}
            {saveStatus === 'saving' && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[11px] text-[#6B7280]"
              >
                Menyimpan...
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Today's Entry Box */}
      <div className="bg-white p-5 rounded-3xl border border-black/[0.05] shadow-xs mb-5">
        {/* Mood Selector Row */}
        <div className="mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block mb-2">
            Bagaimana energimu hari ini?
          </span>
          <div className="grid grid-cols-5 gap-1.5">
            {MOODS.map((m) => {
              const active = mood === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMood(m.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all ${
                    active
                      ? `${m.color} ring-2 ring-[#6C5CE7]/20 font-bold scale-105`
                      : 'border-black/[0.05] bg-[#F5F5F9] text-[#6B7280] hover:bg-white'
                  }`}
                >
                  <span className="text-xl mb-0.5">{m.icon}</span>
                  <span className="text-[9px] text-center leading-tight truncate w-full">
                    {m.label.split('/')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Prompt Card */}
        <div className="p-3.5 bg-[#6C5CE7]/8 rounded-2xl border border-[#6C5CE7]/15 mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C5CE7]">
              Pertanyaan Refleksi
            </span>
            <button
              type="button"
              onClick={handleRotatePrompt}
              className="text-[#6C5CE7] hover:text-[#5b4bc7] p-1 rounded-full hover:bg-white/50"
              title="Ganti pertanyaan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs font-semibold text-[#1A1A2E] leading-relaxed">
            "{prompt}"
          </p>
        </div>

        {/* Journal Textarea with Debounced Auto-Save */}
        <div>
          <textarea
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tulis apa saja yang terlintas. Tidak perlu rapi atau formal..."
            className="w-full p-3.5 bg-[#F5F5F9] rounded-2xl text-xs text-[#1A1A2E] leading-relaxed font-medium focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 border border-black/[0.04]"
          />
          <div className="flex items-center justify-between text-[11px] text-[#6B7280] mt-1.5 px-1">
            <span>{content.trim().split(/\s+/).filter(Boolean).length} kata</span>
            <span>Otomatis tersimpan</span>
          </div>
        </div>
      </div>

      {/* Past Entries Browsable in Reverse Chronological List */}
      <div>
        <h2 className="text-sm font-bold text-[#1A1A2E] mb-3">Arsip Catatan Lalu</h2>

        {entries.length === 0 ? (
          <div className="bg-white p-6 rounded-3xl border border-black/[0.05] text-center text-xs text-[#6B7280]">
            Belum ada catatan sebelumnya. Mulai dengan satu refleksi hari ini!
          </div>
        ) : (
          <div className="space-y-2.5">
            {entries.map((entry) => {
              const isExpanded = expandedEntryId === entry.id;
              const moodInfo = MOODS.find((m) => m.id === entry.mood) || MOODS[1];

              return (
                <div
                  key={entry.id}
                  onClick={() => setExpandedEntryId(isExpanded ? null : entry.id)}
                  className="bg-white p-3.5 rounded-2xl border border-black/[0.05] shadow-xs cursor-pointer hover:border-[#6C5CE7]/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{moodInfo.icon}</span>
                      <div>
                        <span className="text-xs font-bold text-[#1A1A2E] block">
                          {entry.date}
                        </span>
                        <span className="text-[10px] text-[#6B7280]">
                          {moodInfo.label}
                        </span>
                      </div>
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#6B7280]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                    )}
                  </div>

                  {/* Expanded content */}
                  {isExpanded ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-black/[0.05]"
                    >
                      <p className="text-[11px] font-semibold text-[#6C5CE7] mb-1">
                        "{entry.prompt}"
                      </p>
                      <p className="text-xs text-[#1A1A2E] whitespace-pre-wrap leading-relaxed">
                        {entry.content || '(Tidak ada teks tertulis)'}
                      </p>
                    </motion.div>
                  ) : (
                    <p className="text-xs text-[#6B7280] line-clamp-1 mt-2">
                      {entry.content || '(Tidak ada teks tertulis)'}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
