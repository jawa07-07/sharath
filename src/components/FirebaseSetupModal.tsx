import React, { useState } from 'react';
import { X, Flame, Check, Copy, ExternalLink, ShieldAlert, Sparkles } from 'lucide-react';
import { saveFirebaseConfig, removeCustomFirebaseConfig, getIsFirebaseConfigured } from '../services/firebase';
import { useToast } from './Toast';

interface FirebaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const FirebaseSetupModal: React.FC<FirebaseSetupModalProps> = ({ isOpen, onClose, onConfigUpdated }) => {
  const { showToast } = useToast();
  const [configInput, setConfigInput] = useState('');
  const [activeTab, setActiveTab] = useState<'guide' | 'connect'>('guide');
  const [copiedRules, setCopiedRules] = useState(false);
  const isConfigured = getIsFirebaseConfigured();

  if (!isOpen) return null;

  const handleSave = () => {
    if (!configInput.trim()) {
      showToast('Please paste your Firebase Web App configuration JSON or object.', 'error');
      return;
    }

    let jsonString = configInput.trim();
    // Support pasting standard JS object: const firebaseConfig = { ... };
    if (jsonString.includes('{') && jsonString.includes('}')) {
      const start = jsonString.indexOf('{');
      const end = jsonString.lastIndexOf('}');
      let candidate = jsonString.substring(start, end + 1);
      // Clean non-json keys if any
      candidate = candidate.replace(/([a-zA-Z0-9_]+):/g, '"$1":').replace(/'/g, '"');
      try {
        JSON.parse(candidate);
        jsonString = candidate;
      } catch (e) {
        // use raw if already valid
      }
    }

    const success = saveFirebaseConfig(jsonString);
    if (success) {
      showToast('Firebase configuration saved successfully! Cloud sync is active.', 'success');
      onConfigUpdated();
      onClose();
    } else {
      showToast('Invalid Firebase configuration format. Please verify JSON format.', 'error');
    }
  };

  const handleResetToGuest = () => {
    removeCustomFirebaseConfig();
    showToast('Reset to local Guest Mode storage.', 'info');
    onConfigUpdated();
    onClose();
  };

  const copyRulesToClipboard = async () => {
    const rulesText = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if false; }
    function isOwner(userId) { return request.auth != null && request.auth.uid == userId; }
    match /users/{userId} {
      allow read, write: if isOwner(userId);
      match /conversations/{conversationId} {
        allow read, write: if isOwner(userId);
        match /messages/{messageId} {
          allow read, write: if isOwner(userId);
        }
      }
      match /learningPlans/{planId} {
        allow read, write: if isOwner(userId);
      }
    }
  }
}`;
    await navigator.clipboard.writeText(rulesText);
    setCopiedRules(true);
    showToast('Firestore security rules copied to clipboard!', 'success');
    setTimeout(() => setCopiedRules(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0F121D] border border-[#262D42] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1F2538] bg-[#141826]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Firebase Cloud Sync Setup
                {isConfigured ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-normal">
                    Connected
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-normal">
                    Guest Mode (Active)
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Sync conversations, roadmap plans, and quiz scores across all devices.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2438] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-[#1F2538] bg-[#0C0E17] px-6">
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'guide'
                ? 'border-[#B7FF3C] text-[#B7FF3C]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Setup Guide & Requirements
          </button>
          <button
            onClick={() => setActiveTab('connect')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'connect'
                ? 'border-[#B7FF3C] text-[#B7FF3C]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Connect Web App Config
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {activeTab === 'guide' ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#131726] border border-[#232B42] text-xs text-slate-300 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-[#B7FF3C] shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Guest Mode is 100% functional right now!</strong> All your chat
                  history, roadmaps, and quiz metrics are securely stored in your browser’s localStorage. Firebase is
                  optional if you want Google sign-in and cloud database persistence.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-white text-base">Step-by-Step Firebase Instructions:</h4>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#141724] border border-[#21273B]">
                  <span className="w-6 h-6 rounded-full bg-[#B7FF3C]/10 text-[#B7FF3C] font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </span>
                  <div>
                    <h5 className="font-semibold text-slate-200">Create Project in Firebase Console</h5>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Go to{' '}
                      <a
                        href="https://console.firebase.google.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#B7FF3C] hover:underline inline-flex items-center gap-1"
                      >
                        console.firebase.google.com <ExternalLink className="w-3 h-3" />
                      </a>{' '}
                      and create or choose an existing project.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#141724] border border-[#21273B]">
                  <span className="w-6 h-6 rounded-full bg-[#B7FF3C]/10 text-[#B7FF3C] font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </span>
                  <div>
                    <h5 className="font-semibold text-slate-200">Enable Google Authentication</h5>
                    <p className="text-xs text-slate-400 mt-0.5">
                      In the Firebase Console, navigate to <strong>Build &gt; Authentication &gt; Sign-in method</strong>{' '}
                      and enable the <strong>Google</strong> sign-in provider.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#141724] border border-[#21273B]">
                  <span className="w-6 h-6 rounded-full bg-[#B7FF3C]/10 text-[#B7FF3C] font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </span>
                  <div>
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold text-slate-200">Create Cloud Firestore Database</h5>
                      <button
                        onClick={copyRulesToClipboard}
                        className="text-xs flex items-center gap-1 text-[#B7FF3C] hover:underline"
                      >
                        {copiedRules ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedRules ? 'Rules Copied!' : 'Copy firestore.rules'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Go to <strong>Build &gt; Firestore Database</strong>, click &quot;Create database&quot;, choose
                      your region, and apply the hardened rules provided in the project repository.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#141724] border border-[#21273B]">
                  <span className="w-6 h-6 rounded-full bg-[#B7FF3C]/10 text-[#B7FF3C] font-bold flex items-center justify-center shrink-0 text-xs">
                    4
                  </span>
                  <div>
                    <h5 className="font-semibold text-slate-200">Register Web App & Paste Config</h5>
                    <p className="text-xs text-slate-400 mt-0.5">
                      In Project Settings &gt; General &gt; Your apps, add a Web app (&quot;&lt;/&gt;&quot;), copy the
                      generated <code>firebaseConfig</code> object, and paste it into the Connect tab!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Paste your Web App config JSON snippet below to activate Cloud Firestore and Google Login:
              </p>

              <textarea
                value={configInput}
                onChange={(e) => setConfigInput(e.target.value)}
                placeholder={`{
  "apiKey": "AIzaSy...",
  "authDomain": "your-app.firebaseapp.com",
  "projectId": "your-app-id",
  "storageBucket": "your-app.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "1:123456789:web:abcdef"
}`}
                rows={9}
                className="w-full p-3 font-mono text-xs rounded-xl bg-[#090B12] border border-[#2A314A] text-slate-200 focus:outline-none focus:border-[#B7FF3C] focus:ring-1 focus:ring-[#B7FF3C]"
              />

              <div className="flex items-center justify-between pt-2">
                {isConfigured ? (
                  <button
                    onClick={handleResetToGuest}
                    className="px-3.5 py-2 text-xs rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all font-medium"
                  >
                    Disconnect & Use Guest Mode
                  </button>
                ) : (
                  <span className="text-xs text-slate-500">Currently using local Guest Mode</span>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-xs rounded-xl bg-[#1C2237] hover:bg-[#27304E] text-slate-300 font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 text-xs rounded-xl bg-[#B7FF3C] hover:bg-[#A6F024] text-black font-bold transition-all shadow-[0_0_15px_rgba(183,255,60,0.3)] active:scale-95"
                  >
                    Save & Activate Firebase
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
