/**
 * MonsterMentor AI - Main Application Entrypoint
 * @license Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveView, MentorStyle } from './types';
import { Navbar } from './components/Navbar';
import { LandingPage } from './views/LandingPage';
import { DashboardView } from './views/DashboardView';
import { ChatView } from './views/ChatView';
import { LearningCenterView } from './views/LearningCenterView';
import { HistoryView } from './views/HistoryView';
import { SettingsView } from './views/SettingsView';
import { ToastProvider } from './components/Toast';
import { FirebaseSetupModal } from './components/FirebaseSetupModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { FloatingVoiceTrigger } from './components/FloatingVoiceTrigger';
import { storage } from './services/storage';
import { getIsFirebaseConfigured, subscribeToAuth } from './services/firebase';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('landing');
  const [activeMentorStyle, setActiveMentorStyle] = useState<MentorStyle>('friendly');
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | undefined>(undefined);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Load initial user profile preference
    const profile = storage.getProfile();
    if (profile.mentorStyle) {
      setActiveMentorStyle(profile.mentorStyle);
    }

    // Check Firebase status & auth
    setIsFirebaseConfigured(getIsFirebaseConfigured());
    const unsub = subscribeToAuth((user) => {
      if (user) {
        setCurrentUserEmail(user.email || undefined);
        setIsFirebaseConfigured(true);
      } else {
        setCurrentUserEmail(undefined);
      }
    });

    return () => unsub();
  }, []);

  const handleNavigate = (
    view: ActiveView,
    initialPrompt?: string,
    style?: MentorStyle,
    conversationId?: string
  ) => {
    if (style) {
      setActiveMentorStyle(style);
    }
    setChatInitialPrompt(initialPrompt);
    setActiveConversationId(conversationId);
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMentorStyle = (style: MentorStyle) => {
    setActiveMentorStyle(style);
    const prof = storage.getProfile();
    storage.saveProfile({ ...prof, mentorStyle: style });
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#090A10] text-slate-100 flex flex-col font-sans selection:bg-[#B7FF3C] selection:text-black">
        {/* Navigation Bar */}
        <Navbar
          activeView={activeView}
          setActiveView={(view) => handleNavigate(view)}
          activeMentorStyle={activeMentorStyle}
          onSelectMentorStyle={handleSelectMentorStyle}
          isFirebaseConfigured={isFirebaseConfigured}
          onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          userEmail={currentUserEmail}
        />

        {/* Main Content Area */}
        <main className="flex-1">
          {activeView === 'landing' && <LandingPage onNavigate={handleNavigate} />}

          {activeView === 'dashboard' && (
            <DashboardView
              onNavigate={handleNavigate}
              activeMentorStyle={activeMentorStyle}
              onSelectMentorStyle={handleSelectMentorStyle}
            />
          )}

          {activeView === 'chat' && (
            <ChatView
              initialPrompt={chatInitialPrompt}
              initialStyle={activeMentorStyle}
              initialConversationId={activeConversationId}
              onConversationCreated={(id) => setActiveConversationId(id)}
            />
          )}

          {activeView === 'learning' && <LearningCenterView />}

          {activeView === 'history' && <HistoryView onNavigate={handleNavigate} />}

          {activeView === 'settings' && (
            <SettingsView
              onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
              activeMentorStyle={activeMentorStyle}
              onSelectMentorStyle={handleSelectMentorStyle}
            />
          )}
        </main>

        {/* Floating Siri-like Voice Assistant Trigger */}
        <FloatingVoiceTrigger onOpenVoice={() => setIsVoiceModalOpen(true)} />

        {/* Siri-like Voice Assistant Modal Overlay */}
        <VoiceAssistantModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          activeMentorStyle={activeMentorStyle}
          onSelectMentorStyle={handleSelectMentorStyle}
        />

        {/* Footer */}
        <footer className="border-t border-[#141828] bg-[#07080D] py-8 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white">
                Monster<span className="text-[#B7FF3C]">Mentor</span> AI
              </span>
              <span>— Unleash Your Potential</span>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <button onClick={() => handleNavigate('dashboard')} className="hover:text-white transition-colors">
                Dashboard
              </button>
              <button onClick={() => handleNavigate('chat')} className="hover:text-white transition-colors">
                Chat
              </button>
              <button onClick={() => setIsVoiceModalOpen(true)} className="hover:text-[#B7FF3C] transition-colors flex items-center gap-1 font-bold">
                Voice Assistant
              </button>
              <button onClick={() => handleNavigate('learning')} className="hover:text-white transition-colors">
                Learning Center
              </button>
              <button onClick={() => setIsFirebaseModalOpen(true)} className="hover:text-[#B7FF3C] transition-colors">
                Cloud Sync
              </button>
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              Gemini 3.8 Flash • Enterprise Guardrails
            </div>
          </div>
        </footer>

        {/* Firebase Setup Modal */}
        <FirebaseSetupModal
          isOpen={isFirebaseModalOpen}
          onClose={() => setIsFirebaseModalOpen(false)}
          onConfigUpdated={() => {
            setIsFirebaseConfigured(getIsFirebaseConfigured());
          }}
        />
      </div>
    </ToastProvider>
  );
}
