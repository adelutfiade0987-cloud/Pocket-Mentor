import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  Lock,
  Mail,
  UserPlus,
  LogIn,
  Eye,
  EyeOff,
  Shield,
  Apple,
} from 'lucide-react';
import { UserProfile } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: Partial<UserProfile>, isNewUser: boolean) => void;
  onBackToIntro?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onBackToIntro }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [curtainActive, setCurtainActive] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<'existing' | 'new'>('existing');

  const executeLogin = (userData: Partial<UserProfile>, isNew: boolean) => {
    setLoading(true);
    setTimeout(() => {
      setCurtainActive(true);
      setTimeout(() => {
        onLoginSuccess(userData, isNew);
      }, 350);
    }, 850);
  };

  const handleGoogleSignIn = () => {
    if (loading) return;
    executeLogin(
      selectedDemo === 'new' || authMode === 'signup'
        ? {
            id: 'user_' + Date.now(),
            name: email.split('@')[0] || 'Adelia Putri',
            email: email || 'adelia.putri@gmail.com',
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
            onboarded: false,
          }
        : {
            id: 'user_default',
            name: 'Dimas Pratama',
            email: 'dimas.pratama@gmail.com',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            origin: 'Bandung',
            stage: 'Semester 7',
            collegeSemester: 7,
            major: 'Ilmu Komunikasi & Media Digital',
            interests: ['Penulisan Kreatif', 'Desain UI/UX', 'Content Creation'],
            careerDirection: 'Creative Strategist di Startup',
            desiredContribution: 'Membantu brand menyampaikan cerita otentik',
            focusAreas: ['Career & job prep', 'Daily habits & goals', 'Journaling & reflection'],
            onboarded: true,
          },
      selectedDemo === 'new' || authMode === 'signup'
    );
  };

  const handleEmailAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() && !password.trim()) {
      handleGoogleSignIn();
      return;
    }
    executeLogin(
      {
        id: 'usr_' + Date.now(),
        name: email.split('@')[0] || 'Pengguna Baru',
        email: email || 'user@example.com',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        onboarded: authMode === 'signin' && selectedDemo === 'existing',
      },
      authMode === 'signup' || selectedDemo === 'new'
    );
  };

  return (
    <div className="relative min-h-screen bg-[#F5F5F9] flex flex-col justify-between p-6 overflow-hidden max-w-md mx-auto select-none">
      {/* Full screen purple curtain wash animation */}
      <AnimatePresence>
        {curtainActive && (
          <motion.div
            initial={{ scaleY: 0, originY: 1 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0, originY: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 bg-[#6C5CE7]"
          />
        )}
      </AnimatePresence>

      {/* Top Header */}
      <div className="pt-2 flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-16 h-16 rounded-3xl bg-[#6C5CE7] text-white flex items-center justify-center shadow-lg shadow-[#6C5CE7]/25 mb-3"
        >
          <Compass className="w-8 h-8 stroke-[2.2]" />
        </motion.div>

        <h1 className="text-2xl font-bold tracking-tight text-[#1A1A2E] mb-1">
          PocketMentor
        </h1>
        <p className="text-xs text-[#6B7280] font-medium max-w-[280px]">
          Masuk atau buat akun agar data roadmap, target, dan jurnalmu tersimpan personal.
        </p>
      </div>

      {/* Auth Container with Tabs */}
      <div className="my-auto py-4 space-y-4">
        {/* Sign In vs Sign Up Tabs */}
        <div className="flex bg-white p-1 rounded-2xl border border-black/[0.05] shadow-xs text-xs font-semibold">
          <button
            type="button"
            onClick={() => setAuthMode('signin')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              authMode === 'signin'
                ? 'bg-[#6C5CE7] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#1A1A2E]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Masuk Akun</span>
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('signup')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              authMode === 'signup'
                ? 'bg-[#6C5CE7] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#1A1A2E]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Daftar Baru</span>
          </button>
        </div>

        {/* Demo Account Switcher for Instant Testing */}
        <div className="bg-[#6C5CE7]/8 border border-[#6C5CE7]/15 p-2.5 rounded-2xl flex items-center justify-between text-[11px]">
          <span className="font-semibold text-[#6C5CE7]">Mode Uji Coba Cepat:</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedDemo('existing')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                selectedDemo === 'existing'
                  ? 'bg-[#6C5CE7] text-white'
                  : 'bg-white text-[#6B7280] border border-black/[0.06]'
              }`}
            >
              Demo Dimas (Sem 7)
            </button>
            <button
              type="button"
              onClick={() => setSelectedDemo('new')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                selectedDemo === 'new'
                  ? 'bg-[#6C5CE7] text-white'
                  : 'bg-white text-[#6B7280] border border-black/[0.06]'
              }`}
            >
              Kuesioner Baru
            </button>
          </div>
        </div>

        {/* Email & Password Input Form */}
        <form onSubmit={handleEmailAuthSubmit} className="bg-white p-4 rounded-3xl border border-black/[0.05] shadow-xs space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-[#1A1A2E] mb-1">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-9 pr-3 py-2.5 bg-[#F5F5F9] rounded-xl text-xs text-[#1A1A2E] font-medium focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30"
              />
              <Mail className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#1A1A2E] mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter..."
                className="w-full pl-9 pr-10 py-2.5 bg-[#F5F5F9] rounded-xl text-xs text-[#1A1A2E] font-medium focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30"
              />
              <Lock className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-[#6B7280] hover:text-[#1A1A2E] absolute right-2.5 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#1A1A2E] hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
          >
            <span>{authMode === 'signin' ? 'Masuk dengan Email' : 'Daftar Akun Baru'}</span>
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-black/[0.08]" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
            atau masuk dengan
          </span>
          <div className="flex-1 h-px bg-black/[0.08]" />
        </div>

        {/* Primary Google Sign-In Button (Section 2.2) */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={`w-full h-14 rounded-full bg-[#6C5CE7] text-white font-semibold text-base flex items-center justify-center shadow-lg shadow-[#6C5CE7]/30 transition-shadow ${
            loading ? 'opacity-90' : 'animate-breathing hover:shadow-xl'
          }`}
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <span>Lanjut dengan Google</span>
            </div>
          )}
        </motion.button>
      </div>

      {/* Bottom Privacy & Trust marker */}
      <div className="pt-2 text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#3FB876]">
          <Shield className="w-3.5 h-3.5" />
          <span>Privasi Terjamin & Data Pribadi Terisolasi</span>
        </div>
        <p className="text-[10px] text-[#6B7280]">
          Dengan masuk, kamu menyetujui ketentuan bimbingan pribadi PocketMentor.
        </p>
      </div>
    </div>
  );
};
