import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass } from 'lucide-react';

interface SplashViewProps {
  onFinish: () => void;
}

export const SplashView: React.FC<SplashViewProps> = ({ onFinish }) => {
  const [stage, setStage] = useState<'initial' | 'wake' | 'done'>('initial');

  useEffect(() => {
    // Wake transition after 500ms
    const t1 = setTimeout(() => {
      setStage('wake');
    }, 500);

    // Complete splash after 2200ms
    const t2 = setTimeout(() => {
      setStage('done');
      onFinish();
    }, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onFinish]);

  const words = ['Your', 'mentor,', 'always', 'in', 'your', 'pocket.'];

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-colors duration-700 ease-out px-6 ${
        stage === 'initial' ? 'bg-[#6C5CE7]' : 'bg-[#F5F5F9]'
      }`}
    >
      {/* App Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
          duration: 0.5,
        }}
        className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl transition-colors duration-500 mb-6 ${
          stage === 'initial'
            ? 'bg-white text-[#6C5CE7]'
            : 'bg-[#6C5CE7] text-white shadow-[#6C5CE7]/20'
        }`}
      >
        <Compass className="w-10 h-10 stroke-[2.2]" />
      </motion.div>

      {/* Brand Name */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className={`text-2xl font-bold tracking-tight mb-3 transition-colors duration-500 ${
          stage === 'initial' ? 'text-white' : 'text-[#1A1A2E]'
        }`}
      >
        PocketMentor
      </motion.h1>

      {/* Kinetic Typography */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-xs text-center">
        {words.map((word, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.5 + i * 0.05,
              duration: 0.35,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`text-sm font-medium transition-colors duration-500 ${
              stage === 'initial' ? 'text-white/85' : 'text-[#6B7280]'
            }`}
          >
            {word}
          </motion.span>
        ))}
      </div>
    </div>
  );
};
