import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  User,
  LogOut,
  Bell,
  Clock,
  Briefcase,
  Check,
  Compass,
  MapPin,
  Save,
} from 'lucide-react';
import { UserProfile, LifeStage } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onSignOut: () => void;
  onRevisitIntro?: () => void;
  onRevisitProfiling?: () => void;
}

const STAGES: LifeStage[] = [
  'High school grad',
  'Semester 1–2',
  'Semester 3–4',
  'Semester 5–6',
  'Semester 7',
  'Semester 8',
  'Already working',
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onSignOut,
  onRevisitIntro,
  onRevisitProfiling,
}) => {
  const [name, setName] = useState(user.name);
  const [origin, setOrigin] = useState(user.origin);
  const [stage, setStage] = useState<LifeStage>(user.stage);
  const [major, setMajor] = useState(user.major || '');
  const [careerDirection, setCareerDirection] = useState(user.careerDirection || '');
  const [reminderTime, setReminderTime] = useState(user.reminderTime || '20:00');
  const [bannerNotifications, setBannerNotifications] = useState(user.bannerNotifications ?? true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name: name.trim() || user.name,
      origin: origin.trim() || user.origin,
      stage,
      major: major.trim(),
      careerDirection: careerDirection.trim(),
      reminderTime,
      bannerNotifications,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md bg-white rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-4 border-b border-black/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#6C5CE7]" />
            <h2 className="text-base font-bold text-[#1A1A2E]">Profil & Pengaturan</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#6B7280] hover:text-[#1A1A2E] rounded-full hover:bg-black/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* User Account Info */}
          <div className="flex items-center gap-3 p-3 bg-[#F5F5F9] rounded-2xl">
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-[#1A1A2E] block truncate">{user.name}</span>
              <span className="text-[11px] text-[#6B7280] block truncate">{user.email}</span>
            </div>
          </div>

          {/* Edit Name */}
          <div>
            <label className="block text-xs font-bold text-[#1A1A2E] mb-1">Nama Panggilan</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F5F5F9] rounded-xl text-xs font-medium text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30"
            />
          </div>

          {/* Edit Origin City */}
          <div>
            <label className="block text-xs font-bold text-[#1A1A2E] mb-1">Kota Asal</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Kota domisili kamu saat ini..."
              className="w-full px-3.5 py-2.5 bg-[#F5F5F9] rounded-xl text-xs font-medium text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30"
            />
          </div>

          {/* Edit Life Stage (Progression isn't locked) */}
          <div>
            <label className="block text-xs font-bold text-[#1A1A2E] mb-1">
              Fase Hidup / Semester Aktif
            </label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as LifeStage)}
              className="w-full px-3.5 py-2.5 bg-[#F5F5F9] rounded-xl text-xs font-semibold text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30"
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-[#6B7280] mt-1">
              Mengubah fase akan otomatis menyegarkan fokus saran mentor harian dan roadmap.
            </p>
          </div>

          {/* Edit Major / Field */}
          <div>
            <label className="block text-xs font-bold text-[#1A1A2E] mb-1">Jurusan / Bidang Keahlian</label>
            <input
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder="Jurusan kuliah atau skill utama..."
              className="w-full px-3.5 py-2.5 bg-[#F5F5F9] rounded-xl text-xs font-medium text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30"
            />
          </div>

          {/* Edit Career Goal */}
          <div>
            <label className="block text-xs font-bold text-[#1A1A2E] mb-1">Arah Karier / Tujuan</label>
            <input
              type="text"
              value={careerDirection}
              onChange={(e) => setCareerDirection(e.target.value)}
              placeholder="Pekerjaan impian atau industri target..."
              className="w-full px-3.5 py-2.5 bg-[#F5F5F9] rounded-xl text-xs font-medium text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30"
            />
          </div>

          {/* Reminders & Notifications (Section 5G & 6) */}
          <div className="pt-2 border-t border-black/[0.05] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#1A1A2E]">Jam Pengingat Malam</h4>
                <p className="text-[11px] text-[#6B7280]">Banner pengingat target harian muncul di Home</p>
              </div>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="px-2.5 py-1.5 bg-[#F5F5F9] rounded-xl text-xs font-bold text-[#1A1A2E] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#1A1A2E]">Notifikasi Banner In-App</h4>
                <p className="text-[11px] text-[#6B7280]">Tampilkan Morning Kickoff & reminder harian</p>
              </div>
              <button
                type="button"
                onClick={() => setBannerNotifications(!bannerNotifications)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  bannerNotifications ? 'bg-[#6C5CE7]' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                    bannerNotifications ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full h-12 rounded-2xl bg-[#6C5CE7] hover:bg-[#5b4bc7] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Perubahan Disimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Review Navigation (Intro & Profiling) */}
          <div className="pt-2 border-t border-black/[0.05] space-y-1.5">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
              Tinjau Alur Onboarding
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRevisitIntro?.();
                }}
                className="py-2 px-2.5 rounded-xl bg-[#F5F5F9] hover:bg-black/5 text-[#1A1A2E] text-[11px] font-semibold text-center border border-black/[0.05]"
              >
                1. Intro Screens
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRevisitProfiling?.();
                }}
                className="py-2 px-2.5 rounded-xl bg-[#F5F5F9] hover:bg-black/5 text-[#1A1A2E] text-[11px] font-semibold text-center border border-black/[0.05]"
              >
                3. User Profiling
              </button>
            </div>
          </div>

          {/* Sign Out Button */}
          <div className="pt-2 border-t border-black/[0.05]">
            <button
              type="button"
              onClick={onSignOut}
              className="w-full py-2.5 text-xs font-semibold text-[#FA5A50] hover:bg-[#FA5A50]/10 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar dari Akun</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
