import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ArrowRight, ArrowLeft, Calendar, Target, Brain,
  Layout, BarChart3, RotateCcw, Sparkles, CheckCircle2, ChevronRight,
  GraduationCap, Clock, HelpCircle, PartyPopper
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { DEFAULT_CONTENT_TYPES } from '@/types';
import confetti from 'canvas-confetti';

interface OnboardingData {
  name: string;
  examName: string;
  examDate: string;
  targetScore: number;
  targetRank: number;
  contentTypes: string[];
  dailyHours: number;
  mocksPerWeek: number;
  questionsPerTopic: number;
}

const TOTAL_STEPS = 7;

const exams = ['NEET PG', 'INICET', 'FMGE'];

const tourCards = [
  { icon: Layout, title: 'Task Board', desc: 'Organize daily study tasks with a visual Kanban board. Drag between Today, This Week, and Backlog.', color: 'from-blue-500 to-cyan-500' },
  { icon: BookOpen, title: 'Subject Tracking', desc: 'Track 19 subjects with chapters and topics. Mark video lectures, MCQs, PYQs as done.', color: 'from-emerald-500 to-teal-500' },
  { icon: RotateCcw, title: 'Smart Revisions', desc: 'Spaced repetition auto-schedules revisions based on your confidence level.', color: 'from-amber-500 to-orange-500' },
  { icon: BarChart3, title: 'Analytics & Insights', desc: 'Study patterns, MCQ trends, readiness score, and NEET PG rank prediction.', color: 'from-purple-500 to-pink-500' },
];

