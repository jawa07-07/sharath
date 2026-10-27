import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Zap,
  RotateCcw,
  Radio,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { MonsterMascot, MascotState } from './MonsterMascot';
import { MentorStyle } from '../types';
import { MENTOR_STYLES_DATA } from '../services/storage';
import { useToast } from './Toast';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMentorStyle: MentorStyle;
  onSelectMentorStyle: (style: MentorStyle) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  activeMentorStyle,
  onSelectMentorStyle,
}) => {
  const { showToast } = useToast();
  const [mascotMood, setMascotMood] = useState<MascotState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [aiSpokenResponse, setAiSpokenResponse] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoContinuous, setAutoContinuous] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const isSpeakingRef = useRef(false);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setMascotMood('listening');
    };

    recognition.onresult = (event: any) => {
      let finalStr = '';
      let interimStr = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalStr += event.results[i][0].transcript;
        } else {
          interimStr += event.results[i][0].transcript;
        }
      }

      if (interimStr) {
        setInterimTranscript(interimStr);
      }

      if (finalStr) {
        setTranscript(finalStr);
        setInterimTranscript('');
        handleQueryAI(finalStr);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition event error:', event.error);
      setIsListening(false);
      setMascotMood('idle');
      if (event.error === 'not-allowed') {
        showToast('Microphone permission denied. Please allow microphone access in your browser.', 'error');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (!isThinking && !isSpeakingRef.current) {
        setMascotMood('idle');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  // When modal opens, auto-start listening
  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setInterimTranscript('');
      setAiSpokenResponse('');
      setTimeout(() => {
        startListening();
      }, 400);
    } else {
      stopListening();
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    }
  }, [isOpen]);

  const startListening = () => {
    if (!recognitionRef.current) return;
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    isSpeakingRef.current = false;

    try {
      recognitionRef.current.start();
    } catch (e) {
      // already started
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
  };

  // Query AI backend with voice input
  const handleQueryAI = async (queryText: string) => {
    if (!queryText.trim()) return;

    stopListening();
    setIsThinking(true);
    setMascotMood('thinking');
    setAiSpokenResponse('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `[Spoken voice query from user on mobile assistant]: ${queryText.trim()}. Please respond concisely and conversationally (in 2-3 sentences), perfect for speech synthesis.`,
            },
          ],
          style: activeMentorStyle,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error('AI assistant response error');
      }

      const data = await response.json();
      const reply = data.text || 'I hear you, friend! Let me know what else I can help with!';
      setAiSpokenResponse(reply);
      speakResponse(reply);
    } catch (err: any) {
      console.error('Voice assistant error:', err);
      const errMsg = "I hit a quick hiccup with the network! Tap the mic to try asking me again.";
      setAiSpokenResponse(errMsg);
      speakResponse(errMsg);
    } finally {
      setIsThinking(false);
    }
  };

  // Speak response out loud like Siri
  const speakResponse = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    // Clean markdown symbols for natural speech
    const speechClean = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/[*#>`]/g, '')
      .replace(/https?:\/\/\S+/g, 'link')
      .trim();

    const utterance = new SpeechSynthesisUtterance(speechClean);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      setMascotMood('talking');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setMascotMood('idle');

      // If continuous mode is on, auto-listen for follow-up!
      if (autoContinuous) {
        setTimeout(() => {
          startListening();
        }, 600);
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setMascotMood('idle');
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    setMascotMood('idle');
  };

  const currentStyleData =
    MENTOR_STYLES_DATA.find((s) => s.id === activeMentorStyle) || MENTOR_STYLES_DATA[0];

  const suggestedVoicePrompts = [
    'Explain quantum computing simply',
    'How do Docker containers work?',
    'Give me a coding riddle',
    'Tell me how to ace a tech interview',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
      {/* Siri-style Ambient Pulsing Halos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <div
          className={`w-72 h-72 sm:w-96 sm:h-96 rounded-full transition-all duration-700 blur-3xl opacity-30 ${
            isListening
              ? 'bg-[#B7FF3C] scale-125'
              : isSpeaking
              ? 'bg-[#8B5CF6] scale-110'
              : isThinking
              ? 'bg-cyan-400 scale-100'
              : 'bg-slate-800 scale-90'
          }`}
        />
      </div>

      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col items-center justify-between rounded-3xl bg-[#090C16]/95 border border-[#232B44] p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Top Header with Close and Persona Badge */}
        <div className="w-full flex items-center justify-between border-b border-[#1A2033] pb-3 z-10">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#B7FF3C]/10 text-[#B7FF3C] border border-[#B7FF3C]/30">
              <Radio className="w-4 h-4 animate-pulse" />
            </span>
            <div>
              <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <span>Volt Siri-Mode</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1C2337] text-[#B7FF3C]">
                  {currentStyleData.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Hands-Free Android Voice Assistant</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#141828] text-slate-400 hover:text-white hover:bg-[#1E253A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Centerpiece: Expressive Monster with Concentric Waves */}
        <div className="relative my-6 flex flex-col items-center justify-center z-10">
          {/* Animated concentric sound wave rings */}
          {isListening && (
            <>
              <div className="absolute w-52 h-52 rounded-full border-2 border-[#B7FF3C]/40 animate-ping opacity-60" />
              <div className="absolute w-44 h-44 rounded-full border border-[#B7FF3C]/60 animate-pulse" />
            </>
          )}

          {isSpeaking && (
            <>
              <div className="absolute w-52 h-52 rounded-full border-2 border-[#8B5CF6]/50 animate-ping opacity-50" />
              <div className="absolute w-44 h-44 rounded-full border border-[#8B5CF6]/70 animate-pulse" />
            </>
          )}

          <MonsterMascot
            size="xl"
            state={mascotMood}
            showSpeechBubble={true}
            speechText={
              isListening
                ? 'Listening to you... speak freely!'
                : isThinking
                ? 'Crunching the answer...'
                : isSpeaking
                ? 'Speaking answer...'
                : 'Tap the mic or say something!'
            }
          />

          {/* Sound Wave Bars when Speaking */}
          {isSpeaking && (
            <div className="flex items-center gap-1.5 mt-4">
              {[18, 28, 40, 24, 34, 16, 26, 38, 20].map((h, idx) => (
                <div
                  key={idx}
                  className="w-1.5 bg-gradient-to-t from-[#8B5CF6] to-[#B7FF3C] rounded-full animate-pulse"
                  style={{
                    height: `${h}px`,
                    animationDuration: `${0.4 + (idx % 4) * 0.15}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Real-time Voice Transcript / Response Box */}
        <div className="w-full min-h-[110px] max-h-48 overflow-y-auto p-4 rounded-2xl bg-[#0D101C] border border-[#1E263D] z-10 space-y-2">
          {interimTranscript && (
            <div className="text-xs text-slate-400 italic">
              <span className="text-[#B7FF3C] font-mono mr-1.5">You:</span>
              &ldquo;{interimTranscript}...&rdquo;
            </div>
          )}

          {transcript && (
            <div className="text-xs text-slate-300">
              <span className="text-[#B7FF3C] font-mono mr-1.5 font-bold">You asked:</span>
              &ldquo;{transcript}&rdquo;
            </div>
          )}

          {aiSpokenResponse ? (
            <div className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed pt-1 border-t border-[#192033]">
              <span className="text-[#A78BFA] font-mono mr-1.5 font-bold">Volt:</span>
              {aiSpokenResponse}
            </div>
          ) : isThinking ? (
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono py-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Volt is thinking...</span>
            </div>
          ) : !transcript && !interimTranscript ? (
            <div className="text-xs text-slate-500 text-center py-4">
              Tap the microphone and ask Volt anything. Voice responses are read back automatically.
            </div>
          ) : null}
        </div>

        {/* Quick Voice Suggestions */}
        {!aiSpokenResponse && !isThinking && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 my-3 z-10 max-w-md">
            {suggestedVoicePrompts.map((sug, i) => (
              <button
                key={i}
                onClick={() => {
                  setTranscript(sug);
                  handleQueryAI(sug);
                }}
                className="px-2.5 py-1 text-[11px] rounded-lg bg-[#141828] hover:bg-[#1C2338] border border-[#232A40] text-slate-300 hover:text-white transition-all"
              >
                &ldquo;{sug}&rdquo;
              </button>
            ))}
          </div>
        )}

        {/* Bottom Voice Controls */}
        <div className="w-full flex items-center justify-between pt-4 border-t border-[#1A2033] z-10">
          {/* Hands-free Toggle */}
          <button
            onClick={() => setAutoContinuous(!autoContinuous)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              autoContinuous
                ? 'bg-[#B7FF3C]/10 text-[#B7FF3C] border-[#B7FF3C]/40'
                : 'bg-[#121626] text-slate-400 border-[#222A42]'
            }`}
            title="Auto-listen for follow-up questions"
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${autoContinuous ? 'text-[#B7FF3C]' : 'text-slate-500'}`} />
            <span>Continuous Siri Mode</span>
          </button>

          {/* Central Mic Button */}
          <div className="flex items-center gap-3">
            {isSpeaking && (
              <button
                onClick={handleStopSpeaking}
                className="p-3 rounded-2xl bg-[#1C2237] hover:bg-[#27304E] text-slate-300 text-xs font-semibold transition-all"
                title="Stop audio readout"
              >
                <VolumeX className="w-4 h-4 text-red-400" />
              </button>
            )}

            <button
              onClick={isListening ? stopListening : startListening}
              className={`p-4 rounded-3xl transition-all shadow-xl active:scale-95 flex items-center justify-center ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_25px_rgba(239,68,68,0.5)] animate-pulse'
                  : 'bg-[#B7FF3C] hover:bg-[#A6F024] text-black shadow-[0_0_25px_rgba(183,255,60,0.4)]'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff className="w-6 h-6 font-bold" /> : <Mic className="w-6 h-6 font-bold" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
