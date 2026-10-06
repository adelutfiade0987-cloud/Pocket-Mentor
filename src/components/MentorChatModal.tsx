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
} from 'lucide-react';
import { UserProfile, ChatMessage } from '../types';
import { playTextToSpeech, stopAudioPlayback } from '../utils/tts';

interface MentorChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export const MentorChatModal: React.FC<MentorChatModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-init',
      role: 'model',
      content: `Halo ${user.name.split(' ')[0]}! Senang bisa ngobrol langsung. Sebagai mentormu di fase ${user.stage}, apa yang lagi paling mengganjal atau ingin kamu diskusikan hari ini? Skripsi, persiapan magang, atau rencana karier?`,
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
      const res = await fetch('/api/mentor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          profile: user,
          modelChoice,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const modelMsg: ChatMessage = {
          id: 'bot-' + Date.now(),
          role: 'model',
          content: data.reply || 'Ada yang bisa kubantu lagi?',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, modelMsg]);
      } else {
        throw new Error('Chat failed');
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        role: 'model',
        content:
          'Maaf, koneksi ke mentor terputus sebentar. Tapi tenang, langkahmu sudah di arah yang benar. Coba tanyakan lagi ya!',
        timestamp: 'Baru saja',
      };
      setMessages((prev) => [...prev, errorMsg]);
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
      style: 'Friendly, caring Indonesian older mentor speaking directly to younger friend',
      onStart: () => setActiveSpeechMsgId(msgId),
      onEnd: () => setActiveSpeechMsgId(null),
      onError: () => setActiveSpeechMsgId(null),
    });
  };

  const suggestedQuestions = [
    'Tips konsisten nulis 500 kata skripsi tiap hari?',
    'Cara bikin portofolio menarik walau minim pengalaman?',
    'Bagaimana cara membagi waktu antara kuliah & magang?',
  ];

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
                <span>Tanya PocketMentor</span>
                <span className="w-2 h-2 rounded-full bg-[#3FB876]" />
              </h2>
              <p className="text-[11px] text-[#6B7280]">
                {user.stage} · {user.major || user.careerDirection || 'Pendamping Belajar'}
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
          <span className="text-[#6B7280] font-medium">Model Intelijen:</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setModelChoice('fast')}
              className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                modelChoice === 'fast'
                  ? 'bg-[#6C5CE7] text-white'
                  : 'bg-black/5 text-[#6B7280] hover:text-[#1A1A2E]'
              }`}
              title="gemini-3.1-flash-lite: Cepat dan hemat"
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
              title="gemini-3.5-flash: Seimbang untuk tugas umum"
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
              title="gemini-3.1-pro-preview: Pemikiran mendalam & analisis rumit"
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
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs relative ${
                    isModel
                      ? 'bg-white text-[#1A1A2E] rounded-tl-xs border border-black/[0.04]'
                      : 'bg-[#6C5CE7] text-white rounded-tr-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>

                  {/* Read Aloud Button on Model Answers */}
                  {isModel && (
                    <div className="mt-2 pt-2 border-t border-black/[0.05] flex items-center justify-between">
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
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 p-3 bg-white rounded-2xl w-fit shadow-xs border border-black/[0.04]">
              <RefreshCw className="w-3.5 h-3.5 text-[#6C5CE7] animate-spin" />
              <span className="text-xs text-[#6B7280] font-medium">
                Mentor sedang memikirkan saran terbaik...
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
              className="shrink-0 text-[11px] font-medium px-3 py-1 bg-white border border-black/[0.08] hover:border-[#6C5CE7] rounded-full text-[#1A1A2E] truncate max-w-[220px]"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Field */}
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
              placeholder="Ketik pertanyaan atau unek-unekmu..."
              className="flex-1 px-4 py-3 bg-[#F5F5F9] rounded-2xl text-xs text-[#1A1A2E] font-medium focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 border border-black/[0.05]"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="w-11 h-11 rounded-2xl bg-[#6C5CE7] hover:bg-[#5b4bc7] text-white flex items-center justify-center shrink-0 disabled:opacity-40 transition-all shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
