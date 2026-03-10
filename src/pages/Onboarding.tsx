import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ArrowRight, ArrowLeft, Target, Brain,
  Layout, BarChart3, RotateCcw, CheckCircle2,
  GraduationCap, Clock, PartyPopper
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { DEFAULT_CONTENT_TYPES } from '@/types';
import { predictRank, predictScoreFromRank } from '@/data/neetRankData';
import confetti from 'canvas-confetti';

interface OnboardingData {
  name: string;
  examName: string;
  examDate: string;
  targetScore: number;
  targetRank: number;
  contentTypes: string[];
  dailyHours: number;
  mocksPerMonth: number;
  questionsPerTopic: number;
}

const TOTAL_STEPS = 7;
const exams = ['NEET PG', 'INICET', 'FMGE'];

const tourCards = [
  { icon: Layout, title: 'Task Board', desc: 'Organize daily study tasks with a visual Kanban board.' },
  { icon: BookOpen, title: 'Subject Tracking', desc: 'Track 19 subjects with chapters and topics.' },
  { icon: RotateCcw, title: 'Smart Revisions', desc: 'Spaced repetition auto-schedules based on confidence.' },
  { icon: BarChart3, title: 'Analytics', desc: 'Study patterns, readiness score, and rank prediction.' },
];

