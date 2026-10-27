import { Conversation, Message, LearningPlan, UserProfile, LearningStats, MentorStyle } from '../types';

const STORAGE_KEYS = {
  CONVERSATIONS: 'monstermentor_conversations',
  MESSAGES_PREFIX: 'monstermentor_messages_',
  LEARNING_PLANS: 'monstermentor_learning_plans',
  QUIZ_RESULTS: 'monstermentor_quiz_results',
  USER_PROFILE: 'monstermentor_profile',
  DAILY_STATS: 'monstermentor_daily_stats',
};

// Default Guest Profile
export const DEFAULT_PROFILE: UserProfile = {
  uid: 'guest_' + Math.random().toString(36).substring(2, 9),
  displayName: 'Cyber Explorer',
  isAnonymous: true,
  mentorStyle: 'friendly',
  dailyGoalMinutes: 30,
  themePreference: 'cyber-dark',
  createdAt: new Date().toISOString(),
};

export const MENTOR_STYLES_DATA = [
  {
    id: 'friendly' as MentorStyle,
    name: 'Volt (Companion)',
    tagline: 'High-energy, warm, cheering you on',
    icon: 'Sparkles',
    badgeColor: 'bg-[#B7FF3C]/10 text-[#B7FF3C] border-[#B7FF3C]/30',
    borderGlow: 'hover:border-[#B7FF3C]/60 hover:shadow-[0_0_20px_rgba(183,255,60,0.2)]',
    description: 'Enthusiastic alien monster friend who explains ideas with lively analogies and celebrates every breakthrough.',
    monsterMood: 'happy' as const,
  },
  {
    id: 'teacher' as MentorStyle,
    name: 'Master Teacher',
    tagline: 'Pedagogical, Socratic, step-by-step',
    icon: 'GraduationCap',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    borderGlow: 'hover:border-emerald-500/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    description: 'Patient academic mentor who structures concepts logically and tests your understanding with thoughtful questions.',
    monsterMood: 'thinking' as const,
  },
  {
    id: 'coding' as MentorStyle,
    name: 'Coding Expert',
    tagline: 'Senior software architect & debugger',
    icon: 'Terminal',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    borderGlow: 'hover:border-cyan-500/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]',
    description: 'World-class developer delivering pristine code, architectural best practices, and edge-case analysis.',
    monsterMood: 'talking' as const,
  },
  {
    id: 'creative' as MentorStyle,
    name: 'Creative Coach',
    tagline: 'Lateral thinking, brainstorming, bold ideas',
    icon: 'Lightbulb',
    badgeColor: 'bg-[#8B5CF6]/15 text-[#A78BFA] border-[#8B5CF6]/30',
    borderGlow: 'hover:border-[#8B5CF6]/60 hover:shadow-[0_0_20px_rgba(139,92,246,0.25)]',
    description: 'Catalyst for creative writing, product innovation, game design, and unlocking non-linear ideas.',
    monsterMood: 'talking' as const,
  },
  {
    id: 'career' as MentorStyle,
    name: 'Career Strategist',
    tagline: 'Pragmatic, interview prep, skill maps',
    icon: 'Compass',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    borderGlow: 'hover:border-amber-500/60 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]',
    description: 'High-impact industry coach focusing on technical portfolios, resume phrasing, and strategic career moves.',
    monsterMood: 'thinking' as const,
  },
];

