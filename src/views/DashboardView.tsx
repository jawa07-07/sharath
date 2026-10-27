import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MessageSquare,
  BookOpen,
  Trophy,
  Flame,
  ArrowRight,
  Clock,
  CheckCircle2,
  TrendingUp,
  Target,
  Plus,
  Trash2,
  Zap,
} from 'lucide-react';
import { ActiveView, Conversation, LearningPlan, LearningStats, MentorStyle, UserProfile } from '../types';
import { MonsterMascot } from '../components/MonsterMascot';
import { storage, MENTOR_STYLES_DATA } from '../services/storage';
import { useToast } from '../components/Toast';

interface DashboardViewProps {
  onNavigate: (view: ActiveView, initialPrompt?: string, style?: MentorStyle, conversationId?: string) => void;
  activeMentorStyle: MentorStyle;
  onSelectMentorStyle: (style: MentorStyle) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  activeMentorStyle,
  onSelectMentorStyle,
}) => {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<UserProfile>(storage.getProfile());
  const [stats, setStats] = useState<LearningStats>(storage.getAggregateStats());
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);
  const [activePlans, setActivePlans] = useState<LearningPlan[]>([]);
  const [quickPrompt, setQuickPrompt] = useState('');
  const [dailyGoal, setDailyGoal] = useState<number>(30);

  const loadData = () => {
    const prof = storage.getProfile();
    setProfile(prof);
    setDailyGoal(prof.dailyGoalMinutes || 30);
    setStats(storage.getAggregateStats());
    setRecentConversations(storage.getConversations().slice(0, 4));
    setActivePlans(storage.getLearningPlans().slice(0, 3));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPrompt.trim()) return;
    onNavigate('chat', quickPrompt.trim(), activeMentorStyle);
  };

  const handleAdjustGoal = (newGoal: number) => {
    const updated = { ...profile, dailyGoalMinutes: newGoal };
    storage.saveProfile(updated);
    setDailyGoal(newGoal);
    setProfile(updated);
    showToast(`Daily learning goal updated to ${newGoal} minutes!`, 'success');
  };

  const handleDeleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    storage.deleteConversation(id);
    showToast('Conversation deleted.', 'info');
    loadData();
  };

  const currentMentor = MENTOR_STYLES_DATA.find((s) => s.id === activeMentorStyle) || MENTOR_STYLES_DATA[0];

  // Dynamic greeting based on time of day
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const goalPercent = Math.min(100, Math.round((stats.minutesLearnedToday / (dailyGoal || 1)) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#111526] via-[#141A2F] to-[#121626] border border-[#252E47] p-6 sm:p-8 shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#B7FF3C]/5 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <MonsterMascot
              size="lg"
              state="happy"
              showSpeechBubble={true}
              speechText={`Ready to crush your goals, ${profile.displayName}?`}
            />

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#B7FF3C]/10 text-[#B7FF3C] border border-[#B7FF3C]/30">
                  {currentMentor.name} Active
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Streak: {stats.streakDays} {stats.streakDays === 1 ? 'day' : 'days'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {timeGreeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B7FF3C] to-emerald-400">{profile.displayName}</span>!
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-xl">
                What are we conquering today? Ask anything in chat, generate a roadmap, or continue your practice.
              </p>
            </div>
          </div>

          {/* Quick Chat Input Shortcut */}
          <div className="w-full md:w-96">
            <form onSubmit={handleQuickChatSubmit} className="relative">
              <input
                type="text"
                value={quickPrompt}
                onChange={(e) => setQuickPrompt(e.target.value)}
                placeholder="Ask Volt anything to start a session..."
                className="w-full pl-4 pr-12 py-3 rounded-2xl bg-[#090C16] border border-[#28324E] text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#B7FF3C] focus:ring-1 focus:ring-[#B7FF3C] transition-all"
              />
              <button
                type="submit"
                disabled={!quickPrompt.trim()}
                className="absolute right-2 top-2 bottom-2 px-3 rounded-xl bg-[#B7FF3C] hover:bg-[#A6F024] disabled:opacity-40 text-black flex items-center justify-center transition-all shadow-[0_0_12px_rgba(183,255,60,0.3)]"
              >
                <ArrowRight className="w-4 h-4 font-bold" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Actual Data Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0E121F] border border-[#1E253A] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Conversations</span>
            <MessageSquare className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{stats.totalConversations}</div>
          <p className="text-[11px] text-slate-400 mt-1">{stats.totalMessages} total messages exchanged</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0E121F] border border-[#1E253A] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Active Roadmaps</span>
            <BookOpen className="w-4 h-4 text-[#B7FF3C]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{stats.totalPlans}</div>
          <p className="text-[11px] text-slate-400 mt-1">{stats.completedModules} modules completed</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0E121F] border border-[#1E253A] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Quizzes Taken</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{stats.quizCompletedCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">
            {stats.quizCompletedCount > 0 ? `${stats.averageQuizScore}% average mastery` : 'No quizzes completed yet'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0E121F] border border-[#1E253A] shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Today's Focus</span>
            <Flame className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{stats.minutesLearnedToday}m</div>
          <p className="text-[11px] text-slate-400 mt-1">Goal: {dailyGoal} mins ({goalPercent}%)</p>
        </div>
      </div>

      {/* Main Two-Column Content: Goal Progress + Quick Actions & Recent Convs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Daily Goal Tracker + Suggested Activities */}
        <div className="space-y-6">
          {/* Daily Goal Card */}
          <div className="p-6 rounded-2xl bg-[#0E121F] border border-[#1F263C] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#B7FF3C]" />
                <h3 className="font-bold text-white text-base">Daily Learning Goal</h3>
              </div>
              <span className="text-xs font-mono font-bold text-[#B7FF3C]">{goalPercent}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#181E30] h-3 rounded-full overflow-hidden p-0.5 border border-[#232B42]">
              <div
                className="h-full bg-gradient-to-r from-[#B7FF3C] to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(183,255,60,0.5)]"
                style={{ width: `${goalPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{stats.minutesLearnedToday} of {dailyGoal} minutes completed</span>
              {goalPercent >= 100 && (
                <span className="flex items-center gap-1 text-[#B7FF3C] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Met!
                </span>
              )}
            </div>

            {/* Quick goal adjustment buttons */}
            <div className="pt-2 border-t border-[#1C2236] flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Set Goal:</span>
              <div className="flex gap-1.5">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => handleAdjustGoal(mins)}
                    className={`px-2 py-0.5 text-[11px] rounded-lg border transition-all ${
                      dailyGoal === mins
                        ? 'bg-[#B7FF3C] text-black border-[#B7FF3C] font-bold'
                        : 'bg-[#151928] text-slate-400 border-[#262E48] hover:text-white'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Learning Center Action */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#121626] to-[#0D101C] border border-[#232B42] shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#8B5CF6]" />
              <h3 className="font-bold text-white text-base">Generate a Learning Roadmap</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Have Gemini build a custom, step-by-step curriculum with interactive quizzes for any technology or topic.
            </p>
            <button
              onClick={() => onNavigate('learning')}
              className="w-full py-2.5 rounded-xl bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 border border-[#8B5CF6]/40 text-[#A78BFA] hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <span>Explore Learning Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right 2 Columns: Recent Conversations + Suggested Learning Prompts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Conversations */}
          <div className="p-6 rounded-2xl bg-[#0E121F] border border-[#1F263C] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#B7FF3C]" />
                Recent Conversations
              </h3>
              <button
                onClick={() => onNavigate('history')}
                className="text-xs text-[#B7FF3C] hover:underline flex items-center gap-1 font-semibold"
              >
                View all ({stats.totalConversations}) <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {recentConversations.length === 0 ? (
              <div className="text-center py-8 rounded-xl bg-[#090C16] border border-dashed border-[#23293E] p-6">
                <MonsterMascot size="sm" state="idle" className="mx-auto mb-2 opacity-60" />
                <p className="text-xs text-slate-400">No conversations yet.</p>
                <button
                  onClick={() => onNavigate('chat')}
                  className="mt-3 px-4 py-2 rounded-xl bg-[#B7FF3C] text-black font-bold text-xs hover:bg-[#A6F024] transition-all"
                >
                  Start First Session
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recentConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => onNavigate('chat', undefined, conv.mentorStyle, conv.id)}
                    className="p-3.5 rounded-xl bg-[#131726] border border-[#21283E] hover:border-[#B7FF3C]/50 hover:bg-[#171D30] transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#1C2337] text-[#B7FF3C]">
                          {conv.mentorStyle}
                        </span>
                        <button
                          onClick={(e) => handleDeleteConversation(e, conv.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-500 hover:text-red-400 transition-opacity"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-[#B7FF3C] transition-colors truncate">
                        {conv.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-snug">
                        {conv.lastMessagePreview || 'Empty conversation'}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#1C2237] flex items-center justify-between text-[11px] text-slate-400">
                      <span>{conv.messageCount || 0} messages</span>
                      <span>{new Date(conv.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suggested Activities */}
          <div className="p-6 rounded-2xl bg-[#0E121F] border border-[#1F263C] shadow-xl space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Suggested Learning Activities
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                onClick={() =>
                  onNavigate(
                    'chat',
                    'Teach me the fundamentals of Rust memory safety and ownership model with clean examples.',
                    'coding'
                  )
                }
                className="p-4 rounded-xl bg-[#131726] border border-[#21283E] hover:border-cyan-500/50 hover:bg-[#161D32] transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-cyan-400 mb-1">Code Deep-Dive</div>
                <div className="text-sm font-semibold text-white group-hover:text-cyan-300">Rust Ownership & Memory</div>
                <p className="text-xs text-slate-400 mt-1">Grasp borrow checker & lifecycles.</p>
              </div>

              <div
                onClick={() =>
                  onNavigate(
                    'chat',
                    'Explain neural networks and backpropagation step-by-step with intuitive calculus intuition.',
                    'teacher'
                  )
                }
                className="p-4 rounded-xl bg-[#131726] border border-[#21283E] hover:border-emerald-500/50 hover:bg-[#161D32] transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-emerald-400 mb-1">Foundational AI</div>
                <div className="text-sm font-semibold text-white group-hover:text-emerald-300">Backpropagation Decoded</div>
                <p className="text-xs text-slate-400 mt-1">Pedagogical visual intuition.</p>
              </div>

              <div
                onClick={() =>
                  onNavigate(
                    'chat',
                    'Conduct a mock behavioral and technical leadership interview for a Staff Engineer role.',
                    'career'
                  )
                }
                className="p-4 rounded-xl bg-[#131726] border border-[#21283E] hover:border-amber-500/50 hover:bg-[#161D32] transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-amber-400 mb-1">Career Strategy</div>
                <div className="text-sm font-semibold text-white group-hover:text-amber-300">Staff Interview Prep</div>
                <p className="text-xs text-slate-400 mt-1">STAR framing & high-impact answers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
