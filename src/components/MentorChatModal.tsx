import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  RefreshCw,
  Compass,
  Zap,
  Brain,
  MessageSquare,
} from 'lucide-react';
import { UserProfile, ChatMessage } from '../types';
import { playTextToSpeech, stopAudioPlayback } from '../utils/tts';

interface MentorChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

function getStageChatConfig(user: UserProfile) {
  const firstName = user.name ? user.name.split(' ')[0] : 'Teman';
  const stage = user.stage;

  switch (stage) {
    case 'High school grad':
      return {
        initialGreeting: `Halo ${firstName}! Senang bisa ngobrol santai. Sebagai teman diskusimu di fase transisi lulus SMA / gap year, apa yang lagi paling mengganjal di pikiranmu? Menimbang kampus impian vs jurusan, bingung mulai portofolio dari nol, atau kesiapan biaya kuliah?`,
        suggestedQuestions: [
          'Lebih baik pilih kampus top atau jurusan impian?',
          'Minder belum ada portofolio, mulai dari mana?',
          'Tips biar masa gap year terarah dan tetap produktif?',
        ],
      };

    case 'Semester 1–2':
      return {
        initialGreeting: `Halo ${firstName}! Senang bisa ngobrol santai. Di Semester 1–2 ini adaptasi ritme kuliah memang sering bikin kaget. Apa yang lagi kamu rasakan? Penyesuaian tugas dosen, menjaga IPK di atas 3.50, atau menyeimbangkan organisasi kampus?`,
        suggestedQuestions: [
          'Cara menjaga IPK aman sambil tetap aktif berorganisasi?',
          'Trik adaptasi gaya belajar kampus yang serba mandiri?',
          'Kapan waktu ideal mulai memikirkan portofolio?',
        ],
      };

    case 'Semester 3–4':
      return {
        initialGreeting: `Halo ${firstName}! Senang bisa ngobrol santai. Di Semester 3–4 ini saatnya kita mulai bangun bukti karya nyata (Proof of Work). Ada kebingungan seputar mulai proyek mandiri, cari freelance pertama, atau minder belum ada pengalaman kerja?`,
        suggestedQuestions: [
          'Minder belum ada pengalaman, gimana cara mulai portofolio?',
          'Tips dapat freelance atau project sampingan pertama?',
          'Lomba atau kompetisi apa yang cocok buat semester 3–4?',
        ],
      };

    case 'Semester 5–6':
      return {
        initialGreeting: `Halo ${firstName}! Senang bisa ngobrol santai. Di Semester 5–6 fokus kita biasanya magang formal industri dan mulai melirik topik tugas akhir. Mau diskusi soal lolos seleksi magang, networking praktisi, atau persiapan skripsi?`,
        suggestedQuestions: [
          'Strategi lolos seleksi magang formal (MSIB / korporat)?',
          'Cara mulai cari topik skripsi yang realistis selesai?',
          'Tips networking ke praktisi industri lewat LinkedIn?',
        ],
      };

    case 'Semester 7':
      return {
        initialGreeting: `Halo ${firstName}! Senang bisa ngobrol santai. Di Semester 7 ini tantangan utamanya adalah konsistensi naskah skripsi dan persiapan kerja. Mau bedah pacing skripsimu, bedah CV ATS, atau strategi bidik lowongan Management Trainee?`,
        suggestedQuestions: [
          'Tips konsisten nulis 500 kata skripsi tanpa burnout?',
          'Gimana cara menyusun CV ATS yang dilirik recruiter?',
          'Strategi bidik lowongan MT sebelum wisuda?',
        ],
      };

    case 'Semester 8':
      return {
        initialGreeting: `Halo ${firstName}! Senang bisa ngobrol santai. Di Semester 8 ini garis finis sudah di depan mata. Mau diskusi seputar persiapan sidang skripsi, negosiasi penawaran kerja (offering), atau kesiapan mental transisi fresh graduate?`,
        suggestedQuestions: [
          'Simulasi mental menghadapi sidang skripsi?',
          'Cara negosiasi gaji pertama fresh graduate?',
          'Strategi melamar kerja efektif 2 bulan sebelum wisuda?',
        ],
      };

    case 'Already working':
      return {
        initialGreeting: `Halo ${firstName}! Senang bisa ngobrol santai. Sebagai teman diskusimu di dunia kerja, apa yang lagi kita hadapi? Evaluasi masa probation, alokasi gaji dan dana darurat 3 bulan, atau rencana upskilling untuk percepat promosi?`,
        suggestedQuestions: [
          'Tips lolos probation 90 hari dengan impresi memuaskan?',
          'Cara alokasi gaji pertama & bangun dana darurat 3 bulan?',
          'Gimana cara upskilling konsisten di tengah jam kerja?',
        ],
      };

    default:
      return {
        initialGreeting: `Halo ${firstName}! Senang bisa ngobrol santai. Sebagai teman diskusimu di fase ${stage}, apa yang lagi paling ingin kamu diskusikan hari ini seputar studi, portofolio, atau rencana karier?`,
        suggestedQuestions: [
          'Tips konsisten menjaga progres harian?',
          'Cara bikin portofolio menarik walau minim pengalaman?',
          'Bagaimana cara membagi waktu antara kuliah & magang?',
        ],
      };
  }
}

