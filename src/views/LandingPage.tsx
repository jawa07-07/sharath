import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Code2,
  GraduationCap,
  Lightbulb,
  Rocket,
  Compass,
  CheckCircle,
  Cpu,
  Brain,
  Zap,
} from 'lucide-react';
import { ActiveView, MentorStyle } from '../types';
import { MonsterMascot } from '../components/MonsterMascot';

interface LandingPageProps {
  onNavigate: (view: ActiveView, initialPrompt?: string, style?: MentorStyle) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const examplePrompts = [
    {
      title: 'Teach me something new',
      prompt: 'Teach me something mind-blowing about how modern large language models actually predict tokens.',
      style: 'friendly' as MentorStyle,
      badge: 'Curiosity',
    },
    {
      title: 'Help me learn programming',
      prompt: 'Help me master TypeScript generics with 3 real-world practical patterns and edge cases.',
      style: 'coding' as MentorStyle,
      badge: 'Code',
    },
    {
      title: 'Explain a difficult topic simply',
      prompt: 'Explain quantum computing and superposition simply, using a fun analogy.',
      style: 'teacher' as MentorStyle,
      badge: 'Foundations',
    },
    {
      title: 'Help me build a project',
      prompt: 'Help me architect a full-stack real-time collaboration app. What tech stack and data structures should I use?',
      style: 'coding' as MentorStyle,
      badge: 'Architecture',
    },
    {
      title: 'Create a learning plan for me',
      prompt: 'Create a personalized 4-week learning roadmap for mastering modern AI engineering and prompt design.',
      style: 'teacher' as MentorStyle,
      badge: 'Roadmap',
    },
    {
      title: 'Career interview prep',
      prompt: 'Conduct a mock technical system design interview for a Senior Frontend Engineer position.',
      style: 'career' as MentorStyle,
      badge: 'Career',
    },
  ];

  const features = [
    {
      icon: Brain,
      title: 'Multi-Persona Mentorship',
      desc: 'Switch between 5 tailored mentor personas: Friendly Companion, Master Teacher, Coding Expert, Creative Coach, and Career Strategist.',
      color: 'text-[#B7FF3C] border-[#B7FF3C]/30 bg-[#B7FF3C]/10',
    },
    {
      icon: Cpu,
      title: 'Adaptive Learning Roadmaps',
      desc: 'Generate customized multi-week curricula for any topic and skill level with interactive lessons and practical exercises.',
      color: 'text-[#8B5CF6] border-[#8B5CF6]/30 bg-[#8B5CF6]/10',
    },
    {
      icon: Zap,
      title: 'Dynamic Real-Time Quizzes',
      desc: 'Verify genuine conceptual understanding through automated quizzes evaluated with instant feedback and explanations.',
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    },
    {
      icon: Code2,
      title: 'Pristine Code & Markdown',
      desc: 'Receive syntax-highlighted code blocks with one-click copy, formatted lists, blockquotes, and streaming responses.',
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    },
  ];

  return (
    <div className="min-h-screen cyber-grid pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 pb-16 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#8B5CF6]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-[#B7FF3C]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151928] border border-[#2B3450] text-xs font-semibold text-slate-300 mb-6 shadow-[0_0_20px_rgba(183,255,60,0.15)]">
            <span className="w-2 h-2 rounded-full bg-[#B7FF3C] animate-ping" />
            <span className="text-[#B7FF3C]">Powered by Gemini 3.8</span>
            <span className="text-slate-500">•</span>
            <span>Your Cybernetic Learning Ally</span>
          </div>

          {/* Hero Mascot */}
          <div className="flex justify-center mb-6">
            <MonsterMascot
              size="hero"
              state="happy"
              showSpeechBubble={true}
              speechText="Greetings Human! Let's conquer hard skills today!"
            />
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
            Your Potential.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B7FF3C] via-[#94E810] to-[#8B5CF6] text-glow-green">
              Unleashed.
            </span>
          </h1>

          {/* Description */}
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-300 font-normal leading-relaxed mb-10">
            Your personal AI mentor for learning, creating, and growing. Master programming, grasp complex science, build
            ambitious projects, and accelerate your career.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#B7FF3C] hover:bg-[#A6F024] text-black font-extrabold text-base flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(183,255,60,0.35)] hover:shadow-[0_0_35px_rgba(183,255,60,0.5)] active:scale-95"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => onNavigate('chat')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#151928] hover:bg-[#1E243A] text-white font-bold text-base flex items-center justify-center gap-2 border border-[#2D3654] hover:border-[#8B5CF6] transition-all shadow-xl active:scale-95"
            >
              <Sparkles className="w-5 h-5 text-[#8B5CF6]" />
              <span>Try AI Mentor</span>
            </button>
          </div>
        </div>
      </section>

      {/* Suggested Prompts Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-[#B7FF3C]" />
              Kickstart Your Session
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Click any prompt to launch straight into an interactive mentoring session.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {examplePrompts.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate('chat', item.prompt, item.style)}
              className="group cursor-pointer p-5 rounded-2xl bg-[#0F1321]/90 border border-[#21283E] hover:border-[#B7FF3C]/60 hover:bg-[#141A2D] transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_rgba(183,255,60,0.15)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#1B2236] text-[#B7FF3C] border border-[#2C3756]">
                    {item.badge}
                  </span>
                  <span className="text-xs text-slate-400 capitalize">{item.style} mode</span>
                </div>
                <h3 className="font-bold text-base text-white group-hover:text-[#B7FF3C] transition-colors mb-2">
                  &ldquo;{item.title}&rdquo;
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">&ldquo;{item.prompt}&rdquo;</p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1C2337] flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-white">
                <span>Ask Volt</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#B7FF3C] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white">Engineered for Deep Learning</h2>
          <p className="text-slate-400 max-w-xl mx-auto mt-2 text-sm">
            Not just another chatbot. MonsterMentor AI combines pedagogical scaffolding, persistent roadmap tracking, and
            knowledge checkpoints.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-[#0F1320] border border-[#1E253A] hover:border-[#2C3652] transition-all shadow-xl flex flex-col"
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${feat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-white mb-2">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#131728] to-[#0D101C] border border-[#232B42] shadow-2xl relative overflow-hidden">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-extrabold text-white">How MonsterMentor Works</h3>
            <p className="text-xs text-slate-400 mt-1">Three simple steps to unlock mastery</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#B7FF3C] text-black font-extrabold flex items-center justify-center mb-3 text-sm">
                1
              </div>
              <h4 className="font-bold text-white text-sm mb-1">Select Topic & Persona</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose what you want to learn and pick your ideal mentor style.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#8B5CF6] text-white font-extrabold flex items-center justify-center mb-3 text-sm">
                2
              </div>
              <h4 className="font-bold text-white text-sm mb-1">Generate Roadmap & Chat</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Gemini constructs step-by-step curricula with interactive explanations.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-cyan-400 text-black font-extrabold flex items-center justify-center mb-3 text-sm">
                3
              </div>
              <h4 className="font-bold text-white text-sm mb-1">Test & Track Progress</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Take AI quizzes, log study streaks, and watch your skills multiply.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-2.5 rounded-xl bg-[#B7FF3C] hover:bg-[#A6F024] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(183,255,60,0.3)]"
            >
              Open Your Dashboard Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
