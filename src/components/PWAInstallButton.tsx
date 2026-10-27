import React, { useState } from 'react';
import { Smartphone, Download, Check, X, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useToast } from './Toast';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const { showToast } = useToast();

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        showToast('App installed to your home screen!', 'success');
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-[#B7FF3C]/10 text-[#B7FF3C] border border-[#B7FF3C]/30 hover:bg-[#B7FF3C]/20 shadow-[0_0_12px_rgba(183,255,60,0.15)] active:scale-95 ${className}`}
        title="Install MonsterMentor on Android phone"
      >
        <Smartphone className="w-3.5 h-3.5 text-[#B7FF3C]" />
        <span>Install App</span>
      </button>

      {/* Guide Modal for browsers where beforeinstallprompt hasn't triggered yet or on iOS/Android Chrome */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-[#0E121F] border border-[#242C44] p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#B7FF3C]" />
                <h3 className="font-bold text-base text-white">Install on Your Phone</h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-xs text-slate-300">
                <p>To run like an app on iPhone / iPad:</p>
                <div className="p-3 rounded-xl bg-[#141826] border border-[#23293E] space-y-2">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-[#8B5CF6]" />
                    <span>1. Tap the <strong>Share</strong> icon in Safari.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PlusSquare className="w-4 h-4 text-[#B7FF3C]" />
                    <span>2. Tap <strong>Add to Home Screen</strong>.</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-300">
                <p>To install directly on Android phone:</p>
                <div className="p-3 rounded-xl bg-[#141826] border border-[#23293E] space-y-2.5">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#B7FF3C]/20 text-[#B7FF3C] flex items-center justify-center font-bold shrink-0">
                      1
                    </span>
                    <span>Tap the <strong>three dots (⋮)</strong> in Chrome at top right.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#B7FF3C]/20 text-[#B7FF3C] flex items-center justify-center font-bold shrink-0">
                      2
                    </span>
                    <span>Tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#B7FF3C]/20 text-[#B7FF3C] flex items-center justify-center font-bold shrink-0">
                      3
                    </span>
                    <span>The app opens with no browser URL bar, just like Siri / native app!</span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#B7FF3C] text-black font-extrabold text-xs uppercase tracking-wider"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