function renderFormattedMessage(content: string, isModel: boolean) {
  if (!isModel) {
    return <p className="whitespace-pre-wrap leading-relaxed">{content}</p>;
  }

  // Split into paragraphs
  const paragraphs = content.split(/\n\s*\n/);
  return (
    <div className="space-y-2.5 text-xs text-[#1A1A2E] leading-relaxed">
      {paragraphs.map((para, pIdx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        // Parse bold segments **text**
        const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={pIdx} className="leading-relaxed">
            {parts.map((part, partIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={partIdx} className="font-semibold text-[#1A1A2E]">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
}

export const MentorChatModal: React.FC<MentorChatModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const stageConfig = getStageChatConfig(user);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'm-init',
      role: 'model',
      content: stageConfig.initialGreeting,
      timestamp: 'Baru saja',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [modelChoice, setModelChoice] = useState<'fast' | 'general' | 'complex'>('general');
  const [activeSpeechMsgId, setActiveSpeechMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Sync initial message when user stage changes if no custom conversation has taken place
  useEffect(() => {
    if (messages.length <= 1) {
      setMessages([
        {
          id: 'm-init',
          role: 'model',
          content: stageConfig.initialGreeting,
          timestamp: 'Baru saja',
        },
      ]);
    }
  }, [user.stage, user.name]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setLoading(true);

    try {
      // Kirim pesan mulai dari giliran pengguna pertama
      const userIdx = newMessages.findIndex((m) => m.role === 'user');
      const messagesToSend = userIdx >= 0 ? newMessages.slice(userIdx) : newMessages;

      const res = await fetch('/api/mentor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesToSend.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          profile: user,
          modelChoice,
        }),
      });

      const data = await res.json().catch(() => ({}));
      const replyText =
        data.reply ||
        data.fallbackReply ||
        'Aku mengerti situasimu. Boleh ceritakan satu hal yang paling membuatmu ragu saat ini?';

      const modelMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        role: 'model',
        content: replyText,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err) {
      console.warn('Chat request fallback:', err);
      const fallbackMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        role: 'model',
        content:
          'Aku mengerti kegelisahanmu saat ini. Di masa transisi, wajar sekali merasa bimbang antara kampus impian dan jurusan yang tepat. Apa opsi terbesar yang lagi kamu timbang sekarang?',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleReadAloud = async (msgId: string, content: string) => {
    if (activeSpeechMsgId === msgId) {
      stopAudioPlayback();
      setActiveSpeechMsgId(null);
      return;
    }

    setActiveSpeechMsgId(msgId);
    await playTextToSpeech(content, {
      voiceName: 'Puck',
      style: 'Friendly, caring Indonesian peer mentor speaking naturally to friend',
      onStart: () => setActiveSpeechMsgId(msgId),
      onEnd: () => setActiveSpeechMsgId(null),
      onError: () => setActiveSpeechMsgId(null),
    });
  };

  const suggestedQuestions = stageConfig.suggestedQuestions;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md bg-[#F5F5F9] rounded-t-3xl sm:rounded-3xl h-[88vh] flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Top Header */}
        <div className="bg-white p-4 border-b border-black/[0.05] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6C5CE7] text-white flex items-center justify-center shadow-xs">
              <Compass className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1A1A2E] flex items-center gap-1.5">
                PocketMentor
                <span className="w-2 h-2 rounded-full bg-[#3FB876] animate-pulse" />
              </h2>
              <p className="text-[11px] text-[#6B7280]">
                Teman Diskusi • {user.stage}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopAudioPlayback();
              onClose();
            }}
            className="p-2 text-[#6B7280] hover:text-[#1A1A2E] rounded-full hover:bg-black/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Model Level Selector */}
        <div className="bg-white/90 px-4 py-2 border-b border-black/[0.05] flex items-center justify-between text-[11px]">
          <span className="text-[#6B7280] font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#6C5CE7]" />
            <span>Mode Diskusi:</span>
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setModelChoice('fast')}
              className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                modelChoice === 'fast'
                  ? 'bg-[#6C5CE7] text-white'
                  : 'bg-black/5 text-[#6B7280] hover:text-[#1A1A2E]'
              }`}
              title="gemini-3.1-flash-lite: Cepat dan ringkas"
            >
              Lite
            </button>
            <button
              type="button"
              onClick={() => setModelChoice('general')}
              className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                modelChoice === 'general'
                  ? 'bg-[#6C5CE7] text-white'
                  : 'bg-black/5 text-[#6B7280] hover:text-[#1A1A2E]'
              }`}
              title="gemini-3.5-flash: Seimbang & alami"
            >
              Flash
            </button>
            <button
              type="button"
              onClick={() => setModelChoice('complex')}
              className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                modelChoice === 'complex'
                  ? 'bg-[#6C5CE7] text-white'
                  : 'bg-black/5 text-[#6B7280] hover:text-[#1A1A2E]'
              }`}
              title="gemini-3.1-pro-preview: Analisis mendalam & komprehensif"
            >
              Pro
            </button>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((m) => {
            const isModel = m.role === 'model';
            const isSpeaking = activeSpeechMsgId === m.id;

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isModel ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs relative ${
                    isModel
                      ? 'bg-white text-[#1A1A2E] rounded-tl-xs border border-black/[0.04]'
                      : 'bg-[#6C5CE7] text-white rounded-tr-xs'
                  }`}
                >
                  {renderFormattedMessage(m.content, isModel)}

                  {/* Read Aloud Button & Timestamp on Model Answers */}
                  {isModel && (
                    <div className="mt-2.5 pt-2 border-t border-black/[0.05] flex items-center justify-between">
                      <span className="text-[10px] text-[#6B7280]">{m.timestamp}</span>
                      <button
                        type="button"
                        onClick={() => handleReadAloud(m.id, m.content)}
                        className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md transition-colors ${
                          isSpeaking
                            ? 'bg-[#FA5A50] text-white animate-pulse'
                            : 'text-[#6C5CE7] hover:bg-[#6C5CE7]/10'
                        }`}
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX className="w-3 h-3" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span>Dengarkan</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {!isModel && (
                    <div className="mt-1 text-right">
                      <span className="text-[9px] text-white/70">{m.timestamp}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 p-3 bg-white rounded-2xl w-fit shadow-xs border border-black/[0.04]">
              <RefreshCw className="w-3.5 h-3.5 text-[#6C5CE7] animate-spin" />
              <span className="text-xs text-[#6B7280] font-medium">
                Mentor sedang memikirkan sudut pandang terbaik...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Prompts */}
        <div className="px-4 py-2 bg-white/70 overflow-x-auto no-scrollbar flex gap-2 border-t border-black/[0.04]">
          {suggestedQuestions.map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(q)}
              className="shrink-0 text-[11px] font-medium px-3 py-1.5 bg-white border border-black/[0.08] hover:border-[#6C5CE7] rounded-full text-[#1A1A2E] truncate max-w-[240px] shadow-2xs transition-all hover:bg-[#6C5CE7]/5 active:scale-95"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-black/[0.05]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ceritakan situasimu atau tanyakan apa saja..."
              className="flex-1 bg-[#F5F5F9] px-4 py-2.5 rounded-full text-xs text-[#1A1A2E] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 border border-transparent focus:border-[#6C5CE7]"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="w-9 h-9 rounded-full bg-[#6C5CE7] disabled:opacity-40 text-white flex items-center justify-center shadow-xs hover:bg-[#5b4bc4] transition-all shrink-0 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