export function OnboardingWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [tourIndex, setTourIndex] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    name: '',
    examName: 'NEET PG',
    examDate: '2027-03-15',
    targetScore: 650,
    targetRank: 5000,
    contentTypes: ['main-video', 'mcqs'],
    dailyHours: 6,
    mocksPerWeek: 2,
    questionsPerTopic: 15,
  });
  const [firstTaskTitle, setFirstTaskTitle] = useState('Study Anatomy - Upper Limb');

  const totalQuestions = useMemo(() => 1256 * data.questionsPerTopic, [data.questionsPerTopic]);

  const canProceed = () => {
    switch (step) {
      case 1: return data.name.trim().length > 0;
      case 2: return data.examName && data.examDate;
      case 3: return data.contentTypes.length > 0;
      case 4: return true;
      case 5: return true;
      case 6: return firstTaskTitle.trim().length > 0;
      default: return true;
    }
  };

  const handleNext = () => {
    if (step === 6) {
      // Create first task & trigger confetti
      const task = {
        id: `task-${Date.now()}`,
        title: firstTaskTitle,
        type: 'study' as const,
        subjectId: 'anatomy',
        duration: 30,
        completed: false,
        column: 'today' as const,
        priority: 'medium' as const,
      };
      const existing = JSON.parse(localStorage.getItem('neetpg-tasks') || '[]');
      localStorage.setItem('neetpg-tasks', JSON.stringify([task, ...existing]));
      
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      setStep(7);
      return;
    }
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const handleFinish = () => {
    // Save all settings
    localStorage.setItem('planos-user', JSON.stringify({ name: data.name.trim(), loggedIn: true }));
    localStorage.setItem('neetpg-examname', JSON.stringify(data.examName));
    localStorage.setItem('neetpg-examdate', JSON.stringify(new Date(data.examDate)));
    localStorage.setItem('neetpg-target', JSON.stringify(data.targetScore));
    localStorage.setItem('neetpg-target-rank', JSON.stringify(data.targetRank));
    localStorage.setItem('neetpg-mcq-goal', JSON.stringify(data.questionsPerTopic));
    localStorage.setItem('planos-onboarded', 'true');

    // Save content types
    const types = DEFAULT_CONTENT_TYPES.map(ct => ({
      ...ct,
      enabled: data.contentTypes.includes(ct.id),
    }));
    localStorage.setItem('neetpg-content-types', JSON.stringify(types));

    navigate('/');
  };

  const toggleContentType = (id: string) => {
    setData(prev => ({
      ...prev,
      contentTypes: prev.contentTypes.includes(id)
        ? prev.contentTypes.filter(t => t !== id)
        : [...prev.contentTypes, id],
    }));
  };

  const contentOptions = [
    { id: 'main-video', label: 'Main Video (RR)', icon: '📹' },
    { id: 'rr-video', label: 'Rapid Revision', icon: '⚡' },
    { id: 'btr-video', label: 'BTR / Notes', icon: '📝' },
    { id: 'mcqs', label: 'MCQs', icon: '✅' },
    { id: 'pyqs', label: 'PYQs', icon: '📋' },
  ];

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  const [direction, setDirection] = useState(1);

  const goNext = () => { setDirection(1); handleNext(); };
  const goPrev = () => { setDirection(-1); setStep(Math.max(1, step - 1)); };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-secondary">
        <motion.div
          className="h-full gradient-primary"
          animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 pt-8">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {/* Step 1: Welcome */}
              {step === 1 && (
                <div className="flex flex-col items-center gap-6 text-center">
                  <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.1 }}
                    className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-glow"
                  >
                    <BookOpen className="w-10 h-10 text-primary-foreground" />
                  </motion.div>
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Welcome to Plan OS</h1>
                    <p className="text-muted-foreground">Your intelligent study operating system for NEET PG</p>
                  </div>
                  <div className="w-full space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">What's your name?</label>
                      <Input
                        value={data.name}
                        onChange={e => setData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your name"
                        className="h-12 text-base"
                        autoFocus
                        onKeyDown={e => e.key === 'Enter' && canProceed() && goNext()}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Exam Details */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <GraduationCap className="w-10 h-10 text-primary mx-auto mb-2" />
                    <h2 className="text-2xl font-bold">Exam Details</h2>
                    <p className="text-sm text-muted-foreground mt-1">Let's set up your target</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Which exam?</label>
                      <div className="grid grid-cols-3 gap-2">
                        {exams.map(exam => (
                          <button
                            key={exam}
                            onClick={() => setData(prev => ({ ...prev, examName: exam }))}
                            className={cn(
                              'p-3 rounded-xl text-sm font-medium border transition-all',
                              data.examName === exam
                                ? 'gradient-primary text-primary-foreground border-transparent shadow-glow'
                                : 'bg-card border-border hover:border-primary/30'
                            )}
                          >{exam}</button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">When is your exam?</label>
                      <Input
                        type="date"
                        value={data.examDate}
                        onChange={e => setData(prev => ({ ...prev, examDate: e.target.value }))}
                        className="h-11"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Target Score</label>
                        <Input
                          type="number"
                          value={data.targetScore}
                          onChange={e => setData(prev => ({ ...prev, targetScore: parseInt(e.target.value) || 0 }))}
                          className="h-11"
                          min={0}
                          max={800}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Target Rank</label>
                        <Input
                          type="number"
                          value={data.targetRank}
                          onChange={e => setData(prev => ({ ...prev, targetRank: parseInt(e.target.value) || 0 }))}
                          className="h-11"
                          min={1}
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-center text-muted-foreground">Step 2 of {TOTAL_STEPS}</p>
                </div>
              )}

              {/* Step 3: Content Types */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <Brain className="w-10 h-10 text-primary mx-auto mb-2" />
                    <h2 className="text-2xl font-bold">What's Your Base?</h2>
                    <p className="text-sm text-muted-foreground mt-1">Select all content types you use</p>
                  </div>

                  <div className="space-y-2">
                    {contentOptions.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => toggleContentType(opt.id)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left',
                          data.contentTypes.includes(opt.id)
                            ? 'bg-primary/10 border-primary/30 text-foreground'
                            : 'bg-card border-border hover:border-primary/20'
                        )}
                      >
                        <span className="text-xl">{opt.icon}</span>
                        <span className="font-medium text-sm flex-1">{opt.label}</span>
                        {data.contentTypes.includes(opt.id) && (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>

                  <p className="text-[10px] text-center text-muted-foreground">Step 3 of {TOTAL_STEPS}</p>
                </div>
              )}

              {/* Step 4: Study Preferences */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <Clock className="w-10 h-10 text-primary mx-auto mb-2" />
                    <h2 className="text-2xl font-bold">Study Preferences</h2>
                    <p className="text-sm text-muted-foreground mt-1">Help us personalize your experience</p>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Daily study hours</label>
                        <span className="text-sm font-bold text-primary">{data.dailyHours}h</span>
                      </div>
                      <Slider
                        value={[data.dailyHours]}
                        onValueChange={([v]) => setData(prev => ({ ...prev, dailyHours: v }))}
                        min={2}
                        max={12}
                        step={1}
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>2h</span><span>12h</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Mock tests per week</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map(n => (
                          <button
                            key={n}
                            onClick={() => setData(prev => ({ ...prev, mocksPerWeek: n }))}
                            className={cn(
                              'p-2.5 rounded-xl text-sm font-medium border transition-all',
                              data.mocksPerWeek === n
                                ? 'gradient-primary text-primary-foreground border-transparent'
                                : 'bg-card border-border'
                            )}
                          >{n}{n === 4 ? '+' : ''}</button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Questions per topic</label>
                      <Input
                        type="number"
                        value={data.questionsPerTopic}
                        onChange={e => setData(prev => ({ ...prev, questionsPerTopic: parseInt(e.target.value) || 15 }))}
                        className="h-11"
                        min={5}
                        max={100}
                      />
                      <div className="bg-primary/5 rounded-lg p-2.5 border border-primary/10">
                        <p className="text-xs text-muted-foreground">
                          1,256 topics × {data.questionsPerTopic} = <span className="font-bold text-foreground">{totalQuestions.toLocaleString()} total questions</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-center text-muted-foreground">Step 4 of {TOTAL_STEPS}</p>
                </div>
              )}

              {/* Step 5: Feature Tour */}
              {step === 5 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <Sparkles className="w-10 h-10 text-primary mx-auto mb-2" />
                    <h2 className="text-2xl font-bold">Quick Tour</h2>
                    <p className="text-sm text-muted-foreground mt-1">Swipe through key features</p>
                  </div>

                  <div className="relative overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={tourIndex}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        className={cn('rounded-2xl p-6 text-center bg-gradient-to-br text-white', tourCards[tourIndex].color)}
                      >
                        {(() => { const Icon = tourCards[tourIndex].icon; return <Icon className="w-12 h-12 mx-auto mb-3 opacity-90" />; })()}
                        <h3 className="text-xl font-bold mb-2">{tourCards[tourIndex].title}</h3>
                        <p className="text-sm text-white/80">{tourCards[tourIndex].desc}</p>
                      </motion.div>
                    </AnimatePresence>

                    {/* Dots */}
                    <div className="flex justify-center gap-2 mt-4">
                      {tourCards.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setTourIndex(i)}
                          className={cn(
                            'w-2 h-2 rounded-full transition-all',
                            i === tourIndex ? 'bg-primary w-6' : 'bg-muted-foreground/30'
                          )}
                        />
                      ))}
                    </div>

                    {/* Tour nav */}
                    <div className="flex justify-between mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={tourIndex === 0}
                        onClick={() => setTourIndex(i => i - 1)}
                      >
                        <ArrowLeft className="w-4 h-4 mr-1" /> Previous
                      </Button>
                      {tourIndex < tourCards.length - 1 ? (
                        <Button variant="ghost" size="sm" onClick={() => setTourIndex(i => i + 1)}>
                          Next <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={goNext}>
                          Continue <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <button onClick={goNext} className="text-xs text-muted-foreground hover:text-foreground mx-auto block">
                    Skip Tour →
                  </button>

                  <p className="text-[10px] text-center text-muted-foreground">Step 5 of {TOTAL_STEPS}</p>
                </div>
              )}

              {/* Step 6: Create First Task */}
              {step === 6 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <Target className="w-10 h-10 text-primary mx-auto mb-2" />
                    <h2 className="text-2xl font-bold">Your First Task</h2>
                    <p className="text-sm text-muted-foreground mt-1">Let's create your first study task</p>
                  </div>

                  <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Task title</label>
                      <Input
                        value={firstTaskTitle}
                        onChange={e => setFirstTaskTitle(e.target.value)}
                        placeholder="e.g., Study Anatomy - Upper Limb"
                        className="h-11"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">Today</span>
                      <span>•</span>
                      <span>30 min</span>
                      <span>•</span>
                      <span>Medium priority</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-center text-muted-foreground">Step 6 of {TOTAL_STEPS}</p>
                </div>
              )}

              {/* Step 7: Ready! */}
              {step === 7 && (
                <div className="flex flex-col items-center gap-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center"
                  >
                    <PartyPopper className="w-10 h-10 text-green-500" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">You're All Set, {data.name}! 🎉</h2>
                    <p className="text-muted-foreground text-sm">Your preparation journey starts now</p>
                  </div>

                  <div className="w-full bg-card rounded-xl border border-border p-4 text-left space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your Setup</p>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Exam</span>
                        <span className="font-medium">{data.examName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Target Score</span>
                        <span className="font-medium">{data.targetScore}/800</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Target Rank</span>
                        <span className="font-medium">{data.targetRank.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Daily Goal</span>
                        <span className="font-medium">{data.dailyHours}h/day</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Questions</span>
                        <span className="font-medium">{totalQuestions.toLocaleString()} total</span>
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleFinish} size="lg" className="w-full gradient-primary text-primary-foreground font-semibold gap-2 h-12 text-base">
                    Start My Preparation <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom navigation */}
      {step < 7 && (
        <div className="p-4 pb-6">
          <div className="max-w-md mx-auto flex gap-3">
            {step > 1 && (
              <Button variant="outline" onClick={goPrev} className="h-12">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <Button
              onClick={goNext}
              disabled={!canProceed()}
              className="flex-1 h-12 gradient-primary text-primary-foreground font-semibold gap-2 disabled:opacity-40"
            >
              {step === 6 ? 'Create My First Task' : step === 5 && tourIndex < tourCards.length - 1 ? 'Skip Tour' : 'Continue'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OnboardingWizard;
