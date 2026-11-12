import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Share2, Check, X, ExternalLink, Copy, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PWAInstallButtonProps {
  variant?: 'banner' | 'card' | 'compact';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'banner', className = '' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');
  const [justInstalled, setJustInstalled] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    // Check if app is running in standalone mode (already installed PWA)
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standaloneMode);

    // Check if running inside iframe (browser blocks native PWA prompts inside iframes)
    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }

    // Check device type
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);
    if (isIosDevice) setActiveTab('ios');

    // Retrieve cached prompt if main.tsx already caught it
    if ((window as any).deferredPWAInstallPrompt) {
      setDeferredPrompt((window as any).deferredPWAInstallPrompt);
    }

    // Capture beforeinstallprompt event (Android / Chromium)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPWAInstallPrompt = e;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setJustInstalled(true);
      setDeferredPrompt(null);
      (window as any).deferredPWAInstallPrompt = null;
    };

    const handlePromptAvailable = () => {
      if ((window as any).deferredPWAInstallPrompt) {
        setDeferredPrompt((window as any).deferredPWAInstallPrompt);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('pwa-prompt-available', handlePromptAvailable);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('pwa-prompt-available', handlePromptAvailable);
    };
  }, []);

  const handleInstallClick = async () => {
    // 1. If native Chromium prompt is ready, trigger it directly!
    const promptEvent = deferredPrompt || (window as any).deferredPWAInstallPrompt;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') {
          setJustInstalled(true);
          setDeferredPrompt(null);
          (window as any).deferredPWAInstallPrompt = null;
          return;
        }
      } catch (err) {
        console.warn('Native PWA prompt error, showing manual guide:', err);
      }
    }

    // 2. Fallback: If on iOS, or prompt not ready yet, or inside an iframe, open guide modal
    setShowGuideModal(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const openInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  // If already installed or running in standalone mode, do not show any badge or prompt
  if (isStandalone || justInstalled) {
    return null;
  }

  return (
    <>
      {variant === 'compact' ? (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#6C5CE7]/10 hover:bg-[#6C5CE7]/15 text-[#6C5CE7] text-xs font-bold transition-all ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>📲 Pasang di HP</span>
        </button>
      ) : variant === 'card' ? (
        <div className={`p-3.5 rounded-2xl bg-gradient-to-br from-[#6C5CE7]/10 via-[#6C5CE7]/5 to-[#FA5A50]/10 border border-[#6C5CE7]/20 flex items-center justify-between gap-3 ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6C5CE7] text-white flex items-center justify-center shadow-xs shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-[#1A1A2E]">Aplikasi Layar Penuh</h4>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-[#6C5CE7] text-white">
                  {deferredPrompt ? 'Instan' : 'PWA'}
                </span>
              </div>
              <p className="text-[11px] text-[#6B7280] line-clamp-1">
                Akses instan dari Home Screen tanpa unduh di PlayStore/AppStore.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3.5 py-2 rounded-xl bg-[#6C5CE7] hover:bg-[#5b4bc7] text-white text-xs font-bold shrink-0 shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
        </div>
      ) : (
        /* Default banner */
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={handleInstallClick}
          className={`w-full p-3 rounded-2xl bg-[#1A1A2E] hover:bg-black text-white text-xs font-semibold flex items-center justify-between shadow-md transition-all ${className}`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#6C5CE7] text-white flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="block font-bold text-xs text-white">📲 Install Aplikasi di HP Kamu</span>
              <span className="block text-[10px] text-gray-300">
                {deferredPrompt ? 'Ketuk untuk langsung pasang di HP' : 'Buka instan di layar utama tanpa browser'}
              </span>
            </div>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-white/10 text-white font-bold text-[11px] flex items-center gap-1">
            <span>{deferredPrompt ? 'Pasang Langsung' : 'Pasang'}</span>
            <Download className="w-3 h-3" />
          </div>
        </motion.button>
      )}

      {/* Guide Modal for iOS & Android instructions */}
      <AnimatePresence>
        {showGuideModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#6C5CE7] text-white flex items-center justify-center shadow-xs">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1A1A2E]">Pasang PocketMentor di HP</h3>
                    <p className="text-[10px] text-[#6B7280]">Cepat, ringan &amp; tanpa download APK</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuideModal(false)}
                  className="p-1 rounded-full text-[#6B7280] hover:text-[#1A1A2E] hover:bg-black/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Iframe Warning / Direct Mobile Link (Crucial for AI Studio Preview) */}
              {isInIframe && (
                <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>💡 Tips Membuka di HP:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Browser membatasi dialog install langsung jika dibuka di dalam panel pratinjau. Buka URL ini langsung di browser Chrome/Safari di HP kamu:
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-amber-600 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      {copiedLink ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Tersalin!' : 'Salin Tautan'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={openInNewTab}
                      className="py-1.5 px-3 rounded-xl bg-white border border-amber-300 text-amber-800 font-bold text-[11px] flex items-center gap-1"
                    >
                      <span>Tab Baru</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Device Tabs */}
              <div className="flex bg-[#F5F5F9] p-1 rounded-xl mt-3 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('android')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    activeTab === 'android' ? 'bg-white text-[#1A1A2E] shadow-xs' : 'text-[#6B7280]'
                  }`}
                >
                  Google Chrome (Android)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ios')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    activeTab === 'ios' ? 'bg-white text-[#1A1A2E] shadow-xs' : 'text-[#6B7280]'
                  }`}
                >
                  Safari (iPhone / iPad)
                </button>
              </div>

              {/* Instructions Content */}
              <div className="py-4 space-y-3">
                {activeTab === 'android' ? (
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F5F5F9]">
                      <div className="w-6 h-6 rounded-full bg-[#6C5CE7] text-white flex items-center justify-center shrink-0 font-bold text-[11px]">
                        1
                      </div>
                      <div className="text-[#1A1A2E]">
                        Buka aplikasi ini di <strong>Google Chrome</strong> di HP kamu.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F5F5F9]">
                      <div className="w-6 h-6 rounded-full bg-[#6C5CE7] text-white flex items-center justify-center shrink-0 font-bold text-[11px]">
                        2
                      </div>
                      <div className="text-[#1A1A2E]">
                        Ketuk tombol <strong>Menu Titik Tiga (⋮)</strong> di pojok kanan atas browser Google Chrome.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F5F5F9]">
                      <div className="w-6 h-6 rounded-full bg-[#6C5CE7] text-white flex items-center justify-center shrink-0 font-bold text-[11px]">
                        3
                      </div>
                      <div className="text-[#1A1A2E]">
                        Pilih menu <strong>"Instal aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>. Ikon PocketMentor langsung siap dibuka!
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F5F5F9]">
                      <div className="w-6 h-6 rounded-full bg-[#6C5CE7] text-white flex items-center justify-center shrink-0 font-bold text-[11px]">
                        1
                      </div>
                      <div className="text-[#1A1A2E]">
                        Buka aplikasi ini di <strong>Safari</strong> di iPhone/iPad kamu.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F5F5F9]">
                      <div className="w-6 h-6 rounded-full bg-[#6C5CE7] text-white flex items-center justify-center shrink-0 font-bold text-[11px]">
                        2
                      </div>
                      <div className="text-[#1A1A2E]">
                        Ketuk tombol <strong>Bagikan / Share (<Share2 className="w-3.5 h-3.5 inline text-[#6C5CE7]" />)</strong> di bilah bawah browser Safari.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F5F5F9]">
                      <div className="w-6 h-6 rounded-full bg-[#6C5CE7] text-white flex items-center justify-center shrink-0 font-bold text-[11px]">
                        3
                      </div>
                      <div className="text-[#1A1A2E]">
                        Gulir ke bawah, lalu pilih <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong> lalu tekan <strong>Tambah</strong>.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="w-full py-2.5 rounded-xl bg-[#6C5CE7] text-white font-bold text-xs shadow-xs hover:bg-[#5b4bc7] transition-all"
              >
                Saya Mengerti
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
