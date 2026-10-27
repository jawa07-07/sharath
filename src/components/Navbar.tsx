import React, { useState } from 'react';
import {
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  History,
  Settings,
  Menu,
  X,
  ChevronDown,
  Cloud,
  Flame,
  ShieldCheck,
  Zap,
  Mic,
} from 'lucide-react';
import { ActiveView, MentorStyle } from '../types';
import { MonsterMascot } from './MonsterMascot';
import { MENTOR_STYLES_DATA } from '../services/storage';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  activeMentorStyle: MentorStyle;
  onSelectMentorStyle: (style: MentorStyle) => void;
  isFirebaseConfigured: boolean;
  onOpenFirebaseModal: () => void;
  onOpenVoiceModal: () => void;
  userEmail?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  activeMentorStyle,
  onSelectMentorStyle,
  isFirebaseConfigured,
  onOpenFirebaseModal,
  onOpenVoiceModal,
  userEmail,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);

  const currentStyle = MENTOR_STYLES_DATA.find((s) => s.id === activeMentorStyle) || MENTOR_STYLES_DATA[0];

  const navLinks = [
    { id: 'dashboard' as ActiveView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat' as ActiveView, label: 'AI Mentor Chat', icon: MessageSquare },
    { id: 'learning' as ActiveView, label: 'Learning Center', icon: BookOpen },
    { id: 'history' as ActiveView, label: 'Conversations', icon: History },
    { id: 'settings' as ActiveView, label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (view: ActiveView) => {
    setActiveView(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1A1F30] bg-[#090A10]/90 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div
          onClick={() => handleNavClick('landing')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative">
            <MonsterMascot size="sm" state="idle" className="drop-shadow-[0_0_12px_rgba(183,255,60,0.4)]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg md:text-xl tracking-tight text-white group-hover:text-[#B7FF3C] transition-colors">
                Monster<span className="text-[#B7FF3C]">Mentor</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/40 uppercase tracking-wider">
                AI
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider">Your Potential. Unleashed.</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#181D2D] text-[#B7FF3C] border border-[#B7FF3C]/30 shadow-[0_0_15px_rgba(183,255,60,0.15)]'
                    : 'text-slate-300 hover:text-white hover:bg-[#121624]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#B7FF3C]' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Section: Persona Selector + Cloud Status */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Persona Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setStyleDropdownOpen(!styleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#121624] border border-[#232A40] hover:border-[#B7FF3C]/50 transition-all text-xs text-slate-200"
              title="Change Mentor Personality"
            >
              <Zap className="w-3.5 h-3.5 text-[#B7FF3C]" />
              <span className="font-semibold text-white">{currentStyle.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {styleDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0F1321] border border-[#252E47] p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95"
                onMouseLeave={() => setStyleDropdownOpen(false)}
              >
                <div className="px-2 py-1 text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  Select Mentor Persona
                </div>
                <div className="space-y-1 mt-1">
                  {MENTOR_STYLES_DATA.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => {
                        onSelectMentorStyle(style.id);
                        setStyleDropdownOpen(false);
                      }}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left text-xs transition-all ${
                        activeMentorStyle === style.id
                          ? 'bg-[#1A2238] border border-[#B7FF3C]/30 text-white'
                          : 'hover:bg-[#151928] text-slate-300'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-[#B7FF3C] mt-1 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-100">{style.name}</div>
                        <div className="text-[11px] text-slate-400 leading-tight">{style.tagline}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Siri-like Voice Assistant Button */}
          <button
            onClick={onOpenVoiceModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#141A2D] to-[#182036] border border-[#B7FF3C]/50 hover:border-[#B7FF3C] text-xs font-bold text-white shadow-[0_0_15px_rgba(183,255,60,0.25)] transition-all active:scale-95"
            title="Open Volt Siri Voice Assistant"
          >
            <Mic className="w-3.5 h-3.5 text-[#B7FF3C] animate-pulse" />
            <span>Voice Mode</span>
          </button>

          {/* In-App PWA Install on Android */}
          <PWAInstallButton />

          {/* Cloud Sync / Guest Status Pill */}
          <button
            onClick={onOpenFirebaseModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              isFirebaseConfigured
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-[#181D2D] border-[#2A334E] text-slate-300 hover:border-[#B7FF3C]/40 hover:text-white'
            }`}
            title="Configure Cloud Firestore & Google Auth"
          >
            {isFirebaseConfigured ? (
              <>
                <Flame className="w-3.5 h-3.5 text-emerald-400" />
                <span>{userEmail ? userEmail.split('@')[0] : 'Cloud Sync'}</span>
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                <span>Guest Mode</span>
              </>
            )}
          </button>
        </div>

        {/* Mobile Action Controls */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile Voice Trigger */}
          <button
            onClick={onOpenVoiceModal}
            className="p-2 rounded-xl bg-[#141A2D] border border-[#B7FF3C]/50 text-[#B7FF3C] shadow-[0_0_10px_rgba(183,255,60,0.3)]"
            title="Voice Assistant"
          >
            <Mic className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenFirebaseModal}
            className="p-1.5 rounded-lg bg-[#141826] border border-[#232A40] text-xs text-slate-300"
          >
            {isFirebaseConfigured ? (
              <Flame className="w-4 h-4 text-emerald-400" />
            ) : (
              <Cloud className="w-4 h-4 text-cyan-400" />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-[#141826] border border-[#232A40] text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#1E2538] bg-[#0A0D17] px-4 pt-3 pb-5 space-y-2 animate-in slide-in-from-top-4">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold ${
                    isActive
                      ? 'bg-[#1A2238] text-[#B7FF3C] border border-[#B7FF3C]/40'
                      : 'bg-[#121624] text-slate-300 border border-[#1E253B]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Persona Selection */}
          <div className="pt-2 border-t border-[#1E2538]">
            <div className="text-[11px] font-mono text-slate-400 mb-2">Mentor Style:</div>
            <div className="flex flex-wrap gap-1.5">
              {MENTOR_STYLES_DATA.map((style) => (
                <button
                  key={style.id}
                  onClick={() => {
                    onSelectMentorStyle(style.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                    activeMentorStyle === style.id
                      ? 'bg-[#B7FF3C] text-black border-[#B7FF3C] font-bold'
                      : 'bg-[#131726] text-slate-300 border-[#242C44]'
                  }`}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Quick Voice & Install */}
          <div className="pt-3 border-t border-[#1E2538] flex items-center justify-between gap-2">
            <button
              onClick={() => {
                onOpenVoiceModal();
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#141A2D] to-[#1E263E] border border-[#B7FF3C]/50 text-[#B7FF3C] text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(183,255,60,0.2)]"
            >
              <Mic className="w-4 h-4 animate-pulse" />
              <span>Open Siri Voice Mode</span>
            </button>
            <PWAInstallButton />
          </div>
        </div>
      )}
    </header>
  );
};