export function OnboardingWizard() {
  const navigate = useNavigate();
  const location = useLocation();
  const nameFromLogin = (location.state as any)?.name || '';
  const [step, setStep] = useState(nameFromLogin ? 2 : 1);
  const [tourIndex, setTourIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    name: nameFromLogin,
    examName: 'NEET PG',
    examDate: '2027-03-15',
    targetScore: 650,
    targetRank: 5000,
    contentTypes: ['main-video'],
    dailyHours: 6,
    mocksPerMonth: 4,
    questionsPerTopic: 15,
  });
  const [firstTaskTitle, setFirstTaskTitle] = useState('Study Anatomy - Upper Limb');

  const totalQuestions = useMemo(() => 1256 * data.questionsPerTopic, [data.questionsPerTopic]);

  // Bidirectional score ↔ rank
  const handleScoreChange = useCallback((score: number) => {
    if (score < 0 || score > 800) return;
    const { rankMin, rankMax } = predictRank(score);
    const midRank = Math.round((rankMin + rankMax) / 2);
    setData(prev => ({ ...prev, targetScore: score, targetRank: midRank }));
  }, []);

  const handleRankChange = useCallback((rank: number) => {
    if (rank < 1) return;
    const score = predictScoreFromRank(rank);
    setData(prev => ({ ...prev, targetRank: rank, targetScore: score }));
  }, []);

  const canProceed = () => {
    switch (step) {
      case 1: return data.name.trim().length > 0;
      case 2: return data.examName && data.examDate;
      case 3: return data.contentTypes.length > 0;
      default: return true;
    }
  };

  const handleNext = () => {
    if (step === 6) {
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
    localStorage.setItem('planos-user', JSON.stringify({ name: data.name.trim(), loggedIn: true }));
    localStorage.setItem('neetpg-examname', JSON.stringify(data.examName));
    localStorage.setItem('neetpg-examdate', JSON.stringify(new Date(data.examDate)));
    localStorage.setItem('neetpg-target', JSON.stringify(data.targetScore));
    localStorage.setItem('neetpg-target-rank', JSON.stringify(data.targetRank));
    localStorage.setItem('neetpg-mcq-goal', JSON.stringify(data.questionsPerTopic));
    localStorage.setItem('planos-onboarded', 'true');

    const types = DEFAULT_CONTENT_TYPES.map(ct => ({
      ...ct,
      enabled: ct.compulsory ? true : data.contentTypes.includes(ct.id),
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
    { id: 'main-video', label: 'Main Videos', icon: '📹' },
    { id: 'rr-video', label: 'Rapid Revision', icon: '⚡' },
    { id: 'btr-video', label: 'BTR', icon: '📝' },
  ];

  const goNext = () => { setDirection(1); handleNext(); };
  const goPrev = () => { setDirection(-1); setStep(Math.max(1, step - 1)); };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-secondary">
        <motion.div
          className="h-full gradient-primary"
          animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Step indicator */}
      {step < 7 && (
        <div className="pt-5 px-4 text-center">
          <span className="text-[11px] text-muted-foreground">Step {step} of {TOTAL_STEPS}</span>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {/* Step 1: Welcome */}
              {step === 1 && (
                <div className="flex flex-col items-center gap-5 text-center">
                  <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.1 }}
                    className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-glow"
                  >
                    <BookOpen className="w-8 h-8 text-primary-foreground" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold mb-1">Welcome to Plan OS</h1>
                    <p className="text-sm text-muted-foreground">Your intelligent study companion</p>
                  </div>
                  <div className="w-full">
                    <label className="text-sm font-medium text-left block mb-1.5">What's your name?</label>
                    <Input
                      value={data.name}
                      onChange={e => setData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your name"
                      className="h-11"
                      autoFocus
                      onKeyDown={e => e.key === 'Enter' && canProceed() && goNext()}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Exam Details */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="text-center">
                    <GraduationCap className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h2 className="text-xl font-bold">Exam Details</h2>
                    <p className="text-xs text-muted-foreground mt-1">Set your target</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium block mb-1.5">Which exam?</label>
                      <div className="grid grid-cols-3 gap-2">
                        {exams.map(exam => (
                          <button
                            key={exam}
                            onClick={() => setData(prev => ({ ...prev, examName: exam }))}
                            className={cn(
                              'p-2.5 rounded-lg text-sm font-medium border transition-all',
                              data.examName === exam
                                ? 'gradient-primary text-primary-foreground border-transparent'
                                : 'bg-card border-border hover:border-primary/30'
                            )}
                          >{exam}</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-1.5">Exam date</label>
                      <Input
                        type="date"
                        value={data.examDate}
                        onChange={e => setData(prev => ({ ...prev, examDate: e.target.value }))}
                        className="h-10"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium block mb-1.5">Target Score</label>
                        <Input
                          type="number"
                          value={data.targetScore}
                          onChange={e => handleScoreChange(parseInt(e.target.value) || 0)}
                          className="h-10"
                          min={0}
                          max={800}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1.5">Target Rank</label>
                        <Input
                          type="number"
                          value={data.targetRank}
                          onChange={e => handleRankChange(parseInt(e.target.value) || 1)}
                          className="h-10"
                          min={1}
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center">Score and rank auto-sync based on NEET PG data</p>

                    {/* Exam Weightage Preview */}
                    <div className="bg-secondary/50 rounded-lg p-3 space-y-1.5">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Subject Weightage ({data.examName})</p>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 max-h-32 overflow-y-auto">
                        {Object.entries(EXAM_WEIGHTAGES[data.examName] || {}).map(([id, info]) => {
                          const subjectName = SUBJECT_NAMES[id] || id;
                          return (
                            <div key={id} className="flex items-center justify-between text-[10px]">
                              <span className="text-muted-foreground truncate">{subjectName}</span>
                              <span className="font-medium shrink-0 ml-1">{(info as any).avg}Q</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                </div>
              )}

              {/* Step 3: Content Types */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="text-center">
                    <Brain className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h2 className="text-xl font-bold">What's Your Base?</h2>
                    <p className="text-xs text-muted-foreground mt-1">Select content types you use</p>
                  </div>

                  <div className="space-y-2">
                    {contentOptions.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => toggleContentType(opt.id)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left',
                          data.contentTypes.includes(opt.id)
                            ? 'bg-primary/10 border-primary/30'
                            : 'bg-card border-border hover:border-primary/20'
                        )}
                      >
                        <span className="text-lg">{opt.icon}</span>
                        <span className="font-medium text-sm flex-1">{opt.label}</span>
                        {data.contentTypes.includes(opt.id) && (
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Study Preferences */}
              {step === 4 && (
                <div className="space-y-5">
                  <div className="text-center">
                    <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h2 className="text-xl font-bold">Study Preferences</h2>
                    <p className="text-xs text-muted-foreground mt-1">Personalize your experience</p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between mb-2">
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
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                        <span>2h</span><span>12h</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">Mock tests per month</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map(n => (
                          <button
                            key={n}
                            onClick={() => setData(prev => ({ ...prev, mocksPerMonth: n }))}
                            className={cn(
                              'p-2 rounded-lg text-sm font-medium border transition-all',
                              data.mocksPerMonth === n
                                ? 'gradient-primary text-primary-foreground border-transparent'
                                : 'bg-card border-border'
                            )}
                          >{n}</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-1.5">Questions per topic</label>
                      <Input
                        type="number"
                        value={data.questionsPerTopic}
                        onChange={e => setData(prev => ({ ...prev, questionsPerTopic: parseInt(e.target.value) || 15 }))}
                        className="h-10"
                        min={5}
                        max={100}
                      />
                      <div className="bg-card rounded-lg p-2 border border-border mt-2">
                        <p className="text-xs text-muted-foreground">
                          1,256 topics × {data.questionsPerTopic} = <span className="font-semibold text-foreground">{totalQuestions.toLocaleString()} questions</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Feature Tour */}
              {step === 5 && (
                <div className="space-y-5">
                  <div className="text-center">
                    <h2 className="text-xl font-bold">Quick Tour</h2>
                    <p className="text-xs text-muted-foreground mt-1">Key features at a glance</p>
                  </div>

                  <div className="space-y-3">
                    {tourCards.map((card, i) => {
                      const Icon = card.icon;
                      return (
                        <motion.div
                          key={card.title}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="flex items-start gap-3 p-3 bg-card rounded-lg border border-border"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">{card.title}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{card.desc}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 6: Create First Task */}
              {step === 6 && (
                <div className="space-y-5">
                  <div className="text-center">
                    <Target className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h2 className="text-xl font-bold">Your First Task</h2>
                    <p className="text-xs text-muted-foreground mt-1">Create your first study task</p>
                  </div>

                  <div className="bg-card rounded-lg border border-border p-4 space-y-3">
                    <div>
                      <label className="text-sm font-medium block mb-1.5">Task title</label>
                      <Input
                        value={firstTaskTitle}
                        onChange={e => setFirstTaskTitle(e.target.value)}
                        placeholder="e.g., Study Anatomy - Upper Limb"
                        className="h-10"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded font-medium">Today</span>
                      <span>•</span>
                      <span>30 min</span>
                      <span>•</span>
                      <span>Medium</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 7: Ready! */}
              {step === 7 && (
                <div className="flex flex-col items-center gap-5 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
                  >
                    <PartyPopper className="w-8 h-8 text-primary" />
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-bold mb-1">You're All Set, {data.name}! 🎉</h2>
                    <p className="text-sm text-muted-foreground">Your preparation journey starts now</p>
                  </div>

                  <div className="w-full bg-card rounded-lg border border-border p-4 text-left space-y-2">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Your Setup</p>
                    {[
                      ['Exam', data.examName],
                      ['Target Score', `${data.targetScore}/800`],
                      ['Target Rank', data.targetRank.toLocaleString()],
                      ['Daily Goal', `${data.dailyHours}h/day`],
                      ['Questions', `${totalQuestions.toLocaleString()} total`],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>

                  <Button onClick={handleFinish} size="lg" className="w-full gradient-primary text-primary-foreground font-semibold gap-2 h-11">
                    Start My Preparation <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom nav */}
      {step < 7 && (
        <div className="p-4 pb-6">
          <div className="max-w-md mx-auto flex gap-3">
            {step > 1 && (
              <Button variant="outline" onClick={goPrev} className="h-11">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <Button
              onClick={goNext}
              disabled={!canProceed()}
              className="flex-1 h-11 gradient-primary text-primary-foreground font-semibold gap-2 disabled:opacity-40"
            >
              {step === 6 ? 'Create My First Task' : 'Continue'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OnboardingWizard;
