import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Shield,
  Trash2,
  Download,
  Flame,
  Cloud,
  Check,
  Zap,
  LogIn,
  LogOut,
  Target,
  Palette,
  ExternalLink,
} from 'lucide-react';
import { MentorStyle, UserProfile } from '../types';
import { storage, MENTOR_STYLES_DATA } from '../services/storage';
import {
  initFirebase,
  loginWithGoogle,
  logoutUser,
  subscribeToAuth,
  getIsFirebaseConfigured,
} from '../services/firebase';
import { MonsterMascot } from '../components/MonsterMascot';
import { useToast } from '../components/Toast';

interface SettingsViewProps {
  onOpenFirebaseModal: () => void;
  activeMentorStyle: MentorStyle;
  onSelectMentorStyle: (style: MentorStyle) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onOpenFirebaseModal,
  activeMentorStyle,
  onSelectMentorStyle,
}) => {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<UserProfile>(storage.getProfile());
  const [displayNameInput, setDisplayNameInput] = useState(profile.displayName || '');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(profile.dailyGoalMinutes || 30);
  const [isFirebaseReady, setIsFirebaseReady] = useState(getIsFirebaseConfigured());
  const [authUser, setAuthUser] = useState<any>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const unsub = subscribeToAuth((user) => {
      setAuthUser(user);
      if (user) {
        const updated = {
          ...profile,
          uid: user.uid,
          displayName: user.displayName || profile.displayName,
          email: user.email || undefined,
          photoURL: user.photoURL || undefined,
          isAnonymous: false,
        };
        storage.saveProfile(updated);
        setProfile(updated);
        setDisplayNameInput(updated.displayName);
      }
    });

    setIsFirebaseReady(getIsFirebaseConfigured());
    return () => unsub();
  }, []);

  const handleSaveProfile = () => {
    if (!displayNameInput.trim()) {
      showToast('Display name cannot be empty', 'error');
      return;
    }
    const updated = {
      ...profile,
      displayName: displayNameInput.trim(),
      dailyGoalMinutes,
      mentorStyle: activeMentorStyle,
    };
    storage.saveProfile(updated);
    setProfile(updated);
    showToast('Preferences saved successfully!', 'success');
  };

  const handleGoogleSignIn = async () => {
    if (!isFirebaseReady) {
      onOpenFirebaseModal();
      return;
    }

    setIsLoggingIn(true);
    try {
      const user = await loginWithGoogle();
      if (user) {
        showToast(`Signed in as ${user.displayName || user.email}!`, 'success');
      }
    } catch (err: any) {
      if (err.message === 'FIREBASE_NOT_CONFIGURED') {
        onOpenFirebaseModal();
      } else {
        showToast(err.message || 'Google sign-in encountered an issue.', 'error');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await logoutUser();
    const guestProf = {
      ...profile,
      isAnonymous: true,
      email: undefined,
      photoURL: undefined,
    };
    storage.saveProfile(guestProf);
    setProfile(guestProf);
    setAuthUser(null);
    showToast('Signed out. Switched back to Guest Mode.', 'info');
  };

  const handleExportAll = () => {
    const dataStr = storage.exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monstermentor_all_data_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported all user data to JSON file.', 'success');
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to delete all local conversations, roadmaps, and quiz history? This cannot be undone.')) {
      storage.clearAllData();
      showToast('All local storage cleared. Reloading app state...', 'info');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
          <Settings className="w-7 h-7 text-[#B7FF3C]" />
          Profile & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Customize your monster mentor experience, manage authentication, and handle your data.
        </p>
      </div>

      {/* Account / Authentication Card */}
      <div className="p-6 rounded-2xl bg-[#0E121F] border border-[#1F263C] shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#161C2E] border border-[#262F48] text-slate-200">
              <User className="w-5 h-5 text-[#B7FF3C]" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Account & Cloud Sync</h3>
              <p className="text-xs text-slate-400">
                {authUser
                  ? `Signed in as ${authUser.email}`
                  : isFirebaseReady
                  ? 'Firebase connected. Sign in with Google to sync data.'
                  : 'Currently in Guest Mode (local storage only).'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {authUser ? (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoggingIn}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B7FF3C] hover:bg-[#A6F024] text-black text-xs font-extrabold transition-all shadow-[0_0_15px_rgba(183,255,60,0.3)] active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{isFirebaseReady ? 'Sign in with Google' : 'Setup Cloud Sync'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Cloud Setup Status Banner */}
        <div className="pt-3 border-t border-[#1C2237] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${isFirebaseReady ? 'bg-emerald-400' : 'bg-cyan-400'}`}
            />
            <span className="text-slate-300">
              Backend Status:{' '}
              <strong className="text-white">
                {isFirebaseReady ? 'Firebase Connected' : 'Guest Mode Active'}
              </strong>
            </span>
          </div>

          <button
            onClick={onOpenFirebaseModal}
            className="text-xs text-[#B7FF3C] hover:underline flex items-center gap-1 font-semibold"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Configure Firebase Credentials</span>
          </button>
        </div>
      </div>

      {/* User Preferences Card */}
      <div className="p-6 rounded-2xl bg-[#0E121F] border border-[#1F263C] shadow-xl space-y-6">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Palette className="w-5 h-5 text-[#8B5CF6]" />
          Mentorship & Study Preferences
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Display Name</label>
            <input
              type="text"
              value={displayNameInput}
              onChange={(e) => setDisplayNameInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#090C16] border border-[#262F48] text-sm text-white focus:outline-none focus:border-[#B7FF3C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Daily Learning Goal (minutes)
            </label>
            <select
              value={dailyGoalMinutes}
              onChange={(e) => setDailyGoalMinutes(parseInt(e.target.value, 10))}
              className="w-full px-4 py-2.5 rounded-xl bg-[#090C16] border border-[#262F48] text-sm text-white focus:outline-none focus:border-[#B7FF3C]"
            >
              <option value={15}>15 minutes / day (Light)</option>
              <option value={30}>30 minutes / day (Standard)</option>
              <option value={45}>45 minutes / day (Deep Focus)</option>
              <option value={60}>60 minutes / day (Intensive)</option>
            </select>
          </div>
        </div>

        {/* Default Mentor Persona Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">Default Mentor Persona</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MENTOR_STYLES_DATA.map((style) => (
              <div
                key={style.id}
                onClick={() => onSelectMentorStyle(style.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  activeMentorStyle === style.id
                    ? 'bg-[#151B2F] border-[#B7FF3C] shadow-[0_0_15px_rgba(183,255,60,0.2)]'
                    : 'bg-[#090C16] border-[#20273E] hover:border-[#2E3754]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-white">{style.name}</span>
                    {activeMentorStyle === style.id && <Check className="w-4 h-4 text-[#B7FF3C]" />}
                  </div>
                  <p className="text-xs text-slate-400 leading-snug">{style.tagline}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSaveProfile}
            className="px-5 py-2.5 rounded-xl bg-[#B7FF3C] hover:bg-[#A6F024] text-black font-extrabold text-xs transition-all shadow-[0_0_15px_rgba(183,255,60,0.3)] active:scale-95"
          >
            Save Preferences
          </button>
        </div>
      </div>

      {/* Data Management & Privacy Card */}
      <div className="p-6 rounded-2xl bg-[#0E121F] border border-[#1F263C] shadow-xl space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          Data Management & Privacy
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          You have complete control over your data. MonsterMentor stores no third-party tracking cookies or advertising
          trackers. Export your data whenever you wish, or purge local storage with one click.
        </p>

        <div className="pt-3 border-t border-[#1C2237] flex flex-wrap gap-3">
          <button
            onClick={handleExportAll}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#141828] hover:bg-[#1C2338] text-slate-200 border border-[#242C44] text-xs font-semibold transition-all"
          >
            <Download className="w-4 h-4 text-[#B7FF3C]" />
            <span>Export Complete Data (JSON)</span>
          </button>

          <button
            onClick={handleClearAllData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Purge All Local Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
