import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  RotateCcw,
  Trash2,
  Copy,
  Check,
  PlusCircle,
  Volume2,
  VolumeX,
  Edit2,
  AlertCircle,
  Loader2,
  Terminal,
  Zap,
} from 'lucide-react';
import { Conversation, MentorStyle, Message } from '../types';
import { MonsterMascot, MascotState } from '../components/MonsterMascot';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { storage, MENTOR_STYLES_DATA } from '../services/storage';
import { useToast } from '../components/Toast';

interface ChatViewProps {
  initialPrompt?: string;
  initialStyle?: MentorStyle;
  initialConversationId?: string;
  onConversationCreated?: (id: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  initialPrompt,
  initialStyle = 'friendly',
  initialConversationId,
  onConversationCreated,
}) => {
  const { showToast } = useToast();
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState(initialPrompt || '');
  const [selectedStyle, setSelectedStyle] = useState<MentorStyle>(initialStyle);
  const [isLoading, setIsLoading] = useState(false);
  const [mascotMood, setMascotMood] = useState<MascotState>('idle');
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize or load conversation
  useEffect(() => {
    if (initialConversationId) {
      const convs = storage.getConversations();
      const existing = convs.find((c) => c.id === initialConversationId);
      if (existing) {
        setCurrentConversation(existing);
        setSelectedStyle(existing.mentorStyle);
        setTitleInput(existing.title);
        setMessages(storage.getMessages(existing.id));
        return;
      }
    }

    // Otherwise create or pick default
    startNewConversation(initialStyle);
  }, [initialConversationId]);

  // Handle auto-submitting initialPrompt if passed
  useEffect(() => {
    if (initialPrompt && currentConversation && messages.length === 0 && !isLoading) {
      sendMessage(initialPrompt);
    }
  }, [currentConversation]);

  // Scroll to bottom on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage, isLoading]);

  const startNewConversation = (style: MentorStyle = selectedStyle) => {
    const id = 'conv_' + Date.now();
    const newConv: Conversation = {
      id,
      title: 'New Mentorship Session',
      mentorStyle: style,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
    };
    storage.saveConversation(newConv);
    setCurrentConversation(newConv);
    setTitleInput(newConv.title);
    setMessages([]);
    setStreamingMessage('');
    setApiError(null);
    onConversationCreated?.(id);
  };

  const handleStyleChange = (style: MentorStyle) => {
    setSelectedStyle(style);
    if (currentConversation) {
      const updated = { ...currentConversation, mentorStyle: style, updatedAt: new Date().toISOString() };
      storage.saveConversation(updated);
      setCurrentConversation(updated);
    }
    showToast(`Mentor persona switched to ${style}`, 'info');
  };

  const handleTitleSave = () => {
    if (!titleInput.trim() || !currentConversation) {
      setIsEditingTitle(false);
      return;
    }
    storage.renameConversation(currentConversation.id, titleInput.trim());
    setCurrentConversation({ ...currentConversation, title: titleInput.trim() });
    setIsEditingTitle(false);
    showToast('Conversation renamed.', 'success');
  };

  const handleClearChat = () => {
    if (!currentConversation) return;
    storage.saveMessages(currentConversation.id, []);
    setMessages([]);
    setStreamingMessage('');
    showToast('Chat history cleared.', 'info');
  };

  // Main message sender with SSE streaming to Gemini backend
  const sendMessage = async (textToSend: string) => {
    const cleanText = textToSend.trim();
    if (!cleanText || isLoading) return;

    if (cleanText.length > 4000) {
      showToast('Message exceeds maximum limit of 4,000 characters.', 'error');
      return;
    }

    if (!currentConversation) {
      startNewConversation();
      return;
    }

    setApiError(null);
    setInputText('');

    // Add User message
    const userMsg: Message = {
      id: 'msg_' + Date.now(),
      conversationId: currentConversation.id,
      role: 'user',
      content: cleanText,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    storage.saveMessages(currentConversation.id, newHistory);

    // Update conversation title automatically on first prompt if default title
    if (messages.length === 0 && currentConversation.title === 'New Mentorship Session') {
      const autoTitle = cleanText.length > 35 ? cleanText.substring(0, 32) + '...' : cleanText;
      storage.renameConversation(currentConversation.id, autoTitle);
      setCurrentConversation((prev) => (prev ? { ...prev, title: autoTitle } : null));
      setTitleInput(autoTitle);
    }

    setIsLoading(true);
    setMascotMood('thinking');
    setStreamingMessage('');

    // Setup abort controller for cancel
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          style: selectedStyle,
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${response.status}: ${response.statusText}`);
      }

      setMascotMood('talking');

      // Check if response is SSE or JSON fallback
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream')) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        if (reader) {
          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('data: ')) {
                const dataStr = trimmed.slice(6).trim();
                if (dataStr === '[DONE]') {
                  break;
                }
                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.error) {
                    throw new Error(parsed.error);
                  }
                  if (parsed.text) {
                    accumulated += parsed.text;
                    setStreamingMessage(accumulated);
                  }
                } catch (jsonErr: any) {
                  // Not fatal JSON line
                }
              }
            }
          }
        }

        // Finalize model message
        const finalModelMsg: Message = {
          id: 'msg_' + Date.now(),
          conversationId: currentConversation.id,
          role: 'model',
          content: accumulated || "Volt received your message, but didn't generate any output.",
          timestamp: new Date().toISOString(),
          style: selectedStyle,
        };

        const finalHistory = [...newHistory, finalModelMsg];
        setMessages(finalHistory);
        storage.saveMessages(currentConversation.id, finalHistory);
        storage.addLearningMinutes(2); // reward 2 minutes study time for chat interaction
      } else {
        // Standard JSON fallback
        const data = await response.json();
        const finalModelMsg: Message = {
          id: 'msg_' + Date.now(),
          conversationId: currentConversation.id,
          role: 'model',
          content: data.text || 'Done!',
          timestamp: new Date().toISOString(),
          style: selectedStyle,
        };
        const finalHistory = [...newHistory, finalModelMsg];
        setMessages(finalHistory);
        storage.saveMessages(currentConversation.id, finalHistory);
        storage.addLearningMinutes(2);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream generation aborted by user.');
      } else {
        console.error('Chat error:', err);
        setApiError(err.message || 'Unable to connect to Gemini AI.');
        showToast(err.message || 'Error communicating with AI mentor.', 'error');
      }
    } finally {
      setIsLoading(false);
      setMascotMood('idle');
      setStreamingMessage('');
      abortControllerRef.current = null;
    }
  };

  const handleRetry = () => {
    if (messages.length === 0) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      // Remove last model reply if present and resend
      const filtered = messages.filter((m) => m.id !== lastUserMsg.id);
      setMessages(filtered);
      sendMessage(lastUserMsg.content);
    }
  };

  // Copy whole response
  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      showToast('Response copied to clipboard!', 'success');
    } catch (e) {
      showToast('Failed to copy', 'error');
    }
  };

  // Text to Speech playback using Web Speech Synthesis API
  const handleToggleSpeech = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!('speechSynthesis' in window)) {
      showToast('Speech synthesis not supported in this browser.', 'info');
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/```[\s\S]*?```/g, 'Code block omitted for audio.').replace(/[*#>`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const suggestedPrompts = [
    'Teach me something new.',
    'Help me learn programming.',
    'Explain a difficult topic simply.',
    'Help me build a project.',
    'Create a learning plan for me.',
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-5rem)] flex flex-col">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#1E253A]">
        {/* Title & Rename */}
        <div className="flex items-center gap-3">
          <MonsterMascot size="sm" state={mascotMood} />
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                className="px-2.5 py-1 text-sm rounded-lg bg-[#121626] border border-[#B7FF3C] text-white focus:outline-none"
                autoFocus
              />
              <button onClick={handleTitleSave} className="p-1 rounded bg-[#B7FF3C] text-black">
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-xs sm:max-w-md">
                {currentConversation?.title || 'MonsterMentorship'}
              </h2>
              <button
                onClick={() => setIsEditingTitle(true)}
                className="p-1 text-slate-400 hover:text-white transition-colors"
                title="Rename conversation"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => startNewConversation()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141A2D] hover:bg-[#1C243E] text-slate-200 border border-[#273250] text-xs font-semibold transition-all"
            title="Start fresh conversation"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#B7FF3C]" />
            <span>New Chat</span>
          </button>

          <button
            onClick={handleClearChat}
            disabled={messages.length === 0}
            className="p-2 rounded-xl bg-[#141A2D] hover:bg-[#1C243E] disabled:opacity-30 text-slate-400 hover:text-red-400 border border-[#273250] text-xs transition-all"
            title="Clear chat messages"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mentor Persona Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none border-b border-[#1A2033]">
        <span className="text-xs font-mono text-slate-400 font-semibold shrink-0">Style:</span>
        {MENTOR_STYLES_DATA.map((style) => (
          <button
            key={style.id}
            onClick={() => handleStyleChange(style.id)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all border ${
              selectedStyle === style.id
                ? 'bg-[#B7FF3C] text-black border-[#B7FF3C] shadow-[0_0_12px_rgba(183,255,60,0.3)] font-bold'
                : 'bg-[#101422] text-slate-300 border-[#20273D] hover:bg-[#171D30] hover:text-white'
            }`}
          >
            {style.name}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-2">
        {messages.length === 0 && !streamingMessage ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10 px-4">
            <MonsterMascot
              size="lg"
              state="happy"
              showSpeechBubble={true}
              speechText="I'm ready! Pick a prompt below or type anything!"
            />
            <h3 className="text-xl font-bold text-white mt-4">Welcome to Your AI Mentorship Session</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-1 mb-8">
              Ask deep conceptual questions, paste code for review, or request customized roadmaps.
            </p>

            {/* Suggested Prompts Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl">
              {suggestedPrompts.map((promptText, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(promptText)}
                  className="px-3.5 py-2 rounded-xl bg-[#111626] hover:bg-[#182036] border border-[#232B44] hover:border-[#B7FF3C]/50 text-xs text-slate-200 transition-all active:scale-95 text-left"
                >
                  &ldquo;{promptText}&rdquo;
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="shrink-0 mt-1">
                    <MonsterMascot size="xs" state="idle" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 transition-all shadow-lg ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-[#8B5CF6]/90 to-[#7C3AED] text-white rounded-br-none shadow-[0_0_20px_rgba(139,92,246,0.25)]'
                      : 'bg-[#121626] border border-[#242C44] text-slate-100 rounded-bl-none shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
                  }`}
                >
                  {msg.role === 'model' ? (
                    <div>
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#1E253A]">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#B7FF3C]">
                          <Zap className="w-3.5 h-3.5" />
                          <span>Volt ({msg.style || selectedStyle})</span>
                        </div>

                        {/* Action buttons on message */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleSpeech(msg.content)}
                            className="p-1 rounded hover:bg-[#1D243A] text-slate-400 hover:text-white transition-colors"
                            title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                          >
                            {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-[#B7FF3C]" /> : <Volume2 className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleCopyMessage(msg.content)}
                            className="p-1 rounded hover:bg-[#1D243A] text-slate-400 hover:text-white transition-colors"
                            title="Copy response"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <MarkdownRenderer content={msg.content} />
                    </div>
                  ) : (
                    <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  )}

                  <div
                    className={`text-[10px] font-mono mt-2 flex items-center ${
                      msg.role === 'user' ? 'justify-end text-purple-200' : 'justify-start text-slate-400'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {/* Live Streaming Message Display */}
            {isLoading && (
              <div className="flex gap-3 sm:gap-4 justify-start">
                <div className="shrink-0 mt-1">
                  <MonsterMascot size="xs" state="talking" />
                </div>
                <div className="max-w-[88%] sm:max-w-[80%] rounded-2xl rounded-bl-none p-4 sm:p-5 bg-[#121626] border border-[#B7FF3C]/30 text-slate-100 shadow-[0_0_25px_rgba(183,255,60,0.15)]">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#1E253A] text-xs font-mono text-[#B7FF3C]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Volt is generating response...</span>
                  </div>
                  {streamingMessage ? (
                    <MarkdownRenderer content={streamingMessage} />
                  ) : (
                    <div className="flex items-center gap-2 py-2 text-slate-400 text-xs">
                      <span className="w-2 h-2 rounded-full bg-[#B7FF3C] animate-ping" />
                      <span>Synthesizing guidance and concepts...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* API Error Box */}
        {apiError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs sm:text-sm flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Gemini Error:</p>
                <p className="mt-0.5 text-red-300">{apiError}</p>
              </div>
            </div>
            <button
              onClick={handleRetry}
              className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-white font-medium text-xs flex items-center gap-1.5 shrink-0 transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="pt-3 border-t border-[#1E253A]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(inputText);
          }}
          className="relative rounded-2xl bg-[#0E121F] border border-[#262E46] focus-within:border-[#B7FF3C] focus-within:shadow-[0_0_20px_rgba(183,255,60,0.2)] transition-all"
        >
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(inputText);
              }
            }}
            placeholder={`Message Volt (${selectedStyle} mode)... Shift+Enter for newline`}
            rows={2}
            disabled={isLoading}
            className="w-full pl-4 pr-24 py-3 bg-transparent text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none scrollbar-none"
          />

          {/* Footer Controls inside Input */}
          <div className="flex items-center justify-between px-4 pb-2.5">
            <span className="text-[11px] font-mono text-slate-400">
              {inputText.length} / 4000
            </span>

            <div className="flex items-center gap-2">
              {isLoading ? (
                <button
                  type="button"
                  onClick={() => abortControllerRef.current?.abort()}
                  className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold transition-all"
                >
                  Stop
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="px-4 py-2 rounded-xl bg-[#B7FF3C] hover:bg-[#A6F024] disabled:opacity-40 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(183,255,60,0.3)] active:scale-95"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