class StorageService {
  // User Profile
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Storage read failed', e);
    }
    this.saveProfile(DEFAULT_PROFILE);
    return DEFAULT_PROFILE;
  }

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Storage write failed', e);
    }
  }

  // Conversations
  getConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      if (data) {
        const parsed: Conversation[] = JSON.parse(data);
        return parsed.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      }
    } catch (e) {
      console.warn('Failed to load conversations', e);
    }
    return [];
  }

  saveConversation(conv: Conversation): void {
    const list = this.getConversations();
    const index = list.findIndex((c) => c.id === conv.id);
    if (index >= 0) {
      list[index] = conv;
    } else {
      list.unshift(conv);
    }
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(list));
  }

  deleteConversation(id: string): void {
    const list = this.getConversations().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(list));
    localStorage.removeItem(STORAGE_KEYS.MESSAGES_PREFIX + id);
  }

  renameConversation(id: string, newTitle: string): void {
    const list = this.getConversations();
    const item = list.find((c) => c.id === id);
    if (item) {
      item.title = newTitle;
      item.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(list));
    }
  }

  // Messages
  getMessages(conversationId: string): Message[] {
    try {
      const key = STORAGE_KEYS.MESSAGES_PREFIX + conversationId;
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load messages', e);
    }
    return [];
  }

  saveMessages(conversationId: string, messages: Message[]): void {
    try {
      const key = STORAGE_KEYS.MESSAGES_PREFIX + conversationId;
      localStorage.setItem(key, JSON.stringify(messages));

      // Also update conversation metadata
      const convs = this.getConversations();
      const current = convs.find((c) => c.id === conversationId);
      if (current) {
        current.messageCount = messages.length;
        current.updatedAt = new Date().toISOString();
        if (messages.length > 0) {
          const last = messages[messages.length - 1];
          current.lastMessagePreview = last.content.substring(0, 100).trim();
        }
        localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(convs));
      }
    } catch (e) {
      console.warn('Failed to save messages', e);
    }
  }

  // Learning Plans
  getLearningPlans(): LearningPlan[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEARNING_PLANS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load plans', e);
    }
    return [];
  }

  saveLearningPlan(plan: LearningPlan): void {
    const plans = this.getLearningPlans();
    const index = plans.findIndex((p) => p.id === plan.id);
    if (index >= 0) {
      plans[index] = plan;
    } else {
      plans.unshift(plan);
    }
    localStorage.setItem(STORAGE_KEYS.LEARNING_PLANS, JSON.stringify(plans));
  }

  toggleModuleComplete(planId: string, moduleId: string): LearningPlan | null {
    const plans = this.getLearningPlans();
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      const exists = plan.completedModuleIds.includes(moduleId);
      if (exists) {
        plan.completedModuleIds = plan.completedModuleIds.filter((id) => id !== moduleId);
      } else {
        plan.completedModuleIds.push(moduleId);
        this.addLearningMinutes(20); // reward 20 minutes study time
      }
      plan.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.LEARNING_PLANS, JSON.stringify(plans));
      return plan;
    }
    return null;
  }

  deleteLearningPlan(id: string): void {
    const plans = this.getLearningPlans().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.LEARNING_PLANS, JSON.stringify(plans));
  }

  // Quiz Results
  saveQuizResult(score: number, total: number, topic: string): void {
    try {
      const current = this.getQuizResults();
      current.push({
        score,
        total,
        topic,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem(STORAGE_KEYS.QUIZ_RESULTS, JSON.stringify(current));
      this.addLearningMinutes(10); // Reward 10 minutes study time for taking quiz
    } catch (e) {
      console.warn('Failed to save quiz result', e);
    }
  }

  getQuizResults(): Array<{ score: number; total: number; topic: string; timestamp: string }> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUIZ_RESULTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to read quiz results', e);
    }
    return [];
  }

  // Learning Minutes & Streak
  getTodayStats(): { minutesToday: number; streakDays: number } {
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = localStorage.getItem(STORAGE_KEYS.DAILY_STATS);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.date === today) {
          return { minutesToday: parsed.minutes || 0, streakDays: parsed.streak || 1 };
        }
      }
    } catch (e) {
      console.warn('Failed to read daily stats', e);
    }
    return { minutesToday: 0, streakDays: 1 };
  }

  addLearningMinutes(mins: number): void {
    try {
      const today = new Date().toISOString().split('T')[0];
      const current = this.getTodayStats();
      const updated = {
        date: today,
        minutes: current.minutesToday + mins,
        streak: current.streakDays,
      };
      localStorage.setItem(STORAGE_KEYS.DAILY_STATS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to update learning minutes', e);
    }
  }

  // Computed Real Stats
  getAggregateStats(): LearningStats {
    const convs = this.getConversations();
    const plans = this.getLearningPlans();
    const quizzes = this.getQuizResults();
    const today = this.getTodayStats();

    const totalMessages = convs.reduce((acc, c) => acc + (c.messageCount || 0), 0);
    const completedModules = plans.reduce((acc, p) => acc + (p.completedModuleIds?.length || 0), 0);

    let avgQuizScore = 0;
    if (quizzes.length > 0) {
      const totalPercent = quizzes.reduce((acc, q) => acc + (q.score / (q.total || 1)) * 100, 0);
      avgQuizScore = Math.round(totalPercent / quizzes.length);
    }

    return {
      totalConversations: convs.length,
      totalMessages,
      totalPlans: plans.length,
      completedModules,
      quizCompletedCount: quizzes.length,
      averageQuizScore: avgQuizScore,
      minutesLearnedToday: today.minutesToday,
      streakDays: today.streakDays,
    };
  }

  // Export / Clear
  exportAllData(): string {
    const exportObject = {
      profile: this.getProfile(),
      conversations: this.getConversations(),
      plans: this.getLearningPlans(),
      quizzes: this.getQuizResults(),
      stats: this.getAggregateStats(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(exportObject, null, 2);
  }

  clearAllData(): void {
    localStorage.clear();
  }
}

export const storage = new StorageService();
