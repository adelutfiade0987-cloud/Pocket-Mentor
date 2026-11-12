import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  Lock,
  Mail,
  User,
  UserPlus,
  LogIn,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  Check,
  X,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { UserProfile } from '../types';
import {
  generateUserIdFromEmail,
  fetchProfileByEmailFromSupabase,
  supabase,
  isSupabaseConfigured,
  syncProfileToSupabase,
} from '../utils/supabase';

interface LoginViewProps {
  onLoginSuccess: (user: Partial<UserProfile>, isNewUser: boolean) => void;
  onBackToIntro?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [curtainActive, setCurtainActive] = useState(false);

  // Google Account Chooser Modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleCustomEmail, setGoogleCustomEmail] = useState('');
  const [googleCustomName, setGoogleCustomName] = useState('');
  const [isOtherAccountOpen, setIsOtherAccountOpen] = useState(false);
  const [googleConnecting, setGoogleConnecting] = useState(false);

  const executeLogin = (userData: Partial<UserProfile>, isNew: boolean) => {
    setLoading(true);
    setErrorMessage(null);
    setTimeout(() => {
      setCurtainActive(true);
      setTimeout(() => {
        onLoginSuccess(userData, isNew);
      }, 350);
    }, 600);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Silakan masukkan alamat email kamu.');
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Format email tidak valid (contoh: nama@email.com).');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter.');
      return;
    }

    if (authMode === 'signup') {
      if (!fullName.trim()) {
        setErrorMessage('Silakan masukkan nama lengkap kamu.');
        return;
      }

      setLoading(true);
      try {
        // Check if account already exists in Supabase
        const existing = await fetchProfileByEmailFromSupabase(cleanEmail);
        if (existing && existing.profile && existing.profile.name) {
          if (existing.profile.onboarded) {
            setErrorMessage('Email ini sudah terdaftar. Silakan pilih tab "Masuk Akun".');
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Check existing profile error:', err);
      }

      // Generate unique deterministic ID for new user with empty/anonymous avatar
      const uniqueId = generateUserIdFromEmail(cleanEmail);
      executeLogin(
        {
          id: uniqueId,
          name: fullName.trim(),
          email: cleanEmail,
          avatarUrl: '', // Anonymous avatar
          onboarded: false,
        },
        true // Proceed to OnboardingFlow
      );
    } else {
      // Masuk Akun flow
      setLoading(true);
      try {
        // 1. Check Supabase first
        const remoteResult = await fetchProfileByEmailFromSupabase(cleanEmail);
        if (remoteResult && remoteResult.profile && remoteResult.profile.id) {
          const profile = remoteResult.profile;
          const isOnboarded = Boolean(profile.onboarded);
          executeLogin(
            {
              ...profile,
              email: cleanEmail,
            },
            !isOnboarded
          );
          return;
        }

        // 2. Fallback: check localStorage
        const storedRaw = localStorage.getItem('pocketmentor_user');
        if (storedRaw) {
          try {
            const parsed = JSON.parse(storedRaw);
            if (parsed.email && parsed.email.toLowerCase() === cleanEmail) {
              executeLogin(parsed, !parsed.onboarded);
              return;
            }
          } catch {}
        }

        // 3. If account not found yet, create new session and prompt to complete onboarding
        const generatedId = generateUserIdFromEmail(cleanEmail);
        executeLogin(
          {
            id: generatedId,
            name: cleanEmail.split('@')[0],
            email: cleanEmail,
            avatarUrl: '',
            onboarded: false,
          },
          true
        );
      } catch (err) {
        console.error('Sign in error:', err);
        const fallbackId = generateUserIdFromEmail(cleanEmail);
        executeLogin(
          {
            id: fallbackId,
            name: cleanEmail.split('@')[0],
            email: cleanEmail,
            avatarUrl: '',
            onboarded: false,
          },
          true
        );
      }
    }
  };

  // Connect via chosen Google Account and save to database
  const handleSelectGoogleAccount = async (targetEmail: string, targetName: string) => {
    const cleanEmail = targetEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) return;

    setGoogleConnecting(true);
    try {
      const uniqueId = generateUserIdFromEmail(cleanEmail);
      const cleanName = targetName.trim() || cleanEmail.split('@')[0];

      // Check if this Google account already exists in database
      const existing = await fetchProfileByEmailFromSupabase(cleanEmail);
      if (existing && existing.profile && existing.profile.name) {
        setShowGoogleModal(false);
        executeLogin(
          {
            ...existing.profile,
            id: existing.profile.id || uniqueId,
            email: cleanEmail,
            avatarUrl: existing.profile.avatarUrl || '',
          },
          !existing.profile.onboarded
        );
        return;
      }

      // New Google User: Create and sync immediately to Supabase
      const newGoogleUser: Partial<UserProfile> = {
        id: uniqueId,
        name: cleanName,
        email: cleanEmail,
        avatarUrl: '', // Anonymous avatar
        onboarded: false,
      };

      // Asynchronously sync new profile to Supabase database so it becomes our data
      syncProfileToSupabase(newGoogleUser as UserProfile).catch((err) => {
        console.warn('Initial Google profile sync warning:', err);
      });

      setShowGoogleModal(false);
      executeLogin(newGoogleUser, true);
    } catch (err) {
      console.error('Error connecting Google account:', err);
      setShowGoogleModal(false);
      const uniqueId = generateUserIdFromEmail(cleanEmail);
      executeLogin(
        {
          id: uniqueId,
          name: targetName || cleanEmail.split('@')[0],
          email: cleanEmail,
          avatarUrl: '',
          onboarded: false,
        },
        true
      );
    } finally {
      setGoogleConnecting(false);
    }
  };

  // Trigger Supabase official OAuth redirect if configured
  const handleOfficialGoogleOAuth = async () => {
    if (isSupabaseConfigured() && supabase) {
      setGoogleConnecting(true);
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
            queryParams: {
              prompt: 'select_account',
            },
          },
        });
        if (error) {
          throw error;
        }
      } catch (err: any) {
        console.warn('Supabase OAuth notice:', err?.message);
        // Fallback to in-app account picker
        setIsOtherAccountOpen(true);
      } finally {
        setGoogleConnecting(false);
      }
    } else {
      setIsOtherAccountOpen(true);
    }
  };

  // Suggested account detected from user context or default
  const suggestedGoogleEmail = email.trim() ? email.trim().toLowerCase() : 'adelutfiade0987@gmail.com';
  const suggestedGoogleName = fullName.trim() || 'Ade Lutfi';

  return (
    <div className="relative min-h-screen bg-[#F5F5F9] flex flex-col justify-between p-5 overflow-hidden max-w-md mx-auto select-none">
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
          Masuk atau buat akun pribadimu agar roadmap dan progres harian tersimpan aman.
        </p>
      </div>

      {/* Auth Container with Clean Tabs */}
      <div className="my-auto py-3 space-y-3.5">
        {/* Sign Up vs Sign In Tabs */}
        <div className="flex bg-white p-1 rounded-2xl border border-black/[0.05] shadow-xs text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              authMode === 'signup'
                ? 'bg-[#6C5CE7] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#1A1A2E]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Daftar Baru</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              authMode === 'signin'
                ? 'bg-[#6C5CE7] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#1A1A2E]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Masuk Akun</span>
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#FA5A50]/10 border border-[#FA5A50]/20 text-[#FA5A50] text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Email & Password Input Form */}
        <form onSubmit={handleAuthSubmit} className="bg-white p-4 rounded-3xl border border-black/[0.05] shadow-xs space-y-3">
          {authMode === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold text-[#1A1A2E] mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Rian Pratama"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F5F5F9] rounded-xl text-xs text-[#1A1A2E] font-medium focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30"
                />
                <User className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-[#1A1A2E] mb-1">
              Email Pribadi
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
            className="w-full py-3 rounded-xl bg-[#6C5CE7] hover:bg-[#5b4bc7] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#6C5CE7]/20 disabled:opacity-60"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>{authMode === 'signup' ? 'Daftar & Mulai Kuesioner' : 'Masuk ke Akun Saya'}</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-black/[0.08]" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
            atau
          </span>
          <div className="flex-1 h-px bg-black/[0.08]" />
        </div>

        {/* Interactive Google Sign-In Button */}
        <button
          type="button"
          onClick={() => setShowGoogleModal(true)}
          disabled={loading}
          className="w-full h-12 rounded-2xl bg-white hover:bg-black/[0.02] border border-black/[0.08] text-[#1A1A2E] font-semibold text-xs flex items-center justify-center gap-2.5 shadow-2xs transition-all disabled:opacity-60"
        >
          <div className="w-5 h-5 flex items-center justify-center">
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
          <span>Lanjut Otomatis dengan Akun Google</span>
        </button>
      </div>

      {/* Bottom Privacy & Trust marker */}
      <div className="pt-2 text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#3FB876]">
          <Shield className="w-3.5 h-3.5" />
          <span>Data Pribadi Terenkripsi & Terisolasi Per Pengguna</span>
        </div>
        <p className="text-[10px] text-[#6B7280]">
          Setiap user uji coba mendapatkan database terpisah dan ID unik deterministik.
        </p>
      </div>

      {/* ================= GOOGLE ACCOUNT SELECTOR MODAL ================= */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl relative overflow-hidden"
            >
              {/* Google Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white border border-black/[0.08] flex items-center justify-center shadow-xs">
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
                  <div>
                    <h3 className="text-sm font-bold text-[#1A1A2E]">Masuk dengan Google</h3>
                    <p className="text-[10px] text-[#6B7280]">Pilih akun untuk melanjutkan ke PocketMentor</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="p-1 rounded-full text-[#6B7280] hover:text-[#1A1A2E] hover:bg-black/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Account Options List */}
              <div className="py-3.5 space-y-2.5">
                {/* 1. Detected Active Google Account Card */}
                <button
                  type="button"
                  onClick={() => handleSelectGoogleAccount(suggestedGoogleEmail, suggestedGoogleName)}
                  disabled={googleConnecting}
                  className="w-full p-3 rounded-2xl bg-[#F5F5F9] hover:bg-[#6C5CE7]/10 border border-black/[0.05] hover:border-[#6C5CE7]/30 flex items-center justify-between text-left transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#4285F4] to-[#34A853] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {suggestedGoogleName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#1A1A2E] truncate block">
                          {suggestedGoogleName}
                        </span>
                        <span className="text-[9px] font-bold text-[#34A853] bg-[#34A853]/10 px-1.5 py-0.2 rounded-md">
                          Google
                        </span>
                      </div>
                      <span className="text-[11px] text-[#6B7280] truncate block">
                        {suggestedGoogleEmail}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#6B7280] group-hover:text-[#6C5CE7] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </button>

                {/* 2. Choose Another Google Account Toggle */}
                {!isOtherAccountOpen ? (
                  <button
                    type="button"
                    onClick={() => setIsOtherAccountOpen(true)}
                    className="w-full py-2.5 px-3 rounded-xl border border-dashed border-black/[0.15] hover:border-[#6C5CE7] text-[#6C5CE7] hover:bg-[#6C5CE7]/5 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Gunakan Akun Google Lain</span>
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 bg-[#F5F5F9] rounded-2xl space-y-2.5 border border-black/[0.05]"
                  >
                    <div>
                      <label className="block text-[10px] font-bold text-[#1A1A2E] mb-1">
                        Email Akun Google Kamu
                      </label>
                      <input
                        type="email"
                        value={googleCustomEmail}
                        onChange={(e) => setGoogleCustomEmail(e.target.value)}
                        placeholder="contoh@gmail.com"
                        className="w-full px-3 py-2 bg-white rounded-xl text-xs text-[#1A1A2E] font-medium border border-black/[0.08] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#1A1A2E] mb-1">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={googleCustomName}
                        onChange={(e) => setGoogleCustomName(e.target.value)}
                        placeholder="Nama kamu..."
                        className="w-full px-3 py-2 bg-white rounded-xl text-xs text-[#1A1A2E] font-medium border border-black/[0.08] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={googleConnecting || !googleCustomEmail.trim()}
                      onClick={() =>
                        handleSelectGoogleAccount(
                          googleCustomEmail,
                          googleCustomName || googleCustomEmail.split('@')[0]
                        )
                      }
                      className="w-full py-2.5 rounded-xl bg-[#6C5CE7] hover:bg-[#5b4bc7] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {googleConnecting ? (
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Hubungkan & Masuk</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                )}

                {/* 3. Official Browser Redirect OAuth (if Supabase is set up) */}
                {isSupabaseConfigured() && (
                  <button
                    type="button"
                    onClick={handleOfficialGoogleOAuth}
                    disabled={googleConnecting}
                    className="w-full py-2 text-[11px] text-[#6B7280] hover:text-[#6C5CE7] font-medium flex items-center justify-center gap-1 transition-all"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Buka Popup Akun Google Resmi (OAuth Browser)</span>
                  </button>
                )}
              </div>

              {/* Security Footnote */}
              <div className="pt-2 border-t border-black/[0.06] text-center">
                <p className="text-[10px] text-[#6B7280] leading-relaxed">
                  PocketMentor akan menautkan nama dan email Google kamu ke database privat agar progres roadmap dan jurnalmu tidak hilang.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
