import React from 'react';
import { Mic, Sparkles } from 'lucide-react';
import { MonsterMascot } from './MonsterMascot';

interface FloatingVoiceTriggerProps {
  onOpenVoice: () => void;
}

export const FloatingVoiceTrigger: React.FC<FloatingVoiceTriggerProps> = ({ onOpenVoice }) => {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
      <button
        onClick={onOpenVoice}
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#141A2D] to-[#121626] border-2 border-[#B7FF3C]/50 hover:border-[#B7FF3C] text-slate-100 shadow-[0_0_25px_rgba(183,255,60,0.3)] hover:shadow-[0_0_35px_rgba(183,255,60,0.5)] transition-all duration-300 active:scale-95 cursor-pointer backdrop-blur-md"
        title="Tap to speak to Volt (Siri Voice Mode)"
      >
        {/* Pulsing ring indicator */}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B7FF3C] opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#B7FF3C]" />
        </span>

        <div className="w-7 h-7 rounded-full bg-[#B7FF3C] text-black flex items-center justify-center shrink-0 shadow-md">
          <Mic className="w-4 h-4 font-bold group-hover:scale-110 transition-transform" />
        </div>

        <div className="flex flex-col text-left">
          <span className="text-xs font-extrabold text-white group-hover:text-[#B7FF3C] transition-colors leading-none">
            Ask Volt
          </span>
          <span className="text-[10px] font-mono text-slate-400 leading-tight">
            Voice Assistant
          </span>
        </div>
      </button>
    </div>
  );
};
