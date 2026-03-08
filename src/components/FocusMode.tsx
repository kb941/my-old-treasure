import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Coffee, CheckCircle2, SkipForward, BookOpen, Brain, FileText, Clock, Star, Gamepad2 } from 'lucide-react';
import { Task, PomodoroSettings } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FocusModeProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  pomodoroSettings: PomodoroSettings;
  breakDuration?: number;
  onTaskDone: (taskId: string, duration: number, confidence?: number) => void;
}

const typeIcons = {
  study: BookOpen,
  revision: Brain,
  mcq: FileText,
  mock: FileText,
};

type TimerPhase = 'study' | 'short-break' | 'long-break' | 'custom-break';

export function FocusMode({ isOpen, onClose, tasks, pomodoroSettings, breakDuration = 10, onTaskDone }: FocusModeProps) {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [phase, setPhase] = useState<TimerPhase>('study');
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(pomodoroSettings.studyDuration * 60);
  const [sessionCount, setSessionCount] = useState(0);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [showConfidence, setShowConfidence] = useState(false);
  const [selectedConfidence, setSelectedConfidence] = useState(3);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const incompleteTasks = tasks.filter(t => !t.completed && !completedTasks.has(t.id));
  const currentTask = incompleteTasks[currentTaskIndex] || null;

  const getPhaseDuration = (p: TimerPhase) => {
    switch (p) {
      case 'study': return pomodoroSettings.studyDuration * 60;
      case 'short-break': return pomodoroSettings.shortBreakDuration * 60;
      case 'long-break': return pomodoroSettings.longBreakDuration * 60;
      case 'custom-break': return breakDuration * 60;
    }
  };

  // Lock body scroll when focus mode is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCurrentTaskIndex(0);
      setPhase('study');
      setIsRunning(false);
      setTimeRemaining(pomodoroSettings.studyDuration * 60);
      setSessionCount(0);
      setTotalStudyTime(0);
      setCompletedTasks(new Set());
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, pomodoroSettings.studyDuration]);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            if (phase === 'study') {
              const newCount = sessionCount + 1;
              setSessionCount(newCount);
              if (newCount % pomodoroSettings.sessionsBeforeLongBreak === 0) {
                setPhase('long-break');
                return pomodoroSettings.longBreakDuration * 60;
              } else {
                setPhase('short-break');
                return pomodoroSettings.shortBreakDuration * 60;
              }
            } else {
              setPhase('study');
              return pomodoroSettings.studyDuration * 60;
            }
          }
          return prev - 1;
        });
        if (phase === 'study') {
          setTotalStudyTime(prev => prev + 1);
        }
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, timeRemaining, phase, sessionCount, pomodoroSettings]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDone = () => {
    setIsRunning(false);
    if (currentTask?.topicId) {
      setShowConfidence(true);
    } else {
      finishCurrentTask();
    }
  };

  const finishCurrentTask = (confidence?: number) => {
    if (!currentTask) return;
    const elapsed = Math.ceil(totalStudyTime / 60);
    onTaskDone(currentTask.id, elapsed, confidence);
    setCompletedTasks(prev => new Set(prev).add(currentTask.id));
    setShowConfidence(false);
    setTotalStudyTime(0);
    setSessionCount(0);
    setPhase('study');
    setTimeRemaining(pomodoroSettings.studyDuration * 60);
  };

  const takeBreak = () => {
    setIsRunning(false);
    setPhase('custom-break');
    setTimeRemaining(breakDuration * 60);
    setTimeout(() => setIsRunning(true), 100);
  };

  const skipPhase = () => {
    setPhase('study');
    setTimeRemaining(pomodoroSettings.studyDuration * 60);
  };

  const progress = ((getPhaseDuration(phase) - timeRemaining) / getPhaseDuration(phase)) * 100;
  const timerSize = 200;
  const timerRadius = 86;
  const circumference = 2 * Math.PI * timerRadius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  if (!isOpen) return null;

  const allDone = incompleteTasks.length === 0;

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col touch-none" style={{ height: '100dvh' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2.5 h-2.5 rounded-full",
            phase === 'study' ? "bg-primary" : "bg-amber-500"
          )} />
          <span className="text-xs font-medium capitalize">
            {phase === 'custom-break' ? 'Break 🎮' : phase.replace('-', ' ')}
          </span>
          <span className="text-[10px] text-muted-foreground">#{sessionCount + 1}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {allDone ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
          <div className="w-20 h-20 rounded-full gradient-success flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-bold">All Tasks Done! 🎉</h2>
          <p className="text-sm text-muted-foreground">Great focus session!</p>
          <Button onClick={onClose} className="gradient-primary text-primary-foreground">
            Close
          </Button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Main content - centered, no scroll */}
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4">
            {/* Current task info */}
            {currentTask && !showConfidence && (
              <div className="text-center shrink-0 w-full max-w-sm">
                <p className="text-sm font-bold truncate px-2">{currentTask.title}</p>
                <div className="flex items-center justify-center gap-2 mt-0.5">
                  {(() => { const Icon = typeIcons[currentTask.type]; return <Icon className="w-3.5 h-3.5 text-muted-foreground" />; })()}
                  <span className="text-xs text-muted-foreground capitalize">{currentTask.type}</span>
                  <span className="text-muted-foreground">•</span>
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{currentTask.duration}m</span>
                </div>
              </div>
            )}

            {/* Confidence picker - replaces timer when shown */}
            {showConfidence ? (
              <div className="bg-card rounded-2xl p-5 border border-border shadow-card-hover w-full max-w-xs text-center space-y-4">
                <p className="font-semibold text-sm">How confident are you?</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setSelectedConfidence(star)} className="p-0.5">
                      <Star className={cn("w-7 h-7 transition-all", star <= selectedConfidence ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30")} />
                    </button>
                  ))}
                </div>
                <Button onClick={() => finishCurrentTask(selectedConfidence)} className="w-full gradient-success text-primary-foreground">
                  Confirm & Next
                </Button>
              </div>
            ) : (
              <>
                {/* Timer circle */}
                <div className="relative shrink-0">
                  <svg
                    className="transform -rotate-90"
                    width={timerSize}
                    height={timerSize}
                    viewBox={`0 0 ${timerSize} ${timerSize}`}
                  >
                    <circle
                      cx={timerSize / 2}
                      cy={timerSize / 2}
                      r={timerRadius}
                      stroke="hsl(var(--secondary))"
                      strokeWidth="7"
                      fill="none"
                    />
                    <motion.circle
                      cx={timerSize / 2}
                      cy={timerSize / 2}
                      r={timerRadius}
                      stroke={phase === 'study' ? "hsl(var(--primary))" : "hsl(38, 92%, 55%)"}
                      strokeWidth="7"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      animate={{ strokeDashoffset }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold tracking-tight">
                      {formatTime(timeRemaining)}
                    </span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">
                      {phase === 'study' ? 'Stay focused!' : phase === 'custom-break' ? 'Relax 🎮' : 'Take a break'}
                    </span>
                    {totalStudyTime > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        Total: {Math.floor(totalStudyTime / 60)}m
                      </span>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3 shrink-0">
                  <Button variant="outline" size="icon" className="w-10 h-10 rounded-full" onClick={() => {
                    // Skip task - move to next without completing
                    if (incompleteTasks.length > 1) {
                      setCurrentTaskIndex(prev => (prev + 1) % incompleteTasks.length);
                    }
                    setIsRunning(false);
                    setPhase('study');
                    setTimeRemaining(pomodoroSettings.studyDuration * 60);
                    setTotalStudyTime(0);
                    setSessionCount(0);
                  }}>
                    <SkipForward className="w-4 h-4" />
                  </Button>

                  <Button
                    onClick={() => setIsRunning(!isRunning)}
                    className={cn(
                      "w-14 h-14 rounded-full hover:opacity-90",
                      phase === 'study' ? "gradient-primary" : "gradient-warning"
                    )}
                  >
                    {isRunning ? <Pause className="w-6 h-6 text-primary-foreground" /> : <Play className="w-6 h-6 text-primary-foreground ml-0.5" />}
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="w-10 h-10 rounded-full"
                    onClick={handleDone}
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </Button>
                </div>

                {/* Extra actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="ghost" size="sm" onClick={takeBreak} className="text-amber-500 h-8 text-xs">
                    <Gamepad2 className="w-3.5 h-3.5 mr-1" />
                    Break
                  </Button>
                  {phase !== 'study' && (
                    <Button variant="ghost" size="sm" onClick={skipPhase} className="h-8 text-xs">
                      <SkipForward className="w-3.5 h-3.5 mr-1" />
                      Skip
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Bottom: upcoming tasks */}
          <div className="border-t border-border px-3 py-2 bg-card/50 shrink-0">
            <p className="text-[10px] text-muted-foreground mb-1">Up next ({Math.max(0, incompleteTasks.length - 1)} remaining)</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {incompleteTasks.slice(1, 6).map(task => {
                const Icon = typeIcons[task.type];
                return (
                  <div key={task.id} className="flex-shrink-0 bg-secondary/50 rounded-lg px-2 py-1.5 min-w-[100px]">
                    <p className="text-[10px] font-medium truncate">{task.title}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Icon className="w-2.5 h-2.5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">{task.duration}m</span>
                    </div>
                  </div>
                );
              })}
              {incompleteTasks.length <= 1 && (
                <p className="text-[10px] text-muted-foreground">No more tasks</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
