import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  Circle,
  HelpCircle,
  Layers,
  Clock,
  ArrowRight,
  Loader2,
  Trash2,
  Award,
  ChevronRight,
  X,
  RotateCcw,
  BookMarked,
  Zap,
} from 'lucide-react';
import { LearningPlan, Quiz, QuizQuestion, RoadmapModule } from '../types';
import { storage } from '../services/storage';
import { MonsterMascot } from '../components/MonsterMascot';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { useToast } from '../components/Toast';

export const LearningCenterView: React.FC = () => {
  const { showToast } = useToast();
  const [topicInput, setTopicInput] = useState('');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [weeks, setWeeks] = useState(4);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [savedPlans, setSavedPlans] = useState<LearningPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<LearningPlan | null>(null);

  // Lesson viewer state
  const [activeLessonModule, setActiveLessonModule] = useState<RoadmapModule | null>(null);
  const [lessonContent, setLessonContent] = useState<string>('');
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);

  // Quiz state
  const [activeQuizModule, setActiveQuizModule] = useState<RoadmapModule | null>(null);
  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  useEffect(() => {
    const plans = storage.getLearningPlans();
    setSavedPlans(plans);
    if (plans.length > 0 && !currentPlan) {
      setCurrentPlan(plans[0]);
    }
  }, []);

  const handleGenerateRoadmap = async () => {
    if (!topicInput.trim()) {
      showToast('Please enter a topic to generate a roadmap.', 'error');
      return;
    }

    setIsGeneratingRoadmap(true);
    try {
      const response = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicInput.trim(),
          level,
          weeks,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to generate roadmap');
      }

      const data = await response.json();
      const newPlan: LearningPlan = {
        id: 'plan_' + Date.now(),
        topic: data.topic || topicInput.trim(),
        level: data.level || level,
        summary: data.summary || '',
        estimatedHours: data.estimatedHours || 12,
        modules: data.modules || [],
        completedModuleIds: [],
        createdAt: new Date().toISOString(),
      };

      storage.saveLearningPlan(newPlan);
      const updatedList = storage.getLearningPlans();
      setSavedPlans(updatedList);
      setCurrentPlan(newPlan);
      setTopicInput('');
      showToast('New AI Roadmap created and saved!', 'success');
    } catch (err: any) {
      console.error('Roadmap generation error:', err);
      showToast(err.message || 'Error generating roadmap.', 'error');
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const handleToggleModule = (moduleId: string) => {
    if (!currentPlan) return;
    const updated = storage.toggleModuleComplete(currentPlan.id, moduleId);
    if (updated) {
      setCurrentPlan(updated);
      setSavedPlans(storage.getLearningPlans());
      const isComplete = updated.completedModuleIds.includes(moduleId);
      showToast(isComplete ? 'Module marked as completed! (+20 mins focus logged)' : 'Module unchecked.', 'info');
    }
  };

  const handleDeletePlan = (planId: string) => {
    storage.deleteLearningPlan(planId);
    const updated = storage.getLearningPlans();
    setSavedPlans(updated);
    if (currentPlan?.id === planId) {
      setCurrentPlan(updated.length > 0 ? updated[0] : null);
    }
    showToast('Learning plan deleted.', 'info');
  };

  // Open Lesson Reader
  const handleOpenLesson = async (mod: RoadmapModule) => {
    if (!currentPlan) return;
    setActiveLessonModule(mod);
    setIsLoadingLesson(true);
    setLessonContent('');

    try {
      const response = await fetch('/api/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentPlan.topic,
          moduleTitle: mod.title,
          level: currentPlan.level,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to load lesson');
      }

      const data = await response.json();
      setLessonContent(data.content || 'Lesson content is empty.');
    } catch (err: any) {
      showToast(err.message || 'Failed to load lesson content.', 'error');
      setActiveLessonModule(null);
    } finally {
      setIsLoadingLesson(false);
    }
  };

  // Open Quiz
  const handleOpenQuiz = async (mod: RoadmapModule) => {
    if (!currentPlan) return;
    setActiveQuizModule(mod);
    setIsLoadingQuiz(true);
    setQuizData(null);
    setUserAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentPlan.topic,
          moduleTitle: mod.title,
          difficulty: currentPlan.level,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to generate quiz');
      }

      const data: Quiz = await response.json();
      setQuizData(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load quiz.', 'error');
      setActiveQuizModule(null);
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  // Submit Quiz & Evaluate Actual Score
  const handleSubmitQuiz = () => {
    if (!quizData || !activeQuizModule || !currentPlan) return;

    let score = 0;
    quizData.questions.forEach((q) => {
      const userChoice = userAnswers[q.id];
      if (userChoice === q.correctIndex) {
        score += 1;
      }
    });

    setQuizScore(score);
    setQuizSubmitted(true);
    storage.saveQuizResult(score, quizData.questions.length, currentPlan.topic);
    showToast(`Quiz completed: ${score} / ${quizData.questions.length} correct! (+10 mins focus)`, 'success');
  };

  const sampleTopics = [
    'React 19 & Next.js Architecture',
    'Python for Machine Learning',
    'System Design & Microservices',
    'Rust Memory Safety',
    'Docker & Kubernetes Cloud DevOps',
    'PostgreSQL Query Optimization',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#111628] via-[#151C33] to-[#111422] border border-[#232B44] shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1 rounded-lg bg-[#B7FF3C]/10 text-[#B7FF3C] border border-[#B7FF3C]/30">
              <BookOpen className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono text-slate-300 font-semibold tracking-wider">
              Gemini Learning Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Interactive Learning Center</h1>
          <p className="text-sm text-slate-300 max-w-xl mt-1">
            Build custom curricula, study focused modules, and test yourself with real-time AI quizzes.
          </p>
        </div>

        <MonsterMascot size="md" state="thinking" />
      </div>

      {/* Generator Section */}
      <div className="p-6 rounded-2xl bg-[#0E121F] border border-[#1F263C] shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#B7FF3C]" />
          Create a New Learning Plan
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Learning Topic</label>
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="e.g. Modern Full-Stack TypeScript, Quantum Physics Basics..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#090C16] border border-[#262F48] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#B7FF3C] focus:ring-1 focus:ring-[#B7FF3C]"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Skill Level</label>
            <select
              value={level}
              onChange={(e: any) => setLevel(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#090C16] border border-[#262F48] text-sm text-white focus:outline-none focus:border-[#B7FF3C]"
            >
              <option value="Beginner">Beginner (Foundations)</option>
              <option value="Intermediate">Intermediate (Practical)</option>
              <option value="Advanced">Advanced (Mastery)</option>
            </select>
          </div>

          <div className="md:col-span-3 flex items-end">
            <button
              onClick={handleGenerateRoadmap}
              disabled={isGeneratingRoadmap || !topicInput.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-[#B7FF3C] hover:bg-[#A6F024] disabled:opacity-40 text-black font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(183,255,60,0.3)] active:scale-95"
            >
              {isGeneratingRoadmap ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Roadmap</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Sample Topics */}
        <div className="flex items-center gap-2 flex-wrap pt-2">
          <span className="text-xs text-slate-400">Popular:</span>
          {sampleTopics.map((top, idx) => (
            <button
              key={idx}
              onClick={() => setTopicInput(top)}
              className="text-xs px-2.5 py-1 rounded-lg bg-[#141828] hover:bg-[#1D2338] text-slate-300 border border-[#222A42] hover:border-[#B7FF3C]/40 transition-all"
            >
              {top}
            </button>
          ))}
        </div>
      </div>

      {/* Main Roadmap & Modules Viewer */}
      {currentPlan ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Saved Plans Switcher */}
          <div className="space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-[#8B5CF6]" />
              Your Saved Roadmaps ({savedPlans.length})
            </h3>

            <div className="space-y-2.5">
              {savedPlans.map((plan) => {
                const isSelected = plan.id === currentPlan.id;
                const completedCount = plan.completedModuleIds?.length || 0;
                const percent = Math.round((completedCount / (plan.modules?.length || 1)) * 100);

                return (
                  <div
                    key={plan.id}
                    onClick={() => setCurrentPlan(plan)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#151B2F] border-[#B7FF3C]/60 shadow-[0_0_20px_rgba(183,255,60,0.15)]'
                        : 'bg-[#0E121F] border-[#1F263C] hover:border-[#2C3652] hover:bg-[#121626]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C2337] text-[#B7FF3C] font-bold">
                        {plan.level}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlan(plan.id);
                        }}
                        className="p-1 rounded text-slate-500 hover:text-red-400"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="font-bold text-white text-sm line-clamp-1">{plan.topic}</h4>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{plan.summary}</p>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                      <span>{completedCount} / {plan.modules?.length} modules</span>
                      <span className="font-bold text-[#B7FF3C]">{percent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 2 Columns: Selected Roadmap Details & Interactive Modules */}
          <div className="lg:col-span-2 space-y-6">
            {/* Roadmap Card Header */}
            <div className="p-6 rounded-2xl bg-[#0E121F] border border-[#212940] shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-mono font-bold text-[#B7FF3C] uppercase tracking-wider">
                    {currentPlan.level} Curriculum
                  </span>
                  <h2 className="text-2xl font-extrabold text-white mt-1">{currentPlan.topic}</h2>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-[#141828] px-3 py-1.5 rounded-xl border border-[#222A42] shrink-0">
                  <Clock className="w-4 h-4 text-[#B7FF3C]" />
                  <span>Est. {currentPlan.estimatedHours} hours total</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{currentPlan.summary}</p>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-2 border-t border-[#1B2135]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Curriculum Progress</span>
                  <span className="font-mono font-bold text-[#B7FF3C]">
                    {currentPlan.completedModuleIds?.length || 0} / {currentPlan.modules?.length} completed (
                    {Math.round(
                      ((currentPlan.completedModuleIds?.length || 0) / (currentPlan.modules?.length || 1)) * 100
                    )}
                    %)
                  </span>
                </div>
                <div className="w-full bg-[#161B2C] h-2.5 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-[#B7FF3C] to-emerald-400 rounded-full transition-all duration-300"
                    style={{
                      width: `${(
                        ((currentPlan.completedModuleIds?.length || 0) / (currentPlan.modules?.length || 1)) *
                        100
                      ).toFixed(0)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Modules List */}
            <div className="space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#B7FF3C]" />
                Roadmap Modules & Exercises
              </h3>

              {currentPlan.modules.map((mod, index) => {
                const isCompleted = currentPlan.completedModuleIds?.includes(mod.id);

                return (
                  <div
                    key={mod.id || index}
                    className={`p-5 rounded-2xl border transition-all ${
                      isCompleted
                        ? 'bg-[#0E151A] border-emerald-500/40 shadow-sm'
                        : 'bg-[#0E121F] border-[#1F263C] hover:border-[#2F3A58]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleModule(mod.id)}
                          className="mt-1 transition-transform active:scale-90"
                          title={isCompleted ? 'Mark uncompleted' : 'Mark completed'}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-500 hover:text-[#B7FF3C]" />
                          )}
                        </button>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] font-mono text-slate-400 font-bold">Module {index + 1}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-[11px] text-slate-400 font-mono">~{mod.estimatedMinutes || 45} mins</span>
                          </div>
                          <h4 className="text-base font-bold text-white">{mod.title}</h4>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{mod.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Key Concepts Pills */}
                    {mod.keyConcepts && mod.keyConcepts.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5 pl-8">
                        {mod.keyConcepts.map((concept, cIdx) => (
                          <span
                            key={cIdx}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-[#161C2C] text-slate-300 border border-[#242C44]"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Practical Exercise Box */}
                    {mod.practicalExercise && (
                      <div className="mt-3.5 ml-8 p-3 rounded-xl bg-[#131726] border border-[#22283E] text-xs">
                        <span className="font-bold text-[#B7FF3C] block mb-0.5">Practical Exercise:</span>
                        <span className="text-slate-300">{mod.practicalExercise}</span>
                      </div>
                    )}

                    {/* Interactive Action Buttons */}
                    <div className="mt-4 ml-8 pt-3 border-t border-[#1C2237] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenLesson(mod)}
                          className="px-3 py-1.5 rounded-lg bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 border border-[#8B5CF6]/40 text-[#A78BFA] text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Study Lesson</span>
                        </button>

                        <button
                          onClick={() => handleOpenQuiz(mod)}
                          className="px-3 py-1.5 rounded-lg bg-[#B7FF3C]/10 hover:bg-[#B7FF3C]/20 border border-[#B7FF3C]/30 text-[#B7FF3C] text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Take Quiz</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleToggleModule(mod.id)}
                        className="text-xs text-slate-400 hover:text-white font-medium"
                      >
                        {isCompleted ? 'Completed ✓' : 'Mark Done'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 rounded-3xl bg-[#0E121F] border border-dashed border-[#23293E] p-8">
          <MonsterMascot size="md" state="idle" className="mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Learning Roadmaps Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-6">
            Type any technology, skill, or subject above and let Volt build your personalized step-by-step curriculum.
          </p>
        </div>
      )}

      {/* Lesson Reader Modal */}
      {activeLessonModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-[#0E121E] border border-[#242C44] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E253A] bg-[#131726]">
              <div>
                <span className="text-[11px] font-mono text-[#B7FF3C] font-bold">Interactive Module Lesson</span>
                <h3 className="text-lg font-bold text-white truncate max-w-lg">{activeLessonModule.title}</h3>
              </div>
              <button
                onClick={() => setActiveLessonModule(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2438] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {isLoadingLesson ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <MonsterMascot size="md" state="thinking" />
                  <Loader2 className="w-6 h-6 animate-spin text-[#B7FF3C] mt-4" />
                  <p className="text-xs text-slate-300 mt-2 font-mono">
                    Volt is writing your custom pedagogical lesson...
                  </p>
                </div>
              ) : (
                <MarkdownRenderer content={lessonContent} />
              )}
            </div>

            <div className="px-6 py-3 border-t border-[#1E253A] bg-[#121626] flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                {currentPlan?.topic} • {currentPlan?.level}
              </span>
              <button
                onClick={() => setActiveLessonModule(null)}
                className="px-4 py-2 rounded-xl bg-[#1C2237] hover:bg-[#27304E] text-slate-200 text-xs font-semibold"
              >
                Close Lesson
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {activeQuizModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-[#0E121E] border border-[#242C44] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E253A] bg-[#131726]">
              <div>
                <span className="text-[11px] font-mono text-cyan-400 font-bold">Knowledge Check</span>
                <h3 className="text-lg font-bold text-white truncate max-w-md">{activeQuizModule.title}</h3>
              </div>
              <button
                onClick={() => setActiveQuizModule(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2438] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {isLoadingQuiz ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <MonsterMascot size="md" state="thinking" />
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mt-4" />
                  <p className="text-xs text-slate-300 mt-2 font-mono">
                    Generating diagnostic quiz questions with Gemini...
                  </p>
                </div>
              ) : quizData ? (
                <div className="space-y-6">
                  {quizSubmitted && quizScore !== null && (
                    <div className="p-4 rounded-2xl bg-[#121E18] border border-[#B7FF3C]/50 text-center space-y-1">
                      <div className="text-2xl font-extrabold text-[#B7FF3C]">
                        {quizScore} / {quizData.questions.length} Correct
                      </div>
                      <p className="text-xs text-slate-300">
                        {quizScore === quizData.questions.length
                          ? 'Flawless score! You have truly mastered this concept.'
                          : quizScore >= quizData.questions.length / 2
                          ? 'Solid effort! Review the explanations below to close any gaps.'
                          : 'Good attempt. Check the explanations and try revisiting the lesson!'}
                      </p>
                    </div>
                  )}

                  {quizData.questions.map((q, qIndex) => {
                    const selectedIdx = userAnswers[q.id];

                    return (
                      <div key={q.id || qIndex} className="p-4 rounded-xl bg-[#121626] border border-[#20273D] space-y-3">
                        <div className="font-bold text-white text-sm">
                          <span className="text-[#B7FF3C] font-mono mr-2">Q{qIndex + 1}.</span>
                          {q.question}
                        </div>

                        {/* Options */}
                        <div className="space-y-2">
                          {q.options.map((opt, optIndex) => {
                            const isChosen = selectedIdx === optIndex;
                            const isCorrect = q.correctIndex === optIndex;

                            let optionClasses =
                              'p-3 rounded-xl border text-xs sm:text-sm text-left w-full transition-all flex items-center justify-between ';

                            if (quizSubmitted) {
                              if (isCorrect) {
                                optionClasses += 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-semibold';
                              } else if (isChosen && !isCorrect) {
                                optionClasses += 'bg-red-500/15 border-red-500 text-red-300';
                              } else {
                                optionClasses += 'bg-[#0A0D17] border-[#1D2336] text-slate-500 opacity-60';
                              }
                            } else {
                              if (isChosen) {
                                optionClasses +=
                                  'bg-[#B7FF3C]/10 border-[#B7FF3C] text-white shadow-[0_0_12px_rgba(183,255,60,0.2)] font-medium';
                              } else {
                                optionClasses += 'bg-[#0A0D17] border-[#1F263C] text-slate-300 hover:border-slate-500 hover:bg-[#121626]';
                              }
                            }

                            return (
                              <button
                                key={optIndex}
                                disabled={quizSubmitted}
                                onClick={() => setUserAnswers((prev) => ({ ...prev, [q.id]: optIndex }))}
                                className={optionClasses}
                              >
                                <span>{opt}</span>
                                {quizSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation on submission */}
                        {quizSubmitted && q.explanation && (
                          <div className="p-3 rounded-lg bg-[#0C101C] border border-[#1E2538] text-xs text-slate-300 mt-2">
                            <strong className="text-[#B7FF3C] block mb-0.5">Explanation:</strong>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-400 text-xs">Failed to load questions.</p>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#1E253A] bg-[#121626] flex items-center justify-between">
              <button
                onClick={() => setActiveQuizModule(null)}
                className="px-4 py-2 rounded-xl bg-[#1C2237] hover:bg-[#27304E] text-slate-300 text-xs font-semibold"
              >
                Close
              </button>

              {!quizSubmitted && quizData && (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(userAnswers).length < quizData.questions.length}
                  className="px-5 py-2 rounded-xl bg-[#B7FF3C] hover:bg-[#A6F024] disabled:opacity-40 text-black font-extrabold text-xs transition-all shadow-[0_0_15px_rgba(183,255,60,0.3)] active:scale-95"
                >
                  Submit & View Results
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
