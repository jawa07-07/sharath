export type MentorStyle = 'friendly' | 'teacher' | 'coding' | 'creative' | 'career';

export interface MentorStyleInfo {
  id: MentorStyle;
  name: string;
  tagline: string;
  icon: string;
  badgeColor: string;
  borderGlow: string;
  description: string;
  monsterMood: 'happy' | 'thinking' | 'talking' | 'idle';
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  style?: MentorStyle;
}

export interface Conversation {
  id: string;
  userId?: string;
  title: string;
  mentorStyle: MentorStyle;
  createdAt: string;
  updatedAt: string;
  lastMessagePreview?: string;
  messageCount: number;
}

export interface RoadmapModule {
  id: string;
  title: string;
  description: string;
  keyConcepts: string[];
  practicalExercise: string;
  estimatedMinutes: number;
}

export interface LearningPlan {
  id: string;
  userId?: string;
  topic: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
  estimatedHours: number;
  modules: RoadmapModule[];
  completedModuleIds: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  isAnonymous: boolean;
  mentorStyle: MentorStyle;
  dailyGoalMinutes: number;
  themePreference?: 'cyber-dark' | 'neon-glow';
  createdAt?: string;
}

export interface LearningStats {
  totalConversations: number;
  totalMessages: number;
  totalPlans: number;
  completedModules: number;
  quizCompletedCount: number;
  averageQuizScore: number;
  minutesLearnedToday: number;
  streakDays: number;
}

export type ActiveView = 'landing' | 'dashboard' | 'chat' | 'learning' | 'history' | 'settings';
